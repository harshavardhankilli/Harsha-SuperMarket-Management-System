/**
 * Harsha Supermarket Inventory Management System
 * Shared Frontend Controller & Page Handlers
 * Fields: product_id, product_name, product_category, product_price, product_quantity, reorder_level
 */

// Supermarket category suggestions map
const CATEGORY_SUGGESTIONS = {
    'Rice, Grains & Pulses': ['Basmati Rice (5kg)', 'Toor Dal (1kg)', 'Moong Dal (1kg)', 'Whole Wheat Atta (10kg)', 'Brown Rice (2kg)', 'Chana Dal (1kg)'],
    'Cooking Essentials': ['Sunflower Cooking Oil (1L)', 'Mustard Oil (1L)', 'Refined White Sugar (1kg)', 'Iodized Table Salt (1kg)', 'Organic Turmeric Powder', 'Red Chilli Powder'],
    'Biscuits, Chocolates & Snacks': ['Marie Gold Biscuits', 'Dark Chocolate Bar', 'Salted Potato Chips', 'Butter Cashew Cookies', 'Crunchy Corn Puffs', 'Milk Chocolate Bar'],
    'Dairy & Beverages': ['Fresh Toned Milk (1L)', 'Pure Cow Ghee (500ml)', 'Mango Pulp Fruit Juice (1L)', 'Greek Plain Yogurt', 'Filter Coffee Powder (200g)', 'Organic Green Tea Bags'],
    'Personal Care': ['Moisturizing Bath Soap', 'Herbal Anti-Dandruff Shampoo', 'Mint Fresh Toothpaste', 'Gentle Aloe Face Wash', 'Pure Coconut Hair Oil'],
    'Home Care': ['Citrus Floor Cleaner (1L)', 'Antibacterial Detergent Powder', 'Lemon Dishwash Liquid Gel', 'Fabric Softener & Conditioner', 'Mosquito Repellent Vaporizer']
};

// Currency Formatter
function formatCurrency(val) {
    const num = parseFloat(val);
    if (isNaN(num)) return '$0.00';
    return '$' + num.toFixed(2);
}

