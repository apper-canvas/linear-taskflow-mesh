import Home from '../pages/Home';
import Tasks from '../pages/Tasks';
import Analytics from '../pages/Analytics';

export const routes = {
  home: {
    id: 'home',
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    component: Home
  },
  tasks: {
    id: 'tasks',
    label: 'All Tasks',
    path: '/tasks',
    icon: 'CheckSquare',
    component: Tasks
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: 'BarChart3',
    component: Analytics
  }
};

export const routeArray = Object.values(routes);