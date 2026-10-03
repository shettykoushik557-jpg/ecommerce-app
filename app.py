import os
import random
import string
from functools import wraps
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db_connection, init_db, seed_initial_data

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app)

# Initialize database on app startup
init_db()
seed_initial_data()

# Helper decorator for login required
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Helper decorator for admin required
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or session.get('role') != 'admin':
            return jsonify({'error': 'Admin authorization required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def generate_tracking_number():
    digits = ''.join(random.choices(string.digits, k=8))
    return f"TRK-{digits}"

# --------------------------
# FRONTEND ROUTE
# --------------------------
@app.route('/')
def index():
    return render_template('index.html')

# --------------------------
# AUTHENTICATION ENDPOINTS
# --------------------------
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'customer')

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required.'}), 400

    if role not in ['admin', 'customer']:
        role = 'customer'

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Email is already registered.'}), 400

    hashed_pw = generate_password_hash(password)
    cursor.execute(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        (name, email, hashed_pw, role)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    # Set session
    session['user_id'] = user_id
    session['name'] = name
    session['email'] = email
    session['role'] = role

    return jsonify({
        'message': 'Registration successful',
        'user': {'id': user_id, 'name': name, 'email': email, 'role': role}
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    session['user_id'] = user['id']
    session['name'] = user['name']
    session['email'] = user['email']
    session['role'] = user['role']

    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        }
    })

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    if 'user_id' in session:
        return jsonify({
            'user': {
                'id': session['user_id'],
                'name': session['name'],
                'email': session['email'],
                'role': session['role']
            }
        })
    return jsonify({'user': None})

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'})

# --------------------------
# CATEGORY ENDPOINTS
# --------------------------
@app.route('/api/categories', methods=['GET'])
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT c.*, COUNT(p.id) as product_count 
        FROM categories c 
        LEFT JOIN products p ON c.id = p.category_id 
        GROUP BY c.id
    ''')
    rows = cursor.fetchall()
    conn.close()

    categories = [dict(row) for row in rows]
    return jsonify({'categories': categories})

# --------------------------
# PRODUCT ENDPOINTS
# --------------------------
@app.route('/api/products', methods=['GET'])
def get_products():
    category_id = request.args.get('category', type=int)
    search_query = request.args.get('search', type=str)
    sort_by = request.args.get('sort', type=str, default='newest')

    query = '''
        SELECT p.*, c.name as category_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    '''
    params = []

    if category_id:
        query += " AND p.category_id = ?"
        params.append(category_id)

    if search_query:
        query += " AND (p.name LIKE ? OR p.description LIKE ?)"
        search_param = f"%{search_query}%"
        params.extend([search_param, search_param])

    if sort_by == 'price_asc':
        query += " ORDER BY p.price ASC"
    elif sort_by == 'price_desc':
        query += " ORDER BY p.price DESC"
    elif sort_by == 'rating':
        query += " ORDER BY p.rating DESC"
    else:
        query += " ORDER BY p.created_at DESC"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    products = [dict(row) for row in rows]
    return jsonify({'products': products})

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = ?
    ''', (product_id,))
    product = cursor.fetchone()

    if not product:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404

    cursor.execute('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', (product_id,))
    reviews = [dict(r) for r in cursor.fetchall()]

    conn.close()
    p_dict = dict(product)
    p_dict['reviews'] = reviews
    return jsonify({'product': p_dict})

@app.route('/api/products', methods=['POST'])
@admin_required
def create_product():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    description = data.get('description', '').strip()
    price = float(data.get('price', 0))
    stock = int(data.get('stock', 0))
    category_id = int(data.get('category_id', 1))
    image_url = data.get('image_url', '').strip()

    if not name or price <= 0:
        return jsonify({'error': 'Valid product name and price are required.'}), 400

    if not image_url:
        image_url = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO products (name, description, price, stock, category_id, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (name, description, price, stock, category_id, image_url))
    product_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({'message': 'Product created successfully', 'product_id': product_id}), 201

@app.route('/api/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    data = request.get_json() or {}
    name = data.get('name')
    description = data.get('description')
    price = data.get('price')
    stock = data.get('stock')
    category_id = data.get('category_id')
    image_url = data.get('image_url')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM products WHERE id = ?', (product_id,))
    product = cursor.fetchone()

    if not product:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404

    cursor.execute('''
        UPDATE products 
        SET name = COALESCE(?, name),
            description = COALESCE(?, description),
            price = COALESCE(?, price),
            stock = COALESCE(?, stock),
            category_id = COALESCE(?, category_id),
            image_url = COALESCE(?, image_url)
        WHERE id = ?
    ''', (name, description, price, stock, category_id, image_url, product_id))

    conn.commit()
    conn.close()
    return jsonify({'message': 'Product updated successfully'})

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM products WHERE id = ?', (product_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Product deleted successfully'})

