require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Database pool configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'harsha_pms',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool = null;

function getPool() {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
    }
    return pool;
}

// Test database connection helper (used on /api/health and startup)
async function checkDatabase() {
    try {
        const p = getPool();
        const connection = await p.getConnection();
        await connection.ping();
        connection.release();
        return { connected: true, message: 'Connected to MySQL', database: dbConfig.database };
    } catch (err) {
        return { connected: false, message: err.message, code: err.code, database: dbConfig.database };
    }
}

// Health check API
app.get('/api/health', async (req, res) => {
    const status = await checkDatabase();
    res.json(status);
});

// Helper for handling DB errors consistently
function handleDbError(err, res, customMsg = 'Database operation failed') {
    console.error(customMsg, err);
    if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ER_BAD_DB_ERROR') {
        return res.status(503).json({
            success: false,
            message: `MySQL connection unavailable: ${err.message}`,
            code: err.code
        });
    }
    return res.status(500).json({ success: false, message: err.message, code: err.code });
}

// GET all products with filtering, searching, and sorting
app.get('/api/products', async (req, res) => {
    const { search, category, status, sort } = req.query;

    try {
        let query = `
            SELECT 
                product_id, 
                product_name, 
                product_category, 
                product_price, 
                product_quantity, 
                reorder_level,
                CASE 
                    WHEN product_quantity = 0 THEN 'Out of Stock'
                    WHEN product_quantity <= reorder_level THEN 'Low Stock'
                    ELSE 'In Stock'
                END AS stock_status
            FROM products
            WHERE 1=1
        `;
        const params = [];

        // Exact Product ID filter if explicitly requested
        if (req.query.id && req.query.id.trim() !== '') {
            const cleanId = req.query.id.trim().replace(/^#/, '');
            if (!isNaN(parseInt(cleanId, 10))) {
                query += ` AND product_id = ?`;
                params.push(parseInt(cleanId, 10));
            }
        }

        // Search by Product ID or Product Name
        if (search && search.trim() !== '') {
            const raw = search.trim();
            const cleanNum = raw.replace(/^#/, '');
            if (/^\d+$/.test(cleanNum)) {
                // If numeric, prioritize exact ID match or partial name match
                query += ` AND (product_id = ? OR product_name LIKE ?)`;
                params.push(parseInt(cleanNum, 10), `%${raw}%`);
            } else {
                // Partial name search
                query += ` AND product_name LIKE ?`;
                params.push(`%${raw}%`);
            }
        }

        // Filter by Category
        if (category && category.trim() !== '' && category !== 'all') {
            query += ` AND product_category = ?`;
            params.push(category.trim());
        }

        // Filter by Stock Status
        if (status === 'in_stock') {
            query += ` AND product_quantity > reorder_level`;
        } else if (status === 'low_stock') {
            query += ` AND product_quantity <= reorder_level AND product_quantity > 0`;
        } else if (status === 'out_of_stock') {
            query += ` AND product_quantity = 0`;
        }

        // Sorting
        switch (sort) {
            case 'name_asc':
                query += ` ORDER BY product_name ASC`;
                break;
            case 'name_desc':
                query += ` ORDER BY product_name DESC`;
                break;
            case 'price_asc':
                query += ` ORDER BY product_price ASC`;
                break;
            case 'price_desc':
                query += ` ORDER BY product_price DESC`;
                break;
            case 'qty_asc':
                query += ` ORDER BY product_quantity ASC`;
                break;
            case 'qty_desc':
                query += ` ORDER BY product_quantity DESC`;
                break;
            case 'id_desc':
                query += ` ORDER BY product_id DESC`;
                break;
            case 'id_asc':
            default:
                query += ` ORDER BY product_id ASC`;
                break;
        }

        if (req.query.limit) {
            const limitNum = parseInt(req.query.limit, 10);
            if (!isNaN(limitNum) && limitNum > 0) {
                query += ` LIMIT ${limitNum}`;
            }
        }

        const [rows] = await getPool().query(query, params);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        return handleDbError(err, res, 'Fetch products error:');
    }
});

// GET Low Stock products (quantity <= reorder_level)
app.get('/api/products/low-stock', async (req, res) => {
    const { category, status } = req.query;

    try {
        let query = `
            SELECT 
                product_id, 
                product_name, 
                product_category, 
                product_price, 
                product_quantity, 
                reorder_level,
                (reorder_level - product_quantity) AS unit_deficit,
                CASE 
                    WHEN product_quantity = 0 THEN 'Out of Stock'
                    ELSE 'Low Stock'
                END AS stock_status
            FROM products
            WHERE product_quantity <= reorder_level
        `;
        const params = [];

        if (category && category !== 'all') {
            query += ` AND product_category = ?`;
            params.push(category);
        }

        if (status === 'out_of_stock') {
            query += ` AND product_quantity = 0`;
        } else if (status === 'low_stock') {
            query += ` AND product_quantity > 0`;
        }

        query += ` ORDER BY (product_quantity = 0) DESC, (reorder_level - product_quantity) DESC, product_quantity ASC`;

        const [rows] = await getPool().query(query, params);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        return handleDbError(err, res, 'Low stock error:');
    }
});

// GET product autocomplete suggestions (must be defined BEFORE :id route)
app.get('/api/products/autocomplete', async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim() === '') {
        return res.json({ success: true, suggestions: [] });
    }

    try {
        const raw = q.trim();
        const cleanNum = raw.replace(/^#/, '');
        let query;
        let params;

        if (/^\d+$/.test(cleanNum)) {
            query = `
                SELECT product_id, product_name, product_category, product_price, product_quantity, reorder_level,
                    CASE 
                        WHEN product_quantity = 0 THEN 'Out of Stock'
                        WHEN product_quantity <= reorder_level THEN 'Low Stock'
                        ELSE 'In Stock'
                    END AS stock_status
                FROM products
                WHERE product_id = ? OR product_name LIKE ?
                ORDER BY (product_id = ?) DESC, product_name ASC
                LIMIT 8
            `;
            params = [parseInt(cleanNum, 10), `%${raw}%`, parseInt(cleanNum, 10)];
        } else {
            query = `
                SELECT product_id, product_name, product_category, product_price, product_quantity, reorder_level,
                    CASE 
                        WHEN product_quantity = 0 THEN 'Out of Stock'
                        WHEN product_quantity <= reorder_level THEN 'Low Stock'
                        ELSE 'In Stock'
                    END AS stock_status
                FROM products
                WHERE product_name LIKE ?
                ORDER BY product_name ASC
                LIMIT 8
            `;
            params = [`%${raw}%`];
        }

        const [rows] = await getPool().query(query, params);
        res.json({ success: true, count: rows.length, suggestions: rows });
    } catch (err) {
        return handleDbError(err, res, 'Autocomplete error:');
    }
});

// GET single product by ID (handles clean numeric IDs and #prefix)
app.get('/api/products/:id', async (req, res) => {
    const cleanId = String(req.params.id || '').trim().replace(/^#/, '');

    if (!cleanId || isNaN(parseInt(cleanId, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid product ID. Please provide a numeric ID.' });
    }

    try {
        const query = `
            SELECT 
                product_id, 
                product_name, 
                product_category, 
                product_price, 
                product_quantity, 
                reorder_level,
                CASE 
                    WHEN product_quantity = 0 THEN 'Out of Stock'
                    WHEN product_quantity <= reorder_level THEN 'Low Stock'
                    ELSE 'In Stock'
                END AS stock_status
            FROM products 
            WHERE product_id = ?
        `;
        const [rows] = await getPool().query(query, [parseInt(cleanId, 10)]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: `Product ID "#${cleanId}" was not found.` });
        }

        res.json({ success: true, data: rows[0] });
    } catch (err) {
        return handleDbError(err, res, 'Product lookup error:');
    }
});

// POST create new product
app.post('/api/products', async (req, res) => {
    const { product_id, product_name, product_category, product_price, product_quantity, reorder_level } = req.body;

    // Validation
    if (!product_name || product_name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Product name is required.' });
    }
    if (!product_category || product_category.trim() === '') {
        return res.status(400).json({ success: false, message: 'Product category is required.' });
    }

    const price = parseFloat(product_price);
    const qty = parseInt(product_quantity, 10);
    const reorder = parseInt(reorder_level, 10);

    if (isNaN(price) || price < 0) {
        return res.status(400).json({ success: false, message: 'Product price must be a non-negative number.' });
    }
    if (isNaN(qty) || qty < 0) {
        return res.status(400).json({ success: false, message: 'Product quantity must be a non-negative integer.' });
    }
    if (isNaN(reorder) || reorder < 0) {
        return res.status(400).json({ success: false, message: 'Reorder level must be a non-negative integer.' });
    }

    try {
        let insertQuery;
        let params;

        // If product_id is provided, include it in insert; otherwise let MySQL auto-generate
        if (product_id !== undefined && product_id !== null && String(product_id).trim() !== '' && String(product_id).trim().toLowerCase() !== 'auto') {
            const cleanCustomId = parseInt(String(product_id).trim().replace(/^#/, ''), 10);
            insertQuery = `
                INSERT INTO products (product_id, product_name, product_category, product_price, product_quantity, reorder_level)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            params = [cleanCustomId, product_name.trim(), product_category.trim(), price, qty, reorder];
        } else {
            insertQuery = `
                INSERT INTO products (product_name, product_category, product_price, product_quantity, reorder_level)
                VALUES (?, ?, ?, ?, ?)
            `;
            params = [product_name.trim(), product_category.trim(), price, qty, reorder];
        }

        const [result] = await getPool().query(insertQuery, params);
        const finalId = result.insertId || product_id;

        res.status(201).json({
            success: true,
            message: `Product "${product_name}" added successfully.`,
            product_id: finalId,
            data: {
                product_id: finalId,
                product_name: product_name.trim(),
                product_category: product_category.trim(),
                product_price: price,
                product_quantity: qty,
                reorder_level: reorder
            }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: `Product ID "${product_id}" already exists in the database.` });
        }
        return handleDbError(err, res, 'Insert error:');
    }
});

// PUT update existing product
app.put('/api/products/:id', async (req, res) => {
    const cleanId = String(req.params.id || '').trim().replace(/^#/, '');
    const { product_name, product_category, product_price, product_quantity, reorder_level } = req.body;

    if (!cleanId || isNaN(parseInt(cleanId, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid product ID format.' });
    }
    if (!product_name || product_name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Product name cannot be empty.' });
    }
    if (!product_category || product_category.trim() === '') {
        return res.status(400).json({ success: false, message: 'Product category cannot be empty.' });
    }

    const price = parseFloat(product_price);
    const qty = parseInt(product_quantity, 10);
    const reorder = parseInt(reorder_level, 10);

    if (isNaN(price) || price < 0) {
        return res.status(400).json({ success: false, message: 'Price must be a non-negative number.' });
    }
    if (isNaN(qty) || qty < 0) {
        return res.status(400).json({ success: false, message: 'Quantity must be a non-negative integer.' });
    }
    if (isNaN(reorder) || reorder < 0) {
        return res.status(400).json({ success: false, message: 'Reorder level must be a non-negative integer.' });
    }

    try {
        const updateQuery = `
            UPDATE products 
            SET product_name = ?, product_category = ?, product_price = ?, product_quantity = ?, reorder_level = ?
            WHERE product_id = ?
        `;
        const [result] = await getPool().query(updateQuery, [
            product_name.trim(),
            product_category.trim(),
            price,
            qty,
            reorder,
            parseInt(cleanId, 10)
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: `Product ID "#${cleanId}" was not found.` });
        }

        res.json({
            success: true,
            message: `Product "${product_name}" updated successfully in MySQL.`,
            data: {
                product_id: parseInt(cleanId, 10),
                product_name: product_name.trim(),
                product_category: product_category.trim(),
                product_price: price,
                product_quantity: qty,
                reorder_level: reorder
            }
        });
    } catch (err) {
        return handleDbError(err, res, 'Update error:');
    }
});

// DELETE remove product
app.delete('/api/products/:id', async (req, res) => {
    const cleanId = String(req.params.id || '').trim().replace(/^#/, '');

    if (!cleanId || isNaN(parseInt(cleanId, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid product ID format.' });
    }

    try {
        const [result] = await getPool().query(`DELETE FROM products WHERE product_id = ?`, [parseInt(cleanId, 10)]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: `Product ID "#${cleanId}" was not found.` });
        }

        res.json({ success: true, message: `Product ID "#${cleanId}" was successfully deleted from MySQL.` });
    } catch (err) {
        return handleDbError(err, res, 'Delete error:');
    }
});

// Quick statistics endpoint for home page dashboard - calculated directly from MySQL
app.get('/api/stats', async (req, res) => {
    try {
        const [summaryRows] = await getPool().query(`
            SELECT 
                COUNT(*) AS totalProducts,
                COUNT(DISTINCT product_category) AS totalCategories,
                COALESCE(SUM(CASE WHEN product_quantity > 0 AND product_quantity <= reorder_level THEN 1 ELSE 0 END), 0) AS lowStockCount,
                COALESCE(SUM(CASE WHEN product_quantity = 0 THEN 1 ELSE 0 END), 0) AS outOfStockCount,
                COALESCE(SUM(CASE WHEN product_quantity > reorder_level THEN 1 ELSE 0 END), 0) AS inStockCount
            FROM products
        `);

        const [categoryRows] = await getPool().query(`
            SELECT 
                product_category, 
                COUNT(*) AS count,
                COALESCE(SUM(CASE WHEN product_quantity > reorder_level THEN 1 ELSE 0 END), 0) AS in_stock,
                COALESCE(SUM(CASE WHEN product_quantity > 0 AND product_quantity <= reorder_level THEN 1 ELSE 0 END), 0) AS low_stock,
                COALESCE(SUM(CASE WHEN product_quantity = 0 THEN 1 ELSE 0 END), 0) AS out_of_stock
            FROM products 
            GROUP BY product_category
            ORDER BY product_category ASC
        `);

        const stats = summaryRows[0] || {};

        res.json({
            success: true,
            totalProducts: Number(stats.totalProducts) || 0,
            totalCategories: Number(stats.totalCategories) || 0,
            lowStockCount: Number(stats.lowStockCount) || 0,
            outOfStockCount: Number(stats.outOfStockCount) || 0,
            inStockCount: Number(stats.inStockCount) || 0,
            categoryCounts: categoryRows
        });
    } catch (err) {
        return handleDbError(err, res, 'Dashboard stats error:');
    }
});

// Clean URL Aliases
app.get('/insert', (req, res) => res.sendFile(path.join(__dirname, 'insert.html')));
app.get('/list', (req, res) => res.sendFile(path.join(__dirname, 'list.html')));
app.get('/search', (req, res) => res.sendFile(path.join(__dirname, 'search.html')));
app.get('/update', (req, res) => res.sendFile(path.join(__dirname, 'update.html')));
app.get('/delete', (req, res) => res.sendFile(path.join(__dirname, 'delete.html')));
app.get('/low-stock', (req, res) => res.sendFile(path.join(__dirname, 'low-stock.html')));

// Catch-all route to home
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'Endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server with Graceful Port Fallback
function startServer(port) {
    const srv = app.listen(port, async () => {
        console.log(`====================================================`);
        console.log(`🛒 Harsha Supermarket Inventory Management System`);
        console.log(`📍 Web Dashboard: http://localhost:${port}`);
        console.log(`====================================================`);
        const status = await checkDatabase();
        if (status.connected) {
            console.log(` MySQL Status: CONNECTED (${status.database})`);
        } else {
            console.log(`⚠️  MySQL Status: NOT CONNECTED (${status.message})`);
            console.log(`   Configure your credentials in .env to connect.`);
        }
        console.log(`====================================================`);
    });

    srv.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`Port ${port} is currently in use by another app. Trying port ${Number(port) + 1}...`);
            startServer(Number(port) + 1);
        } else {
            console.error('Server error:', err);
        }
    });
}

startServer(PORT);
