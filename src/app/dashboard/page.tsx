'use client';

import { useEffect, useState, useRef } from 'react';
import { getSession } from '@/lib/auth';
import { getPlants, quickDiagnose } from '@/lib/plant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, CloudRain, Sun, Thermometer, Droplets, Wind, MessageSquare, Stethoscope, BarChart3, Leaf, AlertTriangle, CheckCircle, MapPin, Calendar, TrendingUp, Navigation, Loader2, X, Upload, RefreshCw } from 'lucide-react';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { formatMessage } from '@/lib/formatter';

interface WeatherData {
  location: string;
  current: {
    temperature: number;
    humidity: number;
    condition: string;
    rainChance: number;
    windSpeed: number;
    precipitation: number;
    cloudCover: number;
  };
  forecast: Array<{
    day: string;
    date: string;
    temp: { min: number; max: number };
    condition: string;
    rainChance: number;
    precipitation: number;
    cloudCover: number;
    windSpeed: number;
    icon: any;
  }>;
}

interface Diagnosis {
  id: string;
  result: string;
  confidence: number;
  notes: string;
  photo_url: string;
  checked_at: string;
}

interface Plant {
  id: string;
  name: string;
  description: string;
  diagnosis: Diagnosis[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ username: string; token?: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<Diagnosis | null>(null);
  const [showDiagnosisDialog, setShowDiagnosisDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [weatherAnalysis, setWeatherAnalysis] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getSession();
      if (session) {
        setUser(session);
        fetchPlants(session.token);
        fetchWeather();
      } else {
        window.location.href = '/auth/login';
      }
    };

    const fetchPlants = async (token: string) => {
      try {
        const plantsData = await getPlants(token);
        setPlants(plantsData);
      } catch (error) {
        console.error('Failed to fetch plants:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);
        setLocationError(null);

        let latitude: number = -6.2088;
        let longitude: number = 106.8456;
        let locationName = 'Lokasi Anda';

        // Method 1: Try browser geolocation first (most reliable)
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error('Geolocation tidak didukung browser'));
              return;
            }

            const timeout = setTimeout(() => {
              reject(new Error('Timeout mendapatkan lokasi'));
            }, 10000);

            navigator.geolocation.getCurrentPosition(
              (pos) => {
                clearTimeout(timeout);
                resolve(pos);
              },
              (error) => {
                clearTimeout(timeout);
                reject(new Error(`Geolocation error: ${error.message}`));
              },
              {
                enableHighAccuracy: false,
                timeout: 8000,
                maximumAge: 300000, // 5 minutes cache
              }
            );
          });

          latitude = position.coords.latitude;
          longitude = position.coords.longitude;

