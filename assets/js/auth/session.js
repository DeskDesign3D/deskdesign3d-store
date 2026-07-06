import { supabase } from "../services/supabase.js";
import { logout } from "./auth.js";

const loginButton = document.getElementById("loginButton");
const accountButton = document.getElementById("accountButton");
const logoutButton = document.getElementById("logoutButton");

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");

const sidebar = document.getElementById("accountSidebar");
const closeSidebar = document.getElementById("closeSidebar");

async function loadProfile(userId) {

    const {

        data,

        error

    } = await supabase

        .from("profiles")

        .select("*")

        .eq("id", userId)

        .single();

    if (error || !data) {

        return;

    }

    if (userName) {

        userName.textContent =

            `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim()

            ||

            "Customer";

    }

    if (userEmail) {

        userEmail.textContent =

            data.email;

    }

}

async function updateSession() {

    const {

        data: {

            session

        }

    } = await supabase.auth.getSession();

    if (!session) {

        if (loginButton) {

            loginButton.classList.remove("hidden");

        }

        if (accountButton) {

            accountButton.classList.add("hidden");

        }

        return;

    }

    if (loginButton) {

        loginButton.classList.add("hidden");

    }

    if (accountButton) {

        accountButton.classList.remove("hidden");

    }

    await loadProfile(

        session.user.id

    );

}

if (accountButton && sidebar) {

    accountButton.addEventListener(

        "click",

        () => {

            sidebar.classList.add("open");

        }

    );

}

if (closeSidebar && sidebar) {

    closeSidebar.addEventListener(

        "click",

        () => {

            sidebar.classList.remove("open");

        }

    );

}

if (logoutButton) {

    logoutButton.addEventListener(

        "click",

        logout

    );

}

supabase.auth.onAuthStateChange(

    async () => {

        await updateSession();

    }

);

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await updateSession();

    }

);
