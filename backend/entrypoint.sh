#!/bin/sh
set -e

echo "Waiting for database..."
while ! python -c "import socket; socket.create_connection(('${POSTGRES_HOST:-postgres}', 5432))" 2>/dev/null; do
    sleep 1
done
echo "Database is ready!"

echo "Running migrations..."
python manage.py migrate --noinput

echo "Seeding database..."
python manage.py seed || echo "Seeding skipped (may already exist)"

echo "Starting server..."
exec "$@"
