const loginForm = document.getElementById("loginForm");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");

const successMessage = document.getElementById("successMessage");

const togglePassword = document.getElementById("togglePassword");

const facebookLogin = document.getElementById("facebookLogin");
const forgotPassword = document.getElementById("forgotPassword");
const signupLink = document.getElementById("signupLink");


/* Clear Validation */

function clearErrors() {
    usernameError.textContent = "";
    passwordError.textContent = "";

    usernameInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");

    successMessage.classList.remove("show");
    successMessage.textContent = "";
}


/* Validate Username */

function validateUsername() {

    const username = usernameInput.value.trim();

    if (username === "") {
        usernameError.textContent =
            "Please enter your username, email, or phone number.";

        usernameInput.classList.add("input-error");

        return false;
    }

    if (username.length < 3) {
        usernameError.textContent =
            "Please enter at least 3 characters.";

        usernameInput.classList.add("input-error");

        return false;
    }

    return true;
}


/* Validate Password */

function validatePassword() {

    const password = passwordInput.value;

    if (password.trim() === "") {
        passwordError.textContent =
            "Please enter your password.";

        passwordInput.classList.add("input-error");

        return false;
    }

    if (password.length < 6) {
        passwordError.textContent =
            "Password must contain at least 6 characters.";

        passwordInput.classList.add("input-error");

        return false;
    }

    return true;
}


/* Login */

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    clearErrors();

    const usernameValid = validateUsername();
    const passwordValid = validatePassword();

    if (!usernameValid || !passwordValid) {
        return;
    }

    successMessage.textContent =
        "Login validation successful. This demo does not submit or store credentials.";

    successMessage.classList.add("show");

});


/* Show / Hide Password */

togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        togglePassword.textContent = "Hide";

    } else {

        passwordInput.type = "password";
        togglePassword.textContent = "Show";

    }

});


/* Remove Errors While Typing */

usernameInput.addEventListener("input", function () {

    usernameError.textContent = "";
    usernameInput.classList.remove("input-error");

    successMessage.classList.remove("show");

});


passwordInput.addEventListener("input", function () {

    passwordError.textContent = "";
    passwordInput.classList.remove("input-error");

    successMessage.classList.remove("show");

});


/* Facebook Login */

facebookLogin.addEventListener("click", function () {

    alert("Facebook login is not available in this demo.");

});


/* Forgot Password */

forgotPassword.addEventListener("click", function (event) {

    event.preventDefault();

    alert("Password recovery is not available in this demo.");

});


/* Sign Up */

signupLink.addEventListener("click", function (event) {

    event.preventDefault();

    alert("Sign-up functionality is not available in this demo.");

});