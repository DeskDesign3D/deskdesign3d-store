import { supabase } from "./auth.js";

let lastSession = null;

async function updateSession() {
    const { data: { session } } = await supabase.auth.getSession();
    lastSession = session;
    applySessionToDom(session);
}

function applySessionToDom(session) {
    const loginButton = document.getElementById("loginButton");
    const accountButton = document.getElementById("accountButton");
    if (!loginButton || !accountButton) return false;

    if (session) {
        loginButton.classList.add("hidden");
        accountButton.classList.remove("hidden");
    } else {
        loginButton.classList.remove("hidden");
        accountButton.classList.add("hidden");
    }
    return true;
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
            if (overlay) overlay.classList.add("show");
        };
    }
    if (closeButton) {
        closeButton.onclick = () => {
            sidebar.classList.remove("open");
            if (overlay) overlay.classList.remove("show");
        };
    }
    if (overlay) {
        overlay.onclick = () => {
            sidebar.classList.remove("open");
            overlay.classList.remove("show");
        };
    }
}

// Run once the header is injected (fires from loadHeader()).
document.addEventListener("header:ready", async () => {
    await updateSession();
    setupSidebar();
});

// Fallback in case a page never dispatches header:ready (e.g. static header).
document.addEventListener("DOMContentLoaded", async () => {
    await updateSession();
    setupSidebar();
});

// React to login/logout across tabs and after auth flows.
supabase.auth.onAuthStateChange((_event, session) => {
    lastSession = session;
    // Retry a few times in case the header hasn't been injected yet.
    let tries = 0;
    const attempt = () => {
        if (applySessionToDom(session)) return;
        if (++tries < 20) setTimeout(attempt, 50);
    };
    attempt();
});
