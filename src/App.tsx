// /**
//  * @license
//  * SPDX-License-Identifier: Apache-2.0
//  */

// import React, { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence, useScroll, useTransform, MotionValue } from 'motion/react';
// import { 
//   Map as MapIcon, 
//   MapPin,
//   PlusCircle, 
//   Users, 
//   Activity, 
//   Settings,
//   LogIn,
//   User as UserIcon,
//   AlertCircle,
//   Shield
// } from 'lucide-react';
// import { signInAnonymously, signOut } from 'firebase/auth';
// import { auth, useAuth, db } from './lib/firebase';
// import { cn } from './lib/utils';
// import SplashScreen from './components/SplashScreen';

// const SUDANESE_IMAGES = [
//   {
//     url: 'https://images.unsplash.com/photo-1547407139-3c921a66005c?auto=format&fit=crop&q=80&w=2000',
//     title: 'أهرامات مروي',
//     location: 'الولاية الشمالية'
//   },
//   {
//     url: 'https://images.unsplash.com/photo-1523805081730-6144da983907?auto=format&fit=crop&q=80&w=2000',
//     title: 'النيل الأزرق',
//     location: 'الخرطوم'
//   },
//   {
//     url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=2000',
//     title: 'صحراء النوبة',
//     location: 'شمال السودان'
//   },
//   {
//     url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=2000',
//     title: 'سوق الخرطوم',
//     location: 'وسط الخرطوم'
//   }
// ];

// function SudaneseBackground({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
//   const [currentIndex, setCurrentIndex] = useState(0);
  
//   // Parallax transforms - subtle movement
//   const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
//   const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentIndex((prev) => (prev + 1) % SUDANESE_IMAGES.length);
//     }, 20000); // 20 seconds for a contemplative pace
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={currentIndex}
//           initial={{ opacity: 0, scale: 1.1 }}
//           animate={{ opacity: 0.1, scale: 1 }}
//           exit={{ opacity: 0, scale: 1.05 }}
//           transition={{ duration: 5, ease: "easeInOut" }}
//           style={{ 
//             y,
//             scale,
//             backgroundImage: `url(${SUDANESE_IMAGES[currentIndex].url})` 
//           }}
//           className="absolute -inset-10 bg-cover bg-center brightness-110 contrast-75"
//         />
//       </AnimatePresence>
//       <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/20 to-white/80" />
//       {/* Sudanese Pattern Overlay */}
//       <div className="absolute inset-0 opacity-[0.03] sudan-pattern-modern animate-pulse-soft" />
//       <div className="absolute inset-0 opacity-[0.02] sudan-texture" />
      
//       {/* Decorative localized label */}
//       <motion.div 
//         key={`label-${currentIndex}`}
//         initial={{ opacity: 0, x: 20 }}
//         animate={{ opacity: 0.5, x: 0 }}
//         className="absolute bottom-12 left-12 text-right hidden lg:block"
//       >
//         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] font-mono leading-none mb-2">LOCATION_STAMP //</p>
//         <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{SUDANESE_IMAGES[currentIndex].title} / {SUDANESE_IMAGES[currentIndex].location}</p>
//       </motion.div>
//     </div>
//   );
// }

// import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
// import NotificationSettings from './components/NotificationSettings';

// // Lazy load components to simulate low-bandwidth optimization
// import Dashboard from './components/Dashboard';
// import IssueReport from './components/IssueReport';
// import Campaigns from './components/Campaigns';
// import ExecutionStats from './components/ExecutionStats';
// import Chatbot from './components/Chatbot';
// import Profile from './components/Profile';
// import InstitutionLogin from './components/InstitutionLogin';
// import NavigationMenu from './components/NavigationMenu';
// import VoiceAssistant from './components/VoiceAssistant';
// import { Command, Mic } from 'lucide-react';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// type View = 'dashboard' | 'report' | 'campaigns' | 'stats' | 'profile';

// export default function App() {
//   return (
//     <NotificationProvider>
//       <AppContent />
//     </NotificationProvider>
//   );
// }

// function AppContent() {
//   const [activeView, setActiveView] = useState<View>('dashboard');
//   const [isOffline, setIsOffline] = useState(!navigator.onLine);
//   const [showSplash, setShowSplash] = useState(true);
//   const [showSettings, setShowSettings] = useState(false);
//   const [showInstLogin, setShowInstLogin] = useState(false);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isVoiceOpen, setIsVoiceOpen] = useState(false);
//   const { user, loading, role, profile } = useAuth();
//   const { unreadCount } = useNotifications();

//   // Scroll tracking for parallax
//   const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);
//   const { scrollYProgress } = useScroll({ 
//     container: scrollContainer ? { current: scrollContainer } : undefined 
//   });

//   const handleAuth = async () => {
//     if (user) {
//       if (confirm("هل تريد تسجيل الخروج؟")) await signOut(auth);
//     } else {
//       await signInAnonymously(auth);
//     }
//   };

//   useEffect(() => {
//     if (!loading && !user) {
//       signInAnonymously(auth).catch(err => console.error("Anonymous auth failed:", err));
//     }
//   }, [user, loading]);

//   useEffect(() => {
//     const handleOnline = () => setIsOffline(false);
//     const handleOffline = () => setIsOffline(true);
//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);
//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
//         e.preventDefault();
//         setIsMenuOpen(prev => !prev);
//       }
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, []);

