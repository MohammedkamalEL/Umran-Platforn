// import React from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { X, Globe, Building2, MapPin, ExternalLink, Award, ShieldCheck, Trophy } from 'lucide-react';
// import { InstitutionExtended } from '../constants';
// import { cn } from '../lib/utils';

// interface InstitutionDetailProps {
//   institution: InstitutionExtended;
//   onClose: () => void;
//   rank?: number;
// }

// export default function InstitutionDetail({ institution, onClose, rank }: InstitutionDetailProps) {
//   return (
//     <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-12">
//       <motion.div 
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         onClick={onClose}
//         className="absolute inset-0 bg-white/40 backdrop-blur-md"
//       />
      
//       <motion.div 
//         initial={{ opacity: 0, scale: 0.9, y: 40 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.9, y: 40 }}
//         className="relative w-full max-w-2xl bg-white rounded-[4rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
//         dir="rtl"
//       >
//         {/* Header Visual */}
//         <div className="h-32 bg-slate-100 relative shrink-0">
//           <div className="absolute inset-0 opacity-10 sudan-pattern-modern" />
//           <div 
//             className="absolute inset-0 opacity-20" 
//             style={{ backgroundColor: institution.accentColor }} 
//           />
          
//           <button 
//             onClick={onClose}
//             className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-900 border border-slate-200 hover:bg-white transition-all z-20"
//           >
//             <X size={20} />
//           </button>

//           {rank !== undefined && (
//             <div className="absolute top-6 right-6 px-4 py-2 bg-amber-500 text-white rounded-2xl shadow-xl shadow-amber-200 flex items-center gap-2 z-20">
//               <Trophy size={18} fill="currentColor" />
//               <span className="text-sm font-black font-mono">الترتيب #{rank}</span>
//             </div>
//           )}
//         </div>

//         <div className="px-8 lg:px-12 pb-12 pt-0 -mt-16 relative z-10 overflow-y-auto no-scrollbar">
//           <div className="flex flex-col items-center text-center">
//             {/* Logo */}
//             <div className="w-32 h-32 rounded-[3.5rem] bg-white border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden mb-6 relative">
//               {institution.logo ? (
//                 <img 
//                   src={institution.logo} 
//                   alt={institution.name} 
//                   className="w-full h-full object-cover p-3" 
//                   referrerPolicy="no-referrer"
//                 />
//               ) : (
//                 <Building2 size={48} className="text-slate-200" />
//               )}
//             </div>

//             {/* Title & Info */}
//             <h2 className="text-3xl font-black text-slate-900 font-display mb-2">{institution.fullName}</h2>
            
//             <div className="flex flex-wrap justify-center gap-3 mb-8">
//               <span className={cn(
//                 "px-4 py-1.5 rounded-full text-[10px] font-black border",
//                 institution.type !== 'partner' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
//               )}>
//                 {institution.type === 'infrastructure' ? 'البنية التحتية' :
//                  institution.type === 'water' ? 'المياه والجفاف' :
//                  institution.type === 'electricity' ? 'الكهرباء والطاقة' :
//                  institution.type === 'environment' ? 'البيئة والنظافة' : 'شريك استراتيجي'}
//               </span>
//               <a 
//                 href={institution.website} 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 className="px-4 py-1.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-2"
//               >
//                 <Globe size={12} />
//                 الموقع الرسمي
//                 <ExternalLink size={10} />
//               </a>
//             </div>

//             {/* Description Card */}
//             <div className="w-full umran-card p-8 mb-8 text-right bg-slate-50/50 border-slate-100">
//                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono mb-4">نبذة عن المؤسسة // ABT_INST</h4>
//                <p className="text-lg text-slate-700 leading-[1.8] font-bold">
//                  {institution.description}
//                </p>
//             </div>

