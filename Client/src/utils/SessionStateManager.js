// SessionStateManager - Gestisce lo stato di sessione del giocatore
console.log('🔧 Caricamento SessionStateManager...');

class SessionStateManager {
    constructor() {
        this.CACHE_KEYS = {
            CURRENT_PAGE: 'air_tycoon_current_page',
            COMPANY_ID: 'selectedCompanyId',
            USER_STATE: 'air_tycoon_user_state',
            GAME_SESSION: 'air_tycoon_game_session'
        };
        
        this.PAGES = {
            LOGIN: 'login',
            GAME_SELECT: 'game_select', 
            HUB: 'hub',
            MENU: 'menu'
        };
    }
    
    // Salva la pagina corrente
    saveCurrentPage(page, additionalData = {}) {
        console.log('💾 Salvataggio stato sessione:', page, additionalData);
        
        const sessionData = {
            page: page,
            timestamp: new Date().toISOString(),
            ...additionalData
        };
        
        try {
            localStorage.setItem(this.CACHE_KEYS.CURRENT_PAGE, JSON.stringify(sessionData));
            console.log('✅ Stato sessione salvato');
        } catch (error) {
            console.error('❌ Errore nel salvataggio stato sessione:', error);
        }
    }
    
    // Carica la pagina dove era rimasto il player
    loadCurrentPage() {
        try {
            const saved = localStorage.getItem(this.CACHE_KEYS.CURRENT_PAGE);
            if (!saved) {
                console.log('ℹ️ Nessuno stato sessione salvato');
                return null;
            }
            
            const sessionData = JSON.parse(saved);
            console.log('📖 Stato sessione caricato:', sessionData);
            
            // Verifica che non sia troppo vecchio (24 ore)
            const savedTime = new Date(sessionData.timestamp);
            const now = new Date();
            const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
            
            if (hoursDiff > 24) {
                console.log('⏰ Stato sessione scaduto, rimozione...');
                this.clearSession();
                return null;
            }
            
            return sessionData;
        } catch (error) {
            console.error('❌ Errore nel caricamento stato sessione:', error);
            this.clearSession();
            return null;
        }
    }
    
    // Pulisce completamente la sessione (quando torna al menu)
    clearSession() {
        console.log('🧹 Pulizia completa sessione...');
        
        Object.values(this.CACHE_KEYS).forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
        
        console.log('✅ Sessione pulita');
    }
    
    // Salva stato di gioco attivo
    saveGameSession(companyId, companyName) {
        console.log('🎮 Salvataggio sessione di gioco:', companyId, companyName);
        
        // Salva in sessionStorage per la sessione corrente
        sessionStorage.setItem(this.CACHE_KEYS.COMPANY_ID, companyId);
        
        // Salva in localStorage per persistenza
        this.saveCurrentPage(this.PAGES.HUB, {
            companyId: companyId,
            companyName: companyName
        });
    }
    
    // Verifica se c'è una sessione di gioco attiva
    hasActiveGameSession() {
        const pageState = this.loadCurrentPage();
        const companyId = sessionStorage.getItem(this.CACHE_KEYS.COMPANY_ID);
        
        return pageState && pageState.page === this.PAGES.HUB && companyId;
    }
    
    // Reindirizza alla pagina corretta basandosi sullo stato
    redirectToCorrectPage() {
        console.log('🧭 Determinazione pagina corretta...');
        
        const currentPath = window.location.pathname;
        const pageState = this.loadCurrentPage();
        
        // Se siamo già nella pagina corretta, non fare nulla
        if (this.isCurrentPageCorrect(currentPath, pageState)) {
            console.log('✅ Già nella pagina corretta');
            return false;
        }
        
        if (!pageState) {
            // Nessuno stato salvato, vai al login se non ci sei già
            if (!currentPath.includes('login') && !currentPath.includes('auth')) {
                console.log('🔀 Reindirizzo al login...');
                window.location.href = '/game/auth/login.html';
                return true;
            }
            return false;
        }
        
        // Reindirizza basandosi sullo stato salvato
        switch (pageState.page) {
            case this.PAGES.HUB:
                if (pageState.companyId) {
                    // Ripristina companyId in sessionStorage
                    sessionStorage.setItem(this.CACHE_KEYS.COMPANY_ID, pageState.companyId);
                    console.log('🔀 Reindirizzo all\'hub con companyId:', pageState.companyId);
                    window.location.href = '/game/hub.html';
                    return true;
                }
                break;
                
            case this.PAGES.GAME_SELECT:
                console.log('🔀 Reindirizzo alla selezione partita...');
                window.location.href = '/game/game/select.html';
                return true;
                
            default:
                console.log('🔀 Stato non riconosciuto, vai al login...');
                window.location.href = '/game/auth/login.html';
                return true;
        }
        
        return false;
    }
    
    // Verifica se la pagina corrente corrisponde allo stato salvato
    isCurrentPageCorrect(currentPath, pageState) {
        if (!pageState) return false;
        
        switch (pageState.page) {
            case this.PAGES.HUB:
                return currentPath.includes('hub.html');
            case this.PAGES.GAME_SELECT:
                return currentPath.includes('select.html');
            case this.PAGES.LOGIN:
                return currentPath.includes('login.html') || currentPath.includes('auth');
            default:
                return false;
        }
    }
}

// Esporta globalmente
window.SessionStateManager = SessionStateManager;

console.log('✅ SessionStateManager caricato');
