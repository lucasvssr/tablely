import type { ReactNode } from 'react';
import { z } from 'zod';

type RouteMatchingFunction = (path: string) => boolean;

const RouteMatchingEnd = z
  .union([
    z.boolean(),
    z.custom<RouteMatchingFunction>(
      (value) => typeof value === 'function',
      {
        message: 'Expected a boolean or a route-matching function',
      },
    ),
  ])
  .default(false);

const Divider = z.object({
  divider: z.literal(true),
});

const RouteSubChild = z.object({
  label: z.string(),
  path: z.string(),
  Icon: z.custom<ReactNode>().optional(),
  end: RouteMatchingEnd,
  renderAction: z.custom<ReactNode>().optional(),
  roles: z.array(z.string()).optional(),
});

const RouteChild = z.object({
  label: z.string(),
  path: z.string(),
  Icon: z.custom<ReactNode>().optional(),
  end: RouteMatchingEnd,
  children: z.array(RouteSubChild).default([]),
  collapsible: z.boolean().default(false),
  collapsed: z.boolean().default(false),
  renderAction: z.custom<ReactNode>().optional(),
  roles: z.array(z.string()).optional(),
});

const RouteGroup = z.object({
  label: z.string(),
  collapsible: z.boolean().optional(),
  collapsed: z.boolean().optional(),
  children: z.array(RouteChild),
  renderAction: z.custom<ReactNode>().optional(),
});

export const NavigationConfigSchema = z.object({
  style: z.enum(['custom', 'sidebar', 'header']).default('sidebar'),

  sidebarCollapsed: z
    .enum(['false', 'true'])
    .default('true')
    .transform((value) => value === 'true'),

  sidebarCollapsedStyle: z
    .enum(['offcanvas', 'icon', 'none'])
    .default('icon'),

  routes: z.array(z.union([RouteGroup, Divider])),
});

export type NavigationConfig = z.infer<typeof NavigationConfigSchema>;