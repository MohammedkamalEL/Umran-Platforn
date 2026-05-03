// import React, { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { MessageSquare, X, Send, User, Bot, Loader2, Mic, Square, Volume2, Headphones } from 'lucide-react';
// import { getSudaneseChatResponse, translateVoiceReport } from '../services/geminiService';
// import { cn } from '../lib/utils';
// import VoiceAssistant from './VoiceAssistant';

// interface Message {
//   role: 'user' | 'model';
//   content: string;
//   isVoice?: boolean;
// }

// export default function Chatbot({ extraContext, onNavigate }: { extraContext?: string; onNavigate?: (view: any) => void }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([
//     { role: 'model', content: 'حبابك يا زول! أنا مساعد عمران، ممكن أساعدك في شنو الليلة؟' }
//   ]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isVoiceMode, setIsVoiceMode] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const chunksRef = useRef<Blob[]>([]);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = recorder;
//       chunksRef.current = [];

//       recorder.ondataavailable = (e) => {
//         if (e.data.size > 0) chunksRef.current.push(e.data);
//       };

//       recorder.onstop = async () => {
//         const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
//         await handleVoiceMessage(audioBlob);
//         stream.getTracks().forEach(track => track.stop());
//       };

//       recorder.start();
//       setIsRecording(true);
//     } catch (err) {
//       console.error("Failed to start recording", err);
//       alert("لا يمكن الوصول للميكروفون. يرجى التأكد من الصلاحيات.");
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     }
//   };

//   const handleVoiceMessage = async (blob: Blob) => {
//     setIsLoading(true);
//     setMessages(prev => [...prev, { role: 'user', content: 'جاري معالجة التسجيل الصوتي...', isVoice: true }]);

//     const reader = new FileReader();
//     reader.readAsDataURL(blob);
//     reader.onloadend = async () => {
//       const base64Audio = (reader.result as string).split(',')[1];
//       const translation = await translateVoiceReport(base64Audio);

//       if (translation) {
//         // Replace the "processing" message with the translated text
//         setMessages(prev => {
//           const newMsgs = [...prev];
//           newMsgs[newMsgs.length - 1] = { role: 'user', content: translation, isVoice: true };
//           return newMsgs;
//         });

//         const history = messages.map(m => ({
//           role: m.role,
//           parts: [{ text: m.content }]
//         }));

//         const context = `${extraContext || ''} | The user just submitted a voice note which was translated.`;
//         const response = await getSudaneseChatResponse(translation, history, context);
//         setMessages(prev => [...prev, { role: 'model', content: response }]);
//       } else {
//         setMessages(prev => [...prev, { role: 'model', content: 'معليش يا زول، ما قدرت أفهم التسجيل. ممكن تجرب تاني؟' }]);
//       }
//       setIsLoading(false);
//     };
//   };

//   const handleSend = async () => {
//     if (!input.trim() || isLoading) return;

//     const userMsg = input.trim();
//     setInput('');
//     setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
//     setIsLoading(true);

//     const history = messages.map(m => ({
//       role: m.role,
//       parts: [{ text: m.content }]
//     }));

//     const context = `${extraContext || ''} | User is interacting in the main chat.`;
    
//     const response = await getSudaneseChatResponse(userMsg, history, context);
//     setMessages(prev => [...prev, { role: 'model', content: response }]);
//     setIsLoading(false);
//   };

//   const renderMessageContent = (content: string) => {
//     const navTagMatch = content.match(/\[GOTO:(DASHBOARD|REPORT|CAMPAIGNS|STATS|PROFILE)\]/);
//     const cleanContent = content.replace(/\[GOTO:(DASHBOARD|REPORT|CAMPAIGNS|STATS|PROFILE)\]/g, '').trim();

//     if (!navTagMatch || !onNavigate) return cleanContent;

