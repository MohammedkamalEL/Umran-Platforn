import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, MessageSquare, TrendingUp, Award, Crown, Building } from 'lucide-react';
import { REGIONS } from '../constants';
import { cn } from '../lib/utils';

export default function RegionalCompetition() {
  const sortedRegions = [...REGIONS].sort((a, b) => b.totalPoints - a.totalPoints);
  
  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between border-r-4 border-emerald-500 pr-4">
        <div className="text-right">
          <h3 className="text-2xl font-black text-slate-800 font-display tracking-tight uppercase">مؤشر التفاعل الميداني</h3>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] font-mono italic">متعقب الأقاليم // تقرير الوضع الحالي</p>
        </div>
        <div className="p-4 rounded-[1.5rem] bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm rotate-3">
          <Trophy size={24} strokeWidth={2.5} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedRegions.map((region, index) => (
          <motion.div
            key={region.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-700"
          >
            {/* Corner HUD Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-slate-100 group-hover:border-emerald-400 group-hover:opacity-60 transition-all rounded-tl-[3.5rem]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-slate-100 group-hover:border-emerald-400 group-hover:opacity-60 transition-all rounded-br-[3.5rem]" />

            <div className="flex flex-col sm:flex-row relative">
              <div className="w-full sm:w-48 h-48 relative overflow-hidden bg-white border-l border-slate-100">
                <img 
                  src={region.imageUrl} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[2s]" 
                  alt={region.name} 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute inset-0 tech-grid opacity-10 mix-blend-overlay pointer-events-none" />
                
                <div className="absolute top-4 right-4 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[7px] font-mono text-slate-400 tracking-[0.2em] uppercase">
                   DATA_SET // {region.id?.toUpperCase() || 'NODE'}
                </div>

                {index === 0 && (
                   <div className="absolute top-4 left-4 bg-amber-400 text-white p-2 rounded-xl shadow-xl shadow-amber-200 rotate-12 group-hover:rotate-0 transition-transform z-20">
                     <Crown size={18} fill="currentColor" />
                   </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center px-2">
                   <div className="flex flex-col items-start">
                      <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1 font-mono">ACTIVITY_LEVEL</span>
                      <div className="h-1 w-20 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(region.totalPoints / sortedRegions[0].totalPoints) * 100}%` }}
                          transition={{ duration: 2 }}
                          className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" 
                        />
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex-1 p-6 lg:p-8 text-right bg-white relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 sm:gap-0">
                  <div className="flex flex-col items-start px-2 w-full sm:w-auto mt-1">
                     <div className="flex flex-row-reverse flex items-center gap-2 mb-2">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">SCORE_WEIGHT</span>
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                     </div>
                     <div className="text-[10px] font-black font-mono text-slate-900 bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg">
                        SYSTEM_VALIDATED // AUTH_TRUE
                     </div>
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-2 justify-end mb-1.5 relative z-10">
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] font-mono italic">REGIONAL_NODE // LIVE</span>
                       <Building size={12} className="text-emerald-500" />
                    </div>
                    <h4 className="text-3xl lg:text-4xl font-black text-slate-950 font-display tracking-tight leading-none mb-1 relative z-10 italic">{region.name}</h4>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] font-mono italic relative z-10 flex items-center justify-end gap-2">
                      <div className="w-4 h-[1px] bg-slate-200" />
                      CAPITAL // {region.capital}
                    </span>
                  </div>
                </div>

                <div className="flex gap-10 justify-start relative z-10 pt-2">
                  <div className="flex flex-col items-start gap-1 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50 group-hover:bg-white group-hover:border-slate-200 transition-all">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 font-mono">TOTAL_RECONSTRUCTION_XP</span>
                     <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md">
                         <TrendingUp size={14} />
                       </div>
                       <span className="text-2xl font-black text-slate-950 font-mono tracking-tighter leading-none">{region.totalPoints.toLocaleString()}</span>
                     </div>
                  </div>
                  <div className="flex flex-col items-start gap-1 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50 group-hover:bg-white group-hover:border-slate-200 transition-all">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 font-mono">FIELD_REPORTS_SUBMITTED</span>
                     <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md">
                         <MessageSquare size={14} />
                       </div>
                       <span className="text-2xl font-black text-slate-950 font-mono tracking-tighter leading-none">{region.totalReports}</span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="px-10 py-6 border-t sm:border-t-0 sm:border-r-2 border-slate-100 flex flex-row sm:flex-col items-center justify-between sm:justify-center bg-slate-50/50 backdrop-blur-xl transition-all duration-700 min-w-[140px] group-hover:bg-emerald-600 group-hover:border-emerald-500 group-hover:text-white relative">
                <div className="absolute top-2 right-2 flex gap-0.5 opacity-20 group-hover:opacity-100">
                   {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-current" />)}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] sm:mb-2 font-mono group-hover:text-emerald-500">RANK_ID</span>
                <div className="flex flex-col items-center">
                  <span className="text-4xl sm:text-6xl font-black font-mono italic tracking-tighter leading-none group-hover:text-white transition-colors duration-500">#{index + 1}</span>
                  <div className="hidden sm:block w-full h-[2px] bg-slate-200/50 mt-4 group-hover:bg-emerald-500/30 transition-all" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
