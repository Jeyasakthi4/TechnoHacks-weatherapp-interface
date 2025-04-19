document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const locationInput = document.getElementById('location-input');
    const searchBtn = document.getElementById('search-btn');
    const locationBtn = document.getElementById('location-btn');
    const currentLocation = document.getElementById('current-location');
    const currentDate = document.getElementById('current-date');
    const currentIcon = document.getElementById('current-icon');
    const currentTemp = document.getElementById('current-temp');
    const currentCondition = document.getElementById('current-condition');
    const feelsLike = document.getElementById('feels-like');
    const windSpeed = document.getElementById('wind-speed');
    const humidity = document.getElementById('humidity');
    const visibility = document.getElementById('visibility');
    const precipitation = document.getElementById('precipitation');
    const forecastList = document.getElementById('forecast-list');
    const unitBtns = document.querySelectorAll('.unit-btn');
    const themeSwitch = document.getElementById('theme-switch');
    
    // Units (Fahrenheit by default)
    let units = 'imperial';
    let currentWeatherData = null;
    
    // Initialize app
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update time every minute
    
    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeSwitch.checked = true;
    }
    
    // Event Listeners
    searchBtn.addEventListener('click', searchLocation);
    locationBtn.addEventListener('click', getLocationWeather);
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchLocation();
    });
    
    unitBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            unitBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            units = this.dataset.unit === 'c' ? 'metric' : 'imperial';
            if (currentWeatherData) {
                updateWeatherDisplay(currentWeatherData);
            }
        });
    });
    
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Functions
    function updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDate.textContent = now.toLocaleDateString('en-US', options);
    }
    
    function searchLocation() {
        const location = locationInput.value.trim();
        if (location) {
            fetchWeather(location);
        }
    }
    
    function getLocationWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherByCoords(latitude, longitude);
                },
                error => {
                    alert('Unable to retrieve your location. Please enable location services or search manually.');
                    console.error('Geolocation error:', error);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser. Please search manually.');
        }
    }
    
    async function fetchWeather(location) {
        try {
            // In a real app, you would use a weather API like OpenWeatherMap
            // This is a mock implementation for the UI
            const mockWeatherData = generateMockWeatherData(location);
            currentWeatherData = mockWeatherData;
            updateWeatherDisplay(mockWeatherData);
        } catch (error) {
            console.error('Error fetching weather:', error);
            alert('Error fetching weather data. Please try again.');
        }
    }
    
    async function fetchWeatherByCoords(lat, lon) {
        try {
            // In a real app, you would use a weather API like OpenWeatherMap
            // This is a mock implementation for the UI
            const mockWeatherData = generateMockWeatherData('Current Location');
            currentWeatherData = mockWeatherData;
            updateWeatherDisplay(mockWeatherData);
        } catch (error) {
            console.error('Error fetching weather by coordinates:', error);
            alert('Error fetching weather data. Please try again.');
        }
    }
    
    function updateWeatherDisplay(data) {
        currentLocation.textContent = data.location;
        
        // Current weather
        const temp = units === 'metric' ? data.current.temp_c : data.current.temp_f;
        const feelsLikeTemp = units === 'metric' ? data.current.feels_like_c : data.current.feels_like_f;
        const wind = units === 'metric' ? data.current.wind_kph : data.current.wind_mph;
        const vis = units === 'metric' ? data.current.vis_km : data.current.vis_miles;
        
        currentTemp.textContent = Math.round(temp);
        currentCondition.textContent = data.current.condition;
        feelsLike.textContent = Math.round(feelsLikeTemp);
        windSpeed.textContent = Math.round(wind);
        humidity.textContent = data.current.humidity;
        visibility.textContent = Math.round(vis);
        precipitation.textContent = data.current.precipitation;
        
        // Weather icon
        currentIcon.innerHTML = getWeatherIcon(data.current.icon);
        
        // Forecast
        forecastList.innerHTML = '';
        data.forecast.forEach(day => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            const forecastDay = new Date(day.date);
            const dayName = forecastDay.toLocaleDateString('en-US', { weekday: 'short' });
            
            const highTemp = units === 'metric' ? day.max_temp_c : day.max_temp_f;
            const lowTemp = units === 'metric' ? day.min_temp_c : day.min_temp_f;
            
            forecastItem.innerHTML = `
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-icon">${getWeatherIcon(day.icon)}</div>
                <div class="forecast-temp">
                    <span>${Math.round(highTemp)}°</span>
                    <span>${Math.round(lowTemp)}°</span>
                </div>
            `;
            
            forecastList.appendChild(forecastItem);
        });
    }
    
    function getWeatherIcon(iconCode) {
        // This is a simplified version. In a real app, you'd map API icon codes to appropriate icons
        const iconMap = {
            'clear': 'fa-sun',
            'partly-cloudy': 'fa-cloud-sun',
            'cloudy': 'fa-cloud',
            'rain': 'fa-cloud-rain',
            'thunderstorm': 'fa-bolt',
            'snow': 'fa-snowflake',
            'fog': 'fa-smog'
        };
        
        const iconClass = iconMap[iconCode] || 'fa-question';
        return `<i class="fas ${iconClass}"></i>`;
    }
    
    // Mock data generator for demonstration
    function generateMockWeatherData(location) {
        const conditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Rain', 'Thunderstorm', 'Snow', 'Fog'];
        const icons = ['clear', 'partly-cloudy', 'cloudy', 'rain', 'thunderstorm', 'snow', 'fog'];
        const currentConditionIndex = Math.floor(Math.random() * conditions.length);
        
        // Generate current weather
        const currentTempF = Math.floor(Math.random() * 50) + 30; // 30-80°F
        const currentTempC = Math.round((currentTempF - 32) * 5/9);
        
        const currentWeather = {
            temp_f: currentTempF,
            temp_c: currentTempC,
            feels_like_f: currentTempF + Math.floor(Math.random() * 5) - 2,
            feels_like_c: currentTempC + Math.floor(Math.random() * 3) - 1,
            condition: conditions[currentConditionIndex],
            icon: icons[currentConditionIndex],
            wind_mph: Math.floor(Math.random() * 15) + 1,
            wind_kph: Math.floor(Math.random() * 25) + 1,
            humidity: Math.floor(Math.random() * 50) + 30,
            vis_miles: Math.floor(Math.random() * 10) + 1,
            vis_km: Math.floor(Math.random() * 16) + 1,
            precipitation: Math.floor(Math.random() * 30)
        };
        
        // Generate forecast
        const forecast = [];
        const today = new Date();
        
        for (let i = 1; i <= 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const conditionIndex = Math.floor(Math.random() * conditions.length);
            const maxTempF = currentTempF + Math.floor(Math.random() * 10) - 5;
            const minTempF = maxTempF - Math.floor(Math.random() * 10) - 5;
            
            forecast.push({
                date: date.toISOString().split('T')[0],
                max_temp_f: maxTempF,
                min_temp_f: minTempF,
                max_temp_c: Math.round((maxTempF - 32) * 5/9),
                min_temp_c: Math.round((minTempF - 32) * 5/9),
                condition: conditions[conditionIndex],
                icon: icons[conditionIndex]
            });
        }
        
        return {
            location: location,
            current: currentWeather,
            forecast: forecast
        };
    }
    
    // Initialize with default data
    fetchWeather('New York');
});
// Add this at the beginning of your script.js
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeSwitch.checked = savedTheme === 'dark';
    
    // Update moon/sun icons based on theme
    updateThemeIcons(savedTheme);
}

function updateThemeIcons(theme) {
    const moonIcon = document.querySelector('.fa-moon');
    const sunIcon = document.querySelector('.fa-sun');
    
    if (theme === 'dark') {
        moonIcon.style.color = 'var(--text-color)';
        sunIcon.style.color = '#ffd43b';
    } else {
        moonIcon.style.color = 'var(--accent-color)';
        sunIcon.style.color = 'var(--text-color)';
    }
}

// Update the theme switch event listener
themeSwitch.addEventListener('change', function() {
    const newTheme = this.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
});

// Call initializeTheme at the start
initializeTheme();