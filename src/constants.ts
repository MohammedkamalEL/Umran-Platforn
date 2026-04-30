import { Institution, GovernmentAlert, Region } from './types';

export interface InstitutionExtended extends Institution {
  accentColor?: string;
  logo?: string;
}

export const REGIONS: Region[] = [
  {
    id: 'khartoum',
    name: 'ولاية الخرطوم',
    enName: 'Khartoum',
    capital: 'الخرطوم',
    imageUrl: 'https://images.unsplash.com/photo-1544158428-f6825700a068?q=80&w=1000&auto=format&fit=crop',
    totalPoints: 12500,
    totalReports: 1450
  },
  {
    id: 'redsea',
    name: 'ولاية البحر الأحمر',
    enName: 'Red Sea',
    capital: 'بورتسودان',
    imageUrl: 'https://images.unsplash.com/photo-1510340263300-4b53278f244a?q=80&w=1000&auto=format&fit=crop',
    totalPoints: 8900,
    totalReports: 780
  },
  {
    id: 'kassala',
    name: 'ولاية كسلا',
    enName: 'Kassala',
    capital: 'كسلا',
    imageUrl: 'https://images.unsplash.com/photo-1590483736621-0916428f8f23?q=80&w=1000&auto=format&fit=crop',
    totalPoints: 6400,
    totalReports: 520
  },
  {
    id: 'kordofan',
    name: 'شمال كردفان',
    enName: 'North Kordofan',
    capital: 'الأبيض',
    imageUrl: 'https://images.unsplash.com/photo-1544158428-f6825700a068?q=80&w=1000&auto=format&fit=crop',
    totalPoints: 4200,
    totalReports: 340
  }
];

export const INSTITUTIONS: InstitutionExtended[] = [
  {
    id: 'roads',
    name: 'هيئة الطرق والجسور',
    fullName: 'هيئة الطرق والجسور ومصارف المياه - ولاية الخرطوم',
    website: 'https://khartoum.gov.sd/infrastructure',
    type: 'infrastructure',
    description: 'المؤسسة المسؤولة عن تخطيط وصيانة الطرق والجسور وأنظمة تصريف مياه الأمطار.',
    accentColor: '#10b981',
    logo: 'https://images.unsplash.com/photo-1590483736621-0916428f8f23?q=80&w=100&auto=format&fit=crop',
    regionsServed: ['khartoum', 'geezira', 'nile']
  },
  {
    id: 'water',
    name: 'هيئة مياه ولاية الخرطوم',
    fullName: 'هيئة مياه ولاية الخرطوم',
    website: 'https://khartoumwater.gov.sd',
    type: 'water',
    description: 'الجهة المسؤولة عن إنتاج وتوزيع مياه الشرب النقية وضمان استدامة المصادر المائية.',
    accentColor: '#3b82f6',
    logo: 'https://images.unsplash.com/photo-1544158428-f6825700a068?q=80&w=100&auto=format&fit=crop',
    regionsServed: ['khartoum']
  },
  {
    id: 'electricity',
    name: 'توزيع الكهرباء',
    fullName: 'الشركة السودانية لتوزيع الكهرباء المحدودة',
    website: 'https://sedc.com.sd',
    type: 'electricity',
    description: 'المسؤولة عن توصيل وحسابات وصيانة شبكات الكهرباء لجميع المشتركين.',
    accentColor: '#f59e0b',
    logo: 'https://images.unsplash.com/photo-1510340263300-4b53278f244a?q=80&w=100&auto=format&fit=crop',
    regionsServed: ['khartoum', 'redsea', 'kassala', 'kordofan']
  },
  {
    id: 'waste',
    name: 'حماية البيئة ونظافة المدينة',
    fullName: 'جهاز حماية البيئة والتنمية الحضرية - الخرطوم',
    website: 'https://khartoum.gov.sd/environment',
    type: 'environment',
    description: 'يعمل على إدارة النفايات والتنمية الحضرية المستدامة وحماية البيئة.',
    accentColor: '#059669',
    logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=100&auto=format&fit=crop',
    regionsServed: ['khartoum']
  },
  {
    id: 'sudatel',
    name: 'سوداتل',
    fullName: 'مجموعة سوداتل للاتصالات',
    website: 'https://sudatel.sd',
    type: 'partner',
    description: 'شريك استراتيجي في التحول الرقمي ودعم مشاريع البنية التحتية الذكية.',
    accentColor: '#1d4ed8',
    logo: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=100&auto=format&fit=crop',
    regionsServed: ['all']
  },
  {
    id: 'dal',
    name: 'مجموعة دال',
    fullName: 'مجموعة دال الغذائية والهندسية',
    website: 'https://dalgroup.com',
    type: 'partner',
    description: 'ريادة في دعم المبادرات المجتمعية ومشاريع التنمية المستدامة في السودان.',
    accentColor: '#b91c1c',
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=100&auto=format&fit=crop',
    regionsServed: ['khartoum', 'geezira', 'redsea']
  },
  {
    id: 'bank-of-khartoum',
    name: 'بنك الخرطوم',
    fullName: 'بنك الخرطوم - الريادة مستمرة',
    website: 'https://bankofkhartoum.com',
    type: 'partner',
    description: 'الممول الرئيسي للعديد من مبادرات الخدمة المجتمعية عبر خدمة بنكك.',
    accentColor: '#1e3a8a',
    logo: 'https://images.unsplash.com/photo-1591033594798-33227a05780d?q=80&w=100&auto=format&fit=crop',
    regionsServed: ['all']
  }
];

export const MOCK_ALERTS: GovernmentAlert[] = [
  {
    id: 'a1',
    institutionId: 'met',
    institutionName: 'هيئة الأرصاد الجوية',
    title: 'تحذير من أمطار غزيرة',
    message: 'من المتوقع هطول أمطار غزيرة في ولايات الخرطوم والجزيرة خلال الـ 24 ساعة القادمة. يرجى أخذ الحيطة.',
    type: 'weather',
    severity: 'high',
    timestamp: Date.now() - 3600000
  },
  {
    id: 'a2',
    institutionId: 'roads',
    institutionName: 'هيئة الطرق والجسور',
    title: 'إغلاق جسر النيل الأزرق',
    message: 'سيتم إغلاق جسر النيل الأزرق لإجراء أعمال صيانة طارئة ابتداءً من منتصف الليل.',
    type: 'infrastructure',
    severity: 'medium',
    timestamp: Date.now() - 7200000
  }
];

export interface CivicAlert {
  id: string;
  institutionId: string;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'info';
  timestamp: string;
}

export const CIVIC_ALERTS: CivicAlert[] = [
  {
    id: 'alert-1',
    institutionId: 'water',
    title: 'تنويه عاجل لمواطني بحري',
    message: 'سوف يتم قطع إمداد المياه للصيانة الدورية في محطة مياه بحري لمدة ٤ ساعات ابتداءً من منتصف الليل.',
    severity: 'high',
    timestamp: 'قبل ساعة واحدة'
  },
  {
    id: 'alert-2',
    institutionId: 'electricity',
    title: 'تحذير من رياح قوية',
    message: 'نرجو توخي الحذر من أعمدة الكهرباء في منطقة أم درمان نتيجة للرياح المثيرة للأتربة المتوقعة اليوم.',
    severity: 'medium',
    timestamp: 'قبل ساعتين'
  }
];
