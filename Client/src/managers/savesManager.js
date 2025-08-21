// Gestione salvataggi utente - Air Tycoon 2
// Responsabilità: caricamento, rendering, eliminazione salvataggi

window.savesManager = {
  async loadUserSaves() {
    try {
      const res = await fetch('/api/game/saves');
      if (!res.ok) throw new Error('Errore caricamento salvataggi');
      const saves = await res.json();
      this.renderSaves(saves);
    } catch (e) {
      window.uiUtils.showToast('Errore: ' + e.message, 'error');
    }
  },

  renderSaves(saves) {
    const container = document.getElementById('saves-container');
    if (!container) return;
    container.innerHTML = '';
    if (!saves || saves.length === 0) {
      container.innerHTML = '<div class="empty-saves">Nessun salvataggio trovato.<br><button id="start-first-game" class="action-btn primary">Inizia Prima Partita</button></div>';
      return;
    }
    saves.forEach(save => {
      const card = this.createSaveCard(save);
      container.appendChild(card);
    });
  },

  createSaveCard(save) {
    const card = document.createElement('div');
    card.className = 'save-card';
    card.innerHTML = `
      <div class="save-header">
        <span class="company-name">${window.uiUtils.safeHTML(save.companyName)}</span>
        <button class="delete-save-btn" data-save-id="${save.id}">🗑️</button>
      </div>
      <div class="save-details">
        <span>Fondazione: ${window.uiUtils.safeHTML(save.founded)}</span>
        <span>Budget: ${window.uiUtils.safeHTML(save.budget)}</span>
        <span>Reputazione: ${window.uiUtils.safeHTML(save.reputation)}</span>
        <span>Aeromobili: ${window.uiUtils.safeHTML(save.fleetCount)}</span>
        <span>Rotte: ${window.uiUtils.safeHTML(save.routeCount)}</span>
        <span>Hub: ${window.uiUtils.safeHTML(save.hub)}</span>
      </div>
      <div class="save-actions">
        <button class="continue-save-btn" data-save-id="${save.id}">Continua</button>
      </div>
    `;
    // Eventi
    card.querySelector('.delete-save-btn').addEventListener('click', function() {
      window.modalManager.openDeleteModal(save.id, save.companyName);
    });
    card.querySelector('.continue-save-btn').addEventListener('click', function() {
      window.savesManager.continueGame(save.id);
    });
    return card;
  },

  continueGame(saveId) {
    // Logica di continuazione partita
    window.uiUtils.showLoading('Caricamento partita...');
    // ...redirect o caricamento...
    window.location.href = `/game/pages/hub.html?saveId=${saveId}`;
  }
};
