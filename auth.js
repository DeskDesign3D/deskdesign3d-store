// Wait for Supabase to be initialized
function waitForSupabase() {
    return new Promise((resolve) => {
        if (typeof supabase !== 'undefined' && supabase.auth) {
            resolve();
        } else {
            // Check every 50ms for up to 5 seconds
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (typeof supabase !== 'undefined' && supabase.auth) {
                    clearInterval(interval);
                    resolve();
                } else if (attempts > 100) {
                    clearInterval(interval);
                    console.error('Supabase failed to initialize');
                    resolve(); // Resolve anyway to prevent hanging
                }
            }, 50);
        }
    });
}

// Cache DOM elements to avoid repeated queries
const DOM = {
    registerEmail: null,
    registerPassword: null,
    loginEmail: null,
    loginPassword: null,
    registerBtn: null,
    loginBtn: null,
    forgotBtn: null,
    messageContainer: null,
};

// Initialize DOM cache
function initDOM() {
    DOM.registerEmail = document.getElementById("registerEmail");
    DOM.registerPassword = document.getElementById("registerPassword");
    DOM.loginEmail = document.getElementById("loginEmail");
    DOM.loginPassword = document.getElementById("loginPassword");
    DOM.registerBtn = document.getElementById("registerBtn");
    DOM.loginBtn = document.getElementById("loginBtn");
    DOM.forgotBtn = document.getElementById("forgotBtn");
    DOM.messageContainer = document.getElementById("messageContainer");
}

// Initialize DOM when page loads (after Supabase is ready)
document.addEventListener("DOMContentLoaded", async () => {
    await waitForSupabase();
    initDOM();
});

// Show feedback message (non-blocking)
function showMessage(message, type = "info") {
    if (!DOM.messageContainer) {
        DOM.messageContainer = document.getElementById("messageContainer");
    }

    const messageEl = document.createElement("div");
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    messageEl.setAttribute("role", "alert");

    if (DOM.messageContainer) {
        DOM.messageContainer.innerHTML = "";
        DOM.messageContainer.appendChild(messageEl);
    } else {
        console.error(message);
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, 5000);
}

// Clear feedback message
function clearMessage() {
    if (DOM.messageContainer) {
        DOM.messageContainer.innerHTML = "";
    }
}

// Disable/enable buttons to prevent duplicate requests
function setButtonsDisabled(disabled) {
    if (DOM.registerBtn) DOM.registerBtn.disabled = disabled;
    if (DOM.loginBtn) DOM.loginBtn.disabled = disabled;
    if (DOM.forgotBtn) DOM.forgotBtn.disabled = disabled;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password) {
    return password && password.length >= 8;
}

// Register a new user
async function register() {
    clearMessage();
    
    if (!DOM.registerEmail || !DOM.registerPassword) {
        console.error("Register form elements not found");
        showMessage("Form elements not found. Please refresh the page.", "error");
        return;
    }

    if (typeof supabase === 'undefined' || !supabase.auth) {
        showMessage("Supabase client not initialized. Please refresh the page.", "error");
        console.error("Supabase not initialized");
        return;
    }

    const email = DOM.registerEmail.value.trim();
    const password = DOM.registerPassword.value;

    // Validation
    if (!email || !password) {
        showMessage("Please enter an email and password.", "error");
        return;
    }

    if (!isValidEmail(email)) {
        showMessage("Please enter a valid email address.", "error");
        return;
    }

    if (!isValidPassword(password)) {
        showMessage("Password must be at least 8 characters long.", "error");
        return;
    }

    setButtonsDisabled(true);
    showMessage("Creating account...", "info");

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            showMessage(`Registration failed: ${error.message}`, "error");
            return;
        }

        // Clear form
        DOM.registerEmail.value = "";
        DOM.registerPassword.value = "";

        showMessage(
            "Account created! Check your email to verify your account before logging in.",
            "success"
        );
    } catch (err) {
        showMessage(`Unexpected error: ${err.message}`, "error");
    } finally {
        setButtonsDisabled(false);
    }
}

// Login
async function login() {
    clearMessage();
    
    if (!DOM.loginEmail || !DOM.loginPassword) {
        console.error("Login form elements not found");
        showMessage("Form elements not found. Please refresh the page.", "error");
        return;
    }

    if (typeof supabase === 'undefined' || !supabase.auth) {
        showMessage("Supabase client not initialized. Please refresh the page.", "error");
        console.error("Supabase not initialized");
        return;
    }

    const email = DOM.loginEmail.value.trim();
    const password = DOM.loginPassword.value;

    // Validation
    if (!email || !password) {
        showMessage("Please enter your email and password.", "error");
        return;
    }

    setButtonsDisabled(true);
    showMessage("Logging in...", "info");

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            showMessage(`Login failed: ${error.message}`, "error");
            return;
        }

        // Fetch user profile to check role
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

        if (profileError) {
            console.error("Profile fetch error:", profileError);
            showMessage("Error fetching user profile. Please try again.", "error");
            return;
        }

        if (!profile) {
            showMessage("User profile not found. Please contact support.", "error");
            return;
        }

        // Redirect based on role
        const redirectUrl = profile.role === "admin" ? "admin.html" : "index.html";
        
        // Use setTimeout to ensure message is shown before redirect
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 500);

    } catch (err) {
        showMessage(`Unexpected error: ${err.message}`, "error");
    } finally {
        setButtonsDisabled(false);
    }
}

// Password reset
async function forgotPassword() {
    clearMessage();
    
    if (typeof supabase === 'undefined' || !supabase.auth) {
        showMessage("Supabase client not initialized. Please refresh the page.", "error");
        console.error("Supabase not initialized");
        return;
    }

    // Use modal dialog instead of blocking prompt
    const email = prompt("Enter your email address:");

    if (!email || !email.trim()) {
        return;
    }

    const trimmedEmail = email.trim();

    if (!isValidEmail(trimmedEmail)) {
        showMessage("Please enter a valid email address.", "error");
        return;
    }

    setButtonsDisabled(true);
    showMessage("Sending password reset email...", "info");

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);

        if (error) {
            showMessage(`Error: ${error.message}`, "error");
            return;
        }

        showMessage(
            "If an account exists with this email, a password reset link has been sent.",
            "success"
        );
    } catch (err) {
        showMessage(`Unexpected error: ${err.message}`, "error");
    } finally {
        setButtonsDisabled(false);
    }
}