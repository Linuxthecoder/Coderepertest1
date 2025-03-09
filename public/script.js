document.addEventListener("DOMContentLoaded", () => {
    initMatrixEffect();
    initAuthSystem();
    initToggleList();
    initFormToggles();
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
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");

    // ===== Signup Form Submission =====
    signupForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userData = {
            username: document.getElementById("signup-username").value,
            email: document.getElementById("signup-email").value,
            phone: document.getElementById("signup-phone").value,
            password: document.getElementById("signup-password").value,
        };

        try {
            const response = await fetch("/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            if (response.ok) {
                alert("✅ Signup successful! You can now log in.");
                signupForm.reset();
            } else {
                document.getElementById("signup-error-message").textContent = data.error;
            }
        } catch (error) {
            document.getElementById("signup-error-message").textContent = "❌ An error occurred.";
        }
    });

    // ===== Login Form Submission =====
    loginForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const loginData = {
            username: document.getElementById("login-username").value,
            password: document.getElementById("login-password").value,
        };

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", data.username);
                alert("✅ Login successful!");
                window.location.reload();
            } else {
                document.getElementById("error-message").textContent = data.error;
            }
        } catch (error) {
            document.getElementById("error-message").textContent = "❌ Login failed.";
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

// ===== Form Toggle Logic =====
function initFormToggles() {
    const showLoginFormButton = document.getElementById("showLoginForm");
    const showSignupFormButton = document.getElementById("showSignupForm");
    const loginFormContainer = document.getElementById("loginFormContainer");
    const signupFormContainer = document.getElementById("signupFormContainer");

    // Toggle login form
    showLoginFormButton.addEventListener("click", () => {
        loginFormContainer.style.display = "block";
        signupFormContainer.style.display = "none";
    });

    // Toggle signup form
    showSignupFormButton.addEventListener("click", () => {
        signupFormContainer.style.display = "block";
        loginFormContainer.style.display = "none";
    });
}
