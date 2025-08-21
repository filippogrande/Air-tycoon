// Main.js semplificato - Inizializzazione Air Tycoon 2 Clone
// Versione pulita senza import/export problematici

console.debug('🛫 Air Tycoon 2 Clone - Avvio sistema...');

// Aspetta che il DOM sia caricato
document.addEventListener('DOMContentLoaded', function() {
    console.debug('📄 DOM caricato, inizializzo sistema...');
    
    // Aspetta che Leaflet sia caricato
    function waitForLeaflet(callback) {
        if (typeof L !== 'undefined') {
            console.debug('✅ Leaflet disponibile');
            callback();
        } else {
            console.debug('⏳ Attendo caricamento Leaflet...');
            setTimeout(function() { waitForLeaflet(callback); }, 100);
        }
    }
    
    // Avvia il gioco quando tutto è pronto
    waitForLeaflet(function() {
        console.debug('🚀 Avvio inizializzazione gioco...');
        
        // Verifica che le utility core siano disponibili
        if (typeof loadGameCompanyIdOrShowError === 'undefined') {
            console.error('❌ Core utilities non caricate');
            alert('Errore: utility di base non caricate');
            return;
        }
        
        // Carica companyId
        const companyId = loadGameCompanyIdOrShowError(showError);
        if (!companyId) {
            console.error('❌ CompanyId non valido, interruzione avvio');
            return;
        }
        
        console.debug('✅ CompanyId ottenuto:', companyId);
        
        // Imposta data di gioco nell'header
        fetchAndShowGameDate(companyId);
        
        // Carica dati core e avvia gioco
        loadCoreDataAndStartGame(companyId, initializeGameSimple);
    });
});

console.debug('✅ Main.js semplificato caricato');