//     const view = navTagMatch[1].toLowerCase();
//     const labelMapping: Record<string, string> = {
//       dashboard: 'انتقل للمخطط',
//       report: 'افتح بلاغ جديد',
//       campaigns: 'مشاهدة المبادرات',
//       stats: 'مركز الشفافية',
//       profile: 'ملفي الشخصي'
//     };

//     return (
//       <div className="space-y-4">
//         <p>{cleanContent}</p>
//         <button 
//           onClick={() => {
//             onNavigate(view as any);
//             setIsOpen(false);
//           }}
//           className="w-full py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-all active:scale-95 border border-white/20"
//         >
//           {labelMapping[view]}
//         </button>
//       </div>
//     );
//   };

//   return (
//     <>
//       {/* Floating Button */}
//       <button 
//         onClick={() => setIsOpen(true)}
//         // className="fixed bottom-32 lg:bottom-12 right-6 lg:right-12 w-16 h-16 bg-white text-slate-950 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[80] group overflow-hidden border border-slate-100"
//         className="fixed bottom-32 lg:bottom-12 left-6 lg:left-12 w-16 h-16 bg-white text-slate-950 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[80] group overflow-hidden border border-slate-100"
//       >
//         <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//         <MessageSquare size={26} className="relative z-10" />
//       </button>

//       {/* Chat Window */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div 
//             initial={{ opacity: 0, y: 100, scale: 0.9 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 100, scale: 0.9 }}
//             className="fixed inset-0 sm:inset-auto sm:bottom-32 sm:right-6 sm:w-[420px] sm:h-[650px] bg-white sm:rounded-[32px] shadow-2xl flex flex-col z-[100] overflow-hidden border border-slate-100"
//           >
//             {/* Header */}
//             <div className="p-5 bg-white border-b border-slate-100 text-slate-900 flex justify-between items-center relative overflow-hidden">
//               <div className="absolute inset-0 opacity-5 sudan-texture pointer-events-none" />
//               <div className="flex items-center gap-3 relative z-10">
//                 <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center border-2 border-white shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
//                   <Bot size={28} className="text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-black text-sm font-display tracking-tight">مساعد عمران الذكي</h3>
//                   <div className="flex items-center gap-1.5">
//                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
//                     <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.2em]">نشط الآن</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2 relative z-10">
//                 <button 
//                   onClick={() => setIsVoiceMode(true)}
//                   className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-emerald-600"
//                   title="المساعد الصوتي المتقدم"
//                 >
//                   <Headphones size={20} />
//                 </button>
//                 <button 
//                   onClick={() => setIsOpen(false)}
//                   className="p-3 hover:bg-slate-50 rounded-2xl transition-all border border-slate-100 shadow-sm active:scale-90 text-slate-400"
//                   aria-label="إغلاق المحادثة"
//                 >
//                   <X size={24} />
//                 </button>
//               </div>
//             </div>

//             {/* Voice Assistant Overlay (Full Screen Dialogue) */}
//             <AnimatePresence>
//               {isVoiceMode && (
//                 <VoiceAssistant onClose={() => setIsVoiceMode(false)} />
//               )}
//             </AnimatePresence>

//             {/* Messages */}
//             <div 
//               ref={scrollRef}
//               className="flex-1 p-5 overflow-y-auto bg-slate-50 space-y-6 relative"
//             >
//               <div className="absolute inset-0 opacity-[0.02] sudan-texture pointer-events-none" />
              
