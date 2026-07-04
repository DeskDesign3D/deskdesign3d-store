// Cart management
let cart = [];

// DOM cache
const DOM = {
    productGrid: null,
    cartList: null,
    totalElement: null,
    checkoutBtn: null,
};

// Initialize DOM cache
function initCartDOM() {
    DOM.productGrid = document.getElementById("productGrid");
    DOM.cartList = document.getElementById("cartList");
    DOM.totalElement = document.getElementById("total");
    DOM.checkoutBtn = document.getElementById("checkoutBtn");
}

// Load cart from localStorage
function loadCartFromStorage() {
    try {
        const saved = localStorage.getItem("cart");
        if (saved) {
            cart = JSON.parse(saved);
            updateCart();
        }
    } catch (err) {
        console.error("Error loading cart from storage:", err.message);
        cart = [];
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem("cart", JSON.stringify(cart));
    } catch (err) {
        console.error("Error saving cart to storage:", err.message);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Load products from Supabase
async function loadProducts() {
    if (!DOM.productGrid) {
        DOM.productGrid = document.getElementById("productGrid");
    }

    try {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            DOM.productGrid.innerHTML = `<p class="error">Error loading products: ${error.message}</p>`;
            console.error("Product load error:", error);
            return;
        }

        DOM.productGrid.innerHTML = "";

        if (!data || data.length === 0) {
            DOM.productGrid.innerHTML = "<p>No products available.</p>";
            return;
        }

        data.forEach(product => {
            const div = document.createElement("div");
            div.className = "card";

            const imageHtml = product.image 
                ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">` 
                : "";

            const price = typeof product.price === 'number' ? product.price : parseFloat(product.price);
            if (isNaN(price)) {
                console.warn(`Invalid price for product ${product.id}:`, product.price);
                return;
            }

            div.innerHTML = `
                ${imageHtml}
                <h3>${escapeHtml(product.name)}</h3>
                <div class="price">€${price.toFixed(2)}</div>
                <button onclick="addToCart('${product.id}', '${escapeHtml(product.name)}', ${price})">
                    Add to cart
                </button>
            `;

            DOM.productGrid.appendChild(div);
        });
    } catch (err) {
        DOM.productGrid.innerHTML = `<p class="error">Unexpected error: ${err.message}</p>`;
        console.error("Unexpected product load error:", err);
    }
}

// Add to cart
function addToCart(id, name, price) {
    // Validate inputs
    if (!id || !name || isNaN(price) || price <= 0) {
        console.error("Invalid product data:", { id, name, price });
        return;
    }

    cart.push({ id, name, price: parseFloat(price) });
    saveCartToStorage();
    updateCart();
}

// Remove item from cart
function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCartToStorage();
        updateCart();
    }
}

// Update cart UI
function updateCart() {
    if (!DOM.cartList || !DOM.totalElement) {
        DOM.cartList = document.getElementById("cartList");
        DOM.totalElement = document.getElementById("total");
    }

    DOM.cartList.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        DOM.cartList.innerHTML = "<li>Your cart is empty</li>";
        DOM.totalElement.textContent = "0.00";
        return;
    }

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "cart-item";

        const price = typeof item.price === 'number' ? item.price : parseFloat(item.price);
        if (isNaN(price)) {
            console.warn("Invalid price in cart:", item);
            return;
        }

        li.innerHTML = `
            <span>${escapeHtml(item.name)} - €${price.toFixed(2)}</span>
            <button onclick="removeFromCart(${index})" class="remove-btn">Remove</button>
        `;
        DOM.cartList.appendChild(li);
        total += price;
    });

    DOM.totalElement.textContent = total.toFixed(2);
}

// Checkout
async function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty");
        return;
    }

    const email = prompt("Enter your email:");
    if (!email || !email.trim()) return;

    const firstName = prompt("First name:");
    if (!firstName || !firstName.trim()) return;

    const lastName = prompt("Last name:");
    if (!lastName || !lastName.trim()) return;

    const total = cart.reduce((sum, item) => {
        const price = typeof item.price === 'number' ? item.price : parseFloat(item.price);
        return sum + (isNaN(price) ? 0 : price);
    }, 0);

    if (DOM.checkoutBtn) {
        DOM.checkoutBtn.disabled = true;
        DOM.checkoutBtn.textContent = "Processing...";
    }

    try {
        const { error } = await supabase
            .from("orders")
            .insert([
                {
                    email: email.trim(),
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    total,
                    items: cart,
                    status: "pending"
                }
            ]);

        if (error) {
            alert(`Error placing order: ${error.message}`);
            console.error("Order error:", error);
            return;
        }

        alert("Order placed successfully! Thank you for your purchase.");
        cart = [];
        saveCartToStorage();
        updateCart();
    } catch (err) {
        alert(`Unexpected error: ${err.message}`);
        console.error("Checkout error:", err);
    } finally {
        if (DOM.checkoutBtn) {
            DOM.checkoutBtn.disabled = false;
            DOM.checkoutBtn.textContent = "Checkout";
        }
    }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    initCartDOM();
    loadCartFromStorage();
    loadProducts();
});