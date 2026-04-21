-- 1. Insert User and ensure it ends with a semicolon
-- If 'id' is a SERIAL/IDENTITY, don't force it to 1.
INSERT INTO users (username, email, password_hash, display_name)
VALUES ('test', 'test@test', '$argon2id$v=19$m=65536,t=2,p=1$B81APc7vZ/RlHft4BqIpMA$SukgpgWYROeO9z7Hhwzu20WN3ThDmsfFqZKpD34HJ2s', 'Test');

-- 1. Seed a Restaurant
INSERT INTO restaurants (camis, name, boro, building, street, zipcode, phone, cuisine, grade)
VALUES (999999999, 'The Healthy Bite', 'MANHATTAN', '123', 'GREENWICH ST', '10001', '2125550199', 'Healthy', 'A');

-- 3. Seed a Menu (Linking the restaurant and user)
INSERT INTO menus (restaurant_id, user_id, rating)
VALUES (
    999999999, 
    (SELECT id FROM users WHERE username = 'test'), 
    5
);

-- 4. Insert food items (using the subquery method from before)
INSERT INTO food_items (menu_id, dish_name, health_points, menu_section, price)
VALUES 
    ((SELECT id FROM menus WHERE restaurant_id = 999999999 LIMIT 1), 'Avocado Smash', -30, 'Breakfast', 14.50),
    ((SELECT id FROM menus WHERE restaurant_id = 999999999 LIMIT 1), 'Classic Burger', -10, 'Main', 16.00),
    ((SELECT id FROM menus WHERE restaurant_id = 999999999 LIMIT 1), 'Kale Salad', 20, 'Salads', 12.00);

INSERT INTO food_logs (user_id, food_item_id)
VALUES (
    (SELECT id FROM users WHERE username = 'test'),
    (SELECT id FROM food_items WHERE dish_name = 'Avocado Smash' LIMIT 1)
);

UPDATE users 
SET health_score = health_score + (SELECT health_points FROM food_items WHERE dish_name = 'Avocado Smash' LIMIT 1)
WHERE username = 'test';