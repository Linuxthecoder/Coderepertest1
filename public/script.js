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
    const logoutModal = document.getElementById("logoutModal");
    const confirmLogoutBtn = document.getElementById("confirmLogout");
    const cancelLogoutBtn = document.getElementById("cancelLogout");

    const signupMessage = document.getElementById("signupMessage");
    const loginMessage = document.getElementById("loginMessage");

    if (!signupMessage || !loginMessage) return;

    signupForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("signup-username").value;
        const password = document.getElementById("signup-password").value;
        const email = document.getElementById("signup-email").value;
        const phone = document.getElementById("signup-phone").value;

        try {
            const response = await fetch("/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, email, phone }),
            });

            const data = await response.json();
            signupMessage.textContent = response.ok ? "Signup successful!" : data.error;
            signupMessage.style.color = response.ok ? "green" : "red";

            if (response.ok) signupForm.reset();
        } catch (error) {
            signupMessage.textContent = "An error occurred.";
            signupMessage.style.color = "red";
        }
    });
}
