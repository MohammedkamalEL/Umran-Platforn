import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, X, Bot } from 'lucide-react';
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
      // Create a fresh instance right before connecting to ensure latest state/key
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      // Construct the session promise to avoid race conditions in callbacks
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
            
            // Resume context if suspended
            if (audioContext.state === 'suspended') {
              audioContext.resume();
            }

            // Setup microphone streaming
            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            
            microphoneRef.current = source;
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Convert Float32 to Int16 PCM
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }
              
              // Base64 conversion using a more robust method
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
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              playAudioResponse(base64Audio);
            }
            
            // Handle tool calls - be flexible with location
            const toolCall = message.toolCall || message.serverContent?.modelTurn?.parts?.find((p: any) => p.functionCall)?.functionCall;
            
            if (toolCall && onToolCall) {
              const functionCalls = toolCall.functionCalls || [toolCall]; // Handle single or multiple
              const functionResponses = [];
              
              for (const call of functionCalls) {
                try {
                  const result = await onToolCall(call);
                  functionResponses.push({
                    name: call.name,
                    response: result,
                    id: call.id
                  });
                } catch (toolErr) {
                  console.error(`Tool execution error for ${call.name}:`, toolErr);
                  functionResponses.push({
                    name: call.name,
                    response: { error: String(toolErr) },
                    id: call.id
                  });
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

  const stopPlayback = () => {
    // Simple stop logic: in a full implementation we'd track active sources
  };

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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-slate-50/95 backdrop-blur-3xl z-[800] flex flex-col items-center justify-center p-12 text-slate-900 text-right"
      dir="rtl"
    >
      <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none sudan-texture scale-125 rotate-12" />
      
      <button 
        onClick={onClose}
        className="absolute top-10 left-10 w-16 h-16 bg-white rounded-[2rem] hover:bg-slate-100 transition-all flex items-center justify-center border border-slate-200 shadow-xl active:scale-90 text-slate-400"
      >
        <X size={32} />
      </button>

      <div className="flex flex-col items-center gap-12 w-full max-w-2xl relative z-10">
        <div className="relative">
          <motion.div 
            animate={{ 
              scale: isListening ? [1, 1.4, 1] : 1,
              opacity: isListening ? [0.2, 0.4, 0.2] : 0.05
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -inset-20 bg-emerald-500 rounded-full blur-[100px]"
          />
          <div className="w-48 h-48 bg-white rounded-[3rem] flex items-center justify-center shadow-xl relative z-10 border-4 border-slate-100 overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <Bot size={96} className={cn("transition-all duration-700", isListening ? "text-emerald-600 scale-110 shadow-emerald-500/50" : "text-slate-300")} />
          </div>
          
          {isListening && (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="absolute -inset-4 border-4 border-dashed border-emerald-500/30 rounded-[3.5rem] pointer-events-none"
            />
          )}
        </div>

        <div className="space-y-4 text-center">
          <div className="flex items-center gap-3 justify-center mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-4xl font-black font-display tracking-tight uppercase text-slate-950">مساعد عمران الذكي</h2>
          </div>
          <p className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] font-mono opacity-80">AI_VOICE_CORE // SUDANESE_DIALECT_MODULE</p>
          <div className="max-w-md mx-auto">
            <p className="text-slate-500 text-lg font-medium leading-relaxed italic">"حبابك عشرة.. اتفضل معاي، أنا هنا عشان أسمعك وأساعدك في أي بلاغ يخص عمران وطنا."</p>
          </div>
        </div>

        {error ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-6 bg-rose-50 rounded-[2rem] border-2 border-rose-200 text-rose-600 text-sm font-black flex items-center gap-4"
          >
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            {error}
          </motion.div>
        ) : (
          <div className="h-16 flex items-center justify-center">
            {isConnecting ? (
              <div className="flex items-center gap-4 px-8 py-3 bg-white rounded-full border border-slate-100 shadow-sm">
                <Loader2 className="animate-spin text-emerald-500" size={20} />
                <span className="text-sm font-black uppercase tracking-widest font-mono text-slate-400">ESTABLISHING_SECURE_LINK...</span>
              </div>
            ) : isActive ? (
              <div className="flex items-center gap-6">
                {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((i, idx) => (
                  <motion.div 
                    key={idx}
                    animate={{ 
                      height: [12, 40, 20, 60, 12][idx % 5],
                      opacity: [0.3, 1, 0.5, 0.8, 0.3][idx % 5]
                    }}
                    transition={{ repeat: Infinity, duration: 1 + idx * 0.1 }}
                    className="w-1.5 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}

        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={isActive ? stopSession : startSession}
            className={cn(
              "w-28 h-28 rounded-[2.5rem] flex items-center justify-center shadow-xl transition-all duration-700 active:scale-90 border-4",
              isActive 
                ? "bg-rose-600 border-rose-500 hover:bg-rose-700 shadow-rose-900/10 text-white" 
                : "bg-emerald-600 border-emerald-500 hover:bg-emerald-700 shadow-emerald-900/10 text-white"
            )}
          >
            {isActive ? <MicOff size={44} strokeWidth={2.5} /> : <Mic size={44} strokeWidth={2.5} />}
          </button>
          
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] font-mono">
               {isActive ? "SESSION_ACTIVE // PRESS_TO_TERMINATE" : "SESSION_READY // PRESS_TO_INITIALIZE"}
             </p>
             <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
