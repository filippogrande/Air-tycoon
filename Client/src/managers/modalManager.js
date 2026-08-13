// Gestione modali - Air Tycoon 2
// Responsabilità: apertura, chiusura, event listener modali

window.modalManager = {
  openDeleteModal(saveId, companyName) {
    const modal = uiUtils.showModal('delete-save-modal');
    if (!modal) return;
    modal.setAttribute('data-save-id', saveId);
    const nameEl = document.getElementById('delete-save-name');
    if (nameEl) nameEl.textContent = companyName;
    // Setup event listener
    this.setupDeleteModalListeners();
  },

  setupDeleteModalListeners() {
    const modal = document.getElementById('delete-save-modal');
    if (!modal) return;
    const closeBtn = document.getElementById('close-delete-modal');
    const cancelBtn = document.getElementById('cancel-delete-save');
    const confirmBtn = document.getElementById('confirm-delete-save');
    // Remove previous listeners
    if (closeBtn) {
      closeBtn.replaceWith(closeBtn.cloneNode(true));
      modal.querySelector('#close-delete-modal').addEventListener('click', function() {
        uiUtils.hideModal('delete-save-modal');
        modal.removeAttribute('data-save-id');
      });
    }
    if (cancelBtn) {
      cancelBtn.replaceWith(cancelBtn.cloneNode(true));
      modal.querySelector('#cancel-delete-save').addEventListener('click', function() {
        uiUtils.hideModal('delete-save-modal');
        modal.removeAttribute('data-save-id');
      });
    }
    if (confirmBtn) {
      confirmBtn.replaceWith(confirmBtn.cloneNode(true));
      modal.querySelector('#confirm-delete-save').addEventListener('click', async function() {
        const saveId = modal.getAttribute('data-save-id');
        if (!saveId) return;
        window.uiUtils.showLoading('Eliminazione salvataggio...');
        try {
          const res = await fetch(`/api/game/saves/${saveId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Errore eliminazione salvataggio');
          window.uiUtils.showToast('Salvataggio eliminato', 'success');
          uiUtils.hideModal('delete-save-modal');
          modal.removeAttribute('data-save-id');
          window.savesManager.loadUserSaves();
        } catch (e) {
          window.uiUtils.showToast('Errore: ' + e.message, 'error');
        } finally {
          window.uiUtils.hideLoading();
        }
      });
    }
  }
};
