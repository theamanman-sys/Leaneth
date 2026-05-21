/* WEATHER ORACLE - LEANETH VENTURES
   Open-Meteo API (free, no key needed)
   ipapi.co geolocation (free, no key needed) */

const WEATHER_CODES = {
    0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Depositing Rime Fog',
    51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
    56: 'Light Freezing Drizzle', 57: 'Dense Freezing Drizzle',
    61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
    66: 'Light Freezing Rain', 67: 'Heavy Freezing Rain',
    71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Slight Rain Showers', 81: 'Moderate Rain Showers', 82: 'Violent Rain Showers',
    85: 'Slight Snow Showers', 86: 'Heavy Snow Showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with Slight Hail', 99: 'Thunderstorm with Heavy Hail',
};

const WMO_ICONS = {
    0: '&#9728;', 1: '&#9728;', 2: '&#9925;', 3: '&#9729;',
    45: '&#127801;', 48: '&#127801;',
    51: '&#127783;', 53: '&#127783;', 55: '&#127783;',
    56: '&#127783;', 57: '&#127783;',
    61: '&#127782;', 63: '&#127782;', 65: '&#127782;',
    66: '&#127782;', 67: '&#127782;',
    71: '&#127784;', 73: '&#127784;', 75: '&#127784;', 77: '&#127784;',
    80: '&#127782;', 81: '&#127782;', 82: '&#127782;',
    85: '&#127784;', 86: '&#127784;',
    95: '&#9889;', 96: '&#9889;', 99: '&#9889;',
};

class WeatherEngine {
    constructor() {
        this.loading = document.getElementById('weather-loading');
        this.display = document.getElementById('weather-display');
        this.stats = document.getElementById('weather-stats');
        this.icon = document.getElementById('weather-icon');
        this.temp = document.getElementById('weather-temp');
        this.feels = document.getElementById('weather-feels');
        this.cityName = document.getElementById('weather-city-name');
        this.desc = document.getElementById('weather-description');
        this.humidity = document.getElementById('weather-humidity');
        this.wind = document.getElementById('weather-wind');
        this.pressure = document.getElementById('weather-pressure');
        this.visibility = document.getElementById('weather-visibility');
        this.uv = document.getElementById('weather-uv');
        this.condition = document.getElementById('weather-condition');
        this.forecastList = document.getElementById('forecast-list');
        this.geoIp = document.getElementById('geo-ip');
        this.geoCountry = document.getElementById('geo-country');
        this.geoRegion = document.getElementById('geo-region');
        this.geoCity = document.getElementById('geo-city');
        this.geoOrg = document.getElementById('geo-org');
        this.geoTz = document.getElementById('geo-tz');
        this.geoCurrency = document.getElementById('geo-currency');
        this.cityInput = document.getElementById('weather-city-input');
        this.searchBtn = document.getElementById('weather-search-btn');
        this.geoBtn = document.getElementById('weather-geo-btn');
        this.lat = null;
        this.lon = null;
        this.city = '';
        this.init();
    }

