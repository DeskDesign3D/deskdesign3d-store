import { supabase } from "../services/supabase.js";

const productForm =
document.getElementById("productForm");

const categoryForm =
document.getElementById("categoryForm");

const productsTable =
document.getElementById("productsTable");

const categoriesTable =
document.getElementById("categoriesTable");

const ordersTable =
document.getElementById("ordersTable");

const customersTable =
document.getElementById("customersTable");

const categorySelect =
document.getElementById("productCategory");

document.addEventListener(

"DOMContentLoaded",

async()=>{

await verifyAdmin();

setupTabs();

await loadCategories();

await loadProducts();

await loadOrders();

await loadCustomers();

});

async function verifyAdmin(){

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

.select("role")

.eq("id",session.user.id)

.single();

if(!profile||

profile.role!=="admin"){

window.location.href="index.html";

}

}

function setupTabs(){

const tabs=document.querySelectorAll(".admin-tab");

const sections=document.querySelectorAll(".admin-section");

tabs.forEach(tab=>{

tab.addEventListener("click",()=>{

tabs.forEach(t=>t.classList.remove("active"));

sections.forEach(s=>s.classList.add("hidden"));

tab.classList.add("active");

document

.getElementById(

tab.dataset.tab+"Tab"

)

.classList.remove("hidden");

});

});

}
async function loadCategories() {

    const {

        data: categories,

        error

    } = await supabase

        .from("categories")

        .select("*")

        .order("name");

    if (error) {

        console.error(error);

        return;

    }

    categoriesTable.innerHTML = "";

    categorySelect.innerHTML = "";

    categories.forEach(category => {

        categorySelect.innerHTML += `

            <option value="${category.id}">

                ${category.name}

            </option>

        `;

        categoriesTable.innerHTML += `

            <tr>

                <td>

                    ${category.name}

                </td>

                <td>

                    <button

                        class="edit-category"

                        data-id="${category.id}"

                        data-name="${category.name}">

                        Edit

                    </button>

                    <button

                        class="delete-category"

                        data-id="${category.id}">

                        Delete

                    </button>

                </td>

            </tr>

        `;

    });

    attachCategoryEvents();

}

function attachCategoryEvents() {

    document

        .querySelectorAll(".edit-category")

        .forEach(button => {

            button.addEventListener("click", () => {

                document.getElementById("categoryId").value =
                    button.dataset.id;

                document.getElementById("categoryName").value =
                    button.dataset.name;

            });

        });

    document

        .querySelectorAll(".delete-category")

        .forEach(button => {

            button.addEventListener("click", async () => {

                if (!confirm("Delete this category?")) {

                    return;

                }

                await supabase

                    .from("categories")

                    .delete()

                    .eq("id", button.dataset.id);

                await loadCategories();

            });

        });

}

categoryForm?.addEventListener("submit", async event => {

    event.preventDefault();

    const id = document.getElementById("categoryId").value;

    const name = document.getElementById("categoryName").value.trim();

    if (!name) return;

    if (id) {

        await supabase

            .from("categories")

            .update({

                name

            })

            .eq("id", id);

    } else {

        await supabase

            .from("categories")

            .insert({

                name

            });

    }

    categoryForm.reset();

    document.getElementById("categoryId").value = "";

    await loadCategories();

});

async function loadProducts() {

    const {

        data: products,

        error

    } = await supabase

        .from("products")

        .select(`
            *,
            categories(name)
        `)

        .order("created_at", {

            ascending: false

        });

    if (error) {

        console.error(error);

        return;

    }

    productsTable.innerHTML = "";

    products.forEach(product => {

        productsTable.innerHTML += `

            <tr>

                <td>

                    ${product.name}

                </td>

                <td>

                    €${Number(product.price).toFixed(2)}

                </td>

                <td>

                    ${product.stock}

                </td>

                <td>

                    <button

                        class="edit-product"

                        data-id="${product.id}">

                        Edit

                    </button>

                    <button

                        class="delete-product"

                        data-id="${product.id}">

                        Delete

                    </button>

                </td>

            </tr>

        `;

    });

    attachProductEvents();

}
async function uploadProductImage(productId, file) {

    if (!file) return;

    const extension = file.name.split(".").pop();

    const fileName =
        `${productId}/${crypto.randomUUID()}.${extension}`;

    const {

        error: uploadError

    } = await supabase.storage

        .from("Product_images")

        .upload(fileName, file, {

            cacheControl: "3600",

            upsert: false

        });

    if (uploadError) {

        throw uploadError;

    }

    const {

        data

    } = supabase.storage

        .from("Product_images")

        .getPublicUrl(fileName);

    await supabase

        .from("product_images")

        .insert({

            product_id: productId,

            image_url: data.publicUrl,

            storage_path: fileName,

            sort_order: 0

        });

}

