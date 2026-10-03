/**
 * UI Rendering components and helper functions
 */
const UI = {
    // Show Toast Notification
    showToast(message, isSuccess = true) {
        const toastEl = document.getElementById('appToast');
        const msgEl = document.getElementById('toastMessage');
        const iconClass = isSuccess ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger';
        
        msgEl.innerHTML = `<i class="bi ${iconClass}"></i> ${message}`;
        const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
        toast.show();
    },

    // Star rating HTML helper
    renderStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="bi bi-star-fill text-warning me-1"></i>';
            } else if (i === fullStars + 1 && hasHalf) {
                stars += '<i class="bi bi-star-half text-warning me-1"></i>';
            } else {
                stars += '<i class="bi bi-star text-muted opacity-50 me-1"></i>';
            }
        }
        return stars;
    },

    // Render Category Chips
    renderCategories(categories, selectedId, onSelect) {
        const container = document.getElementById('categoryChips');
        let html = `
            <button class="btn btn-category ${selectedId === null ? 'active' : ''} rounded-pill px-3 py-2" onclick="filterByCategory(null, this)">
                <i class="bi bi-grid-3x3-gap-fill me-1"></i> All Products
            </button>
        `;

        categories.forEach(cat => {
            const isActive = selectedId === cat.id ? 'active' : '';
            html += `
                <button class="btn btn-category ${isActive} rounded-pill px-3 py-2" onclick="filterByCategory(${cat.id}, this)">
                    <i class="bi ${cat.icon || 'bi-tag'} me-1"></i> ${cat.name} (${cat.product_count})
                </button>
            `;
        });
        container.innerHTML = html;
    },

    // Render Product Cards Grid
    renderProducts(products) {
        const grid = document.getElementById('products-grid');
        if (!products || products.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <h5 class="fw-bold mt-2">No Products Found</h5>
                    <p class="text-muted">Try changing your search query or category filters.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = products.map(p => `
            <div class="col">
                <div class="card h-100 product-card rounded-4">
                    <div class="product-img-wrapper" onclick="openProductModal(${p.id})" style="cursor: pointer;">
                        <img src="${p.image_url}" alt="${p.name}" loading="lazy">
                        ${p.stock <= 5 && p.stock > 0 ? `<span class="badge bg-warning text-dark badge-stock-low rounded-pill"><i class="bi bi-exclamation-circle me-1"></i> Low Stock: ${p.stock} left</span>` : ''}
                        ${p.stock === 0 ? `<span class="badge bg-danger badge-stock-low rounded-pill">Out of Stock</span>` : ''}
                    </div>
                    <div class="card-body d-flex flex-column p-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="badge bg-primary-subtle text-primary rounded-pill small">${p.category_name || 'General'}</span>
                            <span class="small fw-semibold text-muted d-flex align-items-center">
                                <i class="bi bi-star-fill text-warning me-1"></i> ${p.rating} (${p.review_count})
                            </span>
                        </div>
                        <h6 class="card-title fw-bold text-truncate mb-2" onclick="openProductModal(${p.id})" style="cursor: pointer;" title="${p.name}">
                            ${p.name}
                        </h6>
                        <p class="card-text text-muted small flex-grow-1 text-truncate-2 mb-3" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${p.description}
                        </p>
                        <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                            <div class="fs-5 fw-extrabold text-primary">$${p.price.toFixed(2)}</div>
                            <button class="btn btn-outline-primary rounded-pill btn-sm fw-bold px-3 d-flex align-items-center" 
                                    onclick="handleAddToCart(${p.id}, event)" ${p.stock === 0 ? 'disabled' : ''}>
                                <i class="bi bi-bag-plus me-1"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Render Cart Drawer
    renderCart(cartData) {
        const badge = document.getElementById('cartBadge');
        const drawerCount = document.getElementById('cartDrawerCount');
        const container = document.getElementById('cartItemsList');
        const subtotalEl = document.getElementById('cartSubtotal');
        const totalEl = document.getElementById('cartTotal');
        const btnCheckout = document.getElementById('btnProceedCheckout');

        const items = cartData.items || [];
        const totalItems = cartData.total_items || 0;
        const subtotal = cartData.subtotal || 0;

        badge.textContent = totalItems;
        drawerCount.textContent = totalItems;
        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        totalEl.textContent = `$${subtotal.toFixed(2)}`;

        if (items.length === 0) {
            container.innerHTML = `
                <div class="text-center my-auto py-5">
                    <div class="icon-circle bg-body-tertiary text-muted mx-auto mb-3">
                        <i class="bi bi-bag-x fs-2"></i>
                    </div>
                    <h6 class="fw-bold">Your cart is empty</h6>
                    <p class="text-muted small">Explore products and add items to your cart.</p>
                    <button class="btn btn-outline-primary rounded-pill btn-sm fw-bold px-4" data-bs-dismiss="offcanvas">Start Shopping</button>
                </div>
            `;
            btnCheckout.disabled = true;
            return;
        }

        btnCheckout.disabled = false;
        container.innerHTML = items.map(item => `
            <div class="d-flex gap-3 align-items-center p-2 border rounded-3 bg-body-tertiary">
                <img src="${item.image_url}" alt="${item.name}" class="rounded-3" style="width: 65px; height: 65px; object-fit: cover;">
                <div class="flex-grow-1 overflow-hidden">
                    <h6 class="fw-bold text-truncate m-0 mb-1" style="font-size: 0.95rem;">${item.name}</h6>
                    <div class="text-primary fw-bold small">$${item.price.toFixed(2)}</div>
                    <div class="d-flex align-items-center gap-2 mt-1">
                        <div class="btn-group btn-group-sm border rounded-pill bg-body" role="group">
                            <button class="btn btn-light qty-btn border-0" onclick="updateCartItemQty(${item.cart_item_id}, ${item.quantity - 1})">-</button>
                            <span class="px-2 d-flex align-items-center fw-bold small">${item.quantity}</span>
                            <button class="btn btn-light qty-btn border-0" onclick="updateCartItemQty(${item.cart_item_id}, ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                </div>
                <button class="btn btn-icon text-danger border-0 p-1" onclick="removeCartItem(${item.cart_item_id})" title="Remove">
                    <i class="bi bi-trash fs-5"></i>
                </button>
            </div>
        `).join('');
    },

    // Order status badge styling
    getStatusBadge(status) {
        const map = {
            'Pending': 'bg-warning-subtle text-warning-emphasis',
            'Processing': 'bg-info-subtle text-info-emphasis',
            'Shipped': 'bg-primary-subtle text-primary',
            'Out for Delivery': 'bg-purple-subtle text-purple',
            'Delivered': 'bg-success-subtle text-success',
            'Cancelled': 'bg-danger-subtle text-danger'
        };
        const cls = map[status] || 'bg-secondary-subtle text-secondary';
        return `<span class="badge ${cls} rounded-pill px-3 py-2 fw-bold">${status}</span>`;
    },

    // Step timeline renderer for tracking
    renderOrderTimeline(order) {
        const steps = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
        const currentIdx = steps.indexOf(order.order_status);

        let html = '<div class="tracking-timeline mt-4">';
        steps.forEach((step, idx) => {
            let stateClass = '';
            let icon = `<span class="small fw-bold">${idx + 1}</span>`;
            if (order.order_status === 'Cancelled') {
                stateClass = idx === 0 ? 'active' : '';
            } else if (idx < currentIdx) {
                stateClass = 'completed';
                icon = '<i class="bi bi-check fs-6"></i>';
            } else if (idx === currentIdx) {
                stateClass = 'active';
            }

            html += `
                <div class="tracking-step ${stateClass}">
                    <div class="tracking-step-dot">${icon}</div>
                    <div class="ms-2">
                        <div class="fw-bold">${step}</div>
                        <div class="small text-muted">${idx <= currentIdx ? 'Status updated' : 'Pending step'}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    },

    // Render User Orders List
    renderUserOrders(orders) {
        const container = document.getElementById('userOrdersList');
        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="card border-0 shadow-sm rounded-4 p-5 text-center">
                    <i class="bi bi-box2 fs-1 text-muted"></i>
                    <h5 class="fw-bold mt-2">No Orders Found</h5>
                    <p class="text-muted">You haven't placed any orders yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
                <div class="card-header bg-body-tertiary d-flex flex-wrap align-items-center justify-content-between p-3 gap-2">
                    <div>
                        <span class="fw-bold fs-6">Order #${order.id}</span>
                        <span class="text-muted ms-2 small"><i class="bi bi-calendar3 me-1"></i> ${new Date(order.created_at).toLocaleString()}</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span class="small text-muted">Tracking: <code class="fw-bold">${order.tracking_number}</code></span>
                        ${UI.getStatusBadge(order.order_status)}
                    </div>
                </div>
                <div class="card-body p-4">
                    <div class="row align-items-center">
                        <div class="col-md-7 border-end-md">
                            <h6 class="fw-bold small text-muted text-uppercase mb-3">Items Ordered</h6>
                            <div class="d-flex flex-column gap-2">
                                ${order.items.map(i => `
                                    <div class="d-flex align-items-center gap-3">
                                        <img src="${i.image_url}" alt="${i.product_name}" class="rounded-3" style="width: 50px; height: 50px; object-fit: cover;">
                                        <div class="flex-grow-1">
                                            <div class="fw-bold small">${i.product_name}</div>
                                            <div class="text-muted small">Qty: ${i.quantity} × $${i.unit_price.toFixed(2)}</div>
                                        </div>
                                        <div class="fw-bold small">$${(i.quantity * i.unit_price).toFixed(2)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="col-md-5">
                            <div class="ps-md-3">
                                <div class="mb-2">
                                    <span class="small text-muted fw-bold">Shipping Address:</span>
                                    <div class="small text-muted">${order.shipping_address}</div>
                                </div>
                                <div class="mb-3">
                                    <span class="small text-muted fw-bold">Payment Method:</span>
                                    <div class="small fw-semibold text-primary"><i class="bi bi-credit-card me-1"></i> ${order.payment_method}</div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                                    <span class="fw-bold">Total Paid:</span>
                                    <span class="fs-4 fw-extrabold text-primary">$${order.total_amount.toFixed(2)}</span>
                                </div>
                                <button class="btn btn-outline-primary btn-sm rounded-pill w-100 mt-3 fw-bold" onclick="quickTrackOrder('${order.tracking_number}')">
                                    <i class="bi bi-geo-alt-fill me-1"></i> Track Order Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Render Admin Console Dashboard
    renderAdminConsole(stats, orders, products) {
        document.getElementById('statRevenue').textContent = `$${stats.total_revenue.toFixed(2)}`;
        document.getElementById('statOrders').textContent = stats.total_orders;
        document.getElementById('statProducts').textContent = stats.total_products;
        document.getElementById('statCustomers').textContent = stats.total_customers;

        // Render Orders Table
        const ordersTbody = document.querySelector('#adminOrdersTable tbody');
        ordersTbody.innerHTML = orders.map(o => `
            <tr>
                <td class="fw-bold">#${o.id}<br><code class="small">${o.tracking_number}</code></td>
                <td>
                    <div class="fw-bold">${o.customer_name}</div>
                    <div class="small text-muted">${o.customer_email}</div>
                </td>
                <td class="fw-bold text-primary">$${o.total_amount.toFixed(2)}</td>
                <td><span class="badge bg-secondary-subtle text-secondary small">${o.payment_method}</span></td>
                <td>${UI.getStatusBadge(o.order_status)}</td>
                <td>
                    <select class="form-select form-select-sm rounded-pill fw-semibold" onchange="handleAdminStatusChange(${o.id}, this.value)">
                        ${['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(st => `
                            <option value="${st}" ${st === o.order_status ? 'selected' : ''}>${st}</option>
                        `).join('')}
                    </select>
                </td>
                <td class="small text-muted">${new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm rounded-circle" onclick="quickTrackOrder('${o.tracking_number}')" title="View Details">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Render Products Table
        const productsTbody = document.querySelector('#adminProductsTable tbody');
        productsTbody.innerHTML = products.map(p => `
            <tr>
                <td><img src="${p.image_url}" class="rounded-3" style="width: 45px; height: 45px; object-fit: cover;"></td>
                <td class="fw-bold">${p.name}</td>
                <td><span class="badge bg-primary-subtle text-primary rounded-pill">${p.category_name}</span></td>
                <td class="fw-bold text-success">$${p.price.toFixed(2)}</td>
                <td>
                    <span class="badge ${p.stock <= 5 ? 'bg-danger' : 'bg-secondary'} rounded-pill">${p.stock}</span>
                </td>
                <td><i class="bi bi-star-fill text-warning me-1"></i>${p.rating}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1 rounded-circle" onclick="openEditProductModal(${p.id})" title="Edit">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-circle" onclick="handleDeleteProduct(${p.id})" title="Delete">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
};
