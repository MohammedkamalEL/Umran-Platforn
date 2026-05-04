// import React, { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { Camera, Mic, MapPin, Send, ArrowRight, Loader2, Check, Droplets, Zap, Trash2, X, Sparkles, ScanSearch, HelpCircle, ShieldCheck, MessageSquare, Phone, Map as MapIcon, Locate, WifiOff, AlertTriangle } from 'lucide-react';
// import { collection, addDoc, serverTimestamp, setDoc, doc, increment } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, auth, storage } from '../lib/firebase';
// import { cn } from '../lib/utils';
// import { GoogleGenAI } from "@google/genai";
// import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// // Fix Leaflet default icon issues in React
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// const DefaultIcon = L.icon({
//   iconUrl: markerIcon,
//   iconRetinaUrl: markerIconRetina,
//   shadowUrl: markerShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41]
// });
// L.Marker.prototype.options.icon = DefaultIcon;

// const STEPS = [
//   { id: 1, title: 'الوسائط' },
//   { id: 2, title: 'التفاصيل' },
//   { id: 3, title: 'المراجعة' },
// ];

// const CATEGORIES = [
//   { id: 'road', label: 'طرق', icon: <MapPin size={24} />, color: 'bg-emerald-50 text-emerald-600' },
//   { id: 'water', label: 'مياه', icon: <Droplets size={24} />, color: 'bg-blue-50 text-blue-600' },
//   { id: 'electricity', label: 'كهرباء', icon: <Zap size={24} />, color: 'bg-amber-50 text-amber-600' },
//   { id: 'waste', label: 'نفايات', icon: <Trash2 size={24} />, color: 'bg-rose-50 text-rose-600' },
//   { id: 'other', label: 'عام / أخرى', icon: <HelpCircle size={24} />, color: 'bg-slate-50 text-slate-600' },
// ];

// export default function IssueReport({ onComplete }: { onComplete: () => void }) {
//   const [step, setStep] = useState(1);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const recordingTimerRef = useRef<any>(null);
//   const [issueType, setIssueType] = useState('');
//   const [interactionType, setInteractionType] = useState<'report' | 'suggestion' | 'inquiry'>('report');
//   const [description, setDescription] = useState('');
//   const [manualAddress, setManualAddress] = useState('الرياض، الخرطوم');
//   const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({ lat: 15.5007, lng: 32.5599 });
//   const [addressLoading, setAddressLoading] = useState(false);
//   const [severity, setSeverity] = useState<1 | 2 | 3>(2);
//   const [damageType, setDamageType] = useState('');
//   const [notes, setNotes] = useState('');
//   const [attachedImages, setAttachedImages] = useState<string[]>([]);
//   const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [showOfflineOptions, setShowOfflineOptions] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [trackingId] = useState(() => {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let result = 'BN-';
//     for (let i = 0; i < 6; i++) {
//       result += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return result;
//   });
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   const [isTranscribing, setIsTranscribing] = useState(false);
//   const transcriptionRecorderRef = useRef<MediaRecorder | null>(null);
//   const transcriptionChunksRef = useRef<Blob[]>([]);

//   const startTranscriptionRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream);
//       transcriptionRecorderRef.current = mediaRecorder;
//       transcriptionChunksRef.current = [];

//       mediaRecorder.ondataavailable = (e) => {
//         if (e.data.size > 0) {
//           transcriptionChunksRef.current.push(e.data);
//         }
//       };

//       mediaRecorder.onstop = async () => {
//         const blob = new Blob(transcriptionChunksRef.current, { type: 'audio/webm' });
//         await transcribeAudio(blob);
//         stream.getTracks().forEach(track => track.stop());
//       };

//       mediaRecorder.start();
//       setIsTranscribing(true);
//     } catch (err) {
//       console.error("Microphone access denied for transcription:", err);
//     }
//   };

//   const stopTranscriptionRecording = () => {
//     if (transcriptionRecorderRef.current && transcriptionRecorderRef.current.state === 'recording') {
//       transcriptionRecorderRef.current.stop();
//       setIsTranscribing(false);
//     }
//   };

//   const transcribeAudio = async (blob: Blob) => {
//     setIsTranscribing(true);
//     try {
//       const reader = new FileReader();
//       reader.readAsDataURL(blob);
//       reader.onloadend = async () => {
//         const base64Audio = (reader.result as string).split(',')[1];
        
//         try {
//           const response = await ai.models.generateContent({
//             model: "gemini-3-flash-preview",
//             contents: [
//               {
//                 parts: [
//                   { text: "Transcribe this audio recording of a Sudanese citizen describing an infrastructure issue. The user is likely speaking in Sudanese Arabic (Ammiya). Provide ONLY the transcription text, nothing else. Focus on accuracy of the technical details mentioned. If the audio is unclear, return an empty string." },
//                   {
//                     inlineData: {
//                       mimeType: "audio/webm",
//                       data: base64Audio
//                     }
//                   }
//                 ]
//               }
//             ]
//           });
          
//           const text = response.text || "";
//           if (text && text.trim().length > 0) {
//             setDescription(prev => prev ? `${prev} ${text.trim()}`.trim() : text.trim());
//           }
//         } catch (genError) {
//           console.error("Gemini Transcription API error:", genError);
//         } finally {
//           setIsTranscribing(false);
//         }
//       };
//     } catch (error) {
//       console.error("Transcription process error:", error);
//       setIsTranscribing(false);
//     }
//   };

//   const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

//   const sendViaSMS = () => {
//     const message = `Type: ${issueType || 'other'} Desc: ${description} Loc: ${manualAddress}`;
//     const encodedMessage = encodeURIComponent(message);
//     window.location.href = `sms:7722?body=${encodedMessage}`;
//   };

//   const reverseGeocode = async (lat: number, lng: number) => {
//     setAddressLoading(true);
//     try {
//       const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar,en&addressdetails=1`);
//       const data = await response.json();
//       if (data && data.display_name) {
//         // Clean up the address a bit for the UI - take the most relevant parts
//         const addr = data.address;
//         const shortAddress = [
//           addr.road || addr.pedestrian || addr.suburb || '',
//           addr.neighbourhood || addr.city_district || '',
//           addr.city || addr.town || addr.village || '',
//         ].filter(Boolean).join('، ') || data.display_name;
        
//         setManualAddress(shortAddress);
//       }
//     } catch (error) {
//       console.error("Geocoding error:", error);
//     } finally {
//       setAddressLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (currentCoords) {
//       reverseGeocode(currentCoords.lat, currentCoords.lng);
//     }
//   }, []);

//   function MapController({ coords }: { coords: { lat: number, lng: number } | null }) {
//     const map = useMap();
    
//     useEffect(() => {
//       if (coords) {
//         map.flyTo([coords.lat, coords.lng], map.getZoom(), {
//           duration: 1.5,
//           easeLinearity: 0.25
//         });
//       }
//     }, [coords, map]);

//     return null;
//   }

//   function MapEvents() {
//     useMapEvents({
//       click(e) {
//         const newCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
//         setCurrentCoords(newCoords);
//         reverseGeocode(newCoords.lat, newCoords.lng);
//       },
//     });
    
//     return null;
//   }

//   const analyzeImage = async (base64Data: string) => {
//     setIsAnalyzing(true);
//     try {
//       const response = await ai.models.generateContent({
//         model: "gemini-3.1-pro-preview",
//         contents: [
//           {
//             parts: [
//               { text: "Analyze this image of a Sudanese infrastructure problem. Determine the issue type (road, water, electricity, waste, or other) and provide a concise description in Sudanese Arabic (Ammiya). Also, assess the visual cues to determine a potential severity level for this issue (1 for normal/low concern, 2 for significant/important, 3 for urgent/dangerous). Return the result strictly in JSON format with keys 'type', 'description', and 'severity' (integer 1-3)." },
//               { inlineData: { mimeType: "image/jpeg", data: base64Data.split(',')[1] } }
//             ]
//           }
//         ],
//         config: {
//           responseMimeType: "application/json"
//         }
//       });
      
