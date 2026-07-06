import { supabase } from "../services/supabase.js";

const profileForm = document.getElementById("profileForm");
const passwordForm = document.getElementById("passwordForm");

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const email = document.getElementById("email");

const addressList = document.getElementById("addressList");
const favoriteProducts = document.getElementById("favoriteProducts");

const tabs = document.querySelectorAll(".account-tab");
const sections = document.querySelectorAll(".tab-content");

document.addEventListener("DOMContentLoaded", async () => {

    await loadAccount();

    setupTabs();

});

async function loadAccount() {

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

        data: profile

    } = await supabase

        .from("profiles")

        .select("*")

        .eq("id", session.user.id)

        .single();

    if (profile) {

        firstName.value = profile.first_name ?? "";

        lastName.value = profile.last_name ?? "";

        email.value = profile.email ?? "";

    }

    await loadAddresses(session.user.id);

    await loadFavorites(session.user.id);

}

function setupTabs() {

    tabs.forEach(button => {

        button.addEventListener("click", () => {

            tabs.forEach(tab =>

                tab.classList.remove("active")

            );

            sections.forEach(section =>

                section.classList.add("hidden")

            );

            button.classList.add("active");

            document

                .getElementById(

                    button.dataset.tab + "Tab"

                )

                .classList.remove("hidden");

        });

    });

}
async function loadAddresses(userId) {

    const {

        data: addresses

    } = await supabase

        .from("addresses")

        .select("*")

        .eq("user_id", userId)

        .order("created_at", {

            ascending: false

        });

    addressList.innerHTML = "";

    if (!addresses || addresses.length === 0) {

        addressList.innerHTML = `

            <p>

                No saved addresses.

            </p>

        `;

        return;

    }

    addresses.forEach(address => {

        addressList.innerHTML += `

            <div class="card">

                <strong>

                    ${address.first_name} ${address.last_name}

                </strong>

                <p>

                    ${address.street}

                </p>

                <p>

                    ${address.postal_code} ${address.city}

                </p>

                <p>

                    ${address.country}

                </p>

            </div>

        `;

    });

}

async function loadFavorites(userId) {

    const {

        data: favorites

    } = await supabase

        .from("favorites")

        .select(`
            *,
            products(*)
        `)

        .eq("user_id", userId);

    favoriteProducts.innerHTML = "";

    if (!favorites || favorites.length === 0) {

        favoriteProducts.innerHTML = `

            <p>

                You have no favorite products.

            </p>

        `;

        return;

    }

    favorites.forEach(item => {

        favoriteProducts.innerHTML += `

            <div class="product-card">

                <img

                    src="assets/images/placeholder.png"

                    alt="${item.products.name}">

                <h3>

                    ${item.products.name}

                </h3>

                <p class="price">

                    €${Number(item.products.price).toFixed(2)}

                </p>

                <a

                    href="product.html?id=${item.products.id}"

                    class="primary-button">

                    View Product

                </a>

            </div>

        `;

    });

}

profileForm?.addEventListener("submit", async event => {

    event.preventDefault();

    const {

        data: {

            session

        }

    } = await supabase.auth.getSession();

    await supabase

        .from("profiles")

        .update({

            first_name: firstName.value,

            last_name: lastName.value

        })

        .eq("id", session.user.id);

    alert("Profile updated successfully.");

});

passwordForm?.addEventListener("submit", async event => {

    event.preventDefault();

    const password = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (password !== confirm) {

        alert("Passwords do not match.");

        return;

    }

    const {

        error

    } = await supabase.auth.updateUser({

        password

    });

    if (error) {

        alert(error.message);

        return;

    }

    alert("Password updated successfully.");

    passwordForm.reset();

});

document

.getElementById("logoutButton")

?.addEventListener("click", async () => {

    await supabase.auth.signOut();

    window.location.href = "index.html";

});
