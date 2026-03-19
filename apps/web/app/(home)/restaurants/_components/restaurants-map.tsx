'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSearchParams } from 'next/navigation';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MapPin, Phone, Utensils, ArrowRight } from 'lucide-react';
import { Button } from '@kit/ui/button';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';

import { TFunction } from 'i18next';

// Fix for default marker icons in Leaflet with Next.js
const setupLeafletIcons = () => {
  Reflect.deleteProperty(L.Icon.Default.prototype, '_getIconUrl');
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

interface RestaurantMarker {
  id: string;
  name: string;
  location: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  slug: string;
}

interface RestaurantsMapProps {
  restaurants: RestaurantMarker[];
  className?: string;
}

function ChangeView({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [bounds, map]);
  return null;
}

function FocusHandler({ restaurants }: { restaurants: RestaurantMarker[] }) {
  const map = useMap();
  const searchParams = useSearchParams();
  const focusId = searchParams.get('focus');

  useEffect(() => {
    if (focusId) {
      const res = restaurants.find(r => r.id === focusId);
      if (res && res.lat !== null && res.lng !== null) {
        map.setView([res.lat, res.lng], 16, { animate: true });
      }
    }
  }, [focusId, restaurants, map]);

  return null;
}

function MarkerWithFocus({ 
  restaurant, 
  focusId, 
  tHome, 
  tCommon 
}: { 
  restaurant: RestaurantMarker; 
  focusId: string | null;
  tHome: TFunction;
  tCommon: TFunction;
}) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (focusId === restaurant.id && markerRef.current) {
      // Small delay to ensure map has finished moving/zooming
      const timer = setTimeout(() => {
        markerRef.current?.openPopup();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [focusId, restaurant.id]);

  return (
    <Marker
      ref={markerRef}
      position={[restaurant.lat!, restaurant.lng!]}
    >
      <Popup className="custom-leaflet-popup">
        <div className="p-1 space-y-2 min-w-[200px]">
          <h3 className="font-bold text-zinc-900 leading-tight">
            {restaurant.name}
          </h3>
          <div className="flex items-start gap-1.5 text-xs text-zinc-600">
            <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{restaurant.location || tCommon('na')}</span>
          </div>
          {restaurant.phone && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{restaurant.phone}</span>
            </div>
          )}

          <div className="pt-2">
            <Button asChild size="sm" className="w-full h-8 text-xs text-white bg-brand-copper hover:bg-brand-copper/90">
              <Link href={`/restaurant/${restaurant.slug}`}>
                {tHome('bookNow')}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export function RestaurantsMap({ restaurants, className }: RestaurantsMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { t: tHome } = useTranslation('home');
  const { t: tRest } = useTranslation('restaurant');
  const { t: tCommon } = useTranslation('common');
  const { resolvedTheme } = useTheme();
  const searchParams = useSearchParams();
  const focusId = searchParams.get('focus');

  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setIsMounted(true);
    setupLeafletIcons();
  }, []);

  if (!isMounted) {
    return (
      <div className={`flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-2 border-dashed ${className}`}>
        <div className="text-zinc-400 flex flex-col items-center gap-2">
          <Utensils className="h-8 w-8 animate-pulse" />
          <p className="text-sm font-medium">{tRest('map.loading')}</p>
        </div>
      </div>
    );
  }

  const validRestaurants = restaurants.filter(r => r.lat !== null && r.lng !== null);

  // Default center (France/Europe) if no results
  const defaultCenter: [number, number] = [46.603354, 1.888334];

  // Calculate bounds to fit all markers
  let bounds: L.LatLngBoundsExpression | null = null;
  if (validRestaurants.length > 0) {
    const latLngs = validRestaurants.map(r => [r.lat!, r.lng!] as [number, number]);
    bounds = L.latLngBounds(latLngs);
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={isDark 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
        />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          showCoverageOnHover={false}
        >
          {validRestaurants.map((restaurant) => (
            <MarkerWithFocus
              key={restaurant.id}
              restaurant={restaurant}
              focusId={focusId}
              tHome={tHome}
              tCommon={tCommon}
            />
          ))}
        </MarkerClusterGroup>

        {bounds && <ChangeView bounds={bounds} />}
        <FocusHandler restaurants={validRestaurants} />
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg pointer-events-none">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          {tRest('map.results', { count: validRestaurants.length })}
        </p>
      </div>
    </div>
  );
}
