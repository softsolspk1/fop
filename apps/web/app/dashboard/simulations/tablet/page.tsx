"use client";

import React, { useState } from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Play, FlaskConical, Save, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';

export default function TabletLab() {
  const { user } = useAuth();
  const [binder, setBinder] = useState(5);
  const [disintegrant, setDisintegrant] = useState(5);
  const [lubricant, setLubricant] = useState(2);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success'|'error'} | null>(null);

  const simulate = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const res = await api.post("/api/tablet/simulate", {
        binder: Number(binder),
        disintegrant: Number(disintegrant),
        lubricant: Number(lubricant)
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
        labType: "Tablet Formulation",
        data: { binder, disintegrant, lubricant, results: result }
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
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Tablet Formulation</h2>
            <p className="text-slate-500 font-medium">Calculate hardness, disintegration, and dissolution based on ingredients.</p>
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
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Ingredients</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Binder (%)</label>
                  <span className="text-sm font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">{binder}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={binder}
                  onChange={(e) => setBinder(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Disintegrant (%)</label>
                  <span className="text-sm font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">{disintegrant}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={disintegrant}
                  onChange={(e) => setDisintegrant(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Lubricant (%)</label>
                  <span className="text-sm font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">{lubricant}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={lubricant}
                  onChange={(e) => setLubricant(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>

            <div className="space-y-3 pt-8">
              <button 
                onClick={simulate}
                disabled={loading}
                className="w-full py-3.5 bg-purple-600 text-white font-black rounded-xl shadow-lg border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <h3 className="text-lg font-bold text-slate-800">Formulation Results</h3>
                  <p className="text-slate-500 text-sm">Predicted properties of the tablet</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Hardness</p>
                    <p className="text-2xl font-black text-slate-800">{result.hardness} <span className="text-sm text-slate-500 font-medium block mt-1">kg/cm²</span></p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Disintegration</p>
                    <p className="text-2xl font-black text-slate-800">{result.disintegration} <span className="text-sm text-slate-500 font-medium block mt-1">mins</span></p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Dissolution</p>
                    <p className="text-2xl font-black text-slate-800">{result.dissolution}% <span className="text-sm text-slate-500 font-medium block mt-1">in 30 mins</span></p>
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
                <FlaskConical className="w-16 h-16 mb-4 text-slate-200" />
                <p className="font-medium">Adjust ingredients and run simulation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
