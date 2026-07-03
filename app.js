
// Cart
let cart = [];

// Load products from Supabase
async function loadProducts() {
    const grid = document.getElementById("productGrid");

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        grid.innerHTML = "Error loading products: " + error.message;
        return;
    }

    grid.innerHTML = "";

    data.forEach(product => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            ${product.image ? `<img src="${product.image}">` : ""}
            <h3>${product.name}</h3>
            <div class="price">€${Number(product.price).toFixed(2)}</div>
            <button onclick="addToCart('${product.id}', '${product.name}', ${product.price})">
                Add to cart
            </button>
        `;

        grid.appendChild(div);
    });
}

// Add to cart (NOW uses product data)
function addToCart(id, name, price) {
    cart.push({ id, name, price });
    updateCart();
}

// Update cart UI
function updateCart() {
    const list = document.getElementById("cartList");
    const totalElement = document.getElementById("total");

    list.innerHTML = "";

    let total = 0;

    cart.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.name} - €${item.price.toFixed(2)}`;
        list.appendChild(li);
        total += item.price;
    });

    totalElement.textContent = total.toFixed(2);
}

// Checkout (basic placeholder for now)
async function checkout() {
    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }

    const email = prompt("Enter your email:");
    const firstName = prompt("First name:");
    const lastName = prompt("Last name:");

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const { error } = await supabase
        .from("orders")
        .insert([
            {
                email,
                first_name: firstName,
                last_name: lastName,
                total,
                items: cart,
                status: "pending"
            }
        ]);

    if (error) {
        alert(error.message);
        return;
    }

    alert("Order placed!");
    cart = [];
    updateCart();
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    updateCart();
});
