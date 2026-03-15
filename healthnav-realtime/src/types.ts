export interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  distance?: string;
  distanceKm?: number;
  phone?: string;
  website?: string;
  mapsUrl?: string;
  type?: 'hospital' | 'clinic' | 'emergency';
  beds?: number;
  facilities: {
    icu: boolean;
    oxygen: boolean;
    ambulance: boolean;
    emergency247: boolean;
    pharmacy: boolean;
    bloodBank: boolean;
    trauma: boolean;
    pediatric: boolean;
  };
  isCustom?: boolean;
}

export interface SearchHistory {
  id: number;
  lat: number;
  lng: number;
  address: string;
  timestamp: string;
}

export type Screen = 'home' | 'map' | 'history' | 'admin';

export type SortMode = 'distance' | 'name' | 'type';
