#!/bin/bash

# 1. Load environment variables from the shared .env
if [ -f .env ]; then
    export $(cat .env | xargs)
else
    echo "Error: .env file not found!"
    exit 1
fi

# 2. Setup temporary .pgpass for this session
PGPASS_PATH="$HOME/.pgpass"
echo "127.0.0.1:5432:$DB_NAME:$DB_USER:$DB_PASSWORD" > "$PGPASS_PATH"
chmod 0600 "$PGPASS_PATH"

# 3. File and Table Configuration
FILE_NAME="./foodbanksnyc.csv"
TABLE_NAME="food_pantries"

if [ ! -f "$FILE_NAME" ]; then
    echo "Error: $FILE_NAME not found!"
    rm "$PGPASS_PATH"
    exit 1
fi

echo "Ingesting $FILE_NAME into $DB_NAME..."

# 4. Execute SQL via Heredoc
psql -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" <<EOF
-- Ensure the production table exists
-- Clear old data
TRUNCATE TABLE $TABLE_NAME;

-- Create staging table
CREATE TEMP TABLE staging (
    agency TEXT, last_mod TEXT, dow TEXT, open_h TEXT, close_h TEXT, 
    freq TEXT, comms TEXT, is_247 TEXT, meal TEXT, date_c TEXT, 
    inactive TEXT, lat TEXT, lon TEXT, addr1 TEXT, addr2 TEXT, 
    addr3 TEXT, addr4 TEXT, phone TEXT, prog TEXT
);

-- Import raw data
\copy staging FROM '$FILE_NAME' WITH (FORMAT csv, HEADER true, QUOTE '"', ENCODING 'UTF8');

-- Map and clean data into production
INSERT INTO $TABLE_NAME (agency, day_of_week, open_time, close_time, street, building, boro, zipcode, latitude, longitude, meal_type, frequency, phone, program)
SELECT 
    agency, 
    dow, 
    to_timestamp(NULLIF(TRIM(open_h), ''), 'HH12:MI AM')::TIME,
    to_timestamp(NULLIF(TRIM(close_h), ''), 'HH12:MI AM')::TIME,
    NULLIF(TRIM(addr1), ''), 
    NULLIF(TRIM(addr2), ''), 
    NULLIF(TRIM(addr3), ''), 
    NULLIF(TRIM(addr4), ''),
    NULLIF(lat, '')::double precision, 
    NULLIF(lon, '')::double precision,
    meal,
    freq, 
    phone,
    CASE 
        WHEN TRIM(prog) = 'MP' THEN 'Mobile Pantry'
        WHEN TRIM(prog) = 'SOUP KITCH' THEN 'Soup Kitchen'
        WHEN TRIM(prog) = 'PANTRY' THEN 'Pantry'
        WHEN TRIM(prog) = 'SENIOR' THEN 'Senior'
        WHEN TRIM(prog) = 'SKM' THEN 'Soup Kitchen Mobile'
        WHEN TRIM(prog) = 'FB Mobile Pantry' THEN 'Food Bank Mobile Pantry'
        ELSE TRIM(prog)
    END
FROM staging;

-- NORMALIZE PHONE NUMBERS
UPDATE $TABLE_NAME
SET phone = (
    SELECT 
        SUBSTRING(digits FROM 1 FOR 3) || '-' ||
        SUBSTRING(digits FROM 4 FOR 3) || '-' ||
        SUBSTRING(digits FROM 7 FOR 4)
    FROM (SELECT REGEXP_REPLACE(phone, '\D', '', 'g') AS digits) AS s
)
WHERE phone IS NOT NULL 
  AND LENGTH(REGEXP_REPLACE(phone, '\D', '', 'g')) >= 10;

EOF

# 5. Cleanup
rm "$PGPASS_PATH"
echo "------------------------------------------"
echo "Ingestion Successful!"