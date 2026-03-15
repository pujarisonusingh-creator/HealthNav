import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { HeartPulse } from 'lucide-react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-red-500 flex flex-col items-center justify-center z-[100]">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [1, 1.2, 1], opacity: 1 }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="bg-white p-6 rounded-[40px] shadow-2xl mb-6"
      >
        <HeartPulse size={64} className="text-red-500" />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white text-4xl font-black tracking-tighter"
      >
        HealthNav
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.8 }}
        className="text-red-100 text-sm font-medium mt-2 uppercase tracking-[0.2em]"
      >
        Emergency Access
      </motion.p>
    </div>
  );
}
