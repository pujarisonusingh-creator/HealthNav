import React from 'react';
import { motion } from 'motion/react';
import { Home, Map as MapIcon, History, ShieldCheck, Info } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

const navItems = [
  { id: 'home' as Screen, icon: Home, label: 'Home' },
  { id: 'map' as Screen, icon: MapIcon, label: 'Map' },
  { id: 'history' as Screen, icon: History, label: 'History' },
  { id: 'admin' as Screen, icon: ShieldCheck, label: 'Admin' },
];

export default function BottomNav({ activeScreen, onScreenChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
      <nav className="bg-white/90 backdrop-blur-lg border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/60 px-3 py-2.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={`relative flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-200 min-w-[56px] ${
                isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-slate-100 rounded-2xl -z-10"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
