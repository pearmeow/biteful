CREATE TABLE food_items (
    id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    menu_id         INT REFERENCES menus(id) ON DELETE CASCADE,
    dish_name       TEXT not NULL,
    health_points   INT DEFAULT 0,
    menu_section    TEXT,
    dish_desc       TEXT,
    price           NUMERIC not NULL,
    last_updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
