import { supabase } from "./auth.js";

async function updateSession() {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    const loginButton = document.getElementById("loginButton");
    const accountButton = document.getElementById("accountButton");

    if (!loginButton || !accountButton) return;

    if (session) {

        loginButton.classList.add("hidden");
        accountButton.classList.remove("hidden");

    } else {

        loginButton.classList.remove("hidden");
        accountButton.classList.add("hidden");

    }

}

function setupSidebar() {

    const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.onclick = async () => {

        await supabase.auth.signOut();

        window.location.href = "index.html";

    };

}

    const accountButton = document.getElementById("accountButton");
    const sidebar = document.getElementById("accountSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const closeButton = document.getElementById("closeSidebar");

    if (accountButton && sidebar) {

        accountButton.onclick = () => {

            sidebar.classList.add("open");

            if (overlay)
                overlay.classList.add("show");

        };

    }

    if (closeButton) {

        closeButton.onclick = () => {

            sidebar.classList.remove("open");

            if (overlay)
                overlay.classList.remove("show");

        };

    }

    if (overlay) {

        overlay.onclick = () => {

            sidebar.classList.remove("open");
            overlay.classList.remove("show");

        };

    }

}

document.addEventListener("DOMContentLoaded", async () => {

    await updateSession();

    setupSidebar();

});

supabase.auth.onAuthStateChange(() => {

    setTimeout(updateSession, 100);

});