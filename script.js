// ===== APPLICATION STATE =====
let currentUser = {
    id: null,
    name: 'Guest User',
    email: 'guest@safeweather.my',
    role: 'guest',
    plan: 'free',
    reportsUsed: 0,
    reportsLimit: 5,
    isPremium: false,
    language: 'en'
};

let currentWeather = {
    condition: 'sunny',
    temperature: 32,
    location: 'Batu Pahat, Johor',
    aqi: 85,
    humidity: 78,
    windSpeed: 12
};

let isLoggedIn = false;
let currentTheme = 'light';
let currentLanguage = 'en';

// ===== INITIALIZATION =====
function initializeApp() {
    loadUserPreferences();
    updateWeatherBackground();
    updateUserInterface();
    setupEventListeners();
    loadDemoData();
    
    // Start live updates
    setInterval(updateLiveData, 30000); // Update every 30 seconds
    setInterval(updateCurrentTime, 1000);
    
    // Show welcome message
    setTimeout(() => {
        showNotification('Welcome to SafeWeather Pro!', 'info');
    }, 1000);
}

function loadUserPreferences() {
    // Load from localStorage
    const savedTheme = localStorage.getItem('safeWeatherTheme') || 'light';
    const savedLanguage = localStorage.getItem('safeWeatherLanguage') || 'en';
    const savedUser = localStorage.getItem('safeWeatherUser');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
    }
    
    setTheme(savedTheme);
    setLanguage(savedLanguage);
}

function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeSwitch').addEventListener('change', toggleTheme);
    
    // Language dropdown
    document.addEventListener('click', closeAllDropdowns);
    
    // Forms
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('weatherReportForm')?.addEventListener('submit', handleReportSubmit);
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
    
    // Auto-save form data
    setupAutoSave();
}

// ===== THEME MANAGEMENT =====
function toggleTheme() {
    const themeSwitch = document.getElementById('themeSwitch');
    const newTheme = themeSwitch.checked ? 'dark' : 'light';
    setTheme(newTheme);
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('safeWeatherTheme', theme);
    
    // Update switch position
    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
        themeSwitch.checked = theme === 'dark';
    }
    
    // Update UI elements for theme
    updateThemeDependentElements();
}

function updateThemeDependentElements() {
    const elements = document.querySelectorAll('[data-theme-dependent]');
    elements.forEach(el => {
        const darkValue = el.getAttribute('data-dark');
        const lightValue = el.getAttribute('data-light');
        el.textContent = currentTheme === 'dark' ? darkValue : lightValue;
    });
}

// ===== LANGUAGE MANAGEMENT =====
function toggleLanguage() {
    const langDropdown = document.getElementById('langDropdown');
    langDropdown.style.display = langDropdown.style.display === 'block' ? 'none' : 'block';
}

function closeAllDropdowns(e) {
    if (!e.target.closest('.language-toggle')) {
        document.getElementById('langDropdown').style.display = 'none';
    }
    if (!e.target.closest('.user-profile')) {
        document.getElementById('userMenu').style.display = 'none';
    }
}

function setLanguage(lang) {
    currentLanguage = lang;
    currentUser.language = lang;
    localStorage.setItem('safeWeatherLanguage', lang);
    
    // Update UI text
    updateLanguageText();
    
    // Update language display
    document.getElementById('currentLang').textContent = lang.toUpperCase();
    document.getElementById('footerLang').textContent = lang.toUpperCase();
    
    // Close dropdown
    document.getElementById('langDropdown').style.display = 'none';
}

function updateLanguageText() {
    const translations = {
        en: {
            welcome: 'Welcome to SafeWeather Pro',
            login: 'Login',
            register: 'Register',
            weather: 'Weather',
            report: 'Report',
            dashboard: 'Dashboard',
            premium: 'Premium'
        },
        ms: {
            welcome: 'Selamat datang ke SafeWeather Pro',
            login: 'Log Masuk',
            register: 'Daftar',
            weather: 'Cuaca',
            report: 'Laporan',
            dashboard: 'Papan Pemuka',
            premium: 'Premium'
        }
    };
    
    const t = translations[currentLanguage];
    
    // Update navigation
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
}

