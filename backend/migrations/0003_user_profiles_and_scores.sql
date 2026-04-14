-- Update users table for FR-1.3 and FR-1.5
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS dietary_preferences TEXT,
ADD COLUMN IF NOT EXISTS health_score INT DEFAULT 0;

-- Create Food Logs table for FR-1.2 and FR-1.6
CREATE TABLE IF NOT EXISTS food_logs (
    id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       INT REFERENCES users(id) ON DELETE CASCADE,
    food_name     TEXT NOT NULL,
    points_added  INT NOT NULL,
    logged_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
