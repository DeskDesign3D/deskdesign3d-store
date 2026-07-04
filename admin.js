// Cache DOM elements to avoid repeated queries
const DOM = {
    nameInput: null,
    priceInput: null,
    imageInput: null,
    addProductBtn: null,
    productList: null,
    messageContainer: null,
};

// Initialize DOM cache
function initAdminDOM() {
    DOM.nameInput = document.getElementById("name");
    DOM.priceInput = document.getElementById("price");
    DOM.imageInput = document.getElementById("image");
    DOM.addProductBtn = document.getElementById("addProductBtn");
    DOM.productList = document.getElementById("productList");
    DOM.messageContainer = document.getElementById("messageContainer");
}

// Show feedback message (non-blocking)
function showAdminMessage(message, type = "info") {
    if (!DOM.messageContainer) {
        DOM.messageContainer = document.getElementById("messageContainer");
    }

    const messageEl = document.createElement("div");
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    messageEl.setAttribute("role", "alert");

    if (DOM.messageContainer) {
        DOM.messageContainer.innerHTML = "";
        DOM.messageContainer.appendChild(messageEl);
    } else {
        console.error(message);
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, 5000);
}

// Clear feedback message
function clearAdminMessage() {
    if (DOM.messageContainer) {
        DOM.messageContainer.innerHTML = "";
    }
}

// Disable/enable button to prevent duplicate requests
function setAddProductBtnDisabled(disabled) {
    if (DOM.addProductBtn) {
        DOM.addProductBtn.disabled = disabled;
        DOM.addProductBtn.textContent = disabled ? "Adding..." : "Add Product";
    }
}

// Validate price input
function isValidPrice(priceValue) {
    const price = parseFloat(priceValue);
    return !isNaN(price) && price > 0;
}

// Add product to database
async function addProduct() {
    clearAdminMessage();
    
    if (!DOM.nameInput || !DOM.priceInput || !DOM.imageInput) {
        console.error("Product form elements not found");
        return;
    }

    const name = DOM.nameInput.value.trim();
    const priceValue = DOM.priceInput.value.trim();
    const image = DOM.imageInput.value.trim();

    // Validation
    if (!name) {
        showAdminMessage("Please enter a product name.", "error");
        return;
    }

    if (!isValidPrice(priceValue)) {
        showAdminMessage("Please enter a valid price (e.g., 9.99).", "error");
        return;
    }

    if (image && !isValidImageUrl(image)) {
        showAdminMessage("Please enter a valid image URL.", "error");
        return;
    }

    setAddProductBtnDisabled(true);
    showAdminMessage("Adding product...", "info");

    try {
        const { error } = await supabase
            .from("products")
            .insert([
                {
                    name: name,
                    price: parseFloat(priceValue),
                    image: image || null
                }
            ]);

        if (error) {
            showAdminMessage(`Error: ${error.message}`, "error");
            return;
        }

        // Clear inputs after success
        DOM.nameInput.value = "";
        DOM.priceInput.value = "";
        DOM.imageInput.value = "";

        showAdminMessage("Product added successfully!", "success");
        
        // Reload products
        await loadProducts();
    } catch (err) {
        showAdminMessage(`Unexpected error: ${err.message}`, "error");
    } finally {
        setAddProductBtnDisabled(false);
    }
}

// Validate image URL format
function isValidImageUrl(url) {
    try {
        new URL(url);
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    } catch {
        return false;
    }
}

// Load products from database
async function loadProducts() {
    if (!DOM.productList) {
        DOM.productList = document.getElementById("productList");
    }

    try {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            DOM.productList.innerHTML = `<p class="error">Error loading products: ${error.message}</p>`;
            return;
        }

        DOM.productList.innerHTML = "";

        if (!data || data.length === 0) {
            DOM.productList.innerHTML = "<p>No products yet.</p>";
            return;
        }

        data.forEach(product => {
            const div = document.createElement("div");
            div.className = "card";

            const imageHtml = product.image 
                ? `<img src="${escapeHtml(product.image)}" width="150" alt="${escapeHtml(product.name)}">` 
                : "";

            div.innerHTML = `
                <h3>${escapeHtml(product.name)}</h3>
                <p>€${parseFloat(product.price).toFixed(2)}</p>
                ${imageHtml}
                <br><br>
                <button onclick="deleteProduct('${product.id}')" class="delete-btn">Delete</button>
            `;

            DOM.productList.appendChild(div);
        });
    } catch (err) {
        DOM.productList.innerHTML = `<p class="error">Unexpected error: ${err.message}</p>`;
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

// Delete product with confirmation
async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    clearAdminMessage();
    showAdminMessage("Deleting product...", "info");

    try {
        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id);

        if (error) {
            showAdminMessage(`Error: ${error.message}`, "error");
            return;
        }

        showAdminMessage("Product deleted successfully!", "success");
        await loadProducts();
    } catch (err) {
        showAdminMessage(`Unexpected error: ${err.message}`, "error");
    }
}

// Start when page loads
document.addEventListener("DOMContentLoaded", () => {
    initAdminDOM();
    loadProducts();
});