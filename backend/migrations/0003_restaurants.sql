CREATE TABLE restaurants (
    camis           INT PRIMARY KEY,
    name            TEXT,
    boro            TEXT,
    building        TEXT,
    street          TEXT,
    zipcode         TEXT,
    phone           TEXT,
    cuisine         TEXT,
    inspection_date DATE,
    grade           TEXT,
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    last_updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);