// ==========================================================
// TOAST UTILITY
// ==========================================================
function showToast(message, type = 'info', title = '') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-circle-info';
    let defaultTitle = 'Notice';
    if (type === 'success') {
        icon = 'fa-circle-check';
        defaultTitle = 'Success';
    } else if (type === 'danger') {
        icon = 'fa-triangle-exclamation';
        defaultTitle = 'Error';
    } else if (type === 'warning') {
        icon = 'fa-circle-exclamation';
        defaultTitle = 'Attention';
    }

    toast.innerHTML = `
        <div style="font-size: 1.25rem; color: ${type === 'success' ? '#10b981' : type === 'danger' ? '#ef4444' : '#e67e22'};">
            <i class="fa-solid ${icon}"></i>
        </div>
        <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 0.85rem; color: var(--color-forest-dark);">${title || defaultTitle}</div>
            <div style="font-size: 0.825rem; color: var(--color-text-main); margin-top: 2px;">${message}</div>
        </div>
        <button style="background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 1.1rem;" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4500);
}

// ==========================================================
// CONFIRMATION MODAL UTILITY
// ==========================================================
function showConfirmModal({ title, message, onConfirm }) {
    let backdrop = document.getElementById('confirmModalBackdrop');
    if (backdrop) backdrop.remove();

    backdrop = document.createElement('div');
    backdrop.id = 'confirmModalBackdrop';
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
        <div class="modal-dialog">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h3 style="margin: 0; font-size: 1.2rem; color: var(--color-forest-dark);">${title || 'Confirm Action'}</h3>
            </div>
            <p style="color: var(--color-text-muted); font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.5;">${message}</p>
            <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button class="btn btn-outline" id="modalCancelBtn">Cancel</button>
                <button class="btn btn-danger" id="modalConfirmBtn"><i class="fa-solid fa-trash"></i> Yes, Delete Record</button>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);

    const cancelBtn = backdrop.querySelector('#modalCancelBtn');
    const confirmBtn = backdrop.querySelector('#modalConfirmBtn');

    cancelBtn.addEventListener('click', () => backdrop.remove());
    confirmBtn.addEventListener('click', () => {
        backdrop.remove();
        if (typeof onConfirm === 'function') onConfirm();
    });
}

// ==========================================================
// NAVIGATION & MYSQL HEALTH CHECK
// ==========================================================
async function checkDbHealth() {
    const dot = document.getElementById('navDbDot');
    const text = document.getElementById('navDbText');
    if (!dot || !text) return;

    try {
        const res = await fetch('/api/health');
        const data = await res.json();
        if (data.connected) {
            dot.className = 'status-dot online';
            text.textContent = 'MySQL: Connected';
            return true;
        } else {
            dot.className = 'status-dot offline';
            text.textContent = 'MySQL: Offline';
            return false;
        }
    } catch (e) {
        dot.className = 'status-dot offline';
        text.textContent = 'MySQL: Disconnected';
        return false;
    }
}

function initNavigation() {
    const toggle = document.getElementById('mobileToggle');
    const links = document.getElementById('navLinks');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('open'));
    }

    checkDbHealth();

    const statusBtn = document.getElementById('navStatus');
    if (statusBtn) {
        statusBtn.addEventListener('click', async () => {
            showToast('Checking MySQL connection...', 'info', 'Health Check');
            const isOnline = await checkDbHealth();
            if (isOnline) {
                showToast('MySQL database is connected and active.', 'success', 'Database Online');
            } else {
                showToast('Unable to connect to MySQL. Verify .env credentials.', 'danger', 'Connection Failed');
            }
        });
    }
}

// ==========================================================
// 1. HOME PAGE CONTROLLER (index.html)
// ==========================================================
async function initHomePage() {
    try {
        const res = await fetch('/api/stats');
        if (res.ok) {
            const data = await res.json();
            const totalEl = document.getElementById('homeTotalCount');
            const catEl = document.getElementById('homeCategoriesCount');
            const lowEl = document.getElementById('homeLowCount');
            const outEl = document.getElementById('homeOutCount');

            if (totalEl) totalEl.textContent = data.totalProducts ?? '0';
            if (catEl) catEl.textContent = data.totalCategories ?? '6';
            if (lowEl) lowEl.textContent = data.lowStockCount ?? '0';
            if (outEl) outEl.textContent = data.outOfStockCount ?? '0';

            // Populate Category-Wise Stock Summary Table directly from MySQL
            const summaryTableBody = document.getElementById('categorySummaryTableBody');
            if (summaryTableBody && data.categoryCounts && Array.isArray(data.categoryCounts)) {
                summaryTableBody.innerHTML = '';
                
                const catIcons = {
                    'Rice, Grains & Pulses': 'fa-bowl-rice',
                    'Cooking Essentials': 'fa-bottle-droplet',
                    'Biscuits, Chocolates & Snacks': 'fa-cookie-bite',
                    'Dairy & Beverages': 'fa-mug-hot',
                    'Personal Care': 'fa-pump-soap',
                    'Home Care': 'fa-spray-can-sparkles'
                };

                data.categoryCounts.forEach(c => {
                    const tr = document.createElement('tr');
                    const icon = catIcons[c.product_category] || 'fa-box';
                    const inStock = Number(c.in_stock) || 0;
                    const lowStock = Number(c.low_stock) || 0;
                    const outOfStock = Number(c.out_of_stock) || 0;
                    const total = Number(c.count) || 0;

                    tr.innerHTML = `
                        <td>
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--color-forest-soft); color: var(--color-forest-primary); display: flex; align-items: center; justify-content: center; font-size: 1rem;">
                                    <i class="fa-solid ${icon}"></i>
                                </div>
                                <div>
                                    <strong style="color: var(--color-forest-dark); font-size: 0.95rem;">${escapeHtml(c.product_category)}</strong>
                                </div>
                            </div>
                        </td>
                        <td style="text-align: center;"><span style="font-weight: 800; font-size: 1rem; color: var(--color-forest-dark);">${total}</span></td>
                        <td style="text-align: center;">
                            <a href="list.html?category=${encodeURIComponent(c.product_category)}&status=in_stock" class="badge badge-in-stock" style="text-decoration: none;" title="Filter In Stock in this category">
                                <i class="fa-solid fa-circle-check"></i> ${inStock} items
                            </a>
                        </td>
                        <td style="text-align: center;">
                            ${lowStock > 0 
                                ? `<a href="list.html?category=${encodeURIComponent(c.product_category)}&status=low_stock" class="badge badge-low-stock" style="text-decoration: none;" title="Filter Low Stock in this category"><i class="fa-solid fa-triangle-exclamation"></i> ${lowStock} items</a>`
                                : `<span style="color: var(--color-text-light); font-size: 0.85rem;">0 items</span>`
                            }
                        </td>
                        <td style="text-align: center;">
                            ${outOfStock > 0 
                                ? `<a href="list.html?category=${encodeURIComponent(c.product_category)}&status=out_of_stock" class="badge badge-out-stock" style="text-decoration: none;" title="Filter Out of Stock in this category"><i class="fa-solid fa-circle-xmark"></i> ${outOfStock} items</a>`
                                : `<span style="color: var(--color-text-light); font-size: 0.85rem;">0 items</span>`
                            }
                        </td>
                        <td style="text-align: center;">
                            <a href="list.html?category=${encodeURIComponent(c.product_category)}" class="btn btn-outline btn-sm">
                                <i class="fa-solid fa-eye"></i> View Items
                            </a>
                        </td>
                    `;
                    summaryTableBody.appendChild(tr);
                });
            }

            // Update category badge counts on category cards if present
            if (data.categoryCounts && Array.isArray(data.categoryCounts)) {
                data.categoryCounts.forEach(item => {
                    const countSpan = document.querySelector(`[data-cat-badge="${item.product_category}"]`);
                    if (countSpan) {
                        countSpan.textContent = `${item.count} items`;
                    }
                });
            }

            // Load Recent 5 Inventory Highlights from MySQL
            const recentBody = document.getElementById('recentProductsTableBody');
            if (recentBody) {
                try {
                    const recentRes = await fetch('/api/products?sort=id_desc&limit=5');
                    const recentData = await recentRes.json();
                    if (recentRes.ok && recentData.success && Array.isArray(recentData.data) && recentData.data.length > 0) {
                        recentBody.innerHTML = '';
                        recentData.data.forEach(p => {
                            const tr = document.createElement('tr');
                            const qty = Number(p.product_quantity);
                            const reorder = Number(p.reorder_level);
                            let badge = '';
                            if (qty === 0) {
                                badge = '<span class="badge badge-out-stock"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>';
                            } else if (qty <= reorder) {
                                badge = '<span class="badge badge-low-stock"><i class="fa-solid fa-triangle-exclamation"></i> Low Stock</span>';
                            } else {
                                badge = '<span class="badge badge-in-stock"><i class="fa-solid fa-circle-check"></i> In Stock</span>';
                            }
                            tr.innerHTML = `
                                <td><strong style="font-family: monospace; color: var(--color-forest-dark);">#${p.product_id}</strong></td>
                                <td>
                                    <div style="font-weight: 700; color: var(--color-text-dark);">${escapeHtml(p.product_name)}</div>
                                </td>
                                <td><span class="category-tag">${escapeHtml(p.product_category)}</span></td>
                                <td><strong style="color: var(--color-forest-primary);">${formatCurrency(p.product_price)}</strong></td>
                                <td><span style="font-weight: 700;">${qty}</span> units</td>
                                <td>${badge}</td>
                                <td style="text-align: center;">
                                    <a href="update.html?id=${encodeURIComponent(p.product_id)}" class="btn btn-outline btn-sm" title="Edit Product">
                                        <i class="fa-solid fa-pen-to-square"></i> Edit
                                    </a>
                                </td>
                            `;
                            recentBody.appendChild(tr);
                        });
                    } else {
                        recentBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 1.5rem; color: var(--color-text-muted);">No products registered yet.</td></tr>';
                    }
                } catch (e) {
                    recentBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 1.5rem; color: var(--color-text-muted);">Could not load recent products.</td></tr>';
                }
            }
        }
    } catch (e) {
        console.warn('Home stats fetch error:', e);
    }
}

// ==========================================================
// 2. INSERT PAGE CONTROLLER (insert.html)
// ==========================================================
function initInsertPage() {
    const form = document.getElementById('insertProductForm');
    const categorySelect = document.getElementById('product_category');
    const nameInput = document.getElementById('product_name');
    const chipsContainer = document.getElementById('categorySuggestions');
    const qtyInput = document.getElementById('product_quantity');
    const reorderInput = document.getElementById('reorder_level');
    const livePreview = document.getElementById('stockStatusPreview');
    const submitBtn = document.getElementById('btnSaveProduct');

    if (!form) return;

    // Render suggestions chips based on selected category
    function updateSuggestions(category) {
        if (!chipsContainer) return;
        chipsContainer.innerHTML = '';
        const list = CATEGORY_SUGGESTIONS[category] || [];
        if (list.length === 0) {
            chipsContainer.style.display = 'none';
            return;
        }

        chipsContainer.style.display = 'flex';
        const label = document.createElement('span');
        label.style.fontSize = '0.75rem';
        label.style.color = 'var(--color-text-muted)';
        label.style.width = '100%';
        label.textContent = 'Popular items (click to auto-fill):';
        chipsContainer.appendChild(label);

        list.forEach(item => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'suggestion-chip';
            chip.textContent = item;
            chip.addEventListener('click', () => {
                nameInput.value = item;
                nameInput.focus();
            });
            chipsContainer.appendChild(chip);
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            updateSuggestions(categorySelect.value);
        });
        if (categorySelect.value) {
            updateSuggestions(categorySelect.value);
        }
    }

    // Live Stock Status preview calculation
    function updateStockStatusPreview() {
        if (!livePreview) return;
        const q = parseInt(qtyInput?.value || '0', 10);
        const r = parseInt(reorderInput?.value || '0', 10);

        if (isNaN(q) || q === 0) {
            livePreview.innerHTML = '<span class="badge badge-out-stock"><i class="fa-solid fa-circle-xmark"></i> Out of Stock (0 units)</span>';
        } else if (q <= r) {
            livePreview.innerHTML = `<span class="badge badge-low-stock"><i class="fa-solid fa-triangle-exclamation"></i> Low Stock (${q} units &le; threshold ${r})</span>`;
        } else {
            livePreview.innerHTML = `<span class="badge badge-in-stock"><i class="fa-solid fa-circle-check"></i> In Stock (${q} healthy units)</span>`;
        }
    }

    if (qtyInput) qtyInput.addEventListener('input', updateStockStatusPreview);
    if (reorderInput) reorderInput.addEventListener('input', updateStockStatusPreview);

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const product_id = document.getElementById('product_id')?.value.trim();
        const product_name = nameInput?.value.trim();
        const product_category = categorySelect?.value;
        const product_price = parseFloat(document.getElementById('product_price')?.value);
        const product_quantity = parseInt(qtyInput?.value, 10);
        const reorder_level = parseInt(reorderInput?.value, 10);

        // Validation
        if (!product_name) {
            showToast('Please enter a product name.', 'warning', 'Validation');
            nameInput.focus();
            return;
        }
        if (!product_category) {
            showToast('Please select a supermarket category.', 'warning', 'Validation');
            categorySelect.focus();
            return;
        }
        if (isNaN(product_price) || product_price < 0) {
            showToast('Please enter a valid non-negative price.', 'warning', 'Validation');
            return;
        }
        if (isNaN(product_quantity) || product_quantity < 0) {
            showToast('Please enter a non-negative quantity.', 'warning', 'Validation');
            return;
        }
        if (isNaN(reorder_level) || reorder_level < 0) {
            showToast('Please enter a non-negative reorder level.', 'warning', 'Validation');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to MySQL...';

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: product_id || undefined,
                    product_name,
                    product_category,
                    product_price,
                    product_quantity,
                    reorder_level
                })
            });

            const result = await res.json();

            if (res.ok && result.success) {
                showToast(`"${product_name}" saved to inventory! (ID: ${result.product_id})`, 'success', 'Product Created');
                form.reset();
                updateStockStatusPreview();
                const banner = document.getElementById('insertSuccessBanner');
                if (banner) {
                    banner.style.display = 'flex';
                    document.getElementById('bannerProductId').textContent = result.product_id;
                    document.getElementById('bannerProductName').textContent = product_name;
                }
            } else {
                showToast(result.message || 'Could not save product to database.', 'danger', 'Save Failed');
            }
        } catch (err) {
            showToast('Network error while connecting to server.', 'danger', 'Network Error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Save Product';
        }
    });
}

// ==========================================================
// 3. VIEW PRODUCTS CONTROLLER (list.html)
// ==========================================================
let allProductsCache = [];

async function loadProductsList() {
    const tableBody = document.getElementById('productsTableBody');
    const loadingState = document.getElementById('listLoading');
    const emptyState = document.getElementById('listEmpty');
    const countDisplay = document.getElementById('listCountDisplay');

    if (!tableBody) return;

    if (loadingState) loadingState.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    try {
        const res = await fetch('/api/products');
        const data = await res.json();

        if (res.ok && data.success) {
            allProductsCache = data.data || [];
            
            // Populate autocomplete datalist for list search input
            const listDatalist = document.getElementById('listSearchSuggestions');
            if (listDatalist && allProductsCache.length > 0) {
                listDatalist.innerHTML = '';
                allProductsCache.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.product_name;
                    listDatalist.appendChild(opt);
                });
            }

            applyListFilters();
        } else {
            showToast(data.message || 'Failed to retrieve products from MySQL.', 'danger', 'Database Error');
            renderProductsTable([]);
        }
    } catch (e) {
        showToast('Server connection error.', 'danger', 'Error');
        renderProductsTable([]);
    } finally {
        if (loadingState) loadingState.style.display = 'none';
    }
}

function renderProductsTable(products) {
    const tableBody = document.getElementById('productsTableBody');
    const emptyState = document.getElementById('listEmpty');
    const countDisplay = document.getElementById('listCountDisplay');

    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (countDisplay) {
        countDisplay.textContent = `Showing ${products.length} product${products.length === 1 ? '' : 's'}`;
    }

    if (products.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    products.forEach(p => {
        const tr = document.createElement('tr');
        const qty = Number(p.product_quantity);
        const reorder = Number(p.reorder_level);

        let badgeHtml = '';
        if (qty === 0) {
            badgeHtml = '<span class="badge badge-out-stock"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>';
        } else if (qty <= reorder) {
            badgeHtml = '<span class="badge badge-low-stock"><i class="fa-solid fa-triangle-exclamation"></i> Low Stock</span>';
        } else {
            badgeHtml = '<span class="badge badge-in-stock"><i class="fa-solid fa-circle-check"></i> In Stock</span>';
        }

        tr.innerHTML = `
            <td><strong style="color: var(--color-forest-dark); font-family: monospace;">#${p.product_id}</strong></td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.65rem;">
                    <div style="width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--color-cream-surface); color: var(--color-forest-primary); display: flex; align-items: center; justify-content: center; font-size: 0.85rem;">
                        <i class="fa-solid fa-box"></i>
                    </div>
                    <span style="font-weight: 600; color: var(--color-text-dark);">${escapeHtml(p.product_name)}</span>
                </div>
            </td>
            <td><span class="category-tag">${escapeHtml(p.product_category || 'General')}</span></td>
            <td><strong style="color: var(--color-forest-primary);">${formatCurrency(p.product_price)}</strong></td>
            <td><span style="font-weight: 700;">${qty}</span> units</td>
            <td>${reorder}</td>
            <td>${badgeHtml}</td>
            <td>
                <div style="display: flex; gap: 0.4rem;">
                    <a href="update.html?id=${encodeURIComponent(p.product_id)}" class="btn btn-outline btn-sm" title="Edit Product">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </a>
                    <a href="delete.html?id=${encodeURIComponent(p.product_id)}" class="btn btn-danger btn-sm" title="Delete Product">
                        <i class="fa-solid fa-trash"></i>
                    </a>
                </div>
            </td>
        `;

        tableBody.appendChild(tr);
    });
}

function applyListFilters() {
    const searchInput = document.getElementById('listSearch');
    const catFilter = document.getElementById('listCategoryFilter');
    const statusFilter = document.getElementById('listStatusFilter');
    const sortFilter = document.getElementById('listSort');

    let filtered = [...allProductsCache];

    const term = (searchInput?.value || '').toLowerCase().trim();
    const cleanNum = term.replace(/^#/, '');
    const cat = catFilter?.value || 'all';
    const status = statusFilter?.value || 'all';
    const sort = sortFilter?.value || 'id_asc';

    if (term) {
        filtered = filtered.filter(p => {
            const idStr = String(p.product_id).toLowerCase();
            const nameStr = p.product_name.toLowerCase();
            return idStr === cleanNum || idStr.includes(term) || nameStr.includes(term);
        });
    }

    if (cat !== 'all') {
        filtered = filtered.filter(p => p.product_category === cat);
    }

    if (status === 'in_stock') {
        filtered = filtered.filter(p => Number(p.product_quantity) > Number(p.reorder_level));
    } else if (status === 'low_stock') {
        filtered = filtered.filter(p => Number(p.product_quantity) <= Number(p.reorder_level) && Number(p.product_quantity) > 0);
    } else if (status === 'out_of_stock') {
        filtered = filtered.filter(p => Number(p.product_quantity) === 0);
    }

    // Sort
    filtered.sort((a, b) => {
        switch (sort) {
            case 'name_asc': return a.product_name.localeCompare(b.product_name);
            case 'name_desc': return b.product_name.localeCompare(a.product_name);
            case 'price_asc': return parseFloat(a.product_price) - parseFloat(b.product_price);
            case 'price_desc': return parseFloat(b.product_price) - parseFloat(a.product_price);
            case 'qty_asc': return Number(a.product_quantity) - Number(b.product_quantity);
            case 'qty_desc': return Number(b.product_quantity) - Number(a.product_quantity);
            case 'id_desc': return Number(b.product_id) - Number(a.product_id);
            case 'id_asc':
            default:
                return Number(a.product_id) - Number(b.product_id);
        }
    });

    renderProductsTable(filtered);
}

function initListPage() {
    // Check if category or status is passed via URL query e.g. list.html?category=Dairy%20%26%20Beverages or list.html?status=out_of_stock
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category');
    const statusParam = urlParams.get('status');
    const searchParam = urlParams.get('search') || urlParams.get('q');
    const sortParam = urlParams.get('sort');

    const catFilter = document.getElementById('listCategoryFilter');
    const statusFilter = document.getElementById('listStatusFilter');
    const searchInput = document.getElementById('listSearch');
    const sortFilter = document.getElementById('listSort');
    const refreshBtn = document.getElementById('btnRefreshList');
    const clearBtn = document.getElementById('btnClearListFilters');

    if (catParam && catFilter) catFilter.value = catParam;
    if (statusParam && statusFilter) statusFilter.value = statusParam;
    if (searchParam && searchInput) searchInput.value = searchParam;
    if (sortParam && sortFilter) sortFilter.value = sortParam;

    loadProductsList();

    if (searchInput) searchInput.addEventListener('input', applyListFilters);
    if (catFilter) catFilter.addEventListener('change', applyListFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyListFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyListFilters);

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (catFilter) catFilter.value = 'all';
            if (statusFilter) statusFilter.value = 'all';
            if (sortFilter) sortFilter.value = 'id_asc';
            if (window.history.replaceState) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
            applyListFilters();
            showToast('Catalog filters reset.', 'info', 'Filters Cleared');
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            showToast('Refreshing products from MySQL...', 'info', 'Refresh');
            loadProductsList();
        });
    }
}

// ==========================================================
// 4. SEARCH PAGE CONTROLLER (search.html)
// ==========================================================
function initSearchPage() {
    const form = document.getElementById('searchProductForm');
    const input = document.getElementById('searchQueryInput');
    const catFilter = document.getElementById('searchCategoryFilter');
    const statusFilter = document.getElementById('searchStatusFilter');
    const sortFilter = document.getElementById('searchSort');
    const exactIdCheckbox = document.getElementById('exactIdCheckbox');
    const clearBtn = document.getElementById('btnClearSearch');
    const autocompleteList = document.getElementById('searchAutocompleteList');
    const container = document.getElementById('searchResultsContainer');
    const countDisplay = document.getElementById('searchResultsCount');
    const emptyState = document.getElementById('searchEmptyState');
    const initialPrompt = document.getElementById('searchInitialPrompt');

    if (!form || !input) return;

    // Autocomplete implementation
    let debounceTimer = null;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = input.value.trim();
        if (query.length < 1) {
            hideAutocomplete();
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/products/autocomplete?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.suggestions && data.suggestions.length > 0) {
                        renderAutocomplete(data.suggestions);
                    } else {
                        hideAutocomplete();
                    }
                }
            } catch (err) {
                hideAutocomplete();
            }
        }, 200);
    });

    function renderAutocomplete(items) {
        if (!autocompleteList) return;
        autocompleteList.innerHTML = '';
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'autocomplete-item';
            div.innerHTML = `
                <div>
                    <div class="autocomplete-item-title">${escapeHtml(item.product_name)}</div>
                    <div class="autocomplete-item-sub">ID: #${item.product_id} &bull; ${escapeHtml(item.product_category)}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 0.825rem; font-weight: 700; color: var(--color-forest-primary);">${formatCurrency(item.product_price)}</span>
                    <span class="badge ${item.stock_status === 'Out of Stock' ? 'badge-out-stock' : item.stock_status === 'Low Stock' ? 'badge-low-stock' : 'badge-in-stock'}">${item.stock_status}</span>
                </div>
            `;
            div.addEventListener('click', () => {
                input.value = item.product_name;
                hideAutocomplete();
                executeSearch();
            });
            autocompleteList.appendChild(div);
        });
        autocompleteList.style.display = 'block';
    }

    function hideAutocomplete() {
        if (autocompleteList) autocompleteList.style.display = 'none';
    }

    // Close autocomplete on click outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !autocompleteList?.contains(e.target)) {
            hideAutocomplete();
        }
    });

    // Close autocomplete on Escape key
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAutocomplete();
        }
    });

    // Clear Filters Button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            if (catFilter) catFilter.value = 'all';
            if (statusFilter) statusFilter.value = 'all';
            if (sortFilter) sortFilter.value = 'id_asc';
            if (exactIdCheckbox) exactIdCheckbox.checked = false;
            hideAutocomplete();
            container.innerHTML = '';
            if (countDisplay) {
                countDisplay.style.display = 'none';
                countDisplay.innerHTML = '';
            }
            if (emptyState) emptyState.style.display = 'none';
            if (initialPrompt) initialPrompt.style.display = 'block';
            showToast('Search filters cleared.', 'info', 'Filters Reset');
        });
    }

    // Auto-re-execute search when sort changes if results are already displayed
    if (sortFilter) {
        sortFilter.addEventListener('change', () => {
            if (container.children.length > 0 && (!initialPrompt || initialPrompt.style.display === 'none')) {
                executeSearch();
            }
        });
    }

    // Execute Search Function
    async function executeSearch() {
        hideAutocomplete();
        const term = input.value.trim();
        const cat = catFilter?.value || 'all';
        const status = statusFilter?.value || 'all';
        const sort = sortFilter?.value || 'id_asc';
        const isExactId = exactIdCheckbox?.checked;

        if (!term && cat === 'all' && status === 'all') {
            showToast('Please enter a Product ID or Name, or select a filter.', 'warning', 'Input Required');
            input.focus();
            return;
        }

        if (initialPrompt) initialPrompt.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
        container.innerHTML = '<div style="text-align: center; padding: 2.5rem;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--color-forest-primary);"></i><p style="margin-top: 0.65rem; color: var(--color-text-muted);">Querying MySQL supermarket database...</p></div>';

        try {
            let url = '/api/products?';
            const params = new URLSearchParams();

            if (term) {
                if (isExactId) {
                    params.append('id', term);
                } else {
                    params.append('search', term);
                }
            }

            if (cat !== 'all') {
                params.append('category', cat);
            }

            if (status !== 'all') {
                params.append('status', status);
            }

            if (sort) {
                params.append('sort', sort);
            }

            url += params.toString();

            const res = await fetch(url);
            const data = await res.json();

            container.innerHTML = '';

            if (res.ok && data.success && data.data && data.data.length > 0) {
                if (emptyState) emptyState.style.display = 'none';
                
                const count = data.data.length;
                if (countDisplay) {
                    countDisplay.style.display = 'flex';
                    countDisplay.innerHTML = `
                        <span><i class="fa-solid fa-circle-check" style="margin-right: 6px;"></i> Found <strong>${count}</strong> matching supermarket product${count === 1 ? '' : 's'} in MySQL</span>
                        <span style="font-size: 0.8rem; font-weight: normal; color: var(--color-text-muted);">Real-time database query</span>
                    `;
                }

                data.data.forEach(p => {
                    const qty = Number(p.product_quantity);
                    const reorder = Number(p.reorder_level);
                    let badgeHtml = '';
                    if (qty === 0) {
                        badgeHtml = '<span class="badge badge-out-stock"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>';
                    } else if (qty <= reorder) {
                        badgeHtml = '<span class="badge badge-low-stock"><i class="fa-solid fa-triangle-exclamation"></i> Low Stock</span>';
                    } else {
                        badgeHtml = '<span class="badge badge-in-stock"><i class="fa-solid fa-circle-check"></i> In Stock</span>';
                    }

                    const card = document.createElement('div');
                    card.className = 'card';
                    card.style.marginBottom = '1.25rem';
                    card.style.borderLeft = qty === 0 ? '4px solid #ef4444' : qty <= reorder ? '4px solid var(--color-orange-accent)' : '4px solid var(--color-forest-primary)';
                    
                    card.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.75rem;">
                            <div>
                                <span style="font-family: monospace; font-size: 0.85rem; font-weight: 700; color: var(--color-forest-dark);">ID: #${p.product_id}</span>
                                <h3 style="font-size: 1.25rem; color: var(--color-forest-dark); margin-top: 0.25rem;">${escapeHtml(p.product_name)}</h3>
                                <div style="margin-top: 0.35rem;">
                                    <span class="category-tag">${escapeHtml(p.product_category)}</span>
                                </div>
                            </div>
                            <div>${badgeHtml}</div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 0.75rem; background: var(--color-cream-surface); padding: 0.85rem 1rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
                            <div>
                                <span style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 600;">Price</span>
                                <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-forest-dark);">${formatCurrency(p.product_price)}</div>
                            </div>
                            <div>
                                <span style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 600;">Current Stock</span>
                                <div style="font-size: 1.15rem; font-weight: 800; color: ${qty === 0 ? '#ef4444' : qty <= reorder ? 'var(--color-orange-accent)' : 'var(--color-forest-dark)'};">${qty} units</div>
                            </div>
                            <div>
                                <span style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 600;">Reorder Level</span>
                                <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-forest-dark);">${reorder} units</div>
                            </div>
                            <div>
                                <span style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 600;">Status</span>
                                <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-forest-dark); margin-top: 2px;">${p.stock_status}</div>
                            </div>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; flex-wrap: wrap;">
                            <a href="update.html?id=${encodeURIComponent(p.product_id)}" class="btn btn-outline btn-sm">
                                <i class="fa-solid fa-pen-to-square"></i> Edit
                            </a>
                            <a href="delete.html?id=${encodeURIComponent(p.product_id)}" class="btn btn-danger btn-sm">
                                <i class="fa-solid fa-trash"></i> Delete
                            </a>
                        </div>
                    `;
                    container.appendChild(card);
                });
            } else {
                if (countDisplay) {
                    countDisplay.style.display = 'none';
                    countDisplay.innerHTML = '';
                }
                if (emptyState) {
                    emptyState.style.display = 'block';
                    const echoSpan = document.getElementById('searchEchoTerm');
                    if (echoSpan) echoSpan.textContent = term || (cat !== 'all' ? cat : status);
                }
            }
        } catch (err) {
            container.innerHTML = '';
            showToast('Search query failed. Please verify MySQL connection.', 'danger', 'Error');
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        executeSearch();
    });

    // Check if query is passed via URL (e.g., search.html?q=rice or search.html?category=Home%20Care)
    const urlParams = new URLSearchParams(window.location.search);
    const qParam = urlParams.get('q') || urlParams.get('search');
    const catParam = urlParams.get('category');
    const statusParam = urlParams.get('status');
    const idParam = urlParams.get('id');

    if (qParam && input) input.value = qParam;
    if (idParam && input) {
        input.value = idParam;
        if (exactIdCheckbox) exactIdCheckbox.checked = true;
    }
    if (catParam && catFilter) catFilter.value = catParam;
    if (statusParam && statusFilter) statusFilter.value = statusParam;

    if (qParam || idParam || (catParam && catParam !== 'all') || (statusParam && statusParam !== 'all')) {
        executeSearch();
    }
}