//   const handleToolCall = async (call: { name: string; args: any }) => {
//     if (call.name === 'submitReport') {
//       if (!user) return { status: "error", message: "User not authenticated" };
      
//       try {
//         const { type, description, severity, address } = call.args;
        
//         // Use user's current location if possible, otherwise default to Khartoum center
//         let lat = 15.5007;
//         let lng = 32.5599;

//         const trackingId = `BN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

//         const docData = {
//           trackingId,
//           type: type || 'other',
//           description,
//           location: {
//             lat,
//             lng,
//             address: address || "الخرطوم، السودان"
//           },
//           severity: severity || 2,
//           status: 'pending',
//           createdAt: serverTimestamp(),
//           updatedAt: serverTimestamp(),
//           reporterId: user.uid,
//           anonymous: true,
//           reportedByCitizen: true
//         };

//         const docRef = await addDoc(collection(db, 'issues'), docData);
        
//         // Add initial movement/log
//         await addDoc(collection(db, 'issues', docRef.id, 'movements'), {
//           status: 'رصد البلاغ',
//           description: `تم استلام البلاغ عبر المساعد الصوتي. رقم المتابعة: ${trackingId}.`,
//           institutionName: 'عمران | المساعد الذكي',
//           timestamp: serverTimestamp(),
//           stage: 'detected'
//         });

//         return { 
//           status: "success", 
//           trackingId,
//           message: "تم تسجيل البلاغ بنجاح" 
//         };
//       } catch (error) {
//         console.error("Voice tool error:", error);
//         return { status: "error", message: "Failed to record report" };
//       }
//     }
//     return { status: "error", message: "Unknown tool" };
//   };

//   const voiceTools = [
//     {
//       name: "submitReport",
//       description: "Submit a new infrastructure report for road, water, electricity, or waste issues.",
//       parameters: {
//         type: "OBJECT",
//         properties: {
//           type: { type: "STRING", enum: ["road", "water", "electricity", "waste", "other"] },
//           description: { type: "STRING", description: "Detailed description of the issue in Arabic" },
//           severity: { type: "STRING", enum: ["1", "2", "3"], description: "Severity level: '1' (low), '2' (medium), '3' (critical)" },
//           address: { type: "STRING", description: "Location address if mentioned" }
//         },
//         required: ["type", "description", "severity"]
//       }
//     }
//   ];

//   if (loading && showSplash) {
//     return <SplashScreen onFinish={() => setShowSplash(false)} />;
//   }

//   return (
//     <div className="flex flex-col h-screen w-full bg-slate-50 relative overflow-hidden font-sans" dir="rtl">
//       <SudaneseBackground scrollYProgress={scrollYProgress} />
//       {/* Splash Screen - Highest priority during initial load */}
//       <AnimatePresence>
//         {showSplash && (
//           <div className="fixed inset-0 z-[2000]">
//             <SplashScreen onFinish={() => setShowSplash(false)} />
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Floating Command Center Trigger - Hidden during splash */}
//       {!showSplash && (
//         <motion.button 
//           initial={{ opacity: 0, x: 100 }}
//           animate={{ opacity: 1, x: 0 }}
//           whileHover={{ scale: 1.05, x: -5 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => setIsMenuOpen(true)}
//           className="fixed top-8 right-8 z-[1000] bg-white/80 backdrop-blur-xl text-slate-900 p-5 rounded-3xl shadow-2xl flex items-center gap-4 group border border-slate-200 hidden lg:flex"
//         >
//           <div className="flex flex-col items-end">
//              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.4em] leading-none mb-1">COMMAND</span>
//              <span className="text-xs font-black uppercase tracking-widest text-slate-900">مركز التحكم</span>
//           </div>
//           <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors text-emerald-600">
//              <Command size={24} />
//           </div>
          
//           {/* Unread Indicator */}
//           {unreadCount > 0 && (
//             <div className="absolute -top-1 -left-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[8px] font-black border-2 border-white">
//               {unreadCount}
//             </div>
//           )}
//         </motion.button>
//       )}

//       {/* Navigation Menu */}
//       <NavigationMenu 
//         isOpen={isMenuOpen}
//         onClose={() => setIsMenuOpen(false)}
//         activeView={activeView}
//         onNavigate={setActiveView}
//         unreadCount={unreadCount}
//       />

//       {/* Main Structural Wrapper for Web Responsiveness */}
//       {/* <div className="flex h-full w-full max-w-[1600px] mx-auto relative shadow-[0_30px_100px_-15px_rgba(0,0,0,0.1)] bg-white/70 backdrop-blur-3xl lg:rounded-[3.5rem] lg:my-6 lg:h-[calc(100vh-3rem)] overflow-hidden border border-slate-100 transition-all duration-700"> */}
//       <div className="flex h-full w-full  relative    overflow-hidden border border-slate-100 transition-all ">
        
//         {/* Desktop Sidebar Navigation */}
        
//         <aside className="hidden lg:flex w-[250px]   xl:w-[320px] bg-slate-50/40  backdrop-blur-2xl flex-col p-6 xl:p-8 text-slate-800 z-30 relative overflow-hidden border-l border-slate-100 shrink-0 transition-all ">
        
