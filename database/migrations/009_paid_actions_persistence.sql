-- Migrazione 009: Sistema di persistenza azioni a pagamento
-- Data: 28 giugno 2025
-- Descrizione: Aggiunge tabelle per salvare analisi di mercato, miglioramenti e altre azioni a pagamento

-- =====================================================
-- ANALISI DI MERCATO
-- =====================================================

-- Tabella per salvare le analisi di mercato acquistate
CREATE TABLE IF NOT EXISTS market_analyses (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    origin_airport_id INTEGER REFERENCES airports(id),
    destination_airport_id INTEGER REFERENCES airports(id),
    analysis_type VARCHAR(50) DEFAULT 'standard' CHECK (analysis_type IN ('standard', 'premium', 'detailed')),
    cost_paid INTEGER NOT NULL CHECK (cost_paid > 0), -- Costo pagato per l'analisi
    results JSONB NOT NULL, -- Risultati dell'analisi in formato JSON
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE, -- Data scadenza analisi (NULL = non scade mai)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Vincolo di unicità per evitare analisi duplicate attive
    UNIQUE(company_id, origin_airport_id, destination_airport_id, analysis_type)
        WHERE is_active = TRUE
);

-- =====================================================
-- MIGLIORAMENTI DOMANDA
-- =====================================================

-- Tabella per salvare i miglioramenti dell'analisi domanda acquistati
CREATE TABLE IF NOT EXISTS demand_improvements (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    origin_airport_id INTEGER REFERENCES airports(id),
    destination_airport_id INTEGER REFERENCES airports(id),
    improvement_type VARCHAR(50) DEFAULT 'detailed_traffic' CHECK (improvement_type IN ('detailed_traffic', 'seasonal_analysis', 'competitor_analysis')),
    cost_paid INTEGER NOT NULL CHECK (cost_paid > 0),
    results JSONB NOT NULL, -- Risultati del miglioramento
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE, -- Data scadenza (NULL = permanente)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Vincolo di unicità per evitare miglioramenti duplicati attivi
    UNIQUE(company_id, origin_airport_id, destination_airport_id, improvement_type)
        WHERE is_active = TRUE
);

-- =====================================================
-- AZIONI A PAGAMENTO GENERICHE
-- =====================================================