//               {messages.map((m, i) => (
//                 <motion.div 
//                   initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   key={i} 
//                   className={cn(
//                     "flex flex-col max-w-[85%] relative z-10",
//                     m.role === 'user' ? "mr-auto items-end" : "ml-auto items-start"
//                   )}
//                 >
//                   <div className={cn(
//                     "p-4 rounded-[24px] text-sm shadow-sm leading-relaxed",
//                     m.role === 'user' 
//                       ? "bg-emerald-600 text-white rounded-tr-none font-bold" 
//                       : "bg-white text-slate-700 border border-slate-100 rounded-tl-none font-medium shadow-md shadow-slate-100"
//                   )}>
//                     {m.isVoice && m.role === 'user' && (
//                       <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20 opacity-80">
//                          <Volume2 size={14} />
//                          <span className="text-[10px] font-black uppercase tracking-widest text-right">تقرير صوتي مترجم</span>
//                       </div>
//                     )}
//                     {renderMessageContent(m.content)}
//                   </div>
//                   <span className="text-[8px] font-black text-slate-300 mt-1 uppercase tracking-widest">
//                     {m.role === 'user' ? 'أنت' : 'مساعد عمران'}
//                   </span>
//                 </motion.div>
//               ))}
//               {isLoading && (
//                 <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest italic py-2">
//                   <div className="flex gap-1">
//                     <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
//                     <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
//                     <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
//                   </div>
//                   جاري التحليل...
//                 </div>
//               )}
//             </div>

//             {/* Input Bar */}
//             <div className="p-4 bg-white border-t border-slate-100">
//               <div className="flex items-center gap-3">
//                 <div className="flex-1 relative flex items-center">
//                    <button 
//                     onMouseDown={startRecording}
//                     onMouseUp={stopRecording}
//                     onTouchStart={startRecording}
//                     onTouchEnd={stopRecording}
//                     className={cn(
//                       "absolute left-2 p-2 rounded-full transition-all",
//                       isRecording ? "bg-red-500 text-white animate-pulse" : "text-slate-400 hover:text-emerald-600 hover:bg-slate-50"
//                     )}
//                     title="تحدث للإبلاغ"
//                   >
//                     {isRecording ? <Square size={16} /> : <Mic size={20} />}
//                   </button>
//                   <input 
//                     type="text" 
//                     dir="rtl"
//                     placeholder={isRecording ? "جاري التسجيل..." : "اسأل عن الإعمار أو ارسل بصمة..."}
//                     className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-[22px] text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//                     disabled={isRecording}
//                   />
//                 </div>
//                 <button 
//                   onClick={handleSend}
//                   disabled={!input.trim() || isLoading || isRecording}
//                   className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center disabled:opacity-50 transition-all active:scale-95 shadow-lg"
//                 >
//                   <Send size={20} />
//                 </button>
//               </div>
//               {isRecording && (
//                 <motion.p 
//                   initial={{ opacity: 0, y: 5 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="text-center text-[9px] font-black text-red-500 uppercase tracking-widest mt-2"
//                 >
//                   ارفع يدك عند الانتهاء من التسجيل
//                 </motion.p>
//               )}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }


import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, Loader2, Mic, Square, Volume2, Headphones } from 'lucide-react';
import { getSudaneseChatResponse, translateVoiceReport } from '../services/geminiService';
import { cn } from '../lib/utils';
import VoiceAssistant from './VoiceAssistant';

interface Message {
  role: 'user' | 'model';
  content: string;
  isVoice?: boolean;
}