//           {/* Subtle Background Pattern for Sidebar with animation */}
//           <motion.div 
//             animate={{ 
//               opacity: [0.01, 0.03, 0.01],
//               rotate: [12, 16, 12],
//               scale: [1.8, 2.0, 1.8]
//             }}
//             transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
//             className="absolute inset-0 pointer-events-none sudan-texture opacity-10" 
//           />
          
//           <div className="flex items-center gap-6 mb-12 relative z-10">
//             <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg -rotate-3 transition-all hover:rotate-0 hover:scale-110 duration-700 border-2 border-white/20 group cursor-default relative overflow-hidden">
//                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//                <MapPin size={24} strokeWidth={2.5} className="group-hover:scale-110 transition-transform relative z-10" />
//             </div>
//             <div>
//               <h1 className="text-4xl font-black leading-none font-display holographic-text italic">عمران</h1>
//               <div className="flex items-center gap-2 mt-1.5">
//                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
//                 <p className="text-[8px] text-emerald-600 font-mono font-black uppercase tracking-[0.4em] italic">الشبكة الوطنية // النسخة ٥.٠</p>
//               </div>
//             </div>
//           </div>

//             <div className="flex-1 space-y-6 relative z-10">
//               {role !== 'citizen' && (
//                 <motion.div 
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="mx-3 mb-6 p-4 bg-white rounded-3xl border border-emerald-100 shadow-xl group border-l-4 border-l-emerald-600"
//                 >
//                   <div className="flex items-center gap-3 mb-3">
//                     <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
//                       <Shield size={20} />
//                     </div>
//                     <div className="text-right">
//                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">OFFICIAL_ACCESS</p>
//                       <p className="text-xs font-black text-slate-900 truncate max-w-[120px]">{profile?.institutionName || 'مسؤول حكومي'}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
//                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
//                     <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">ACTIVE_SESSION</span>
//                   </div>
//                 </motion.div>
//               )}

//               <div className="space-y-3">
//                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] font-mono mb-4 px-3">الواجهة الرئيسية //</p>
//               <SidebarButton 
//                 active={activeView === 'dashboard'} 
//                 onClick={() => setActiveView('dashboard')}
//                 icon={<MapIcon size={20} />}
//                 label="المخطط القومي"
//               />
//               <SidebarButton 
//                 active={activeView === 'campaigns'} 
//                 onClick={() => setActiveView('campaigns')}
//                 icon={<Users size={20} />}
//                 label="الحملات الميدانية"
//               />
//               <SidebarButton 
//                 active={activeView === 'stats'} 
//                 onClick={() => setActiveView('stats')}
//                 icon={<Activity size={20} />}
//                 label="التحليلات الجغرافية"
//               />
//             </div>
            
//             <div className="pt-8 mt-8 border-t border-slate-100 space-y-6">
//               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] font-mono mb-4 px-3">مستوى الأمان ٠١ //</p>
//               <SidebarButton 
//                 active={showInstLogin} 
//                 onClick={() => setShowInstLogin(true)}
//                 icon={<LogIn size={20} />}
//                 label="بوابة المؤسسات"
//                 variant="portal"
//               />
//               <SidebarButton 
//                 active={activeView === 'profile'} 
//                 onClick={() => setActiveView('profile')}
//                 icon={<UserIcon size={20} />}
//                 label="ملفي الشخصي"
//               />
//             </div>
//           </div>

//           <div className="pt-8 relative z-10">
//             <motion.button 
//               whileHover={{ scale: 1.05, y: -2 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setActiveView('report')}
//               className="w-full py-6 bg-emerald-600 rounded-3xl font-black text-sm flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(16,185,129,0.2)] transition-all text-white hover:bg-emerald-500 relative z-10 border-2 border-emerald-400/20 group"
//             >
//               <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-180 duration-700">
//                 <PlusCircle size={20} strokeWidth={2.5} />
//               </div>
//               فتح بلاغ ميداني
//             </motion.button>
//           </div>
//         </aside>

//         {/* Content Area */}
//         <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white/30">
//           <header className="lg:hidden p-6 bg-white/90 backdrop-blur-xl border-b border-slate-100 flex justify-between items-center z-[60] shrink-0 text-slate-900">
//             <div className="flex items-center gap-5">
//               <button onClick={() => setIsMenuOpen(true)} className="w-12 h-12 rounded-2xl text-slate-800 flex items-center justify-center bg-white border border-slate-100 shadow-sm transition-transform active:scale-90">
//                 <Command size={24} />
//               </button>
//               <button onClick={() => setShowInstLogin(true)} className="w-12 h-12 rounded-2xl text-emerald-600 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 shadow-sm transition-transform active:scale-90">
//                 <LogIn size={24} />
//               </button>
//               <div className="text-right">
//                 <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none font-display">عمران</h1>
//                 <div className="flex items-center gap-2 mt-1.5 justify-end">
//                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
//                   <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">MOBILEACCESS</p>
//                 </div>
//               </div>
//             </div>
//             {isOffline && (
//               <div className="flex items-center gap-3 px-4 py-2 bg-rose-500/10 rounded-full border border-rose-500/20 shadow-sm">
//                 <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
//                 <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">OFFLINE</span>
//               </div>
//             )}
//           </header>

