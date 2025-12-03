import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { MapPin, RefreshCw, Volume2, VolumeX, Droplets, Wind, Gauge } from 'lucide-react';
import { WeatherIcon } from '@/components/weather/WeatherIcon';
import { getWeatherByCoords, reverseGeocode } from '@/services/weatherService';
import { textToSpeech, playAudio } from '@/services/speechService';
import type { WeatherData, LocationInfo } from '@/types/weather';

export default function WeatherPage() {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('您的浏览器不支持地理定位功能');
      return;
    }

    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      const geoResult = await reverseGeocode(longitude, latitude);
      const address = geoResult.formatted_address;

      setLocation({
        latitude,
        longitude,
        address,
      });

      await fetchWeather(longitude.toString(), latitude.toString());
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('您拒绝了位置授权，请在浏览器设置中允许位置访问');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error('无法获取您的位置信息');
        } else if (error.code === error.TIMEOUT) {
          toast.error('获取位置超时，请重试');
        }
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('获取位置失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (lng: string, lat: string) => {
    try {
      const weatherData = await getWeatherByCoords(lng, lat);
      setWeather(weatherData);

      if (voiceEnabled) {
        await speakWeather(weatherData);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('获取天气信息失败');
      }
    }
  };

  const speakWeather = async (weatherData: WeatherData) => {
    if (isPlaying) {
      return;
    }

    try {
      setIsPlaying(true);
      const text = generateWeatherText(weatherData);
      const audioBlob = await textToSpeech(text);
      await playAudio(audioBlob);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`语音播报失败: ${error.message}`);
      } else {
        toast.error('语音播报失败');
      }
    } finally {
      setIsPlaying(false);
    }
  };

  const generateWeatherText = (weatherData: WeatherData): string => {
    const { cityInfo, now } = weatherData;
    const city = cityInfo.cityCn || cityInfo.areaCn;
    return `${city}，当前天气${now.weather}，温度${now.temp}度，${now.WD}${now.WS}，湿度${now.SD}`;
  };

  const handleRefresh = async () => {
    if (!location) {
      toast.error('请先获取位置信息');
      return;
    }

    setLoading(true);
    try {
      await fetchWeather(location.longitude.toString(), location.latitude.toString());
      toast.success('天气信息已更新');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceToggle = (checked: boolean) => {
    setVoiceEnabled(checked);
    if (checked) {
      toast.success('语音播报已开启');
    } else {
      toast.info('语音播报已关闭');
    }
  };

  const handleManualSpeak = async () => {
    if (!weather) {
      toast.error('暂无天气信息');
      return;
    }

    await speakWeather(weather);
  };

  const getBackgroundClass = () => {
    if (!weather) return 'bg-background';

    const weatherCode = weather.now.weathercode;
    if (weatherCode.includes('00')) {
      return 'bg-[hsl(var(--sunny-bg))]';
    }
    if (weatherCode.includes('03') || weatherCode.includes('07') || weatherCode.includes('08')) {
      return 'bg-[hsl(var(--rainy-bg))]';
    }
    return 'bg-[hsl(var(--cloudy-bg))]';
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()} transition-colors duration-500 p-4 xl:p-8`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl xl:text-5xl font-bold gradient-text">智能天气播报器</h1>
          <p className="text-muted-foreground">实时天气 · 智能播报</p>
        </div>

        {loading && !weather ? (
          <Card className="weather-card">
            <CardHeader>
              <Skeleton className="h-8 w-48 mx-auto bg-muted" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-24 w-24 rounded-full mx-auto bg-muted" />
              <Skeleton className="h-12 w-32 mx-auto bg-muted" />
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <Skeleton className="h-20 bg-muted" />
                <Skeleton className="h-20 bg-muted" />
                <Skeleton className="h-20 bg-muted" />
              </div>
            </CardContent>
          </Card>
        ) : weather ? (
          <Card className="weather-card animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <MapPin className="w-6 h-6 text-primary" />
                <span>{location?.address || weather.cityInfo.cityCn}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <WeatherIcon weatherCode={weather.now.weathercode} className="w-32 h-32" />
                <div className="text-center space-y-2">
                  <div className="text-6xl font-bold text-primary">{weather.now.temp}°</div>
                  <div className="text-2xl text-foreground">{weather.now.weather}</div>
                  <div className="text-sm text-muted-foreground">{weather.now.time}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <Card className="bg-secondary/50">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Droplets className="w-8 h-8 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">湿度</div>
                      <div className="text-xl font-semibold">{weather.now.SD}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/50">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Wind className="w-8 h-8 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">风力</div>
                      <div className="text-xl font-semibold">
                        {weather.now.WD} {weather.now.WS}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/50">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Gauge className="w-8 h-8 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">空气质量</div>
                      <div className="text-xl font-semibold">AQI {weather.now.aqi}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {weather.lifeIndex && (
                <Card className="bg-secondary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">生活指数</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {Object.entries(weather.lifeIndex).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-2 rounded-lg bg-card/50">
                        <span className="text-sm font-medium">{key}</span>
                        <span className="text-sm text-primary">{value.state}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="weather-card">
            <CardContent className="py-12 text-center space-y-4">
              <MapPin className="w-16 h-16 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">点击下方按钮获取位置和天气信息</p>
            </CardContent>
          </Card>
        )}

        <Card className="weather-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="voice-toggle" className="flex items-center gap-2 cursor-pointer">
                {voiceEnabled ? (
                  <Volume2 className="w-5 h-5 text-primary" />
                ) : (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                )}
                <span>语音播报</span>
              </Label>
              <Switch id="voice-toggle" checked={voiceEnabled} onCheckedChange={handleVoiceToggle} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
              <Button onClick={requestLocation} disabled={loading} className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                重新定位
              </Button>

              <Button onClick={handleRefresh} disabled={loading || !location} variant="secondary" className="w-full">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新天气
              </Button>

              <Button
                onClick={handleManualSpeak}
                disabled={!weather || isPlaying}
                variant="outline"
                className="w-full"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {isPlaying ? '播报中...' : '播报天气'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