// ===== WEATHER BACKGROUND =====
function updateWeatherBackground() {
    const body = document.getElementById('weatherBackground');
    const weather = currentWeather.condition;
    
    body.setAttribute('data-weather', weather);
    body.className = `weather-${weather}`;
    
    // Update animations based on weather
    updateWeatherAnimations(weather);
}

function updateWeatherAnimations(weather) {
    const animations = {
        sunny: { sun: 'block', clouds: 'block', rain: 'none', haze: 'none' },
        rainy: { sun: 'none', clouds: 'block', rain: 'block', haze: 'none' },
        cloudy: { sun: 'none', clouds: 'block', rain: 'none', haze: 'none' },
        haze: { sun: 'block', clouds: 'block', rain: 'none', haze: 'block' },
        storm: { sun: 'none', clouds: 'block', rain: 'block', haze: 'none' }
    };
    
    const anim = animations[weather] || animations.sunny;
    
    document.getElementById('sunAnimation').style.display = anim.sun;
    document.getElementById('cloudsAnimation').style.display = anim.clouds;
    document.getElementById('rainAnimation').style.display = anim.rain;
    document.getElementById('hazeAnimation').style.display = anim.haze;
}

// ===== USER MANAGEMENT =====
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;
    
    // Demo authentication
    const demoCredentials = {
        'user@demo.com': { password: 'user123', role: 'user', name: 'Demo User' },
        'premium@demo.com': { password: 'premium123', role: 'premium', name: 'Premium User' },
        'admin@demo.com': { password: 'admin123', role: 'admin', name: 'Administrator' }
    };
    
    if (demoCredentials[email] && demoCredentials[email].password === password) {
        const user = demoCredentials[email];
        
        currentUser = {
            id: Date.now(),
            name: user.name,
            email: email,
            role: user.role,
            plan: user.role === 'premium' ? 'premium' : 'free',
            reportsUsed: 0,
            reportsLimit: user.role === 'premium' ? 999 : 5,
            isPremium: user.role === 'premium',
            language: currentLanguage
        };
        
        isLoggedIn = true;
        localStorage.setItem('safeWeatherUser', JSON.stringify(currentUser));
        
        showNotification('Login successful! Welcome back.', 'success');
        updateUserInterface();
        showSection('dashboard');
        
        // Update user greeting
        document.getElementById('userGreeting').textContent = currentUser.name.split(' ')[0];
        
        return true;
    }
    
    showNotification('Invalid email or password. Try demo credentials.', 'error');
    return false;
}

function handleRegister(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const phone = document.getElementById('registerPhone').value;
    
    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('safeWeatherUsers') || '[]');
    if (existingUsers.some(u => u.email === email)) {
        showNotification('Email already registered. Please login.', 'error');
        return false;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        role: 'user',
        plan: 'free',
        reportsUsed: 0,
        reportsLimit: 5,
        isPremium: false,
        createdAt: new Date().toISOString(),
        language: currentLanguage
    };
    
    existingUsers.push(newUser);
    localStorage.setItem('safeWeatherUsers', JSON.stringify(existingUsers));
    
    // Auto login
    currentUser = newUser;
    isLoggedIn = true;
    localStorage.setItem('safeWeatherUser', JSON.stringify(currentUser));
    
    showNotification('Registration successful! Welcome to SafeWeather Pro.', 'success');
    updateUserInterface();
    showSection('dashboard');
    
    return true;
}

