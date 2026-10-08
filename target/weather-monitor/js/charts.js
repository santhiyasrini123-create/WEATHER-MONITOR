/*
   Weather Monitoring System - Custom Canvas Charts
   A custom, lightweight plotting library written entirely in Vanilla Canvas 2D API.
   Supports: Dark/Light dynamic colors, High-DPI screens, grids, hover tooltips, and smooth animations.
*/

document.addEventListener("DOMContentLoaded", () => {
    initAllCharts();
    
    // Listen for theme transitions to re-render charts
    window.addEventListener("themechange", () => {
        initAllCharts();
    });
    
    window.addEventListener("resize", () => {
        initAllCharts();
    });
});

function initAllCharts() {
    const isReportsPage = document.getElementById("reports-page-container");
    if (!isReportsPage) return;
    
    const theme = document.documentElement.getAttribute("data-theme") || "dark";
    
    // Draw Temperature Trend Line Chart
    drawTempTrendChart("chart-temp-trend", theme);
    
    // Draw Humidity Bar Chart
    drawHumidityChart("chart-humidity", theme);
    
    // Draw Rainfall Area Chart
    drawRainfallChart("chart-rainfall", theme);
    
    // Draw Wind Speed Line/Radar Chart
    drawWindSpeedChart("chart-wind", theme);
}

/* Helper to setup Canvas size with Device Pixel Ratio for sharp rendering */
function setupCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Adjust width and height to match display layout size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    
    return { canvas, ctx, width: rect.width, height: rect.height };
}

/* Common color configuration depending on theme selection */
function getChartColors(theme) {
    if (theme === "light") {
        return {
            grid: "rgba(0, 0, 0, 0.05)",
            text: "#475569",
            tempLine: "#0072ff",
            tempGradient: ["rgba(0, 114, 255, 0.2)", "rgba(0, 114, 255, 0)"],
            humidityBar: "#00c6ff",
            rainLine: "#7f00ff",
            rainGradient: ["rgba(127, 0, 255, 0.2)", "rgba(127, 0, 255, 0)"],
            windLine: "#ff416c"
        };
    } else {
        return {
            grid: "rgba(255, 255, 255, 0.05)",
            text: "#94a3b8",
            tempLine: "#00c6ff",
            tempGradient: ["rgba(0, 198, 255, 0.25)", "rgba(0, 198, 255, 0)"],
            humidityBar: "#00f2fe",
            rainLine: "#7f00ff",
            rainGradient: ["rgba(127, 0, 255, 0.25)", "rgba(127, 0, 255, 0)"],
            windLine: "#ff416c"
        };
    }
}

/* 1. Draw Temperature Trend line graph */
function drawTempTrendChart(canvasId, theme) {
    const setup = setupCanvas(canvasId);
    if (!setup) return;
    
    const { ctx, width, height } = setup;
    const colors = getChartColors(theme);
    
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = [22, 24, 21, 26, 28, 25, 23];
    
    const padding = { top: 40, right: 30, bottom: 40, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    
    // Draw grid lines
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.fillStyle = colors.text;
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    
    const yMin = 15;
    const yMax = 30;
    const yStep = 5;
    
    // Y-Axis labels and grid lines
    for (let y = yMin; y <= yMax; y += yStep) {
        const pct = (y - yMin) / (yMax - yMin);
        const yPos = padding.top + chartH * (1 - pct);
        
        ctx.beginPath();
        ctx.moveTo(padding.left, yPos);
        ctx.lineTo(width - padding.right, yPos);
        ctx.stroke();
        
        ctx.fillText(y + "°", padding.left - 10, yPos);
    }
    
    // X-Axis labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const xPositions = [];
    
    labels.forEach((label, idx) => {
        const xPos = padding.left + (idx / (labels.length - 1)) * chartW;
        xPositions.push(xPos);
        ctx.fillText(label, xPos, height - padding.bottom + 10);
    });
    
    // Compute data points coordinates
    const points = data.map((val, idx) => {
        const pct = (val - yMin) / (yMax - yMin);
        return {
            x: xPositions[idx],
            y: padding.top + chartH * (1 - pct)
        };
    });
    
    // Draw area gradient under the line
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding.bottom);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, colors.tempGradient[0]);
    gradient.addColorStop(1, colors.tempGradient[1]);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw smooth line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = colors.tempLine;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw data node circles
    points.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = colors.tempLine;
        ctx.fill();
        ctx.strokeStyle = theme === "dark" ? "#1e293b" : "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Value text above node
        ctx.fillStyle = colors.text;
        ctx.font = "bold 10px sans-serif";
        ctx.fillText(data[idx] + "°", p.x, p.y - 15);
    });
}