@app.route('/api/products/<int:product_id>/reviews', methods=['POST'])
@login_required
def add_review(product_id):
    data = request.get_json() or {}
    rating = int(data.get('rating', 5))
    comment = data.get('comment', '').strip()

    if rating < 1 or rating > 5 or not comment:
        return jsonify({'error': 'Valid rating (1-5) and comment required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO reviews (product_id, user_id, user_name, rating, comment)
        VALUES (?, ?, ?, ?, ?)
    ''', (product_id, session['user_id'], session['name'], rating, comment))

    # Recalculate product rating
    cursor.execute('''
        SELECT AVG(rating) as avg_rating, COUNT(*) as count 
        FROM reviews WHERE product_id = ?
    ''', (product_id,))
    res = cursor.fetchone()
    avg_rating = round(res['avg_rating'], 1)
    count = res['count']

    cursor.execute('''
        UPDATE products SET rating = ?, review_count = ? WHERE id = ?
    ''', (avg_rating, count, product_id))

    conn.commit()
    conn.close()
    return jsonify({'message': 'Review added successfully'})

# --------------------------
# CART ENDPOINTS
# --------------------------
@app.route('/api/cart', methods=['GET'])
@login_required
def get_cart():
    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT c.id as cart_item_id, c.quantity, p.* 
        FROM cart c 
        JOIN products p ON c.product_id = p.id 
        WHERE c.user_id = ?
    ''', (user_id,))
    items = [dict(row) for row in cursor.fetchall()]
    conn.close()

    total_amount = sum(item['price'] * item['quantity'] for item in items)
    return jsonify({
        'items': items,
        'total_items': sum(item['quantity'] for item in items),
        'subtotal': round(total_amount, 2)
    })

@app.route('/api/cart/add', methods=['POST'])
@login_required
def add_to_cart():
    data = request.get_json() or {}
    product_id = data.get('product_id')
    quantity = int(data.get('quantity', 1))

    if not product_id or quantity <= 0:
        return jsonify({'error': 'Invalid product or quantity'}), 400

    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT stock FROM products WHERE id = ?', (product_id,))
    prod = cursor.fetchone()
    if not prod:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404

    if prod['stock'] < quantity:
        conn.close()
        return jsonify({'error': f'Only {prod["stock"]} units available in stock.'}), 400

    cursor.execute('SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?', (user_id, product_id))
    existing = cursor.fetchone()

    if existing:
        new_qty = existing['quantity'] + quantity
        cursor.execute('UPDATE cart SET quantity = ? WHERE id = ?', (new_qty, existing['id']))
    else:
        cursor.execute('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', (user_id, product_id, quantity))

    conn.commit()
    conn.close()
    return jsonify({'message': 'Added to cart successfully'})

@app.route('/api/cart/update', methods=['PUT'])
@login_required
def update_cart_item():
    data = request.get_json() or {}
    cart_item_id = data.get('cart_item_id')
    quantity = int(data.get('quantity', 1))

    conn = get_db_connection()
    cursor = conn.cursor()

    if quantity <= 0:
        cursor.execute('DELETE FROM cart WHERE id = ? AND user_id = ?', (cart_item_id, session['user_id']))
    else:
        cursor.execute('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', (quantity, cart_item_id, session['user_id']))

    conn.commit()
    conn.close()
    return jsonify({'message': 'Cart updated'})

@app.route('/api/cart/remove/<int:cart_item_id>', methods=['DELETE'])
@login_required
def remove_from_cart(cart_item_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM cart WHERE id = ? AND user_id = ?', (cart_item_id, session['user_id']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Item removed from cart'})

@app.route('/api/cart/clear', methods=['DELETE'])
@login_required
def clear_cart():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM cart WHERE user_id = ?', (session['user_id'],))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Cart cleared'})

# --------------------------
# ORDER & CHECKOUT ENDPOINTS
# --------------------------
@app.route('/api/orders/checkout', methods=['POST'])
@login_required
def checkout():
    data = request.get_json() or {}
    shipping_address = data.get('shipping_address', '').strip()
    payment_method = data.get('payment_method', 'Credit Card').strip()

    if not shipping_address:
        return jsonify({'error': 'Shipping address is required'}), 400

    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get cart items
    cursor.execute('''
        SELECT c.quantity, p.id as product_id, p.name, p.price, p.stock 
        FROM cart c 
        JOIN products p ON c.product_id = p.id 
        WHERE c.user_id = ?
    ''', (user_id,))
    cart_items = cursor.fetchall()

    if not cart_items:
        conn.close()
        return jsonify({'error': 'Your shopping cart is empty'}), 400

    # Verify stock & calculate total
    total_amount = 0
    for item in cart_items:
        if item['stock'] < item['quantity']:
            conn.close()
            return jsonify({'error': f'Not enough stock for product "{item["name"]}"'}), 400
        total_amount += item['price'] * item['quantity']

    tracking_num = generate_tracking_number()

    # Create Order
    cursor.execute('''
        INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, order_status, tracking_number)
        VALUES (?, ?, ?, ?, 'Pending', ?)
    ''', (user_id, round(total_amount, 2), shipping_address, payment_method, tracking_num))
    order_id = cursor.lastrowid

    # Create Order Items and decrease stock
    for item in cart_items:
        cursor.execute('''
            INSERT INTO order_items (order_id, product_id, quantity, unit_price)
            VALUES (?, ?, ?, ?)
        ''', (order_id, item['product_id'], item['quantity'], item['price']))

        cursor.execute('''
            UPDATE products SET stock = stock - ? WHERE id = ?
        ''', (item['quantity'], item['product_id']))

    # Clear user's cart
    cursor.execute('DELETE FROM cart WHERE user_id = ?', (user_id,))

    conn.commit()
    conn.close()

    return jsonify({
        'message': 'Order placed successfully!',
        'order_id': order_id,
        'tracking_number': tracking_num,
        'total_amount': round(total_amount, 2)
    }), 201