//           <main 
//             ref={setScrollContainer}
//             className="flex-1 overflow-y-auto lg:pb-0 pb-44 relative no-scrollbar"
//           >
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={activeView}
//                 initial={{ opacity: 0, scale: 0.98, y: 10 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 exit={{ opacity: 0, scale: 1.02, y: -10 }}
//                 transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//                 className="h-full"
//               >
//                 {activeView === 'dashboard' && <Dashboard role={role} profile={profile} />}
//                 {activeView === 'report' && <IssueReport onComplete={() => setActiveView('dashboard')} />}
//                 {activeView === 'campaigns' && <Campaigns />}
//                 {activeView === 'stats' && <ExecutionStats />}
//                 {activeView === 'profile' && <Profile />}
//               </motion.div>
//             </AnimatePresence>
//           </main>

//           {/* Chatbot Activation */}
//           <Chatbot 
//             onNavigate={setActiveView}
//             extraContext={`User is looking at: ${activeView}. ${activeView === 'report' ? 'They are filing a new report.' : ''} ${activeView === 'campaigns' ? 'They are viewing community initiatives.' : ''} ${showSettings ? 'Settings modal is open.' : ''} There are ${unreadCount} unread government alerts.`} 
//           />

//           {/* Mobile Navigation (Hidden on LG) - Premium Glass Design */}
//           <nav className="lg:hidden fixed bottom-4 left-4 right-4 max-w-lg mx-auto bg-emerald-600/95 backdrop-blur-2xl border border-emerald-400/30 px-4 sm:px-8 py-3.5 rounded-[2.5rem] sm:rounded-[3.5rem] flex justify-between items-center z-[70] shadow-[0_32px_64px_-12px_rgba(5,150,105,0.4)]">
//             <NavButton 
//               active={activeView === 'dashboard'} 
//               onClick={() => setActiveView('dashboard')}
//               icon={<MapIcon size={24} />}
//               label="الخريطة"
//             />
//             <NavButton 
//               active={activeView === 'campaigns'} 
//               onClick={() => setActiveView('campaigns')}
//               icon={<Users size={24} />}
//               label="الحملات"
//             />
            
//             {/* Primary Action - Floating with Glow */}
//             <div className="relative group">
//               <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
//               <button 
//                 onClick={() => setActiveView('report')}
//                 className={cn(
//                   "p-5 rounded-[22px] -mt-14 shadow-2xl transition-all active:scale-95 relative z-10",
//                   activeView === 'report' ? "bg-white text-emerald-600 scale-110" : "bg-white text-emerald-600"
//                 )}
//               >
//                 <PlusCircle size={36} strokeWidth={2.5} />
//               </button>
//             </div>

//             <NavButton 
//               active={activeView === 'stats'} 
//               onClick={() => setActiveView('stats')}
//               icon={<Activity size={24} />}
//               label="المتابعة"
//             />
//             <NavButton 
//               active={showSettings} 
//               onClick={() => setShowSettings(true)} 
//               badge={unreadCount > 0 ? unreadCount : undefined}
//               icon={<Settings size={24} />}
//               label="إعدادات"
//             />
//           </nav>
//         </div>
//       </div>

//       {/* Voice Assistant Activation FAB */}
//       <motion.button
//         initial={{ scale: 0, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         whileHover={{ scale: 1.1, y: -5 }}
//         whileTap={{ scale: 0.9 }}
//         onClick={() => setIsVoiceOpen(true)}
//         className="fixed bottom-52 md:bottom-12 right-6 md:right-32 z-[80] w-20 h-20 bg-emerald-600 text-white rounded-full shadow-[0_20px_40px_rgba(16,185,129,0.4)] border-4 border-white flex items-center justify-center group overflow-hidden"
//       >
//         <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//         <Mic size={32} />
//         <motion.div 
//           animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
//           transition={{ repeat: Infinity, duration: 2 }}
//           className="absolute inset-0 bg-white rounded-full"
//         />
//       </motion.button>

//       {/* Voice Assistant Modal */}
//       <AnimatePresence>
//         {isVoiceOpen && (
//           <div className="fixed inset-0 z-[800]">
//             <VoiceAssistant 
//               onClose={() => setIsVoiceOpen(false)}
//               tools={voiceTools}
//               onToolCall={handleToolCall}
//               context={`User is in ${activeView} view. User is ${user ? 'authenticated' : 'not authenticated'}. Current issues are being reported across Sudan.`}
//             />
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Settings Modal */}
//       <AnimatePresence>
//         {showSettings && (
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[1600] flex items-end sm:items-center justify-center p-0 sm:p-6"
//             onClick={() => setShowSettings(false)}
//           >
//             <motion.div 
//               initial={{ y: '100%', scale: 0.9 }}
//               animate={{ y: 0, scale: 1 }}
//               exit={{ y: '100%', scale: 0.9 }}
//               className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <NotificationSettings onClose={() => setShowSettings(false)} />
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Institution Login Modal */}
//       <AnimatePresence>
//         {showInstLogin && (
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-white/80 backdrop-blur-md z-[1600] flex items-center justify-center p-0 md:p-12"
//             onClick={() => setShowInstLogin(false)}
//           >
//             <motion.div 
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] md:rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.2)] border border-slate-100"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <InstitutionLogin onClose={() => setShowInstLogin(false)} />
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// function SidebarButton({ active, onClick, icon, label, badge, variant }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number, variant?: 'default' | 'portal' }) {
//   return (
//     <motion.button 
//       whileHover={{ 
//         x: active ? 0 : 4,
//         scale: 1.01,
//         backgroundColor: active ? "rgba(5, 150, 105, 1)" : "rgba(16, 185, 129, 0.08)",
//         boxShadow: active 
//           ? "0 10px 20px -5px rgba(16, 185, 129, 0.3)" 
//           : "0 5px 15px -3px rgba(16, 185, 129, 0.1)"
//       }}
//       whileTap={{ scale: 0.98 }}
//       onClick={onClick}
//       className={cn(
//         "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden border-2",
//         active 
//           ? "text-white border-emerald-500/20" 
//           : "text-black hover:text-white border-transparent",
//         variant === 'portal' && !active && "bg-emerald-500/5 text-emerald-600 border-emerald-500/5"
//       )}
//     >
//       {/* Smooth Sliding Background */}
//       {active && (
//         <motion.div 
//           layoutId="sidebar-active-pill"
//           className="absolute inset-0 bg-emerald-600 shadow-md"
//           transition={{ type: "spring", stiffness: 400, damping: 40 }}
//         />
//       )}
      