function logout() {
    currentUser = {
        id: null,
        name: 'Guest User',
        email: 'guest@safeweather.my',
        role: 'guest',
        plan: 'free',
        reportsUsed: 0,
        reportsLimit: 5,
        isPremium: false,
        language: currentLanguage
    };
    
    isLoggedIn = false;
    localStorage.removeItem('safeWeatherUser');
    
    showNotification('Logged out successfully.', 'info');
    updateUserInterface();
    showSection('home');
}

function updateUserInterface() {
    const userProfile = document.getElementById('userProfile');
    const authButtons = document.getElementById('authButtons');
    
    if (isLoggedIn) {
        userProfile.style.display = 'block';
        authButtons.style.display = 'none';
        
        // Update user info
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userEmail').textContent = currentUser.email;
        document.getElementById('userRole').textContent = currentUser.role.toUpperCase();
        
        // Update role color
        const roleElement = document.getElementById('userRole');
        roleElement.className = 'user-role ' + currentUser.role;
        
        // Update report limits
        updateReportLimits();
        
        // Show/hide premium banner
        if (!currentUser.isPremium) {
            document.getElementById('premiumBanner').style.display = 'flex';
        } else {
            document.getElementById('premiumBanner').style.display = 'none';
        }
    } else {
        userProfile.style.display = 'none';
        authButtons.style.display = 'flex';
        document.getElementById('premiumBanner').style.display = 'flex';
    }
    
    // Update navigation based on role
    updateNavigation();
}

function updateNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const userRole = currentUser.role;
    
    navLinks.forEach(link => {
        const requiresAuth = link.getAttribute('data-auth');
        const requiresPremium = link.getAttribute('data-premium');
        
        if (requiresAuth === 'true' && !isLoggedIn) {
            link.style.display = 'none';
        } else if (requiresPremium === 'true' && !currentUser.isPremium) {
            link.style.display = 'none';
        } else {
            link.style.display = 'flex';
        }
    });
}

// ===== WEATHER FUNCTIONS =====
function loadCurrentWeather() {
    // In production, this would fetch from WeatherAPI
    // For demo, we'll use mock data
    const mockWeather = {
        condition: 'haze',
        temperature: 32,
        location: 'Batu Pahat, Johor',
        description: 'Moderate Haze',
        windSpeed: 12,
        humidity: 78,
        visibility: 3.2,
        feelsLike: 35,
        aqi: 85,
        pm25: 65,
        pm10: 89
    };
    
    currentWeather = mockWeather;
    updateWeatherDisplay();
    updateWeatherBackground();
}

function refreshWeather() {
    showNotification('Refreshing weather data...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        loadCurrentWeather();
        showNotification('Weather data updated successfully!', 'success');
    }, 1000);
}

function updateWeatherDisplay() {
    document.getElementById('currentLocation').textContent = currentWeather.location;
    document.getElementById('currentTemp').textContent = currentWeather.temperature;
    document.getElementById('weatherDesc').textContent = currentWeather.description;
    document.getElementById('windSpeed').textContent = currentWeather.windSpeed;
    document.getElementById('humidity').textContent = currentWeather.humidity;
    document.getElementById('visibility').textContent = currentWeather.visibility;
    document.getElementById('feelsLike').textContent = currentWeather.feelsLike;
    document.getElementById('aqiValue').textContent = currentWeather.aqi;
    
    // Update AQI pointer
    const aqi = Math.min(Math.max(currentWeather.aqi, 0), 300);
    const percentage = (aqi / 300) * 100;
    document.getElementById('aqiPointer').style.left = `${percentage}%`;
    
    // Update weather icon
    updateWeatherIcon(currentWeather.condition);
}

function updateWeatherIcon(condition) {
    const iconMap = {
        sunny: 'fa-sun',
        rainy: 'fa-cloud-rain',
        cloudy: 'fa-cloud',
        haze: 'fa-smog',
        storm: 'fa-bolt'
    };
    
    const iconClass = iconMap[condition] || 'fa-cloud-sun';
    const iconElement = document.getElementById('weatherIcon');
    iconElement.innerHTML = `<i class="fas ${iconClass} fa-4x"></i>`;
    
    // Add animation based on condition
    if (condition === 'sunny') {
        iconElement.style.animation = 'pulse 2s infinite';
    } else if (condition === 'rainy') {
        iconElement.style.animation = 'shake 0.5s infinite';
    }
}