// ==========================================================
// 5. UPDATE PAGE CONTROLLER (update.html)
// ==========================================================
function initUpdatePage() {
    const lookupForm = document.getElementById('lookupProductForm');
    const lookupInput = document.getElementById('lookupProductId');
    const datalist = document.getElementById('updateProductSuggestions');
    const updateCard = document.getElementById('updateFormCard');
    const updateForm = document.getElementById('updateProductForm');
    const editStockBadge = document.getElementById('editStockStatusBadge');
    const btnResetLookup = document.getElementById('btnResetLookup');

    const qtyInput = document.getElementById('edit_product_quantity');
    const reorderInput = document.getElementById('edit_reorder_level');

    // Update real-time stock status preview badge
    function refreshStockPreviewBadge() {
        if (!editStockBadge || !qtyInput || !reorderInput) return;
        const q = parseInt(qtyInput.value, 10);
        const r = parseInt(reorderInput.value, 10);
        if (isNaN(q) || isNaN(r)) return;

        if (q === 0) {
            editStockBadge.className = 'badge badge-out-stock';
            editStockBadge.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Out of Stock (0 units)';
        } else if (q <= r) {
            editStockBadge.className = 'badge badge-low-stock';
            editStockBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Low Stock (${q} units)`;
        } else {
            editStockBadge.className = 'badge badge-in-stock';
            editStockBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> In Stock (${q} units)`;
        }
    }

    if (qtyInput) qtyInput.addEventListener('input', refreshStockPreviewBadge);
    if (reorderInput) reorderInput.addEventListener('input', refreshStockPreviewBadge);

    // Dynamic autocomplete datalist as user types in lookup input
    let debounceTimer = null;
    if (lookupInput && datalist) {
        lookupInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const val = lookupInput.value.trim();
            if (!val || val.length < 1) {
                datalist.innerHTML = '';
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    const res = await fetch(`/api/products/autocomplete?q=${encodeURIComponent(val)}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.success && Array.isArray(data.suggestions)) {
                            datalist.innerHTML = '';
                            data.suggestions.forEach(item => {
                                const option = document.createElement('option');
                                option.value = `#${item.product_id} - ${item.product_name}`;
                                option.textContent = `${item.product_category} | ${formatCurrency(item.product_price)} | Qty: ${item.product_quantity}`;
                                datalist.appendChild(option);
                            });
                        }
                    }
                } catch (e) {
                    // Silent catch for background suggestion error
                }
            }, 250);
        });
    }

    // Helper to extract clean numeric ID from raw string (e.g. "5", "#5", or "#5 - Basmati Rice")
    function parseNumericId(raw) {
        if (!raw) return null;
        const match = raw.match(/#?(\d+)/);
        return match ? match[1] : null;
    }

    // Auto-fill from URL param ?id=...
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');
    if (idFromUrl && lookupInput) {
        const clean = parseNumericId(idFromUrl) || idFromUrl;
        lookupInput.value = clean;
        loadProductForUpdate(clean);
    }

    if (lookupForm) {
        lookupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const rawVal = lookupInput.value.trim();
            const id = parseNumericId(rawVal);
            if (!id) {
                showToast('Please enter or select a valid Product ID.', 'warning', 'Input Required');
                return;
            }
            loadProductForUpdate(id);
        });
    }

    if (btnResetLookup) {
        btnResetLookup.addEventListener('click', () => {
            if (updateCard) updateCard.style.display = 'none';
            if (lookupInput) {
                lookupInput.value = '';
                lookupInput.focus();
            }
        });
    }

    async function loadProductForUpdate(id) {
        const btn = document.getElementById('btnLookupProduct');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Finding...';
        }

        try {
            const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
            const result = await res.json();

            if (res.ok && result.success && result.data) {
                const p = result.data;
                document.getElementById('edit_product_id').value = p.product_id;
                document.getElementById('edit_product_name').value = p.product_name;
                document.getElementById('edit_product_category').value = p.product_category;
                document.getElementById('edit_product_price').value = parseFloat(p.product_price).toFixed(2);
                document.getElementById('edit_product_quantity').value = p.product_quantity;
                document.getElementById('edit_reorder_level').value = p.reorder_level;

                refreshStockPreviewBadge();

                if (updateCard) {
                    updateCard.style.display = 'block';
                    updateCard.scrollIntoView({ behavior: 'smooth' });
                }
                showToast(`Product "${p.product_name}" (ID #${p.product_id}) loaded.`, 'success', 'Loaded');
            } else {
                showToast(result.message || `Product ID "${id}" was not found in MySQL.`, 'danger', 'Not Found');
                if (updateCard) updateCard.style.display = 'none';
            }
        } catch (err) {
            showToast('Error connecting to MySQL database server.', 'danger', 'Error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Find Product';
            }
        }
    }

    if (updateForm) {
        updateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit_product_id').value.trim();
            const name = document.getElementById('edit_product_name').value.trim();
            const category = document.getElementById('edit_product_category').value;
            const price = parseFloat(document.getElementById('edit_product_price').value);
            const qty = parseInt(document.getElementById('edit_product_quantity').value, 10);
            const reorder = parseInt(document.getElementById('edit_reorder_level').value, 10);
            const saveBtn = document.getElementById('btnSaveUpdate');

            if (!name) {
                showToast('Product name cannot be empty.', 'warning', 'Validation');
                return;
            }
            if (isNaN(price) || price < 0) {
                showToast('Price must be a valid non-negative number.', 'warning', 'Validation');
                return;
            }
            if (isNaN(qty) || qty < 0) {
                showToast('Quantity must be a valid non-negative integer.', 'warning', 'Validation');
                return;
            }
            if (isNaN(reorder) || reorder < 0) {
                showToast('Reorder level must be a valid non-negative integer.', 'warning', 'Validation');
                return;
            }

            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating in MySQL...';

            try {
                const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        product_name: name,
                        product_category: category,
                        product_price: price,
                        product_quantity: qty,
                        reorder_level: reorder
                    })
                });

                const result = await res.json();

                if (res.ok && result.success) {
                    showToast(`Product "${name}" updated successfully!`, 'success', 'Update Complete');
                    refreshStockPreviewBadge();
                    const banner = document.getElementById('updateSuccessBanner');
                    if (banner) {
                        banner.style.display = 'flex';
                        const info = document.getElementById('updatedProductInfo');
                        if (info) {
                            info.textContent = `${name} (ID: #${id}) — ${category} — ${formatCurrency(price)} — ${qty} in stock`;
                        }
                        banner.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    showToast(result.message || 'Update failed in MySQL.', 'danger', 'Error');
                }
            } catch (err) {
                showToast('Network error during update.', 'danger', 'Error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes to MySQL';
            }
        });
    }
}

