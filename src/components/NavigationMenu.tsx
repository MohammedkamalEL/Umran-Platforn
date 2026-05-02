// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { 
//   Map as MapIcon, 
//   Users, 
//   Activity, 
//   User as UserIcon,
//   LogIn,
//   Settings,
//   Shield,
//   Search,
//   Bell,
//   Command,
//   HelpCircle,
//   X
// } from 'lucide-react';
// import { cn } from '../lib/utils';

// interface NavigationMenuProps {
//   isOpen: boolean;
//   onClose: () => void;
//   activeView: string;
//   onNavigate: (view: 'dashboard' | 'campaigns' | 'stats' | 'profile' | 'report') => void;
//   unreadCount?: number;
// }

// const MENU_ITEMS: { id: 'dashboard' | 'campaigns' | 'stats' | 'profile' | 'report'; label: string; sublabel: string; icon: React.ReactNode; color: string }[] = [
//   { id: 'dashboard', label: 'المخطط القومي الشامل', sublabel: 'NATIONAL_GIS_SYNC', icon: <MapIcon size={24} />, color: 'emerald' },
//   { id: 'campaigns', label: 'الحملات والمبادرات', sublabel: 'COMMUNITY_ACTION', icon: <Users size={24} />, color: 'blue' },
//   { id: 'stats', label: 'مركز تحليل البيانات', sublabel: 'ANALYTICS_CORE', icon: <Activity size={24} />, color: 'purple' },
//   { id: 'profile', label: 'الهوية الوطنية الرقمية', sublabel: 'CITIZEN_PROFILE', icon: <UserIcon size={24} />, color: 'slate' },
// ];

// const SECONDARY_ITEMS = [
//   { id: 'portal', label: 'بوابة المؤسسات الحكومية', icon: <LogIn size={18} />, action: 'portal' },
//   { id: 'settings', label: 'إعدادات التحكم والنظام', icon: <Settings size={18} />, action: 'settings' },
//   { id: 'security', label: 'مركز أمن البيانات', icon: <Shield size={18} />, action: 'security' },
//   { id: 'help', label: 'مركز الدعم والإرشاد', icon: <HelpCircle size={18} />, action: 'help' },
// ];

// export default function NavigationMenu({ isOpen, onClose, activeView, onNavigate, unreadCount = 0 }: NavigationMenuProps) {
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 1024);
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div className="fixed inset-0 z-[1100] overflow-hidden" dir="rtl">
//           {/* Backdrop Blur & Grain */}
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//             className="absolute inset-0 bg-white/40 backdrop-blur-3xl"
//           >
//             <div className="absolute inset-0 sudan-texture opacity-20" />
//             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-white/60" />
//           </motion.div>

//           {/* Menu Panel */}
//           <motion.div 
//             initial={isMobile ? { y: '-100%', x: 0 } : { x: '100%', y: 0 }}
//             animate={{ x: 0, y: 0 }}
//             exit={isMobile ? { y: '-100%', x: 0 } : { x: '100%', y: 0 }}
//             transition={{ type: "spring", damping: 35, stiffness: 300, mass: 1 }}
//             className="absolute top-0 right-0 h-full w-full lg:max-w-md bg-white/95 backdrop-blur-3xl shadow-[-40px_0_100px_rgba(0,0,0,0.1)] flex flex-col border-l border-slate-100"
//           >
//             {/* Header Section */}
//             <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 relative overflow-hidden">
//                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
               
//                <div className="flex items-center gap-4 relative z-10">
//                   <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl">
//                      <Command size={24} />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-black text-slate-950 font-display italic">مركز التحكم</h2>
//                     <p className="text-[8px] font-sans font-black text-emerald-600 uppercase tracking-[0.4em] mt-0.5">COMMAND_CENTER // V5.0</p>
//                   </div>
//                </div>

//                <button 
//                  onClick={onClose}
//                  className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-90"
//                >
//                  <X size={20} />
//                </button>
//             </div>

//             {/* Quick Search */}
//             <div className="px-6 py-4">
//                <div className="relative group">
//                   <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
//                      <Search size={16} />
//                   </div>
//                   <input 
//                     type="text" 
//                     placeholder="ابحث عن الميزات..."
//                     className="w-full pr-12 pl-4 py-3.5 bg-slate-100 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all shadow-sm"
//                   />
//                   <div className="absolute inset-y-0 left-4 flex items-center gap-2">
//                      <span className="px-1.5 py-0.5 bg-slate-200 text-[8px] font-black text-slate-500 rounded font-mono">⌘ K</span>
//                   </div>
//                </div>
//             </div>

