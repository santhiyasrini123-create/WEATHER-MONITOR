/*
   Weather Monitoring System - Dashboard & Data Controller
   Contains: fake live weather updates, count-up animation, favorites manager, location tools, and alert engines.
*/

// Weather Dummy Data Base
const CITIES_DB = [
    { name: "New York", country: "United States", temp: 24, condition: "Partly Cloudy", humidity: 62, wind: 12, pressure: 1012, uv: 5, aqi: 42, rain: 10, visibility: 10, sunrise: "05:42 AM", sunset: "08:15 PM" },
    { name: "London", country: "United Kingdom", temp: 18, condition: "Light Rain", humidity: 82, wind: 18, pressure: 1008, uv: 3, aqi: 28, rain: 65, visibility: 8, sunrise: "04:50 AM", sunset: "09:20 PM" },
    { name: "Tokyo", country: "Japan", temp: 28, condition: "Sunny", humidity: 55, wind: 8, pressure: 1015, uv: 9, aqi: 55, rain: 0, visibility: 12, sunrise: "04:35 AM", sunset: "06:50 PM" },
    { name: "Sydney", country: "Australia", temp: 16, condition: "Clear", humidity: 50, wind: 15, pressure: 1020, uv: 4, aqi: 22, rain: 0, visibility: 15, sunrise: "06:58 AM", sunset: "05:02 PM" },
    { name: "Mumbai", country: "India", temp: 31, condition: "Thundershower", humidity: 88, wind: 24, pressure: 1002, uv: 10, aqi: 110, rain: 90, visibility: 5, sunrise: "06:05 AM", sunset: "07:15 PM" },
    { name: "Cairo", country: "Egypt", temp: 36, condition: "Sunny", humidity: 30, wind: 14, pressure: 1010, uv: 11, aqi: 85, rain: 0, visibility: 10, sunrise: "05:00 AM", sunset: "06:55 PM" },
    { name: "Paris", country: "France", temp: 22, condition: "Cloudy", humidity: 68, wind: 10, pressure: 1013, uv: 4, aqi: 35, rain: 15, visibility: 10, sunrise: "05:55 AM", sunset: "09:45 PM" }
];

let activeCity = CITIES_DB[0]; // Default New York

document.addEventListener("DOMContentLoaded", () => {
    initClock();
    initDashboard();
    initLocationPage();
    initAlertsPage();
    initForecastPage();
});

/* 1. Real-time Clock display */
function initClock() {
    const clockEl = document.getElementById("nav-clock");
    const dateEl = document.getElementById("nav-date");
    
    function updateClock() {
        const now = new Date();
        if (clockEl) {
            clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        }
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

/* 2. Primary Weather Dashboard Controller */
function initDashboard() {
    const isDashboard = document.getElementById("weather-dashboard-container");
    if (!isDashboard) return;
    
    // Check if URL has query parameter for city
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get("city");
    if (cityParam) {
        const found = CITIES_DB.find(c => c.name.toLowerCase() === cityParam.toLowerCase());
        if (found) activeCity = found;
    }
    
    renderDashboardData(activeCity);
    animateCounters();
    
    // Auto Refresh every 5 seconds with small random fluctuations
    setInterval(() => {
        // Apply slight weather changes
        activeCity.temp += Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        activeCity.humidity = Math.min(100, Math.max(10, activeCity.humidity + (Math.floor(Math.random() * 5) - 2)));
        activeCity.wind = Math.max(0, activeCity.wind + (Math.floor(Math.random() * 3) - 1));
        
        renderDashboardData(activeCity, true); // Update values without full counter reset
        
        // Dynamic notification of simulation update
        window.showNotification(
            "Live Refresh", 
            `Weather data updated for ${activeCity.name}. Temp: ${activeCity.temp}°C`, 
            "info"
        );
    }, 5000);
}

/* Render Active City Weather properties on Dashboard fields */
function renderDashboardData(city, isRefresh = false) {
    const el = (id) => document.getElementById(id);
    
    if (el("overview-city-name")) el("overview-city-name").textContent = `${city.name}, ${city.country}`;
    if (el("overview-temp-val")) el("overview-temp-val").textContent = city.temp;
    if (el("overview-condition")) el("overview-condition").textContent = city.condition;
    if (el("overview-feels-like")) el("overview-feels-like").textContent = `Feels like: ${city.temp + (city.humidity > 70 ? 2 : -1)}°C`;
    
    // Set dynamic icons based on condition
    setWeatherIllustration(city.condition, "overview-illustration-container");
    
    // Update individual cards
    updateCardVal("val-temp", city.temp, "°C", isRefresh);
    updateCardVal("val-humidity", city.humidity, "%", isRefresh);
    updateCardVal("val-wind", city.wind, " km/h", isRefresh);
    updateCardVal("val-pressure", city.pressure, " hPa", isRefresh);
    updateCardVal("val-visibility", city.visibility, " km", isRefresh);
    updateCardVal("val-uv", city.uv, "", isRefresh);
    updateCardVal("val-aqi", city.aqi, " AQI", isRefresh);
    updateCardVal("val-rain", city.rain, "%", isRefresh);
    
    if (el("val-sunrise")) el("val-sunrise").textContent = city.sunrise;
    if (el("val-sunset")) el("val-sunset").textContent = city.sunset;
}

function updateCardVal(id, targetVal, suffix, isRefresh) {
    const element = document.getElementById(id);
    if (!element) return;
    
    if (isRefresh) {
        element.textContent = targetVal + suffix;
    } else {
        element.setAttribute("data-target", targetVal);
        element.setAttribute("data-suffix", suffix);
        element.textContent = "0" + suffix;
    }
}

/* 3. Number counter loader animation */
function animateCounters() {
    const counters = document.querySelectorAll("[data-target]");
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute("data-target"));
        const suffix = counter.getAttribute("data-suffix") || "";
        const duration = 1000; // ms
        const stepTime = 15;
        const steps = duration / stepTime;
        const increment = target / steps;
        
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target + suffix;
                clearInterval(timer);
            } else {
                // If it is pressure, avoid decimals
                if (target > 500) {
                    counter.textContent = Math.round(current) + suffix;
                } else {
                    counter.textContent = current.toFixed(1).replace(".0", "") + suffix;
                }
            }
        }, stepTime);
    });
}

