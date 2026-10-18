// Weather Service for KisanPulse AI: 5-to-7-day agricultural weather detection

export const INDIAN_AGRI_HUBS = [
  { id: 'karnal', name: 'Karnal (Wheat & Paddy Belt)', state: 'Haryana', lat: 29.6857, lon: 76.9905, majorCrops: 'Wheat, Basmati Paddy, Mustard' },
  { id: 'ludhiana', name: 'Ludhiana (Central Agri Zone)', state: 'Punjab', lat: 30.9010, lon: 75.8573, majorCrops: 'Wheat, Paddy, Maize, Cotton' },
  { id: 'indore', name: 'Indore (Malwa Plateau)', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577, majorCrops: 'Sharbati Wheat, Soybean, Gram' },
  { id: 'nashik', name: 'Nashik (Horticulture & Onion Hub)', state: 'Maharashtra', lat: 19.9975, lon: 73.7898, majorCrops: 'Onion, Grapes, Tomato, Pomegranate' },
  { id: 'rajkot', name: 'Rajkot (Saurashtra Groundnut Hub)', state: 'Gujarat', lat: 22.3039, lon: 70.8022, majorCrops: 'Cotton, Groundnut, Cumin, Castor' },
  { id: 'alwar', name: 'Alwar (Mustard Capital)', state: 'Rajasthan', lat: 27.5530, lon: 76.6346, majorCrops: 'Mustard, Bajra, Wheat, Barley' },
  { id: 'varanasi', name: 'Varanasi (Eastern Gangetic Plain)', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739, majorCrops: 'Paddy, Wheat, Vegetables, Mustard' },
  { id: 'guntur', name: 'Guntur (Chilli & Cotton Capital)', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365, majorCrops: 'Chilli, Cotton, Tobacco, Paddy' },
  { id: 'coimbatore', name: 'Coimbatore (Kongu Agri Belt)', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558, majorCrops: 'Cotton, Coconut, Sugarcane, Maize' },
  { id: 'mandya', name: 'Mandya (Sugar & Paddy Bowl)', state: 'Karnataka', lat: 12.5244, lon: 76.8958, majorCrops: 'Sugarcane, Paddy, Ragi, Sericulture' },
  { id: 'burdwan', name: 'Purba Bardhaman (Rice Bowl of Bengal)', state: 'West Bengal', lat: 23.2324, lon: 87.8615, majorCrops: 'Aman Paddy, Potato, Jute, Mustard' },
  { id: 'patna', name: 'Patna (South Bihar Plain)', state: 'Bihar', lat: 25.5941, lon: 85.1376, majorCrops: 'Wheat, Paddy, Maize, Pulses' },
  { id: 'warangal', name: 'Warangal (Telangana Cotton Belt)', state: 'Telangana', lat: 17.9689, lon: 79.5941, majorCrops: 'Cotton, Chilli, Paddy, Turmeric' },
  { id: 'palakkad', name: 'Palakkad (Rice Bowl of Kerala)', state: 'Kerala', lat: 10.7867, lon: 76.6548, majorCrops: 'Paddy, Coconut, Rubber, Banana' },
  { id: 'cuttack', name: 'Cuttack (Mahanadi Delta)', state: 'Odisha', lat: 20.4625, lon: 85.8828, majorCrops: 'Paddy, Pulses, Jute, Groundnut' },
  { id: 'jorhat', name: 'Jorhat (Brahmaputra Valley)', state: 'Assam', lat: 26.7509, lon: 94.2037, majorCrops: 'Tea, Paddy, Mustard, Vegetables' }
];

// Interpret WMO Weather Code
export function interpretWeatherCode(code) {
  switch (code) {
    case 0:
      return { text: 'Clear Sky / Sunny', icon: 'Sun', spraySafe: true, rainRisk: 'None' };
    case 1:
      return { text: 'Mainly Clear', icon: 'Sun', spraySafe: true, rainRisk: 'Very Low' };
    case 2:
      return { text: 'Partly Cloudy', icon: 'CloudSun', spraySafe: true, rainRisk: 'Low' };
    case 3:
      return { text: 'Overcast & Cloudy', icon: 'Cloud', spraySafe: true, rainRisk: 'Moderate' };
    case 45:
    case 48:
      return { text: 'Fog / Dense Mist', icon: 'CloudFog', spraySafe: false, rainRisk: 'Low', warning: 'High moisture. Delay foliar spray until mist clears.' };
    case 51:
    case 53:
    case 55:
      return { text: 'Light Drizzle', icon: 'CloudDrizzle', spraySafe: false, rainRisk: 'High', warning: 'Light precipitation. Do not spray chemicals.' };
    case 61:
    case 63:
    case 65:
      return { text: 'Rain Showers', icon: 'CloudRain', spraySafe: false, rainRisk: 'Very High', warning: 'Rain ongoing. Hold chemical spray and irrigation.' };
    case 71:
    case 73:
    case 75:
      return { text: 'Hail / Snow Flurries', icon: 'CloudSnow', spraySafe: false, rainRisk: 'High' };
    case 80:
    case 81:
    case 82:
      return { text: 'Heavy Rain Showers', icon: 'CloudRain', spraySafe: false, rainRisk: 'Very High', warning: 'Heavy downpour expected. Prevent field waterlogging.' };
    case 95:
    case 96:
    case 99:
      return { text: 'Thunderstorm & Gusts', icon: 'CloudLightning', spraySafe: false, rainRisk: 'Severe', warning: 'Severe storm alert! Secure equipment and do not venture into open fields.' };
    default:
      return { text: 'Fair Weather', icon: 'Sun', spraySafe: true, rainRisk: 'Low' };
  }
}

