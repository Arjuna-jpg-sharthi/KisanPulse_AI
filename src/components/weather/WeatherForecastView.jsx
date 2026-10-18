import React, { useState, useEffect } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Wind,
  Droplets,
  Compass,
  MapPin,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import {
  INDIAN_AGRI_HUBS,
  fetchOpenWeatherForecast,
  searchOpenWeatherLocations,
  fetch7DayWeather,
  generateOffline7DayForecast
} from '../../services/weatherService';
import { useLanguage } from '../../i18n/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';
import { Card, CardHeader, CardBody } from '../shared/Card';
import { Button } from '../shared/Button';

// Weather Icon component mapper
function WeatherIcon({ name, size = 28, className = '' }) {
  switch (name) {
    case 'Sun':
      return <Sun size={size} className={className} style={{ color: '#eab308' }} />;
    case 'CloudSun':
      return <CloudSun size={size} className={className} style={{ color: '#f59e0b' }} />;
    case 'Cloud':
      return <Cloud size={size} className={className} style={{ color: '#64748b' }} />;
    case 'CloudRain':
      return <CloudRain size={size} className={className} style={{ color: '#0284c7' }} />;
    case 'CloudDrizzle':
      return <CloudDrizzle size={size} className={className} style={{ color: '#38bdf8' }} />;
    case 'CloudLightning':
      return <CloudLightning size={size} className={className} style={{ color: '#7c3aed' }} />;
    case 'CloudFog':
      return <CloudFog size={size} className={className} style={{ color: '#94a3b8' }} />;
    default:
      return <Sun size={size} className={className} style={{ color: '#eab308' }} />;
  }
}

