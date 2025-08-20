// Static airport dataset used by the client. Provide a compact but useful
// dataset so the frontend never relies on runtime fallbacks to the API.
// This file must be loaded before `/src/game-select.js` in the page.

export const AirportData = {
	airports: [
		{
			code: 'FCO',
			name: 'Aeroporto di Roma–Fiumicino "Leonardo da Vinci"',
			city: 'Roma',
			country: 'Italia',
			size: 'large',
			passengerTraffic: 22900000,
			openedYear: 1960,
			closedYear: null
		},
		{
			code: 'MXP',
			name: 'Milano-Malpensa',
			city: 'Milano',
			country: 'Italia',
			size: 'large',
			passengerTraffic: 13000000,
			openedYear: 1960,
			closedYear: null
		},
		{
			code: 'LHR',
			name: 'London Heathrow Airport',
			city: 'London',
			country: 'United Kingdom',
			size: 'hub',
			passengerTraffic: 80000000,
			openedYear: 1946,
			closedYear: null
		},
		{
			code: 'JFK',
			name: 'John F. Kennedy International Airport',
			city: 'New York',
			country: 'United States',
			size: 'hub',
			passengerTraffic: 61000000,
			openedYear: 1948,
			closedYear: null
		},
		{
			code: 'CDG',
			name: 'Paris Charles de Gaulle Airport',
			city: 'Paris',
			country: 'France',
			size: 'hub',
			passengerTraffic: 76000000,
			openedYear: 1974,
			closedYear: null
		},
		{
			code: 'FRA',
			name: 'Frankfurt Airport',
			city: 'Frankfurt',
			country: 'Germany',
			size: 'hub',
			passengerTraffic: 70000000,
			openedYear: 1936,
			closedYear: null
		},
		{
			code: 'BCN',
			name: 'Barcelona–El Prat Airport',
			city: 'Barcelona',
			country: 'Spain',
			size: 'large',
			passengerTraffic: 52000000,
			openedYear: 1916,
			closedYear: null
		}
	]
};

// Build helper lookup and small API on the object for convenience in client code
AirportData._airportByCode = {};
AirportData.airports.forEach(ap => { AirportData._airportByCode[ap.code] = ap; });
AirportData.getAirportByCode = function(code) { return AirportData._airportByCode[code] || null; };

// Attach to window so legacy code can rely on it
if (typeof window !== 'undefined') {
	window.AirportData = AirportData;
}

export default AirportData;
// ...contenuto originale di SimpleData.js da spostare qui...
