
// Add product to database
async function addProduct() {
    const name = document.getElementById("name").value.trim();
    const priceValue = document.getElementById("price").value;
    const image = document.getElementById("image").value.trim();

    const price = parseFloat(priceValue);

    if (!name || isNaN(price)) {
        alert("Please enter a valid name and price");
        return;
    }

    const { error } = await supabase
        .from("products")
        .insert([
            {
                name: name,
                price: price,
                image: image || null
            }
        ]);

    if (error) {
        alert("Error: " + error.message);
        return;
    }

    // Clear inputs after success
    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("image").value = "";

    alert("Product added successfully!");

    loadProducts();
}


// Load products from database
async function loadProducts() {
    const container = document.getElementById("productList");

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        container.innerHTML = "Error loading products: " + error.message;
        return;
    }

    container.innerHTML = "";

    if (!data || data.length === 0) {
        container.innerHTML = "<p>No products yet.</p>";
        return;
    }

    data.forEach(product => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <h3>${product.name}</h3>
            <p>€${product.price.toFixed(2)}</p>
            ${product.image ? `<img src="${product.image}" width="150">` : ""}
            <br><br>
            <button onclick="deleteProduct('${product.id}')">Delete</button>
        `;

        container.appendChild(div);
    });
}


// Delete product
async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Error: " + error.message);
        return;
    }

    loadProducts();
}


// Start when page loads
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});
