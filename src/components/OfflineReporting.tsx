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




// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { WifiOff, MessageSquare, Hash, X, ChevronRight, Send, Droplets, Zap, Trash2, AlertTriangle, ArrowRight } from 'lucide-react';
// import { cn } from '../lib/utils';

// interface OfflineReportingProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const SMS_TEMPLATES = [
//   { id: 'water', title: 'بلاغ مياه', icon: <Droplets size={20} />, color: 'bg-blue-500', template: 'ماء [الحي] [رقم الشارع] [الوصف]', description: 'كسور مياه أو انقطاع الإمداد' },
//   { id: 'electricity', title: 'بلاغ كهرباء', icon: <Zap size={20} />, color: 'bg-amber-500', template: 'كهرباء [الحي] [رقم العمود] [الوصف]', description: 'أعطال المحولات أو سقوط الأسلاك' },
//   { id: 'waste', title: 'بيئة ونظافة', icon: <Trash2 size={20} />, color: 'bg-emerald-500', template: 'بيئة [الحي] [الموقع] [الوصف]', description: 'تراكم النفايات أو طفح الصرف الصحي' },
//   { id: 'other', title: 'بلاغ عاجل', icon: <AlertTriangle size={20} />, color: 'bg-rose-500', template: 'بلاغ [الحي] [الموقع] [الوصف]', description: 'حالات طوارئ تستدعي تدخل السلطات' },
// ];

// export default function OfflineReporting({ isOpen, onClose }: OfflineReportingProps) {
//   const [activeStep, setActiveStep] = useState<1 | 2>(1);

//   const handleSmsTrigger = (template: string) => {
//     window.location.href = `sms:7722?body=${encodeURIComponent(template)}`;
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6"
//           onClick={onClose}
//         >
//           <motion.div
//             initial={{ y: 60, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: 60, opacity: 0 }}
//             className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
//             onClick={e => e.stopPropagation()}
//             dir="rtl"
//           >
//             {/* Header */}
//             <div className="bg-slate-900 p-6 flex items-center justify-between relative overflow-hidden">
//               <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
//               <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors relative z-10">
//                 <X size={18} />
//               </button>
//               <div className="text-right relative z-10">
//                 <div className="flex items-center gap-2 justify-end mb-1">
//                   <WifiOff size={18} className="text-emerald-400" />
//                   <h2 className="text-lg font-black text-white">البلاغات غير المتصل</h2>
//                 </div>
//                 <p className="text-xs text-emerald-400/80 font-medium">في عمران، البناء لا يتوقف بانقطاع الشبكة</p>
//               </div>
//             </div>

//             <div className="p-6 space-y-6">
//               {/* Step Indicator */}
//               <div className="flex items-center gap-3">
//                 <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
//                   <motion.div
//                     animate={{ width: activeStep === 1 ? '50%' : '100%' }}
//                     className="h-full bg-emerald-600 rounded-full transition-all duration-500"
//                   />
//                 </div>
//                 <span className="text-[10px] font-black text-emerald-600 font-mono uppercase tracking-wider">STEP {activeStep}/2</span>
//               </div>

//               {/* Step 1: Channel Selection */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {/* SMS */}
//                 <button
//                   onClick={() => setActiveStep(2)}
//                   className={cn(
//                     "p-5 rounded-2xl border-2 text-right transition-all",
//                     activeStep === 2 ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-200 bg-white"
//                   )}
//                 >
//                   <div className="flex items-center justify-between mb-3">
//                     <ChevronRight size={18} className="text-slate-300" />
//                     <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
//                       <MessageSquare size={20} />
//                     </div>
//                   </div>
//                   <h4 className="text-base font-black text-slate-900 mb-1">رسائل نصية (SMS)</h4>
//                   <p className="text-xs text-slate-500 leading-relaxed">
//                     أرسل البلاغ إلى الرقم الموحد <span className="text-emerald-600 font-bold">7722</span>
//                   </p>
//                 </button>