/* 4. Location Search & Favorites Manager */
function initLocationPage() {
    const locationPage = document.getElementById("location-page-container");
    if (!locationPage) return;
    
    const searchInput = document.getElementById("city-search");
    const favoritesGrid = document.getElementById("favorites-grid");
    const gpsBtn = document.getElementById("gps-btn");
    
    // Load favorites from local storage or set default
    let favorites = JSON.parse(localStorage.getItem("weather-favorites")) || ["New York", "London", "Tokyo"];
    
    function renderLocationCards(filter = "") {
        if (!favoritesGrid) return;
        favoritesGrid.innerHTML = "";
        
        const citiesToRender = CITIES_DB.filter(c => 
            c.name.toLowerCase().includes(filter.toLowerCase()) || 
            c.country.toLowerCase().includes(filter.toLowerCase())
        );
        
        if (citiesToRender.length === 0) {
            favoritesGrid.innerHTML = `<div class="glass-panel" style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-secondary);">No cities found matching your search.</div>`;
            return;
        }
        
        citiesToRender.forEach(city => {
            const isFav = favorites.includes(city.name);
            const card = document.createElement("div");
            card.className = "city-card glass-panel hover-lift animate-zoom-in";
            
            card.innerHTML = `
                <div class="city-card-header">
                    <div>
                        <div class="city-name">${city.name}</div>
                        <div class="city-country">${city.country}</div>
                    </div>
                    <button class="favorite-star-btn ${isFav ? 'active' : ''}" data-city="${city.name}">
                        <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    </button>
                </div>
                <div class="city-temp-row">
                    <div class="city-temp">${city.temp}°C</div>
                    <div class="city-weather-desc">${city.condition}</div>
                </div>
            `;
            
            // Navigate to dashboard on click (except if clicking the star)
            card.addEventListener("click", (e) => {
                if (e.target.closest(".favorite-star-btn")) {
                    e.stopPropagation();
                    toggleFavorite(city.name, e.target.closest(".favorite-star-btn"));
                } else {
                    window.location.href = `dashboard.html?city=${encodeURIComponent(city.name)}`;
                }
            });
            
            favoritesGrid.appendChild(card);
        });
    }
    
    function toggleFavorite(cityName, btn) {
        if (favorites.includes(cityName)) {
            favorites = favorites.filter(c => c !== cityName);
            btn.classList.remove("active");
            window.showNotification("Favorites Updated", `Removed ${cityName} from favorites.`, "info");
        } else {
            favorites.push(cityName);
            btn.classList.add("active");
            window.showNotification("Favorites Updated", `Added ${cityName} to favorites.`, "success");
        }
        localStorage.setItem("weather-favorites", JSON.stringify(favorites));
    }
    
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            renderLocationCards(e.target.value);
        });
    }
    
    if (gpsBtn) {
        gpsBtn.addEventListener("click", () => {
            gpsBtn.setAttribute("disabled", "true");
            gpsBtn.innerHTML = `
                <svg class="loader-spinner" style="width: 16px; height: 16px; margin: 0; border-width: 2px;" viewBox="0 0 24 24"></svg> Locating...
            `;
            
            setTimeout(() => {
                gpsBtn.removeAttribute("disabled");
                gpsBtn.innerHTML = `
                    <svg style="width:16px;height:16px;fill:currentColor" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h-2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg> GPS Location
                `;
                
                // Select a city near GPS (e.g. London mock)
                window.showNotification("GPS Located", "Mock GPS coordinates found: 51.5074° N, 0.1278° W. Navigating to London.", "success");
                setTimeout(() => {
                    window.location.href = "dashboard.html?city=London";
                }, 1500);
            }, 2000);
        });
    }
    
    renderLocationCards();
}

