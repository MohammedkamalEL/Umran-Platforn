import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Droplets, CreditCard, ChevronRight, CheckCircle2, QrCode, Smartphone, Wallet, Loader2, ArrowRight, Gift, Coins, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { INSTITUTIONS } from '../constants';

type PaymentStep = 'select' | 'details' | 'confirm' | 'success' | 'points-redeem';

export default function UtilityPayments() {
  const [step, setStep] = useState<PaymentStep>('select');
  const [service, setService] = useState<'electricity' | 'water' | null>(null);
  const [meterNumber, setMeterNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(2450); // Mock user points

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 2000);
  };

  const handleRedeem = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPoints(prev => prev - 1000);
      setStep('success');
    }, 1500);
  };

  const services = [
    { 
      id: 'electricity', 
      name: 'شراء كهرباء (سودا-بست)', 
      institutionId: 'electricity',
      icon: Zap, 
      color: 'bg-amber-500',
      desc: 'شحن فوري للعدادات بتعريفة الشركة السودانية.'
    },
    { 
      id: 'water', 
      name: 'تحصيل المياه', 
      institutionId: 'water',
      icon: Droplets, 
      color: 'bg-blue-500',
      desc: 'سداد المطالبات الشهرية لمحطة المياه.'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <h3 className="font-black text-slate-800 text-sm uppercase tracking-[0.2em] font-mono italic">بوابة الخدمات المالية // الخدمات الوطنية</h3>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <Coins size={16} className="text-amber-500" />
          <span className="text-sm font-black text-slate-900 font-mono tracking-tighter">{points.toLocaleString()}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">نقطة</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'select' && (
          <motion.div 
            key="select"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            {/* National Wallet Card - Premium Technical Design */}
            <div className="p-10 rounded-[3.5rem] bg-emerald-600 text-white overflow-hidden relative shadow-[0_40px_80px_-15px_rgba(5,150,105,0.3)] group border border-emerald-500/30">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[120px] -mr-20 -mt-20 group-hover:bg-white/20 transition-all duration-700" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-[100px] -ml-20 -mb-20" />
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none sudan-texture" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <div className="p-4 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
                    <Wallet size={28} className="text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">المحفظة الوطنية الرقمية</p>
                    <div className="flex items-center gap-2 justify-end">
                       <p className="text-sm font-bold font-mono tracking-wider opacity-60">ID: SD-WA-880-991</p>
                       <QrCode size={14} className="opacity-40" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center mb-12">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-6xl font-black font-mono tracking-tighter">0.00</span>
                    <span className="text-sm font-black text-emerald-400 uppercase tracking-widest pb-2">ج.س</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">الرصيد المتاح // حساب ٠٠١</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="flex-1 py-5 bg-white text-slate-900 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-2xl hover:bg-emerald-50 relative overflow-hidden group">
                    <span className="relative z-10">إيداع رصيد جديد</span>
                    <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button 
                    onClick={() => setStep('points-redeem')}
                    className="flex-1 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-3 backdrop-blur-md"
                  >
                    <Gift size={18} className="text-amber-400" />
                   استبدال النقاط
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="px-2">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">اختيار بوابة الخدمات المختصة</h4>
              </div>
              {services.map(s => {
                const inst = INSTITUTIONS.find(i => i.id === s.institutionId);
                return (
                  <button
                    key={s.id}
                    onClick={() => { setService(s.id as any); setStep('details'); }}
                    className="group p-6 bento-inner bg-white hover:border-emerald-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 text-right flex items-center gap-6"
                  >
                    <div className={cn("w-20 h-20 rounded-[3.5rem] flex items-center justify-center text-white transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 relative overflow-hidden shadow-lg", s.color)}>
                      <div className="absolute inset-0 opacity-20 sudan-texture" />
                      <s.icon size={32} className="relative z-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 justify-end mb-2">
                        {inst?.logo && <img src={inst.logo} className="w-5 h-5 rounded-full border border-slate-100 shadow-sm" />}
                        <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight">{s.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed italic line-clamp-1">{s.desc}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-slate-50 flex items-center justify-center group-hover:border-emerald-100 group-hover:bg-emerald-50 transition-all">
                       <ChevronRight size={20} className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 'points-redeem' && (
          <motion.div 
            key="points-redeem"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setStep('select')}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowRight size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">رجوع</span>
            </button>

            <div className="bento-inner bg-emerald-500 text-white p-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 sudan-texture" />
              <div className="relative z-10 text-center">
                <Gift size={48} className="mx-auto mb-4 opacity-80" />
                <h3 className="text-xl font-black mb-2">استبدال النقاط بالخدمات</h3>
                <p className="text-xs font-medium opacity-80 leading-relaxed mb-6">حوّل مجهوداتك في إعمار وتطوير السودان إلى رصيد حقيقي لخدمات الكهرباء والمياه.</p>
                
                <div className="p-4 bg-white/10 rounded-[28px] border border-white/10 backdrop-blur-md inline-flex items-center gap-3 mb-8 px-8">
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase opacity-60">رصيدك الحالي</p>
                    <p className="text-2xl font-black font-mono">{points.toLocaleString()}</p>
                  </div>
                  <div className="w-[1px] h-8 bg-white/20 mx-2" />
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase opacity-60">القيمة التقديرية</p>
                    <p className="text-2xl font-black font-mono">{(points / 10).toFixed(0)} ج.س</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleRedeem}
                    disabled={points < 1000 || loading}
                    className="w-full py-5 bg-white text-emerald-600 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "تحويل ١,٠٠٠ نقطة إلى ١٠٠ ج.س"}
                  </button>
                  <p className="text-[9px] font-black uppercase opacity-40">الحد الأدنى للتحويل ١,٠٠٠ نقطة</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-[28px] bg-amber-50 border border-amber-100 flex gap-4">
              <div className="p-2 bg-amber-500 rounded-xl text-white shrink-0">
                <Info size={18} />
              </div>
              <p className="text-[10px] text-amber-800 font-bold leading-relaxed">تُمنح النقاط بناءً على مشاركتك في الحملات الميدانية، التبليغ عن الأعطال، وتأكد فريق العمل من جودة البلاغ.</p>
            </div>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <button 
              onClick={() => setStep('select')}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-4"
            >
              <ArrowRight size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">رجوع للخدمات</span>
            </button>

            <div className="space-y-6 bg-white p-8 bento-inner">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-1">رقم العداد / الحساب</label>
                <input 
                  type="text" 
                  value={meterNumber}
                  onChange={e => setMeterNumber(e.target.value)}
                  placeholder="0000 0000 0000"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-lg tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-1">المبلغ (ج.س)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-200"
                />
              </div>

              <button 
                onClick={() => setStep('confirm')}
                disabled={!meterNumber || !amount}
                className="w-full py-5 bg-emerald-600 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95"
              >
                المتابعة للدفع
              </button>
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div 
            key="confirm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 bento-inner space-y-8"
          >
            <div className="text-center">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">تفاصيل العملية</h5>
              <h4 className="text-lg font-black text-slate-900">{service === 'electricity' ? 'شراء كهرباء' : 'سداد مياه'}</h4>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between p-3 border-b border-dashed border-slate-100">
                <span className="text-xs font-bold text-slate-900 font-mono">{meterNumber}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase">جهة السداد</span>
              </div>
              <div className="flex justify-between p-3 border-b border-dashed border-slate-100">
                <span className="text-xs font-bold text-emerald-600 font-mono">{amount} ج.س</span>
                <span className="text-[10px] font-black text-slate-400 uppercase">المبلغ الإجمالي</span>
              </div>
            </div>

            <button 
              onClick={handlePay}
              disabled={loading}
              className="w-full py-5 bg-emerald-600 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  تأكيد الدفع الفوري
                </>
              )}
            </button>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white p-12 bento-inner space-y-6"
          >
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 size={48} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-2">تمت العملية بنجاح</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">تم إرسال رمز الكهرباء إلى رسائلك النصية وتحديث حالة الحساب.</p>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-2xl font-mono text-emerald-600 font-bold tracking-[0.3em]">
              8823 - 4421 - 9901 - 2234
            </div>

            <button 
              onClick={() => { setStep('select'); setMeterNumber(''); setAmount(''); }}
              className="px-8 py-4 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
            >
              العودة للرئيسية
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
