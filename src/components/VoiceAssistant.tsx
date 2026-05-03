// import React, { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { Mic, MicOff, Volume2, VolumeX, Loader2, X, Bot } from 'lucide-react';
// import { GoogleGenAI, Modality } from "@google/genai";
// import { cn } from '../lib/utils';

// const SUDANESE_VOICE_INSTRUCTIONS = `
// You are 'Umran Voice Assistant' (مساعد عمران الصوتي).
// Your personality:
// - Extremely warm, hospitable, and community-oriented Sudanese assistant.
// - Use a rich, expressive 'Sudanese Arabic Dialect' (اللهجة السودانية) that sounds natural and welcoming.
// - Use authentic Sudanese expressions generously: 'حبابك عشرة', 'يا زول يا طيب', 'يا بطل', 'تسلم كتير', 'أبشر بالخير', 'على الراس والعين'.
// - Maintain a patient and helpful tone, reflecting the Sudanese values of "Karam" (hospitality) and "Fazza" (communal aid).
// - Help users report infrastructure problems (Water, Roads, Electricity, Waste) via voice tools.
// - Keep responses relatively concise but emotionally resonant—make the user feel heard and appreciated.
// - Reassure users that their contribution is a vital step in rebuilding our neighborhoods.
// `;

// export default function VoiceAssistant({ 
//   onClose, 
//   context, 
//   tools, 
//   onToolCall 
// }: { 
//   onClose: () => void; 
//   context?: string; 
//   tools?: any[]; 
//   onToolCall?: (call: any) => Promise<any>;
// }) {
//   const [isActive, setIsActive] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const sessionRef = useRef<any>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const processorRef = useRef<ScriptProcessorNode | null>(null);
//   const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//   const startSession = async () => {
//     setIsConnecting(true);
//     setError(null);

//     try {
//       // Create a fresh instance right before connecting to ensure latest state/key
//       const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       streamRef.current = stream;

//       const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
//       audioContextRef.current = audioContext;

//       // Construct the session promise to avoid race conditions in callbacks
//       const sessionPromise = ai.live.connect({
//         model: "gemini-3.1-flash-live-preview",
//         config: {
//           responseModalities: [Modality.AUDIO],
//           speechConfig: {
//             voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
//           },
//           systemInstruction: SUDANESE_VOICE_INSTRUCTIONS + (context ? `\n\nContext for this session: ${context}` : ""),
//           tools: tools ? [{ functionDeclarations: tools }] : [],
//           inputAudioTranscription: {},
//           outputAudioTranscription: {},
//         },
//         callbacks: {
//           onopen: () => {
//             setIsConnecting(false);
//             setIsActive(true);
//             setIsListening(true);
            
//             // Resume context if suspended
//             if (audioContext.state === 'suspended') {
//               audioContext.resume();
//             }

//             // Setup microphone streaming
//             const source = audioContext.createMediaStreamSource(stream);
//             const processor = audioContext.createScriptProcessor(4096, 1, 1);
            
//             microphoneRef.current = source;
//             processorRef.current = processor;

//             processor.onaudioprocess = (e) => {
//               const inputData = e.inputBuffer.getChannelData(0);
//               // Convert Float32 to Int16 PCM
//               const pcmData = new Int16Array(inputData.length);
//               for (let i = 0; i < inputData.length; i++) {
//                 pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
//               }
              
//               // Base64 conversion using a more robust method
//               const bytes = new Uint8Array(pcmData.buffer);
//               let binary = '';
//               for (let i = 0; i < bytes.byteLength; i++) {
//                 binary += String.fromCharCode(bytes[i]);
//               }
//               const base64Data = btoa(binary);
              
//               sessionPromise.then(session => {
//                 session.sendRealtimeInput({
//                   audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
//                 });
//               });
//             };

//             source.connect(processor);
//             processor.connect(audioContext.destination);
//           },
//           onmessage: async (message: any) => {
//             // Handle audio output
//             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
//             if (base64Audio) {
//               playAudioResponse(base64Audio);
//             }
            
