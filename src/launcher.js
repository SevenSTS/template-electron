// src/launcher.js
const { Client, Authenticator } = require('minecraft-launcher-core');
const fs      = require('fs');
const path    = require('path');
const os      = require('os');

// Chemin vers %APPDATA%/.sevenlauncher
const appData = process.env.APPDATA ||
  (os.platform() === 'darwin'
     ? path.join(os.homedir(), 'Library', 'Application Support')
     : path.join(os.homedir(), '.local', 'share'));
const rootDir = path.join(appData, '.sevenlauncher');

/**
 * Lance Minecraft avec dossier créé si besoin,
 * logs détaillés et progression en pourcentage 0–100.
 */
function launchMinecraft(username, version, logCb, doneCb, progressCb) {
  logCb(`Lancement demandé : ${username} / ${version}`);

  // Création du dossier si nécessaire
  if (!fs.existsSync(rootDir)) {
    logCb(`Création du dossier de jeu : ${rootDir}`);
    progressCb(0);
    fs.mkdirSync(rootDir, { recursive: true });
    logCb('Dossier créé, début du téléchargement…');
  }

  const client = new Client();

  client.on('debug', msg => {
    logCb(msg);
  });

  client.on('progress', stats => {
    let pct = 0;
    if (typeof stats.percent === 'number') {
      pct = Math.floor(stats.percent * 100);
    } else if (stats.total > 0) {
      pct = Math.floor((stats.current / stats.total) * 100);
    }
    progressCb(pct);
  });

  client.launch({
    authorization: Authenticator.getAuth(username),
    root: rootDir,
    version: { number: version, type: 'release' },
    memory: { max: '2G', min: '1G' }
  })
    .then(proc => {
      logCb('Minecraft a démarré !');
      proc.stdout.on('data', data => logCb(data.toString()));
      proc.stderr.on('data', data => logCb(data.toString()));
      proc.on('close', () => {
        logCb('Processus terminé.');
        doneCb && doneCb();
      });
    })
    .catch(err => {
      logCb(`Erreur : ${err}`);
      doneCb && doneCb();
    });
}

module.exports = { launchMinecraft };
