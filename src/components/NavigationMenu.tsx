// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { 
//   Map as MapIcon, Users, Activity, User as UserIcon,
//   LogIn, Settings, Shield, Search, Bell, Command, HelpCircle, X
// } from 'lucide-react';
// import { cn } from '../lib/utils';

// interface NavigationMenuProps {
//   isOpen: boolean;
//   onClose: () => void;
//   activeView: string;
//   onNavigate: (view: 'dashboard' | 'campaigns' | 'stats' | 'profile' | 'report') => void;
//   unreadCount?: number;
// }

// const MENU_ITEMS: { id: 'dashboard' | 'campaigns' | 'stats' | 'profile' | 'report'; label: string; sublabel: string; icon: React.ReactNode }[] = [
//   { id: 'dashboard', label: 'المخطط القومي الشامل', sublabel: 'NATIONAL_GIS_SYNC', icon: <MapIcon size={20} /> },
//   { id: 'campaigns', label: 'الحملات والمبادرات', sublabel: 'COMMUNITY_ACTION', icon: <Users size={20} /> },
//   { id: 'stats', label: 'مركز تحليل البيانات', sublabel: 'ANALYTICS_CORE', icon: <Activity size={20} /> },
//   { id: 'profile', label: 'الهوية الوطنية الرقمية', sublabel: 'CITIZEN_PROFILE', icon: <UserIcon size={20} /> },
// ];

// const SECONDARY_ITEMS = [
//   { id: 'portal', label: 'بوابة المؤسسات الحكومية', icon: <LogIn size={16} /> },
//   { id: 'settings', label: 'إعدادات النظام', icon: <Settings size={16} /> },
//   { id: 'security', label: 'مركز أمن البيانات', icon: <Shield size={16} /> },
//   { id: 'help', label: 'مركز الدعم والإرشاد', icon: <HelpCircle size={16} /> },
// ];

// export default function NavigationMenu({ isOpen, onClose, activeView, onNavigate, unreadCount = 0 }: NavigationMenuProps) {
//   const [search, setSearch] = useState('');

//   const filteredItems = MENU_ITEMS.filter(item =>
//     !search || item.label.includes(search) || item.sublabel.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div className="fixed inset-0 z-[1100] overflow-hidden" dir="rtl">
//           {/* Backdrop */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//             className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
//           />

//           {/* Panel */}
//           <motion.div
//             initial={{ x: '100%' }}
//             animate={{ x: 0 }}
//             exit={{ x: '100%' }}
//             transition={{ type: "spring", damping: 30, stiffness: 280 }}
//             className="absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col border-l border-slate-100"
//           >
//             {/* Header */}
//             <div className="p-5 border-b border-slate-100 flex items-center justify-between">
//               <button
//                 onClick={onClose}
//                 className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all active:scale-90"
//               >
//                 <X size={18} />
//               </button>
//               <div className="flex items-center gap-3">
//                 <div>
//                   <h2 className="text-base font-black text-slate-900">مركز التحكم</h2>
//                   <p className="text-[9px] font-mono font-black text-emerald-600 uppercase tracking-wider">COMMAND_CENTER</p>
//                 </div>
//                 <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
//                   <Command size={20} />
//                 </div>
//               </div>
//             </div>

//             {/* Search */}
//             <div className="px-4 py-3 border-b border-slate-50">
//               <div className="relative">
//                 <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
//                 <input
//                   type="text"
//                   placeholder="ابحث عن الميزات..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="w-full pr-9 pl-4 py-2.5 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-right placeholder:text-slate-300"
//                 />
//               </div>
//             </div>

//             {/* Nav Items */}
//             <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 no-scrollbar">
//               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 font-mono">اللائحة الرئيسية</p>
//               {filteredItems.map((item, idx) => (
//                 <motion.button
//                   key={item.id}
//                   initial={{ opacity: 0, x: 16 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: idx * 0.05 }}
//                   onClick={() => { onNavigate(item.id); onClose(); }}
//                   className={cn(
//                     "w-full flex items-center justify-between p-4 rounded-xl transition-all group",
//                     activeView === item.id
//                       ? "bg-emerald-600 text-white shadow-md"
//                       : "hover:bg-slate-50 text-slate-600"
//                   )}
//                 >
//                   <div className={cn(
//                     "w-2 h-2 rounded-full transition-all",
//                     activeView === item.id ? "bg-emerald-300 animate-pulse" : "opacity-0"
//                   )} />
//                   <div className="flex items-center gap-3 flex-1 text-right">
//                     <div>
//                       <span className={cn(
//                         "text-sm font-black block",
//                         activeView === item.id ? "text-white" : "text-slate-900"
//                       )}>{item.label}</span>
//                       <span className={cn(
//                         "text-[9px] font-mono font-bold uppercase tracking-wider",
//                         activeView === item.id ? "text-emerald-200" : "text-slate-400"
//                       )}>{item.sublabel}</span>
//                     </div>
//                     <div className={cn(
//                       "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
//                       activeView === item.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
//                     )}>
//                       {item.icon}
//                     </div>
//                   </div>
//                 </motion.button>
//               ))}

