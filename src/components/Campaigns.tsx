// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { 
//   Users, 
//   TrendingUp, 
//   MapPin, 
//   CheckCircle2, 
//   Clock, 
//   Plus,
//   ArrowUpRight,
//   Loader2,
//   Trophy,
//   Coins,
//   HandCoins,
//   Heart,
//   Crown,
//   ShieldCheck,
//   Building2,
//   ExternalLink
// } from 'lucide-react';
// import { 
//   collection, 
//   query, 
//   onSnapshot, 
//   updateDoc, 
//   doc, 
//   increment, 
//   setDoc, 
//   serverTimestamp, 
//   writeBatch 
// } from 'firebase/firestore';
// import { db, auth } from '../lib/firebase';
// import { cn, handleFirestoreError } from '../lib/utils';
// import { Campaign } from '../types';
// import { REGIONS, INSTITUTIONS } from '../constants';

// export default function Campaigns() {
//   const [campaigns, setCampaigns] = useState<Campaign[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedRegion, setSelectedRegion] = useState<string>('all');
//   const [sortBy, setSortBy] = useState<'progress' | 'participants' | 'reward'>('progress');

//   useEffect(() => {
//     const q = query(collection(db, 'campaigns'));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Campaign[];
//       setCampaigns(fetched);
//       setLoading(false);
//     }, (error) => {
//       console.error("Error fetching campaigns:", error);
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleJoin = async (id: string, points: number) => {
//     if (!auth.currentUser) return alert("سجل دخولك أولاً للمشاركة");
//     try {
//       const batch = writeBatch(db);
//       const uid = auth.currentUser.uid;
      
//       const campaign = campaigns.find(c => c.id === id);
//       const campaignData = {
//         userId: uid,
//         campaignId: id,
//         campaignTitle: campaign?.title || 'مهمة عمران',
//         campaignImage: campaign?.beforeImageUrl || '',
//         pointsEarned: points,
//         createdAt: serverTimestamp()
//       };
      
//       const campaignPartRef = doc(db, 'campaigns', id, 'participations', uid);
//       batch.set(campaignPartRef, {
//         ...campaignData,
//         type: 'join'
//       });

//       const userPartRef = doc(db, 'users', uid, 'participations', id);
//       batch.set(userPartRef, {
//         ...campaignData,
//         type: 'join'
//       });

//       const campaignRef = doc(db, 'campaigns', id);
//       batch.update(campaignRef, {
//         participantCount: increment(1),
//         progress: increment(5)
//       });

//       const userRef = doc(db, 'users', uid);
//       batch.set(userRef, { 
//         points: increment(points),
//         displayName: auth.currentUser.displayName || 'مواطن فاعل',
//         role: 'citizen',
//         isAnonymous: auth.currentUser.isAnonymous,
//         uid: uid,
//         updatedAt: serverTimestamp()
//       }, { merge: true });

//       await batch.commit();

//       alert(`يا بطل! شكراً لمشاركتك في "${campaign?.title}". لقد حصلت على ${points} نقطة عمران لمساهمتك في إعمار ولايتك.`);
//     } catch (e) {
//       console.error(e);
//       const errorMsg = handleFirestoreError(e);
//       alert(`حدث خطأ أثناء المشاركة: ${JSON.parse(errorMsg).error}`);
//     }
//   };

//   const handleSponsor = async (id: string) => {
//     if (!auth.currentUser) return alert("سجل دخولك أولاً للرعاية");
//     try {
//       const batch = writeBatch(db);
//       const uid = auth.currentUser.uid;
//       const campaign = campaigns.find(c => c.id === id);
//       const amount = 5000;
//       const points = 500;
//       const campaignData = {
//         userId: uid,
//         campaignId: id,
//         campaignTitle: campaign?.title || 'رعاية عمران',
//         campaignImage: campaign?.beforeImageUrl || '',
//         pointsEarned: points,
//         amount: amount,
//         createdAt: serverTimestamp()
//       };
//       const partId = `${uid}_${Date.now()}`;
      
//       const campaignPartRef = doc(db, 'campaigns', id, 'participations', partId);
//       batch.set(campaignPartRef, {
//         ...campaignData,
//         type: 'sponsor'
//       });

//       const userPartRef = doc(db, 'users', uid, 'participations', partId);
//       batch.set(userPartRef, {
//         ...campaignData,
//         type: 'sponsor'
//       });

//       const campaignRef = doc(db, 'campaigns', id);
//       batch.update(campaignRef, {
//         sponsorCount: increment(1),
//         currentAmount: increment(amount),
//         progress: increment(2)
//       });

//       const userRef = doc(db, 'users', uid);
//       batch.set(userRef, { 
//         points: increment(points), 
//         uid: uid,
//         updatedAt: serverTimestamp()
//       }, { merge: true });

//       await batch.commit();

//       alert(`شكراً لمساهمتك المالية! لقد ساهمت في تقليص فجوة التمويل لمشروع "${campaign?.title}".`);
//     } catch (e) {
//       console.error(e);
//       const errorMsg = handleFirestoreError(e);
//       alert(`حدث خطأ أثناء الرعاية: ${JSON.parse(errorMsg).error}`);
//     }
//   };

//   const filteredCampaigns = campaigns
//     .filter(c => selectedRegion === 'all' || c.regionId === selectedRegion)
//     .sort((a, b) => {
//       if (sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
//       if (sortBy === 'participants') return (b.participantCount || 0) - (a.participantCount || 0);
//       if (sortBy === 'reward') return (b.pointsReward || 0) - (a.pointsReward || 0);
//       return 0;
//     });

//   const MOCK_LEADERBOARD = [
//     { name: 'مجموعة دال الغذائية', points: 45000, contribution: 'برنامج رعاية وطن', location: 'الخرطوم', avatar: 'https://i.pravatar.cc/150?u=dal' },
//     { name: 'سارة محمد الحسين', points: 3800, contribution: 'المتطوع الذهبي', location: 'بورتسودان', avatar: 'https://i.pravatar.cc/150?u=sara' },
//     { name: 'عمر عثمان الخليفة', points: 3200, contribution: 'سفير العمران', location: 'كسلا', avatar: 'https://i.pravatar.cc/150?u=omar' },
//   ];

//   return (
//     <div className="p-4 lg:p-10 space-y-8 pb-32 overflow-y-auto h-full bg-white/50 tech-grid-unified" dir="rtl">
//       {/* Header - Tactical Mission Style - Hidden on mobile */}
//       <div className="hidden lg:flex justify-between items-end border-r-[8px] border-emerald-500 pr-8 py-2 mb-10">
//         <div className="space-y-1.5 text-right">
//           <div className="flex items-center gap-3 justify-end">
//             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]" />
//             <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 font-display uppercase leading-tight italic">المبادرات الوطنية</h2>
//           </div>
//           <p className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-[0.5em] italic">MISSION_CONTROL // NATIONAL_REBUILD_INITIATIVES</p>
//         </div>
//         <button className="w-16 h-16 bg-white text-slate-800 rounded-3xl shadow-xl hover:bg-emerald-600 hover:text-white transition-all duration-700 flex items-center justify-center border border-slate-200 group active:scale-95 hover:rotate-12 backdrop-blur-xl">
//           <Plus size={28} className="group-hover:rotate-180 transition-transform duration-700" />
//         </button>
//       </div>

//       {/* Control Panel - High Fidelity Filters */}
//       <div className="space-y-8 bg-white/60 backdrop-blur-3xl p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
//         <div className="absolute inset-0 sudan-pattern-modern opacity-[0.01] pointer-events-none" />
//         <div className="space-y-6 relative z-10">
//           <div className="flex items-center gap-3 justify-end mb-2">
//             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] font-mono">GEOGRAPHIC_NODE //</span>
//             <MapPin size={14} className="text-emerald-500 animate-bounce" />
//           </div>
//           <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-1 px-1">
//             <button 
//               onClick={() => setSelectedRegion('all')}
//               className={cn(
//                 "px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 border",
//                 selectedRegion === 'all' 
//                   ? "bg-emerald-600 text-white border-emerald-500 shadow-[0_15px_30px_rgba(16,185,129,0.2)] scale-105" 
//                   : "bg-white text-slate-500 border-slate-200 hover:border-emerald-500/50 hover:text-emerald-600 shadow-sm"
//               )}
//             >
//               كافة الولايات
//             </button>
//             {REGIONS.map(region => (
//               <button 
//                 key={region.id}
//                 onClick={() => setSelectedRegion(region.id)}
//                 className={cn(
//                   "px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 border",
//                   selectedRegion === region.id 
//                     ? "bg-emerald-600 text-white border-emerald-500 shadow-[0_15px_30px_rgba(16,185,129,0.2)] scale-105" 
//                     : "bg-white text-slate-500 border-slate-200 hover:border-emerald-500/50 hover:text-emerald-600 shadow-sm"
//                 )}
//               >
//                 {region.name}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100 relative z-10">
//           <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl border border-slate-200 w-full md:w-auto">
//             {[
//               { id: 'progress', label: 'نسبة الإنجاز' },
//               { id: 'participants', label: 'كثافة المشاركة' },
//               { id: 'reward', label: 'عائد النقاط' }
//             ].map(opt => (
//               <button
//                 key={opt.id}
//                 onClick={() => setSortBy(opt.id as any)}
//                 className={cn(
//                   "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
//                   sortBy === opt.id ? "bg-white text-slate-900 shadow-md border border-slate-200" : "text-slate-400 hover:text-emerald-600"
//                 )}
//               >
//                 {opt.label}
//               </button>
//             ))}
//           </div>
//           <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 rounded-full border border-emerald-500/20">
//              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
//              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] font-mono whitespace-nowrap">LIVE_DATA_FEED // ENCRYPTED</span>
//           </div>
//         </div>
//       </div>

//       {/* Campaign List */}
//       <div className="space-y-10">
//         <div className="flex justify-between items-center mb-4 px-2">
//            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] text-right font-mono">SELECTED_MISSIONS //</h3>
//            <Trophy size={18} className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]" />
//         </div>
        
//         {loading && <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>}
        
//         {!loading && filteredCampaigns.length === 0 && (
//           <div className="bg-white/60 border border-slate-100 rounded-[4rem] p-32 text-center space-y-8 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
//             <div className="absolute inset-0 sudan-pattern-modern opacity-[0.01] pointer-events-none" />
//             <div className="w-32 h-32 bg-emerald-500/10 rounded-[3rem] flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
//               <MapPin size={64} className="text-emerald-500" />
//             </div>
//             <h4 className="text-4xl font-black text-slate-900 tracking-tight italic">لا توجد مهام نشطة حالياً</h4>
//             <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs">LOG_EMPTY // NO_ACTIVE_CHANNELS_IN_REGION</p>
//           </div>
//         )}

//         {!loading && filteredCampaigns.length > 0 && (
//           <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
//             {filteredCampaigns.map((c, idx) => {
//               const region = REGIONS.find(r => r.id === c.regionId) || REGIONS[0];
//               const sponsor = INSTITUTIONS.find(i => i.id === (c as any).sponsorId) || INSTITUTIONS.find(i => i.id === 'ministry_infra') || INSTITUTIONS[0];
              
//               // Rotating theme palette for better variation
//               const THEMES = [
//                 { color: 'emerald', bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-500/30', shadow: 'shadow-emerald-500/10', glow: 'bg-emerald-500/10' },
//                 { color: 'blue', bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-500/30', shadow: 'shadow-blue-500/10', glow: 'bg-blue-500/10' },
//                 { color: 'amber', bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-500/30', shadow: 'shadow-amber-500/10', glow: 'bg-amber-500/10' },
//                 { color: 'rose', bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-500/30', shadow: 'shadow-rose-500/10', glow: 'bg-rose-500/10' },
//                 { color: 'indigo', bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-500/30', shadow: 'shadow-indigo-500/10', glow: 'bg-indigo-500/10' },
//                 { color: 'cyan', bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-500/30', shadow: 'shadow-cyan-500/10', glow: 'bg-cyan-500/10' }
//               ];
//               const theme = THEMES[idx % THEMES.length];
              
//               return (
//                 <motion.div 
//                   key={c.id} 
//                   initial={{ opacity: 0, y: 30 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: idx * 0.05, duration: 0.8 }}
//                   className={cn(
//                     "group relative bg-white/70 backdrop-blur-3xl border border-slate-100 rounded-[3.5rem] overflow-hidden flex flex-col shadow-xl transition-all duration-700 hover:bg-white hover:shadow-2xl",
//                     `hover:${theme.border}`
//                   )}
//                 >
//                   <div className="flex flex-col h-full">
//                     {/* Visual Section */}
//                     <div className="w-full h-72 lg:h-80 relative overflow-hidden bg-slate-100 flex-shrink-0">
//                       <motion.img 
//                         src={c.beforeImageUrl || region.imageUrl} 
//                         className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105 opacity-80 group-hover:opacity-100" 
//                         alt="campaign" 
//                       />
//                       <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-white via-white/40 to-transparent" />
//                       <div className="absolute inset-0 tech-grid-unified opacity-[0.05] pointer-events-none mix-blend-overlay" />

//                       <div className="absolute top-8 left-8 right-8 flex justify-between items-start">
//                         <div className="flex flex-col gap-3">
//                            <div className={cn("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-lg border font-mono italic", theme.bg, "text-white", `border-white/20`)}>
//                              REGION_{region.name?.toUpperCase() || 'NORTH'}
//                            </div>
//                            <div className="px-4 py-1.5 bg-white/80 backdrop-blur-md text-slate-400 rounded-lg text-[9px] font-mono tracking-widest border border-slate-100 uppercase">
//                              X_REF // {c.id.slice(-8)}
//                            </div>
//                         </div>
//                         <div className={cn("w-16 h-16 bg-white/80 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-slate-100 shadow-xl transition-all duration-700 group-hover:scale-110", theme.text, `group-hover:${theme.bg} group-hover:text-white hover:border-transparent`)}>
//                            <ShieldCheck size={32} strokeWidth={2.5} />
//                         </div>
//                       </div>

//                       <div className="absolute bottom-8 left-8 right-8">
//                          <div className={cn("flex items-center gap-5 p-5 bg-white/90 backdrop-blur-3xl rounded-3xl border border-slate-100 transition-all duration-700 shadow-lg", `group-hover:border-${theme.color}-500/20`)}>
//                             <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 shrink-0 shadow-sm bg-white p-2">
//                                <img src={sponsor.logo} className="w-full h-full object-contain" alt="" referrerPolicy="no-referrer" />
//                             </div>
//                             <div className="flex-1 text-right">
//                                <p className={cn("text-[9px] font-black uppercase tracking-widest leading-none mb-2 font-mono italic text-slate-400")}>AUTHORITY_GATEWAY // OFFICIAL</p>
//                                <h5 className="text-base font-black text-slate-800 truncate uppercase tracking-tight font-display italic">{sponsor.name}</h5>
//                             </div>
//                          </div>
//                       </div>
//                     </div>

//                     {/* Content Section */}
//                     <div className="flex-1 p-6 lg:p-12 flex flex-col justify-between text-right space-y-8 lg:space-y-10">
//                        <div className="space-y-8 lg:space-y-10">
//                           <div className="flex justify-between items-center flex-row-reverse">
//                              <div className="flex items-center gap-4">
//                                 <span className={cn(
//                                    "w-3 h-3 rounded-full animate-pulse",
//                                    c.status === 'active' ? theme.bg : "bg-blue-600",
//                                    c.status === 'active' ? theme.shadow : "shadow-blue-500/20"
//                                 )} />
//                                 <div className="bg-slate-50 text-slate-500 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border border-slate-200 italic shadow-sm backdrop-blur-3xl">
//                                    {c.status === 'active' ? 'MISSION_ACTIVE' : 'MISSION_SUCCESS'}
//                                 </div>
//                              </div>
//                              <div className="flex items-center gap-4 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-3xl border border-emerald-100 font-mono text-lg font-black shadow-sm group-hover:bg-emerald-100 transition-all">
//                                 <Coins size={22} className="animate-pulse" />
//                                 <span>+{c.pointsReward || 100}</span>
//                              </div>
//                           </div>

//                           <h4 className={cn("text-3xl lg:text-4xl font-black text-slate-900 leading-tight font-display tracking-tight transition-colors duration-700 line-clamp-2 italic", `group-hover:${theme.text}`)}>
//                             {c.title}
//                           </h4>

//                           <div className="space-y-5">
//                              <div className="flex justify-between items-end flex-row-reverse px-2">
//                                 <div className="text-right">
//                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-2 font-mono">REBUILD_RATIO</p>
//                                    <p className="text-4xl font-black text-slate-900 font-mono leading-none tracking-tighter italic">{c.progress || 0}%</p>
//                                 </div>
//                                 <div className="text-left">
//                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-2 font-mono text-left">CAPITAL_NODE</p>
//                                    <p className={cn("text-2xl font-black font-mono leading-none tracking-tighter", theme.text)}>{c.targetAmount?.toLocaleString() || '10,000'} <span className="text-[12px] opacity-30 italic font-sans font-medium">SDG</span></p>
//                                 </div>
//                              </div>
//                              <div className="h-5 bg-slate-100 rounded-full overflow-hidden p-1.5 border border-slate-200 shadow-inner relative">
//                                 <motion.div 
//                                   initial={{ width: 0 }}
//                                   animate={{ width: `${c.progress || 0}%` }}
//                                   transition={{ duration: 1.8, ease: "easeOut" }}
//                                   className={cn("h-full rounded-full relative overflow-hidden", theme.bg, theme.shadow)}
//                                 >
//                                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2.5s_infinite]" />
//                                 </motion.div>
//                              </div>
//                           </div>

//                           <div className="grid grid-cols-2 gap-10">
//                              <div className="text-right space-y-2 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 group-hover:bg-white transition-all backdrop-blur-3xl shadow-sm">
//                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">NODES_JOINED</p>
//                                 <div className="flex items-center gap-4 justify-end text-slate-900">
//                                    <span className="text-3xl font-black font-mono tracking-tighter">{c.participantCount || 0}</span>
//                                    <Users size={24} className={cn("opacity-70", theme.text)} />
//                                 </div>
//                              </div>
//                              <div className="text-right space-y-2 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 group-hover:bg-white transition-all backdrop-blur-3xl shadow-sm">
//                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">FLOW_RESERVE</p>
//                                 <div className="flex items-center gap-4 justify-end text-slate-900">
//                                    <span className="text-3xl font-black font-mono tracking-tighter">{(c.currentAmount || 0).toLocaleString()}</span>
//                                    <HandCoins size={24} className="text-amber-600/70" />
//                                 </div>
//                              </div>
//                           </div>
//                        </div>

//                        <div className="flex gap-6 pt-10">
//                           <button 
//                             onClick={() => handleJoin(c.id, c.pointsReward || 100)}
//                             className={cn(
//                               "flex-1 py-8 text-white rounded-[3.5rem] text-base font-black uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all duration-500 flex items-center justify-center gap-5 group/btn font-mono border-t border-white/20",
//                               theme.bg, `hover:${theme.bg} hover:brightness-110`
//                             )}
//                           >
//                             <span>DEPLOY_SUPPORT</span>
//                             <ArrowUpRight size={28} strokeWidth={3} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-500" />
//                           </button>
//                           <button 
//                             onClick={() => handleSponsor(c.id)}
//                             className="w-24 h-24 bg-white border border-slate-200 text-rose-500 rounded-[3.5rem] flex items-center justify-center hover:bg-rose-50 hover:border-rose-500/30 transition-all duration-500 active:scale-90 shadow-lg backdrop-blur-3xl group/heart"
//                           >
//                             <Heart size={32} fill={c.currentAmount ? "currentColor" : "none"} strokeWidth={3} className="group-hover/heart:scale-125 transition-transform duration-500" />
//                           </button>
//                        </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Impact Stats Section */}
//       <section className="space-y-16 pt-20">
//         <div className="flex justify-between items-center px-4 flex-row-reverse text-right">
//           <h3 className="text-[14px] font-black text-slate-400 uppercase tracking-[0.6em] font-mono">HONOR_REGISTRY // CORE_METRICS</h3>
//           <div className="flex items-center gap-6 text-emerald-600">
//             <div className="w-16 h-16 rounded-[3rem] bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20 shadow-xl">
//                <Crown size={40} className="animate-bounce" />
//             </div>
//             <span className="text-5xl font-black font-display tracking-tight text-slate-900 uppercase italic">لوحة الشرف الوطنية</span>
//           </div>
//         </div>

//         <div className="bg-white/60 backdrop-blur-3xl border border-slate-100 rounded-[4rem] overflow-hidden shadow-xl relative">
//           <div className="absolute inset-0 sudan-pattern-modern opacity-[0.01] pointer-events-none" />
//           {MOCK_LEADERBOARD.map((hero, idx) => (
//             <motion.div 
//               key={idx} 
//               initial={{ x: 20, opacity: 0 }}
//               whileInView={{ x: 0, opacity: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: idx * 0.1, duration: 0.8 }}
//               className={cn(
//                 "p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 last:border-0 hover:bg-white transition-all group relative z-10 gap-6 sm:gap-10",
//                 idx === 0 ? "bg-emerald-50" : ""
//               )}
//             >
//               <div className="flex items-center gap-10">
//                 <div className="text-right">
//                    <p className="text-3xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors uppercase tracking-tight italic">{hero.name}</p>
//                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">{hero.location} // {hero.contribution}</p>
//                 </div>
//                 <div className={cn(
//                   "w-20 h-20 rounded-3xl flex items-center justify-center font-black relative overflow-hidden shadow-lg border-2 border-white/80 transition-all duration-700 group-hover:scale-110 group-hover:rotate-3",
//                   idx === 0 ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
//                 )}>
//                   <img src={hero.avatar} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000" alt="" referrerPolicy="no-referrer" />
//                   <span className="relative z-10 text-3xl font-mono">#{idx + 1}</span>
//                   {idx === 0 && (
//                     <div className="absolute top-0 right-0 p-2 bg-amber-400 shadow-lg border-b border-l border-white/30">
//                       <Crown size={16} className="text-slate-900" fill="currentColor" />
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="text-left space-y-2">
//                 <div className="flex items-center gap-5 justify-end mb-1">
//                    <TrendingUp size={24} className="text-emerald-600" />
//                    <p className="text-4xl font-black text-slate-900 font-mono tracking-tighter italic">{hero.points.toLocaleString()}</p>
//                 </div>
//                 <div className="px-5 py-2 bg-slate-100 rounded-2xl inline-block shadow-sm border border-slate-200 backdrop-blur-3xl">
//                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] font-mono italic">{hero.contribution?.toUpperCase() || 'CONTRIBUTOR'}</span>
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//           <button className="w-full py-10 text-[13px] font-black text-slate-400 uppercase tracking-[0.5em] hover:bg-white hover:text-emerald-600 transition-all duration-1000 border-t border-slate-100 font-mono relative z-10 italic">
//             GATEWAY_SYNC_FULL // VIEW_ALL_CITIZENS
//           </button>
//         </div>
//       </section>

//       {/* Footer Banner */}
//       <div className="bg-emerald-600 backdrop-blur-3xl border border-emerald-500 rounded-[5rem] p-16 lg:p-24 space-y-12 text-white overflow-hidden relative shadow-2xl">
//         <div className="absolute inset-0 tech-grid-unified opacity-[0.05] pointer-events-none" />
//         <div className="absolute top-0 right-0 w-[60rem] h-full opacity-5 pointer-events-none sudan-pattern-modern scale-[2.5] rotate-[25deg]" />
        
//         <div className="relative z-10 space-y-12 text-right">
//           <div className="flex justify-between items-start flex-row-reverse">
//             <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-emerald-600 shadow-2xl border-2 border-white/20 group hover:rotate-12 transition-transform duration-700">
//               <CheckCircle2 size={48} strokeWidth={2.5} />
//             </div>
//             <div className="flex flex-col gap-4">
//                <div className="px-6 py-2.5 bg-white/10 rounded-full border border-white/20 self-end backdrop-blur-3xl">
//                   <span className="text-[11px] font-black text-white uppercase tracking-[0.4em] font-mono italic">ANNUAL_PERFORMANCE_VALUATION</span>
//                </div>
//                <h3 className="text-5xl lg:text-7xl font-black font-display tracking-tighter italic leading-tight">٢٨ مشروع مكتمل في شهر واحد</h3>
//             </div>
//           </div>
          
//           <p className="text-2xl lg:text-3xl text-emerald-50 font-medium leading-[1.8] max-w-4xl ml-auto border-r-[12px] border-white/20 pr-10 italic selection:bg-white selection:text-emerald-600">
//             "هذه الإنجازات هي ثمار سواعد عمران التي تمتد في كافة أصقاع الوطن، معيدة بناء ما دمرته الأزمات ومؤسسة لمرحلة من النهضة الشاملة بعقول سودانية مبدعة."
//           </p>
          
//           <div className="pt-16 border-t border-white/10 flex gap-20 justify-end items-center">
//             <div className="text-right group">
//               <p className="text-[12px] font-black text-emerald-100 uppercase tracking-[0.5em] mb-3 font-mono group-hover:text-white transition-colors">CITIZENS_ENGAGED</p>
//               <p className="text-5xl font-black font-mono text-white tracking-tighter leading-none italic">+١,٢٠٠</p>
//             </div>
//             <div className="text-right group">
//               <p className="text-[12px] font-black text-emerald-100 uppercase tracking-[0.5em] mb-3 font-mono group-hover:text-white transition-colors">XP_VALUATION</p>
//               <p className="text-5xl font-black font-mono text-amber-300 tracking-tighter leading-none italic">٤٥٠,٠٠٠</p>
//             </div>
//             <div className="text-right group">
//               <p className="text-[12px] font-black text-emerald-100 uppercase tracking-[0.5em] mb-3 font-mono group-hover:text-white transition-colors">TOTAL_IMPACT_LOG</p>
//               <p className="text-5xl font-black font-mono text-white tracking-tighter leading-none italic">١٢,٤٠٠</p>
//             </div>
//           </div>
//         </div>
//         <div className="absolute -left-40 -bottom-40 w-[60rem] h-[60rem] bg-white/10 blur-[200px] rounded-full pointer-events-none" />
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, TrendingUp, MapPin, CheckCircle2, Clock, Plus,
  ArrowUpRight, Loader2, Trophy, Coins, HandCoins, Heart,
  Crown, ShieldCheck, Building2, ExternalLink
} from 'lucide-react';
import { 
  collection, query, onSnapshot, updateDoc, doc, increment,
  setDoc, serverTimestamp, writeBatch 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { cn, handleFirestoreError } from '../lib/utils';
import { Campaign } from '../types';
import { REGIONS, INSTITUTIONS } from '../constants';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'progress' | 'participants' | 'reward'>('progress');

  useEffect(() => {
    const q = query(collection(db, 'campaigns'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Campaign[];
      setCampaigns(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching campaigns:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleJoin = async (id: string, points: number) => {
    if (!auth.currentUser) return alert("سجل دخولك أولاً للمشاركة");
    try {
      const batch = writeBatch(db);
      const uid = auth.currentUser.uid;
      const campaign = campaigns.find(c => c.id === id);
      const campaignData = {
        userId: uid, campaignId: id,
        campaignTitle: campaign?.title || 'مهمة عمران',
        campaignImage: campaign?.beforeImageUrl || '',
        pointsEarned: points, createdAt: serverTimestamp()
      };
      batch.set(doc(db, 'campaigns', id, 'participations', uid), { ...campaignData, type: 'join' });
      batch.set(doc(db, 'users', uid, 'participations', id), { ...campaignData, type: 'join' });
      batch.update(doc(db, 'campaigns', id), { participantCount: increment(1), progress: increment(5) });
      batch.set(doc(db, 'users', uid), {
        points: increment(points),
        displayName: auth.currentUser.displayName || 'مواطن فاعل',
        role: 'citizen', isAnonymous: auth.currentUser.isAnonymous,
        uid, updatedAt: serverTimestamp()
      }, { merge: true });
      await batch.commit();
      alert(`يا بطل! شكراً لمشاركتك في "${campaign?.title}". لقد حصلت على ${points} نقطة عمران.`);
    } catch (e) {
      console.error(e);
      const errorMsg = handleFirestoreError(e);
      alert(`حدث خطأ أثناء المشاركة: ${JSON.parse(errorMsg).error}`);
    }
  };

  const handleSponsor = async (id: string) => {
    if (!auth.currentUser) return alert("سجل دخولك أولاً للرعاية");
    try {
      const batch = writeBatch(db);
      const uid = auth.currentUser.uid;
      const campaign = campaigns.find(c => c.id === id);
      const amount = 5000;
      const points = 500;
      const partId = `${uid}_${Date.now()}`;
      const campaignData = {
        userId: uid, campaignId: id,
        campaignTitle: campaign?.title || 'رعاية عمران',
        campaignImage: campaign?.beforeImageUrl || '',
        pointsEarned: points, amount, createdAt: serverTimestamp()
      };
      batch.set(doc(db, 'campaigns', id, 'participations', partId), { ...campaignData, type: 'sponsor' });
      batch.set(doc(db, 'users', uid, 'participations', partId), { ...campaignData, type: 'sponsor' });
      batch.update(doc(db, 'campaigns', id), { sponsorCount: increment(1), currentAmount: increment(amount), progress: increment(2) });
      batch.set(doc(db, 'users', uid), { points: increment(points), uid, updatedAt: serverTimestamp() }, { merge: true });
      await batch.commit();
      alert(`شكراً لمساهمتك المالية في مشروع "${campaign?.title}".`);
    } catch (e) {
      console.error(e);
      const errorMsg = handleFirestoreError(e);
      alert(`حدث خطأ أثناء الرعاية: ${JSON.parse(errorMsg).error}`);
    }
  };

  const filteredCampaigns = campaigns
    .filter(c => selectedRegion === 'all' || c.regionId === selectedRegion)
    .sort((a, b) => {
      if (sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
      if (sortBy === 'participants') return (b.participantCount || 0) - (a.participantCount || 0);
      if (sortBy === 'reward') return (b.pointsReward || 0) - (a.pointsReward || 0);
      return 0;
    });

  const MOCK_LEADERBOARD = [
    { name: 'مجموعة دال الغذائية', points: 45000, contribution: 'برنامج رعاية وطن', location: 'الخرطوم', avatar: 'https://i.pravatar.cc/150?u=dal' },
    { name: 'سارة محمد الحسين', points: 3800, contribution: 'المتطوع الذهبي', location: 'بورتسودان', avatar: 'https://i.pravatar.cc/150?u=sara' },
    { name: 'عمر عثمان الخليفة', points: 3200, contribution: 'سفير العمران', location: 'كسلا', avatar: 'https://i.pravatar.cc/150?u=omar' },
  ];

  const THEMES = [
    { bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200' },
    { bg: 'bg-blue-600',    text: 'text-blue-600',    light: 'bg-blue-50',    border: 'border-blue-200'    },
    { bg: 'bg-amber-500',   text: 'text-amber-600',   light: 'bg-amber-50',   border: 'border-amber-200'   },
    { bg: 'bg-rose-600',    text: 'text-rose-600',    light: 'bg-rose-50',    border: 'border-rose-200'    },
    { bg: 'bg-indigo-600',  text: 'text-indigo-600',  light: 'bg-indigo-50',  border: 'border-indigo-200'  },
    { bg: 'bg-cyan-500',    text: 'text-cyan-600',    light: 'bg-cyan-50',    border: 'border-cyan-200'    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-24 overflow-y-auto h-full bg-slate-50" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button className="w-10 h-10 bg-white border border-slate-200 text-slate-600 rounded-xl shadow-sm hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-90 flex items-center justify-center">
          <Plus size={18} />
        </button>
        <div className="text-right">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">المبادرات الوطنية</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">شارك وأثر في مجتمعك</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
        {/* Region Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedRegion('all')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border",
              selectedRegion === 'all'
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-slate-50 text-slate-500 border-slate-100 hover:border-emerald-300 hover:text-emerald-600"
            )}
          >
            كافة الولايات
          </button>
          {REGIONS.map(region => (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border",
                selectedRegion === region.id
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-slate-50 text-slate-500 border-slate-100 hover:border-emerald-300 hover:text-emerald-600"
              )}
            >
              {region.name}
            </button>
          ))}
        </div>

        {/* Sort + Live indicator */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] text-emerald-600 font-bold">مباشر</span>
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'progress', label: 'الإنجاز' },
              { id: 'participants', label: 'المشاركين' },
              { id: 'reward', label: 'النقاط' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id as any)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                  sortBy === opt.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Count */}
      <div className="flex items-center justify-between px-1">
        <Trophy size={16} className="text-amber-400" />
        <span className="text-xs font-bold text-slate-400">{filteredCampaigns.length} مبادرة نشطة</span>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
          </div>
        )}

        {!loading && filteredCampaigns.length === 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center space-y-3 shadow-sm">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
              <MapPin size={24} className="text-emerald-400" />
            </div>
            <p className="font-bold text-slate-600">لا توجد مبادرات نشطة في هذه الولاية</p>
            <p className="text-xs text-slate-400">جرّب اختيار ولاية أخرى</p>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCampaigns.map((c, idx) => {
              const region = REGIONS.find(r => r.id === c.regionId) || REGIONS[0];
              const sponsor = INSTITUTIONS.find(i => i.id === (c as any).sponsorId) || INSTITUTIONS.find(i => i.id === 'ministry_infra') || INSTITUTIONS[0];
              const theme = THEMES[idx % THEMES.length];

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={c.beforeImageUrl || region.imageUrl}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt="campaign"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                      <div className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm", theme.bg)}>
                        {region.name}
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white text-xs font-bold shadow-sm">
                        <Coins size={11} />
                        <span>+{c.pointsReward || 100}</span>
                      </div>
                    </div>

                    {/* Status dot */}
                    <div className="absolute bottom-3 right-3">
                      <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-600">
                        <span className={cn("w-1.5 h-1.5 rounded-full", c.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500')} />
                        {c.status === 'active' ? 'نشط' : 'مكتمل'}
                      </div>
                    </div>

                    {/* Sponsor badge */}
                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-xl shadow-sm">
                        <span className="text-[10px] font-bold text-slate-600 max-w-[100px] truncate">{sponsor.name}</span>
                        <div className="w-5 h-5 rounded overflow-hidden bg-white shrink-0">
                          <img src={sponsor.logo} className="w-full h-full object-contain" alt="" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-4 text-right">
                    <h4 className="font-black text-slate-900 text-base leading-tight line-clamp-2">
                      {c.title}
                    </h4>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className={cn("font-black text-base", theme.text)}>{c.progress || 0}%</span>
                        <span className="text-slate-400 font-medium">التقدم</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${c.progress || 0}%` }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          className={cn("h-full rounded-full", theme.bg)}
                        />
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className={cn("rounded-xl p-3 text-right border", theme.light, theme.border)}>
                        <p className="text-[10px] text-slate-400 font-medium mb-1">المشاركون</p>
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-lg font-black text-slate-800">{c.participantCount || 0}</span>
                          <Users size={14} className={theme.text} />
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-right border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-medium mb-1">التمويل</p>
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-lg font-black text-slate-800">{(c.currentAmount || 0).toLocaleString()}</span>
                          <HandCoins size={14} className="text-amber-500" />
                        </div>
                      </div>
                    </div>

                    {/* Target */}
                    {c.targetAmount && (
                      <p className="text-[11px] text-slate-400 text-right">
                        الهدف: <span className={cn("font-black", theme.text)}>{c.targetAmount.toLocaleString()} SDG</span>
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleJoin(c.id, c.pointsReward || 100)}
                        className={cn(
                          "flex-1 py-3 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm hover:brightness-110",
                          theme.bg
                        )}
                      >
                        انضم الآن
                        <ArrowUpRight size={15} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleSponsor(c.id)}
                        className="w-12 h-12 bg-slate-50 border border-slate-200 text-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-90 shrink-0"
                      >
                        <Heart size={18} fill={c.currentAmount ? 'currentColor' : 'none'} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <Crown size={20} className="text-amber-400" />
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            لوحة الشرف الوطنية
          </h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {MOCK_LEADERBOARD.map((hero, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "flex items-center gap-3 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-all",
                idx === 0 ? "bg-emerald-50/60" : ""
              )}
            >
              {/* Rank */}
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 relative overflow-hidden",
                idx === 0 ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
              )}>
                <img src={hero.avatar} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" referrerPolicy="no-referrer" />
                <span className="relative z-10">#{idx + 1}</span>
                {idx === 0 && (
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-400 flex items-center justify-center rounded-bl-lg">
                    <Crown size={9} className="text-slate-900" fill="currentColor" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-right min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{hero.name}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{hero.location} · {hero.contribution}</p>
              </div>

              {/* Points */}
              <div className="text-left shrink-0">
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp size={13} />
                  <span className="font-black text-sm text-slate-800">{hero.points.toLocaleString()}</span>
                </div>
                <p className="text-[9px] text-slate-400 font-medium text-left">نقطة</p>
              </div>
            </motion.div>
          ))}

          <button className="w-full py-3.5 text-xs font-bold text-slate-400 hover:text-emerald-600 hover:bg-slate-50 transition-all border-t border-slate-50">
            عرض جميع المواطنين
          </button>
        </div>
      </section>

      {/* Impact Banner */}
      <div className="bg-emerald-600 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg">
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-white/10 blur-2xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-4 text-right">
          <div className="flex items-start justify-between gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} className="text-white" />
            </div>
            <div>
              <p className="text-emerald-200 text-xs font-medium mb-1">الإنجاز الشهري</p>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight">٢٨ مشروع مكتمل في شهر واحد</h3>
            </div>
          </div>

          <p className="text-emerald-100 text-sm leading-relaxed border-r-4 border-white/30 pr-3">
            "هذه الإنجازات هي ثمار سواعد عمران التي تمتد في كافة أصقاع الوطن، معيدة بناء ما دمرته الأزمات."
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/20">
            {[
              { label: 'مواطن مشارك', value: '+١٬٢٠٠', color: 'text-white' },
              { label: 'نقاط موزّعة', value: '٤٥٠٬٠٠٠', color: 'text-amber-300' },
              { label: 'إجمالي التأثير', value: '١٢٬٤٠٠', color: 'text-white' },
            ].map((stat, i) => (
              <div key={i} className="text-right">
                <p className="text-emerald-200 text-[10px] font-medium mb-1">{stat.label}</p>
                <p className={cn("text-xl font-black font-mono", stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}