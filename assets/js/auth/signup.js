import {
    auth,
    validateEmail,
    passwordValid,
    updatePasswordRules,
    showLoading,
    hideLoading,
    showMessage,
    clearMessage
} from "./auth.js";

const signupForm = document.getElementById("signupForm");

const passwordInput = document.getElementById("signupPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");

if (passwordInput) {

    passwordInput.addEventListener("input", () => {

        updatePasswordRules(passwordInput.value);

    });

}

if (signupForm) {

    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearMessage();

        const firstName = document
            .getElementById("firstName")
            .value
            .trim();

        const lastName = document
            .getElementById("lastName")
            .value
            .trim();

        const email = document
            .getElementById("signupEmail")
            .value
            .trim()
            .toLowerCase();

        const password = passwordInput.value;

        const confirmPassword = confirmPasswordInput.value;

        const agreeTerms = document
            .getElementById("agreeTerms")
            .checked;

        if (!firstName || !lastName) {

            showMessage(

                "Please enter your name.",

                false

            );

            return;

        }

        if (!validateEmail(email)) {

            showMessage(

                "Please enter a valid email address.",

                false

            );

            return;

        }

        if (!passwordValid(password)) {

            showMessage(

                "Password does not meet all requirements.",

                false

            );

            return;

        }

        if (password !== confirmPassword) {

            showMessage(

                "Passwords do not match.",

                false

            );

            return;

        }

        if (!agreeTerms) {

            showMessage(

                "You must accept the Terms and Privacy Policy.",

                false

            );

            return;

        }

        showLoading();

        try {

            const {

                data,

                error

            } = await auth.signUp({

                email,

                password,

                options: {

                    emailRedirectTo:

                        `${window.location.origin}/login.html`,

                    data: {

                        first_name: firstName,

                        last_name: lastName

                    }

                }

            });

            hideLoading();

            if (error) {

                showMessage(

                    error.message,

                    false

                );

                return;

            }

            if (!data.user) {

                showMessage(

                    "Unable to create account.",

                    false

                );

                return;

            }

            showMessage(

                "Account created successfully. Please check your email to verify your account."

            );

            signupForm.reset();

            document

                .getElementById("strengthBar")

                .style.width = "0%";

            [

                "ruleLength",

                "ruleUpper",

                "ruleLower",

                "ruleNumber",

                "ruleSpecial"

            ].forEach(rule => {

                const element = document.getElementById(rule);

                if (element) {

                    element.classList.remove(

                        "valid",

                        "invalid"

                    );

                }

            });

        }

        catch (error) {

            hideLoading();

            showMessage(

                error.message,

                false

            );

        }

    });

}
