// Gestore della mappa del mondo
class WorldMap {
    constructor(game) {
        this.game = game;
        this.canvas = null;
        this.ctx = null;
        this.airports = [];
        this.selectedAirport = null;
        this.routes = [];
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Configurazione mappa
        this.mapWidth = 1200;
        this.mapHeight = 600;
        this.worldWidth = 360; // gradi di longitudine
        this.worldHeight = 180; // gradi di latitudine
    }
    
    init() {
        this.canvas = document.getElementById('world-map');
        if (!this.canvas) {
            console.error('Canvas world-map non trovato');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvasSize();
        this.loadAirports();
        this.setupEventListeners();
        this.render();
        
        console.log('🗺️ Mappa del mondo inizializzata');
    }
    
    setupCanvasSize() {
        // Adatta la dimensione del canvas al container
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        this.mapWidth = Math.min(1200, containerRect.width - 40);
        this.mapHeight = Math.min(600, (this.mapWidth * 0.5));
        
        this.canvas.width = this.mapWidth;
        this.canvas.height = this.mapHeight;
        
        // Imposta le dimensioni CSS
        this.canvas.style.width = this.mapWidth + 'px';
        this.canvas.style.height = this.mapHeight + 'px';
    }
    
    loadAirports() {
        this.airports = AirportData.getAllAirports();
        console.log(`📍 Caricati ${this.airports.length} aeroporti`);
    }
    
    setupEventListeners() {
        // Click sulla mappa
        this.canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });
        
        // Mouse events per dragging
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;
                
