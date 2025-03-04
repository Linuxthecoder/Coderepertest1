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
    const logoutModal = document.getElementById("logoutModal");
    const confirmLogoutBtn = document.getElementById("confirmLogout");
    const cancelLogoutBtn = document.getElementById("cancelLogout");

    const signupMessage = document.getElementById("signupMessage");
    const loginMessage = document.getElementById("loginMessage");

    // Load user profile if logged in
    const storedUser = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");

    if (storedUser) {
        openLoginBtn.classList.add("hidden");
        loggedInUser.innerHTML = `
            <img src="https://www.gravatar.com/avatar/${md5(storedEmail)}?d=identicon" class="profile-pic">
            <span>${storedUser}</span>
        `;
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

    // **Signup Form Submission**
    signupForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("signup-username").value;
        const password = document.getElementById("signup-password").value;
        const email = document.getElementById("signup-email").value;
        const phone = document.getElementById("signup-phone").value;

        try {
            const response = await fetch("/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, email, phone }),
            });

            const data = await response.json();
            if (response.ok) {
                signupMessage.textContent = "Signup successful! Please log in.";
                signupMessage.style.color = "green";
                signupForm.reset();
            } else {
                signupMessage.textContent = data.error || "Signup failed";
                signupMessage.style.color = "red";
            }
        } catch (error) {
            signupMessage.textContent = "An error occurred. Please try again.";
            signupMessage.style.color = "red";
        }
    });

    // **Login Form Submission**
    loginForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", username);
                localStorage.setItem("email", data.email);
                window.location.reload();
            } else {
                loginMessage.textContent = data.error || "Login failed";
                loginMessage.style.color = "red";
            }
        } catch (error) {
            loginMessage.textContent = "An error occurred. Please try again.";
            loginMessage.style.color = "red";
        }
    });

    // **Logout Functionality**
    loggedInUser?.addEventListener("click", () => {
        logoutModal.style.display = "block";
    });

    confirmLogoutBtn?.addEventListener("click", () => {
        localStorage.clear();
        window.location.reload();
    });

    cancelLogoutBtn?.addEventListener("click", () => {
        logoutModal.style.display = "none";
    });
}

// ===== Website Request Form =====
function initWebsiteRequestForm() {
    const requestForm = document.getElementById("requestForm");
    const requestMessage = document.getElementById("requestMessage");

    if (!requestForm) return;

    requestForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const phone = document.getElementById("request-phone").value;
        const type = document.getElementById("request-type").value;
        const requirements = document.getElementById("request-requirements").value;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/request", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ phone, type, requirements }),
            });

            const data = await response.json();
            if (response.ok) {
                requestMessage.textContent = "Request has been sent!";
                requestMessage.style.color = "green";
                requestForm.reset();
            } else {
                requestMessage.textContent = data.error || "Request failed";
                requestMessage.style.color = "red";
            }
        } catch (error) {
            requestMessage.textContent = "An error occurred. Please try again.";
            requestMessage.style.color = "red";
        }
    });
}