//               <div className="pt-4">
//                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 font-mono">الخدمات الإضافية</p>
//                 <div className="grid grid-cols-2 gap-2">
//                   {SECONDARY_ITEMS.map((item, idx) => (
//                     <motion.button
//                       key={item.id}
//                       initial={{ opacity: 0, scale: 0.95 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ delay: 0.2 + idx * 0.04 }}
//                       className="flex flex-col items-end gap-2 p-4 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all text-right group border border-transparent hover:border-emerald-100"
//                     >
//                       <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-emerald-600 shadow-sm transition-colors">
//                         {item.icon}
//                       </div>
//                       <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-700 leading-tight">{item.label}</span>
//                     </motion.button>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Footer */}
//             <div className="p-4 border-t border-slate-100 flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//                 <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider font-mono">VPN_CONNECTED</span>
//               </div>
//               <div className="relative">
//                 <Bell size={16} className="text-slate-400" />
//                 {unreadCount > 0 && (
//                   <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center border-2 border-white">
//                     {unreadCount}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// }


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map as MapIcon, Users, Activity, User as UserIcon,
  LogIn, Settings, Shield, Search, Bell, Command, HelpCircle, X
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onNavigate: (view: 'dashboard' | 'campaigns' | 'stats' | 'profile' | 'report' | 'ministry') => void;
  unreadCount?: number;
}

const MENU_ITEMS: { id: 'dashboard' | 'campaigns' | 'stats' | 'profile' | 'report' | 'ministry'; label: string; sublabel: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'المخطط القومي الشامل', sublabel: 'NATIONAL_GIS_SYNC', icon: <MapIcon size={20} /> },
  { id: 'campaigns', label: 'الحملات والمبادرات', sublabel: 'COMMUNITY_ACTION', icon: <Users size={20} /> },
  { id: 'stats', label: 'مركز تحليل البيانات', sublabel: 'ANALYTICS_CORE', icon: <Activity size={20} /> },
  { id: 'profile', label: 'الهوية الوطنية الرقمية', sublabel: 'CITIZEN_PROFILE', icon: <UserIcon size={20} /> },
  { id: 'ministry', label: 'لوحة إدارة الوزارات', sublabel: 'MINISTRY_DASHBOARD', icon: <Shield size={20} /> },
];

const SECONDARY_ITEMS = [
  { id: 'portal', label: 'بوابة المؤسسات الحكومية', icon: <LogIn size={16} /> },
  { id: 'settings', label: 'إعدادات النظام', icon: <Settings size={16} /> },
  { id: 'security', label: 'مركز أمن البيانات', icon: <Shield size={16} /> },
  { id: 'help', label: 'مركز الدعم والإرشاد', icon: <HelpCircle size={16} /> },
];

export default function NavigationMenu({ isOpen, onClose, activeView, onNavigate, unreadCount = 0 }: NavigationMenuProps) {
  const [search, setSearch] = useState('');

  const filteredItems = MENU_ITEMS.filter(item =>
    !search || item.label.includes(search) || item.sublabel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] overflow-hidden" dir="rtl">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col border-l border-slate-100"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all active:scale-90"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900">مركز التحكم</h2>
                  <p className="text-[9px] font-mono font-black text-emerald-600 uppercase tracking-wider">COMMAND_CENTER</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                  <Command size={20} />
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-slate-50">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input
                  type="text"
                  placeholder="ابحث عن الميزات..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pr-9 pl-4 py-2.5 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-right placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 no-scrollbar">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 font-mono">اللائحة الرئيسية</p>
              {filteredItems.map((item, idx) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => { onNavigate(item.id); onClose(); }}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl transition-all group",
                    activeView === item.id
                      ? "bg-emerald-600 text-white shadow-md"
                      : "hover:bg-slate-50 text-slate-600"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    activeView === item.id ? "bg-emerald-300 animate-pulse" : "opacity-0"
                  )} />
                  <div className="flex items-center gap-3 flex-1 text-right">
                    <div>
                      <span className={cn(
                        "text-sm font-black block",
                        activeView === item.id ? "text-white" : "text-slate-900"
                      )}>{item.label}</span>
                      <span className={cn(
                        "text-[9px] font-mono font-bold uppercase tracking-wider",
                        activeView === item.id ? "text-emerald-200" : "text-slate-400"
                      )}>{item.sublabel}</span>
                    </div>
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                      activeView === item.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                    )}>
                      {item.icon}
                    </div>
                  </div>
                </motion.button>
              ))}

              <div className="pt-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 font-mono">الخدمات الإضافية</p>
                <div className="grid grid-cols-2 gap-2">
                  {SECONDARY_ITEMS.map((item, idx) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + idx * 0.04 }}
                      className="flex flex-col items-end gap-2 p-4 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all text-right group border border-transparent hover:border-emerald-100"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-emerald-600 shadow-sm transition-colors">
                        {item.icon}
                      </div>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-700 leading-tight">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider font-mono">VPN_CONNECTED</span>
              </div>
              <div className="relative">
                <Bell size={16} className="text-slate-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}