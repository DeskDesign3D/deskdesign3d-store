import { auth, showLoading, hideLoading, showMessage, clearMessage } from "./auth.js";

const loginForm = document.getElementById("loginForm");
const forgotForm = document.getElementById("resetPasswordForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearMessage();

        const email = document
            .getElementById("loginEmail")
            .value
            .trim()
            .toLowerCase();

        const password = document
            .getElementById("loginPassword")
            .value;

        if (!email || !password) {

            showMessage(
                "Please fill in all fields.",
                false
            );

            return;

        }

        showLoading();

        try {

            const {

                data,

                error

            } = await auth.signInWithPassword({

                email,

                password

            });

            hideLoading();

            if (error) {

                showMessage(

                    error.message,

                    false

                );

                return;

            }

            if (!data.session) {

                showMessage(

                    "Unable to create session.",

                    false

                );

                return;

            }

            showMessage(

                "Login successful."

            );

            setTimeout(() => {

                window.location.href = "account.html";

            }, 600);

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

if (forgotForm) {

    forgotForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearMessage();

        const email = document

            .getElementById("resetEmail")

            .value

            .trim()

            .toLowerCase();

        if (!email) {

            showMessage(

                "Please enter your email address.",

                false

            );

            return;

        }

        showLoading();

        try {

            const {

                error

            } = await auth.resetPasswordForEmail(

                email,

                {

                    redirectTo:

                        `${window.location.origin}/login.html`

                }

            );

            hideLoading();

            if (error) {

                showMessage(

                    error.message,

                    false

                );

                return;

            }

            showMessage(

                "Password reset email sent."

            );

            forgotForm.reset();

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

window.addEventListener(

    "pageshow",

    () => {

        clearMessage();

    }

);
