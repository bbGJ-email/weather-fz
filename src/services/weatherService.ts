import type { WeatherData, GeocodingResult } from '@/types/weather';

const APP_ID = import.meta.env.VITE_APP_ID;

const WEATHER_API_URL = 'https://api-integrations.appmiaoda.com/app-7zep911h81s1/api-bJ0Aaln8LR51/lundear/weather1d';
const GEOCODING_API_URL = 'https://api-integrations.appmiaoda.com/app-7zep911h81s1/api-gprXa6PNL6dE/geocoding/v3/';

export async function getWeatherByCoords(lng: string, lat: string): Promise<WeatherData> {
  try {
    const response = await fetch(WEATHER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Id': APP_ID,
      },
      body: JSON.stringify({
        lng,
        lat,
        needalarm: '1',
        needIndex: '1',
        needObserve: '0',
        need3hour: '0',
        need1hour: '0',
      }),
    });

    const result = await response.json();

    if (result.status === 999) {
      throw new Error(result.msg || '获取天气数据失败');
    }

    if (result.status !== 0 || !result.data) {
      throw new Error(result.msg || '获取天气数据失败');
    }

    return result.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('网络请求失败，请检查网络连接');
  }
}

export async function reverseGeocode(lng: number, lat: number): Promise<GeocodingResult> {
  try {
    const response = await fetch(`https://api-integrations.appmiaoda.com/app-7zep911h81s1/api-gprXa6PNL6dE/reverse_geocoding/v3/?location=${lat},${lng}&coordtype=bd09ll&ret_coordtype=bd09ll&extensions_poi=0&extensions_road=false&region_data_source=2&radius=1000&output=json&language=zh-CN&language_auto=0`, {
      method: 'GET',
      headers: {
        'X-App-Id': APP_ID,
      },
    });

    const result = await response.json();

    if (result.status === 999) {
      throw new Error(result.msg || '获取位置信息失败');
    }

    if (result.status !== 0 || !result.data?.result) {
      throw new Error(result.msg || '获取位置信息失败');
    }

    return result.data.result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('获取位置信息失败');
  }
}