function attachProductEvents() {

    document

        .querySelectorAll(".edit-product")

        .forEach(button => {

            button.addEventListener(

                "click",

                async () => {

                    const {

                        data

                    } = await supabase

                        .from("products")

                        .select("*")

                        .eq("id", button.dataset.id)

                        .single();

                    if (!data) return;

                    document.getElementById("productId").value =
                        data.id;

                    document.getElementById("productName").value =
                        data.name;

                    document.getElementById("productCategory").value =
                        data.category_id;

                    document.getElementById("productPrice").value =
                        data.price;

                    document.getElementById("productStock").value =
                        data.stock;

                    document.getElementById("productDescription").value =
                        data.description;

                    window.scrollTo({

                        top: 0,

                        behavior: "smooth"

                    });

                }

            );

        });

    document

        .querySelectorAll(".delete-product")

        .forEach(button => {

            button.addEventListener(

                "click",

                async () => {

                    if (!confirm("Delete this product?")) {

                        return;

                    }

                    await supabase

                        .from("product_images")

                        .delete()

                        .eq("product_id", button.dataset.id);

                    await supabase

                        .from("products")

                        .delete()

                        .eq("id", button.dataset.id);

                    await loadProducts();

                }

            );

        });

}

productForm?.addEventListener(

    "submit",

    async event => {

        event.preventDefault();

        const id =
            document.getElementById("productId").value;

        const product = {

            name:
                document.getElementById("productName").value,

            category_id:
                document.getElementById("productCategory").value,

            description:
                document.getElementById("productDescription").value,

            price:
                Number(document.getElementById("productPrice").value),

            stock:
                Number(document.getElementById("productStock").value),

            active: true

        };

        let productId = id;

        if (id) {

            await supabase

                .from("products")

                .update(product)

                .eq("id", id);

        } else {

            const {

                data

            } = await supabase

                .from("products")

                .insert(product)

                .select()

                .single();

            productId = data.id;

        }

        const file =
            document.getElementById("productImage").files[0];

        if (file) {

            await uploadProductImage(

                productId,

                file

            );

        }

        productForm.reset();

        document.getElementById("productId").value = "";

        await loadProducts();

    }

);
async function loadOrders() {

    const {

        data: orders,

        error

    } = await supabase

        .from("orders")

        .select(`
            *,
            profiles(
                first_name,
                last_name,
                email
            )
        `)

        .order("created_at", {

            ascending: false

        });

    if (error) {

        console.error(error);

        return;

    }

    ordersTable.innerHTML = "";

    orders.forEach(order => {

        ordersTable.innerHTML += `

            <tr>

                <td>

                    ${order.id.substring(0,8)}

                </td>

                <td>

                    ${order.profiles?.first_name ?? ""}

                    ${order.profiles?.last_name ?? ""}

                    <br>

                    <small>

                        ${order.profiles?.email ?? ""}

                    </small>

                </td>

                <td>

                    <select

                        class="order-status"

                        data-id="${order.id}">

                        ${createStatusOptions(order.status)}

                    </select>

                </td>

                <td>

                    €${Number(order.total).toFixed(2)}

                </td>

                <td>

                    <button

                        class="view-order"

                        data-id="${order.id}">

                        View

                    </button>

                </td>

            </tr>

        `;

    });

    attachOrderEvents();

}

function createStatusOptions(selected){

    const statuses=[

        "pending",

        "processing",

        "paid",

        "shipped",

        "completed",

        "cancelled"

    ];

    return statuses.map(status=>`

<option

value="${status}"

${selected===status?"selected":""}>

${status}

</option>

`).join("");

}

function attachOrderEvents(){

    document

    .querySelectorAll(".order-status")

    .forEach(select=>{

        select.addEventListener(

            "change",

            async()=>{

                await supabase

                .from("orders")

                .update({

                    status:select.value

                })

                .eq("id",select.dataset.id);

            }

        );

    });

}

async function loadCustomers(){

    const{

        data:customers,

        error

    }=await supabase

    .from("profiles")

    .select("*")

    .order("created_at",{

        ascending:false

    });

    if(error){

        console.error(error);

        return;

    }

    customersTable.innerHTML="";

    customers.forEach(customer=>{

        customersTable.innerHTML+=`

<tr>

<td>

${customer.first_name}

${customer.last_name}

</td>

<td>

${customer.email}

</td>

<td>

<select

class="customer-role"

data-id="${customer.id}">

<option

value="customer"

${customer.role==="customer"?"selected":""}>

Customer

</option>

<option

value="admin"

${customer.role==="admin"?"selected":""}>

Admin

</option>

</select>

</td>

<td>

${new Date(customer.created_at).toLocaleDateString()}

</td>

</tr>

`;

    });

    attachCustomerEvents();

}

function attachCustomerEvents(){

    document

    .querySelectorAll(".customer-role")

    .forEach(select=>{

        select.addEventListener(

            "change",

            async()=>{

                await supabase

                .from("profiles")

                .update({

                    role:select.value

                })

                .eq("id",select.dataset.id);

            }

        );

    });

}
window.addEventListener(

    "error",

    event=>{

        console.error(

            "Admin Error:",

            event.error

        );

    }

);

window.addEventListener(

    "unhandledrejection",

    event=>{

        console.error(

            event.reason

        );

    }

);

setInterval(async()=>{

    await loadOrders();

},60000);

setInterval(async()=>{

    await loadProducts();

},120000);

console.log(

    "DeskDesign3D Admin Dashboard Loaded"

);
