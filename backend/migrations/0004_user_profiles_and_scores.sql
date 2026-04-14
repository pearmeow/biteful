CREATE TABLE IF NOT EXISTS food_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    item_name VARCHAR(255),
    health_points INT DEFAULT 0,
    logged_at TIMESTAMP DEFAULT NOW()
);