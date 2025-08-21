// core-utils.js - Utilità di base per l'interfaccia
console.log('📂 Caricamento core-utils.js...');

// Mostra errore all'utente
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #f44336;
        color: white;
        padding: 20px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        text-align: center;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Export globale per compatibilità
if (typeof window !== 'undefined') {
    window.showError = showError;
}

console.log('✅ core-utils caricato');