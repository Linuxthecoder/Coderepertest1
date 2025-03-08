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
    const signupForm = document.getElementById("signupForm");
    const showSignUp = document.getElementById("showSignUp");
    const showLogin = document.getElementById("showLogin");

    // Logout Button
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

    // Login Form Submission
    loginForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            console.log("Login Response:", data);

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", username);
                loginModal.style.display = "none";
                openLoginBtn.classList.add("hidden");
                loggedInUser.textContent = username;
                loggedInUser.classList.remove("hidden");

                logoutBtn.classList.remove("hidden");
            } else {
                alert(data.error || "Login failed");
            }
        } catch (error) {
            console.error("Login Error:", error);
        }
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

    // Logout Functionality
    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        loggedInUser.classList.add("hidden");
        openLoginBtn.classList.remove("hidden");
        logoutBtn.classList.add("hidden");
    });
}

// ===== Website Request Form =====
function initWebsiteRequestForm() {
    const requestForm = document.getElementById("websiteRequestForm");
    const messageDiv = document.getElementById("formMessage");

    requestForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!localStorage.getItem("token")) {
            messageDiv.textContent = "Please login first.";
            messageDiv.className = "message error";
            messageDiv.hidden = false;
            return;
        }

        const formData = {
            phone: document.getElementById("requestPhone").value,
            type: document.getElementById("websiteType").value,
            requirements: document.getElementById("requirements").value,
            username: localStorage.getItem("username"),
        };

        try {
            const response = await fetch("/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            });

            const responseData = await response.json();
            console.log("Request Response:", responseData);

            if (response.ok) {
                messageDiv.textContent = "Request submitted successfully!";
                messageDiv.className = "message success";
                requestForm.reset();
            } else {
                messageDiv.textContent = "An error occurred. Please try again.";
                messageDiv.className = "message error";
            }

            messageDiv.hidden = false;
        } catch (error) {
            console.error("Request Error:", error);
            messageDiv.textContent = "An error occurred. Please try again.";
            messageDiv.className = "message error";
            messageDiv.hidden = false;
        }
    });
}