//             // Handle tool calls - be flexible with location
//             const toolCall = message.toolCall || message.serverContent?.modelTurn?.parts?.find((p: any) => p.functionCall)?.functionCall;
            
//             if (toolCall && onToolCall) {
//               const functionCalls = toolCall.functionCalls || [toolCall]; // Handle single or multiple
//               const functionResponses = [];
              
//               for (const call of functionCalls) {
//                 try {
//                   const result = await onToolCall(call);
//                   functionResponses.push({
//                     name: call.name,
//                     response: result,
//                     id: call.id
//                   });
//                 } catch (toolErr) {
//                   console.error(`Tool execution error for ${call.name}:`, toolErr);
//                   functionResponses.push({
//                     name: call.name,
//                     response: { error: String(toolErr) },
//                     id: call.id
//                   });
//                 }
//               }
              
//               sessionPromise.then(session => {
//                 session.sendToolResponse({ functionResponses });
//               });
//             }

//             if (message.serverContent?.interrupted) {
//               stopPlayback();
//             }
//           },
//           onerror: (err: any) => {
//             console.error("Live API Error Detail:", err);
//             setError(`خطأ في الاتصال: ${err.message || 'مشكلة في الخادم'}`);
//             stopSession();
//           },
//           onclose: () => {
//              setIsActive(false);
//              setIsListening(false);
//           }
//         }
//       });

//       sessionRef.current = await sessionPromise;
//     } catch (err) {
//       console.error("Mic access error:", err);
//       setError("لا يمكن الوصول للميكروفون. تأكد من الأذونات.");
//       setIsConnecting(false);
//     }
//   };

//   const playAudioResponse = (base64Data: string) => {
//     if (!audioContextRef.current) return;
    
//     const binary = atob(base64Data);
//     const bytes = new Uint8Array(binary.length);
//     for (let i = 0; i < binary.length; i++) {
//       bytes[i] = binary.charCodeAt(i);
//     }
    
//     const pcmData = new Int16Array(bytes.buffer);
//     const floatData = new Float32Array(pcmData.length);
//     for (let i = 0; i < pcmData.length; i++) {
//       floatData[i] = pcmData[i] / 0x7FFF;
//     }

//     const buffer = audioContextRef.current.createBuffer(1, floatData.length, 16000);
//     buffer.getChannelData(0).set(floatData);

//     const source = audioContextRef.current.createBufferSource();
//     source.buffer = buffer;
//     source.connect(audioContextRef.current.destination);
//     source.start();
//   };

//   const stopPlayback = () => {
//     // Simple stop logic: in a full implementation we'd track active sources
//   };

//   const stopSession = () => {
//     if (sessionRef.current) {
//       sessionRef.current.close();
//       sessionRef.current = null;
//     }
    
//     if (processorRef.current) {
//       processorRef.current.disconnect();
//       processorRef.current = null;
//     }
    
//     if (microphoneRef.current) {
//       microphoneRef.current.disconnect();
//       microphoneRef.current = null;
//     }
    
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//       streamRef.current = null;
//     }

//     if (audioContextRef.current) {
//       audioContextRef.current.close();
//       audioContextRef.current = null;
//     }

//     setIsActive(false);
//     setIsListening(false);
//   };

//   useEffect(() => {
//     return () => stopSession();
//   }, []);

//   return (
//     <motion.div 
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="absolute inset-0 bg-slate-50/95 backdrop-blur-3xl z-[800] flex flex-col items-center justify-center p-12 text-slate-900 text-right"
//       dir="rtl"
//     >
//       <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none sudan-texture scale-125 rotate-12" />
      
//       <button 
//         onClick={onClose}
//         className="absolute top-10 left-10 w-16 h-16 bg-white rounded-[2rem] hover:bg-slate-100 transition-all flex items-center justify-center border border-slate-200 shadow-xl active:scale-90 text-slate-400"
//       >
//         <X size={32} />
//       </button>

