/**
 * API Service wrapper for E-Commerce Backend Endpoints
 * Supports both Flask Backend API and standalone client-side LocalStorage Engine for GitHub Pages deployment.
 */

// LocalStorage Mock Engine for Static Deployment (GitHub Pages)
const MockStore = {
    init() {
        if (!localStorage.getItem('ns_initialized')) {
            const categories = [
                { id: 1, name: 'Electronics', description: 'Gadgets, devices, audio and smart home tech', icon: 'bi-laptop', product_count: 4 },
                { id: 2, name: 'Fashion & Apparel', description: 'Clothing, footwear, and stylish accessories', icon: 'bi-bag', product_count: 2 },
                { id: 3, name: 'Home & Living', description: 'Furniture, kitchenware, and home decor items', icon: 'bi-house-heart', product_count: 2 },
                { id: 4, name: 'Books & Stationery', description: 'Best-selling books, notebooks and desk supplies', icon: 'bi-book', product_count: 1 }
            ];

            const products = [
                { id: 1, name: 'Pro Noise-Canceling Wireless Headphones', description: 'Experience crystal clear sound with Active Noise Cancellation (ANC), 40-hour battery life, and ergonomic memory foam ear cushions.', price: 199.99, stock: 45, category_id: 1, category_name: 'Electronics', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', rating: 4.8, review_count: 24, created_at: new Date().toISOString() },
                { id: 2, name: 'Ultra HD Smart Watch Series 7', description: 'Track your health, heart rate, sleep metrics, and receive instant phone notifications on a vibrant AMOLED display.', price: 149.50, stock: 30, category_id: 1, category_name: 'Electronics', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', rating: 4.7, review_count: 18, created_at: new Date().toISOString() },
                { id: 3, name: 'RGB Mechanical Gaming Keyboard', description: 'Tactile mechanical switches, customizable per-key RGB backlighting, and durable aluminum top frame built for speed.', price: 89.99, stock: 60, category_id: 1, category_name: 'Electronics', image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', rating: 4.6, review_count: 15, created_at: new Date().toISOString() },
                { id: 4, name: 'Ergonomic Wireless Mouse', description: 'Dual Bluetooth & 2.4GHz wireless connectivity, quiet clicking mechanism, and precision optical tracking.', price: 39.99, stock: 100, category_id: 1, category_name: 'Electronics', image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80', rating: 4.5, review_count: 32, created_at: new Date().toISOString() },
                { id: 5, name: 'Classic Leather Biker Jacket', description: 'Handcrafted 100% genuine leather jacket with asymmetric zip closure and premium internal lining for timeless style.', price: 179.00, stock: 20, category_id: 2, category_name: 'Fashion & Apparel', image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80', rating: 4.9, review_count: 40, created_at: new Date().toISOString() },
                { id: 6, name: 'Minimalist Canvas Sneaker', description: 'Breathable canvas upper with reinforced vulcanized rubber sole. Light, durable, and suitable for all-day comfort.', price: 59.99, stock: 80, category_id: 2, category_name: 'Fashion & Apparel', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80', rating: 4.4, review_count: 12, created_at: new Date().toISOString() },
                { id: 7, name: 'Stainless Steel Pour-Over Coffee Maker', description: 'Brew barista-quality coffee at home with double-mesh stainless filter and heat-resistant borosilicate glass carafe.', price: 42.50, stock: 35, category_id: 3, category_name: 'Home & Living', image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80', rating: 4.7, review_count: 29, created_at: new Date().toISOString() },
                { id: 8, name: 'Modern Velvet Desk Chair', description: 'Soft velvet upholstery, 360-degree swivel, height adjustable with golden metal base for elegant home office setups.', price: 129.99, stock: 15, category_id: 3, category_name: 'Home & Living', image_url: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=800&auto=format&fit=crop&q=80', rating: 4.6, review_count: 19, created_at: new Date().toISOString() },
                { id: 9, name: 'Hardcover Productivity Planner', description: 'Undated daily & weekly layout with goal-setting templates, habit trackers, and premium 120gsm bleed-proof paper.', price: 24.99, stock: 120, category_id: 4, category_name: 'Books & Stationery', image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80', rating: 4.9, review_count: 55, created_at: new Date().toISOString() }
            ];

            const users = [
                { id: 1, name: 'Store Admin', email: 'admin@store.com', role: 'admin' },
                { id: 2, name: 'John Doe', email: 'user@store.com', role: 'customer' }
            ];

            const orders = [
                {
                    id: 1, user_id: 2, customer_name: 'John Doe', customer_email: 'user@store.com',
                    total_amount: 249.98, shipping_address: '123 Tech Park Ave, Suite 400, San Francisco, CA 94107',
                    payment_method: 'Credit Card', payment_status: 'Paid', order_status: 'Delivered',
                    tracking_number: 'TRK-98421054', created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
                    items: [
                        { id: 1, product_id: 1, product_name: 'Pro Noise-Canceling Wireless Headphones', quantity: 1, unit_price: 199.99, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' },
                        { id: 2, product_id: 7, product_name: 'Stainless Steel Pour-Over Coffee Maker', quantity: 1, unit_price: 42.50, image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80' }
                    ]
                },
                {
                    id: 2, user_id: 2, customer_name: 'John Doe', customer_email: 'user@store.com',
                    total_amount: 149.50, shipping_address: '123 Tech Park Ave, Suite 400, San Francisco, CA 94107',
                    payment_method: 'UPI / Net Banking', payment_status: 'Paid', order_status: 'Shipped',
                    tracking_number: 'TRK-67319204', created_at: new Date(Date.now() - 86400000).toISOString(),
                    items: [
                        { id: 3, product_id: 2, product_name: 'Ultra HD Smart Watch Series 7', quantity: 1, unit_price: 149.50, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' }
                    ]
                }
            ];

            localStorage.setItem('ns_categories', JSON.stringify(categories));
            localStorage.setItem('ns_products', JSON.stringify(products));
            localStorage.setItem('ns_users', JSON.stringify(users));
            localStorage.setItem('ns_orders', JSON.stringify(orders));
            localStorage.setItem('ns_cart', JSON.stringify([]));
            localStorage.setItem('ns_reviews', JSON.stringify([]));
            localStorage.setItem('ns_initialized', 'true');
        }
    },

    get(key) {
        MockStore.init();
        return JSON.parse(localStorage.getItem(key) || '[]');
    },

    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('ns_session') || 'null');
    }
};

const API = {
    useMock: false,

    async fetchOrMock(url, options = {}) {
        if (API.useMock) return null;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1200);
            const res = await fetch(url, { signal: controller.signal, ...options });
            clearTimeout(timeoutId);
            return res;
        } catch (e) {
            API.useMock = true; // Switch to mock mode on static host
            console.log('Backend server unreachable. Switching to in-browser LocalStorage engine.');
            return null;
        }
    },

    // Auth APIs
    async me() {
        const res = await API.fetchOrMock('/api/auth/me');
        if (res) return await res.json();

        // Mock Fallback
        const user = MockStore.getCurrentUser();
        return { user };
    },

    async login(email, password) {
        const res = await API.fetchOrMock('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (res) {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            return data;
        }

        // Mock Fallback
        const users = MockStore.get('ns_users');
        const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user) throw new Error('Invalid email or password.');

        localStorage.setItem('ns_session', JSON.stringify(user));
        return { message: 'Login successful', user };
    },

    async register(name, email, password, role) {
        const res = await API.fetchOrMock('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        if (res) {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            return data;
        }

        // Mock Fallback
        const users = MockStore.get('ns_users');
        if (users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
            throw new Error('Email is already registered.');
        }

        const newUser = { id: Date.now(), name, email, role: role === 'admin' ? 'admin' : 'customer' };
        users.push(newUser);
        MockStore.set('ns_users', users);
        localStorage.setItem('ns_session', JSON.stringify(newUser));
        return { message: 'Registration successful', user: newUser };
    },

    async logout() {
        const res = await API.fetchOrMock('/api/auth/logout', { method: 'POST' });
        if (res) return await res.json();

        // Mock Fallback
        localStorage.removeItem('ns_session');
        return { message: 'Logged out' };
    },

    // Category APIs
    async getCategories() {
        const res = await API.fetchOrMock('/api/categories');
        if (res) return await res.json();

        // Mock Fallback
        const categories = MockStore.get('ns_categories');
        const products = MockStore.get('ns_products');
        categories.forEach(c => {
            c.product_count = products.filter(p => p.category_id === c.id).length;
        });
        return { categories };
    },

    // Product APIs
    async getProducts(params = {}) {
        const query = new URLSearchParams(params).toString();
        const res = await API.fetchOrMock(`/api/products?${query}`);
        if (res) return await res.json();

        // Mock Fallback
        let products = MockStore.get('ns_products');
        if (params.category) {
            products = products.filter(p => p.category_id === parseInt(params.category));
        }
        if (params.search) {
            const q = params.search.toLowerCase();
            products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
        }
        if (params.sort === 'price_asc') products.sort((a, b) => a.price - b.price);
        else if (params.sort === 'price_desc') products.sort((a, b) => b.price - a.price);
        else if (params.sort === 'rating') products.sort((a, b) => b.rating - a.rating);

        return { products };
    },

    async getProductDetail(id) {
        const res = await API.fetchOrMock(`/api/products/${id}`);
        if (res) {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Product not found');
            return data.product;
        }

        // Mock Fallback
        const products = MockStore.get('ns_products');
        const product = products.find(p => p.id === parseInt(id));
        if (!product) throw new Error('Product not found');

        const reviews = MockStore.get('ns_reviews').filter(r => r.product_id === parseInt(id));
        return { ...product, reviews };
    },

    async createProduct(productData) {
        const res = await API.fetchOrMock('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        if (res) {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create product');
            return data;
        }

        // Mock Fallback
        const products = MockStore.get('ns_products');
        const categories = MockStore.get('ns_categories');
        const cat = categories.find(c => c.id === parseInt(productData.category_id));

        const newProd = {
            id: Date.now(),
            name: productData.name,
            description: productData.description,
            price: parseFloat(productData.price),
            stock: parseInt(productData.stock),
            category_id: parseInt(productData.category_id),
            category_name: cat ? cat.name : 'General',
            image_url: productData.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
            rating: 5.0,
            review_count: 0,
            created_at: new Date().toISOString()
        };
        products.unshift(newProd);
        MockStore.set('ns_products', products);
        return { message: 'Product created', product_id: newProd.id };
    },

    async updateProduct(id, productData) {
        const res = await API.fetchOrMock(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        if (res) {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update product');
            return data;
        }

        // Mock Fallback
        const products = MockStore.get('ns_products');
        const idx = products.findIndex(p => p.id === parseInt(id));
        if (idx !== -1) {
            products[idx] = { ...products[idx], ...productData };
            MockStore.set('ns_products', products);
        }
        return { message: 'Product updated' };
    },

    async deleteProduct(id) {
        const res = await API.fetchOrMock(`/api/products/${id}`, { method: 'DELETE' });
        if (res) return await res.json();

        // Mock Fallback
        let products = MockStore.get('ns_products');
        products = products.filter(p => p.id !== parseInt(id));
        MockStore.set('ns_products', products);
        return { message: 'Product deleted' };
    },

    async addReview(productId, rating, comment) {
        const res = await API.fetchOrMock(`/api/products/${productId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating, comment })
        });
        if (res) return await res.json();

        // Mock Fallback
        const user = MockStore.getCurrentUser();
        const reviews = MockStore.get('ns_reviews');
        reviews.unshift({
            id: Date.now(),
            product_id: parseInt(productId),
            user_name: user ? user.name : 'Anonymous',
            rating: parseInt(rating),
            comment,
            created_at: new Date().toISOString()
        });
        MockStore.set('ns_reviews', reviews);
        return { message: 'Review added' };
    },

    // Cart APIs
    async getCart() {
        const res = await API.fetchOrMock('/api/cart');
        if (res) {
            if (res.status === 401) return { items: [], total_items: 0, subtotal: 0 };
            return await res.json();
        }

        // Mock Fallback
        const user = MockStore.getCurrentUser();
        if (!user) return { items: [], total_items: 0, subtotal: 0 };

        const cart = MockStore.get('ns_cart');
        const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
        const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        return { items: cart, total_items: totalItems, subtotal: Math.round(subtotal * 100) / 100 };
    },

    async addToCart(productId, quantity = 1) {
        const res = await API.fetchOrMock('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity })
        });
        if (res) return await res.json();

        // Mock Fallback
        const products = MockStore.get('ns_products');
        const prod = products.find(p => p.id === parseInt(productId));
        if (!prod) throw new Error('Product not found');

        const cart = MockStore.get('ns_cart');
        const existing = cart.find(c => c.product_id === parseInt(productId));
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({
                cart_item_id: Date.now(),
                product_id: prod.id,
                name: prod.name,
                price: prod.price,
                image_url: prod.image_url,
                quantity: quantity
            });
        }
        MockStore.set('ns_cart', cart);
        return { message: 'Added to cart' };
    },

    async updateCartItem(cartItemId, quantity) {
        const res = await API.fetchOrMock('/api/cart/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart_item_id: cartItemId, quantity })
        });
        if (res) return await res.json();

        // Mock Fallback
        let cart = MockStore.get('ns_cart');
        if (quantity <= 0) {
            cart = cart.filter(c => c.cart_item_id !== cartItemId);
        } else {
            const item = cart.find(c => c.cart_item_id === cartItemId);
            if (item) item.quantity = quantity;
        }
        MockStore.set('ns_cart', cart);
        return { message: 'Cart updated' };
    },

    async removeFromCart(cartItemId) {
        const res = await API.fetchOrMock(`/api/cart/remove/${cartItemId}`, { method: 'DELETE' });
        if (res) return await res.json();

        // Mock Fallback
        let cart = MockStore.get('ns_cart');
        cart = cart.filter(c => c.cart_item_id !== cartItemId);
        MockStore.set('ns_cart', cart);
        return { message: 'Item removed' };
    },

    async clearCart() {
        const res = await API.fetchOrMock('/api/cart/clear', { method: 'DELETE' });
        if (res) return await res.json();

        // Mock Fallback
        MockStore.set('ns_cart', []);
        return { message: 'Cart cleared' };
    },

    // Order & Tracking APIs
    async checkout(shippingAddress, paymentMethod) {
        const res = await API.fetchOrMock('/api/orders/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shipping_address: shippingAddress, payment_method: paymentMethod })
        });
        if (res) return await res.json();

        // Mock Fallback
        const user = MockStore.getCurrentUser();
        const cart = MockStore.get('ns_cart');
        if (cart.length === 0) throw new Error('Cart is empty');

        const totalAmount = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const trackingNum = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;

        const newOrder = {
            id: Date.now(),
            user_id: user ? user.id : 2,
            customer_name: user ? user.name : 'Customer',
            customer_email: user ? user.email : 'user@store.com',
            total_amount: Math.round(totalAmount * 100) / 100,
            shipping_address: shippingAddress,
            payment_method: paymentMethod,
            payment_status: 'Paid',
            order_status: 'Pending',
            tracking_number: trackingNum,
            created_at: new Date().toISOString(),
            items: cart.map(item => ({
                id: Date.now() + Math.random(),
                product_id: item.product_id,
                product_name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
                image_url: item.image_url
            }))
        };

        const orders = MockStore.get('ns_orders');
        orders.unshift(newOrder);
        MockStore.set('ns_orders', orders);
        MockStore.set('ns_cart', []);

        return {
            message: 'Order placed successfully!',
            order_id: newOrder.id,
            tracking_number: trackingNum,
            total_amount: newOrder.total_amount
        };
    },

    async getOrders() {
        const res = await API.fetchOrMock('/api/orders');
        if (res) return (await res.json()).orders;

        // Mock Fallback
        const user = MockStore.getCurrentUser();
        const orders = MockStore.get('ns_orders');
        if (user && user.role === 'admin') return orders;
        return orders.filter(o => !user || o.user_id === user.id);
    },

    async trackOrder(trackingNumber) {
        const res = await API.fetchOrMock(`/api/orders/track/${encodeURIComponent(trackingNumber)}`);
        if (res) {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Tracking number not found');
            return data.order;
        }

        // Mock Fallback
        const orders = MockStore.get('ns_orders');
        const order = orders.find(o => o.tracking_number.trim().toUpperCase() === trackingNumber.trim().toUpperCase());
        if (!order) throw new Error('Tracking number not found');
        return order;
    },

    async updateOrderStatus(orderId, status) {
        const res = await API.fetchOrMock(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (res) return await res.json();

        // Mock Fallback
        const orders = MockStore.get('ns_orders');
        const order = orders.find(o => o.id === parseInt(orderId));
        if (order) {
            order.order_status = status;
            MockStore.set('ns_orders', orders);
        }
        return { message: `Order status updated to ${status}` };
    },

    // Admin Stats API
    async getAdminStats() {
        const res = await API.fetchOrMock('/api/admin/stats');
        if (res) return (await res.json()).stats;

        // Mock Fallback
        const orders = MockStore.get('ns_orders');
        const products = MockStore.get('ns_products');
        const users = MockStore.get('ns_users');

        const totalRevenue = orders.reduce((sum, o) => o.order_status !== 'Cancelled' ? sum + o.total_amount : sum, 0);
        return {
            total_revenue: Math.round(totalRevenue * 100) / 100,
            total_orders: orders.length,
            total_products: products.length,
            total_customers: users.filter(u => u.role === 'customer').length,
            low_stock_products: products.filter(p => p.stock < 10),
            recent_orders: orders.slice(0, 5)
        };
    }
};
