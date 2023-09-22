require('dotenv').config();

function fetchWeatherData() {
    const apiKey = process.env.API_KEY;
    const url = 'https://api.openweathermap.org/data'
    const city = 'Erbil';

    const currentWeatherUrl = `${url}/2.5/weather?q=${city}&appid=${apiKey}`;
    const forecastUrl = `${url}/2.5/forecast?q=${city}&appid=${apiKey}`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            const temperature = data.main.temp;
            const description = data.weather[0].description;

            const timestamp = data.dt * 1000;
            const date = new Date(timestamp);
            const city = data.name;
            const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            const currentTemperatureElement = document.getElementById('current-temperature');
            const currentDescriptionElement = document.getElementById('current-description');
            const currentDateElement = document.getElementById('current-date'); // Add this line to get the date element
            const currentCityElement = document.getElementById('current-city'); // Add this line to get the date element

            currentTemperatureElement.textContent = `${Math.round(temperature - 273.15)}°C`;
            currentDescriptionElement.textContent = description;
            currentDateElement.textContent = formattedDate; // Set the formatted date
            currentCityElement.textContent = city; // Set the city name

            currentCityElement.classList.add('text-2xl', 'font-semibold', 'text-white'); // Add classes for styling

        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
        });

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            const groupedData = groupForecastDataByDay(data.list);
            const forecastContainer = document.getElementById('forecast-section');

            for (const dayData of groupedData) {
                const date = new Date(dayData[0].dt * 1000);
                const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

                const maxTemperature = Math.max(...dayData.map(entry => entry.main.temp));
                const weatherIcon = dayData[0].weather[0].icon;

                const dayElement = document.createElement('div');
                dayElement.classList.add('flex', 'flex-col', 'items-center', 'space-y-2');

                const dayNameElement = document.createElement('p');
                dayNameElement.classList.add('text-sm', 'font-medium', 'text-white');
                dayNameElement.textContent = dayOfWeek;

                const iconElement = document.createElement('img');
                iconElement.src = `https://openweathermap.org/img/w/${weatherIcon}.png`;

                const temperatureElement = document.createElement('p');
                temperatureElement.classList.add('text-lg', 'font-semibold', 'text-white');
                temperatureElement.textContent = `${Math.round(maxTemperature - 273.15)}°`;

                dayElement.appendChild(dayNameElement);
                dayElement.appendChild(iconElement);
                dayElement.appendChild(temperatureElement);

                forecastContainer.appendChild(dayElement);
            }
        })
        .catch(error => {
            console.error('Error fetching 6-day forecast data:', error);
        });
}

function groupForecastDataByDay(forecastData) {
    const groupedData = {};
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    for (const entry of forecastData) {
        const date = new Date(entry.dt * 1000);
        if (date >= tomorrow) {
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });

            if (!groupedData[day]) {
                groupedData[day] = [];
            }
            groupedData[day].push(entry);
        }
    }

    const lastDay = Object.keys(groupedData).pop(); // Get the last day
    const lastDayDate = new Date(lastDay);
    const nextDay = new Date(lastDayDate);
    nextDay.setDate(nextDay.getDate() + 1); // Set to the day after the last day

    const nextDayString = nextDay.toLocaleDateString('en-US', { weekday: 'long' });

    groupedData[nextDayString] = [];

    return Object.values(groupedData);
}

window.onload = fetchWeatherData;