    init() {
        if (!this.loading) return;
        this.fetchGeoLocation();
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.searchCity());
        }
        if (this.cityInput) {
            this.cityInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.searchCity();
            });
        }
        if (this.geoBtn) {
            this.geoBtn.addEventListener('click', () => this.fetchGeoLocation());
        }
        window.addEventListener('viewChanged', (e) => {
            if (e.detail.view === 'weather') {
                if (this.lat && this.lon) this.fetchWeather(this.lat, this.lon, this.city);
            }
        });
    }

    async searchCity() {
        const q = this.cityInput ? this.cityInput.value.trim() : '';
        if (!q) return;
        this.showLoading();
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            if (!data.results || data.results.length === 0) {
                this.showError('City not found.');
                return;
            }
            const loc = data.results[0];
            this.lat = loc.latitude;
            this.lon = loc.longitude;
            this.city = loc.name;
            this.fetchWeather(this.lat, this.lon, this.city);
        } catch (e) {
            this.showError('City search failed.');
        }
    }

    async fetchGeoLocation() {
        this.showLoading();
        if (this.geoBtn) this.geoBtn.textContent = 'Detecting...';
        try {
            const res = await fetch('https://ipapi.co/json/');
            if (!res.ok) throw new Error();
            const data = await res.json();
            if (this.geoIp) this.geoIp.textContent = data.ip || '-';
            if (this.geoCountry) this.geoCountry.textContent = data.country_name || '-';
            if (this.geoRegion) this.geoRegion.textContent = data.region || '-';
            if (this.geoCity) this.geoCity.textContent = data.city || '-';
            if (this.geoOrg) this.geoOrg.textContent = data.org || '-';
            if (this.geoTz) this.geoTz.textContent = data.timezone || '-';
            if (this.geoCurrency) this.geoCurrency.textContent = data.currency || '-';
            this.lat = data.latitude;
            this.lon = data.longitude;
            this.city = data.city || 'Unknown';
            if (this.lat && this.lon) this.fetchWeather(this.lat, this.lon, this.city);
        } catch (e) {
            this.showError('Geolocation unavailable. Search a city.');
        } finally {
            if (this.geoBtn) this.geoBtn.textContent = 'My Location';
        }
    }

    showLoading() {
        if (this.loading) this.loading.classList.remove('hidden');
        if (this.display) this.display.classList.add('hidden');
        if (this.stats) this.stats.classList.add('hidden');
    }

    showError(msg) {
        if (this.loading) this.loading.classList.add('hidden');
        if (this.display) this.display.classList.remove('hidden');
        if (this.cityName) this.cityName.textContent = msg;
        if (this.temp) this.temp.textContent = '--°C';
        if (this.feels) this.feels.textContent = '';
        if (this.desc) this.desc.textContent = '';
        if (this.icon) this.icon.innerHTML = '&#9733;';
    }

    async fetchWeather(lat, lon, cityName) {
        this.showLoading();
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl,visibility,uv_index&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=6`;
            const res = await fetch(url);
            if (!res.ok) throw new Error();
            const data = await res.json();
            this.renderWeather(data, cityName);
            this.renderForecast(data);
        } catch (e) {
            this.showError('Weather data unavailable.');
        }
    }

    renderWeather(data, cityName) {
        const c = data.current;
        if (!c) return;
        if (this.loading) this.loading.classList.add('hidden');
        if (this.display) this.display.classList.remove('hidden');
        if (this.stats) this.stats.classList.remove('hidden');

        const code = c.weather_code;
        if (this.icon) this.icon.innerHTML = WMO_ICONS[code] || '&#9728;';
        if (this.temp) this.temp.textContent = `${Math.round(c.temperature_2m)}°C`;
        if (this.feels) this.feels.textContent = `Feels like ${Math.round(c.apparent_temperature)}°C`;
        if (this.cityName) this.cityName.textContent = cityName || 'Unknown';
        if (this.desc) this.desc.textContent = WEATHER_CODES[code] || 'Unknown';
        if (this.humidity) this.humidity.textContent = `${c.relative_humidity_2m}%`;
        if (this.wind) this.wind.textContent = `${c.wind_speed_10m} km/h`;
        if (this.pressure) this.pressure.textContent = `${Math.round(c.pressure_msl)} hPa`;
        if (this.visibility) this.visibility.textContent = c.visibility ? `${(c.visibility / 1000).toFixed(1)} km` : '—';
        if (this.uv) this.uv.textContent = c.uv_index != null ? c.uv_index.toFixed(1) : '—';
        if (this.condition) this.condition.textContent = WEATHER_CODES[code] || '—';
    }

    renderForecast(data) {
        if (!this.forecastList) return;
        const daily = data.daily;
        if (!daily || !daily.time) return;
        this.forecastList.innerHTML = '';
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date().toISOString().split('T')[0];
        daily.time.forEach((date, i) => {
            if (date === today && i === 0) return;
            const d = new Date(date + 'T00:00:00');
            const dayName = days[d.getDay()];
            const max = Math.round(daily.temperature_2m_max[i]);
            const min = Math.round(daily.temperature_2m_min[i]);
            const code = daily.weather_code[i];
            const el = document.createElement('div');
            el.className = 'forecast-day';
            el.innerHTML = `
                <span class="forecast-day-name">${dayName}</span>
                <span class="forecast-day-icon">${WMO_ICONS[code] || '&#9728;'}</span>
                <span class="forecast-day-temps"><span class="forecast-high">${max}°</span> <span class="forecast-low">${min}°</span></span>
            `;
            this.forecastList.appendChild(el);
        });
        if (this.forecastList.children.length === 0) {
            this.forecastList.innerHTML = '<div class="tx-log-item text-muted">Forecast data loading...</div>';
        }
    }
}

export function initWeather() {
    new WeatherEngine();
}
