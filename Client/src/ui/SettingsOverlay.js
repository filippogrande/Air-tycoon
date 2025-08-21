function setupSettingsOverlay() {
  const btn = document.getElementById('settings-button');
  const overlay = document.getElementById('settings-overlay');
  if (!btn || !overlay) return;

  // helper to lazy-load template into overlay if empty
  function ensureTemplateLoaded() {
    if (overlay.innerHTML && overlay.innerHTML.trim().length > 0) return Promise.resolve();
    // Try known paths (server may serve from /game/modals or /modals)
    const paths = ['/game/modals/settings-overlay.html', '/modals/settings-overlay.html', 'pages/modals/settings-overlay.html'];
    let chain = Promise.reject();
    paths.forEach(p => {
      chain = chain.catch(() => {
        console.debug('[SettingsOverlay] attempting to fetch template from', p);
        return fetch(p).then(r => {
          console.debug('[SettingsOverlay] fetch', p, 'status', r && r.status);
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.text();
        }).then(html => { overlay.innerHTML = html; });
      });
    });
    return chain.catch(err => { console.warn('[SettingsOverlay] failed to load any template path:', err && err.message); });
  }

  btn.addEventListener('click', () => {
    ensureTemplateLoaded().then(() => {
  // bind buttons inside overlay (if any) after template injection
  try { bindSettingsButtons(overlay, null); } catch (e) { /* noop */ }
  overlay.classList.toggle('active');
    }).catch(() => {
  try { bindSettingsButtons(overlay, null); } catch (e) { /* noop */ }
  overlay.classList.toggle('active');
    });
  });

  // Close on click outside (attach once)
  if (!overlay._closeHandlerAttached) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
    overlay._closeHandlerAttached = true;
  }
}

// bind handlers for buttons inside the settings overlay
function bindSettingsButtons(overlay, game) {
  if (!overlay) return;
  if (overlay._settingsButtonsBound) return;

  try {
    // Torna al menu
    const backToMenu = overlay.querySelector('#back-to-menu');
    if (backToMenu) {
      backToMenu.addEventListener('click', function() {
        if (confirm('Vuoi tornare al menu principale? Assicurati di aver salvato la partita.')) {
          try {
            localStorage.removeItem('companyId');
            localStorage.removeItem('gameState');
            localStorage.removeItem('currentSave');
            sessionStorage.removeItem('companyId');
            sessionStorage.removeItem('gameState');
            sessionStorage.removeItem('currentSave');
          } catch (e) { /* ignore */ }
          window.location.href = '/game/game/select.html';
        }
      });
    }

    // Logout
    const logoutBtn = overlay.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        if (confirm('Vuoi davvero eseguire il logout?')) {
          try { localStorage.clear(); sessionStorage.clear(); } catch (e) { /* ignore */ }
          try { const auth = new AuthManager(); auth.logout(); } catch (e) { /* ignore */ }
          window.location.href = 'pages/auth/login.html';
        }
      });
    }

    // DB viewer
    const dbViewer = overlay.querySelector('#db-viewer-btn');
    if (dbViewer) {
      dbViewer.addEventListener('click', function() {
        window.open('db-viewer.html', '_blank');
      });
    }

    // Torna alla partita
    const backToGame = overlay.querySelector('#back-to-game');
    if (backToGame) {
      backToGame.addEventListener('click', function() {
        overlay.classList.remove('active');
      });
    }
  } catch (err) {
    console.warn('[SettingsOverlay] error binding buttons:', err && err.message);
  }

  overlay._settingsButtonsBound = true;
}

// Export globale per compatibilità
if (typeof window !== 'undefined') {
  window.setupSettingsOverlay = setupSettingsOverlay;
  window.bindSettingsButtons = bindSettingsButtons;
}