//       <div className="flex flex-col items-center gap-12 w-full max-w-2xl relative z-10">
//         <div className="relative">
//           <motion.div 
//             animate={{ 
//               scale: isListening ? [1, 1.4, 1] : 1,
//               opacity: isListening ? [0.2, 0.4, 0.2] : 0.05
//             }}
//             transition={{ repeat: Infinity, duration: 3 }}
//             className="absolute -inset-20 bg-emerald-500 rounded-full blur-[100px]"
//           />
//           <div className="w-48 h-48 bg-white rounded-[3rem] flex items-center justify-center shadow-xl relative z-10 border-4 border-slate-100 overflow-hidden group">
//              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
//              <Bot size={96} className={cn("transition-all duration-700", isListening ? "text-emerald-600 scale-110 shadow-emerald-500/50" : "text-slate-300")} />
//           </div>
          
//           {isListening && (
//             <motion.div 
//               animate={{ rotate: 360 }}
//               transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
//               className="absolute -inset-4 border-4 border-dashed border-emerald-500/30 rounded-[3.5rem] pointer-events-none"
//             />
//           )}
//         </div>

//         <div className="space-y-4 text-center">
//           <div className="flex items-center gap-3 justify-center mb-2">
//             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//             <h2 className="text-4xl font-black font-display tracking-tight uppercase text-slate-950">مساعد عمران الذكي</h2>
//           </div>
//           <p className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] font-mono opacity-80">AI_VOICE_CORE // SUDANESE_DIALECT_MODULE</p>
//           <div className="max-w-md mx-auto">
//             <p className="text-slate-500 text-lg font-medium leading-relaxed italic">"حبابك عشرة.. اتفضل معاي، أنا هنا عشان أسمعك وأساعدك في أي بلاغ يخص عمران وطنا."</p>
//           </div>
//         </div>

//         {error ? (
//           <motion.div 
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             className="p-6 bg-rose-50 rounded-[2rem] border-2 border-rose-200 text-rose-600 text-sm font-black flex items-center gap-4"
//           >
//             <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
//             {error}
//           </motion.div>
//         ) : (
//           <div className="h-16 flex items-center justify-center">
//             {isConnecting ? (
//               <div className="flex items-center gap-4 px-8 py-3 bg-white rounded-full border border-slate-100 shadow-sm">
//                 <Loader2 className="animate-spin text-emerald-500" size={20} />
//                 <span className="text-sm font-black uppercase tracking-widest font-mono text-slate-400">ESTABLISHING_SECURE_LINK...</span>
//               </div>
//             ) : isActive ? (
//               <div className="flex items-center gap-6">
//                 {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((i, idx) => (
//                   <motion.div 
//                     key={idx}
//                     animate={{ 
//                       height: [12, 40, 20, 60, 12][idx % 5],
//                       opacity: [0.3, 1, 0.5, 0.8, 0.3][idx % 5]
//                     }}
//                     transition={{ repeat: Infinity, duration: 1 + idx * 0.1 }}
//                     className="w-1.5 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
//                   />
//                 ))}
//               </div>
//             ) : null}
//           </div>
//         )}

//         <div className="flex flex-col items-center gap-6">
//           <button 
//             onClick={isActive ? stopSession : startSession}
//             className={cn(
//               "w-28 h-28 rounded-[2.5rem] flex items-center justify-center shadow-xl transition-all duration-700 active:scale-90 border-4",
//               isActive 
//                 ? "bg-rose-600 border-rose-500 hover:bg-rose-700 shadow-rose-900/10 text-white" 
//                 : "bg-emerald-600 border-emerald-500 hover:bg-emerald-700 shadow-emerald-900/10 text-white"
//             )}
//           >
//             {isActive ? <MicOff size={44} strokeWidth={2.5} /> : <Mic size={44} strokeWidth={2.5} />}
//           </button>
          
