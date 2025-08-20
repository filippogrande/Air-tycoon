// AuthManager (client module) - Gestione autenticazione con SERVER-FIRST
console.debug('📂 Caricamento AuthManager (module)...');

export class AuthManager {
	constructor() {
		this.currentUser = null;
		this.users = this.loadUsers(); // Carica cache utenti (per compatibilità)
	}

	// NON carica utenti dal localStorage per auth - solo cache
	loadUsers() {
		try {
			const usersData = localStorage.getItem('airTycoon_users_cache');
			return usersData ? JSON.parse(usersData) : {};
		} catch (error) {
			console.error('Errore caricamento cache utenti:', error);
			return {};
		}
	}

	// Salva utenti nel localStorage SOLO come cache
	saveUsers() {
		try {
			localStorage.setItem('airTycoon_users_cache', JSON.stringify(this.users));
			return true;
		} catch (error) {
			console.error('Errore salvataggio cache utenti:', error);
			return false;
		}
	}

	// Registra nuovo utente (SOLO SERVER - mai localStorage per auth)
	register(email, password) {
		// Validazione input
		if (!email || !password) {
			return Promise.reject(new Error('Email e password sono obbligatori'));
		}

		if (password.length < 6) {
			return Promise.reject(new Error('La password deve essere di almeno 6 caratteri'));
		}

		if (!this.isValidEmail(email)) {
			return Promise.reject(new Error('Email non valida'));
		}

		// SEMPRE al server - mai localStorage
		return this._registerOnServer(email, password)
			.then(serverResult => {
				if (serverResult.success) {
					console.debug('✅ Utente registrato su server:', email);

					// Aggiorna SOLO la cache localStorage (NON per auth)
					this._updateUserCache(email, serverResult.data);

					return {
						success: true,
						message: 'Registrazione completata con successo!',
						data: serverResult.data
					};
				} else {
					throw new Error(serverResult.error || 'Errore di registrazione');
				}
			});
	}

