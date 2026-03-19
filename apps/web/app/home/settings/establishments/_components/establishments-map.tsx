'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSearchParams } from 'next/navigation';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Building2, MapPin, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';

// Fix for default marker icons in Leaflet with Next.js
const setupLeafletIcons = () => {
  Reflect.deleteProperty(L.Icon.Default.prototype, '_getIconUrl');
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

interface Establishment {
  id: string;
  name: string;
  location: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  isActive?: boolean;
}

interface EstablishmentsMapProps {
  establishments: Establishment[];
  className?: string;
}

// Helper to auto-center map when establishments change
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Helper to focus on a specific establishment from URL
function FocusHandler({ establishments }: { establishments: Establishment[] }) {
    const map = useMap();
    const searchParams = useSearchParams();
    const focusId = searchParams.get('focus');

    useEffect(() => {
        if (focusId) {
            const est = establishments.find(e => e.id === focusId);
            if (est && (est.lat !== null && est.lat !== undefined) && (est.lng !== null && est.lng !== undefined)) {
                map.setView([est.lat, est.lng], 16, { animate: true });
            }
        }
    }, [focusId, establishments, map]);

    return null;
}

export function EstablishmentsMap({ establishments, className }: EstablishmentsMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useTranslation('restaurant');
  const { t: tCommon } = useTranslation('common');
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setIsMounted(true);
    setupLeafletIcons();
  }, []);

  if (!isMounted) {
    return (
      <div className={`flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-2 border-dashed ${className}`}>
        <div className="text-zinc-400 flex flex-col items-center gap-2">
           <Building2 className="h-8 w-8 animate-pulse" />
           <p className="text-sm font-medium">{t('map.loading')}</p>
        </div>
      </div>
    );
  }

  // Filter establishments with valid coordinates
  const validEstablishments = establishments.filter(e => e.lat !== null && e.lng !== null);

  // Default center (France/Europe) if no establishments
  const defaultCenter: [number, number] = [46.603354, 1.888334]; // Center of France
  const firstValid = validEstablishments[0];
  const center: [number, number] = firstValid && firstValid.lat !== null && firstValid.lng !== null
    ? [firstValid.lat, firstValid.lng]
    : defaultCenter;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl ${className}`}>
      <MapContainer 
        center={center} 
        zoom={validEstablishments.length > 0 ? 12 : 6} 
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
          {validEstablishments.map((est) => (
            <Marker 
              key={est.id} 
              position={[est.lat!, est.lng!]}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 space-y-2 min-w-[150px]">
                  <h3 className="font-bold text-zinc-900 leading-tight">
                      {est.name}
                  </h3>
                  <div className="flex items-start gap-1.5 text-xs text-zinc-600">
                      <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{est.location || tCommon('na')}</span>
                  </div>
                  {est.phone && (
                     <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span>{est.phone}</span>
                     </div>
                  )}
                  {est.isActive && (
                      <div className="mt-1">
                           <span className="text-[9px] uppercase tracking-wider font-bold text-brand-copper bg-brand-copper/10 px-1.5 py-0.5 rounded">
                               {t('map.active')}
                          </span>
                      </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {validEstablishments.length > 0 && (
           <ChangeView center={center} zoom={12} />
        )}
        <FocusHandler establishments={validEstablishments} />
      </MapContainer>

      {/* Map Overlay for instructions or filters can go here */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg pointer-events-none">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            {t('map.results', { count: validEstablishments.length })}
        </p>
      </div>
    </div>
  );
}
