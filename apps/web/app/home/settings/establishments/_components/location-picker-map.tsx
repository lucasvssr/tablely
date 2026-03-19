'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useTheme } from 'next-themes';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const setupLeafletIcons = () => {
    if (typeof window === 'undefined') return;
    const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;
};

interface LocationPickerMapProps {
    lat?: number | null;
    lng?: number | null;
    onChange: (lat: number, lng: number) => void;
    className?: string;
}

function MapEvents({ onChange }: { onChange: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export function LocationPickerMap({ lat, lng, onChange, className }: LocationPickerMapProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    
    const defaultCenter: [number, number] = [46.603354, 1.888334]; // Center of France
    const initialCenter: [number, number] = (lat && lng) ? [lat, lng] : defaultCenter;
    const [markerPos, setMarkerPos] = useState<[number, number] | null>((lat && lng) ? [lat, lng] : null);

    useEffect(() => {
        setupLeafletIcons();
        if (lat && lng) {
            setMarkerPos([lat, lng]);
        }
    }, [lat, lng]);

    return (
        <div className={className}>
            <MapContainer
                center={initialCenter}
                zoom={lat && lng ? 18 : 5}
                scrollWheelZoom={true}
                className="h-full w-full rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url={isDark 
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    }
                />
                <MapEvents onChange={(newLat, newLng) => {
                    setMarkerPos([newLat, newLng]);
                    onChange(newLat, newLng);
                }} />
                {markerPos && <Marker position={markerPos} />}
                {lat && lng && <ChangeView center={[lat, lng]} />}
            </MapContainer>
        </div>
    );
}
