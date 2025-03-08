document.addEventListener("DOMContentLoaded", () => {
    initMatrixEffect();
    initAuthSystem();
    initWebsiteRequestForm();
    initToggleList();
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

    // Ensure all elements exist before adding event listeners
    if (!loginModal || !openLoginBtn || !closeModalBtn || !loginForm) {
        console.error("Auth elements missing!");
        return;
    }

    // Open login modal on button click
    openLoginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        loginModal.style.display = "flex";
    });

    // Close login modal
    closeModalBtn.addEventListener("click", () => {
        loginModal.style.display = "none";
    });

    // Handle login form submission
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value.trim();

        if (!username || !password) {
            alert("Please enter both username and password.");
            return;
        }

        try {
            console.log("Sending login request...");
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            console.log("Response received:", data);

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", data.username);
                showUserProfile(data.username, data.profilePic || `https://ui-avatars.com/api/?name=${data.username}`);
                loginModal.style.display = "none";
            } else {
                alert(data.error || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("An error occurred. Please try again.");
        }
    });

    // If user is already logged in, update UI
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
        showUserProfile(storedUser, `https://ui-avatars.com/api/?name=${storedUser}`);
    }
}

// Function to show user profile after login
function showUserProfile(username, profilePic) {
    const openLoginBtn = document.getElementById("openLogin");
    const loggedInUser = document.getElementById("loggedInUser");

    if (!openLoginBtn || !loggedInUser) {
        console.error("Profile elements missing!");
        return;
    }

    openLoginBtn.classList.add("hidden");
    loggedInUser.innerHTML = `
        <div class="user-profile">
            <img src="${profilePic}" class="user-avatar" />
            <span>${username}</span>
            <div class="dropdown">
                <button id="logoutBtn">Logout</button>
            </div>
        </div>
    `;
    loggedInUser.classList.remove("hidden");

    document.getElementById("logoutBtn")?.addEventListener("click", showLogoutPopup);
}

// Logout confirmation popup
function showLogoutPopup() {
    const confirmLogout = confirm("Are you sure you want to logout?");
    if (confirmLogout) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.reload();
    }
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

