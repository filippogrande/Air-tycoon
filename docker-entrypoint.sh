#!/bin/sh
set -e

# Simple entrypoint to wait for Postgres, run migrations/seed and start the server
: "# Required env: DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME"

echo "[entrypoint] Starting..."
# Normalize DB envs if they come from host environment and point to localhost
if [ "$DB_HOST" = "localhost" ] || [ "$DB_HOST" = "127.0.0.1" ] || [ -z "$DB_HOST" ]; then
  echo "[entrypoint] DB_HOST appears to point to localhost (or is empty). Overriding to use docker-compose service 'db' for container networking."
  DB_HOST="db"
  if [ -z "$DB_USER" ] || [ "$DB_USER" = "airtycoon" ]; then
    DB_USER="air_tycoon_user"
  fi
  if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" = "airtycoon2024!" ]; then
    DB_PASSWORD="changeme"
  fi
  export DB_HOST DB_USER DB_PASSWORD
fi

# Wait for Postgres to be available
echo "[entrypoint] Waiting for Postgres at $DB_HOST:$DB_PORT..."

export PGPASSWORD="$DB_PASSWORD"

until psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' >/dev/null 2>&1; do
  echo "[entrypoint] Postgres is unavailable - sleeping"
  sleep 1
done

echo "[entrypoint] Postgres is up"

# Ensure base schema is applied (if present)
# Normalize DB envs if they come from host environment and point to localhost
if [ "$DB_HOST" = "localhost" ] || [ "$DB_HOST" = "127.0.0.1" ] || [ -z "$DB_HOST" ]; then
  echo "[entrypoint] DB_HOST appears to point to localhost (or is empty). Overriding to use docker-compose service 'db' for container networking."
  DB_HOST="db"
  # If host env injected different credentials, prefer the compose defaults so container can talk to the postgres service
  if [ -z "$DB_USER" ] || [ "$DB_USER" = "airtycoon" ]; then
    DB_USER="air_tycoon_user"
  fi
  if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" = "airtycoon2024!" ]; then
    DB_PASSWORD="changeme"
  fi
  export DB_HOST DB_USER DB_PASSWORD
  export PGPASSWORD="$DB_PASSWORD"
fi

if [ -f "./database/schema_base.sql" ]; then
  echo "[entrypoint] Checking whether base schema is present..."
  # Check for a sentinel table that schema_base.sql creates (users or companies)
  if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users' LIMIT 1;" | grep -q 1; then
    echo "[entrypoint] Base schema not found, applying database/schema_base.sql"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f ./database/schema_base.sql
    echo "[entrypoint] schema_base.sql applied"
  else
    echo "[entrypoint] Base schema already present, skipping schema_base.sql"
  fi
fi

# NOTE: migrations are executed by the server process (server/index.js)
# to avoid leaving a separate migrate process running and blocking the entrypoint.
# If you need to run migrations from the entrypoint, ensure migrate.js closes DB pools.

# Run seed if requested
if [ "$RUN_SEED" = "1" ] || [ "$RUN_SEED" = "true" ]; then
  echo "[entrypoint] Running seed_initial_data..."
  if [ -f "./database/seed_initial_data.js" ]; then
    # Run seed and fail fast if it errors so CI / orchestrator sees failure
    node ./database/seed_initial_data.js
    SEED_EXIT=$?
    if [ "$SEED_EXIT" -ne 0 ]; then
      echo "[entrypoint] Seed script failed with exit code $SEED_EXIT"
      exit $SEED_EXIT
    fi
  else
    echo "[entrypoint] No seed_initial_data.js found, skipping seed"
  fi
fi

# Finally start the server
if [ "$NODE_ENV" = "development" ]; then
  echo "[entrypoint] Starting in development mode: npm run dev"
  exec npm run dev
else
  echo "[entrypoint] Starting in production mode: npm start"
  exec npm start
fi
