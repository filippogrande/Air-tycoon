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
  }
};
