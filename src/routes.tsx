import WeatherPage from './pages/WeatherPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '智能天气播报器',
    path: '/',
    element: <WeatherPage />
  }
];

export default routes;
