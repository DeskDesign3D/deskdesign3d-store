import { supabase } from "../services/supabase.js";

const checkoutItems = document.getElementById("checkoutItems");

const subtotalElement =
document.getElementById("checkoutSubtotal");

const totalElement =
document.getElementById("checkoutTotal");

const form =
document.getElementById("checkoutForm");

let cart = null;

let cartItems = [];

let subtotal = 0;

document.addEventListener(

"DOMContentLoaded",

async()=>{

await loadCheckout();

}

);

async function loadCheckout(){

const{

data:{session}

}=await supabase.auth.getSession();

if(!session){

window.location.href="login.html";

return;

}

const{

data:profile

}=await supabase

.from("profiles")

.select("*")

.eq("id",session.user.id)

.single();

if(profile){

document.getElementById("firstName").value=
profile.first_name ?? "";

document.getElementById("lastName").value=
profile.last_name ?? "";

document.getElementById("email").value=
profile.email ?? "";

}

const{

data:c

}=await supabase

.from("carts")

.select("*")

.eq("user_id",session.user.id)

.single();

cart=c;

if(!cart){

window.location.href="cart.html";

return;

}

const{

data:items

}=await supabase

.from("cart_items")

.select(`
*,
products(*)
`)

.eq("cart_id",cart.id);

cartItems=items??[];

renderCart();

}

function renderCart(){

checkoutItems.innerHTML="";

subtotal=0;

cartItems.forEach(item=>{

const lineTotal=
item.quantity*item.products.price;

subtotal+=lineTotal;

checkoutItems.innerHTML+=`

<div class="checkout-item">

<div>

<strong>

${item.products.name}

</strong>

<br>

${item.quantity} ×
€${Number(item.products.price).toFixed(2)}

</div>

<div>

€${lineTotal.toFixed(2)}

</div>

</div>

`;

});

subtotalElement.textContent=
`€${subtotal.toFixed(2)}`;

totalElement.textContent=
`€${subtotal.toFixed(2)}`;

}
async function saveAddress(userId){

const{

data:address

}=await supabase

.from("addresses")

.insert({

user_id:userId,

first_name:document.getElementById("firstName").value,

last_name:document.getElementById("lastName").value,

email:document.getElementById("email").value,

phone:document.getElementById("phone").value,

street:document.getElementById("street").value,

postal_code:document.getElementById("postalCode").value,

city:document.getElementById("city").value,

country:document.getElementById("country").value

})

.select()

.single();

return address;

}

async function createOrder(userId,addressId){

const paymentMethod=document.querySelector(

'input[name="payment"]:checked'

).value;

const{

data:order

}=await supabase

.from("orders")

.insert({

user_id:userId,

address_id:addressId,

status:"pending",

payment_method:paymentMethod,

payment_status:"pending",

subtotal:subtotal,

shipping:0,

total:subtotal

})

.select()

.single();

return order;

}

async function createOrderItems(orderId){

for(const item of cartItems){

await supabase

.from("order_items")

.insert({

order_id:orderId,

product_id:item.product_id,

quantity:item.quantity,

price:item.products.price

});

await supabase

.from("products")

.update({

stock:

item.products.stock-item.quantity

})

.eq("id",item.product_id);

}

}

async function clearCart(){

await supabase

.from("cart_items")

.delete()

.eq("cart_id",cart.id);

}

async function startPayment(order){

const provider=document.querySelector(

'input[name="payment"]:checked'

).value;

switch(provider){

case"bank":

console.log("Future bank transfer");

break;

case"stripe":

console.log("Future Stripe");

break;

case"paypal":

console.log("Future PayPal");

break;

case"crypto":

console.log("Future Crypto");

break;

case"mollie":

console.log("Future Mollie");

break;

case"bancontact":

console.log("Future Bancontact");

break;

case"apple":

console.log("Future Apple Pay");

break;

case"google":

console.log("Future Google Pay");

break;

default:

console.log(provider);

}

return order;

}

form.addEventListener(

"submit",

async(event)=>{

event.preventDefault();

const{

data:{session}

}=await supabase.auth.getSession();

if(!session){

window.location.href="login.html";

return;

}

try{

const address=

await saveAddress(session.user.id);

const order=

await createOrder(

session.user.id,

address.id

);

await createOrderItems(order.id);

await clearCart();

await startPayment(order);

alert(

"Order placed successfully."

);

window.location.href=

`orders.html?id=${order.id}`;

}

catch(error){

console.error(error);

alert(

"Unable to place your order."

);

}

}

);
