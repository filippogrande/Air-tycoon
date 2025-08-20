// /Client/src/load-game.js
// Compatibile come module ma esporta funzione anche su window per compatibilità legacy
export function isValidCompanyId(id) {
	return /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
}

export function loadGameCompanyIdOrShowError(showError) {
	const companyId = sessionStorage.getItem('selectedCompanyId');
	if (!companyId) {
		showError('Errore: companyId non trovato. Seleziona una compagnia valida dalla schermata di selezione partita.');
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
}
