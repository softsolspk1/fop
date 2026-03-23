"use client";

import React, { useState } from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Play, Beaker, Save, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';

export default function EmulsionLab() {
  const { user } = useAuth();
  const [oilRatio, setOilRatio] = useState(50);
  const [emulsifier, setEmulsifier] = useState("Tween");
  const [speed, setSpeed] = useState(1000);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success'|'error'} | null>(null);

  const simulate = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const res = await api.post("/api/emulsion/simulate", {
        oilRatio: Number(oilRatio),
        emulsifier,
        speed: Number(speed)
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Simulation failed to run.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveObservation = async () => {
    if (!result) return;
    try {
      setSaving(true);
      await api.post("/api/save", {
        labType: "Emulsion Preparation",
        data: { oilRatio, emulsifier, speed, results: result }
      });
      setMessage({ text: 'Observation saved successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to save observation.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Emulsion Preparation</h2>
            <p className="text-slate-500 font-medium">Determine stability of emulsion based on ingredients and mixing speed.</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 font-medium text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            <Info className="w-5 h-5" />
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 flex flex-col justify-between">
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Beaker className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Parameters</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Oil Ratio (%)</label>
                  <span className="text-sm font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">{oilRatio}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={oilRatio}
                  onChange={(e) => setOilRatio(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 block">Emulsifier</label>
                <select 
                  value={emulsifier}
                  onChange={(e) => setEmulsifier(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                >
                  <option value="Tween">Tween (Hydrophilic)</option>
                  <option value="Span">Span (Lipophilic)</option>
                  <option value="Natural">Natural Gums</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Mixing Speed (RPM)</label>
                  <span className="text-sm font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">{speed}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
              </div>
            </div>

            <div className="space-y-3 pt-8">
              <button 
                onClick={simulate}
                disabled={loading}
                className="w-full py-3.5 bg-orange-600 text-white font-black rounded-xl shadow-lg border-b-4 border-orange-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                RUN SIMULATION
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 flex flex-col items-center justify-center min-h-[400px]">
            {result ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full space-y-6"
              >
                <div className="text-center pb-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800">Emulsion Stability</h3>
                  <p className="text-slate-500 text-sm">Based on thermodynamic calculations</p>
                </div>
                
                <div className="flex flex-col items-center gap-6">
                  <div className={`p-8 rounded-full border-8 shadow-inner flex items-center justify-center w-48 h-48 ${result.result === 'Stable' ? 'border-green-100 bg-green-50 text-green-600' : 'border-red-100 bg-red-50 text-red-600'}`}>
                    <div className="text-center">
                      <p className="text-3xl font-black tracking-tight">{result.result}</p>
                      <p className="text-sm mt-1 font-bold opacity-80 uppercase tracking-widest">Status</p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 shadow-sm flex items-center justify-between px-8">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Stability Score</p>
                    <p className="text-2xl font-black text-slate-800">{result.stabilityScore} <span className="text-sm text-slate-500 font-medium tracking-normal">/ 100</span></p>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={saveObservation}
                    disabled={saving}
                    className="w-full py-3.5 bg-slate-800 text-white font-black rounded-xl shadow-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    SAVE OBSERVATION
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 h-full">
                <Beaker className="w-16 h-16 mb-4 text-slate-200" />
                <p className="font-medium">Adjust parameters and run simulation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
