// /**
//  * Tenders.tsx — نظام المناقصات لمنصة عمران
//  *
//  * الاستخدام في App.tsx:
//  *   import Tenders from './components/Tenders';
//  *   {activeView === 'tenders' && <Tenders role={role} />}
//  *
//  * الأدوار:
//  *   citizen  → يشوف المناقصات المفتوحة فقط
//  *   official → ينشر مناقصات + يراجع العروض + يختار الفائز
//  *   partner  → يقدّم عروض (bids) مثل المواطن لكن بصلاحية شركة
//  */

// import { useState, useMemo } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import {
//   Gavel, Plus, X, ChevronLeft, ChevronRight,
//   MapPin, Clock, Building2, Banknote, FileText,
//   CheckCircle2, Eye, Send, Filter, Search,
//   Droplets, Zap, Construction, Trash2,
//   AlertTriangle, Trophy, Star, Users,
//   CalendarClock, ArrowUpRight, MoreHorizontal,
//   ShieldCheck, BadgeCheck, CircleDot, Sparkles
// } from 'lucide-react';
// import { cn } from '../lib/utils';
// import { REGIONS, INSTITUTIONS } from '../constants';

// // ─── Types ────────────────────────────────────────────────────────────────────

// type IssueType   = 'road' | 'water' | 'electricity' | 'waste' | 'other';
// type TenderStatus = 'open' | 'reviewing' | 'awarded' | 'closed';
// type BidStatus   = 'pending' | 'shortlisted' | 'awarded' | 'rejected';
// type UserRole    = 'citizen' | 'official' | 'partner';

// interface Tender {
//   id: string;
//   issueId: string;
//   institutionId: string;
//   institutionName: string;
//   title: string;
//   description: string;
//   type: IssueType;
//   regionId: string;
//   regionName: string;
//   budgetMin: number;
//   budgetMax: number;
//   currency: 'SDG' | 'USD';
//   deadlineAt: string;      // ISO date string (mock)
//   status: TenderStatus;
//   bidsCount: number;
//   awardedBidId?: string;
//   requirements: string[];
//   createdAt: string;
// }

// interface Bid {
//   id: string;
//   tenderId: string;
//   contractorName: string;
//   companyName?: string;
//   contactInfo: string;
//   proposedAmount: number;
//   currency: 'SDG' | 'USD';
//   estimatedDays: number;
//   plan: string;
//   qualifications: string;
//   status: BidStatus;
//   submittedAt: string;
// }

// // ─── Config ───────────────────────────────────────────────────────────────────

// const TYPE_CONFIG: Record<IssueType, {
//   label: string;
//   Icon: React.FC<{ size?: number; className?: string }>;
//   color: string; bg: string; border: string; accent: string;
// }> = {
//   water:       { label:'مياه',      Icon:Droplets,     color:'text-sky-700',    bg:'bg-sky-50',    border:'border-sky-200',    accent:'#0ea5e9' },
//   electricity: { label:'كهرباء',   Icon:Zap,          color:'text-amber-700',  bg:'bg-amber-50',  border:'border-amber-200',  accent:'#f59e0b' },
//   road:        { label:'طرق',      Icon:Construction, color:'text-slate-700',  bg:'bg-slate-100', border:'border-slate-300',  accent:'#6b7280' },
//   waste:       { label:'نفايات',   Icon:Trash2,       color:'text-emerald-700',bg:'bg-emerald-50',border:'border-emerald-200',accent:'#10b981' },
//   other:       { label:'أخرى',     Icon:AlertTriangle,color:'text-violet-700', bg:'bg-violet-50', border:'border-violet-200', accent:'#8b5cf6' },
// };

// const STATUS_CONFIG: Record<TenderStatus, { label:string; dot:string; badge:string }> = {
//   open:      { label:'مفتوحة',       dot:'bg-emerald-500 animate-pulse', badge:'bg-emerald-50 text-emerald-700 border-emerald-200' },
//   reviewing: { label:'قيد المراجعة', dot:'bg-amber-500',                 badge:'bg-amber-50   text-amber-700   border-amber-200'   },
//   awarded:   { label:'تم الترسية',   dot:'bg-blue-500',                  badge:'bg-blue-50    text-blue-700    border-blue-200'    },
//   closed:    { label:'مغلقة',        dot:'bg-slate-400',                 badge:'bg-slate-100  text-slate-500   border-slate-200'   },
// };

// const BID_STATUS_CONFIG: Record<BidStatus, { label:string; color:string }> = {
//   pending:     { label:'قيد الدراسة', color:'text-amber-600 bg-amber-50 border-amber-200'   },
//   shortlisted: { label:'مرشح',        color:'text-blue-600  bg-blue-50  border-blue-200'    },
//   awarded:     { label:'فائز',         color:'text-emerald-600 bg-emerald-50 border-emerald-200' },
//   rejected:    { label:'مرفوض',       color:'text-slate-400 bg-slate-50  border-slate-200'  },
// };

// // ─── Mock Data ────────────────────────────────────────────────────────────────

// const MOCK_TENDERS: Tender[] = [
//   {
//     id:'t1', issueId:'i1',
//     institutionId:'water', institutionName:'هيئة مياه ولاية الخرطوم',
//     title:'صيانة شبكة مياه حي العمارات',
//     description:'إعادة تأهيل خطوط الأنابيب الرئيسية في حي العمارات التي يبلغ عمرها أكثر من 30 عاماً، وتشمل الأعمال استبدال الأنابيب الصدئة وتركيب محابس جديدة وإعادة الرصف.',
//     type:'water', regionId:'khartoum', regionName:'ولاية الخرطوم',
//     budgetMin:500000, budgetMax:800000, currency:'SDG',
//     deadlineAt:'2026-06-15', status:'open', bidsCount:7,
//     requirements:['خبرة لا تقل عن 5 سنوات في شبكات المياه','شهادة ISO للجودة','ضمان بنكي 10%','فريق هندسي معتمد'],
//     createdAt:'2026-05-01',
//   },
//   {
//     id:'t2', issueId:'i2',
//     institutionId:'roads', institutionName:'هيئة الطرق والجسور',
//     title:'رصف وتأهيل الطريق الدائري الغربي — المرحلة الثانية',
//     description:'تشمل الأعمال رصف 4.2 كيلومتر من الطريق الدائري الغربي، وتركيب إنارة طرق، وتحديد مسارات للمشاة وفق المواصفات السودانية المعتمدة.',
//     type:'road', regionId:'khartoum', regionName:'ولاية الخرطوم',
//     budgetMin:2000000, budgetMax:3500000, currency:'SDG',
//     deadlineAt:'2026-06-30', status:'reviewing', bidsCount:12,
//     requirements:['تصنيف مقاولات درجة أولى','معدات هندسية حديثة','خبرة في مشاريع طرق مشابهة','ضمان صيانة سنتين'],
//     createdAt:'2026-04-20',
//   },
//   {
//     id:'t3', issueId:'i3',
//     institutionId:'electricity', institutionName:'الشركة السودانية لتوزيع الكهرباء',
//     title:'تركيب شبكة إنارة أعمدة لحي الصحافة',
//     description:'توريد وتركيب 180 عمود إنارة LED موفرة للطاقة في حي الصحافة، مع توصيل الكابلات الأرضية وتوريد لوحات التحكم الذكية.',
//     type:'electricity', regionId:'khartoum', regionName:'ولاية الخرطوم',
//     budgetMin:350000, budgetMax:500000, currency:'SDG',
//     deadlineAt:'2026-07-10', status:'awarded', bidsCount:9,
//     awardedBidId:'b2',
//     requirements:['ترخيص من هيئة الكهرباء','خبرة في شبكات الإنارة','ضمان المعدات 3 سنوات'],
//     createdAt:'2026-04-10',
//   },
//   {
//     id:'t4', issueId:'i4',
//     institutionId:'waste', institutionName:'جهاز حماية البيئة',
//     title:'تشغيل محطة فرز نفايات بحري',
//     description:'تشغيل وإدارة محطة فرز النفايات الصلبة في بحري لمدة سنتين، تشمل توفير العمالة والمعدات وإعداد التقارير الدورية.',
//     type:'waste', regionId:'khartoum', regionName:'ولاية الخرطوم',
//     budgetMin:1200000, budgetMax:1800000, currency:'SDG',
//     deadlineAt:'2026-05-30', status:'open', bidsCount:4,
//     requirements:['خبرة في إدارة النفايات','رخصة بيئية سارية','خطة تشغيلية مفصّلة','كادر فني متخصص'],
//     createdAt:'2026-05-05',
//   },
//   {
//     id:'t5', issueId:'i5',
//     institutionId:'water', institutionName:'هيئة مياه ولاية الخرطوم',
//     title:'تأهيل محطة ضخ مياه الكلاكلة',
//     description:'استبدال مضخات المحطة الرئيسية وتجديد الشبكة الكهربائية الداخلية وتركيب نظام مراقبة SCADA لتحسين الكفاءة التشغيلية.',
//     type:'water', regionId:'khartoum', regionName:'ولاية الخرطوم',
//     budgetMin:900000, budgetMax:1400000, currency:'SDG',
//     deadlineAt:'2026-08-01', status:'open', bidsCount:2,
//     requirements:['خبرة في محطات الضخ','مورّد معتمد للمضخات','فريق كهرباء صناعية','ضمان تشغيلي سنة'],
//     createdAt:'2026-05-08',
//   },
// ];