//                 {/* USSD */}
//                 <div className="p-5 rounded-2xl border-2 border-slate-200 text-right bg-white">
//                   <div className="flex items-center justify-between mb-3">
//                     <span className="px-2 py-1 bg-amber-500 text-white text-[9px] font-black rounded-full">مباشر</span>
//                     <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
//                       <Hash size={20} />
//                     </div>
//                   </div>
//                   <h4 className="text-base font-black text-slate-900 mb-1">نظام USSD</h4>
//                   <p className="text-xs text-slate-500 leading-relaxed">
//                     اتصل بـ <span className="text-amber-600 font-black text-base">*772#</span> واتبع القائمة
//                   </p>
//                   <div className="mt-3 py-2 px-3 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-400">
//                     يعمل بدون رصيد بيانات
//                   </div>
//                 </div>
//               </div>

//               {/* Step 2: SMS Templates */}
//               <AnimatePresence>
//                 {activeStep === 2 && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 12 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="space-y-4"
//                   >
//                     <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-right">
//                       <Send size={18} className="text-emerald-600 shrink-0" />
//                       <div>
//                         <p className="text-sm font-bold text-emerald-800">اختر نوع البلاغ</p>
//                         <p className="text-xs text-emerald-600/70">سيتم فتح تطبيق الرسائل تلقائياً</p>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                       {SMS_TEMPLATES.map((item) => (
//                         <button
//                           key={item.id}
//                           onClick={() => handleSmsTrigger(item.template)}
//                           className="bg-white border border-slate-100 rounded-2xl p-4 text-right hover:border-emerald-200 hover:shadow-md transition-all group flex gap-3 items-start"
//                         >
//                           <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform", item.color)}>
//                             {item.icon}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <p className="text-sm font-black text-slate-900 mb-0.5">{item.title}</p>
//                             <p className="text-[10px] text-slate-400 leading-relaxed">{item.description}</p>
//                             <div className="mt-2 px-2 py-1 bg-slate-50 rounded-lg text-[9px] font-mono font-bold text-slate-500 truncate border border-slate-100">
//                               {item.template}
//                             </div>
//                           </div>
//                         </button>
//                       ))}
//                     </div>

//                     <button
//                       onClick={() => setActiveStep(1)}
//                       className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors"
//                     >
//                       <ArrowRight size={14} />
//                       <span className="text-[10px] font-bold uppercase tracking-wider">العودة للخيارات</span>
//                     </button>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }



import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  WifiOff, MessageSquare, Hash, X, Send,
  Droplets, Zap, Trash2, AlertTriangle, ArrowRight,
  CheckCircle2, Loader2, ShieldCheck, Clock, Radio,
  Signal, ChevronRight, FileText
} from 'lucide-react';
import { cn } from '../lib/utils';

interface OfflineReportingProps {
  isOpen: boolean;
  onClose: () => void;
}

