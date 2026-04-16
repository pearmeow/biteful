CREATE TABLE menus (
    id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    restaurant_id   INT REFERENCES restaurants(camis) ON DELETE CASCADE,
    user_id         INT REFERENCES users(id) ON DELETE CASCADE,
    rating          INT DEFAULT 0,
    last_updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
