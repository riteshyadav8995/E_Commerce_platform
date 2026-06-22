# E-Commerce Management System Documentation
Version: 1.0

## 1. Environment Variables & API Credentials

This section outlines the third-party API credentials and environment variables required for the backend to function, including their purpose and examples.

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | Connection string for Neon Serverless PostgreSQL database. Stores all application data. | `postgresql://user:pass@ep-restless-pond.aws.neon.tech/neondb` |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens for user/admin authentication. | `my_super_secret_jwt_key_2026` |
| `PORT` | The port the Node.js Express server listens on. | `5000` |
| `EMAIL_USER` | SMTP email address (e.g., Gmail) used by Nodemailer to send OTPs and PDF invoices. | `store-noreply@gmail.com` |
| `EMAIL_PASS` | App password for the SMTP email account. | `abcd efgh ijkl mnop` |
| `GEMINI_API_KEY` | Google Gemini 2.5 Flash API Key. Used for generating SEO-friendly product descriptions and AI dashboard summaries. | `AIzaSyB8...` |
| `RAZORPAY_KEY_ID` | Razorpay public key ID. Used for creating payment links and processing online checkouts. | `rzp_test_T1rhoW...` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key. Used for verifying payment signatures. | `M70nWsKs...` |
| `RAZORPAY_WEBHOOK_SECRET` | Secret used to verify incoming webhook requests from Razorpay upon successful payment. | `my_webhook_secret` |
| `WHATSAPP_TOKEN` | Meta Cloud API permanent access token. Used to send WhatsApp messages to customers. | `EAAOEvMICceM...` |
| `PHONE_NUMBER_ID` | Meta Cloud API Phone Number ID of the business sending the messages. | `1169256336269870` |
| `WHATSAPP_VERIFY_TOKEN` | Custom string used to verify the initial Webhook setup with Meta. | `my_custom_whatsapp_verify` |

---

## 2. API Contract
**Base URL:** `/api`

### Demo Login Credentials
For testing purposes, you can use the following pre-configured accounts:
* **Admin Role:**
  * **Email:** `admin@luxestore.co.in`
  * **Password:** `Test@1234`
* **Customer Role:**
  * **Email:** `customer@example.com`
  * **Password:** `Test@1234`

### Authentication
All protected endpoints require authentication via headers: `Authorization: Bearer <token>`

* **POST** `/auth/send-otp`
  * **Payload**: `{ "email": "user@example.com" }`
  * **Description**: Sends a 6-digit OTP to the user's email via Nodemailer.
* **POST** `/auth/verify-otp`
  * **Payload**: `{ "email": "user@example.com", "otp": "123456" }`
  * **Description**: Verifies the OTP.
* **POST** `/auth/register`
  * **Payload**: `{ "name": "John Doe", "email": "john@example.com", "phone": "1234567890", "password": "pass" }`
  * **Description**: Registers a new user. Domain determines role (e.g., `@luxestore.co.in` -> Admin).
* **POST** `/auth/login`
  * **Payload**: `{ "email": "john@example.com", "password": "pass" }`
  * **Response**: Returns User object + JWT Token.

### Products & Categories
* **GET** `/categories`
  * **Description**: Lists all categories.
* **GET** `/products`
  * **Query Params**: `?category=Electronics&search=laptop`
  * **Description**: Lists active products, optionally filtered.
* **POST** `/products` *(Admin)*
  * **Description**: Creates a new product.
* **POST** `/products/ai-description` *(Admin)*
  * **Description**: Hits Gemini API to auto-generate a product description based on the name.

### Billing, POS & Orders
* **POST** `/billing`
  * **Payload**: Cart data, customer details, payment mode (`CASH`, `UPI`, `LINK`).
  * **Description**: Generates a Bill/Invoice. If `LINK` is selected, integrates with Razorpay to generate a payment link. Deducts inventory automatically.
* **GET** `/billing/:id`
  * **Description**: Fetches detailed bill with items and shipping status.
* **PUT** `/billing/:id/mark-paid` *(Admin)*
  * **Description**: Marks an offline POS bill as PAID.
* **PATCH** `/billing/:id/shipping` *(Admin / Delivery)*
  * **Payload**: `{ "status": "SHIPPED", "location": "Warehouse", "message": "Dispatched" }`
  * **Description**: Updates order tracking pipeline.
* **PATCH** `/billing/:id/assign-delivery` *(Admin)*
  * **Description**: Assigns a bill to a specific Delivery Boy.

### Dashboard & Analytics *(Admin)*
* **GET** `/dashboard/kpis`
  * **Description**: Returns Revenue, Orders, Average Order Value, and Low Stock Alerts.
* **GET** `/dashboard/charts`
  * **Description**: Returns data for Revenue Trends and Category Breakdowns.
* **GET** `/dashboard/ai-summary`
  * **Description**: Analyzes overall sales data using Gemini AI and returns an executive text summary.

---

## 3. Database Schema (DBML)

