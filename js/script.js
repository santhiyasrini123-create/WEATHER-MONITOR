/*
   Weather Monitoring System - Main Global Script
   Features: Theme toggling, Loader screen, Scroll progress, Hamburger menu, Back-to-top, Typing effects.
*/

document.addEventListener("DOMContentLoaded", () => {
    initLoader();
    initTheme();
    initNavigation();
    initScrollEffects();
    initTypingEffect();
    checkAuthStatus();
});

/* 1. Loader screen removal */
function initLoader() {
    const loader = document.getElementById("loader");
    if (loader) {
        window.addEventListener("load", () => {
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.style.visibility = "hidden";
            }, 500);
        });
        
        // Safety timeout in case load event does not fire
        setTimeout(() => {
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.style.visibility = "hidden";
            }, 500);
        }, 3000);
    }
}

/* 2. Theme Switching Logic (Dark / Light) */
function initTheme() {
    const themeBtn = document.getElementById("theme-toggle");
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem("weather-theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("weather-theme", newTheme);
            
            // Dispatch a custom event so other scripts (like charts) can redraw
            window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: newTheme } }));
            
            showNotification("Theme Changed", `Switched to ${newTheme} mode!`, "success");
        });
    }
}

/* 3. Navigation Controls (Active Page & Hamburger Menu) */
function initNavigation() {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    
    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
        
        // Close menu when clicking nav links
        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                hamburger.classList.remove("active");
                navMenu.classList.remove("active");
            });
        });
    }
    
    // Set Active class depending on path
    const currentPath = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
        const linkPath = link.getAttribute("href");
        if (currentPath === linkPath || (currentPath === "" && linkPath === "index.html")) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

/* 4. Scroll Effects: Sticky nav, Scroll Progress, Back To Top button */
function initScrollEffects() {
    const header = document.querySelector("header");
    const progressBar = document.getElementById("scroll-progress");
    const backToTopBtn = document.getElementById("back-to-top");
    
    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Sticky Header scroll styling
        if (header) {
            if (scrollTop > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }
        
        // Progress Bar update
        if (progressBar && docHeight > 0) {
            const scrollPercentage = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercentage + "%";
        }
        
        // Back To Top Button toggle visibility
        if (backToTopBtn) {
            if (scrollTop > 300) {
                backToTopBtn.classList.add("visible");
            } else {
                backToTopBtn.classList.remove("visible");
            }
        }
    });
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
}

/* 5. Typing Animation (Hero Heading) */
function initTypingEffect() {
    const typingSpan = document.querySelector(".typing-target");
    if (!typingSpan) return;
    
    const words = ["Real-time Analysis.", "Predictive Forecasts.", "Hazard Warnings.", "Visual Maps."];
    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentWord = words[wordIdx];
        
        if (isDeleting) {
            typingSpan.textContent = currentWord.substring(0, charIdx - 1);
            charIdx--;
            typingSpeed = 50;
        } else {
            typingSpan.textContent = currentWord.substring(0, charIdx + 1);
            charIdx++;
            typingSpeed = 150;
        }
        
        if (!isDeleting && charIdx === currentWord.length) {
            // Wait before starting delete
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            wordIdx = (wordIdx + 1) % words.length;
            typingSpeed = 500;
        }
        
        setTimeout(type, typingSpeed);
    }
    
    setTimeout(type, 800);
}

/* 6. Authentication Nav Status Updates */
function checkAuthStatus() {
    const navAuth = document.querySelector(".nav-auth");
    const userProfile = document.querySelector(".nav-user-profile");
    const avatar = document.querySelector(".nav-user-avatar");
    const profileName = document.getElementById("profile-name");
    
    const user = JSON.parse(localStorage.getItem("weather-user"));
    
    if (user && navAuth && userProfile) {
        navAuth.style.display = "none";
        userProfile.style.display = "flex";
        
        const nameParts = user.name ? user.name.split(" ") : ["U"];
        const initials = nameParts.map(p => p[0]).join("").substring(0, 2).toUpperCase();
        if (avatar) avatar.textContent = initials;
        if (profileName) profileName.textContent = user.name;
    }
}

/* 7. Toast / Notification Helper Function */
function showNotification(title, message, type = "info") {
    let container = document.getElementById("notification-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "notification-container";
        container.className = "notification-container";
        document.body.appendChild(container);
    }
    
    const notification = document.createElement("div");
    notification.className = `notification notification-${type} glass-panel`;
    
    notification.innerHTML = `
        <div>
            <div class="notification-title">${title}</div>
            <div class="notification-desc">${message}</div>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Trigger entrance transition
    setTimeout(() => {
        notification.classList.add("show");
    }, 10);
    
    // Remove toast after duration
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            notification.remove();
        }, 400);
    }, 5000);
}

// Attach notification helper to window object for other scripts to use
window.showNotification = showNotification;
window.logout = function() {
    localStorage.removeItem("weather-user");
    showNotification("Logged Out", "You have successfully signed out.", "info");
    setTimeout(() => {
        window.location.reload();
    }, 1000);
};
