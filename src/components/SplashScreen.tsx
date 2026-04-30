
// old code 

// import React, { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { Users, Activity, Building2, ArrowRight, Zap, Globe, Shield } from 'lucide-react';
// import { cn } from '../lib/utils';

// export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
//   const [phase, setPhase] = useState<'loading' | 'landing'>('loading');
//   const [progress, setProgress] = useState(0);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setProgress(prev => {
//         if (prev >= 100) {
//           clearInterval(timer);
//           setTimeout(() => setPhase('landing'), 800);
//           return 100;
//         }
//         return prev + 2;
//       });
//     }, 30);
//     return () => clearInterval(timer);
//   }, []);

//   return (
//     <motion.div 
//       initial={{ opacity: 1 }}
//       exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
//       transition={{ duration: 1 }}
//       className="fixed inset-0 z-[2000] bg-brand-dark overflow-y-auto no-scrollbar"
//       dir="rtl"
//     >
//       <div className="min-h-screen w-full relative flex flex-col items-center hero-gradient tech-grid-unified py-20 px-6">
        
//         <AnimatePresence mode="wait">
//           {phase === 'loading' ? (
//             <motion.div 
//               key="loading"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//               className="flex-1 flex flex-col items-center justify-center space-y-8"
//             >
//               <div className="relative w-32 h-32">
//                 <svg className="w-full h-full transform -rotate-90">
//                   <circle
//                     cx="64"
//                     cy="64"
//                     r="60"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                     fill="transparent"
//                     className="text-white/10"
//                   />
//                   <motion.circle
//                     cx="64"
//                     cy="64"
//                     r="60"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                     fill="transparent"
//                     strokeDasharray="377"
//                     animate={{ strokeDashoffset: 377 - (377 * progress) / 100 }}
//                     className="text-emerald-500"
//                   />
//                 </svg>
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <span className="text-xl font-black text-white font-mono">{Math.floor(progress)}%</span>
//                 </div>
//               </div>
//               <p className="text-emerald-500 font-black tracking-[0.3em] uppercase text-xs animate-pulse">Initializing System...</p>
//             </motion.div>
//           ) : (
//             <motion.div 
//               key="landing"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="w-full max-w-7xl flex flex-col items-center"
//             >
//               {/* Top Badge */}
//               <motion.div 
//                 initial={{ y: -20, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 className="pill-badge mb-16"
//               >
//                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//                 منصة إعادة الإعمار الرقمية
//               </motion.div>

//               {/* Hero Content */}
//               <div className="text-center space-y-10 mb-24 max-w-5xl">
//                 <motion.h1 
//                   initial={{ y: 20, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   transition={{ delay: 0.2 }}
//                   className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-tight font-display tracking-tighter italic"
//                 >
//                   عُـمْـران <span className="text-brand-red animate-pulse">.</span>
//                 </motion.h1>

//                 <motion.p 
//                   initial={{ y: 20, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   transition={{ delay: 0.4 }}
//                   className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-4xl mx-auto italic"
//                 >
//                   نحن لا نبني تطبيقاً.. نحن نبني نظام تشغيل للتعافي وتجاوز الأزمات. 
//                   <br className="hidden md:block" />
//                   <span className="text-white font-black text-2xl mt-4 block not-italic uppercase tracking-tight">البنية التحتية الرقمية لإعادة إعمار السودان</span>
//                 </motion.p>

//                 <motion.div 
//                   initial={{ y: 20, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   transition={{ delay: 0.6 }}
//                   className="pt-6"
//                 >
//                   <button 
//                     onClick={onFinish}
//                     className="px-12 py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black text-lg shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all flex items-center gap-4 mx-auto group"
//                   >
//                     دخول المنصة الرقمية
//                     <ArrowRight className="group-hover:translate-x-[-10px] transition-transform rotate-180" size={24} />
//                   </button>
//                 </motion.div>
//               </div>

//               {/* Feature Cards */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-12">
//                 {[
//                   {
//                     title: "إعادة الإعمار",
//                     desc: "بناء المدن نقطة بيانات بعد أخرى",
//                     icon: Building2,
//                     delay: 0.8
//                   },
//                   {
//                     title: "المشاركة المدنية",
//                     desc: "جسر بين المواطن والتنفيذ الرسمي",
//                     icon: Users,
//                     delay: 1.0
//                   },
//                   {
//                     title: "الذكاء التحليلي",
//                     desc: "تحويل البيانات إلى قرارات",
//                     icon: Activity,
//                     delay: 1.2
//                   }
//                 ].map((feature, idx) => (
//                   <motion.div
//                     key={idx}
//                     initial={{ y: 30, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     transition={{ delay: feature.delay }}
//                     className="feature-card-premium group"
//                   >
//                     <div className="feature-icon-wrapper">
//                       <feature.icon size={32} />
//                     </div>
//                     <h3 className="text-2xl font-black text-white mt-4">{feature.title}</h3>
//                     <p className="text-slate-400 font-medium">{feature.desc}</p>
                    
//                     {/* Decorative element */}
//                     <div className="w-12 h-1 bg-white/5 group-hover:bg-emerald-500/50 transition-colors mt-4 rounded-full" />
//                   </motion.div>
//                 ))}
//               </div>

