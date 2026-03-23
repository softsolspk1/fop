"use client";

import React, { useState } from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Play, Activity, Save, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DissolutionLab() {
  const { user } = useAuth();
  const [rpm, setRpm] = useState(50);
  const [solubilityFactor, setSolubilityFactor] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success'|'error'} | null>(null);

  const runSimulation = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const res = await api.post("/api/dissolution/simulate", {
        rpm: Number(rpm),
        solubilityFactor: Number(solubilityFactor),
        timePoints: [5, 10, 15, 20, 30, 45, 60]
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Simulation failed to run.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveObservation = async () => {
    if (!data.length) return;
    try {
      setSaving(true);
      await api.post("/api/save", {
        labType: "Dissolution Test",
        data: { rpm, solubilityFactor, results: data }
      });
      setMessage({ text: 'Observation saved successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to save observation.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const chartData = {
    labels: data.map(d => `${d.time} min`),
    datasets: [{
      label: "Drug Release %",
      data: data.map(d => d.release),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      tension: 0.3,
      fill: true,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Dissolution Profile',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Release (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time (minutes)'
        }
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dissolution Test</h2>
            <p className="text-slate-500 font-medium">Simulate drug release over time based on RPM and solubility factors.</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 font-medium text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            <Info className="w-5 h-5" />
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 lg:col-span-1 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Parameters</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Stirrer Speed (RPM)</label>
                  <span className="text-sm font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">{rpm}</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="150"
                  step="5"
                  value={rpm}
                  onChange={(e) => setRpm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Solubility Factor</label>
                  <span className="text-sm font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">{solubilityFactor}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={solubilityFactor}
                  onChange={(e) => setSolubilityFactor(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            <div className="space-y-3 pt-6">
              <button 
                onClick={runSimulation}
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 text-white font-black rounded-xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                RUN SIMULATION
              </button>
              
              {data.length > 0 && (
                <button 
                  onClick={saveObservation}
                  disabled={saving}
                  className="w-full py-3.5 bg-slate-800 text-white font-black rounded-xl shadow-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  SAVE OBSERVATION
                </button>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 lg:col-span-2 min-h-[400px] flex flex-col justify-center">
            {data.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-full p-4"
              >
                <Line data={chartData} options={chartOptions} />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 h-full">
                <Activity className="w-16 h-16 mb-4 text-slate-200" />
                <p className="font-medium">Run the simulation to see dissolution results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
