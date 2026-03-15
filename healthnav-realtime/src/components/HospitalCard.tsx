import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Phone, Navigation, Share2, Shield, Wind, Ambulance, Clock,
  Radio, Globe, ChevronDown, ChevronUp, Syringe, Droplets, HeartPulse, Baby,
  Building2, Stethoscope
} from 'lucide-react';
import { Hospital } from '../types';

interface HospitalCardProps {
  hospital: Hospital;
  onDirections: (hospital: Hospital) => void;
  rank?: number;
}

const facilityConfig = [
  { key: 'emergency247', label: '24/7 ER', icon: Clock, color: 'bg-red-50 text-red-700 border-red-100' },
  { key: 'icu', label: 'ICU', icon: Shield, color: 'bg-violet-50 text-violet-700 border-violet-100' },
  { key: 'ambulance', label: 'Ambulance', icon: Ambulance, color: 'bg-orange-50 text-orange-700 border-orange-100' },
  { key: 'oxygen', label: 'Oxygen', icon: Wind, color: 'bg-sky-50 text-sky-700 border-sky-100' },
  { key: 'trauma', label: 'Trauma', icon: HeartPulse, color: 'bg-pink-50 text-pink-700 border-pink-100' },
  { key: 'pharmacy', label: 'Pharmacy', icon: Syringe, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { key: 'bloodBank', label: 'Blood Bank', icon: Droplets, color: 'bg-rose-50 text-rose-700 border-rose-100' },
  { key: 'pediatric', label: 'Pediatric', icon: Baby, color: 'bg-blue-50 text-blue-700 border-blue-100' },
];

const typeConfig: Record<string, { label: string; icon: typeof Building2; color: string }> = {
  hospital: { label: 'Hospital', icon: Building2, color: 'bg-slate-900 text-white' },
  clinic: { label: 'Clinic', icon: Stethoscope, color: 'bg-teal-600 text-white' },
  emergency: { label: 'Emergency', icon: HeartPulse, color: 'bg-red-600 text-white' },
};

export default function HospitalCard({ hospital, onDirections, rank }: HospitalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isRealData = hospital.id.startsWith('osm-');
  const activeFacilities = facilityConfig.filter(f => (hospital.facilities as any)[f.key]);
  const typeInfo = typeConfig[hospital.type || 'hospital'] || typeConfig.hospital;
  const TypeIcon = typeInfo.icon;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: hospital.name,
        text: `${hospital.name}\n${hospital.address}\n${hospital.distance} away`,
        url: hospital.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`,
      });
    } else {
      navigator.clipboard?.writeText(
        `${hospital.name} — ${hospital.address} — ${hospital.mapsUrl || ''}`
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {rank && rank <= 3 && (
            <span className="shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
              {rank}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-slate-900 leading-tight">{hospital.name}</h3>
              {isRealData && (
                <span className="shrink-0 flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tight border border-emerald-100">
                  <Radio size={8} className="animate-pulse" /> Live
                </span>
              )}
            </div>
            {hospital.address ? (
              <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5 line-clamp-1">
                <MapPin size={11} className="shrink-0" />
                {hospital.address}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${typeInfo.color}`}>
            <TypeIcon size={10} />
            {typeInfo.label}
          </span>
          {hospital.distance && (
            <span className="text-xs font-black text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
              {hospital.distance}
            </span>
          )}
        </div>
      </div>

      {/* Facility pills */}
      {activeFacilities.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {activeFacilities.map(f => {
            const Icon = f.icon;
            return (
              <span key={f.key} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${f.color}`}>
                <Icon size={10} />
                {f.label}
              </span>
            );
          })}
          {activeFacilities.length === 0 && (
            <span className="text-[10px] text-slate-300 italic">No facility data available</span>
          )}
        </div>
      )}

      {/* Action row */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => onDirections(hospital)}
          className="flex-1 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
        >
          <Navigation size={16} />
          Directions
        </button>
        {hospital.phone && (
          <a
            href={`tel:${hospital.phone}`}
            className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-4 py-3 rounded-2xl font-bold text-sm transition-all"
          >
            <Phone size={16} />
            Call
          </a>
        )}
        <button
          onClick={handleShare}
          className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 p-3 rounded-2xl transition-all"
          aria-label="Share"
        >
          <Share2 size={16} />
        </button>
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 p-3 rounded-2xl transition-all"
          aria-label="More details"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expandable details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-50"
          >
            <div className="px-5 py-4 space-y-3 bg-slate-50/50">
              {hospital.address && (
                <DetailRow icon={<MapPin size={14} className="text-slate-400" />} label="Address" value={hospital.address} />
              )}
              {hospital.phone && (
                <DetailRow icon={<Phone size={14} className="text-slate-400" />} label="Phone" value={hospital.phone} />
              )}
              {hospital.website && (
                <DetailRow
                  icon={<Globe size={14} className="text-slate-400" />}
                  label="Website"
                  value={
                    <a href={hospital.website} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 underline text-xs font-medium truncate max-w-[180px] block">
                      {hospital.website.replace(/^https?:\/\//, '')}
                    </a>
                  }
                />
              )}
              <div className="pt-2 flex gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-xs font-bold py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Google Maps
                </a>
                <a
                  href={`https://maps.apple.com/?daddr=${hospital.lat},${hospital.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-xs font-bold py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Apple Maps
                </a>
                <a
                  href={`https://waze.com/ul?ll=${hospital.lat},${hospital.lng}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-xs font-bold py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Waze
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
        {typeof value === 'string'
          ? <p className="text-xs text-slate-700 font-medium mt-0.5">{value}</p>
          : value}
      </div>
    </div>
  );
}
