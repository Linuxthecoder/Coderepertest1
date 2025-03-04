document.addEventListener("DOMContentLoaded", () => {
    initMatrixEffect();
    initAuthSystem();
    initWebsiteRequestForm();
    initToggleList();
});

// ===== Authentication System =====
function initAuthSystem() {
    const loginModal = document.getElementById("authModal");
    const openLoginBtn = document.getElementById("openLogin");
    const closeModalBtn = document.querySelector("#authModal .close");
    const loggedInUser = document.getElementById("loggedInUser");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const showSignUp = document.getElementById("showSignUp");
    const showLogin = document.getElementById("showLogin");
    const errorMessage = document.getElementById("error-message");

    // Check for existing session
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
        openLoginBtn.classList.add("hidden");
        loggedInUser.textContent = storedUser;
        loggedInUser.classList.remove("hidden");
    }

    // Open Login Modal
    openLoginBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        loginModal.style.display = "flex";
    });

    // Close Login Modal
    closeModalBtn?.addEventListener("click", () => {
        loginModal.style.display = "none";
    });

    window.onclick = function (event) {
        if (event.target === loginModal) {
            loginModal.style.display = "none";
        }
    };

    // Show Sign Up Form
    showSignUp?.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");
    });

    // Show Login Form
    showLogin?.addEventListener("click", (e) => {
        e.preventDefault();
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
    });

    // Sign Up Form Submission (Fixed)
    signupForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = document.getElementById("signup-username").value;
        const password = document.getElementById("signup-password").value;
        const email = document.getElementById("signup-email").value;
        const phone = document.getElementById("signup-phone").value;

        try {
            const response = await fetch("http://localhost:5000/signup", { // Update if deployed
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, email, phone }),
            });

            const data = await response.json();

            if (response.ok) {
                errorMessage.textContent = data.message;
                errorMessage.style.color = "green";
                signupForm.reset();
                showLogin.click(); // Redirect to login form
            } else {
                errorMessage.textContent = data.error;
                errorMessage.style.color = "red";
            }
        } catch (error) {
            errorMessage.textContent = "An error occurred. Please try again.";
            errorMessage.style.color = "red";
        }
    });

    // Login Form Submission
    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("username", username);
                loggedInUser.textContent = username;
                loggedInUser.classList.remove("hidden");
                loginModal.style.display = "none";
            } else {
                errorMessage.textContent = data.error;
                errorMessage.style.color = "red";
            }
        } catch (error) {
            errorMessage.textContent = "An error occurred. Please try again.";
            errorMessage.style.color = "red";
        }
    });
}
