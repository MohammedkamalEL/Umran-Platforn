import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Home, Sparkles, Building2, ChevronLeft,
  MapPin, Clock, CheckCircle2, ArrowUpRight, X,
  Heart, Hammer, Droplets, Zap, Construction, Trash2,
  Star, Shield, Upload, Send, AlertCircle, Trophy,
  HandCoins, Plus
} from 'lucide-react';
import { cn } from '../lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────

type AdopterType = 'individual' | 'initiative' | 'neighborhood';
type AdoptionStatus = 'open' | 'in_progress' | 'completed';
type IssueType = 'water' | 'electricity' | 'road' | 'waste' | 'other';

interface AdoptableIssue {
  id: string;
  title: string;
  description: string;
  location: string;
  type: IssueType;
  severity: 1 | 2 | 3;
  reportCount: number;
  adoptionStatus: AdoptionStatus;
  adopterName?: string;
  adopterType?: AdopterType;
  adopterAvatar?: string;
  progressPercent?: number;
  estimatedDays?: number;
  pointsReward: number;
}

interface AdoptionForm {
  adopterType: AdopterType;
  name: string;
  description: string;
  plan: string;
  estimatedDays: string;
  contactInfo: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_ISSUES: AdoptableIssue[] = [
  {
    id: 'a1',
    title: 'تسرب مياه في شارع النيل',
    description: 'تسرب مستمر من أنبوب رئيسي يُضيّع آلاف اللترات يومياً ويسبب أضراراً للطريق',
    location: 'شارع النيل، الخرطوم بحري',
    type: 'water',
    severity: 3,
    reportCount: 47,
    adoptionStatus: 'open',
    pointsReward: 800,
  },
  {
    id: 'a2',
    title: 'إنارة مقطوعة في حي الصحافة',
    description: 'عمودا إضاءة معطلان منذ أسبوعين، المنطقة مظلمة تماماً بعد الغروب',
    location: 'حي الصحافة، أم درمان',
    type: 'electricity',
    severity: 2,
    reportCount: 31,
    adoptionStatus: 'in_progress',
    adopterName: 'مبادرة أبناء الصحافة',
    adopterType: 'initiative',
    progressPercent: 60,
    estimatedDays: 3,
    pointsReward: 500,
  },
  {
    id: 'a3',
    title: 'حفرة خطرة في مدخل المدرسة',
    description: 'حفرة كبيرة تعيق مرور الأطفال وتسببت في حوادث متعددة',
    location: 'مدرسة الأمل، الكلاكلة',
    type: 'road',
    severity: 3,
    reportCount: 89,
    adoptionStatus: 'open',
    pointsReward: 650,
  },
  {
    id: 'a4',
    title: 'تراكم نفايات في الشارع الجانبي',
    description: 'لم تُجمع النفايات منذ 10 أيام، الرائحة تؤثر على السكان',
    location: 'شارع الثورة 14، الجريف',
    type: 'waste',
    severity: 2,
    reportCount: 23,
    adoptionStatus: 'completed',
    adopterName: 'أبو أحمد الجريفاوي',
    adopterType: 'individual',
    progressPercent: 100,
    pointsReward: 400,
  },
  {
    id: 'a5',
    title: 'بئر مياه متهالكة في الحلة',
    description: 'بئر الحلة الوحيدة توقفت مضختها، ٢٠٠ أسرة بدون مياه',
    location: 'حلة حمد، شرق النيل',
    type: 'water',
    severity: 3,
    reportCount: 120,
    adoptionStatus: 'open',
    pointsReward: 1200,
  },
  {
    id: 'a6',
    title: 'تلف رصيف ممر المشاة',
    description: 'رصيف متكسر يعيق حركة كبار السن وذوي الإعاقة',
    location: 'شارع القصر، الخرطوم',
    type: 'road',
    severity: 1,
    reportCount: 14,
    adoptionStatus: 'open',
    pointsReward: 300,
  },
];

// ─── Config ─────────────────────────────────────────────────────────────────

const ISSUE_TYPE_CONFIG: Record<IssueType, { label: string; Icon: React.FC<any>; color: string; bg: string; border: string }> = {
  water:       { label: 'مياه',    Icon: Droplets,     color: 'text-sky-600',    bg: 'bg-sky-50',    border: 'border-sky-200'    },
  electricity: { label: 'كهرباء', Icon: Zap,          color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200'  },
  road:        { label: 'طرق',    Icon: Construction, color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200'  },
  waste:       { label: 'نفايات', Icon: Trash2,        color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-200'},
  other:       { label: 'أخرى',   Icon: AlertCircle,  color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
};

const ADOPTER_TYPES: { id: AdopterType; label: string; sublabel: string; Icon: React.FC<any>; color: string }[] = [
  { id: 'individual',   label: 'فرد',        sublabel: 'مواطن يتطوع بجهده أو ماله',     Icon: Heart,     color: 'emerald' },
  { id: 'initiative',   label: 'مبادرة',     sublabel: 'مجموعة أو مشروع مجتمعي',        Icon: Sparkles,  color: 'violet'  },
  { id: 'neighborhood', label: 'أبناء حلة',  sublabel: 'سكان المنطقة يتكاتفون معاً',    Icon: Home,      color: 'amber'   },
];

const STATUS_CONFIG: Record<AdoptionStatus, { label: string; color: string; dot: string }> = {
  open:        { label: 'متاح للتبني',    color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500 animate-pulse' },
  in_progress: { label: 'قيد المعالجة',   color: 'text-amber-700 bg-amber-50 border-amber-200',       dot: 'bg-amber-500'               },
  completed:   { label: 'تم الحل',        color: 'text-slate-600 bg-slate-50 border-slate-200',       dot: 'bg-slate-400'               },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function SeverityBar({ severity }: { severity: 1 | 2 | 3 }) {
  const colors = ['bg-emerald-400', 'bg-amber-400', 'bg-red-500'];
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <div key={i} className={cn('h-1 w-5 rounded-full', i <= severity ? colors[severity - 1] : 'bg-slate-200')} />
      ))}
    </div>
  );
}

// ─── Adoption Modal ──────────────────────────────────────────────────────────

function AdoptionModal({ issue, onClose, onSubmit }: {
  issue: AdoptableIssue;
  onClose: () => void;
  onSubmit: (form: AdoptionForm) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<AdoptionForm>({
    adopterType: 'individual',
    name: '', description: '', plan: '', estimatedDays: '', contactInfo: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const typeConfig = ISSUE_TYPE_CONFIG[issue.type];
  const TypeIcon = typeConfig.Icon;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onSubmit(form);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 pt-4 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">
              <X size={16} />
            </button>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400">تبني المشكلة</p>
              {/* Step Dots */}
              {!submitted && (
                <div className="flex justify-center gap-1.5 mt-1.5">
                  {[1, 2, 3].map(s => (
                    <div key={s} className={cn(
                      'h-1 rounded-full transition-all duration-300',
                      step === s ? 'w-5 bg-emerald-500' : step > s ? 'w-3 bg-emerald-300' : 'w-3 bg-slate-200'
                    )} />
                  ))}
                </div>
              )}
            </div>
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', typeConfig.bg)}>
              <TypeIcon size={15} className={typeConfig.color} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* Success State */}
            {submitted && (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 flex flex-col items-center text-center gap-5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200"
                >
                  <CheckCircle2 size={40} className="text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">شكراً لك يا بطل! 🎉</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    تم تسجيل تبنيك لهذه المشكلة. سيتواصل معك فريق عمران لتنسيق الخطوات القادمة.
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 w-full text-right">
                  <p className="text-xs text-emerald-600 font-medium mb-1">ستحصل على</p>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-2xl font-black text-emerald-700">+{issue.pointsReward}</span>
                    <span className="text-sm font-bold text-emerald-600">نقطة عمران</span>
                    <Star size={18} className="text-amber-400" fill="currentColor" />
                  </div>
                  <p className="text-[10px] text-emerald-500 mt-1">عند إتمام الحل بنجاح</p>
                </div>
              </motion.div>
            )}

            {/* Step 1 — Who are you? */}
            {!submitted && step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="p-5 space-y-5" dir="rtl"
              >
                {/* Issue Summary */}
                <div className={cn('p-4 rounded-2xl border', typeConfig.bg, typeConfig.border)}>
                  <div className="flex items-start gap-3">
                    <TypeIcon size={18} className={cn(typeConfig.color, 'mt-0.5 shrink-0')} />
                    <div className="text-right">
                      <p className="font-black text-slate-900 text-sm leading-tight">{issue.title}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 justify-end">
                        <span className="text-[10px] text-slate-500">{issue.location}</span>
                        <MapPin size={10} className="text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <h3 className="font-black text-slate-900 text-base mb-0.5">من أنت؟</h3>
                  <p className="text-xs text-slate-400">اختر نوع جهتك المتبنية</p>
                </div>

                <div className="space-y-2.5">
                  {ADOPTER_TYPES.map(type => {
                    const Icon = type.Icon;
                    const isSelected = form.adopterType === type.id;
                    const colorMap: Record<string, string> = {
                      emerald: 'border-emerald-400 bg-emerald-50',
                      violet:  'border-violet-400 bg-violet-50',
                      amber:   'border-amber-400 bg-amber-50',
                    };
                    const iconMap: Record<string, string> = {
                      emerald: 'bg-emerald-500 text-white',
                      violet:  'bg-violet-500 text-white',
                      amber:   'bg-amber-500 text-white',
                    };
                    return (
                      <button key={type.id}
                        onClick={() => setForm(f => ({ ...f, adopterType: type.id }))}
                        className={cn(
                          'w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-right',
                          isSelected ? colorMap[type.color] : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                        )}
                      >
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
                          isSelected ? iconMap[type.color] : 'bg-slate-100 text-slate-500'
                        )}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-slate-900 text-sm">{type.label}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{type.sublabel}</p>
                        </div>
                        {isSelected && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => setStep(2)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm shadow-emerald-200">
                  التالي
                  <ChevronLeft size={16} />
                </button>
              </motion.div>
            )}

            {/* Step 2 — Your info & plan */}
            {!submitted && step === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="p-5 space-y-4" dir="rtl"
              >
                <div className="text-right">
                  <h3 className="font-black text-slate-900 text-base mb-0.5">بياناتك وخطتك</h3>
                  <p className="text-xs text-slate-400">أخبرنا كيف ستحل هذه المشكلة</p>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block text-right">
                    {form.adopterType === 'individual' ? 'اسمك' : form.adopterType === 'initiative' ? 'اسم المبادرة' : 'اسم الحلة / المجموعة'}
                  </label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="أدخل الاسم..."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all placeholder:text-slate-300 text-right" />
                </div>

                {/* About */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block text-right">نبذة عنك / عن مجموعتك</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="اشرح باختصار من أنت وما قدرتك على حل هذه المشكلة..."
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all placeholder:text-slate-300 text-right resize-none" />
                </div>

                {/* Plan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block text-right">خطة الحل</label>
                  <textarea value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                    placeholder="كيف ستحل المشكلة؟ ما الأدوات أو الموارد التي ستستخدمها؟"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all placeholder:text-slate-300 text-right resize-none" />
                </div>

                {/* Estimated days + contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block text-right">المدة المتوقعة (أيام)</label>
                    <input value={form.estimatedDays} onChange={e => setForm(f => ({ ...f, estimatedDays: e.target.value }))}
                      placeholder="مثال: 7"
                      type="number"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all placeholder:text-slate-300 text-right" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block text-right">رقم التواصل</label>
                    <input value={form.contactInfo} onChange={e => setForm(f => ({ ...f, contactInfo: e.target.value }))}
                      placeholder="0912..."
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-400 outline-none transition-all placeholder:text-slate-300 text-right" />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={() => setStep(1)}
                    className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all shrink-0">
                    <ChevronLeft size={18} className="rotate-180" />
                  </button>
                  <button onClick={() => setStep(3)} disabled={!form.name || !form.plan}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 shadow-sm shadow-emerald-200">
                    مراجعة الطلب
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3 — Review & Confirm */}
            {!submitted && step === 3 && (
              <motion.div key="step3"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="p-5 space-y-4" dir="rtl"
              >
                <div className="text-right">
                  <h3 className="font-black text-slate-900 text-base mb-0.5">مراجعة الطلب</h3>
                  <p className="text-xs text-slate-400">تحقق من بياناتك قبل الإرسال</p>
                </div>

                {/* Summary card */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className={cn('text-xs font-bold px-2.5 py-1 rounded-lg border',
                      form.adopterType === 'individual' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      form.adopterType === 'initiative' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    )}>
                      {ADOPTER_TYPES.find(t => t.id === form.adopterType)?.label}
                    </span>
                    <p className="font-black text-slate-900">{form.name}</p>
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="text-right space-y-2">
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">خطة الحل</p>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">{form.plan}</p>
                    </div>
                    {form.estimatedDays && (
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm font-bold text-slate-700">{form.estimatedDays} أيام</span>
                        <Clock size={13} className="text-slate-400" />
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className={cn('flex items-start gap-3 p-3 rounded-xl border', ISSUE_TYPE_CONFIG[issue.type].bg, ISSUE_TYPE_CONFIG[issue.type].border)}>
                    {React.createElement(ISSUE_TYPE_CONFIG[issue.type].Icon, { size: 15, className: cn(ISSUE_TYPE_CONFIG[issue.type].color, 'mt-0.5 shrink-0') })}
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-800">{issue.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{issue.location}</p>
                    </div>
                  </div>
                </div>

                {/* Reward preview */}
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5">
                    <Trophy size={16} className="text-amber-500" />
                    <span className="text-sm font-black text-emerald-700">+{issue.pointsReward} نقطة</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">عند إتمام الحل بنجاح</span>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setStep(2)}
                    className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all shrink-0">
                    <ChevronLeft size={18} className="rotate-180" />
                  </button>
                  <button onClick={handleSubmit}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm shadow-emerald-200">
                    <Send size={15} />
                    أرسل طلب التبني
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

// ─── Issue Card ──────────────────────────────────────────────────────────────

function AdoptableIssueCard({ issue, onAdopt }: { issue: AdoptableIssue; onAdopt: () => void }) {
  const typeConfig = ISSUE_TYPE_CONFIG[issue.type];
  const statusConfig = STATUS_CONFIG[issue.adoptionStatus];
  const TypeIcon = typeConfig.Icon;
  const adopterIcon = issue.adopterType === 'individual' ? Heart :
                      issue.adopterType === 'initiative' ? Sparkles : Home;
  const AdopterIcon = adopterIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
    >
      {/* Top strip */}
      <div className={cn('h-1 w-full', typeConfig.color.replace('text-', 'bg-'))} />

      <div className="p-4 space-y-4" dir="rtl">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', typeConfig.bg)}>
            <TypeIcon size={18} className={typeConfig.color} />
          </div>
          <div className="flex-1 text-right min-w-0">
            <p className="font-black text-slate-900 text-sm leading-tight line-clamp-2">{issue.title}</p>
            <div className="flex items-center gap-1.5 mt-1 justify-end">
              <span className="text-[10px] text-slate-400 truncate max-w-[160px]">{issue.location}</span>
              <MapPin size={9} className="text-slate-400 shrink-0" />
            </div>
          </div>
          {/* Status badge */}
          <span className={cn('text-[10px] font-bold px-2 py-1 rounded-lg border whitespace-nowrap flex items-center gap-1', statusConfig.color)}>
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusConfig.dot)} />
            {statusConfig.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 text-right">{issue.description}</p>

        {/* Severity + reports */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-medium">{issue.reportCount} بلاغ</span>
            <Users size={11} className="text-slate-400" />
          </div>
          <SeverityBar severity={issue.severity} />
        </div>

        {/* Adopter info or Progress */}
        {issue.adoptionStatus === 'in_progress' && issue.adopterName && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AdopterIcon size={12} className="text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500">{issue.adopterName}</span>
              </div>
              <span className="text-xs font-black text-slate-800">{issue.progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${issue.progressPercent || 0}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-amber-500 rounded-full"
              />
            </div>
            {issue.estimatedDays && (
              <div className="flex items-center gap-1 justify-end">
                <span className="text-[10px] text-slate-400">{issue.estimatedDays} أيام متبقية</span>
                <Clock size={9} className="text-slate-400" />
              </div>
            )}
          </div>
        )}

        {issue.adoptionStatus === 'completed' && issue.adopterName && (
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            <div className="text-right">
              <p className="text-[10px] text-emerald-700 font-bold">تم الحل بواسطة: {issue.adopterName}</p>
              <p className="text-[9px] text-emerald-500 font-medium">
                {ADOPTER_TYPES.find(t => t.id === issue.adopterType)?.sublabel}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 pt-1">
          {/* Reward */}
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1.5">
            <Star size={11} className="text-amber-500" fill="currentColor" />
            <span className="text-xs font-black text-amber-700">+{issue.pointsReward}</span>
          </div>

          {/* CTA */}
          {issue.adoptionStatus === 'open' && (
            <button
              onClick={onAdopt}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] shadow-sm shadow-emerald-200"
            >
              <Hammer size={13} />
              تبنّ هذه المشكلة
            </button>
          )}
          {issue.adoptionStatus === 'in_progress' && (
            <button className="flex-1 py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed">
              <Clock size={13} />
              جارٍ العمل عليها
            </button>
          )}
          {issue.adoptionStatus === 'completed' && (
            <div className="flex-1 py-2.5 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
              <CheckCircle2 size={13} />
              مكتملة
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function CommunityAdoption() {
  const [filter, setFilter] = useState<AdoptionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<IssueType | 'all'>('all');
  const [adoptingIssue, setAdoptingIssue] = useState<AdoptableIssue | null>(null);
  const [issues, setIssues] = useState(MOCK_ISSUES);

  const filtered = issues.filter(i => {
    if (filter !== 'all' && i.adoptionStatus !== filter) return false;
    if (typeFilter !== 'all' && i.type !== typeFilter) return false;
    return true;
  });

  const stats = {
    open:        issues.filter(i => i.adoptionStatus === 'open').length,
    in_progress: issues.filter(i => i.adoptionStatus === 'in_progress').length,
    completed:   issues.filter(i => i.adoptionStatus === 'completed').length,
  };

  const handleAdoptionSubmit = (form: AdoptionForm) => {
    if (!adoptingIssue) return;
    setIssues(prev => prev.map(i =>
      i.id === adoptingIssue.id
        ? { ...i, adoptionStatus: 'in_progress', adopterName: form.name, adopterType: form.adopterType, progressPercent: 5, estimatedDays: parseInt(form.estimatedDays) || 7 }
        : i
    ));
    setAdoptingIssue(null);
  };

  return (
    <>
      <div className="space-y-5 pb-4" dir="rtl">

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-3 py-1.5">
            <Hammer size={14} className="text-violet-600" />
            <span className="text-xs font-bold text-violet-700">مبادرة مجتمعية</span>
          </div>
          <div className="text-right">
            <h3 className="text-base font-black text-slate-900">تبنّ مشكلة وحلّها</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">أفراد ومبادرات وأبناء حلة يغيّرون الواقع</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'تنتظر متطوعاً', value: stats.open,        color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500 animate-pulse' },
            { label: 'قيد المعالجة',  value: stats.in_progress, color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',     dot: 'bg-amber-500'               },
            { label: 'تم حلها',       value: stats.completed,   color: 'text-slate-600',   bg: 'bg-slate-50 border-slate-200',     dot: 'bg-slate-400'               },
          ].map(s => (
            <div key={s.label} className={cn('rounded-2xl border p-3 text-right', s.bg)}>
              <div className="flex items-center gap-1.5 justify-end mb-1">
                <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
              </div>
              <p className={cn('text-2xl font-black', s.color)}>{s.value}</p>
              <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="space-y-2">
          {/* Status filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {([['all', 'الكل'], ['open', 'متاح'], ['in_progress', 'قيد الحل'], ['completed', 'مكتمل']] as const).map(([val, lbl]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border',
                  filter === val
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                )}>
                {lbl}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <button onClick={() => setTypeFilter('all')}
              className={cn('px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border',
                typeFilter === 'all' ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200')}>
              كل الأنواع
            </button>
            {(Object.entries(ISSUE_TYPE_CONFIG) as [IssueType, typeof ISSUE_TYPE_CONFIG[IssueType]][]).map(([key, cfg]) => {
              const Icon = cfg.Icon;
              return (
                <button key={key} onClick={() => setTypeFilter(key)}
                  className={cn('px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border flex items-center gap-1',
                    typeFilter === key ? cn(cfg.bg, cfg.border, cfg.color) : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200')}>
                  <Icon size={11} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Issues Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Hammer size={22} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-500">لا توجد مشاكل في هذه الفئة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(issue => (
              <AdoptableIssueCard key={issue.id} issue={issue} onAdopt={() => setAdoptingIssue(issue)} />
            ))}
          </div>
        )}

        {/* Call to action banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 p-5 text-white">
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 blur-2xl rounded-full" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={22} className="text-white" />
            </div>
            <div className="text-right space-y-2 flex-1">
              <p className="text-violet-200 text-[10px] font-bold uppercase tracking-widest">أنت أيضاً تستطيع</p>
              <h4 className="font-black text-base leading-tight">غيّر حارتك بنفسك 💪</h4>
              <p className="text-violet-200 text-xs leading-relaxed">
                سواء كنت فرداً أو مجموعة — كل حل صغير يُحدث فرقاً كبيراً في حياة جيرانك
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-1 bg-white/20 rounded-lg px-2.5 py-1">
                  <Shield size={11} className="text-violet-200" />
                  <span className="text-[10px] font-bold text-violet-100">معتمد من عمران</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-400/30 rounded-lg px-2.5 py-1">
                  <Star size={11} className="text-amber-300" fill="currentColor" />
                  <span className="text-[10px] font-bold text-amber-200">نقاط وتقدير</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Adoption Modal */}
      <AnimatePresence>
        {adoptingIssue && (
          <AdoptionModal
            issue={adoptingIssue}
            onClose={() => setAdoptingIssue(null)}
            onSubmit={handleAdoptionSubmit}
          />
        )}
      </AnimatePresence>
    </>
  );
}
