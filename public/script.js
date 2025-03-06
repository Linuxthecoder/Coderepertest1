document.addEventListener("DOMContentLoaded", () => {
    initMatrixEffect();
    initAuthSystem();
    initWebsiteRequestForm();
    initToggleList();
});

// ===== Toggle Website List =====
function initToggleList() {
    const toggleButton = document.getElementById("toggleList");
    const websiteList = document.getElementById("websiteList");
    const toggleArrow = document.getElementById("toggleArrow");

    if (!toggleButton || !websiteList || !toggleArrow) return;

    toggleButton.addEventListener("click", () => {
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
