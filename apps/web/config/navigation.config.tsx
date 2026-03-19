import { Home, User, Clock, LayoutGrid, Users, Store, Utensils, Building2 } from 'lucide-react';
import { z } from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const routes = [
  {
    label: 'common:routes.application',
    children: [
      {
        label: 'common:routes.home',
        path: pathsConfig.app.home,
        Icon: <Home className={iconClasses} />,
        end: true,
        roles: ['client', 'restaurateur'],
      },
      {
        label: 'common:routes.restaurants',
        path: pathsConfig.app.restaurants,
        Icon: <Utensils className={iconClasses} />,
        roles: ['client', 'restaurateur'],
      },
    ],
  },
  {
    label: 'common:routes.settings',
    children: [
      {
        label: 'common:routes.restaurant',
        path: pathsConfig.app.restaurantSettings,
        Icon: <Store className={iconClasses} />,
        roles: ['restaurateur'],
      },
      {
        label: 'common:routes.establishments',
        path: pathsConfig.app.manageEstablishments,
        Icon: <Building2 className={iconClasses} />,
        roles: ['restaurateur'],
      },
      {
        label: 'common:routes.profile',
        path: pathsConfig.app.profileSettings,
        Icon: <User className={iconClasses} />,
        roles: ['client', 'restaurateur'],
      },
      {
        label: 'common:routes.services',
        path: pathsConfig.app.services,
        Icon: <Clock className={iconClasses} />,
        roles: ['restaurateur'],
      },
      {
        label: 'common:routes.tables',
        path: pathsConfig.app.tables,
        Icon: <LayoutGrid className={iconClasses} />,
        roles: ['restaurateur'],
      },
      {
        label: 'common:routes.team',
        path: pathsConfig.app.team,
        Icon: <Users className={iconClasses} />,
        roles: ['restaurateur'],
      },
    ],
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

export const navigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_NAVIGATION_STYLE,
  sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
});
