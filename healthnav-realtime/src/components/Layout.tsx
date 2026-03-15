import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen?: Screen;
}

export default function Layout({ children, activeScreen }: LayoutProps) {
  const isMap = activeScreen === 'map';

  if (isMap) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <AnimatePresence mode="wait">
        <motion.main
          key={activeScreen}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md mx-auto px-5 pt-8"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