// ===== REPORTING SYSTEM =====
function handleReportSubmit(e) {
    e.preventDefault();
    
    if (!isLoggedIn) {
        showNotification('Please login to submit a report.', 'warning');
        showSection('login');
        return false;
    }
    
    // Check report limits for free users
    if (!currentUser.isPremium && currentUser.reportsUsed >= currentUser.reportsLimit) {
        showNotification('You have reached your monthly report limit. Upgrade to Premium for unlimited reports.', 'warning');
        showSection('premium');
        return false;
    }
    
    const location = document.getElementById('reportLocation').value;
    const hazardType = document.querySelector('input[name="hazardType"]:checked')?.value;
    const severity = document.querySelector('input[name="severity"]:checked')?.value;
    const description = document.getElementById('reportDescription').value;
    
    if (!location || !hazardType || !severity || !description) {
        showNotification('Please fill in all required fields.', 'error');
        return false;
    }
    
    // Create report object
    const report = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        location: location,
        hazardType: hazardType,
        severity: severity,
        description: description,
        timestamp: new Date().toISOString(),
        status: 'pending',
        likes: 0,
        comments: []
    };
    
    // Save report
    saveReport(report);
    
    // Update user's report count
    currentUser.reportsUsed++;
    localStorage.setItem('safeWeatherUser', JSON.stringify(currentUser));
    
    // Update UI
    updateReportLimits();
    
    // Show success message
    showNotification('Report submitted successfully! It will be reviewed by our team.', 'success');
    
    // Reset form
    document.getElementById('weatherReportForm').reset();
    document.getElementById('mediaPreview').innerHTML = '';
    
    // Update recent reports
    loadRecentReports();
    
    return true;
}

function saveReport(report) {
    const reports = JSON.parse(localStorage.getItem('safeWeatherReports') || '[]');
    reports.unshift(report); // Add to beginning
    localStorage.setItem('safeWeatherReports', JSON.stringify(reports.slice(0, 100))); // Keep last 100 reports
}

function loadRecentReports() {
    const reports = JSON.parse(localStorage.getItem('safeWeatherReports') || '[]');
    const container = document.getElementById('recentReports');
    
    if (!container) return;
    
    if (reports.length === 0) {
        container.innerHTML = '<p class="no-reports">No reports yet. Be the first to report!</p>';
        return;
    }
    
    const recent = reports.slice(0, 6); // Show 6 most recent
    
    container.innerHTML = recent.map(report => `
        <div class="report-card">
            <div class="report-header">
                <div class="report-user">
                    <i class="fas fa-user-circle"></i>
                    <span>${report.userName}</span>
                </div>
                <span class="report-time">${formatTimeAgo(report.timestamp)}</span>
            </div>
            <div class="report-content">
                <h4>${report.location}</h4>
                <p>${report.description}</p>
                <div class="report-tags">
                    <span class="tag hazard-${report.hazardType}">${report.hazardType}</span>
                    <span class="tag severity-${report.severity}">${report.severity}</span>
                </div>
            </div>
            <div class="report-actions">
                <button class="btn-like" onclick="likeReport(${report.id})">
                    <i class="fas fa-thumbs-up"></i> <span>${report.likes}</span>
                </button>
                <button class="btn-comment" onclick="commentOnReport(${report.id})">
                    <i class="fas fa-comment"></i> Comment
                </button>
                <button class="btn-share" onclick="shareReport(${report.id})">
                    <i class="fas fa-share"></i> Share
                </button>
            </div>
        </div>
    `).join('');
}

