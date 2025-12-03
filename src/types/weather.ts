export interface WeatherData {
  cityInfo: {
    areaCn: string;
    cityCn: string;
    provCn: string;
  };
  now: {
    temp: string;
    weather: string;
    WD: string;
    WS: string;
    SD: string;
    aqi: string;
    weathercode: string;
    time: string;
  };
  day?: {
    weather: string;
    temperature: string;
    wind: string;
    wind_pow: string;
  };
  night?: {
    weather: string;
    temperature: string;
    wind: string;
    wind_pow: string;
  };
  lifeIndex?: {
    [key: string]: {
      state: string;
      reply: string;
    };
  };
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface GeocodingResult {
  status: number;
  result: {
    formatted_address: string;
    addressComponent: {
      city: string;
      district: string;
      province: string;
    };
  };
  formatted_address: string;
}