//           <div className="flex items-center gap-3">
//              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
//              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] font-mono">
//                {isActive ? "SESSION_ACTIVE // PRESS_TO_TERMINATE" : "SESSION_READY // PRESS_TO_INITIALIZE"}
//              </p>
//              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Loader2, X, Bot, Radio, Waves } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { cn } from '../lib/utils';

const SUDANESE_VOICE_INSTRUCTIONS = `
You are 'Umran Voice Assistant' (مساعد عمران الصوتي).
Your personality:
- Extremely warm, hospitable, and community-oriented Sudanese assistant.
- Use a rich, expressive 'Sudanese Arabic Dialect' (اللهجة السودانية) that sounds natural and welcoming.
- Use authentic Sudanese expressions generously: 'حبابك عشرة', 'يا زول يا طيب', 'يا بطل', 'تسلم كتير', 'أبشر بالخير', 'على الراس والعين'.
- Maintain a patient and helpful tone, reflecting the Sudanese values of "Karam" (hospitality) and "Fazza" (communal aid).
- Help users report infrastructure problems (Water, Roads, Electricity, Waste) via voice tools.
- Keep responses relatively concise but emotionally resonant—make the user feel heard and appreciated.
- Reassure users that their contribution is a vital step in rebuilding our neighborhoods.
`;