function updateReportLimits() {
    const reportsUsed = currentUser.reportsUsed;
    const reportsLimit = currentUser.reportsLimit;
    const percentage = (reportsUsed / reportsLimit) * 100;
    
    document.getElementById('reportsUsed').textContent = reportsUsed;
    document.getElementById('reportsLimit').textContent = reportsLimit;
    document.getElementById('reportMeter').style.width = `${percentage}%`;
    
    // Update meter color based on usage
    const meter = document.getElementById('reportMeter');
    if (percentage >= 80) {
        meter.style.background = 'var(--danger)';
    } else if (percentage >= 60) {
        meter.style.background = 'var(--warning)';
    } else {
        meter.style.background = 'var(--success)';
    }
    
    // Update note for free users
    if (!currentUser.isPremium) {
        document.getElementById('limitNote').textContent = 
            `Free users are limited to ${reportsLimit} reports per month`;
    } else {
        document.getElementById('limitNote').textContent = 
            'Premium users enjoy unlimited reports!';
    }
}

// ===== PREMIUM FEATURES =====
function upgradeToPro() {
    if (!isLoggedIn) {
        showNotification('Please login to upgrade to Premium.', 'warning');
        showSection('login');
        return;
    }
    
    // In production, this would integrate with payment gateway
    // For demo, we'll simulate upgrade
    
    showNotification('Processing your upgrade to Premium...', 'info');
    
    setTimeout(() => {
        currentUser.plan = 'premium';
        currentUser.isPremium = true;
        currentUser.reportsLimit = 999;
        currentUser.role = 'premium';
        
        localStorage.setItem('safeWeatherUser', JSON.stringify(currentUser));
        
        showNotification('Congratulations! You are now a Premium member.', 'success');
        updateUserInterface();
        
        // Hide premium banner
        document.getElementById('premiumBanner').style.display = 'none';
        
        // Update UI
        updateNavigation();
        updateReportLimits();
        
    }, 2000);
}

// ===== NAVIGATION =====
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        
        // Add active class to corresponding nav link
        const navLink = document.querySelector(`.nav-link[onclick*="${sectionId}"]`);
        if (navLink) {
            navLink.classList.add('active');
        }
        
        // Load section-specific data
        loadSectionData(sectionId);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'home':
            loadCurrentWeather();
            break;
        case 'weather':
            loadCurrentWeather();
            loadWeatherForecast();
            break;
        case 'report':
            loadRecentReports();
            updateReportLimits();
            break;
        case 'dashboard':
            loadDashboardData();
            break;
        case 'premium':
            loadPremiumFeatures();
            break;
    }
}

function handleNavClick(e) {
    e.preventDefault();
    const sectionId = this.getAttribute('onclick').match(/showSection\('(.+?)'\)/)[1];
    showSection(sectionId);
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ===== UTILITY FUNCTIONS =====
function formatTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return past.toLocaleDateString();
}

function updateCurrentTime() {
    const now = new Date();
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.innerHTML = `
            <i class="fas fa-clock"></i>
            ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        `;
    }
}

function updateLiveData() {
    // Update live user count
    const liveUsers = document.getElementById('liveUsers');
    if (liveUsers) {
        const base = 1247;
        const change = Math.floor(Math.random() * 20) - 10;
        liveUsers.textContent = Math.max(base + change, 1200);
    }
    
    // Update reports today
    const reportsToday = document.getElementById('reportsToday');
    if (reportsToday) {
        const base = 89;
        const change = Math.floor(Math.random() * 5);
        reportsToday.textContent = base + change;
    }
    
    // Update active alerts
    const alertsActive = document.getElementById('alertsActive');
    if (alertsActive) {
        const alerts = [12, 13, 14, 11, 15];
        alertsActive.textContent = alerts[Math.floor(Math.random() * alerts.length)];
    }
}

