function getWeather() {
    const apiKey = 'a427bbc8bf592bdc3bf75c343b55462b';
    const zipcode = document.getElementById('zipcode').value;

    if (!zipcode) {
        alert('Please enter a zipcode');
        return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode}&appid=${apiKey}&units=imperial`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?zip=${zipcode}&appid=${apiKey}&units=imperial`;

    fetch(currentWeatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data, apiKey);
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            alert('Error fetching current weather data. Please try again.');
        });

    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => displayHourlyForecast(data.list))
        .catch(error => {
            console.error('Error fetching hourly forecast data:', error);
            alert('Error fetching hourly forecast data. Please try again.');
        });
}

async function displayWeather(data, apiKey) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    const weatherAnimationsDiv = document.getElementById('weather-animations'); // New div for weather animations

    weatherInfoDiv.innerHTML = '';
    hourlyForecastDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';
    weatherAnimationsDiv.innerHTML = ''; // Clear previous animations

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = data.name;
        const temperatureF = data.main.temp;
        const temperatureC = (temperatureF - 32) * 5 / 9; // Convert to Celsius
        const humidity = data.main.humidity;
        const pressure = data.main.pressure;
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        // Calculate dew point based on the available temperature and humidity data.
        const dewPointC = temperatureC - ((100 - humidity) / 5);
        const dewPointF = dewPointC * 9 / 5 + 32; // Convert back to Fahrenheit

        // Handle precipitation data (WHERE AVAILABLE)
        let precipitation = 'N/A';
        if (data.rain && data.rain['3h']) {
            precipitation = `${data.rain['3h']} inches of rain in the last 3 hours`;
        } else if (data.snow && data.snow['3h']) {
            precipitation = `${data.snow['3h']} inches of snow in the last 3 hours`;
        }

        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;

        const temperatureHTML = `<p>${Math.round(temperatureF)}°F</p>`;
        const weatherHtml = `
            <p>${cityName}</p>
            <p>${description}</p>
            <p>Humidity: ${humidity}%</p>
            <p>Pressure: ${pressure} hPa</p>
            <p>Dew Point: ${Math.round(dewPointF)}°F</p>
            <p>Precipitation: ${precipitation}</p>
        `;

        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHtml;

        // Add weather animation based on weather description
        if (data.weather[0].main === 'Clear') {
            weatherAnimationsDiv.innerHTML = '<div class="clear-animation">☀️</div>';
        } else if (data.weather[0].main === 'Rain') {
            weatherAnimationsDiv.innerHTML = '<div class="rain-animation">🌧️</div>';
        } else if (data.weather[0].main === 'Snow') {
            weatherAnimationsDiv.innerHTML = '<div class="snow-animation">❄️</div>';
        } else {
            weatherAnimationsDiv.innerHTML = '<div class="default-animation">🌥️</div>';
        }

        await getAdditionalWeatherData(data.coord.lat, data.coord.lon, apiKey);
    }
}

function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');

    if (!hourlyData || hourlyData.length === 0) {
        hourlyForecastDiv.innerHTML = '<p>No hourly forecast available.</p>';
        return;
    }

    const next24Hours = hourlyData.slice(0, 8); // Display the next 24 hours (3-hour intervals)

    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000); // Convert timestamp to milliseconds
        const hour = dateTime.getHours();
        const temperature = Math.round(item.main.temp); // Temperature is already in Fahrenheit
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Hourly Weather Icon">
                <span>${temperature}°F</span>
            </div>
        `;

        hourlyForecastDiv.innerHTML += hourlyItemHtml;
    });
}

function getAdditionalWeatherData(lat, lon, apiKey) {
    const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const uvIndexUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(airQualityUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const airQuality = data.list[0].main.aqi;
            const weatherInfoDiv = document.getElementById('weather-info');
            weatherInfoDiv.innerHTML += `<p>Air Quality Index: ${airQuality}</p>`;
        })
        .catch(error => {
            console.error('Error fetching air quality data:', error);
        });

    fetch(uvIndexUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const uvIndex = data.value;
            const weatherInfoDiv = document.getElementById('weather-info');
            weatherInfoDiv.innerHTML += `<p>UV Index: ${uvIndex}</p>`;
        })
        .catch(error => {
            console.error('Error fetching UV index data:', error);
        });
}
