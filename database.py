import sqlite3
import os
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), 'ecommerce.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    # Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'customer', -- 'admin' or 'customer'
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create categories table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            icon TEXT DEFAULT 'bi-tag'
        )
    ''')

    # Create products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            category_id INTEGER,
            image_url TEXT,
            rating REAL DEFAULT 4.5,
            review_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
        )
    ''')

    # Create cart table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
            UNIQUE(user_id, product_id)
        )
    ''')

    # Create orders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            shipping_address TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            payment_status TEXT NOT NULL DEFAULT 'Paid',
            order_status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'
            tracking_number TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')

    # Create order items table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
        )
    ''')

    # Create reviews table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            user_name TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            comment TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')

    conn.commit()
    conn.close()
    print("Database initialized successfully.")

def seed_initial_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if users already seeded
    cursor.execute("SELECT COUNT(*) as count FROM users")
    if cursor.fetchone()['count'] == 0:
        # Create Admin
        admin_pass = generate_password_hash('admin123')
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            ('Store Admin', 'admin@store.com', admin_pass, 'admin')
        )
        # Create Regular Customer
        user_pass = generate_password_hash('user123')
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            ('John Doe', 'user@store.com', user_pass, 'customer')
        )
        print("Seeded default users (Admin & Customer).")

    # Check categories
    cursor.execute("SELECT COUNT(*) as count FROM categories")
    if cursor.fetchone()['count'] == 0:
        categories = [
            ('Electronics', 'Gadgets, devices, audio and smart home tech', 'bi-laptop'),
            ('Fashion & Apparel', 'Clothing, footwear, and stylish accessories', 'bi-bag'),
            ('Home & Living', 'Furniture, kitchenware, and home decor items', 'bi-house-heart'),
            ('Books & Stationery', 'Best-selling books, notebooks and desk supplies', 'bi-book')
        ]
        for name, desc, icon in categories:
            cursor.execute("INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)", (name, desc, icon))
        print("Seeded product categories.")

    # Check products
    cursor.execute("SELECT COUNT(*) as count FROM products")
    if cursor.fetchone()['count'] == 0:
        products = [
            (
                'Pro Noise-Canceling Wireless Headphones',
                'Experience crystal clear sound with Active Noise Cancellation (ANC), 40-hour battery life, and ergonomic memory foam ear cushions.',
                199.99,
                45,
                1, # Electronics
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
                4.8,
                24
            ),
            (
                'Ultra HD Smart Watch Series 7',
                'Track your health, heart rate, sleep metrics, and receive instant phone notifications on a vibrant AMOLED display.',
                149.50,
                30,
                1, # Electronics
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
                4.7,
                18
            ),
            (
                'RGB Mechanical Gaming Keyboard',
                'Tactile mechanical switches, customizable per-key RGB backlighting, and durable aluminum top frame built for speed.',
                89.99,
                60,
                1, # Electronics
                'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
                4.6,
                15
            ),
            (
                'Ergonomic Wireless Mouse',
                'Dual Bluetooth & 2.4GHz wireless connectivity, quiet clicking mechanism, and precision optical tracking.',
                39.99,
                100,
                1, # Electronics
                'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
                4.5,
                32
            ),
            (
                'Classic Leather Biker Jacket',
                'Handcrafted 100% genuine leather jacket with asymmetric zip closure and premium internal lining for timeless style.',
                179.00,
                20,
                2, # Fashion
                'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
                4.9,
                40
            ),
            (
                'Minimalist Canvas Sneaker',
                'Breathable canvas upper with reinforced vulcanized rubber sole. Light, durable, and suitable for all-day comfort.',
                59.99,
                80,
                2, # Fashion
                'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
                4.4,
                12
            ),
            (
                'Stainless Steel Pour-Over Coffee Maker',
                'Brew barista-quality coffee at home with double-mesh stainless filter and heat-resistant borosilicate glass carafe.',
                42.50,
                35,
                3, # Home & Living
                'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
                4.7,
                29
            ),
            (
                'Modern Velvet Desk Chair',
                'Soft velvet upholstery, 360-degree swivel, height adjustable with golden metal base for elegant home office setups.',
                129.99,
                15,
                3, # Home & Living
                'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=800&auto=format&fit=crop&q=80',
                4.6,
                19
            ),
            (
                'Hardcover Productivity Planner',
                'Undated daily & weekly layout with goal-setting templates, habit trackers, and premium 120gsm bleed-proof paper.',
                24.99,
                120,
                4, # Books & Stationery
                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
                4.9,
                55
            )
        ]
        for title, desc, price, stock, cat_id, img, rating, rev_cnt in products:
            cursor.execute('''
                INSERT INTO products (name, description, price, stock, category_id, image_url, rating, review_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (title, desc, price, stock, cat_id, img, rating, rev_cnt))
        print("Seeded sample products.")

    # Check sample orders
    cursor.execute("SELECT COUNT(*) as count FROM orders")
    if cursor.fetchone()['count'] == 0:
        # Get customer ID (user@store.com -> id 2)
        cursor.execute("SELECT id FROM users WHERE email = 'user@store.com'")
        user = cursor.fetchone()
        if user:
            u_id = user['id']
            # Sample Order 1 (Delivered)
            cursor.execute('''
                INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, order_status, tracking_number, created_at)
                VALUES (?, ?, ?, ?, ?, ?, DATETIME('now', '-3 days'))
            ''', (u_id, 249.98, '123 Tech Park Ave, Suite 400, San Francisco, CA 94107', 'Credit Card', 'Delivered', 'TRK-98421054'))
            order1_id = cursor.lastrowid
            cursor.execute("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, 1, 1, 199.99)", (order1_id,))
            cursor.execute("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, 7, 1, 42.50)", (order1_id,))

            # Sample Order 2 (Shipped)
            cursor.execute('''
                INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, order_status, tracking_number, created_at)
                VALUES (?, ?, ?, ?, ?, ?, DATETIME('now', '-1 days'))
            ''', (u_id, 149.50, '123 Tech Park Ave, Suite 400, San Francisco, CA 94107', 'UPI / Net Banking', 'Shipped', 'TRK-67319204'))
            order2_id = cursor.lastrowid
            cursor.execute("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, 2, 1, 149.50)", (order2_id,))

            print("Seeded sample customer orders.")

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    seed_initial_data()
