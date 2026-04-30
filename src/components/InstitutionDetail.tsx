import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Building2, MapPin, ExternalLink, Award, ShieldCheck, Trophy } from 'lucide-react';
import { InstitutionExtended } from '../constants';
import { cn } from '../lib/utils';

interface InstitutionDetailProps {
  institution: InstitutionExtended;
  onClose: () => void;
  rank?: number;
}

export default function InstitutionDetail({ institution, onClose, rank }: InstitutionDetailProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-white/40 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="relative w-full max-w-2xl bg-white rounded-[4rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        dir="rtl"
      >
        {/* Header Visual */}
        <div className="h-32 bg-slate-100 relative shrink-0">
          <div className="absolute inset-0 opacity-10 sudan-pattern-modern" />
          <div 
            className="absolute inset-0 opacity-20" 
            style={{ backgroundColor: institution.accentColor }} 
          />
          
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-900 border border-slate-200 hover:bg-white transition-all z-20"
          >
            <X size={20} />
          </button>

          {rank !== undefined && (
            <div className="absolute top-6 right-6 px-4 py-2 bg-amber-500 text-white rounded-2xl shadow-xl shadow-amber-200 flex items-center gap-2 z-20">
              <Trophy size={18} fill="currentColor" />
              <span className="text-sm font-black font-mono">الترتيب #{rank}</span>
            </div>
          )}
        </div>

        <div className="px-8 lg:px-12 pb-12 pt-0 -mt-16 relative z-10 overflow-y-auto no-scrollbar">
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <div className="w-32 h-32 rounded-[3.5rem] bg-white border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden mb-6 relative">
              {institution.logo ? (
                <img 
                  src={institution.logo} 
                  alt={institution.name} 
                  className="w-full h-full object-cover p-3" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Building2 size={48} className="text-slate-200" />
              )}
            </div>

            {/* Title & Info */}
            <h2 className="text-3xl font-black text-slate-900 font-display mb-2">{institution.fullName}</h2>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black border",
                institution.type !== 'partner' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
              )}>
                {institution.type === 'infrastructure' ? 'البنية التحتية' :
                 institution.type === 'water' ? 'المياه والجفاف' :
                 institution.type === 'electricity' ? 'الكهرباء والطاقة' :
                 institution.type === 'environment' ? 'البيئة والنظافة' : 'شريك استراتيجي'}
              </span>
              <a 
                href={institution.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <Globe size={12} />
                الموقع الرسمي
                <ExternalLink size={10} />
              </a>
            </div>

            {/* Description Card */}
            <div className="w-full umran-card p-8 mb-8 text-right bg-slate-50/50 border-slate-100">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono mb-4">نبذة عن المؤسسة // ABT_INST</h4>
               <p className="text-lg text-slate-700 leading-[1.8] font-bold">
                 {institution.description}
               </p>
            </div>

            {/* Regions Served Section */}
            <div className="w-full text-right space-y-6">
              <div className="flex items-center gap-3 border-r-4 border-emerald-500 pr-4">
                <h4 className="text-xl font-black text-slate-900 font-display">النطاق الجغرافي للعمليات</h4>
                <MapPin size={20} className="text-emerald-600" />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {institution.regionsServed && institution.regionsServed.length > 0 ? (
                  institution.regionsServed.map((regionId) => (
                    <div 
                      key={regionId}
                      className="px-5 py-4 bg-white border border-slate-100 rounded-2xl flex flex-col items-center gap-2 shadow-sm hover:border-emerald-500 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                        <ShieldCheck size={20} />
                      </div>
                      <span className="text-[11px] font-black text-slate-700">{regionId === 'all' ? 'جميع المناطق' : regionId}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400 font-bold">لم يتم تحديد النطاق الجغرافي حالياً</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="w-full mt-12">
               <button 
                 onClick={onClose}
                 className="w-full py-5 bg-emerald-600 text-white rounded-[2.5rem] font-black text-sm shadow-2xl shadow-emerald-200 active:scale-95 transition-all outline-none"
               >
                 إغلاق النافذة // TERMINATE
               </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
