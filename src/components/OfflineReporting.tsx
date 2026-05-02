// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { 
//   WifiOff, 
//   Smartphone, 
//   MessageSquare, 
//   Hash, 
//   X, 
//   ChevronRight, 
//   Send,
//   Droplets,
//   Zap,
//   Trash2,
//   AlertTriangle,
//   ArrowRight
// } from 'lucide-react';
// import { cn } from '../lib/utils';

// interface OfflineReportingProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const SMS_TEMPLATES = [
//   {
//     id: 'water',
//     title: 'بلاغ مياه',
//     icon: <Droplets size={24} />,
//     color: 'bg-blue-500',
//     template: 'ماء [الحي] [رقم الشارع] [الوصف]',
//     description: 'استخدم هذا الكود للإبلاغ عن كسور مياه أو انقطاع الإمداد'
//   },
//   {
//     id: 'electricity',
//     title: 'بلاغ كهرباء',
//     icon: <Zap size={24} />,
//     color: 'bg-amber-500',
//     template: 'كهرباء [الحي] [رقم العمود] [الوصف]',
//     description: 'للبلاغات عن أعطال المحولات أو سقوط الأسلاك'
//   },
//   {
//     id: 'waste',
//     title: 'بيئة ونظافة',
//     icon: <Trash2 size={24} />,
//     color: 'bg-emerald-500',
//     template: 'بيئة [الحي] [الموقع] [الوصف]',
//     description: 'للتبليغ عن تراكم النفايات أو طفح الصرف الصحي'
//   },
//   {
//     id: 'other',
//     title: 'بلاغ عاجل',
//     icon: <AlertTriangle size={24} />,
//     color: 'bg-rose-500',
//     template: 'بلاغ [الحي] [الموقع] [الوصف]',
//     description: 'لأي حالات طوارئ أخرى تستدعي تدخل السلطات'
//   }
// ];

// export default function OfflineReporting({ isOpen, onClose }: OfflineReportingProps) {
//   const [activeStep, setActiveStep] = useState<1 | 2>(1);

//   const handleSmsTrigger = (template: string) => {
//     const message = encodeURIComponent(template);
//     window.location.href = `sms:7722?body=${message}`;
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div 
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 bg-white/60 backdrop-blur-xl z-[200] flex items-center justify-center p-4 lg:p-12 overflow-y-auto"
//           onClick={onClose}
//         >
//           <motion.div 
//             initial={{ scale: 0.9, y: 20, opacity: 0 }}
//             animate={{ scale: 1, y: 0, opacity: 1 }}
//             exit={{ scale: 0.9, y: 20, opacity: 0 }}
//             className="bg-white w-full max-w-4xl rounded-[3rem] lg:rounded-[5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative flex flex-col lg:flex-row"
//             onClick={e => e.stopPropagation()}
//           >
//             {/* Sidebar / Branding */}
//             <div className="lg:w-1/3 bg-emerald-950 p-12 lg:p-16 text-white flex flex-col justify-between relative overflow-hidden">
//                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse sudan-texture opacity-20" />
//                <div className="relative z-10">
//                   <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-8 border border-emerald-500/30">
//                     <WifiOff size={32} />
//                   </div>
//                   <h2 className="text-4xl lg:text-5xl font-black font-display tracking-tight leading-tight mb-4">نظام البلاغات <span className="text-emerald-500">غير المتصل</span></h2>
//                   <p className="text-sm text-emerald-400/80 font-bold leading-relaxed">في "عمران" نؤمن أن البناء لا يتوقف بانقطاع الشبكة. يمكنك المساهمة من أي مكان وباستخدام أي هاتف.</p>
//                </div>
               
//                <div className="mt-12 space-y-4 relative z-10">
//                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
//                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">NETWORK_STATUS : OFFLINE</p>
//                     <p className="text-xs font-bold text-white/60">يتم إرسال بلاغك مباشرة إلى مركز الاستجابة الموحد عبر شبكة الإشارة.</p>
//                   </div>
//                </div>
//             </div>

//             {/* Main Content */}
//             <div className="flex-1 p-12 lg:p-20 bg-slate-50 relative overflow-y-auto max-h-[80vh] lg:max-h-none text-right">
//               <button 
//                 onClick={onClose}
//                 className="absolute top-8 left-8 p-3 hover:bg-slate-200 rounded-full transition-all text-slate-400"
//               >
//                 <X size={24} />
//               </button>

