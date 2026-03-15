import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Crosshair, Loader2, Phone, Share2, Building2 } from 'lucide-react';
import Map from '../components/Map';
import { Hospital } from '../types';

interface MapScreenProps {
  userLocation: [number, number] | null;
  hospitals: Hospital[];
  onLocateMe: () => void;
  loading: boolean;
}

export default function MapScreen({ userLocation, hospitals, onLocateMe, loading }: MapScreenProps) {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  return (
    <div className="fixed inset-0 bg-slate-100">
      <div className="h-full w-full relative">
        <Map
          userLocation={userLocation}
          hospitals={hospitals}
          onMarkerClick={setSelectedHospital}
        />

        {/* Top bar */}
        <div className="absolute top-12 left-4 right-4 z-[1000]">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg border border-white/60">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Map</p>
                <p className="text-xs font-bold text-slate-900">{hospitals.length} hospitals nearby</p>
              </div>
            </div>
            <button
              onClick={onLocateMe}
              disabled={loading}
              className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Crosshair size={18} />}
            </button>
          </div>
        </div>

        {/* Hospital count pills */}
        {!userLocation && !loading && (
          <div className="absolute bottom-36 left-4 right-4 z-[1000]">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg text-center border border-white/60">
              <MapPin size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Tap Locate Me to find hospitals</p>
            </div>
          </div>
        )}

        {/* Selected hospital card */}
        <AnimatePresence>
          {selectedHospital && (
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              className="absolute bottom-28 left-4 right-4 z-[1000]"
            >
              <div className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-100">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Building2 size={14} className="text-slate-400 shrink-0" />
                      <h3 className="font-bold text-base text-slate-900 truncate">{selectedHospital.name}</h3>
                    </div>
                    {selectedHospital.address && (
                      <p className="text-slate-400 text-xs flex items-center gap-1 line-clamp-1">
                        <MapPin size={11} className="shrink-0" />{selectedHospital.address}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    {selectedHospital.distance && (
                      <span className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {selectedHospital.distance}
                      </span>
                    )}
                    <button onClick={() => setSelectedHospital(null)} className="text-slate-300 hover:text-slate-500 text-lg font-light">✕</button>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => window.open(selectedHospital.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lng}`, '_blank')}
                    className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Navigation size={16} />
                    Directions
                  </button>
                  {selectedHospital.phone && (
                    <a
                      href={`tel:${selectedHospital.phone}`}
                      className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-all"
                    >
                      <Phone size={16} />
                      Call
                    </a>
                  )}
                  <button
                    onClick={() => navigator.share?.({ title: selectedHospital.name, url: selectedHospital.mapsUrl })}
                    className="bg-slate-100 text-slate-600 p-3 rounded-2xl active:scale-95 transition-all"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
