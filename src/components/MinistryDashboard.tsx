import { useState, useMemo } from "react";
import {
  Droplets, Zap, Construction, Trash2,
  AlertTriangle, Clock, CheckCircle2, ChevronDown,
  MapPin, Calendar, TrendingUp, Filter, Search,
  ArrowUpRight, MoreHorizontal, Bell, User,
  BarChart3, CircleDot, RefreshCw, Menu, X
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type IssueType = "water" | "electricity" | "road" | "waste";
type IssueStatus = "pending" | "in_progress" | "completed";
type Severity = 1 | 2 | 3;

interface Issue {
  id: string;
  type: IssueType;
  title: string;
  description: string;
  location: string;
  status: IssueStatus;
  severity: Severity;
  reportsCount: number;
  createdAt: string;
  assignedTo?: string;
}

type MinistryKey = "water" | "electricity" | "roads" | "waste";

// ─── Ministry Config ──────────────────────────────────────────────────────────

const MINISTRIES: Record<MinistryKey, {
  label: string;
  labelEn: string;
  issueType: IssueType;
  Icon: React.FC<{ size?: number; className?: string }>;
  accent: string;
  accentLight: string;
  accentDark: string;
  gradient: string;
}> = {
  water: {
    label: "هيئة مياه ولاية الخرطوم",
    labelEn: "Ministry of Water",
    issueType: "water",
    Icon: Droplets,
    accent: "#0ea5e9",
    accentLight: "#e0f2fe",
    accentDark: "#0369a1",
    gradient: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 60%, #38bdf8 100%)",
  },
  electricity: {
    label: "شركة الكهرباء",
    labelEn: "Ministry of Electricity",
    issueType: "electricity",
    Icon: Zap,
    accent: "#f59e0b",
    accentLight: "#fef3c7",
    accentDark: "#b45309",
    gradient: "linear-gradient(135deg, #92400e 0%, #f59e0b 60%, #fcd34d 100%)",
  },
  roads: {
    label: "وزارة الطرق والجسور",
    labelEn: "Ministry of Roads",
    issueType: "road",
    Icon: Construction,
    accent: "#6b7280",
    accentLight: "#f3f4f6",
    accentDark: "#374151",
    gradient: "linear-gradient(135deg, #1f2937 0%, #6b7280 60%, #9ca3af 100%)",
  },
  waste: {
    label: "إدارة النفايات",
    labelEn: "Waste Management",
    issueType: "waste",
    Icon: Trash2,
    accent: "#10b981",
    accentLight: "#d1fae5",
    accentDark: "#065f46",
    gradient: "linear-gradient(135deg, #064e3b 0%, #10b981 60%, #34d399 100%)",
  },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ISSUES: Issue[] = [
  { id: "1", type: "water", title: "انقطاع المياه في حي العمارات", description: "انقطعت المياه عن الحي منذ 3 أيام", location: "حي العمارات، الخرطوم", status: "pending", severity: 3, reportsCount: 47, createdAt: "2026-05-07", assignedTo: undefined },
  { id: "2", type: "water", title: "تسرب في خط الأنابيب الرئيسي", description: "تسرب مياه واضح في شارع المك نمر", location: "شارع المك نمر، أم درمان", status: "in_progress", severity: 3, reportsCount: 23, createdAt: "2026-05-06", assignedTo: "فريق الصيانة أ" },
  { id: "3", type: "water", title: "ضعف ضغط المياه", description: "ضغط المياه منخفض جداً في الطوابق العليا", location: "عمارات السلام، بحري", status: "pending", severity: 2, reportsCount: 31, createdAt: "2026-05-05" },
  { id: "4", type: "water", title: "تلوث مياه الشرب", description: "تغير لون ورائحة المياه في المنطقة", location: "حي الرياض، الخرطوم", status: "in_progress", severity: 3, reportsCount: 89, createdAt: "2026-05-04", assignedTo: "فريق الجودة" },
  { id: "5", type: "water", title: "عطل في محطة الضخ", description: "توقفت محطة الضخ عن العمل", location: "محطة الضخ المركزية", status: "completed", severity: 3, reportsCount: 112, createdAt: "2026-05-03", assignedTo: "الفريق الهندسي" },
  { id: "6", type: "water", title: "بالوعة مكسورة تُلوث المياه", description: "بالوعة مجاري مكسورة قرب خط المياه", location: "شارع الجامعة، الخرطوم", status: "pending", severity: 2, reportsCount: 18, createdAt: "2026-05-08" },
  { id: "7", type: "water", title: "مواسير صدئة في المدرسة", description: "المواسير القديمة تؤثر على جودة المياه", location: "مدرسة الفيصل، أم درمان", status: "completed", severity: 1, reportsCount: 12, createdAt: "2026-05-01" },
  { id: "8", type: "electricity", title: "انقطاع كهرباء متكرر", description: "الكهرباء تنقطع كل ساعة في المنطقة", location: "حي الموردة، الخرطوم", status: "pending", severity: 3, reportsCount: 67, createdAt: "2026-05-07" },
  { id: "9", type: "road", title: "حفرة كبيرة في الطريق السريع", description: "حفرة خطيرة تسببت في حوادث", location: "الطريق السريع الغربي", status: "in_progress", severity: 3, reportsCount: 54, createdAt: "2026-05-06" },
  { id: "10", type: "waste", title: "تراكم النفايات في السوق", description: "لم تُجمع النفايات منذ أسبوع", location: "سوق أم درمان المركزي", status: "pending", severity: 2, reportsCount: 41, createdAt: "2026-05-05" },
];

const WEEKLY_DATA = [
  { day: "السبت", count: 8 },
  { day: "الأحد", count: 14 },
  { day: "الاثنين", count: 11 },
  { day: "الثلاثاء", count: 19 },
  { day: "الأربعاء", count: 7 },
  { day: "الخميس", count: 23 },
  { day: "الجمعة", count: 5 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: IssueStatus }) => {
  const config = {
    pending:     { label: "جديد",         bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
    in_progress: { label: "قيد المعالجة", bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
    completed:   { label: "مكتمل",        bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
  };
  const c = config[status];
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.dot}33` }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">
      <span style={{ background: c.dot }} className="w-1.5 h-1.5 rounded-full" />
      {c.label}
    </span>
  );
};

const SeverityDots = ({ severity }: { severity: Severity }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3].map(i => (
      <span key={i} style={{ background: i <= severity ? (severity === 3 ? "#ef4444" : severity === 2 ? "#f59e0b" : "#22c55e") : "#e5e7eb" }}
        className="w-2.5 h-2.5 rounded-full" />
    ))}
  </span>
);

const StatCard = ({
  label, value, sub, Icon, accent, accentLight
}: {
  label: string; value: number | string; sub?: string;
  Icon: React.FC<{ size?: number }>; accent: string; accentLight: string;
}) => (
  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <span style={{ background: accentLight }} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
        <Icon size={18} />
      </span>
      <span className="text-xs text-gray-400 flex items-center gap-1 hidden sm:flex">
        <ArrowUpRight size={12} />
        هذا الأسبوع
      </span>
    </div>
    <div style={{ color: accent }} className="text-2xl sm:text-3xl font-black mb-1">{value}</div>
    <div className="text-xs sm:text-sm font-semibold text-gray-700 leading-tight">{label}</div>
    {sub && <div className="text-xs text-gray-400 mt-0.5 hidden sm:block">{sub}</div>}
  </div>
);

// ─── Mobile Issue Card ────────────────────────────────────────────────────────

const MobileIssueCard = ({
  issue, ministry, onStatusChange
}: {
  issue: Issue;
  ministry: typeof MINISTRIES[MinistryKey];
  onStatusChange: (issue: Issue, status: IssueStatus) => void;
}) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
    <div className="flex items-start justify-between gap-2 mb-2">
      <div className="font-bold text-sm text-gray-900 leading-tight flex-1">{issue.title}</div>
      <StatusBadge status={issue.status} />
    </div>
    <div className="text-xs text-gray-400 mb-3 leading-relaxed">{issue.description}</div>
    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
      <span className="flex items-center gap-1">
        <MapPin size={10} style={{ color: ministry.accent }} />
        <span className="truncate max-w-[160px]">{issue.location}</span>
      </span>
      <span className="flex items-center gap-1">
        <Calendar size={10} />
        {issue.createdAt}
      </span>
      <span className="font-black text-gray-700">{issue.reportsCount} <span className="font-normal text-gray-400">بلاغ</span></span>
    </div>
    <div className="flex items-center justify-between">
      <SeverityDots severity={issue.severity} />
      <div className="flex items-center gap-2">
        {issue.assignedTo && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium">{issue.assignedTo}</span>
        )}
        {issue.status === "pending" && (
          <button
            onClick={() => onStatusChange(issue, "in_progress")}
            style={{ background: ministry.accentLight, color: ministry.accentDark }}
            className="text-[10px] font-black px-2 py-1 rounded-lg whitespace-nowrap">
            ابدأ المعالجة
          </button>
        )}
        {issue.status === "in_progress" && (
          <button
            onClick={() => onStatusChange(issue, "completed")}
            className="text-[10px] font-black px-2 py-1 rounded-lg bg-green-50 text-green-700 whitespace-nowrap">
            أكمل
          </button>
        )}
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MinistryDashboard() {
  const [activeMinistry, setActiveMinistry] = useState<MinistryKey>("water");
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ministry = MINISTRIES[activeMinistry];
  const MIcon = ministry.Icon;

  const filteredIssues = useMemo(() => {
    return MOCK_ISSUES.filter(issue => {
      if (issue.type !== ministry.issueType) return false;
      if (statusFilter !== "all" && issue.status !== statusFilter) return false;
      if (severityFilter !== "all" && issue.severity !== severityFilter) return false;
      if (searchQuery && !issue.title.includes(searchQuery) && !issue.location.includes(searchQuery)) return false;
      return true;
    });
  }, [activeMinistry, statusFilter, severityFilter, searchQuery, ministry.issueType]);

  const allForMinistry = MOCK_ISSUES.filter(i => i.type === ministry.issueType);
  const stats = {
    total:      allForMinistry.length,
    pending:    allForMinistry.filter(i => i.status === "pending").length,
    inProgress: allForMinistry.filter(i => i.status === "in_progress").length,
    completed:  allForMinistry.filter(i => i.status === "completed").length,
  };

  const handleStatusChange = (issue: Issue, newStatus: IssueStatus) => {
    console.log(`Update issue ${issue.id} to ${newStatus}`);
    setSelectedIssue(null);
  };

  const handleMinistryChange = (key: MinistryKey) => {
    setActiveMinistry(key);
    setStatusFilter("all");
    setSearchQuery("");
    setSidebarOpen(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f9fb] font-sans">

      {/* ── Top Nav ── */}
      <header
        ref={(el) => {
          if (el) {
            document.documentElement.style.setProperty("--header-h", el.offsetHeight + "px");
          }
        }}
        className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 "
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile menu button */}
          <button
            className="lg:hidden w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          {/* Logo */}
          <div style={{ background: ministry.gradient }} className="w-8 h-8 rounded-lg flex items-center justify-center shadow shrink-0">
            <MIcon size={16} className="text-white" />
          </div>
          <span className="font-black text-gray-900 text-lg tracking-tight">عمران</span>
          <span className="text-gray-300 text-lg hidden sm:block">/</span>
          <span className="text-gray-500 text-sm hidden sm:block truncate max-w-[140px]">{ministry.label}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="relative w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
            <Bell size={16} />
            <span style={{ background: ministry.accent }} className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white" />
          </button>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-2 sm:px-3 py-2 border border-gray-100">
            <div style={{ background: ministry.gradient }} className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
              <User size={13} className="text-white" />
            </div>
            <div className="text-xs hidden sm:block">
              <div className="font-bold text-gray-800">م. محمد كمال</div>
              <div className="text-gray-400 truncate max-w-[100px]">{ministry.label}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">

        {/* ── Sidebar Overlay (mobile) — starts BELOW header ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-x-0 bottom-0 bg-black/30 z-20 lg:hidden"
            style={{ top: "var(--header-h, 57px)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar: Ministry Switcher ── */}
        <aside className={`
          fixed lg:sticky z-20 lg:z-auto
          w-64 bg-white border-l border-gray-100
          flex flex-col overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
          style={{
            top: "var(--header-h, 57px)",
            height: "calc(100vh - var(--header-h, 57px))",
            right: 0,
          }}
        >
          <div className="p-4 border-b border-gray-50">
            <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3">الوزارات والجهات</p>
            <div className="space-y-1">
              {(Object.entries(MINISTRIES) as [MinistryKey, typeof MINISTRIES[MinistryKey]][]).map(([key, m]) => {
                const Icon = m.Icon;
                const count = MOCK_ISSUES.filter(i => i.type === m.issueType && i.status === "pending").length;
                const isActive = activeMinistry === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleMinistryChange(key)}
                    style={isActive ? { background: m.accentLight, borderColor: m.accent + "44", color: m.accentDark } : {}}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-right border ${
                      isActive ? "border" : "border-transparent hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span style={{ background: isActive ? m.accent : "#f3f4f6" }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0">
                        <Icon size={14} className={isActive ? "text-white" : "text-gray-500"} />
                      </span>
                      <div className="text-right min-w-0">
                        <div className="text-xs font-bold leading-tight truncate">{m.label}</div>
                        <div className={`text-[10px] ${isActive ? "opacity-70" : "text-gray-400"}`}>{m.labelEn}</div>
                      </div>
                    </div>
                    {count > 0 && (
                      <span style={{ background: isActive ? m.accent : "#ef4444" }}
                        className="text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shrink-0 mr-1">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Filters in sidebar */}
          <div className="p-4 flex-1">
            <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3">تصفية سريعة</p>
            <div className="space-y-1">
              {([
                ["all", "جميع البلاغات", allForMinistry.length],
                ["pending", "بلاغات جديدة", stats.pending],
                ["in_progress", "قيد المعالجة", stats.inProgress],
                ["completed", "مكتملة", stats.completed],
              ] as const).map(([val, lbl, cnt]) => (
                <button key={val} onClick={() => setStatusFilter(val)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                    statusFilter === val ? "bg-gray-900 text-white font-bold" : "text-gray-600 hover:bg-gray-50"
                  }`}>
                  <span>{lbl}</span>
                  <span className={`font-black ${statusFilter === val ? "text-white" : "text-gray-400"}`}>{cnt}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-x-hidden min-w-0">

          {/* Hero Header */}
          <div style={{ background: ministry.gradient }} className="rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-white shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
            <div className="relative flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <MIcon size={20} className="text-white/80 shrink-0" />
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">{ministry.label}</h1>
                </div>
                <p className="text-white/70 text-xs sm:text-sm">لوحة إدارة ومتابعة بلاغات البنية التحتية</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1">
                    <CircleDot size={10} className="animate-pulse" />
                    مباشر
                  </span>
                  <span className="text-white/60 text-xs">{stats.pending} بلاغ يحتاج متابعة</span>
                </div>
              </div>
              <div className="text-left opacity-80 shrink-0">
                <div className="text-4xl sm:text-5xl font-black">{stats.total}</div>
                <div className="text-xs sm:text-sm text-white/70">إجمالي البلاغات</div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <StatCard label="بلاغات جديدة" value={stats.pending} sub="تحتاج متابعة فورية"
              Icon={AlertTriangle} accent="#ef4444" accentLight="#fef2f2" />
            <StatCard label="قيد المعالجة" value={stats.inProgress} sub="جارٍ العمل عليها"
              Icon={RefreshCw} accent={ministry.accent} accentLight={ministry.accentLight} />
            <StatCard label="مكتملة" value={stats.completed} sub="هذا الأسبوع"
              Icon={CheckCircle2} accent="#16a34a" accentLight="#f0fdf4" />
            <StatCard label="معدل الإنجاز" value={`${Math.round(stats.completed / Math.max(stats.total, 1) * 100)}%`}
              sub="نسبة الحل" Icon={TrendingUp} accent={ministry.accentDark} accentLight={ministry.accentLight} />
          </div>

          {/* Chart + Top Issues */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Weekly Bar Chart */}
            <div className="md:col-span-2 bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-gray-800 text-sm">البلاغات الأسبوعية</h3>
                  <p className="text-xs text-gray-400">آخر 7 أيام</p>
                </div>
                <BarChart3 size={16} className="text-gray-300" />
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={WEEKLY_DATA} barSize={28}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af", fontFamily: "inherit" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: "none", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                    cursor={{ fill: "#f3f4f6" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {WEEKLY_DATA.map((_, i) => (
                      <Cell key={i} fill={i === 5 ? ministry.accent : ministry.accentLight} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Priority Issues */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-800 text-sm">الأولوية القصوى</h3>
                <AlertTriangle size={14} className="text-red-400" />
              </div>
              <div className="space-y-3">
                {allForMinistry
                  .filter(i => i.severity === 3 && i.status !== "completed")
                  .slice(0, 3)
                  .map(issue => (
                    <div key={issue.id} className="flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-100">
                      <AlertTriangle size={12} className="text-red-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-800 leading-tight truncate">{issue.title}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin size={8} />
                          {issue.location.split("،")[0]}
                        </div>
                        <div className="text-[10px] text-red-500 font-bold mt-1">{issue.reportsCount} بلاغ</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Issues Table / Cards */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-3 sm:p-4 border-b border-gray-50">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="بحث في البلاغات..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full text-sm pr-9 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-right"
                    style={{ "--tw-ring-color": ministry.accent + "33" } as React.CSSProperties}
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Severity Filter */}
                  <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200 overflow-x-auto">
                    <Filter size={12} className="text-gray-400 mr-1 shrink-0" />
                    {([["all", "الكل"], [3, "حرجة"], [2, "متوسطة"], [1, "منخفضة"]] as const).map(([v, l]) => (
                      <button key={v}
                        onClick={() => setSeverityFilter(v as typeof severityFilter)}
                        style={severityFilter === v ? { background: ministry.accent, color: "white" } : {}}
                        className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                          severityFilter === v ? "" : "text-gray-500 hover:bg-white"
                        }`}>{l}</button>
                    ))}
                  </div>

                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{filteredIssues.length} بلاغ</span>
                </div>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    {["البلاغ", "الموقع", "الخطورة", "البلاغات", "التاريخ", "المسؤول", "الحالة", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-right text-[10px] font-black text-gray-400 tracking-widest uppercase whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="text-gray-300 text-4xl mb-2">📋</div>
                        <div className="text-sm text-gray-400">لا توجد بلاغات تطابق الفلتر</div>
                      </td>
                    </tr>
                  ) : filteredIssues.map(issue => (
                    <tr key={issue.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-3 max-w-[220px]">
                        <div className="font-bold text-sm text-gray-900 leading-tight truncate">{issue.title}</div>
                        <div className="text-xs text-gray-400 truncate mt-0.5">{issue.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                          <MapPin size={11} style={{ color: ministry.accent }} />
                          <span className="max-w-[140px] truncate">{issue.location}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <SeverityDots severity={issue.severity} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-black text-gray-700">{issue.reportsCount}</span>
                        <span className="text-xs text-gray-400 mr-1">بلاغ</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                          <Calendar size={11} />
                          {issue.createdAt}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {issue.assignedTo ? (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium whitespace-nowrap">
                            {issue.assignedTo}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">غير محدد</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={issue.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {issue.status === "pending" && (
                            <button
                              onClick={() => handleStatusChange(issue, "in_progress")}
                              style={{ background: ministry.accentLight, color: ministry.accentDark }}
                              className="text-[10px] font-black px-2 py-1 rounded-lg whitespace-nowrap hover:opacity-80 transition-opacity">
                              ابدأ المعالجة
                            </button>
                          )}
                          {issue.status === "in_progress" && (
                            <button
                              onClick={() => handleStatusChange(issue, "completed")}
                              className="text-[10px] font-black px-2 py-1 rounded-lg bg-green-50 text-green-700 whitespace-nowrap hover:opacity-80 transition-opacity">
                              أكمل
                            </button>
                          )}
                          <button className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
                            <MoreHorizontal size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-3 space-y-3">
              {filteredIssues.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-gray-300 text-4xl mb-2">📋</div>
                  <div className="text-sm text-gray-400">لا توجد بلاغات تطابق الفلتر</div>
                </div>
              ) : filteredIssues.map(issue => (
                <MobileIssueCard
                  key={issue.id}
                  issue={issue}
                  ministry={ministry}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>

            {/* Table Footer */}
            <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-gray-400">عرض {filteredIssues.length} من {stats.total} بلاغ</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map(p => (
                  <button key={p} style={p === 1 ? { background: ministry.accent, color: "white" } : {}}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${p === 1 ? "" : "text-gray-400 hover:bg-gray-100"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* ── Floating Status Legend ── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 flex items-center gap-3 text-xs z-20">
        {[
          { color: "#ef4444", label: "حرجة" },
          { color: "#f59e0b", label: "متوسطة" },
          { color: "#22c55e", label: "منخفضة" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span style={{ background: s.color }} className="w-2.5 h-2.5 rounded-full" />
            <span className="text-gray-500 font-medium">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
