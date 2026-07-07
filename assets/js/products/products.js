import { supabase } from "../services/supabase.js";

const grid = document.getElementById("productsGrid");
const count = document.getElementById("productCount");

const categoryFilter =
document.getElementById("categoryFilter");

const searchInput =
document.getElementById("searchInput");

const sortSelect =
document.getElementById("sortProducts");

const priceFilter =
document.getElementById("priceFilter");

const priceValue =
document.getElementById("priceValue");

const noProducts =
document.getElementById("noProducts");

let products = [];

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await loadCategories();

        await loadProducts();

        attachEvents();

    }

);

async function loadCategories() {

    const {

        data,

        error

    } = await supabase

        .from("categories")

        .select("*")

        .order("name");

    if (error) {

        console.error(error);

        return;

    }

    categoryFilter.innerHTML = `

        <option value="">

            All Categories

        </option>

    `;

    data.forEach(category => {

        categoryFilter.innerHTML += `

            <option value="${category.id}">

                ${category.name}

            </option>

        `;

    });

}

async function loadProducts() {

    const {

        data,

        error

    } = await supabase

        .from("products")

        .select("*")

        .eq("active", true);

    if (error) {

        console.error(error);

        return;

    }

    products = data;

    filterProducts();

}

function filterProducts() {

    let filtered = [...products];

    if (categoryFilter.value) {

        filtered = filtered.filter(

            product =>

                product.category_id ===

                categoryFilter.value

        );

    }

    if (searchInput.value) {

        filtered = filtered.filter(product =>

            product.name

            .toLowerCase()

            .includes(

                searchInput.value.toLowerCase()

            )

        );

    }

    filtered = filtered.filter(product =>

        Number(product.price)

        <=

        Number(priceFilter.value)

    );

    switch (sortSelect.value) {

        case "price-low":

            filtered.sort(

                (a,b)=>a.price-b.price

            );

            break;

        case "price-high":

            filtered.sort(

                (a,b)=>b.price-a.price

            );

            break;

        case "name":

            filtered.sort(

                (a,b)=>

                a.name.localeCompare(b.name)

            );

            break;

        default:

            filtered.sort(

                (a,b)=>

                new Date(b.created_at)

                -

                new Date(a.created_at)

            );

    }

    renderProducts(filtered);

}

function renderProducts(list) {

    grid.innerHTML = "";

    count.textContent = list.length;

    if (list.length === 0) {

        noProducts.classList.remove("hidden");

        return;

    }

    noProducts.classList.add("hidden");

    list.forEach(product => {

        grid.innerHTML += `

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

function attachEvents() {

    categoryFilter.addEventListener(

        "change",

        filterProducts

    );

    searchInput.addEventListener(

        "input",

        filterProducts

    );

    sortSelect.addEventListener(

        "change",

        filterProducts

    );

    priceFilter.addEventListener(

        "input",

        () => {

            priceValue.textContent =

                `€${priceFilter.value}`;

            filterProducts();

        }

    );

    document

        .getElementById("clearFilters")

        ?.addEventListener(

            "click",

            () => {

                searchInput.value = "";

                categoryFilter.value = "";

                sortSelect.value = "newest";

                priceFilter.value = 500;

                priceValue.textContent = "€500";

                filterProducts();

            }

        );

}