const SMS_TEMPLATES = [
  { id: 'water',       title: 'بلاغ مياه',    icon: <Droplets size={18} />,    color: 'bg-blue-500',    light: 'bg-blue-50',    text: 'text-blue-600',    template: 'ماء [الحي] [رقم الشارع]',   description: 'كسور مياه أو انقطاع الإمداد',    placeholder: 'مثال: انبوب مياه مكسور في شارع المطار، بالقرب من المسجد' },
  { id: 'electricity', title: 'بلاغ كهرباء',  icon: <Zap size={18} />,         color: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-600',   template: 'كهرباء [الحي] [رقم العمود]', description: 'أعطال المحولات أو سقوط الأسلاك', placeholder: 'مثال: عمود كهرباء ساقط على الطريق، خطر على المارة' },
  { id: 'waste',       title: 'بيئة ونظافة',  icon: <Trash2 size={18} />,       color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', template: 'بيئة [الحي] [الموقع]',        description: 'تراكم النفايات أو طفح الصرف',    placeholder: 'مثال: تراكم نفايات كبير أمام المدرسة منذ أسبوع' },
  { id: 'other',       title: 'بلاغ عاجل',   icon: <AlertTriangle size={18} />, color: 'bg-rose-500',    light: 'bg-rose-50',    text: 'text-rose-600',    template: 'بلاغ [الحي] [الموقع]',       description: 'حالات طوارئ تستدعي تدخل السلطات', placeholder: 'مثال: طريق مسدود بسبب حفرة كبيرة في الشارع الرئيسي' },
];

const SMS_SIMULATION_STEPS = [
  { id: 'activate',  delay: 0,    icon: <WifiOff size={14} />,     color: 'text-slate-400',   msg: 'تفعيل وضع الإرسال غير المتصل...' },
  { id: 'encode',    delay: 900,  icon: <Radio size={14} />,       color: 'text-blue-400',    msg: 'تشفير بيانات البلاغ وإعداد الرسالة...' },
  { id: 'send',      delay: 1900, icon: <Send size={14} />,        color: 'text-emerald-400', msg: 'إرسال البلاغ إلى المركز الموحد 7722...' },
  { id: 'receive',   delay: 3100, icon: <Signal size={14} />,      color: 'text-emerald-500', msg: 'تم استلام البلاغ من قِبل مركز عمران ✓' },
  { id: 'register',  delay: 4200, icon: <ShieldCheck size={14} />, color: 'text-emerald-500', msg: 'تسجيل البلاغ وتوليد رقم المتابعة...' },
  { id: 'done',      delay: 5400, icon: <CheckCircle2 size={14} />,color: 'text-emerald-400', msg: 'اكتمل! ستصلك رسالة تأكيد خلال دقائق.' },
];

const USSD_SIMULATION_STEPS = [
  { id: 'dial',      delay: 0,    icon: <Hash size={14} />,        color: 'text-slate-400',   msg: 'الاتصال بـ *772# عبر شبكة الإشارة...' },
  { id: 'connect',   delay: 1000, icon: <Signal size={14} />,      color: 'text-amber-400',   msg: 'تم الاتصال بالخادم — تحميل القائمة...' },
  { id: 'menu',      delay: 2300, icon: <ChevronRight size={14} />,color: 'text-amber-500',   msg: '1-مياه  2-كهرباء  3-نظافة  4-غير ذلك' },
  { id: 'confirm',   delay: 3600, icon: <Send size={14} />,        color: 'text-emerald-400', msg: 'إرسال البلاغ عبر شبكة الإشارة...' },
  { id: 'done',      delay: 5000, icon: <CheckCircle2 size={14} />,color: 'text-emerald-500', msg: 'تم الاستلام! رقم متابعتك جاهز.' },
];

type SimState = 'idle' | 'running' | 'done';
// الخطوات: 1=اختيار القناة، 2=اختيار نوع البلاغ (SMS فقط)، 3=وصف العطل، sim=المحاكاة
type AppStep = 1 | 2 | 3;

export default function OfflineReporting({ isOpen, onClose }: OfflineReportingProps) {
  const [appStep, setAppStep] = useState<AppStep>(1);
  const [channel, setChannel] = useState<'sms' | 'ussd' | null>(null);
  const [simState, setSimState] = useState<SimState>('idle');
  const [visibleSteps, setVisibleSteps] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof SMS_TEMPLATES[0] | null>(null);
  const [description, setDescription] = useState('');
  const [trackingId] = useState(() => 'OFL-' + Math.random().toString(36).slice(2, 8).toUpperCase());
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!isOpen) {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setSimState('idle');
      setVisibleSteps([]);
      setAppStep(1);
      setChannel(null);
      setSelectedTemplate(null);
      setDescription('');
    }
  }, [isOpen]);

  const runSimulation = (steps: typeof SMS_SIMULATION_STEPS) => {
    setSimState('running');
    setVisibleSteps([]);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    steps.forEach((step, idx) => {
      const t = setTimeout(() => {
        setVisibleSteps(prev => [...prev, step.id]);
        if (idx === steps.length - 1) {
          setTimeout(() => setSimState('done'), 600);
        }
      }, step.delay);
      timersRef.current.push(t);
    });
  };

  // SMS: اختار نوع البلاغ → اذهب لخطوة الوصف
  const handleSmsTemplateSelect = (template: typeof SMS_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setChannel('sms');
    setAppStep(3);
  };

  // إرسال البلاغ النهائي (SMS)
  const handleSubmitReport = () => {
    if (!selectedTemplate) return;
    const fullTemplate = `${selectedTemplate.template} ${description}`.trim();
    window.location.href = `sms:7722?body=${encodeURIComponent(fullTemplate)}`;
    runSimulation(SMS_SIMULATION_STEPS);
  };

  // USSD: مباشرة → وصف → محاكاة
  const handleUssdSelect = () => {
    setChannel('ussd');
    setAppStep(3);
  };

  // إرسال USSD
  const handleUssdSubmit = () => {
    runSimulation(USSD_SIMULATION_STEPS);
  };

  const handleReset = () => {
    timersRef.current.forEach(clearTimeout);
    setSimState('idle');
    setVisibleSteps([]);
    setAppStep(1);
    setChannel(null);
    setSelectedTemplate(null);
    setDescription('');
  };

  const totalSteps = channel === 'ussd' ? 2 : 3;
  const currentStep = appStep;
  const progressWidth = simState !== 'idle' ? '100%' : `${(currentStep / totalSteps) * 100}%`;

  const steps = channel === 'ussd' ? USSD_SIMULATION_STEPS : SMS_SIMULATION_STEPS;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl text-white flex items-center justify-center transition-all active:scale-90"
              >
                <X size={16} />
              </button>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <WifiOff size={16} className="text-emerald-400" />
                  <h2 className="text-base font-black text-white">البلاغات غير المتصل</h2>
                </div>
                <p className="text-[10px] text-emerald-400/70 font-medium mt-0.5">في عمران، البناء لا يتوقف بانقطاع الشبكة</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: progressWidth }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
                <span className="text-[10px] font-black text-emerald-600 font-mono shrink-0">
                  {simState !== 'idle' ? '✓' : `${currentStep}/${totalSteps}`}
                </span>
              </div>

              <AnimatePresence mode="wait">

                {/* ── شاشة المحاكاة / النجاح ── */}
                {(simState === 'running' || simState === 'done') && (
                  <motion.div
                    key="simulation"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* حالة الإرسال */}
                    <div className={cn(
                      "rounded-2xl p-4 flex items-center gap-3 text-right border",
                      simState === 'done' ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100"
                    )}>
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        simState === 'done' ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                      )}>
                        {simState === 'done'
                          ? <CheckCircle2 size={20} />
                          : <Loader2 size={20} className="animate-spin" />
                        }
                      </div>
                      <div>
                        <p className={cn("text-sm font-black", simState === 'done' ? "text-emerald-800" : "text-slate-700")}>
                          {simState === 'done' ? 'تم إرسال البلاغ بنجاح!' : 'جاري إرسال البلاغ...'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          عبر {channel === 'ussd' ? 'USSD *772#' : 'SMS إلى 7722'}
                          {selectedTemplate && ` · ${selectedTemplate.title}`}
                        </p>
                      </div>
                    </div>

                    {/* Terminal محاكاة */}
                    <div className="bg-slate-900 rounded-2xl p-4 font-mono space-y-2 min-h-[160px]">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[9px] text-white/30 mr-2">umran_offline_bridge v2.1</span>
                      </div>

                      {steps.map((step) => (
                        <AnimatePresence key={step.id}>
                          {visibleSteps.includes(step.id) && (
                            <motion.div
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-start gap-2 text-right"
                            >
                              <span className={cn("shrink-0 mt-0.5", step.color)}>{step.icon}</span>
                              <span className={cn("text-[11px] leading-relaxed", step.color)}>{step.msg}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      ))}

                      {simState === 'running' && (
                        <div className="flex gap-1 mt-1">
                          {[0, 1, 2].map(i => (
                            <motion.div key={i} className="w-1 h-1 rounded-full bg-white/30"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* بطاقة التأكيد */}
                    {simState === 'done' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-emerald-600 rounded-2xl p-5 text-white space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <ShieldCheck size={22} className="text-emerald-200" />
                          <div className="text-right">
                            <p className="text-emerald-200 text-[10px] font-bold">رقم المتابعة</p>
                            <p className="text-white font-black font-mono text-lg tracking-widest">{trackingId}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20">
                          <div className="text-right">
                            <p className="text-emerald-300 text-[9px] font-bold mb-0.5">الحالة</p>
                            <p className="text-white text-xs font-bold flex items-center gap-1 justify-end">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                              قيد المراجعة
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-300 text-[9px] font-bold mb-0.5">وقت الاستجابة</p>
                            <p className="text-white text-xs font-bold flex items-center gap-1 justify-end">
                              <Clock size={10} />
                              24–48 ساعة
                            </p>
                          </div>
                          <div className="text-right col-span-2">
                            <p className="text-emerald-300 text-[9px] font-bold mb-0.5">قناة الإرسال</p>
                            <p className="text-white text-xs font-bold">
                              {channel === 'ussd' ? '📲 USSD *772# — شبكة الإشارة' : `📱 SMS إلى 7722${selectedTemplate ? ` · ${selectedTemplate.title}` : ''}`}
                            </p>
                          </div>
                          {description && (
                            <div className="text-right col-span-2">
                              <p className="text-emerald-300 text-[9px] font-bold mb-0.5">وصف العطل</p>
                              <p className="text-white text-xs font-bold leading-relaxed line-clamp-2">{description}</p>
                            </div>
                          )}
                        </div>

                        <p className="text-[10px] text-emerald-200 leading-relaxed border-t border-white/20 pt-3">
                          ستصلك رسالة نصية تأكيد خلال دقائق. احتفظ برقم المتابعة للاستفسار.
                        </p>
                      </motion.div>
                    )}

                    {/* أزرار */}
                    <div className="flex gap-2 pt-1">
                      {simState === 'done' && (
                        <button
                          onClick={onClose}
                          className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all active:scale-95"
                        >
                          حسناً، شكراً
                        </button>
                      )}
                      <button
                        onClick={handleReset}
                        className={cn(
                          "py-3 px-4 rounded-xl text-sm font-bold transition-all border active:scale-95",
                          simState === 'done'
                            ? "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            : "flex-1 bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                        )}
                      >
                        {simState === 'done' ? 'بلاغ جديد' : 'إلغاء'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── الشاشة الرئيسية (idle) ── */}
                {simState === 'idle' && (
                  <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">

                    {/* ── الخطوة 1: اختيار القناة ── */}
                    {appStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-4"
                      >
                        <p className="text-xs font-black text-slate-700">كيف تود إرسال البلاغ؟</p>

                        <div className="grid grid-cols-2 gap-3">
                          {/* SMS */}
                          <button
                            onClick={() => { setChannel('sms'); setAppStep(2); }}
                            className="p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-emerald-300 hover:bg-emerald-50 text-right transition-all active:scale-95 group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                              <MessageSquare size={18} />
                            </div>
                            <p className="text-sm font-black text-slate-900 mb-0.5">SMS</p>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              إلى الرقم <span className="text-emerald-600 font-bold">7722</span>
                            </p>
                          </button>

                          {/* USSD */}
                          <button
                            onClick={handleUssdSelect}
                            className="p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-amber-300 hover:bg-amber-50 text-right transition-all active:scale-95 group"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <span className="px-1.5 py-0.5 bg-amber-400 text-white text-[8px] font-black rounded-full">مباشر</span>
                              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Hash size={18} />
                              </div>
                            </div>
                            <p className="text-sm font-black text-slate-900 mb-0.5">USSD</p>
                            <p className="text-[10px] text-slate-400">
                              اتصل بـ <span className="text-amber-600 font-black">*772#</span>
                            </p>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <Signal size={13} className="text-emerald-500 shrink-0" />
                          <p className="text-[10px] text-slate-500 font-medium text-right">
                            يعمل بدون إنترنت — متوفر على جميع الشبكات السودانية
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* ── الخطوة 2: اختيار نوع البلاغ (SMS فقط) ── */}
                    {appStep === 2 && channel === 'sms' && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setAppStep(1)}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-600 transition-colors text-[11px] font-bold"
                          >
                            <ArrowRight size={13} /> رجوع
                          </button>
                          <p className="text-xs font-black text-slate-700">اختر نوع البلاغ</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {SMS_TEMPLATES.map(item => (
                            <button
                              key={item.id}
                              onClick={() => handleSmsTemplateSelect(item)}
                              className={cn(
                                "p-3.5 rounded-2xl border text-right transition-all active:scale-95 group",
                                item.light, "border-transparent hover:shadow-sm"
                              )}
                            >
                              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform", item.color)}>
                                {item.icon}
                              </div>
                              <p className={cn("text-xs font-black mb-0.5", item.text)}>{item.title}</p>
                              <p className="text-[9px] text-slate-400 leading-tight">{item.description}</p>
                              <div className="mt-2 px-2 py-1 bg-white/70 rounded-lg text-[8px] font-mono text-slate-400 truncate border border-white">
                                {item.template}
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* ── الخطوة 3: وصف العطل ── */}
                    {appStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-4"
                      >
                        {/* رأس */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setAppStep(channel === 'ussd' ? 1 : 2)}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-600 transition-colors text-[11px] font-bold"
                          >
                            <ArrowRight size={13} /> رجوع
                          </button>
                          <div className="flex items-center gap-2">
                            {selectedTemplate && (
                              <span className={cn("text-[10px] font-black px-2 py-1 rounded-full", selectedTemplate.light, selectedTemplate.text)}>
                                {selectedTemplate.title}
                              </span>
                            )}
                            <p className="text-xs font-black text-slate-700">وصف العطل</p>
                          </div>
                        </div>

                        {/* بطاقة تفعيل الوضع غير المتصل */}
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl"
                        >
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                            <WifiOff size={16} />
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-amber-800">تم تفعيل وضع الإرسال غير المتصل</p>
                            <p className="text-[10px] text-amber-600 font-medium mt-0.5 leading-relaxed">
                              بلاغك سيُرسل عبر {channel === 'ussd' ? 'شبكة USSD (*772#)' : 'رسالة SMS إلى 7722'} دون الحاجة للإنترنت
                            </p>
                          </div>
                        </motion.div>

                        {/* حقل الوصف */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 justify-end">
                            <label className="text-xs font-black text-slate-700">اكتب وصفاً للعطل</label>
                            <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                              <FileText size={13} />
                            </div>
                          </div>
                          <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder={selectedTemplate?.placeholder ?? 'صف العطل بإيجاز — الموقع، طبيعة المشكلة، مدة وجودها...'}
                            rows={4}
                            className="w-full p-3.5 bg-slate-50 border-2 border-slate-100 focus:border-emerald-400 focus:bg-white rounded-2xl text-sm text-slate-800 placeholder:text-slate-300 resize-none outline-none transition-all font-medium text-right leading-relaxed"
                          />
                          <p className="text-[10px] text-slate-400 text-right font-medium">
                            {description.length > 0
                              ? `${description.length} حرف — الوصف التفصيلي يساعد فريق الاستجابة`
                              : 'الوصف اختياري ولكنه يُسرّع الاستجابة'
                            }
                          </p>
                        </div>

                        {/* زر الإرسال */}
                        <button
                          onClick={channel === 'ussd' ? handleUssdSubmit : handleSubmitReport}
                          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
                        >
                          <Send size={16} />
                          إرسال البلاغ الآن
                        </button>

                        <p className="text-[10px] text-slate-400 text-center font-medium">
                          {channel === 'ussd'
                            ? 'سيُحاكي النظام عملية الإرسال عبر USSD'
                            : 'سيُفتح تطبيق الرسائل وتُحاكى عملية الإرسال'
                          }
                        </p>
                      </motion.div>
                    )}

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