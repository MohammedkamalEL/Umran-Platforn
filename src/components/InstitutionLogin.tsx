import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building, Shield, ChevronRight, Loader2, ArrowLeft, Mail, Lock, AlertTriangle } from 'lucide-react';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { INSTITUTIONS } from '../constants';
import { cn } from '../lib/utils';

export default function InstitutionLogin({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedInst, setSelectedInst] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. يرجى مراجعة البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col bg-white text-slate-900 relative overflow-hidden" dir="rtl">
       {/* Background Sophistication */}
       <div className="absolute inset-0 opacity-[0.03] sudan-pattern-modern scale-[2] rotate-12 pointer-events-none" />
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none sudan-texture scale-150 rotate-12" />
       <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent blur-[120px] pointer-events-none" />
       <div className="absolute bottom-[-10%] right-[-10%] w-full h-full bg-gradient-to-tl from-blue-500/5 to-transparent blur-[120px] pointer-events-none" />
       
       <button 
         onClick={onClose} 
         className="absolute top-8 left-8 w-14 h-14 bg-white/80 backdrop-blur-md hover:bg-slate-50 rounded-2xl transition-all z-[150] border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 active:scale-90 shadow-sm"
       >
          <ArrowLeft size={24} />
       </button>

       <div className="mb-16 relative z-10">
          <motion.div 
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 3, scale: 1 }}
            className="w-24 h-24 bg-emerald-600 rounded-[3.5rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-emerald-200 border-4 border-white relative overflow-hidden group"
          >
             <div className="absolute inset-0 sudan-pattern-modern opacity-20 animate-spin-slow" />
             <Shield size={48} className="relative z-10" />
          </motion.div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 font-display bg-clip-text text-transparent bg-gradient-to-r from-slate-950 via-slate-900 to-slate-500">بوابة المؤسسات السيادية</h2>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] leading-relaxed">SECURE_GATEWAY // CONTROL_CENTER_ACCESS</p>
          </div>
       </div>

       <div className="flex-1 overflow-hidden relative z-10 flex flex-col justify-center max-w-5xl">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                className="space-y-8 h-full overflow-y-auto no-scrollbar pb-10 pr-2"
              >
                <div className="flex items-baseline justify-between border-b border-slate-100 pb-6 mb-8 group">
                  <p className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.5em] group-hover:tracking-[0.6em] transition-all duration-700 font-mono">١. اختر المؤسسة المعنية // SELECT_AGENT</p>
                  <span className="text-[10px] font-mono font-black text-slate-300">SESSION_P01 // SDN_NET</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {INSTITUTIONS.map((inst, idx) => (
                    <motion.button
                      key={inst.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03, duration: 0.6 }}
                      onClick={() => {
                        setSelectedInst(inst);
                        setStep(2);
                      }}
                      className="group flex flex-col items-start p-10 bg-white border border-slate-100 rounded-[3.5rem] hover:bg-slate-50 hover:border-emerald-500 hover:shadow-2xl transition-all duration-700 text-right active:scale-[0.98] overflow-hidden relative"
                    >
                      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                      
                      <div className="flex justify-between items-start w-full flex-row-reverse mb-8 relative z-10">
                        <div className="w-24 h-24 bg-white rounded-[2.2rem] flex items-center justify-center overflow-hidden transition-all duration-700 group-hover:scale-110 group-hover:rotate-[15deg] shadow-lg p-4 border border-slate-50">
                           {inst.logo ? (
                             <img src={inst.logo} alt={inst.name} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                           ) : (
                             <Building className="text-slate-200" size={32} />
                           )}
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all duration-500 shadow-sm">
                          <ChevronRight size={24} className="transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>

                      <div className="relative z-10 space-y-3">
                        <h4 className="text-3xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight leading-tight font-display italic">{inst.fullName}</h4>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded bg-slate-100 text-[10px] font-black tracking-widest text-slate-400 uppercase border border-slate-200 group-hover:text-emerald-600 transition-colors font-mono">DEPT_{inst.id?.toUpperCase() || 'CORE'}</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-50 shadow-[0_0_8px_#10b981]" />
                          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] font-mono">ACCESS_V_2.6</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(15px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(15px)' }}
                className="space-y-12 max-w-2xl mx-auto w-full"
              >
                <div className="flex justify-between items-center bg-slate-50 p-4 pr-8 rounded-full border border-slate-100">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex items-center gap-3 bg-white px-6 py-2 rounded-full text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-600 hover:text-white transition-all group shadow-sm border border-slate-200"
                  >
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-2" />
                    تغيير القسم
                  </button>
                  <p className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-[0.4em]">AUTH_STEP_02 // SDN_CIPH</p>
                </div>

                <div className="p-12 bg-white border border-slate-100 rounded-[4.5rem] shadow-2xl relative overflow-hidden group/card">
                   <div className="absolute inset-0 sudan-pattern-modern opacity-[0.03] pointer-events-none scale-150 rotate-6" />
                   
                   <div className="flex flex-col items-center text-center space-y-10 relative z-10">
                      <div className="relative group/logo">
                        <div className="absolute inset-0 bg-emerald-500/10 blur-[40px] rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                        <div className="w-32 h-32 bg-white rounded-[3.5rem] flex items-center justify-center overflow-hidden shadow-2xl relative z-10 p-6 transition-transform duration-700 group-hover/logo:scale-110 group-hover/logo:rotate-[5deg] border border-slate-100">
                           <img src={selectedInst.logo} alt={selectedInst.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight font-display italic tracking-tight">{selectedInst.fullName}</h3>
                        <div className="flex items-center justify-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse" />
                          <p className="text-xs text-emerald-600 font-black uppercase tracking-[0.4em]">نقطة وصول سيادية مشفرة</p>
                        </div>
                      </div>

                      <form onSubmit={handleLogin} className="w-full space-y-8">
                         <div className="space-y-5">
                            <div className="relative group">
                               <div className="absolute inset-y-0 right-10 flex items-center justify-center text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500">
                                 <Mail size={24} />
                               </div>
                               <input 
                                 type="email" 
                                 required
                                 value={email}
                                 onChange={(e) => setEmail(e.target.value)}
                                 placeholder="البريد الإلكتروني المؤسسي" 
                                 className="w-full pr-24 pl-10 py-10 bg-slate-50 border-2 border-slate-100 rounded-[4rem] text-xl font-black focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 text-right shadow-inner"
                               />
                            </div>
                            <div className="relative group">
                              <div className="absolute inset-y-0 right-10 flex items-center justify-center text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500">
                                 <Lock size={24} />
                               </div>
                               <input 
                                 type="password" 
                                 required
                                 value={password}
                                 onChange={(e) => setPassword(e.target.value)}
                                 placeholder="رمز المرور الوطني الموحد" 
                                 className="w-full pr-24 pl-10 py-10 bg-slate-50 border-2 border-slate-100 rounded-[4rem] text-xl font-black focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 text-right shadow-inner"
                               />
                            </div>
                         </div>

                         {error && (
                           <motion.div 
                             initial={{ opacity: 0, y: 10, scale: 0.9 }}
                             animate={{ opacity: 1, y: 0, scale: 1 }}
                             className="p-8 bg-rose-50 border-2 border-rose-100 rounded-[4rem] text-sm font-black text-rose-600 uppercase tracking-widest text-center italic"
                           >
                              <AlertTriangle size={20} className="inline-block mb-3 animate-bounce" />
                              <p>ERR_SEC_AUTH: {error}</p>
                           </motion.div>
                         )}

                         <button 
                           type="submit" 
                           disabled={loading}
                           className="w-full py-10 bg-emerald-600 text-white font-black rounded-[4rem] flex items-center justify-center gap-6 shadow-2xl shadow-emerald-200 transition-all active:scale-[0.98] disabled:opacity-50 text-2xl uppercase tracking-[0.5em] hover:bg-emerald-700 group relative overflow-hidden"
                         >
                           {loading ? (
                             <Loader2 className="animate-spin" size={32} />
                           ) : (
                             <>
                               <Shield className="group-hover:rotate-12 group-hover:scale-125 transition-transform duration-700" size={32} />
                               <span className="font-display italic">فتح تأمين الجلسة</span>
                             </>
                           )}
                         </button>

                         <div className="flex flex-col gap-6 pt-8 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] text-center font-mono">أو استخدم الوضع التجريبي للمراجعة //</p>
                            <button 
                              type="button"
                              onClick={async () => {
                                setLoading(true);
                                try {
                                  await signInAnonymously(auth);
                                  if (auth.currentUser) {
                                     await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                                       role: 'official',
                                       displayName: 'مسؤول مراجعة (عمران)',
                                       institutionName: 'وزارة البنى التحتية',
                                       points: 0,
                                       isAnonymous: true
                                     });
                                  }
                                  onClose();
                                } catch (err: any) {
                                  console.error(err);
                                  setError("فشل تفعيل الوضع التجريبي. يرجى مراجعة الاتصال.");
                                } finally {
                                   setLoading(false);
                                }
                              }}
                              className="w-full py-6 bg-slate-50 border-2 border-slate-100 rounded-[4rem] text-slate-400 font-black text-xs uppercase tracking-[0.4em] hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-[0.98] font-mono"
                            >
                              تفعيل وضع "المسؤول الحكومي" (للمراجعة التقنية)
                            </button>
                         </div>
                      </form>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
       </div>

       <div className="pt-12 mt-12 border-t border-slate-100 flex justify-between items-center relative z-10">
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2 font-mono">ENCRYPTION_LAYER // SUDAN_CORE_OS</p>
             <div className="flex gap-4">
                <p className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.5em] italic font-mono">TLS-1.3 SECURE</p>
                <div className="w-px h-4 bg-slate-100" />
                <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.5em] italic font-mono">P-256V1</p>
             </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-5 h-1.5 rounded-full bg-slate-100" />)}
          </div>
       </div>
    </div>
  );
}
