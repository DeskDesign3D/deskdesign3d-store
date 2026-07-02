// Shopping cart
let cart = [];

// Add a product to the cart
function addToCart(name, price = 1) {
    cart.push({
        name: name,
        price: price
    });

    updateCart();
}

// Update the cart on the page
function updateCart() {
    const list = document.getElementById("cartList");
    const totalElement = document.getElementById("total");

    if (!list || !totalElement) return;

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

// Test the Supabase connection
async function testSupabase() {
    try {
        const { error } = await supabase
            .from("products")
            .select("*")
            .limit(1);

        if (error) {
            console.error("Supabase connected, but:", error.message);
        } else {
            console.log("✅ Supabase connected successfully");
        }
    } catch (err) {
        console.error("Connection failed:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateCart();
    testSupabase();
});
