# 🛒 Harsha Supermarket Inventory Management System

A full-stack supermarket inventory management system built with **Node.js**, **Express**, **MySQL**, and a responsive **Vanilla CSS/JS** web dashboard. It streamlines stock tracking, inventory analytics, low-stock reorder warnings, and complete product lifecycle management (CRUD).

---

## 🌟 Key Features

- 📊 **Real-Time Analytics Dashboard**: Live metrics for Total Products, Total Categories, Low Stock, and Out-of-Stock items calculated straight from MySQL.
- 📦 **Complete Product CRUD**:
  - **Insert Product** (`/insert`): Add new items with automated or custom ID numbering, category classification, pricing, quantity, and safety reorder thresholds.
  - **Inventory Directory** (`/list`): Filter by category, stock status (In Stock, Low Stock, Out of Stock), sort by price/quantity/name, and search in real time.
  - **Live Search & Autocomplete** (`/search`): Instant search by Product ID (`#101`) or Product Name with quick-action cards.
  - **Update Stock** (`/update`): Fetch product data automatically and update price, quantity, category, or reorder levels.
  - **Delete Items** (`/delete`): Safe product deletion with verification prompts.
- ⚠️ **Automated Low-Stock & Reorder Alerts** (`/low-stock`): Highlights critically low or exhausted stock with calculated deficit indicators to prevent stockouts.
- ⚡ **Resilient Backend**: Connection pooling with `mysql2/promise`, health check endpoint (`/api/health`), and dynamic port failover if port 3000 is busy.
- 🎨 **Modern UI/UX**: Premium aesthetic with dark/light visual cues, responsive navigation cards, status badges, and interactive feedback.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL (via `mysql2/promise`)
- **Frontend**: HTML5, Vanilla CSS3 (Custom Responsive Layouts, Flexbox/Grid), JavaScript (ES6+ Fetch API)
- **Environment Management**: `dotenv`

---

## 📁 Project Structure

```text
Project Management System/
├── index.html          # Main Dashboard & Navigation Hub
├── insert.html         # Add New Product Form
├── list.html           # Full Inventory Directory & Filters
├── search.html         # Live Search & Lookup
├── update.html         # Modify Existing Product Details
├── delete.html         # Remove Product from Database
├── low-stock.html      # Critical Low Stock & Reorder Alerts
├── style.css           # Global Theme & Component Styling
├── app.js              # Client-Side Application Logic & State
├── server.js           # Express API Server & Database Pool
├── database.sql        # MySQL Schema & Initial Seed Data
├── package.json        # Dependencies & NPM Scripts
├── .env.example        # Environment Variable Template
└── .gitignore          # Git Exclusion Rules
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) or XAMPP / WampServer

---

### 2. Database Setup

1. Open your MySQL client (MySQL Workbench, phpMyAdmin, or MySQL CLI).
2. Run the provided [`database.sql`](database.sql) script to create the `harsha_pms` database and seed sample products:
   ```sql
   SOURCE path/to/database.sql;
   ```
   *(Or copy-paste the contents of `database.sql` into your MySQL query editor and run).*

---

### 3. Environment Configuration

1. In the root directory, create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your MySQL credentials:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=harsha_pms
   ```

---

### 4. Install Dependencies & Start

1. Install project packages:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```
   *For development with auto-reloading:*
   ```bash
   npm run dev
   ```

3. Open your browser and visit:
   ```
   http://localhost:3000
   ```

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check MySQL connection & server health |
| `GET` | `/api/stats` | Dashboard statistics & category distribution |
| `GET` | `/api/products` | Retrieve products (supports `?search=`, `?category=`, `?status=`, `?sort=`) |
| `GET` | `/api/products/low-stock` | Get products at or below safety reorder level |
| `GET` | `/api/products/autocomplete` | Live search suggestions by name or ID (`?q=`) |
| `GET` | `/api/products/:id` | Fetch specific product by ID |
| `POST` | `/api/products` | Insert a new product |
| `PUT` | `/api/products/:id` | Update product details |
| `DELETE` | `/api/products/:id` | Delete a product |

---

## 👤 Author

Developed by **Harsha**
