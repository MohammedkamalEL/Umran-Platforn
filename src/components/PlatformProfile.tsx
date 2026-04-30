import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Zap, 
  Globe, 
  Smartphone, 
  BarChart3, 
  Users, 
  Layers, 
  Cpu, 
  Lock, 
  ArrowRight,
  Download,
  Share2,
  CheckCircle2,
  ChevronLeft,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '../lib/utils';
import pptxgen from 'pptxgenjs';

interface PlatformProfileProps {
  onClose: () => void;
}

import { PITCH_FEATURES, generatePitchDeck } from '../lib/pitchdeck';

interface PlatformProfileProps {
  onClose: () => void;
}

const FEATURES = [
  ...PITCH_FEATURES.map(f => ({
      ...f,
      icon: f.id === 'gis' ? <Globe className="text-emerald-500" /> :
            f.id === 'omni' ? <Smartphone className="text-blue-500" /> :
            f.id === 'ai' ? <Cpu className="text-purple-500" /> :
            f.id === 'transparency' ? <Shield className="text-amber-500" /> :
            f.id === 'stakeholders' ? <Users className="text-rose-500" /> :
            <BarChart3 className="text-indigo-500" />
  }))
];

export default function PlatformProfile({ onClose }: PlatformProfileProps) {


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto no-scrollbar"
    >
      {/* Navigation Header */}
      <nav className="sticky top-0 z-[120] bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>العودة للوحة التحكم</span>
        </button>

        <div className="flex items-center gap-6">
           <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">PLATFORM_VERSION</p>
              <p className="text-xs font-bold text-emerald-600">v2.4.0-SDN_PULSE</p>
           </div>
           <button 
             onClick={generatePitchDeck}
             className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/10 active:scale-95"
           >
             <Download size={14} />
             تحميل العرض التقديمي // PITCH_DECK
           </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 pt-24 pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 sudan-pattern-modern opacity-[0.03] scale-150 rotate-12 pointer-events-none" />
        <div className="absolute top-0 right-0 w-full h-full sudan-texture opacity-5 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center space-y-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-[0.4em] border border-emerald-100 shadow-sm"
          >
            <Zap size={14} />
            بنية تحتية رقمية لجيل جديد
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-8xl lg:text-[10rem] font-black text-slate-900 tracking-tighter leading-[0.8] font-display"
          >
            مواصفات منصة <span className="text-emerald-500 drop-shadow-[0_0_40px_rgba(16,185,129,0.3)]">عُـمْـران</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <p className="text-xl md:text-3xl text-slate-500 font-medium leading-relaxed italic">
               "نحن لا نبني منصة تقنية، بل نبني عقداً اجتماعياً رقمياً جديداً يعزز الشفافية ويعيد الثقة في مسار التنمية الوطنية."
            </p>
            <div className="w-24 h-1 bg-emerald-500/30 mx-auto rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Mission Quote - Amiri Font */}
      <section className="px-8 pb-32">
        <div className="max-w-5xl mx-auto text-center">
          <motion.p 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif text-slate-900 leading-[1.4] tracking-wide"
          >
            "مِنْ أَجْلِ <span className="text-emerald-600">سُـودَانٍ</span> يَنْهَضُ بِالْعِلْمِ <br/> وَيُبْنَى بِيَدِ أَبْنَائِه"
          </motion.p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-8 pb-32 relative">
        <div className="absolute top-0 right-0 w-full h-full sudan-pattern-modern opacity-[0.02] pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group p-10 bg-white border border-slate-100 rounded-[4rem] hover:border-emerald-500/30 transition-all duration-700 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-500/10"
            >
              <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-emerald-600 transition-all duration-700">
                <div className="group-hover:text-white transition-colors">
                  {React.cloneElement(feature.icon as React.ReactElement, { size: 36 })}
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 font-display leading-tight">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-6 border-r-4 border-slate-100 pr-4 group-hover:border-emerald-500 transition-colors">
                {feature.description}
              </p>
              <div className="flex items-center gap-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50/50 p-2 px-4 rounded-xl inline-flex w-full justify-between">
                <span>{feature.stats}</span>
                <CheckCircle2 size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security & Integrity View */}
      <section className="px-8 pb-32">
         <div className="max-w-7xl mx-auto bg-white rounded-[5rem] p-12 md:p-24 overflow-hidden relative border border-slate-200">
            <div className="absolute inset-0 bg-slate-50 sudan-texture opacity-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10 text-right">
               <div className="space-y-8">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-100/50 border border-emerald-200/50 text-emerald-700 text-[10px] font-black uppercase tracking-[0.4em]">
                    SECURITY_CORE // أساس أمني متين
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-slate-900 font-display leading-tight tracking-tight">نزاهة البيانات <br/><span className="text-emerald-600">فوق كل اعتبار</span></h2>
                  <p className="text-slate-500 text-lg leading-relaxed">
                    نستخدم أحدث تقنيات التشفير والمصادقة لضمان أن كل بلاغ، مساهمة، أو عملية ميدانية موثقة ومؤمنة تماماً ضد التلاعب أو الاختراق.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <Lock className="text-emerald-500 mb-4" size={24} />
                       <p className="text-slate-900 font-black text-sm mb-1 uppercase tracking-widest">تشفير AES-256</p>
                       <p className="text-slate-400 text-[10px] font-medium leading-relaxed">حماية شاملة لكافة قواعد البيانات والملفات الحساسة.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <Shield className="text-emerald-500 mb-4" size={24} />
                       <p className="text-slate-900 font-black text-sm mb-1 uppercase tracking-widest">مصادقة ثنائية</p>
                       <p className="text-slate-400 text-[10px] font-medium leading-relaxed">ربط الوصول للتقارير الحساسة بنظام الهوية الرقمية الموحدة.</p>
                    </div>
                  </div>
               </div>

               <div className="relative">
                  <div className="w-full aspect-square bg-slate-50 rounded-[4rem] border-2 border-slate-100 relative flex items-center justify-center group overflow-hidden">
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[120%] h-[120%] border border-slate-200/50 rounded-full animate-[spin_20s_linear_infinite]" />
                        <div className="w-[80%] h-[80%] border border-emerald-500/10 rounded-full absolute animate-[spin_12s_linear_infinite_reverse]" />
                     </div>
                     <div className="relative z-10 text-emerald-600 animate-pulse">
                        <Cpu size={120} strokeWidth={1} />
                     </div>
                     
                     <div className="absolute bottom-8 right-8 left-8 p-6 bg-white border border-slate-100 shadow-xl rounded-3xl text-right">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">NODE_STATUS: ACTIVE</p>
                        <p className="text-xs font-bold text-slate-900">يتم فحص أكثر من ٥٠٠٠ نقطة بيانات في الثانية لضمان الاستقرار.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer Branding */}
      <footer className="px-8 pb-16 text-center">
         <div className="max-w-7xl mx-auto py-16 border-t border-slate-200">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 font-display">عُـمْـران <span className="text-emerald-500">.</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-8">BUILDING_SUDAN_TOGETHER // ٢٠٢٦</p>
            <div className="flex justify-center gap-8">
               <button className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors">سياسة الخصوصية</button>
               <button className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors">شروط الاستخدام</button>
               <button className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors">تواصل معنا</button>
            </div>
         </div>
      </footer>
    </motion.div>
  );
}
