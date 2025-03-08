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

document.getElementById("newUserBtn").addEventListener("click", () => {
    document.getElementById("welcomeMessage").classList.add("hidden");
    document.getElementById("signupForm").classList.remove("hidden");
});

document.getElementById("existingUserBtn").addEventListener("click", () => {
    document.getElementById("welcomeMessage").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
});

// Signup Form Submission
document.getElementById("signup").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        document.getElementById("signupMessage").textContent = "Passwords do not match";
        return;
    }

    const response = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, username, password }),
    });

    const data = await response.json();
    document.getElementById("signupMessage").textContent = data.message;

    if (data.message === "User created successfully") {
});

// Login Form Submission
document.getElementById("login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (data.message === "Login successful") {
        localStorage.setItem("token", data.token); // Save token for authentication
    } else {
        document.getElementById("loginMessage").textContent = data.message;
    }
});


// 🚀 Website Request Form
function initWebsiteRequestForm() {
    console.log("Request Form Initialized");
}

// 🚀 Toggle List Function
function initToggleList() {
    console.log("Toggle List Initialized");
}
