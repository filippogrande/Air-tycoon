// UI step-by-step per selezione hub di partenza dopo la scelta scenario
// Da includere dopo la selezione scenario, mostra modale o sezione dedicata

// 1. Carica lista continenti disponibili per lo scenario
function getContinents() {
  return [
    { code: 'Europe', label: 'Europa' },
    { code: 'Asia', label: 'Asia' },
    { code: 'NorthAmerica', label: 'Nord America' },
    { code: 'SouthAmerica', label: 'Sud America' },
    { code: 'Africa', label: 'Africa' },
    { code: 'Oceania', label: 'Oceania' }
  ];
}

// 2. Carica paesi per continente e scenario
async function fetchCountries(continent, scenarioDate) {
  const res = await fetch(`/api/airports?continent=${continent}&before=${scenarioDate}`);
  const airports = await res.json();
  // Estrai paesi unici
  const countries = [...new Set(airports.map(a => a.country))];
  return countries.sort();
}

// 3. Carica aeroporti per paese, scenario e size (large,medium)
async function fetchAirports(country, scenarioDate) {
  const res = await fetch(`/api/airports?country=${encodeURIComponent(country)}&size=large,medium&before=${scenarioDate}`);
  return await res.json();
}

// 4. UI rendering (esempio base, da integrare in modale o sezione dedicata)
// ...implementazione step-by-step con select dinamiche...

// Esempio: dopo la selezione scenario, mostra la modale/step di selezione hub
// 1. Mostra select continente
// 2. Dopo selezione continente, mostra select paese
// 3. Dopo selezione paese, mostra select aeroporto (con label size)
// 4. Al submit, salva scelta aeroporto e chiudi modale

// Nota: Per UI/UX avanzata, integrare con framework o componenti già usati nel progetto.
