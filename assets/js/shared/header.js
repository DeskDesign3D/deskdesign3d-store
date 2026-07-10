export function createHeader() {
    return `
<div id="loading-overlay">
    <div class="loader"></div>
</div>

<a href="index.html" class="logo">
    <img src="assets/images/logo/logo.png" alt="DeskDesign3D">
</a>

<header class="header">
    <div class="container">

        <nav class="desktop-nav">

            <h3>

                <a href="index.html">
                    Home
                </a>

                <a href="products.html">
                    Products
                </a>

                <a href="#">
                    Categories
                </a>

                <a href="#">
                    About
                </a>

                <a href="#">
                    Contact
                </a>

            </h3>

            <div class="header-actions" style="margin-left:auto;">

                <button
                    id="searchButton"
                    class="icon-button"
                    style="width:5rem; gap:2rem;">

                    🔍

                </button>

                <a
                    href="cart.html"
                    class="icon-button"
                    style="gap:2rem;">

                    🛒

                    <span id="cartCount">
                        0
                    </span>

                </a>

                <a
                    href="login.html"
                    id="loginButton"
                    class="primary-button">

                    Login

                </a>

                <button
                    id="accountButton"
                    class="primary-button hidden">

                    Account

                </button>

            </div>

        </nav>

    </div>
</header>

<div id="sidebarOverlay" class="sidebar-overlay"></div>

<aside id="accountSidebar">

    <button id="closeSidebar">

        ✕

    </button>

    <h2>

        My Account

    </h2>

    <a href="account.html">

        Profile

    </a>

    <a href="orders.html">

        Orders

    </a>

    <a href="wishlist.html">

        Wishlist

    </a>

    <a href="settings.html">

        Settings

    </a>

    <button id="logoutButton">

        Logout

    </button>

</aside>
`;
}

export function loadHeader() {
    document.body.insertAdjacentHTML("afterbegin", createHeader());
}