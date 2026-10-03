/**
 * Main Application Logic & Event Controller
 */

// Global State Object
const state = {
    user: null,
    categories: [],
    products: [],
    cart: { items: [], total_items: 0, subtotal: 0 },
    currentCategory: null,
    searchQuery: '',
    sortBy: 'newest',
    activeSection: 'catalog-section'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    await checkAuth();
    await loadCategories();
    await loadProducts();
    await reloadCart();
});

// Theme Toggle Handling (Dark / Light)
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);

    document.getElementById('themeToggleBtn').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-bs-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-bs-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    });
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (theme === 'dark') {
        icon.className = 'bi bi-sun-fill text-warning';
    } else {
        icon.className = 'bi bi-moon-stars-fill';
    }
}

// Check Authentication Status
async function checkAuth() {
    try {
        const data = await API.me();
        state.user = data.user;
        renderAuthUI();
    } catch (err) {
        state.user = null;
        renderAuthUI();
    }
}

function renderAuthUI() {
    const container = document.getElementById('authContainer');
    const adminNav = document.getElementById('navAdmin');

    if (state.user) {
        if (state.user.role === 'admin') {
            adminNav.classList.remove('d-none');
        } else {
            adminNav.classList.add('d-none');
        }

        container.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-secondary rounded-pill dropdown-toggle d-flex align-items-center gap-2 px-3 fw-semibold" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle text-primary fs-5"></i>
                    <span>${state.user.name}</span>
                    <span class="badge ${state.user.role === 'admin' ? 'bg-danger' : 'bg-primary'} rounded-pill small ms-1">${state.user.role}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                    <li><h6 class="dropdown-header">Signed in as <strong>${state.user.email}</strong></h6></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item fw-semibold" href="#" onclick="showSection('user-orders-section'); return false;"><i class="bi bi-bag-check me-2"></i> My Orders</a></li>
                    ${state.user.role === 'admin' ? `<li><a class="dropdown-item text-primary fw-semibold" href="#" onclick="showSection('admin-section'); return false;"><i class="bi bi-speedometer2 me-2"></i> Admin Console</a></li>` : ''}
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger fw-semibold" href="#" onclick="handleLogout()"><i class="bi bi-box-arrow-right me-2"></i> Sign Out</a></li>
                </ul>
            </div>
        `;
    } else {
        adminNav.classList.add('d-none');
        container.innerHTML = `
            <button class="btn btn-outline-primary rounded-pill fw-bold px-3" onclick="openAuthModal('login')">
                <i class="bi bi-person me-1"></i> Sign In / Register
            </button>
        `;
    }
}

// Navigation Section Switcher
function showSection(sectionId) {
    state.activeSection = sectionId;
    const sections = ['catalog-section', 'user-orders-section', 'track-section', 'admin-section'];
    sections.forEach(sec => {
        const el = document.getElementById(sec);
        if (sec === sectionId) {
            el.classList.remove('d-none');
        } else {
            el.classList.add('d-none');
        }
    });

    if (sectionId === 'user-orders-section') {
        loadUserOrders();
    } else if (sectionId === 'admin-section') {
        loadAdminConsole();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load Categories & Products Data
async function loadCategories() {
    try {
        const data = await API.getCategories();
        state.categories = data.categories;
        UI.renderCategories(state.categories, state.currentCategory, filterByCategory);

        // Populate Admin product modal select
        const catSelect = document.getElementById('pfCategory');
        catSelect.innerHTML = state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch (err) {
        console.error('Failed to load categories', err);
    }
}

async function loadProducts() {
    try {
        const params = {
            sort: state.sortBy
        };
        if (state.currentCategory) params.category = state.currentCategory;
        if (state.searchQuery) params.search = state.searchQuery;

        const data = await API.getProducts(params);
        state.products = data.products;
        UI.renderProducts(state.products);
    } catch (err) {
        console.error('Failed to load products', err);
    }
}

// Filtering & Sorting
function filterByCategory(categoryId, btnEl) {
    state.currentCategory = categoryId;
    UI.renderCategories(state.categories, state.currentCategory, filterByCategory);
    loadProducts();
}

function handleSearch(e) {
    e.preventDefault();
    const input = document.getElementById('searchInput');
    state.searchQuery = input.value.trim();

    const alertEl = document.getElementById('searchFilterAlert');
    const queryEl = document.getElementById('activeSearchQuery');

    if (state.searchQuery) {
        queryEl.textContent = state.searchQuery;
        alertEl.classList.remove('d-none');
    } else {
        alertEl.classList.add('d-none');
    }

    showSection('catalog-section');
    loadProducts();
}

function clearSearchFilter() {
    state.searchQuery = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('searchFilterAlert').classList.add('d-none');
    loadProducts();
}

function applySort(sortKey, sortLabel) {
    state.sortBy = sortKey;
    document.getElementById('currentSortText').textContent = sortLabel;
    loadProducts();
}

// Cart Management
async function reloadCart() {
    try {
        const data = await API.getCart();
        state.cart = data;
        UI.renderCart(state.cart);
    } catch (err) {
        console.error('Failed to load cart', err);
    }
}

async function handleAddToCart(productId, event) {
    if (event) event.stopPropagation();
    if (!state.user) {
        UI.showToast('Please sign in to add items to your cart.', false);
        openAuthModal('login');
        return;
    }

    try {
        await API.addToCart(productId, 1);
        await reloadCart();
        UI.showToast('Item added to cart!');
    } catch (err) {
        UI.showToast(err.message, false);
    }
}

async function updateCartItemQty(cartItemId, quantity) {
    try {
        await API.updateCartItem(cartItemId, quantity);
        await reloadCart();
    } catch (err) {
        UI.showToast(err.message, false);
    }
}

async function removeCartItem(cartItemId) {
    try {
        await API.removeFromCart(cartItemId);
        await reloadCart();
        UI.showToast('Item removed from cart.');
    } catch (err) {
        UI.showToast(err.message, false);
    }
}

async function clearCart() {
    try {
        await API.clearCart();
        await reloadCart();
        UI.showToast('Cart cleared.');
    } catch (err) {
        UI.showToast(err.message, false);
    }
}

function openCartDrawer() {
    const offcanvasEl = document.getElementById('cartDrawer');
    const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
    bsOffcanvas.show();
}

// Product Details Modal
async function openProductModal(productId) {
    try {
        const p = await API.getProductDetail(productId);
        const modalBody = document.getElementById('productModalBody');

        modalBody.innerHTML = `
            <div class="row g-0">
                <div class="col-md-6 bg-body-tertiary d-flex align-items-center justify-content-center p-4">
                    <img src="${p.image_url}" alt="${p.name}" class="img-fluid rounded-4 shadow-sm" style="max-height: 380px; object-fit: contain;">
                </div>
                <div class="col-md-6 p-4 p-md-5 d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-bold">${p.category_name}</span>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <h3 class="fw-bold mb-2">${p.name}</h3>
                    <div class="d-flex align-items-center mb-3">
                        <div class="me-2">${UI.renderStars(p.rating)}</div>
                        <span class="fw-bold me-1">${p.rating}</span>
                        <span class="text-muted small">(${p.review_count} customer reviews)</span>
                    </div>

                    <div class="fs-2 fw-extrabold text-primary mb-3">$${p.price.toFixed(2)}</div>
                    <p class="text-muted mb-4">${p.description}</p>

                    <div class="mb-4">
                        <span class="small text-muted fw-bold me-2">Availability:</span>
                        ${p.stock > 0 ? `<span class="badge bg-success-subtle text-success rounded-pill px-3 py-1"><i class="bi bi-check-circle me-1"></i> In Stock (${p.stock} units)</span>` : `<span class="badge bg-danger rounded-pill px-3 py-1">Out of Stock</span>`}
                    </div>

                    <div class="d-grid gap-2 mt-auto">
                        <button class="btn btn-primary btn-lg rounded-pill fw-bold shadow" onclick="handleAddToCart(${p.id}); bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();" ${p.stock === 0 ? 'disabled' : ''}>
                            <i class="bi bi-bag-plus-fill me-2"></i> Add to Shopping Cart
                        </button>
                    </div>

                    <!-- Reviews Accordion -->
                    <div class="accordion accordion-flush mt-4 border-top pt-3" id="reviewsAccordion">
                        <div class="accordion-item bg-transparent">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed px-0 bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#reviewsCollapse">
                                    Customer Reviews (${p.reviews ? p.reviews.length : 0})
                                </button>
                            </h2>
                            <div id="reviewsCollapse" class="accordion-collapse collapse" data-bs-parent="#reviewsAccordion">
                                <div class="accordion-body px-0 pt-3">
                                    ${state.user ? `
                                        <form onsubmit="handleReviewSubmit(event, ${p.id})" class="mb-4 p-3 border rounded-3 bg-body-tertiary">
                                            <h6 class="fw-bold mb-2">Write a Review</h6>
                                            <div class="mb-2">
                                                <select id="revRating" class="form-select form-select-sm rounded-pill fw-bold">
                                                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Excellent</option>
                                                    <option value="4">⭐⭐⭐⭐ 4 Stars - Very Good</option>
                                                    <option value="3">⭐⭐⭐ 3 Stars - Average</option>
                                                    <option value="2">⭐⭐ 2 Stars - Poor</option>
                                                    <option value="1">⭐ 1 Star - Terrible</option>
                                                </select>
                                            </div>
                                            <div class="mb-2">
                                                <textarea id="revComment" class="form-control form-control-sm" rows="2" placeholder="Share your experience with this item..." required></textarea>
                                            </div>
                                            <button type="submit" class="btn btn-primary btn-sm rounded-pill px-3 fw-bold">Submit Review</button>
                                        </form>
                                    ` : '<p class="small text-muted mb-3">Sign in to write a review.</p>'}

                                    <div class="d-flex flex-column gap-2 overflow-y-auto" style="max-height: 200px;">
                                        ${p.reviews && p.reviews.length > 0 ? p.reviews.map(r => `
                                            <div class="p-2 border-bottom">
                                                <div class="d-flex justify-content-between align-items-center mb-1">
                                                    <span class="fw-bold small">${r.user_name}</span>
                                                    <span class="small">${UI.renderStars(r.rating)}</span>
                                                </div>
                                                <p class="small text-muted m-0">${r.comment}</p>
                                            </div>
                                        `).join('') : '<p class="small text-muted">No reviews yet for this product.</p>'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    } catch (err) {
        UI.showToast(err.message, false);
    }
}

async function handleReviewSubmit(e, productId) {
    e.preventDefault();
    const rating = document.getElementById('revRating').value;
    const comment = document.getElementById('revComment').value;

    try {
        await API.addReview(productId, rating, comment);
        UI.showToast('Review submitted successfully!');
        openProductModal(productId);
        loadProducts();
    } catch (err) {
        UI.showToast(err.message, false);
    }
}

// Checkout Workflow
function openCheckoutModal() {
    if (!state.user) {
        UI.showToast('Please sign in to proceed with checkout.', false);
        openAuthModal('login');
        return;
    }

    if (state.cart.items.length === 0) {
        UI.showToast('Your cart is empty.', false);
        return;
    }

    // Populate user info if available
    document.getElementById('chkName').value = state.user.name;

    // Render items summary
    const itemsContainer = document.getElementById('checkoutSummaryItems');
    itemsContainer.innerHTML = state.cart.items.map(i => `
        <div class="d-flex justify-content-between align-items-center">
            <span class="small text-truncate me-2" style="max-width: 180px;">${i.name} (x${i.quantity})</span>
            <span class="small fw-bold">$${(i.price * i.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    document.getElementById('chkSubtotal').textContent = `$${state.cart.subtotal.toFixed(2)}`;
    document.getElementById('chkTotalPay').textContent = `$${state.cart.subtotal.toFixed(2)}`;

    // Close offcanvas drawer
    const offcanvasEl = document.getElementById('cartDrawer');
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    if (bsOffcanvas) bsOffcanvas.hide();

    const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    checkoutModal.show();
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('chkName').value;
    const address = document.getElementById('chkAddress').value;
    const city = document.getElementById('chkCity').value;
    const zip = document.getElementById('chkZip').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    const fullShippingAddress = `${name}, ${address}, ${city}, ${zip}`;

    try {
        const btn = document.getElementById('btnConfirmOrder');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Processing...';

        const res = await API.checkout(fullShippingAddress, paymentMethod);
        
        btn.disabled = false;
        btn.innerHTML = 'Complete Order <i class="bi bi-check-circle-fill ms-1"></i>';

        // Hide checkout modal
        bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();

        UI.showToast(`Order Placed! Tracking #: ${res.tracking_number}`);
        await reloadCart();

        // Redirect to track order view
        document.getElementById('trackInput').value = res.tracking_number;
        showSection('track-section');
        quickTrackOrder(res.tracking_number);
    } catch (err) {
        UI.showToast(err.message, false);
    }
}

// User Orders View
async function loadUserOrders() {
    if (!state.user) {
        showSection('catalog-section');
        openAuthModal('login');
        return;
    }

    try {
        const orders = await API.getOrders();
        UI.renderUserOrders(orders);
    } catch (err) {
        UI.showToast(err.message, false);
    }
}

// Order Tracking View
async function handleTrackSearch(e) {
    e.preventDefault();
    const trackingNum = document.getElementById('trackInput').value.trim();
    if (!trackingNum) return;
    quickTrackOrder(trackingNum);
}

async function quickTrackOrder(trackingNum) {
    const resContainer = document.getElementById('trackingResult');
    try {
        resContainer.innerHTML = '<div class="text-center py-4"><span class="spinner-border text-primary"></span></div>';
        resContainer.classList.remove('d-none');

        const order = await API.trackOrder(trackingNum);

        resContainer.innerHTML = `
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-header bg-primary text-white p-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="badge bg-white text-primary rounded-pill mb-1">Live Tracking</span>
                            <h4 class="fw-bold m-0">Tracking #${order.tracking_number}</h4>
                        </div>
                        <div>
                            ${UI.getStatusBadge(order.order_status)}
                        </div>
                    </div>
                </div>
                <div class="card-body p-4 p-md-5">
                    <div class="row g-4">
                        <div class="col-md-6 border-end-md">
                            <h6 class="fw-bold mb-3"><i class="bi bi-clock-history text-primary me-2"></i> Shipment Status Progress</h6>
                            ${UI.renderOrderTimeline(order)}
                        </div>
                        <div class="col-md-6">
                            <h6 class="fw-bold mb-3"><i class="bi bi-box-seam text-primary me-2"></i> Order Overview</h6>
                            <div class="bg-body-tertiary p-3 rounded-3 mb-3">
                                <div class="small text-muted mb-1">Customer: <strong class="text-body">${order.customer_name}</strong></div>
                                <div class="small text-muted mb-1">Order Date: <strong class="text-body">${new Date(order.created_at).toLocaleString()}</strong></div>
                                <div class="small text-muted mb-1">Payment Method: <strong class="text-body">${order.payment_method} (${order.payment_status})</strong></div>
                                <div class="small text-muted">Total Amount: <strong class="text-primary fs-6">$${order.total_amount.toFixed(2)}</strong></div>
                            </div>

                            <h6 class="fw-bold small text-muted text-uppercase mb-2">Package Items</h6>
                            <div class="d-flex flex-column gap-2 overflow-y-auto" style="max-height: 180px;">
                                ${order.items.map(i => `
                                    <div class="d-flex align-items-center gap-2 p-2 border rounded-3">
                                        <img src="${i.image_url}" style="width: 40px; height: 40px; object-fit: cover;" class="rounded-2">
                                        <div class="flex-grow-1 overflow-hidden">
                                            <div class="fw-bold small text-truncate">${i.product_name}</div>
                                            <div class="small text-muted">Qty: ${i.quantity} × $${i.unit_price.toFixed(2)}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        resContainer.innerHTML = `
            <div class="alert alert-danger rounded-4 text-center p-4">
                <i class="bi bi-exclamation-triangle-fill fs-2 mb-2 d-block"></i>
                <h5 class="fw-bold">Tracking Number Not Found</h5>
                <p class="m-0">Please double check your tracking code (e.g., TRK-98421054) and try again.</p>
            </div>
        `;
    }
}

// Admin Console Workflow
async function loadAdminConsole() {
    if (!state.user || state.user.role !== 'admin') {
        showSection('catalog-section');
        UI.showToast('Access restricted to Store Administrators.', false);
        return;
    }

    try {
        const stats = await API.getAdminStats();
        const orders = await API.getOrders();
        const prodData = await API.getProducts({});
        UI.renderAdminConsole(stats, orders, prodData.products);
    } catch (err) {
        UI.showToast(err.message, false);
    }
}

async function handleAdminStatusChange(orderId, newStatus) {
    try {
        await API.updateOrderStatus(orderId, newStatus);
        UI.showToast(`Order #${orderId} status updated to ${newStatus}`);
        loadAdminConsole();
    } catch (err) {
        UI.showToast(err.message, false);
    }
}

// Admin Product CRUD Modals
function openAddProductModal() {
    document.getElementById('productFormTitle').textContent = 'Add New Product';
    document.getElementById('pfId').value = '';
    document.getElementById('pfName').value = '';
    document.getElementById('pfPrice').value = '';
    document.getElementById('pfStock').value = '';
    document.getElementById('pfImage').value = '';
    document.getElementById('pfDescription').value = '';

    const modal = new bootstrap.Modal(document.getElementById('productFormModal'));
    modal.show();
}

async function openEditProductModal(productId) {
    try {
        const p = await API.getProductDetail(productId);
        document.getElementById('productFormTitle').textContent = `Edit Product #${p.id}`;
        document.getElementById('pfId').value = p.id;
        document.getElementById('pfName').value = p.name;
        document.getElementById('pfCategory').value = p.category_id;
        document.getElementById('pfPrice').value = p.price;
        document.getElementById('pfStock').value = p.stock;
        document.getElementById('pfImage').value = p.image_url;
        document.getElementById('pfDescription').value = p.description;

        const modal = new bootstrap.Modal(document.getElementById('productFormModal'));
        modal.show();
    } catch (err) {
        UI.showToast(err.message, false);
    }
}

async function handleProductFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('pfId').value;
    const productData = {
        name: document.getElementById('pfName').value.trim(),
        category_id: parseInt(document.getElementById('pfCategory').value),
        price: parseFloat(document.getElementById('pfPrice').value),
        stock: parseInt(document.getElementById('pfStock').value),
        image_url: document.getElementById('pfImage').value.trim(),
        description: document.getElementById('pfDescription').value.trim()
    };

    try {
        if (id) {
            await API.updateProduct(id, productData);
            UI.showToast('Product updated successfully!');
        } else {
            await API.createProduct(productData);
            UI.showToast('Product added successfully!');
        }

        bootstrap.Modal.getInstance(document.getElementById('productFormModal')).hide();
        loadProducts();
        loadAdminConsole();
    } catch (err) {
        UI.showToast(err.message, false);
    }
}

