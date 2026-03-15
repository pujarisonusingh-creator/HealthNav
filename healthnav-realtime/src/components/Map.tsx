import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Hospital } from '../types';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const HospitalIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const UserIcon = L.divIcon({
  className: 'user-div-icon',
  html: `<div class="relative">
    <div class="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
    <div class="relative bg-blue-500 w-4 h-4 rounded-full border-2 border-white shadow-lg"></div>
  </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

interface MapProps {
  userLocation: [number, number] | null;
  hospitals: Hospital[];
  onMarkerClick?: (hospital: Hospital) => void;
}

export default function Map({ userLocation, hospitals, onMarkerClick }: MapProps) {
  const defaultCenter: [number, number] = [17.3850, 78.4867]; // Hyderabad
  const center = userLocation || defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {userLocation && (
        <>
          <Marker position={userLocation} icon={UserIcon}>
            <Popup>You are here</Popup>
          </Marker>
          <Circle 
            center={userLocation} 
            radius={2000} 
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }} 
          />
          <ChangeView center={userLocation} />
        </>
      )}

      {hospitals.map((hospital) => (
        <Marker
          key={hospital.id}
          position={[hospital.lat, hospital.lng]}
          icon={HospitalIcon}
          eventHandlers={{
            click: () => onMarkerClick?.(hospital),
          }}
        >
          <Popup>
            <div className="p-1">
              <h4 className="font-bold text-sm">{hospital.name}</h4>
              <p className="text-xs text-slate-500">{hospital.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
