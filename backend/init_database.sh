#!/bin/bash

# 1. Load environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
else
    echo "Error: .env file not found!"
    exit 1
fi

if [ ! -d "./migrations" ]; then
    echo "Error: Migrations directory './migrations' not found!"
    exit 1
fi

# 2. Create/Update the .pgpass file
# Format: hostname:port:database:username:password
PGPASS_PATH="$HOME/.pgpass"

echo "Configuring .pgpass for secure authentication..."
echo "127.0.0.1:5432:postgres:$DB_USER:$DB_PASSWORD" > "$PGPASS_PATH"
echo "127.0.0.1:5432:$DB_NAME:$DB_USER:$DB_PASSWORD" >> "$PGPASS_PATH"
chmod 0600 "$PGPASS_PATH"

# 3. Database Reset
echo "Resetting database: $DB_NAME..."
psql -h 127.0.0.1 -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -h 127.0.0.1 -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"

# 4. Apply Migrations
echo "Applying migrations from ./migrations..."
for file in ./migrations/*.sql; do
    echo "Running $file..."
    psql -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" -f "$file"
done

# 5. Setup Models Directory
rm -rf ./models
mkdir -p ./models

# 6. Create 'Seed' config for drogon_ctl
echo "{\"rdbms\":\"postgresql\",\"host\":\"127.0.0.1\",\"port\":5432,\"dbname\":\"$DB_NAME\",\"user\":\"$DB_USER\",\"passwd\":\"$DB_PASSWORD\",\"tables\":[]}" > ./models/model.json

# 7. Generate the C++ Classes
echo "Generating C++ classes..."
echo "y" | drogon_ctl create model ./models

# 8. Security Cleanup
if [ -f ./models/model.json ]; then
    echo "Scrubbing credentials from model.json..."
    sed -i 's/"passwd":"[^"]*"/"passwd":""/' ./models/model.json
    sed -i 's/"user":"[^"]*"/"user":""/' ./models/model.json
    sed -i 's/"dbname":"[^"]*"/"dbname":""/' ./models/model.json
fi
rm "$PGPASS_PATH"

echo "------------------------------------------"
echo "Success! Models generated using secure .pgpass authentication."