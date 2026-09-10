/**
 * OpenWeatherMap API integration.
 * Free tier: https://openweathermap.org/api/one-call-3
 * Demo data shown when no API key is configured.
 */

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY as string | undefined;

// Default to Chennai coastal district coordinates
const DEFAULT_LAT = 13.05;
const DEFAULT_LNG = 80.225;

export interface WeatherData {
  temp: number;          // Celsius
  feelsLike: number;
  humidity: number;
  windSpeed: number;     // m/s
  windDeg: number;
  description: string;
  icon: string;          // OWM icon code
  condition: string;     // main weather condition
  visibility: number;   // meters
  pressure: number;     // hPa
  location: string;
  updatedAt: Date;
  isDemo: boolean;
}

export type DisasterRisk = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export function assessDisasterRisk(weather: WeatherData): { risk: DisasterRisk; reason: string } {
  const cond = weather.condition.toLowerCase();
  const wind = weather.windSpeed;
  const humid = weather.humidity;

  if (cond.includes('thunderstorm') || wind > 17 || (cond.includes('rain') && wind > 10)) {
    return { risk: 'CRITICAL', reason: 'Severe storm/flood conditions' };
  }
  if (cond.includes('heavy rain') || wind > 10 || cond.includes('squall')) {
    return { risk: 'HIGH', reason: 'Heavy rain / high winds' };
  }
  if (cond.includes('rain') || wind > 7 || humid > 90) {
    return { risk: 'MODERATE', reason: 'Rain activity / elevated humidity' };
  }
  return { risk: 'LOW', reason: 'Conditions nominal' };
}

const DEMO_WEATHER: WeatherData = {
  temp: 31,
  feelsLike: 36,
  humidity: 78,
  windSpeed: 4.2,
  windDeg: 220,
  description: 'Partly cloudy',
  icon: '02d',
  condition: 'Clouds',
  visibility: 10000,
  pressure: 1006,
  location: 'Chennai, Coastal District',
  updatedAt: new Date(),
  isDemo: true,
};

export async function fetchWeather(
  lat = DEFAULT_LAT,
  lng = DEFAULT_LNG,
): Promise<WeatherData> {
  if (!WEATHER_API_KEY) {
    return { ...DEMO_WEATHER, updatedAt: new Date() };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OWM ${res.status}`);
    const d = await res.json();

    return {
      temp: Math.round(d.main.temp),
      feelsLike: Math.round(d.main.feels_like),
      humidity: d.main.humidity,
      windSpeed: d.wind.speed,
      windDeg: d.wind.deg ?? 0,
      description: d.weather[0]?.description ?? '',
      icon: d.weather[0]?.icon ?? '01d',
      condition: d.weather[0]?.main ?? '',
      visibility: d.visibility ?? 10000,
      pressure: d.main.pressure,
      location: `${d.name}, Tamil Nadu`,
      updatedAt: new Date(),
      isDemo: false,
    };
  } catch (err) {
    console.warn('[Weather] Failed to fetch:', err);
    return { ...DEMO_WEATHER, updatedAt: new Date() };
  }
}

export function windDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}