// Generate Realistic 7-day fallback data when offline
export function generateOffline7DayForecast(hub) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const forecast = [];

  const baseTemps = {
    karnal: { max: 31, min: 19 },
    ludhiana: { max: 30, min: 18 },
    indore: { max: 32, min: 20 },
    nashik: { max: 30, min: 18 },
    rajkot: { max: 34, min: 22 },
    alwar: { max: 32, min: 19 },
    guntur: { max: 33, min: 24 },
    default: { max: 31, min: 20 }
  };

  const tempRange = baseTemps[hub?.id] || baseTemps.default;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()];
    const dateFormatted = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    // Deterministic variations based on day
    const maxTemp = tempRange.max + (i % 3) - 1;
    const minTemp = tempRange.min + ((i + 1) % 2);
    const windSpeed = 8 + ((i * 3) % 9);
    const rainProb = i === 3 || i === 4 ? 45 : (i % 2 === 0 ? 10 : 20);
    const rainMm = rainProb > 40 ? 6.5 : 0;
    const weatherCode = rainProb > 40 ? 61 : (i % 2 === 0 ? 1 : 2);
    const weatherInfo = interpretWeatherCode(weatherCode);

    let sprayStatus = 'Optimal';
    let sprayColor = 'green';
    let farmAction = 'Favorable window for fertilizer broadcast and weed management.';

    if (rainProb > 40) {
      sprayStatus = 'Avoid Spray';
      sprayColor = 'red';
      farmAction = 'Rain showers predicted. Delay spraying pesticide to avoid chemical wash-off. Postpone irrigation.';
    } else if (windSpeed > 15) {
      sprayStatus = 'Caution';
      sprayColor = 'amber';
      farmAction = 'Wind velocity above 15 km/h. Spray only with low-drift nozzles early in the morning.';
    } else if (i === 0) {
      farmAction = 'Good sunshine hours. Ideal for pest scouting, inter-cultivation, and harvesting mature produce.';
    }

    forecast.push({
      dayIndex: i,
      dayName,
      date: dateFormatted,
      fullDate: d.toISOString().split('T')[0],
      maxTemp,
      minTemp,
      weatherCode,
      condition: weatherInfo.text,
      icon: weatherInfo.icon,
      rainChance: rainProb,
      precipitationMm: rainMm,
      windSpeedKm: windSpeed,
      humidity: 55 + (i * 4) % 25,
      sprayStatus,
      sprayColor,
      farmAction
    });
  }

  return {
    locationName: hub?.name || 'Selected Farm Location',
    state: hub?.state || 'India',
    isLive: false,
    source: 'KisanPulse Offline Agro-Climatic Cache',
    lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
    summaryAdvisory: 'Overall dry and stable conditions for next 3 days, followed by mild rain probability. Good window for crop care.',
    forecast
  };
}

export function getGoogleWeatherApiKey() {
  try {
    return localStorage.getItem('kisanpulse_google_weather_key') || import.meta.env.VITE_GOOGLE_WEATHER_API_KEY || '';
  } catch {
    return import.meta.env.VITE_GOOGLE_WEATHER_API_KEY || '';
  }
}

function googleWeatherIcon(conditionType = '') {
  const type = conditionType.toUpperCase();
  if (type.includes('THUNDER')) return 'CloudLightning';
  if (type.includes('RAIN') || type.includes('SHOWER')) return 'CloudRain';
  if (type.includes('DRIZZLE')) return 'CloudDrizzle';
  if (type.includes('FOG') || type.includes('MIST')) return 'CloudFog';
  if (type.includes('CLOUDY') || type.includes('OVERCAST')) return 'Cloud';
  if (type.includes('PARTLY')) return 'CloudSun';
  return 'Sun';
}

