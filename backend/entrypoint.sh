#!/bin/bash
set -e

echo "🚀 Starting WhaTicket Backend..."

# Function to wait for PostgreSQL
wait_for_postgres() {
  echo "⏳ Waiting for PostgreSQL to be ready..."
  
  until PGPASSWORD=$DB_PASS psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 2
  done
  
  echo "✅ PostgreSQL is ready!"
}

# Function to wait for Redis
wait_for_redis() {
  echo "⏳ Waiting for Redis to be ready..."
  
  # Extract Redis host and port from REDIS_URI
  # Format: redis://:password@host:port
  REDIS_HOST=$(echo $REDIS_URI | sed -n 's/.*@\([^:]*\):.*/\1/p')
  REDIS_PORT=$(echo $REDIS_URI | sed -n 's/.*:\([0-9]*\)$/\1/p')
  
  if [ -z "$REDIS_HOST" ] || [ -z "$REDIS_PORT" ]; then
    echo "⚠️  Could not parse Redis URI, skipping Redis check"
  else
    until nc -z "$REDIS_HOST" "$REDIS_PORT" 2>/dev/null; do
      echo "Redis is unavailable - sleeping"
      sleep 2
    done
    echo "✅ Redis is ready!"
  fi
}

# Wait for database and Redis
wait_for_postgres
wait_for_redis

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:migrate

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully!"
else
  echo "❌ Migration failed!"
  exit 1
fi

# Optionally run seeds in development
# Run seeds (ignoring errors if data exists)
echo "🌱 Running database seeds..."
npm run db:seed || echo "⚠️  Seeds failed or already run (skipping)"

echo "🎉 Starting application..."

# Start the application
exec "$@"
