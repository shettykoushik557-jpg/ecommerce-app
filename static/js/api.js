/**
 * API Service wrapper for E-Commerce Backend Endpoints
 */
const API = {
    // Auth APIs
    async me() {
        const res = await fetch('/api/auth/me');
        return await res.json();
    },

    async login(email, password) {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        return data;
    },

    async register(name, email, password, role) {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        return data;
    },

    async logout() {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        return await res.json();
    },

    // Category APIs
    async getCategories() {
        const res = await fetch('/api/categories');
        return await res.json();
    },

    // Product APIs
    async getProducts(params = {}) {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`/api/products?${query}`);
        return await res.json();
    },

    async getProductDetail(id) {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Product not found');
        return data.product;
    },

    async createProduct(productData) {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create product');
        return data;
    },

    async updateProduct(id, productData) {
        const res = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update product');
        return data;
    },

    async deleteProduct(id) {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete product');
        return data;
    },

    async addReview(productId, rating, comment) {
        const res = await fetch(`/api/products/${productId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating, comment })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to submit review');
        return data;
    },

    // Cart APIs
    async getCart() {
        const res = await fetch('/api/cart');
        if (res.status === 401) return { items: [], total_items: 0, subtotal: 0 };
        return await res.json();
    },

    async addToCart(productId, quantity = 1) {
        const res = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add item to cart');
        return data;
    },

    async updateCartItem(cartItemId, quantity) {
        const res = await fetch('/api/cart/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart_item_id: cartItemId, quantity })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update cart');
        return data;
    },

    async removeFromCart(cartItemId) {
        const res = await fetch(`/api/cart/remove/${cartItemId}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to remove item');
        return data;
    },

    async clearCart() {
        const res = await fetch('/api/cart/clear', { method: 'DELETE' });
        return await res.json();
    },

    // Order & Tracking APIs
    async checkout(shippingAddress, paymentMethod) {
        const res = await fetch('/api/orders/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shipping_address: shippingAddress, payment_method: paymentMethod })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Checkout failed');
        return data;
    },

    async getOrders() {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
        return data.orders;
    },

    async trackOrder(trackingNumber) {
        const res = await fetch(`/api/orders/track/${encodeURIComponent(trackingNumber)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Tracking number not found');
        return data.order;
    },

    async updateOrderStatus(orderId, status) {
        const res = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update order status');
        return data;
    },

    // Admin Stats API
    async getAdminStats() {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch admin stats');
        return data.stats;
    }
};
