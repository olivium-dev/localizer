#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
max_attempts=30
attempts=0

while [ $attempts -lt $max_attempts ]; do
    if pg_isready -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER}; then
        echo "PostgreSQL is up and running!"
        break
    fi
    
    attempts=$((attempts+1))
    echo "PostgreSQL is unavailable - retrying in 2 seconds ($attempts/$max_attempts)"
    sleep 2
done

if [ $attempts -eq $max_attempts ]; then
    echo "Failed to connect to PostgreSQL after $max_attempts attempts. Exiting."
    exit 1
fi

# Check if database exists
if psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -lqt | cut -d \| -f 1 | grep -qw ${DB_NAME}; then
    echo "Database ${DB_NAME} already exists, skipping creation."
else
    echo "Creating database ${DB_NAME}..."
    psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -c "CREATE DATABASE ${DB_NAME}"
fi

echo "Database initialization completed successfully!"

# Start supervisord
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf 