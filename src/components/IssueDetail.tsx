import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, X, Bot, ThumbsUp, MessageSquare, MapPin, Calendar, Clock, ArrowRight, Truck, ShieldCheck, History, ExternalLink, Globe, Search, Filter, CheckCircle, Lock, Building2, Building, Check, Share2, ChevronLeft, ChevronRight, AlertTriangle, Link } from 'lucide-react';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Issue, User as UserProfile, Movement } from '../types';
import { cn, formatTimeAgo } from '../lib/utils';
import VoiceAssistant from './VoiceAssistant';
import { INSTITUTIONS } from '../constants';

interface Comment {
  id: string;
  text: string;
  userId: string;
  createdAt: any;
}

export default function IssueDetail({ issue: initialIssue, onClose }: { issue: Issue; onClose: () => void }) {
  const [localIssue, setLocalIssue] = useState<Issue>(initialIssue);
  const [comments, setComments] = useState<Comment[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isOfficialMode, setIsOfficialMode] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'status' | 'assignment' | 'resolve';
    value?: any;
    title: string;
    description: string;
  } | null>(null);

  const handleShare = async () => {
    const shareText = `🇸🇩 بلاغ عمران: ${localIssue.description}\n📍 الموقع: ${localIssue.location.address}\n🆔 رقم المعالجة: ${localIssue.trackingId}\nتابع تقدم البلاغ هنا: ${window.location.href}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'بلاغ عمران السودان',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    async function fetchProfile() {
      if (auth.currentUser) {
        const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (snap.exists()) {
          setUserProfile(snap.data() as UserProfile);
        } else {
          // Default role for MVP demo if no profile exists
          setUserProfile({
            uid: auth.currentUser.uid,
            role: 'official', // Let's default to official for testing the feature
            displayName: 'مسؤول النظام',
            isAnonymous: false
          });
        }
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    const unsubIssue = onSnapshot(doc(db, 'issues', initialIssue.id), (snapshot) => {
      if (snapshot.exists()) {
        setLocalIssue({ id: snapshot.id, ...snapshot.data() } as Issue);
      }
    }, (error) => {
      console.error("Error fetching issue live data:", error);
    });

    const qMove = query(
      collection(db, 'issues', initialIssue.id, 'movements'),
      orderBy('timestamp', 'desc')
    );
    const unsubMove = onSnapshot(qMove, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Movement[];
      setMovements(fetched);
    }, (error) => {
      console.error("Error fetching movements:", error);
    });

    const qComm = query(
      collection(db, 'issues', initialIssue.id, 'comments'),
      orderBy('createdAt', 'desc')
    );
    const unsubComm = onSnapshot(qComm, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[];
      setComments(fetched);
    }, (error) => {
      console.error("Error fetching comments:", error);
    });

    return () => {
      unsubIssue();
      unsubMove();
      unsubComm();
    };
  }, [initialIssue.id]);

  const handleUpvote = async () => {
    try {
      await updateDoc(doc(db, 'issues', localIssue.id), {
        reportCount: increment(1)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (text: string) => {
    if (!text.trim() || !auth.currentUser) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'issues', localIssue.id, 'comments'), {
        text,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (status: Issue['status'], severity?: number) => {
    try {
      const stageMap: Record<string, Issue['currentStage']> = {
        'pending': 'detected',
        'verified': 'sorting',
        'in-progress': 'processing',
        'completed': 'verification',
        'resolved': 'resolution'
      };
      
      const updateData: any = {
        status,
        currentStage: stageMap[status] || localIssue.currentStage,
        updatedAt: serverTimestamp()
      };

      if (severity) updateData.severity = severity;

      await updateDoc(doc(db, 'issues', localIssue.id), updateData);
      // Add a system movement log
      await addDoc(collection(db, 'issues', localIssue.id, 'movements'), {
        status: status === 'verified' ? 'تحقق ومراجعة' : status === 'in-progress' ? 'بدء المعالجة' : status === 'completed' ? 'تم التنفيذ - بانتظار الاعتماد' : 'تم حل البلاغ نهائياً',
        description: `تم تحديث سير العمل إلى مرحلة ${status}`,
        institutionName: 'عمران | مركز العمليات',
        timestamp: Date.now(),
        stage: stageMap[status]
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolve = async () => {
    if (!auth.currentUser || auth.currentUser.uid !== localIssue.reporterId) return;
    try {
      await updateDoc(doc(db, 'issues', localIssue.id), {
        status: 'resolved',
        currentStage: 'resolution',
        citizenSignOff: true,
        updatedAt: serverTimestamp()
      });
      await addDoc(collection(db, 'issues', localIssue.id, 'movements'), {
        status: 'إغلاق البلاغ',
        description: 'تم اعتماد الحل من قبل المواطن وإغلاق الملف بنجاح.',
        institutionName: 'المواطن | صاحب البلاغ',
        timestamp: Date.now(),
        stage: 'resolution'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const STAGES: { id: Issue['currentStage']; label: string; icon: any }[] = [
    { id: 'detected', label: 'رصد', icon: <Search size={14} /> },
    { id: 'sorting', label: 'فرز', icon: <Filter size={14} /> },
    { id: 'processing', label: 'معالجة', icon: <Loader2 size={14} /> },
    { id: 'verification', label: 'تدقيق', icon: <CheckCircle size={14} /> },
    { id: 'resolution', label: 'إغلاق', icon: <Lock size={14} /> }
  ];

  // Helper to determine stage state
  const getStageIdx = (id: string) => STAGES.findIndex(s => s.id === id);
  const currentIdx = getStageIdx(localIssue.currentStage || 'detected');

  const logMovement = async (status: string, description: string) => {
    try {
      await addDoc(collection(db, 'issues', localIssue.id, 'movements'), {
        status,
        description,
        institutionName: localIssue.assignedInstitution || 'المؤسسة المسؤولة',
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error(e);
    }
  };

  const assignInstitution = async (name: string) => {
    try {
      await updateDoc(doc(db, 'issues', localIssue.id), {
        assignedInstitution: name,
        status: 'verified', // Auto verify on assign for MVP
        currentStage: 'sorting' // Move to sorting stage
      });
      
      // Official assignment log
      await addDoc(collection(db, 'issues', localIssue.id, 'movements'), {
        status: 'جهة مسؤولة: تم التعيين',
        description: `تم تعيين ${name} رسمياً كمؤسسة مسؤولة عن معالجة هذا البلاغ في النظام.`,
        institutionName: name,
        timestamp: Date.now(),
        stage: 'sorting'
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Tools for Voice Assistant
  const voiceTools = [
    {
      name: 'upvote_issue',
      description: 'Supports or upvotes the current infrastructure issue being viewed.',
      parameters: { type: 'object', properties: {} }
    },
    {
      name: 'add_comment',
      description: 'Adds a comment or feedback to the current infrastructure issue.',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'The content of the comment in Arabic or Sudanese dialect.' }
        },
        required: ['text']
      }
    },
    {
      name: 'update_status',
      description: 'Updates the status of the issue. ONLY for officials.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['verified', 'in-progress', 'completed'], description: 'The new status.' },
          severity: { type: 'string', description: 'The priority level (1-3)' }
        },
        required: ['status']
      }
    },
    {
      name: 'log_movement',
      description: 'Logs a movement or action taken by the institution. (e.g., "dispatched", "arrived").',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'Short status like "تحرك الفريق" or "وصول للموقع".' },
          description: { type: 'string', description: 'Brief description of the action taken.' }
        },
        required: ['status', 'description']
      }
    },
    {
      name: 'assign_institution',
      description: 'Assigns the issue to a specific government institution.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', enum: INSTITUTIONS.map(i => i.name), description: 'The name of the institution.' }
        },
        required: ['name']
      }
    },
    {
      name: 'set_eta',
      description: 'Sets the expected resolution date for the issue. ONLY for officials.',
      parameters: {
        type: 'object',
        properties: {
          days: { type: 'number', description: 'Number of days from now for resolution.' }
        },
        required: ['days']
      }
    }
  ];

  const handleToolCall = async (call: any) => {
    if (call.name === 'upvote_issue') {
      await handleUpvote();
      return { success: true, message: "تم دعم البلاغ بنجاح" };
    }
    if (call.name === 'add_comment') {
      await handleAddComment(call.args.text);
      return { success: true, message: "تمت إضافة تعليقك" };
    }
    if (call.name === 'update_status') {
      if (userProfile?.role === 'official' || userProfile?.role === 'partner') {
        const severityInt = call.args.severity ? parseInt(call.args.severity) : undefined;
        await handleStatusUpdate(call.args.status, severityInt);
        return { success: true, message: `تم تحديث حالة البلاغ إلى: ${call.args.status}${severityInt ? ' وتعديل الأهمية' : ''}` };
      }
      return { success: false, message: "عذراً، ليس لديك صلاحية لهذا الإجراء." };
    }
    if (call.name === 'log_movement') {
      if (userProfile?.role === 'official' || userProfile?.role === 'partner') {
        await logMovement(call.args.status, call.args.description);
        return { success: true, message: "تم تسجيل التحرك بنجاح" };
      }
      return { success: false, message: "ليس لديك صلاحية" };
    }
    if (call.name === 'assign_institution') {
      if (userProfile?.role === 'official') {
        await assignInstitution(call.args.name);
        return { success: true, message: `تم تعيين البلاغ إلى: ${call.args.name}` };
      }
      return { success: false, message: "عذراً، ليس لديك صلاحية لهذا الإجراء." };
    }
    if (call.name === 'set_eta') {
       if (userProfile?.role === 'official' || userProfile?.role === 'partner') {
          const eta = Date.now() + (call.args.days * 24 * 60 * 60 * 1000);
          await updateDoc(doc(db, 'issues', localIssue.id), {
            expectedResolutionAt: eta
          });
          return { success: true, message: `تم تحديد تاريخ المتوقع للمعالجة خلال ${call.args.days} أيام.` };
       }
       return { success: false, message: "صلاحيات غير كافية" };
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      className="fixed inset-0 z-50 bg-white flex flex-col pt-0 sm:pt-0"
    >
      {/* Header - Technical Dossier Style */}
      <div className="px-4 py-3 flex justify-between items-center bg-white/95 backdrop-blur-3xl sticky top-0 z-[60] border-b border-slate-100 shadow-sm">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white text-slate-900 rounded-xl hover:bg-emerald-50 transition-all duration-500 hover:rotate-90 active:scale-90 shadow-sm group border border-slate-200">
          <ArrowRight className="rotate-180 group-hover:scale-110 transition-transform" size={20} strokeWidth={3} />
        </button>
        <div className="text-center group cursor-crosshair">
           <div className="flex items-center gap-2 justify-center mb-0.5">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
             <h2 className="font-mono font-black text-slate-500 uppercase tracking-[0.3em] text-[10px] group-hover:text-emerald-600 transition-colors">OPERATIONAL_DOSSIER // CONFIDENTIAL</h2>
           </div>
           <p className="text-[11px] font-black text-slate-950 tracking-[0.2em] uppercase font-mono group-hover:tracking-[0.4em] transition-all duration-1000">REF_{localIssue.trackingId}</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest font-mono leading-none mb-0.5">TLS-1.3</span>
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.1em] font-mono leading-none">ACTIVE_STREAM</span>
           </div>
           <div className="w-10 h-10 flex items-center justify-center bg-white border border-emerald-500/10 rounded-xl text-emerald-600 shadow-sm">
             <ShieldCheck size={20} strokeWidth={2.5} />
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-6 space-y-8 bg-slate-50/30">
        {/* Main Info Section */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className={cn(
                "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] shadow-md border-2 transition-all duration-1000",
                localIssue.severity === 3 ? "bg-rose-600 border-rose-500 text-white animate-pulse" : "bg-emerald-600 border-emerald-500 text-white"
              )}>
                {localIssue.severity === 3 ? 'PRIORITY // IMMEDIATE' : 'PRIORITY // STANDARD'}
              </div>
              <div className="px-4 py-2 bg-white text-slate-950 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center gap-1.5 border border-slate-100 font-mono">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 SDN_GOV // ARCHIVE
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
               <div className="flex items-center gap-3 text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm group">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
                  <span className="text-[8px] font-black uppercase tracking-[0.1em] font-mono whitespace-nowrap">
                    SYNC_STAMP // {localIssue.createdAt ? formatTimeAgo((localIssue.createdAt as any).seconds * 1000) : 'REAL_TIME'}
                  </span>
                  <Clock size={12} className="text-emerald-600" />
               </div>
            </div>
          </div>

          <div className="space-y-6 text-right relative">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
            <h3 className="text-3xl lg:text-5xl font-black text-slate-950 leading-[0.9] font-display mb-4 tracking-tighter selection:bg-emerald-500 selection:text-white">
              {localIssue.type === 'road' ? 'تأهيل شبكة الطرق' : 
               localIssue.type === 'water' ? 'صيانة المياه' :
               localIssue.type === 'electricity' ? 'معالجة الطاقة' : 'الإصحاح البيئي'}
            </h3>
            <div className="umran-card flex items-center gap-3 justify-end text-emerald-950 font-black text-lg lg:text-xl p-4 inline-flex ml-auto max-w-xl group">
              <span className="leading-tight tracking-tight group-hover:translate-x-1 transition-transform duration-700">{localIssue.location.address || 'موقع قيد الملاحظة الميدانية'}</span>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-700 shadow-sm">
                <MapPin size={20} />
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-2 bg-emerald-500/[0.03] blur-2xl rounded-3xl group-hover:bg-emerald-500/[0.06] transition-all duration-1000" />
            <p className="umran-card text-slate-800 leading-[1.6] font-black text-xl lg:text-2xl text-right border-r-[8px] border-emerald-600 pr-8 py-6 italic relative z-10">
              "{localIssue.description || 'لم يتم إدراج وصف فني إضافي لمحتوى البلاغ المرفوع في هذه المرحلة.'}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-6 bg-emerald-600 rounded-3xl text-white flex items-center justify-between shadow-lg relative overflow-hidden group border border-emerald-500/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 blur-[60px] rounded-full group-hover:bg-emerald-100 transition-all duration-700" />
                <div className="relative z-10 text-right">
                  <p className="text-[9px] font-black text-emerald-200 uppercase tracking-[0.3em] mb-1 font-mono italic">رقم التسجيل</p>
                  <h4 className="text-xl font-black font-mono tracking-wider text-white/90">{localIssue.trackingId}</h4>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-inner rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <ShieldCheck size={28} />
                  </div>
                  <span className="text-[8px] font-black uppercase text-white/30 tracking-[0.2em] leading-none">سجل موثق</span>
                </div>
             </div>

             {/* Assigned Institution Card - High Precision */}
             {localIssue.assignedInstitution && (
               <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm relative overflow-hidden group hover:border-emerald-500 transition-all duration-500">
                 <div className="flex gap-4 items-center">
                   <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                     {INSTITUTIONS.find(i => i.name === localIssue.assignedInstitution)?.logo ? (
                       <img 
                         src={INSTITUTIONS.find(i => i.name === localIssue.assignedInstitution)?.logo} 
                         alt="Institution Logo" 
                         className="w-full h-full object-cover p-1.5"
                         referrerPolicy="no-referrer"
                       />
                     ) : (
                       <Building2 size={24} className="text-slate-200" />
                     )}
                   </div>
                   <div className="flex-1 text-right min-w-0">
                      <div className="flex items-center gap-1.5 justify-end mb-0.5">
                         <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.1em] italic">شريك نشط // رسمي</span>
                         <Building size={10} className="text-emerald-500 animate-pulse" />
                      </div>
                      <h4 className="text-lg font-black text-slate-900 truncate tracking-tight">{localIssue.assignedInstitution}</h4>
                      {INSTITUTIONS.find(i => i.name === localIssue.assignedInstitution)?.website && (
                        <a 
                          href={INSTITUTIONS.find(i => i.name === localIssue.assignedInstitution)?.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-slate-400 font-bold text-[8px] hover:text-emerald-600 transition-colors mt-0.5"
                        >
                           <ExternalLink size={10} />
                           الموقع الرسمي
                        </a>
                      )}
                   </div>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Media Block - Refined Carousel */}
        <div className="space-y-4">
          <div className="aspect-[21/9] bg-slate-50 rounded-3xl overflow-hidden relative shadow-lg group/carousel border-2 border-white">
            <div className="w-full h-full relative">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: "anticipate" }}
                  src={(localIssue.mediaUrls && localIssue.mediaUrls.length > 0) ? localIssue.mediaUrls[currentImageIndex] : `https://picsum.photos/seed/${localIssue.id}/1200/600`} 
                  alt="Issue" 
                  className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000 group-hover/carousel:scale-105"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* Carousel Controls */}
              {localIssue.mediaUrls && localIssue.mediaUrls.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : localIssue.mediaUrls!.length - 1))}
                    className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-emerald-600 hover:text-white z-[70] shadow-2xl"
                  >
                    <ChevronLeft size={24} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => (prev < localIssue.mediaUrls!.length - 1 ? prev + 1 : 0))}
                    className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-emerald-600 hover:text-white z-[70] shadow-2xl"
                  >
                    <ChevronRight size={24} strokeWidth={3} />
                  </button>
                </>
              )}

              <div className="absolute top-8 right-8 px-6 py-3 bg-emerald-600/90 backdrop-blur-2xl rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.3em] border border-emerald-400/30 z-[70] flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                الحالة // {localIssue.status === 'pending' ? 'جاري المراجعة' : localIssue.status === 'verified' ? 'تم التحقق' : localIssue.status === 'in-progress' ? 'قيد العمل' : localIssue.status === 'completed' ? 'تم الإنجاز' : 'تم الحل'}
              </div>
              
              {localIssue.mediaUrls && localIssue.mediaUrls.length > 1 && (
                <>
                  <div className="absolute bottom-8 inset-x-0 flex justify-center gap-3 pointer-events-none z-[70]">
                    {localIssue.mediaUrls.map((_, idx) => (
                      <motion.div 
                        key={idx} 
                        animate={{ 
                          width: idx === currentImageIndex ? 48 : 8, 
                          opacity: idx === currentImageIndex ? 1 : 0.3,
                          backgroundColor: idx === currentImageIndex ? '#10b981' : '#ffffff' 
                        }}
                        className="h-2 rounded-full" 
                      />
                    ))}
                  </div>
                  
                  {/* Visual Progress Bar Component */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 z-[70]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentImageIndex + 1) / localIssue.mediaUrls.length) * 100}%` }}
                      className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress Tracker - Mission Control Flow */}
        <div className="umran-card p-6 space-y-6">
           <div className="flex justify-between items-center mb-2">
             <div className="flex items-center gap-3">
               <div className="p-3 rounded-xl bg-slate-100 text-slate-900 shadow-sm border border-slate-200">
                 <History size={18} strokeWidth={3} className="text-emerald-600" />
               </div>
               <div className="text-right">
                  <h4 className="font-black text-slate-950 text-xl uppercase tracking-tighter italic font-display">الخط الزمني للمعالجة</h4>
                  <p className="text-[8px] font-mono font-black text-emerald-600 uppercase tracking-[0.3em]">OPERATIONAL_FLOW // MISSION_READY</p>
               </div>
             </div>
             <div className="px-6 py-2 bg-emerald-600 text-white rounded-full shadow-md">
                <span className="text-[9px] font-black uppercase tracking-widest font-mono">
                  {localIssue.expectedResolutionAt ? `ETA: ${new Date(localIssue.expectedResolutionAt).toLocaleDateString()}` : 'ETA: ANALYSIS_PENDING'}
                </span>
             </div>
           </div>
           
           <div className="flex justify-between relative px-2 py-6">
              {/* Connection Line System */}
              <div className="absolute top-[42px] left-8 right-8 h-[3px] bg-slate-100 -z-10 rounded-full" />
              <div 
                className="absolute top-[42px] right-0 h-[3px] bg-emerald-500 -z-10 shadow-[0_0_15px_#10b981] transition-all duration-[2s] rounded-full" 
                style={{ width: `calc(${(currentIdx / (STAGES.length - 1)) * 100}% - 36px)`, right: '36px' }}
              />
              
              {STAGES.map((s, idx) => {
                const isPast = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                const relevantMove = movements.find(m => m.stage === s.id);

                return (
                  <div key={s.id} className="flex flex-col items-center gap-3 relative">
                     <motion.div 
                       initial={false}
                       animate={{ 
                         scale: isCurrent ? 1.15 : 1,
                         rotate: isCurrent ? 4 : 0
                       }}
                       className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-700 border-2 shadow-md relative backdrop-blur-md",
                        isPast ? "bg-emerald-500 border-emerald-400 text-white" : isCurrent ? "bg-emerald-600 border-emerald-500 text-white" : "bg-white border-slate-50 text-slate-200"
                      )}>
                        {React.cloneElement(s.icon as any, { size: 16, strokeWidth: 3 })}
                        
                        {relevantMove && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                             <Check size={8} className="text-white" strokeWidth={5} />
                          </div>
                        )}
                     </motion.div>
                     
                     <div className="text-center space-y-0.5">
                       <span className={cn(
                         "text-[9px] font-black uppercase tracking-[0.1em] whitespace-nowrap block transition-colors duration-500",
                         isCurrent ? "text-slate-950" : isPast ? "text-emerald-700" : "text-slate-300"
                       )}>
                         {s.label}
                       </span>
                       
                       <AnimatePresence>
                         {relevantMove && (
                           <motion.span 
                             initial={{ opacity: 0, y: 3 }}
                             animate={{ opacity: 1, y: 0 }}
                             className="text-[7px] font-black font-mono text-slate-400 whitespace-nowrap block"
                           >
                             {formatTimeAgo(relevantMove.timestamp)}
                           </motion.span>
                         )}
                       </AnimatePresence>

                       {isCurrent && (
                          <div className="w-1 h-1 bg-emerald-500 rounded-full mx-auto animate-pulse" />
                       )}
                     </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Tactical Actions Grid */}
        <div className="grid grid-cols-4 gap-3">
          <button 
            onClick={handleUpvote}
            className="umran-card group flex flex-col items-center justify-center py-5 text-slate-400 border-slate-100 active:scale-95"
          >
            <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-emerald-50 transition-colors mb-2">
               <ThumbsUp size={22} className="group-hover:scale-110 transition-transform duration-500" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.1em]">{localIssue.reportCount} دعم وطني</span>
          </button>

          <button 
            onClick={handleCopyLink}
            className={cn(
              "umran-card group flex flex-col items-center justify-center py-5 border shadow-sm active:scale-95",
              copied 
                ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-emerald-500/20" 
                : "text-slate-400 border-slate-100"
            )}
          >
            <div className={cn("p-3 rounded-xl transition-colors mb-2", copied ? "bg-emerald-100" : "bg-slate-50 group-hover:bg-emerald-50")}>
               {copied ? <Check size={22} /> : <Link size={22} />}
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.1em]">{copied ? 'تم النسخ' : 'رابط التتبع'}</span>
          </button>

          <button 
            onClick={handleShare}
            className="umran-card group flex flex-col items-center justify-center py-5 text-slate-400 active:scale-95 border-slate-100"
          >
             <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-blue-50 transition-colors mb-2">
               <Share2 size={22} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.1em]">نشر البلاغ</span>
          </button>

          <button 
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="group flex flex-col items-center justify-center py-5 bg-emerald-600 rounded-2xl text-white transition-all duration-500 active:scale-95 hover:bg-emerald-700 shadow-lg"
          >
             <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-slate-200 transition-colors mb-2">
               <Mic size={22} className="text-emerald-400" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.1em]">المساعد الصوتي</span>
          </button>
        </div>

          {(localIssue.status === 'completed' && auth.currentUser?.uid === localIssue.reporterId) && (
            <button 
              onClick={() => setConfirmAction({
                type: 'resolve',
                title: 'إغلاق البلاغ نهائياً',
                description: 'هل تؤكد أن المشكلة قد حُلّت تماماً؟ سيتم أرشفة البلاغ ولا يمكن التراجع بعد هذه الخطوة.'
              })}
              className="w-full flex items-center justify-center p-6 bg-emerald-600 rounded-[32px] text-white shadow-2xl shadow-emerald-200 active:scale-95 transition-all gap-4"
            >
              <CheckCircle size={32} strokeWidth={1.5} className="animate-bounce" />
              <span className="text-sm font-black uppercase tracking-[0.2em]">تأكيد الحل وإغلاق البلاغ</span>
            </button>
          )}

          {(userProfile?.role === 'official' || userProfile?.role === 'partner') && (
            <div className="space-y-4 pt-4">
              <div className="p-1 bg-slate-100 rounded-[22px] flex">
                 <button 
                   onClick={() => setIsOfficialMode(false)}
                   className={cn(
                     "flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all",
                     !isOfficialMode ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400"
                   )}
                 >
                   المواطن
                 </button>
                 <button 
                   onClick={() => setIsOfficialMode(true)}
                   className={cn(
                     "flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all",
                     isOfficialMode ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400"
                   )}
                 >
                   المسؤول
                 </button>
              </div>

              <AnimatePresence>
                {isOfficialMode && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6 bg-emerald-600 text-white rounded-[32px] space-y-6 overflow-hidden relative border border-emerald-500/30"
                  >
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="flex justify-between items-center flex-row-reverse relative">
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">الإجراءات الرسمية</p>
                          <h5 className="text-sm font-black text-white">تحديث سير العمل</h5>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900">
                          <Lock size={20} />
                        </div>
                      </div>
                    </div>
                      <div className="grid grid-cols-2 gap-3 relative">
                         <button 
                           onClick={() => setConfirmAction({
                             type: 'status',
                             value: 'verified',
                             title: 'تأكيد البلاغ',
                             description: 'سيتم نقل البلاغ لمرحلة الفرز والتحقق. هل ترغب في المتابعة؟'
                           })}
                           className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-emerald-500 transition-all text-right group"
                         >
                           <CheckCircle className="text-emerald-400 mb-2 group-hover:text-white transition-colors" size={20} />
                           <p className="text-xs font-black">تأكيد البلاغ</p>
                           <p className="text-[8px] text-white/40">فرز المؤسسات</p>
                         </button>
                         <button 
                           onClick={() => setConfirmAction({
                             type: 'status',
                             value: 'in-progress',
                             title: 'بدء التنفيذ',
                             description: 'سيتم إشعار المواطن بأن الفريق الفني في طريقه للموقع. هل ترغب في المتابعة؟'
                           })}
                           className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-amber-500 transition-all text-right group"
                         >
                           <Truck className="text-amber-400 mb-2 group-hover:text-white transition-colors" size={20} />
                           <p className="text-xs font-black">بدء التنفيذ</p>
                           <p className="text-[8px] text-white/40">تحرك الفريق</p>
                         </button>
                      </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

        {/* Official Controls */}
        {(userProfile?.role === 'official' || userProfile?.role === 'partner') && (
          <div className="space-y-4">
            <div className="p-8 bento-inner bg-slate-50/50 border-slate-100 space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">أدوات المسؤول والمتابعة</h4>
              
              {/* Institution Selection */}
              {userProfile.role === 'official' && !localIssue.assignedInstitution && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-bold text-center">قم بتعيين المؤسسة المسؤولة لمعالجة هذا البلاغ:</p>
                  <div className="grid grid-cols-1 gap-3">
                    {INSTITUTIONS.map(inst => (
                      <button 
                        key={inst.id}
                        onClick={() => setConfirmAction({
                          type: 'assignment',
                          value: inst.name,
                          title: 'تحويل البلاغ',
                          description: `سيتم تحويل البلاغ رسمياً إلى ${inst.name}. هل أنت متأكد؟`
                        })}
                        className="p-4 bg-white border border-slate-200 rounded-3xl text-right hover:border-emerald-500 hover:shadow-lg transition-all group"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <ExternalLink size={14} className="text-slate-300 group-hover:text-emerald-500" />
                          <h5 className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{inst.name}</h5>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{inst.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {localIssue.assignedInstitution && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 justify-center bg-emerald-600 text-white p-5 rounded-3xl shadow-xl shadow-emerald-100 mb-2">
                    <Truck size={24} />
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">موكل رسمياً إلى</p>
                      <h4 className="text-sm font-black uppercase tracking-widest">{localIssue.assignedInstitution}</h4>
                    </div>
                  </div>
                  
                  {INSTITUTIONS.find(i => i.name === localIssue.assignedInstitution)?.website && (
                    <a 
                      href={INSTITUTIONS.find(i => i.name === localIssue.assignedInstitution)?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transition-all"
                    >
                      <ExternalLink size={16} className="text-slate-400" />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">عرض الموقع الرسمي للمؤسسة</span>
                        <Globe size={16} className="text-emerald-600" />
                      </div>
                    </a>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { id: 'verified', label: 'تأكيد' },
                  { id: 'in-progress', label: 'تنفيذ' },
                  { id: 'completed', label: 'إكمال' }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => setConfirmAction({
                      type: 'status',
                      value: opt.id as any,
                      title: 'تغيير الحالة',
                      description: `هل ترغب في تغيير حالة البلاغ إلى "${opt.label}"؟`
                    })}
                    className={cn(
                      "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                      localIssue.status === opt.id 
                        ? "bg-emerald-600 text-white" 
                        : "bg-white text-slate-400 border border-slate-100 hover:border-emerald-500"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Movement Timeline */}
        <div className="space-y-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <History size={18} />
              </div>
              <h4 className="font-black text-slate-900 text-lg font-display tracking-normal">سجل المجرى العملي</h4>
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{movements.length} تحركات</span>
          </div>
          
          <div className="relative space-y-10 before:absolute before:right-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-50 pr-12">
            {movements.map((move, idx) => {
              const inst = INSTITUTIONS.find(i => i.name === move.institutionName);
              
              return (
                <motion.div 
                  key={move.id} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative group mr-2"
                >
                  <div className="absolute -right-[35px] top-1.5 w-8 h-8 rounded-2xl border-4 border-white bg-white flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform z-10 overflow-hidden">
                     {inst?.logo ? (
                       <img src={inst.logo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     ) : (
                       <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                     )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center flex-row-reverse">
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100 font-display">{move.status}</span>
                      <div className="flex items-center gap-2 text-slate-300">
                         <Clock size={10} />
                         <span className="text-[9px] font-bold uppercase tracking-widest">{move.timestamp ? formatTimeAgo(move.timestamp) : 'الآن'}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 font-bold leading-relaxed text-right font-content">{move.description}</p>
                    <div className="flex items-center gap-2 justify-end text-slate-400 group-hover:text-emerald-600 transition-colors">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-right">{move.institutionName}</span>
                      {inst?.logo ? <Check size={12} className="text-emerald-500" /> : <Building2 size={12} />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {movements.length === 0 && (
              <div className="text-center py-8 text-slate-300 text-[10px] italic font-medium uppercase tracking-widest">
                لا توجد سجلات تحرك حتى الآن.
              </div>
            )}
          </div>
        </div>

        {/* Discussion */}
        <div className="space-y-8 pt-6 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <MessageSquare size={18} />
              </div>
              <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest">النقاش المجتمعي</h4>
            </div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{comments.length} تعليقات</span>
          </div>

          <div className="space-y-6">
            {comments.map((c, idx) => (
              <motion.div 
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-slate-100 rounded-[28px] p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center flex-row-reverse">
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">مواطن #{c.userId.slice(0, 4)}</p>
                      <p className="text-[9px] text-slate-400 font-bold">عضو موثق</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                      <Bot size={20} />
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                    {c.createdAt ? formatTimeAgo(c.createdAt.seconds * 1000) : 'الآن'}
                  </span>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed text-right">{c.text}</p>
              </motion.div>
            ))}
            
            {comments.length === 0 && (
              <div className="text-center py-12 text-slate-300 text-[10px] italic font-medium uppercase tracking-widest">
                لا توجد تعليقات بعد. كن أول من يشارك!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Input Bar */}
      <div className="p-6 bg-white/80 backdrop-blur-md border-t border-slate-50 sticky bottom-0">
        {userProfile?.role === 'official' && (
          <div className="flex flex-wrap gap-2 mb-4 justify-end">
            <button 
              onClick={() => handleAddComment('تم استلام البلاغ وسيجري التعامل معه في أقرب وقت ممكن. نشكركم على تفهمكم.')}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
            >
              رد سريع: تأكيد الاستلام
            </button>
          </div>
        )}
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="أضف تعليقك هنا يا زول..."
            className="flex-1 px-6 py-4 bg-slate-50 rounded-[22px] text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-right placeholder:text-slate-300"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(newComment)}
          />
          <button 
            disabled={submitting || !newComment.trim()}
            onClick={() => handleAddComment(newComment)}
            className="w-14 h-14 bg-emerald-600 text-white rounded-[22px] flex items-center justify-center shadow-2xl shadow-emerald-200 active:scale-95 disabled:opacity-50 transition-all"
          >
            <ArrowRight className="rotate-180" size={24} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Confirmation Dialog Overlay */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/60 backdrop-blur-md"
              onClick={() => !isProcessing && setConfirmAction(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="umran-card relative w-full max-w-sm p-10 flex flex-col items-center text-center space-y-8"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] text-emerald-600 flex items-center justify-center shadow-inner border-2 border-white relative group">
                <div className="absolute inset-0 bg-emerald-500/20 blur-[20px] rounded-full animate-pulse" />
                <AlertTriangle size={48} className="relative z-10" />
              </div>
              
              <div className="space-y-4 relative z-10">
                <h3 className="text-3xl font-black text-slate-900 font-display italic tracking-tight">{confirmAction.title}</h3>
                <p className="text-sm text-slate-500 font-bold leading-relaxed">{confirmAction.description}</p>
              </div>

              <div className="flex flex-col gap-3 w-full relative z-10">
                 <button 
                   disabled={isProcessing}
                   onClick={async () => {
                     setIsProcessing(true);
                     try {
                        if (confirmAction.type === 'status') {
                          await handleStatusUpdate(confirmAction.value);
                        } else if (confirmAction.type === 'assignment') {
                          await assignInstitution(confirmAction.value);
                        } else if (confirmAction.type === 'resolve') {
                          await handleResolve();
                        }
                        setConfirmAction(null);
                     } catch (err) {
                        console.error(err);
                     } finally {
                        setIsProcessing(false);
                     }
                   }}
                   className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl text-sm uppercase tracking-widest shadow-[0_20px_40px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {isProcessing ? (
                     <>
                       <Loader2 size={20} className="animate-spin" />
                       <span>جاري التنفيذ...</span>
                     </>
                   ) : (
                     <>
                       <Check size={20} strokeWidth={3} />
                       <span>تأكيد الإجراء السيادي</span>
                     </>
                   )}
                 </button>
                 
                 <button 
                   disabled={isProcessing}
                   onClick={() => setConfirmAction(null)}
                   className="w-full py-5 bg-slate-100 text-slate-400 font-black rounded-3xl text-xs uppercase tracking-widest active:scale-95 transition-all hover:bg-slate-200"
                 >
                   إلغاء وتراجع
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voice Assistant Overlay Contextual */}
      <AnimatePresence>
        {isVoiceAssistantOpen && (
          <VoiceAssistant 
            onClose={() => setIsVoiceAssistantOpen(false)} 
            context={`أنت الآن تساعد المستخدم في موضوع محدد: '${localIssue.description}'. تفاصيل الموقع: '${localIssue.location.address}'. الحالة الحالية: '${localIssue.status}'. المؤسسة الموكلة: '${localIssue.assignedInstitution || 'لم تحدد بعد'}'.
                     يمكنك مساعدته في دعم البلاغ (upvote) أو إضافة تعليق (comment). 
                     إذا كان المستخدم مسؤولاً (official)، يمكنك أيضاً تغيير الحالة باستخدام أداة update_status أو تعيين مؤسسة باستخدام assign_institution.
                     يمكن للمسؤولين أيضاً تسجيل تحركات الفريق (log_movement) مثل "الفريق تحرك للموقع" أو "بدء صيانة الماسورة".
                     المؤسسات المتاحة: 'هيئة الطرق والجسور', 'هيئة مياه ولاية الخرطوم', 'شركة توزيع الكهرباء', 'جهاز حماية البيئة والنظافة', 'وزارة البنى التحتية'.
                     إذا طلب المستخدم دعم البلاغ، استخدم أداة upvote_issue. 
                     إذا طلب إضافة تعليق، اطلب منه النص واستخدم أداة add_comment.`}
            tools={voiceTools}
            onToolCall={handleToolCall}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
