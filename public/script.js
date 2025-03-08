document.addEventListener("DOMContentLoaded", () => {
    initMatrixEffect();
    initAuthSystem();
    initWebsiteRequestForm();
    initToggleList();
});

// Authentication System
function initAuthSystem() {
    const loginModal = document.getElementById("authModal");
    const openLoginBtn = document.getElementById("openLogin");
    const closeModalBtn = document.querySelector("#authModal .close");
    const loggedInUser = document.getElementById("loggedInUser");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const showSignUp = document.getElementById("showSignUp");
    const showLogin = document.getElementById("showLogin");

    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.classList.add("logout-btn", "hidden");

    const storedUser = localStorage.getItem("username");
    if (storedUser) {
        openLoginBtn.classList.add("hidden");
        loggedInUser.textContent = storedUser;
        loggedInUser.classList.remove("hidden");
        loggedInUser.parentElement.appendChild(logoutBtn);
        logoutBtn.classList.remove("hidden");
    }

    openLoginBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        loginModal.style.display = "flex";
    });

    closeModalBtn?.addEventListener("click", () => {
        loginModal.style.display = "none";
    });

    window.onclick = function (event) {
        if (event.target === loginModal) {
            loginModal.style.display = "none";
        }
    };

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

    // Signup Form Submission
    signupForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("signupUsername").value;
        const password = document.getElementById("signupPassword").value;
        const email = document.getElementById("signupEmail").value;
        const phone = document.getElementById("signupPhone").value;

        try {
            const response = await fetch("/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, email, phone }),
            });

            const data = await response.json();
            console.log("Signup Response:", data);

            if (response.ok) {
                alert(data.message);
                signupForm.reset();
                loginForm.classList.remove("hidden");
                signupForm.classList.add("hidden");
            } else {
                alert(data.error || "Signup failed");
            }
        } catch (error) {
            console.error("Signup Error:", error);
        }
    });
}
