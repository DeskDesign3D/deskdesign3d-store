import { supabase } from "../services/supabase.js";

const ordersContainer =
document.getElementById("ordersContainer");

const orderDetails =
document.getElementById("orderDetails");

const orderItems =
document.getElementById("orderItems");

document.addEventListener(

"DOMContentLoaded",

async()=>{

await loadOrders();

}

);

async function loadOrders(){

const{

data:{session}

}=await supabase.auth.getSession();

if(!session){

window.location.href="login.html";

return;

}

const{

data:orders

}=await supabase

.from("orders")

.select("*")

.eq("user_id",session.user.id)

.order("created_at",{

ascending:false

});

ordersContainer.innerHTML="";

if(!orders||orders.length===0){

ordersContainer.innerHTML=

"<p>You have not placed any orders yet.</p>";

return;

}

orders.forEach(order=>{

ordersContainer.innerHTML+=`

<div
class="card order-card">

<h3>

Order #${order.id.substring(0,8)}

</h3>

<p>

${new Date(order.created_at).toLocaleDateString()}

</p>

<p>

Status:
<strong>

${order.status}

</strong>

</p>

<p>

€${Number(order.total).toFixed(2)}

</p>

<button

class="primary-button view-order"

data-id="${order.id}">

View Details

</button>

</div>

`;

});

document

.querySelectorAll(".view-order")

.forEach(button=>{

button.addEventListener(

"click",

()=>{

loadOrder(

button.dataset.id

);

}

);

});

}
async function loadOrder(orderId) {

    const {

        data: order,

        error

    } = await supabase

        .from("orders")

        .select("*")

        .eq("id", orderId)

        .single();

    if (error || !order) {

        alert("Unable to load order.");

        return;

    }

    orderDetails.classList.remove("hidden");

    document.getElementById("orderNumber").textContent =
        `Order #${order.id.substring(0,8)}`;

    document.getElementById("orderStatus").textContent =
        order.status;

    document.getElementById("paymentStatus").textContent =
        order.payment_status;

    document.getElementById("orderTotal").textContent =
        `€${Number(order.total).toFixed(2)}`;

    const {

        data: items

    } = await supabase

        .from("order_items")

        .select(`
            *,
            products(name)
        `)

        .eq("order_id", order.id);

    orderItems.innerHTML = "";

    if (!items || items.length === 0) {

        orderItems.innerHTML = "<p>No items found.</p>";

        return;

    }

    items.forEach(item => {

        orderItems.innerHTML += `

            <div class="card">

                <h4>

                    ${item.products?.name ?? "Product"}

                </h4>

                <p>

                    Quantity: ${item.quantity}

                </p>

                <p>

                    Unit Price:
                    €${Number(item.price).toFixed(2)}

                </p>

                <p>

                    Line Total:
                    €${(item.quantity * item.price).toFixed(2)}

                </p>

            </div>

        `;

    });

    orderItems.innerHTML += `

        <div class="order-actions">

            <button
                id="downloadInvoice"
                class="secondary-button">

                Download Invoice

            </button>

            <button
                id="reorderButton"
                class="primary-button">

                Reorder Items

            </button>

        </div>

    `;

    document

        .getElementById("downloadInvoice")

        .addEventListener("click", () => {

            alert(
                "PDF invoice generation will be added later."
            );

        });

    document

        .getElementById("reorderButton")

        .addEventListener("click", async () => {

            await reorder(order.id);

        });

}

async function reorder(orderId) {

    const {

        data: {

            session

        }

    } = await supabase.auth.getSession();

    const {

        data: cart

    } = await supabase

        .from("carts")

        .select("*")

        .eq("user_id", session.user.id)

        .single();

    const {

        data: items

    } = await supabase

        .from("order_items")

        .select("*")

        .eq("order_id", orderId);

    if (!items) return;

    for (const item of items) {

        const {

            data: existing

        } = await supabase

            .from("cart_items")

            .select("*")

            .eq("cart_id", cart.id)

            .eq("product_id", item.product_id)

            .single();

        if (existing) {

            await supabase

                .from("cart_items")

                .update({

                    quantity:

                        existing.quantity + item.quantity

                })

                .eq("id", existing.id);

        } else {

            await supabase

                .from("cart_items")

                .insert({

                    cart_id: cart.id,

                    product_id: item.product_id,

                    quantity: item.quantity

                });

        }

    }

    alert("Items added to cart.");

}
