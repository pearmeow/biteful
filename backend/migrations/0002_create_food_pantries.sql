CREATE TABLE IF NOT EXISTS food_pantries (
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    agency      TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    open_time   TIME,
    close_time  TIME,
    address     TEXT,
    latitude    DOUBLE PRECISION,
    longitude   DOUBLE PRECISION,
    meal_type   TEXT,
    frequency   TEXT,
    phone       TEXT,
    program     TEXT 
);