//       {/* Decorative Shine (Active State Only) */}
//       {active && (
//         <motion.div 
//           initial={{ x: '-100%' }}
//           animate={{ x: '100%' }}
//           transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
//           className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-[25deg]"
//         />
//       )}

//       <div className="flex items-center gap-3 relative z-10 w-full">
//         <motion.div 
//           animate={{ 
//             scale: active ? 1.05 : 1, 
//             y: active ? -0.5 : 0
//           }}
//           transition={{ duration: 0.4 }}
//           className={cn(
//             "transition-colors duration-300", 
//             active ? "text-emerald-300" : "text-slate-400 group-hover:text-violet-500"
//           )}
//         >
//           {icon}
//         </motion.div>
        
//         <motion.span 
//           animate={{ 
//             x: active ? 1 : 0,
//             opacity: active ? 1 : 0.7
//           }}
//           className="text-[11px] font-black text-right flex-1"
//         >
//           {label}
//         </motion.span>
//       </div>

//       {badge !== undefined && (
//         <motion.span 
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           className="bg-emerald-500 text-white text-[8px] font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 relative z-10 mr-2"
//         >
//           {badge}
//         </motion.span>
//       )}
//     </motion.button>
//   );
// }

// function NavButton({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }) {
//   return (
//     <motion.button 
//       whileHover={{ scale: 1.05, y: -2 }}
//       whileTap={{ scale: 0.95 }}
//       onClick={onClick}
//       className={cn(
//         "flex flex-col items-center gap-1.5 transition-all relative flex-1 min-w-0 duration-500",
//         active ? "text-white" : "text-white/40 hover:text-white/70"
//       )}
//     >
//       <div className="relative">
//         <div className={cn(
//           "transition-all duration-300",
//           active ? "scale-110 -translate-y-0.5" : "scale-100 translate-y-0"
//         )}>
//           {icon}
//         </div>
//         {badge !== undefined && (
//           <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-emerald-600 shadow-lg">
//             {badge}
//           </span>
//         )}
//       </div>
//       <span className={cn(
//         "text-[8px] font-black leading-none transition-all duration-300",
//         active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
//       )}>{label}</span>
//       {active && (
//         <motion.div 
//           layoutId="nav-glow"
//           className="absolute -bottom-5 w-6 h-1 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
//         />
//       )}
//     </motion.button>
//   );
// }



/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, MotionValue } from 'motion/react';
import {
  Map as MapIcon,
  MapPin,
  PlusCircle,
  Users,
  Activity,
  Settings,
  LogIn,
  User as UserIcon,
  AlertCircle,
  Shield,
  Command,
  Mic,
  WifiOff,
  ChevronLeft,
} from 'lucide-react';
import { signInAnonymously, signOut } from 'firebase/auth';
import { auth, useAuth, db } from './lib/firebase';
import { cn } from './lib/utils';
import SplashScreen from './components/SplashScreen';

const SUDANESE_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1547407139-3c921a66005c?auto=format&fit=crop&q=80&w=2000',
    title: 'أهرامات مروي',
    location: 'الولاية الشمالية',
  },
  {
    url: 'https://images.unsplash.com/photo-1523805081730-6144da983907?auto=format&fit=crop&q=80&w=2000',
    title: 'النيل الأزرق',
    location: 'الخرطوم',
  },
  {
    url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=2000',
    title: 'صحراء النوبة',
    location: 'شمال السودان',
  },
  {
    url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=2000',
    title: 'سوق الخرطوم',
    location: 'وسط الخرطوم',
  },
];