export default function VoiceAssistant({
  onClose,
  context,
  tools,
  onToolCall
}: {
  onClose: () => void;
  context?: string;
  tools?: any[];
  onToolCall?: (call: any) => Promise<any>;
}) {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
          },
          systemInstruction: SUDANESE_VOICE_INSTRUCTIONS + (context ? `\n\nContext for this session: ${context}` : ""),
          tools: tools ? [{ functionDeclarations: tools }] : [],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            setIsListening(true);

            if (audioContext.state === 'suspended') {
              audioContext.resume();
            }

            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);

            microphoneRef.current = source;
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }

              const bytes = new Uint8Array(pcmData.buffer);
              let binary = '';
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const base64Data = btoa(binary);

              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };

            source.connect(processor);
            processor.connect(audioContext.destination);
          },
          onmessage: async (message: any) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              playAudioResponse(base64Audio);
            }

            const toolCall = message.toolCall || message.serverContent?.modelTurn?.parts?.find((p: any) => p.functionCall)?.functionCall;

            if (toolCall && onToolCall) {
              const functionCalls = toolCall.functionCalls || [toolCall];
              const functionResponses = [];

              for (const call of functionCalls) {
                try {
                  const result = await onToolCall(call);
                  functionResponses.push({ name: call.name, response: result, id: call.id });
                } catch (toolErr) {
                  console.error(`Tool execution error for ${call.name}:`, toolErr);
                  functionResponses.push({ name: call.name, response: { error: String(toolErr) }, id: call.id });
                }
              }

              sessionPromise.then(session => {
                session.sendToolResponse({ functionResponses });
              });
            }

            if (message.serverContent?.interrupted) {
              stopPlayback();
            }
          },
          onerror: (err: any) => {
            console.error("Live API Error Detail:", err);
            setError(`خطأ في الاتصال: ${err.message || 'مشكلة في الخادم'}`);
            stopSession();
          },
          onclose: () => {
            setIsActive(false);
            setIsListening(false);
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Mic access error:", err);
      setError("لا يمكن الوصول للميكروفون. تأكد من الأذونات.");
      setIsConnecting(false);
    }
  };

  const playAudioResponse = (base64Data: string) => {
    if (!audioContextRef.current) return;

    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const pcmData = new Int16Array(bytes.buffer);
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }

    const buffer = audioContextRef.current.createBuffer(1, floatData.length, 16000);
    buffer.getChannelData(0).set(floatData);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  const stopPlayback = () => {};

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsActive(false);
    setIsListening(false);
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  const bars = [3, 5, 8, 6, 4, 7, 5, 3, 6, 4, 8, 5];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[800] flex flex-col items-center justify-center"
      dir="rtl"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
      <div className="absolute inset-0 opacity-[0.04] sudan-pattern-modern" />

      {/* Animated glow orbs */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 sm:top-10 sm:left-10 w-12 h-12 sm:w-14 sm:h-14 bg-white/8 hover:bg-white/15 border border-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90 backdrop-blur-sm z-10"
      >
        <X size={22} />
      </button>

      {/* Status badge - top right */}
      <div className="absolute top-6 right-6 sm:top-10 sm:right-10 z-10">
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-wider font-mono backdrop-blur-sm transition-all",
          isActive
            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
            : "bg-white/5 border-white/10 text-slate-500"
        )}>
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
          )} />
          {isActive ? "متصل" : "غير نشط"}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 sm:gap-12 px-6 w-full max-w-sm sm:max-w-lg text-center">

        {/* Bot icon with rings */}
        <div className="relative flex items-center justify-center">
          {/* Outer ring */}
          {isListening && (
            <>
              <motion.div
                animate={{ scale: [1, 1.6], opacity: [0.15, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
                className="absolute w-48 h-48 sm:w-56 sm:h-56 bg-emerald-500 rounded-full pointer-events-none"
              />
              <motion.div
                animate={{ scale: [1, 1.35], opacity: [0.2, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, delay: 0.5, ease: "easeOut" }}
                className="absolute w-48 h-48 sm:w-56 sm:h-56 bg-emerald-500 rounded-full pointer-events-none"
              />
            </>
          )}

          {/* Avatar */}
          <motion.div
            animate={isListening ? { scale: [1, 1.03, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className={cn(
              "w-36 h-36 sm:w-44 sm:h-44 rounded-[2.5rem] flex items-center justify-center relative z-10 border-2 transition-all duration-700",
              isActive
                ? "bg-emerald-600 border-emerald-400/40 shadow-[0_0_60px_rgba(16,185,129,0.3)]"
                : "bg-white/8 border-white/10"
            )}
          >
            <Bot
              size={64}
              className={cn("transition-all duration-500", isActive ? "text-white" : "text-slate-600")}
            />
          </motion.div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            مساعد عمران الذكي
          </h2>
          <p className="text-[11px] font-black text-emerald-500/70 uppercase tracking-[0.4em] font-mono">
            AI_VOICE_CORE · SUDANESE_DIALECT
          </p>
          {!isActive && !isConnecting && !error && (
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed pt-2 max-w-xs mx-auto">
              "حبابك عشرة.. اتفضل معاي، أنا هنا عشان أسمعك وأساعدك في أي بلاغ."
            </p>
          )}
        </div>

        {/* State display */}
        <div className="h-14 flex items-center justify-center w-full">
          {error ? (
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-3 px-5 py-3 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-400 text-sm font-bold"
            >
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
              {error}
            </motion.div>
          ) : isConnecting ? (
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
              <Loader2 className="animate-spin text-emerald-400 shrink-0" size={18} />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
                جاري الاتصال...
              </span>
            </div>
          ) : isActive ? (
            <div className="flex items-end gap-1 h-10">
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [h * 2, h * 5, h * 2] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8 + i * 0.07,
                    delay: i * 0.05,
                    ease: "easeInOut"
                  }}
                  className="w-1 sm:w-1.5 bg-emerald-400 rounded-full"
                  style={{ height: h * 2 }}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Main button */}
        <div className="flex flex-col items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.05 }}
            onClick={isActive ? stopSession : startSession}
            className={cn(
              "w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] flex items-center justify-center transition-all duration-500 border-2 shadow-2xl",
              isActive
                ? "bg-rose-600 border-rose-400/40 text-white shadow-rose-900/30 hover:bg-rose-700"
                : "bg-emerald-600 border-emerald-400/40 text-white shadow-emerald-900/30 hover:bg-emerald-700"
            )}
          >
            {isActive
              ? <MicOff size={40} strokeWidth={2} />
              : <Mic size={40} strokeWidth={2} />
            }
          </motion.button>

          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-mono">
            {isActive ? "اضغط لإيقاف الجلسة" : "اضغط لبدء الجلسة"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}