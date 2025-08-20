import { AuthManager } from './utils/AuthManager.js';

// Script per la pagina di autenticazione
console.debug('🔐 Caricamento auth.js...');

let authManager;

document.addEventListener('DOMContentLoaded', function() {
	console.debug('🔐 Inizializzazione pagina autenticazione...');
    
	authManager = new AuthManager();
    
	// Controlla se utente già loggato
	if (authManager.loadCurrentUser()) {
		console.debug('✅ Utente già loggato, reindirizzo...');
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
	if (guestBtn) {
		guestBtn.addEventListener('click', function() {
			showLoading('Accesso come ospite...');
            
			setTimeout(function() {
				const result = authManager.loginAsGuest ? authManager.loginAsGuest() : { success: false, message: 'Guest non supportato' };
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
	}
    
	// Form submission
	if (loginFormElement) loginFormElement.addEventListener('submit', handleLogin);
	if (registerFormElement) registerFormElement.addEventListener('submit', handleRegister);
    
	// Message close
	const messageClose = document.getElementById('message-close');
	if (messageClose) messageClose.addEventListener('click', hideMessage);
    
	console.debug('✅ Pagina autenticazione inizializzata');
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
					const loginEmail = document.getElementById('login-email');
					if (loginEmail) loginEmail.value = email;
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
	const loadingText = loadingOverlay ? loadingOverlay.querySelector('p') : null;
    
	if (loadingText) {
		loadingText.textContent = message;
	}
    
	if (loadingOverlay) loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
	const loadingOverlay = document.getElementById('loading-overlay');
	if (loadingOverlay) loadingOverlay.classList.add('hidden');
}

function showMessage(message, type) {
	const messageOverlay = document.getElementById('message-overlay');
	const messageText = document.getElementById('message-text');
	const messageContent = messageOverlay ? messageOverlay.querySelector('.message-content') : null;
    
	if (messageText) messageText.textContent = message;
    
	// Reset classi
	if (messageContent) messageContent.classList.remove('error', 'warning', 'success');
    
	// Aggiungi classe tipo
	if (messageContent) {
		if (type === 'error') messageContent.classList.add('error');
		else if (type === 'warning') messageContent.classList.add('warning');
	}
    
	if (messageOverlay) messageOverlay.classList.remove('hidden');
    
	// Auto-hide dopo 5 secondi
	setTimeout(hideMessage, 5000);
}

function hideMessage() {
	const messageOverlay = document.getElementById('message-overlay');
	if (messageOverlay) messageOverlay.classList.add('hidden');
}

function redirectToGameSelect() {
	console.debug('🎮 Reindirizzamento alla selezione gioco...');
	window.location.href = 'pages/game/select.html';
}

console.debug('✅ auth.js caricato');
