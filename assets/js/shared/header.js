export function createHeader(){

    return `

<header class="header">

<div class="logo">

<a href="index.html">

DeskDesign3D

</a>

</div>

<nav>

<a href="products.html">

Products

</a>

<a href="cart.html">

Cart

</a>

<a href="login.html"

id="loginButton">

Login

</a>

</nav>

</header>

`;

}

document.body.insertAdjacentHTML(

"afterbegin",

createHeader()

);
