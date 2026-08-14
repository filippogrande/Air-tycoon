// Script per la pagina di autenticazione - Sistema Unificato

let authManager;

// Ensure uiUtils is available in module scope (some pages load uiUtils after modules)
const uiUtils = window.uiUtils || {
    showLoading: () => {},
    hideLoading: () => {},
    showToast: () => {},
    hideModal: () => {}
};

document.addEventListener('DOMContentLoaded', function() {

    authManager = new AuthManager();

    // Controlla se utente già loggato
    if (authManager.loadCurrentUser()) {
        redirectToGameSelect();
        return;
    }

    initializeAuthPage();
});

function initializeAuthPage() {
    // Elementi DOM
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const guestBtn = document.getElementById('guest-btn');
    const loginFormElement = document.getElementById('loginForm');
    const registerFormElement = document.getElementById('registerForm');

    // Switch tra login e registrazione
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            switchToRegister();
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            switchToLogin();
        });
    }

    // Guest mode
    if (guestBtn) {
        guestBtn.addEventListener('click', function() {
            uiUtils.showLoading('Accesso come ospite...');

            setTimeout(function() {
                const result = authManager.loginAsGuest();
                uiUtils.hideLoading();

                if (result.success) {
                    uiUtils.showToast(result.message, 'success');
                    setTimeout(function() {
                        redirectToGameSelect();
                    }, 1000);
                } else {
                    uiUtils.showToast(result.message, 'error');
                }
            }, 1000);
        });
    }

    // Form submission
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', handleLogin);
    }
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', handleRegister);
    }

    // Message close
    const messageClose = document.getElementById('message-close');
    if (messageClose) messageClose.addEventListener('click', hideMessage);

}

function switchToRegister() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) loginForm.classList.remove('active');
    if (registerForm) registerForm.classList.add('active');
}

function switchToLogin() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (registerForm) registerForm.classList.remove('active');
    if (loginForm) loginForm.classList.add('active');
}

function handleLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = (formData.get('email') || '').trim();
    const password = formData.get('password');

    if (!email || !password) {
        uiUtils.showToast('Inserisci email e password', 'error');
        return;
    }

    uiUtils.showLoading('Accesso in corso...');

    // Chiamata asincrona al login
    authManager.login(email, password)
        .then(result => {
            uiUtils.hideLoading();

            if (result.success) {
                uiUtils.showToast(result.message, 'success');
                // authManager.login already sets currentUser and saves it
                redirectToGameSelect();
            } else {
                uiUtils.showToast(result.message, 'error');
            }
        })
        .catch(error => {
            uiUtils.hideLoading();
            console.error('❌ Errore login:', error);
            uiUtils.showToast('Errore durante il login. Riprova più tardi.', 'error');
        });
}

function handleRegister(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = (formData.get('email') || '').trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    // Validazione
    if (!email || !password || !confirmPassword) {
        uiUtils.showToast('Tutti i campi sono obbligatori', 'error');
        return;
    }

    if (password !== confirmPassword) {
        uiUtils.showToast('Le password non coincidono', 'error');
        return;
    }

    if (password.length < 6) {
        uiUtils.showToast('La password deve essere di almeno 6 caratteri', 'error');
        return;
    }

    uiUtils.showLoading('Registrazione in corso...');

    // Chiamata asincrona alla registrazione (solo email e password)
    authManager.register(email, password)
        .then(result => {
            // registration completed on server, now attempt to log the user in automatically
            uiUtils.hideLoading();

            if (result.success) {
                uiUtils.showToast('Account creato con successo! Effettuo il login...', 'success');

                // Try automatic login
                uiUtils.showLoading('Accesso automatico...');
                return authManager.login(email, password)
                    .then(loginResult => {
                        uiUtils.hideLoading();
                        if (loginResult.success) {
                            uiUtils.showToast('Accesso effettuato, reindirizzamento...', 'success');
                            redirectToGameSelect();
                        } else {
                            // Fallback: mostra form di login con email prefissata
                            switchToLogin();
                            const loginEmail = document.getElementById('login-email');
                            if (loginEmail) loginEmail.value = email;
                            uiUtils.showToast('Registrazione OK. Accedi ora.', 'info');
                        }
                    })
                    .catch(err => {
                        uiUtils.hideLoading();
                        // Fallback to login form on error
                        switchToLogin();
                        const loginEmail = document.getElementById('login-email');
                        if (loginEmail) loginEmail.value = email;
                        uiUtils.showToast('Registrazione completata. Effettua il login.', 'info');
                    });
            } else {
                uiUtils.showToast(result.message, 'error');
            }
        })
        .catch(error => {
            uiUtils.hideLoading();
            console.error('❌ Errore registrazione:', error);
            uiUtils.showToast('Errore durante la registrazione. Riprova più tardi.', 'error');
        });
}

function showLoading(message) {
    uiUtils.showLoading(message);
}

function hideLoading() {
    uiUtils.hideLoading();
}

function showMessage(message, type) {
    uiUtils.showToast(message, type);
}

function hideMessage() {
    // If there is a close button, clicking it hides; otherwise use uiUtils
    uiUtils.hideModal && uiUtils.hideModal('message-overlay');
}

function redirectToGameSelect() {
    window.location.href = '/game/game/select.html';
}