          // Try to get location name from reverse geocoding
          try {
            const locationController = new AbortController();
            const locationTimeout = setTimeout(() => locationController.abort(), 8000);

            const locationResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=id`, {
              signal: locationController.signal,
              headers: {
                'User-Agent': 'PlantDashboard/1.0 (your-email@example.com)',
              },
            });

            clearTimeout(locationTimeout);

            if (locationResponse.ok) {
              const locationData = await locationResponse.json();
              if (locationData.address) {
                const { city, county, state, country } = locationData.address;
                locationName = city || county || state || country || 'Lokasi Anda';
              }
            }
          } catch (locationError) {
            console.log('Gagal mendapatkan nama lokasi:', locationError);
            // Use coordinates as fallback
            locationName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          }
        } catch (geoError) {
          console.error('Geolocation gagal:', geoError);

          try {
            // Try multiple IP geolocation services
            const ipServices = [
              {
                url: 'https://api.ipify.org?format=json',
                parser: async (ip: string) => {
                  // Use ip-api.com which is more reliable for CORS
                  const response = await fetch(`http://ip-api.com/json/${ip}?fields=lat,lon,city,regionName,country`);
                  if (!response.ok) throw new Error('IP API failed');
                  const data = await response.json();
                  return {
                    latitude: data.lat,
                    longitude: data.lon,
                    location: `${data.city}, ${data.regionName}, ${data.country}`,
                  };
                },
              },
              {
                // Alternative: try with current IP without explicit IP lookup
                url: 'http://ip-api.com/json/?fields=lat,lon,city,regionName,country',
                parser: async () => {
                  const response = await fetch('http://ip-api.com/json/?fields=lat,lon,city,regionName,country');
                  if (!response.ok) throw new Error('IP API failed');
                  const data = await response.json();
                  return {
                    latitude: data.lat,
                    longitude: data.lon,
                    location: `${data.city}, ${data.regionName}, ${data.country}`,
                  };
                },
              },
            ];

            let ipSuccess = false;

            for (const service of ipServices) {
              try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000);

                if (service.url.includes('ipify')) {
                  const ipResponse = await fetch(service.url, { signal: controller.signal });
                  clearTimeout(timeout);

                  if (!ipResponse.ok) continue;
                  const ipData = await ipResponse.json();
                  const result = await service.parser(ipData.ip);

                  latitude = result.latitude;
                  longitude = result.longitude;
                  locationName = result.location;
                } else {
                  clearTimeout(timeout);
                  const result = await service.parser('');
                  latitude = result.latitude;
                  longitude = result.longitude;
                  locationName = result.location;
                }

                ipSuccess = true;
                break;
              } catch (serviceError) {
                console.log(`Service ${service.url} failed:`, serviceError);
                continue;
              }
            }

            if (!ipSuccess) {
              throw new Error('Semua layanan IP geolocation gagal');
            }
          } catch (ipError) {
            console.error('IP geolocation juga gagal:', ipError);

            // Method 3: Use default location (Jakarta, Indonesia)
            console.log('Menggunakan lokasi default Jakarta');
            latitude = -6.2088;
            longitude = 106.8456;
            locationName = 'Jakarta, Indonesia (Default)';
          }
        }

        // Fetch weather data
        const weatherController = new AbortController();
        const weatherTimeout = setTimeout(() => weatherController.abort(), 15000);

        try {
          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain,cloud_cover,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,cloud_cover_mean,wind_speed_10m_max&timezone=auto&forecast_days=7`,
            {
              signal: weatherController.signal,
              // Add headers to help with CORS if needed
              headers: {
                Accept: 'application/json',
              },
            }
          );

          clearTimeout(weatherTimeout);

          if (!weatherResponse.ok) {
            throw new Error(`Weather API error: ${weatherResponse.status} ${weatherResponse.statusText}`);
          }

          const data = await weatherResponse.json();

          if (!data || !data.current) {
            throw new Error('Invalid weather data received');
          }

          // Process current weather
          const current = data.current;
          const currentCondition = getWeatherCondition(current.rain || 0, current.cloud_cover || 0, current.wind_speed_10m || 0);
          // Process forecast
          const daily = data.daily || {};
          const forecastTimes = daily.time || [];

          if (forecastTimes.length === 0) {
            throw new Error('No forecast data available');
          }

          const forecast = forecastTimes
            .slice(0, 3)
            .map((date: string, index: number) => {
              const dayDate = new Date(date + 'T00:00:00'); // Add time to prevent timezone issues
              if (isNaN(dayDate.getTime())) {
                console.warn('Invalid forecast date:', date);
                return null;
              }

              const dayName = getDayName(dayDate, index);
              const formattedDate = dayDate.toLocaleDateString('id-ID', {
                month: 'short',
                day: 'numeric',
              });

              const precipitation = daily.precipitation_sum?.[index] ?? 0;
              const cloudCover = daily.cloud_cover_mean?.[index] ?? 0;
              const windSpeed = daily.wind_speed_10m_max?.[index] ?? 0;
              const tempMin = daily.temperature_2m_min?.[index] ?? 0;
              const tempMax = daily.temperature_2m_max?.[index] ?? 0;

              const condition = getWeatherCondition(precipitation, cloudCover, windSpeed);

              return {
                day: dayName,
                date: formattedDate,
                temp: {
                  min: Math.round(tempMin),
                  max: Math.round(tempMax),
                },
                condition,
                rainChance: precipitation > 0 ? Math.min(100, Math.round(precipitation * 10)) : 0,
                precipitation: Math.round(precipitation * 10) / 10,
                cloudCover: Math.round(cloudCover),
                windSpeed: Math.round(windSpeed),
                icon: getWeatherIcon(condition),
              };
            })
            .filter((item: null): item is NonNullable<typeof item> => item !== null);

          if (forecast.length === 0) {
            throw new Error('No valid forecast entries');
          }

          setWeatherData({
            location: locationName,
            current: {
              temperature: Math.round(current.temperature_2m || 0),
              humidity: Math.round(current.relative_humidity_2m || 0),
              condition: currentCondition,
              rainChance: (current.rain || 0) > 0 ? Math.min(100, Math.round((current.rain || 0) * 10)) : 0,
              windSpeed: Math.round(current.wind_speed_10m || 0),
              precipitation: Math.round((current.rain || 0) * 10) / 10,
              cloudCover: Math.round(current.cloud_cover || 0),
            },
            forecast,
          });
        } catch (weatherError) {
          console.error('Error fetching weather:', weatherError);
          throw new Error(`Gagal memuat data cuaca: ${weatherError instanceof Error ? weatherError.message : 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error in fetchWeather:', error);
        setLocationError(error instanceof Error ? error.message : 'Gagal memuat data cuaca');
      } finally {
        setWeatherLoading(false);
      }
    };

    const getWeatherCondition = (precip: number, cloud: number, wind: number): string => {
      // Ensure all values are numbers and handle NaN
      precip = Number(precip) || 0;
      cloud = Number(cloud) || 0;
      wind = Number(wind) || 0;

      let condition = '';

      if (precip > 10) {
        condition = 'Hujan lebat';
      } else if (precip > 2) {
        condition = 'Hujan ringan';
      } else if (cloud > 80) {
        condition = 'Mendung';
      } else if (cloud > 50) {
        condition = 'Berawan';
      } else if (cloud > 20) {
        condition = 'Cerah berawan';
      } else {
        condition = 'Cerah';
      }

      if (wind > 25) {
        condition += ' dan berangin kencang';
      } else if (wind > 15) {
        condition += ' dan berangin';
      }

      return condition;
    };

    const getWeatherIcon = (condition: string) => {
      const lowerCondition = condition.toLowerCase();
      if (lowerCondition.includes('hujan lebat')) return CloudRain;
      if (lowerCondition.includes('hujan ringan')) return CloudRain;
      if (lowerCondition.includes('hujan')) return CloudRain;
      if (lowerCondition.includes('mendung')) return Cloud;
      if (lowerCondition.includes('berawan')) return Cloud;
      return Sun;
    };

    const getDayName = (date: Date, index: number) => {
      if (index === 0) return 'Hari ini';
      if (index === 1) return 'Besok';
      if (index === 2) return 'Lusa';

      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      return days[date.getDay()];
    };

    fetchUser();

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleChatbot = () => {
    window.location.href = '/dashboard/chatbot';
  };

  const handleQuickDiagnosis = () => {
    setShowDiagnosisDialog(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleQuickDiagnoseSubmit = async () => {
    if (!selectedFile) return;

    try {
      setIsDiagnosing(true);
      const session = await getSession();
      if (!session || !session.token) {
        throw new Error('Session tidak ditemukan. Silakan login ulang.');
      }
      const diagnosis = await quickDiagnose(session.token, selectedFile);

      setDiagnosisResult(diagnosis);
      setShowDiagnosisDialog(false);
      setShowResultDialog(true);
    } catch (error) {
      console.error('Failed to perform quick diagnosis:', error);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleWeatherAnalysis = async () => {
    if (!weatherData || isAnalyzing) return;

    try {
      // Reset state sebelum memulai analisis baru
      setIsAnalyzing(true);
      setAnalysisError(null);
      setWeatherAnalysis(null);
      setShowAnalysisModal(true);

      // Format data sesuai dengan yang diharapkan backend
      const requestData = {
        location: weatherData.location,
        current: {
          temperature: weatherData.current.temperature,
          humidity: weatherData.current.humidity,
          condition: weatherData.current.condition,
          rainChance: weatherData.current.rainChance,
          windSpeed: weatherData.current.windSpeed,
          precipitation: weatherData.current.precipitation,
          cloudCover: weatherData.current.cloudCover,
        },
        forecast: weatherData.forecast.map((day) => ({
          day: day.day,
          date: day.date,
          temp: {
            min: day.temp.min,
            max: day.temp.max,
          },
          condition: day.condition,
          rainChance: day.rainChance,
          precipitation: day.precipitation,
          cloudCover: day.cloudCover,
          windSpeed: day.windSpeed,
        })),
      };

      // Kirim request ke backend
      const response = await fetch(`${API_URL}/ai/weather/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setWeatherAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing weather:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Terjadi kesalahan saat menganalisis cuaca');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user || loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Memuat Dashboard...</p>
        </div>
      </div>
    );

  // Calculate plant statistics
  const totalPlants = plants.length;
  const undiagnosedPlants = plants.filter((plant) => plant.diagnosis.length === 0).length;

  // Get recent diagnoses (last 3)
  const allDiagnoses = plants
    .flatMap((plant) =>
      plant.diagnosis.map((d) => ({
        ...d,
        plantName: plant.name,
      }))
    )
    .sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime());

  const recentDiagnoses = allDiagnoses.slice(0, 3);

  // Count healthy and sick plants
  const healthyPlants = plants.filter((plant) => {
    if (plant.diagnosis.length === 0) return false;
    const latestDiagnosis = plant.diagnosis.reduce((latest, current) => (new Date(current.checked_at) > new Date(latest.checked_at) ? current : latest));
    return latestDiagnosis.result.toLowerCase().includes('sehat');
  }).length;

  const sickPlants = plants.filter((plant) => {
    if (plant.diagnosis.length === 0) return false;
    const latestDiagnosis = plant.diagnosis.reduce((latest, current) => (new Date(current.checked_at) > new Date(latest.checked_at) ? current : latest));
    return !latestDiagnosis.result.toLowerCase().includes('sehat');
  }).length;

  const isHealthyDiagnosis = (result: string) => {
    if (!result) return false;
    return result.toLowerCase().includes('healthy') || result.toLowerCase().includes('sehat') || result.toLowerCase().includes('normal');
  };
  const healthyPercentage = totalPlants > 0 ? Math.round((healthyPlants / totalPlants) * 100) : 0;
  const sickPercentage = totalPlants > 0 ? Math.round((sickPlants / totalPlants) * 100) : 0;
  const undiagnosedPercentage = totalPlants > 0 ? Math.round((undiagnosedPlants / totalPlants) * 100) : 0;

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50">
      <div className="w-full h-full p-6 overflow-auto flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Selamat datang, {user.username}! 🌱</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {currentTime.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 h-auto">
          {/* Weather Section */}
          <div className="lg:col-span-2 h-full">
            <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">Prakiraan Cuaca</CardTitle>
                    <CardDescription className="text-blue-100 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {weatherData?.location || 'Memuat lokasi...'}
                    </CardDescription>
                    {locationError && <p className="text-xs text-yellow-200 mt-1">{locationError}</p>}
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleWeatherAnalysis} className="bg-white/20 hover:bg-white/30 text-white border-white/30" disabled={isAnalyzing}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analisis Cuaca
                  </Button>{' '}
                </div>
              </CardHeader>
              <CardContent>
                {weatherLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                ) : weatherData ? (
                  <>
                    {/* Current Weather */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-white/20 rounded-full">
                            <Thermometer className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-blue-100">Suhu</p>
                            <p className="text-2xl font-bold">{weatherData.current.temperature}°C</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-white/20 rounded-full">
                            <Droplets className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-blue-100">Kelembaban</p>
                            <p className="text-xl font-semibold">{weatherData.current.humidity}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-white/20 rounded-full">
                            <CloudRain className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-blue-100">Curah Hujan</p>
                            <p className="text-xl font-semibold">{weatherData.current.precipitation} mm</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-white/20 rounded-full">
                            <Wind className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-blue-100">Kecepatan Angin</p>
                            <p className="text-xl font-semibold">{weatherData.current.windSpeed} km/h</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3-Day Forecast */}
                    <div className="grid grid-cols-3 gap-4">
                      {weatherData.forecast.map((day, index) => {
                        const IconComponent = day.icon;
                        return (
                          <div key={index} className="bg-white/10 rounded-lg p-4 text-center">
                            <p className="text-sm text-blue-100 mb-1">{day.day}</p>
                            <p className="text-xs text-blue-200 mb-3">{day.date}</p>
                            <IconComponent className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-xs text-blue-100 mb-2">{day.condition}</p>
                            <p className="text-sm font-semibold">
                              {day.temp.min}° - {day.temp.max}°
                            </p>
                            <p className="text-xs text-blue-200 mt-1">{day.precipitation > 0 ? `${day.precipitation} mm hujan` : 'Tidak hujan'}</p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-blue-100">Gagal memuat data cuaca</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 h-full flex flex-col">
            {/* Quick Diagnosis */}
            {/* Quick Diagnosis */}
            <Card className="shadow-lg border-0 bg-gradient-to-r from-red-500 to-red-600 text-white flex-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Diagnosis Cepat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-100 mb-4 text-sm">Foto 1 daun dari tanamanmu untuk diagnosis instan</p>
                <Button onClick={handleQuickDiagnosis} className="w-full bg-white text-red-600 hover:bg-red-50">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Mulai Diagnosis
                </Button>
              </CardContent>
            </Card>
            {/* Chatbot */}
            <Card className="shadow-lg border-0 bg-gradient-to-r from-green-500 to-green-600 text-white flex-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Konsultasi Cepat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-100 mb-4 text-sm">"Ada masalah apa dengan tanamanmu hari ini?"</p>
                <Button onClick={handleChatbot} className="w-full bg-white text-green-600 hover:bg-green-50">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Tanya Pak Tani
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Plant Statistics */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          {/* Statistics Overview */}
          <Card className="shadow-lg border-0 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Statistik Tanaman
              </CardTitle>
              <CardDescription>Ringkasan kesehatan tanaman Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-2">
                    <Leaf className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{totalPlants}</p>
                  <p className="text-sm text-gray-600">Total Tanaman</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{healthyPlants}</p>
                  <p className="text-sm text-gray-600">Sehat</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-2">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{sickPlants}</p>
                  <p className="text-sm text-gray-600">Sakit</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-2">
                    <Leaf className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-600">{undiagnosedPlants}</p>
                  <p className="text-sm text-gray-600">Belum Didiagnosis</p>
                </div>
              </div>

              {/* Health Percentage */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tanaman Sehat</span>
                  <span className="text-sm font-semibold text-green-600">{healthyPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${healthyPercentage}%` }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Perlu Perhatian</span>
                  <span className="text-sm font-semibold text-red-600">{sickPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full transition-all duration-300" style={{ width: `${sickPercentage}%` }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Belum Didiagnosis</span>
                  <span className="text-sm font-semibold text-gray-600">{undiagnosedPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-500 h-2 rounded-full transition-all duration-300" style={{ width: `${undiagnosedPercentage}%` }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Diagnosis */}
          <Card className="shadow-lg border-0 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Diagnosis Terbaru
              </CardTitle>
              <CardDescription>Aktivitas diagnosis tanaman terbaru</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDiagnoses.length > 0 ? (
                  recentDiagnoses.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${item.result.toLowerCase().includes('sehat') ? 'bg-green-100' : 'bg-red-100'}`}>
                        {item.result.toLowerCase().includes('sehat') ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.plantName}</p>
                        <p className={`text-xs ${item.result.toLowerCase().includes('sehat') ? 'text-green-600' : 'text-red-600'}`}>{item.result}</p>
                        <p className="text-xs text-gray-500">Confidence: {Math.round(item.confidence * 100)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(item.checked_at).toLocaleDateString('id-ID', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Belum ada data diagnosis</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Quick Diagnosis Dialog */}
        {showDiagnosisDialog && (
          <AlertDialog
            open={showDiagnosisDialog}
            onOpenChange={(open) => {
              if (!isDiagnosing) {
                setShowDiagnosisDialog(open);
                if (!open) {
                  setSelectedFile(null);
                }
              }
            }}
          >
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Diagnosis Cepat</AlertDialogTitle>
                <AlertDialogDescription>Upload foto 1 daun dari tanamanmu untuk diagnosis instan</AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      <p className="text-sm text-gray-600 truncate">{selectedFile.name}</p>
                      {!isDiagnosing && (
                        <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                          <X className="h-4 w-4 mr-1" />
                          Hapus
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Pilih foto daun</p>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                      <Button variant="outline" className="mt-2" onClick={() => fileInputRef.current?.click()} disabled={isDiagnosing}>
                        Upload Foto
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDiagnosing}>Batal</AlertDialogCancel>
                <Button onClick={handleQuickDiagnoseSubmit} disabled={!selectedFile || isDiagnosing} className="bg-green-600 hover:bg-green-700">
                  {isDiagnosing ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Memproses...
                    </div>
                  ) : (
                    'Diagnosis'
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {showResultDialog && diagnosisResult && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Hasil Diagnosis Cepat</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowResultDialog(false);
                    setSelectedFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <Badge className={`${isHealthyDiagnosis(diagnosisResult.result) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs`}>{isHealthyDiagnosis(diagnosisResult.result) ? 'Sehat' : 'Perlu Perhatian'}</Badge>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-800 mb-1">{diagnosisResult.result}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Confidence: {Math.round(diagnosisResult.confidence * 100)}%</span>
                  </div>
                </div>

                {diagnosisResult.notes && (
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Catatan:</h4>
                    <div className="max-h-40 overflow-y-auto">
                      <div className="text-sm text-gray-600 whitespace-pre-line">{formatMessage(diagnosisResult.notes)}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowResultDialog(false);
                    setSelectedFile(null);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Analisis Cuaca */}
        {showAnalysisModal && (
          <AlertDialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
            <AlertDialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Rekomendasi Perawatan Tanaman
                </AlertDialogTitle>
                <AlertDialogDescription className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{weatherData?.location || 'Lokasi tidak diketahui'}</span>
                  <span className="mx-1">•</span>
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="flex-1 overflow-y-auto py-2 px-1">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Menganalisis kondisi cuaca...</p>
                  </div>
                ) : analysisError ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 py-8 text-destructive">
                    <AlertTriangle className="w-8 h-8" />
                    <p className="text-center max-w-md">{analysisError}</p>
                    <Button variant="outline" size="sm" onClick={handleWeatherAnalysis} className="mt-2">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Coba Lagi
                    </Button>
                  </div>
                ) : weatherAnalysis ? (
                  <div className="prose prose-sm max-w-none">{formatMessage(weatherAnalysis)}</div>
                ) : null}
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isAnalyzing}>Tutup</AlertDialogCancel>
                {!isAnalyzing && !analysisError && (
                  <Button onClick={handleWeatherAnalysis} variant="secondary" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Perbarui Analisis
                  </Button>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
