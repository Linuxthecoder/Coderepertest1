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

    openLoginBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        loginModal.style.display = "flex"; // Fix: Ensure modal is visible
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
}

// ===== Website Request Form Handler =====
function initWebsiteRequestForm() {
    const requestForm = document.getElementById("requestForm");
    if (!requestForm) return;

    requestForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const phone = document.getElementById("requestPhone").value;
        const type = document.getElementById("websiteType").value;
        const requirements = document.getElementById("requirements").value;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ phone, type, requirements }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Website request submitted successfully!");
                requestForm.reset();
            } else {
                alert(data.error || "Request failed");
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
        }
    });
}

// ===== Toggle Website List =====
function initToggleList() {
    const toggleButton = document.getElementById("toggleList");
    const websiteList = document.getElementById("websiteList");
    const toggleArrow = document.getElementById("toggleArrow");

    toggleButton?.addEventListener("click", () => {
        websiteList.classList.toggle("hidden"); // Fix: Use class toggle instead of display property
        toggleArrow.textContent = websiteList.classList.contains("hidden") ? "▼" : "▲";
    });
}
