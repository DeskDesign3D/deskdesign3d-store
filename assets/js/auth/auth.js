import { supabase } from "../services/supabase.js";

export const auth = supabase.auth;

export const authElements = {

    message:

        document.getElementById("authMessage"),

    loading:

        document.getElementById("loadingOverlay")

};

export function showLoading() {

    if (!authElements.loading) return;

    authElements.loading.classList.remove("hidden");

}

export function hideLoading() {

    if (!authElements.loading) return;

    authElements.loading.classList.add("hidden");

}

export function showMessage(message, success = true) {

    if (!authElements.message) return;

    authElements.message.classList.remove("hidden");

    authElements.message.textContent = message;

    authElements.message.className = success

        ? "success-message"

        : "error-message";

}

export function clearMessage() {

    if (!authElements.message) return;

    authElements.message.className = "hidden";

    authElements.message.textContent = "";

}

export function validateEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

export function validatePassword(password) {

    return {

        length:

            password.length >= 8,

        upper:

            /[A-Z]/.test(password),

        lower:

            /[a-z]/.test(password),

        number:

            /\d/.test(password),

        special:

            /[^A-Za-z0-9]/.test(password)

    };

}

export function passwordValid(password) {

    const result = validatePassword(password);

    return Object.values(result).every(Boolean);

}

export function updateStrength(password) {

    const bar = document.getElementById("strengthBar");

    if (!bar) return;

    const result = validatePassword(password);

    let score = 0;

    Object.values(result).forEach(value => {

        if (value) score++;

    });

    bar.style.width = `${score * 20}%`;

}

export async function logout() {

    showLoading();

    await auth.signOut();

    hideLoading();

    window.location.href = "index.html";

}

export async function currentSession() {

    const {

        data: {

            session

        }

    } = await auth.getSession();

    return session;

}

export async function currentUser() {

    const session = await currentSession();

    if (!session) return null;

    return session.user;

}

export async function requireLogin() {

    const session = await currentSession();

    if (!session) {

        window.location.href = "login.html";

        return null;

    }

    return session;

}

export async function requireAdmin() {

    const session = await requireLogin();

    if (!session) return;

    const {

        data: profile

    } = await supabase

        .from("profiles")

        .select("role")

        .eq("id", session.user.id)

        .single();

    if (!profile || profile.role !== "admin") {

        window.location.href = "index.html";

    }

}

export function updateRule(id, state) {

    const element = document.getElementById(id);

    if (!element) return;

    if (state) {

        element.classList.add("valid");

        element.classList.remove("invalid");

    }

    else {

        element.classList.add("invalid");

        element.classList.remove("valid");

    }

}

export function updatePasswordRules(password) {

    const rules = validatePassword(password);

    updateRule("ruleLength", rules.length);

    updateRule("ruleUpper", rules.upper);

    updateRule("ruleLower", rules.lower);

    updateRule("ruleNumber", rules.number);

    updateRule("ruleSpecial", rules.special);

    updateStrength(password);

}
