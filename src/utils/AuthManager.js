// AuthManager - Gestione autenticazione utenti
console.log('📂 Caricamento AuthManager.js...');

function AuthManager() {
    this.currentUser = null;
    this.users = this.loadUsers();
}

// Carica utenti dal localStorage
AuthManager.prototype.loadUsers = function() {
    try {
        var usersData = localStorage.getItem('airTycoon_users');
        return usersData ? JSON.parse(usersData) : {};
    } catch (error) {
        console.error('Errore caricamento utenti:', error);
        return {};
    }
};

// Salva utenti nel localStorage
AuthManager.prototype.saveUsers = function() {
    try {
        localStorage.setItem('airTycoon_users', JSON.stringify(this.users));
        return true;
    } catch (error) {
        console.error('Errore salvataggio utenti:', error);
        return false;
    }
};

// Registra nuovo utente
AuthManager.prototype.register = function(email, password) {
    // Validazione input
    if (!email || !password) {
        return { success: false, message: 'Email e password sono obbligatori' };
    }
    
    if (password.length < 6) {
        return { success: false, message: 'La password deve essere di almeno 6 caratteri' };
    }
    
    if (!this.isValidEmail(email)) {
        return { success: false, message: 'Email non valida' };
    }
    
    // Controlla se utente esiste già
    if (this.users[email]) {
        return { success: false, message: 'Un utente con questa email esiste già' };
    }
    
    // Crea nuovo utente
    var userId = this.generateUserId();
    var newUser = {
        id: userId,
        email: email,
        passwordHash: this.hashPassword(password),
        createdAt: new Date().toISOString(),
        lastLogin: null,
        saves: {}
    };
    
    this.users[email] = newUser;
    
    if (this.saveUsers()) {
        console.log('✅ Utente registrato:', email);
        return { success: true, message: 'Registrazione completata con successo!' };
    } else {
        return { success: false, message: 'Errore durante la registrazione' };
    }
};

// Login utente
AuthManager.prototype.login = function(email, password) {
    if (!email || !password) {
        return { success: false, message: 'Email e password sono obbligatori' };
    }
    
    var user = this.users[email];
    if (!user) {
        return { success: false, message: 'Utente non trovato' };
    }
    
    if (!this.verifyPassword(password, user.passwordHash)) {
        return { success: false, message: 'Password non corretta' };
    }
    
    // Aggiorna ultimo login
    user.lastLogin = new Date().toISOString();
    this.saveUsers();
    
    // Imposta utente corrente
    this.currentUser = user;
    this.saveCurrentUser();
    
    console.log('✅ Login effettuato:', email);
    return { success: true, message: 'Login effettuato con successo!' };
};

// Logout
AuthManager.prototype.logout = function() {
    this.currentUser = null;
    localStorage.removeItem('airTycoon_currentUser');
    console.log('👋 Logout effettuato');
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
