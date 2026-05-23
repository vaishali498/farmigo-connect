// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Active nav on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 80) current = sec.getAttribute('id');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
});

// Weather Feature
async function getWeather() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) return alert('Please enter a city name!');

  const btn = document.getElementById('weatherBtn');
  btn.textContent = 'Loading...';
  btn.disabled = true;

  const resultDiv = document.getElementById('weatherResult');
  const errorDiv = document.getElementById('weatherError');
  resultDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');

  try {
    // Using Open-Meteo (completely FREE, no API key needed)
    // First geocode the city
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('City not found. Please check the spelling.');
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // Get weather
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto`
    );
    const weatherData = await weatherRes.json();
    const curr = weatherData.current;

    // WMO Weather code to description + icon
    const weatherInfo = getWeatherInfo(curr.weather_code);

    document.getElementById('weatherCity').textContent = `${name}, ${country}`;
    document.getElementById('weatherDesc').textContent = weatherInfo.desc;
    document.getElementById('weatherIcon').textContent = weatherInfo.icon;
    document.getElementById('weatherTemp').textContent = `${Math.round(curr.temperature_2m)}°C`;
    document.getElementById('weatherHumidity').textContent = `${curr.relative_humidity_2m}%`;
    document.getElementById('weatherWind').textContent = `${Math.round(curr.wind_speed_10m)} km/h`;
    document.getElementById('weatherFeels').textContent = `${Math.round(curr.apparent_temperature)}°C`;

    // Farming tip
    const tip = getFarmingTip(curr.weather_code, curr.temperature_2m, curr.relative_humidity_2m);
    document.getElementById('farmingTip').textContent = '🌾 Farming Tip: ' + tip;

    resultDiv.classList.remove('hidden');
  } catch (err) {
    errorDiv.textContent = '❌ ' + err.message;
    errorDiv.classList.remove('hidden');
  } finally {
    btn.textContent = 'Get Weather';
    btn.disabled = false;
  }
}

function getWeatherInfo(code) {
  if (code === 0) return { desc: 'Clear sky', icon: '☀️' };
  if (code <= 2) return { desc: 'Partly cloudy', icon: '⛅' };
  if (code === 3) return { desc: 'Overcast', icon: '☁️' };
  if (code <= 49) return { desc: 'Foggy / misty', icon: '🌫️' };
  if (code <= 59) return { desc: 'Drizzle', icon: '🌦️' };
  if (code <= 69) return { desc: 'Rain', icon: '🌧️' };
  if (code <= 79) return { desc: 'Snow', icon: '❄️' };
  if (code <= 84) return { desc: 'Rain showers', icon: '🌦️' };
  if (code <= 94) return { desc: 'Thunderstorm', icon: '⛈️' };
  return { desc: 'Severe weather', icon: '🌪️' };
}

function getFarmingTip(code, temp, humidity) {
  if (code >= 80 && code <= 99) return 'Heavy rain or storm expected. Protect harvested crops and avoid field work today.';
  if (code >= 60 && code < 80) return 'Light to moderate rain. Good for irrigation — you can save water. Delay pesticide spraying.';
  if (code >= 45 && code < 60) return 'Foggy conditions. Beware of fungal diseases. Ensure good ventilation in storage areas.';
  if (temp > 38) return 'Very hot weather! Water your crops early morning or late evening. Avoid midday field work.';
  if (temp < 10) return 'Cold weather ahead. Protect sensitive crops with covers. Frost risk possible at night.';
  if (humidity > 80) return 'High humidity — watch out for fungal diseases. Spray fungicide if needed.';
  if (humidity < 30) return 'Dry air — increase irrigation. Crops may wilt quickly in these conditions.';
  return 'Weather looks good for farming! Good time for sowing, harvesting, or spraying pesticides.';
}

// Allow Enter key in weather input
document.getElementById('cityInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') getWeather();
});