/* 5. Forecast Page Render */
function initForecastPage() {
    const forecastPage = document.getElementById("forecast-page-container");
    if (!forecastPage) return;
    
    const hourlyContainer = document.getElementById("forecast-hourly-container");
    const weeklyContainer = document.getElementById("forecast-days-grid");
    
    // Hourly data list
    const hours = ["Now", "12 AM", "01 AM", "02 AM", "03 AM", "04 AM", "05 AM", "06 AM", "07 AM", "08 AM", "09 AM", "10 AM"];
    if (hourlyContainer) {
        hourlyContainer.innerHTML = "";
        hours.forEach((h, idx) => {
            const card = document.createElement("div");
            card.className = "hourly-card glass-panel hover-lift animate-slide-right";
            card.style.animationDelay = `${idx * 0.05}s`;
            
            const tempVal = 24 + Math.round(Math.sin(idx / 2) * 4);
            const popVal = Math.max(0, Math.round(Math.cos(idx / 3) * 80));
            
            card.innerHTML = `
                <div class="hourly-time">${h}</div>
                <div class="hourly-icon">${getForecastSmallSvg(popVal > 50 ? "rain" : "cloud")}</div>
                <div class="hourly-temp">${tempVal}°C</div>
                <div class="hourly-pop">${popVal > 20 ? popVal + '%' : ''}</div>
            `;
            
            hourlyContainer.appendChild(card);
        });
    }
    
    // 7-Day forecasts list
    const days = [
        { day: "Today", condition: "Partly Cloudy", tempMax: 26, tempMin: 18, wind: 14, pressure: 1012, humidity: 62 },
        { day: "Saturday", condition: "Heavy Rain", tempMax: 21, tempMin: 16, wind: 24, pressure: 1008, humidity: 82 },
        { day: "Sunday", condition: "Sunny", tempMax: 28, tempMin: 19, wind: 8, pressure: 1015, humidity: 50 },
        { day: "Monday", condition: "Clear Sky", tempMax: 29, tempMin: 20, wind: 9, pressure: 1017, humidity: 45 },
        { day: "Tuesday", condition: "Scattered Showers", tempMax: 23, tempMin: 17, wind: 15, pressure: 1011, humidity: 70 },
        { day: "Wednesday", condition: "Cloudy", tempMax: 24, tempMin: 18, wind: 11, pressure: 1013, humidity: 65 },
        { day: "Thursday", condition: "Sunny", tempMax: 30, tempMin: 21, wind: 7, pressure: 1016, humidity: 48 }
    ];
    
    if (weeklyContainer) {
        weeklyContainer.innerHTML = "";
        days.forEach((d, idx) => {
            const card = document.createElement("div");
            card.className = "day-row-card glass-panel hover-lift animate-slide-up";
            card.style.animationDelay = `${idx * 0.1}s`;
            
            card.innerHTML = `
                <div class="day-name">${d.day}</div>
                <div class="day-icon" style="width:36px;height:36px">${getForecastSmallSvg(d.condition.toLowerCase().includes("rain") ? "rain" : d.condition.toLowerCase().includes("sun") || d.condition.toLowerCase().includes("clear") ? "sun" : "cloud")}</div>
                <div class="day-temp-range">
                    <span class="day-temp-max">${d.tempMax}°C</span>
                    <span class="day-temp-min">${d.tempMin}°C</span>
                </div>
                <div style="color:var(--text-secondary)">${d.condition}</div>
                <div style="color:var(--text-secondary);font-size:0.9rem">💨 ${d.wind} km/h</div>
                <div style="color:var(--sky-blue);font-size:0.9rem">💧 ${d.humidity}%</div>
            `;
            
            weeklyContainer.appendChild(card);
        });
    }
}

