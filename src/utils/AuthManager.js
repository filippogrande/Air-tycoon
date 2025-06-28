// AuthManager - Gestione autenticazione con SERVER-FIRST
console.log('📂 Caricamento AuthManager.js...');

function AuthManager() {
    this.currentUser = null;
    this.users = {}; // Cache utenti (non usato per auth, solo cache)
}

// NON carica utenti dal localStorage per auth - solo cache
AuthManager.prototype.loadUsers = function() {
    try {
        var usersData = localStorage.getItem('airTycoon_users_cache');
        return usersData ? JSON.parse(usersData) : {};
    } catch (error) {
        console.error('Errore caricamento cache utenti:', error);
        return {};
    }
};

// Salva utenti nel localStorage SOLO come cache
AuthManager.prototype.saveUsers = function() {
    try {
        localStorage.setItem('airTycoon_users_cache', JSON.stringify(this.users));
        return true;
    } catch (error) {
        console.error('Errore salvataggio cache utenti:', error);
        return false;
    }
};

// Registra nuovo utente (SOLO SERVER - mai localStorage per auth)
AuthManager.prototype.register = function(email, password, companyName) {
    // Validazione input
    if (!email || !password || !companyName) {
        return Promise.reject(new Error('Email, password e nome compagnia sono obbligatori'));
    }
    
    if (password.length < 6) {
        return Promise.reject(new Error('La password deve essere di almeno 6 caratteri'));
    }
    
    if (!this.isValidEmail(email)) {
        return Promise.reject(new Error('Email non valida'));
    }
    
    // SEMPRE al server - mai localStorage
    return this._registerOnServer(email, password, companyName)
        .then(serverResult => {
            if (serverResult.success) {
                console.log('✅ Utente registrato su server:', email);
                
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
};

// Registrazione su server (asincrona)
AuthManager.prototype._registerOnServer = function(email, password, companyName) {
    return fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password,
            companyName: companyName
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
};

// Login utente (SOLO SERVER - mai localStorage per auth) 
AuthManager.prototype.login = function(email, password) {
    if (!email || !password) {
        return Promise.reject(new Error('Email e password sono obbligatori'));
    }
    
    // SEMPRE al server - mai localStorage per auth
    return this._loginOnServer(email, password)
        .then(serverResult => {
            if (serverResult.success) {
                var userData = serverResult.data;
                
                // Imposta utente corrente
                this.currentUser = {
                    id: userData.userId,
                    email: userData.email,
                    companyId: userData.companyId,
                    companyName: userData.companyName,
                    money: userData.money,
                    reputation: userData.reputation,
                    lastLogin: userData.lastLogin
                };
                
                // Salva utente corrente in localStorage
                this.saveCurrentUser();
                
                // Aggiorna cache utenti 
                this._updateUserCache(email, userData);
                
                console.log('✅ Login server effettuato:', email);
                return { 
                    success: true, 
                    message: 'Login effettuato con successo!',
                    data: userData
                };
            } else {
                throw new Error(serverResult.error || 'Errore di login');
            }
        });
};

// Login su server (asincrono)
AuthManager.prototype._loginOnServer = function(email, password) {
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
};

// Aggiorna cache utente (solo cache, non per auth)
AuthManager.prototype._updateUserCache = function(email, userData) {
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
};

// Logout COMPLETO - cancella tutto localStorage
AuthManager.prototype.logout = function() {
    this.currentUser = null;
    
    // CANCELLA TUTTO il localStorage relativo al gioco
    localStorage.removeItem('airTycoon_currentUser');
    localStorage.removeItem('airTycoon_users_cache');
    localStorage.removeItem('air-tycoon-2-save');
    localStorage.removeItem('air-tycoon-cache');
    localStorage.removeItem('air-tycoon-company-id');
    
    // Pulisci anche la cache interna
    this.users = {};
    
    console.log('👋 Logout completo - localStorage pulito');
};

// Controlla se utente è loggato
AuthManager.prototype.isLoggedIn = function() {
    return this.currentUser !== null;
};

// Ottieni utente corrente
AuthManager.prototype.getCurrentUser = function() {
    return this.currentUser;
};

// Carica sessione utente salvata
AuthManager.prototype.loadCurrentUser = function() {
    try {
        var userData = localStorage.getItem('airTycoon_currentUser');
        if (userData) {
            var userEmail = JSON.parse(userData);
            this.currentUser = this.users[userEmail];
            return this.currentUser !== null;
        }
    } catch (error) {
        console.error('Errore caricamento sessione:', error);
    }
    return false;
};

// Salva sessione utente corrente
AuthManager.prototype.saveCurrentUser = function() {
    if (this.currentUser) {
        localStorage.setItem('airTycoon_currentUser', JSON.stringify(this.currentUser.email));
    }
};

// Ottieni salvataggi dell'utente corrente
AuthManager.prototype.getUserSaves = function() {
    if (!this.currentUser) return {};
    return this.currentUser.saves || {};
};

// Salva gioco per utente corrente
AuthManager.prototype.saveGame = function(saveName, gameData) {
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
};

// Carica gioco per utente corrente
AuthManager.prototype.loadGame = function(saveName) {
    if (!this.currentUser || !this.currentUser.saves) return null;
    
    var save = this.currentUser.saves[saveName];
    return save ? save.data : null;
};

// Elimina salvataggio
AuthManager.prototype.deleteSave = function(saveName) {
    if (!this.currentUser || !this.currentUser.saves) return false;
    
    if (this.currentUser.saves[saveName]) {
        delete this.currentUser.saves[saveName];
        this.users[this.currentUser.email] = this.currentUser;
        return this.saveUsers();
    }
    return false;
};

// Utility functions
AuthManager.prototype.isValidEmail = function(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

AuthManager.prototype.generateUserId = function() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Hash password semplice (in produzione usare bcrypt o simili)
AuthManager.prototype.hashPassword = function(password) {
    // Hash molto semplice per demo - in produzione usare qualcosa di più sicuro
    var hash = 0;
    for (var i = 0; i < password.length; i++) {
        var char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
};

AuthManager.prototype.verifyPassword = function(password, hash) {
    return this.hashPassword(password) === hash;
};

// Guest mode
AuthManager.prototype.loginAsGuest = function() {
    this.currentUser = {
        id: 'guest_' + Date.now(),
        email: 'guest@localhost',
        isGuest: true,
        saves: {}
    };
    
    console.log('🎮 Login come ospite');
    return { success: true, message: 'Accesso come ospite' };
};

// Esporta
window.AuthManager = AuthManager;
console.log('✅ AuthManager caricato');