export default function Chatbot({ extraContext, onNavigate }: { extraContext?: string; onNavigate?: (view: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'حبابك يا زول! أنا مساعد عمران، ممكن أساعدك في شنو الليلة؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
      alert("لا يمكن الوصول للميكروفون. يرجى التأكد من الصلاحيات.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceMessage = async (blob: Blob) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: 'جاري معالجة التسجيل الصوتي...', isVoice: true }]);
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64Audio = (reader.result as string).split(',')[1];
      const translation = await translateVoiceReport(base64Audio);
      if (translation) {
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'user', content: translation, isVoice: true };
          return newMsgs;
        });
        const history = messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }));
        const response = await getSudaneseChatResponse(translation, history, extraContext || '');
        setMessages(prev => [...prev, { role: 'model', content: response }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: 'معليش يا زول، ما قدرت أفهم التسجيل. ممكن تجرب تاني؟' }]);
      }
      setIsLoading(false);
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);
    const history = messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }));
    const response = await getSudaneseChatResponse(userMsg, history, extraContext || '');
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setIsLoading(false);
  };

  const renderMessageContent = (content: string) => {
    const navTagMatch = content.match(/\[GOTO:(DASHBOARD|REPORT|CAMPAIGNS|STATS|PROFILE)\]/);
    const cleanContent = content.replace(/\[GOTO:(DASHBOARD|REPORT|CAMPAIGNS|STATS|PROFILE)\]/g, '').trim();
    if (!navTagMatch || !onNavigate) return cleanContent;
    const view = navTagMatch[1].toLowerCase();
    const labelMapping: Record<string, string> = {
      dashboard: 'انتقل للمخطط', report: 'افتح بلاغ جديد',
      campaigns: 'مشاهدة المبادرات', stats: 'مركز الشفافية', profile: 'ملفي الشخصي'
    };
    return (
      <div className="space-y-3">
        <p>{cleanContent}</p>
        <button
          onClick={() => { onNavigate(view as any); setIsOpen(false); }}
          // className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-emerald-600 transition-all active:scale-95"
          className="fixed bottom-6 left-6 lg:bottom-12 lg:left-12 w-16 h-16 bg-white text-slate-950 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[80] group overflow-hidden border border-slate-100"
        >
          {labelMapping[view]}
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-40 lg:bottom-30 left-5 lg:left-10 w-14 h-14 bg-white text-slate-900 rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[80] border border-slate-100 hover:border-emerald-200"
        // className="fixed bottom-6 left-5 md:left-10 z-[80] w-16 h-16 bg-emerald-600 text-white rounded-2xl shadow-2xl shadow-emerald-500/40 border-2 border-emerald-400/40 flex items-center justify-center group overflow-hidden"
      >
        <MessageSquare size={22} />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-28 sm:left-5 lg:left-10 sm:w-[380px] sm:h-[580px] bg-white sm:rounded-2xl shadow-2xl flex flex-col z-[100] overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsVoiceMode(true)}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-emerald-600"
                >
                  <Headphones size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <h3 className="text-sm font-black text-slate-900">مساعد عمران</h3>
                  <div className="flex items-center gap-1.5 justify-end">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">نشط الآن</p>
                  </div>
                </div>
                <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
              </div>
            </div>

            {/* Voice Overlay */}
            <AnimatePresence>
              {isVoiceMode && <VoiceAssistant onClose={() => setIsVoiceMode(false)} />}
            </AnimatePresence>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    m.role === 'user' ? "mr-auto items-end" : "ml-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    m.role === 'user'
                      ? "bg-emerald-600 text-white rounded-tr-none font-semibold"
                      : "bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm"
                  )}>
                    {m.isVoice && m.role === 'user' && (
                      <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/20 opacity-70">
                        <Volume2 size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">تقرير صوتي</span>
                      </div>
                    )}
                    {renderMessageContent(m.content)}
                  </div>
                  <span className="text-[9px] text-slate-300 mt-1 font-bold uppercase tracking-wider">
                    {m.role === 'user' ? 'أنت' : 'عمران'}
                  </span>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold py-1">
                  <div className="flex gap-1">
                    {[0, 150, 300].map(delay => (
                      <div key={delay} className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                  جاري التحليل...
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0",
                    isRecording ? "bg-rose-500 text-white animate-pulse" : "bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-slate-100"
                  )}
                >
                  {isRecording ? <Square size={14} /> : <Mic size={16} />}
                </button>
                <input
                  type="text"
                  dir="rtl"
                  placeholder={isRecording ? "جاري التسجيل..." : "اسأل عن الإعمار..."}
                  className="flex-1 px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isRecording}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || isRecording}
                  className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 transition-all active:scale-95 shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
              {isRecording && (
                <p className="text-center text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-2">
                  ارفع يدك عند الانتهاء
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
