import HomePage from '@/components/pages/HomePage';
import TasksPage from '@/components/pages/TasksPage';
import AnalyticsPage from '@/components/pages/AnalyticsPage';

export const routes = {
  home: {
    id: 'home',
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
component: HomePage
  },
  tasks: {
    id: 'tasks',
    label: 'All Tasks',
    path: '/tasks',
    icon: 'CheckSquare',
component: TasksPage
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: 'BarChart3',
component: AnalyticsPage
  }
};

export const routeArray = Object.values(routes);