//             {/* Navigation Content */}
//             <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
//                <div className="space-y-4">
//                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.6em] mb-4 pr-3 font-mono">اللائحة الرئيسية //</p>
//                   {MENU_ITEMS.map((item, idx) => (
//                     <motion.button
//                       key={item.id}
//                       initial={{ opacity: 0, x: 20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ 
//                         delay: 0.1 + (idx * 0.05),
//                         type: "spring",
//                         damping: 25,
//                         stiffness: 200
//                       }}
//                       onClick={() => {
//                         onNavigate(item.id);
//                         onClose();
//                       }}
//                       className={cn(
//                         "w-full group relative flex items-center justify-between p-5 rounded-2xl transition-all border-2 overflow-hidden",
//                         activeView === item.id 
//                           ? "bg-emerald-600 border-emerald-500 text-white shadow-xl" 
//                           : "bg-white border-transparent hover:border-emerald-500/10 hover:bg-emerald-50/20 text-slate-600 shadow-sm"
//                       )}
//                     >
//                        {/* Hover Glow Effect */}
//                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                       
//                        <div className="flex items-center gap-6 relative z-10 w-full text-right">
//                           <div className={cn(
//                             "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-700 group-hover:rotate-[10deg] group-hover:scale-110",
//                             activeView === item.id ? "bg-emerald-600 text-white shadow-lg" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-md"
//                           )}>
//                              {React.cloneElement(item.icon as React.ReactElement, { size: 24, strokeWidth: 2.5 })}
//                           </div>
//                           <div>
//                             <span className={cn(
//                               "text-base font-black block leading-none mb-1 text-right transition-colors font-display italic",
//                               activeView === item.id ? "text-white" : "text-slate-950"
//                             )}>{item.label}</span>
//                             <span className={cn(
//                               "text-[9px] font-mono font-black uppercase tracking-[0.3em] block text-right transition-colors",
//                               activeView === item.id ? "text-emerald-400/80" : "text-slate-400 group-hover:text-emerald-600/60"
//                             )}>{item.sublabel}</span>
//                           </div>
//                        </div>
                       
//                        {activeView === item.id && (
//                           <motion.div 
//                             layoutId="active-indicator"
//                             className="absolute left-6"
//                           >
//                             <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_15px_#34d399] animate-pulse" />
//                           </motion.div>
//                        )}
//                     </motion.button>
//                   ))}
//                </div>

//                <div className="mt-12 space-y-4">
//                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.6em] mb-4 pr-3 font-mono">الخدمات الإضافية //</p>
//                   <div className="grid grid-cols-2 gap-4 pb-12">
//                      {SECONDARY_ITEMS.map((item, idx) => (
//                        <motion.button
//                          key={item.id}
//                          initial={{ opacity: 0, scale: 0.95 }}
//                          animate={{ opacity: 1, scale: 1 }}
//                          transition={{ delay: 0.3 + (idx * 0.04) }}
//                          className="flex flex-col items-start gap-3 p-5 rounded-2xl bg-slate-50 hover:bg-emerald-600 hover:text-white transition-all group border border-transparent hover:border-emerald-400/30 shadow-sm hover:shadow-lg hover:-translate-y-1 duration-500"
//                        >
//                           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm border border-slate-100">
//                              {item.icon}
//                           </div>
//                           <span className="text-[11px] font-black tracking-tight leading-snug group-hover:translate-x-[-1px] transition-transform">{item.label}</span>
//                        </motion.button>
//                      ))}
//                   </div>
//                </div>
//             </div>

//             {/* Footer Status */}
//             <div className="p-6 pt-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
//                <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm relative">
//                      <Bell size={16} />
//                      {unreadCount > 0 && (
//                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[7.5px] font-black flex items-center justify-center border-2 border-white shadow-lg">
//                          {unreadCount}
//                        </span>
//                      )}
//                   </div>
//                   <div className="text-right">
//                      <p className="text-[8px] font-black text-slate-400 leading-none mb-0.5">الوضع الحالي //</p>
//                      <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none">SYSTEM_STANDBY</p>
//                   </div>
//                </div>
               
//                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
//                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
//                   <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">VPN_CONNECTED</span>
//                </div>
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
  onNavigate: (view: 'dashboard' | 'campaigns' | 'stats' | 'profile' | 'report') => void;
  unreadCount?: number;
}

const MENU_ITEMS: { id: 'dashboard' | 'campaigns' | 'stats' | 'profile' | 'report'; label: string; sublabel: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'المخطط القومي الشامل', sublabel: 'NATIONAL_GIS_SYNC', icon: <MapIcon size={20} /> },
  { id: 'campaigns', label: 'الحملات والمبادرات', sublabel: 'COMMUNITY_ACTION', icon: <Users size={20} /> },
  { id: 'stats', label: 'مركز تحليل البيانات', sublabel: 'ANALYTICS_CORE', icon: <Activity size={20} /> },
  { id: 'profile', label: 'الهوية الوطنية الرقمية', sublabel: 'CITIZEN_PROFILE', icon: <UserIcon size={20} /> },
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
