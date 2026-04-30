import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CheckCircle, Clock, AlertTriangle, TrendingUp, Trophy, Building2, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';

import { INSTITUTIONS, InstitutionExtended } from '../constants';
import InstitutionDetail from './InstitutionDetail';
import { AnimatePresence } from 'motion/react';

const DATA = [
  { name: 'الطرق', count: 45 },
  { name: 'المياه', count: 32 },
  { name: 'الكهرباء', count: 18 },
  { name: 'النفايات', count: 28 },
];

const PIE_DATA = [
  { name: 'مكتمل', value: 400, color: '#10b981' },
  { name: 'قيد المراجعة', value: 300, color: '#f59e0b' },
  { name: 'تحت التنفيذ', value: 200, color: '#ef4444' },
];

const INSTITUTIONAL_KPI_MAPPING = [
  { id: 'roads', score: 92, speed: '١.٥ يوم', trend: '+٥٪' },
  { id: 'electricity', score: 88, speed: '٢.٢ يوم', trend: '+٢٪' },
  { id: 'water', score: 84, speed: '٣.١ يوم', trend: '-١٪' },
  { id: 'environment', score: 79, speed: '٤.٠ يوم', trend: '+٨٪' }
];

export default function ExecutionStats() {
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionExtended | null>(null);
  const [selectedRank, setSelectedRank] = useState<number | undefined>(undefined);

  return (
    <div className="p-6 lg:p-8 space-y-8 pb-32 overflow-y-auto no-scrollbar h-full bg-white/50" dir="rtl">
      <div className="flex justify-between items-end border-r-[6px] border-emerald-600 pr-5 py-1">
        <div className="space-y-2 text-right">
          <div className="flex items-center gap-3 justify-end">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            <h2 className="text-4xl font-black font-display text-slate-900 leading-none italic uppercase tracking-tight">مركز الشفافية والمساءلة</h2>
          </div>
          <p className="text-[11px] font-black font-mono text-slate-400 italic leading-none uppercase tracking-[0.4em]">MISSION_CONTROL // NATIONAL_PERFORMANCE_AUDIT</p>
        </div>
      </div>

      {/* Primary KPI Grid - High Precision */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          icon={<ShieldCheck className="text-emerald-500" size={24} />}
          label="الالتزام بالوقت (SLA)"
          value="٨٤٪"
          delta="+٤٪"
          type="success"
        />
        <MetricCard 
          icon={<Clock className="text-amber-500" size={24} />}
          label="متوسط سرعة الرد"
          value="٢.٤ يوم"
          delta="-٠.٣ يوم"
          type="info"
        />
        <MetricCard 
          icon={<AlertTriangle className="text-rose-500" size={24} />}
          label="حالات عالية الأهمية"
          value="١٨"
          delta="URGENT"
          type="danger"
        />
        <MetricCard 
          icon={<CheckCircle className="text-blue-500" size={24} />}
          label="رضا المواطنين"
          value="٤.٦ / ٥"
          delta="HIGH"
          type="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Chart - Technical Style */}
        <div className="umran-card lg:col-span-2 p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-full opacity-[0.01] pointer-events-none sudan-texture scale-110" />
          <div className="flex justify-between items-center mb-6">
             <div className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] font-mono border border-slate-200">OPERATIONAL_NODES // ADVISORIES</div>
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono text-right">DISTRIBUTION_METRICS //</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 900 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.05)', radius: 16 }}
                  contentStyle={{ borderRadius: '24px', border: '2px solid #f1f5f9', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.1)', textAlign: 'right', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[16, 16, 4, 4]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Impact - Focused Card */}
        <div className="flex flex-col gap-6">
            <div className="flex-1 p-6 lg:p-8 bg-emerald-600 text-white rounded-3xl lg:rounded-[2.5rem] space-y-4 shadow-xl relative overflow-hidden group border-2 border-emerald-500">
               <div className="absolute top-0 right-0 w-48 h-full opacity-[0.1] pointer-events-none sudan-texture scale-125 rotate-12" />
               <div className="flex justify-between items-center flex-row-reverse relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                    <TrendingUp size={24} />
                  </div>
                  <span className="text-[9px] font-black text-emerald-200 uppercase tracking-[0.3em] font-mono">كفاءة الحل الكلية //</span>
               </div>
               <div className="relative z-10">
                  <div className="text-5xl font-black font-mono tracking-tighter leading-none mb-3">٧٨.٤٪</div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                    <ArrowUpRight size={12} className="text-emerald-300" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-100">+٥.٢٪_نمو_شهري</span>
                  </div>
               </div>
               <p className="text-xs text-emerald-50/80 font-medium leading-relaxed text-right italic font-sans relative z-10">
                  تحسن استراتيجي في جودة الاستجابة وسرعة الإغلاق الفني.
               </p>
            </div>
        </div>
      </div>

      {/* Institutional Leaderboard - High Fidelity */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <div className="text-right">
             <h3 className="text-2xl font-black text-slate-950 font-display leading-none mb-1">ترتيب كفاءة المؤسسات</h3>
             <p className="text-[11px] font-black text-slate-400 font-mono">مؤشر أداء المؤسسات // التقارير</p>
          </div>
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100 shadow-xl shadow-amber-100/50">
            <Trophy size={28} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INSTITUTIONAL_KPI_MAPPING.map((kpi, idx) => {
            const inst = INSTITUTIONS.find(i => i.id === kpi.id);
            if (!inst) return null;
            
            return (
              <motion.div 
                key={inst.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => {
                  setSelectedInstitution(inst);
                  setSelectedRank(idx + 1);
                }}
                className="umran-card p-8 group cursor-pointer active:scale-95 transition-all duration-300"
              >
                <div className="flex justify-between items-center flex-row-reverse gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-end mb-1">
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[24px] font-black font-mono text-slate-900 tracking-tighter">{kpi.score}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] font-mono">مؤشر كفاءة الإنجاز // KPI</span>
                          <div className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black shadow-sm ring-2 ring-white shrink-0",
                            idx === 0 ? "bg-amber-100 text-amber-600" :
                            idx === 1 ? "bg-slate-100 text-slate-600" :
                            "bg-orange-50 text-orange-700"
                          )}>
                            #{idx + 1}
                          </div>
                        </div>
                        <h4 className="text-lg font-black text-slate-950 group-hover:text-emerald-700 transition-colors leading-tight font-display">{inst.fullName}</h4>
                      </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${kpi.score}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: idx * 0.2 }}
                        className="absolute inset-y-0 right-0 bg-gradient-to-l from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      />
                    </div>

                    {/* Metric Row */}
                    <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-3 rounded-2xl border border-slate-50">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className={cn(kpi.trend.startsWith('+') ? "text-emerald-500" : "text-rose-500")} />
                        <span className={cn(
                          "text-[10px] font-black font-mono",
                          kpi.trend.startsWith('+') ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {kpi.trend}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 italic">{kpi.speed}</span>
                        <Clock size={12} className="text-slate-300" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-24 h-24 bg-white border-4 border-slate-50 rounded-[2.5rem] flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3 shrink-0 relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {inst.logo ? (
                      <img src={inst.logo} className="w-full h-full object-cover p-3 relative z-10" referrerPolicy="no-referrer" />
                    ) : (
                      <Building2 size={40} className="text-slate-200" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedInstitution && (
          <InstitutionDetail 
            institution={selectedInstitution}
            onClose={() => setSelectedInstitution(null)}
            rank={selectedRank}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ icon, label, value, delta, type }: { icon: React.ReactNode; label: string, value: string, delta: string, type: 'success' | 'info' | 'danger' | 'primary' }) {
  return (
    <div className="umran-card p-5 space-y-4 text-right relative overflow-hidden group hover:-translate-y-1 hover:border-emerald-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5">
      {/* Corner HUD Accents */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-slate-200 group-hover:border-emerald-400 group-hover:opacity-50 transition-all" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-slate-200 group-hover:border-emerald-400 group-hover:opacity-50 transition-all" />

      <div className="flex justify-between items-start flex-row-reverse relative z-10">
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-6 group-hover:scale-105 transition-all duration-500 shadow-sm relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100" />
             {icon}
          </div>
          <div className="text-[6px] font-black text-slate-300 font-mono tracking-[0.2em] group-hover:text-emerald-500/50">SENSOR_ACTIVE</div>
        </div>
        <div className={cn(
          "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.1em] border shadow-sm font-mono backdrop-blur-sm",
          type === 'success' ? "bg-emerald-50/80 border-emerald-200/50 text-emerald-600" :
          type === 'info' ? "bg-amber-50/80 border-amber-200/50 text-amber-600" :
          type === 'danger' ? "bg-rose-50/80 border-rose-200/50 text-rose-600 animate-pulse" :
          "bg-blue-50/80 border-blue-200/50 text-blue-600"
        )}>
          {delta}
        </div>
      </div>
      <div className="space-y-1 relative z-10">
        <div className="text-3xl lg:text-4xl font-black font-mono text-slate-950 tracking-tighter leading-none group-hover:translate-x-1 transition-transform">{value}</div>
        <div className="text-[9px] font-black text-slate-400 font-mono group-hover:text-slate-900 transition-colors uppercase tracking-widest">{label}</div>
      </div>
      
      {/* Background Graphic */}
      <div className="absolute -bottom-4 -left-4 w-16 h-16 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700 pointer-events-none">
        {icon}
      </div>

      <div className="h-1 w-0 group-hover:w-full bg-emerald-500 absolute bottom-0 right-0 transition-all duration-700 shadow-[0_0_10px_#10b981]" />
    </div>
  );
}