function SudaneseBackground({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SUDANESE_IMAGES.length);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.12, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 5, ease: 'easeInOut' }}
          style={{ y, scale, backgroundImage: `url(${SUDANESE_IMAGES[currentIndex].url})` }}
          className="absolute -inset-10 bg-cover bg-center"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 via-white/50 to-slate-50/90" />
      <div className="absolute inset-0 opacity-[0.025] sudan-pattern-modern" />

      {/* Location stamp */}
      <motion.div
        key={`label-${currentIndex}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-8 hidden lg:block"
      >
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] font-mono mb-1">
          LOCATION_FEED //
        </p>
        <p className="text-xs font-black text-slate-400 tracking-widest">
          {SUDANESE_IMAGES[currentIndex].title} · {SUDANESE_IMAGES[currentIndex].location}
        </p>
      </motion.div>
    </div>
  );
}

import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import NotificationSettings from './components/NotificationSettings';
import Dashboard from './components/Dashboard';
import IssueReport from './components/IssueReport';
import Campaigns from './components/Campaigns';
import ExecutionStats from './components/ExecutionStats';
import Chatbot from './components/Chatbot';
import Profile from './components/Profile';
import InstitutionLogin from './components/InstitutionLogin';
import NavigationMenu from './components/NavigationMenu';
import VoiceAssistant from './components/VoiceAssistant';
import MinistryDashboard from './components/MinistryDashboard';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type View = 'dashboard' | 'report' | 'campaigns' | 'stats' | 'profile' | 'ministry';


const VIEW_META: Record<View, { label: string; icon: React.ReactNode }> = {
  dashboard:  { label: 'المخطط القومي',    icon: <MapIcon size={16} /> },
  report:     { label: 'بلاغ ميداني',      icon: <PlusCircle size={16} /> },
  campaigns:  { label: 'الحملات الميدانية', icon: <Users size={16} /> },
  stats:      { label: 'التحليلات',         icon: <Activity size={16} /> },
  profile:    { label: 'ملفي الشخصي',      icon: <UserIcon size={16} /> },
  ministry:   { label: 'لوحة الوزارة',     icon: <Shield size={16} /> },
};

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

function AppContent() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showSplash, setShowSplash] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showInstLogin, setShowInstLogin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const { user, loading, role, profile } = useAuth();
  const { unreadCount } = useNotifications();

  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    container: scrollContainer ? { current: scrollContainer } : undefined,
  });

  const handleAuth = async () => {
    if (user) {
      if (confirm('هل تريد تسجيل الخروج؟')) await signOut(auth);
    } else {
      await signInAnonymously(auth);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      signInAnonymously(auth).catch((err) => console.error('Anonymous auth failed:', err));
    }
  }, [user, loading]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToolCall = async (call: { name: string; args: any }) => {
    if (call.name === 'submitReport') {
      if (!user) return { status: 'error', message: 'User not authenticated' };
      try {
        const { type, description, severity, address } = call.args;
        let lat = 15.5007;
        let lng = 32.5599;
        const trackingId = `BN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const docData = {
          trackingId,
          type: type || 'other',
          description,
          location: { lat, lng, address: address || 'الخرطوم، السودان' },
          severity: severity || 2,
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          reporterId: user.uid,
          anonymous: true,
          reportedByCitizen: true,
        };
        const docRef = await addDoc(collection(db, 'issues'), docData);
        await addDoc(collection(db, 'issues', docRef.id, 'movements'), {
          status: 'رصد البلاغ',
          description: `تم استلام البلاغ عبر المساعد الصوتي. رقم المتابعة: ${trackingId}.`,
          institutionName: 'عمران | المساعد الذكي',
          timestamp: serverTimestamp(),
          stage: 'detected',
        });
        return { status: 'success', trackingId, message: 'تم تسجيل البلاغ بنجاح' };
      } catch (error) {
        console.error('Voice tool error:', error);
        return { status: 'error', message: 'Failed to record report' };
      }
    }
    return { status: 'error', message: 'Unknown tool' };
  };

  const voiceTools = [
    {
      name: 'submitReport',
      description: 'Submit a new infrastructure report for road, water, electricity, or waste issues.',
      parameters: {
        type: 'OBJECT',
        properties: {
          type: { type: 'STRING', enum: ['road', 'water', 'electricity', 'waste', 'other'] },
          description: { type: 'STRING', description: 'Detailed description of the issue in Arabic' },
          severity: { type: 'STRING', enum: ['1', '2', '3'], description: "Severity level: '1' (low), '2' (medium), '3' (critical)" },
          address: { type: 'STRING', description: 'Location address if mentioned' },
        },
        required: ['type', 'description', 'severity'],
      },
    },
  ];

  if (loading && showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 relative overflow-hidden font-sans" dir="rtl">
      <SudaneseBackground scrollYProgress={scrollYProgress} />

      {/* Splash */}
      <AnimatePresence>
        {showSplash && (
          <div className="fixed inset-0 z-[2000]">
            <SplashScreen onFinish={() => setShowSplash(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Command Button */}
      {!showSplash && (
        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsMenuOpen(true)}
          className="fixed top-6 right-6 z-[1000] hidden lg:flex items-center gap-3 px-4 py-3 bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-lg shadow-slate-200/50 text-slate-700 hover:border-emerald-300 hover:shadow-emerald-100/50 transition-all group"
        >
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.35em] leading-none mb-0.5 font-mono">
              COMMAND
            </span>
            <span className="text-xs font-black text-slate-900">مركز التحكم</span>
          </div>
          <div className="w-9 h-9 bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white rounded-xl flex items-center justify-center text-slate-500 transition-all">
            <Command size={18} />
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[9px] font-black text-white border-2 border-white shadow">
              {unreadCount}
            </span>
          )}
        </motion.button>
      )}

      <NavigationMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        onNavigate={setActiveView}
        unreadCount={unreadCount}
      />

      <div className="flex h-full w-full relative overflow-hidden">

        {/* ── Desktop Sidebar ─────────────────────────────────── */}
        <aside className="hidden lg:flex w-[240px] xl:w-[280px] bg-white/60 backdrop-blur-2xl flex-col py-7 px-5 text-slate-800 z-30 relative border-l border-slate-100/80 shrink-0">

          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-[0.025] sudan-texture pointer-events-none" />

          {/* Logo */}
          <div className="flex items-center gap-4 mb-8 relative z-10 px-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md border border-emerald-500/30 shrink-0">
              <MapPin size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black leading-none font-display holographic-text italic tracking-tight">
                عمران
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[8px] text-emerald-600 font-mono font-black uppercase tracking-[0.35em]">
                  الشبكة الوطنية
                </p>
              </div>
            </div>
          </div>

          {/* Institution badge */}
          {role !== 'citizen' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-sm border-r-4 border-r-emerald-500 relative z-10"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                  <Shield size={16} />
                </div>
                <div className="text-right min-w-0">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-0.5 font-mono">
                    وصول رسمي
                  </p>
                  <p className="text-xs font-black text-slate-900 truncate">
                    {profile?.institutionName || 'مسؤول حكومي'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Nav groups */}
          <div className="flex-1 space-y-1 relative z-10">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em] font-mono px-2 mb-3">
              القائمة الرئيسية
            </p>
            <SidebarButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<MapIcon size={18} />} label="المخطط القومي" />
            <SidebarButton active={activeView === 'campaigns'} onClick={() => setActiveView('campaigns')} icon={<Users size={18} />} label="الحملات الميدانية" />
            <SidebarButton active={activeView === 'stats'} onClick={() => setActiveView('stats')} icon={<Activity size={18} />} label="التحليلات الجغرافية" />
    <SidebarButton
      active={activeView === 'ministry'}
      onClick={() => setActiveView('ministry')}
      icon={<Shield size={18} />}
      label="لوحة الوزارة"
      variant="portal"
    />

            <div className="pt-5 mt-5 border-t border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em] font-mono px-2 mb-3">
                الحساب
              </p>
              <SidebarButton active={showInstLogin} onClick={() => setShowInstLogin(true)} icon={<LogIn size={18} />} label="بوابة المؤسسات" variant="portal" />
              <SidebarButton active={activeView === 'profile'} onClick={() => setActiveView('profile')} icon={<UserIcon size={18} />} label="ملفي الشخصي" />
              <SidebarButton active={showSettings} onClick={() => setShowSettings(true)} icon={<Settings size={18} />} label="الإعدادات" badge={unreadCount > 0 ? unreadCount : undefined} />
            </div>
          </div>

          {/* Report CTA */}
          <div className="relative z-10 mt-6">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveView('report')}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-emerald-200/60 text-white transition-all border border-emerald-500/20 group"
            >
              <div className="w-7 h-7 bg-white/15 rounded-xl flex items-center justify-center group-hover:bg-white/25 transition-colors">
                <PlusCircle size={16} strokeWidth={2.5} />
              </div>
              فتح بلاغ ميداني
            </motion.button>
          </div>
        </aside>

        {/* ── Content Area ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white/25">

          {/* Mobile header */}
          <header className="lg:hidden px-4 py-3 bg-white/90 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between z-[60] shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm active:scale-90 transition-transform"
              >
                <Command size={20} />
              </button>
              <button
                onClick={() => setShowInstLogin(true)}
                className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm active:scale-90 transition-transform"
              >
                <LogIn size={20} />
              </button>
            </div>

            {/* Center logo */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <MapPin size={14} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">عمران</h1>
            </div>

            {isOffline ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl">
                <WifiOff size={12} className="text-rose-500" />
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider">غير متصل</span>
              </div>
            ) : (
              <button
                onClick={() => setShowSettings(true)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm active:scale-90 transition-transform relative"
              >
                <Settings size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -left-1 w-4 h-4 bg-rose-500 rounded-full text-white text-[8px] font-black flex items-center justify-center border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
          </header>

          {/* Breadcrumb – mobile only */}
          <div className="lg:hidden px-4 pt-3 pb-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-[10px] font-black font-mono uppercase tracking-wider">عمران</span>
              <ChevronLeft size={10} />
              <span className="text-[10px] font-black text-emerald-600 font-mono uppercase tracking-wider flex items-center gap-1">
                {VIEW_META[activeView]?.icon}
                {VIEW_META[activeView]?.label}
              </span>
            </div>
          </div>

          {/* Main content */}
          <main
            ref={setScrollContainer}
            className="flex-1 overflow-y-auto pb-36 lg:pb-6 relative no-scrollbar"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                {activeView === 'dashboard' && <Dashboard role={role} profile={profile} />}
                {activeView === 'report' && <IssueReport onComplete={() => setActiveView('dashboard')} />}
                {activeView === 'campaigns' && <Campaigns />}
                {activeView === 'stats' && <ExecutionStats />}
                {activeView === 'profile' && <Profile />}
                {activeView === 'ministry'  && <MinistryDashboard />} 
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Chatbot */}
          <Chatbot
            onNavigate={setActiveView}
            extraContext={`User is looking at: ${activeView}. ${activeView === 'report' ? 'They are filing a new report.' : ''} ${activeView === 'campaigns' ? 'They are viewing community initiatives.' : ''} ${showSettings ? 'Settings modal is open.' : ''} There are ${unreadCount} unread government alerts.`}
          />

          {/* ── Mobile bottom nav ────────────────────────────── */}
          <nav className="lg:hidden fixed bottom-4 left-4 right-4 max-w-md mx-auto z-[70]">
            <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] px-2 py-2 flex items-center justify-between shadow-2xl shadow-slate-900/40">
              <NavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<MapIcon size={22} />} label="الخريطة" />
              <NavButton active={activeView === 'campaigns'} onClick={() => setActiveView('campaigns')} icon={<Users size={22} />} label="الحملات" />

              {/* Center FAB */}
              <div className="relative -mt-6">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.06 }}
                  onClick={() => setActiveView('report')}
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all border-2',
                    activeView === 'report'
                      ? 'bg-white text-emerald-600 border-white scale-105 shadow-white/20'
                      : 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/40'
                  )}
                >
                  <PlusCircle size={28} strokeWidth={2} />
                </motion.button>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap">
                  بلاغ
                </div>
              </div>

              <NavButton active={activeView === 'stats'} onClick={() => setActiveView('stats')} icon={<Activity size={22} />} label="المتابعة" />
              <NavButton active={showSettings} onClick={() => setShowSettings(true)} icon={<Settings size={22} />} label="إعدادات" badge={unreadCount > 0 ? unreadCount : undefined} />
            </div>
          </nav>
        </div>
      </div>

      {/* ── Voice FAB ───────────────────────────────────────── */}
      {!showSplash && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => setIsVoiceOpen(true)}
          className="fixed bottom-20 md:bottom-10 left-5 md:left-10 z-[80] w-16 h-16 bg-emerald-600 text-white rounded-2xl shadow-2xl shadow-emerald-500/40 border-2 border-emerald-400/40 flex items-center justify-center group overflow-hidden"
          // className="fixed bottom-6 right-6 lg:bottom-12 lg:right-12 z-[80] w-20 h-20 bg-emerald-600 text-white rounded-full shadow-[0_20px_40px_rgba(16,185,129,0.4)] border-4 border-white flex items-center justify-center group overflow-hidden"
        >
          {/* Ripple */}
          <motion.span
            animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
            className="absolute inset-0 bg-emerald-400 rounded-2xl"
          />
          <Mic size={26} className="relative z-10" />
        </motion.button>
      )}

      {/* ── Voice Assistant Modal ───────────────────────────── */}
      <AnimatePresence>
        {isVoiceOpen && (
          <div className="fixed inset-0 z-[800]">
            <VoiceAssistant
              onClose={() => setIsVoiceOpen(false)}
              tools={voiceTools}
              onToolCall={handleToolCall}
              context={`User is in ${activeView} view. User is ${user ? 'authenticated' : 'not authenticated'}. Current issues are being reported across Sudan.`}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── Settings Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[1600] flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
              <NotificationSettings onClose={() => setShowSettings(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Institution Login Modal ─────────────────────────── */}
      <AnimatePresence>
        {showInstLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[1600] flex items-center justify-center p-0 md:p-10"
            onClick={() => setShowInstLogin(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="bg-white w-full max-w-2xl h-full md:h-auto md:max-h-[88vh] md:rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <InstitutionLogin onClose={() => setShowInstLogin(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sidebar Button ───────────────────────────────────────────
function SidebarButton({
  active, onClick, icon, label, badge, variant,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  variant?: 'default' | 'portal';
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative overflow-hidden text-right group',
        active
          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
        variant === 'portal' && !active && 'text-emerald-700 hover:bg-emerald-50'
      )}
    >
      {/* Shine on active */}
      {active && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent -skew-x-12"
        />
      )}

      <div className={cn(
        'shrink-0 transition-colors',
        active ? 'text-emerald-200' : 'text-slate-400 group-hover:text-slate-600',
        variant === 'portal' && !active && 'text-emerald-500'
      )}>
        {icon}
      </div>

      <span className={cn(
        'text-xs font-black flex-1',
        active ? 'text-white' : 'text-slate-700',
        variant === 'portal' && !active && 'text-emerald-700'
      )}>
        {label}
      </span>

      {badge !== undefined && (
        <span className="bg-rose-500 text-white text-[9px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm">
          {badge}
        </span>
      )}
    </motion.button>
  );
}

// ── Nav Button (Mobile) ──────────────────────────────────────
function NavButton({
  active, onClick, icon, label, badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all relative flex-1 min-w-0',
        active ? 'text-white' : 'text-white/35 hover:text-white/60'
      )}
    >
      <div className="relative">
        <div className={cn('transition-all duration-300', active && 'scale-110')}>
          {icon}
        </div>
        {badge !== undefined && (
          <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-900">
            {badge}
          </span>
        )}
      </div>
      <span className={cn(
        'text-[8px] font-black leading-none transition-all duration-300 whitespace-nowrap',
        active ? 'text-white/90' : 'text-white/35'
      )}>
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -bottom-1.5 w-4 h-0.5 bg-emerald-400 rounded-full"
        />
      )}
    </motion.button>
  );
}