function getSprayAdvice(rainChance, precipitationMm, windSpeed, maxTemp) {
  if (rainChance > 40 || precipitationMm > 2) {
    return { sprayStatus: 'Avoid Spray', sprayColor: 'red', farmAction: `Rain chance is ${rainChance}%. Delay foliar sprays and check field drainage.` };
  }
  if (windSpeed > 16) {
    return { sprayStatus: 'Drift Risk', sprayColor: 'amber', farmAction: `Wind may reach ${windSpeed} km/h. Avoid spraying in gusty conditions.` };
  }
  if (maxTemp > 36) {
    return { sprayStatus: 'Heat Stress', sprayColor: 'amber', farmAction: `High daytime temperature (${maxTemp}°C). Avoid spraying during hot hours.` };
  }
  return { sprayStatus: 'Optimal', sprayColor: 'green', farmAction: 'Weather looks suitable for routine field work. Check the product label before spraying.' };
}

export async function fetchGoogle7DayWeather(lat, lon, locationLabel = 'My Farm Location', stateLabel = '', apiKey = getGoogleWeatherApiKey()) {
  if (!apiKey) throw new Error('Google Maps Platform Weather API key is not configured.');
  const point = `location.latitude=${encodeURIComponent(lat)}&location.longitude=${encodeURIComponent(lon)}`;
  const common = `key=${encodeURIComponent(apiKey)}&${point}`;
  const [dailyResponse, currentResponse] = await Promise.all([
    fetch(`https://weather.googleapis.com/v1/forecast/days:lookup?${common}&days=7&pageSize=7`, { signal: AbortSignal.timeout(12000) }),
    fetch(`https://weather.googleapis.com/v1/currentConditions:lookup?${common}`, { signal: AbortSignal.timeout(12000) })
  ]);
  const [daily, current] = await Promise.all([dailyResponse.json(), currentResponse.json()]);
  if (!dailyResponse.ok) throw new Error(daily.error?.message || `Google daily forecast request failed (${dailyResponse.status}).`);
  if (!currentResponse.ok) throw new Error(current.error?.message || `Google current weather request failed (${currentResponse.status}).`);
  if (!Array.isArray(daily.forecastDays) || daily.forecastDays.length === 0) throw new Error('Google returned no daily forecast data.');

  const forecast = daily.forecastDays.slice(0, 7).map((item, index) => {
    const dateParts = item.displayDate || {};
    const date = new Date(dateParts.year, (dateParts.month || 1) - 1, dateParts.day || 1);
    const daytime = item.daytimeForecast || {};
    const rainChance = daytime.precipitation?.probability?.percent ?? 0;
    const precipitationMm = daytime.precipitation?.qpf?.quantity ?? 0;
    const windSpeedKm = daytime.wind?.speed?.value ?? 0;
    const maxTemp = Math.round(item.maxTemperature?.degrees ?? 0);
    const minTemp = Math.round(item.minTemperature?.degrees ?? 0);
    const condition = daytime.weatherCondition?.description?.text || 'Weather data unavailable';
    return {
      dayIndex: index,
      dayName: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : date.toLocaleDateString('en-IN', { weekday: 'long' }),
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      fullDate: `${dateParts.year}-${String(dateParts.month || 1).padStart(2, '0')}-${String(dateParts.day || 1).padStart(2, '0')}`,
      maxTemp,
      minTemp,
      condition,
      icon: googleWeatherIcon(daytime.weatherCondition?.type),
      rainChance,
      precipitationMm: Math.round(precipitationMm * 10) / 10,
      windSpeedKm: Math.round(windSpeedKm),
      humidity: daytime.relativeHumidity,
      uvIndex: daytime.uvIndex,
      ...getSprayAdvice(rainChance, precipitationMm, windSpeedKm, maxTemp)
    };
  });
  const rainyDays = forecast.filter((day) => day.rainChance > 35).length;
  return {
    locationName: locationLabel,
    state: stateLabel,
    latitude: lat,
    longitude: lon,
    isLive: true,
    isGoogle: true,
    source: 'Google Weather API',
    current: {
      temp: Math.round(current.temperature?.degrees ?? forecast[0].maxTemp),
      humidity: current.relativeHumidity ?? 0,
      wind: Math.round(current.wind?.speed?.value ?? 0),
      condition: current.weatherCondition?.description?.text || forecast[0].condition
    },
    lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
    summaryAdvisory: rainyDays >= 2
      ? `Rain is likely on ${rainyDays} of the next 7 days. Delay irrigation and foliar spraying around expected showers.`
      : 'No widespread rain signal for the next 7 days. Check daily wind and rain details before field operations.',
    forecast
  };
}