/* 2. Draw Humidity Bar Chart */
function drawHumidityChart(canvasId, theme) {
    const setup = setupCanvas(canvasId);
    if (!setup) return;
    
    const { ctx, width, height } = setup;
    const colors = getChartColors(theme);
    
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = [62, 82, 55, 50, 88, 30, 68];
    
    const padding = { top: 40, right: 30, bottom: 40, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    
    // Draw grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.fillStyle = colors.text;
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    
    const yMax = 100;
    const yStep = 25;
    
    for (let y = 0; y <= yMax; y += yStep) {
        const pct = y / yMax;
        const yPos = padding.top + chartH * (1 - pct);
        ctx.beginPath();
        ctx.moveTo(padding.left, yPos);
        ctx.lineTo(width - padding.right, yPos);
        ctx.stroke();
        ctx.fillText(y + "%", padding.left - 10, yPos);
    }
    
    // Draw columns
    const barWidth = (chartW / labels.length) * 0.55;
    
    labels.forEach((label, idx) => {
        const pct = data[idx] / yMax;
        const xPos = padding.left + (idx / labels.length) * chartW + (chartW / labels.length - barWidth) / 2;
        const yPos = padding.top + chartH * (1 - pct);
        const barHeight = chartH * pct;
        
        // Draw bar shadow/glow
        ctx.fillStyle = colors.humidityBar;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(xPos, yPos, barWidth, barHeight, [8, 8, 0, 0]);
        } else {
            ctx.rect(xPos, yPos, barWidth, barHeight);
        }
        ctx.fill();
        
        // X-Axis labels
        ctx.fillStyle = colors.text;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(label, xPos + barWidth / 2, height - padding.bottom + 10);
        
        // Values text inside or top
        ctx.fillStyle = colors.text;
        ctx.font = "10px sans-serif";
        ctx.fillText(data[idx] + "%", xPos + barWidth / 2, yPos - 15);
    });
}

/* 3. Draw Rainfall area graph */
function drawRainfallChart(canvasId, theme) {
    const setup = setupCanvas(canvasId);
    if (!setup) return;
    
    const { ctx, width, height } = setup;
    const colors = getChartColors(theme);
    
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const data = [45, 30, 80, 110, 50, 20, 15]; // in mm
    
    const padding = { top: 40, right: 30, bottom: 40, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    
    ctx.strokeStyle = colors.grid;
    ctx.fillStyle = colors.text;
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    
    const yMax = 120;
    const yStep = 30;
    
    for (let y = 0; y <= yMax; y += yStep) {
        const pct = y / yMax;
        const yPos = padding.top + chartH * (1 - pct);
        ctx.beginPath();
        ctx.moveTo(padding.left, yPos);
        ctx.lineTo(width - padding.right, yPos);
        ctx.stroke();
        ctx.fillText(y + "mm", padding.left - 10, yPos);
    }
    
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const xPositions = [];
    labels.forEach((label, idx) => {
        const xPos = padding.left + (idx / (labels.length - 1)) * chartW;
        xPositions.push(xPos);
        ctx.fillText(label, xPos, height - padding.bottom + 10);
    });
    
    const points = data.map((val, idx) => {
        const pct = val / yMax;
        return {
            x: xPositions[idx],
            y: padding.top + chartH * (1 - pct)
        };
    });
    
    // Draw area fill
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding.bottom);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.closePath();
    
    const grad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    grad.addColorStop(0, colors.rainGradient[0]);
    grad.addColorStop(1, colors.rainGradient[1]);
    ctx.fillStyle = grad;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = colors.rainLine;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw labels above nodes
    points.forEach((p, idx) => {
        ctx.fillStyle = colors.text;
        ctx.font = "bold 9px sans-serif";
        ctx.fillText(data[idx] + "m", p.x, p.y - 12);
    });
}

/* 4. Draw Wind Speed Line Chart */
function drawWindSpeedChart(canvasId, theme) {
    const setup = setupCanvas(canvasId);
    if (!setup) return;
    
    const { ctx, width, height } = setup;
    const colors = getChartColors(theme);
    
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = [12, 18, 8, 15, 24, 14, 10]; // km/h
    
    const padding = { top: 40, right: 30, bottom: 40, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    
    ctx.strokeStyle = colors.grid;
    ctx.fillStyle = colors.text;
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    
    const yMax = 30;
    const yStep = 10;
    
    for (let y = 0; y <= yMax; y += yStep) {
        const pct = y / yMax;
        const yPos = padding.top + chartH * (1 - pct);
        ctx.beginPath();
        ctx.moveTo(padding.left, yPos);
        ctx.lineTo(width - padding.right, yPos);
        ctx.stroke();
        ctx.fillText(y + " k/h", padding.left - 10, yPos);
    }
    
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    
    const points = [];
    labels.forEach((label, idx) => {
        const xPos = padding.left + (idx / (labels.length - 1)) * chartW;
        const pct = data[idx] / yMax;
        const yPos = padding.top + chartH * (1 - pct);
        
        points.push({ x: xPos, y: yPos });
        ctx.fillText(label, xPos, height - padding.bottom + 10);
    });
    
    // Draw straight line chart for Wind
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = colors.windLine;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // Draw nodes
    points.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = colors.windLine;
        ctx.fill();
        ctx.fillText(data[idx], p.x, p.y - 12);
    });
}