//               {/* Footer Stats/Info */}
//               <motion.div 
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 1.5 }}
//                 className="mt-32 flex flex-wrap justify-center gap-12 border-t border-white/10 pt-16 w-full"
//               >
//                 <div className="flex flex-col items-center gap-2">
//                   <div className="p-3 bg-white/5 rounded-2xl text-emerald-400">
//                     <Globe size={24} />
//                   </div>
//                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">تغطية وطنية</span>
//                   <span className="text-lg font-bold text-white">١٨ ولاية</span>
//                 </div>
//                 <div className="flex flex-col items-center gap-2">
//                   <div className="p-3 bg-white/5 rounded-2xl text-emerald-400">
//                     <Shield size={24} />
//                   </div>
//                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">شفافية رقمية</span>
//                   <span className="text-lg font-bold text-white">سجلات عامة</span>
//                 </div>
//                 <div className="flex flex-col items-center gap-2">
//                   <div className="p-3 bg-white/5 rounded-2xl text-emerald-400">
//                     <Zap size={24} />
//                   </div>
//                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">استجابة ذكية</span>
//                   <span className="text-lg font-bold text-white">٢٤/٧ نشط</span>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </motion.div>
//   );
// }

// new code
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react'; // تأكد من المسار الصحيح للمكتبة
import { Users, Activity, Building2, ArrowRight, Zap, Globe, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

// فصل البيانات يجعل الكود أنظف وأسهل في الصيانة
const FEATURES = [
  { title: "إعادة الإعمار", desc: "بناء المدن بيانات بعد أخرى", icon: Building2, delay: 0.2 },
  { title: "المشاركة المدنية", desc: "جسر بين المواطن والتنفيذ", icon: Users, delay: 0.3 },
  { title: "الذكاء التحليلي", desc: "تحويل البيانات إلى قرارات", icon: Activity, delay: 0.4 },
];

const STATS = [
  { label: "تغطية وطنية", value: "١٨ ولاية", icon: Globe },
  { label: "شفافية رقمية", value: "سجلات عامة", icon: Shield },
  { label: "استجابة ذكية", value: "٢٤/٧ نشط", icon: Zap },
];

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<'loading' | 'landing'>('loading');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (progress < 100) {
      const timer = setTimeout(() => setProgress(prev => prev + 5), 40); // زيادة أسرع وأكثر دقة
      return () => clearTimeout(timer);
    } else {
      const transitionTimer = setTimeout(() => setPhase('landing'), 600);
      return () => clearTimeout(transitionTimer);
    }
  }, [progress]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      className="fixed inset-0 z-[2000] bg-[#0A0A0A] overflow-y-auto overflow-x-hidden"
      dir="rtl"
    >
      <div className="min-h-screen flex flex-col items-center justify-start py-12 px-6 relative">
        {/* خلفية تقنية بسيطة */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:40px_40px]" />

        <AnimatePresence mode="wait">
          {phase === 'loading' ? (
            <LoadingPhase progress={progress} key="loader" />
          ) : (
            <LandingPhase onFinish={onFinish} key="content" />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// مكون مرحلة التحميل - Loading
function LoadingPhase({ progress }: { progress: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-1 flex flex-col items-center justify-center z-10"
    >
      <div className="relative w-28 h-28 mb-6">
        <svg className="w-full h-full -rotate-90">
          <circle cx="56" cy="56" r="50" stroke="white" strokeWidth="2" fill="transparent" className="opacity-10" />
          <motion.circle
            cx="56" cy="56" r="50" stroke="#10b981" strokeWidth="3" fill="transparent"
            strokeDasharray="314"
            initial={{ strokeDashoffset: 314 }}
            animate={{ strokeDashoffset: 314 - (314 * progress) / 100 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xl text-white font-bold">
          {progress}%
        </div>
      </div>
      <span className="text-emerald-500 text-[10px] tracking-[4px] uppercase animate-pulse">جاري تهيئة النظام</span>
    </motion.div>
  );
}

// مكون واجهة الهبوط - Landing
function LandingPhase({ onFinish }: { onFinish: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl flex flex-col items-center z-10"
    >
      {/* Badge */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-sm mb-12 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        منصة إعادة الإعمار الرقمية
      </div>

      {/* Hero Section */}
      <div className="text-center mb-20">
        <h1 className="text-7xl md:text-9xl font-black text-white mb-6 tracking-tight">
          عُـمْـران<span className="text-emerald-500">.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          البنية التحتية الرقمية لإعادة إعمار السودان
          <span className="block text-white font-bold mt-2 text-sm md:text-base opacity-80 uppercase">نظام تشغيل للتعافي وتجاوز الأزمات</span>
        </p>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onFinish}
          className="mt-10 px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-3 mx-auto"
        >
          دخول المنصة الرقمية
          <ArrowRight size={20} className="rotate-180" />
        </motion.button>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {FEATURES.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: f.delay }}
            className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
              <f.icon size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="mt-24 w-full pt-12 border-t border-white/5 flex flex-wrap justify-center gap-12">
        {STATS.map((s, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-1">
            <s.icon size={20} className="text-emerald-500 mb-2 opacity-70" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{s.label}</span>
            <span className="text-white font-bold">{s.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}