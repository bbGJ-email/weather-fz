import { Cloud, CloudDrizzle, CloudRain, CloudSnow, Sun, CloudFog, Wind } from 'lucide-react';

interface WeatherIconProps {
  weatherCode: string;
  className?: string;
}

export function WeatherIcon({ weatherCode, className = 'w-24 h-24' }: WeatherIconProps) {
  const getIcon = () => {
    if (weatherCode.includes('00')) {
      return <Sun className={`${className} text-primary`} />;
    }
    if (weatherCode.includes('01') || weatherCode.includes('02')) {
      return <Cloud className={`${className} text-muted-foreground`} />;
    }
    if (weatherCode.includes('03')) {
      return <CloudRain className={`${className} text-primary`} />;
    }
    if (weatherCode.includes('07') || weatherCode.includes('08') || weatherCode.includes('09')) {
      return <CloudRain className={`${className} text-primary`} />;
    }
    if (weatherCode.includes('13') || weatherCode.includes('14') || weatherCode.includes('15')) {
      return <CloudSnow className={`${className} text-primary`} />;
    }
    if (weatherCode.includes('18')) {
      return <CloudFog className={`${className} text-muted-foreground`} />;
    }
    if (weatherCode.includes('29') || weatherCode.includes('30')) {
      return <Wind className={`${className} text-muted-foreground`} />;
    }
    if (weatherCode.includes('10')) {
      return <CloudDrizzle className={`${className} text-primary`} />;
    }
    return <Cloud className={`${className} text-muted-foreground`} />;
  };

  return <div className="flex items-center justify-center">{getIcon()}</div>;
}
