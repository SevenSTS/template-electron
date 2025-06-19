// src/renderer.js
const { ipcRenderer } = require('electron');
const { launchMinecraft } = require('./launcher');

// Sélecteurs UI
const playBtn      = document.querySelector('.main-btn');
const progressWrap = document.getElementById('progress-container');
const progressBar  = document.getElementById('progress-bar');
const logEl        = document.getElementById('log');

// Contrôles fenêtre
document.querySelector('.mac-close')
  .addEventListener('click', () => ipcRenderer.send('window-control','close'));
document.querySelector('.mac-minimize')
  .addEventListener('click', () => ipcRenderer.send('window-control','minimize'));
document.querySelector('.mac-maximize')
  .addEventListener('click', () => ipcRenderer.send('window-control','maximize'));

// Modal Paramètres (inchangé)
const settingsBtn = document.querySelector('.settings-btn');
const modalOvl    = document.getElementById('settings-modal');
const cancelBtn   = document.getElementById('cancel-settings');
const form        = document.getElementById('settings-form');
const ramSlider   = document.getElementById('ram-slider');
const ramValue    = document.getElementById('ram-value');
const browseJava  = document.getElementById('browse-java');
const browseMc    = document.getElementById('browse-mc');
const javaInput   = document.getElementById('java-path');
const mcInput     = document.getElementById('mc-path');

settingsBtn.addEventListener('click', () => modalOvl.style.display = 'flex');
cancelBtn.addEventListener('click', () => modalOvl.style.display = 'none');
ramSlider.addEventListener('input', () => ramValue.textContent = ramSlider.value);
browseJava.addEventListener('click', async () => {
  const p = await ipcRenderer.invoke('select-path',{type:'java'});
  if (p) javaInput.value = p;
});
browseMc.addEventListener('click', async () => {
  const p = await ipcRenderer.invoke('select-path',{type:'minecraft'});
  if (p) mcInput.value = p;
});
form.addEventListener('submit', e => {
  e.preventDefault();
  modalOvl.style.display = 'none';
  // TODO : persister tes paramètres
});

// Simulation + vraie progression
playBtn.addEventListener('click', () => {
  const username = 'Player';  // remplacer par ton champ Pseudo
  const version  = '1.20.1';  // remplacer par ta liste de versions

  // Reset UI
  logEl.textContent = '';
  progressBar.style.width = '0%';
  progressBar.classList.add('indeterminate');
  progressWrap.style.display = 'block';

  // Simulation visuelle initiale (0→10% en 500ms)
  let simulated = 0;
  const simInterval = setInterval(() => {
    simulated = Math.min(10, simulated + 1);
    progressBar.style.width = `${simulated}%`;
    if (simulated >= 10) clearInterval(simInterval);
  }, 50);

  launchMinecraft(
    username,
    version,
    msg => {
      logEl.textContent += msg + '\n';
      logEl.scrollTop = logEl.scrollHeight;
    },
    () => {
      clearInterval(simInterval);
      setTimeout(() => progressWrap.style.display = 'none', 800);
    },
    pct => {
      clearInterval(simInterval);
      if (progressBar.classList.contains('indeterminate')) {
        progressBar.classList.remove('indeterminate');
      }
      progressBar.style.width = `${pct}%`;
    }
  );
});
