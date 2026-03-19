'use server';

import { enhanceAction } from '@kit/next/actions';

/**
 * @name geocodeAddressAction
 * @description Action to fetch latitude and longitude from a text address using Nominatim (OpenStreetMap).
 */
export const geocodeAddressAction = enhanceAction(
  async (formData: FormData) => {
    const address = formData.get('address') as string;

    if (!address || address.length < 5) {
      throw new Error('Address too short');
    }

    try {
      const email = process.env.GEOCODING_EMAIL;
      if (!email) {
        throw new Error('Geocoding email not configured');
      }
      const searchParams = new URLSearchParams({
        format: 'json',
        q: address,
        limit: '1',
        email: email,
      } as Record<string, string>);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${searchParams.toString()}`,
        {
          headers: {
            'User-Agent': `Tablely/1.0 (${email})`,
            'Accept-Language': 'fr,en;q=0.9',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding service error (Status ${response.status})`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        // Fetch detailed address components
        const detailsParams = new URLSearchParams({
          format: 'json',
          lat: data[0].lat,
          lon: data[0].lon,
          zoom: '18',
          addressdetails: '1',
          email: email,
        } as Record<string, string>);

        const detailsResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?${detailsParams.toString()}`,
          {
            headers: {
              'User-Agent': `Tablely/1.0 (${email})`,
              'Accept-Language': 'fr',
            },
          }
        );

        const details = await detailsResponse.json();
        const addr = details.address;

        // Format: Numéro Rue, Ville, Département, Pays
        const parts = [];
        const street = [addr.house_number, addr.road].filter(Boolean).join(' ');
        if (street) parts.push(street);

        const city = addr.city || addr.town || addr.village || addr.hamlet;
        if (city) parts.push(city);

        if (addr.county) parts.push(addr.county);
        if (addr.country) parts.push(addr.country);

        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          display_name: parts.join(', '),
        };
      }

      throw new Error('Address not found');
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown geocoding error');
    }
  },
  { auth: true }
);

/**
 * @name reverseGeocodeAction
 * @description Action to fetch a formatted address from latitude and longitude.
 */
export const reverseGeocodeAction = enhanceAction(
  async ({ lat, lng }: { lat: number; lng: number }) => {
    const email = process.env.GEOCODING_EMAIL ?? 'lucas.mailtests@gmail.com';

    try {
      const searchParams = new URLSearchParams({
        format: 'json',
        lat: lat.toString(),
        lon: lng.toString(),
        zoom: '18',
        addressdetails: '1',
        email: email,
      } as Record<string, string>);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${searchParams.toString()}`,
        {
          headers: {
            'User-Agent': `Tablely/1.0 (${email})`,
            'Accept-Language': 'fr',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding error (Status ${response.status})`);
      }

      const details = await response.json();
      const addr = details.address;

      // Format: Numéro Rue, Ville, Département, Pays
      const parts = [];
      const street = [addr.house_number, addr.road].filter(Boolean).join(' ');
      if (street) parts.push(street);

      const city = addr.city || addr.town || addr.village || addr.hamlet;
      if (city) parts.push(city);

      if (addr.county) parts.push(addr.county);
      if (addr.country) parts.push(addr.country);

      return {
        display_name: parts.join(', '),
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown reverse geocoding error');
    }
  },
  { auth: true }
);
