import React from 'react';
import { motion } from 'motion/react';
import { Award, Target, TrendingUp, Shield, Signal, Zap, X, Star, Globe, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

export default function HackathonPitch({ onClose }: { onClose: () => void }) {
  const features = [
    {
      title: 'الذكاء الاصطناعي السيادي (Gemini AI)',
      desc: 'تحليل فوري للصور والأصوات لتصنيف الأعطال وتقدير الخطورة بدقة ٩٤٪ باستخدام محركات قوقل المتطورة.',
      icon: Cpu,
      color: 'text-emerald-500'
    },
    {
      title: 'الجسر الرقمي (SMS/USSD)',
      desc: 'تكامل كامل مع شبكات الاتصال الوطنية لضمان وصول البلاغات حتى في حال انقطاع الإنترنت الكامل.',
      icon: Signal,
      color: 'text-blue-500'
    },
    {
      title: 'نظام النقاط والمكافآت',
      desc: 'تحفيز المشاركة المجتمعية عبر نظام تصنيف إقليمي يحول المتطوعين إلى "سفراء إعمار" مع جوائز عينية.',
      icon: Star,
      color: 'text-amber-500'
    },
    {
      title: 'الشفافية التشغيلية (SLA)',
      desc: 'تتبع لحظي للمهمات مع كود متابعة موحد يربط المواطن بغرفة العمليات في المؤسسة المعنية مباشرة.',
      icon: Shield,
      color: 'text-rose-500'
    }
  ];

  const businessModel = [
    { label: 'B2G Analytics', value: 'بيع بيانات تحليل الفجوات والاحتياجات لوزارات البنية التحتية.' },
    { label: 'NGO Data Hub', value: 'ترخيص الوصول للوضع الميداني للمنظمات الدولية لتوجيه المساعدات.' },
    { label: 'Utility Micro-Fees', value: 'رسوم رمزية على عمليات الدفع الإلكتروني عبر البوابة المالية.' },
    { label: 'Sustainable Ads', value: 'مساحات إعلانية للشركات المساهمة في مشاريع الإعمار الكبرى.' }
  ];

  return (
    <div className="p-10 lg:p-16 h-full flex flex-col bg-slate-50 text-slate-900 overflow-hidden relative" dir="rtl">
      <div className="absolute inset-0 opacity-5 sudan-texture pointer-events-none" />
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />

      <div className="flex justify-between items-start mb-16 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg">
              <Award size={28} strokeWidth={2.5} className="text-white" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-[0.4em] font-mono italic text-emerald-600">رؤية الفوز // ٢٠٢٦</h3>
          </div>
          <h2 className="text-7xl lg:text-8xl font-black tracking-tighter leading-none font-display text-slate-950">لماذا "عمران" هو المنصة الفائزة؟</h2>
        </div>
        <button 
          onClick={onClose}
          className="w-16 h-16 rounded-[2rem] bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-2xl text-slate-400"
        >
          <X size={32} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
        <div className="space-y-10">
          <div className="p-12 rounded-[4rem] bg-white border border-slate-100 space-y-8 shadow-xl">
            <div className="flex items-center gap-4">
              <Target className="text-emerald-500" size={32} />
              <h3 className="text-3xl font-black tracking-tight text-slate-900">المميزات التنافسية</h3>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {features.map((f, i) => (
                <div key={i} className="flex gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-500/30 transition-all group">
                   <div className={cn("shrink-0 p-4 rounded-2xl bg-white group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm", f.color)}>
                      <f.icon size={28} />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-slate-900 mb-1">{f.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="p-12 rounded-[4rem] bg-gradient-to-br from-emerald-600 to-emerald-800 text-white space-y-8 shadow-2xl">
             <div className="flex items-center gap-4">
                <TrendingUp size={32} />
                <h3 className="text-3xl font-black tracking-tight">استدامة النموذج المادي</h3>
             </div>
             <p className="text-emerald-100 font-medium">عمران ليست مجرد تطبيق، بل بنية تحتية اقتصادية رقمية قادرة على تمويل نفسها والنمو بشكل مستدام عبر أربعة روافد أساسية:</p>
             <div className="space-y-4">
                {businessModel.map((m, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/10 border border-white/10 flex items-start gap-4">
                     <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-[10px] font-black font-mono">{i+1}</span>
                     <div>
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-200 mb-1">{m.label}</p>
                        <p className="text-sm font-bold">{m.value}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="p-12 rounded-[4rem] bg-white border border-slate-100 relative overflow-hidden group shadow-xl">
             <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <Globe className="text-blue-500" size={64} />
                <h3 className="text-4xl font-black tracking-tighter text-slate-950">الرؤية العالمية للسودان</h3>
                <p className="text-lg text-slate-500 font-bold leading-relaxed max-w-md">
                  نحن نبني "أكبر قاعدة بيانات ميدانية حية" في المنطقة، مما يجعل السودان مركزاً إقليمياً لابتكارات المدن الذكية في بيئات ما بعد النزاعات.
                </p>
                <div className="pt-4 flex gap-4">
                   <div className="px-6 py-2 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest text-blue-500">SCALABLE</div>
                   <div className="px-6 py-2 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest text-emerald-500">IMPACT_DRIVEN</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
