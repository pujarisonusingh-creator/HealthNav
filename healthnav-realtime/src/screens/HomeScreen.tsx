import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Search, Navigation, Shield, Wind, Ambulance, Clock,
  AlertCircle, Loader2, SlidersHorizontal, X, HeartPulse,
  Syringe, Droplets, Baby, Building2, Stethoscope, ArrowUpDown,
  RefreshCw, PhoneCall
} from 'lucide-react';
import { Hospital, SortMode } from '../types';
import HospitalCard from '../components/HospitalCard';

interface HomeScreenProps {
  onDetectLocation: () => void;
  hospitals: Hospital[];
  loading: boolean;
  error: string | null;
}

const FACILITY_FILTERS = [
  { id: 'emergency247', label: '24/7 ER', icon: Clock, color: 'red' },
  { id: 'icu', label: 'ICU', icon: Shield, color: 'violet' },
  { id: 'ambulance', label: 'Ambulance', icon: Ambulance, color: 'orange' },
  { id: 'oxygen', label: 'Oxygen', icon: Wind, color: 'sky' },
  { id: 'trauma', label: 'Trauma', icon: HeartPulse, color: 'pink' },
  { id: 'pharmacy', label: 'Pharmacy', icon: Syringe, color: 'emerald' },
  { id: 'bloodBank', label: 'Blood Bank', icon: Droplets, color: 'rose' },
  { id: 'pediatric', label: 'Pediatric', icon: Baby, color: 'blue' },
];

const TYPE_FILTERS = [
  { id: 'all', label: 'All', icon: Building2 },
  { id: 'hospital', label: 'Hospital', icon: Building2 },
  { id: 'clinic', label: 'Clinic', icon: Stethoscope },
];

const colorMap: Record<string, string> = {
  red: 'bg-red-50 text-red-700 border-red-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
  pink: 'bg-pink-50 text-pink-700 border-pink-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function HomeScreen({ onDetectLocation, hospitals, loading, error }: HomeScreenProps) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFilter = (id: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setActiveFilters(new Set());
    setTypeFilter('all');
    setSearchQuery('');
  };

  const filteredHospitals = useMemo(() => {
    let list = [...hospitals];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(h =>
        h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'all') {
      list = list.filter(h => h.type === typeFilter);
    }

    for (const fid of activeFilters) {
      list = list.filter(h => (h.facilities as any)[fid]);
    }

    if (sortMode === 'distance') {
      list.sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
    } else if (sortMode === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === 'type') {
      list.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
    }

    return list;
  }, [hospitals, activeFilters, typeFilter, sortMode, searchQuery]);

  const hasAnyFilter = activeFilters.size > 0 || typeFilter !== 'all' || searchQuery.trim();
  const hasHospitals = hospitals.length > 0;

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <section className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">HealthNav</h1>
          <p className="text-slate-400 text-sm font-medium">Real-time emergency care finder</p>
        </div>
        <a href="tel:112" className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-2 rounded-2xl text-xs font-bold shadow-lg shadow-red-200 active:scale-95 transition-all">
          <PhoneCall size={14} />
          112
        </a>
      </section>

      {/* Location Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onDetectLocation}
        disabled={loading}
        className="w-full bg-slate-900 text-white p-5 rounded-[28px] flex items-center justify-between shadow-xl shadow-slate-200 group disabled:opacity-70"
      >
        <div className="flex items-center gap-4">
          <div className="bg-red-500 p-3 rounded-2xl group-hover:scale-110 transition-transform">
            {loading ? <Loader2 className="text-white animate-spin" size={22} /> : <MapPin className="text-white" size={22} />}
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {loading ? 'Searching...' : hasHospitals ? 'Refresh Location' : 'Emergency'}
            </p>
            <p className="text-base font-bold">
              {loading ? 'Finding hospitals near you' : hasHospitals ? 'Search Again' : 'Find Nearest Hospitals'}
            </p>
          </div>
        </div>
        {hasHospitals && !loading ? (
          <RefreshCw size={18} className="text-slate-400" />
        ) : (
          <Search size={18} className="text-slate-400" />
        )}
      </motion.button>

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-3xl flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-900 font-bold text-sm">Location Error</p>
            <p className="text-red-600 text-xs mt-1">{error}</p>
            <button onClick={onDetectLocation} className="mt-2 text-xs font-bold text-red-500 underline">Try again</button>
          </div>
        </div>
      )}

      {/* Controls (only when hospitals loaded) */}
      {hasHospitals && (
        <>
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search hospitals by name or area…"
              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filter & Sort row */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border transition-all ${
                showFilters || activeFilters.size > 0
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilters.size > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilters.size}
                </span>
              )}
            </button>

            {/* Sort selector */}
            <div className="flex gap-1 flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-1">
              {(['distance', 'name', 'type'] as SortMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all ${
                    sortMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Expandable filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-white border border-slate-100 rounded-3xl p-4 shadow-lg space-y-4"
              >
                {/* Type filter */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Facility Type</p>
                  <div className="flex gap-2">
                    {TYPE_FILTERS.map(t => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTypeFilter(t.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                            typeFilter === t.id
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-50 text-slate-600 border-slate-100'
                          }`}
                        >
                          <Icon size={12} />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Facility filters */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Facilities</p>
                  <div className="grid grid-cols-2 gap-2">
                    {FACILITY_FILTERS.map(f => {
                      const Icon = f.icon;
                      const isActive = activeFilters.has(f.id);
                      return (
                        <button
                          key={f.id}
                          onClick={() => toggleFilter(f.id)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            isActive
                              ? colorMap[f.color] + ' border-current shadow-sm'
                              : 'bg-slate-50 text-slate-500 border-slate-100'
                          }`}
                        >
                          <Icon size={13} />
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {hasAnyFilter && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 flex items-center justify-center gap-2"
                  >
                    <X size={13} />
                    Clear All Filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Results */}
      {hasHospitals && (
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nearby Facilities</h2>
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
              {filteredHospitals.length} of {hospitals.length}
            </span>
          </div>

          {filteredHospitals.length > 0 ? (
            <div className="space-y-3">
              {filteredHospitals.map((hospital, i) => (
                <HospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  rank={i + 1}
                  onDirections={h => window.open(h.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`, '_blank')}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <SlidersHorizontal size={36} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold text-sm">No matches for your filters</p>
              <button onClick={clearFilters} className="mt-2 text-xs text-red-500 font-bold underline">Clear filters</button>
            </div>
          )}
        </section>
      )}

      {/* Empty pre-search state */}
      {!hasHospitals && !loading && !error && (
        <div className="text-center py-16 text-slate-300">
          <Navigation size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-bold text-slate-400">Tap the button above</p>
          <p className="text-xs text-slate-300 mt-1">to find hospitals near your current location</p>
        </div>
      )}
    </div>
  );
}