// Fetch 7-Day Forecast from Open-Meteo
export async function fetch7DayWeather(lat, lon, locationLabel = 'My Farm Location', stateLabel = '') {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia%2FKolkata&forecast_days=7`;

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Weather API HTTP ${res.status}`);
    const data = await res.json();

    if (!data.daily || !data.daily.time) {
      throw new Error('Incomplete forecast data');
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const forecast = [];

    for (let i = 0; i < data.daily.time.length && i < 7; i++) {
      const dateStr = data.daily.time[i];
      const d = new Date(dateStr);
      const isToday = i === 0;
      const isTomorrow = i === 1;
      const dayName = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : days[d.getDay()];
      const dateFormatted = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
      const minTemp = Math.round(data.daily.temperature_2m_min[i]);
      const weatherCode = data.daily.weather_code[i];
      const weatherInfo = interpretWeatherCode(weatherCode);
      const rainProb = data.daily.precipitation_probability_max?.[i] || 0;
      const precipSum = Math.round((data.daily.precipitation_sum?.[i] || 0) * 10) / 10;
      const windSpeed = Math.round(data.daily.wind_speed_10m_max?.[i] || 10);
      const uvIndex = data.daily.uv_index_max?.[i] || 5;

      let sprayStatus = 'Optimal';
      let sprayColor = 'green';
      let farmAction = 'Favorable meteorological window for field operations, weeding, and spraying.';

      if (rainProb > 40 || precipSum > 2) {
        sprayStatus = 'Avoid Spray';
        sprayColor = 'red';
        farmAction = `High precipitation chance (${rainProb}%). Do not apply foliar sprays or nitrogen top-dressing. Check field drainage.`;
      } else if (windSpeed > 16) {
        sprayStatus = 'Drift Risk';
        sprayColor = 'amber';
        farmAction = `Wind speed up to ${windSpeed} km/h. High risk of chemical drift onto neighboring crops. Spray only during calm early morning.`;
      } else if (maxTemp > 36) {
        sprayStatus = 'Heat Stress';
        sprayColor = 'amber';
        farmAction = `High daytime heat (${maxTemp}°C). Provide light evening irrigation to reduce evapotranspiration stress.`;
      }

      forecast.push({
        dayIndex: i,
        dayName,
        date: dateFormatted,
        fullDate: dateStr,
        maxTemp,
        minTemp,
        weatherCode,
        condition: weatherInfo.text,
        icon: weatherInfo.icon,
        rainChance: rainProb,
        precipitationMm: precipSum,
        windSpeedKm: windSpeed,
        uvIndex,
        sprayStatus,
        sprayColor,
        farmAction
      });
    }

    // Overall week summary
    const rainDays = forecast.filter(f => f.rainChance > 35).length;
    let summaryAdvisory = '';
    if (rainDays >= 2) {
      summaryAdvisory = `Rain forecasted on ${rainDays} days over the coming week. Farmer recommendation: Avoid water-logging, delay basal fertilizer top-dressing until showers pass.`;
    } else {
      summaryAdvisory = 'Largely stable weather conditions across the 7-day period. Excellent window for sowing, pesticide application, and sun-drying harvested grain.';
    }

    return {
      locationName: locationLabel,
      state: stateLabel,
      latitude: lat,
      longitude: lon,
      isLive: true,
      current: {
        temp: Math.round(data.current?.temperature_2m || forecast[0].maxTemp),
        humidity: Math.round(data.current?.relative_humidity_2m || 55),
        wind: Math.round(data.current?.wind_speed_10m || 10),
        condition: interpretWeatherCode(data.current?.weather_code || forecast[0].weatherCode).text
      },
      source: 'Live Open-Meteo weather forecast',
      lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      summaryAdvisory,
      forecast
    };
  } catch (err) {
    console.warn('Weather API fetch failed, switching to agromet fallback:', err);
    // Find closest hub or default to Karnal
    const matchedHub = INDIAN_AGRI_HUBS.find(h => h.name.includes(locationLabel)) || INDIAN_AGRI_HUBS[0];
    return generateOffline7DayForecast(matchedHub);
  }
}


// OpenWeather credentials are kept on the server. The browser only calls these app endpoints.
export async function fetchOpenWeatherForecast(lat, lon, locationLabel = 'My Farm Location', stateLabel = '') {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon), name: locationLabel, state: stateLabel });
  const response = await fetch(`/api/weather/forecast?${params}`, { credentials: 'include', signal: AbortSignal.timeout(18000) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Weather service returned ${response.status}.`);
  return body;
}

export async function searchOpenWeatherLocations(query) {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`/api/weather/geocode?${params}`, { credentials: 'include', signal: AbortSignal.timeout(15000) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Location search returned ${response.status}.`);
  return body.locations || [];
}
