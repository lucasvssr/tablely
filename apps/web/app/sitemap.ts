import { MetadataRoute } from 'next';
import appConfig from '~/config/app.config';

/**
 * @name sitemap
 * @description Generates the sitemap for the application.
 * Next.js will automatically use this to generate /sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = appConfig.url.endsWith('/') 
    ? appConfig.url.slice(0, -1) 
    : appConfig.url;

  // Base paths
  const paths = [
    '',
    '/restaurants',
    '/faq',
    '/cookie-policy',
    '/terms-of-service',
    '/privacy-policy',
  ];

  const staticPaths: MetadataRoute.Sitemap = paths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: path === '' ? 1 : 0.8,
  }));

  let restaurantPaths: MetadataRoute.Sitemap = [];

  try {
    // Dynamically import to avoid any server-side issues during build if DB is not available
    const { getRestaurantsAction } = await import(
      '~/lib/server/restaurant/restaurant-actions'
    );

    const restaurants = await getRestaurantsAction();

    restaurantPaths = (restaurants || []).map((restaurant) => ({
      url: `${baseUrl}/restaurant/${restaurant.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch (error) {
    console.warn('Failed to fetch restaurant paths for sitemap:', error);
  }

  return [...staticPaths, ...restaurantPaths];
}

export const revalidate = 3600; // Revalidate every hour