	// Registrazione su server (asincrona)
	_registerOnServer(email, password) {
		return fetch('/api/auth/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: email,
				password: password
			})
		})
		.then(response => {
			if (!response.ok) {
				return response.json().then(errorData => {
					throw new Error(errorData.error || 'Errore del server');
				});
			}
			return response.json();
		});
	}

	// Login utente (SOLO SERVER - mai localStorage per auth)
	login(email, password) {
		if (!email || !password) {
			return Promise.reject(new Error('Email e password sono obbligatori'));
		}

		// SEMPRE al server - mai localStorage per auth
		return this._loginOnServer(email, password)
			.then(serverResult => {
				if (serverResult.success) {
					const userData = serverResult.data;

					// Imposta utente corrente (senza dati compagnia)
					this.currentUser = {
						id: userData.userId,
						email: userData.email,
						createdAt: userData.createdAt,
						lastLogin: userData.lastLogin
					};

					// Salva utente corrente in localStorage
					this.saveCurrentUser();

					// Aggiorna cache utenti
					this._updateUserCache(email, userData);

					console.debug('✅ Login server effettuato:', email);
					return {
						success: true,
						message: 'Login effettuato con successo!',
						data: userData
					};
				} else {
					throw new Error(serverResult.error || 'Errore di login');
				}
			});
	}

	// Login su server (asincrono)
	_loginOnServer(email, password) {
		return fetch('/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: email,
				password: password
			})
		})
		.then(response => {
			if (!response.ok) {
				return response.json().then(errorData => {
					throw new Error(errorData.error || 'Errore del server');
				});
			}
			return response.json();
		});
	}

	// Aggiorna cache utente (solo cache, non per auth)
	_updateUserCache(email, userData) {
		this.users[email] = {
			id: userData.userId,
			email: email,
			companyId: userData.companyId,
			companyName: userData.companyName,
			money: userData.money,
			reputation: userData.reputation,
			lastLogin: userData.lastLogin,
			cachedAt: new Date().toISOString()
		};
		this.saveUsers();
	}

	// Logout COMPLETO - cancella tutto localStorage
	logout() {
		this.currentUser = null;

		// CANCELLA TUTTO il localStorage relativo al gioco
		localStorage.removeItem('airTycoon_currentUser');
		localStorage.removeItem('airTycoon_users_cache');
		localStorage.removeItem('air-tycoon-2-save');
		localStorage.removeItem('air-tycoon-cache');
		localStorage.removeItem('air-tycoon-company-id');

		// Pulisci anche la cache interna
		this.users = {};

	console.debug('👋 Logout completo - localStorage pulito');
	}

	// Controlla se utente è loggato
	isLoggedIn() {
		return this.currentUser !== null;
	}

	// Ottieni utente corrente
	getCurrentUser() {
		return this.currentUser;
	}

	// Carica sessione utente salvata
	loadCurrentUser() {
		try {
			const userData = localStorage.getItem('airTycoon_currentUser');
			if (userData) {
				// Nuovo formato: oggetto utente completo
				if (userData.startsWith('{')) {
					this.currentUser = JSON.parse(userData);
					return this.currentUser !== null;
				}
				// Formato legacy: solo email
				else {
					const userEmail = JSON.parse(userData);
					// Carica dalla cache utenti se disponibile
					if (this.users[userEmail]) {
						this.currentUser = this.users[userEmail];
						return true;
					} else {
						// Se non c'è nella cache, l'utente dovrà rifare il login
						console.warn('⚠️ Sessione utente scaduta, richiesto nuovo login');
						return false;
					}
				}
			}
		} catch (error) {
			console.error('Errore caricamento sessione:', error);
		}
		return false;
	}

	// Salva sessione utente corrente (formato completo)
	saveCurrentUser() {
		if (this.currentUser) {
			localStorage.setItem('airTycoon_currentUser', JSON.stringify(this.currentUser));
		}
	}

	// Ottieni salvataggi dell'utente corrente
	getUserSaves() {
		if (!this.currentUser) return {};
		return this.currentUser.saves || {};
	}

	// Salva gioco per utente corrente
	saveGame(saveName, gameData) {
		if (!this.currentUser) return false;

		if (!this.currentUser.saves) {
			this.currentUser.saves = {};
		}

		this.currentUser.saves[saveName] = {
			data: gameData,
			savedAt: new Date().toISOString(),
			companyName: gameData.company ? gameData.company.name : 'Senza Nome'
		};

		// Aggiorna nel storage generale
		this.users[this.currentUser.email] = this.currentUser;
		return this.saveUsers();
	}

	// Carica gioco per utente corrente
	loadGame(saveName) {
		if (!this.currentUser || !this.currentUser.saves) return null;

		const save = this.currentUser.saves[saveName];
		return save ? save.data : null;
	}

	// Elimina salvataggio
	deleteSave(saveName) {
		if (!this.currentUser || !this.currentUser.saves) return false;

		if (this.currentUser.saves[saveName]) {
			delete this.currentUser.saves[saveName];
			this.users[this.currentUser.email] = this.currentUser;
			return this.saveUsers();
		}
		return false;
	}

	// Utility functions
	isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	generateUserId() {
		return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
	}

	// Hash password semplice (in produzione usare bcrypt o simili)
	hashPassword(password) {
		// Hash molto semplice per demo - in produzione usare qualcosa di più sicuro
		let hash = 0;
		for (let i = 0; i < password.length; i++) {
			const char = password.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash.toString();
	}

	verifyPassword(password, hash) {
		return this.hashPassword(password) === hash;
	}
}

// Esporta anche sul window per compatibilità con script non-module legacy
if (typeof window !== 'undefined') {
	window.AuthManager = AuthManager;
}

console.debug('✅ AuthManager (module) caricato');
