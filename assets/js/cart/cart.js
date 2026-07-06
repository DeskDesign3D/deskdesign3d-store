import { supabase } from "../services/supabase.js";

let cartId = null;

const cartItems = document.getElementById("cartItems");
const subtotalElement = document.getElementById("subtotal");
const totalElement = document.getElementById("total");
const emptyCart = document.getElementById("emptyCart");
const clearCartButton = document.getElementById("clearCart");
const checkoutButton = document.getElementById("checkoutButton");
const recommendedProducts = document.getElementById("recommendedProducts");

document.addEventListener("DOMContentLoaded", async () => {

    await initializeCart();

    await loadRecommendations();

});

async function initializeCart() {

    const {

        data: {

            session

        }

    } = await supabase.auth.getSession();

    if (!session) {

        window.location.href = "login.html";

        return;

    }

    const {

        data: cart

    } = await supabase

        .from("carts")

        .select("*")

        .eq("user_id", session.user.id)

        .single();

    if (!cart) {

        emptyCart.classList.remove("hidden");

        return;

    }

    cartId = cart.id;

    await loadCart();

}

async function loadCart() {

    const {

        data: items

    } = await supabase

        .from("cart_items")

        .select(`
            *,
            products(*)
        `)

        .eq("cart_id", cartId);

    cartItems.innerHTML = "";

    let subtotal = 0;

    if (!items || items.length === 0) {

        emptyCart.classList.remove("hidden");

        subtotalElement.textContent = "€0.00";

        totalElement.textContent = "€0.00";

        return;

    }

    emptyCart.classList.add("hidden");

    items.forEach(item => {

        subtotal += item.quantity * item.products.price;

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>

                ${item.products.name}

            </td>

            <td>

                €${Number(item.products.price).toFixed(2)}

            </td>

            <td>

                <input

                    type="number"

                    min="1"

                    value="${item.quantity}"

                    data-id="${item.id}"

                    class="cart-quantity">

            </td>

            <td>

                €${(item.quantity * item.products.price).toFixed(2)}

            </td>

            <td>

                <button

                    class="remove-item"

                    data-id="${item.id}">

                    🗑

                </button>

            </td>

        `;

        cartItems.appendChild(row);

    });

    subtotalElement.textContent = `€${subtotal.toFixed(2)}`;

    totalElement.textContent = `€${subtotal.toFixed(2)}`;

    attachEvents();

}

function attachEvents() {

    document

        .querySelectorAll(".cart-quantity")

        .forEach(input => {

            input.addEventListener("change", async event => {

                await updateQuantity(

                    event.target.dataset.id,

                    Number(event.target.value)

                );

            });

        });

    document

        .querySelectorAll(".remove-item")

        .forEach(button => {

            button.addEventListener("click", async event => {

                await removeItem(

                    event.target.dataset.id

                );

            });

        });

}

async function updateQuantity(id, quantity) {

    if (quantity < 1) quantity = 1;

    await supabase

        .from("cart_items")

        .update({

            quantity

        })

        .eq("id", id);

    await loadCart();

}

async function removeItem(id) {

    await supabase

        .from("cart_items")

        .delete()

        .eq("id", id);

    await loadCart();

}

clearCartButton?.addEventListener("click", async () => {

    if (!cartId) return;

    await supabase

        .from("cart_items")

        .delete()

        .eq("cart_id", cartId);

    await loadCart();

});

checkoutButton?.addEventListener("click", () => {

    window.location.href = "checkout.html";

});

async function loadRecommendations() {

    const {

        data: products

    } = await supabase

        .from("products")

        .select("*")

        .eq("active", true)

        .limit(4);

    if (!products) return;

    recommendedProducts.innerHTML = "";

    products.forEach(product => {

        recommendedProducts.innerHTML += `

            <div class="product-card">

                <img

                    src="assets/images/placeholder.png"

                    alt="${product.name}">

                <h3>

                    ${product.name}

                </h3>

                <p class="price">

                    €${Number(product.price).toFixed(2)}

                </p>

                <a

                    href="product.html?id=${product.id}"

                    class="primary-button">

                    View Product

                </a>

            </div>

        `;

    });

}