//               <div className="space-y-12">
//                 <div className="space-y-4">
//                   <div className="flex items-center gap-3 justify-end text-emerald-600">
//                      <span className="text-xs font-black uppercase tracking-[0.3em] font-mono">STEP_0{activeStep}</span>
//                      <div className="w-12 h-1 bg-emerald-100 rounded-full">
//                         <div className={cn("h-full bg-emerald-600 transition-all duration-500", activeStep === 1 ? 'w-1/2' : 'w-full')} />
//                      </div>
//                   </div>
//                   <h3 className="text-2xl font-black text-slate-950 font-display">كيف تود التواصل؟</h3>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   {/* SMS Option */}
//                   <div className="group relative">
//                     <button 
//                        onClick={() => setActiveStep(2)}
//                        className={cn(
//                         "w-full text-right p-8 rounded-[3rem] border-2 transition-all duration-500",
//                         activeStep === 1 ? "bg-white border-slate-200 hover:border-emerald-500 hover:shadow-2xl" : "bg-emerald-50 border-emerald-500 opacity-60"
//                        )}
//                     >
//                       <div className="flex justify-between items-start mb-6">
//                          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
//                             <MessageSquare size={28} />
//                          </div>
//                          <ChevronRight size={20} className="text-slate-300" />
//                       </div>
//                       <h4 className="text-lg font-black text-slate-900 mb-2">رسائل نصية قصيرة (SMS)</h4>
//                       <p className="text-xs text-slate-500 font-bold leading-relaxed">أرسل مفتاح البلاغ والبيانات إلى الرقم الموحد <span className="text-emerald-600">7722</span> على جميع الشبكات.</p>
//                     </button>
//                   </div>

//                   {/* USSD Option */}
//                   <div className="group relative">
//                     <div className="w-full text-right p-8 bg-white border-2 border-slate-200 rounded-[3rem] hover:border-amber-500 transition-all duration-500 hover:shadow-2xl">
//                       <div className="flex justify-between items-start mb-6">
//                          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
//                             <Hash size={28} />
//                          </div>
//                          <div className="px-3 py-1 bg-amber-500 text-white text-[8px] font-black rounded-full uppercase tracking-widest">مباشر</div>
//                       </div>
//                       <h4 className="text-lg font-black text-slate-900 mb-2">نظام الأكواد (USSD)</h4>
//                       <p className="text-xs text-slate-500 font-bold leading-relaxed mb-4">اتصل بـ <span className="text-amber-600 font-black text-lg">*772#</span> واتبع خيارات القائمة التفاعلية.</p>
//                       <div className="py-3 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-[10px] font-bold text-slate-400">
//                          يعمل بدون رصيد بيانات - لا يتطلب هواتف ذكية
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <AnimatePresence>
//                   {activeStep === 2 && (
//                     <motion.div 
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="space-y-8"
//                     >
//                       <div className="flex items-center gap-4 text-emerald-600 p-6 bg-white rounded-3xl border-2 border-emerald-100 shadow-sm">
//                          <Send size={24} />
//                          <div className="text-right flex-1">
//                             <p className="text-xs font-black text-emerald-800">اختر نوع البلاغ لتجهيز الرسالة</p>
//                             <p className="text-[10px] font-bold text-emerald-600/70">سيتم فتح تطبيق الرسائل بجهازك تلقائياً</p>
//                          </div>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {SMS_TEMPLATES.map((item) => (
//                           <button 
//                             key={item.id}
//                             onClick={() => handleSmsTrigger(item.template)}
//                             className="bg-white border border-slate-200 rounded-3xl p-6 text-right hover:border-emerald-500 hover:shadow-lg transition-all group flex gap-4"
//                           >
//                             <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:rotate-12 transition-transform", item.color)}>
//                                {item.icon}
//                             </div>
//                             <div className="flex-1">
//                                <p className="text-sm font-black text-slate-900 mb-1">{item.title}</p>
//                                <p className="text-[10px] text-slate-400 font-bold leading-none">{item.description}</p>
//                                <div className="mt-3 p-2 bg-slate-50 rounded-lg text-[9px] font-mono font-black text-slate-500 border border-slate-100">
//                                   {item.template}
//                                </div>
//                             </div>
//                           </button>
//                         ))}
//                       </div>

//                       <button 
//                         onClick={() => setActiveStep(1)}
//                         className="flex items-center gap-3 text-slate-400 hover:text-emerald-600 transition-colors mx-auto"
//                       >
//                          <ArrowRight size={16} />
//                          <span className="text-[10px] font-black uppercase tracking-widest">العودة للخيارات</span>
//                       </button>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }


