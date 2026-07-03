// Register a new user
async function register() {
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (!email || !password) {
        alert("Please enter an email and password.");
        return;
    }

    const { error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }

    alert("Account created! Check your email to verify your account before logging in.");
}

// Login
async function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }

    // Check if the user is an admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

    if (profile && profile.role === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "index.html";
    }
}

// Password reset
async function forgotPassword() {
    const email = prompt("Enter your email address:");

    if (!email) return;

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
        alert(error.message);
        return;
    }

    alert("If an account exists, a password reset email has been sent.");
}