//       const result = JSON.parse(response.text || '{}');
//       if (result.type) setIssueType(result.type);
//       if (result.description) setDescription(result.description);
//       if (result.severity && [1, 2, 3].includes(result.severity)) setSeverity(result.severity as any);
//     } catch (error) {
//       console.error("Gemini analysis failed:", error);
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const handleImageUpload = (img: string) => {
//     setAttachedImages(prev => [...prev, img]);
//     if (attachedImages.length === 0) {
//       analyzeImage(img);
//     }
//   };

//   const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;

//     Array.from(files).forEach((file: File) => {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         const base64 = event.target?.result as string;
//         handleImageUpload(base64);
//       };
//       reader.readAsDataURL(file);
//     });
//     if (fileInputRef.current) fileInputRef.current.value = '';
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = mediaRecorder;
//       audioChunksRef.current = [];

//       mediaRecorder.ondataavailable = (e) => {
//         if (e.data.size > 0) {
//           audioChunksRef.current.push(e.data);
//         }
//       };

//       mediaRecorder.onstop = () => {
//         const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
//         setAudioBlob(blob);
//         stream.getTracks().forEach(track => track.stop());
//       };

//       mediaRecorder.start();
//       setIsRecording(true);
//       setRecordingDuration(0);
//       recordingTimerRef.current = setInterval(() => {
//         setRecordingDuration(prev => prev + 1);
//       }, 1000);
//     } catch (err) {
//       console.error("Microphone access denied:", err);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//       if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
//     }
//   };

//   const toggleRecording = () => {
//     if (isRecording) {
//       stopRecording();
//     } else {
//       startRecording();
//     }
//   };

//   const formatDuration = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const handleSubmit = async () => {
//     if (!auth.currentUser) return;
//     setIsSubmitting(true);

//     try {
//       setUploadProgress(10);
      
//       let audioUrl = '';
//       if (audioBlob) {
//         const audioRef = ref(storage, `audio/${auth.currentUser.uid}_${Date.now()}.webm`);
//         await uploadBytes(audioRef, audioBlob);
//         audioUrl = await getDownloadURL(audioRef);
//         setUploadProgress(30);
//       }

//       const location = {
//         lat: currentCoords?.lat || (15.5007 + (Math.random() - 0.5) * 0.1),
//         lng: currentCoords?.lng || (32.5599 + (Math.random() - 0.5) * 0.1),
//         address: manualAddress || "الرياض، الخرطوم"
//       };

//       const docData = {
//         trackingId,
//         type: issueType.toLowerCase() || 'other',
//         interactionType,
//         description,
//         notes,
//         location,
//         severity,
//         mediaUrls: attachedImages,
//         voiceUrl: audioUrl,
//         status: 'pending',
//         currentStage: 'detected',
//         reportCount: 1,
//         anonymous: true,
//         reporterId: auth.currentUser.uid,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//         regionId: 'khartoum',
//         citizenSignOff: false,
//         reportedByCitizen: true
//       };

//       const docRef = await addDoc(collection(db, 'issues'), docData);
//       setUploadProgress(100);

//       const userRef = doc(db, 'users', auth.currentUser.uid);
//       await setDoc(userRef, { 
//         points: increment(100),
//         uid: auth.currentUser.uid,
//         updatedAt: serverTimestamp()
//       }, { merge: true });

//       await addDoc(collection(db, 'issues', docRef.id, 'movements'), {
//         status: 'رصد البلاغ',
//         description: `تم استلام البلاغ في النظام وتوليد رقم المتابعة: ${trackingId}.`,
//         institutionName: 'عمران | مركز التحكم الرقمي',
//         timestamp: serverTimestamp(),
//         stage: 'detected'
//       });

//       onComplete();
//     } catch (error) {
//       console.error("Error submitting issue:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const nextStep = () => {
//     const stepErrors: Record<string, string> = {};
    
//     if (step === 1) {
//       if (attachedImages.length === 0 && !audioBlob) {
//         stepErrors.media = 'يرجى إرفاق صورة واحدة أو تسجيل إفادة صوتية لتوثيق البلاغ.';
//       }
//       if (!manualAddress || manualAddress.trim() === '' || manualAddress === 'جاري التحديد...') {
//         stepErrors.location = 'يرجى تحديد موقع البلاغ بدقة على الخريطة.';
//       }
//     } else if (step === 2) {
//       if (!issueType) {
//         stepErrors.issueType = 'يرجى اختيار نوع المشكلة.';
//       }
//       if (!description || description.trim().length < 10) {
//         stepErrors.description = 'يرجى إدخال وصف تفصيلي لا يقل عن ١٠ أحرف.';
//       }
//     }

//     if (Object.keys(stepErrors).length > 0) {
//       setErrors(stepErrors);
//       const container = document.querySelector('.flex-1.overflow-y-auto');
//       if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
//       return;
//     }

//     setErrors({});
//     setStep(s => Math.min(s + 1, 3));
//   };

//   const prevStep = () => {
//     setErrors({});
//     setStep(s => Math.max(s - 1, 1));
//   };

//   return (
//     <div className="p-4 sm:p-8 md:p-10 lg:p-20 h-full flex flex-col bg-slate-50/50 overflow-hidden relative" dir="rtl">
//        <div className="absolute inset-0 opacity-[0.03] pointer-events-none sudan-texture scale-150 rotate-12" />

//       {/* Progress */}
//       <div className="flex justify-between mb-8 sm:mb-12 md:mb-20 relative px-4 sm:px-12 lg:px-24 z-10">
//         <div className="absolute top-5 sm:top-7 left-12 sm:left-24 right-12 sm:right-24 h-[2px] bg-slate-200/50 -z-10 overflow-hidden rounded-full font-mono">
//           <motion.div 
//             initial={false}
//             animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
//             className="h-full sudan-gradient shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-1000 shimmer"
//           />
//         </div>

//         {STEPS.map((s) => (
//           <div key={s.id} className="flex flex-col items-center gap-2 sm:gap-5 relative z-10">
//             <motion.div 
//               animate={{ 
//                 scale: step === s.id ? 1.2 : step > s.id ? 1 : 0.85,
//                 backgroundColor: step === s.id ? '#1e293b' : step > s.id ? '#059669' : '#ffffff',
//                 color: step === s.id ? '#ffffff' : step > s.id ? '#ffffff' : '#94a3b8',
//                 borderColor: step === s.id ? '#1e293b' : step > s.id ? '#059669' : '#f1f5f9'
//               }}
//               className="w-10 h-10 sm:w-14 sm:h-14 rounded-[1.2rem] sm:rounded-[1.8rem] flex items-center justify-center text-[10px] sm:text-[11px] font-black shadow-[0_15px_30px_rgba(0,0,0,0.05)] border-2 transition-all duration-700"
//             >
//               {step > s.id ? <Check size={18} strokeWidth={4} /> : <span className="font-mono text-xs">{s.id}</span>}
//             </motion.div>
//             <div className="text-center">
//                <span className={cn(
//                  "text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.5em] block mb-0.5 transition-all duration-700 font-mono",
//                  step === s.id ? "holographic-text scale-105" : step > s.id ? "text-emerald-600" : "text-slate-300"
//                )}>{s.title}</span>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="flex-1 overflow-y-auto no-scrollbar px-2 relative z-10">
//         <AnimatePresence mode="wait">
//           {showOfflineOptions ? (
//             <motion.div
//               key="offline"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               className="space-y-12 py-10"
//             >
//               <div className="space-y-5 text-right">
//                 <div className="flex items-center gap-3 justify-end mb-2">
//                    <div className="w-12 h-[1px] bg-amber-500/30" />
//                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.6em] font-mono italic">قناة الطوارئ // وضع عدم الاتصال</span>
//                 </div>
//                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-950 leading-none font-display">الإرسال عبر SMS / USSD</h2>
//                 <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-xl mr-auto ml-0 lg:mr-0">في حال ضعف الاتصال، يمكنك استخدام القنصل الرقمي للاتصالات السودانية لإرسال بلاغك مجاناً.</p>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
//                 <div className="umran-card p-12 space-y-8 text-right relative overflow-hidden group">
//                   <div className="w-20 h-20 rounded-[3.5rem] bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-700">
//                     <MessageSquare size={36} />
//                   </div>
//                   <div>
//                     <h3 className="text-2xl font-black text-slate-900 mb-2 font-display">رابط الرسائل القصيرة (SMS)</h3>
//                     <p className="text-sm text-slate-500 leading-relaxed font-bold">أرسل رسالة تحتوي على (النوع، الوصف) إلى الرقم الموحد <span className="text-emerald-600 font-mono">٧٧٢٢</span></p>
//                   </div>
//                   <div className="p-6 bg-white/50 rounded-3xl border border-white italic text-slate-400 text-xs shadow-inner">
//                     مثال: Type: water Desc: كسر في ماسورة Loc: حي الرياض، شارع ١١٧
//                   </div>
//                   <button 
//                     onClick={sendViaSMS}
//                     className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg mt-4"
//                   >
//                     فتح تطبيق الرسائل الآن // SEND_SMS
//                   </button>
//                 </div>

//                 <div className="umran-card p-12 space-y-8 text-right relative overflow-hidden group">
//                   <div className="w-20 h-20 rounded-[3.5rem] bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
//                     <Phone size={36} />
//                   </div>
//                   <div>
//                     <h3 className="text-2xl font-black text-slate-900 mb-2 font-display">البوابة السريعة (USSD)</h3>
//                     <p className="text-sm text-slate-500 leading-relaxed font-bold">اطلب الرمز <span className="text-blue-600 font-mono">*٧٧٢#</span> واتبع التعليمات لرفع بلاغ فوري دون إنترنت.</p>
//                   </div>
//                   <div className="p-6 bg-white/50 rounded-3xl border border-white italic text-slate-400 text-xs shadow-inner">
//                     * الخدمة متاحة لمشتركي زين، MTN، وسوداني مجاناً.
//                   </div>
//                 </div>
//               </div>

//               <button 
//                 onClick={() => setShowOfflineOptions(false)}
//                 className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[4rem] text-slate-400 text-xs font-black uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-500 transition-all"
//               >
//                 العودة للتطبيق الرقمي
//               </button>
//             </motion.div>
//           ) : (
//             <motion.div
//               key="step1"
//               initial={{ opacity: 0, scale: 0.98, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 1.02, y: -20 }}
//               className="space-y-16"
//             >
//               <div className="space-y-5 text-right">
//                 <div className="flex items-center gap-3 justify-end mb-2">
//                    <div className="w-12 h-[1px] bg-emerald-500/30" />
//                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.6em] font-mono italic">المرحلة ٠١ // توثيق الوسائط</span>
//                 </div>
//                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-950 leading-none font-display">التوثيق الميداني</h2>
//                 <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-xl mr-auto ml-0 lg:mr-0">استخلاص البيانات المرئية والصوتية عبر المحرك العصبي لضمان الدقة التشغيلية.</p>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
//                 <input 
//                   type="file"
//                   ref={fileInputRef}
//                   accept="image/*"
//                   multiple
//                   capture="environment"
//                   className="hidden"
//                   onChange={handleCapture}
//                 />
//                 <div className="space-y-4">
//                   <button 
//                     disabled={isAnalyzing}
//                     className={cn(
//                       "umran-card min-h-[160px] sm:aspect-video relative group overflow-hidden flex flex-col items-center justify-center gap-4 sm:gap-8 w-full",
//                       errors.media && "border-rose-500 animate-pulse"
//                     )}
//                     onClick={() => fileInputRef.current?.click()}
//                   >
//                     <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//                     {isAnalyzing ? (
//                       <div className="flex flex-col items-center gap-6">
//                         <div className="relative">
//                           <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
//                           <Loader2 className="animate-spin text-emerald-500 relative z-10" size={48} sm:size={64} strokeWidth={1.5} />
//                         </div>
//                         <span className="text-[10px] font-mono font-black text-emerald-500 uppercase tracking-[0.5em] animate-pulse">جاري التحليل...</span>
//                       </div>
//                     ) : (
//                       <>
//                         <div className={cn(
//                           "w-16 h-16 sm:w-24 sm:h-24 rounded-[2rem] sm:rounded-[3.5rem] flex items-center justify-center transition-all duration-700 shadow-sm relative overflow-hidden",
//                           attachedImages.length > 0 ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white"
//                         )}>
//                           <Camera size={32} sm:size={48} strokeWidth={1} className="relative z-10" />
//                           <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
//                         </div>
//                         <div className="text-center relative z-10">
//                           <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 block mb-2 transition-colors group-hover:text-emerald-900">فتح الكاميرا</span>
//                           <span className="text-[9px] sm:text-[10px] font-mono font-black text-slate-300 uppercase tracking-[0.4em] group-hover:text-emerald-600/50 transition-colors">{attachedImages.length} صور مرفقة</span>
//                         </div>
//                       </>
//                     )}
//                   </button>
//                   {errors.media && !audioBlob && attachedImages.length === 0 && (
//                     <p className="text-rose-600 text-[10px] sm:text-[11px] font-bold text-center pr-2">{errors.media}</p>
//                   )}
//                 </div>

//                 <div className="space-y-4">
//                   <button 
//                     className={cn(
//                       "umran-card min-h-[160px] sm:aspect-video flex flex-col items-center justify-center gap-4 sm:gap-8 group relative overflow-hidden w-full",
//                       isRecording ? "bg-rose-50 border-rose-200 shadow-[0_40px_80px_-20px_rgba(225,29,72,0.1)] hover:border-rose-300 shimmer" : "",
//                       errors.media && !attachedImages.length && "border-rose-500 animate-pulse"
//                     )}
//                     onClick={toggleRecording}
//                   >
//                     <div className={cn(
//                       "w-16 h-16 sm:w-24 sm:h-24 rounded-[2rem] sm:rounded-[3.5rem] transition-all duration-700 flex items-center justify-center relative overflow-hidden",
//                       isRecording ? "bg-rose-600 text-white scale-110 shadow-2xl" : 
//                       audioBlob ? "bg-emerald-500 text-white shadow-xl" :
//                       "bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white border border-slate-200"
//                     )}>
//                       {audioBlob && !isRecording ? <Check size={32} sm:size={48} strokeWidth={1} /> : <Mic size={32} sm:size={48} strokeWidth={1} className="relative z-10" />}
//                       {isRecording && (
//                         <div className="absolute inset-0 bg-rose-500 animate-ping opacity-20" />
//                       )}
//                     </div>
//                     <div className="text-center relative z-10">
//                       <span className={cn(
//                         "text-lg sm:text-xl font-black tracking-tight block mb-2 transition-colors",
//                         isRecording ? "text-rose-600" : audioBlob ? "text-emerald-600" : "text-slate-900 group-hover:text-slate-950"
//                       )}>
//                         {isRecording ? formatDuration(recordingDuration) : audioBlob ? "تم تسجيل الإفادة" : 'تسجيل إفادة صوتية'}
//                       </span>
//                       <span className={cn(
//                         "text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-[0.4em] transition-colors",
//                         isRecording ? "text-rose-400" : audioBlob ? "text-emerald-400" : "text-slate-300 group-hover:text-slate-500"
//                       )}>
//                         {isRecording ? 'جاري التسجيل...' : audioBlob ? 'جاهز للإرسال // استبدال' : 'قناة الصوت // في الانتظار'}
//                       </span>
//                     </div>
//                   </button>
//                 </div>
//               </div>

//               {attachedImages.length > 0 && (
//                 <div className="flex gap-8 overflow-x-auto pb-10 no-scrollbar pr-2">
//                   <AnimatePresence>
//                     {attachedImages.map((img, idx) => (
//                       <motion.div 
//                         key={idx}
//                         initial={{ opacity: 0, x: 30, scale: 0.9 }}
//                         animate={{ opacity: 1, x: 0, scale: 1 }}
//                         exit={{ opacity: 0, scale: 0.5 }}
//                         className="relative w-80 h-48 shrink-0 rounded-[4rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border-4 border-white group"
//                       >
//                         <img src={img} alt="Preview" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125" />
//                         <div className="absolute inset-0 bg-emerald-600/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                           <button 
//                             onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))}
//                             className="w-14 h-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-all duration-500"
//                           >
//                             <Trash2 size={24} />
//                           </button>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </AnimatePresence>
//                 </div>
//               )}

//               <div className="space-y-8">
//                 <div className="flex items-center gap-3 justify-end">
//                    <div className="w-12 h-[1px] bg-emerald-500/30" />
//                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.6em] font-mono italic">تحديد الموقع الميداني // الخريطة التفاعلية</span>
//                 </div>
                
//                 <div className={cn(
//                   "relative group rounded-[4rem] overflow-hidden border-4 bg-white shadow-2xl h-[400px] transition-all",
//                   errors.location ? "border-rose-500" : "border-white"
//                 )}>
//                   <MapContainer 
//                     center={[currentCoords.lat, currentCoords.lng]} 
//                     zoom={13} 
//                     className="w-full h-full z-0"
//                     scrollWheelZoom={true}
//                   >
//                     <TileLayer
//                       attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//                       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     />
//                     <MapController coords={currentCoords} />
//                     <MapEvents />
//                     <Marker position={[currentCoords.lat, currentCoords.lng]} />
//                   </MapContainer>
                  
//                   <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-4">
//                     <button 
//                       onClick={() => {
//                         if (navigator.geolocation) {
//                           navigator.geolocation.getCurrentPosition((pos) => {
//                              const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//                              setCurrentCoords(newCoords);
//                              reverseGeocode(newCoords.lat, newCoords.lng);
//                           });
//                         }
//                       }}
//                       className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-xl hover:bg-emerald-600 hover:text-white transition-all border border-slate-100"
//                     >
//                       <Locate size={24} />
//                     </button>
//                   </div>

//                     <div className={cn(
//                       "absolute bottom-10 inset-x-10 z-[1000] bg-white/95 backdrop-blur-2xl p-6 rounded-[4rem] border-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] flex items-center gap-6 text-right group/addr transition-all",
//                       errors.location ? "border-rose-500" : "border-emerald-500/10"
//                     )}>
//                       <div className={cn(
//                         "w-14 h-14 rounded-[2rem] flex items-center justify-center text-white shrink-0 shadow-lg group-hover/addr:scale-110 transition-transform duration-500",
//                         errors.location ? "bg-rose-600" : "bg-emerald-600"
//                       )}>
//                        {addressLoading ? <Loader2 className="animate-spin" size={28} /> : <MapIcon size={28} />}
//                     </div>
//                     <div className="flex-1 space-y-1">
//                        <p className={cn(
//                          "text-[9px] font-mono font-black uppercase tracking-[0.4em] mb-0.5",
//                          errors.location ? "text-rose-600" : "text-emerald-600"
//                        )}>LOCATION_SYNC // KRT</p>
//                        <AnimatePresence mode="wait">
//                          <motion.div
//                            key={addressLoading ? 'loading' : 'address'}
//                            initial={{ opacity: 0, y: 10 }}
//                            animate={{ opacity: 1, y: 0 }}
//                            exit={{ opacity: 0, y: -10 }}
//                            transition={{ duration: 0.3 }}
//                          >
//                            <input 
//                              type="text"
//                              value={addressLoading ? "جاري التحديد..." : manualAddress}
//                              onChange={(e) => setManualAddress(e.target.value)}
//                              disabled={addressLoading}
//                              placeholder="أدخل العنوان بدقة..."
//                              className="w-full bg-transparent border-none text-lg font-black text-slate-950 placeholder:text-slate-300 outline-none focus:ring-0 p-0 tracking-tight"
//                            />
//                          </motion.div>
//                        </AnimatePresence>
//                     </div>
//                   </div>
//                 </div>
                
//                 {errors.location && (
//                   <p className="text-center text-rose-600 text-[11px] font-bold mt-2">{errors.location}</p>
//                 )}
//                 <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
//                   انقر على الخريطة لتحديد موقع البلاغ بدقة
//                 </p>
//               </div>
//             </motion.div>
//           )}

//           {step === 2 && (
//             <motion.div
//               key="step2"
//               initial={{ opacity: 0, x: 50 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -50 }}
//               className="space-y-16 pb-12"
//             >
//               <div className="space-y-5 text-right">
//                 <div className="flex items-center gap-3 justify-end mb-2">
//                    <div className="w-12 h-[1px] bg-emerald-500/30" />
//                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.6em] font-mono italic">المرحلة ٠٢ // تصنيف البيانات</span>
//                 </div>
//                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-950 leading-none font-display">تصنيف البيانات</h2>
//                 <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-xl mr-auto ml-0 lg:mr-0">إسناد الحالة الفنية إلى القسم المختص عبر نظام التوجيه الذكي للمؤسسات السيادية.</p>
//               </div>

//               <div className="space-y-16">
//                 <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-[3.5rem] md:rounded-[4rem] border-2 border-slate-100 shadow-inner">
//                   {[
//                     { id: 'report', label: 'بلاغ مباشر' },
//                     { id: 'suggestion', label: 'مقترح فني' },
//                     { id: 'inquiry', label: 'استفسار نظام' }
//                   ].map(tab => (
//                     <button
//                       key={tab.id}
//                       onClick={() => setInteractionType(tab.id as any)}
//                       className={cn(
//                         "flex-1 py-4 md:py-6 rounded-[3rem] md:rounded-[4rem] text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-700 relative overflow-hidden group",
//                         interactionType === tab.id 
//                           ? "bg-emerald-600 text-white shadow-xl scale-[1.03] border-emerald-500" 
//                           : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
//                       )}
//                     >
//                       <span className="relative z-10">{tab.label}</span>
//                       {interactionType === tab.id && (
//                         <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-800 opacity-20" />
//                       )}
//                     </button>
//                   ))}
//                 </div>

//                 <div className="space-y-4">
//                   <div className={cn(
//                     "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 p-3 sm:p-4 rounded-[3rem] sm:rounded-[4.5rem] transition-all",
//                     errors.issueType ? "bg-rose-50 border-2 border-rose-200" : ""
//                   )}>
//                     {CATEGORIES.map(cat => (
//                       <button
//                         key={cat.id}
//                         onClick={() => {
//                           setIssueType(cat.id);
//                           if (errors.issueType) setErrors(prev => {
//                             const newErrors = { ...prev };
//                             delete newErrors.issueType;
//                             return newErrors;
//                           });
//                         }}
//                         className={cn(
//                           "px-6 sm:px-10 py-8 sm:py-12 rounded-[2.5rem] sm:rounded-[4rem] border-2 flex flex-col items-center gap-6 sm:gap-8 transition-all duration-700 active:scale-95 group relative overflow-hidden",
//                           issueType === cat.id 
//                             ? "bg-white border-emerald-500 shadow-[0_40px_80px_-15px_rgba(16,185,129,0.15)] scale-[1.05] z-10" 
//                             : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
//                         )}
//                       >
//                          <div className={cn(
//                            "w-20 h-20 rounded-[2.2rem] flex items-center justify-center shrink-0 transition-all duration-700 group-hover:rotate-12 group-hover:scale-110 shadow-sm",
//                            issueType === cat.id ? "bg-emerald-600 text-white shadow-xl" : "bg-slate-50 text-slate-400"
//                          )}>
//                            {React.cloneElement(cat.icon as any, { size: 36, strokeWidth: 1.5 })}
//                          </div>
//                          <div className="text-center">
//                            <span className={cn("text-xl font-black uppercase tracking-tight block mb-1", issueType === cat.id ? "text-emerald-950" : "text-slate-900")}>
//                              {cat.label}
//                            </span>
//                            <span className={cn("text-[9px] font-mono font-black uppercase tracking-widest", issueType === cat.id ? "text-emerald-600" : "text-slate-300")}>
//                              فئة_{cat.id}
//                            </span>
//                          </div>
//                          {issueType === cat.id && (
//                            <div className="absolute bottom-0 inset-x-0 h-2 bg-emerald-500" />
//                          )}
//                       </button>
//                     ))}
//                   </div>
//                   {errors.issueType && (
//                     <p className="text-rose-600 text-[11px] font-bold text-center">{errors.issueType}</p>
//                   )}
//                 </div>

//                 <div className="space-y-4">
//                   <div className="relative group">
//                     <div className="absolute inset-x-12 -inset-y-4 bg-emerald-500/5 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
//                     <textarea 
//                       rows={6}
//                       placeholder="أدخل الوصف التفصيلي للحالة الميدانية، مع ذكر أي تفاصيل فنية تدعم المعالجة السريعة..."
//                       className={cn(
//                         "w-full px-8 md:px-12 py-8 md:py-10 rounded-[4rem] md:rounded-[5.5rem] border-2 bg-white text-base md:text-lg font-bold focus:border-emerald-500 outline-none transition-all text-right resize-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.02)] relative z-10",
//                         errors.description ? "border-rose-500" : "border-slate-100"
//                       )}
//                       value={description}
//                       onChange={(e) => {
//                         setDescription(e.target.value);
//                         if (errors.description && e.target.value.length >= 10) {
//                           setErrors(prev => {
//                             const newErrors = { ...prev };
//                             delete newErrors.description;
//                             return newErrors;
//                           });
//                         }
//                       }}
//                     />
//                     <div className="absolute top-8 right-12 flex items-center gap-4 z-20">
//                       <button
//                         type="button"
//                         onClick={isTranscribing ? stopTranscriptionRecording : startTranscriptionRecording}
//                         className={cn(
//                           "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg border-2",
//                           isTranscribing 
//                             ? "bg-rose-600 text-white border-rose-400 animate-pulse" 
//                             : "bg-white text-emerald-600 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50"
//                         )}
//                         title={isTranscribing ? "إيقاف التسجيل" : "تحويل الصوت إلى نص"}
//                       >
//                         {isTranscribing ? <Loader2 className="animate-spin" size={20} /> : <Mic size={20} />}
//                       </button>
//                       <div className="pointer-events-none opacity-10 group-focus-within:opacity-0 transition-opacity">
//                         <Sparkles className="text-emerald-600" size={24} />
//                       </div>
//                     </div>
//                   </div>
//                   {errors.description && (
//                     <p className="text-rose-600 text-[11px] font-bold text-right pr-12">{errors.description}</p>
//                   )}
//                 </div>

//                 {/* Optional Details Section */}
//                 <div className="space-y-10 pt-8 border-t border-slate-200/50">
//                   <div className="flex items-center gap-3 justify-end">
//                      <div className="w-8 h-[1px] bg-slate-300" />
//                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] font-mono italic">تفاصيل إضافية اختياري //</span>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                     {/* Damage Type */}
//                     <div className="space-y-4 text-right">
//                       <label className="text-sm font-black text-slate-900 pr-4 block">نوع الضرر</label>
//                       <input 
//                         type="text"
//                         placeholder="مثلاً: حفرة عميقة، تسرب مياه..."
//                         className="w-full px-8 py-6 rounded-[3.5rem] border-2 border-slate-100 bg-white text-md font-bold focus:border-emerald-500 outline-none transition-all text-right"
//                         value={damageType}
//                         onChange={(e) => setDamageType(e.target.value)}
//                       />
//                     </div>

//                     {/* Severity Selection */}
//                     <div className="space-y-4 text-right">
//                       <label className="text-sm font-black text-slate-900 pr-4 block">مستوى الشدة</label>
//                       <div className="flex gap-4 p-2 bg-slate-50 rounded-[3.5rem] border-2 border-slate-100">
//                         {[1, 2, 3].map((s) => (
//                           <button
//                             key={s}
//                             type="button"
//                             onClick={() => setSeverity(s as any)}
//                             className={cn(
//                               "flex-1 py-4 rounded-3xl text-xs font-black transition-all",
//                               severity === s ? (
//                                 s === 3 ? "bg-rose-600 text-white shadow-lg" : 
//                                 s === 2 ? "bg-amber-500 text-white shadow-lg" : 
//                                 "bg-emerald-500 text-white shadow-lg"
//                               ) : "text-slate-400 hover:text-slate-600"
//                             )}
//                           >
//                             {s === 1 ? 'عادي' : s === 2 ? 'مهم' : 'عاجل'}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Additional Notes */}
//                   <div className="space-y-4 text-right">
//                     <label className="text-sm font-black text-slate-900 pr-4 block">ملاحظات إضافية</label>
//                     <textarea 
//                       rows={3}
//                       placeholder="أي معلومات إضافية قد تكون مفيدة..."
//                       className="w-full px-8 py-6 rounded-[4rem] border-2 border-slate-100 bg-white text-md font-bold focus:border-emerald-500 outline-none transition-all text-right resize-none"
//                       value={notes}
//                       onChange={(e) => setNotes(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           )}

//           {step === 3 && (
//             <motion.div
//               key="step3"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 1.05 }}
//               className="space-y-16 pb-12"
//             >
//               <div className="space-y-5 text-right">
//                 <div className="flex items-center gap-3 justify-end mb-2">
//                    <div className="w-12 h-[1px] bg-emerald-500/30" />
//                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.6em] font-mono italic">المرحلة ٠٣ // الاعتماد النهائي</span>
//                 </div>
//                 <h2 className="text-6xl font-black tracking-tighter text-slate-950 leading-none font-display">الاعتماد النهائي</h2>
//                 <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-xl mr-auto ml-0 lg:mr-0">مراجعة الملف الفني وتوقيع البلاغ رقمياً قبل الإرسال المشفر إلى غرف العمليات المركزية.</p>
//               </div>

//               <div className="rounded-[3.5rem] sm:rounded-[5rem] border-4 border-white bg-white p-8 sm:p-16 lg:p-20 space-y-8 sm:space-y-12 text-right shadow-[0_60px_120px_-30px_rgba(0,0,0,0.12)] relative overflow-hidden">
//                 <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                
//                 <div className="flex flex-col sm:flex-row justify-between items-center relative z-10 gap-6">
//                   <div className="flex flex-col items-center sm:items-start gap-3">
//                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] font-mono">رقم المتابعة // الهوية الرقمية</span>
//                     <span className="px-6 sm:px-10 py-4 sm:py-5 bg-emerald-600 text-white rounded-[1.5rem] sm:rounded-[2rem] text-xs sm:text-sm font-black uppercase tracking-[0.4em] shadow-lg border border-emerald-500 group overflow-hidden relative cursor-default">
//                       <span className="relative z-10">{trackingId}</span>
//                       <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
//                     </span>
//                   </div>
//                   <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[3rem] sm:rounded-[4rem] bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner rotate-6 hover:rotate-0 transition-transform duration-700">
//                      <ShieldCheck size={40} sm:size={48} strokeWidth={1.5} />
//                   </div>
//                 </div>

//                 <div className="space-y-10 relative z-10 border-t-2 border-slate-50 pt-16">
//                   <div className="flex justify-between items-start flex-row-reverse">
//                     <div>
//                       <h3 className="font-black text-5xl text-slate-950 mb-3 tracking-tight font-display">{CATEGORIES.find(c => c.id === issueType)?.label || 'بلاغ مسجل'}</h3>
//                       <div className="flex items-center gap-3 justify-end text-emerald-600 font-black italic tracking-tighter text-base uppercase">
//                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]" />
//                          <MapPin size={20} strokeWidth={2.5} />
//                          <span>{manualAddress || 'الخرطوم، السودان'}</span>
//                       </div>
//                     </div>
//                     <div className={cn(
//                       "px-10 py-4 text-[11px] font-mono font-black rounded-full uppercase tracking-[0.6em] shadow-2xl border-2",
//                       severity === 3 ? "bg-rose-600 border-rose-500 text-white" : "bg-emerald-600 border-emerald-500 text-white"
//                     )}>
//                       أولوية الخدمة // {severity === 3 ? 'عاجل' : 'عادي'}
//                     </div>
//                   </div>
                  
//                   <div className="relative p-6 sm:p-10 bg-slate-50 rounded-[3rem] sm:rounded-[4.5rem] border border-slate-100 shadow-inner">
//                     <div className="space-y-4">
//                       <p className="text-lg sm:text-2xl text-slate-800 leading-[1.8] font-bold pr-0 sm:pr-12 italic relative z-10">
//                         "{description || 'لا يوجد تفاصيل إضافية مسجلة.'}"
//                       </p>
                      
//                       {(damageType || notes) && (
//                         <div className="pt-6 mt-6 border-t border-slate-200/50 space-y-4 pr-12 relative z-10">
//                            {damageType && (
//                              <div className="flex justify-start items-center gap-2 flex-row-reverse">
//                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">نوع الضرر:</span>
//                                <span className="text-sm font-black text-slate-700">{damageType}</span>
//                              </div>
//                            )}
//                            {notes && (
//                              <div className="flex flex-col items-start gap-1 text-right">
//                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">ملاحظات إضافية:</span>
//                                <span className="text-sm font-medium text-slate-600 leading-relaxed">{notes}</span>
//                              </div>
//                            )}
//                         </div>
//                       )}
//                     </div>
//                     <div className="absolute right-0 top-10 bottom-10 w-2.5 bg-emerald-600 rounded-full shadow-[0_0_20px_#10b981]" />
//                   </div>

//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                     {attachedImages.slice(0, 4).map((img, i) => (
//                       <div key={i} className="aspect-video rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-md group">
//                         <img src={img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125" />
//                       </div>
//                     ))}
//                   </div>

//                   {audioBlob && (
//                     <div className="flex items-center gap-6 p-8 bg-emerald-50 rounded-[4rem] border border-emerald-100">
//                        <div className="w-16 h-16 rounded-[2.2rem] bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg animate-pulse">
//                           <Mic size={32} />
//                        </div>
//                        <div className="text-right">
//                           <p className="text-sm font-black text-slate-900 leading-tight">إفادة صوتية مرفقة</p>
//                           <p className="text-[10px] font-mono font-black text-emerald-600 uppercase tracking-widest mt-1">VOICE_SIGNAL // ENCRYPTED_ATTACHMENT</p>
//                        </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </motion.div>
//           )}

//           <AnimatePresence>
//             {showOfflineOptions && (
//               <motion.div 
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="fixed inset-0 bg-white/60 backdrop-blur-xl z-[300] flex items-center justify-center p-6 lg:p-12 overflow-y-auto"
//               >
//                 <motion.div 
//                   initial={{ scale: 0.9, opacity: 0, y: 20 }}
//                   animate={{ scale: 1, opacity: 1, y: 0 }}
//                   exit={{ scale: 0.9, opacity: 0, y: 20 }}
//                   className="bg-white max-w-2xl w-full rounded-[4rem] p-12 lg:p-16 text-right space-y-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border-4 border-white relative"
//                 >
//                   <button 
//                     onClick={() => setShowOfflineOptions(false)}
//                     className="absolute top-8 left-8 p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400"
//                   >
//                     <X size={24} />
//                   </button>

//                   <div className="space-y-6">
//                     <div className="w-20 h-20 rounded-[3.5rem] bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto border-2 border-emerald-100">
//                       <WifiOff size={40} />
//                     </div>
//                     <div className="text-center space-y-4">
//                       <h3 className="text-4xl font-black text-slate-950 font-display tracking-tight">نظام البلاغات غير المتصل</h3>
//                       <p className="text-sm text-slate-500 font-bold leading-relaxed max-w-sm mx-auto">لا تقلق، يمكنك الاستمرار في بناء الوطن حتى بدون إنترنت عبر الرسائل النصية القصيرة.</p>
//                     </div>
//                   </div>

//                   <div className="space-y-6">
//                     <div className="p-8 bg-slate-50 rounded-[3.5rem] border-2 border-slate-100 space-y-4">
//                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center italic">مسودة البلاغ الحالية //</p>
//                        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-xs font-mono font-black text-slate-700 text-center leading-relaxed">
//                           {`بلاغ: ${issueType || '[نوع]'} في ${manualAddress || '[الموقع]'} - ${description || '[التفاصيل]'}`}
//                        </div>
//                     </div>

//                     <div className="grid grid-cols-1 gap-4">
//                       <button 
//                         onClick={sendViaSMS}
//                         className="w-full py-8 bg-emerald-600 text-white rounded-[3.5rem] text-sm font-black uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-4 group"
//                       >
//                         <MessageSquare size={20} className="group-hover:scale-110" />
//                         إرسال عبر SMS (7722)
//                       </button>
//                       <div className="py-6 px-8 bg-white border-2 border-slate-100 rounded-[3.5rem] text-center">
//                         <p className="text-xs font-black text-slate-900 mb-2">أو اطلب الكود التفاعلي</p>
//                         <p className="text-2xl font-black text-amber-600 font-mono">*772#</p>
//                         <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">مجاني بالكامل وبدون بيانات</p>
//                       </div>
//                     </div>
//                   </div>

//                   <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">عُمران // القوة في كل هاتف</p>
//                 </motion.div>
//               </motion.div>
//             )}

//             {showConfirmation && (
//               <motion.div 
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="fixed inset-0 bg-white/40 backdrop-blur-md z-[100] flex items-center justify-center p-6"
//                 onClick={() => setShowConfirmation(false)}
//               >
//                 <motion.div 
//                   initial={{ scale: 0.9, opacity: 0, y: 20 }}
//                   animate={{ scale: 1, opacity: 1, y: 0 }}
//                   exit={{ scale: 0.9, opacity: 0, y: 20 }}
//                   className="bg-white max-w-lg w-full rounded-[4rem] p-12 lg:p-16 text-right space-y-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border-4 border-white overflow-hidden relative"
//                   onClick={e => e.stopPropagation()}
//                 >
//                   <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />
                  
//                   <div className="flex justify-center mb-4">
//                      <div className="w-24 h-24 rounded-[4rem] bg-emerald-50 flex items-center justify-center text-emerald-600 border-2 border-emerald-100">
//                         <AlertTriangle size={48} className="animate-bounce" />
//                      </div>
//                   </div>

//                   <div className="text-center space-y-4">
//                     <h3 className="text-4xl font-black text-slate-950 font-display tracking-tight">تأكيد إرسال البلاغ</h3>
//                     <p className="text-sm text-slate-500 font-bold leading-relaxed max-w-sm mx-auto">هل راجعت كافة البيانات المدخلة؟ بمجرد الإرسال، سيتم توجيه البلاغ فوراً إلى الجهات المختصة للمباشرة في الحل.</p>
//                   </div>

//                   <div className="flex flex-col gap-4">
//                     <button 
//                       onClick={handleSubmit}
//                       className="w-full py-8 bg-emerald-600 text-white rounded-[2.5rem] text-sm font-black uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-4 group"
//                     >
//                       <Check size={20} className="group-hover:scale-125 transition-transform" />
//                       نعم، اعتماد وإرسال // CONFIRM
//                     </button>
//                     <button 
//                       onClick={() => setShowConfirmation(false)}
//                       className="w-full py-8 bg-slate-50 text-slate-400 rounded-[3.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all"
//                     >
//                       إلغاء المراجعة // CANCEL
//                     </button>
//                   </div>
//                 </motion.div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </AnimatePresence>
//       </div>

//       <footer className="pt-16 flex flex-col gap-6 z-20">
//         {!showOfflineOptions && (
//           <button 
//             onClick={() => setShowOfflineOptions(true)}
//             className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono hover:text-emerald-600 transition-colors mx-auto"
//           >
//             لا يوجد اتصال بالإنترنت؟ استخدم SMS / USSD
//           </button>
//         )}
        
//         <div className="flex gap-8">
//           {step > 1 && !showOfflineOptions && (
//             <motion.button 
//               onClick={prevStep}
//               className="premium-btn-outline w-48 shadow-lg"
//             >
//               السابق
//             </motion.button>
//           )}
//           {!showOfflineOptions && (
//             <motion.button 
//               onClick={step === 3 ? () => setShowConfirmation(true) : nextStep}
//               disabled={isSubmitting}
//               className="premium-btn flex-1 bg-emerald-600 border-2 border-emerald-500 hover:bg-emerald-700"
//             >
//               {isSubmitting ? (
//                 <div className="flex items-center gap-8 relative z-10">
//                    <Loader2 className="animate-spin text-emerald-500" size={32} strokeWidth={2} />
//                    <span className="font-mono text-xs tracking-widest text-emerald-100">جاري إرسال البيانات // {uploadProgress}%</span>
//                 </div>
//               ) : (
//                 <>
//                    <span className="relative z-10">{step === 3 ? 'اعتماد وإرسال البلاغ' : 'الخطوة التالية'}</span>
//                    <div className="flex items-center relative z-10 transition-transform group-hover:translate-x-3 duration-700">
//                      {step === 3 ? <Send size={28} className="rotate-180" /> : <ArrowRight size={28} className="rotate-180" />}
//                    </div>
//                 </>
//               )}
//             </motion.button>
//           )}
//         </div>
//       </footer>
//     </div>
//   );
// }

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Mic, MapPin, Send, ArrowRight, Loader2, Check, Droplets, Zap, Trash2, X, Sparkles, ScanSearch, HelpCircle, ShieldCheck, MessageSquare, Phone, Map as MapIcon, Locate, WifiOff, AlertTriangle } from 'lucide-react';
import { collection, addDoc, serverTimestamp, setDoc, doc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../lib/firebase';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({ iconUrl: markerIcon, iconRetinaUrl: markerIconRetina, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const STEPS = [
  { id: 1, title: 'الوسائط' },
  { id: 2, title: 'التفاصيل' },
  { id: 3, title: 'المراجعة' },
];

