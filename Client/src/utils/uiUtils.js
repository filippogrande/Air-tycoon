// Utilità UI - Air Tycoon 2
// Funzioni: loading, toast, safeHTML

window.uiUtils = {
  showLoading(msg) {
    let loading = document.getElementById('loading-overlay');
    if (!loading) {
      loading = document.createElement('div');
      loading.id = 'loading-overlay';
      loading.className = 'loading-overlay';
      document.body.appendChild(loading);
    }
    loading.innerHTML = `<div class='loading-msg'>${msg || 'Caricamento...'}</div>`;
    loading.style.display = 'flex';
  },
  hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) loading.style.display = 'none';
  },
  showToast(msg, type) {
    let toast = document.getElementById('toast-msg');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-msg';
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'toast-msg ' + (type || 'info');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);
  },
  safeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  // Formattazione currency e numeri
  formatCurrency(amount, currency = '€') {
    if (amount === null || amount === undefined) return 'N/A';
    return currency + Number(amount).toLocaleString();
  },
  
  formatMoney(amount) {
    if (amount === null || amount === undefined) return '💰 0';
    return '💰 ' + Number(amount).toLocaleString();
  },
  
  formatNumber(amount, suffix = '') {
    if (amount === null || amount === undefined) return 'N/A';
    return Number(amount).toLocaleString() + (suffix ? ' ' + suffix : '');
  },
  
  // Gestione modal centralizzata
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      return modal;
    }
    console.warn(`Modal ${modalId} non trovato`);
    return null;
  },
  
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      return modal;
    }
    console.warn(`Modal ${modalId} non trovato`);
    return null;
  },
  
  // Gestione visibilità generica
  show(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove('hidden');
      return element;
    }
    console.warn(`Elemento ${elementId} non trovato`);
    return null;
  },
  
  hide(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('hidden');
      return element;
    }
    console.warn(`Elemento ${elementId} non trovato`);
    return null;
  }
};

// Backwards-compatible global aliases used by older scripts
window.showLoading = function(msg) { return window.uiUtils.showLoading(msg); };
window.hideLoading = function() { return window.uiUtils.hideLoading(); };
window.showToast = function(msg, type) { return window.uiUtils.showToast(msg, type); };
window.hideToast = function() {
  const toast = document.getElementById('toast-msg');
  if (toast) {
    toast.style.display = 'none';
  }
};
window.safeHTML = function(text) { return window.uiUtils.safeHTML(text); };
window.showModal = function(id) { return window.uiUtils.showModal(id); };
window.hideModal = function(id) { return window.uiUtils.hideModal(id); };
window.show = function(id) { return window.uiUtils.show(id); };
window.hide = function(id) { return window.uiUtils.hide(id); };
