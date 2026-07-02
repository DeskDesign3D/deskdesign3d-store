
// Add product to database
async function addProduct() {
    const name = document.getElementById("name").value;
    const price = parseFloat(document.getElementById("price").value);
    const image = document.getElementById("image").value;

    if (!name || !price) {
        alert("Fill in all fields");
        return;
    }

    const { error } = await supabase
        .from("products")
        .insert([{ name, price, image }]);

    if (error) {
        alert(error.message);
        return;
    }

    alert("Product added!");
    loadProducts();
}

// Load products
async function loadProducts() {
    const container = document.getElementById("productList");

    const { data, error } = await supabase
        .from("products")
        .select("*");

    if (error) {
        container.innerHTML = error.message;
        return;
    }

    container.innerHTML = "";

    data.forEach(product => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <h3>${product.name}</h3>
            <p>€${product.price}</p>
            <img src="${product.image || ''}" width="150">
            <br><br>
            <button onclick="deleteProduct('${product.id}')">Delete</button>
        `;

        container.appendChild(div);
    });
}

// Delete product
async function deleteProduct(id) {
    const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    loadProducts();
}

loadProducts();