function loadDemoData() {
    // Load demo reports if none exist
    if (!localStorage.getItem('safeWeatherReports')) {
        const demoReports = [
            {
                id: 1,
                userId: 101,
                userName: 'Ali Ahmad',
                location: 'SK Sri Gading',
                hazardType: 'haze',
                severity: 'medium',
                description: 'Moderate haze affecting visibility. School buses advised to reduce speed.',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                status: 'verified',
                likes: 5,
                comments: []
            },
            {
                id: 2,
                userId: 102,
                userName: 'Siti Sarah',
                location: 'Parit Raja Highway',
                hazardType: 'rain',
                severity: 'high',
                description: 'Heavy rain causing flooding on the highway. Avoid if possible.',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                status: 'verified',
                likes: 12,
                comments: []
            }
        ];
        
        localStorage.setItem('safeWeatherReports', JSON.stringify(demoReports));
    }
    
    // Load demo users if none exist
    if (!localStorage.getItem('safeWeatherUsers')) {
        const demoUsers = [
            {
                id: 101,
                name: 'Ali Ahmad',
                email: 'ali@demo.com',
                phone: '+60 12-345 6789',
                role: 'user',
                plan: 'free',
                reportsUsed: 2,
                reportsLimit: 5,
                isPremium: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 102,
                name: 'Siti Sarah',
                email: 'siti@demo.com',
                phone: '+60 12-345 6790',
                role: 'premium',
                plan: 'premium',
                reportsUsed: 15,
                reportsLimit: 999,
                isPremium: true,
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('safeWeatherUsers', JSON.stringify(demoUsers));
    }
}

// ===== CHATBOT FUNCTIONS =====
function toggleChatbot() {
    const chatbot = document.getElementById('chatbotWidget');
    if (chatbot.style.display === 'block') {
        chatbot.style.display = 'none';
    } else {
        chatbot.style.display = 'block';
        loadChatbotHistory();
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    // Get bot response
    setTimeout(() => {
        const response = getBotResponse(message);
        addChatMessage(response, 'bot');
    }, 1000);
}

function addChatMessage(text, sender) {
    const messages = document.getElementById('chatbotMessages');
    const message = document.createElement('div');
    message.className = `message ${sender}`;
    message.innerHTML = `
        <div class="message-content">${text}</div>
        <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
    `;
    
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
}

function getBotResponse(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('weather') || lower.includes('cuaca')) {
        return `Current weather in ${currentWeather.location}: ${currentWeather.temperature}°C, ${currentWeather.description}. Air Quality Index is ${currentWeather.aqi} (Moderate).`;
    }
    
    if (lower.includes('report') || lower.includes('laporan')) {
        if (!isLoggedIn) {
            return 'Please login to submit a weather report. You can use the "Report" section in the navigation.';
        }
        return 'You can submit a weather report in the "Report" section. Describe the conditions and location to help others stay safe.';
    }
    
    if (lower.includes('premium') || lower.includes('upgrade')) {
        return 'Upgrade to Premium for unlimited reports, SMS alerts, and advanced features. Visit the Premium section for more information.';
    }
    
    if (lower.includes('help') || lower.includes('bantuan')) {
        return 'I can help with weather information, reporting hazards, account questions, and premium features. What do you need help with?';
    }
    
    if (lower.includes('hello') || lower.includes('hai') || lower.includes('hi')) {
        return 'Hello! I\'m your SafeWeather assistant. How can I help you today?';
    }
    
    return 'I\'m not sure I understand. You can ask me about weather conditions, how to submit reports, or account information.';
}

function quickAction(action) {
    const actions = {
        weather: 'What\'s the current weather like?',
        report: 'How do I report a hazard?',
        alerts: 'How do I set up alerts?',
        help: 'I need help using the platform'
    };
    
    document.getElementById('chatbotInput').value = actions[action];
    sendChatMessage();
}

// ===== INITIALIZATION CALL =====
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Set current year in footer
document.getElementById('currentYear').textContent = new Date().getFullYear();