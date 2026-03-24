'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../../../../components/dashboard/DashboardLayout';
import { 
  Beaker, 
  Settings, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Info, 
  TrendingUp, 
  Thermometer, 
  Activity,
  Clock,
  Droplets,
  Zap,
  Box
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '../../../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { use } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function LabSimulationPage({ params }: { params: Promise<{ type: string }> }) {
  const { type: labType } = use(params); // dissolution, tablet, emulsion
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  // Simulation Parameters - Dissolution
  const [dissolutionData, setDissolutionData] = useState({
    temp: 37,
    rpm: 50,
    solubility: 0.5,
    samplingInterval: 5,
    totalTime: 60
  });

  // Simulation Parameters - Tablet
  const [tabletData, setTabletData] = useState({
    apiWeight: 500,
    diluentWeight: 200,
    binderWeight: 30,
    disintegrantWeight: 20,
    compressionForce: 5
  });

  // Simulation Parameters - Emulsion
  const [emulsionData, setEmulsionData] = useState({
    oilHLB: 10,
    surfactant1HLB: 15,
    surfactant1Ratio: 0.5,
    surfactant2HLB: 5
  });

  const handleSimulate = async () => {
    setIsRunning(true);
    try {
      let body = {};
      if (labType === 'dissolution') body = dissolutionData;
      else if (labType === 'tablet') body = tabletData;
      else if (labType === 'emulsion') body = emulsionData;

      const response = await api.post(`/api/${labType}/simulate`, body);
      setResults(response.data);
      
      // Calculate Score Based on Type
      let finalScore = 0;
      if (labType === 'dissolution') {
        const tempAccuracy = Math.max(0, 100 - Math.abs(dissolutionData.temp - 37) * 5);
        const rpmAccuracy = Math.max(0, 100 - Math.abs(dissolutionData.rpm - 100) * 0.5);
        finalScore = (tempAccuracy + rpmAccuracy) / 2;
      } else if (labType === 'tablet') {
        finalScore = response.data.quality.passed ? 100 : 50;
      } else if (labType === 'emulsion') {
        finalScore = response.data.stabilityScore;
      }
      
      setScore(Math.round(finalScore));

      // Save Observation
      await api.post('/api/save-observation', {
        labType,
        data: { params: body, results: response.data, score: finalScore }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
      setStep(2); // Show Results
    }
  };

  const dissolutionChart = {
    labels: Array.isArray(results) ? results.map((r: any) => `${r.time}m`) : [],
    datasets: [{
      label: 'Dissolved %',
      data: Array.isArray(results) ? results.map((r: any) => r.concentration) : [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  };

  const tabletChart = {
    labels: ['Hardness (kp)', 'Disintegration (min)'],
    datasets: [{
      label: 'Performance Metrics',
      data: results ? [results.hardness, results.disintegrationTime] : [],
      backgroundColor: ['#3b82f6', '#ef4444'],
      borderRadius: 12,
    }]
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-1/4 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-8">
             <div className="p-3 bg-blue-600 text-white rounded-2xl">
                <Beaker className="w-6 h-6" />
             </div>
             <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">
               {labType.replace(/^\w/, c => c.toUpperCase())} Protocol
             </h2>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto">
            <LabStep number={1} active={step === 0} completed={step > 0} title="Equipment Setup" desc="Configure experimental parameters and environmental conditions." />
            <LabStep number={2} active={step === 1} completed={step > 1} title="Execution" desc="Monitor real-time data flow and reaction metrics." />
            <LabStep number={3} active={step === 2} completed={step > 2} title="Final Analysis" desc="Evaluate results against pharmacopoeial standards." />
          </div>

          <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
             <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black uppercase text-slate-400">Lab Tip</span>
             </div>
             <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
               "{labType === 'dissolution' ? "Temperature must be exactly 37°C." : labType === 'tablet' ? "Watch the binder vs hardness ratio." : "HLB balance is key to stability."}"
             </p>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
             <div className="flex items-center gap-8">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
                   <span className="text-2xl font-black text-blue-600">{score}%</span>
                </div>
                <div className="w-px h-10 bg-slate-100" />
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lab Status</span>
                   <span className={`text-2xl font-black ${isRunning ? 'text-orange-500' : 'text-green-600'}`}>
                      {isRunning ? 'Running...' : 'Standby'}
                   </span>
                </div>
             </div>
             <div className="flex gap-4">
                <button onClick={() => { setStep(0); setResults(null); }} className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all active:scale-95">
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button disabled={isRunning} onClick={handleSimulate} className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 border-b-4 border-blue-800 hover:bg-blue-700 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-3 uppercase text-xs tracking-widest">
                  <Play className="w-4 h-4 fill-current ml-1" />
                  Launch Sim
                </button>
             </div>
          </div>

          <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6">
             
             {/* Dynamic Control Panel */}
             <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm overflow-y-auto">
                <h3 className="text-lg font-black text-slate-800 uppercase mb-8 flex items-center gap-3">
                   <Settings className="w-5 h-5 text-blue-600" />
                   Configuration Matrix
                </h3>
                
                <div className="space-y-8">
                   {labType === 'dissolution' && (
                     <>
                       <ControlSlider label="Temp (°C)" min={25} max={50} value={dissolutionData.temp} icon={<Thermometer className="w-4 h-4" />} onChange={(v: number) => setDissolutionData({...dissolutionData, temp: v})} />
                       <ControlSlider label="Speed (RPM)" min={0} max={200} value={dissolutionData.rpm} icon={<Activity className="w-4 h-4" />} onChange={(v: number) => setDissolutionData({...dissolutionData, rpm: v})} />
                       <ControlSlider label="Interval (Min)" min={1} max={30} value={dissolutionData.samplingInterval} icon={<Clock className="w-4 h-4" />} onChange={(v: number) => setDissolutionData({...dissolutionData, samplingInterval: v})} />
                     </>
                   )}
                   {labType === 'tablet' && (
                     <>
                       <ControlSlider label="API (mg)" min={100} max={1000} value={tabletData.apiWeight} icon={<Zap className="w-4 h-4" />} onChange={(v: number) => setTabletData({...tabletData, apiWeight: v})} />
                       <ControlSlider label="Binder (mg)" min={10} max={100} value={tabletData.binderWeight} icon={<Box className="w-4 h-4" />} onChange={(v: number) => setTabletData({...tabletData, binderWeight: v})} />
                       <ControlSlider label="Disintegrant (mg)" min={5} max={50} value={tabletData.disintegrantWeight} icon={<Activity className="w-4 h-4" />} onChange={(v: number) => setTabletData({...tabletData, disintegrantWeight: v})} />
                       <ControlSlider label="Press Force (kN)" min={1} max={10} value={tabletData.compressionForce} icon={<Settings className="w-4 h-4" />} onChange={(v: number) => setTabletData({...tabletData, compressionForce: v})} />
                     </>
                   )}
                   {labType === 'emulsion' && (
                     <>
                       <ControlSlider label="Oil Requirement (HLB)" min={5} max={20} value={emulsionData.oilHLB} icon={<Droplets className="w-4 h-4" />} onChange={(v: number) => setEmulsionData({...emulsionData, oilHLB: v})} />
                       <ControlSlider label="Surfactant 1 HLB" min={1} max={20} value={emulsionData.surfactant1HLB} icon={<Activity className="w-4 h-4" />} onChange={(v: number) => setEmulsionData({...emulsionData, surfactant1HLB: v})} />
                       <ControlSlider label="Surfactant 1 Ratio" min={0.1} max={0.9} step={0.1} value={emulsionData.surfactant1Ratio} icon={<Settings className="w-4 h-4" />} onChange={(v: number) => setEmulsionData({...emulsionData, surfactant1Ratio: v})} />
                       <ControlSlider label="Surfactant 2 HLB" min={1} max={20} value={emulsionData.surfactant2HLB} icon={<Activity className="w-4 h-4" />} onChange={(v: number) => setEmulsionData({...emulsionData, surfactant2HLB: v})} />
                     </>
                   )}
                </div>
             </div>

             {/* Visualization Panel */}
             <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col">
                <h3 className="text-lg font-black text-white uppercase mb-8 flex items-center gap-3">
                   <TrendingUp className="w-5 h-5 text-blue-400" />
                   {labType === 'dissolution' ? 'Vessel UV-Vis' : labType === 'tablet' ? 'Mechanical Stability' : 'Emulsion Microstructure'}
                </h3>

                <div className="flex-1 flex items-center justify-center">
                   {results ? (
                      labType === 'dissolution' ? (
                        <Line data={dissolutionChart} options={darkLineOptions} />
                      ) : labType === 'tablet' ? (
                        <div className="w-full space-y-8">
                           <Bar data={tabletChart} options={darkBarOptions} />
                           <div className={`p-6 rounded-2xl border-2 ${results.quality.passed ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'} text-center`}>
                              <p className="text-xs font-black uppercase tracking-widest mb-1">Quality Status</p>
                              <p className="text-xl font-bold">{results.quality.feedback}</p>
                           </div>
                        </div>
                      ) : (
                        <div className="text-center w-full">
                           <div className="grid grid-cols-2 gap-4 mb-8">
                              <StatCard label="Calculated HLB" value={results.calculatedHLB} color="blue" />
                              <StatCard label="Stability Score" value={results.stabilityScore} color="purple" />
                           </div>
                           <div className={`p-8 rounded-[2.5rem] border-4 border-dashed shadow-2xl transition-all ${results.state === 'Stable' ? 'border-green-500/40 bg-green-500/5 animate-pulse' : 'border-red-500/40 bg-red-500/5'}`}>
                              <Droplets className={`w-20 h-20 mx-auto mb-4 ${results.state === 'Stable' ? 'text-green-500' : 'text-red-500'}`} />
                              <h4 className="text-3xl font-black text-white uppercase">{results.state}</h4>
                              <p className="text-slate-400 mt-2 font-medium italic">{results.feedback}</p>
                           </div>
                        </div>
                      )
                   ) : (
                      <div className="text-center animate-pulse">
                         <div className="w-20 h-20 bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-600">
                            <Activity className="w-10 h-10" />
                          </div>
                         <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Waiting for Lab Execution...</p>
                      </div>
                   )}
                </div>
             </div>

          </div>

        </div>

      </div>

      <AnimatePresence>
        {showIntro && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[4rem] p-16 text-center">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10"><Beaker className="w-12 h-12" /></div>
                <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter mb-6">{labType} Simulation</h2>
                <p className="text-slate-500 font-medium text-lg mb-12 italic">
                   "Master the professional standards of pharmaceutical formulation in a high-fidelity virtual environment."
                </p>
                <button onClick={() => setShowIntro(false)} className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl shadow-2xl uppercase tracking-widest text-sm">Proceed to Workstation</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

// UI Helpers
function LabStep({ number, active, completed, title, desc }: any) {
  return (
    <div className={`flex gap-5 transition-all ${active ? 'opacity-100' : 'opacity-40'}`}>
       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${completed ? 'bg-green-100 text-green-600' : active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
          {completed ? <CheckCircle2 className="w-5 h-5" /> : number}
       </div>
       <div className="flex-1"><h4 className="font-black text-slate-800 text-sm uppercase">{title}</h4><p className="text-[11px] font-medium text-slate-500 leading-normal mt-1">{desc}</p></div>
    </div>
  );
}

function ControlSlider({ label, min, max, value, onChange, icon, step = 1 }: any) {
  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">{icon}{label}</label>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black">{value}</span>
       </div>
       <input type="range" step={step} min={min} max={max} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
    </div>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div className={`p-6 bg-slate-800/50 rounded-2xl border border-slate-700`}>
       <p className="text-[8px] font-black text-slate-500 uppercase mb-1">{label}</p>
       <p className={`text-2xl font-black text-${color}-400`}>{value}</p>
    </div>
  );
}

const darkLineOptions = {
  responsive: true,
  scales: {
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { weight: 'bold' as const } } },
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { weight: 'bold' as const } } }
  },
  plugins: { legend: { display: false } }
};

const darkBarOptions = {
  responsive: true,
  scales: {
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
  },
  plugins: { legend: { display: false } }
};