```dbml
Project ECommerceManagementSystem {
  database_type: "PostgreSQL"
  Note: '''
    E-Commerce & POS System Database Schema
    Built with Prisma ORM
  '''
}

Table Role {
  id int [pk, increment]
  name varchar [unique] // Admin, Customer, Delivery, Manager, Cashier
}

Table User {
  id int [pk, increment]
  name varchar
  email varchar [unique]
  passwordHash varchar
  phone varchar
  roleId int
  createdAt timestamp
}

Table Category {
  id int [pk, increment]
  name varchar [unique]
  description varchar
  image varchar
  createdAt timestamp
}

Table Product {
  id int [pk, increment]
  name varchar
  sku varchar [unique]
  price decimal
  tax decimal
  imageUrl varchar
  status varchar // active | inactive
  categoryId int
  createdAt timestamp
}

Table Warehouse {
  id int [pk, increment]
  name varchar
  location varchar
}

Table Inventory {
  id int [pk, increment]
  productId int
  warehouseId int
  quantity int
  minStockThreshold int
}

Table StockMovement {
  id int [pk, increment]
  productId int
  warehouseId int
  type varchar // IN | OUT | ADJUSTMENT
  quantity int
  reference varchar
}

Table Cart {
  id int [pk, increment]
  customerId int
  status varchar // active | completed
}

Table CartItem {
  id int [pk, increment]
  cartId int
  productId int
  quantity int
}

Table Bill {
  id int [pk, increment]
  billNumber varchar [unique]
  totalAmount decimal
  discount decimal
  grandTotal decimal
  status varchar // PAID | CANCELLED
  paymentMode varchar // CASH | CARD | UPI | LINK
  paymentStatus varchar // PENDING | PAID
  shippingStatus varchar // N/A | PENDING | PACKED | SHIPPED | DELIVERED
  userId int // Created by Admin/Cashier
  customerId int // Ordered by
  deliveryBoyId int // Assigned to
  createdAt timestamp
}

Table BillItem {
  id int [pk, increment]
  billId int
  productId int
  quantity int
  unitPrice decimal
  subtotal decimal
}

Table OrderTracking {
  id int [pk, increment]
  billId int
  status varchar
  location varchar
  message varchar
  createdAt timestamp
}

Table OtpVerification {
  id int [pk, increment]
  email varchar
  otp varchar
  verified boolean
  expiresAt timestamp
}

Ref: User.roleId > Role.id
Ref: Product.categoryId > Category.id
Ref: Inventory.productId > Product.id
Ref: Inventory.warehouseId > Warehouse.id
Ref: StockMovement.productId > Product.id
Ref: CartItem.cartId > Cart.id
Ref: CartItem.productId > Product.id
Ref: Bill.userId > User.id
Ref: Bill.deliveryBoyId > User.id
Ref: BillItem.billId > Bill.id
Ref: BillItem.productId > Product.id
Ref: OrderTracking.billId > Bill.id
```

---

## 4. Frontend Architecture

The frontend is built with React 19, Vite, and TailwindCSS. It utilizes Zustand for global state management and React Router DOM for SPA routing.

### Global State Stores (Zustand)
* `authStore.js`: Manages user authentication state.
  * **Properties**: `user`, `token`, `isAuthenticated`.
  * **Methods**: `login()`, `logout()`.
* `cartStore.js`: Manages the customer's shopping cart.
  * **Properties**: `cart` (Array of items).
  * **Methods**: `addToCart()`, `removeFromCart()`, `updateQuantity()`, `clearCart()`, `getCartTotal()`.

### Folder Structure
```text
frontend/
├── src/
│   ├── components/      # Reusable UI components (Navbar, Modals, ProductCards)
│   ├── pages/           
│   │   ├── admin/       # Admin Dashboard, Inventory, Categories
│   │   ├── billing/     # POS Terminal, Receipt Views, Bill History
│   │   ├── customer/    # Storefront, Product Details, User Profile
│   │   └── delivery/    # Delivery Boy interface (Tasks, Updates)
│   ├── services/        
│   │   └── api.js       # Axios instance with Interceptors for JWT auth & Base URL config
│   ├── store/           # Zustand global state stores
│   ├── App.jsx          # Root component & Route Definitions
│   └── index.css        # Tailwind directives and custom dark-mode classes
```

### Key Route Configuration
* **Public/Customer Routes**:
  * `/` & `/store`: Main product catalog.
  * `/product/:id`: Detailed product page.
  * `/cart`: Shopping cart summary and checkout.
  * `/login`, `/register`: Authentication pages.
  * `/profile`: Customer order history and addresses.
* **Admin Routes (Protected by Role)**:
  * `/admin`: Overview Dashboard (Charts, KPIs).
  * `/admin/products`, `/admin/categories`: Catalog management.
  * `/admin/inventory`: Warehouse and stock adjustments.
  * `/admin/pos`: Point of Sale terminal.
  * `/admin/billing`: View all invoices and online orders.
* **Delivery Routes (Protected by Role)**:
  * `/delivery/tasks`: Interface for delivery boys to update shipping tracking.
