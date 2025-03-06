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
    const loggedInUser = document.getElementById("loggedInUser");
    const closeModalBtn = document.querySelector("#authModal .close");
    const loginForm = document.getElementById("loginForm");
    const profileContainer = document.createElement("div");
    profileContainer.classList.add("profile-container", "hidden");

    openLoginBtn?.parentElement.appendChild(profileContainer);

    function updateUI(username, profilePic) {
        openLoginBtn.classList.add("hidden");
        loggedInUser.textContent = username;
        loggedInUser.classList.remove("hidden");
        profileContainer.innerHTML = `<img src="${profilePic}" class="profile-pic">`;
        profileContainer.classList.remove("hidden");
    }

    function showLogoutPopup() {
        const confirmLogout = confirm("Are you sure you want to logout?");
        if (confirmLogout) {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            openLoginBtn.classList.remove("hidden");
            loggedInUser.classList.add("hidden");
            profileContainer.classList.add("hidden");
            alert("You have successfully logged out.");
        }
    }

    profileContainer.addEventListener("click", showLogoutPopup);

    loginForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", data.username);
                updateUI(data.username, data.profilePic || "https://ui-avatars.com/api/?name=" + data.username);
                loginModal.style.display = "none";
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Login failed. Try again later.");
        }
    });

    const storedUser = localStorage.getItem("username");
    if (storedUser) {
        updateUI(storedUser, "https://ui-avatars.com/api/?name=" + storedUser);
    }
}
