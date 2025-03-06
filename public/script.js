document.addEventListener("DOMContentLoaded", () => {
    initMatrixEffect();
    initAuthSystem();
    initWebsiteRequestForm();
    initToggleList();
});

// ===== Toggle Website List Fix =====
function initToggleList() {
    const toggleButton = document.getElementById("toggleList");
    const websiteList = document.getElementById("websiteList");
    const toggleArrow = document.getElementById("toggleArrow");

    toggleButton?.addEventListener("click", () => {
        websiteList.classList.toggle("hidden");
        toggleArrow.textContent = websiteList.classList.contains("hidden") ? "▼" : "▲";
    });
}

// ===== Authentication System =====
function initAuthSystem() {
    const loginModal = document.getElementById("authModal");
    const openLoginBtn = document.getElementById("openLogin");
    const closeModalBtn = document.querySelector("#authModal .close");
    const loggedInUser = document.getElementById("loggedInUser");
    const loginForm = document.getElementById("loginForm");
    const logoutModal = document.getElementById("logoutModal");
    const confirmLogoutBtn = document.getElementById("confirmLogout");
    const cancelLogoutBtn = document.getElementById("cancelLogout");

    // Check if user is already logged in
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
        showUserProfile(storedUser);
    }

    openLoginBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        loginModal.style.display = "flex";
    });

    closeModalBtn?.addEventListener("click", () => {
        loginModal.style.display = "none";
    });

    // Handle login form submission
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
                localStorage.setItem("username", data.username);
                localStorage.setItem("token", data.token);
                showUserProfile(data.username);
                loginModal.style.display = "none";
            } else {
                alert(data.error || "Login failed");
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
        }
    });

    // Handle logout confirmation popup
    confirmLogoutBtn?.addEventListener("click", () => {
        logoutUser();
        logoutModal.style.display = "none";
    });

    cancelLogoutBtn?.addEventListener("click", () => {
        logoutModal.style.display = "none";
    });
}

// Show user profile after login
function showUserProfile(username) {
    const openLoginBtn = document.getElementById("openLogin");
    const loggedInUser = document.getElementById("loggedInUser");

    openLoginBtn.classList.add("hidden");
    loggedInUser.classList.remove("hidden");
    loggedInUser.innerHTML = `
        <img src="https://ui-avatars.com/api/?name=${username}&background=random" class="user-avatar" />
        <span>${username}</span>
        <div class="dropdown">
            <button id="logoutBtn">Logout</button>
        </div>
    `;

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        logoutModal.style.display = "flex";
    });
}

// Logout user
function logoutUser() {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    window.location.reload();
}
