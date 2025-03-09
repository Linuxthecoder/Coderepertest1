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

    function resizeCanvas() {
        const header = document.querySelector("header");
        canvas.width = header.clientWidth;
        canvas.height = header.clientHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()YOUHAVEBEENHACKEDUSINGLINUXCODETHEREPER!@#$%^&*()?><l:"}{";
    const matrix = letters.split("");

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(0);

    function drawMatrix() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "limegreen";
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = matrix[Math.floor(Math.random() * matrix.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(drawMatrix, 50);
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
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
        clearMessages();
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
        clearMessages();
    });

    showLogin?.addEventListener("click", (e) => {
        e.preventDefault();
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        clearMessages();
    });

    // Login logic - Fixed endpoint
    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch("/api/login", {  // Changed to /api/login
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                showLoginError(data.error || "Login failed");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("email", data.user.email);
            
            showLoginSuccess("Login successful!");
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            showLoginError("Network error. Try again later");
        }
    });

    // Signup logic - Fixed endpoint and error handling
    signupForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const userData = {
            username: document.getElementById("signup-username").value,
            email: document.getElementById("signup-email").value,
            phone: document.getElementById("signup-phone").value,
            password: document.getElementById("signup-password").value
        };

        try {
            const response = await fetch("/api/signup", {  // Changed to /api/signup
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                showSignupError(data.error || "Signup failed");
                return;
            }

            showSignupSuccess("Signup successful!");
            signupForm.reset();
            setTimeout(() => {
                loginForm.classList.remove("hidden");
                signupForm.classList.add("hidden");
            }, 1500);
        } catch (error) {
            showSignupError("Network error. Try again later");
        }
    });

    // Profile management
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.className = "logout-btn hidden";

    // Load user profile
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    
    if (token && username) {
        updateUserProfile(username, email);
    }

    // Profile click handler
    loggedInUser?.addEventListener("click", (e) => {
        e.stopPropagation();
        logoutBtn.classList.toggle("hidden");
    });

    document.addEventListener("click", () => {
        logoutBtn.classList.add("hidden");
    });

    logoutBtn?.addEventListener("click", () => {
        localStorage.clear();
        window.location.reload();
    });

function updateUserProfile(username, email) {
    loggedInUser.innerHTML = `<span>${username}</span>`;
    
    loggedInUser.classList.remove("hidden");
    openLoginBtn.classList.add("hidden");
    loggedInUser.parentNode.appendChild(logoutBtn);
    logoutBtn.classList.remove("hidden");
    }
}

function clearMessages() {
    document.getElementById("error-message").textContent = "";
    document.getElementById("signup-error-message").textContent = "";
}

function showLoginSuccess(message) {
    const elem = document.getElementById("error-message");
    elem.style.color = "limegreen";
    elem.textContent = message;
}

function showLoginError(message) {
    const elem = document.getElementById("error-message");
    elem.style.color = "red";
    elem.textContent = message;
}

function showSignupSuccess(message) {
    const elem = document.getElementById("signup-error-message");
    elem.style.color = "limegreen";
    elem.textContent = message;
}

function showSignupError(message) {
    const elem = document.getElementById("signup-error-message");
    elem.style.color = "red";
    elem.textContent = message;
}

// ===== Website Request Form =====
function initWebsiteRequestForm() {
    const requestForm = document.getElementById("requestForm");
    
    requestForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const formData = {
            phone: document.getElementById("requestPhone").value,
            websiteType: document.getElementById("websiteType").value, // Fixed field name
            requirements: document.getElementById("requirements").value,
            username: localStorage.getItem("username")
        };

        try {
            const response = await fetch("/api/requests", {  // Changed to /api/requests
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();  // Added response parsing
            
            if (!response.ok) {
                throw new Error(data.error || "Request failed");
            }
            
            alert("Request submitted successfully!");
            requestForm.reset();
        } catch (error) {
            alert(error.message || "Request failed. Please try again.");
        }
    });
}

// ===== Toggle Website List =====
function initToggleList() {
    const toggleButton = document.getElementById("toggleList");
    const websiteList = document.getElementById("websiteList");
    const toggleArrow = document.getElementById("toggleArrow");

    toggleButton?.addEventListener("click", () => {
        if (websiteList.style.display === "none" || websiteList.style.display === "") {
            websiteList.style.display = "block";
            toggleArrow.textContent = "▲";
        } else {
            websiteList.style.display = "none";
            toggleArrow.textContent = "▼";
        }
    });
}

