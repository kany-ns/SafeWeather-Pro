// WeatherAPI.com Integration
const WEATHER_API_KEY = 'c6d63c31db2a492ca67192415261401'; // Get from https://www.weatherapi.com/
const WEATHER_API_URL = 'https://api.weatherapi.com/v1';

// Cache for weather data
let weatherCache = {
    data: null,
    timestamp: null,
    expiry: 15 * 60 * 1000 // 15 minutes
};

async function fetchWeatherData(location = 'Batu Pahat') {
    try {
        // Check cache first
        if (weatherCache.data && weatherCache.timestamp) {
            const now = Date.now();
            if (now - weatherCache.timestamp < weatherCache.expiry) {
                console.log('Using cached weather data');
                return weatherCache.data;
            }
        }
        
        // If no API key, use demo data
        if (!WEATHER_API_KEY || WEATHER_API_KEY === 'c6d63c31db2a492ca67192415261401') {
            console.log('Using demo weather data');
            return getDemoWeatherData(location);
        }
        
        // Fetch from WeatherAPI
        const response = await fetch(
            `${WEATHER_API_URL}/current.json?key=${WEATHER_API_KEY}&q=${location}&aqi=yes`
        );
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform data to our format
        const weatherData = transformWeatherData(data);
        
        // Cache the data
        weatherCache.data = weatherData;
        weatherCache.timestamp = Date.now();
        
        return weatherData;
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        // Fallback to demo data
        return getDemoWeatherData(location);
    }
}

function transformWeatherData(apiData) {
    const condition = apiData.current.condition.text.toLowerCase();
    let weatherCondition = 'sunny';
    
    if (condition.includes('rain') || condition.includes('drizzle')) {
        weatherCondition = 'rainy';
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
        weatherCondition = 'cloudy';
    } else if (condition.includes('haze') || condition.includes('mist') || condition.includes('fog')) {
        weatherCondition = 'haze';
    } else if (condition.includes('thunder') || condition.includes('storm')) {
        weatherCondition = 'storm';
    }
    
    return {
        condition: weatherCondition,
        temperature: Math.round(apiData.current.temp_c),
        location: `${apiData.location.name}, ${apiData.location.country}`,
        description: apiData.current.condition.text,
        windSpeed: Math.round(apiData.current.wind_kph),
        humidity: apiData.current.humidity,
        visibility: Math.round(apiData.current.vis_km),
        feelsLike: Math.round(apiData.current.feelslike_c),
        aqi: apiData.current.air_quality?.pm2_5?.toFixed(1) || 50,
        pm25: apiData.current.air_quality?.pm2_5?.toFixed(1) || 50,
        pm10: apiData.current.air_quality?.pm10?.toFixed(1) || 70,
        lastUpdated: new Date().toISOString()
    };
}

function getDemoWeatherData(location) {
    // Generate realistic demo data based on time of day and location
    const now = new Date();
    const hour = now.getHours();
    
    // Different weather patterns for demo
    const conditions = ['sunny', 'cloudy', 'rainy', 'haze'];
    const weights = hour < 6 || hour > 18 ? [0.1, 0.3, 0.4, 0.2] : [0.4, 0.3, 0.2, 0.1];
    
    const condition = weightedRandom(conditions, weights);
    
    // Temperature based on time and condition
    let baseTemp = 28;
    if (hour < 6) baseTemp = 24;
    else if (hour < 12) baseTemp = 30;
    else if (hour < 18) baseTemp = 32;
    else baseTemp = 26;
    
    const tempVariation = {
        sunny: 2,
        cloudy: 0,
        rainy: -3,
        haze: 1,
        storm: -2
    };
    
    const temperature = baseTemp + tempVariation[condition];
    
    // AQI based on condition
    const aqiMap = {
        sunny: Math.floor(Math.random() * 30) + 20,
        cloudy: Math.floor(Math.random() * 40) + 30,
        rainy: Math.floor(Math.random() * 20) + 10,
        haze: Math.floor(Math.random() * 100) + 50,
        storm: Math.floor(Math.random() * 30) + 20
    };
    
    return {
        condition: condition,
        temperature: temperature,
        location: location,
        description: getWeatherDescription(condition),
        windSpeed: Math.floor(Math.random() * 20) + 5,
        humidity: Math.floor(Math.random() * 40) + 50,
        visibility: condition === 'haze' ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 10) + 5,
        feelsLike: temperature + Math.floor(Math.random() * 3),
        aqi: aqiMap[condition],
        pm25: aqiMap[condition] * 0.8,
        pm10: aqiMap[condition] * 1.2,
        lastUpdated: now.toISOString(),
        isDemo: true
    };
}

function weightedRandom(items, weights) {
    let total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random < 0) {
            return items[i];
        }
    }
    
    return items[items.length - 1];
}

function getWeatherDescription(condition) {
    const descriptions = {
        sunny: 'Sunny and clear',
        cloudy: 'Partly cloudy',
        rainy: 'Light rain showers',
        haze: 'Moderate haze',
        storm: 'Thunderstorms expected'
    };
    
    return descriptions[condition] || 'Clear skies';
}

async function loadWeatherForecast() {
    const forecastContainer = document.getElementById('forecastGrid');
    if (!forecastContainer) return;
    
    // Demo forecast data
    const forecast = [
        { day: 'Today', condition: currentWeather.condition, high: currentWeather.temperature + 2, low: currentWeather.temperature - 3 },
        { day: 'Tomorrow', condition: 'cloudy', high: 31, low: 25 },
        { day: 'Wed', condition: 'rainy', high: 29, low: 24 },
        { day: 'Thu', condition: 'haze', high: 32, low: 26 },
        { day: 'Fri', condition: 'sunny', high: 33, low: 27 }
    ];
    
    const iconMap = {
        sunny: 'fa-sun',
        cloudy: 'fa-cloud',
        rainy: 'fa-cloud-rain',
        haze: 'fa-smog',
        storm: 'fa-bolt'
    };
    
    forecastContainer.innerHTML = forecast.map(day => `
        <div class="forecast-day">
            <div class="forecast-date">${day.day}</div>
            <div class="forecast-icon">
                <i class="fas ${iconMap[day.condition]}"></i>
            </div>
            <div class="forecast-temp">
                <span class="high">${day.high}°</span>
                <span class="low">${day.low}°</span>
            </div>
            <div class="forecast-desc">${getWeatherDescription(day.condition)}</div>
        </div>
    `).join('');
}

function setLocation(location) {
    // Update location buttons
    document.querySelectorAll('.location-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === location) {
            btn.classList.add('active');
        }
    });
    
    // Update search input
    document.getElementById('locationSearch').value = location;
    
    // Fetch new weather data
    fetchWeatherData(location).then(data => {
        currentWeather = data;
        updateWeatherDisplay();
        updateWeatherBackground();
    });
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by your browser', 'error');
        return;
    }
    
    showNotification('Getting your current location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                // Reverse geocoding to get location name
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                
                const data = await response.json();
                const location = data.address.city || data.address.town || data.address.village || 
                               `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
                
                setLocation(location);
                showNotification(`Location set to ${location}`, 'success');
                
            } catch (error) {
                console.error('Error getting location name:', error);
                setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
            }
        },
        (error) => {
            console.error('Geolocation error:', error);
            showNotification('Unable to get your location. Please enter manually.', 'error');
        }
    );
}

// Export functions for use in main script
window.fetchWeatherData = fetchWeatherData;
window.loadWeatherForecast = loadWeatherForecast;
window.setLocation = setLocation;
window.getCurrentLocation = getCurrentLocation;