-- Tabella per salvare tutte le azioni a pagamento del giocatore
CREATE TABLE IF NOT EXISTS paid_actions (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- 'market_analysis', 'demand_improvement', 'research', 'consultation', etc.
    action_subtype VARCHAR(100), -- Per categorizzare meglio le azioni
    target_entity_type VARCHAR(50), -- 'route', 'airport', 'aircraft', 'general'
    target_entity_id INTEGER, -- ID dell'entità target (route_id, airport_id, etc.)
    cost_paid INTEGER NOT NULL CHECK (cost_paid > 0),
    action_data JSONB DEFAULT '{}', -- Dati specifici dell'azione
    results JSONB DEFAULT '{}', -- Risultati dell'azione
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE, -- Data scadenza (NULL = permanente)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDICI PER PERFORMANCE
-- =====================================================

-- Indici per market_analyses
CREATE INDEX IF NOT EXISTS idx_market_analyses_company ON market_analyses(company_id);
CREATE INDEX IF NOT EXISTS idx_market_analyses_route ON market_analyses(origin_airport_id, destination_airport_id);
CREATE INDEX IF NOT EXISTS idx_market_analyses_active ON market_analyses(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_market_analyses_date ON market_analyses(purchase_date);

-- Indici per demand_improvements
CREATE INDEX IF NOT EXISTS idx_demand_improvements_company ON demand_improvements(company_id);
CREATE INDEX IF NOT EXISTS idx_demand_improvements_route ON demand_improvements(origin_airport_id, destination_airport_id);
CREATE INDEX IF NOT EXISTS idx_demand_improvements_active ON demand_improvements(company_id, is_active);

-- Indici per paid_actions
CREATE INDEX IF NOT EXISTS idx_paid_actions_company ON paid_actions(company_id);
CREATE INDEX IF NOT EXISTS idx_paid_actions_type ON paid_actions(action_type, action_subtype);
CREATE INDEX IF NOT EXISTS idx_paid_actions_target ON paid_actions(target_entity_type, target_entity_id);
CREATE INDEX IF NOT EXISTS idx_paid_actions_active ON paid_actions(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_paid_actions_date ON paid_actions(purchase_date);

-- =====================================================
-- TRIGGER PER AGGIORNAMENTO AUTOMATICO
-- =====================================================

-- Trigger per aggiornare updated_at in market_analyses
CREATE OR REPLACE FUNCTION update_market_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_market_analyses_updated_at
    BEFORE UPDATE ON market_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_market_analyses_updated_at();

-- Trigger per aggiornare updated_at in demand_improvements
CREATE OR REPLACE FUNCTION update_demand_improvements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_demand_improvements_updated_at
    BEFORE UPDATE ON demand_improvements
    FOR EACH ROW
    EXECUTE FUNCTION update_demand_improvements_updated_at();

-- Trigger per aggiornare updated_at in paid_actions
CREATE OR REPLACE FUNCTION update_paid_actions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_paid_actions_updated_at
    BEFORE UPDATE ON paid_actions
    FOR EACH ROW
    EXECUTE FUNCTION update_paid_actions_updated_at();

-- =====================================================
-- FUNZIONI HELPER
-- =====================================================

-- Funzione per ottenere analisi di mercato attiva per una rotta
CREATE OR REPLACE FUNCTION get_active_market_analysis(
    p_company_id INTEGER,
    p_origin_airport_id INTEGER,
    p_destination_airport_id INTEGER,
    p_analysis_type VARCHAR DEFAULT 'standard'
)
RETURNS JSONB AS $$
DECLARE
    analysis_result JSONB;
BEGIN
    SELECT results INTO analysis_result
    FROM market_analyses
    WHERE company_id = p_company_id
        AND origin_airport_id = p_origin_airport_id
        AND destination_airport_id = p_destination_airport_id
        AND analysis_type = p_analysis_type
        AND is_active = TRUE
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);
    
    RETURN COALESCE(analysis_result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- Funzione per verificare se una rotta ha analisi di mercato attiva
CREATE OR REPLACE FUNCTION has_active_market_analysis(
    p_company_id INTEGER,
    p_origin_airport_id INTEGER,
    p_destination_airport_id INTEGER,
    p_analysis_type VARCHAR DEFAULT 'standard'
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM market_analyses
        WHERE company_id = p_company_id
            AND origin_airport_id = p_origin_airport_id
            AND destination_airport_id = p_destination_airport_id
            AND analysis_type = p_analysis_type
            AND is_active = TRUE
            AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    );
END;
$$ LANGUAGE plpgsql;

-- Funzione per ottenere miglioramenti domanda attivi per una rotta
CREATE OR REPLACE FUNCTION get_active_demand_improvements(
    p_company_id INTEGER,
    p_origin_airport_id INTEGER,
    p_destination_airport_id INTEGER
)
RETURNS JSONB AS $$
DECLARE
    improvements_result JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'type', improvement_type,
            'results', results,
            'purchase_date', purchase_date
        )
    ), '[]'::JSONB) INTO improvements_result
    FROM demand_improvements
    WHERE company_id = p_company_id
        AND origin_airport_id = p_origin_airport_id
        AND destination_airport_id = p_destination_airport_id
        AND is_active = TRUE
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);
    
    RETURN improvements_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTI SULLE TABELLE
-- =====================================================

COMMENT ON TABLE market_analyses IS 'Analisi di mercato acquistate dai giocatori per le rotte';
COMMENT ON COLUMN market_analyses.results IS 'Risultati analisi: cost_per_flight, monthly_revenue, estimated_profit, etc.';
COMMENT ON COLUMN market_analyses.expires_at IS 'Data scadenza analisi (NULL = non scade mai)';

COMMENT ON TABLE demand_improvements IS 'Miglioramenti dell''analisi domanda acquistati dai giocatori';
COMMENT ON COLUMN demand_improvements.results IS 'Risultati dettagliati del miglioramento';

COMMENT ON TABLE paid_actions IS 'Log di tutte le azioni a pagamento effettuate dai giocatori';
COMMENT ON COLUMN paid_actions.action_data IS 'Parametri dell''azione (route info, airport codes, etc.)';
COMMENT ON COLUMN paid_actions.results IS 'Risultati o effetti dell''azione';
