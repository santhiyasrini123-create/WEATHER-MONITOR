/*
   Weather Monitoring System - Authentication JS
   Validates Login, Registration, and Forgot Password flows with local storage state management.
*/

document.addEventListener("DOMContentLoaded", () => {
    initRegisterForm();
    initLoginForm();
    initForgotPasswordForm();
});

/* 1. Sign Up/Registration Form Code */
function initRegisterForm() {
    const signupForm = document.getElementById("signup-form");
    const passwordInput = document.getElementById("signup-password");
    const strengthBar = document.getElementById("password-strength-bar");
    const strengthText = document.getElementById("password-strength-text");
    
    if (passwordInput && strengthBar && strengthText) {
        passwordInput.addEventListener("input", () => {
            const val = passwordInput.value;
            const score = checkPasswordStrength(val);
            
            // Render strength meter UI
            let barWidth = "0%";
            let barColor = "var(--text-muted)";
            let label = "Enter a password";
            
            if (val.length > 0) {
                if (score <= 1) {
                    barWidth = "25%";
                    barColor = "var(--orange)";
                    label = "Weak 🔴";
                } else if (score === 2) {
                    barWidth = "50%";
                    barColor = "#eab308";
                    label = "Medium 🟡";
                } else if (score === 3) {
                    barWidth = "75%";
                    barColor = "var(--primary-blue)";
                    label = "Good 🔵";
                } else {
                    barWidth = "100%";
                    barColor = "#10b981";
                    label = "Strong 💪🟢";
                }
            }
            
            strengthBar.style.width = barWidth;
            strengthBar.style.backgroundColor = barColor;
            strengthText.textContent = `Strength: ${label}`;
            strengthText.style.color = barColor;
        });
    }
    
    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById("signup-name").value.trim();
            const email = document.getElementById("signup-email").value.trim();
            const phone = document.getElementById("signup-phone").value.trim();
            const password = passwordInput.value;
            const confirmPassword = document.getElementById("signup-confirm-password").value;
            
            // Client side validators
            if (!fullName || !email || !phone || !password) {
                window.showNotification("Input Error", "Please fill out all required fields.", "warning");
                return;
            }
            
            if (password !== confirmPassword) {
                window.showNotification("Password Mismatch", "Passwords do not match.", "warning");
                return;
            }
            
            if (checkPasswordStrength(password) < 2) {
                window.showNotification("Weak Password", "Please choose a stronger password.", "warning");
                return;
            }
            
            // Check if user already exists
            const existingUsers = JSON.parse(localStorage.getItem("all-weather-users")) || [];
            if (existingUsers.some(u => u.email === email)) {
                window.showNotification("Account Exists", "This email address is already registered.", "warning");
                return;
            }
            
            // Create user details
            const newUser = { name: fullName, email, phone, password };
            existingUsers.push(newUser);
            localStorage.setItem("all-weather-users", JSON.stringify(existingUsers));
            
            // Automatically log them in
            localStorage.setItem("weather-user", JSON.stringify({ name: fullName, email }));
            
            // Display popup and redirect
            showSuccessModal("Account Created!", "Welcome aboard. Navigating to your dashboard...", "dashboard.html");
        });
    }
}

/* 2. Login verification logic */
function initLoginForm() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value;
            const rememberMe = document.getElementById("remember-me")?.checked;
            
            if (!email || !password) {
                window.showNotification("Input Error", "Please enter both email and password.", "warning");
                return;
            }
            
            // Query mock local storage users
            const users = JSON.parse(localStorage.getItem("all-weather-users")) || [];
            const matchedUser = users.find(u => u.email === email && u.password === password);
            
            // Allow dummy default user for testing if users is empty
            if (matchedUser || (users.length === 0 && email === "admin@weather.com" && password === "admin123")) {
                const sessionUser = matchedUser ? { name: matchedUser.name, email: matchedUser.email } : { name: "System Administrator", email: "admin@weather.com" };
                
                localStorage.setItem("weather-user", JSON.stringify(sessionUser));
                
                window.showNotification("Welcome Back!", "Login successful. Accessing dashboard.", "success");
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1200);
            } else {
                window.showNotification("Login Failed", "Invalid email or password combination.", "warning");
            }
        });
    }
}

/* 3. Password Reset Form & OTP Simulation */
function initForgotPasswordForm() {
    const forgotForm = document.getElementById("forgot-form");
    const otpSection = document.getElementById("otp-section");
    const emailInput = document.getElementById("forgot-email");
    const submitBtn = document.getElementById("forgot-submit-btn");
    
    let simulatedOtp = "";
    
    if (forgotForm) {
        forgotForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            
            // If OTP section is visible, we are validating the OTP code
            if (otpSection && otpSection.style.display === "block") {
                const otpEntered = document.getElementById("otp-code").value.trim();
                const newPassword = document.getElementById("new-password").value;
                const newPasswordConfirm = document.getElementById("new-password-confirm").value;
                
                if (otpEntered !== simulatedOtp) {
                    window.showNotification("Verification Error", "Invalid OTP entered.", "warning");
                    return;
                }
                
                if (!newPassword || newPassword !== newPasswordConfirm) {
                    window.showNotification("Input Error", "Passwords must match and cannot be empty.", "warning");
                    return;
                }
                
                // Update password in mock database
                const users = JSON.parse(localStorage.getItem("all-weather-users")) || [];
                const userIdx = users.findIndex(u => u.email === email);
                if (userIdx !== -1) {
                    users[userIdx].password = newPassword;
                    localStorage.setItem("all-weather-users", JSON.stringify(users));
                }
                
                showSuccessModal("Password Reset Successful", "Your password has been changed. Proceeding to login...", "login.html");
                return;
            }
            
            // First step: enter email to trigger OTP
            if (!email) {
                window.showNotification("Input Error", "Please provide a registered email.", "warning");
                return;
            }
            
            // Trigger fake OTP sequence
            simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            window.showNotification("OTP Dispatched", `A verification code [ ${simulatedOtp} ] was sent to your email.`, "success");
            
            // Display form sections
            if (otpSection) {
                otpSection.style.display = "block";
                emailInput.setAttribute("disabled", "true");
                submitBtn.textContent = "Change Password";
            }
        });
    }
}

/* Helper: Check password strength score */
function checkPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
}

/* Helper: Show a success modal overlay and then redirect */
function showSuccessModal(title, text, redirectUrl) {
    const modal = document.createElement("div");
    modal.className = "success-modal-overlay";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.background = "rgba(11, 15, 25, 0.85)";
    modal.style.backdropFilter = "blur(12px)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "10000";
    modal.style.opacity = "0";
    modal.style.transition = "opacity 0.4s ease";
    
    modal.innerHTML = `
        <div class="glass-panel" style="padding: 40px; text-align: center; max-width: 450px; width: 90%; transform: scale(0.8); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); color: #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 2rem;">
                ✓
            </div>
            <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: var(--text-primary);">${title}</h2>
            <p style="color: var(--text-secondary); margin-bottom: 30px; font-size: 1rem; line-height: 1.5;">${text}</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Trigger transition
    setTimeout(() => {
        modal.style.opacity = "1";
        modal.querySelector("div").style.transform = "scale(1)";
    }, 50);
    
    // Redirect after brief duration
    setTimeout(() => {
        modal.style.opacity = "0";
        modal.querySelector("div").style.transform = "scale(0.8)";
        setTimeout(() => {
            modal.remove();
            window.location.href = redirectUrl;
        }, 400);
    }, 3000);
}