                this.offsetX += deltaX;
                this.offsetY += deltaY;
                
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                
                this.render();
            } else {
                // Mostra cursore appropriato quando hover su aeroporti
                const airport = this.getAirportAtPosition(e);
                this.canvas.style.cursor = airport ? 'pointer' : 'grab';
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });
        
        // Zoom con rotella del mouse
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.scale = Math.max(0.5, Math.min(3, this.scale * zoomFactor));
            this.render();
        });
        
        // Resize
        window.addEventListener('resize', () => {
            this.setupCanvasSize();
            this.render();
        });
    }
    
    handleCanvasClick(e) {
        const airport = this.getAirportAtPosition(e);
        
        if (airport) {
            this.selectAirport(airport);
        } else {
            this.deselectAirport();
        }
    }
    
    getAirportAtPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Converti coordinate schermo in coordinate mondo
        const worldX = (x - this.offsetX) / this.scale;
        const worldY = (y - this.offsetY) / this.scale;
        
        // Trova aeroporto più vicino entro una certa distanza
        const threshold = 15 / this.scale; // 15 pixel di tolleranza
        
        for (const airport of this.airports) {
            const airportX = this.longitudeToX(airport.longitude);
            const airportY = this.latitudeToY(airport.latitude);
            
            const distance = Math.sqrt(
                Math.pow(worldX - airportX, 2) + Math.pow(worldY - airportY, 2)
            );
            
            if (distance <= threshold) {
                return airport;
            }
        }
        
        return null;
    }
    
    selectAirport(airport) {
        this.selectedAirport = airport;
        this.showAirportInfo(airport);
        this.render();
    }
    
    deselectAirport() {
        this.selectedAirport = null;
        this.hideAirportInfo();
        this.render();
    }
    
    showAirportInfo(airport) {
        const infoPanel = document.getElementById('airport-info');
        const airportName = document.getElementById('airport-name');
        const airportDetails = document.getElementById('airport-details');
        
        if (infoPanel && airportName && airportDetails) {
            airportName.textContent = `${airport.code} - ${airport.name}`;
            airportDetails.innerHTML = `
                <p><strong>Città:</strong> ${airport.city}, ${airport.country}</p>
                <p><strong>Dimensione:</strong> ${airport.getSizeText()}</p>
                <p><strong>Traffico:</strong> ${airport.passengerTraffic.toLocaleString()} passeggeri/anno</p>
                <p><strong>Domanda:</strong> ${airport.demandLevel}/100</p>
                <p><strong>Concorrenza:</strong> ${airport.competitionLevel}/100</p>
                <p><strong>Meteo:</strong> ${airport.getWeatherText()}</p>
            `;
            
            infoPanel.classList.remove('hidden');
        }
    }
    
    hideAirportInfo() {
        const infoPanel = document.getElementById('airport-info');
        if (infoPanel) {
            infoPanel.classList.add('hidden');
        }
    }
    
    // Conversioni coordinate
    longitudeToX(longitude) {
        return ((longitude + 180) / 360) * this.mapWidth;
    }
    
    latitudeToY(latitude) {
        return ((90 - latitude) / 180) * this.mapHeight;
    }
    
    xToLongitude(x) {
        return (x / this.mapWidth) * 360 - 180;
    }
    
    yToLatitude(y) {
        return 90 - (y / this.mapHeight) * 180;
    }
    
    // Rendering
    render() {
        this.clearCanvas();
        this.drawBackground();
        this.drawContinents();
        this.drawRoutes();
        this.drawAirports();
        this.drawUI();
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.mapWidth, this.mapHeight);
    }
    
    drawBackground() {
        // Sfondo oceano
        this.ctx.fillStyle = '#4a90e2';
        this.ctx.fillRect(0, 0, this.mapWidth, this.mapHeight);
        
        // Griglia (opzionale)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Linee di longitudine
        for (let lon = -180; lon <= 180; lon += 30) {
            const x = this.longitudeToX(lon);
            const screenX = x * this.scale + this.offsetX;
            
            if (screenX >= 0 && screenX <= this.mapWidth) {
                this.ctx.beginPath();
                this.ctx.moveTo(screenX, 0);
                this.ctx.lineTo(screenX, this.mapHeight);
                this.ctx.stroke();
            }
        }
        
        // Linee di latitudine
        for (let lat = -90; lat <= 90; lat += 30) {
            const y = this.latitudeToY(lat);
            const screenY = y * this.scale + this.offsetY;
            
            if (screenY >= 0 && screenY <= this.mapHeight) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, screenY);
                this.ctx.lineTo(this.mapWidth, screenY);
                this.ctx.stroke();
            }
        }
    }
    
    drawContinents() {
        // Disegno semplificato dei continenti
        this.ctx.fillStyle = '#8bc34a';
        this.ctx.strokeStyle = '#689f38';
        this.ctx.lineWidth = 2;
        
        // Europa
        this.drawLandMass([
            { lat: 71, lon: -10 }, { lat: 71, lon: 40 },
            { lat: 36, lon: 40 }, { lat: 36, lon: -10 }
        ]);
        
        // Nord America
        this.drawLandMass([
            { lat: 83, lon: -170 }, { lat: 83, lon: -50 },
            { lat: 15, lon: -50 }, { lat: 15, lon: -170 }
        ]);
        
        // Asia
        this.drawLandMass([
            { lat: 77, lon: 40 }, { lat: 77, lon: 180 },
            { lat: 8, lon: 180 }, { lat: 8, lon: 40 }
        ]);
        
        // Africa
        this.drawLandMass([
            { lat: 37, lon: -20 }, { lat: 37, lon: 50 },
            { lat: -35, lon: 50 }, { lat: -35, lon: -20 }
        ]);
        
        // Sud America
        this.drawLandMass([
            { lat: 12, lon: -82 }, { lat: 12, lon: -35 },
            { lat: -55, lon: -35 }, { lat: -55, lon: -82 }
        ]);
        
        // Australia
        this.drawLandMass([
            { lat: -10, lon: 113 }, { lat: -10, lon: 154 },
            { lat: -44, lon: 154 }, { lat: -44, lon: 113 }
        ]);
    }
    
    drawLandMass(coordinates) {
        this.ctx.beginPath();
        
        coordinates.forEach((coord, index) => {
            const x = this.longitudeToX(coord.lon) * this.scale + this.offsetX;
            const y = this.latitudeToY(coord.lat) * this.scale + this.offsetY;
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }
    
    drawRoutes() {
        const routes = this.game.state.routes.filter(route => route.isActive);
        
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#ff6b6b';
        
        routes.forEach(route => {
            const originAirport = this.airports.find(a => a.code === route.origin);
            const destinationAirport = this.airports.find(a => a.code === route.destination);
            
            if (originAirport && destinationAirport) {
                this.drawRoute(originAirport, destinationAirport);
            }
        });
    }
    
    drawRoute(originAirport, destinationAirport) {
        const x1 = this.longitudeToX(originAirport.longitude) * this.scale + this.offsetX;
        const y1 = this.latitudeToY(originAirport.latitude) * this.scale + this.offsetY;
        const x2 = this.longitudeToX(destinationAirport.longitude) * this.scale + this.offsetX;
        const y2 = this.latitudeToY(destinationAirport.latitude) * this.scale + this.offsetY;
        
        // Disegna linea curva per simulare la great circle route
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        
        // Calcola punto di controllo per la curva
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.1;
        
        this.ctx.quadraticCurveTo(midX, midY, x2, y2);
        this.ctx.stroke();
        
        // Freccia alla destinazione
        this.drawArrow(x2, y2, Math.atan2(y2 - midY, x2 - midX));
    }
    
    drawArrow(x, y, angle) {
        const arrowLength = 8;
        const arrowAngle = Math.PI / 6;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(
            x - arrowLength * Math.cos(angle - arrowAngle),
            y - arrowLength * Math.sin(angle - arrowAngle)
        );
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(
            x - arrowLength * Math.cos(angle + arrowAngle),
            y - arrowLength * Math.sin(angle + arrowAngle)
        );
        this.ctx.stroke();
    }
    
    drawAirports() {
        this.airports.forEach(airport => {
            this.drawAirport(airport);
        });
    }
    
    drawAirport(airport) {
        const x = this.longitudeToX(airport.longitude) * this.scale + this.offsetX;
        const y = this.latitudeToY(airport.latitude) * this.scale + this.offsetY;
        
        // Non disegnare se fuori schermo
        if (x < -20 || x > this.mapWidth + 20 || y < -20 || y > this.mapHeight + 20) {
            return;
        }
        
        // Dimensione basata sulla grandezza dell'aeroporto
        const sizeMultiplier = {
            'small': 1,
            'medium': 1.5,
            'large': 2,
            'hub': 2.5
        };
        
        const baseSize = 4;
        const size = baseSize * (sizeMultiplier[airport.size] || 1) * this.scale;
        
        // Colore basato sul tipo e stato
        let color = '#fff';
        if (airport === this.selectedAirport) {
            color = '#ffeb3b'; // Giallo per aeroporto selezionato
        } else if (this.hasCompanyRoute(airport.code)) {
            color = '#4caf50'; // Verde per aeroporti con nostre rotte
        } else if (airport.size === 'hub') {
            color = '#ff9800'; // Arancione per hub
        }
        
        // Disegna cerchio aeroporto
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Disegna codice IATA se zoom è sufficiente
        if (this.scale > 1 || airport === this.selectedAirport) {
            this.ctx.fillStyle = '#333';
            this.ctx.font = `${Math.max(10, 10 * this.scale)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(airport.code, x, y - size - 5);
        }
    }
    
    hasCompanyRoute(airportCode) {
        return this.game.state.routes.some(route => 
            route.isActive && (route.origin === airportCode || route.destination === airportCode)
        );
    }
    
    drawUI() {
        // Controlli zoom in alto a sinistra
        const controlsX = 20;
        const controlsY = 20;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(controlsX, controlsY, 120, 80);
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Controlli:', controlsX + 10, controlsY + 20);
        this.ctx.fillText('Rotella: Zoom', controlsX + 10, controlsY + 35);
        this.ctx.fillText('Trascina: Sposta', controlsX + 10, controlsY + 50);
        this.ctx.fillText('Click: Seleziona', controlsX + 10, controlsY + 65);
        
        // Indicatore zoom
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.mapWidth - 100, 20, 80, 30);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Zoom: ${Math.round(this.scale * 100)}%`, this.mapWidth - 60, 40);
    }
    
    // Metodi utili per il gioco
    centerOnAirport(airportCode) {
        const airport = this.airports.find(a => a.code === airportCode);
        if (airport) {
            const x = this.longitudeToX(airport.longitude);
            const y = this.latitudeToY(airport.latitude);
            
            this.offsetX = this.mapWidth / 2 - x * this.scale;
            this.offsetY = this.mapHeight / 2 - y * this.scale;
            
            this.selectAirport(airport);
            this.render();
        }
    }
    
    resetView() {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.deselectAirport();
        this.render();
    }
    
    focusOnRoutes() {
        const routes = this.game.state.routes.filter(route => route.isActive);
        if (routes.length === 0) return;
        
        // Calcola bounding box delle rotte
        let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
        
        routes.forEach(route => {
            const origin = this.airports.find(a => a.code === route.origin);
            const destination = this.airports.find(a => a.code === route.destination);
            
            if (origin && destination) {
                minLat = Math.min(minLat, origin.latitude, destination.latitude);
                maxLat = Math.max(maxLat, origin.latitude, destination.latitude);
                minLon = Math.min(minLon, origin.longitude, destination.longitude);
                maxLon = Math.max(maxLon, origin.longitude, destination.longitude);
            }
        });
        
        // Centra e scala per mostrare tutte le rotte
        const centerLat = (minLat + maxLat) / 2;
        const centerLon = (minLon + maxLon) / 2;
        
        const x = this.longitudeToX(centerLon);
        const y = this.latitudeToY(centerLat);
        
        this.offsetX = this.mapWidth / 2 - x;
        this.offsetY = this.mapHeight / 2 - y;
        
        // Calcola zoom appropriato
        const latRange = maxLat - minLat;
        const lonRange = maxLon - minLon;
        const scaleX = this.mapWidth / (this.longitudeToX(maxLon) - this.longitudeToX(minLon));
        const scaleY = this.mapHeight / (this.latitudeToY(minLat) - this.latitudeToY(maxLat));
        
        this.scale = Math.min(scaleX, scaleY) * 0.8; // 80% per margine
        this.scale = Math.max(0.5, Math.min(3, this.scale));
        
        this.render();
    }
}
