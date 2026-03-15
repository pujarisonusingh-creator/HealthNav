import React, { useState, useRef } from 'react';
import Layout from './components/Layout';
import BottomNav from './components/BottomNav';
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import HistoryScreen from './screens/HistoryScreen';
import AdminScreen from './screens/AdminScreen';
import { Screen, Hospital } from './types';
import { HospitalService } from './services/hospitalService';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef(new HospitalService());

  const detectLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);

        try {
          const [results, customRes] = await Promise.all([
            serviceRef.current.findNearbyHospitals(latitude, longitude),
            fetch('/api/hospitals').then(r => r.json()).catch(() => []),
          ]);

          // Deduplicate custom + OSM (custom first)
          const customIds = new Set(customRes.map((h: Hospital) => h.id));
          const merged = [...customRes, ...results.filter((h: Hospital) => !customIds.has(h.id))];
          setHospitals(merged);

          // Save to history
          fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lng: longitude, address: 'Current Location' }),
          }).catch(() => {});
        } catch (err) {
          console.error(err);
          setError('Failed to fetch nearby hospitals. Check your connection.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location access denied. Please allow location in your browser settings.',
          2: 'Location unavailable. Try again.',
          3: 'Location request timed out. Try again.',
        };
        setError(messages[err.code] || err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen onDetectLocation={detectLocation} hospitals={hospitals} loading={loading} error={error} />;
      case 'map':
        return <MapScreen userLocation={userLocation} hospitals={hospitals} onLocateMe={detectLocation} loading={loading} />;
      case 'history':
        return <HistoryScreen />;
      case 'admin':
        return <AdminScreen />;
      default:
        return <HomeScreen onDetectLocation={detectLocation} hospitals={hospitals} loading={loading} error={error} />;
    }
  };

  return (
    <div className="relative">
      <Layout activeScreen={activeScreen}>{renderScreen()}</Layout>
      <BottomNav activeScreen={activeScreen} onScreenChange={setActiveScreen} />
    </div>
  );
}
