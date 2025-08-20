<<<<<<< Updated upstream
// ...contenuto originale di auth.js da spostare qui...
=======
import { AuthManager } from '/src/utils/AuthManager.js';

// Script per la pagina di autenticazione
console.log('🔐 Caricamento auth.js...');

let authManager;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Inizializzazione pagina autenticazione...');
    
    authManager = new AuthManager();
    
    // Controlla se utente già loggato
    if (authManager.loadCurrentUser()) {
        console.log('✅ Utente già loggato, reindirizzo...');
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
    showRegisterBtn.addEventListener('click', function(e) {
        e.preventDefault();
        switchToRegister();
    });
    
    showLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        switchToLogin();
    });
    
    // Guest mode
    guestBtn.addEventListener('click', function() {
        showLoading('Accesso come ospite...');
        
        setTimeout(function() {
            const result = authManager.loginAsGuest();
            hideLoading();
            
            if (result.success) {
                showMessage(result.message, 'success');
                setTimeout(function() {
                    redirectToGameSelect();
                }, 1000);
            } else {
                showMessage(result.message, 'error');
            }
        }, 1000);
    });
    
    // Form submission
    loginFormElement.addEventListener('submit', handleLogin);
    registerFormElement.addEventListener('submit', handleRegister);
    
    // Message close
    const messageClose = document.getElementById('message-close');
    messageClose.addEventListener('click', hideMessage);
    
    console.log('✅ Pagina autenticazione inizializzata');
}

function switchToRegister() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
}

function switchToLogin() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
}

function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email').trim();
    const password = formData.get('password');
    
    if (!email || !password) {
        showMessage('Inserisci email e password', 'error');
        return;
    }
    
    showLoading('Accesso in corso...');
    
    // Chiamata asincrona al login
    authManager.login(email, password)
        .then(result => {
            hideLoading();
            
            if (result.success) {
                showMessage(result.message, 'success');
                setTimeout(function() {
                    redirectToGameSelect();
                }, 1000);
            } else {
                showMessage(result.message, 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('❌ Errore login:', error);
            showMessage('Errore durante il login. Riprova più tardi.', 'error');
        });
}

function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email').trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Validazione
    if (!email || !password || !confirmPassword) {
        showMessage('Tutti i campi sono obbligatori', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Le password non coincidono', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('La password deve essere di almeno 6 caratteri', 'error');
        return;
    }
    
    showLoading('Registrazione in corso...');
    
    // Chiamata asincrona alla registrazione (solo email e password)
    authManager.register(email, password)
        .then(result => {
            hideLoading();
            
            if (result.success) {
                showMessage('Account creato con successo! Ora puoi accedere.', 'success');
                setTimeout(function() {
                    switchToLogin();
                    // Pre-compila email nel form di login
                    document.getElementById('login-email').value = email;
                }, 2000);
            } else {
                showMessage(result.message, 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('❌ Errore registrazione:', error);
            showMessage('Errore durante la registrazione. Riprova più tardi.', 'error');
        });
}

function showLoading(message) {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = loadingOverlay.querySelector('p');
    
    if (loadingText) {
        loadingText.textContent = message;
    }
    
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.add('hidden');
}

function showMessage(message, type) {
    const messageOverlay = document.getElementById('message-overlay');
    const messageText = document.getElementById('message-text');
    const messageContent = messageOverlay.querySelector('.message-content');
    
    messageText.textContent = message;
    
    // Reset classi
    messageContent.classList.remove('error', 'warning', 'success');
    
    // Aggiungi classe tipo
    if (type === 'error') {
        messageContent.classList.add('error');
    } else if (type === 'warning') {
        messageContent.classList.add('warning');
    }
    // success è lo stile default
    
    messageOverlay.classList.remove('hidden');
    
    // Auto-hide dopo 5 secondi
    setTimeout(hideMessage, 5000);
}

function hideMessage() {
    const messageOverlay = document.getElementById('message-overlay');
    messageOverlay.classList.add('hidden');
}

function redirectToGameSelect() {
    console.log('🎮 Reindirizzamento alla selezione gioco...');
    window.location.href = 'pages/game/select.html';
}

console.log('✅ auth.js caricato');
>>>>>>> Stashed changes
