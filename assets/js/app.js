import "./auth/session.js";

import { loadHeader } from "./shared/header.js";

loadHeader();

import { supabase } from "./services/supabase.js";

document.addEventListener("DOMContentLoaded", async () => {

    await restoreSession();

    setupNavigation();

    highlightCurrentPage();

    setupLogout();

});

async function restoreSession() {

    const {

        data: {

            session

        }

    } = await supabase.auth.getSession();

    updateNavigation(session);

    supabase.auth.onAuthStateChange((event, session) => {

        updateNavigation(session);

    });

}

function updateNavigation(session) {

    const loginLinks =

        document.querySelectorAll(".guest-only");

    const accountLinks =

        document.querySelectorAll(".user-only");

    loginLinks.forEach(link => {

        link.style.display =

            session ? "none" : "";

    });

    accountLinks.forEach(link => {

        link.style.display =

            session ? "" : "none";

    });

}

async function setupNavigation() {

    const {

        data: {

            session

        }

    } = await supabase.auth.getSession();

    if (!session) return;

    const {

        data: profile

    } = await supabase

        .from("profiles")

        .select("role")

        .eq("id", session.user.id)

        .single();

    const adminLinks =

        document.querySelectorAll(".admin-only");

    adminLinks.forEach(link => {

        if (profile?.role === "admin") {

            link.style.display = "";

        } else {

            link.style.display = "none";

        }

    });

}

function highlightCurrentPage() {

    const page = document.body.dataset.page;

    if (!page) return;

    document

        .querySelectorAll("nav a")

        .forEach(link => {

            const href = link.getAttribute("href");

            if (

                href &&

                href.startsWith(page)

            ) {

                link.classList.add("active");

            }

        });

}

function setupLogout() {

    document

        .querySelectorAll(".logout-button")

        .forEach(button => {

            button.addEventListener(

                "click",

                async () => {

                    await supabase.auth.signOut();

                    window.location.href =

                        "index.html";

                }

            );

        });

}

export async function requireLogin() {

    const {

        data: {

            session

        }

    } = await supabase.auth.getSession();

    if (!session) {

        window.location.href =

            "login.html";

    }

    return session;

}

export function showToast(message) {

    let toast =

        document.getElementById("toast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "toast";

        toast.className = "toast";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

export function formatPrice(price) {

    return `€${Number(price).toFixed(2)}`;

}

export function formatDate(date) {

    return new Date(date)

        .toLocaleDateString();

}

window.addEventListener("error", event => {

    console.error(event.error);

});

window.addEventListener(

    "unhandledrejection",

    event => {

        console.error(event.reason);

    }

);

console.log(

    "DeskDesign3D initialized."

);
