import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Plus, Trash2, Save, Loader2, Phone, MapPin, X, CheckCircle2 } from 'lucide-react';
import { Hospital } from '../types';

const FACILITY_LABELS: Record<string, string> = {
  icu: 'ICU',
  oxygen: 'Oxygen',
  ambulance: 'Ambulance',
  emergency247: '24/7 ER',
  pharmacy: 'Pharmacy',
  bloodBank: 'Blood Bank',
  trauma: 'Trauma',
  pediatric: 'Pediatric',
};

const defaultFacilities = {
  icu: false, oxygen: false, ambulance: false, emergency247: false,
  pharmacy: false, bloodBank: false, trauma: false, pediatric: false,
};

export default function AdminScreen() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Partial<Hospital>>({
    name: '', address: '', lat: 0, lng: 0, phone: '',
    facilities: { ...defaultFacilities },
  });

  useEffect(() => { fetchHospitals(); }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hospitals');
      setHospitals(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: Date.now().toString() }),
      });
      if (res.ok) {
        setSuccess(true);
        setIsAdding(false);
        setFormData({ name: '', address: '', lat: 0, lng: 0, phone: '', facilities: { ...defaultFacilities } });
        fetchHospitals();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-100 text-slate-800 text-sm p-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder:text-slate-400 font-medium";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin</h1>
          <p className="text-slate-400 text-sm font-medium">Manage custom hospitals</p>
        </div>
        <button
          onClick={() => setIsAdding(v => !v)}
          className={`p-3 rounded-2xl shadow-md transition-all active:scale-95 ${isAdding ? 'bg-slate-200 text-slate-600' : 'bg-slate-900 text-white'}`}
        >
          {isAdding ? <X size={22} /> : <Plus size={22} />}
        </button>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-2xl text-sm font-bold">
          <CheckCircle2 size={18} /> Hospital added successfully!
        </motion.div>
      )}

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 space-y-3"
          >
            <h2 className="text-base font-bold text-slate-900">Add Hospital</h2>
            <input type="text" placeholder="Hospital Name *" required className={inputClass}
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <input type="text" placeholder="Address" className={inputClass}
              value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="any" placeholder="Latitude *" required className={inputClass}
                value={formData.lat || ''} onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) })} />
              <input type="number" step="any" placeholder="Longitude *" required className={inputClass}
                value={formData.lng || ''} onChange={e => setFormData({ ...formData, lng: parseFloat(e.target.value) })} />
            </div>
            <input type="tel" placeholder="Phone (optional)" className={inputClass}
              value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Facilities</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(FACILITY_LABELS).map(([key, label]) => (
                  <label key={key} className={`flex items-center gap-2.5 p-3 rounded-xl cursor-pointer border transition-all ${
                    (formData.facilities as any)?.[key]
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-slate-50 border-slate-100 text-slate-600'
                  }`}>
                    <input type="checkbox" className="hidden"
                      checked={(formData.facilities as any)?.[key] || false}
                      onChange={e => setFormData({
                        ...formData,
                        facilities: { ...formData.facilities!, [key]: e.target.checked } as any,
                      })} />
                    <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                      (formData.facilities as any)?.[key] ? 'bg-red-500 border-red-500' : 'border-slate-300'
                    }`}>
                      {(formData.facilities as any)?.[key] && <div className="w-2 h-2 bg-white rounded-sm" />}
                    </div>
                    <span className="text-xs font-bold">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Hospital
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" size={28} /></div>
        ) : hospitals.length > 0 ? (
          hospitals.map(h => (
            <div key={h.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl shrink-0">
                <ShieldCheck size={18} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{h.name}</p>
                <p className="text-xs text-slate-400 truncate">{h.address || 'No address'}</p>
              </div>
              <span className="shrink-0 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-100 uppercase">Custom</span>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-slate-300">
            <ShieldCheck size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-bold text-slate-400 text-sm">No custom hospitals yet</p>
            <p className="text-xs text-slate-300 mt-1">Tap + to add your own entries</p>
          </div>
        )}
      </div>
    </div>
  );
}
