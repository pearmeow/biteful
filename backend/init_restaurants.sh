#!/bin/bash

# 1. Load environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
else
    echo "Error: .env file not found!"
    exit 1
fi

PGPASS_PATH="$HOME/.pgpass"
echo "127.0.0.1:5432:$DB_NAME:$DB_USER:$DB_PASSWORD" > "$PGPASS_PATH"
chmod 0600 "$PGPASS_PATH"

# 2. Configuration
FILE_NAME="./dohmh_restaurant_04132026.csv"
TABLE_NAME="restaurants"

echo "Ingesting NYC Restaurant Data..."

psql -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" <<EOF

CREATE TEMP TABLE staging_restaurants (
    camis TEXT, dba TEXT, boro TEXT, building TEXT, street TEXT, 
    zipcode TEXT, phone TEXT, cuisine_description TEXT, inspection_date TEXT,
    action TEXT, violation_code TEXT, violation_description TEXT, 
    critical_flag TEXT, score TEXT, grade TEXT, grade_date TEXT, 
    record_date TEXT, inspection_type TEXT, latitude TEXT, longitude TEXT,
    council_district TEXT, bin TEXT, community_board TEXT, nta TEXT, 
    census_tract TEXT, bbl TEXT, location TEXT
);

\copy staging_restaurants FROM '$FILE_NAME' WITH (FORMAT csv, HEADER true, QUOTE '"', ENCODING 'UTF8');

-- Deduplicate and Insert
INSERT INTO $TABLE_NAME (
    camis, name, boro, building, street, zipcode, phone, 
    cuisine, inspection_date, grade, latitude, longitude
)
SELECT DISTINCT ON (camis::INT)
    camis::INT,
    TRIM(dba),
    boro,
    building,
    street,
    zipcode,
    phone,
    cuisine_description,
    CASE 
        WHEN inspection_date LIKE '1900%' OR inspection_date = '' THEN NULL 
        ELSE (inspection_date::TIMESTAMP)::DATE 
    END,
    NULLIF(TRIM(grade), ''),
    NULLIF(latitude, '')::DOUBLE PRECISION,
    NULLIF(longitude, '')::DOUBLE PRECISION
FROM staging_restaurants
WHERE action != 'Establishment Closed'
  AND latitude IS NOT NULL 
  AND latitude != '0'
  AND latitude != ''
ORDER BY camis::INT, 
         CASE WHEN inspection_date LIKE '1900%' THEN '0001-01-01'::DATE ELSE (inspection_date::TIMESTAMP)::DATE END DESC;

-- Standardize Phone Numbers
UPDATE $TABLE_NAME
SET phone = SUBSTRING(digits FROM 1 FOR 3) || '-' ||
            SUBSTRING(digits FROM 4 FOR 3) || '-' ||
            SUBSTRING(digits FROM 7 FOR 4)
FROM (SELECT camis as c_id, REGEXP_REPLACE(phone, '\D', '', 'g') AS digits FROM $TABLE_NAME) AS s
WHERE camis = s.c_id 
  AND LENGTH(s.digits) >= 10;

EOF

rm "$PGPASS_PATH"
echo "Ingestion Complete. Restaurants are now deduplicated."