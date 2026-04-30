import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Trophy, History, Settings, MapPin, CheckCircle, TrendingUp, Heart, Award, Users, ShieldCheck, Star, Droplets, Zap, Trash2, HelpCircle, Camera, Loader2 } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Issue, User as UserProfile, Participation } from '../types';
import { cn, formatTimeAgo } from '../lib/utils';

const BadgeItem = ({ title, icon, color, desc }: { title: string, icon: React.ReactNode, color: string, desc: string }) => (
  <motion.div 
    whileHover={{ y: -3 }}
    className="group relative flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-emerald-500/50 transition-all duration-300 cursor-help"
  >
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:rotate-12", color)}>
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </div>
    <div className="text-center space-y-0.5">
      <p className="text-[8px] font-black uppercase tracking-widest text-white leading-none whitespace-nowrap">{title}</p>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1 z-[100]">
        <div className="bg-emerald-600 text-white text-[7px] font-black uppercase tracking-widest py-1.5 px-3 rounded-lg whitespace-nowrap shadow-2xl">
          {desc}
        </div>
      </div>
    </div>
  </motion.div>
);

export default function Profile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userIssues, setUserIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    preferredContactMethod: 'app' as 'email' | 'phone' | 'app'
  });
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser || !userProfile) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName: editForm.displayName,
        preferredContactMethod: editForm.preferredContactMethod
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
          photoURL: base64
        });
        setUserProfile(prev => prev ? { ...prev, photoURL: base64 } : null);
      } catch (err) {
        console.error("Error updating profile picture:", err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getIssueIcon = (type: string, size = 20) => {
    switch (type) {
      case 'road': return <MapPin size={size} />;
      case 'water': return <Droplets size={size} />;
      case 'electricity': return <Zap size={size} />;
      case 'waste': return <Trash2 size={size} />;
      default: return <HelpCircle size={size} />;
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubProfile = onSnapshot(doc(db, 'users', auth.currentUser!.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setUserProfile(data);
        setEditForm({
          displayName: data.displayName || '',
          preferredContactMethod: data.preferredContactMethod || 'app'
        });
      } else {
        const demoProfile: UserProfile = {
          uid: auth.currentUser!.uid,
          displayName: auth.currentUser!.isAnonymous ? 'مواطن مجهول' : 'مستخدم عمران',
          points: 1250,
          role: 'citizen',
          isAnonymous: auth.currentUser!.isAnonymous,
          regionId: 'khartoum',
          achievements: [
            { id: '1', title: 'المواطن الرقمي', description: 'تجاوز ١٠ بلاغات', icon: 'shield', earnedAt: Date.now() - 86400000 * 10 },
            { id: '2', title: 'راعي السلام', description: 'مساهمة مالية أولى', icon: 'heart', earnedAt: Date.now() - 86400000 * 5 }
          ]
        };
        setUserProfile(demoProfile);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error listening to profile:", err);
      setLoading(false);
    });

    const qIssues = query(
      collection(db, 'issues'), 
      where('reporterId', '==', auth.currentUser.uid)
    );
    const unsubIssues = onSnapshot(qIssues, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Issue[];
      setUserIssues(fetched.sort((a, b) => b.createdAt - a.createdAt));
    }, (err) => {
      console.error(err);
    });

    const qParts = query(collection(db, 'users', auth.currentUser.uid, 'participations'));
    const unsubParts = onSnapshot(qParts, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Participation[];
      setParticipations(fetched.sort((a, b) => {
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt as any)?.seconds * 1000 || 0;
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt as any)?.seconds * 1000 || 0;
        return timeB - timeA;
      }));
    });

    return () => {
      unsubProfile();
      unsubIssues();
      unsubParts();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-white shadow-sm border border-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">ENCRYPTED_AUTH // SYNCING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-slate-50/30" dir="rtl">
      {/* Profile Header Card */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-10 text-slate-950 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-[40rem] h-full opacity-[0.02] pointer-events-none sudan-texture scale-125 rotate-45" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 lg:gap-12 text-right">
          <div className="relative group/photo shrink-0">
            <label className="cursor-pointer block">
              <div className="w-32 h-32 lg:w-44 lg:h-44 rounded-2xl lg:rounded-3xl bg-slate-50 flex items-center justify-center text-emerald-600 relative z-10 border-2 border-white shadow-lg transition-all duration-500 group-hover/photo:rotate-[4deg] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 via-transparent to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity" />
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} className="w-full h-full object-cover" alt="Profile" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon size={64} strokeWidth={1.5} className="lg:w-20 lg:h-20" />
                )}
                
                <div className="absolute inset-0 bg-emerald-600/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1 backdrop-blur-sm">
                  {uploading ? (
                    <Loader2 size={24} className="animate-spin text-white" />
                  ) : (
                    <>
                      <Camera size={18} className="text-white" />
                      <span className="text-[7px] font-black text-white uppercase tracking-widest px-2 text-center">تحديث</span>
                    </>
                  )}
                </div>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </label>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-slate-950 border-2 border-white z-20 shadow-md">
              <Award size={20} fill="currentColor" />
            </div>
          </div>

          <div className="flex-1 space-y-4">
               <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-right">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 shadow-sm">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em] font-mono">VERIFIED_NODE // SECURE</span>
                  </div>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-lg border transition-all text-[8px] font-black uppercase tracking-[0.2em] font-mono",
                      isEditing ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-slate-50 border-slate-100 text-slate-600 hover:border-emerald-500"
                    )}
                  >
                    {isEditing ? 'إلغاء' : 'تعديل الملف'}
                  </button>
                </div>
                
                {isEditing ? (
                  <div className="space-y-4 w-full max-w-sm mt-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] block">الاسم المستعار</label>
                      <input 
                        type="text" 
                        value={editForm.displayName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl text-lg font-black focus:border-emerald-500 outline-none transition-all"
                        placeholder="أدخل اسمك..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] block">وسيلة التواصل المفضلة</label>
                      <div className="flex gap-2">
                        {(['app', 'email', 'phone'] as const).map((method) => (
                          <button
                            key={method}
                            onClick={() => setEditForm(prev => ({ ...prev, preferredContactMethod: method }))}
                            className={cn(
                              "flex-1 py-3 rounded-lg border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                              editForm.preferredContactMethod === method 
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-lg" 
                                : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
                            )}
                          >
                            {method === 'app' ? 'التطبيق' : method === 'email' ? 'إيميل' : 'هاتف'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      حفظ التغييرات
                    </button>
                  </div>
                ) : (
                  <h2 className="text-3xl lg:text-5xl font-black font-display tracking-tight text-slate-950 uppercase">{userProfile?.displayName}</h2>
                )}
             </div>
            
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start text-slate-400">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <MapPin size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest font-mono text-slate-600">قطاع الخرطوم</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Award size={14} className="text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest font-mono text-slate-600">{userProfile?.role === 'official' ? 'STAFF' : 'CITIZEN'}</span>
                  </div>
                  {userProfile?.preferredContactMethod && (
                    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <HelpCircle size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest font-mono text-emerald-600">
                        {userProfile.preferredContactMethod === 'app' ? 'تنبيهات التطبيق' : 
                         userProfile.preferredContactMethod === 'email' ? 'عبر البريد' : 'عبر الهاتف'}
                      </span>
                    </div>
                  )}
                </div>
          </div>

          {/* Points Card */}
          <div className="flex flex-col items-center gap-2 bg-slate-50 border border-slate-100 p-6 rounded-2xl min-w-[160px] shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/5 blur-[30px] rounded-full" />
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] font-mono leading-none">نقاط عمران //</p>
             <div className="flex items-center gap-2">
               <Trophy size={24} className="text-amber-400" />
               <span className="text-4xl font-black font-mono text-slate-950 tracking-tighter">{userProfile?.points.toLocaleString()}</span>
             </div>
             <div className="w-full h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '70%' }}
                  className="h-full bg-amber-400"
                />
             </div>
             <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em] font-mono">LEVEL UP: +500 XP</p>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي البلاغات', value: userIssues.length, icon: <History className="text-blue-500" /> },
          { label: 'المهمات النشطة', value: participations.length, icon: <Users className="text-emerald-500" /> },
          { label: 'البلاغات المكتملة', value: userIssues.filter(i => i.status === 'resolved').length, icon: <CheckCircle className="text-amber-500" /> },
          { label: 'التصنيف', value: '#١٢٤', icon: <TrendingUp className="text-rose-500" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-sm group hover:border-emerald-500 transition-all duration-300">
            <div className="flex justify-between items-center flex-row-reverse">
               <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                {React.cloneElement(stat.icon as React.ReactElement, { size: 20 })}
               </div>
               <div className="w-1.5 h-1.5 rounded-full bg-slate-100 group-hover:bg-emerald-500" />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">{stat.label}</p>
              <p className="text-2xl font-black text-slate-950 font-mono tracking-tighter leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Reports Timeline */}
        <section className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-center px-2">
            <div className="text-right">
               <h3 className="text-xl font-black text-slate-950 font-display tracking-tight leading-none mb-1">سجل البلاغات الميدانية</h3>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono italic">UNIT_LOG // TOTAL_{userIssues.length}</p>
            </div>
            <History size={18} className="text-slate-300" />
          </div>
          
          <div className="space-y-3">
            {userIssues.map((issue, idx) => (
              <motion.div 
                key={issue.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl flex items-center gap-4 hover:bg-white hover:border-emerald-500 transition-all duration-300 group relative"
              >
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border-2 border-white shadow-sm transition-all duration-300 group-hover:scale-105",
                  issue.severity === 3 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  {getIssueIcon(issue.type, 20)}
                </div>
                <div className="flex-1 min-w-0 text-right space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[7px] font-black uppercase tracking-[0.1em] font-mono">
                      #{issue.trackingId}
                    </span>
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest font-mono italic">
                     {formatTimeAgo(typeof issue.createdAt === 'number' ? issue.createdAt : (issue.createdAt as any).seconds * 1000)}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-950 tracking-tight leading-tight line-clamp-1">{issue.description}</h4>
                  <div className="flex gap-2">
                    <span className={cn(
                      "text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-[0.1em] font-mono border",
                      issue.status === 'pending' ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"
                    )}>
                      {issue.status === 'pending' ? 'PENDING' : 'RESOLVED'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            {userIssues.length === 0 && (
              <div className="py-10 border border-dashed border-slate-200 rounded-2xl text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">NO_DATA_FOUND</p>
              </div>
            )}
          </div>
        </section>

        {/* Participations */}
        <section className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-center px-2">
            <div className="text-right">
              <h3 className="text-xl font-black text-slate-950 font-display tracking-tight leading-none mb-1">المبادرات الوطنية</h3>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] font-mono italic">MISSION_STATUS // ACTIVE</p>
            </div>
            <Heart size={18} className="text-emerald-500" fill="currentColor" />
          </div>

          <div className="space-y-3">
            {participations.map((part, idx) => (
              <div key={part.id} className="bg-white rounded-xl overflow-hidden border border-slate-100 group shadow-sm">
                <div className="h-24 bg-slate-100 relative overflow-hidden">
                  <img src={part.campaignImage || `https://picsum.photos/seed/${part.campaignId}/600/300`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={part.campaignTitle} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white rounded-md text-[7px] font-black tracking-widest">MISSION_COMPLETE</div>
                  <div className="absolute bottom-2 right-2 flex flex-col text-right">
                     <p className="text-[6px] font-black text-emerald-400 uppercase tracking-widest leading-none">{part.campaignId?.toUpperCase() || 'REF'}</p>
                     <h4 className="text-white font-black text-xs tracking-tight line-clamp-1">{part.campaignTitle}</h4>
                  </div>
                </div>
                <div className="p-3 flex justify-between items-center text-slate-950 bg-slate-50/50">
                  <div className="flex items-center gap-2 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                    <Star size={12} className="text-amber-500" fill="currentColor" />
                    <span className="text-[10px] font-black font-mono">+{part.pointsEarned}_HP</span>
                  </div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono">
                    {formatTimeAgo(typeof part.createdAt === 'number' ? part.createdAt : (part.createdAt as any).seconds * 1000)}
                  </span>
                </div>
              </div>
            ))}
            {participations.length === 0 && (
              <div className="py-10 border border-dashed border-slate-200 rounded-2xl text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">WAITING_FOR_DEPLOYMENT</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Metrics */}
      <section className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[40px] rounded-full" />
        <div className="relative z-10 space-y-6">
           <div className="flex justify-between items-center">
              <div className="text-right">
                 <h4 className="text-lg font-black text-slate-950 font-display tracking-tight leading-none mb-1">تحليل الجهد الوطني</h4>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">METRIC_STREAM // 2026</p>
              </div>
              <TrendingUp size={16} className="text-emerald-600" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-3">
                 {[
                   { label: 'كفاءة البلاغات', value: 85, color: 'bg-blue-500' },
                   { label: 'المبادرات التطوعية', value: 65, color: 'bg-emerald-500' },
                   { label: 'الدعم المالي', value: 40, color: 'bg-amber-500' },
                 ].map((metric, i) => (
                   <div key={i} className="space-y-1">
                      <div className="flex justify-between items-end flex-row-reverse">
                         <span className="text-[8px] font-black text-slate-900 uppercase tracking-widest">{metric.label}</span>
                         <span className="text-[10px] font-black font-mono text-slate-400">{metric.value}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                         <motion.div 
                           initial={{ width: 0 }}
                           whileInView={{ width: `${metric.value}%` }}
                           transition={{ duration: 1, delay: i * 0.1 }}
                           className={cn("h-full", metric.color)}
                         />
                      </div>
                   </div>
                 ))}
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 border border-slate-100 italic relative overflow-hidden">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-md border border-emerald-50 border-emerald-50 mb-1 z-10">
                    <Heart size={20} fill="currentColor" className="animate-pulse" />
                 </div>
                 <h4 className="text-sm font-black text-slate-900 leading-tight z-10">أعلى مساهم // قطاع (أ)</h4>
                 <p className="text-[7px] uppercase font-black tracking-widest text-emerald-600 z-10">LEGACY_STATUS_ACTIVE</p>
              </div>
           </div>
        </div>
      </section>

      {/* Achievements Cabinet */}
      <section className="bg-white border border-slate-200 rounded-[3rem] p-6 lg:p-10 text-slate-900 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none sudan-texture scale-110" />
        
        <div className="relative z-10 space-y-10">
          <div className="flex justify-between items-center pb-6 border-b border-slate-100">
            <div className="text-right">
              <h3 className="text-2xl font-black font-display tracking-tight leading-none mb-1 text-emerald-600">خزانة الأوسمة</h3>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">VAULT // LEVEL_{Math.floor((userProfile?.points || 0) / 1000)}</p>
            </div>
            <Trophy size={20} className="text-emerald-600/30" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 opacity-60">
                <CheckCircle size={14} />
                <h4 className="text-[8px] font-black uppercase tracking-widest font-mono">أوسمة الميدان</h4>
              </div>
              <div className="flex flex-wrap gap-3">
                {userIssues.length >= 1 && (
                  <BadgeItem title="المستجيب" icon={<Droplets />} color="bg-blue-500" desc="أول بلاغ ميداني" />
                )}
                {userIssues.length >= 10 && (
                  <BadgeItem title="رقمي" icon={<ShieldCheck />} color="bg-emerald-500" desc="تجاوز ١٠ بلاغات" />
                )}
              </div>
            </div>

            <div className="space-y-4 border-r border-slate-100 pr-8">
              <div className="flex items-center gap-2 text-amber-500 opacity-60">
                <Heart size={14} />
                <h4 className="text-[8px] font-black uppercase tracking-widest font-mono">أوسمة المبادرات</h4>
              </div>
              <div className="flex flex-wrap gap-3">
                {participations.length >= 1 && (
                  <BadgeItem title="المبادر" icon={<Users />} color="bg-indigo-500" desc="مشاركة فعالة" />
                )}
              </div>
            </div>
          </div>

          {/* Legacy Timeline */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {userProfile?.achievements?.map((badge, i) => (
              <motion.div 
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="shrink-0 bg-slate-50 border border-slate-100 p-4 rounded-2xl w-40 text-center space-y-3 shadow-sm hover:border-emerald-500/30 transition-all duration-300"
              >
                 <div className={cn(
                   "w-12 h-12 mx-auto rounded-xl flex items-center justify-center shadow-sm",
                   badge.icon === 'shield' ? "bg-blue-50 text-blue-500" : 
                   badge.icon === 'heart' ? "bg-rose-50 text-rose-500" :
                   badge.icon === 'map' ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
                 )}>
                    {badge.icon === 'shield' ? <ShieldCheck size={24} /> : 
                     badge.icon === 'heart' ? <Heart size={24} fill="currentColor" /> :
                     badge.icon === 'map' ? <MapPin size={24} /> : <Users size={24} />}
                 </div>
                 <div className="space-y-0.5">
                    <p className="text-xs font-black text-slate-900 tracking-tight">{badge.title}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase font-mono italic">{new Date(badge.earnedAt).toLocaleDateString('ar-SD')}</p>
                 </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-4 border-t border-slate-201 flex justify-center pb-8">
         <button className="flex items-center gap-2 text-slate-300 hover:text-slate-500 transition-colors">
            <Settings size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest font-mono">ACCOUNT_SETTINGS // v1.0.4</span>
         </button>
      </footer>
    </div>
  );
}