/* Helper Forecast SVGs */
function getForecastSmallSvg(type) {
    if (type === "sun") {
        return `<svg viewBox="0 0 24 24" style="fill:var(--yellow)"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
    } else if (type === "rain") {
        return `<svg viewBox="0 0 24 24" style="fill:var(--sky-blue)"><path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z"/><path d="M9 20l-1 2M12 20l-1 2M15 20l-1 2" stroke="var(--sky-blue)" stroke-width="2"/></svg>`;
    } else {
        return `<svg viewBox="0 0 24 24" style="fill:var(--text-secondary)"><path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z"/></svg>`;
    }
}

/* 6. Weather Alerts Warning Dashboard */
function initAlertsPage() {
    const alertsPage = document.getElementById("alerts-page-container");
    if (!alertsPage) return;
    
    // Blinking audio/video check on alerts list
    document.querySelectorAll(".alert-item-card").forEach(card => {
        card.addEventListener("click", () => {
            const title = card.querySelector(".alert-title").textContent;
            const desc = card.querySelector(".alert-desc").textContent;
            const status = card.classList.contains("alert-red") ? "warning" : card.classList.contains("alert-orange") ? "warning" : "info";
            
            window.showNotification(`ALERT ACTIVE: ${title}`, desc, status);
        });
    });
}

/* Dynamic Animated SVG Weather Illustration Injector */
function setWeatherIllustration(condition, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let svgContent = "";
    
    if (condition.toLowerCase().includes("sunny") || condition.toLowerCase().includes("clear")) {
        svgContent = `
            <svg viewBox="0 0 100 100" class="sun-glow" style="width:100%;height:100%">
                <circle cx="50" cy="50" r="20" fill="url(#sun-grad)" class="sun-rotate"/>
                <defs>
                    <linearGradient id="sun-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="var(--yellow)"/>
                        <stop offset="100%" stop-color="var(--orange)"/>
                    </linearGradient>
                </defs>
            </svg>
        `;
    } else if (condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("shower")) {
        svgContent = `
            <svg viewBox="0 0 100 100" style="width:100%;height:100%">
                <path d="M30 60 A12 12 0 0 1 40 40 A18 18 0 0 1 70 42 A15 15 0 0 1 80 60 Z" fill="var(--text-secondary)" class="cloud-drift-1"/>
                <line x1="40" y1="65" x2="35" y2="85" stroke="var(--sky-blue)" stroke-width="3" stroke-linecap="round" class="rain-stream"/>
                <line x1="50" y1="68" x2="45" y2="88" stroke="var(--sky-blue)" stroke-width="3" stroke-linecap="round" class="rain-stream" style="animation-delay:0.2s"/>
                <line x1="60" y1="65" x2="55" y2="85" stroke="var(--sky-blue)" stroke-width="3" stroke-linecap="round" class="rain-stream" style="animation-delay:0.4s"/>
            </svg>
        `;
    } else if (condition.toLowerCase().includes("thunder")) {
        svgContent = `
            <svg viewBox="0 0 100 100" style="width:100%;height:100%">
                <path d="M30 55 A12 12 0 0 1 40 35 A18 18 0 0 1 70 37 A15 15 0 0 1 80 55 Z" fill="#475569" class="cloud-drift-2"/>
                <polygon points="50,55 42,70 52,70 45,90 62,68 52,68" fill="var(--yellow)" class="lightning-flash"/>
            </svg>
        `;
    } else { // Cloudy / Partly Cloudy
        svgContent = `
            <svg viewBox="0 0 100 100" style="width:100%;height:100%">
                <circle cx="60" cy="40" r="15" fill="var(--yellow)" class="sun-glow"/>
                <path d="M25 65 A12 12 0 0 1 35 45 A18 18 0 0 1 65 47 A15 15 0 0 1 75 65 Z" fill="rgba(255,255,255,0.7)" class="cloud-drift-1"/>
            </svg>
        `;
    }
    
    container.innerHTML = svgContent;
}
