import { supabase } from "../services/supabase.js";

const params = new URLSearchParams(window.location.search);

const productId = params.get("id");

const mainImage = document.getElementById("mainImage");
const thumbnailContainer = document.getElementById("thumbnailContainer");

const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productDescription = document.getElementById("productDescription");
const productStock = document.getElementById("productStock");
const productCategory = document.getElementById("productCategory");

const quantityInput = document.getElementById("quantity");

const addToCartButton = document.getElementById("addToCart");
const favoriteButton = document.getElementById("favoriteButton");

const reviewsContainer = document.getElementById("reviewsContainer");
const relatedProducts = document.getElementById("relatedProducts");

let currentProduct = null;

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        if (!productId) {

            window.location.href = "404.html";

            return;

        }

        await loadProduct();

    }

);

document

.getElementById("increaseQuantity")

.addEventListener(

"click",

()=>{

quantityInput.value=

Number(quantityInput.value)+1;

}

);

document

.getElementById("decreaseQuantity")

.addEventListener(

"click",

()=>{

if(Number(quantityInput.value)>1){

quantityInput.value=

Number(quantityInput.value)-1;

}

}

);

async function loadProduct(){

const{

data,

error

}=await supabase

.from("products")

.select("*")

.eq("id",productId)

.single();

if(error||!data){

window.location.href="404.html";

return;

}

currentProduct=data;

displayProduct();

await loadImages();

await loadCategory();

await loadReviews();

await loadRelatedProducts();

}

function displayProduct(){

productName.textContent=currentProduct.name;

productPrice.textContent=

`€${Number(currentProduct.price).toFixed(2)}`;

productDescription.textContent=

currentProduct.description;

productStock.textContent=

currentProduct.stock>0

?

`${currentProduct.stock} in stock`

:

"Out of stock";

}
async function loadImages() {

    const {

        data: images

    } = await supabase

        .from("product_images")

        .select("*")

        .eq("product_id", currentProduct.id)

        .order("sort_order", {

            ascending: true

        });

    if (!images || images.length === 0) {

        return;

    }

    mainImage.src = images[0].image_url;

    thumbnailContainer.innerHTML = "";

    images.forEach(image => {

        const thumbnail = document.createElement("img");

        thumbnail.src = image.image_url;

        thumbnail.className = "thumbnail";

        thumbnail.addEventListener("click", () => {

            mainImage.src = image.image_url;

        });

        thumbnailContainer.appendChild(thumbnail);

    });

}

async function loadCategory() {

    const {

        data

    } = await supabase

        .from("categories")

        .select("name")

        .eq("id", currentProduct.category_id)

        .single();

    if (data) {

        productCategory.textContent = data.name;

    }

}

async function loadReviews() {

    const {

        data: reviews

    } = await supabase

        .from("reviews")

        .select(`
            *,
            profiles(first_name,last_name)
        `)

        .eq("product_id", currentProduct.id)

        .order("created_at", {

            ascending: false

        });

    reviewsContainer.innerHTML = "";

    if (!reviews || reviews.length === 0) {

        reviewsContainer.innerHTML = `

            <p>

                No reviews yet.

            </p>

        `;

        return;

    }

    reviews.forEach(review => {

        const card = document.createElement("div");

        card.className = "review-card";

        card.innerHTML = `

            <h3>

                ${review.profiles?.first_name ?? "Customer"}
                ${review.profiles?.last_name ?? ""}

            </h3>

            <p>

                ${"⭐".repeat(review.rating)}

            </p>

            <p>

                ${review.comment}

            </p>

        `;

        reviewsContainer.appendChild(card);

    });

}

async function loadRelatedProducts() {

    const {

        data: products

    } = await supabase

        .from("products")

        .select("*")

        .eq("category_id", currentProduct.category_id)

        .neq("id", currentProduct.id)

        .limit(4);

    relatedProducts.innerHTML = "";

    if (!products) return;

    products.forEach(product => {

        relatedProducts.innerHTML += `

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

addToCartButton?.addEventListener("click", async () => {

    const {

        data: {

            session

        }

    } = await supabase.auth.getSession();

    if (!session) {

        window.location.href = "login.html";

        return;

    }

    let {

        data: cart

    } = await supabase

        .from("carts")

        .select("*")

        .eq("user_id", session.user.id)

        .single();

    if (!cart) {

        const {

            data: newCart

        } = await supabase

            .from("carts")

            .insert({

                user_id: session.user.id

            })

            .select()

            .single();

        cart = newCart;

    }

    const quantity = Number(quantityInput.value);

    const {

        data: existingItem

    } = await supabase

        .from("cart_items")

        .select("*")

        .eq("cart_id", cart.id)

        .eq("product_id", currentProduct.id)

        .single();

    if (existingItem) {

        await supabase

            .from("cart_items")

            .update({

                quantity:

                    existingItem.quantity + quantity

            })

            .eq("id", existingItem.id);

    } else {

        await supabase

            .from("cart_items")

            .insert({

                cart_id: cart.id,

                product_id: currentProduct.id,

                quantity

            });

    }

    window.location.href = "cart.html";

});

favoriteButton?.addEventListener("click", async () => {

    const {

        data: {

            session

        }

    } = await supabase.auth.getSession();

    if (!session) {

        window.location.href = "login.html";

        return;

    }

    await supabase

        .from("favorites")

        .upsert({

            user_id: session.user.id,

            product_id: currentProduct.id

        });

    alert("Product added to favorites.");

});
