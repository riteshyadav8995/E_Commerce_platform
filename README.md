# E-Commerce Management System

A comprehensive, full-stack E-Commerce Platform built with React, Node.js, Express, and PostgreSQL (via Prisma). This application handles everything from customer-facing storefronts to advanced admin inventory management and delivery logistics.

## Key Features & Modules

### 1. Customer Storefront
* **Dynamic Catalog**: Browse products by category, search with filters, and view detailed product pages.
* **Shopping Cart & Wishlist**: Persistent cart and wishlist management.
* **Seamless Checkout**: Multiple payment options including Cash on Delivery (COD) and Online Payments via Razorpay.
* **Order Tracking**: Real-time order tracking and status updates from placement to delivery.
* **Account Management**: Address book, order history, and profile management.

### 2. Admin Dashboard & Inventory Management
* **Real-time Analytics**: Dashboard with KPI metrics, revenue trends, and low-stock alerts.
* **Product & Category CRUD**: Full management of the catalog with Cloudinary image uploads.
* **Multi-Warehouse Inventory**: Strict stock movement tracking (`IN`, `OUT`, `ADJUSTMENT`) across multiple warehouses.
* **Order Management**: View all incoming orders, generate invoices, and assign them to Delivery Boys.

### 3. POS Terminal (Point of Sale)
* **Cashier Checkout**: Quick billing terminal for offline store walk-ins.
* **Dynamic UPI QR Codes**: Instantly generate UPI payment QR codes based on the cart total.
* **Offline Bill Distinction**: Automatically separates offline POS sales from online web orders.
* **Thermal Receipt Printing**: Generate and print optimized receipts directly from the browser.

### 4. Delivery & Logistics
* **Delivery Boy Portal**: Dedicated interface for delivery staff to view assigned orders.
* **Status Updates**: Update order statuses (`PACKED`, `SHIPPED`, `DELIVERED`) and provide location/notes.
* **Customer Feedback**: Customers can rate their delivery experience post-completion.

### 5. Communication & Automation
* **Email Verification & OTPs**: Secure user registration via Nodemailer Email OTPs.
* **PDF Invoices**: Automatically generates and emails PDF invoices to customers upon order placement.
* **AI Integration**: Google Gemini 2.5 Flash integrated for auto-generating SEO product descriptions and synthesizing dashboard summaries.
* **WhatsApp Bot**: Conversational commerce bot via Meta Cloud API allowing users to browse and order directly through WhatsApp.

## Tech Stack
* **Frontend**: React 19, Vite, TailwindCSS (with Dark Mode), Zustand, React Hook Form, Lucide React.
* **Backend**: Node.js, Express.js.
* **Database**: PostgreSQL (Neon Serverless).
* **ORM**: Prisma.
* **Third-Party Services**: Cloudinary (Images), Google Gemini (AI), Meta Cloud API (WhatsApp), Razorpay (Payments), Nodemailer (Emails).

## Getting Started

### Prerequisites
* Node.js (v18+)
* PostgreSQL Database
* API Keys for Cloudinary, Gemini, Razorpay, Meta (WhatsApp), and an SMTP Email Account.

### Backend Setup
1. Navigate to the `backend` directory.
2. Run `npm install`.
3. Configure your `.env` file with the necessary database connection strings and API keys.
4. Run `npx prisma db push` to sync the database schema.
5. Run `npx prisma generate` to generate the Prisma client.
6. Start the server with `npm run dev`.

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Run `npm install`.
3. Start the Vite dev server with `npm run dev`.
4. To build for production, run `npm run build`.

## License
MIT
