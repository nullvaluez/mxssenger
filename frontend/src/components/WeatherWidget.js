// WeatherWidget.js

import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import axios from 'axios';

function WeatherWidget() {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');
  const city = 'New York'; // Set your city
  const weatherAPIKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your OpenWeatherMap API key
  const units = 'metric'; // Use 'imperial' for Fahrenheit
  const theme = useTheme();

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Refresh every 10 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    if (weatherAPIKey === 'YOUR_OPENWEATHERMAP_API_KEY') {
      setError('Please set your OpenWeatherMap API key in WeatherWidget.js');
      return;
    }
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${weatherAPIKey}`;
    try {
      const response = await axios.get(weatherUrl);
      const data = response.data;

      // Extract relevant data
      const weatherInfo = {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        city: data.name,
        date: new Date().toLocaleString(),
      };

      setWeatherData(weatherInfo);
      setError('');
      console.log('Weather data fetched:', weatherInfo);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to fetch weather data.');
    }
  };

  if (error) {
    return (
      <Box
        p={2}
        sx={{
          backgroundColor: 'background.default',
          color: 'text.primary',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!weatherData) {
    return (
      <Box
        p={2}
        sx={{
          backgroundColor: 'background.default',
          color: 'text.primary',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      p={2}
      sx={{
        backgroundColor: 'background.default',
        color: 'text.primary',
        height: '100%',
      }}
    >
      <Typography variant="h4">{weatherData.city}</Typography>
      <Typography variant="subtitle1">{weatherData.date}</Typography>
      <Box display="flex" alignItems="center" mt={2} mb={2}>
        <img
          src={weatherData.icon}
          alt="Weather Icon"
          style={{ width: 100, height: 100 }}
        />
        <Box ml={2}>
          <Typography variant="h3">
            {weatherData.temperature}°{units === 'metric' ? 'C' : 'F'}
          </Typography>
          <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
            {weatherData.description}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body1">Humidity: {weatherData.humidity}%</Typography>
      <Typography variant="body1">
        Wind Speed: {weatherData.windSpeed} {units === 'metric' ? 'm/s' : 'mph'}
      </Typography>
    </Box>
  );
}

export default WeatherWidget;