//             {/* Regions Served Section */}
//             <div className="w-full text-right space-y-6">
//               <div className="flex items-center gap-3 border-r-4 border-emerald-500 pr-4">
//                 <h4 className="text-xl font-black text-slate-900 font-display">النطاق الجغرافي للعمليات</h4>
//                 <MapPin size={20} className="text-emerald-600" />
//               </div>
              
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                 {institution.regionsServed && institution.regionsServed.length > 0 ? (
//                   institution.regionsServed.map((regionId) => (
//                     <div 
//                       key={regionId}
//                       className="px-5 py-4 bg-white border border-slate-100 rounded-2xl flex flex-col items-center gap-2 shadow-sm hover:border-emerald-500 transition-all group"
//                     >
//                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
//                         <ShieldCheck size={20} />
//                       </div>
//                       <span className="text-[11px] font-black text-slate-700">{regionId === 'all' ? 'جميع المناطق' : regionId}</span>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
//                     <p className="text-sm text-slate-400 font-bold">لم يتم تحديد النطاق الجغرافي حالياً</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Action Button */}
//             <div className="w-full mt-12">
//                <button 
//                  onClick={onClose}
//                  className="w-full py-5 bg-emerald-600 text-white rounded-[2.5rem] font-black text-sm shadow-2xl shadow-emerald-200 active:scale-95 transition-all outline-none"
//                >
//                  إغلاق النافذة // TERMINATE
//                </button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

import React from 'react';
import { motion } from 'motion/react';
import { X, Globe, Building2, MapPin, ExternalLink, ShieldCheck, Trophy } from 'lucide-react';
import { InstitutionExtended } from '../constants';
import { cn } from '../lib/utils';

interface InstitutionDetailProps {
  institution: InstitutionExtended;
  onClose: () => void;
  rank?: number;
}

const TYPE_LABELS: Record<string, string> = {
  infrastructure: 'البنية التحتية',
  water: 'المياه والجفاف',
  electricity: 'الكهرباء والطاقة',
  environment: 'البيئة والنظافة',
  partner: 'شريك استراتيجي',
};

export default function InstitutionDetail({ institution, onClose, rank }: InstitutionDetailProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-12">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full sm:max-w-xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
        dir="rtl"
      >
        {/* Header strip */}
        <div className="h-28 sm:h-32 relative shrink-0 overflow-hidden bg-slate-100">
          <div className="absolute inset-0 opacity-[0.08] sudan-pattern-modern" />
          <div
            className="absolute inset-0 opacity-25 transition-opacity"
            style={{ backgroundColor: institution.accentColor || '#10b981' }}
          />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 sm:top-5 sm:left-5 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-700 border border-slate-200 hover:bg-white transition-all z-20 active:scale-90"
          >
            <X size={18} />
          </button>

          {/* Rank badge */}
          {rank !== undefined && (
            <div className="absolute top-4 right-4 sm:top-5 sm:right-5 px-3 py-1.5 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-200 flex items-center gap-1.5 z-20">
              <Trophy size={14} fill="currentColor" />
              <span className="text-xs font-black">#{rank}</span>
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 sm:px-8 pb-8 -mt-14 no-scrollbar">
          <div className="flex flex-col items-center text-center">

            {/* Logo */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] bg-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden mb-5 relative">
              {institution.logo ? (
                <img
                  src={institution.logo}
                  alt={institution.name}
                  className="w-full h-full object-contain p-2"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Building2 size={40} className="text-slate-200" />
              )}
            </div>

            {/* Name */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 leading-tight">{institution.fullName}</h2>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-6 mt-2">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black border",
                institution.type !== 'partner'
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-blue-50 text-blue-600 border-blue-100"
              )}>
                {TYPE_LABELS[institution.type] || institution.type}
              </span>
              <a
                href={institution.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-1.5"
              >
                <Globe size={11} />
                الموقع الرسمي
                <ExternalLink size={9} />
              </a>
            </div>

            {/* Description */}
            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6 text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono mb-3">نبذة عن المؤسسة</p>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                {institution.description}
              </p>
            </div>

            {/* Regions */}
            <div className="w-full text-right space-y-4">
              <div className="flex items-center gap-3 border-r-4 border-emerald-500 pr-3">
                <MapPin size={16} className="text-emerald-600" />
                <h4 className="text-base font-black text-slate-900">النطاق الجغرافي</h4>
              </div>

              {institution.regionsServed && institution.regionsServed.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {institution.regionsServed.map((regionId) => (
                    <div
                      key={regionId}
                      className="px-3 py-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center gap-1.5 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                        <ShieldCheck size={16} />
                      </div>
                      <span className="text-[10px] font-black text-slate-700 text-center leading-tight">
                        {regionId === 'all' ? 'جميع المناطق' : regionId}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-bold">لم يتم تحديد النطاق حالياً</p>
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
