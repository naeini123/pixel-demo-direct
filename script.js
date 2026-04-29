// =============================================================================
// script.js  –  Liverpool Fan Shop  |  Meta Pixel Demo Foundation
// =============================================================================
// Pixel base code is loaded in each page's <head>.
// Standard event calls are marked with TODO comments below.
// Replace YOUR_PIXEL_ID everywhere before going live.
// =============================================================================

// ─── Product ID map ───────────────────────────────────────────────────────────
const productIds = {
    'Liverpool Jersey':               'liverpool-jersey',
    'Nike Air Max - Liverpool Shoes': 'nike-air-max-liverpool',
    'Liverpool 24-25 Champions Shirt':'lfc-champions-shirt-2425'
};

// ─── Cart state ───────────────────────────────────────────────────────────────
let cart = {};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function updateCartCount() {
    const el = document.getElementById('cart-count');
    if (!el) return;
    const count = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
    el.textContent = count;
}

function getCartTotal() {
    return Object.values(cart).reduce((acc, item) => acc + item.price * item.quantity, 0);
}

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    try {
        const stored = localStorage.getItem('cart');
        if (stored) cart = JSON.parse(stored);
    } catch (e) {
        cart = {};
    }
    updateCartCount();
}

function showNotification(message) {
    const note = document.createElement('div');
    note.classList.add('notification');
    note.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 20 20">
            <path d="M10 2C5.14 2 1 5.14 1 10s4.14 8 9 8 9-4.14 9-8S14.86 2 10 2z"/>
        </svg>
        <span>${message}</span>`;
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 3000);
}

// ─── Initialise on every page load ───────────────────────────────────────────
loadCartFromLocalStorage();

// =============================================================================
// DOMContentLoaded – wire up all event listeners
// =============================================================================
document.addEventListener('DOMContentLoaded', function () {

    // ── Add to Cart buttons (index.html & products.html) ─────────────────────
    // Each button carries data-id, data-name, and data-price attributes.
    document.querySelectorAll('.add-to-cart-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const contentId   = btn.dataset.id;
            const contentName = btn.dataset.name;
            const price       = parseFloat(btn.dataset.price);

            // Update cart state
            addToCart(contentName, price);

            // ================================================================
            // TODO: META PIXEL STANDARD EVENT – AddToCart
            // Fire AddToCart when a user clicks "Add to Cart".
            // ================================================================
            fbq('track', 'AddToCart', {
                content_ids:  [contentId],
                content_type: 'product',
                contents:     [{ id: contentId, quantity: 1 }],
                content_name: contentName,
                currency:     'USD',
                value:        price
            });
        });
    });

    // ── Checkout button (cart.html) ───────────────────────────────────────────
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        displayCartTable();

        checkoutBtn.addEventListener('click', function () {
            const contents   = buildContents();
            const contentIds = contents.map(c => c.id);
            const numItems   = Object.values(cart).reduce((a, i) => a + i.quantity, 0);
            const total      = getCartTotal();

            // ================================================================
            // TODO: META PIXEL STANDARD EVENT – InitiateCheckout
            // Fire InitiateCheckout when the user clicks "Proceed to Checkout".
            // ================================================================
            // fbq('track', 'InitiateCheckout', {
            //     content_ids: contentIds,
            //     contents:    contents,
            //     currency:    'USD',
            //     num_items:   numItems,
            //     value:       total
            // });

            window.location.href = 'checkout.html';
        });
    }

    // ── Purchase button (checkout.html) ──────────────────────────────────────
    const purchaseBtn = document.getElementById('purchase-btn');
    if (purchaseBtn) {
        displayCartSummary();
        syncCheckoutFormFields();

        purchaseBtn.addEventListener('click', function () {
            syncCheckoutFormFields();

            // Clear cart and redirect to confirmation page.
            // Purchase event fires on purchase-confirmation.html on page load.
            cart = {};
            saveCartToLocalStorage();
            updateCartCount();
            window.location.href = 'purchase-confirmation.html';
        });
    }

    // ── Confirmation page (purchase-confirmation.html) ────────────────────────
    // Purchase is fired here on page load — this ensures only real confirmed
    // orders are counted, not just button clicks that may fail at payment.
    if (document.querySelector('.confirmation-card')) {

        // ====================================================================
        // TODO: META PIXEL STANDARD EVENT – Purchase
        // Fire Purchase on page load of the confirmation page.
        // Retrieve order value and contents from sessionStorage if needed.
        // ====================================================================
        // fbq('track', 'Purchase', {
        //     content_ids:  [],   // TODO: populate from sessionStorage
        //     content_type: 'product',
        //     contents:     [],   // TODO: populate from sessionStorage
        //     currency:     'USD',
        //     num_items:    0,    // TODO: populate from sessionStorage
        //     value:        0.00  // TODO: populate from sessionStorage
        // });
    }

});

// =============================================================================
// Cart helpers
// =============================================================================

/** Build a contents array from the current cart for Pixel event payloads. */
function buildContents() {
    return Object.keys(cart).map(function (name) {
        return {
            id:       productIds[name] || name.toLowerCase().replace(/\s+/g, '-'),
            quantity: cart[name].quantity
        };
    });
}

/** Add an item to the cart and show a notification. */
function addToCart(name, price) {
    if (cart[name]) {
        cart[name].quantity++;
    } else {
        cart[name] = { price: price, quantity: 1 };
    }
    updateCartCount();
    showNotification('Added ' + name + ' to cart!');
    saveCartToLocalStorage();
}

/** Remove an item from the cart. */
function removeFromCart(name) {
    delete cart[name];
    updateCartCount();
    saveCartToLocalStorage();
    displayCartTable(); // refresh table if on cart page
}

// =============================================================================
// Page-specific render functions
// =============================================================================

/** Render the cart table on cart.html. */
function displayCartTable() {
    const tbody = document.getElementById('cart-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (Object.keys(cart).length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="cart-empty">' +
            'Your cart is empty. <a href="products.html">Continue shopping</a></td></tr>';
    } else {
        Object.keys(cart).forEach(function (name) {
            const row = document.createElement('tr');
            row.innerHTML =
                '<td>' + name + '</td>' +
                '<td>$' + cart[name].price.toFixed(2) + '</td>' +
                '<td>' + cart[name].quantity + '</td>' +
                '<td>$' + (cart[name].price * cart[name].quantity).toFixed(2) + '</td>';
            tbody.appendChild(row);
        });
    }

    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = getCartTotal().toFixed(2);
}

/** Render the order summary table on checkout.html. */
function displayCartSummary() {
    const tbody = document.getElementById('cart-summary-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    Object.keys(cart).forEach(function (name) {
        const row = document.createElement('tr');
        row.innerHTML =
            '<td>' + name + '</td>' +
            '<td style="text-align:center">' + cart[name].quantity + '</td>' +
            '<td style="text-align:right">$' + (cart[name].price * cart[name].quantity).toFixed(2) + '</td>';
        tbody.appendChild(row);
    });

    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = getCartTotal().toFixed(2);
}

/** Keep user PII variables in sync with the checkout form inputs. */
function syncCheckoutFormFields() {
    // These variables are available globally for use in Pixel advanced matching.
    window.userEmail = (document.getElementById('email') || {}).value || '';
    window.userName  = (document.getElementById('name')  || {}).value || '';
    window.userCity  = (document.getElementById('city')  || {}).value || '';
    window.userZip   = (document.getElementById('zip')   || {}).value || '';
}
