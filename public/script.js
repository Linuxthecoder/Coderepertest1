document.addEventListener("DOMContentLoaded", () => {
    initMatrixEffect();
    initAuthSystem();
    initToggleList();
    initWebsiteRequestForm();
});

// ===== Matrix Effect =====
function initMatrixEffect() {
    const canvas = document.getElementById("matrixCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    // ... keep your existing matrix effect code unchanged ...
}

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

    // Modal controls
    openLoginBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        loginModal.style.display = "flex";
    });

    closeModalBtn?.addEventListener("click", () => {
        loginModal.style.display = "none";
    });

    window.onclick = (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = "none";
        }
    };

    // Form toggles
    showSignUp?.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");
    });

    showLogin?.addEventListener("click", (e) => {
        e.preventDefault();
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
    });

    // Login logic
    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const loginData = {
            username: document.getElementById("login-username").value,
            password: document.getElementById("login-password").value
        };

        try {
            // Simulated API call
            console.log("Login attempt with:", loginData);
            localStorage.setItem("token", "dummy-token");
            localStorage.setItem("username", loginData.username);
            alert("✅ Login successful!");
            window.location.reload();
        } catch (error) {
            document.getElementById("error-message").textContent = "❌ Login failed.";
        }
    });

    // Signup logic
    signupForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const userData = {
            username: document.getElementById("signup-username").value,
            email: document.getElementById("signup-email").value,
            phone: document.getElementById("signup-phone").value,
            password: document.getElementById("signup-password").value
        };

        try {
            // Simulated API call
            console.log("Signup attempt with:", userData);
            alert("✅ Signup successful! You can now log in.");
            signupForm.reset();
            loginForm.classList.remove("hidden");
            signupForm.classList.add("hidden");
        } catch (error) {
            document.getElementById("signup-error-message").textContent = "❌ An error occurred.";
        }
    });

    // Logout logic
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.classList.add("logout-btn", "hidden");

    // Check existing login
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
        document.getElementById("openLogin").classList.add("hidden");
        loggedInUser.textContent = storedUser;
        loggedInUser.classList.remove("hidden");
        loggedInUser.parentElement.appendChild(logoutBtn);
        logoutBtn.classList.remove("hidden");
    }

    logoutBtn?.addEventListener("click", () => {
        localStorage.clear();
        window.location.reload();
    });
}

// ===== Website Request Form =====
function initWebsiteRequestForm() {
    const requestForm = document.getElementById("requestForm");
    requestForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Request submitted successfully!");
        requestForm.reset();
    });
}

// ===== Toggle Website List =====
function initToggleList() {
    const toggleButton = document.getElementById("toggleList");
    const websiteList = document.getElementById("websiteList");
    const toggleArrow = document.getElementById("toggleArrow");

    toggleButton?.addEventListener("click", () => {
        websiteList.classList.toggle("hidden");
        toggleArrow.textContent = websiteList.classList.contains("hidden") ? "▼" : "▲";
    });
}
