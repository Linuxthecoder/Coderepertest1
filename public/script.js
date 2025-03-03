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
    
 document.getElementById("signupForm").addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent form submission to handle it via JS

        // Get form data
        const username = document.getElementById("signup-username").value;
        const password = document.getElementById("signup-password").value;
        const email = document.getElementById("signup-email").value;
        const phone = document.getElementById("signup-phone").value;

        try {
            // Send a POST request to the backend /signup route
            const response = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password, email, phone })
            });

            // Get the response data
            const data = await response.json();

            if (response.ok) {
                // Show success message
                document.getElementById("error-message").textContent = data.message;
                document.getElementById("error-message").style.color = "green";
            } else {
                // Show error message
                document.getElementById("error-message").textContent = data.error;
                document.getElementById("error-message").style.color = "red";
            }
        } catch (error) {
            // Handle errors during fetch
            document.getElementById("error-message").textContent = "An error occurred. Please try again.";
            document.getElementById("error-message").style.color = "red";
        }
    });
    
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
    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
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
                localStorage.setItem("username", username);
                loggedInUser.textContent = username;
                loggedInUser.classList.remove("hidden");
                loginModal.style.display = "none";
            } else {
                document.getElementById("error-message").textContent = data.error;
            }
        } catch (error) {
            document.getElementById("error-message").textContent = "An error occurred. Please try again.";
        }
    });

    // SignUp Form Submission
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
            if (response.ok) {
                document.getElementById("success-message").textContent = data.message;
                document.getElementById("error-message").textContent = "";
                signupForm.reset();
                showLogin.click();
            } else {
                document.getElementById("error-message").textContent = data.error;
            }
        } catch (error) {
            document.getElementById("error-message").textContent = "An error occurred. Please try again.";
        }
    });

    // Logout User
    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem("username");
        loggedInUser.textContent = '';
        loggedInUser.classList.add("hidden");
        openLoginBtn.classList.remove("hidden");
        logoutBtn.classList.add("hidden");
    });
}

// ===== Website Request Form Submission =====
function initWebsiteRequestForm() {
    const requestForm = document.getElementById("requestForm");
    const requestStatus = document.getElementById("requestStatus");

    requestForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const phone = document.getElementById("requestPhone").value;
        const type = document.getElementById("websiteType").value;
        const requirements = document.getElementById("requirements").value;

        try {
            const response = await fetch("/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("jwt")}`
                },
                body: JSON.stringify({ phone, type, requirements }),
            });

            const data = await response.json();
            requestStatus.textContent = data.message;
            requestStatus.style.display = 'block';
        } catch (error) {
            requestStatus.textContent = "An error occurred. Please try again.";
            requestStatus.style.display = 'block';
        }
    });
}