// ==========================================================
// 6. DELETE PAGE CONTROLLER (delete.html)
// ==========================================================
function initDeletePage() {
    const lookupForm = document.getElementById('deleteLookupForm');
    const lookupInput = document.getElementById('deleteLookupId');
    const datalist = document.getElementById('deleteProductSuggestions');
    const previewCard = document.getElementById('deletePreviewCard');
    const btnExecuteDelete = document.getElementById('btnExecuteDelete');
    let loadedProductId = null;
    let loadedProductName = '';

    // Helper to extract clean numeric ID
    function parseNumericId(raw) {
        if (!raw) return null;
        const match = raw.match(/#?(\d+)/);
        return match ? match[1] : null;
    }

    // Dynamic autocomplete datalist as user types
    let debounceTimer = null;
    if (lookupInput && datalist) {
        lookupInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const val = lookupInput.value.trim();
            if (!val || val.length < 1) {
                datalist.innerHTML = '';
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    const res = await fetch(`/api/products/autocomplete?q=${encodeURIComponent(val)}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.success && Array.isArray(data.suggestions)) {
                            datalist.innerHTML = '';
                            data.suggestions.forEach(item => {
                                const option = document.createElement('option');
                                option.value = `#${item.product_id} - ${item.product_name}`;
                                option.textContent = `${item.product_category} | ${formatCurrency(item.product_price)} | Qty: ${item.product_quantity}`;
                                datalist.appendChild(option);
                            });
                        }
                    }
                } catch (e) {
                    // background autocomplete failover
                }
            }, 250);
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');
    if (idFromUrl && lookupInput) {
        const clean = parseNumericId(idFromUrl) || idFromUrl;
        lookupInput.value = clean;
        loadProductForDelete(clean);
    }

    if (lookupForm) {
        lookupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const rawVal = lookupInput.value.trim();
            const id = parseNumericId(rawVal);
            if (!id) {
                showToast('Please enter or select a valid Product ID.', 'warning', 'Input Required');
                return;
            }
            loadProductForDelete(id);
        });
    }

    async function loadProductForDelete(id) {
        const btn = document.getElementById('btnDeleteLookup');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking...';
        }

        try {
            const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
            const result = await res.json();

            if (res.ok && result.success && result.data) {
                const p = result.data;
                loadedProductId = p.product_id;
                loadedProductName = p.product_name;

                document.getElementById('del_id').textContent = `#${p.product_id}`;
                document.getElementById('del_name').textContent = p.product_name;
                document.getElementById('del_category').textContent = p.product_category;
                document.getElementById('del_price').textContent = formatCurrency(p.product_price);
                document.getElementById('del_quantity').textContent = `${p.product_quantity} units`;
                document.getElementById('del_reorder').textContent = `${p.reorder_level} units`;

                if (previewCard) {
                    previewCard.style.display = 'block';
                    previewCard.scrollIntoView({ behavior: 'smooth' });
                }
                showToast(`Product "${p.product_name}" located. Ready for deletion review.`, 'warning', 'Item Found');
            } else {
                showToast(result.message || `Product ID "${id}" was not found.`, 'danger', 'Not Found');
                if (previewCard) previewCard.style.display = 'none';
                loadedProductId = null;
            }
        } catch (e) {
            showToast('Error connecting to MySQL.', 'danger', 'Error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Find Product';
            }
        }
    }

    if (btnExecuteDelete) {
        btnExecuteDelete.addEventListener('click', () => {
            if (!loadedProductId) return;

            showConfirmModal({
                title: 'Confirm Supermarket Product Deletion',
                message: `Are you sure you want to permanently delete <strong>"${loadedProductName}"</strong> (ID: #${loadedProductId}) from MySQL? This action cannot be undone.`,
                onConfirm: async () => {
                    btnExecuteDelete.disabled = true;
                    btnExecuteDelete.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting from MySQL...';

                    try {
                        const res = await fetch(`/api/products/${encodeURIComponent(loadedProductId)}`, {
                            method: 'DELETE'
                        });
                        const result = await res.json();

                        if (res.ok && result.success) {
                            showToast(`Product #${loadedProductId} removed from database.`, 'success', 'Deleted');
                            if (previewCard) previewCard.style.display = 'none';
                            const banner = document.getElementById('deleteSuccessBanner');
                            if (banner) {
                                banner.style.display = 'flex';
                                document.getElementById('deletedProductInfo').textContent = `Product "${loadedProductName}" (ID: #${loadedProductId}) was removed.`;
                            }
                            if (lookupInput) lookupInput.value = '';
                            loadedProductId = null;
                        } else {
                            showToast(result.message || 'Could not delete product.', 'danger', 'Delete Error');
                        }
                    } catch (err) {
                        showToast('Network error during delete.', 'danger', 'Error');
                    } finally {
                        btnExecuteDelete.disabled = false;
                        btnExecuteDelete.innerHTML = '<i class="fa-solid fa-trash"></i> Confirm & Delete from MySQL';
                    }
                }
            });
        });
    }
}