const CATEGORIES = [
  { id: 'road', label: 'طرق', icon: <MapPin size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'water', label: 'مياه', icon: <Droplets size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'electricity', label: 'كهرباء', icon: <Zap size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'waste', label: 'نفايات', icon: <Trash2 size={20} />, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'other', label: 'عام', icon: <HelpCircle size={20} />, color: 'text-slate-600', bg: 'bg-slate-50' },
];

export default function IssueReport({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const [issueType, setIssueType] = useState('');
  const [interactionType, setInteractionType] = useState<'report' | 'suggestion' | 'inquiry'>('report');
  const [description, setDescription] = useState('');
  const [manualAddress, setManualAddress] = useState('الرياض، الخرطوم');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({ lat: 15.5007, lng: 32.5599 });
  const [addressLoading, setAddressLoading] = useState(false);
  const [severity, setSeverity] = useState<1 | 2 | 3>(2);
  const [damageType, setDamageType] = useState('');
  const [notes, setNotes] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showOfflineOptions, setShowOfflineOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [trackingId] = useState(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'BN-';
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTranscribing, setIsTranscribing] = useState(false);
  const transcriptionRecorderRef = useRef<MediaRecorder | null>(null);
  const transcriptionChunksRef = useRef<Blob[]>([]);

  const startTranscriptionRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      transcriptionRecorderRef.current = mediaRecorder;
      transcriptionChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) transcriptionChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => { const blob = new Blob(transcriptionChunksRef.current, { type: 'audio/webm' }); await transcribeAudio(blob); stream.getTracks().forEach(track => track.stop()); };
      mediaRecorder.start();
      setIsTranscribing(true);
    } catch (err) { console.error("Microphone access denied for transcription:", err); }
  };

  const stopTranscriptionRecording = () => {
    if (transcriptionRecorderRef.current && transcriptionRecorderRef.current.state === 'recording') {
      transcriptionRecorderRef.current.stop();
      setIsTranscribing(false);
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ parts: [{ text: "Transcribe this audio recording of a Sudanese citizen describing an infrastructure issue. The user is likely speaking in Sudanese Arabic (Ammiya). Provide ONLY the transcription text, nothing else. Focus on accuracy of the technical details mentioned. If the audio is unclear, return an empty string." }, { inlineData: { mimeType: "audio/webm", data: base64Audio } }] }]
          });
          const text = response.text || "";
          if (text && text.trim().length > 0) setDescription(prev => prev ? `${prev} ${text.trim()}`.trim() : text.trim());
        } catch (genError) { console.error("Gemini Transcription API error:", genError); }
        finally { setIsTranscribing(false); }
      };
    } catch (error) { console.error("Transcription process error:", error); setIsTranscribing(false); }
  };

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const sendViaSMS = () => {
    const message = `Type: ${issueType || 'other'} Desc: ${description} Loc: ${manualAddress}`;
    window.location.href = `sms:7722?body=${encodeURIComponent(message)}`;
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setAddressLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar,en&addressdetails=1`);
      const data = await response.json();
      if (data && data.display_name) {
        const addr = data.address;
        const shortAddress = [addr.road || addr.pedestrian || addr.suburb || '', addr.neighbourhood || addr.city_district || '', addr.city || addr.town || addr.village || ''].filter(Boolean).join('، ') || data.display_name;
        setManualAddress(shortAddress);
      }
    } catch (error) { console.error("Geocoding error:", error); }
    finally { setAddressLoading(false); }
  };

  useEffect(() => { if (currentCoords) reverseGeocode(currentCoords.lat, currentCoords.lng); }, []);

  function MapController({ coords }: { coords: { lat: number, lng: number } | null }) {
    const map = useMap();
    useEffect(() => { if (coords) map.flyTo([coords.lat, coords.lng], map.getZoom(), { duration: 1.5, easeLinearity: 0.25 }); }, [coords, map]);
    return null;
  }

  function MapEvents() {
    useMapEvents({
      click(e) { const newCoords = { lat: e.latlng.lat, lng: e.latlng.lng }; setCurrentCoords(newCoords); reverseGeocode(newCoords.lat, newCoords.lng); }
    });
    return null;
  }

  const analyzeImage = async (base64Data: string) => {
    setIsAnalyzing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ parts: [{ text: "Analyze this image of a Sudanese infrastructure problem. Determine the issue type (road, water, electricity, waste, or other) and provide a concise description in Sudanese Arabic (Ammiya). Also, assess the visual cues to determine a potential severity level for this issue (1 for normal/low concern, 2 for significant/important, 3 for urgent/dangerous). Return the result strictly in JSON format with keys 'type', 'description', and 'severity' (integer 1-3)." }, { inlineData: { mimeType: "image/jpeg", data: base64Data.split(',')[1] } }] }],
        config: { responseMimeType: "application/json" }
      });
      const result = JSON.parse(response.text || '{}');
      if (result.type) setIssueType(result.type);
      if (result.description) setDescription(result.description);
      if (result.severity && [1, 2, 3].includes(result.severity)) setSeverity(result.severity as any);
    } catch (error) { console.error("Gemini analysis failed:", error); }
    finally { setIsAnalyzing(false); }
  };

  const handleImageUpload = (img: string) => { setAttachedImages(prev => [...prev, img]); if (attachedImages.length === 0) analyzeImage(img); };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file: File) => { const reader = new FileReader(); reader.onload = (event) => handleImageUpload(event.target?.result as string); reader.readAsDataURL(file); });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => { setAudioBlob(new Blob(audioChunksRef.current, { type: 'audio/webm' })); stream.getTracks().forEach(track => track.stop()); };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
    } catch (err) { console.error("Microphone access denied:", err); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const toggleRecording = () => isRecording ? stopRecording() : startRecording();

  const formatDuration = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    setIsSubmitting(true);
    try {
      setUploadProgress(10);
      let audioUrl = '';
      if (audioBlob) {
        const audioRef = ref(storage, `audio/${auth.currentUser.uid}_${Date.now()}.webm`);
        await uploadBytes(audioRef, audioBlob);
        audioUrl = await getDownloadURL(audioRef);
        setUploadProgress(30);
      }
      const location = { lat: currentCoords?.lat || 15.5007, lng: currentCoords?.lng || 32.5599, address: manualAddress || "الرياض، الخرطوم" };
      const docData = { trackingId, type: issueType.toLowerCase() || 'other', interactionType, description, notes, location, severity, mediaUrls: attachedImages, voiceUrl: audioUrl, status: 'pending', currentStage: 'detected', reportCount: 1, anonymous: true, reporterId: auth.currentUser.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), regionId: 'khartoum', citizenSignOff: false, reportedByCitizen: true };
      const docRef = await addDoc(collection(db, 'issues'), docData);
      setUploadProgress(100);
      await setDoc(doc(db, 'users', auth.currentUser.uid), { points: increment(100), uid: auth.currentUser.uid, updatedAt: serverTimestamp() }, { merge: true });
      await addDoc(collection(db, 'issues', docRef.id, 'movements'), { status: 'رصد البلاغ', description: `تم استلام البلاغ في النظام وتوليد رقم المتابعة: ${trackingId}.`, institutionName: 'عمران | مركز التحكم الرقمي', timestamp: serverTimestamp(), stage: 'detected' });
      onComplete();
    } catch (error) { console.error("Error submitting issue:", error); }
    finally { setIsSubmitting(false); }
  };

  const nextStep = () => {
    const stepErrors: Record<string, string> = {};
    if (step === 1) {
      if (attachedImages.length === 0 && !audioBlob) stepErrors.media = 'يرجى إرفاق صورة أو تسجيل إفادة صوتية.';
      if (!manualAddress || manualAddress.trim() === '' || manualAddress === 'جاري التحديد...') stepErrors.location = 'يرجى تحديد موقع البلاغ على الخريطة.';
    } else if (step === 2) {
      if (!issueType) stepErrors.issueType = 'يرجى اختيار نوع المشكلة.';
      if (!description || description.trim().length < 10) stepErrors.description = 'يرجى إدخال وصف لا يقل عن ١٠ أحرف.';
    }
    if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return; }
    setErrors({});
    setStep(s => Math.min(s + 1, 3));
  };

  const prevStep = () => { setErrors({}); setStep(s => Math.max(s - 1, 1)); };

  const selectedCategory = CATEGORIES.find(c => c.id === issueType);

  return (
    <div className="h-full flex flex-col bg-white" dir="rtl">
      {/* Step Progress Bar */}
      <div className="px-4 pt-4 pb-2 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300",
                  step === s.id ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" :
                  step > s.id ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                )}>
                  {step > s.id ? <Check size={12} strokeWidth={3} /> : s.id}
                </div>
                <span className={cn("text-xs font-medium hidden sm:block transition-colors", step === s.id ? "text-slate-800 font-bold" : "text-slate-400")}>{s.title}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-px bg-slate-100 relative overflow-hidden">
                  <div className={cn("absolute inset-y-0 right-0 bg-emerald-400 transition-all duration-500", step > s.id ? "left-0" : "left-full")} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && !showOfflineOptions && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-4 space-y-5">
              <div className="text-right">
                <h2 className="text-xl font-black text-slate-900">توثيق البلاغ</h2>
                <p className="text-sm text-slate-400 mt-0.5">أضف صورة أو تسجيل صوتي وحدد الموقع</p>
              </div>

              {/* Media Upload */}
              <div className="grid grid-cols-2 gap-3">
                <input type="file" ref={fileInputRef} accept="image/*" multiple capture="environment" className="hidden" onChange={handleCapture} />
                
                {/* Camera Button */}
                <button disabled={isAnalyzing} onClick={() => fileInputRef.current?.click()}
                  className={cn("aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95",
                    errors.media && attachedImages.length === 0 && !audioBlob ? "border-rose-300 bg-rose-50" :
                    attachedImages.length > 0 ? "border-emerald-300 bg-emerald-50" : "border-dashed border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50"
                  )}
                >
                  {isAnalyzing ? (
                    <><Loader2 className="animate-spin text-emerald-500" size={24} /><span className="text-[10px] text-emerald-600 font-bold">جاري التحليل...</span></>
                  ) : (
                    <>
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", attachedImages.length > 0 ? "bg-emerald-500 text-white" : "bg-white text-slate-400 shadow-sm")}>
                        <Camera size={20} />
                      </div>
                      <span className="text-xs font-bold text-slate-700">الكاميرا</span>
                      {attachedImages.length > 0 && <span className="text-[10px] text-emerald-600 font-bold">{attachedImages.length} صور</span>}
                    </>
                  )}
                </button>

                {/* Audio Button */}
                <button onClick={toggleRecording}
                  className={cn("aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95",
                    isRecording ? "border-rose-400 bg-rose-50" :
                    audioBlob ? "border-emerald-300 bg-emerald-50" : "border-dashed border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center relative", isRecording ? "bg-rose-500 text-white" : audioBlob ? "bg-emerald-500 text-white" : "bg-white text-slate-400 shadow-sm")}>
                    {audioBlob && !isRecording ? <Check size={20} /> : <Mic size={20} />}
                    {isRecording && <div className="absolute inset-0 bg-rose-400 rounded-xl animate-ping opacity-30" />}
                  </div>
                  <span className={cn("text-xs font-bold", isRecording ? "text-rose-600" : audioBlob ? "text-emerald-600" : "text-slate-700")}>
                    {isRecording ? formatDuration(recordingDuration) : audioBlob ? 'مُسجَّل' : 'صوتي'}
                  </span>
                </button>
              </div>

              {/* Error */}
              {errors.media && <p className="text-rose-500 text-xs font-medium text-right">{errors.media}</p>}

              {/* Image Preview Strip */}
              {attachedImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {attachedImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden group">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <X size={14} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Map */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button onClick={() => { if (navigator.geolocation) navigator.geolocation.getCurrentPosition((pos) => { const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setCurrentCoords(c); reverseGeocode(c.lat, c.lng); }); }}
                    className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold px-3 py-1.5 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all active:scale-95">
                    <Locate size={13} /> موقعي الحالي
                  </button>
                  <span className="text-xs font-bold text-slate-500">الموقع</span>
                </div>

                <div className={cn("rounded-2xl overflow-hidden border-2 h-48 relative", errors.location ? "border-rose-300" : "border-slate-100")}>
                  <MapContainer center={[currentCoords.lat, currentCoords.lng]} zoom={13} className="w-full h-full z-0" scrollWheelZoom={true}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapController coords={currentCoords} />
                    <MapEvents />
                    <Marker position={[currentCoords.lat, currentCoords.lng]} />
                  </MapContainer>
                </div>

                <div className={cn("flex items-center gap-3 p-3 bg-slate-50 rounded-xl border", errors.location ? "border-rose-200" : "border-slate-100")}>
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", errors.location ? "bg-rose-500 text-white" : "bg-emerald-500 text-white")}>
                    {addressLoading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                  </div>
                  <input type="text" value={addressLoading ? "جاري التحديد..." : manualAddress} onChange={(e) => setManualAddress(e.target.value)}
                    disabled={addressLoading} placeholder="أدخل العنوان..."
                    className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none text-right" />
                </div>
                {errors.location && <p className="text-rose-500 text-xs font-medium text-right">{errors.location}</p>}
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-4 space-y-5">
              <div className="text-right">
                <h2 className="text-xl font-black text-slate-900">تفاصيل المشكلة</h2>
                <p className="text-sm text-slate-400 mt-0.5">حدد النوع وأضف وصفاً واضحاً</p>
              </div>

              {/* Interaction Type Tabs */}
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                {[{ id: 'report', label: 'بلاغ' }, { id: 'suggestion', label: 'مقترح' }, { id: 'inquiry', label: 'استفسار' }].map(tab => (
                  <button key={tab.id} onClick={() => setInteractionType(tab.id as any)}
                    className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all", interactionType === tab.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 text-right">نوع المشكلة</p>
                <div className={cn("grid grid-cols-5 gap-2 p-2 rounded-2xl", errors.issueType ? "bg-rose-50 border border-rose-200" : "")}>
                  {CATEGORIES.map(cat => (
                    <button key={cat.id}
                      onClick={() => { setIssueType(cat.id); setErrors(prev => { const n = { ...prev }; delete n.issueType; return n; }); }}
                      className={cn("flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all active:scale-95",
                        issueType === cat.id ? "border-emerald-400 bg-emerald-50 shadow-sm" : "border-transparent bg-white hover:border-slate-200"
                      )}
                    >
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", issueType === cat.id ? "bg-emerald-500 text-white" : `${cat.bg} ${cat.color}`)}>
                        {React.cloneElement(cat.icon as any, { size: 16 })}
                      </div>
                      <span className={cn("text-[10px] font-bold", issueType === cat.id ? "text-emerald-700" : "text-slate-600")}>{cat.label}</span>
                    </button>
                  ))}
                </div>
                {errors.issueType && <p className="text-rose-500 text-xs font-medium text-right">{errors.issueType}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={isTranscribing ? stopTranscriptionRecording : startTranscriptionRecording}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all", isTranscribing ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600")}>
                    {isTranscribing ? <Loader2 size={12} className="animate-spin" /> : <Mic size={12} />}
                    {isTranscribing ? 'إيقاف' : 'نص صوتي'}
                  </button>
                  <p className="text-xs font-bold text-slate-500">الوصف</p>
                </div>
                <textarea rows={4} placeholder="اوصف المشكلة بوضوح..."
                  className={cn("w-full px-4 py-3 rounded-2xl border-2 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-right resize-none",
                    errors.description ? "border-rose-300 bg-rose-50" : "border-slate-100"
                  )}
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); if (errors.description && e.target.value.length >= 10) setErrors(prev => { const n = { ...prev }; delete n.description; return n; }); }}
                />
                {errors.description && <p className="text-rose-500 text-xs font-medium text-right">{errors.description}</p>}
              </div>

              {/* Severity */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 text-right">درجة الخطورة</p>
                <div className="grid grid-cols-3 gap-2">
                  {[{ v: 1, label: 'عادي', color: 'emerald' }, { v: 2, label: 'مهم', color: 'amber' }, { v: 3, label: 'عاجل', color: 'rose' }].map(s => (
                    <button key={s.v} onClick={() => setSeverity(s.v as any)}
                      className={cn("py-2.5 rounded-xl text-xs font-bold border-2 transition-all",
                        severity === s.v ? (s.color === 'emerald' ? "bg-emerald-500 border-emerald-400 text-white shadow-sm" : s.color === 'amber' ? "bg-amber-500 border-amber-400 text-white shadow-sm" : "bg-rose-500 border-rose-400 text-white shadow-sm") : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional fields */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 text-right">تفاصيل إضافية (اختياري)</p>
                <input type="text" placeholder="نوع الضرر — مثلاً: حفرة، تسرب مياه..."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-right"
                  value={damageType} onChange={(e) => setDamageType(e.target.value)} />
                <textarea rows={2} placeholder="ملاحظات إضافية..."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-right resize-none"
                  value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </motion.div>
          )}

          {/* STEP 3 - Review */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-4 space-y-4 pb-8">
              <div className="text-right">
                <h2 className="text-xl font-black text-slate-900">مراجعة ونشر</h2>
                <p className="text-sm text-slate-400 mt-0.5">راجع البيانات قبل الإرسال</p>
              </div>

              {/* Tracking ID */}
              <div className="bg-emerald-600 rounded-2xl p-4 flex items-center justify-between">
                <ShieldCheck size={24} className="text-emerald-200" />
                <div className="text-right">
                  <p className="text-emerald-200 text-xs font-bold">رقم المتابعة</p>
                  <p className="text-white font-black font-mono text-lg tracking-wider">{trackingId}</p>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {attachedImages.length > 0 && (
                  <div className="h-36 overflow-hidden">
                    <img src={attachedImages[0]} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    {selectedCategory && (
                      <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold", selectedCategory.bg, selectedCategory.color)}>
                        {React.cloneElement(selectedCategory.icon as any, { size: 12 })}
                        {selectedCategory.label}
                      </div>
                    )}
                    <div className={cn("px-2.5 py-1 rounded-lg text-xs font-bold", severity === 3 ? "bg-rose-50 text-rose-600" : severity === 2 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                      {severity === 3 ? '🔴 عاجل' : severity === 2 ? '🟡 مهم' : '🟢 عادي'}
                    </div>
                  </div>

                  <p className="text-sm font-medium text-slate-700 text-right leading-relaxed">{description || 'لا يوجد وصف.'}</p>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
                    <span className="text-xs text-slate-500 truncate flex-1 text-right">{manualAddress}</span>
                    <MapPin size={12} className="text-emerald-500 shrink-0" />
                  </div>

                  {attachedImages.length > 1 && (
                    <div className="flex gap-1.5">
                      {attachedImages.slice(1, 4).map((img, i) => (
                        <div key={i} className="w-12 h-12 rounded-xl overflow-hidden">
                          <img src={img} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {attachedImages.length > 4 && <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">+{attachedImages.length - 4}</div>}
                    </div>
                  )}

                  {audioBlob && (
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                      <Mic size={14} className="text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-700">إفادة صوتية مرفقة</span>
                    </div>
                  )}

                  {(damageType || notes) && (
                    <div className="pt-2 border-t border-slate-50 space-y-1.5 text-right">
                      {damageType && <p className="text-xs text-slate-500"><span className="font-bold">نوع الضرر:</span> {damageType}</p>}
                      {notes && <p className="text-xs text-slate-500"><span className="font-bold">ملاحظات:</span> {notes}</p>}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Offline Mode */}
          {showOfflineOptions && (
            <motion.div key="offline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-4">
              <div className="text-right">
                <h2 className="text-xl font-black text-slate-900">إرسال بدون إنترنت</h2>
                <p className="text-sm text-slate-400 mt-0.5">استخدم SMS أو USSD لرفع البلاغ</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-right">
                <p className="text-[10px] text-slate-400 font-bold mb-1">مسودة البلاغ:</p>
                <p className="text-xs font-mono text-slate-700">{`بلاغ: ${issueType || '[نوع]'} في ${manualAddress || '[الموقع]'} - ${description || '[التفاصيل]'}`}</p>
              </div>

              <button onClick={sendViaSMS} className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 shadow-md">
                <MessageSquare size={16} /> إرسال عبر SMS إلى 7722
              </button>

              <div className="text-center p-4 bg-white rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-1">أو اطلب الكود التفاعلي</p>
                <p className="text-2xl font-black text-amber-600 font-mono">*772#</p>
                <p className="text-[10px] text-slate-400 mt-1">مجاني — زين · MTN · سوداني</p>
              </div>

              <button onClick={() => setShowOfflineOptions(false)} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-sm text-slate-400 font-bold hover:border-emerald-400 hover:text-emerald-500 transition-all">
                العودة للتطبيق
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      {!showOfflineOptions && (
        <div className="p-4 bg-white border-t border-slate-100 space-y-2 safe-area-pb">
          <div className="flex gap-2">
            {step > 1 && (
              <button onClick={prevStep} className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all active:scale-90 shrink-0">
                <ArrowRight size={18} strokeWidth={2.5} className="rotate-180" />
              </button>
            )}
            <button onClick={step === 3 ? () => setShowConfirmation(true) : nextStep} disabled={isSubmitting}
              className="flex-1 h-12 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 active:scale-95 shadow-md shadow-emerald-200"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> جاري الإرسال... {uploadProgress}%</>
              ) : step === 3 ? (
                <><Send size={16} /> إرسال البلاغ</>
              ) : (
                <>التالي <ArrowRight size={16} className="rotate-180" /></>
              )}
            </button>
          </div>
          {step === 1 && (
            <button onClick={() => setShowOfflineOptions(true)} className="w-full text-center text-[11px] text-slate-400 hover:text-emerald-600 transition-colors font-medium py-1">
              لا يوجد اتصال؟ استخدم SMS / USSD
            </button>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirmation(false)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 space-y-5 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={28} className="text-emerald-500" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-slate-900">تأكيد إرسال البلاغ</h3>
                <p className="text-sm text-slate-500 font-medium">هل راجعت جميع البيانات؟ سيُرسَل البلاغ فوراً إلى الجهات المختصة.</p>
              </div>
              <div className="space-y-2">
                <button onClick={handleSubmit} className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-2xl text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                  <Check size={16} /> نعم، اعتماد وإرسال
                </button>
                <button onClick={() => setShowConfirmation(false)} className="w-full py-3 bg-slate-100 text-slate-500 font-bold rounded-2xl text-sm hover:bg-slate-200 transition-all">
                  مراجعة مجدداً
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
