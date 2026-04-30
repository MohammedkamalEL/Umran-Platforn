import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Info, Bell, Shield, Wind, CloudRain, Zap, CheckCheck } from 'lucide-react';
import { cn, formatTimeAgo } from '../lib/utils';
import { useNotifications } from '../contexts/NotificationContext';

const ALERT_ICONS: Record<string, any> = {
  weather: CloudRain,
  infrastructure: Zap,
  security: Shield,
  health: Bell,
  campaigns: Bell
};

export default function AlertsList() {
  const { alerts, markAllAsRead, unreadCount } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black text-white text-xl font-display tracking-tight italic">تنبيهات الجهات الرسمية</h3>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="px-4 py-2 bg-white/5 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-white/10 shadow-xl"
            >
              <CheckCheck size={14} />
              قراءة الكل
            </button>
          )}
          <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-rose-500/20 flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.2)]">
             <AlertTriangle size={14} />
             STREAMING
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert, index) => {
          const Icon = ALERT_ICONS[alert.type] || Info;
          const isHigh = alert.severity === 'high' || alert.severity === 'critical';
          
          return (
            <motion.div
              key={alert.id}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-6 rounded-[2rem] border transition-all relative overflow-hidden shadow-2xl backdrop-blur-3xl group",
                isHigh 
                  ? "bg-rose-500/5 border-rose-500/20" 
                  : "bg-white/5 border-white/10",
                !alert.read && "ring-1 ring-emerald-500/50"
              )}
            >
              {!alert.read && (
                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-pulse" />
              )}
              
              <div className="absolute inset-0 sudan-pattern-modern opacity-[0.02] pointer-events-none" />
              
              <div className="flex items-start gap-6 relative z-10">
                <div className={cn(
                  "p-4 rounded-2xl shrink-0 shadow-2xl transition-transform duration-500 group-hover:scale-110",
                  isHigh ? "bg-rose-500 text-white shadow-rose-500/20" : "bg-emerald-600 text-white shadow-emerald-500/20"
                )}>
                  <Icon size={24} />
                </div>
                
                <div className="flex-1 text-right">
                   <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-black text-slate-500 font-mono tracking-widest uppercase">
                      {new Date(alert.timestamp).toLocaleTimeString('ar-SD', { hour: '2-digit', minute: '2-digit' })} // SDN_TIME
                    </span>
                    <h5 className={cn(
                      "text-[10px] font-black uppercase tracking-[0.4em] font-mono",
                      isHigh ? "text-rose-400" : "text-emerald-400"
                    )}>
                      PRESS_OFFICE // SUDAN_CORE
                    </h5>
                  </div>
                  <h4 className="text-xl font-black text-white mb-3 font-display italic tracking-tight leading-tight">{alert.title}</h4>
                  <p className="text-base text-slate-400 leading-relaxed font-sans italic opacity-80">{alert.message}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
        {alerts.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-white/10 border-dashed text-slate-500 text-xs font-black uppercase tracking-[0.4em] italic">NODES_SILENT // NO_ACTIVE_ALERTS</div>
        )}
      </div>
    </div>
  );
}
