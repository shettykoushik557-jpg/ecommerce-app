# 🛒 NovaStore - Modern E-Commerce Web Application

NovaStore is a full-stack, responsive online store built with **Python (Flask)**, **SQLite**, **HTML5/CSS3 (Bootstrap 5)**, and **JavaScript**. It features complete product management, user authentication with role-based access control (Admin/User), shopping cart, multi-step checkout workflow, and live order tracking.

---

## 🔥 Key Features

- **Product Catalog & Management**:
  - Filter products by category (*Electronics*, *Fashion*, *Home & Living*, *Books*).
  - Live search bar and multi-criteria sorting (*Price: Low to High / High to Low*, *Rating*, *Newest*).
  - High-resolution product images, low-stock badges, and interactive customer reviews.

- **Shopping Cart & Multi-Step Checkout**:
  - Offcanvas sliding cart drawer with real-time subtotal calculation.
  - Interactive checkout modal with shipping address inputs and payment method simulation (*Credit Card*, *UPI / Net Banking*, *Cash on Delivery*).
  - Automated stock updates upon order completion.

- **User Authentication & Role-Based Access**:
  - Password hashing with `Werkzeug.security` and session-based authorization.
  - **Customer Role**: Storefront shopping, order history view, live order tracking.
  - **Admin Role**: Storefront shopping + **Admin Console** featuring:
    - Real-time revenue, total orders, product inventory, and customer stats.
    - Full Product CRUD (Add, Edit, Delete).
    - Order status updaters (*Pending*, *Processing*, *Shipped*, *Out for Delivery*, *Delivered*, *Cancelled*).

- **Real-Time Order Tracking**:
  - Unique tracking numbers (e.g., `TRK-98421054`) with step-by-step visual shipment progress timeline.

---

## 🛠️ Tech Stack

- **Backend**: Python 3, Flask 3.1, Werkzeug, Flask-CORS
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3, Bootstrap Icons
- **Database**: SQLite3 (Relational schema with Foreign Keys and auto-seeding)

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Python 3.10+ installed on your system.

### 2. Run the Application
```bash
# Navigate to project directory
cd ecommerce-app

# Install dependencies
python -m pip install -r requirements.txt

# Run server
python app.py
```

Open your browser and navigate to:
👉 `http://127.0.0.1:5000`

---

## 🔑 Demo Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Customer** | `user@store.com` | `user123` | Shop, Cart, Checkout, Track Orders |
| **Admin** | `admin@store.com` | `admin123` | Storefront + Admin Console (Analytics, Product CRUD, Order Status) |

---

## 📁 Project Structure

```
ecommerce-app/
├── app.py                 # Flask REST API backend server
├── database.py            # SQLite schema initialization and seed data
├── requirements.txt       # Python dependencies
├── README.md              # Project documentation
├── static/
│   ├── css/
│   │   └── style.css      # Custom styling & animations
│   └── js/
│       ├── api.js         # API service wrapper
│       ├── ui.js          # DOM rendering component module
│       └── app.js         # Main frontend app controller
└── templates/
    └── index.html         # Single Page Application HTML structure
```

---

## 📝 License
This project is open-source and available under the MIT License.