export function WeatherForecastView({ onNavigate }) {
  const { t, language } = useLanguage();
  const { isOffline } = useNetwork();
  const isHi = language === 'hi';

  const [selectedHubId, setSelectedHubId] = useState('karnal');
  const [weatherData, setWeatherData] = useState(() => generateOffline7DayForecast(INDIAN_AGRI_HUBS[0]));
  const [loading, setLoading] = useState(false);
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [locationLabel, setLocationLabel] = useState(INDIAN_AGRI_HUBS[0].name);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [openWeatherError, setOpenWeatherError] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [locationSearchError, setLocationSearchError] = useState('');
  const [searchingLocations, setSearchingLocations] = useState(false);

  const setWeatherAndShareWithAssistant = (data) => {
    setWeatherData(data);
    try {
      localStorage.setItem('kisanpulse_latest_weather', JSON.stringify({
        locationName: data.locationName,
        state: data.state,
        isLive: data.isLive,
        isGoogle: data.isGoogle,
        lastUpdated: data.lastUpdated,
        summaryAdvisory: data.summaryAdvisory,
        current: data.current,
        forecast: data.forecast?.slice(0, 7)
      }));
    } catch (error) {
      console.warn('Could not share forecast with the assistant:', error);
    }
  };

  const fetchForecast = async (lat, lon, name, state) => {
    try {
      const data = await fetchOpenWeatherForecast(lat, lon, name, state);
      setOpenWeatherError('');
      return data;
    } catch (error) {
      setOpenWeatherError(error.message || 'OpenWeather is unavailable. Showing backup weather data.');
      return fetch7DayWeather(lat, lon, name, state);
    }
  };

  const handleSearchLocation = async (event) => {
    event.preventDefault();
    const query = locationSearch.trim();
    if (query.length < 2) {
      setLocationSearchError(isHi ? 'शहर या जिले के कम से कम दो अक्षर लिखें।' : 'Enter at least two letters for a city or district.');
      return;
    }
    setSearchingLocations(true);
    setLocationSearchError('');
    setLocationResults([]);
    try {
      const results = await searchOpenWeatherLocations(query);
      setLocationResults(results);
      if (!results.length) setLocationSearchError(isHi ? 'भारत में यह स्थान नहीं मिला।' : 'No matching location found in India.');
    } catch (error) {
      setLocationSearchError(error.message || (isHi ? 'स्थान खोजा नहीं जा सका।' : 'Could not search for that location.'));
    } finally {
      setSearchingLocations(false);
    }
  };

  const chooseSearchedLocation = async (location) => {
    setLocationResults([]);
    setLocationSearch(location.name);
    const hub = { ...location, id: `custom-${location.lat}-${location.lon}`, majorCrops: '' };
    await loadWeatherForHub(hub);
  };

  // Load weather for selected hub
  const loadWeatherForHub = async (hub) => {
    setLoading(true);
    try {
      if (isOffline) {
        setWeatherAndShareWithAssistant(generateOffline7DayForecast(hub));
      } else {
        const res = await fetchForecast(hub.lat, hub.lon, hub.name, hub.state);
        setWeatherAndShareWithAssistant(res);
      }
      setLocationLabel(hub.name);
    } catch (e) {
      setWeatherAndShareWithAssistant(generateOffline7DayForecast(hub));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hub = INDIAN_AGRI_HUBS.find(h => h.id === selectedHubId) || INDIAN_AGRI_HUBS[0];
    loadWeatherForHub(hub);
  }, [selectedHubId, isOffline]);

  // GPS Auto-detect
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert(isHi ? 'आपके ब्राउज़र में GPS सपोर्ट नहीं है' : 'Geolocation is not supported by your browser');
      return;
    }

    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetchForecast(
            latitude,
            longitude,
            isHi ? `मेरा खेत (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)` : `My Farm (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`,
            'GPS Coordinates'
          );
          setWeatherAndShareWithAssistant(res);
          setLocationLabel(res.locationName);
        } catch (err) {
          alert(isHi ? 'मौसम डेटा प्राप्त नहीं हो सका।' : 'Could not fetch weather for current GPS coordinates.');
        } finally {
          setGpsDetecting(false);
        }
      },
      (err) => {
        setGpsDetecting(false);
        alert(isHi ? 'GPS अनुमति अस्वीकार या अनुपलब्ध है। कृपया नीचे दी गई सूची से अपना जिला चुनें।' : 'GPS location permission denied or unavailable. Please select your nearest agricultural hub.');
      },
      { timeout: 8000 }
    );
  };

  const selectedDay = weatherData.forecast?.[selectedDayIndex] || weatherData.forecast?.[0];

  return (
    <div className="kp-weather-view" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* View Header with Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--kp-primary-50)', color: 'var(--kp-primary-800)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>
            <Sparkles size={14} />
            <span>{weatherData.isOpenWeather ? (isHi ? 'अगले 5 दिनों का मौसम पूर्वानुमान' : '5-Day Weather Forecast') : (isHi ? 'अगले 7 दिनों का मौसम पूर्वानुमान' : '7-Day Weather Forecast')}</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: 'var(--kp-text-primary)' }}>
            {t('weatherAdvisoryTitle', '7-Day Agri-Weather & Spray Forecast')}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.92rem', color: 'var(--kp-text-muted)' }}>
            {isHi ? 'तापमान, वर्षा संभावना, हवा और फसलों के लिए छिड़काव सलाह' : 'Temperature, rain probability, wind, and crop spray guidance for your location.'}
          </p>
        </div>

        {/* Location selector and GPS detect button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="md"
            icon={<MapPin size={16} />}
            onClick={handleDetectGPS}
            disabled={gpsDetecting}
            style={{ borderColor: 'var(--kp-primary-600)', color: 'var(--kp-primary-700)', background: '#ffffff' }}
          >
            {gpsDetecting ? (isHi ? 'GPS खोज रहा है...' : 'Detecting GPS...') : (isHi ? '📍 खेत लोकेशन (GPS)' : '📍 Detect My Farm')}
          </Button>

          <form onSubmit={handleSearchLocation} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input aria-label={isHi ? 'शहर या जिला खोजें' : 'Search city or district'} value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} placeholder={isHi ? 'शहर / जिला खोजें' : 'Search city / district'} style={{ minWidth: 170, padding: '10px 12px', borderRadius: 'var(--kp-radius-md)', border: '1px solid var(--kp-border)' }} />
            <button type="submit" disabled={searchingLocations || isOffline} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 12px', border: 0, borderRadius: 'var(--kp-radius-md)', background: '#166534', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: searchingLocations || isOffline ? 0.6 : 1 }}><Search size={15} />{searchingLocations ? (isHi ? 'खोज रहे हैं…' : 'Searching…') : (isHi ? 'खोजें' : 'Search')}</button>
          </form>
          <select
            value={selectedHubId}
            onChange={(e) => setSelectedHubId(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--kp-radius-md)',
              border: '1.5px solid var(--kp-border)',
              background: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: '600',
              color: 'var(--kp-text-primary)',
              cursor: 'pointer'
            }}
          >
            {INDIAN_AGRI_HUBS.map(hub => (
              <option key={hub.id} value={hub.id}>
                {hub.name} ({hub.state})
              </option>
            ))}
          </select>

          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={15} className={loading ? 'kp-spin' : ''} />}
            onClick={() => {
              const hub = INDIAN_AGRI_HUBS.find(h => h.id === selectedHubId) || INDIAN_AGRI_HUBS[0];
              loadWeatherForHub(hub);
            }}
            title="Refresh weather"
          />
          {locationSearchError && <span role="alert" style={{ flexBasis: '100%', color: '#b91c1c', fontSize: 12 }}>{locationSearchError}</span>}
          {locationResults.length > 0 && <div style={{ flexBasis: '100%', display: 'grid', gap: 5, padding: 8, border: '1px solid var(--kp-border)', borderRadius: 10, background: '#fff' }}>
            {locationResults.map((location, index) => <button type="button" key={`${location.lat}-${location.lon}-${index}`} onClick={() => chooseSearchedLocation(location)} style={{ textAlign: 'left', padding: '9px 11px', border: 0, borderRadius: 7, background: '#f8fafc', color: 'var(--kp-text-primary)', cursor: 'pointer' }}>{[location.name, location.state, location.country].filter(Boolean).join(', ')}</button>)}
          </div>}
        </div>
      </div>

      {/* Status Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 60%, #075985 100%)',
        borderRadius: 'var(--kp-radius-xl)',
        padding: '24px 28px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.3)'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: '700'
            }}>
              {weatherData.isLive ? '🟢 ' + (isHi ? 'लाइव मौसम पूर्वानुमान' : 'Live Weather Forecast') : '📋 ' + (isHi ? 'ऑफ़लाइन क्षेत्रीय अनुमान' : 'Offline Regional Estimate')}
            </span>
            <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>
              📍 {locationLabel} • {weatherData.lastUpdated}
            </span>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px' }}>
            {isHi ? 'कृषि मौसम एवं स्प्रे परामर्श' : 'Weekly Agricultural Advisory'}
          </h3>
          <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', opacity: 0.95 }}>
            {weatherData.summaryAdvisory}
          </p>
        </div>

          {!weatherData.isLive && (
            <p style={{ margin: '12px 0 0', padding: '10px 12px', borderRadius: '8px', background: '#fff7ed', color: '#9a3412', fontSize: '0.82rem' }}>
              {isHi
                ? 'इंटरनेट उपलब्ध नहीं है। नीचे दिया गया मौसम आपके क्षेत्र का सामान्य अनुमान है, लाइव पूर्वानुमान नहीं।'
                : 'You are offline. The figures below are a regional estimate, not a live forecast.'}
            </p>
          )}

        {weatherData.current && (
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--kp-radius-lg)',
            padding: '16px 22px',
            textAlign: 'center',
            minWidth: '170px'
          }}>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', lineHeight: 1 }}>
              {weatherData.current.temp}°C
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', marginTop: '4px' }}>
              {weatherData.current.condition}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '6px' }}>
              💨 {weatherData.current.wind} km/h • 💧 {weatherData.current.humidity}% {isHi ? 'नमी' : 'Humidity'}
            </div>
          </div>
        )}
      </div>

      {openWeatherError && !isOffline && (
        <div role="status" style={{ padding: '10px 14px', border: '1px solid #fed7aa', borderRadius: 9, background: '#fff7ed', color: '#9a3412', fontSize: 13 }}>
          {isHi ? 'OpenWeather उपलब्ध नहीं है:' : 'OpenWeather unavailable:'} {openWeatherError} {isHi ? 'बैकअप पूर्वानुमान दिखाया जा रहा है।' : 'Showing backup weather data.'}
        </div>
      )}

      {/* 7-DAY FORECAST CAROUSEL / CARDS GRID */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: 'var(--kp-text-primary)' }}>
            {weatherData.isOpenWeather ? (isHi ? 'अगले 5 दिनों का दिन-प्रतिदिन पूर्वानुमान' : 'Next 5 Days') : (isHi ? 'अगले 7 दिनों का दिन-प्रतिदिन पूर्वानुमान' : 'Next 7 Days Day-by-Day Forecast')}
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--kp-text-muted)' }}>
            {isHi ? 'विस्तार से देखने के लिए किसी भी दिन पर क्लिक करें' : 'Click any day to view detailed spray & field advisory'}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
          gap: '12px'
        }}>
          {weatherData.forecast?.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <div
                key={day.fullDate || idx}
                onClick={() => setSelectedDayIndex(idx)}
                style={{
                  background: isSelected ? 'var(--kp-primary-50)' : '#ffffff',
                  border: isSelected ? '2px solid var(--kp-primary-600)' : '1px solid var(--kp-border)',
                  borderRadius: 'var(--kp-radius-lg)',
                  padding: '14px 12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(22, 101, 52, 0.15)' : 'none'
                }}
              >
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: isSelected ? 'var(--kp-primary-800)' : 'var(--kp-text-primary)' }}>
                  {day.dayName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--kp-text-muted)', marginBottom: '8px' }}>
                  {day.date}
                </div>

                <div style={{ margin: '8px 0', display: 'flex', justifyContent: 'center' }}>
                  <WeatherIcon name={day.icon} size={32} />
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--kp-text-secondary)', marginBottom: '6px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {day.condition}
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--kp-text-primary)', marginBottom: '8px' }}>
                  {day.maxTemp}° <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--kp-text-muted)' }}>/ {day.minTemp}°</span>
                </div>

                {/* Rain probability chip */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: day.rainChance > 35 ? '#e0f2fe' : '#f1f5f9',
                  color: day.rainChance > 35 ? '#0369a1' : '#64748b',
                  fontWeight: '700',
                  marginBottom: '6px'
                }}>
                  <Droplets size={11} />
                  <span>{day.rainChance}%</span>
                </div>

                {/* Spray Window Status Badge */}
                <div>
                  <span style={{
                    display: 'block',
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    background: day.sprayColor === 'green' ? '#dcfce7' : day.sprayColor === 'red' ? '#fee2e2' : '#fef3c7',
                    color: day.sprayColor === 'green' ? '#15803d' : day.sprayColor === 'red' ? '#b91c1c' : '#b45309'
                  }}>
                    {day.sprayStatus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {weatherData.isGoogle && (
        <div translate="no" style={{ padding: '8px 12px', borderTop: '1px solid #e2e8f0', color: '#5e5e5e', fontFamily: 'Arial, sans-serif', fontSize: 12 }}>
          Source: Includes weather data from Google
        </div>
      )}

      {/* SELECTED DAY IN-DEPTH ADVISORY CARD */}
      {selectedDay && (
        <Card>
          <CardHeader
            icon={<Calendar size={20} />}
            title={`${selectedDay.dayName} (${selectedDay.date}) — ${isHi ? 'विस्तृत कृषि सलाह' : 'Detailed Field Operations Guidance'}`}
            subtitle={`${selectedDay.condition} • High: ${selectedDay.maxTemp}°C / Low: ${selectedDay.minTemp}°C`}
          />
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* Spray Window Analysis */}
              <div style={{
                padding: '16px',
                borderRadius: 'var(--kp-radius-lg)',
                border: `1.5px solid ${selectedDay.sprayColor === 'green' ? '#86efac' : selectedDay.sprayColor === 'red' ? '#fca5a5' : '#fde047'}`,
                background: selectedDay.sprayColor === 'green' ? '#f0fdf4' : selectedDay.sprayColor === 'red' ? '#fef2f2' : '#fffbeb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {selectedDay.sprayColor === 'green' ? (
                    <CheckCircle2 size={20} style={{ color: '#15803d' }} />
                  ) : selectedDay.sprayColor === 'red' ? (
                    <XCircle size={20} style={{ color: '#b91c1c' }} />
                  ) : (
                    <AlertTriangle size={20} style={{ color: '#b45309' }} />
                  )}
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                    {isHi ? 'छिड़काव सुरक्षा स्थिति' : 'Chemical Spray Window'}: {selectedDay.sprayStatus}
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: '1.5' }}>
                  {selectedDay.farmAction}
                </p>
                <div style={{ marginTop: '12px', fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '14px' }}>
                  <span>💨 {isHi ? 'हवा की गति' : 'Wind'}: <strong>{selectedDay.windSpeedKm} km/h</strong></span>
                  <span>🌧️ {isHi ? 'वर्षा सम्भावना' : 'Rain'}: <strong>{selectedDay.rainChance}% ({selectedDay.precipitationMm} mm)</strong></span>
                </div>
              </div>

              {/* Irrigation and Field Tasks */}
              <div style={{
                padding: '16px',
                borderRadius: 'var(--kp-radius-lg)',
                border: '1px solid var(--kp-border)',
                background: '#f8fafc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Droplets size={20} style={{ color: 'var(--kp-primary-600)' }} />
                  <strong style={{ fontSize: '1rem', color: 'var(--kp-text-primary)' }}>
                    {isHi ? 'सिंचाई एवं अंतर-कृषि कार्य' : 'Irrigation & Cultural Practices'}
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--kp-text-secondary)', lineHeight: '1.5' }}>
                  {selectedDay.rainChance > 40
                    ? (isHi
                        ? 'वर्षा की सम्भावना अधिक है। ट्यूबवेल या नहर से सिंचाई न करें ताकि खेत में जलभराव और जड़ों का सड़ना न हो।'
                        : 'Significant rainfall probability. Delay scheduled canal or tube-well irrigation to conserve water and prevent root hypoxia.')
                    : (isHi
                        ? 'मौसम शुष्क और स्थिर रहेगा। गेहूं की CRI अवस्था या सरसों में आवश्यकतानुसार हल्की सिंचाई कर सकते हैं।'
                        : 'Weather is stable and dry. Optimal window for applying light irrigation at critical crop stages (e.g. CRI in wheat or flowering in pulses).')}
                </p>
              </div>
            </div>

            {/* Quick Links to Farming & Mandi */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--kp-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '0.84rem', color: 'var(--kp-text-muted)' }}>
                {isHi ? 'मौसम के अनुसार फसल प्रबंधन या मंडी भाव देखें' : 'Plan your harvest or crop care based on this forecast:'}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('farming')}
                >
                  {isHi ? 'फसल स्वास्थ्य गाइड खोलें' : 'Open Crop Health'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('mandi')}
                >
                  {isHi ? 'स्मार्ट मंडी भाव देखें' : 'Check Mandi Rates'}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default WeatherForecastView;