// const MOCK_BIDS: Bid[] = [
//   { id:'b1', tenderId:'t1', contractorName:'م. يوسف عبدالله', companyName:'شركة النيل للإنشاءات', contactInfo:'0912345678', proposedAmount:620000, currency:'SDG', estimatedDays:45, plan:'سيتم تنفيذ العمل على مرحلتين: الأولى استبدال الخطوط الرئيسية، والثانية الخطوط الفرعية مع ضمان عدم انقطاع الخدمة.', qualifications:'15 سنة خبرة — نفّذنا مشاريع مياه في كل ولايات السودان', status:'shortlisted', submittedAt:'2026-05-03' },
//   { id:'b2', tenderId:'t3', contractorName:'م. سارة إبراهيم', companyName:'مجموعة الضوء للكهرباء', contactInfo:'0922334455', proposedAmount:420000, currency:'SDG', estimatedDays:60, plan:'توريد أعمدة LED مستوردة مباشرة من المصنع مع ضمان 5 سنوات وتركيب متكامل.', qualifications:'حاصلون على ISO 9001 — نفّذنا 3 مشاريع مشابهة في الخرطوم', status:'awarded', submittedAt:'2026-04-18' },
//   { id:'b3', tenderId:'t1', contractorName:'مبارك التوم', contactInfo:'0987654321', proposedAmount:580000, currency:'SDG', estimatedDays:60, plan:'نملك المعدات والفريق الجاهز، ويمكن البدء خلال أسبوع من التوقيع.', qualifications:'خبرة 8 سنوات في شبكات المياه', status:'pending', submittedAt:'2026-05-05' },
//   { id:'b4', tenderId:'t1', contractorName:'م. أمين حسن', companyName:'شركة الخرطوم للمقاولات', contactInfo:'0911223344', proposedAmount:750000, currency:'SDG', estimatedDays:30, plan:'تنفيذ متسارع بفريق مزدوج لضمان الانتهاء في وقت قياسي.', qualifications:'تصنيف درجة أولى من وزارة التشييد', status:'pending', submittedAt:'2026-05-06' },
//   { id:'b5', tenderId:'t2', contractorName:'م. حنان الأمين', companyName:'شركة الطرق المتقدمة', contactInfo:'0933445566', proposedAmount:2800000, currency:'SDG', estimatedDays:90, plan:'تنفيذ المشروع وفق أحدث مواصفات الطرق مع استخدام آسفلت عالي الجودة.', qualifications:'نفّذنا طريق الإنقاذ الغربي بنجاح', status:'shortlisted', submittedAt:'2026-04-25' },
// ];

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function formatAmount(n: number, currency: string) {
//   if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}م ${currency}`;
//   if (n >= 1_000)     return `${(n/1_000).toFixed(0)}ألف ${currency}`;
//   return `${n} ${currency}`;
// }

// function daysLeft(deadline: string) {
//   const diff = new Date(deadline).getTime() - Date.now();
//   const days = Math.ceil(diff / 86400000);
//   return days;
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function StatusBadge({ status }: { status: TenderStatus }) {
//   const cfg = STATUS_CONFIG[status];
//   return (
//     <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border', cfg.badge)}>
//       <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
//       {cfg.label}
//     </span>
//   );
// }

// function TypeTag({ type }: { type: IssueType }) {
//   const cfg = TYPE_CONFIG[type];
//   const Icon = cfg.Icon;
//   return (
//     <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border', cfg.bg, cfg.color, cfg.border)}>
//       <Icon size={10} />
//       {cfg.label}
//     </span>
//   );
// }

// // ─── Bid Submission Modal ─────────────────────────────────────────────────────

// function BidModal({ tender, onClose, onSubmit }: {
//   tender: Tender;
//   onClose: () => void;
//   onSubmit: (bid: Omit<Bid,'id'|'tenderId'|'status'|'submittedAt'>) => void;
// }) {
//   const [step, setStep]         = useState<1|2|3>(1);
//   const [submitted, setSubmitted] = useState(false);
//   const [form, setForm]         = useState({
//     contractorName:'', companyName:'', contactInfo:'',
//     proposedAmount:'', estimatedDays:'', plan:'', qualifications:'',
//   });

//   const cfg = TYPE_CONFIG[tender.type];

//   const canNext1 = form.contractorName && form.contactInfo;
//   const canNext2 = form.proposedAmount && form.estimatedDays && form.plan;

//   const handleSubmit = () => {
//     setSubmitted(true);
//     setTimeout(() => {
//       onSubmit({
//         contractorName: form.contractorName,
//         companyName:    form.companyName || undefined,
//         contactInfo:    form.contactInfo,
//         proposedAmount: Number(form.proposedAmount),
//         currency:       tender.currency,
//         estimatedDays:  Number(form.estimatedDays),
//         plan:           form.plan,
//         qualifications: form.qualifications,
//       });
//     }, 2000);
//   };

//   return (
//     <motion.div
//       initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
//       className="fixed inset-0 z-[500] bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
//         transition={{ type:'spring', stiffness:300, damping:30 }}
//         className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
//         onClick={e => e.stopPropagation()}
//       >
//         {/* Handle */}
//         <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 shrink-0 sm:hidden" />

//         {/* Header */}
//         <div className="px-5 py-4 border-b border-slate-100 shrink-0 flex items-center justify-between">
//           <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">
//             <X size={16} />
//           </button>
//           <div className="text-center">
//             <p className="text-xs font-black text-slate-400">تقديم عرض</p>
//             {!submitted && (
//               <div className="flex justify-center gap-1.5 mt-1.5">
//                 {[1,2,3].map(s => (
//                   <div key={s} className={cn('h-1 rounded-full transition-all duration-300',
//                     step===s ? 'w-5 bg-emerald-500' : step>s ? 'w-3 bg-emerald-300' : 'w-3 bg-slate-200'
//                   )} />
//                 ))}
//               </div>
//             )}
//           </div>
//           <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', cfg.bg)}>
//             <cfg.Icon size={15} className={cfg.color} />
//           </div>
//         </div>

//         {/* Tender title strip */}
//         {!submitted && (
//           <div className={cn('px-5 py-3 border-b shrink-0', cfg.bg, cfg.border)}>
//             <p className="text-xs font-black text-slate-800 text-right truncate">{tender.title}</p>
//             <p className={cn('text-[10px] font-medium text-right mt-0.5', cfg.color)}>{tender.institutionName}</p>
//           </div>
//         )}

//         {/* Body */}
//         <div className="flex-1 overflow-y-auto">
//           <AnimatePresence mode="wait">

//             {/* Success */}
//             {submitted && (
//               <motion.div key="success" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
//                 className="p-8 flex flex-col items-center text-center gap-5">
//                 <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',delay:0.1}}
//                   className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
//                   <CheckCircle2 size={40} className="text-white" />
//                 </motion.div>
//                 <div>
//                   <h3 className="text-xl font-black text-slate-900 mb-2">تم إرسال عرضك! 🎉</h3>
//                   <p className="text-sm text-slate-500 leading-relaxed">
//                     سيتم مراجعة عرضك من قِبَل {tender.institutionName}. سنتواصل معك على رقم {form.contactInfo}.
//                   </p>
//                 </div>
//                 <div className={cn('rounded-2xl p-4 w-full text-right border', cfg.bg, cfg.border)}>
//                   <p className={cn('text-xs font-medium mb-1', cfg.color)}>مبلغ عرضك</p>
//                   <p className={cn('text-2xl font-black', cfg.color)}>
//                     {formatAmount(Number(form.proposedAmount), tender.currency)}
//                   </p>
//                   <p className="text-[10px] text-slate-400 mt-1">مدة التنفيذ: {form.estimatedDays} يوم</p>
//                 </div>
//               </motion.div>
//             )}

//             {/* Step 1 — بياناتك */}
//             {!submitted && step===1 && (
//               <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
//                 className="p-5 space-y-4" dir="rtl">
//                 <div className="text-right">
//                   <h3 className="font-black text-slate-900 text-base">بياناتك الشخصية</h3>
//                   <p className="text-xs text-slate-400 mt-0.5">اسمك وطريقة التواصل معك</p>
//                 </div>

//                 {[
//                   { label:'اسمك الكامل *',      key:'contractorName', placeholder:'م. اسمك هنا...' },
//                   { label:'اسم الشركة (إن وجد)', key:'companyName',    placeholder:'شركة / مؤسسة / مكتب هندسي' },
//                   { label:'رقم التواصل *',       key:'contactInfo',   placeholder:'09xxxxxxxx' },
//                 ].map(f => (
//                   <div key={f.key} className="space-y-1.5">
//                     <label className="text-xs font-bold text-slate-600 block text-right">{f.label}</label>
//                     <input
//                       value={form[f.key as keyof typeof form]}
//                       onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
//                       placeholder={f.placeholder}
//                       className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all placeholder:text-slate-300 text-right"
//                     />
//                   </div>
//                 ))}

//                 <button onClick={() => setStep(2)} disabled={!canNext1}
//                   className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 shadow-sm shadow-emerald-200">
//                   التالي <ChevronLeft size={16} />
//                 </button>
//               </motion.div>
//             )}

//             {/* Step 2 — عرضك المالي والخطة */}
//             {!submitted && step===2 && (
//               <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
//                 className="p-5 space-y-4" dir="rtl">
//                 <div className="text-right">
//                   <h3 className="font-black text-slate-900 text-base">العرض المالي والخطة</h3>
//                   <p className="text-xs text-slate-400 mt-0.5">كم تطلب وكيف ستنفّذ المشروع؟</p>
//                 </div>

//                 {/* Budget reference */}
//                 <div className={cn('flex items-center justify-between p-3 rounded-xl border', cfg.bg, cfg.border)}>
//                   <span className={cn('text-xs font-bold', cfg.color)}>
//                     {formatAmount(tender.budgetMin, tender.currency)} — {formatAmount(tender.budgetMax, tender.currency)}
//                   </span>
//                   <span className="text-[10px] text-slate-500 font-medium">نطاق الميزانية</span>
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="space-y-1.5">
//                     <label className="text-xs font-bold text-slate-600 block text-right">مبلغ العرض ({tender.currency}) *</label>
//                     <input
//                       type="number" value={form.proposedAmount}
//                       onChange={e => setForm(p => ({...p, proposedAmount:e.target.value}))}
//                       placeholder="0"
//                       className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all text-right"
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-xs font-bold text-slate-600 block text-right">مدة التنفيذ (أيام) *</label>
//                     <input
//                       type="number" value={form.estimatedDays}
//                       onChange={e => setForm(p => ({...p, estimatedDays:e.target.value}))}
//                       placeholder="60"
//                       className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all text-right"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-1.5">
//                   <label className="text-xs font-bold text-slate-600 block text-right">خطة التنفيذ *</label>
//                   <textarea
//                     value={form.plan}
//                     onChange={e => setForm(p => ({...p, plan:e.target.value}))}
//                     placeholder="اشرح كيف ستنفّذ المشروع خطوة بخطوة..."
//                     rows={4}
//                     className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all placeholder:text-slate-300 text-right resize-none"
//                   />
//                 </div>

//                 <div className="flex gap-2">
//                   <button onClick={() => setStep(1)}
//                     className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all shrink-0">
//                     <ChevronLeft size={18} className="rotate-180" />
//                   </button>
//                   <button onClick={() => setStep(3)} disabled={!canNext2}
//                     className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 shadow-sm shadow-emerald-200">
//                     التالي <ChevronLeft size={16} />
//                   </button>
//                 </div>
//               </motion.div>
//             )}

//             {/* Step 3 — مراجعة وإرسال */}
//             {!submitted && step===3 && (
//               <motion.div key="s3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
//                 className="p-5 space-y-4" dir="rtl">
//                 <div className="text-right">
//                   <h3 className="font-black text-slate-900 text-base">مراجعة العرض</h3>
//                   <p className="text-xs text-slate-400 mt-0.5">المؤهلات ثم تأكيد الإرسال</p>
//                 </div>

//                 <div className="space-y-1.5">
//                   <label className="text-xs font-bold text-slate-600 block text-right">مؤهلاتك وخبراتك السابقة</label>
//                   <textarea
//                     value={form.qualifications}
//                     onChange={e => setForm(p => ({...p, qualifications:e.target.value}))}
//                     placeholder="اذكر مشاريع سابقة مشابهة، شهادات، أو أي معلومات تدعم عرضك..."
//                     rows={3}
//                     className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all placeholder:text-slate-300 text-right resize-none"
//                   />
//                 </div>

//                 {/* Summary */}
//                 <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 border border-slate-100">
//                   {[
//                     { label:'المتقدم',         val: form.companyName ? `${form.contractorName} — ${form.companyName}` : form.contractorName },
//                     { label:'المبلغ المقترح',  val: formatAmount(Number(form.proposedAmount), tender.currency) },
//                     { label:'مدة التنفيذ',     val: `${form.estimatedDays} يوم` },
//                     { label:'التواصل',         val: form.contactInfo },
//                   ].map(row => (
//                     <div key={row.label} className="flex items-center justify-between gap-3">
//                       <span className="text-xs font-bold text-slate-700 text-right flex-1 truncate">{row.val}</span>
//                       <span className="text-[10px] text-slate-400 font-medium shrink-0">{row.label}</span>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="flex gap-2">
//                   <button onClick={() => setStep(2)}
//                     className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all shrink-0">
//                     <ChevronLeft size={18} className="rotate-180" />
//                   </button>
//                   <button onClick={handleSubmit}
//                     className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm shadow-emerald-200">
//                     <Send size={15} /> أرسل العرض
//                   </button>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ─── Bids Panel (للمسؤول) ─────────────────────────────────────────────────────

// function BidsPanel({ tender, bids, onClose, onAward }: {
//   tender: Tender;
//   bids: Bid[];
//   onClose: () => void;
//   onAward: (bidId: string) => void;
// }) {
//   const tenderBids = bids.filter(b => b.tenderId === tender.id);
//   const cfg = TYPE_CONFIG[tender.type];

//   return (
//     <motion.div
//       initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
//       className="fixed inset-0 z-[500] bg-slate-900/50 backdrop-blur-sm flex items-end lg:items-center justify-center p-0 lg:p-8"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
//         transition={{type:'spring',stiffness:300,damping:30}}
//         className="bg-white w-full max-w-2xl rounded-t-[2rem] lg:rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
//         onClick={e => e.stopPropagation()}
//       >
//         {/* Handle */}
//         <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 shrink-0 lg:hidden" />

//         {/* Header */}
//         <div className="px-5 py-4 border-b border-slate-100 shrink-0" dir="rtl">
//           <div className="flex items-center justify-between">
//             <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
//               <X size={16} />
//             </button>
//             <div className="text-right">
//               <h3 className="font-black text-slate-900 text-sm">{tender.title}</h3>
//               <p className="text-[10px] text-slate-400 mt-0.5">{tenderBids.length} عرض مقدَّم</p>
//             </div>
//             <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', cfg.bg)}>
//               <cfg.Icon size={15} className={cfg.color} />
//             </div>
//           </div>
//         </div>

//         {/* Bids list */}
//         <div className="flex-1 overflow-y-auto divide-y divide-slate-50" dir="rtl">
//           {tenderBids.length === 0 ? (
//             <div className="py-16 text-center">
//               <Gavel size={32} className="text-slate-200 mx-auto mb-3" />
//               <p className="text-sm text-slate-400">لا توجد عروض بعد</p>
//             </div>
//           ) : tenderBids.map(bid => (
//             <div key={bid.id} className="p-4 space-y-3">
//               {/* Bid header */}
//               <div className="flex items-start justify-between gap-3">
//                 <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-lg border', BID_STATUS_CONFIG[bid.status].color)}>
//                   {BID_STATUS_CONFIG[bid.status].label}
//                 </span>
//                 <div className="text-right">
//                   <p className="font-black text-slate-900 text-sm">{bid.contractorName}</p>
//                   {bid.companyName && <p className="text-[10px] text-slate-400">{bid.companyName}</p>}
//                 </div>
//               </div>

//               {/* Bid stats */}
//               <div className="grid grid-cols-3 gap-2">
//                 {[
//                   { label:'المبلغ',       val: formatAmount(bid.proposedAmount, bid.currency) },
//                   { label:'مدة التنفيذ',  val: `${bid.estimatedDays} يوم` },
//                   { label:'تاريخ التقديم', val: bid.submittedAt },
//                 ].map(s => (
//                   <div key={s.label} className="bg-slate-50 rounded-xl p-2.5 text-right">
//                     <p className="text-[9px] text-slate-400 font-medium">{s.label}</p>
//                     <p className="text-xs font-black text-slate-800 mt-0.5">{s.val}</p>
//                   </div>
//                 ))}
//               </div>

//               {/* Plan */}
//               <div className="bg-slate-50 rounded-xl p-3 text-right">
//                 <p className="text-[9px] text-slate-400 font-medium mb-1">خطة التنفيذ</p>
//                 <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">{bid.plan}</p>
//               </div>

//               {bid.qualifications && (
//                 <div className="text-right">
//                   <p className="text-[9px] text-slate-400 font-medium mb-0.5">المؤهلات</p>
//                   <p className="text-xs text-slate-600 line-clamp-2">{bid.qualifications}</p>
//                 </div>
//               )}

//               {/* Award button */}
//               {tender.status !== 'awarded' && bid.status !== 'rejected' && (
//                 <button
//                   onClick={() => onAward(bid.id)}
//                   className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
//                   <Trophy size={13} /> اختر هذا العرض — رسّي عليه
//                 </button>
//               )}
//               {bid.status === 'awarded' && (
//                 <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
//                   <BadgeCheck size={15} className="text-emerald-600" />
//                   <span className="text-xs font-black text-emerald-700">العرض الفائز</span>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ─── Publish Tender Modal (للمسؤول) ──────────────────────────────────────────

// function PublishModal({ onClose, onPublish }: {
//   onClose: () => void;
//   onPublish: (t: Omit<Tender,'id'|'bidsCount'|'status'|'createdAt'>) => void;
// }) {
//   const [form, setForm] = useState({
//     title:'', description:'', type:'water' as IssueType,
//     regionId:'khartoum', budgetMin:'', budgetMax:'',
//     currency:'SDG' as 'SDG'|'USD', deadlineAt:'',
//     req1:'', req2:'', req3:'', req4:'',
//   });

//   const canSubmit = form.title && form.description && form.budgetMin && form.budgetMax && form.deadlineAt;

//   const handlePublish = () => {
//     const inst = INSTITUTIONS.find(i => i.type === form.type || i.id === form.type);
//     const region = REGIONS.find(r => r.id === form.regionId);
//     onPublish({
//       issueId: `i${Date.now()}`,
//       institutionId:   inst?.id || form.type,
//       institutionName: inst?.name || 'هيئة حكومية',
//       title:       form.title,
//       description: form.description,
//       type:        form.type,
//       regionId:    form.regionId,
//       regionName:  region?.name || '',
//       budgetMin:   Number(form.budgetMin),
//       budgetMax:   Number(form.budgetMax),
//       currency:    form.currency,
//       deadlineAt:  form.deadlineAt,
//       requirements: [form.req1,form.req2,form.req3,form.req4].filter(Boolean),
//       awardedBidId: undefined,
//     });
//   };

//   return (
//     <motion.div
//       initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
//       className="fixed inset-0 z-[500] bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
//         transition={{type:'spring',stiffness:300,damping:30}}
//         className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
//         onClick={e => e.stopPropagation()}
//       >
//         <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 shrink-0 sm:hidden" />

//         <div className="px-5 py-4 border-b border-slate-100 shrink-0 flex items-center justify-between">
//           <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
//             <X size={16} />
//           </button>
//           <div className="flex items-center gap-2">
//             <Gavel size={16} className="text-emerald-600" />
//             <h3 className="font-black text-slate-900 text-sm">نشر مناقصة جديدة</h3>
//           </div>
//           <div className="w-8" />
//         </div>

//         <div className="flex-1 overflow-y-auto p-5 space-y-4" dir="rtl">

//           {/* Type selector */}
//           <div className="space-y-1.5">
//             <label className="text-xs font-bold text-slate-600 block text-right">نوع المشروع</label>
//             <div className="grid grid-cols-5 gap-1.5">
//               {(Object.entries(TYPE_CONFIG) as [IssueType, typeof TYPE_CONFIG[IssueType]][]).map(([key,cfg]) => {
//                 const Icon = cfg.Icon;
//                 return (
//                   <button key={key} onClick={() => setForm(p => ({...p, type:key}))}
//                     className={cn('flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all',
//                       form.type===key ? cn(cfg.bg, cfg.border, cfg.color) : 'border-slate-100 text-slate-400 hover:border-slate-200'
//                     )}>
//                     <Icon size={16} />
//                     <span className="text-[9px] font-bold">{cfg.label}</span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Title & Description */}
//           <div className="space-y-1.5">
//             <label className="text-xs font-bold text-slate-600 block text-right">عنوان المناقصة *</label>
//             <input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))}
//               placeholder="مثال: صيانة شبكة مياه حي الرياض"
//               className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right" />
//           </div>

//           <div className="space-y-1.5">
//             <label className="text-xs font-bold text-slate-600 block text-right">وصف المشروع *</label>
//             <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))}
//               rows={3} placeholder="اشرح نطاق العمل المطلوب..."
//               className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right resize-none" />
//           </div>

//           {/* Budget */}
//           <div className="space-y-1.5">
//             <div className="flex items-center justify-between">
//               <div className="flex gap-1">
//                 {(['SDG','USD'] as const).map(c => (
//                   <button key={c} onClick={() => setForm(p=>({...p,currency:c}))}
//                     className={cn('px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all',
//                       form.currency===c ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-400'
//                     )}>{c}</button>
//                 ))}
//               </div>
//               <label className="text-xs font-bold text-slate-600">نطاق الميزانية *</label>
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               <input type="number" value={form.budgetMin} onChange={e => setForm(p=>({...p,budgetMin:e.target.value}))}
//                 placeholder="الحد الأدنى"
//                 className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right" />
//               <input type="number" value={form.budgetMax} onChange={e => setForm(p=>({...p,budgetMax:e.target.value}))}
//                 placeholder="الحد الأقصى"
//                 className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right" />
//             </div>
//           </div>

//           {/* Deadline & Region */}
//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-1.5">
//               <label className="text-xs font-bold text-slate-600 block text-right">الموعد النهائي *</label>
//               <input type="date" value={form.deadlineAt} onChange={e => setForm(p=>({...p,deadlineAt:e.target.value}))}
//                 className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right" />
//             </div>
//             <div className="space-y-1.5">
//               <label className="text-xs font-bold text-slate-600 block text-right">الولاية</label>
//               <select value={form.regionId} onChange={e => setForm(p=>({...p,regionId:e.target.value}))}
//                 className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right">
//                 {REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
//               </select>
//             </div>
//           </div>

//           {/* Requirements */}
//           <div className="space-y-1.5">
//             <label className="text-xs font-bold text-slate-600 block text-right">متطلبات المتقدمين (اختياري)</label>
//             <div className="space-y-2">
//               {[['req1','المتطلب الأول'],['req2','المتطلب الثاني'],['req3','المتطلب الثالث'],['req4','المتطلب الرابع']].map(([k,ph]) => (
//                 <input key={k} value={form[k as keyof typeof form]} onChange={e => setForm(p=>({...p,[k]:e.target.value}))}
//                   placeholder={ph}
//                   className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right" />
//               ))}
//             </div>
//           </div>

//           <button onClick={handlePublish} disabled={!canSubmit}
//             className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 shadow-md shadow-emerald-200">
//             <Gavel size={16} /> نشر المناقصة الآن
//           </button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ─── Tender Card ──────────────────────────────────────────────────────────────

// function TenderCard({ tender, role, onBid, onViewBids }: {
//   tender: Tender;
//   role: UserRole;
//   onBid: () => void;
//   onViewBids: () => void;
// }) {
//   const cfg  = TYPE_CONFIG[tender.type];
//   const Icon = cfg.Icon;
//   const days = daysLeft(tender.deadlineAt);
//   const isOpen = tender.status === 'open';

//   return (
//     <motion.div
//       initial={{opacity:0, y:16}} animate={{opacity:1, y:0}}
//       className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
//     >
//       {/* Top accent */}
//       <div style={{ background: cfg.accent }} className="h-1 w-full" />

//       <div className="p-4 sm:p-5 space-y-4" dir="rtl">

//         {/* Header */}
//         <div className="flex items-start gap-3">
//           <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
//             <Icon size={18} className={cfg.color} />
//           </div>
//           <div className="flex-1 text-right min-w-0">
//             <p className="font-black text-slate-900 text-sm leading-tight line-clamp-2">{tender.title}</p>
//             <div className="flex items-center gap-1.5 mt-1 justify-end">
//               <span className="text-[10px] text-slate-400 truncate">{tender.institutionName}</span>
//               <Building2 size={9} className="text-slate-400 shrink-0" />
//             </div>
//           </div>
//           <StatusBadge status={tender.status} />
//         </div>

//         {/* Description */}
//         <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 text-right">{tender.description}</p>

//         {/* Stats row */}
//         <div className="grid grid-cols-3 gap-2">
//           <div className={cn('rounded-xl p-2.5 text-right border', cfg.bg, cfg.border)}>
//             <p className={cn('text-[9px] font-medium', cfg.color)}>الميزانية</p>
//             <p className={cn('text-xs font-black mt-0.5', cfg.color)}>
//               {formatAmount(tender.budgetMin, tender.currency)}
//             </p>
//             <p className={cn('text-[9px]', cfg.color)}>— {formatAmount(tender.budgetMax, tender.currency)}</p>
//           </div>

//           <div className="rounded-xl p-2.5 text-right bg-slate-50 border border-slate-100">
//             <p className="text-[9px] text-slate-400 font-medium">الموعد النهائي</p>
//             <p className={cn('text-xs font-black mt-0.5', days<=7 ? 'text-red-600' : 'text-slate-800')}>
//               {days > 0 ? `${days} يوم` : 'انتهى'}
//             </p>
//             <p className="text-[9px] text-slate-400">{tender.deadlineAt}</p>
//           </div>

//           <div className="rounded-xl p-2.5 text-right bg-slate-50 border border-slate-100">
//             <p className="text-[9px] text-slate-400 font-medium">العروض</p>
//             <p className="text-xs font-black text-slate-800 mt-0.5">{tender.bidsCount}</p>
//             <p className="text-[9px] text-slate-400">عرض مقدَّم</p>
//           </div>
//         </div>

//         {/* Region + Type tags */}
//         <div className="flex items-center justify-between">
//           <TypeTag type={tender.type} />
//           <div className="flex items-center gap-1 text-[10px] text-slate-400">
//             <span>{tender.regionName}</span>
//             <MapPin size={9} />
//           </div>
//         </div>

//         {/* Requirements preview */}
//         {tender.requirements.length > 0 && (
//           <div className="bg-slate-50 rounded-xl p-3 text-right border border-slate-100">
//             <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-2">المتطلبات الأساسية</p>
//             <div className="space-y-1">
//               {tender.requirements.slice(0,2).map((req,i) => (
//                 <div key={i} className="flex items-start gap-1.5 justify-end">
//                   <span className="text-[10px] text-slate-600 font-medium leading-tight">{req}</span>
//                   <CheckCircle2 size={10} className="text-emerald-500 mt-0.5 shrink-0" />
//                 </div>
//               ))}
//               {tender.requirements.length > 2 && (
//                 <p className="text-[9px] text-slate-400 text-right">+{tender.requirements.length-2} متطلبات أخرى</p>
//               )}
//             </div>
//           </div>
//         )}

//         {/* CTA */}
//         <div className="flex gap-2 pt-1">
//           {/* Official: view bids */}
//           {role === 'official' && (
//             <button onClick={onViewBids}
//               className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]">
//               <Eye size={13} /> مراجعة العروض ({tender.bidsCount})
//             </button>
//           )}

//           {/* Citizen/Partner: bid */}
//           {(role === 'citizen' || role === 'partner') && isOpen && (
//             <button onClick={onBid}
//               style={{ background: cfg.accent }}
//               className="flex-1 py-2.5 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] hover:opacity-90">
//               <Send size={13} /> قدِّم عرضك
//             </button>
//           )}

//           {/* Awarded badge */}
//           {tender.status === 'awarded' && role !== 'official' && (
//             <div className="flex-1 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black rounded-xl flex items-center justify-center gap-1.5">
//               <Trophy size={13} /> تم الترسية
//             </div>
//           )}

//           {/* Closed badge */}
//           {tender.status === 'closed' && (
//             <div className="flex-1 py-2.5 bg-slate-100 text-slate-400 text-xs font-black rounded-xl flex items-center justify-center gap-1.5">
//               مغلقة
//             </div>
//           )}

//           {/* More */}
//           <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all">
//             <MoreHorizontal size={15} />
//           </button>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export default function Tenders({ role = 'citizen' }: { role?: UserRole }) {
//   const [tenders, setTenders]         = useState<Tender[]>(MOCK_TENDERS);
//   const [bids, setBids]               = useState<Bid[]>(MOCK_BIDS);
//   const [biddingOn, setBiddingOn]     = useState<Tender | null>(null);
//   const [viewingBids, setViewingBids] = useState<Tender | null>(null);
//   const [showPublish, setShowPublish] = useState(false);
//   const [typeFilter, setTypeFilter]   = useState<IssueType|'all'>('all');
//   const [statusFilter, setStatusFilter] = useState<TenderStatus|'all'>('all');
//   const [search, setSearch]           = useState('');

//   const filtered = useMemo(() => tenders.filter(t => {
//     if (typeFilter   !== 'all' && t.type   !== typeFilter)   return false;
//     if (statusFilter !== 'all' && t.status !== statusFilter) return false;
//     if (search && !t.title.includes(search) && !t.institutionName.includes(search)) return false;
//     return true;
//   }), [tenders, typeFilter, statusFilter, search]);

//   const stats = {
//     open:      tenders.filter(t => t.status==='open').length,
//     reviewing: tenders.filter(t => t.status==='reviewing').length,
//     awarded:   tenders.filter(t => t.status==='awarded').length,
//     total:     tenders.length,
//   };

//   const handleBidSubmit = (bidData: Omit<Bid,'id'|'tenderId'|'status'|'submittedAt'>) => {
//     if (!biddingOn) return;
//     const newBid: Bid = {
//       ...bidData,
//       id: `b${Date.now()}`,
//       tenderId: biddingOn.id,
//       status: 'pending',
//       submittedAt: new Date().toISOString().split('T')[0],
//     };
//     setBids(prev => [...prev, newBid]);
//     setTenders(prev => prev.map(t =>
//       t.id === biddingOn.id ? { ...t, bidsCount: t.bidsCount + 1 } : t
//     ));
//     setBiddingOn(null);
//   };

//   const handleAward = (bidId: string) => {
//     if (!viewingBids) return;
//     setBids(prev => prev.map(b => ({
//       ...b,
//       status: b.tenderId === viewingBids.id
//         ? b.id === bidId ? 'awarded' : 'rejected'
//         : b.status
//     })));
//     setTenders(prev => prev.map(t =>
//       t.id === viewingBids.id ? { ...t, status:'awarded', awardedBidId:bidId } : t
//     ));
//     setViewingBids(null);
//   };

//   const handlePublish = (data: Omit<Tender,'id'|'bidsCount'|'status'|'createdAt'>) => {
//     const newTender: Tender = {
//       ...data,
//       id: `t${Date.now()}`,
//       bidsCount: 0,
//       status: 'open',
//       createdAt: new Date().toISOString().split('T')[0],
//     };
//     setTenders(prev => [newTender, ...prev]);
//     setShowPublish(false);
//   };

//   return (
//     <>
//       <div className="space-y-5 p-4 sm:p-5 lg:p-6 pb-24 lg:pb-8" dir="rtl">

//         {/* ── Page Header ──────────────────────────────────────── */}
//         <div className="flex items-center justify-between gap-4">
//           <div className="flex items-center gap-2">
//             {role === 'official' && (
//               <motion.button
//                 whileTap={{scale:0.96}}
//                 onClick={() => setShowPublish(true)}
//                 className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-2xl transition-all shadow-md shadow-emerald-200 active:scale-[0.97]">
//                 <Plus size={16} />
//                 <span className="hidden sm:block">نشر مناقصة</span>
//               </motion.button>
//             )}
//           </div>
//           <div className="text-right">
//             <div className="flex items-center gap-2 justify-end mb-0.5">
//               <h2 className="text-xl font-black text-slate-900">المناقصات الحكومية</h2>
//               <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center">
//                 <Gavel size={16} className="text-emerald-600" />
//               </div>
//             </div>
//             <p className="text-xs text-slate-400 font-medium">منصة عمران لمناقصات البنية التحتية</p>
//           </div>
//         </div>

//         {/* ── Stats Row ─────────────────────────────────────────── */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//           {[
//             { label:'مناقصات مفتوحة',  val:stats.open,      icon:CircleDot,    color:'text-emerald-600', bg:'bg-emerald-50',  border:'border-emerald-200' },
//             { label:'قيد المراجعة',    val:stats.reviewing,  icon:FileText,     color:'text-amber-600',   bg:'bg-amber-50',    border:'border-amber-200'   },
//             { label:'تم الترسية',      val:stats.awarded,    icon:Trophy,       color:'text-blue-600',    bg:'bg-blue-50',     border:'border-blue-200'    },
//             { label:'إجمالي المناقصات',val:stats.total,      icon:Gavel,        color:'text-slate-700',   bg:'bg-slate-100',   border:'border-slate-200'   },
//           ].map(s => {
//             const Icon = s.icon;
//             return (
//               <div key={s.label} className={cn('rounded-2xl p-4 border text-right', s.bg, s.border)}>
//                 <div className="flex items-center justify-end mb-2">
//                   <Icon size={16} className={s.color} />
//                 </div>
//                 <p className={cn('text-2xl font-black', s.color)}>{s.val}</p>
//                 <p className="text-[10px] text-slate-500 font-medium mt-0.5">{s.label}</p>
//               </div>
//             );
//           })}
//         </div>

//         {/* ── Role banner ───────────────────────────────────────── */}
//         {role === 'official' && (
//           <div className="bg-gradient-to-l from-emerald-700 to-emerald-600 rounded-2xl p-4 text-white flex items-center gap-3">
//             <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
//               <ShieldCheck size={20} className="text-white" />
//             </div>
//             <div className="text-right flex-1">
//               <p className="font-black text-sm">وضع المسؤول الحكومي</p>
//               <p className="text-white/70 text-xs mt-0.5">يمكنك نشر مناقصات جديدة ومراجعة العروض واختيار الفائز</p>
//             </div>
//           </div>
//         )}
//         {(role === 'citizen' || role === 'partner') && (
//           <div className="bg-gradient-to-l from-slate-800 to-slate-900 rounded-2xl p-4 text-white flex items-center gap-3">
//             <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
//               <Sparkles size={20} className="text-amber-400" />
//             </div>
//             <div className="text-right flex-1">
//               <p className="font-black text-sm">تنافس وفُز بمشاريع حكومية</p>
//               <p className="text-white/50 text-xs mt-0.5">قدِّم عرضك على أي مناقصة مفتوحة، وابنِ سجلك كمقاول موثوق</p>
//             </div>
//           </div>
//         )}

//         {/* ── Filters ───────────────────────────────────────────── */}
//         <div className="space-y-2.5 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
//           {/* Search */}
//           <div className="relative">
//             <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
//             <input
//               value={search} onChange={e => setSearch(e.target.value)}
//               placeholder="بحث في المناقصات..."
//               className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent text-right placeholder:text-slate-300"
//             />
//           </div>

//           {/* Status tabs */}
//           <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
//             {([['all','الكل'],['open','مفتوحة'],['reviewing','قيد المراجعة'],['awarded','تم الترسية'],['closed','مغلقة']] as const).map(([v,l]) => (
//               <button key={v} onClick={() => setStatusFilter(v)}
//                 className={cn('px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border',
//                   statusFilter===v ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
//                 )}>{l}</button>
//             ))}
//           </div>

//           {/* Type filter */}
//           <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
//             <button onClick={() => setTypeFilter('all')}
//               className={cn('px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border',
//                 typeFilter==='all' ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
//               )}>كل الأنواع</button>
//             {(Object.entries(TYPE_CONFIG) as [IssueType, typeof TYPE_CONFIG[IssueType]][]).map(([key,cfg]) => {
//               const Icon = cfg.Icon;
//               return (
//                 <button key={key} onClick={() => setTypeFilter(key)}
//                   className={cn('px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border flex items-center gap-1',
//                     typeFilter===key ? cn(cfg.bg, cfg.border, cfg.color) : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
//                   )}>
//                   <Icon size={11} />{cfg.label}
//                 </button>
//               );
//             })}
//           </div>

//           <div className="flex items-center justify-between">
//             <span className="text-[10px] text-slate-400">{filtered.length} مناقصة</span>
//           </div>
//         </div>

//         {/* ── Tenders Grid ──────────────────────────────────────── */}
//         {filtered.length === 0 ? (
//           <div className="bg-white border border-slate-100 rounded-2xl p-14 text-center">
//             <Gavel size={32} className="text-slate-200 mx-auto mb-3" />
//             <p className="text-sm font-bold text-slate-400">لا توجد مناقصات تطابق الفلتر</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//             {filtered.map(tender => (
//               <TenderCard
//                 key={tender.id}
//                 tender={tender}
//                 role={role}
//                 onBid={() => setBiddingOn(tender)}
//                 onViewBids={() => setViewingBids(tender)}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* ── Modals ────────────────────────────────────────────────── */}
//       <AnimatePresence>
//         {biddingOn && (
//           <BidModal
//             tender={biddingOn}
//             onClose={() => setBiddingOn(null)}
//             onSubmit={handleBidSubmit}
//           />
//         )}
//         {viewingBids && (
//           <BidsPanel
//             tender={viewingBids}
//             bids={bids}
//             onClose={() => setViewingBids(null)}
//             onAward={handleAward}
//           />
//         )}
//         {showPublish && (
//           <PublishModal
//             onClose={() => setShowPublish(false)}
//             onPublish={handlePublish}
//           />
//         )}
//       </AnimatePresence>
//     </>
//   );
// }





/**
 * Tenders.tsx — نظام المناقصات لمنصة عمران
 *
 * الاستخدام في App.tsx:
 *   import Tenders from './components/Tenders';
 *   {activeView === 'tenders' && <Tenders role={role} />}
 *
 * الأدوار:
 *   citizen  → يشوف المناقصات المفتوحة فقط
 *   official → ينشر مناقصات + يراجع العروض + يختار الفائز
 *   partner  → يقدّم عروض (bids) مثل المواطن لكن بصلاحية شركة
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gavel, Plus, X, ChevronLeft, ChevronRight,
  MapPin, Clock, Building2, Banknote, FileText,
  CheckCircle2, Eye, Send, Filter, Search,
  Droplets, Zap, Construction, Trash2,
  AlertTriangle, Trophy, Star, Users,
  CalendarClock, ArrowUpRight, MoreHorizontal,
  ShieldCheck, BadgeCheck, CircleDot, Sparkles,
  Download, Upload, Award, BarChart3, Briefcase,
  ClipboardList, Wrench, DollarSign, Package,
  TrendingUp, Medal, Hash, Calendar,
  CircleDollarSign
} from 'lucide-react';
import { cn } from '../lib/utils';
import { REGIONS, INSTITUTIONS } from '../constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type IssueType   = 'road' | 'water' | 'electricity' | 'waste' | 'other';
type TenderStatus = 'open' | 'reviewing' | 'awarded' | 'closed';
type BidStatus   = 'pending' | 'shortlisted' | 'awarded' | 'rejected';
type UserRole    = 'citizen' | 'official' | 'partner';

interface Tender {
  id: string;
  issueId: string;
  institutionId: string;
  institutionName: string;
  title: string;
  description: string;
  type: IssueType;
  regionId: string;
  regionName: string;
  budgetMin: number;
  budgetMax: number;
  currency: 'SDG' | 'USD';
  deadlineAt: string;      // ISO date string (mock)
  status: TenderStatus;
  bidsCount: number;
  awardedBidId?: string;
  requirements: string[];
  createdAt: string;
}

interface Bid {
  id: string;
  tenderId: string;
  contractorName: string;
  companyName?: string;
  contactInfo: string;
  proposedAmount: number;
  currency: 'SDG' | 'USD';
  estimatedDays: number;
  plan: string;
  qualifications: string;
  status: BidStatus;
  submittedAt: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<IssueType, {
  label: string;
  Icon: React.FC<{ size?: number; className?: string }>;
  color: string; bg: string; border: string; accent: string;
}> = {
  water:       { label:'مياه',      Icon:Droplets,     color:'text-sky-700',    bg:'bg-sky-50',    border:'border-sky-200',    accent:'#0ea5e9' },
  electricity: { label:'كهرباء',   Icon:Zap,          color:'text-amber-700',  bg:'bg-amber-50',  border:'border-amber-200',  accent:'#f59e0b' },
  road:        { label:'طرق',      Icon:Construction, color:'text-slate-700',  bg:'bg-slate-100', border:'border-slate-300',  accent:'#6b7280' },
  waste:       { label:'نفايات',   Icon:Trash2,       color:'text-emerald-700',bg:'bg-emerald-50',border:'border-emerald-200',accent:'#10b981' },
  other:       { label:'أخرى',     Icon:AlertTriangle,color:'text-violet-700', bg:'bg-violet-50', border:'border-violet-200', accent:'#8b5cf6' },
};

const STATUS_CONFIG: Record<TenderStatus, { label:string; dot:string; badge:string }> = {
  open:      { label:'مفتوحة',       dot:'bg-emerald-500 animate-pulse', badge:'bg-emerald-50 text-emerald-700 border-emerald-200' },
  reviewing: { label:'قيد المراجعة', dot:'bg-amber-500',                 badge:'bg-amber-50   text-amber-700   border-amber-200'   },
  awarded:   { label:'تم الترسية',   dot:'bg-blue-500',                  badge:'bg-blue-50    text-blue-700    border-blue-200'    },
  closed:    { label:'مغلقة',        dot:'bg-slate-400',                 badge:'bg-slate-100  text-slate-500   border-slate-200'   },
};

const BID_STATUS_CONFIG: Record<BidStatus, { label:string; color:string }> = {
  pending:     { label:'قيد الدراسة', color:'text-amber-600 bg-amber-50 border-amber-200'   },
  shortlisted: { label:'مرشح',        color:'text-blue-600  bg-blue-50  border-blue-200'    },
  awarded:     { label:'فائز',         color:'text-emerald-600 bg-emerald-50 border-emerald-200' },
  rejected:    { label:'مرفوض',       color:'text-slate-400 bg-slate-50  border-slate-200'  },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TENDERS: Tender[] = [
  {
    id:'t1', issueId:'i1',
    institutionId:'water', institutionName:'هيئة مياه ولاية الخرطوم',
    title:'صيانة شبكة مياه حي العمارات',
    description:'إعادة تأهيل خطوط الأنابيب الرئيسية في حي العمارات التي يبلغ عمرها أكثر من 30 عاماً، وتشمل الأعمال استبدال الأنابيب الصدئة وتركيب محابس جديدة وإعادة الرصف.',
    type:'water', regionId:'khartoum', regionName:'ولاية الخرطوم',
    budgetMin:500000, budgetMax:800000, currency:'SDG',
    deadlineAt:'2026-06-15', status:'open', bidsCount:7,
    requirements:['خبرة لا تقل عن 5 سنوات في شبكات المياه','شهادة ISO للجودة','ضمان بنكي 10%','فريق هندسي معتمد'],
    createdAt:'2026-05-01',
  },
  {
    id:'t2', issueId:'i2',
    institutionId:'roads', institutionName:'هيئة الطرق والجسور',
    title:'رصف وتأهيل الطريق الدائري الغربي — المرحلة الثانية',
    description:'تشمل الأعمال رصف 4.2 كيلومتر من الطريق الدائري الغربي، وتركيب إنارة طرق، وتحديد مسارات للمشاة وفق المواصفات السودانية المعتمدة.',
    type:'road', regionId:'khartoum', regionName:'ولاية الخرطوم',
    budgetMin:2000000, budgetMax:3500000, currency:'SDG',
    deadlineAt:'2026-06-30', status:'reviewing', bidsCount:12,
    requirements:['تصنيف مقاولات درجة أولى','معدات هندسية حديثة','خبرة في مشاريع طرق مشابهة','ضمان صيانة سنتين'],
    createdAt:'2026-04-20',
  },
  {
    id:'t3', issueId:'i3',
    institutionId:'electricity', institutionName:'الشركة السودانية لتوزيع الكهرباء',
    title:'تركيب شبكة إنارة أعمدة لحي الصحافة',
    description:'توريد وتركيب 180 عمود إنارة LED موفرة للطاقة في حي الصحافة، مع توصيل الكابلات الأرضية وتوريد لوحات التحكم الذكية.',
    type:'electricity', regionId:'khartoum', regionName:'ولاية الخرطوم',
    budgetMin:350000, budgetMax:500000, currency:'SDG',
    deadlineAt:'2026-07-10', status:'awarded', bidsCount:9,
    awardedBidId:'b2',
    requirements:['ترخيص من هيئة الكهرباء','خبرة في شبكات الإنارة','ضمان المعدات 3 سنوات'],
    createdAt:'2026-04-10',
  },
  {
    id:'t4', issueId:'i4',
    institutionId:'waste', institutionName:'جهاز حماية البيئة',
    title:'تشغيل محطة فرز نفايات بحري',
    description:'تشغيل وإدارة محطة فرز النفايات الصلبة في بحري لمدة سنتين، تشمل توفير العمالة والمعدات وإعداد التقارير الدورية.',
    type:'waste', regionId:'khartoum', regionName:'ولاية الخرطوم',
    budgetMin:1200000, budgetMax:1800000, currency:'SDG',
    deadlineAt:'2026-05-30', status:'open', bidsCount:4,
    requirements:['خبرة في إدارة النفايات','رخصة بيئية سارية','خطة تشغيلية مفصّلة','كادر فني متخصص'],
    createdAt:'2026-05-05',
  },
  {
    id:'t5', issueId:'i5',
    institutionId:'water', institutionName:'هيئة مياه ولاية الخرطوم',
    title:'تأهيل محطة ضخ مياه الكلاكلة',
    description:'استبدال مضخات المحطة الرئيسية وتجديد الشبكة الكهربائية الداخلية وتركيب نظام مراقبة SCADA لتحسين الكفاءة التشغيلية.',
    type:'water', regionId:'khartoum', regionName:'ولاية الخرطوم',
    budgetMin:900000, budgetMax:1400000, currency:'SDG',
    deadlineAt:'2026-08-01', status:'open', bidsCount:2,
    requirements:['خبرة في محطات الضخ','مورّد معتمد للمضخات','فريق كهرباء صناعية','ضمان تشغيلي سنة'],
    createdAt:'2026-05-08',
  },
];

const MOCK_BIDS: Bid[] = [
  { id:'b1', tenderId:'t1', contractorName:'م. يوسف عبدالله', companyName:'شركة النيل للإنشاءات', contactInfo:'0912345678', proposedAmount:620000, currency:'SDG', estimatedDays:45, plan:'سيتم تنفيذ العمل على مرحلتين: الأولى استبدال الخطوط الرئيسية، والثانية الخطوط الفرعية مع ضمان عدم انقطاع الخدمة.', qualifications:'15 سنة خبرة — نفّذنا مشاريع مياه في كل ولايات السودان', status:'shortlisted', submittedAt:'2026-05-03' },
  { id:'b2', tenderId:'t3', contractorName:'م. سارة إبراهيم', companyName:'مجموعة الضوء للكهرباء', contactInfo:'0922334455', proposedAmount:420000, currency:'SDG', estimatedDays:60, plan:'توريد أعمدة LED مستوردة مباشرة من المصنع مع ضمان 5 سنوات وتركيب متكامل.', qualifications:'حاصلون على ISO 9001 — نفّذنا 3 مشاريع مشابهة في الخرطوم', status:'awarded', submittedAt:'2026-04-18' },
  { id:'b3', tenderId:'t1', contractorName:'مبارك التوم', contactInfo:'0987654321', proposedAmount:580000, currency:'SDG', estimatedDays:60, plan:'نملك المعدات والفريق الجاهز، ويمكن البدء خلال أسبوع من التوقيع.', qualifications:'خبرة 8 سنوات في شبكات المياه', status:'pending', submittedAt:'2026-05-05' },
  { id:'b4', tenderId:'t1', contractorName:'م. أمين حسن', companyName:'شركة الخرطوم للمقاولات', contactInfo:'0911223344', proposedAmount:750000, currency:'SDG', estimatedDays:30, plan:'تنفيذ متسارع بفريق مزدوج لضمان الانتهاء في وقت قياسي.', qualifications:'تصنيف درجة أولى من وزارة التشييد', status:'pending', submittedAt:'2026-05-06' },
  { id:'b5', tenderId:'t2', contractorName:'م. حنان الأمين', companyName:'شركة الطرق المتقدمة', contactInfo:'0933445566', proposedAmount:2800000, currency:'SDG', estimatedDays:90, plan:'تنفيذ المشروع وفق أحدث مواصفات الطرق مع استخدام آسفلت عالي الجودة.', qualifications:'نفّذنا طريق الإنقاذ الغربي بنجاح', status:'shortlisted', submittedAt:'2026-04-25' },
];

// ─── Vendor Profile Mock Data ─────────────────────────────────────────────────

interface PastProject {
  id: string;
  name: string;
  ministry: string;
  year: number;
  value: number;
  currency: 'SDG' | 'USD';
  rating: number;
  status: 'completed' | 'ongoing';
  type: IssueType;
}

interface VendorProfile {
  companyName: string;
  registrationNo: string;
  classification: 'A' | 'B' | 'C';
  efficiencyScore: number;
  certifications: string[];
  pastProjects: PastProject[];
  totalProjects: number;
  avgRating: number;
  yearsActive: number;
}

const MOCK_VENDOR_PROFILE: VendorProfile = {
  companyName: 'شركة النيل للإنشاءات والمقاولات',
  registrationNo: 'KH-2024-00341',
  classification: 'A',
  efficiencyScore: 87,
  certifications: ['ISO 9001:2015', 'شهادة تصنيف درجة أولى', 'عضو اتحاد المقاولين السودانيين'],
  totalProjects: 23,
  avgRating: 4.3,
  yearsActive: 12,
  pastProjects: [
    { id:'p1', name:'تأهيل شبكة مياه حي الرياض', ministry:'هيئة مياه ولاية الخرطوم', year:2025, value:680000, currency:'SDG', rating:5, status:'completed', type:'water' },
    { id:'p2', name:'رصف الطريق الدائري الشمالي — المرحلة الأولى', ministry:'هيئة الطرق والجسور', year:2024, value:2200000, currency:'SDG', rating:4, status:'completed', type:'road' },
    { id:'p3', name:'توريد وتركيب أعمدة إنارة حي الصحافة', ministry:'الشركة السودانية لتوزيع الكهرباء', year:2024, value:430000, currency:'SDG', rating:4, status:'completed', type:'electricity' },
    { id:'p4', name:'صيانة محطة ضخ مياه أمبدة', ministry:'هيئة مياه ولاية الخرطوم', year:2023, value:510000, currency:'SDG', rating:5, status:'completed', type:'water' },
    { id:'p5', name:'تشغيل محطة فرز نفايات شرق النيل', ministry:'جهاز حماية البيئة', year:2026, value:1500000, currency:'SDG', rating:4, status:'ongoing', type:'waste' },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(n: number, currency: string) {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}م ${currency}`;
  if (n >= 1_000)     return `${(n/1_000).toFixed(0)}ألف ${currency}`;
  return `${n} ${currency}`;
}

function daysLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  return days;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TenderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border', cfg.badge)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function TypeTag({ type }: { type: IssueType }) {
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg.Icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border', cfg.bg, cfg.color, cfg.border)}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

// ─── Bid Submission Modal ─────────────────────────────────────────────────────

function BidModal({ tender, onClose, onSubmit }: {
  tender: Tender;
  onClose: () => void;
  onSubmit: (bid: Omit<Bid,'id'|'tenderId'|'status'|'submittedAt'>) => void;
}) {
  const [step, setStep]         = useState<1|2|3>(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm]         = useState({
    contractorName:'', companyName:'', contactInfo:'',
    proposedAmount:'', estimatedDays:'', plan:'', qualifications:'',
  });

  const cfg = TYPE_CONFIG[tender.type];

  const canNext1 = form.contractorName && form.contactInfo;
  const canNext2 = form.proposedAmount && form.estimatedDays && form.plan;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onSubmit({
        contractorName: form.contractorName,
        companyName:    form.companyName || undefined,
        contactInfo:    form.contactInfo,
        proposedAmount: Number(form.proposedAmount),
        currency:       tender.currency,
        estimatedDays:  Number(form.estimatedDays),
        plan:           form.plan,
        qualifications: form.qualifications,
      });
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-[500] bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
        transition={{ type:'spring', stiffness:300, damping:30 }}
        className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 shrink-0 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 shrink-0 flex items-center justify-between">
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">
            <X size={16} />
          </button>
          <div className="text-center">
            <p className="text-xs font-black text-slate-400">تقديم عرض</p>
            {!submitted && (
              <div className="flex justify-center gap-1.5 mt-1.5">
                {[1,2,3].map(s => (
                  <div key={s} className={cn('h-1 rounded-full transition-all duration-300',
                    step===s ? 'w-5 bg-emerald-500' : step>s ? 'w-3 bg-emerald-300' : 'w-3 bg-slate-200'
                  )} />
                ))}
              </div>
            )}
          </div>
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', cfg.bg)}>
            <cfg.Icon size={15} className={cfg.color} />
          </div>
        </div>

        {/* Tender title strip */}
        {!submitted && (
          <div className={cn('px-5 py-3 border-b shrink-0', cfg.bg, cfg.border)}>
            <p className="text-xs font-black text-slate-800 text-right truncate">{tender.title}</p>
            <p className={cn('text-[10px] font-medium text-right mt-0.5', cfg.color)}>{tender.institutionName}</p>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* Success */}
            {submitted && (
              <motion.div key="success" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
                className="p-8 flex flex-col items-center text-center gap-5">
                <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',delay:0.1}}
                  className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                  <CheckCircle2 size={40} className="text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">تم إرسال عرضك! 🎉</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    سيتم مراجعة عرضك من قِبَل {tender.institutionName}. سنتواصل معك على رقم {form.contactInfo}.
                  </p>
                </div>
                <div className={cn('rounded-2xl p-4 w-full text-right border', cfg.bg, cfg.border)}>
                  <p className={cn('text-xs font-medium mb-1', cfg.color)}>مبلغ عرضك</p>
                  <p className={cn('text-2xl font-black', cfg.color)}>
                    {formatAmount(Number(form.proposedAmount), tender.currency)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">مدة التنفيذ: {form.estimatedDays} يوم</p>
                </div>
              </motion.div>
            )}

            {/* Step 1 — بياناتك */}
            {!submitted && step===1 && (
              <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                className="p-5 space-y-4" dir="rtl">
                <div className="text-right">
                  <h3 className="font-black text-slate-900 text-base">بياناتك الشخصية</h3>
                  <p className="text-xs text-slate-400 mt-0.5">اسمك وطريقة التواصل معك</p>
                </div>

                {[
                  { label:'اسمك الكامل *',      key:'contractorName', placeholder:'م. اسمك هنا...' },
                  { label:'اسم الشركة (إن وجد)', key:'companyName',    placeholder:'شركة / مؤسسة / مكتب هندسي' },
                  { label:'رقم التواصل *',       key:'contactInfo',   placeholder:'09xxxxxxxx' },
                ].map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block text-right">{f.label}</label>
                    <input
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all placeholder:text-slate-300 text-right"
                    />
                  </div>
                ))}

                <button onClick={() => setStep(2)} disabled={!canNext1}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 shadow-sm shadow-emerald-200">
                  التالي <ChevronLeft size={16} />
                </button>
              </motion.div>
            )}

            {/* Step 2 — عرضك المالي والخطة */}
            {!submitted && step===2 && (
              <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                className="p-5 space-y-4" dir="rtl">
                <div className="text-right">
                  <h3 className="font-black text-slate-900 text-base">العرض المالي والخطة</h3>
                  <p className="text-xs text-slate-400 mt-0.5">كم تطلب وكيف ستنفّذ المشروع؟</p>
                </div>

                {/* Budget reference */}
                <div className={cn('flex items-center justify-between p-3 rounded-xl border', cfg.bg, cfg.border)}>
                  <span className={cn('text-xs font-bold', cfg.color)}>
                    {formatAmount(tender.budgetMin, tender.currency)} — {formatAmount(tender.budgetMax, tender.currency)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">نطاق الميزانية</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block text-right">مبلغ العرض ({tender.currency}) *</label>
                    <input
                      type="number" value={form.proposedAmount}
                      onChange={e => setForm(p => ({...p, proposedAmount:e.target.value}))}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all text-right"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block text-right">مدة التنفيذ (أيام) *</label>
                    <input
                      type="number" value={form.estimatedDays}
                      onChange={e => setForm(p => ({...p, estimatedDays:e.target.value}))}
                      placeholder="60"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all text-right"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block text-right">خطة التنفيذ *</label>
                  <textarea
                    value={form.plan}
                    onChange={e => setForm(p => ({...p, plan:e.target.value}))}
                    placeholder="اشرح كيف ستنفّذ المشروع خطوة بخطوة..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all placeholder:text-slate-300 text-right resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setStep(1)}
                    className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all shrink-0">
                    <ChevronLeft size={18} className="rotate-180" />
                  </button>
                  <button onClick={() => setStep(3)} disabled={!canNext2}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 shadow-sm shadow-emerald-200">
                    التالي <ChevronLeft size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3 — مراجعة وإرسال */}
            {!submitted && step===3 && (
              <motion.div key="s3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                className="p-5 space-y-4" dir="rtl">
                <div className="text-right">
                  <h3 className="font-black text-slate-900 text-base">مراجعة العرض</h3>
                  <p className="text-xs text-slate-400 mt-0.5">المؤهلات ثم تأكيد الإرسال</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block text-right">مؤهلاتك وخبراتك السابقة</label>
                  <textarea
                    value={form.qualifications}
                    onChange={e => setForm(p => ({...p, qualifications:e.target.value}))}
                    placeholder="اذكر مشاريع سابقة مشابهة، شهادات، أو أي معلومات تدعم عرضك..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all placeholder:text-slate-300 text-right resize-none"
                  />
                </div>

                {/* Summary */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 border border-slate-100">
                  {[
                    { label:'المتقدم',         val: form.companyName ? `${form.contractorName} — ${form.companyName}` : form.contractorName },
                    { label:'المبلغ المقترح',  val: formatAmount(Number(form.proposedAmount), tender.currency) },
                    { label:'مدة التنفيذ',     val: `${form.estimatedDays} يوم` },
                    { label:'التواصل',         val: form.contactInfo },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-700 text-right flex-1 truncate">{row.val}</span>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">{row.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setStep(2)}
                    className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all shrink-0">
                    <ChevronLeft size={18} className="rotate-180" />
                  </button>
                  <button onClick={handleSubmit}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm shadow-emerald-200">
                    <Send size={15} /> أرسل العرض
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Bids Panel (للمسؤول) ─────────────────────────────────────────────────────

function BidsPanel({ tender, bids, onClose, onAward }: {
  tender: Tender;
  bids: Bid[];
  onClose: () => void;
  onAward: (bidId: string) => void;
}) {
  const tenderBids = bids.filter(b => b.tenderId === tender.id);
  const cfg = TYPE_CONFIG[tender.type];

  return (
    <motion.div
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[500] bg-slate-900/50 backdrop-blur-sm flex items-end lg:items-center justify-center p-0 lg:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
        transition={{type:'spring',stiffness:300,damping:30}}
        className="bg-white w-full max-w-2xl rounded-t-[2rem] lg:rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 shrink-0 lg:hidden" />

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 shrink-0" dir="rtl">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <X size={16} />
            </button>
            <div className="text-right">
              <h3 className="font-black text-slate-900 text-sm">{tender.title}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{tenderBids.length} عرض مقدَّم</p>
            </div>
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', cfg.bg)}>
              <cfg.Icon size={15} className={cfg.color} />
            </div>
          </div>
        </div>

        {/* Bids list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50" dir="rtl">
          {tenderBids.length === 0 ? (
            <div className="py-16 text-center">
              <Gavel size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">لا توجد عروض بعد</p>
            </div>
          ) : tenderBids.map(bid => (
            <div key={bid.id} className="p-4 space-y-3">
              {/* Bid header */}
              <div className="flex items-start justify-between gap-3">
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-lg border', BID_STATUS_CONFIG[bid.status].color)}>
                  {BID_STATUS_CONFIG[bid.status].label}
                </span>
                <div className="text-right">
                  <p className="font-black text-slate-900 text-sm">{bid.contractorName}</p>
                  {bid.companyName && <p className="text-[10px] text-slate-400">{bid.companyName}</p>}
                </div>
              </div>

              {/* Bid stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label:'المبلغ',       val: formatAmount(bid.proposedAmount, bid.currency) },
                  { label:'مدة التنفيذ',  val: `${bid.estimatedDays} يوم` },
                  { label:'تاريخ التقديم', val: bid.submittedAt },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-2.5 text-right">
                    <p className="text-[9px] text-slate-400 font-medium">{s.label}</p>
                    <p className="text-xs font-black text-slate-800 mt-0.5">{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Plan */}
              <div className="bg-slate-50 rounded-xl p-3 text-right">
                <p className="text-[9px] text-slate-400 font-medium mb-1">خطة التنفيذ</p>
                <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">{bid.plan}</p>
              </div>

              {bid.qualifications && (
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-medium mb-0.5">المؤهلات</p>
                  <p className="text-xs text-slate-600 line-clamp-2">{bid.qualifications}</p>
                </div>
              )}

              {/* Award button */}
              {tender.status !== 'awarded' && bid.status !== 'rejected' && (
                <button
                  onClick={() => onAward(bid.id)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  <Trophy size={13} /> اختر هذا العرض — رسّي عليه
                </button>
              )}
              {bid.status === 'awarded' && (
                <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <BadgeCheck size={15} className="text-emerald-600" />
                  <span className="text-xs font-black text-emerald-700">العرض الفائز</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Publish Tender Modal (للمسؤول) ──────────────────────────────────────────

function PublishModal({ onClose, onPublish }: {
  onClose: () => void;
  onPublish: (t: Omit<Tender,'id'|'bidsCount'|'status'|'createdAt'>) => void;
}) {
  const [form, setForm] = useState({
    title:'', description:'', type:'water' as IssueType,
    regionId:'khartoum', budgetMin:'', budgetMax:'',
    currency:'SDG' as 'SDG'|'USD', deadlineAt:'',
    req1:'', req2:'', req3:'', req4:'',
  });

  const canSubmit = form.title && form.description && form.budgetMin && form.budgetMax && form.deadlineAt;

  const handlePublish = () => {
    const inst = INSTITUTIONS.find(i => i.type === form.type || i.id === form.type);
    const region = REGIONS.find(r => r.id === form.regionId);
    onPublish({
      issueId: `i${Date.now()}`,
      institutionId:   inst?.id || form.type,
      institutionName: inst?.name || 'هيئة حكومية',
      title:       form.title,
      description: form.description,
      type:        form.type,
      regionId:    form.regionId,
      regionName:  region?.name || '',
      budgetMin:   Number(form.budgetMin),
      budgetMax:   Number(form.budgetMax),
      currency:    form.currency,
      deadlineAt:  form.deadlineAt,
      requirements: [form.req1,form.req2,form.req3,form.req4].filter(Boolean),
      awardedBidId: undefined,
    });
  };

  return (
    <motion.div
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[500] bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
        transition={{type:'spring',stiffness:300,damping:30}}
        className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 shrink-0 sm:hidden" />

        <div className="px-5 py-4 border-b border-slate-100 shrink-0 flex items-center justify-between">
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <X size={16} />
          </button>
          <div className="flex items-center gap-2">
            <Gavel size={16} className="text-emerald-600" />
            <h3 className="font-black text-slate-900 text-sm">نشر مناقصة جديدة</h3>
          </div>
          <div className="w-8" />
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4" dir="rtl">

          {/* Type selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block text-right">نوع المشروع</label>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.entries(TYPE_CONFIG) as [IssueType, typeof TYPE_CONFIG[IssueType]][]).map(([key,cfg]) => {
                const Icon = cfg.Icon;
                return (
                  <button key={key} onClick={() => setForm(p => ({...p, type:key}))}
                    className={cn('flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all',
                      form.type===key ? cn(cfg.bg, cfg.border, cfg.color) : 'border-slate-100 text-slate-400 hover:border-slate-200'
                    )}>
                    <Icon size={16} />
                    <span className="text-[9px] font-bold">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block text-right">عنوان المناقصة *</label>
            <input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))}
              placeholder="مثال: صيانة شبكة مياه حي الرياض"
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block text-right">وصف المشروع *</label>
            <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))}
              rows={3} placeholder="اشرح نطاق العمل المطلوب..."
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right resize-none" />
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {(['SDG','USD'] as const).map(c => (
                  <button key={c} onClick={() => setForm(p=>({...p,currency:c}))}
                    className={cn('px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all',
                      form.currency===c ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-400'
                    )}>{c}</button>
                ))}
              </div>
              <label className="text-xs font-bold text-slate-600">نطاق الميزانية *</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={form.budgetMin} onChange={e => setForm(p=>({...p,budgetMin:e.target.value}))}
                placeholder="الحد الأدنى"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right" />
              <input type="number" value={form.budgetMax} onChange={e => setForm(p=>({...p,budgetMax:e.target.value}))}
                placeholder="الحد الأقصى"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right" />
            </div>
          </div>

          {/* Deadline & Region */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block text-right">الموعد النهائي *</label>
              <input type="date" value={form.deadlineAt} onChange={e => setForm(p=>({...p,deadlineAt:e.target.value}))}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block text-right">الولاية</label>
              <select value={form.regionId} onChange={e => setForm(p=>({...p,regionId:e.target.value}))}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right">
                {REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block text-right">متطلبات المتقدمين (اختياري)</label>
            <div className="space-y-2">
              {[['req1','المتطلب الأول'],['req2','المتطلب الثاني'],['req3','المتطلب الثالث'],['req4','المتطلب الرابع']].map(([k,ph]) => (
                <input key={k} value={form[k as keyof typeof form]} onChange={e => setForm(p=>({...p,[k]:e.target.value}))}
                  placeholder={ph}
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right" />
              ))}
            </div>
          </div>

          <button onClick={handlePublish} disabled={!canSubmit}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 shadow-md shadow-emerald-200">
            <Gavel size={16} /> نشر المناقصة الآن
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Open Tenders Section ─────────────────────────────────────────────────────

function OpenTendersSection({ tenders, onDownload }: {
  tenders: Tender[];
  onDownload: (t: Tender) => void;
}) {
  const open = tenders.filter(t => t.status === 'open' || t.status === 'reviewing');
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (t: Tender) => {
    setDownloading(t.id);
    setTimeout(() => { setDownloading(null); onDownload(t); }, 1400);
  };

  if (open.length === 0) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium">{open.length} مناقصة نشطة</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-black text-slate-900 text-sm">العطاءات المطروحة</h3>
          <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
            <ClipboardList size={14} className="text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Table-like list */}
      <div className="divide-y divide-slate-50">
        {open.map((t, idx) => {
          const cfg = TYPE_CONFIG[t.type];
          const days = daysLeft(t.deadlineAt);
          const refNo = `T-${t.createdAt.replace(/-/g,'')}-${String(idx+1).padStart(3,'0')}`;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="px-5 py-3.5 hover:bg-slate-50/70 transition-colors group"
            >
              <div className="flex items-center gap-3">
                {/* Ref + Type icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                  <cfg.Icon size={15} className={cfg.color} />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center gap-2 justify-end mb-0.5">
                    <p className="font-bold text-slate-900 text-xs truncate leading-tight">{t.title}</p>
                  </div>
                  <div className="flex items-center gap-2.5 justify-end flex-wrap">
                    <span className="text-[9px] text-slate-400 flex items-center gap-1">
                      <Building2 size={8} />{t.institutionName}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      #{refNo}
                    </span>
                    <span className={`text-[9px] font-bold flex items-center gap-0.5 ${days <= 7 ? 'text-red-500' : 'text-amber-600'}`}>
                      <Calendar size={8} />
                      {days > 0 ? `${days} يوم متبقي` : 'انتهت المهلة'}
                    </span>
                  </div>
                </div>

                {/* Deadline & Download */}
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <span className="text-[9px] text-slate-400 font-medium">{t.deadlineAt}</span>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleDownload(t)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      downloading === t.id
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-900 text-white hover:bg-slate-700 group-hover:shadow-sm'
                    }`}
                  >
                    {downloading === t.id ? (
                      <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7 }}><Download size={10} /></motion.div> جاري التحميل...</>
                    ) : (
                      <><CircleDollarSign size={10} />شراء كراسة الشروط </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Vendor Profile Panel ─────────────────────────────────────────────────────

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={11}
          className={i < Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
        />
      ))}
    </div>
  );
}

function EfficiencyRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90 absolute inset-0">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
        <motion.circle
          cx="40" cy="40" r={r} fill="none"
          stroke={color} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - fill }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="text-center z-10">
        <p className="text-lg font-black text-slate-900 leading-none">{score}</p>
        <p className="text-[8px] text-slate-400 font-medium">%</p>
      </div>
    </div>
  );
}

function VendorProfilePanel({ onClose }: { onClose: () => void }) {
  const p = MOCK_VENDOR_PROFILE;
  const [activeTab, setActiveTab] = useState<'overview' | 'projects'>('overview');

  const classColors = { A: 'text-emerald-700 bg-emerald-50 border-emerald-200', B: 'text-amber-700 bg-amber-50 border-amber-200', C: 'text-slate-600 bg-slate-100 border-slate-200' };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-slate-900/50 backdrop-blur-sm flex items-end lg:items-center justify-center p-0 lg:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white w-full max-w-lg rounded-t-[2rem] lg:rounded-[2rem] overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 shrink-0 lg:hidden" />

        {/* Header gradient */}
        <div className="bg-gradient-to-l from-slate-900 to-slate-800 px-5 py-5 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 50%)' }} />
          <div className="flex items-start justify-between gap-3 relative z-10" dir="rtl">
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-all mt-0.5 shrink-0">
              <X size={15} />
            </button>
            <div className="flex-1 text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${classColors[p.classification]}`}>
                  تصنيف {p.classification}
                </span>
                <h3 className="font-black text-white text-sm">{p.companyName}</h3>
              </div>
              <p className="text-white/40 text-[10px] font-mono">{p.registrationNo}</p>
              <div className="flex items-center gap-3 mt-2 justify-end">
                <span className="text-[10px] text-white/60 flex items-center gap-1"><Users size={9} />{p.totalProjects} مشروع</span>
                <span className="text-[10px] text-white/60 flex items-center gap-1"><Briefcase size={9} />{p.yearsActive} سنة خبرة</span>
                <div className="flex items-center gap-1">
                  <StarRating value={p.avgRating} />
                  <span className="text-[10px] text-amber-400 font-bold">{p.avgRating}</span>
                </div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <Building2 size={22} className="text-white/70" />
            </div>
          </div>
        </div>

        {/* Efficiency + certifications */}
        <div className="px-5 py-4 border-b border-slate-100 shrink-0" dir="rtl">
          <div className="flex items-center gap-4">
            <EfficiencyRing score={p.efficiencyScore} />
            <div className="flex-1">
              <p className="text-xs font-black text-slate-800 mb-2">حالة الكفاءة</p>
              <div className="space-y-1">
                {[
                  { label: 'الالتزام بالمواعيد', val: 92 },
                  { label: 'جودة التنفيذ', val: 85 },
                  { label: 'الامتثال للمتطلبات', val: 88 },
                ].map(m => (
                  <div key={m.label} className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${m.val}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium w-14 text-left">{m.val}%</span>
                    <span className="text-[9px] text-slate-600 font-medium w-24 text-right">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="flex flex-wrap gap-1.5 mt-3 justify-end">
            {p.certifications.map(c => (
              <span key={c} className="text-[9px] font-bold px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg flex items-center gap-1">
                <ShieldCheck size={9} />{c}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 shrink-0 px-5" dir="rtl">
          {([['overview','نظرة عامة'], ['projects','المشاريع السابقة']] as const).map(([k,l]) => (
            <button key={k} onClick={() => setActiveTab(k)}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition-all ${activeTab===k ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto" dir="rtl">
          {activeTab === 'overview' && (
            <div className="p-5 space-y-4">
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Trophy, label: 'مشاريع مكتملة', val: p.pastProjects.filter(x=>x.status==='completed').length, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                  { icon: TrendingUp, label: 'معدل التقييم', val: `${p.avgRating}/5`, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                  { icon: Award, label: 'سنوات الخبرة', val: p.yearsActive, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                ].map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className={`rounded-2xl p-3 border text-right ${s.bg} ${s.border}`}>
                      <Icon size={14} className={`${s.color} mb-1.5`} />
                      <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
                      <p className="text-[9px] text-slate-500 font-medium mt-0.5">{s.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Current tender activity */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs font-black text-slate-800 text-right mb-3">نشاط المناقصات الحالي</p>
                <div className="space-y-2">
                  {[
                    { label: 'عروض مقدّمة هذا الشهر', val: '3', color: 'text-slate-800' },
                    { label: 'عروض قيد الدراسة', val: '2', color: 'text-amber-600' },
                    { label: 'مشاريع جارية حالياً', val: '1', color: 'text-emerald-600' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className={`text-sm font-black ${row.color}`}>{row.val}</span>
                      <span className="text-[10px] text-slate-500">{row.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="divide-y divide-slate-50">
              {p.pastProjects.map((proj, idx) => {
                const cfg = TYPE_CONFIG[proj.type];
                return (
                  <motion.div key={proj.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                    className="p-4 space-y-2.5">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                        <cfg.Icon size={13} className={cfg.color} />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-bold text-slate-900 text-xs leading-tight">{proj.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{proj.ministry}</p>
                      </div>
                      <div className="text-left shrink-0">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${proj.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'}`}>
                          {proj.status === 'completed' ? 'مكتمل' : 'جاري'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pr-11">
                      <div className="flex items-center gap-1">
                        <StarRating value={proj.rating} />
                        <span className="text-[9px] text-amber-600 font-bold">{proj.rating}.0</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-slate-400">{proj.year}</span>
                        <span className="text-[10px] font-black text-slate-700">{formatAmount(proj.value, proj.currency)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Advanced Submission Form Modal ──────────────────────────────────────────

function AdvancedSubmissionModal({ tender, onClose, onSubmit }: {
  tender: Tender;
  onClose: () => void;
  onSubmit: (bid: Omit<Bid,'id'|'tenderId'|'status'|'submittedAt'>) => void;
}) {
  const [track, setTrack] = useState<'technical' | 'financial' | null>(null);
  const [techForm, setTechForm] = useState({ drawings: '', timeline: '', equipment: '', plan: '' });
  const [finForm, setFinForm] = useState({ priceList: '', bankGuarantee: '', totalAmount: '', currency: tender.currency });
  const [baseForm, setBaseForm] = useState({ contractorName: '', companyName: '', contactInfo: '', qualifications: '' });
  const [step, setStep] = useState<'base' | 'track' | 'review' | 'done'>('base');
  const [submitting, setSubmitting] = useState(false);
  const cfg = TYPE_CONFIG[tender.type];

  const canBase = baseForm.contractorName && baseForm.contactInfo;
  const canTech = techForm.plan && techForm.timeline;
  const canFin = finForm.totalAmount && finForm.priceList;

  const handleFinalSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      onSubmit({
        contractorName: baseForm.contractorName,
        companyName: baseForm.companyName || undefined,
        contactInfo: baseForm.contactInfo,
        proposedAmount: Number(finForm.totalAmount),
        currency: tender.currency,
        estimatedDays: 60,
        plan: techForm.plan || 'تقديم متكامل عبر المسارين الفني والمالي',
        qualifications: baseForm.qualifications,
      });
    }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 shrink-0 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 shrink-0 flex items-center justify-between">
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">
            <X size={15} />
          </button>
          <div className="text-center">
            <p className="text-xs font-black text-slate-900">نموذج تقديم العطاء</p>
            <p className={`text-[10px] mt-0.5 font-medium ${cfg.color}`}>{tender.title}</p>
          </div>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cfg.bg}`}>
            <cfg.Icon size={14} className={cfg.color} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* Success */}
            {step === 'done' && (
              <motion.div key="done" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                className="p-10 flex flex-col items-center text-center gap-5">
                <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',delay:0.15}}
                  className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                  <CheckCircle2 size={40} className="text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-1.5">تم تقديم العطاء بنجاح! 🎉</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {track === 'technical' ? 'تم رفع المسار الفني' : 'تم رفع المسار المالي'} بنجاح.<br />
                    ستُراجع {tender.institutionName} طلبك وتتواصل معك على {baseForm.contactInfo}.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step Base: info */}
            {step === 'base' && (
              <motion.div key="base" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                className="p-5 space-y-4" dir="rtl">
                <div className="text-right">
                  <h3 className="font-black text-slate-900 text-sm">بيانات المقدِّم</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">أدخل معلوماتك الأساسية أولاً</p>
                </div>
                {[
                  { label:'اسم المهندس / المقاول *', key:'contractorName', placeholder:'م. الاسم الكامل...' },
                  { label:'اسم الشركة', key:'companyName', placeholder:'شركة / مؤسسة...' },
                  { label:'رقم التواصل *', key:'contactInfo', placeholder:'09xxxxxxxx' },
                ].map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 block">{f.label}</label>
                    <input value={baseForm[f.key as keyof typeof baseForm]}
                      onChange={e => setBaseForm(p => ({...p,[f.key]:e.target.value}))}
                      placeholder={f.placeholder}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right placeholder:text-slate-300"
                    />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 block">المؤهلات والخبرات</label>
                  <textarea value={baseForm.qualifications}
                    onChange={e => setBaseForm(p=>({...p,qualifications:e.target.value}))}
                    rows={3} placeholder="اذكر مشاريع مشابهة وشهاداتك..."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right resize-none placeholder:text-slate-300"
                  />
                </div>
                <button onClick={() => setStep('track')} disabled={!canBase}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-40">
                  اختر المسار <ChevronLeft size={16} />
                </button>
              </motion.div>
            )}

            {/* Step Track: choose */}
            {step === 'track' && !track && (
              <motion.div key="trackchoice" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                className="p-5 space-y-4" dir="rtl">
                <div className="text-right">
                  <h3 className="font-black text-slate-900 text-sm">اختر مسار التقديم</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">يمكنك التقديم عبر المسار الفني أو المالي</p>
                </div>

                {/* Technical track */}
                <motion.button whileTap={{scale:0.97}} onClick={() => setTrack('technical')}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-right group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                      <Wrench size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-slate-900 text-sm">المسار الفني</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">رفع المخططات، الجدول الزمني، وقائمة المعدات</p>
                    </div>
                    <ChevronLeft size={15} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="flex gap-1.5 mt-3 pr-13 flex-wrap">
                    {['المخططات الهندسية', 'الجدول الزمني', 'قائمة المعدات'].map(tag => (
                      <span key={tag} className="text-[9px] font-medium px-2 py-0.5 bg-blue-100 text-blue-600 rounded-md">{tag}</span>
                    ))}
                  </div>
                </motion.button>

                {/* Financial track */}
                <motion.button whileTap={{scale:0.97}} onClick={() => setTrack('financial')}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-right group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition-colors">
                      <DollarSign size={18} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-slate-900 text-sm">المسار المالي</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">رفع قوائم الأسعار والضمانات البنكية</p>
                    </div>
                    <ChevronLeft size={15} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {['جدول الأسعار', 'الضمان البنكي', 'العرض المالي'].map(tag => (
                      <span key={tag} className="text-[9px] font-medium px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-md">{tag}</span>
                    ))}
                  </div>
                </motion.button>

                <button onClick={() => setStep('base')} className="w-full py-2.5 text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors">
                  ← رجوع
                </button>
              </motion.div>
            )}

            {/* Technical track form */}
            {step === 'track' && track === 'technical' && (
              <motion.div key="tech" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                className="p-5 space-y-4" dir="rtl">
                <div className="flex items-center gap-2 justify-end">
                  <h3 className="font-black text-slate-900 text-sm">المسار الفني</h3>
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Wrench size={13} className="text-blue-600" />
                  </div>
                </div>

                {/* Mock file upload — drawings */}
                {[
                  { label: 'المخططات الهندسية', icon: FileText, key: 'drawings', hint: 'PDF أو DWG — الحجم الأقصى 20 ميغا', color: 'blue' },
                  { label: 'قائمة المعدات', icon: Package, key: 'equipment', hint: 'قائمة تفصيلية بالمعدات المقترحة', color: 'violet' },
                ].map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 block">{f.label}</label>
                    <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all hover:border-${f.color}-300 hover:bg-${f.color}-50/30 ${techForm[f.key as 'drawings'|'equipment'] ? `border-${f.color}-400 bg-${f.color}-50` : 'border-slate-200'}`}
                      onClick={() => setTechForm(p => ({...p,[f.key]: p[f.key as 'drawings'|'equipment'] ? '' : `ملف_${f.label.replace(/ /g,'_')}.pdf`}))}>
                      {techForm[f.key as 'drawings'|'equipment'] ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 size={14} className={`text-${f.color}-600`} />
                          <span className={`text-xs font-bold text-${f.color}-700`}>{techForm[f.key as 'drawings'|'equipment']}</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={18} className="text-slate-300 mx-auto mb-1" />
                          <p className="text-[10px] text-slate-400">{f.hint}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {/* Timeline */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 block">الجدول الزمني للتنفيذ *</label>
                  <textarea value={techForm.timeline}
                    onChange={e => setTechForm(p=>({...p,timeline:e.target.value}))}
                    rows={3} placeholder="مثال: الأسبوع 1-2: أعمال التحضير — الأسبوع 3-6: التنفيذ الميداني..."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-blue-400 outline-none transition-all text-right resize-none placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 block">خطة التنفيذ الفنية *</label>
                  <textarea value={techForm.plan}
                    onChange={e => setTechForm(p=>({...p,plan:e.target.value}))}
                    rows={3} placeholder="اشرح المنهجية الفنية التي ستتبعها..."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-blue-400 outline-none transition-all text-right resize-none placeholder:text-slate-300"
                  />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setTrack(null)} className="w-10 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-200 shrink-0">
                    <ChevronLeft size={17} className="rotate-180" />
                  </button>
                  <button onClick={() => setStep('review')} disabled={!canTech}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-40">
                    مراجعة وإرسال <ChevronLeft size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Financial track form */}
            {step === 'track' && track === 'financial' && (
              <motion.div key="fin" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                className="p-5 space-y-4" dir="rtl">
                <div className="flex items-center gap-2 justify-end">
                  <h3 className="font-black text-slate-900 text-sm">المسار المالي</h3>
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <DollarSign size={13} className="text-emerald-600" />
                  </div>
                </div>

                {/* Budget reference */}
                <div className={`flex items-center justify-between p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                  <span className={`text-xs font-bold ${cfg.color}`}>{formatAmount(tender.budgetMin, tender.currency)} — {formatAmount(tender.budgetMax, tender.currency)}</span>
                  <span className="text-[10px] text-slate-500">نطاق الميزانية المعتمد</span>
                </div>

                {/* Mock file uploads */}
                {[
                  { label: 'قائمة الأسعار التفصيلية *', key: 'priceList', hint: 'Excel أو PDF — جدول تفصيلي بالبنود والأسعار' },
                  { label: 'الضمان البنكي *', key: 'bankGuarantee', hint: 'صورة من الضمان البنكي بنسبة 10% من قيمة العطاء' },
                ].map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 block">{f.label}</label>
                    <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all hover:border-emerald-300 hover:bg-emerald-50/30 ${finForm[f.key as 'priceList'|'bankGuarantee'] ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200'}`}
                      onClick={() => setFinForm(p => ({...p,[f.key]: p[f.key as 'priceList'|'bankGuarantee'] ? '' : `ملف_${f.label.split(' ')[0]}.pdf`}))}>
                      {finForm[f.key as 'priceList'|'bankGuarantee'] ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-700">{finForm[f.key as 'priceList'|'bankGuarantee']}</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={18} className="text-slate-300 mx-auto mb-1" />
                          <p className="text-[10px] text-slate-400">{f.hint}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 block">إجمالي مبلغ العطاء ({tender.currency}) *</label>
                  <input type="number" value={finForm.totalAmount}
                    onChange={e => setFinForm(p=>({...p,totalAmount:e.target.value}))}
                    placeholder="أدخل المبلغ الإجمالي..."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all text-right"
                  />
                  {finForm.totalAmount && (
                    <p className="text-[10px] text-emerald-600 font-bold text-right">
                      {formatAmount(Number(finForm.totalAmount), tender.currency)}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setTrack(null)} className="w-10 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-200 shrink-0">
                    <ChevronLeft size={17} className="rotate-180" />
                  </button>
                  <button onClick={() => setStep('review')} disabled={!canFin}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-40">
                    مراجعة وإرسال <ChevronLeft size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Review step */}
            {step === 'review' && (
              <motion.div key="review" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                className="p-5 space-y-4" dir="rtl">
                <div className="text-right">
                  <h3 className="font-black text-slate-900 text-sm">مراجعة العطاء</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">تأكّد من صحة البيانات قبل الإرسال</p>
                </div>

                {/* Summary card */}
                <div className={`rounded-2xl p-4 border space-y-3 ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-center gap-2 justify-end">
                    <p className={`font-black text-sm ${cfg.color}`}>{tender.title}</p>
                    <cfg.Icon size={14} className={cfg.color} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { l: 'المقدِّم', v: baseForm.companyName || baseForm.contractorName },
                      { l: 'التواصل', v: baseForm.contactInfo },
                      { l: 'نوع التقديم', v: track === 'technical' ? 'المسار الفني' : 'المسار المالي' },
                      { l: track === 'financial' ? 'المبلغ الإجمالي' : 'مدة التنفيذ', v: track === 'financial' ? formatAmount(Number(finForm.totalAmount), tender.currency) : techForm.timeline.slice(0,25)+'...' },
                    ].map(row => (
                      <div key={row.l} className="bg-white/60 rounded-xl p-2.5 text-right">
                        <p className="text-[9px] text-slate-400 font-medium">{row.l}</p>
                        <p className="text-[10px] font-bold text-slate-800 mt-0.5 truncate">{row.v || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Uploaded files summary */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-600 mb-2">المستندات المرفوعة</p>
                  {track === 'technical' ? (
                    <div className="space-y-1">
                      {[techForm.drawings && 'المخططات الهندسية', techForm.equipment && 'قائمة المعدات', techForm.timeline && 'الجدول الزمني'].filter(Boolean).map(f => (
                        <div key={f as string} className="flex items-center gap-2 justify-end">
                          <span className="text-[10px] text-slate-700 font-medium">{f as string}</span>
                          <CheckCircle2 size={11} className="text-blue-500 shrink-0" />
                        </div>
                      ))}
                      {(!techForm.drawings && !techForm.equipment) && <p className="text-[10px] text-slate-400">لم يُرفع ملف (اختياري)</p>}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {[finForm.priceList && 'قائمة الأسعار', finForm.bankGuarantee && 'الضمان البنكي'].filter(Boolean).map(f => (
                        <div key={f as string} className="flex items-center gap-2 justify-end">
                          <span className="text-[10px] text-slate-700 font-medium">{f as string}</span>
                          <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setStep('track')} className="w-10 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-200 shrink-0">
                    <ChevronLeft size={17} className="rotate-180" />
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setStep('done'); handleFinalSubmit(); }}
                    disabled={submitting}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-200">
                    <Send size={14} /> إرسال العطاء رسمياً
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Tender Card ──────────────────────────────────────────────────────────────

function TenderCard({ tender, role, onBid, onAdvancedBid, onViewBids }: {
  tender: Tender;
  role: UserRole;
  onBid: () => void;
  onAdvancedBid: () => void;
  onViewBids: () => void;
}) {
  const cfg  = TYPE_CONFIG[tender.type];
  const Icon = cfg.Icon;
  const days = daysLeft(tender.deadlineAt);
  const isOpen = tender.status === 'open';

  return (
    <motion.div
      initial={{opacity:0, y:16}} animate={{opacity:1, y:0}}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
    >
      {/* Top accent */}
      <div style={{ background: cfg.accent }} className="h-1 w-full" />

      <div className="p-4 sm:p-5 space-y-4" dir="rtl">

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
            <Icon size={18} className={cfg.color} />
          </div>
          <div className="flex-1 text-right min-w-0">
            <p className="font-black text-slate-900 text-sm leading-tight line-clamp-2">{tender.title}</p>
            <div className="flex items-center gap-1.5 mt-1 justify-end">
              <span className="text-[10px] text-slate-400 truncate">{tender.institutionName}</span>
              <Building2 size={9} className="text-slate-400 shrink-0" />
            </div>
          </div>
          <StatusBadge status={tender.status} />
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 text-right">{tender.description}</p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className={cn('rounded-xl p-2.5 text-right border', cfg.bg, cfg.border)}>
            <p className={cn('text-[9px] font-medium', cfg.color)}>الميزانية</p>
            <p className={cn('text-xs font-black mt-0.5', cfg.color)}>
              {formatAmount(tender.budgetMin, tender.currency)}
            </p>
            <p className={cn('text-[9px]', cfg.color)}>— {formatAmount(tender.budgetMax, tender.currency)}</p>
          </div>

          <div className="rounded-xl p-2.5 text-right bg-slate-50 border border-slate-100">
            <p className="text-[9px] text-slate-400 font-medium">الموعد النهائي</p>
            <p className={cn('text-xs font-black mt-0.5', days<=7 ? 'text-red-600' : 'text-slate-800')}>
              {days > 0 ? `${days} يوم` : 'انتهى'}
            </p>
            <p className="text-[9px] text-slate-400">{tender.deadlineAt}</p>
          </div>

          <div className="rounded-xl p-2.5 text-right bg-slate-50 border border-slate-100">
            <p className="text-[9px] text-slate-400 font-medium">العروض</p>
            <p className="text-xs font-black text-slate-800 mt-0.5">{tender.bidsCount}</p>
            <p className="text-[9px] text-slate-400">عرض مقدَّم</p>
          </div>
        </div>

        {/* Region + Type tags */}
        <div className="flex items-center justify-between">
          <TypeTag type={tender.type} />
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span>{tender.regionName}</span>
            <MapPin size={9} />
          </div>
        </div>

        {/* Requirements preview */}
        {tender.requirements.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-3 text-right border border-slate-100">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-2">المتطلبات الأساسية</p>
            <div className="space-y-1">
              {tender.requirements.slice(0,2).map((req,i) => (
                <div key={i} className="flex items-start gap-1.5 justify-end">
                  <span className="text-[10px] text-slate-600 font-medium leading-tight">{req}</span>
                  <CheckCircle2 size={10} className="text-emerald-500 mt-0.5 shrink-0" />
                </div>
              ))}
              {tender.requirements.length > 2 && (
                <p className="text-[9px] text-slate-400 text-right">+{tender.requirements.length-2} متطلبات أخرى</p>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2 pt-1">
          {/* Official: view bids */}
          {role === 'official' && (
            <button onClick={onViewBids}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]">
              <Eye size={13} /> مراجعة العروض ({tender.bidsCount})
            </button>
          )}

          {/* Citizen: bid */}
          {role === 'citizen' && isOpen && (
            <button onClick={onBid}
              style={{ background: cfg.accent }}
              className="flex-1 py-2.5 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] hover:opacity-90">
              <Send size={13} /> قدِّم عرضك
            </button>
          )}

          {/* Partner: advanced bid */}
          {role === 'partner' && isOpen && (
            <button onClick={onAdvancedBid}
              style={{ background: cfg.accent }}
              className="flex-1 py-2.5 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] hover:opacity-90">
              <FileText size={13} /> تقديم العطاء
            </button>
          )}

          {/* Awarded badge */}
          {tender.status === 'awarded' && role !== 'official' && (
            <div className="flex-1 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black rounded-xl flex items-center justify-center gap-1.5">
              <Trophy size={13} /> تم الترسية
            </div>
          )}

          {/* Closed badge */}
          {tender.status === 'closed' && (
            <div className="flex-1 py-2.5 bg-slate-100 text-slate-400 text-xs font-black rounded-xl flex items-center justify-center gap-1.5">
              مغلقة
            </div>
          )}

          {/* More */}
          <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all">
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Tenders({ role = 'citizen' }: { role?: UserRole }) {
  const [tenders, setTenders]         = useState<Tender[]>(MOCK_TENDERS);
  const [bids, setBids]               = useState<Bid[]>(MOCK_BIDS);
  const [biddingOn, setBiddingOn]     = useState<Tender | null>(null);
  const [viewingBids, setViewingBids] = useState<Tender | null>(null);
  const [showPublish, setShowPublish] = useState(false);
  const [typeFilter, setTypeFilter]   = useState<IssueType|'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TenderStatus|'all'>('all');
  const [search, setSearch]           = useState('');
  const [showVendorProfile, setShowVendorProfile] = useState(false);
  const [advancedBidOn, setAdvancedBidOn] = useState<Tender | null>(null);
  const [downloadedTender, setDownloadedTender] = useState<string | null>(null);

  const filtered = useMemo(() => tenders.filter(t => {
    if (typeFilter   !== 'all' && t.type   !== typeFilter)   return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search && !t.title.includes(search) && !t.institutionName.includes(search)) return false;
    return true;
  }), [tenders, typeFilter, statusFilter, search]);

  const stats = {
    open:      tenders.filter(t => t.status==='open').length,
    reviewing: tenders.filter(t => t.status==='reviewing').length,
    awarded:   tenders.filter(t => t.status==='awarded').length,
    total:     tenders.length,
  };

  const handleBidSubmit = (bidData: Omit<Bid,'id'|'tenderId'|'status'|'submittedAt'>) => {
    const targetTender = biddingOn || advancedBidOn;
    if (!targetTender) return;
    const newBid: Bid = {
      ...bidData,
      id: `b${Date.now()}`,
      tenderId: targetTender.id,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
    };
    setBids(prev => [...prev, newBid]);
    setTenders(prev => prev.map(t =>
      t.id === targetTender.id ? { ...t, bidsCount: t.bidsCount + 1 } : t
    ));
    setBiddingOn(null);
    setAdvancedBidOn(null);
  };

  const handleDownloadDoc = (t: Tender) => {
    setDownloadedTender(t.id);
    setTimeout(() => setDownloadedTender(null), 3000);
  };

  const handleAward = (bidId: string) => {
    if (!viewingBids) return;
    setBids(prev => prev.map(b => ({
      ...b,
      status: b.tenderId === viewingBids.id
        ? b.id === bidId ? 'awarded' : 'rejected'
        : b.status
    })));
    setTenders(prev => prev.map(t =>
      t.id === viewingBids.id ? { ...t, status:'awarded', awardedBidId:bidId } : t
    ));
    setViewingBids(null);
  };

  const handlePublish = (data: Omit<Tender,'id'|'bidsCount'|'status'|'createdAt'>) => {
    const newTender: Tender = {
      ...data,
      id: `t${Date.now()}`,
      bidsCount: 0,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTenders(prev => [newTender, ...prev]);
    setShowPublish(false);
  };

  return (
    <>
      <div className="space-y-5 p-4 sm:p-5 lg:p-6 pb-24 lg:pb-8" dir="rtl">

        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {role === 'official' && (
              <motion.button
                whileTap={{scale:0.96}}
                onClick={() => setShowPublish(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-2xl transition-all shadow-md shadow-emerald-200 active:scale-[0.97]">
                <Plus size={16} />
                <span className="hidden sm:block">نشر مناقصة</span>
              </motion.button>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-0.5">
              <h2 className="text-xl font-black text-slate-900"> المناقصات المطروحة </h2>
              <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center">
                <Gavel size={16} className="text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium">منصة عمران لمناقصات البنية التحتية</p>
          </div>
        </div>

        {/* ── Stats Row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:'مناقصات مفتوحة',  val:stats.open,      icon:CircleDot,    color:'text-emerald-600', bg:'bg-emerald-50',  border:'border-emerald-200' },
            { label:'قيد المراجعة',    val:stats.reviewing,  icon:FileText,     color:'text-amber-600',   bg:'bg-amber-50',    border:'border-amber-200'   },
            { label:'تم الترسية',      val:stats.awarded,    icon:Trophy,       color:'text-blue-600',    bg:'bg-blue-50',     border:'border-blue-200'    },
            { label:'إجمالي المناقصات',val:stats.total,      icon:Gavel,        color:'text-slate-700',   bg:'bg-slate-100',   border:'border-slate-200'   },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={cn('rounded-2xl p-4 border text-right', s.bg, s.border)}>
                <div className="flex items-center justify-end mb-2">
                  <Icon size={16} className={s.color} />
                </div>
                <p className={cn('text-2xl font-black', s.color)}>{s.val}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* ── Role banner ───────────────────────────────────────── */}
        {role === 'official' && (
          <div className="bg-gradient-to-l from-emerald-700 to-emerald-600 rounded-2xl p-4 text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div className="text-right flex-1">
              <p className="font-black text-sm">وضع المسؤول الحكومي</p>
              <p className="text-white/70 text-xs mt-0.5">يمكنك نشر مناقصات جديدة ومراجعة العروض واختيار الفائز</p>
            </div>
          </div>
        )}
        {(role === 'citizen' || role === 'partner') && (
          <div className="bg-gradient-to-l from-slate-800 to-slate-900 rounded-2xl p-4 text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-amber-400" />
            </div>
            <div className="text-right flex-1">
              <p className="font-black text-sm">تنافس وفُز بالمناقصات المطروحة</p>
              <p className="text-white/50 text-xs mt-0.5">قدِّم عرضك على أي مناقصة مفتوحة، وابنِ سجلك كمقاول موثوق</p>
            </div>
          </div>
        )}

        {/* ── Open Tenders Section ──────────────────────────── */}
        <OpenTendersSection tenders={tenders} onDownload={handleDownloadDoc} />

        {/* Download toast */}
        <AnimatePresence>
          {downloadedTender && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-xl text-xs font-bold">
              <CheckCircle2 size={13} className="text-emerald-400" />
              تم تحميل كراسة الشروط بنجاح
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Vendor Profile Banner (partner only) ────────── */}
        {role === 'partner' && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowVendorProfile(true)}
            className="w-full bg-gradient-to-l from-slate-800 to-slate-900 rounded-2xl p-4 text-white flex items-center gap-3 hover:from-slate-700 hover:to-slate-800 transition-all shadow-md"
          >
            <div className="flex-1 text-right">
              <p className="font-black text-sm">ملف الشركة — {MOCK_VENDOR_PROFILE.companyName}</p>
              <div className="flex items-center gap-3 mt-1 justify-end">
                <span className="text-white/50 text-[10px] flex items-center gap-1"><Medal size={9} />كفاءة {MOCK_VENDOR_PROFILE.efficiencyScore}%</span>
                <span className="text-white/50 text-[10px] flex items-center gap-1"><Star size={9} className="fill-amber-400 text-amber-400" />{MOCK_VENDOR_PROFILE.avgRating}/5</span>
                <span className="text-white/50 text-[10px] flex items-center gap-1"><Trophy size={9} />{MOCK_VENDOR_PROFILE.totalProjects} مشروع</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <BarChart3 size={18} className="text-emerald-400" />
            </div>
          </motion.button>
        )}

        {/* ── Filters ───────────────────────────────────────────── */}
        <div className="space-y-2.5 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="بحث في المناقصات..."
              className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent text-right placeholder:text-slate-300"
            />
          </div>

          {/* Status tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {([['all','الكل'],['open','مفتوحة'],['reviewing','قيد المراجعة'],['awarded','تم الترسية'],['closed','مغلقة']] as const).map(([v,l]) => (
              <button key={v} onClick={() => setStatusFilter(v)}
                className={cn('px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border',
                  statusFilter===v ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                )}>{l}</button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <button onClick={() => setTypeFilter('all')}
              className={cn('px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border',
                typeFilter==='all' ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
              )}>كل الأنواع</button>
            {(Object.entries(TYPE_CONFIG) as [IssueType, typeof TYPE_CONFIG[IssueType]][]).map(([key,cfg]) => {
              const Icon = cfg.Icon;
              return (
                <button key={key} onClick={() => setTypeFilter(key)}
                  className={cn('px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border flex items-center gap-1',
                    typeFilter===key ? cn(cfg.bg, cfg.border, cfg.color) : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                  )}>
                  <Icon size={11} />{cfg.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">{filtered.length} مناقصة</span>
          </div>
        </div>

        {/* ── Tenders Grid ──────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-14 text-center">
            <Gavel size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">لا توجد مناقصات تطابق الفلتر</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(tender => (
              <TenderCard
                key={tender.id}
                tender={tender}
                role={role}
                onBid={() => setBiddingOn(tender)}
                onAdvancedBid={() => setAdvancedBidOn(tender)}
                onViewBids={() => setViewingBids(tender)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {biddingOn && (
          <BidModal
            tender={biddingOn}
            onClose={() => setBiddingOn(null)}
            onSubmit={handleBidSubmit}
          />
        )}
        {viewingBids && (
          <BidsPanel
            tender={viewingBids}
            bids={bids}
            onClose={() => setViewingBids(null)}
            onAward={handleAward}
          />
        )}
        {showPublish && (
          <PublishModal
            onClose={() => setShowPublish(false)}
            onPublish={handlePublish}
          />
        )}
        {showVendorProfile && (
          <VendorProfilePanel onClose={() => setShowVendorProfile(false)} />
        )}
        {advancedBidOn && (
          <AdvancedSubmissionModal
            tender={advancedBidOn}
            onClose={() => setAdvancedBidOn(null)}
            onSubmit={handleBidSubmit}
          />
        )}
      </AnimatePresence>
    </>
  );
}