import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, MessageSquare, Hash, X, ChevronRight, Send, Droplets, Zap, Trash2, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface OfflineReportingProps {
  isOpen: boolean;
  onClose: () => void;
}

const SMS_TEMPLATES = [
  { id: 'water', title: 'بلاغ مياه', icon: <Droplets size={20} />, color: 'bg-blue-500', template: 'ماء [الحي] [رقم الشارع] [الوصف]', description: 'كسور مياه أو انقطاع الإمداد' },
  { id: 'electricity', title: 'بلاغ كهرباء', icon: <Zap size={20} />, color: 'bg-amber-500', template: 'كهرباء [الحي] [رقم العمود] [الوصف]', description: 'أعطال المحولات أو سقوط الأسلاك' },
  { id: 'waste', title: 'بيئة ونظافة', icon: <Trash2 size={20} />, color: 'bg-emerald-500', template: 'بيئة [الحي] [الموقع] [الوصف]', description: 'تراكم النفايات أو طفح الصرف الصحي' },
  { id: 'other', title: 'بلاغ عاجل', icon: <AlertTriangle size={20} />, color: 'bg-rose-500', template: 'بلاغ [الحي] [الموقع] [الوصف]', description: 'حالات طوارئ تستدعي تدخل السلطات' },
];

export default function OfflineReporting({ isOpen, onClose }: OfflineReportingProps) {
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  const handleSmsTrigger = (template: string) => {
    window.location.href = `sms:7722?body=${encodeURIComponent(template)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-slate-900 p-6 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
              <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors relative z-10">
                <X size={18} />
              </button>
              <div className="text-right relative z-10">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <WifiOff size={18} className="text-emerald-400" />
                  <h2 className="text-lg font-black text-white">البلاغات غير المتصل</h2>
                </div>
                <p className="text-xs text-emerald-400/80 font-medium">في عمران، البناء لا يتوقف بانقطاع الشبكة</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Step Indicator */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: activeStep === 1 ? '50%' : '100%' }}
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  />
                </div>
                <span className="text-[10px] font-black text-emerald-600 font-mono uppercase tracking-wider">STEP {activeStep}/2</span>
              </div>

              {/* Step 1: Channel Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SMS */}
                <button
                  onClick={() => setActiveStep(2)}
                  className={cn(
                    "p-5 rounded-2xl border-2 text-right transition-all",
                    activeStep === 2 ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-200 bg-white"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <ChevronRight size={18} className="text-slate-300" />
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <MessageSquare size={20} />
                    </div>
                  </div>
                  <h4 className="text-base font-black text-slate-900 mb-1">رسائل نصية (SMS)</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    أرسل البلاغ إلى الرقم الموحد <span className="text-emerald-600 font-bold">7722</span>
                  </p>
                </button>

                {/* USSD */}
                <div className="p-5 rounded-2xl border-2 border-slate-200 text-right bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 bg-amber-500 text-white text-[9px] font-black rounded-full">مباشر</span>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Hash size={20} />
                    </div>
                  </div>
                  <h4 className="text-base font-black text-slate-900 mb-1">نظام USSD</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    اتصل بـ <span className="text-amber-600 font-black text-base">*772#</span> واتبع القائمة
                  </p>
                  <div className="mt-3 py-2 px-3 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-400">
                    يعمل بدون رصيد بيانات
                  </div>
                </div>
              </div>

              {/* Step 2: SMS Templates */}
              <AnimatePresence>
                {activeStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-right">
                      <Send size={18} className="text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-emerald-800">اختر نوع البلاغ</p>
                        <p className="text-xs text-emerald-600/70">سيتم فتح تطبيق الرسائل تلقائياً</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SMS_TEMPLATES.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSmsTrigger(item.template)}
                          className="bg-white border border-slate-100 rounded-2xl p-4 text-right hover:border-emerald-200 hover:shadow-md transition-all group flex gap-3 items-start"
                        >
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform", item.color)}>
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 mb-0.5">{item.title}</p>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{item.description}</p>
                            <div className="mt-2 px-2 py-1 bg-slate-50 rounded-lg text-[9px] font-mono font-bold text-slate-500 truncate border border-slate-100">
                              {item.template}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setActiveStep(1)}
                      className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      <ArrowRight size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">العودة للخيارات</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
