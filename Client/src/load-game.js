// /Client/src/load-game.js
// Compatibile come module ma esporta funzione anche su window per compatibilità legacy
function isValidCompanyId(id) {
	return /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
}

function loadGameCompanyIdOrShowError(showError) {
	const companyId = sessionStorage.getItem('selectedCompanyId');
	
	// Debug: mostra tutte le chiavi del sessionStorage
	
	// Debug: mostra tutti i valori del sessionStorage per debug completo
	for (let key in sessionStorage) {
	}
	
	if (!companyId) {
		showError('Errore: companyId non trovato. Devi prima selezionare una compagnia dalla schermata di selezione gioco.');
		// Reindirizza alla selezione gioco dopo 3 secondi
		setTimeout(() => {
			window.location.href = '/game/game/select.html';
		}, 3000);
		return null;
	}
	if (!isValidCompanyId(companyId)) {
		showError('Errore: companyId non valido. Seleziona una compagnia valida dalla schermata di selezione partita.');
		return null;
	}
	return companyId;
}

// Compatibility: attach to window
if (typeof window !== 'undefined') {
	window.loadGameCompanyIdOrShowError = loadGameCompanyIdOrShowError;
	window.isValidCompanyId = isValidCompanyId;
}