// ==========================================================
// 7. LOW STOCK CONTROLLER (low-stock.html)
// ==========================================================
async function initLowStockPage() {
    const tableBody = document.getElementById('lowStockTableBody');
    const emptyState = document.getElementById('lowStockEmpty');
    const loadingState = document.getElementById('lowStockLoading');
    const countBadge = document.getElementById('lowStockCountBadge');
    const catFilter = document.getElementById('lowStockCategoryFilter');
    const statusFilter = document.getElementById('lowStockStatusFilter');

    if (!tableBody) return;

    if (loadingState) loadingState.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    async function fetchLowStock() {
        const cat = catFilter?.value || 'all';
        const status = statusFilter?.value || 'all';

        let url = `/api/products/low-stock?category=${encodeURIComponent(cat)}`;
        if (status !== 'all') {
            url += `&status=${encodeURIComponent(status)}`;
        }

        try {
            const res = await fetch(url);
            const data = await res.json();

            tableBody.innerHTML = '';

            if (res.ok && data.success && data.data && data.data.length > 0) {
                if (emptyState) emptyState.style.display = 'none';
                if (countBadge) countBadge.textContent = `${data.data.length} Items Need Restocking`;

                data.data.forEach(p => {
                    const tr = document.createElement('tr');
                    const qty = Number(p.product_quantity);
                    const reorder = Number(p.reorder_level);
                    const deficit = Number(p.unit_deficit) || (reorder - qty);

                    let badgeHtml = '';
                    if (qty === 0) {
                        badgeHtml = '<span class="badge badge-out-stock"><i class="fa-solid fa-circle-xmark"></i> OUT OF STOCK (0)</span>';
                    } else {
                        badgeHtml = '<span class="badge badge-low-stock"><i class="fa-solid fa-triangle-exclamation"></i> LOW STOCK</span>';
                    }

                    tr.innerHTML = `
                        <td><strong style="font-family: monospace; color: var(--color-forest-dark);">#${p.product_id}</strong></td>
                        <td>
                            <strong style="color: var(--color-text-dark);">${escapeHtml(p.product_name)}</strong>
                        </td>
                        <td><span class="category-tag">${escapeHtml(p.product_category)}</span></td>
                        <td><strong>${formatCurrency(p.product_price)}</strong></td>
                        <td>
                            <span style="font-weight: 800; color: ${qty === 0 ? '#dc2626' : '#d97706'}; font-size: 1.05rem;">
                                ${qty} units
                            </span>
                        </td>
                        <td>${reorder}</td>
                        <td>
                            <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #fff7ed; border: 1px solid #fed7aa; color: #c2410c; border-radius: 4px; font-weight: 700;">
                                +${deficit} needed
                            </span>
                        </td>
                        <td>${badgeHtml}</td>
                        <td>
                            <a href="update.html?id=${encodeURIComponent(p.product_id)}" class="btn btn-orange btn-sm" title="Restock Item">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i> Restock
                            </a>
                        </td>
                    `;
                    tableBody.appendChild(tr);
                });
            } else {
                if (emptyState) emptyState.style.display = 'block';
                if (countBadge) countBadge.textContent = 'All Stock Healthy';
            }
        } catch (e) {
            showToast('Error loading low stock items.', 'danger', 'Error');
        } finally {
            if (loadingState) loadingState.style.display = 'none';
        }
    }

    if (catFilter) catFilter.addEventListener('change', fetchLowStock);
    if (statusFilter) statusFilter.addEventListener('change', fetchLowStock);

    fetchLowStock();
}

// Utility to escape HTML strings
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Global Initialization on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();

    const pageId = document.body.dataset.page;
    if (pageId === 'home') initHomePage();
    else if (pageId === 'insert') initInsertPage();
    else if (pageId === 'list') initListPage();
    else if (pageId === 'search') initSearchPage();
    else if (pageId === 'update') initUpdatePage();
    else if (pageId === 'delete') initDeletePage();
    else if (pageId === 'low-stock') initLowStockPage();
});
