// import React from 'react';
// import { motion } from 'motion/react';
// import { Bell, Shield, CloudRain, Users, MapPin, Check, X, MessageSquare, Phone } from 'lucide-react';
// import { useNotifications } from '../contexts/NotificationContext';
// import { cn } from '../lib/utils';

// export default function NotificationSettings({ onClose }: { onClose: () => void }) {
//   const { preferences, updatePreferences } = useNotifications();

//   const toggle = (key: keyof typeof preferences) => {
//     updatePreferences({ [key]: !preferences[key] });
//   };

//   const options: { id: keyof typeof preferences; title: string; desc: string; icon: any; color: string }[] = [
//     {
//       id: 'infrastructure',
//       title: 'أعطال البنية التحتية',
//       desc: 'بلاغات الكهرباء، المياه، والطرق الجديدة في منطقتك.',
//       icon: Shield,
//       color: 'bg-amber-100 text-amber-600',
//     },
//     {
//       id: 'weather',
//       title: 'الإنذار المبكر (الأرصاد)',
//       desc: 'تحذيرات السيول، الأمطار الغزيرة، والعواصف الترابية.',
//       icon: CloudRain,
//       color: 'bg-blue-100 text-blue-600',
//     },
//     {
//       id: 'campaigns',
//       title: 'مبادرات الإعمار',
//       desc: 'تحديثات عن الحملات الميدانية التي تشارك فيها.',
//       icon: Users,
//       color: 'bg-emerald-100 text-emerald-600',
//     },
//     {
//       id: 'smsAlerts',
//       title: 'تنبيهات SMS',
//       desc: 'استلم الإخطارات الهامة حتى عند انقطاع الإنترنت.',
//       icon: MessageSquare,
//       color: 'bg-slate-100 text-slate-800',
//     },
//     {
//       id: 'ussdInteractive',
//       title: 'التفاعل عبر USSD',
//       desc: 'إمكانية الرد على البلاغات عبر القائمة السريعة *772#.',
//       icon: Phone,
//       color: 'bg-indigo-100 text-indigo-600',
//     },
//     {
//       id: 'regionOnly',
//       title: 'نطاق ولايتي فقط',
//       desc: 'استلم التنبيهات المتعلقة بولايتك المسجلة فقط.',
//       icon: MapPin,
//       color: 'bg-slate-100 text-slate-600',
//     },
//   ];

//   return (
//     <div className="p-6 space-y-6" dir="rtl">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-xl font-black text-slate-900 font-display">إعدادات التنبيهات</h3>
//         <button 
//           onClick={onClose}
//           className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
//         >
//           <X size={20} />
//         </button>
//       </div>

//       <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">خصص نوع التنبيهات التي ترغب في استلامها عبر دفع الإشعارات لضمان وصول المعلومات المهمة في وقتها.</p>

//       <div className="space-y-4">
//         {options.map((opt) => (
//           <button
//             key={opt.id}
//             onClick={() => toggle(opt.id)}
//             className={cn(
//               "w-full p-5 rounded-[28px] border-2 transition-all flex items-center gap-4 text-right group",
//               preferences[opt.id]
//                 ? "bg-white border-emerald-500 shadow-xl shadow-emerald-50"
//                 : "bg-slate-50 border-transparent hover:border-slate-200"
//             )}
//           >
//             <div className={cn("p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110", opt.color)}>
//               <opt.icon size={20} />
//             </div>
//             <div className="flex-1">
//               <h4 className="text-sm font-black text-slate-900">{opt.title}</h4>
//               <p className="text-[10px] text-slate-400 font-bold leading-tight mt-0.5">{opt.desc}</p>
//             </div>
//             <div className={cn(
//               "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
//               preferences[opt.id]
//                 ? "bg-emerald-500 border-emerald-500 text-white"
//                 : "border-slate-200"
//             )}>
//               {preferences[opt.id] && <Check size={14} strokeWidth={3} />}
//             </div>
//           </button>
//         ))}
//       </div>

//       <div className="pt-4">
//         <button 
//           onClick={onClose}
//           className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 active:scale-95 transition-all"
//         >
//           حفظ الإعدادات
//         </button>
//       </div>
//     </div>
//   );
// }

import React from 'react';
import { motion } from 'motion/react';
import { Bell, Shield, CloudRain, Users, MapPin, Check, X, MessageSquare, Phone } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { cn } from '../lib/utils';

export default function NotificationSettings({ onClose }: { onClose: () => void }) {
  const { preferences, updatePreferences } = useNotifications();

  const toggle = (key: keyof typeof preferences) => {
    updatePreferences({ [key]: !preferences[key] });
  };

  const options: { id: keyof typeof preferences; title: string; desc: string; icon: any; color: string; activeColor: string }[] = [
    {
      id: 'infrastructure',
      title: 'أعطال البنية التحتية',
      desc: 'بلاغات الكهرباء، المياه، والطرق الجديدة في منطقتك.',
      icon: Shield,
      color: 'bg-amber-50 text-amber-600',
      activeColor: 'shadow-amber-100',
    },
    {
      id: 'weather',
      title: 'الإنذار المبكر (الأرصاد)',
      desc: 'تحذيرات السيول، الأمطار الغزيرة، والعواصف الترابية.',
      icon: CloudRain,
      color: 'bg-blue-50 text-blue-600',
      activeColor: 'shadow-blue-100',
    },
    {
      id: 'campaigns',
      title: 'مبادرات الإعمار',
      desc: 'تحديثات عن الحملات الميدانية التي تشارك فيها.',
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600',
      activeColor: 'shadow-emerald-100',
    },
    {
      id: 'smsAlerts',
      title: 'تنبيهات SMS',
      desc: 'استلم الإخطارات الهامة حتى عند انقطاع الإنترنت.',
      icon: MessageSquare,
      color: 'bg-slate-100 text-slate-700',
      activeColor: 'shadow-slate-100',
    },
    {
      id: 'ussdInteractive',
      title: 'التفاعل عبر USSD',
      desc: 'إمكانية الرد على البلاغات عبر القائمة السريعة *772#.',
      icon: Phone,
      color: 'bg-indigo-50 text-indigo-600',
      activeColor: 'shadow-indigo-100',
    },
    {
      id: 'regionOnly',
      title: 'نطاق ولايتي فقط',
      desc: 'استلم التنبيهات المتعلقة بولايتك المسجلة فقط.',
      icon: MapPin,
      color: 'bg-slate-100 text-slate-600',
      activeColor: 'shadow-slate-100',
    },
  ];

  return (
    <div className="p-5 sm:p-6 space-y-5" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X size={20} />
        </button>
        <div className="text-right">
          <h3 className="text-lg font-black text-slate-900">إعدادات التنبيهات</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">خصّص ما يصلك من إشعارات</p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {options.map((opt, i) => (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => toggle(opt.id)}
            className={cn(
              "w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 text-right",
              preferences[opt.id]
                ? `bg-white border-emerald-500 shadow-lg ${opt.activeColor}`
                : "bg-slate-50 border-transparent hover:border-slate-200 hover:bg-white"
            )}
          >
            {/* Icon */}
            <div className={cn("p-2.5 rounded-xl shrink-0", opt.color)}>
              <opt.icon size={18} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-slate-900 leading-tight">{opt.title}</h4>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">{opt.desc}</p>
            </div>

            {/* Toggle check */}
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
              preferences[opt.id]
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-slate-200 bg-white"
            )}>
              {preferences[opt.id] && <Check size={12} strokeWidth={3} />}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Save */}
      <div className="pt-1">
        <button
          onClick={onClose}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all"
        >
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}
