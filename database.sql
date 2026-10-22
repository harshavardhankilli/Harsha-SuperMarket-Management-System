-- ==========================================================
-- Harsha Supermarket Inventory Management System (PMS)
-- Database & Table Initialization Script
-- ==========================================================

-- 1. Create Database (if not exists)
CREATE DATABASE IF NOT EXISTS harsha_pms;
USE harsha_pms;

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_category VARCHAR(100) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    product_quantity INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Seed Sample Supermarket Products
INSERT INTO products (product_id, product_name, product_category, product_price, product_quantity, reorder_level) VALUES
(101, 'Amul Taaza Toned Milk (1L)', 'Dairy', 54.00, 45, 15),
(102, 'Mother Dairy Cow Milk (500ml)', 'Dairy', 28.00, 8, 12),
(103, 'Britannia 100% Whole Wheat Bread (400g)', 'Bakery', 45.00, 22, 10),
(104, 'Amul Salted Butter (500g)', 'Dairy', 275.00, 18, 5),
(105, 'Tata Salt Vacuum Evaporated (1kg)', 'Grocery', 28.00, 80, 20),
(106, 'Fortune Sunlite Refined Sunflower Oil (1L)', 'Grocery', 135.00, 30, 10),
(107, 'India Gate Basmati Rice Feast Rozzana (5kg)', 'Grocery', 420.00, 14, 5),
(108, 'Aashirvaad Superior MP Sharbati Atta (10kg)', 'Grocery', 460.00, 19, 6),
(109, 'Maggi 2-Minute Masala Noodles (Pack of 12)', 'Instant Food', 168.00, 35, 12),
(110, 'Kissan Fresh Tomato Ketchup (950g)', 'Packaged Food', 130.00, 11, 8),
(111, 'Cadbury Dairy Milk Silk Chocolate (150g)', 'Confectionery', 175.00, 25, 10),
(112, 'Lay\'s India\'s Magic Masala Potato Chips (115g)', 'Snacks', 50.00, 4, 15),
(113, 'Parle-G Gold Glucose Biscuits (1kg)', 'Snacks', 120.00, 50, 15),
(114, 'Nescafe Classic Instant Coffee Jar (100g)', 'Beverages', 320.00, 16, 6),
(115, 'Taj Mahal Tea Leaves (500g)', 'Beverages', 360.00, 2, 8),
(116, 'Coca-Cola Original Soft Drink (1.25L)', 'Beverages', 60.00, 0, 10),
(117, 'Surf Excel Easy Wash Detergent Powder (1kg)', 'Household', 140.00, 28, 10),
(118, 'Vim Dishwash Gel Lemon (750ml)', 'Household', 155.00, 32, 10),
(119, 'Dettol Original Liquid Handwash Refill (750ml)', 'Personal Care', 119.00, 0, 12),
(120, 'Colgate Strong Teeth Toothpaste (500g Mega Saver)', 'Personal Care', 230.00, 24, 8)
ON DUPLICATE KEY UPDATE 
    product_name = VALUES(product_name),
    product_category = VALUES(product_category),
    product_price = VALUES(product_price),
    product_quantity = VALUES(product_quantity),
    reorder_level = VALUES(reorder_level);
