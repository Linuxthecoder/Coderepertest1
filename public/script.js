document.addEventListener("DOMContentLoaded", () => {
    initMatrixEffect();
    initAuthSystem();
    initToggleList();
    initWebsiteRequestForm();
});

// ===== Matrix Effect ===== 
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

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()";
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

    // Login logic
    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const loginData = {
            username: document.getElementById("login-username").value,
            password: document.getElementById("login-password").value
        };

        clearMessages();
        
        try {
            const users = JSON.parse(localStorage.getItem("users") || [];
            const user = users.find(u => u.username === loginData.username && u.password === loginData.password);
            
            if (!user) {
                showLoginError("❌ Invalid username or password");
                return;
            }

            localStorage.setItem("token", "dummy-token");
            localStorage.setItem("currentUser", JSON.stringify(user));
            showLoginSuccess("✅ Login successful!");
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            showLoginError("❌ Login failed");
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

        clearMessages();
        
        try {
            const users = JSON.parse(localStorage.getItem("users") || [];
            
            if (users.some(u => u.username === userData.username)) {
                showSignupError("❌ Username already exists");
                return;
            }
            
            if (users.some(u => u.email === userData.email)) {
                showSignupError("❌ Email already registered");
                return;
            }

            users.push(userData);
            localStorage.setItem("users", JSON.stringify(users));
            showSignupSuccess("✅ Signup successful! Redirecting...");
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            showSignupError("❌ Signup failed");
        }
    });

    // Profile and logout
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.classList.add("logout-btn", "hidden");

    // Check existing login
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
        updateUserProfile(currentUser);
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
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        window.location.reload();
    });
}

// Helper functions
function updateUserProfile(user) {
    const loggedInUser = document.getElementById("loggedInUser");
    const openLoginBtn = document.getElementById("openLogin");
    
    // Add profile image
    const profileImg = document.createElement("img");
    profileImg.classList.add("profile-img");
    profileImg.src = getGravatar(user.email) || "https://via.placeholder.com/30";
    profileImg.alt = "Profile";
    
    loggedInUser.innerHTML = "";
    loggedInUser.appendChild(profileImg);
    loggedInUser.insertAdjacentHTML("beforeend", ` ${user.username}`);
    
    openLoginBtn.classList.add("hidden");
    loggedInUser.classList.remove("hidden");
    loggedInUser.parentElement.appendChild(logoutBtn);
}

function getGravatar(email) {
    if (!email) return null;
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=retro`;
}

function clearMessages() {
    document.getElementById("error-message").textContent = "";
    document.getElementById("signup-error-message").textContent = "";
}

function showLoginSuccess(message) {
    document.getElementById("error-message").style.color = "limegreen";
    document.getElementById("error-message").textContent = message;
}

function showLoginError(message) {
    document.getElementById("error-message").style.color = "red";
    document.getElementById("error-message").textContent = message;
}

function showSignupSuccess(message) {
    document.getElementById("signup-error-message").style.color = "limegreen";
    document.getElementById("signup-error-message").textContent = message;
}

function showSignupError(message) {
    document.getElementById("signup-error-message").style.color = "red";
    document.getElementById("signup-error-message").textContent = message;
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