@app.route('/api/orders', methods=['GET'])
@login_required
def get_orders():
    user_id = session['user_id']
    role = session.get('role')

    conn = get_db_connection()
    cursor = conn.cursor()

    if role == 'admin':
        cursor.execute('''
            SELECT o.*, u.name as customer_name, u.email as customer_email 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        ''')
    else:
        cursor.execute('''
            SELECT o.*, u.name as customer_name, u.email as customer_email 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            WHERE o.user_id = ? 
            ORDER BY o.created_at DESC
        ''', (user_id,))

    rows = cursor.fetchall()
    orders = []

    for row in rows:
        order_dict = dict(row)
        cursor.execute('''
            SELECT oi.*, p.name as product_name, p.image_url 
            FROM order_items oi 
            LEFT JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = ?
        ''', (order_dict['id'],))
        order_dict['items'] = [dict(i) for i in cursor.fetchall()]
        orders.append(order_dict)

    conn.close()
    return jsonify({'orders': orders})

@app.route('/api/orders/<int:order_id>', methods=['GET'])
@login_required
def get_order_by_id(order_id):
    user_id = session['user_id']
    role = session.get('role')

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT o.*, u.name as customer_name, u.email as customer_email 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        WHERE o.id = ?
    ''', (order_id,))
    order = cursor.fetchone()

    if not order:
        conn.close()
        return jsonify({'error': 'Order not found'}), 404

    # Check permission
    if role != 'admin' and order['user_id'] != user_id:
        conn.close()
        return jsonify({'error': 'Unauthorized view access'}), 403

    order_dict = dict(order)
    cursor.execute('''
        SELECT oi.*, p.name as product_name, p.image_url 
        FROM order_items oi 
        LEFT JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
    ''', (order_id,))
    order_dict['items'] = [dict(i) for i in cursor.fetchall()]

    conn.close()
    return jsonify({'order': order_dict})

@app.route('/api/orders/track/<string:tracking_number>', methods=['GET'])
def track_order(tracking_number):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT o.*, u.name as customer_name 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        WHERE o.tracking_number = ?
    ''', (tracking_number.strip(),))
    order = cursor.fetchone()

    if not order:
        conn.close()
        return jsonify({'error': 'Tracking number not found'}), 404

    order_dict = dict(order)
    cursor.execute('''
        SELECT oi.*, p.name as product_name, p.image_url 
        FROM order_items oi 
        LEFT JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
    ''', (order_dict['id'],))
    order_dict['items'] = [dict(i) for i in cursor.fetchall()]

    conn.close()
    return jsonify({'order': order_dict})

@app.route('/api/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    data = request.get_json() or {}
    new_status = data.get('status')
    valid_statuses = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled']

    if new_status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Must be one of {valid_statuses}'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE orders 
        SET order_status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    ''', (new_status, order_id))
    conn.commit()
    conn.close()

    return jsonify({'message': f'Order #{order_id} status updated to "{new_status}"'})

# --------------------------
# ADMIN STATS ENDPOINT
# --------------------------
@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def admin_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE order_status != 'Cancelled'")
    total_revenue = cursor.fetchone()['total_revenue']

    cursor.execute("SELECT COUNT(*) as total_orders FROM orders")
    total_orders = cursor.fetchone()['total_orders']

    cursor.execute("SELECT COUNT(*) as total_products FROM products")
    total_products = cursor.fetchone()['total_products']

    cursor.execute("SELECT COUNT(*) as total_customers FROM users WHERE role = 'customer'")
    total_customers = cursor.fetchone()['total_customers']

    cursor.execute("SELECT * FROM products WHERE stock < 10 ORDER BY stock ASC LIMIT 5")
    low_stock_products = [dict(r) for r in cursor.fetchall()]

    cursor.execute('''
        SELECT o.*, u.name as customer_name 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC LIMIT 5
    ''')
    recent_orders = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return jsonify({
        'stats': {
            'total_revenue': round(total_revenue, 2),
            'total_orders': total_orders,
            'total_products': total_products,
            'total_customers': total_customers,
            'low_stock_products': low_stock_products,
            'recent_orders': recent_orders
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
