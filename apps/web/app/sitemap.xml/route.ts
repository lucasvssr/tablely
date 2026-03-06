import { getServerSideSitemap } from 'next-sitemap';

import appConfig from '~/config/app.config';

/**
 * @description The maximum age of the sitemap in seconds.
 * This is used to set the cache-control header for the sitemap. The cache-control header is used to control how long the sitemap is cached.
 * By default, the cache-control header is set to 'public, max-age=600, s-maxage=3600'.
 * This means that the sitemap will be cached for 600 seconds (10 minutes) and will be considered stale after 3600 seconds (1 hour).
 */
const MAX_AGE = 60;
const S_MAX_AGE = 3600;

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const paths = await getPaths();

    const headers = {
      'Cache-Control': `public, max-age=${MAX_AGE}, s-maxage=${S_MAX_AGE}`,
    };

    return getServerSideSitemap([...paths], headers);
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    
    // Return a basic sitemap if the dynamic one fails
    return getServerSideSitemap([
      { loc: new URL('/', appConfig.url).href, lastmod: new Date().toISOString() },
      { loc: new URL('/restaurants', appConfig.url).href, lastmod: new Date().toISOString() },
    ], {
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
  }
}

async function getPaths() {
  const paths = [
    '/',
    '/restaurants',
    '/faq',
    '/cookie-policy',
    '/terms-of-service',
    '/privacy-policy',
  ];

  let restaurantPaths: string[] = [];

  try {
    const { getRestaurantsAction } = await import(
      '~/lib/server/restaurant/restaurant-actions'
    );

    const restaurants = await getRestaurantsAction();

    restaurantPaths = restaurants.map((restaurant) => {
      return `/restaurant/${restaurant.slug}`;
    });
  } catch (error) {
    console.warn('Failed to fetch restaurant paths for sitemap:', error);
  }

  const allPaths = [...paths, ...restaurantPaths];

  return allPaths.map((path) => {
    return {
      loc: new URL(path, appConfig.url).href,
      lastmod: new Date().toISOString(),
    };
  });
}