async function handleDeleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        await API.deleteProduct(productId);
        UI.showToast('Product deleted.');
        loadProducts();
        loadAdminConsole();
    } catch (err) {
        UI.showToast(err.message, false);
    }
}

// Authentication Modal Handlers
function openAuthModal(mode = 'login') {
    const modal = new bootstrap.Modal(document.getElementById('authModal'));
    toggleAuthMode(mode);
    modal.show();
}

function toggleAuthMode(mode) {
    const title = document.getElementById('authModalTitle');
    const subtitle = document.getElementById('authModalSubtitle');

    if (mode === 'login') {
        title.textContent = 'Welcome Back';
        subtitle.textContent = 'Sign in to your account to continue';
        document.getElementById('login-tab').click();
    } else {
        title.textContent = 'Create Account';
        subtitle.textContent = 'Join NovaStore for fast checkout and order tracking';
        document.getElementById('register-tab').click();
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const data = await API.login(email, password);
        state.user = data.user;
        renderAuthUI();
        bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
        UI.showToast(`Welcome back, ${state.user.name}!`);
        await reloadCart();
    } catch (err) {
        UI.showToast(err.message, false);
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    try {
        const data = await API.register(name, email, password, role);
        state.user = data.user;
        renderAuthUI();
        bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
        UI.showToast(`Account created successfully! Logged in as ${state.user.name}`);
        await reloadCart();
    } catch (err) {
        UI.showToast(err.message, false);
    }
}

async function handleLogout() {
    try {
        await API.logout();
        state.user = null;
        renderAuthUI();
        await reloadCart();
        showSection('catalog-section');
        UI.showToast('You have been signed out.');
    } catch (err) {
        UI.showToast('Logout failed', false);
    }
}

function showDemoCredentials() {
    const modal = new bootstrap.Modal(document.getElementById('demoLoginsModal'));
    modal.show();
}

async function quickLogin(email, password) {
    try {
        const data = await API.login(email, password);
        state.user = data.user;
        renderAuthUI();
        bootstrap.Modal.getInstance(document.getElementById('demoLoginsModal')).hide();
        UI.showToast(`Quick Logged in as ${state.user.name} (${state.user.role})`);
        await reloadCart();
        if (state.user.role === 'admin') {
            showSection('admin-section');
        }
    } catch (err) {
        UI.showToast(err.message, false);
    }
}
