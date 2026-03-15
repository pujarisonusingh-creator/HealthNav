import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ImageIcon, Sparkles, Download, Loader2, AlertCircle } from 'lucide-react';
import { HospitalService } from '../services/hospitalService';

export default function VisualizerScreen() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Check for API key selection
    if (!(window as any).aistudio?.hasSelectedApiKey()) {
      await (window as any).aistudio?.openSelectKey();
      // Proceed after selection (assuming success as per guidelines)
    }

    setLoading(true);
    setError(null);
    try {
      const service = new HospitalService();
      const result = await service.generateVisual(prompt);
      if (result) {
        setImage(result);
      } else {
        setError("Failed to generate image. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `healthnav-visual-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Visualizer</h1>
        <p className="text-slate-500 font-medium">AI-powered medical illustrations</p>
      </div>

      <div className="bg-slate-900 rounded-[32px] p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-500 p-2 rounded-xl">
            <Sparkles size={20} className="text-white" />
          </div>
          <p className="text-white font-bold text-sm uppercase tracking-widest">Nano Banana 2 Lab</p>
        </div>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Anatomy of a human heart, First aid steps for a burn..."
          className="w-full bg-slate-800 text-white p-4 rounded-2xl border-none focus:ring-2 focus:ring-red-500 h-32 resize-none mb-4"
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
          Generate Illustration
        </button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-2xl flex items-center gap-3 text-red-600">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {image && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="bg-white p-2 rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
            <img src={image} alt="Generated" className="w-full h-auto rounded-[24px]" />
          </div>
          <button
            onClick={handleDownload}
            className="w-full bg-slate-100 text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Download Image
          </button>
        </motion.div>
      )}

      {!image && !loading && (
        <div className="text-center py-12 text-slate-300">
          <ImageIcon size={64} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium">Enter a prompt to start generating</p>
        </div>
      )}
    </div>
  );
}
