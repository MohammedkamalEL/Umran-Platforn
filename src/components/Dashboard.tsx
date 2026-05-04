// import React, { useState, useEffect, useRef } from 'react';
// import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
// import { MarkerClusterer } from "@googlemaps/markerclusterer";
// import { 
//   Search, 
//   MapPin, 
//   Filter, 
//   TrendingUp,
//   MoreVertical, 
//   ThumbsUp, 
//   MessageSquare, 
//   Share2,
//   Activity,
//   Loader2,
//   AlertTriangle,
//   WifiOff,
//   X,
//   Bell,
//   Wallet,
//   Grid,
//   Trophy,
//   Truck,
//   Droplets,
//   Zap,
//   Trash2,
//   History,
//   Map as MapIcon,
//   ShieldCheck,
//   Check,
//   Building,
//   HelpCircle,
//   ArrowUpRight,
//   Phone,
//   SignalHigh,
//   Star,
//   CheckCircle2,
//   Globe,
//   Hash,
//   Command,
//   ArrowRight,
//   ChevronRight
// } from 'lucide-react';
// import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs, getDoc, doc, where } from 'firebase/firestore';
// import { db } from '../lib/firebase';
// import { cn, formatTimeAgo } from '../lib/utils';
// import { Issue } from '../types';
// import { INSTITUTIONS, InstitutionExtended } from '../constants';
// import IssueDetail from './IssueDetail';
// import InstitutionDetail from './InstitutionDetail';
// import AlertsList from './Alerts';
// import UtilityPayments from './Payments';
// import RegionalCompetition from './RegionalCompetition';
// import HackathonPitch from './HackathonPitch';
// import OfflineReporting from './OfflineReporting';
// import PlatformProfile from './PlatformProfile';
// import { motion, AnimatePresence } from 'motion/react';
// import { generatePitchDeck } from '../lib/pitchdeck';
// import { Download } from 'lucide-react';
// import { MapContainer, TileLayer, Marker as LeafletMarker, Popup } from 'react-leaflet';
// import MarkerClusterGroup from 'react-leaflet-cluster';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { section } from 'motion/react-m';

// // Fix Leaflet marker icons
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// type DashboardTab = 'activity' | 'alerts' | 'payments' | 'compete' | 'archive' | 'workstation';

// export default function Dashboard({ role = 'citizen', profile }: { role?: 'citizen' | 'official' | 'partner'; profile?: any }) {
//   const [issues, setIssues] = useState<Issue[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const listContainerRef = React.useRef<HTMLDivElement>(null);
//   const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
//   const [activeMarkerIssue, setActiveMarkerIssue] = useState<Issue | null>(null);
//   const [activeTab, setActiveTab] = useState<DashboardTab>(role === 'official' ? 'activity' : 'activity'); // For now keep activity default
//   const [selectedInstitutionFilter, setSelectedInstitutionFilter] = useState<string>(role === 'official' ? 'unassigned' : 'all');
//   const [viewingInstitution, setViewingInstitution] = useState<InstitutionExtended | null>(null);
//   const [showFilters, setShowFilters] = useState(false);
//   const [showPitch, setShowPitch] = useState(false);
//   const [showPlatformProfile, setShowPlatformProfile] = useState(false);
//   const [showOfflineMode, setShowOfflineMode] = useState(false);
//   const [lastNotification, setLastNotification] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
//   const [citizenOnly, setCitizenOnly] = useState(false);
//   const [showSystemNotice, setShowSystemNotice] = useState(() => {
//     // Check if dismissed in this session/device
//     const dismissed = localStorage.getItem('system_notice_dismissed');
//     return !dismissed;
//   });
//   const [systemNotice, setSystemNotice] = useState<string>("إشعار هام: بدأت أعمال الصيانة الكبرى في محطة مياه المقرن. قد يتأثر الإمداد في وسط الخرطوم.");
//   const [govAlerts, setGovAlerts] = useState<any[]>([]);
//   const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(() => {
//     const saved = localStorage.getItem('dismissed_gov_alerts');
//     return saved ? JSON.parse(saved) : [];
//   });

//   const dismissGovAlert = (id: string) => {
//     setDismissedAlertIds(prev => {
//       const next = [...prev, id];
//       localStorage.setItem('dismissed_gov_alerts', JSON.stringify(next));
//       return next;
//     });
//   };

//   useEffect(() => {
//     const q = query(
//       collection(db, 'alerts'),
//       where('active', '==', true),
//       orderBy('createdAt', 'desc')
//     );

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const fetched = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       setGovAlerts(fetched);
//     }, (err) => {
//       console.warn("Alerts listener error (possibly missing index):", err);
//       // Fallback for missing index: fetch without where and filter in memory if needed
//       // But for now we just handle the error
//     });

//     return () => unsubscribe();
//   }, []);

//   const activeVisibleAlert = govAlerts.find(a => !dismissedAlertIds.includes(a.id));

//   const dismissNotice = () => {
//     setShowSystemNotice(false);
//     localStorage.setItem('system_notice_dismissed', 'true');
//   };

//   useEffect(() => {
//     const notifications = [
//       "تم رصد بلاغ جديد في حي الرياض",
//       "اكتمال مشروع ترميم مدرسة في بحري",
//       "سفير عمراني جديد انضم للوحة الشرف",
//       "تحديث SLA لقسم صيانة الكهرباء",
//       "بدء حملة تشجير كبرى في بورتسودان"
//     ];

//     const interval = setInterval(() => {
//       if (Math.random() > 0.7) {
//         setLastNotification(notifications[Math.floor(Math.random() * notifications.length)]);
//         setTimeout(() => setLastNotification(null), 5000);
//       }
//     }, 15000);

//     return () => clearInterval(interval);
//   }, []);
//   const [isMapLoaded, setIsMapLoaded] = useState(false);
//   const [mapError, setMapError] = useState<string | null>(null);
  
//   const mapRef = useRef<HTMLDivElement>(null);
//   const googleMapRef = useRef<google.maps.Map | null>(null);
//   const markersRef = useRef<google.maps.Marker[]>([]);
//   const clustererRef = useRef<MarkerClusterer | null>(null);

//   const filteredIssues = issues.filter(issue => {
//     // Basic type/institution filtering
//     if (selectedInstitutionFilter !== 'all') {
//       if (selectedInstitutionFilter === 'unassigned') {
//         if (issue.assignedInstitution) return false;
//       } else if (issue.assignedInstitution !== selectedInstitutionFilter) {
//         return false;
//       }
//     }

//     // Citizen only filter
//     if (citizenOnly && !issue.reportedByCitizen) return false;

//     // Search query filter
//     if (searchQuery) {
//       const q = searchQuery.toLowerCase();
//       const inId = issue.trackingId?.toLowerCase().includes(q);
//       const inDesc = issue.description?.toLowerCase().includes(q);
//       const inType = issue.type?.toLowerCase().includes(q);
//       if (!inId && !inDesc && !inType) return false;
//     }

//     return true;
//   }).sort((a, b) => {
//     if (sortBy === 'date') {
//       const timeA = typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt as any)?.seconds * 1000 || 0;
//       const timeB = typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt as any)?.seconds * 1000 || 0;
//       return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
//     } else {
//       // Sort by status - custom order
//       const statusOrder = { 'pending': 0, 'verified': 1, 'in-progress': 2, 'completed': 3, 'resolved': 4 };
//       const valA = statusOrder[a.status as keyof typeof statusOrder] || 0;
//       const valB = statusOrder[b.status as keyof typeof statusOrder] || 0;
//       return sortOrder === 'desc' ? valB - valA : valA - valB;
//     }
//   });

//   const getIssueIcon = (type: string, size = 20) => {
//     switch(type) {
//       case 'road': return <Truck size={size} />;
//       case 'water': return <Droplets size={size} />;
//       case 'electricity': return <Zap size={size} />;
//       case 'waste': return <Trash2 size={size} />;
//       case 'other': return <HelpCircle size={size} />;
//       default: return <Activity size={size} />;
//     }
//   };

//   const handleMarkerClick = (issue: Issue) => {
//     if (googleMapRef.current) {
//       googleMapRef.current.setZoom(16);
//       googleMapRef.current.panTo({ lat: issue.location.lat, lng: issue.location.lng });
//     }
//     setActiveMarkerIssue(issue);
//   };

//   const resetMap = () => {
//     if (googleMapRef.current) {
//       googleMapRef.current.setZoom(12);
//       googleMapRef.current.setCenter({ lat: 15.5, lng: 32.55 });
//     }
//     setActiveMarkerIssue(null);
//   };

//   useEffect(() => {
//     // Add global handler for Google Maps Auth Failure
//     (window as any).gm_authFailure = () => {
//       console.error("Google Maps authentication failed (gm_authFailure)");
//       setMapError('ApiProjectMapError');
//     };

//     const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
//     const isInvalidKey = !apiKey || apiKey === 'YOUR_KEY_HERE' || apiKey.trim() === '';

//     if (isInvalidKey) {
//       console.warn("Google Maps API Key is missing or default. Using Leaflet fallback.");
//       setMapError('missing_key');
//       return;
//     }

//     setOptions({
//       apiKey: apiKey,
//       version: 'weekly',
//       libraries: ['maps', 'marker']
//     } as any);

//     let mapInitTimeout: any;

//     const initMap = async () => {
//       // Set a safety timeout for map initialization
//       mapInitTimeout = setTimeout(() => {
//         if (!isMapLoaded && !mapError) {
//           console.warn("Google Maps initialization timed out. Using fallback.");
//           setMapError('timeout');
//         }
//       }, 10000);

//       // Handle global Google Maps auth failure
//       (window as any).gm_authFailure = () => {
//         console.error("Google Maps Authentication Failed (gm_authFailure)");
//         setMapError('ApiProjectMapError');
//         clearTimeout(mapInitTimeout);
//       };

//       try {
//         const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;
//         await importLibrary('marker');

//         if (mapRef.current) {
//           const map = new Map(mapRef.current, {
//             center: { lat: 15.5007, lng: 32.5599 },
//             zoom: 12,
//             disableDefaultUI: true,
//             styles: [
//             {
//               "featureType": "all",
//               "elementType": "geometry.fill",
//               "stylers": [{ "weight": "2.00" }]
//             },
//             {
//               "featureType": "all",
//               "elementType": "geometry.stroke",
//               "stylers": [{ "color": "#9c9c9c" }]
//             },
//             {
//               "featureType": "all",
//               "elementType": "labels.text",
//               "stylers": [{ "visibility": "on" }]
//             },
//             {
//               "featureType": "landscape",
//               "elementType": "all",
//               "stylers": [{ "color": "#f2f2f2" }]
//             },
//             {
//               "featureType": "landscape",
//               "elementType": "geometry.fill",
//               "stylers": [{ "color": "#ffffff" }]
//             },
//             {
//               "featureType": "landscape.man_made",
//               "elementType": "geometry.fill",
//               "stylers": [{ "color": "#ffffff" }]
//             },
//             {
//               "featureType": "poi",
//               "elementType": "all",
//               "stylers": [{ "visibility": "off" }]
//             },
//             {
//               "featureType": "road",
//               "elementType": "all",
//               "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
//             },
//             {
//               "featureType": "road",
//               "elementType": "geometry.fill",
//               "stylers": [{ "color": "#eeeeee" }]
//             },
//             {
//               "featureType": "road",
//               "elementType": "labels.text.fill",
//               "stylers": [{ "color": "#7b7b7b" }]
//             },
//             {
//               "featureType": "road",
//               "elementType": "labels.text.stroke",
//               "stylers": [{ "color": "#ffffff" }]
//             },
//             {
//               "featureType": "road.highway",
//               "elementType": "all",
//               "stylers": [{ "visibility": "simplified" }]
//             },
//             {
//               "featureType": "road.arterial",
//               "elementType": "labels.icon",
//               "stylers": [{ "visibility": "off" }]
//             },
//             {
//               "featureType": "transit",
//               "elementType": "all",
//               "stylers": [{ "visibility": "off" }]
//             },
//             {
//               "featureType": "water",
//               "elementType": "all",
//               "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }]
//             },
//             {
//               "featureType": "water",
//               "elementType": "geometry.fill",
//               "stylers": [{ "color": "#c8d7d4" }]
//             },
//             {
//               "featureType": "water",
//               "elementType": "labels.text.fill",
//               "stylers": [{ "color": "#070707" }]
//             },
//             {
//               "featureType": "water",
//               "elementType": "labels.text.stroke",
//               "stylers": [{ "color": "#ffffff" }]
//             }
//           ]
//         });
//         googleMapRef.current = map;
//         clearTimeout(mapInitTimeout);
//         setIsMapLoaded(true);
//         setMapError(null);
//       }
//     } catch (error: any) {
//       clearTimeout(mapInitTimeout);
//       console.error("Google Maps initialization failed:", error);
//       const msg = error.message || '';
//       if (msg.includes('ApiProjectMapError')) {
//         setMapError('ApiProjectMapError');
//       } else {
//         setMapError(msg || 'initialization_failed');
//       }
//     }
//   };

//   initMap();

//   return () => {
//     if (mapInitTimeout) clearTimeout(mapInitTimeout);
//   };
// }, []);

//   useEffect(() => {
//     if (!isMapLoaded || !googleMapRef.current) return;

//     // Clear existing markers and clusterer
//     markersRef.current.forEach(marker => marker.setMap(null));
//     markersRef.current = [];
//     if (clustererRef.current) {
//       clustererRef.current.clearMarkers();
//     }

//     // Add new markers
//     const newMarkers = filteredIssues.map(issue => {
//       // Safety check for google object
//       if (typeof google === 'undefined' || !google.maps) return null;

//       const getMarkerColor = (severity: number) => {
//         if (severity === 3) return '#ef4444'; // Red for urgent
//         if (severity === 2) return '#f59e0b'; // Amber for important
//         return '#10b981'; // Emerald for normal
//       };

//       const color = getMarkerColor(issue.severity);
      
//       const getCategoryInitial = (type: string) => {
//         switch (type) {
//           case 'road': return 'ط';
//           case 'water': return 'م';
//           case 'electricity': return 'ك';
//           case 'waste': return 'ن';
//           default: return 'أ';
//         }
//       };

//       // Modern Pin SVG
//       const svgMarker = {
//         path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
//         fillColor: color,
//         fillOpacity: 1,
//         strokeColor: '#FFFFFF',
//         strokeWeight: 3,
//         scale: 1.5,
//         labelOrigin: new google.maps.Point(0, -30)
//       };
      
//       const marker = new google.maps.Marker({
//         position: { lat: issue.location.lat, lng: issue.location.lng },
//         title: issue.description,
//         icon: svgMarker,
//         label: {
//           text: getCategoryInitial(issue.type),
//           color: '#FFFFFF',
//           fontSize: '12px',
//           fontWeight: '900'
//         },
//         animation: issue.severity === 3 ? google.maps.Animation.BOUNCE : undefined
//       });

//       // Stop bouncing after a few seconds if it's urgent
//       if (issue.severity === 3) {
//         setTimeout(() => {
//           marker.setAnimation(null);
//         }, 3000);
//       }

//       marker.addListener('click', () => {
//         handleMarkerClick(issue);
//       });

//       return marker;
//     }).filter(m => m !== null) as google.maps.Marker[];

//     markersRef.current = newMarkers;

//     if (googleMapRef.current && newMarkers.length > 0) {
//       clustererRef.current = new MarkerClusterer({
//         map: googleMapRef.current,
//         markers: newMarkers,
//         algorithmOptions: { maxZoom: 15 }
//       });
//     }
//   }, [filteredIssues, isMapLoaded]);

//   useEffect(() => {
//     let unsubscribe: () => void;
    
//     const fetchData = async () => {
//       try {
//         const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'), limit(100));
//         unsubscribe = onSnapshot(q, (snapshot) => {
//           const fetchedIssues = snapshot.docs.map(doc => ({
//             id: doc.id,
//             ...doc.data()
//           })) as any[];
//           setIssues(fetchedIssues);
//           setLoading(false);
//           setHasMore(snapshot.docs.length === 100);
//           setError(null);
//         }, (err) => {
//           console.error("Firestore snapshot error:", err);
//           setError("عذراً، فشل الاتصال بقاعدة البيانات. يرجى التحقق من اتصالك.");
//           setLoading(false);
//         });
//       } catch (err) {
//         console.error("Error setting up Firestore listener:", err);
//         setError("حدث خطأ تقني غير متوقع. يرجى المحاولة لاحقاً.");
//         setLoading(false);
//       }
//     };

//     fetchData();

//     return () => {
//       if (unsubscribe) unsubscribe();
//     };
//   }, []);

//   const loadMoreIssues = async () => {
//     if (loadingMore || !hasMore || issues.length === 0) return;
    
//     setLoadingMore(true);
//     try {
//       const lastIssue = issues[issues.length - 1];
//       const lastDoc = await getDoc(doc(db, 'issues', lastIssue.id));
      
//       const q = query(
//         collection(db, 'issues'), 
//         orderBy('createdAt', 'desc'), 
//         startAfter(lastDoc),
//         limit(50)
//       );
      
//       const snapshot = await getDocs(q);
//       const newIssues = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       })) as any[];
      
//       if (newIssues.length > 0) {
//         setIssues(prev => [...prev, ...newIssues]);
//         setHasMore(newIssues.length === 50);
//       } else {
//         setHasMore(false);
//       }
//     } catch (err) {
//       console.error("Error loading more issues:", err);
//     } finally {
//       setLoadingMore(false);
//     }
//   };

//   const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
//     const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
//     if (scrollHeight - scrollTop <= clientHeight + 300) { // Increased threshold to 300
//       loadMoreIssues();
//     }
//   };


//   return (
//     <div className="h-full flex flex-col relative bg-white/50" dir="rtl">
//       {/* Official Workstation - Highlighted for Governments */}
//       {/* ------------ old code --------- */}
//       {/* {role === 'official' && (
//         <div className="px-6 lg:px-16 pt-8 pb-4">
//           <motion.div 
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="p-10 bg-white rounded-xl border-4 border-slate-100 shadow-2xl relative overflow-hidden"
//           >
//             <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
//             <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
//             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
//               <div className="flex items-center gap-6">
//                  <div className="w-20 h-20 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
//                     <ShieldCheck size={40} />
//                  </div>
//                  <div className="text-right">
//                     <div className="flex items-center gap-2 mb-1">
//                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] font-mono italic">GOV_COMMAND_CENTER // ACTIVE</p>
//                     </div>
//                     <h3 className="text-3xl lg:text-4xl font-black holographic-text font-display italic tracking-tight">محطة عمل المسؤول الحكومي</h3>
//                     <p className="text-emerald-600 font-medium mt-1">مرحباً بك، سيادة المسؤول. لديك {filteredIssues.filter(i => i.status === 'pending' && !i.assignedInstitution).length} بلاغات قيد الفرز والتعيين.</p>
//                  </div>
//               </div>
              
//               <div className="flex flex-wrap gap-4">
//                  <button 
//                    onClick={() => setSelectedInstitutionFilter('unassigned')}
//                    className={cn(
//                      "px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2",
//                      selectedInstitutionFilter === 'unassigned' 
//                        ? "bg-emerald-600 border-emerald-500 text-white shadow-lg" 
//                        : "bg-white/5 border-white/10 text-white/40 hover:text-white"
//                    )}
//                  >
//                    بلاغات غير موجهة ({issues.filter(i => !i.assignedInstitution).length})
//                  </button>
//                  <button 
//                     onClick={() => {
//                       setCitizenOnly(true);
//                       setSelectedInstitutionFilter('all');
//                     }}
//                    className="px-8 py-4 rounded-2xl bg-white border border-slate-100 text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-sm"
//                  >
//                    تدقيق بلاغات المواطنين
//                  </button>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       )} */}
//       {/* --------- new code ----------- */}

//       {/* محطة عمل المسؤول - واجهة مركز القيادة المحدثة */}
// {role === 'official' && (
//   <div className="px-6 lg:px-16 pt-10 pb-6">
//     <motion.div 
//       initial={{ opacity: 0, y: 40, scale: 0.95 }}
//       animate={{ opacity: 1, y: 0, scale: 1 }}
//       transition={{ duration: 0.8, ease: "easeOut" }}
//       className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-1 shadow-2xl border border-emerald-500/20"
//     >
//       {/* خلفية تقنية (Pattern) */}
//       <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
//       <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-600/20 blur-[120px] rounded-full" />
      
//       <div className="relative z-10 bg-white rounded-[2.8rem] p-8 lg:p-12">
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          
//           {/* القسم الأيمن: الترحيب والحالة */}
//           <div className="flex items-center gap-8">
//             <div className="relative">
//               <div className="w-24 h-24 rounded-3xl bg-emerald-600 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(16,185,129,0.4)] rotate-3">
//                 <ShieldCheck size={48} strokeWidth={1.5} />
//               </div>
//               <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100">
//                 <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
//               </div>
//             </div>

//             <div className="text-right">
//               <div className="flex items-center gap-3 mb-2">
//                 <span className="px-4 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-100 font-mono italic">
//                   GOV_COMMAND_CENTER // ACTIVE
//                 </span>
//               </div>
//               <h3 className="text-4xl lg:text-5xl font-black text-slate-900 font-display italic tracking-tighter mb-2">
//                 محطة عمل المسؤول الحكومي
//               </h3>
//               <p className="text-slate-500 font-medium text-lg lg:text-xl max-w-xl leading-relaxed">
//                 مرحباً بك، سيادة المسؤول. هناك <span className="text-emerald-600 font-black underline decoration-emerald-200 underline-offset-8">
//                 {filteredIssues.filter(i => i.status === 'pending' && !i.assignedInstitution).length} بلاغاً </span> تحتاج إلى توجيه فوري.
//               </p>
//             </div>
//           </div>

//           {/* القسم الأيسر: أزرار التحكم السريع */}
//           <div className="flex flex-wrap gap-4 w-full lg:w-auto">
//             <button 
//               onClick={() => setSelectedInstitutionFilter('unassigned')}
//               className={cn(
//                 "flex-1 lg:flex-none px-10 py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all border-2 flex flex-col items-center gap-2",
//                 selectedInstitutionFilter === 'unassigned' 
//                   ? "bg-emerald-600 border-emerald-500 text-white shadow-2xl scale-105" 
//                   : "bg-slate-50 border-slate-100 text-slate-400 hover:border-emerald-500/30 hover:bg-white"
//               )}
//             >
//               <span className="text-2xl font-mono">({issues.filter(i => !i.assignedInstitution).length})</span>
//               <span>بلاغات غير موجهة</span>
//             </button>

//             <button 
//               onClick={() => {
//                 setCitizenOnly(true);
//                 setSelectedInstitutionFilter('all');
//               }}
//               className="flex-1 lg:flex-none px-10 py-6 rounded-3xl bg-slate-900 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex flex-col items-center justify-center gap-2 border-2 border-slate-800"
//             >
//               <Activity size={24} className="text-emerald-400" />
//               <span>تدقيق المواطنين</span>
//             </button>
//           </div>

//         </div>

//         {/* مؤشر الحالة السفلي */}
//         <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-8 justify-center lg:justify-start">
//            <div className="flex items-center gap-3">
//               <div className="w-2 h-2 rounded-full bg-emerald-500" />
//               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Encryption: AES-256</span>
//            </div>
//            <div className="flex items-center gap-3">
//               <div className="w-2 h-2 rounded-full bg-blue-500" />
//               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Sync: Real-time</span>
//            </div>
//            <div className="flex items-center gap-3">
//               <div className="w-2 h-2 rounded-full bg-amber-500" />
//               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Node: KRT-Central</span>
//            </div>
//         </div>
//       </div>
//     </motion.div>
//   </div>
// )}

//       {/* Government Alerts Banner - Real-time */}
//       {/* <AnimatePresence>
//         {activeVisibleAlert && (
//           <motion.div 
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: 'auto', opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             className={cn(
//               "py-4 px-6 lg:px-16 flex items-center justify-between gap-6 z-[110] relative overflow-hidden border-b",
//               activeVisibleAlert.type === 'critical' ? "bg-rose-50 text-rose-900 border-rose-100" : 
//               activeVisibleAlert.type === 'warning' ? "bg-amber-50 text-amber-900 border-amber-100" : "bg-blue-50 text-blue-900 border-blue-100"
//             )}
//           >
//             <div className="absolute inset-0 opacity-[0.03] sudan-pattern-modern animate-pulse pointer-events-none" />
            
//             <div className="flex flex-1 items-center gap-4 relative z-10">
//               <div className={cn(
//                 "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
//                 activeVisibleAlert.type === 'critical' ? "bg-rose-600 text-white animate-pulse" : 
//                 activeVisibleAlert.type === 'warning' ? "bg-amber-600 text-white" : "bg-blue-600 text-white"
//               )}>
//                 {activeVisibleAlert.type === 'critical' ? <AlertTriangle size={24} /> : <Bell size={24} />}
//               </div>
              
//               <div className="text-right">
//                 <div className="flex items-center gap-2 mb-0.5">
//                   <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 font-mono">
//                     GOV_ALERT // {activeVisibleAlert.type?.toUpperCase() || 'ALERT'}
//                   </span>
//                   {activeVisibleAlert.type === 'critical' && (
//                     <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[8px] font-bold animate-pulse">URGENT</span>
//                   )}
//                 </div>
//                 <h4 className="text-lg lg:text-xl font-black leading-tight italic font-display text-slate-900">
//                   {activeVisibleAlert.title}: <span className="opacity-80 font-medium text-base lg:text-lg not-italic text-slate-700">{activeVisibleAlert.message}</span>
//                 </h4>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-4 relative z-10 shrink-0">
//                <span className="hidden md:block text-[9px] font-black opacity-20 font-mono uppercase tracking-widest text-slate-900">
//                  STAMP: {activeVisibleAlert.id.slice(0, 8)}
//                </span>
//                <button 
//                 onClick={() => dismissGovAlert(activeVisibleAlert.id)}
//                 className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all border border-slate-200 active:scale-95 text-slate-900"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence> */}


//       {/* Government Alerts Banner - المظهر المطور لمحطة العمل */}
// <AnimatePresence>
//   {activeVisibleAlert && (
//     <motion.div 
//       initial={{ y: -100, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       exit={{ y: -100, opacity: 0 }}
//       transition={{ type: "spring", stiffness: 100, damping: 20 }}
//       className={cn(
//         "py-4 px-6 lg:px-16 flex items-center justify-between gap-6 z-[110] relative border-b shadow-lg backdrop-blur-md",
//         activeVisibleAlert.type === 'critical' 
//           ? "bg-rose-600/95 text-white border-rose-400 shadow-rose-500/20" 
//           : activeVisibleAlert.type === 'warning' 
//             ? "bg-amber-500/95 text-slate-900 border-amber-300 shadow-amber-500/10" 
//             : "bg-indigo-600/95 text-white border-indigo-400 shadow-indigo-500/10"
//       )}
//     >
//       {/* خلفية تقنية متحركة */}
//       <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
      
//       <div className="flex flex-1 items-center gap-6 relative z-10">
//         {/* الأيقونة بتصميم دائري عصري */}
//         <div className={cn(
//           "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 backdrop-blur-sm shadow-inner",
//           activeVisibleAlert.type === 'critical' ? "bg-white/20 border-white/30 animate-pulse" : 
//           activeVisibleAlert.type === 'warning' ? "bg-black/10 border-black/10" : "bg-white/20 border-white/30"
//         )}>
//           {activeVisibleAlert.type === 'critical' ? 
//             <AlertTriangle size={28} className="drop-shadow-md" /> : 
//             <Bell size={28} className="drop-shadow-md" />
//           }
//         </div>
        
//         <div className="text-right">
//           <div className="flex items-center gap-3 mb-1">
//             <span className={cn(
//               "text-[10px] font-black uppercase tracking-[0.3em] font-mono px-2 py-0.5 rounded",
//               activeVisibleAlert.type === 'critical' ? "bg-rose-800 text-rose-100" : "opacity-70"
//             )}>
//               {activeVisibleAlert.type || 'SYSTEM'} LOG // {activeVisibleAlert.id.slice(0, 5)}
//             </span>
//             {activeVisibleAlert.type === 'critical' && (
//               <span className="flex h-2 w-2">
//                 <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
//                 <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
//               </span>
//             )}
//           </div>
//           <h4 className="text-lg lg:text-xl font-bold leading-tight tracking-tight">
//             <span className="font-black italic uppercase ml-2">{activeVisibleAlert.title}</span>
//             <span className="opacity-90 font-light text-base border-r border-current/30 pr-3 mr-3">
//               {activeVisibleAlert.message}
//             </span>
//           </h4>
//         </div>
//       </div>
      
//       {/* أدوات التحكم */}
//       <div className="flex items-center gap-6 relative z-10 shrink-0">
//          <div className="hidden xl:flex flex-col items-end opacity-60 font-mono text-[9px] uppercase tracking-tighter">
//             <span>Auth_Verified</span>
//             <span>Secure_Channel</span>
//          </div>
//          <button 
//           onClick={() => dismissGovAlert(activeVisibleAlert.id)}
//           className={cn(
//             "w-12 h-12 rounded-xl flex items-center justify-center transition-all border active:scale-90",
//             activeVisibleAlert.type === 'critical' 
//               ? "bg-white/10 hover:bg-white/20 border-white/20 text-white" 
//               : "bg-black/5 hover:bg-black/10 border-black/10 text-slate-900"
//           )}
//         >
//           <X size={20} />
//         </button>
//       </div>
//     </motion.div>
//   )}
// </AnimatePresence>


//       {/* System Notice Bar - TOP */}
//       {/* <AnimatePresence>
//         {showSystemNotice && (
//           <motion.div 
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: 'auto', opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             className="bg-emerald-950 text-emerald-400 py-3 px-6 lg:px-16 flex items-center justify-between gap-4 z-[100] relative overflow-hidden"
//           >
//             <div className="absolute inset-0 bg-emerald-500/5 animate-pulse sudan-texture pointer-events-none" />
//             <div className="flex flex-1 items-center gap-3 relative z-10">
//               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
//               <p className="text-[10px] font-black leading-none mb-0 flex items-center gap-2">
//                 <Bell size={12} />
//                 بث موحد // {systemNotice}
//               </p>
//             </div>
            
//             <div className="flex items-center gap-4 relative z-10">
//               <button 
//                 onClick={() => {
//                   setActiveTab('alerts');
//                   dismissNotice();
//                 }}
//                 className="px-4 py-1.5 bg-emerald-500 text-emerald-950 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
//               >
//                 قراءة الكل // VIEW_ALL
//               </button>
              
//               <button 
//                 onClick={dismissNotice}
//                 className="p-1 hover:bg-slate-100 rounded-full transition-colors"
//               >
//                 <X size={14} />
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence> */}


//       {/* شريط إشعارات النظام المطور - واجهة بسيطة واحترافية */}
// <AnimatePresence>
//   {showSystemNotice && (
//     <motion.div 
//       initial={{ y: -20, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       exit={{ y: -20, opacity: 0 }}
//       transition={{ duration: 0.4, ease: "circOut" }}
//       className="relative z-[100] bg-slate-900 border-b border-emerald-500/30 py-2.5 px-6 lg:px-16 flex items-center justify-between gap-4 overflow-hidden"
//     >
//       {/* تأثير خلفية خفيف جداً (Cyber Scanline) */}
//       <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:100%_3px] pointer-events-none" />

//       <div className="flex flex-1 items-center gap-4 relative z-10">
//         {/* مؤشر الحالة الصغير */}
//         <div className="flex items-center justify-center">
//           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//           <div className="absolute w-4 h-4 rounded-full bg-emerald-500/20 animate-ping" />
//         </div>
        
//         <div className="flex items-center gap-3 overflow-hidden">
//           <span className="hidden sm:inline-block text-[10px] font-black text-emerald-500 font-mono tracking-tighter uppercase opacity-80 border-l border-emerald-500/20 pl-3">
//             System_Broadcast
//           </span>
//           <p className="text-[13px] font-medium text-emerald-50/90 truncate max-w-[200px] sm:max-w-none leading-none">
//             {systemNotice}
//           </p>
//         </div>
//       </div>
      
//       <div className="flex items-center gap-3 relative z-10 shrink-0">
//         {/* زر الإجراء بتصميم مبسط */}
//         <button 
//           onClick={() => {
//             setActiveTab('alerts');
//             dismissNotice();
//           }}
//           className="group relative px-4 py-1.5 bg-transparent border border-emerald-500/50 hover:border-emerald-400 rounded-lg transition-all duration-300"
//         >
//           <span className="relative z-10 text-[9px] font-black text-emerald-400 group-hover:text-emerald-950 transition-colors uppercase tracking-widest flex items-center gap-2 italic">
//             عرض التفاصيل <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
//           </span>
//           <div className="absolute inset-0 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-[6px]" />
//         </button>
        
//         {/* زر الإغلاق الذكي */}
//         <button 
//           onClick={dismissNotice}
//           className="p-1.5 text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-all active:scale-90"
//           aria-label="إغلاق الإشعار"
//         >
//           <X size={16} />
//         </button>
//       </div>
//     </motion.div>
//   )}
// </AnimatePresence>
      

//       {/* Sudanese Pattern Overlay (Top) */}
//       <div className="absolute top-0 inset-x-0 h-40 opacity-[0.02] pointer-events-none sudan-pattern-modern" />

//       {/* Header & Welcome - Refined for Light Theme with the Brand Asset requested */}


//       {/* Header & Welcome - الإصدار المطور لمنصة عُمران */}
// <div className="hidden lg:block px-8 lg:px-16 pt-12 pb-8 space-y-8 relative z-10">
  
//   {/* شريط الحالة العلوي المستقبلي */}
//   <div className="flex justify-between items-center bg-white/60 backdrop-blur-xl p-4 rounded-[2rem] border border-slate-100 shadow-sm">
//     <div className="flex items-center gap-6">
//       {/* مؤشر اتصال النظام */}
//       <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg">
//         <div className="relative flex h-2 w-2">
//           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
//           <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
//         </div>
//         <span className="text-[10px] font-black text-emerald-400 font-mono tracking-widest uppercase">
//           System_Online // 14ms
//         </span>
//       </div>

//       {/* ختم التحقق الحكومي */}
//       <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity cursor-help">
//         <ShieldCheck size={18} className="text-emerald-600" />
//         <div className="text-right leading-none">
//           <p className="text-[9px] font-black text-slate-800 uppercase tracking-wider">Verified_Gov</p>
//           <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tight">SDN_AUTH_2026</p>
//         </div>
//       </div>
//     </div>

//     {/* أزرار الوصول السريع الموحدة */}
//     <div className="flex items-center gap-3">
//       <button 
//         onClick={() => setShowPlatformProfile(true)}
//         className="flex items-center gap-2 px-5 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all duration-300 group"
//       >
//         <Star size={14} className="text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
//         ملف المنصة
//       </button>
      
//       <button 
//         onClick={generatePitchDeck}
//         className="flex items-center gap-2 px-5 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all duration-300"
//       >
//         <Download size={14} />
//         Pitch Deck
//       </button>

//       <div className="h-8 w-px bg-slate-200 mx-2" />
      
//       <div className="flex flex-col items-end px-2">
//         <span className="text-[9px] font-black text-slate-400 font-mono tracking-tighter uppercase leading-none">Last_Sync</span>
//         <span className="text-[11px] font-bold text-slate-800 font-mono tracking-tighter">{new Date().toLocaleTimeString('ar-SD')}</span>
//       </div>
//     </div>
//   </div>

//   {/* القسم الرئيسي: البطل "عُمران" */}
//   <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/30 p-2 rounded-[3rem] border border-white/50 shadow-2xl overflow-hidden">
    
//     {/* زخارف خلفية تقنية */}
//     <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
    
//     {/* الجانب الأيمن: المحتوى النصي */}
//     <div className="lg:col-span-7 p-10 lg:p-16 relative z-10">
//       <div className="space-y-6">
//         <div className="relative inline-block">
//           {/* كلمة عمران الظلية الكبيرة */}
//           <span className="absolute -top-16 -right-10 text-[12rem] font-black text-slate-900 opacity-[0.03] pointer-events-none select-none font-display italic">
//             عمران
//           </span>
//           <h1 className="text-7xl lg:text-[8rem] font-black italic tracking-tighter font-display leading-none">
//             عُـمْـران<span className="text-emerald-500">.</span>
//           </h1>
//         </div>

//         <div className="relative max-w-lg group">
//           <div className="absolute -right-4 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
//           <p className="pr-6 text-2xl lg:text-3xl font-black text-slate-800 leading-tight italic font-display">
//             نحن لا نبني تطبيقاً.. نحن نبني نظام تشغيل <span className="text-emerald-600">للتعافي</span> وتجاوز الأزمات.
//           </p>
//         </div>

//         <div className="pt-4">
//           <div className="inline-flex items-center gap-4 p-1 bg-slate-50 rounded-2xl border border-slate-100">
//              <span className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">Vision 2026</span>
//              <span className="px-2 text-sm font-bold text-slate-500 italic">البنية التحتية الرقمية لإعادة إعمار السودان</span>
//           </div>
//         </div>
//       </div>

//       {/* التنبيه الأخير بتصميم مبسط (Toast-like) */}
//       <AnimatePresence>
//         {lastNotification && (
//           <motion.div 
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             className="mt-12 flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xl max-w-md border-r-4 border-r-amber-500"
//           >
//             <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
//                <Bell size={20} />
//             </div>
//             <div className="flex flex-col">
//                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Live_Update</span>
//                <span className="text-xs font-bold text-slate-700 leading-snug">{lastNotification}</span>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>

//     {/* الجانب الأيسر: خريطة السودان والتحكم */}
//     <div className="lg:col-span-5 p-10 flex flex-col items-center justify-center relative">
//        <div className="relative w-full aspect-square max-w-[400px] flex items-center justify-center">
//           {/* تأثير النبض خلف الخريطة */}
//           <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full animate-pulse" />
          
//           {/* خريطة مبسطة وأيقونة الموقع */}
//           <div className="relative z-10 w-full h-full bg-white/80 backdrop-blur-sm rounded-[4rem] border border-white shadow-2xl flex items-center justify-center overflow-hidden">
//              <svg viewBox="0 0 400 400" className="w-64 h-64 opacity-20 text-emerald-600">
//                 <path d="M150,50 L250,50 L300,150 L250,350 L100,350 L50,150 Z" fill="currentColor" />
//              </svg>
             
//              {/* زر البلاغ بدون إنترنت الكبير */}
//              <button 
//                onClick={() => setShowOfflineMode(true)}
//                className="absolute group flex flex-col items-center gap-2"
//              >
//                 <div className="w-24 h-24 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
//                    <WifiOff size={40} />
//                 </div>
//                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Offline_Report</span>
//              </button>
//           </div>
//        </div>

//        {/* شريط معلومات الموقع السفلي */}
//        <div className="mt-8 flex items-center gap-4 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 translate-y-4">
//           <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
//              <MapPin size={20} />
//           </div>
//           <div className="text-right">
//              <p className="text-[9px] font-black text-emerald-400 font-mono uppercase tracking-[0.2em] leading-none mb-1">Core_Node // KRT</p>
//              <p className="text-sm font-bold tracking-tight italic">الخرطوم، جمهورية السودان</p>
//           </div>
//        </div>
//     </div>

//   </div>
// </div>

//        {/* Stats Bento - Precise KPI View - Refined for 500K project feel */}
//       {/* <div className="px-4 sm:px-6 lg:px-16 py-4 lg:py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 relative z-10">
//         <motion.div 
//           whileHover={{ y: -4, scale: 1.02 }}
//           className="umran-card p-4 sm:p-6 lg:p-8 group overflow-hidden relative shadow-2xl bg-white border border-slate-100"
//         >
//           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -z-10 group-hover:bg-emerald-500/10 transition-all duration-1000" />
//           <div className="flex justify-between items-start mb-8">
//              <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(16,185,129,0.2)] group-hover:rotate-[12deg] transition-all duration-700">
//                 <Activity size={28} strokeWidth={2.5} />
//              </div>
//              <div className="flex flex-col items-end">
//                 <div className="p-2 px-4 rounded-xl bg-emerald-50 text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] border border-emerald-100 backdrop-blur-3xl flex items-center gap-2 mb-2 shadow-sm italic">
//                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]" />
//                    SENSORS_LIVE
//                 </div>
//                 <span className="text-[9px] font-black text-slate-300 font-mono tracking-widest uppercase">TS_ID: 882-SDN</span>
//              </div>
//           </div>
//           <div className="relative">
//             <p className="text-4xl lg:text-5xl font-black text-slate-900 mb-2 font-mono italic leading-none group-hover:translate-x-2 transition-transform duration-700 tracking-tighter">١٢</p>
//             <div className="h-1 w-8 bg-emerald-500 mb-3 group-hover:w-16 transition-all duration-1000 rounded-full shadow-[0_0_15px_#10b981]" />
//           </div>
//           <p className="text-[10px] font-black text-slate-400 group-hover:text-emerald-700 transition-colors tracking-widest uppercase font-mono italic">البلاغات النشطة // ACTIVE</p>
//         </motion.div>

//         <motion.div 
//           whileHover={{ y: -4, scale: 1.02 }}
//           className="umran-card p-4 sm:p-6 lg:p-8 group overflow-hidden relative shadow-2xl bg-white border border-slate-100"
//         >
//           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -z-10 group-hover:bg-blue-500/10 transition-all duration-1000" />
//           <div className="flex justify-between items-start mb-8">
//              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(59,130,246,0.2)] group-hover:rotate-[-12deg] transition-all duration-700">
//                 <ThumbsUp size={28} strokeWidth={2.5} />
//              </div>
//              <div className="flex flex-col items-end">
//                 <div className="p-2 px-4 rounded-xl bg-blue-50 text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] border border-blue-100 backdrop-blur-3xl flex items-center gap-2 mb-2 shadow-sm italic">
//                    +٤٢٪ VOL
//                 </div>
//                 <span className="text-[9px] font-black text-slate-300 font-mono tracking-widest uppercase">UNIT: HUB_A1</span>
//              </div>
//           </div>
//           <div className="relative">
//             <p className="text-4xl lg:text-5xl font-black text-slate-900 mb-2 font-mono italic leading-none group-hover:translate-x-2 transition-transform duration-700 tracking-tighter">٢٤٥</p>
//             <div className="h-1 w-8 bg-blue-500 mb-3 group-hover:w-16 transition-all duration-1000 rounded-full shadow-[0_0_15px_#3b82f6]" />
//           </div>
//           <p className="text-[10px] font-black text-slate-400 group-hover:text-blue-700 transition-colors tracking-widest uppercase font-mono italic">المساهمات // PULSE</p>
//         </motion.div>

//         <motion.div 
//           whileHover={{ y: -4, scale: 1.02 }}
//           className="umran-card p-4 sm:p-6 lg:p-8 group overflow-hidden relative shadow-2xl bg-white border border-slate-100"
//         >
//           <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -z-10 group-hover:bg-amber-500/10 transition-all duration-1000" />
//           <div className="flex justify-between items-start mb-8">
//              <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(245,158,11,0.2)] group-hover:rotate-[15deg] transition-all duration-700">
//                 <ShieldCheck size={28} strokeWidth={2.5} />
//              </div>
//              <div className="flex flex-col items-end">
//                 <div className="p-2 px-4 rounded-xl bg-amber-50 text-[9px] font-black text-amber-600 uppercase tracking-[0.3em] border border-amber-100 backdrop-blur-3xl flex items-center gap-2 mb-2 shadow-sm italic">
//                    SECURED_SSL
//                 </div>
//                 <span className="text-[9px] font-black text-slate-300 font-mono tracking-widest uppercase">ENC: AES_256</span>
//              </div>
//           </div>
//           <div className="relative">
//             <p className="text-4xl lg:text-5xl font-black text-slate-900 mb-2 font-mono italic leading-none group-hover:translate-x-2 transition-transform duration-700 tracking-tighter">١٠٠٪</p>
//             <div className="h-1 w-8 bg-amber-500 mb-3 group-hover:w-16 transition-all duration-1000 rounded-full shadow-[0_0_15px_#f59e0b]" />
//           </div>
//           <p className="text-[10px] font-black text-slate-400 group-hover:text-amber-700 transition-colors tracking-widest uppercase font-mono italic">أمن النظام // SHIELD</p>
//         </motion.div>

//         <motion.div 
//           whileHover={{ y: -4, scale: 1.02 }}
//           className="umran-card p-4 sm:p-6 lg:p-8 group overflow-hidden relative shadow-2xl bg-white border border-slate-100"
//         >
//           <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full -z-10 group-hover:bg-rose-500/10 transition-all duration-1000" />
//           <div className="flex justify-between items-start mb-8">
//              <div className="w-14 h-14 rounded-2xl bg-brand-red flex items-center justify-center text-white shadow-[0_20px_50px_rgba(239,68,68,0.2)] group-hover:rotate-[-10deg] transition-all duration-700">
//                 <Trophy size={28} strokeWidth={2.5} />
//              </div>
//              <div className="flex flex-col items-end">
//                 <div className="p-2 px-4 rounded-xl bg-rose-50 text-[9px] font-black text-rose-600 uppercase tracking-[0.3em] border border-rose-100 backdrop-blur-3xl flex items-center gap-2 mb-2 shadow-sm italic">
//                    PRIORITY_H
//                 </div>
//                 <span className="text-[9px] font-black text-slate-300 font-mono tracking-widest uppercase">RANK: 09</span>
//              </div>
//           </div>
//           <div className="relative">
//             <p className="text-4xl lg:text-5xl font-black text-slate-900 mb-2 font-mono italic leading-none group-hover:translate-x-2 transition-transform duration-700 tracking-tighter">٨.٥</p>
//             <div className="h-1 w-8 bg-brand-red mb-3 group-hover:w-16 transition-all duration-1000 rounded-full shadow-[0_0_15px_#ef4444]" />
//           </div>
//           <p className="text-[10px] font-black text-slate-400 group-hover:text-brand-red transition-colors tracking-widest uppercase font-mono italic">مؤشر الإعمار // PULSE</p>
//         </motion.div>
//       </div> */}

//       {/* Stats Bento - واجهة مؤشرات الأداء المطورة لمنصة عُمران */}
// <div className="px-6 lg:px-16 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
  
//   {[
//     { label: "البلاغات النشطة", value: "١٢", sub: "ACTIVE", icon: Activity, color: "emerald", id: "882-SDN", tag: "LIVE" },
//     { label: "المساهمات", value: "٢٤٥", sub: "PULSE", icon: ThumbsUp, color: "blue", id: "HUB_A1", tag: "+٤٢٪" },
//     { label: "أمن النظام", value: "١٠٠٪", sub: "SHIELD", icon: ShieldCheck, color: "amber", id: "AES_256", tag: "SECURED" },
//     { label: "مؤشر الإعمار", value: "٨.٥", sub: "RANK", icon: Trophy, color: "rose", id: "LVL_09", tag: "PRIORITY" }
//   ].map((stat, idx) => (
//     <motion.div 
//       key={idx}
//       whileHover={{ y: -5 }}
//       className="relative group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50"
//     >
//       {/* تأثير التوهج الخلفي (Gradient Glow) */}
//       <div className={`absolute -top-20 -right-20 w-48 h-48 bg-${stat.color}-500/5 blur-[80px] rounded-full group-hover:bg-${stat.color}-500/10 transition-all duration-700`} />

//       <div className="relative z-10 flex flex-col h-full">
//         {/* الجزء العلوي: الأيقونة والوسوم التقنية */}
//         <div className="flex justify-between items-start mb-10">
//           <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-600 flex items-center justify-center text-white shadow-lg shadow-${stat.color}-500/20 group-hover:rotate-6 transition-transform duration-500`}>
//             <stat.icon size={26} strokeWidth={2} />
//           </div>
//           <div className="text-right">
//             <div className={`px-3 py-1 rounded-full bg-${stat.color}-50 text-${stat.color}-600 text-[9px] font-black tracking-widest border border-${stat.color}-100 italic mb-2 inline-block`}>
//               {stat.tag} // SYS_SYNC
//             </div>
//             <p className="text-[8px] font-bold text-slate-300 font-mono tracking-widest uppercase">{stat.id}</p>
//           </div>
//         </div>

//         {/* الجزء الأوسط: القيمة الرقمية */}
//         <div className="mb-4">
//           <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic font-display group-hover:translate-x-1 transition-transform duration-500">
//             {stat.value}
//           </h3>
//           <div className={`h-1 w-10 bg-${stat.color}-500 mt-2 rounded-full group-hover:w-20 transition-all duration-700 shadow-[0_0_15px_rgba(var(--tw-color-${stat.color}-500),0.5)]`} />
//         </div>

//         {/* الجزء السفلي: المسمى الوظيفي */}
//         <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase font-mono italic flex items-center gap-2">
//           <span className={`w-1 h-1 rounded-full bg-${stat.color}-500`} />
//           {stat.label} // {stat.sub}
//         </p>
//       </div>
//     </motion.div>
//   ))}
// </div>

//       {/* Visionary Sudanese Statement Section */}
//       <section className="px-4 lg:px-16 mb-12 lg:mb-20 relative">
//         <div className="max-w-7xl mx-auto bg-white/40 backdrop-blur-3xl rounded-xl p-6 sm:p-10 lg:p-16 overflow-hidden relative border border-slate-100 shadow-2xl shimmer">
//           <div className="absolute inset-0 opacity-[0.01] sudan-pattern-modern pointer-events-none scale-150 rotate-3" />
//           <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
          
//           <div className="relative z-10 text-center space-y-6 sm:space-y-10 lg:space-y-12">
//             {/* <motion.div 
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               className="inline-flex items-center gap-3 lg:gap-4 px-6 lg:px-10 py-3 rounded-full bg-slate-100 border border-slate-200 text-emerald-600 text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.6em] backdrop-blur-3xl shadow-sm italic"
//             >
//               <Star size={16} className="text-amber-500 animate-spin-slow" />
//               مـيـثـاق الـبـنـاء والـتـعـمـيـر // VISION_2026
//             </motion.div> */}
//           <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="inline-flex items-center gap-4 px-8 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl"
//         >
//           <div className="flex items-center gap-2">
//             <Star size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
//             <span className="text-[10px] font-black uppercase tracking-[0.4em] font-mono">Vision_2026</span>
//           </div>
//           <div className="w-px h-4 bg-slate-700" />
//           <span className="text-[11px] font-bold italic text-slate-300">مـيـثـاق الـبـنـاء</span>
//         </motion.div>
            
//             <motion.h2 
//               initial={{ opacity: 0, scale: 0.9 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: 0.2 }}
//               className="text-3xl sm:text-5xl lg:text-8xl font-display text-slate-900 leading-[1.2] lg:leading-[1.1] italic tracking-tighter"
//             >
//               " نَبْنِي السُّودَانَ بِرُؤْيَةٍ وَطَنِـيَّةٍ <br className="hidden sm:block" /> 
//               <span className="text-emerald-600 drop-shadow-[0_0_30px_rgba(16,185,129,0.2)]">وَسَوَاعِدَ لاَ تَعْرِفُ المُسْتَحِيلَ </span>"
//             </motion.h2>
            
//             <motion.p 
//               initial={{ opacity: 0 }}
//               whileInView={{ opacity: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: 0.4 }}
//               className="max-w-3xl mx-auto text-slate-500 text-sm sm:text-base lg:text-2xl font-medium leading-[1.8] lg:leading-relaxed px-2 sm:px-4 italic"
//             >
//               نحن لا نقوم بترميم المباني فحسب، بل نعيد صياغة المستقبل الرقمي للسودان، حيث تكون الشفافية والعدالة والسرعة هي ركائز النهضة العمرانية الشاملة.
//             </motion.p>
            
//             {/* <div className="flex flex-wrap justify-center gap-4 sm:gap-8 lg:gap-16 pt-4 sm:pt-6 lg:pt-10">
//                {[
//                  { label: 'النزاهة', color: 'bg-emerald-500' },
//                  { label: 'السرعة', color: 'bg-blue-500' },
//                  { label: 'الشفافية', color: 'bg-amber-500' },
//                ].map((p, i) => (
//                  <motion.div 
//                    key={p.label}
//                    initial={{ opacity: 0, y: 20 }}
//                    whileInView={{ opacity: 1, y: 0 }}
//                    viewport={{ once: true }}
//                    transition={{ delay: 0.6 + (i * 0.1) }}
//                    className="flex items-center gap-4 group"
//                  >
//                    <div className={cn("w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] group-hover:scale-150 transition-transform", p.color)} />
//                    <span className="text-slate-900 font-black uppercase tracking-[0.4em] text-[11px] font-mono">{p.label}</span>
//                  </motion.div>
//                ))}
//             </div> */}
//                     <div className="flex flex-wrap justify-center gap-6 lg:gap-12 pt-8">
//           {[
//             { label: 'النزاهة', color: 'emerald' },
//             { label: 'السرعة', color: 'blue' },
//             { label: 'الشفافية', color: 'amber' },
//           ].map((p, i) => (
//             <motion.div 
//               key={p.label}
//               initial={{ opacity: 0, scale: 0.8 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: 0.7 + (i * 0.1) }}
//               className="flex items-center gap-4 bg-white/50 px-6 py-3 rounded-2xl border border-slate-100 shadow-sm group/item hover:bg-white transition-all"
//             >
//               <div className={`w-2.5 h-2.5 rounded-full bg-${p.color}-500 shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover/item:scale-125 transition-transform`} />
//               <span className="text-slate-900 font-black uppercase tracking-[0.2em] text-[12px] font-mono">{p.label}</span>
//             </motion.div>
//           ))}
//         </div>
//           </div>
//         </div>
//       </section>

//       {/* Multi-Channel Bridge Visualization */}
//       <div className="px-4 lg:px-16 mb-12 lg:mb-20">
//         <div className="bg-white/[0.02] backdrop-blur-3xl rounded-xl p-8 lg:p-14 relative overflow-hidden group border border-white/10 shadow-2xl">
//           <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] sudan-pattern-modern pointer-events-none scale-150 rotate-3" />
//           <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-1000" />
          
//           <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 relative z-10">
//             <div className="text-center lg:text-right space-y-6 max-w-xl">
//                <div className="flex items-center gap-4 justify-center lg:justify-end mb-6">
//                   <span className="px-6 py-2 rounded-full bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl backdrop-blur-xl">SYSTEM_BRIDGE</span>
//                   <div className="flex gap-1.5">
//                     {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-4 bg-emerald-500/30 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
//                   </div>
//                </div>
//             <h2 className="text-4xl lg:text-7xl font-black text-slate-900 font-display leading-tight italic tracking-tighter text-center lg:text-right">التوصيل الرقمي الشامل // OMNI_SDN</h2>
//             <p className="text-base lg:text-xl text-slate-500 font-medium leading-relaxed font-sans mt-2 text-center lg:text-right">
//               بنية تحتية مرنة تتجاوز قيود الاتصال. ندمج قنوات <span className="text-emerald-600 font-bold italic">الويب، الرسائل النصية، ونظام USSD</span> لضمان وصول صوت كل مواطن من أي مكان في السودان.
//             </p>
//             </div>

//             <div className="flex gap-8 lg:gap-12 flex-wrap justify-center">
//               {[
//                 { label: 'الويب والتطبيق', value: '٦٤٪', icon: <Globe size={28} />, color: 'bg-emerald-600', accent: 'group-hover/item:text-emerald-600' },
//                 { label: 'الرسائل النصية', value: '٢٢٪', icon: <MessageSquare size={28} />, iconSize: 24, color: 'bg-blue-600', accent: 'group-hover/item:text-blue-600' },
//                 { label: 'نظام USSD', value: '١٤٪', icon: <Hash size={28} />, iconSize: 24, color: 'bg-amber-600', accent: 'group-hover/item:text-amber-600' },
//               ].map((source, i) => (
//                 <div key={i} className="bg-white border border-slate-100 p-8 rounded-2xl w-52 text-center space-y-5 shadow-xl hover:border-emerald-500/30 transition-all group/item hover:-translate-y-3 duration-700">
//                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl transition-all group-hover/item:scale-110 group-hover/item:rotate-[10deg]", source.color)}>
//                       {source.icon}
//                    </div>
//                    <p className="text-4xl font-black text-slate-900 font-mono tracking-tighter italic">{source.value}</p>
//                    <p className={cn("text-[10px] font-black uppercase tracking-[0.4em] font-mono transition-colors text-slate-400", source.accent)}>{source.label}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>



// {/* Control Panel & Mission Grid // تحسين الواجهة وتبسيط المنطق البصري */}
// <div className="px-6 lg:px-16 pb-40 space-y-10 relative z-10">
  
//   {/* 1. منطقة البحث والتحكم السريع */}
//   <div className="flex flex-col lg:flex-row gap-6 items-center">
//     <div className="relative group flex-1 w-full">
//       <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={24} />
//       <input 
//         type="text" 
//         placeholder="البحث عن بلاغ أو منطقة..." 
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         className="w-full pr-16 pl-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-xl font-bold focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-right shadow-sm placeholder:text-slate-300"
//       />
//     </div>
    
//     <button 
//       onClick={() => setShowFilters(!showFilters)}
//       className={cn(
//         "flex items-center gap-3 px-8 py-5 rounded-[2rem] font-bold transition-all border-2",
//         showFilters ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-100 text-slate-600 hover:border-emerald-500"
//       )}
//     >
//       <span>{showFilters ? 'إغلاق التصفية' : 'تصفية النتائج'}</span>
//       <Filter size={20} />
//     </button>
//   </div>

//   {/* 2. قسم الفلاتر المبسط */}
//   <AnimatePresence>
//     {showFilters && (
//       <motion.div
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -10 }}
//         className="bg-slate-50/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white grid grid-cols-1 md:grid-cols-3 gap-8"
//       >
//         {/* فئة البلاغ */}
//         <div className="space-y-4">
//           <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right px-2">المؤسسة</label>
//           <select 
//             onChange={(e) => setSelectedInstitutionFilter(e.target.value)}
//             className="w-full p-4 rounded-2xl border-none shadow-sm font-bold text-right outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500"
//           >
//             <option value="all">كافة المؤسسات</option>
//             {INSTITUTIONS.map(inst => <option key={inst.id} value={inst.id}>{inst.fullName}</option>)}
//           </select>
//         </div>

//         {/* الترتيب */}
//         <div className="space-y-4">
//           <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right px-2">ترتيب حسب</label>
//           <div className="flex gap-2">
//             <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} className="p-4 bg-white rounded-2xl shadow-sm hover:text-emerald-500 transition-colors">
//               <MoreVertical size={20} className={cn("transition-transform", sortOrder === 'asc' && "rotate-180")} />
//             </button>
//             <button onClick={() => setSortBy('date')} className="flex-1 p-4 bg-white rounded-2xl shadow-sm font-bold text-slate-600">الأحدث أولاً</button>
//           </div>
//         </div>

//         {/* مصدر البلاغ */}
//         <div className="space-y-4">
//           <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right px-2">المصدر</label>
//           <button 
//             onClick={() => setCitizenOnly(!citizenOnly)}
//             className={cn("w-full p-4 rounded-2xl font-bold transition-all shadow-sm flex justify-between items-center", citizenOnly ? "bg-emerald-600 text-white" : "bg-white text-slate-600")}
//           >
//             <div className={cn("w-5 h-5 rounded-full border-2 border-current flex items-center justify-center", citizenOnly && "bg-white")}>
//                {citizenOnly && <Check size={12} className="text-emerald-600" />}
//             </div>
//             <span>بلاغات المواطنين فقط</span>
//           </button>
//         </div>
//       </motion.div>
//     )}
//   </AnimatePresence>

//   {/* 3. شبكة المحتوى (الخريطة والنشاط) */}
//   <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
    
//     {/* حاوية الخريطة */}
//     <div className="xl:col-span-8 relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white h-[600px] lg:h-[750px]">
      
//       {/* HUD: معلومات الخريطة الشفافة */}
//       <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
//         <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
//           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//           <span className="text-sm font-black text-slate-900 font-mono tracking-tighter">LIVE // {filteredIssues.length} REPORTS</span>
//         </div>
//       </div>

//       {/* الخريطة الفعلية */}
//       <div ref={mapRef} className="w-full h-full grayscale-[0.2] contrast-[1.1]" />

//       {/* شاشة الخطأ المبسطة */}
//       {mapError && (
//         <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-md flex items-center justify-center p-10 text-center z-30">
//           <div className="max-w-xs space-y-4">
//             <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
//               <AlertTriangle size={32} />
//             </div>
//             <h3 className="text-xl font-bold text-slate-900">الخريطة المتقدمة غير متوفرة</h3>
//             <p className="text-sm text-slate-500">تم تفعيل وضع العرض الاحتياطي لضمان استمرارية الخدمة.</p>
//             <button onClick={() => setMapError(null)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">متابعة</button>
//           </div>
//         </div>
//       )}
//     </div>

//     {/* حاوية النشاط الجانبية */}
//     <div className="xl:col-span-4 space-y-6 overflow-y-auto max-h-[750px] pr-2 no-scrollbar">
//        {/* هنا تضع قائمة البلاغات النشطة أو التنبيهات */}
//        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-50 shadow-xl">
//           <h4 className="text-2xl font-black text-slate-900 mb-6 italic">آخر النشاطات</h4>
//           <div className="space-y-4">
//             {/* مثال لبلاغ مبسط */}
//             {filteredIssues.slice(0, 5).map((issue) => (
//               <div key={issue.id} className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-colors cursor-pointer group border border-transparent hover:border-emerald-100">
//                 <div className="flex justify-between items-start mb-2">
//                   <span className="text-[10px] font-mono text-slate-400">#{issue.trackingId}</span>
//                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
//                 </div>
//                 <p className="font-bold text-slate-700 text-right leading-relaxed">{issue.description}</p>
//               </div>
//             ))}
//           </div>
//        </div>
//     </div>

//   </div>
// </div>
      

//        {/* National Partners Showcase - Premium Scrolling List */}
//        <div className="pt-20 pb-12 mt-16 bg-white/40 backdrop-blur-3xl rounded-[4rem] lg:rounded-[5rem] p-12 border border-slate-100 shadow-2xl">
//          {/* <div className="flex flex-col items-center mb-12 space-y-4">
//            <div className="w-16 h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-800 mb-6 rounded-full opacity-50" />
//            <h3 className="text-[14px] lg:text-[16px] font-black text-slate-900 text-center tracking-[0.3em] uppercase italic font-display">شركاء الإعمار الوطنيين الاستراتيجيين</h3>
//            <p className="text-[11px] text-slate-400 font-black italic tracking-widest uppercase font-mono">المؤسسات والوزارات والجهات المكلفة بالحلول // STRATEGIC_PARTNERS</p>
//          </div> */}
//         <div className="flex flex-col items-center mb-16 px-6 text-center">
//       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
//         <span className="relative flex h-2 w-2">
//           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
//           <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
//         </span>
//         <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest font-mono">Strategic Network</span>
//       </div>
//       <h3 className="text-xl lg:text-2xl font-black text-slate-900 mb-2 tracking-tight">شركاء الإعمار الوطنيين الاستراتيجيين</h3>
//       <p className="text-[10px] lg:text-xs text-slate-400 font-medium uppercase tracking-[0.1em]">المؤسسات والوزارات والجهات المكلفة بالحلول</p>
//     </div>
        

//         <div className="relative">
//       {/* تأثير التلاشي الجانبي (Glass Gradients) لإضفاء لمسة احترافية */}
//       <div className="absolute inset-y-0 left-0 w-24 lg:w-48 bg-gradient-to-r from-white/60 to-transparent z-10 pointer-events-none" />
//       <div className="absolute inset-y-0 right-0 w-24 lg:w-48 bg-gradient-to-l from-white/60 to-transparent z-10 pointer-events-none" />

//       {/* منطقة الحركة اللانهائية - نكرر المصفوفة لضمان استمرار الحركة */}
//       <div className="flex overflow-hidden group" dir="ltr">
//         {[...Array(2)].map((_, i) => (
//           <motion.div 
//             key={i}
//             initial={{ x: 0 }}
//             animate={{ x: "-100%" }}
//             transition={{ 
//               duration: 35, 
//               repeat: Infinity, 
//               ease: "linear" 
//             }}
//             className="flex shrink-0 items-center gap-12 lg:gap-24 pr-12 lg:pr-24"
//           >
//             {INSTITUTIONS.map((inst) => (
//               <div 
//                 key={inst.id}
//                 onClick={() => setViewingInstitution(inst)}
//                 className="flex flex-col items-center gap-5 group/item cursor-pointer transition-transform duration-500 hover:scale-110"
//               >
//                 {/* Logo Container - تصميم دائري بسيط وراقي */}
//                 <div className="w-20 h-20 lg:w-32 lg:h-32 rounded-full bg-white border border-slate-50 flex items-center justify-center p-5 shadow-sm group-hover/item:shadow-2xl group-hover/item:border-emerald-200 transition-all relative overflow-hidden">
//                   {inst.logo ? (
//                     <img 
//                       src={inst.logo} 
//                       alt={inst.name} 
//                       className="w-full h-full object-contain filter grayscale group-hover/item:grayscale-0 opacity-60 group-hover/item:opacity-100 transition-all duration-700" 
//                       referrerPolicy="no-referrer"
//                     />
//                   ) : (
//                     <Building className="text-slate-200" size={32} />
//                   )}
//                 </div>
                
//                 {/* معلومات المؤسسة - تظهر تحت الشعار مباشرة */}
//                 <div className="text-center space-y-1">
//                   <span className="text-[10px] lg:text-[12px] font-black text-slate-800 block whitespace-nowrap tracking-tight group-hover/item:text-emerald-700 transition-colors">
//                     {inst.name}
//                   </span>
//                   <span className={cn(
//                     "text-[8px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-md",
//                     inst.type !== 'partner' ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-500"
//                   )}>
//                     {inst.type !== 'partner' ? 'حكومي' : 'خاص'}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </motion.div>
//         ))}
//       </div>
//         </div>
        

//       </div>

      

//         {/* Real-time Reconstruction Log Terminal */}
//         <div className="mt-12 bg-white rounded-[3rem] p-8 border border-slate-100 overflow-hidden relative group shadow-2xl">
//            <div className="absolute inset-0 sudan-pattern-modern opacity-5 pointer-events-none" />
//            <div className="flex justify-between items-center mb-6">
//               <div className="flex items-center gap-3">
//                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
//                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] font-mono italic">OPERATIONAL_DATA_FEED // LIVE</h4>
//               </div>
//               <p className="text-[10px] font-black text-slate-300 font-mono tracking-widest">KRT_NODE_01</p>
//            </div>
           
//            <div className="space-y-3 font-mono text-[9px] text-emerald-700/70">
//               <div className="flex gap-4">
//                  <span className="text-slate-300 shrink-0">[{new Date().toLocaleTimeString()}]</span>
//                  <p><span className="text-slate-900 font-black">SYSTEM:</span> جاري تحديث الخرائط الميدانية لولاية الخرطوم... <span className="text-slate-400">DONE</span></p>
//               </div>
//               <div className="flex gap-4">
//                  <span className="text-slate-300 shrink-0">[{new Date().toLocaleTimeString()}]</span>
//                  <p><span className="text-slate-900 font-black">MAP:</span> تم رصد ٥ بلاغات جديدة في منطقة بحري - قطاع المياه.</p>
//               </div>
//               <div className="flex gap-4 animate-pulse">
//                 <span className="text-slate-300 shrink-0">[{new Date().toLocaleTimeString()}]</span>
//                 <p><span className="text-emerald-600 font-black">REBUILD:</span> فريق صيانة الكهرباء تحرك الآن في قطاع أمدرمان القديمة.</p>
//               </div>
//               <div className="flex gap-4 opacity-50">
//                 <span className="text-slate-300 shrink-0">[{new Date().toLocaleTimeString()}]</span>
//                 <p><span className="text-slate-900 font-black">AUTH:</span> تم التحقق من دخول مسؤول جديد عبر بوابة الوزارة.</p>
//               </div>
//            </div>
           
//            {/* Terminal Scanning Effect */}
//            <motion.div 
//              animate={{ top: ['0%', '100%'] }}
//              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
//              className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none"
//            />
//         </div>

//         <AnimatePresence>
//           {selectedIssue && (
//             <IssueDetail 
//               issue={selectedIssue} 
//               onClose={() => setSelectedIssue(null)} 
//             />
//           )}
//           {viewingInstitution && (
//             <InstitutionDetail 
//               institution={viewingInstitution} 
//               onClose={() => setViewingInstitution(null)} 
//               rank={INSTITUTIONS.findIndex(i => i.id === viewingInstitution.id) + 1}
//             />
//           )}
//           {showPitch && (
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 z-[100] bg-white overflow-y-auto"
//             >
//               <HackathonPitch onClose={() => setShowPitch(false)} />
//             </motion.div>
//           )}
//           <OfflineReporting 
//             isOpen={showOfflineMode} 
//             onClose={() => setShowOfflineMode(false)} 
//           />
//           {showPlatformProfile && (
//             <PlatformProfile onClose={() => setShowPlatformProfile(false)} />
//           )}
//         </AnimatePresence>

      
      

//     </div>
    

    
//     );
//   }

// function MapSkeleton() {
//   return (
//     <div className="absolute inset-0 bg-white flex items-center justify-center overflow-hidden">
//       <div className="absolute inset-0 opacity-[0.05] tech-grid-unified" />
//       <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-500/5 to-transparent animate-[shimmer_3s_infinite]" />
      
//       {/* Mock Map Lines - Tactical look */}
//       <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
//         <path d="M0 100 Q 250 50 500 150 T 1000 100" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="10 5" />
//         <path d="M-100 200 L 1200 400" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="5 5" />
//         <path d="M300 0 L 300 600" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="15 10" />
//       </svg>

//       <div className="relative flex flex-col items-center gap-10">
//         <div className="relative">
//           <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-xl flex items-center justify-center animate-pulse">
//             <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
//               <MapIcon size={40} className="animate-bounce" />
//             </div>
//           </div>
//           <motion.div 
//             animate={{ scale: [1, 2, 1], opacity: [0.05, 0.1, 0.05] }}
//             transition={{ duration: 3, repeat: Infinity }}
//             className="absolute -inset-10 bg-emerald-500 rounded-full -z-10 blur-3xl opacity-20"
//           />
//         </div>
//         <div className="text-center space-y-3">
//           <p className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.5em] animate-pulse font-mono italic">جاري تحميل الخريطة الميدانية // MAP_SYNC...</p>
//           <div className="w-48 h-1 bg-slate-100 mx-auto rounded-full overflow-hidden">
//              <motion.div 
//                animate={{ x: ['-100%', '100%'] }}
//                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
//                className="h-full w-1/2 bg-emerald-500 shadow-[0_0_10px_#10b981]"
//              />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

//       // {/* Control Panel & Mission Grid */}
//       // <div className="px-6 lg:px-16 pb-40 space-y-12 relative z-10">
        
//       //   {/* Search and Filters area - Command Center Style */}
//       //   <div className="flex flex-col lg:flex-row gap-8 items-stretch">
//       //     <div className="relative group flex-1">
//       //       <div className="absolute inset-0 bg-emerald-500/5 blur-[80px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
//       //       <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-4 z-20">
//       //          <Search className="text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500 scale-125" size={28} />
//       //          <div className="h-6 w-px bg-slate-100" />
//       //       </div>
//       //       <input
//       //         type="text"
//       //         placeholder="البحث الوطني // SEARCH_SDN"
//       //         value={searchQuery}
//       //         onChange={(e) => setSearchQuery(e.target.value)}
//       //         className="w-full pr-14 md:pr-24 pl-6 lg:pl-10 py-6 md:py-10 bg-white border border-slate-100 rounded-lg sm:rounded-xl text-xl md:text-3xl font-black focus:border-emerald-500/50 outline-none transition-all text-right shadow-2xl placeholder:text-slate-200 relative z-10 focus:bg-slate-50 font-mono italic text-slate-900 tracking-tighter"
//       //       />
//       //       <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-4 z-20">
//       //          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] font-mono italic">AI_ENHANCED_SEARCH</span>
//       //          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
//       //             <Command size={20} />
//       //          </div>
//       //       </div>
//       //     </div>
          
//       //     <button
//       //       onClick={() => setShowFilters(!showFilters)}
//       //       className={cn(
//       //         "px-10 rounded-xl flex items-center justify-center gap-4 transition-all active:scale-95 border-2 shrink-0 group relative overflow-hidden shadow-xl",
//       //         showFilters ? "bg-emerald-600 border-emerald-500 text-white" : "bg-white border-slate-100 text-slate-400 hover:border-emerald-500 hover:text-emerald-600"
//       //       )}
//       //     >
//       //       <span className="text-[11px] font-black uppercase tracking-[0.4em] italic">{showFilters ? 'إخفاء الفلاتر' : 'تخصيص'}</span>
//       //       <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all border", showFilters ? "bg-white/20 border-white/20" : "bg-slate-50 border-slate-100 group-hover:bg-emerald-600 group-hover:text-white")}>
//       //          <Filter size={20} className={cn("transition-transform duration-500", showFilters && "rotate-180")} />
//       //       </div>
//       //     </button>
//       //   </div>

//       //   <AnimatePresence>
//       //     {showFilters && (
//       //       <motion.div
//       //         initial={{ opacity: 0, scale: 0.98, y: -20 }}
//       //         animate={{ opacity: 1, scale: 1, y: 0 }}
//       //         exit={{ opacity: 0, scale: 0.98, y: -20 }}
//       //         className="bg-white p-8 rounded-xl border border-slate-100 mb-8 space-y-10 shadow-2xl"
//       //       >
//       //         <div className="flex flex-col xl:flex-row gap-12 items-stretch">
//       //           {/* Institution Filters */}
//       //           <div className="flex-1 space-y-6">
//       //             <div className="flex items-center justify-between px-6">
//       //                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] text-right font-mono italic">المؤسسة // SECTOR</p>
//       //                <Building size={16} className="text-slate-300" />
//       //             </div>
//       //             <div className="flex gap-3 overflow-x-auto p-2 no-scrollbar scroll-smooth">
//       //               {[
//       //                 { id: 'all', name: 'قاعدة البيانات العامة' },
//       //                 { id: 'unassigned', name: 'بلاغات قيد التوجيه' },
//       //                 ...INSTITUTIONS.map(inst => ({ id: inst.id, name: inst.fullName }))
//       //               ].map((item) => (
//       //                 <button
//       //                   key={item.id}
//       //                   onClick={() => setSelectedInstitutionFilter(item.id)}
//       //                   className={cn(
//       //                     "px-10 py-5 rounded-lg whitespace-nowrap text-[11px] font-black transition-all border shrink-0 uppercase tracking-widest italic",
//       //                     selectedInstitutionFilter === item.id
//       //                       ? "bg-emerald-600 border-emerald-500 text-white shadow-xl scale-105"
//       //                       : "bg-slate-50 border-slate-100 text-slate-400 hover:border-emerald-500 hover:bg-white hover:text-emerald-600"
//       //                   )}
//       //                   dir="rtl"
//       //                 >
//       //                   {item.name}
//       //                 </button>
//       //               ))}
//       //             </div>
//       //           </div>

//       //           <div className="flex flex-col md:flex-row gap-10">
//       //              {/* Sorting Controls */}
//       //              <div className="w-full md:w-72 space-y-6">
//       //                <div className="flex items-center justify-between px-6">
//       //                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] text-right font-mono italic">الترتيب // SORT</p>
//       //                   <TrendingUp size={16} className="text-slate-300" />
//       //                </div>
//       //                <div className="flex gap-3 h-16">
//       //                  <button
//       //                    onClick={() => setSortBy(sortBy === 'date' ? 'status' : 'date')}
//       //                    className="flex-1 px-8 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-black text-slate-500 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-between group"
//       //                  >
//       //                    <span className="opacity-60 uppercase tracking-widest italic font-mono">{sortBy === 'date' ? 'الزمن' : 'الحالة'}</span>
//       //                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
//       //                      <History size={16} />
//       //                    </div>
//       //                  </button>
//       //                  <button
//       //                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
//       //                    className="w-16 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-all group shadow-sm"
//       //                  >
//       //                    <MoreVertical size={20} className={cn("transition-transform duration-700", sortOrder === 'asc' && "rotate-180")} />
//       //                  </button>
//       //                </div>
//       //              </div>

//       //              {/* Source Filter */}
//       //              <div className="w-full md:w-64 space-y-6">
//       //                <div className="flex items-center justify-between px-6">
//       //                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] text-right font-mono italic">المصدر // SOURCE</p>
//       //                   <Globe size={16} className="text-slate-300" />
//       //                </div>
//       //                <button
//       //                  onClick={() => setCitizenOnly(!citizenOnly)}
//       //                  className={cn(
//       //                    "w-full h-16 px-8 rounded-lg text-[11px] font-black uppercase tracking-[0.4em] transition-all border flex items-center justify-between gap-6 italic",
//       //                    citizenOnly
//       //                     ? "bg-emerald-600 border-emerald-500 text-white shadow-xl"
//       //                     : "bg-slate-50 border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-500"
//       //                  )}
//       //                >
//       //                  <span>بلاغات المواطنين</span>
//       //                  {citizenOnly ? (
//       //                     <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center shadow-sm">
//       //                        <Check size={18} />
//       //                     </div>
//       //                  ) : (
//       //                     <div className="w-8 h-8 rounded-xl border-2 border-slate-200 bg-white shadow-sm" />
//       //                  )}
//       //                </button>
//       //              </div>
//       //           </div>
//       //         </div>
//       //       </motion.div>
//       //     )}
//       //   </AnimatePresence>

//       //   <AnimatePresence>
//       //     {loading && (
//       //       <motion.div
//       //         initial={{ opacity: 0 }}
//       //         animate={{ opacity: 1 }}
//       //         exit={{ opacity: 0 }}
//       //         className="absolute inset-0 z-50 bg-white/20 backdrop-blur-[2px] pointer-events-none overflow-hidden"
//       //       >
//       //         <motion.div
//       //           animate={{ top: ['-20%', '120%'] }}
//       //           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
//       //           className="absolute inset-x-0 h-[30%] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent -skew-y-12"
//       //         />
//       //       </motion.div>
//       //     )}
//       //   </AnimatePresence>

//       //   <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
//       //     {/* Map Column (Left/Primary) */}
//       //     <div className="lg:col-span-12 xl:col-span-8 order-1 sticky top-6">
//       //       <div
//       //         className="h-[400px] md:h-[500px] lg:h-[600px] xl:h-[750px] relative rounded-xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-4 border-white/5 group"
//       //       >
//       //         {/* National Brand Accent */}
//       //         <div className="absolute top-0 left-0 w-full h-1 flex">
//       //            <div className="flex-1 bg-brand-red" />
//       //            <div className="flex-1 bg-white" />
//       //            <div className="flex-1 bg-slate-50" />
//       //            <div className="flex-1 bg-emerald-500" />
//       //         </div>
              
//       //         {/* Mission Control Labels */}
//       //         <div className="absolute top-10 right-10 z-30 pointer-events-none">
//       //            <div className="bg-white/80 backdrop-blur-3xl border border-slate-100 p-6 rounded-[2.5rem] flex items-center gap-6 shadow-2xl">
//       //               <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_#10b981]" />
//       //               <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.4em] font-mono italic">بث حي // مركز المعلومات الرئيسي // {new Date().toLocaleTimeString('ar-SD')}</span>
//       //            </div>
//       //         </div>

//       //         {error && (
//       //           <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-xl p-8 text-center" dir="rtl">
//       //             <div className="max-w-md space-y-8">
//       //               <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl border border-rose-500/20">
//       //                 <AlertTriangle size={48} />
//       //               </div>
//       //               <div className="space-y-4">
//       //                  <h3 className="text-3xl font-black text-slate-900 font-display italic tracking-tighter">خطأ في الاتصال // SYS_ERR</h3>
//       //                  <p className="text-slate-400 font-medium font-sans leading-relaxed">{error}</p>
//       //               </div>
//       //               <button
//       //                 onClick={() => window.location.reload()}
//       //                 className="px-10 py-4 bg-emerald-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all hover:bg-emerald-500"
//       //               >
//       //                 إعادة المحاولة // REBOOT
//       //               </button>
//       //             </div>
//       //           </div>
//       //         )}

//       //         <div ref={mapRef} className={cn("w-full h-full", mapError && "hidden")} />
              
//       //         {/* Tactical Command Overlay */}
//       //         {!mapError && isMapLoaded && (
//       //           <div className="absolute inset-0 pointer-events-none z-20">
//       //             {/* Subtle Grid Overlay */}
//       //             <div className="absolute inset-0 opacity-[0.05] tech-grid-unified" />
                  
//       //             {/* Digital Vignette - Softened for light mode */}
//       //             <div className="absolute inset-0 shadow-[inset_0_0_300px_rgba(0,0,0,0.05)]" />

//       //             {/* Corner Markers - Command Style */}
//       //             <div className="absolute top-10 left-10 w-16 h-16 border-t-4 border-l-4 border-white/10 rounded-tl-3xl" />
//       //             <div className="absolute bottom-10 right-10 w-16 h-16 border-b-4 border-r-4 border-white/10 rounded-br-3xl" />

//       //             {/* Left Sidebar Info - Mission HUD */}
//       //             <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col gap-6 pointer-events-auto">
//       //               {[
//       //                 { icon: <SignalHigh size={20} />, label: 'NET_STRENGTH', value: 'OPTIMAL', color: 'text-emerald-500' },
//       //                 { icon: <Grid size={20} />, label: 'GRID_RESOLUTION', value: '450m', color: 'text-blue-500' },
//       //                 { icon: <ShieldCheck size={20} />, label: 'ENCRYPTION', value: 'ACTIVE', color: 'text-amber-500' },
//       //               ].map((item, i) => (
//       //                 <motion.div
//       //                   initial={{ opacity: 0, x: -20 }}
//       //                   animate={{ opacity: 1, x: 0 }}
//       //                   transition={{ delay: 0.5 + (i * 0.1) }}
//       //                   key={item.label}
//       //                   className="bg-white/80 backdrop-blur-3xl border border-slate-100 p-5 rounded-[2.5rem] shadow-xl flex items-center gap-5 group cursor-help hover:scale-110 transition-all border-l-4 border-l-emerald-500/50"
//       //                 >
//       //                    <div className={cn("w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center transition-all group-hover:bg-emerald-600 group-hover:text-white shadow-sm border border-slate-100", item.color)}>
//       //                       {item.icon}
//       //                    </div>
//       //                    <div className="pr-2">
//       //                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none mb-1 font-mono italic">{item.label}</p>
//       //                       <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none font-mono">{item.value}</p>
//       //                    </div>
//       //                 </motion.div>
//       //               ))}
//       //             </div>

//       //             {/* Bottom Command Strip */}
//       //             <div className="absolute bottom-10 inset-x-10 flex items-end justify-between">
//       //                <div className="flex gap-4 pointer-events-auto">
//       //                   <button
//       //                     onClick={resetMap}
//       //                     className="bg-white/80 backdrop-blur-3xl border border-slate-100 p-6 rounded-[2.5rem] text-slate-400 hover:bg-emerald-600 hover:text-white transition-all shadow-xl group active:scale-95"
//       //                     title="إعادة تعيين المشهد"
//       //                   >
//       //                      <History size={28} className="group-hover:rotate-[-90deg] transition-transform duration-700" />
//       //                   </button>
//       //                   <div className="bg-white/80 backdrop-blur-3xl border border-slate-100 p-2 rounded-[2.5rem] flex flex-col gap-2 shadow-xl">
//       //                      <button className="w-14 h-14 rounded-2xl bg-slate-50 hover:bg-emerald-600 text-slate-400 hover:text-white transition-all flex items-center justify-center font-black text-xl shadow-sm border border-slate-100 hover:border-emerald-500">＋</button>
//       //                      <div className="h-px bg-slate-100 mx-2" />
//       //                      <button className="w-14 h-14 rounded-2xl bg-slate-50 hover:bg-emerald-600 text-slate-400 hover:text-white transition-all flex items-center justify-center font-black text-xl shadow-sm border border-slate-100 hover:border-emerald-500">－</button>
//       //                   </div>
//       //                </div>

//       //                <div className="flex items-center gap-8 bg-white/90 backdrop-blur-3xl border border-slate-100 p-6 pr-12 rounded-[3rem] shadow-2xl text-right">
//       //                   <div className="space-y-1">
//       //                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.5em] mb-1 font-mono italic">MAP_ANALYTICS // SDN</p>
//       //                      <h4 className="text-2xl font-black text-slate-900 italic font-display tracking-tight">ولاية الخرطوم</h4>
//       //                      <div className="flex gap-2 items-center justify-end">
//       //                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">{filteredIssues.length} بلاغات نشطة</span>
//       //                         <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse" />
//       //                      </div>
//       //                   </div>
//       //                   <div className="h-16 w-px bg-slate-100" />
//       //                   <div className="text-[12px] font-black text-slate-200 uppercase tracking-[0.6em] font-mono italic">KRT_CMD</div>
//       //                </div>
//       //             </div>

//       //   {/* Active Marker HUD (When an issue is focused on map) */}
//       //   <AnimatePresence>
//       //     {activeMarkerIssue && (
//       //       <motion.div
//       //         initial={{ opacity: 0, scale: 0.9, y: 30 }}
//       //         animate={{ opacity: 1, scale: 1, y: 0 }}
//       //         exit={{ opacity: 0, scale: 0.9, y: 30 }}
//       //         className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none flex justify-center z-50 px-10"
//       //       >
//       //          <div className="max-w-2xl w-full bg-white/95 backdrop-blur-3xl border-4 border-emerald-500/50 p-12 rounded-[4rem] shadow-2xl pointer-events-auto relative overflow-hidden group">
//       //             <div className="absolute inset-0 sudan-pattern-modern opacity-[0.01] pointer-events-none scale-150 rotate-3" />
//       //             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-blue-500" />
                  
//       //             <div className="flex items-start justify-between mb-10 flex-row-reverse relative z-10">
//       //                <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-600 shadow-xl group-hover:scale-110 transition-transform duration-700">
//       //                   {getIssueIcon(activeMarkerIssue.type, 40)}
//       //                 </div>
//       //                <button
//       //                  onClick={() => setActiveMarkerIssue(null)}
//       //                  className="w-14 h-14 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white transition-all shadow-sm"
//       //                >
//       //                   <X size={24} />
//       //                </button>
//       //             </div>

//       //             <div className="space-y-8 relative z-10">
//       //                <div className="flex items-center gap-4 justify-end">
//       //                   <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">{formatTimeAgo(activeMarkerIssue.createdAt)}</span>
//       //                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
//       //                   <span className="text-[11px] font-black text-emerald-600 tracking-[0.5em] uppercase font-mono italic">{activeMarkerIssue.trackingId}</span>
//       //                </div>
//       //                <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight italic font-display text-right">{activeMarkerIssue.description}</h3>
                     
//       //                <div className="flex gap-6 pt-10">
//       //                   <button
//       //                     onClick={() => setSelectedIssue(activeMarkerIssue)}
//       //                     className="flex-1 py-7 bg-emerald-600 text-white rounded-[3rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all shadow-xl active:scale-95 italic"
//       //                   >
//       //                     معالجة البلاغ // MANAGE_REPORT
//       //                   </button>
//       //                   <button
//       //                     className="w-24 h-24 rounded-[3rem] border-2 border-slate-100 bg-slate-50 flex items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-400 transition-all shadow-sm"
//       //                   >
//       //                     <Share2 size={28} />
//       //                   </button>
//       //                </div>
//       //             </div>
//       //          </div>
//       //       </motion.div>
//       //     )}
//       //   </AnimatePresence>
//       //           </div>
//       //         )}

              
//       //         {mapError && (
//       //           <div className="absolute inset-0 z-40 bg-slate-100 flex flex-col">
//       //             {/* Warning Toast for API errors - More Integrated & Helpful */}
//       //             {mapError === 'ApiProjectMapError' && (
//       //               <motion.div
//       //                 initial={{ y: -100, opacity: 0 }}
//       //                 animate={{ y: 0, opacity: 1 }}
//       //                 className="absolute top-10 left-1/2 -translate-x-1/2 z-[1000] w-[95%] max-w-2xl bg-white text-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden"
//       //               >
//       //                 <div className="absolute inset-0 sudan-pattern-modern opacity-5 pointer-events-none" />
//       //                 <div className="flex flex-col md:flex-row items-center gap-6 text-right relative z-10" dir="rtl">
//       //                   <div className="w-16 h-16 bg-amber-500 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
//       //                     <AlertTriangle size={32} className="text-slate-950" />
//       //                   </div>
//       //                   <div className="flex-1">
//       //                     <div className="flex items-center gap-3 mb-2">
//       //                       <span className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-500/20">System_Optimization_Required</span>
//       //                       <h4 className="font-black text-lg tracking-tight font-display">تفعيل محرك الخرائط المتقدم</h4>
//       //                     </div>
//       //                     <p className="text-xs font-medium text-slate-400 leading-relaxed font-sans">
//       //                       تم تفعيل <span className="text-emerald-400 font-bold">الوضع الاحتياطي (OpenStreetMap)</span>. لتفعيل الخرائط المتقدمة من جوجل، يرجى التأكد من تفعيل "Maps JavaScript API" في حسابك، أو متابعة العمل في هذا الوضع.
//       //                     </p>
//       //                     <div className="mt-6 flex flex-wrap gap-4">
//       //                       <a
//       //                         href="https://console.cloud.google.com/google/maps-apis/api-list"
//       //                         target="_blank"
//       //                         rel="noopener noreferrer"
//       //                         className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-2"
//       //                       >
//       //                         <ArrowUpRight size={14} />
//       //                         تفعيل من Google Console
//       //                       </a>
//       //                       <button
//       //                         onClick={() => setMapError('using_fallback')}
//       //                         className="px-6 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100"
//       //                       >
//       //                         متابعة في الوضع الحالي
//       //                       </button>
//       //                     </div>
//       //                   </div>
//       //                 </div>
//       //               </motion.div>
//       //             )}

//       //             {mapError === 'missing_key' && (
//       //               <div className="absolute inset-0 z-[1000] flex items-center justify-center p-10 bg-white/60 backdrop-blur-md">
//       //                  <div className="max-w-md w-full bg-white rounded-[4rem] p-12 text-center shadow-2xl relative overflow-hidden" dir="rtl">
//       //                     <div className="absolute inset-0 sudan-pattern-modern opacity-5 pointer-events-none" />
//       //                     <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
//       //                        <MapIcon size={48} />
//       //                     </div>
//       //                     <h3 className="text-3xl font-black text-slate-950 mb-4 font-display">تهيئة الخرائط الوطنية</h3>
//       //                     <p className="text-slate-500 font-medium leading-relaxed mb-10">
//       //                       يرجى إضافة مفتاح Google Maps في إعدادات التطبيق لتفعيل العرض المتقدم، أو البدء باستخدام الخرائط المفتوحة حالياً.
//       //                     </p>
//       //                     <button
//       //                       onClick={() => setMapError('using_fallback')}
//       //                       className="w-full py-5 bg-emerald-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl active:scale-95"
//       //                     >
//       //                       موافق، استمر في العرض البديل
//       //                     </button>
//       //                  </div>
//       //               </div>
//       //             )}

//       //             {/* Fallback to Leaflet */}
//       //             <MapContainer
//       //               center={[15.5007, 32.5599]}
//       //               zoom={12}
//       //               style={{ height: '100%', width: '100%' }}
//       //               zoomControl={false}
//       //             >
//       //               <TileLayer
//       //                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//       //                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       //               />
//       //               <MarkerClusterGroup
//       //                 chunkedLoading
//       //                 maxClusterRadius={50}
//       //                 showCoverageOnHover={false}
//       //               >
//       //                 {filteredIssues.map((issue) => (
//       //                   <LeafletMarker
//       //                     key={issue.id}
//       //                     position={[issue.location.lat, issue.location.lng]}
//       //                     eventHandlers={{
//       //                       click: () => handleMarkerClick(issue),
//       //                     }}
//       //                   >
//       //                     <Popup>
//       //                       <div className="text-right font-black text-xs leading-tight">
//       //                         {issue.trackingId}<br/>
//       //                         {issue.type}
//       //                       </div>
//       //                     </Popup>
//       //                   </LeafletMarker>
//       //                 ))}
//       //               </MarkerClusterGroup>
//       //             </MapContainer>
//       //           </div>
//       //         )}

//       //         {loading && !mapError && (
//       //           <MapSkeleton />
//       //         )}

//       //         {/* Marker Popup Info Card */}
//       //         <AnimatePresence>
//       //           {activeMarkerIssue && (
//       //             <motion.div
//       //               initial={{ opacity: 0, scale: 0.85, y: 20, filter: 'blur(10px)' }}
//       //               animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
//       //               exit={{ opacity: 0, scale: 0.85, y: 20, filter: 'blur(10px)' }}
//       //               transition={{ type: 'spring', damping: 25, stiffness: 300 }}
//       //               className="absolute bottom-6 left-6 right-6 p-5 glass-card shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-30 border border-white/50"
//       //               onClick={(e) => e.stopPropagation()}
//       //             >
//       //               <div className="flex justify-between items-start mb-4">
//       //                 <div className="flex items-center gap-4">
//       //                   <div className={cn(
//       //                     "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-sm",
//       //                     activeMarkerIssue.severity === 3
//       //                       ? "bg-red-50 border-red-100 text-red-500"
//       //                       : "bg-emerald-50 border-emerald-100 text-emerald-500"
//       //                   )}>
//       //                     {getIssueIcon(activeMarkerIssue.type, 24)}
//       //                   </div>
//       //                   <div>
//       //                     <div className="flex items-center gap-2 mb-1 text-right">
//       //                       <h4 className="font-black text-slate-900 text-sm leading-tight font-display tracking-tight">
//       //                         {activeMarkerIssue.type === 'road' ? 'بلاغ طرق' :
//       //                         activeMarkerIssue.type === 'water' ? 'بلاغ مياه' :
//       //                         activeMarkerIssue.type === 'electricity' ? 'بلاغ كهرباء' : 'بلاغ نفايات'}
//       //                       </h4>
//       //                       <span className="px-1.5 py-0.5 bg-slate-100 text-slate-900 rounded-md text-[8px] font-black uppercase tracking-widest">
//       //                         {activeMarkerIssue.trackingId}
//       //                       </span>
//       //                     </div>
//       //                     <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest text-right">
//       //                       {activeMarkerIssue.location.address || 'موقع قيد المراجعة'}
//       //                     </p>
//       //                   </div>
//       //                 </div>
//       //                 <button
//       //                   onClick={() => setActiveMarkerIssue(null)}
//       //                   className="p-2 transition-colors rounded-full hover:bg-slate-100 text-slate-400"
//       //                 >
//       //                   <X size={18} />
//       //                 </button>
//       //               </div>

//       //               <p className="text-sm text-slate-600 line-clamp-2 mb-5 text-right font-medium leading-relaxed">
//       //                 {activeMarkerIssue.description}
//       //               </p>

//       //               <button
//       //                 onClick={() => {
//       //                   setSelectedIssue(activeMarkerIssue);
//       //                   setActiveMarkerIssue(null);
//       //                 }}
//       //                 className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
//       //               >
//       //                 <MapPin size={16} />
//       //                 <span>عرض التفاصيل والتحليلات</span>
//       //               </button>
//       //             </motion.div>
//       //           )}
//       //         </AnimatePresence>
//       //       </div>
//       //     </div>

//       //     {/* Activity/Content Column (Right) */}
//       //     <div className="lg:col-span-12 xl:col-span-4 order-2 space-y-8 min-h-[500px]">
//       //       {/* Tab Navigation Mini - Premium hardware style */}
//       //       <div className="flex gap-1.5 p-1.5 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 sticky top-4 z-40 mb-8 mx-2 overflow-x-auto no-scrollbar shadow-2xl">
//       //         {( (role === 'official' ? ['workstation', 'activity', 'archive', 'alerts', 'payments', 'compete'] : ['activity', 'archive', 'alerts', 'payments', 'compete']) as DashboardTab[]).map((tab) => (
//       //           <button
//       //             key={tab}
//       //             onClick={() => setActiveTab(tab)}
//       //             className={cn(
//       //               "relative flex-1 py-4 sm:py-5 min-w-[3.5rem] rounded-[2rem] flex items-center justify-center gap-2 sm:gap-3 transition-all duration-700 overflow-hidden shrink-0 lg:shrink",
//       //               activeTab === tab ? "text-white shadow-2xl" : "text-white/20 hover:text-white hover:bg-white/5"
//       //             )}
//       //             title={tab === 'activity' ? 'الميدان' : tab === 'archive' ? 'السجل الوطني' : tab === 'alerts' ? 'التحذيرات' : tab === 'payments' ? 'المدفوعات' : 'المنافسة'}
//       //           >
//       //             {activeTab === tab && (
//       //               <motion.div
//       //                 layoutId="activeTabBg"
//       //                 className="absolute inset-0 bg-emerald-600 shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-t border-white/20"
//       //                 transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
//       //               />
//       //             )}
//       //             <div className="relative z-10 flex items-center gap-3">
//       //               {tab === 'workstation' && <ShieldCheck size={18} />}
//       //               {tab === 'activity' && <Grid size={18} />}
//       //               {tab === 'archive' && <History size={18} />}
//       //               {tab === 'alerts' && <Bell size={18} />}
//       //               {tab === 'payments' && <Wallet size={18} />}
//       //               {tab === 'compete' && <Trophy size={18} />}
//       //               <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] font-mono italic">
//       //                 {tab === 'workstation' ? 'عمل' : tab === 'activity' ? 'الميدان' : tab === 'archive' ? 'السجل' : tab === 'alerts' ? 'تنبيه' : tab === 'payments' ? 'مساهمة' : 'فخر'}
//       //               </span>
//       //             </div>
//       //           </button>
//       //         ))}
//       //       </div>

//       //       <AnimatePresence mode="wait">
//       //         {activeTab === 'workstation' && (
//       //           <motion.div
//       //             key="workstation"
//       //             initial={{ opacity: 0, x: 20 }}
//       //             animate={{ opacity: 1, x: 0 }}
//       //             exit={{ opacity: 0, x: -20 }}
//       //             className="space-y-6"
//       //           >
//       //              {/* Dedicated Official Workstation Dashboard */}
//       //              <div className="bg-white rounded-[3.5rem] p-8 border border-slate-100 shadow-2xl relative overflow-hidden">
//       //                 <div className="absolute inset-0 sudan-texture opacity-[0.03] pointer-events-none" />
//       //                 <div className="relative z-10 space-y-8">
//       //                    <div className="flex justify-between items-start">
//       //                       <div className="text-right">
//       //                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-2">CONTROL_ROOM // LIVE_FEED</p>
//       //                          <h3 className="text-3xl font-black text-slate-900 font-display italic leading-tight">وحدة التحكم في البلاغات</h3>
//       //                       </div>
//       //                       <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl">
//       //                          <ShieldCheck size={28} />
//       //                       </div>
//       //                    </div>

//       //                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//       //                       <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
//       //                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">بلاغات غير موجهة</p>
//       //                          <p className="text-3xl font-black text-slate-900 font-mono tracking-tighter">{issues.filter(i => !i.assignedInstitution).length}</p>
//       //                       </div>
//       //                       <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
//       //                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">بلاغات قيد التنفيذ</p>
//       //                          <p className="text-3xl font-black text-slate-900 font-mono tracking-tighter">{issues.filter(i => i.status === 'in-progress').length}</p>
//       //                       </div>
//       //                       <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
//       //                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">معدل الاستجابة</p>
//       //                          <p className="text-3xl font-black text-emerald-600 font-mono tracking-tighter">٨٨٪</p>
//       //                       </div>
//       //                    </div>

//       //                    <div className="space-y-4">
//       //                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] pr-2">البلاغات الحرجة (تحتاج تعيين) //</p>
//       //                       <div className="space-y-3">
//       //                          {issues.filter(i => !i.assignedInstitution).slice(0, 3).map((issue) => (
//       //                            <motion.button
//       //                              key={issue.id}
//       //                              onClick={() => setSelectedIssue(issue)}
//       //                              className="w-full text-right p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-emerald-50 hover:border-emerald-500/30 transition-all flex items-center gap-6 group"
//       //                            >
//       //                               <div className={cn(
//       //                                 "w-14 h-14 rounded-xl flex items-center justify-center border-2 border-white/5 shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-6",
//       //                                 issue.severity === 3 ? "bg-rose-500/20 text-rose-400" : "bg-blue-500/20 text-blue-400"
//       //                               )}>
//       //                                  <MapPin size={28} />
//       //                               </div>
//       //                               <div className="flex-1 min-w-0">
//       //                                  <div className="flex justify-between items-center mb-1">
//       //                                     <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-black tracking-widest font-mono italic">#{issue.trackingId}</span>
//       //                                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono">NEW_REPORT</span>
//       //                                  </div>
//       //                                  <h4 className="text-lg font-black text-white tracking-tight truncate">{issue.description}</h4>
//       //                                  <p className="text-[8px] font-black text-slate-500 truncate uppercase tracking-widest mt-1">{issue.location.address}</p>
//       //                               </div>
//       //                               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
//       //                                  <ArrowRight size={20} className="rotate-180" />
//       //                               </div>
//       //                            </motion.button>
//       //                          ))}
//       //                       </div>
//       //                       {issues.filter(i => !i.assignedInstitution).length > 3 && (
//       //                          <button className="w-full py-4 text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em] hover:bg-white/5 rounded-xl transition-all">عرض كافة البلاغات المعلقة //</button>
//       //                       )}
//       //                    </div>
//       //                 </div>
//       //              </div>
//       //           </motion.div>
//       //         )}
//       //         {activeTab === 'activity' && (
//       //           <motion.div
//       //             key="activity"
//       //             initial={{ opacity: 0, x: 20 }}
//       //             animate={{ opacity: 1, x: 0 }}
//       //             exit={{ opacity: 0, x: -20 }}
//       //             className="space-y-8"
//       //           >
//       //             <div className="flex justify-between items-center px-6 mb-2">
//       //               <h3 className="text-[12px] font-black text-white/20 uppercase tracking-[0.5em] text-right font-mono italic">FEED_SYNC // {filteredIssues.length}_OBJ</h3>
//       //               <div className="flex items-center gap-2">
//       //                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
//       //                  <span className="text-[10px] font-black text-emerald-400 font-mono italic tracking-widest uppercase">تغطية وطنية</span>
//       //               </div>
//       //             </div>

//       //               <div
//       //                 ref={listContainerRef}
//       //                 onScroll={handleScroll}
//       //                 className="space-y-8 max-h-[1200px] overflow-y-auto no-scrollbar pr-3 -mr-3 pb-32"
//       //               >
//       //                 {filteredIssues.map((issue, idx) => {
//       //                   return (
//       //                     <motion.div
//       //                       key={issue.id}
//       //                       initial={{ opacity: 0, y: 30 }}
//       //                       animate={{ opacity: 1, y: 0 }}
//       //                       transition={{
//       //                         delay: (idx % 10) * 0.05,
//       //                         duration: 0.7,
//       //                         ease: "easeOut"
//       //                       }}
//       //                       onClick={() => setSelectedIssue(issue)}
//       //                       className="group cursor-pointer bg-slate-50 border border-slate-100 p-6 lg:p-8 rounded-[2.5rem] hover:border-emerald-500/30 hover:bg-white transition-all duration-700 active:scale-[0.97] relative overflow-hidden flex flex-col gap-6 shadow-sm"
//       //                     >
//       //                       {/* Tactical HUD Accents */}
//       //                       <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-500/10 rounded-tr-[2rem] group-hover:border-emerald-500/50 transition-colors" />
//       //                       <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-500/10 rounded-bl-[2rem] group-hover:border-emerald-500/50 transition-colors" />
                            
//       //                       {/* Premium Highlight Overlay */}
//       //                       <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
//       //                       <div className="absolute top-1/2 -right-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-1000" />
                            
//       //                       <div className="flex justify-between items-start flex-row-reverse relative z-10">
//       //                          <div className="relative group/icon shrink-0">
//       //                            <div className={cn(
//       //                              "w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl transition-all duration-700 group-hover:rotate-[15deg] group-hover:scale-110",
//       //                              issue.severity === 3 ? "bg-rose-500/20 text-rose-500 border-rose-500/20" :
//       //                              issue.severity === 2 ? "bg-amber-500/20 text-amber-600 shadow-amber-500/10 border-amber-100" :
//       //                              "bg-emerald-500/20 text-emerald-500 border-emerald-500/20"
//       //                            )}>
//       //                              {getIssueIcon(issue.type, 24)}
//       //                            </div>
//       //                            {issue.severity === 3 && (
//       //                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 border-2 border-brand-dark rounded-full animate-pulse shadow-[0_0_15px_#f43f5e]" />
//       //                            )}
//       //                          </div>
//       //                          <div className="text-right flex-1 pr-6">
//       //                           <div className="flex items-center gap-3 justify-end mb-2">
//       //                              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-white/30 font-mono tracking-[0.3em] uppercase italic">DATA_NODE // {issue.regionId?.toUpperCase() || 'GLOBAL'}</span>
//       //                              <p className="text-[10px] font-black font-mono text-emerald-500 tracking-widest italic leading-none">#SDN_{issue.trackingId}</p>
//       //                           </div>
//       //                           <h4 className="text-xl lg:text-2xl font-black text-white leading-tight group-hover:text-emerald-400 transition-colors mb-2 italic font-display tracking-tight">
//       //                             {issue.type === 'road' ? 'تأهيل البنية التحتية للطرق' :
//       //                              issue.type === 'water' ? 'تأمين الموارد المائية' :
//       //                              issue.type === 'electricity' ? 'معالجة الشبكة الكهربائية' : 'خدمات الإصحاح البيئي'}
//       //                           </h4>
//       //                          </div>
//       //                       </div>

//       //                       <p className="text-xs lg:text-sm font-medium text-white/40 leading-relaxed text-right line-clamp-2 pr-6 border-r-2 border-white/5 group-hover:border-emerald-500 group-hover:text-white/70 transition-all relative z-10 italic">
//       //                          {issue.description || issue.location.address}
//       //                       </p>

//       //                       <div className="flex justify-between items-center flex-row-reverse border-t border-white/5 pt-6 relative z-10 mt-2">
//       //                          <div className="flex items-center gap-4">
//       //                             <div className="flex flex-col items-end">
//       //                                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] font-mono leading-none mb-1">LOCATION_REF</span>
//       //                                <span className="text-[11px] font-black text-white font-accent tracking-tighter truncate max-w-[150px] italic">{issue.location.address || 'موقع قيد التدقيق'}</span>
//       //                             </div>
//       //                             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 shadow-2xl flex items-center justify-center text-white/20 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all duration-700">
//       //                                <MapPin size={18} />
//       //                             </div>
//       //                          </div>
//       //                          <div className="flex items-center gap-6">
//       //                             <div className="flex flex-col items-start pr-6 border-r border-white/5">
//       //                                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] font-mono leading-none mb-1">TIMESTAMP</span>
//       //                                <span className="text-[10px] font-black text-emerald-500 font-mono italic tracking-[0.1em]">{issue.createdAt ? formatTimeAgo(typeof issue.createdAt === 'number' ? issue.createdAt : (issue.createdAt as any).seconds * 1000) : 'مُنذ لحظة'}</span>
//       //                             </div>
//       //                             <div className="flex -space-x-3 flex-row-reverse">
//       //                                {[1, 2].map(i => (
//       //                                  <div key={i} className="w-9 h-9 rounded-full bg-brand-dark border border-white/10 flex items-center justify-center text-white/20 relative z-10 group-hover:border-emerald-500/50 transition-all shadow-2xl">
//       //                                     <Building size={14} />
//       //                                  </div>
//       //                                ))}
//       //                                <div className="w-9 h-9 rounded-full bg-emerald-600 border border-white/20 flex items-center justify-center text-[10px] font-black text-white relative z-20 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
//       //                                  <Activity size={16} />
//       //                                </div>
//       //                             </div>
//       //                          </div>
//       //                       </div>

//       //                       {/* Status Indicator Bar - Tech Meter Style */}
//       //                       <div className="absolute bottom-0 left-0 h-1.5 bg-white/5 w-full overflow-hidden">
//       //                          <motion.div
//       //                            initial={{ width: 0 }}
//       //                            animate={{ width: issue.status === 'resolved' ? '100%' : '40%' }}
//       //                            className={cn(
//       //                              "h-full transition-all duration-[2s] relative shadow-[0_0_15px_currentColor]",
//       //                              issue.status === 'resolved' ? "bg-emerald-500" : "bg-brand-accent/50"
//       //                            )}
//       //                          >
//       //                             <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
//       //                          </motion.div>
//       //                       </div>
//       //                     </motion.div>
//       //                   );
//       //                 })}

//       //                 {loadingMore && (
//       //                   <div className="flex justify-center py-16">
//       //                     <div className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-full shadow-2xl backdrop-blur-3xl">
//       //                       <Loader2 className="animate-spin text-emerald-500" size={20} />
//       //                       <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20 font-mono italic">تحميل البيانات // SYNCING...</span>
//       //                     </div>
//       //                   </div>
//       //                 )}
//       //               </div>
//       //             </motion.div>
//       //           )}

//       //           {activeTab === 'alerts' && <AlertsList />}
//       //           {activeTab === 'payments' && <UtilityPayments />}
//       //           {activeTab === 'compete' && <RegionalCompetition />}
//       //           {activeTab === 'archive' && (
//       //             <div className="text-center py-32 bg-white/5 rounded-[4rem] border-2 border-dashed border-white/10 shadow-2xl backdrop-blur-3xl">
//       //                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/10 text-white/20">
//       //                   <History size={48} />
//       //                </div>
//       //                <p className="text-[12px] font-black text-white/30 uppercase tracking-[0.5em] font-mono italic">الأرشفة الوطنية قيد التهيئة // ARCHIVE_INIT</p>
//       //             </div>
//       //           )}
//       //         </AnimatePresence>
//       //       </div>
//       //     </div>
// //   </div>
      



//         //  <div className="flex gap-10 overflow-x-auto pb-10 no-scrollbar scroll-smooth snap-x">
//         //    {INSTITUTIONS.map((inst, index) => (
//         //     <motion.div 
//         //       key={inst.id}
//         //       whileHover={{ y: -12, scale: 1.05 }}
//         //       whileTap={{ scale: 0.95 }}
//         //       onClick={() => setViewingInstitution(inst)}
//         //       className="shrink-0 flex flex-col items-center gap-6 group cursor-pointer snap-center"
//         //       title={inst.fullName}
//         //     >
//         //       <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-[3rem] bg-white border border-slate-100 flex items-center justify-center overflow-hidden transition-all duration-700 group-hover:border-emerald-500/50 shadow-xl group-hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] relative">
//         //          {/* Rank Badge */}
//         //          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xl z-20 opacity-0 group-hover:opacity-100 transition-all duration-500">
//         //            #{index + 1}
//         //          </div>
//         //          {inst.logo ? (
//         //           <img 
//         //             src={inst.logo} 
//         //             alt={inst.name} 
//         //             className="w-full h-full object-cover p-3 transition-transform duration-1000 group-hover:scale-125 group-hover:rotate-6 opacity-80 group-hover:opacity-100" 
//         //             referrerPolicy="no-referrer"
//         //           />
//         //         ) : (
//         //           <Building className="text-slate-200" size={40} />
//         //         )}
//         //       </div>
//         //       <div className="text-center">
//         //         <span className="text-[11px] font-black text-slate-900 block mb-1.5 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{inst.name}</span>
//         //         <span className={cn(
//         //           "text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border italic",
//         //           inst.type !== 'partner' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
//         //         )}>{inst.type !== 'partner' ? 'حكومي' : 'خاص'}</span>
//         //       </div>
//         //     </motion.div>
//         //   ))}
//         // </div>



// import React, { useState, useEffect, useRef } from 'react';
// import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
// import { MarkerClusterer } from "@googlemaps/markerclusterer";
// import { 
//   Search, MapPin, Filter, TrendingUp, MoreVertical, ThumbsUp, MessageSquare, Share2,
//   Activity, Loader2, AlertTriangle, WifiOff, X, Bell, Wallet, Grid, Trophy, Truck,
//   Droplets, Zap, Trash2, History, Map as MapIcon, ShieldCheck, Check, Building,
//   HelpCircle, ArrowUpRight, Phone, SignalHigh, Star, CheckCircle2, Globe, Hash,
//   Command, ArrowRight, ChevronRight, Download
// } from 'lucide-react';
// import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs, getDoc, doc, where } from 'firebase/firestore';
// import { db } from '../lib/firebase';
// import { cn, formatTimeAgo } from '../lib/utils';
// import { Issue } from '../types';
// import { INSTITUTIONS, InstitutionExtended } from '../constants';
// import IssueDetail from './IssueDetail';
// import InstitutionDetail from './InstitutionDetail';
// import AlertsList from './Alerts';
// import UtilityPayments from './Payments';
// import RegionalCompetition from './RegionalCompetition';
// import HackathonPitch from './HackathonPitch';
// import OfflineReporting from './OfflineReporting';
// import PlatformProfile from './PlatformProfile';
// import { motion, AnimatePresence } from 'motion/react';
// import { generatePitchDeck } from '../lib/pitchdeck';
// import { MapContainer, TileLayer, Marker as LeafletMarker, Popup } from 'react-leaflet';
// import MarkerClusterGroup from 'react-leaflet-cluster';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// type DashboardTab = 'activity' | 'alerts' | 'payments' | 'compete' | 'archive' | 'workstation';

// export default function Dashboard({ role = 'citizen', profile }: { role?: 'citizen' | 'official' | 'partner'; profile?: any }) {
//   const [issues, setIssues] = useState<Issue[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const listContainerRef = React.useRef<HTMLDivElement>(null);
//   const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
//   const [activeMarkerIssue, setActiveMarkerIssue] = useState<Issue | null>(null);
//   const [activeTab, setActiveTab] = useState<DashboardTab>('activity');
//   const [selectedInstitutionFilter, setSelectedInstitutionFilter] = useState<string>(role === 'official' ? 'unassigned' : 'all');
//   const [viewingInstitution, setViewingInstitution] = useState<InstitutionExtended | null>(null);
//   const [showFilters, setShowFilters] = useState(false);
//   const [showPitch, setShowPitch] = useState(false);
//   const [showPlatformProfile, setShowPlatformProfile] = useState(false);
//   const [showOfflineMode, setShowOfflineMode] = useState(false);
//   const [lastNotification, setLastNotification] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
//   const [citizenOnly, setCitizenOnly] = useState(false);
//   const [showSystemNotice, setShowSystemNotice] = useState(() => !localStorage.getItem('system_notice_dismissed'));
//   const [systemNotice] = useState("إشعار هام: بدأت أعمال الصيانة الكبرى في محطة مياه المقرن. قد يتأثر الإمداد في وسط الخرطوم.");
//   const [govAlerts, setGovAlerts] = useState<any[]>([]);
//   const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(() => {
//     const saved = localStorage.getItem('dismissed_gov_alerts');
//     return saved ? JSON.parse(saved) : [];
//   });

//   const dismissGovAlert = (id: string) => {
//     setDismissedAlertIds(prev => {
//       const next = [...prev, id];
//       localStorage.setItem('dismissed_gov_alerts', JSON.stringify(next));
//       return next;
//     });
//   };

//   useEffect(() => {
//     const q = query(collection(db, 'alerts'), where('active', '==', true), orderBy('createdAt', 'desc'));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       setGovAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     }, (err) => console.warn("Alerts listener error:", err));
//     return () => unsubscribe();
//   }, []);

//   const activeVisibleAlert = govAlerts.find(a => !dismissedAlertIds.includes(a.id));

//   const dismissNotice = () => {
//     setShowSystemNotice(false);
//     localStorage.setItem('system_notice_dismissed', 'true');
//   };

//   useEffect(() => {
//     const notifications = [
//       "تم رصد بلاغ جديد في حي الرياض",
//       "اكتمال مشروع ترميم مدرسة في بحري",
//       "سفير عمراني جديد انضم للوحة الشرف",
//     ];
//     const interval = setInterval(() => {
//       if (Math.random() > 0.7) {
//         setLastNotification(notifications[Math.floor(Math.random() * notifications.length)]);
//         setTimeout(() => setLastNotification(null), 5000);
//       }
//     }, 15000);
//     return () => clearInterval(interval);
//   }, []);

//   const [isMapLoaded, setIsMapLoaded] = useState(false);
//   const [mapError, setMapError] = useState<string | null>(null);
//   const mapRef = useRef<HTMLDivElement>(null);
//   const googleMapRef = useRef<google.maps.Map | null>(null);
//   const markersRef = useRef<google.maps.Marker[]>([]);
//   const clustererRef = useRef<MarkerClusterer | null>(null);

//   const filteredIssues = issues.filter(issue => {
//     if (selectedInstitutionFilter !== 'all') {
//       if (selectedInstitutionFilter === 'unassigned') { if (issue.assignedInstitution) return false; }
//       else if (issue.assignedInstitution !== selectedInstitutionFilter) return false;
//     }
//     if (citizenOnly && !issue.reportedByCitizen) return false;
//     if (searchQuery) {
//       const q = searchQuery.toLowerCase();
//       if (!issue.trackingId?.toLowerCase().includes(q) && !issue.description?.toLowerCase().includes(q) && !issue.type?.toLowerCase().includes(q)) return false;
//     }
//     return true;
//   }).sort((a, b) => {
//     if (sortBy === 'date') {
//       const timeA = typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt as any)?.seconds * 1000 || 0;
//       const timeB = typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt as any)?.seconds * 1000 || 0;
//       return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
//     }
//     const statusOrder = { 'pending': 0, 'verified': 1, 'in-progress': 2, 'completed': 3, 'resolved': 4 };
//     const valA = statusOrder[a.status as keyof typeof statusOrder] || 0;
//     const valB = statusOrder[b.status as keyof typeof statusOrder] || 0;
//     return sortOrder === 'desc' ? valB - valA : valA - valB;
//   });

//   const getIssueIcon = (type: string, size = 20) => {
//     switch(type) {
//       case 'road': return <Truck size={size} />;
//       case 'water': return <Droplets size={size} />;
//       case 'electricity': return <Zap size={size} />;
//       case 'waste': return <Trash2 size={size} />;
//       case 'other': return <HelpCircle size={size} />;
//       default: return <Activity size={size} />;
//     }
//   };

//   const handleMarkerClick = (issue: Issue) => {
//     if (googleMapRef.current) {
//       googleMapRef.current.setZoom(16);
//       googleMapRef.current.panTo({ lat: issue.location.lat, lng: issue.location.lng });
//     }
//     setActiveMarkerIssue(issue);
//   };

//   const resetMap = () => {
//     if (googleMapRef.current) {
//       googleMapRef.current.setZoom(12);
//       googleMapRef.current.setCenter({ lat: 15.5, lng: 32.55 });
//     }
//     setActiveMarkerIssue(null);
//   };

//   useEffect(() => {
//     (window as any).gm_authFailure = () => setMapError('ApiProjectMapError');
//     const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
//     if (!apiKey || apiKey === 'YOUR_KEY_HERE' || apiKey.trim() === '') {
//       setMapError('missing_key');
//       return;
//     }
//     setOptions({ apiKey, version: 'weekly', libraries: ['maps', 'marker'] } as any);
//     let mapInitTimeout: any;
//     const initMap = async () => {
//       mapInitTimeout = setTimeout(() => { if (!isMapLoaded && !mapError) setMapError('timeout'); }, 10000);
//       (window as any).gm_authFailure = () => { setMapError('ApiProjectMapError'); clearTimeout(mapInitTimeout); };
//       try {
//         const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;
//         await importLibrary('marker');
//         if (mapRef.current) {
//           const map = new Map(mapRef.current, {
//             center: { lat: 15.5007, lng: 32.5599 },
//             zoom: 12,
//             disableDefaultUI: true,
//             styles: [
//               { featureType: "landscape", elementType: "geometry.fill", stylers: [{ color: "#f8fafc" }] },
//               { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#e0f2fe" }] },
//               { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
//               { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
//             ],
//           });
//           googleMapRef.current = map;
//           setIsMapLoaded(true);
//           clearTimeout(mapInitTimeout);
//         }
//       } catch (err) {
//         console.error("Map init error:", err);
//         setMapError('init_error');
//         clearTimeout(mapInitTimeout);
//       }
//     };
//     initMap();
//     return () => clearTimeout(mapInitTimeout);
//   }, []);

//   const TABS: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
//     { id: 'activity', label: 'الخريطة والنشاط', icon: <MapIcon size={16} /> },
//     { id: 'alerts', label: 'التنبيهات', icon: <Bell size={16} /> },
//     { id: 'payments', label: 'المدفوعات', icon: <Wallet size={16} /> },
//     { id: 'compete', label: 'التنافس الإقليمي', icon: <Trophy size={16} /> },
//     { id: 'archive', label: 'الأرشيف', icon: <History size={16} /> },
//   ];

//   return (
//     <div className="min-h-screen bg-slate-50 relative" dir="rtl">

//       {/* System Notice Bar */}
//       <AnimatePresence>
//         {showSystemNotice && (
//           <motion.div
//             initial={{ y: -40, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: -40, opacity: 0 }}
//             className="bg-slate-900 text-white py-2.5 px-4 lg:px-8 flex items-center justify-between gap-4 relative z-[100]"
//           >
//             <div className="flex items-center gap-3 flex-1 min-w-0">
//               <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
//               <p className="text-xs font-medium text-slate-200 truncate">{systemNotice}</p>
//             </div>
//             <div className="flex items-center gap-2 shrink-0">
//               <button
//                 onClick={() => { setActiveTab('alerts'); dismissNotice(); }}
//                 className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-colors"
//               >
//                 عرض
//               </button>
//               <button onClick={dismissNotice} className="p-1 text-slate-400 hover:text-white transition-colors">
//                 <X size={14} />
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Gov Alert Banner */}
//       <AnimatePresence>
//         {activeVisibleAlert && (
//           <motion.div
//             initial={{ y: -40, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: -40, opacity: 0 }}
//             className={cn(
//               "py-3 px-4 lg:px-8 flex items-center justify-between gap-4 border-b relative z-[99]",
//               activeVisibleAlert.type === 'critical' ? "bg-rose-600 text-white border-rose-500"
//                 : activeVisibleAlert.type === 'warning' ? "bg-amber-500 text-slate-900 border-amber-400"
//                 : "bg-blue-600 text-white border-blue-500"
//             )}
//           >
//             <div className="flex items-center gap-3 flex-1 min-w-0">
//               {activeVisibleAlert.type === 'critical'
//                 ? <AlertTriangle size={18} className="shrink-0 animate-pulse" />
//                 : <Bell size={18} className="shrink-0" />
//               }
//               <p className="text-sm font-bold truncate">
//                 <span className="font-black ml-2">{activeVisibleAlert.title}:</span>
//                 {activeVisibleAlert.message}
//               </p>
//             </div>
//             <button
//               onClick={() => dismissGovAlert(activeVisibleAlert.id)}
//               className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors shrink-0"
//             >
//               <X size={16} />
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Desktop Header */}
//       <div className="hidden lg:block px-8 lg:px-16 pt-8 pb-6">
//         <div className="flex items-center justify-between bg-white rounded-2xl px-6 py-4 border border-slate-100 shadow-sm">
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl">
//               <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
//               <span className="text-[10px] font-black text-emerald-400 font-mono tracking-wider uppercase">System Online</span>
//             </div>
//             <div className="flex items-center gap-2 text-slate-500">
//               <ShieldCheck size={16} className="text-emerald-600" />
//               <span className="text-xs font-bold">Verified_Gov // SDN_AUTH_2026</span>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => setShowPlatformProfile(true)}
//               className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
//             >
//               <Star size={14} className="text-amber-500" />
//               ملف المنصة
//             </button>
//             <button
//               onClick={generatePitchDeck}
//               className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
//             >
//               <Download size={14} />
//               Pitch Deck
//             </button>
//             <div className="h-6 w-px bg-slate-200 mx-1" />
//             <span className="text-xs font-mono text-slate-400">{new Date().toLocaleTimeString('ar-SD')}</span>
//           </div>
//         </div>

//         {/* Hero */}
//         <div className="mt-6 grid grid-cols-12 gap-6">
//           <div className="col-span-7 bg-white rounded-3xl p-10 border border-slate-100 shadow-sm relative overflow-hidden">
//             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
//             <div className="relative z-10">
//               <h1 className="text-7xl font-black italic tracking-tighter font-display leading-none mb-4">
//                 عُـمْـران<span className="text-emerald-500">.</span>
//               </h1>
//               <div className="w-1 h-16 bg-emerald-500 rounded-full absolute right-0 top-0 opacity-0" />
//               <p className="text-xl font-bold text-slate-600 leading-relaxed border-r-4 border-emerald-500 pr-4 max-w-md">
//                 نحن لا نبني تطبيقاً.. نحن نبني نظام تشغيل <span className="text-emerald-600">للتعافي</span> وتجاوز الأزمات.
//               </p>
//               <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
//                 <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">Vision 2026</span>
//                 <span className="text-sm text-slate-500">البنية التحتية الرقمية لإعادة إعمار السودان</span>
//               </div>
//               <AnimatePresence>
//                 {lastNotification && (
//                   <motion.div
//                     initial={{ y: 10, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     exit={{ y: 10, opacity: 0 }}
//                     className="mt-6 flex items-center gap-3 bg-white border border-amber-100 border-r-4 border-r-amber-500 p-3 rounded-xl shadow-sm max-w-sm"
//                   >
//                     <Bell size={16} className="text-amber-500 shrink-0" />
//                     <span className="text-xs font-medium text-slate-700">{lastNotification}</span>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>

//           <div className="col-span-5 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4">
//             <div className="w-32 h-32 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center relative overflow-hidden">
//               <div className="absolute inset-0 bg-emerald-500/10 blur-2xl animate-pulse" />
//               <svg viewBox="0 0 200 250" className="w-20 h-20 text-emerald-600 opacity-20">
//                 <path d="M80,20 L130,20 L160,80 L130,230 L50,230 L20,80 Z" fill="currentColor" />
//               </svg>
//               <button
//                 onClick={() => setShowOfflineMode(true)}
//                 className="absolute inset-0 flex flex-col items-center justify-center gap-2 hover:bg-emerald-600/10 transition-colors group"
//               >
//                 <WifiOff size={32} className="text-emerald-600 group-hover:scale-110 transition-transform" />
//                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">تقرير بدون إنترنت</span>
//               </button>
//             </div>
//             <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-xl">
//               <MapPin size={16} className="text-emerald-400" />
//               <div>
//                 <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider leading-none">Core Node // KRT</p>
//                 <p className="text-sm font-bold">الخرطوم، السودان</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="px-4 lg:px-16 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
//         {[
//           { label: "البلاغات النشطة", value: "١٢", icon: Activity, color: "emerald", tag: "LIVE" },
//           { label: "المساهمات", value: "٢٤٥", icon: ThumbsUp, color: "blue", tag: "+٤٢٪" },
//           { label: "أمن النظام", value: "١٠٠٪", icon: ShieldCheck, color: "amber", tag: "SECURED" },
//           { label: "مؤشر الإعمار", value: "٨.٥", icon: Trophy, color: "rose", tag: "PRIORITY" },
//         ].map((stat, idx) => (
//           <motion.div
//             key={idx}
//             whileHover={{ y: -3 }}
//             className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm overflow-hidden relative group"
//           >
//             <div className="flex items-start justify-between mb-4">
//               <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
//                 <stat.icon size={18} />
//               </div>
//               <span className={`text-[9px] font-black text-${stat.color}-600 bg-${stat.color}-50 px-2 py-1 rounded-lg`}>{stat.tag}</span>
//             </div>
//             <p className="text-3xl font-black text-slate-900 tracking-tight font-mono">{stat.value}</p>
//             <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">{stat.label}</p>
//           </motion.div>
//         ))}
//       </div>

//       {/* Official Workstation Banner */}
//       {role === 'official' && (
//         <div className="px-4 lg:px-16 mb-6">
//           <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
//                   <ShieldCheck size={24} />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-black text-slate-900">محطة عمل المسؤول الحكومي</h3>
//                   <p className="text-sm text-slate-500">
//                     <span className="text-emerald-600 font-black">{filteredIssues.filter(i => i.status === 'pending' && !i.assignedInstitution).length} بلاغاً</span> تحتاج إلى توجيه فوري
//                   </p>
//                 </div>
//               </div>
//               <div className="flex gap-3 w-full sm:w-auto">
//                 <button
//                   onClick={() => setSelectedInstitutionFilter('unassigned')}
//                   className={cn("flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
//                     selectedInstitutionFilter === 'unassigned' ? "bg-emerald-600 text-white shadow-lg" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                   )}
//                 >
//                   بلاغات غير موجهة ({issues.filter(i => !i.assignedInstitution).length})
//                 </button>
//                 <button
//                   onClick={() => { setCitizenOnly(true); setSelectedInstitutionFilter('all'); }}
//                   className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
//                 >
//                   تدقيق المواطنين
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Tabs */}
//       <div className="px-4 lg:px-16 mb-6">
//         <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm flex overflow-x-auto gap-1 no-scrollbar">
//           {TABS.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={cn(
//                 "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
//                 activeTab === tab.id
//                   ? "bg-emerald-600 text-white shadow-sm"
//                   : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
//               )}
//             >
//               {tab.icon}
//               <span className="whitespace-nowrap">{tab.label}</span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Tab Content */}
//       <div className="px-4 lg:px-16 pb-40">
//         <AnimatePresence mode="wait">
//           {activeTab === 'activity' && (
//             <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

//               {/* Search & Filter */}
//               <div className="flex flex-col sm:flex-row gap-3 mb-6">
//                 <div className="relative flex-1">
//                   <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
//                   <input
//                     type="text"
//                     placeholder="البحث عن بلاغ أو منطقة..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-right shadow-sm placeholder:text-slate-300"
//                   />
//                 </div>
//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className={cn("flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all border",
//                     showFilters ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
//                   )}
//                 >
//                   <Filter size={16} />
//                   {showFilters ? 'إغلاق' : 'تصفية'}
//                 </button>
//               </div>

//               {/* Filters */}
//               <AnimatePresence>
//                 {showFilters && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -8 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -8 }}
//                     className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
//                   >
//                     <div>
//                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-right">المؤسسة</label>
//                       <select
//                         onChange={(e) => setSelectedInstitutionFilter(e.target.value)}
//                         className="w-full p-3 rounded-xl border border-slate-100 text-sm font-medium text-right outline-none focus:ring-2 focus:ring-emerald-500/20"
//                       >
//                         <option value="all">كافة المؤسسات</option>
//                         {INSTITUTIONS.map(inst => <option key={inst.id} value={inst.id}>{inst.fullName}</option>)}
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-right">ترتيب حسب</label>
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
//                           className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
//                         >
//                           <MoreVertical size={16} className={cn(sortOrder === 'asc' && "rotate-180")} />
//                         </button>
//                         <button
//                           onClick={() => setSortBy('date')}
//                           className="flex-1 p-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
//                         >
//                           الأحدث أولاً
//                         </button>
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-right">المصدر</label>
//                       <button
//                         onClick={() => setCitizenOnly(!citizenOnly)}
//                         className={cn("w-full p-3 rounded-xl text-sm font-medium transition-all flex justify-between items-center",
//                           citizenOnly ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
//                         )}
//                       >
//                         <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", citizenOnly ? "border-white bg-white" : "border-slate-300")}>
//                           {citizenOnly && <Check size={12} className="text-emerald-600" />}
//                         </div>
//                         بلاغات المواطنين فقط
//                       </button>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Map + Issues Grid */}
//               <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
//                 {/* Map */}
//                 <div className="xl:col-span-8 relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 h-[450px] lg:h-[600px] bg-white">
//                   <div className="absolute top-4 right-4 z-20">
//                     <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
//                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//                       <span className="text-xs font-black text-slate-900 font-mono">LIVE // {filteredIssues.length} REPORTS</span>
//                     </div>
//                   </div>

//                   {mapError ? (
//                     /* Leaflet Fallback */
//                     <MapContainer
//                       center={[15.5007, 32.5599]}
//                       zoom={12}
//                       className="w-full h-full"
//                       zoomControl={false}
//                     >
//                       <TileLayer
//                         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                         attribution='© OpenStreetMap'
//                       />
//                       <MarkerClusterGroup>
//                         {filteredIssues.filter(i => i.location?.lat && i.location?.lng).map(issue => (
//                           <LeafletMarker
//                             key={issue.id}
//                             position={[issue.location.lat, issue.location.lng]}
//                             eventHandlers={{ click: () => setSelectedIssue(issue) }}
//                           >
//                             <Popup>{issue.description || issue.location.address}</Popup>
//                           </LeafletMarker>
//                         ))}
//                       </MarkerClusterGroup>
//                     </MapContainer>
//                   ) : (
//                     <div ref={mapRef} className="w-full h-full" />
//                   )}

//                   {loading && !mapError && (
//                     <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-30">
//                       <div className="flex flex-col items-center gap-3">
//                         <Loader2 className="animate-spin text-emerald-600" size={32} />
//                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">جاري تحميل الخريطة</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Issues List */}
//                 <div className="xl:col-span-4 space-y-3 overflow-y-auto max-h-[600px] no-scrollbar">
//                   <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
//                     <h4 className="text-base font-black text-slate-900 mb-4">آخر النشاطات</h4>
//                     {loading ? (
//                       <div className="space-y-3">
//                         {[1, 2, 3].map(i => (
//                           <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
//                         ))}
//                       </div>
//                     ) : filteredIssues.length === 0 ? (
//                       <div className="py-8 text-center">
//                         <p className="text-sm text-slate-400 font-medium">لا توجد بلاغات مطابقة</p>
//                       </div>
//                     ) : (
//                       <div className="space-y-2">
//                         {filteredIssues.slice(0, 10).map((issue) => (
//                           <button
//                             key={issue.id}
//                             onClick={() => setSelectedIssue(issue)}
//                             className="w-full p-4 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-100 transition-all border border-transparent text-right group"
//                           >
//                             <div className="flex items-start gap-3">
//                               <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white",
//                                 issue.severity === 3 ? "bg-rose-500" : issue.severity === 2 ? "bg-amber-500" : "bg-emerald-600"
//                               )}>
//                                 {getIssueIcon(issue.type, 14)}
//                               </div>
//                               <div className="flex-1 min-w-0">
//                                 <div className="flex items-center justify-between gap-2 mb-1">
//                                   <span className="text-[9px] font-mono text-slate-400">#{issue.trackingId}</span>
//                                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
//                                 </div>
//                                 <p className="text-xs font-bold text-slate-700 leading-relaxed line-clamp-2">{issue.description || issue.location.address}</p>
//                                 <p className="text-[10px] text-slate-400 mt-1">
//                                   {issue.createdAt ? formatTimeAgo(typeof issue.createdAt === 'number' ? issue.createdAt : (issue.createdAt as any).seconds * 1000) : 'مُنذ لحظة'}
//                                 </p>
//                               </div>
//                             </div>
//                           </button>
//                         ))}
//                         {hasMore && (
//                           <button
//                             onClick={() => {/* load more logic */}}
//                             disabled={loadingMore}
//                             className="w-full py-3 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors flex items-center justify-center gap-2"
//                           >
//                             {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
//                             تحميل المزيد
//                           </button>
//                         )}
//                       </div>
//                     )}
//                   </div>

//                   {/* Data Feed */}
//                   <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
//                     <div className="flex items-center gap-2 mb-4">
//                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//                       <h5 className="text-xs font-black text-slate-600 uppercase tracking-wider font-mono">LIVE DATA FEED</h5>
//                     </div>
//                     <div className="space-y-3 text-xs font-mono">
//                       {[
//                         { label: "SYSTEM", text: "تحديث الخرائط الميدانية لولاية الخرطوم", done: true },
//                         { label: "MAP", text: "رصد ٥ بلاغات جديدة في منطقة بحري" },
//                         { label: "REBUILD", text: "فريق صيانة الكهرباء تحرك في أمدرمان", active: true },
//                       ].map((log, i) => (
//                         <div key={i} className={cn("flex gap-3 text-slate-500", log.active && "animate-pulse")}>
//                           <span className="text-slate-300 shrink-0 text-[10px]">[{new Date().toLocaleTimeString()}]</span>
//                           <p><span className="text-slate-800 font-black">{log.label}:</span> {log.text} {log.done && <span className="text-slate-300">DONE</span>}</p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Partners Ticker */}
//               <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm overflow-hidden">
//                 <div className="flex items-center justify-between mb-5">
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider font-mono">Strategic Network</span>
//                   </div>
//                   <h3 className="text-base font-black text-slate-900">شركاء الإعمار الوطنيين</h3>
//                 </div>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
//                   <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
//                   <div className="flex overflow-hidden" dir="ltr">
//                     {[...Array(2)].map((_, i) => (
//                       <motion.div
//                         key={i}
//                         initial={{ x: 0 }}
//                         animate={{ x: "-100%" }}
//                         transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
//                         className="flex shrink-0 items-center gap-8 pr-8"
//                       >
//                         {INSTITUTIONS.map((inst) => (
//                           <button
//                             key={inst.id}
//                             onClick={() => setViewingInstitution(inst)}
//                             className="flex flex-col items-center gap-3 group shrink-0"
//                           >
//                             <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center p-2 group-hover:border-emerald-200 group-hover:shadow-md transition-all overflow-hidden">
//                               {inst.logo ? (
//                                 <img src={inst.logo} alt={inst.name} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
//                               ) : (
//                                 <Building className="text-slate-300" size={20} />
//                               )}
//                             </div>
//                             <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">{inst.name}</span>
//                           </button>
//                         ))}
//                       </motion.div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Omni Channel Section */}
//               <div className="mt-6 bg-white rounded-2xl p-6 lg:p-8 border border-slate-100 shadow-sm">
//                 <div className="flex flex-col lg:flex-row items-center gap-8">
//                   <div className="flex-1 text-right">
//                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider font-mono mb-2 block">OMNI_SDN</span>
//                     <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-3">التوصيل الرقمي الشامل</h2>
//                     <p className="text-sm text-slate-500 leading-relaxed">
//                       بنية تحتية مرنة تدمج قنوات <span className="text-emerald-600 font-bold">الويب، الرسائل النصية، ونظام USSD</span> لضمان وصول صوت كل مواطن.
//                     </p>
//                   </div>
//                   <div className="flex gap-4 flex-wrap justify-center">
//                     {[
//                       { label: 'الويب', value: '٦٤٪', icon: <Globe size={20} />, color: 'bg-emerald-600' },
//                       { label: 'SMS', value: '٢٢٪', icon: <MessageSquare size={20} />, color: 'bg-blue-600' },
//                       { label: 'USSD', value: '١٤٪', icon: <Hash size={20} />, color: 'bg-amber-600' },
//                     ].map((s, i) => (
//                       <div key={i} className="bg-slate-50 p-5 rounded-2xl text-center w-28 border border-slate-100">
//                         <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 text-white", s.color)}>{s.icon}</div>
//                         <p className="text-xl font-black text-slate-900 font-mono">{s.value}</p>
//                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">{s.label}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//             </motion.div>
//           )}

//           {activeTab === 'alerts' && (
//             <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//               <AlertsList />
//             </motion.div>
//           )}

//           {activeTab === 'payments' && (
//             <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//               <UtilityPayments />
//             </motion.div>
//           )}

//           {activeTab === 'compete' && (
//             <motion.div key="compete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//               <RegionalCompetition />
//             </motion.div>
//           )}

//           {activeTab === 'archive' && (
//             <motion.div key="archive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//               <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
//                 <History size={40} className="text-slate-200 mb-4" />
//                 <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">الأرشيف قيد التهيئة</p>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Modals */}
//       <AnimatePresence>
//         {selectedIssue && <IssueDetail issue={selectedIssue} onClose={() => setSelectedIssue(null)} />}
//         {viewingInstitution && (
//           <InstitutionDetail
//             institution={viewingInstitution}
//             onClose={() => setViewingInstitution(null)}
//             rank={INSTITUTIONS.findIndex(i => i.id === viewingInstitution.id) + 1}
//           />
//         )}
//         {showPitch && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white overflow-y-auto">
//             <HackathonPitch onClose={() => setShowPitch(false)} />
//           </motion.div>
//         )}
//         <OfflineReporting isOpen={showOfflineMode} onClose={() => setShowOfflineMode(false)} />
//         {showPlatformProfile && <PlatformProfile onClose={() => setShowPlatformProfile(false)} />}
//       </AnimatePresence>
//     </div>
//   );
// }





// import React, { useState, useEffect, useRef } from 'react';
// import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
// import { MarkerClusterer } from "@googlemaps/markerclusterer";
// import { 
//   Search, 
//   MapPin, 
//   Filter, 
//   TrendingUp,
//   MoreVertical, 
//   ThumbsUp, 
//   MessageSquare, 
//   Share2,
//   Activity,
//   Loader2,
//   AlertTriangle,
//   WifiOff,
//   X,
//   Bell,
//   Wallet,
//   Grid,
//   Trophy,
//   Truck,
//   Droplets,
//   Zap,
//   Trash2,
//   History,
//   Map as MapIcon,
//   ShieldCheck,
//   Check,
//   Building,
//   HelpCircle,
//   ArrowUpRight,
//   Phone,
//   SignalHigh,
//   Star,
//   CheckCircle2,
//   Globe,
//   Hash,
//   Command,
//   ArrowRight,
//   ChevronRight
// } from 'lucide-react';
// import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs, getDoc, doc, where } from 'firebase/firestore';
// import { db } from '../lib/firebase';
// import { cn, formatTimeAgo } from '../lib/utils';
// import { Issue } from '../types';
// import { INSTITUTIONS, InstitutionExtended } from '../constants';
// import IssueDetail from './IssueDetail';
// import InstitutionDetail from './InstitutionDetail';
// import AlertsList from './Alerts';
// import UtilityPayments from './Payments';
// import RegionalCompetition from './RegionalCompetition';
// import HackathonPitch from './HackathonPitch';
// import OfflineReporting from './OfflineReporting';
// import PlatformProfile from './PlatformProfile';
// import { motion, AnimatePresence } from 'motion/react';
// import { generatePitchDeck } from '../lib/pitchdeck';
// import { Download } from 'lucide-react';
// import { MapContainer, TileLayer, Marker as LeafletMarker, Popup } from 'react-leaflet';
// import MarkerClusterGroup from 'react-leaflet-cluster';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { section } from 'motion/react-m';

// // Fix Leaflet marker icons
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// type DashboardTab = 'activity' | 'alerts' | 'payments' | 'compete' | 'archive' | 'workstation';

// export default function Dashboard({ role = 'citizen', profile }: { role?: 'citizen' | 'official' | 'partner'; profile?: any }) {
//   const [issues, setIssues] = useState<Issue[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const listContainerRef = React.useRef<HTMLDivElement>(null);
//   const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
//   const [activeMarkerIssue, setActiveMarkerIssue] = useState<Issue | null>(null);
//   const [activeTab, setActiveTab] = useState<DashboardTab>(role === 'official' ? 'activity' : 'activity'); // For now keep activity default
//   const [selectedInstitutionFilter, setSelectedInstitutionFilter] = useState<string>(role === 'official' ? 'unassigned' : 'all');
//   const [viewingInstitution, setViewingInstitution] = useState<InstitutionExtended | null>(null);
//   const [showFilters, setShowFilters] = useState(false);
//   const [showPitch, setShowPitch] = useState(false);
//   const [showPlatformProfile, setShowPlatformProfile] = useState(false);
//   const [showOfflineMode, setShowOfflineMode] = useState(false);
//   const [lastNotification, setLastNotification] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
//   const [citizenOnly, setCitizenOnly] = useState(false);
//   const [showSystemNotice, setShowSystemNotice] = useState(() => {
//     // Check if dismissed in this session/device
//     const dismissed = localStorage.getItem('system_notice_dismissed');
//     return !dismissed;
//   });
//   const [systemNotice, setSystemNotice] = useState<string>("إشعار هام: بدأت أعمال الصيانة الكبرى في محطة مياه المقرن. قد يتأثر الإمداد في وسط الخرطوم.");
//   const [govAlerts, setGovAlerts] = useState<any[]>([]);
//   const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(() => {
//     const saved = localStorage.getItem('dismissed_gov_alerts');
//     return saved ? JSON.parse(saved) : [];
//   });

//   const dismissGovAlert = (id: string) => {
//     setDismissedAlertIds(prev => {
//       const next = [...prev, id];
//       localStorage.setItem('dismissed_gov_alerts', JSON.stringify(next));
//       return next;
//     });
//   };

//   useEffect(() => {
//     const q = query(
//       collection(db, 'alerts'),
//       where('active', '==', true),
//       orderBy('createdAt', 'desc')
//     );

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const fetched = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       setGovAlerts(fetched);
//     }, (err) => {
//       console.warn("Alerts listener error (possibly missing index):", err);
//       // Fallback for missing index: fetch without where and filter in memory if needed
//       // But for now we just handle the error
//     });

//     return () => unsubscribe();
//   }, []);

//   const activeVisibleAlert = govAlerts.find(a => !dismissedAlertIds.includes(a.id));

//   const dismissNotice = () => {
//     setShowSystemNotice(false);
//     localStorage.setItem('system_notice_dismissed', 'true');
//   };

//   useEffect(() => {
//     const notifications = [
//       "تم رصد بلاغ جديد في حي الرياض",
//       "اكتمال مشروع ترميم مدرسة في بحري",
//       "سفير عمراني جديد انضم للوحة الشرف",
//       "تحديث SLA لقسم صيانة الكهرباء",
//       "بدء حملة تشجير كبرى في بورتسودان"
//     ];

//     const interval = setInterval(() => {
//       if (Math.random() > 0.7) {
//         setLastNotification(notifications[Math.floor(Math.random() * notifications.length)]);
//         setTimeout(() => setLastNotification(null), 5000);
//       }
//     }, 15000);

//     return () => clearInterval(interval);
//   }, []);
//   const [isMapLoaded, setIsMapLoaded] = useState(false);
//   const [mapError, setMapError] = useState<string | null>(null);
  
//   const mapRef = useRef<HTMLDivElement>(null);
//   const googleMapRef = useRef<google.maps.Map | null>(null);
//   const markersRef = useRef<google.maps.Marker[]>([]);
//   const clustererRef = useRef<MarkerClusterer | null>(null);

//   const filteredIssues = issues.filter(issue => {
//     // Basic type/institution filtering
//     if (selectedInstitutionFilter !== 'all') {
//       if (selectedInstitutionFilter === 'unassigned') {
//         if (issue.assignedInstitution) return false;
//       } else if (issue.assignedInstitution !== selectedInstitutionFilter) {
//         return false;
//       }
//     }

//     // Citizen only filter
//     if (citizenOnly && !issue.reportedByCitizen) return false;

//     // Search query filter
//     if (searchQuery) {
//       const q = searchQuery.toLowerCase();
//       const inId = issue.trackingId?.toLowerCase().includes(q);
//       const inDesc = issue.description?.toLowerCase().includes(q);
//       const inType = issue.type?.toLowerCase().includes(q);
//       if (!inId && !inDesc && !inType) return false;
//     }

//     return true;
//   }).sort((a, b) => {
//     if (sortBy === 'date') {
//       const timeA = typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt as any)?.seconds * 1000 || 0;
//       const timeB = typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt as any)?.seconds * 1000 || 0;
//       return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
//     } else {
//       // Sort by status - custom order
//       const statusOrder = { 'pending': 0, 'verified': 1, 'in-progress': 2, 'completed': 3, 'resolved': 4 };
//       const valA = statusOrder[a.status as keyof typeof statusOrder] || 0;
//       const valB = statusOrder[b.status as keyof typeof statusOrder] || 0;
//       return sortOrder === 'desc' ? valB - valA : valA - valB;
//     }
//   });

//   const getIssueIcon = (type: string, size = 20) => {
//     switch(type) {
//       case 'road': return <Truck size={size} />;
//       case 'water': return <Droplets size={size} />;
//       case 'electricity': return <Zap size={size} />;
//       case 'waste': return <Trash2 size={size} />;
//       case 'other': return <HelpCircle size={size} />;
//       default: return <Activity size={size} />;
//     }
//   };

//   const handleMarkerClick = (issue: Issue) => {
//     if (googleMapRef.current) {
//       googleMapRef.current.setZoom(16);
//       googleMapRef.current.panTo({ lat: issue.location.lat, lng: issue.location.lng });
//     }
//     setActiveMarkerIssue(issue);
//   };

//   const resetMap = () => {
//     if (googleMapRef.current) {
//       googleMapRef.current.setZoom(12);
//       googleMapRef.current.setCenter({ lat: 15.5, lng: 32.55 });
//     }
//     setActiveMarkerIssue(null);
//   };

//   useEffect(() => {
//     // Add global handler for Google Maps Auth Failure
//     (window as any).gm_authFailure = () => {
//       console.error("Google Maps authentication failed (gm_authFailure)");
//       setMapError('ApiProjectMapError');
//     };

//     const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
//     const isInvalidKey = !apiKey || apiKey === 'YOUR_KEY_HERE' || apiKey.trim() === '';

//     if (isInvalidKey) {
//       console.warn("Google Maps API Key is missing or default. Using Leaflet fallback.");
//       setMapError('missing_key');
//       return;
//     }

//     setOptions({
//       apiKey: apiKey,
//       version: 'weekly',
//       libraries: ['maps', 'marker']
//     } as any);

//     let mapInitTimeout: any;

//     const initMap = async () => {
//       // Set a safety timeout for map initialization
//       mapInitTimeout = setTimeout(() => {
//         if (!isMapLoaded && !mapError) {
//           console.warn("Google Maps initialization timed out. Using fallback.");
//           setMapError('timeout');
//         }
//       }, 10000);

//       // Handle global Google Maps auth failure
//       (window as any).gm_authFailure = () => {
//         console.error("Google Maps Authentication Failed (gm_authFailure)");
//         setMapError('ApiProjectMapError');
//         clearTimeout(mapInitTimeout);
//       };

//       try {
//         const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;
//         await importLibrary('marker');

//         if (mapRef.current) {
//           const map = new Map(mapRef.current, {
//             center: { lat: 15.5007, lng: 32.5599 },
//             zoom: 12,
//             disableDefaultUI: true,
//             styles: [
//             {
//               "featureType": "all",
//               "elementType": "geometry.fill",
//               "stylers": [{ "weight": "2.00" }]
//             },
//             {
//               "featureType": "all",
//               "elementType": "geometry.stroke",
//               "stylers": [{ "color": "#9c9c9c" }]
//             },
//             {
//               "featureType": "all",
//               "elementType": "labels.text",
//               "stylers": [{ "visibility": "on" }]
//             },
//             {
//               "featureType": "landscape",
//               "elementType": "all",
//               "stylers": [{ "color": "#f2f2f2" }]
//             },
//             {
//               "featureType": "landscape",
//               "elementType": "geometry.fill",
//               "stylers": [{ "color": "#ffffff" }]
//             },
//             {
//               "featureType": "landscape.man_made",
//               "elementType": "geometry.fill",
//               "stylers": [{ "color": "#ffffff" }]
//             },
//             {
//               "featureType": "poi",
//               "elementType": "all",
//               "stylers": [{ "visibility": "off" }]
//             },
//             {
//               "featureType": "road",
//               "elementType": "all",
//               "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
//             },
//             {
//               "featureType": "road",
//               "elementType": "geometry.fill",
//               "stylers": [{ "color": "#eeeeee" }]
//             },
//             {
//               "featureType": "road",
//               "elementType": "labels.text.fill",
//               "stylers": [{ "color": "#7b7b7b" }]
//             },
//             {
//               "featureType": "road",
//               "elementType": "labels.text.stroke",
//               "stylers": [{ "color": "#ffffff" }]
//             },
//             {
//               "featureType": "road.highway",
//               "elementType": "all",
//               "stylers": [{ "visibility": "simplified" }]
//             },
//             {
//               "featureType": "road.arterial",
//               "elementType": "labels.icon",
//               "stylers": [{ "visibility": "off" }]
//             },
//             {
//               "featureType": "transit",
//               "elementType": "all",
//               "stylers": [{ "visibility": "off" }]
//             },
//             {
//               "featureType": "water",
//               "elementType": "all",
//               "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }]
//             },
//             {
//               "featureType": "water",
//               "elementType": "geometry.fill",
//               "stylers": [{ "color": "#c8d7d4" }]
//             },
//             {
//               "featureType": "water",
//               "elementType": "labels.text.fill",
//               "stylers": [{ "color": "#070707" }]
//             },
//             {
//               "featureType": "water",
//               "elementType": "labels.text.stroke",
//               "stylers": [{ "color": "#ffffff" }]
//             }
//           ]
//         });
//         googleMapRef.current = map;
//         clearTimeout(mapInitTimeout);
//         setIsMapLoaded(true);
//         setMapError(null);
//       }
//     } catch (error: any) {
//       clearTimeout(mapInitTimeout);
//       console.error("Google Maps initialization failed:", error);
//       const msg = error.message || '';
//       if (msg.includes('ApiProjectMapError')) {
//         setMapError('ApiProjectMapError');
//       } else {
//         setMapError(msg || 'initialization_failed');
//       }
//     }
//   };

//   initMap();

//   return () => {
//     if (mapInitTimeout) clearTimeout(mapInitTimeout);
//   };
// }, []);

//   useEffect(() => {
//     if (!isMapLoaded || !googleMapRef.current) return;

//     // Clear existing markers and clusterer
//     markersRef.current.forEach(marker => marker.setMap(null));
//     markersRef.current = [];
//     if (clustererRef.current) {
//       clustererRef.current.clearMarkers();
//     }

//     // Add new markers
//     const newMarkers = filteredIssues.map(issue => {
//       // Safety check for google object
//       if (typeof google === 'undefined' || !google.maps) return null;

//       const getMarkerColor = (severity: number) => {
//         if (severity === 3) return '#ef4444'; // Red for urgent
//         if (severity === 2) return '#f59e0b'; // Amber for important
//         return '#10b981'; // Emerald for normal
//       };

//       const color = getMarkerColor(issue.severity);
      
//       const getCategoryInitial = (type: string) => {
//         switch (type) {
//           case 'road': return 'ط';
//           case 'water': return 'م';
//           case 'electricity': return 'ك';
//           case 'waste': return 'ن';
//           default: return 'أ';
//         }
//       };

//       // Modern Pin SVG
//       const svgMarker = {
//         path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
//         fillColor: color,
//         fillOpacity: 1,
//         strokeColor: '#FFFFFF',
//         strokeWeight: 3,
//         scale: 1.5,
//         labelOrigin: new google.maps.Point(0, -30)
//       };
      
//       const marker = new google.maps.Marker({
//         position: { lat: issue.location.lat, lng: issue.location.lng },
//         title: issue.description,
//         icon: svgMarker,
//         label: {
//           text: getCategoryInitial(issue.type),
//           color: '#FFFFFF',
//           fontSize: '12px',
//           fontWeight: '900'
//         },
//         animation: issue.severity === 3 ? google.maps.Animation.BOUNCE : undefined
//       });

//       // Stop bouncing after a few seconds if it's urgent
//       if (issue.severity === 3) {
//         setTimeout(() => {
//           marker.setAnimation(null);
//         }, 3000);
//       }

//       marker.addListener('click', () => {
//         handleMarkerClick(issue);
//       });

//       return marker;
//     }).filter(m => m !== null) as google.maps.Marker[];

//     markersRef.current = newMarkers;

//     if (googleMapRef.current && newMarkers.length > 0) {
//       clustererRef.current = new MarkerClusterer({
//         map: googleMapRef.current,
//         markers: newMarkers,
//         algorithmOptions: { maxZoom: 15 }
//       });
//     }
//   }, [filteredIssues, isMapLoaded]);

//   useEffect(() => {
//     let unsubscribe: () => void;
    
//     const fetchData = async () => {
//       try {
//         const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'), limit(100));
//         unsubscribe = onSnapshot(q, (snapshot) => {
//           const fetchedIssues = snapshot.docs.map(doc => ({
//             id: doc.id,
//             ...doc.data()
//           })) as any[];
//           setIssues(fetchedIssues);
//           setLoading(false);
//           setHasMore(snapshot.docs.length === 100);
//           setError(null);
//         }, (err) => {
//           console.error("Firestore snapshot error:", err);
//           setError("عذراً، فشل الاتصال بقاعدة البيانات. يرجى التحقق من اتصالك.");
//           setLoading(false);
//         });
//       } catch (err) {
//         console.error("Error setting up Firestore listener:", err);
//         setError("حدث خطأ تقني غير متوقع. يرجى المحاولة لاحقاً.");
//         setLoading(false);
//       }
//     };

//     fetchData();

//     return () => {
//       if (unsubscribe) unsubscribe();
//     };
//   }, []);

//   const loadMoreIssues = async () => {
//     if (loadingMore || !hasMore || issues.length === 0) return;
    
//     setLoadingMore(true);
//     try {
//       const lastIssue = issues[issues.length - 1];
//       const lastDoc = await getDoc(doc(db, 'issues', lastIssue.id));
      
//       const q = query(
//         collection(db, 'issues'), 
//         orderBy('createdAt', 'desc'), 
//         startAfter(lastDoc),
//         limit(50)
//       );
      
//       const snapshot = await getDocs(q);
//       const newIssues = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       })) as any[];
      
//       if (newIssues.length > 0) {
//         setIssues(prev => [...prev, ...newIssues]);
//         setHasMore(newIssues.length === 50);
//       } else {
//         setHasMore(false);
//       }
//     } catch (err) {
//       console.error("Error loading more issues:", err);
//     } finally {
//       setLoadingMore(false);
//     }
//   };

//   const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
//     const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
//     if (scrollHeight - scrollTop <= clientHeight + 300) { // Increased threshold to 300
//       loadMoreIssues();
//     }
//   };


//   return (
//     <div className="h-full flex flex-col relative bg-white/50" dir="rtl">
//       {/* Official Workstation - Highlighted for Governments */}
//       {/* ------------ old code --------- */}
//       {/* {role === 'official' && (
//         <div className="px-6 lg:px-16 pt-8 pb-4">
//           <motion.div 
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="p-10 bg-white rounded-xl border-4 border-slate-100 shadow-2xl relative overflow-hidden"
//           >
//             <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
//             <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
//             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
//               <div className="flex items-center gap-6">
//                  <div className="w-20 h-20 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
//                     <ShieldCheck size={40} />
//                  </div>
//                  <div className="text-right">
//                     <div className="flex items-center gap-2 mb-1">
//                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] font-mono italic">GOV_COMMAND_CENTER // ACTIVE</p>
//                     </div>
//                     <h3 className="text-3xl lg:text-4xl font-black holographic-text font-display italic tracking-tight">محطة عمل المسؤول الحكومي</h3>
//                     <p className="text-emerald-600 font-medium mt-1">مرحباً بك، سيادة المسؤول. لديك {filteredIssues.filter(i => i.status === 'pending' && !i.assignedInstitution).length} بلاغات قيد الفرز والتعيين.</p>
//                  </div>
//               </div>
              
//               <div className="flex flex-wrap gap-4">
//                  <button 
//                    onClick={() => setSelectedInstitutionFilter('unassigned')}
//                    className={cn(
//                      "px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2",
//                      selectedInstitutionFilter === 'unassigned' 
//                        ? "bg-emerald-600 border-emerald-500 text-white shadow-lg" 
//                        : "bg-white/5 border-white/10 text-white/40 hover:text-white"
//                    )}
//                  >
//                    بلاغات غير موجهة ({issues.filter(i => !i.assignedInstitution).length})
//                  </button>
//                  <button 
//                     onClick={() => {
//                       setCitizenOnly(true);
//                       setSelectedInstitutionFilter('all');
//                     }}
//                    className="px-8 py-4 rounded-2xl bg-white border border-slate-100 text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-sm"
//                  >
//                    تدقيق بلاغات المواطنين
//                  </button>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       )} */}
//       {/* --------- new code ----------- */}

//       {/* محطة عمل المسؤول - واجهة مركز القيادة المحدثة */}
// {role === 'official' && (
//   <div className="px-6 lg:px-16 pt-10 pb-6">
//     <motion.div 
//       initial={{ opacity: 0, y: 40, scale: 0.95 }}
//       animate={{ opacity: 1, y: 0, scale: 1 }}
//       transition={{ duration: 0.8, ease: "easeOut" }}
//       className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-1 shadow-2xl border border-emerald-500/20"
//     >
//       {/* خلفية تقنية (Pattern) */}
//       <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
//       <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-600/20 blur-[120px] rounded-full" />
      
//       <div className="relative z-10 bg-white rounded-[2.8rem] p-8 lg:p-12">
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          
//           {/* القسم الأيمن: الترحيب والحالة */}
//           <div className="flex items-center gap-8">
//             <div className="relative">
//               <div className="w-24 h-24 rounded-3xl bg-emerald-600 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(16,185,129,0.4)] rotate-3">
//                 <ShieldCheck size={48} strokeWidth={1.5} />
//               </div>
//               <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100">
//                 <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
//               </div>
//             </div>

//             <div className="text-right">
//               <div className="flex items-center gap-3 mb-2">
//                 <span className="px-4 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-100 font-mono italic">
//                   GOV_COMMAND_CENTER // ACTIVE
//                 </span>
//               </div>
//               <h3 className="text-4xl lg:text-5xl font-black text-slate-900 font-display italic tracking-tighter mb-2">
//                 محطة عمل المسؤول الحكومي
//               </h3>
//               <p className="text-slate-500 font-medium text-lg lg:text-xl max-w-xl leading-relaxed">
//                 مرحباً بك، سيادة المسؤول. هناك <span className="text-emerald-600 font-black underline decoration-emerald-200 underline-offset-8">
//                 {filteredIssues.filter(i => i.status === 'pending' && !i.assignedInstitution).length} بلاغاً </span> تحتاج إلى توجيه فوري.
//               </p>
//             </div>
//           </div>

//           {/* القسم الأيسر: أزرار التحكم السريع */}
//           <div className="flex flex-wrap gap-4 w-full lg:w-auto">
//             <button 
//               onClick={() => setSelectedInstitutionFilter('unassigned')}
//               className={cn(
//                 "flex-1 lg:flex-none px-10 py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all border-2 flex flex-col items-center gap-2",
//                 selectedInstitutionFilter === 'unassigned' 
//                   ? "bg-emerald-600 border-emerald-500 text-white shadow-2xl scale-105" 
//                   : "bg-slate-50 border-slate-100 text-slate-400 hover:border-emerald-500/30 hover:bg-white"
//               )}
//             >
//               <span className="text-2xl font-mono">({issues.filter(i => !i.assignedInstitution).length})</span>
//               <span>بلاغات غير موجهة</span>
//             </button>

//             <button 
//               onClick={() => {
//                 setCitizenOnly(true);
//                 setSelectedInstitutionFilter('all');
//               }}
//               className="flex-1 lg:flex-none px-10 py-6 rounded-3xl bg-slate-900 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex flex-col items-center justify-center gap-2 border-2 border-slate-800"
//             >
//               <Activity size={24} className="text-emerald-400" />
//               <span>تدقيق المواطنين</span>
//             </button>
//           </div>

//         </div>

//         {/* مؤشر الحالة السفلي */}
//         <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-8 justify-center lg:justify-start">
//            <div className="flex items-center gap-3">
//               <div className="w-2 h-2 rounded-full bg-emerald-500" />
//               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Encryption: AES-256</span>
//            </div>
//            <div className="flex items-center gap-3">
//               <div className="w-2 h-2 rounded-full bg-blue-500" />
//               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Sync: Real-time</span>
//            </div>
//            <div className="flex items-center gap-3">
//               <div className="w-2 h-2 rounded-full bg-amber-500" />
//               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Node: KRT-Central</span>
//            </div>
//         </div>
//       </div>
//     </motion.div>
//   </div>
// )}

//       {/* Government Alerts Banner - Real-time */}
//       {/* <AnimatePresence>
//         {activeVisibleAlert && (
//           <motion.div 
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: 'auto', opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             className={cn(
//               "py-4 px-6 lg:px-16 flex items-center justify-between gap-6 z-[110] relative overflow-hidden border-b",
//               activeVisibleAlert.type === 'critical' ? "bg-rose-50 text-rose-900 border-rose-100" : 
//               activeVisibleAlert.type === 'warning' ? "bg-amber-50 text-amber-900 border-amber-100" : "bg-blue-50 text-blue-900 border-blue-100"
//             )}
//           >
//             <div className="absolute inset-0 opacity-[0.03] sudan-pattern-modern animate-pulse pointer-events-none" />
            
//             <div className="flex flex-1 items-center gap-4 relative z-10">
//               <div className={cn(
//                 "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
//                 activeVisibleAlert.type === 'critical' ? "bg-rose-600 text-white animate-pulse" : 
//                 activeVisibleAlert.type === 'warning' ? "bg-amber-600 text-white" : "bg-blue-600 text-white"
//               )}>
//                 {activeVisibleAlert.type === 'critical' ? <AlertTriangle size={24} /> : <Bell size={24} />}
//               </div>
              
//               <div className="text-right">
//                 <div className="flex items-center gap-2 mb-0.5">
//                   <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 font-mono">
//                     GOV_ALERT // {activeVisibleAlert.type?.toUpperCase() || 'ALERT'}
//                   </span>
//                   {activeVisibleAlert.type === 'critical' && (
//                     <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[8px] font-bold animate-pulse">URGENT</span>
//                   )}
//                 </div>
//                 <h4 className="text-lg lg:text-xl font-black leading-tight italic font-display text-slate-900">
//                   {activeVisibleAlert.title}: <span className="opacity-80 font-medium text-base lg:text-lg not-italic text-slate-700">{activeVisibleAlert.message}</span>
//                 </h4>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-4 relative z-10 shrink-0">
//                <span className="hidden md:block text-[9px] font-black opacity-20 font-mono uppercase tracking-widest text-slate-900">
//                  STAMP: {activeVisibleAlert.id.slice(0, 8)}
//                </span>
//                <button 
//                 onClick={() => dismissGovAlert(activeVisibleAlert.id)}
//                 className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all border border-slate-200 active:scale-95 text-slate-900"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence> */}


//       {/* Government Alerts Banner - المظهر المطور لمحطة العمل */}
// <AnimatePresence>
//   {activeVisibleAlert && (
//     <motion.div 
//       initial={{ y: -100, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       exit={{ y: -100, opacity: 0 }}
//       transition={{ type: "spring", stiffness: 100, damping: 20 }}
//       className={cn(
//         "py-4 px-6 lg:px-16 flex items-center justify-between gap-6 z-[110] relative border-b shadow-lg backdrop-blur-md",
//         activeVisibleAlert.type === 'critical' 
//           ? "bg-rose-600/95 text-white border-rose-400 shadow-rose-500/20" 
//           : activeVisibleAlert.type === 'warning' 
//             ? "bg-amber-500/95 text-slate-900 border-amber-300 shadow-amber-500/10" 
//             : "bg-indigo-600/95 text-white border-indigo-400 shadow-indigo-500/10"
//       )}
//     >
//       {/* خلفية تقنية متحركة */}
//       <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
      
//       <div className="flex flex-1 items-center gap-6 relative z-10">
//         {/* الأيقونة بتصميم دائري عصري */}
//         <div className={cn(
//           "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 backdrop-blur-sm shadow-inner",
//           activeVisibleAlert.type === 'critical' ? "bg-white/20 border-white/30 animate-pulse" : 
//           activeVisibleAlert.type === 'warning' ? "bg-black/10 border-black/10" : "bg-white/20 border-white/30"
//         )}>
//           {activeVisibleAlert.type === 'critical' ? 
//             <AlertTriangle size={28} className="drop-shadow-md" /> : 
//             <Bell size={28} className="drop-shadow-md" />
//           }
//         </div>
        
//         <div className="text-right">
//           <div className="flex items-center gap-3 mb-1">
//             <span className={cn(
//               "text-[10px] font-black uppercase tracking-[0.3em] font-mono px-2 py-0.5 rounded",
//               activeVisibleAlert.type === 'critical' ? "bg-rose-800 text-rose-100" : "opacity-70"
//             )}>
//               {activeVisibleAlert.type || 'SYSTEM'} LOG // {activeVisibleAlert.id.slice(0, 5)}
//             </span>
//             {activeVisibleAlert.type === 'critical' && (
//               <span className="flex h-2 w-2">
//                 <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
//                 <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
//               </span>
//             )}
//           </div>
//           <h4 className="text-lg lg:text-xl font-bold leading-tight tracking-tight">
//             <span className="font-black italic uppercase ml-2">{activeVisibleAlert.title}</span>
//             <span className="opacity-90 font-light text-base border-r border-current/30 pr-3 mr-3">
//               {activeVisibleAlert.message}
//             </span>
//           </h4>
//         </div>
//       </div>
      
//       {/* أدوات التحكم */}
//       <div className="flex items-center gap-6 relative z-10 shrink-0">
//          <div className="hidden xl:flex flex-col items-end opacity-60 font-mono text-[9px] uppercase tracking-tighter">
//             <span>Auth_Verified</span>
//             <span>Secure_Channel</span>
//          </div>
//          <button 
//           onClick={() => dismissGovAlert(activeVisibleAlert.id)}
//           className={cn(
//             "w-12 h-12 rounded-xl flex items-center justify-center transition-all border active:scale-90",
//             activeVisibleAlert.type === 'critical' 
//               ? "bg-white/10 hover:bg-white/20 border-white/20 text-white" 
//               : "bg-black/5 hover:bg-black/10 border-black/10 text-slate-900"
//           )}
//         >
//           <X size={20} />
//         </button>
//       </div>
//     </motion.div>
//   )}
// </AnimatePresence>


//       {/* System Notice Bar - TOP */}
//       {/* <AnimatePresence>
//         {showSystemNotice && (
//           <motion.div 
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: 'auto', opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             className="bg-emerald-950 text-emerald-400 py-3 px-6 lg:px-16 flex items-center justify-between gap-4 z-[100] relative overflow-hidden"
//           >
//             <div className="absolute inset-0 bg-emerald-500/5 animate-pulse sudan-texture pointer-events-none" />
//             <div className="flex flex-1 items-center gap-3 relative z-10">
//               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
//               <p className="text-[10px] font-black leading-none mb-0 flex items-center gap-2">
//                 <Bell size={12} />
//                 بث موحد // {systemNotice}
//               </p>
//             </div>
            
//             <div className="flex items-center gap-4 relative z-10">
//               <button 
//                 onClick={() => {
//                   setActiveTab('alerts');
//                   dismissNotice();
//                 }}
//                 className="px-4 py-1.5 bg-emerald-500 text-emerald-950 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
//               >
//                 قراءة الكل // VIEW_ALL
//               </button>
              
//               <button 
//                 onClick={dismissNotice}
//                 className="p-1 hover:bg-slate-100 rounded-full transition-colors"
//               >
//                 <X size={14} />
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence> */}


//       {/* شريط إشعارات النظام المطور - واجهة بسيطة واحترافية */}
// <AnimatePresence>
//   {showSystemNotice && (
//     <motion.div 
//       initial={{ y: -20, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       exit={{ y: -20, opacity: 0 }}
//       transition={{ duration: 0.4, ease: "circOut" }}
//       className="relative z-[100] bg-slate-900 border-b border-emerald-500/30 py-2.5 px-6 lg:px-16 flex items-center justify-between gap-4 overflow-hidden"
//     >
//       {/* تأثير خلفية خفيف جداً (Cyber Scanline) */}
//       <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:100%_3px] pointer-events-none" />

//       <div className="flex flex-1 items-center gap-4 relative z-10">
//         {/* مؤشر الحالة الصغير */}
//         <div className="flex items-center justify-center">
//           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//           <div className="absolute w-4 h-4 rounded-full bg-emerald-500/20 animate-ping" />
//         </div>
        
//         <div className="flex items-center gap-3 overflow-hidden">
//           <span className="hidden sm:inline-block text-[10px] font-black text-emerald-500 font-mono tracking-tighter uppercase opacity-80 border-l border-emerald-500/20 pl-3">
//             System_Broadcast
//           </span>
//           <p className="text-[13px] font-medium text-emerald-50/90 truncate max-w-[200px] sm:max-w-none leading-none">
//             {systemNotice}
//           </p>
//         </div>
//       </div>
      
//       <div className="flex items-center gap-3 relative z-10 shrink-0">
//         {/* زر الإجراء بتصميم مبسط */}
//         <button 
//           onClick={() => {
//             setActiveTab('alerts');
//             dismissNotice();
//           }}
//           className="group relative px-4 py-1.5 bg-transparent border border-emerald-500/50 hover:border-emerald-400 rounded-lg transition-all duration-300"
//         >
//           <span className="relative z-10 text-[9px] font-black text-emerald-400 group-hover:text-emerald-950 transition-colors uppercase tracking-widest flex items-center gap-2 italic">
//             عرض التفاصيل <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
//           </span>
//           <div className="absolute inset-0 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-[6px]" />
//         </button>
        
//         {/* زر الإغلاق الذكي */}
//         <button 
//           onClick={dismissNotice}
//           className="p-1.5 text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-all active:scale-90"
//           aria-label="إغلاق الإشعار"
//         >
//           <X size={16} />
//         </button>
//       </div>
//     </motion.div>
//   )}
// </AnimatePresence>
      

//       {/* Sudanese Pattern Overlay (Top) */}
//       <div className="absolute top-0 inset-x-0 h-40 opacity-[0.02] pointer-events-none sudan-pattern-modern" />

//       {/* Header & Welcome - Refined for Light Theme with the Brand Asset requested */}


//       {/* Header & Welcome - الإصدار المطور لمنصة عُمران */}
// <div className="hidden lg:block px-8 lg:px-16 pt-12 pb-8 space-y-8 relative z-10">
  
//   {/* شريط الحالة العلوي المستقبلي */}
//   <div className="flex justify-between items-center bg-white/60 backdrop-blur-xl p-4 rounded-[2rem] border border-slate-100 shadow-sm">
//     <div className="flex items-center gap-6">
//       {/* مؤشر اتصال النظام */}
//       <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg">
//         <div className="relative flex h-2 w-2">
//           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
//           <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
//         </div>
//         <span className="text-[10px] font-black text-emerald-400 font-mono tracking-widest uppercase">
//           System_Online // 14ms
//         </span>
//       </div>

//       {/* ختم التحقق الحكومي */}
//       <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity cursor-help">
//         <ShieldCheck size={18} className="text-emerald-600" />
//         <div className="text-right leading-none">
//           <p className="text-[9px] font-black text-slate-800 uppercase tracking-wider">Verified_Gov</p>
//           <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tight">SDN_AUTH_2026</p>
//         </div>
//       </div>
//     </div>

//     {/* أزرار الوصول السريع الموحدة */}
//     <div className="flex items-center gap-3">
//       <button 
//         onClick={() => setShowPlatformProfile(true)}
//         className="flex items-center gap-2 px-5 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all duration-300 group"
//       >
//         <Star size={14} className="text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
//         ملف المنصة
//       </button>
      
//       <button 
//         onClick={generatePitchDeck}
//         className="flex items-center gap-2 px-5 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all duration-300"
//       >
//         <Download size={14} />
//         Pitch Deck
//       </button>

//       <div className="h-8 w-px bg-slate-200 mx-2" />
      
//       <div className="flex flex-col items-end px-2">
//         <span className="text-[9px] font-black text-slate-400 font-mono tracking-tighter uppercase leading-none">Last_Sync</span>
//         <span className="text-[11px] font-bold text-slate-800 font-mono tracking-tighter">{new Date().toLocaleTimeString('ar-SD')}</span>
//       </div>
//     </div>
//   </div>

//   {/* القسم الرئيسي: البطل "عُمران" */}
//   <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/30 p-2 rounded-[3rem] border border-white/50 shadow-2xl overflow-hidden">
    
//     {/* زخارف خلفية تقنية */}
//     <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
    
//     {/* الجانب الأيمن: المحتوى النصي */}
//     <div className="lg:col-span-7 p-10 lg:p-16 relative z-10">
//       <div className="space-y-6">
//         <div className="relative inline-block">
//           {/* كلمة عمران الظلية الكبيرة */}
//           <span className="absolute -top-16 -right-10 text-[12rem] font-black text-slate-900 opacity-[0.03] pointer-events-none select-none font-display italic">
//             عمران
//           </span>
//           <h1 className="text-7xl lg:text-[8rem] font-black italic tracking-tighter font-display leading-none">
//             عُـمْـران<span className="text-emerald-500">.</span>
//           </h1>
//         </div>

//         <div className="relative max-w-lg group">
//           <div className="absolute -right-4 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
//           <p className="pr-6 text-2xl lg:text-3xl font-black text-slate-800 leading-tight italic font-display">
//             نحن لا نبني تطبيقاً.. نحن نبني نظام تشغيل <span className="text-emerald-600">للتعافي</span> وتجاوز الأزمات.
//           </p>
//         </div>

//         <div className="pt-4">
//           <div className="inline-flex items-center gap-4 p-1 bg-slate-50 rounded-2xl border border-slate-100">
//              <span className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">Vision 2026</span>
//              <span className="px-2 text-sm font-bold text-slate-500 italic">البنية التحتية الرقمية لإعادة إعمار السودان</span>
//           </div>
//         </div>
//       </div>

//       {/* التنبيه الأخير بتصميم مبسط (Toast-like) */}
//       <AnimatePresence>
//         {lastNotification && (
//           <motion.div 
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             className="mt-12 flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xl max-w-md border-r-4 border-r-amber-500"
//           >
//             <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
//                <Bell size={20} />
//             </div>
//             <div className="flex flex-col">
//                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Live_Update</span>
//                <span className="text-xs font-bold text-slate-700 leading-snug">{lastNotification}</span>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>

//     {/* الجانب الأيسر: خريطة السودان والتحكم */}
//     <div className="lg:col-span-5 p-10 flex flex-col items-center justify-center relative">
//        <div className="relative w-full aspect-square max-w-[400px] flex items-center justify-center">
//           {/* تأثير النبض خلف الخريطة */}
//           <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full animate-pulse" />
          
//           {/* خريطة مبسطة وأيقونة الموقع */}
//           <div className="relative z-10 w-full h-full bg-white/80 backdrop-blur-sm rounded-[4rem] border border-white shadow-2xl flex items-center justify-center overflow-hidden">
//              <svg viewBox="0 0 400 400" className="w-64 h-64 opacity-20 text-emerald-600">
//                 <path d="M150,50 L250,50 L300,150 L250,350 L100,350 L50,150 Z" fill="currentColor" />
//              </svg>
             
//              {/* زر البلاغ بدون إنترنت الكبير */}
//              <button 
//                onClick={() => setShowOfflineMode(true)}
//                className="absolute group flex flex-col items-center gap-2"
//              >
//                 <div className="w-24 h-24 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
//                    <WifiOff size={40} />
//                 </div>
//                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Offline_Report</span>
//              </button>
//           </div>
//        </div>

//        {/* شريط معلومات الموقع السفلي */}
//        <div className="mt-8 flex items-center gap-4 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 translate-y-4">
//           <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
//              <MapPin size={20} />
//           </div>
//           <div className="text-right">
//              <p className="text-[9px] font-black text-emerald-400 font-mono uppercase tracking-[0.2em] leading-none mb-1">Core_Node // KRT</p>
//              <p className="text-sm font-bold tracking-tight italic">الخرطوم، جمهورية السودان</p>
//           </div>
//        </div>
//     </div>

//   </div>
// </div>

//        {/* Stats Bento - Precise KPI View - Refined for 500K project feel */}
//       {/* <div className="px-4 sm:px-6 lg:px-16 py-4 lg:py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 relative z-10">
//         <motion.div 
//           whileHover={{ y: -4, scale: 1.02 }}
//           className="umran-card p-4 sm:p-6 lg:p-8 group overflow-hidden relative shadow-2xl bg-white border border-slate-100"
//         >
//           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -z-10 group-hover:bg-emerald-500/10 transition-all duration-1000" />
//           <div className="flex justify-between items-start mb-8">
//              <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(16,185,129,0.2)] group-hover:rotate-[12deg] transition-all duration-700">
//                 <Activity size={28} strokeWidth={2.5} />
//              </div>
//              <div className="flex flex-col items-end">
//                 <div className="p-2 px-4 rounded-xl bg-emerald-50 text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] border border-emerald-100 backdrop-blur-3xl flex items-center gap-2 mb-2 shadow-sm italic">
//                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]" />
//                    SENSORS_LIVE
//                 </div>
//                 <span className="text-[9px] font-black text-slate-300 font-mono tracking-widest uppercase">TS_ID: 882-SDN</span>
//              </div>
//           </div>
//           <div className="relative">
//             <p className="text-4xl lg:text-5xl font-black text-slate-900 mb-2 font-mono italic leading-none group-hover:translate-x-2 transition-transform duration-700 tracking-tighter">١٢</p>
//             <div className="h-1 w-8 bg-emerald-500 mb-3 group-hover:w-16 transition-all duration-1000 rounded-full shadow-[0_0_15px_#10b981]" />
//           </div>
//           <p className="text-[10px] font-black text-slate-400 group-hover:text-emerald-700 transition-colors tracking-widest uppercase font-mono italic">البلاغات النشطة // ACTIVE</p>
//         </motion.div>

//         <motion.div 
//           whileHover={{ y: -4, scale: 1.02 }}
//           className="umran-card p-4 sm:p-6 lg:p-8 group overflow-hidden relative shadow-2xl bg-white border border-slate-100"
//         >
//           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -z-10 group-hover:bg-blue-500/10 transition-all duration-1000" />
//           <div className="flex justify-between items-start mb-8">
//              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(59,130,246,0.2)] group-hover:rotate-[-12deg] transition-all duration-700">
//                 <ThumbsUp size={28} strokeWidth={2.5} />
//              </div>
//              <div className="flex flex-col items-end">
//                 <div className="p-2 px-4 rounded-xl bg-blue-50 text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] border border-blue-100 backdrop-blur-3xl flex items-center gap-2 mb-2 shadow-sm italic">
//                    +٤٢٪ VOL
//                 </div>
//                 <span className="text-[9px] font-black text-slate-300 font-mono tracking-widest uppercase">UNIT: HUB_A1</span>
//              </div>
//           </div>
//           <div className="relative">
//             <p className="text-4xl lg:text-5xl font-black text-slate-900 mb-2 font-mono italic leading-none group-hover:translate-x-2 transition-transform duration-700 tracking-tighter">٢٤٥</p>
//             <div className="h-1 w-8 bg-blue-500 mb-3 group-hover:w-16 transition-all duration-1000 rounded-full shadow-[0_0_15px_#3b82f6]" />
//           </div>
//           <p className="text-[10px] font-black text-slate-400 group-hover:text-blue-700 transition-colors tracking-widest uppercase font-mono italic">المساهمات // PULSE</p>
//         </motion.div>

//         <motion.div 
//           whileHover={{ y: -4, scale: 1.02 }}
//           className="umran-card p-4 sm:p-6 lg:p-8 group overflow-hidden relative shadow-2xl bg-white border border-slate-100"
//         >
//           <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -z-10 group-hover:bg-amber-500/10 transition-all duration-1000" />
//           <div className="flex justify-between items-start mb-8">
//              <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(245,158,11,0.2)] group-hover:rotate-[15deg] transition-all duration-700">
//                 <ShieldCheck size={28} strokeWidth={2.5} />
//              </div>
//              <div className="flex flex-col items-end">
//                 <div className="p-2 px-4 rounded-xl bg-amber-50 text-[9px] font-black text-amber-600 uppercase tracking-[0.3em] border border-amber-100 backdrop-blur-3xl flex items-center gap-2 mb-2 shadow-sm italic">
//                    SECURED_SSL
//                 </div>
//                 <span className="text-[9px] font-black text-slate-300 font-mono tracking-widest uppercase">ENC: AES_256</span>
//              </div>
//           </div>
//           <div className="relative">
//             <p className="text-4xl lg:text-5xl font-black text-slate-900 mb-2 font-mono italic leading-none group-hover:translate-x-2 transition-transform duration-700 tracking-tighter">١٠٠٪</p>
//             <div className="h-1 w-8 bg-amber-500 mb-3 group-hover:w-16 transition-all duration-1000 rounded-full shadow-[0_0_15px_#f59e0b]" />
//           </div>
//           <p className="text-[10px] font-black text-slate-400 group-hover:text-amber-700 transition-colors tracking-widest uppercase font-mono italic">أمن النظام // SHIELD</p>
//         </motion.div>

//         <motion.div 
//           whileHover={{ y: -4, scale: 1.02 }}
//           className="umran-card p-4 sm:p-6 lg:p-8 group overflow-hidden relative shadow-2xl bg-white border border-slate-100"
//         >
//           <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full -z-10 group-hover:bg-rose-500/10 transition-all duration-1000" />
//           <div className="flex justify-between items-start mb-8">
//              <div className="w-14 h-14 rounded-2xl bg-brand-red flex items-center justify-center text-white shadow-[0_20px_50px_rgba(239,68,68,0.2)] group-hover:rotate-[-10deg] transition-all duration-700">
//                 <Trophy size={28} strokeWidth={2.5} />
//              </div>
//              <div className="flex flex-col items-end">
//                 <div className="p-2 px-4 rounded-xl bg-rose-50 text-[9px] font-black text-rose-600 uppercase tracking-[0.3em] border border-rose-100 backdrop-blur-3xl flex items-center gap-2 mb-2 shadow-sm italic">
//                    PRIORITY_H
//                 </div>
//                 <span className="text-[9px] font-black text-slate-300 font-mono tracking-widest uppercase">RANK: 09</span>
//              </div>
//           </div>
//           <div className="relative">
//             <p className="text-4xl lg:text-5xl font-black text-slate-900 mb-2 font-mono italic leading-none group-hover:translate-x-2 transition-transform duration-700 tracking-tighter">٨.٥</p>
//             <div className="h-1 w-8 bg-brand-red mb-3 group-hover:w-16 transition-all duration-1000 rounded-full shadow-[0_0_15px_#ef4444]" />
//           </div>
//           <p className="text-[10px] font-black text-slate-400 group-hover:text-brand-red transition-colors tracking-widest uppercase font-mono italic">مؤشر الإعمار // PULSE</p>
//         </motion.div>
//       </div> */}

//       {/* Stats Bento - واجهة مؤشرات الأداء المطورة لمنصة عُمران */}
// <div className="px-6 lg:px-16 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
  
//   {[
//     { label: "البلاغات النشطة", value: "١٢", sub: "ACTIVE", icon: Activity, color: "emerald", id: "882-SDN", tag: "LIVE" },
//     { label: "المساهمات", value: "٢٤٥", sub: "PULSE", icon: ThumbsUp, color: "blue", id: "HUB_A1", tag: "+٤٢٪" },
//     { label: "أمن النظام", value: "١٠٠٪", sub: "SHIELD", icon: ShieldCheck, color: "amber", id: "AES_256", tag: "SECURED" },
//     { label: "مؤشر الإعمار", value: "٨.٥", sub: "RANK", icon: Trophy, color: "rose", id: "LVL_09", tag: "PRIORITY" }
//   ].map((stat, idx) => (
//     <motion.div 
//       key={idx}
//       whileHover={{ y: -5 }}
//       className="relative group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50"
//     >
//       {/* تأثير التوهج الخلفي (Gradient Glow) */}
//       <div className={`absolute -top-20 -right-20 w-48 h-48 bg-${stat.color}-500/5 blur-[80px] rounded-full group-hover:bg-${stat.color}-500/10 transition-all duration-700`} />

//       <div className="relative z-10 flex flex-col h-full">
//         {/* الجزء العلوي: الأيقونة والوسوم التقنية */}
//         <div className="flex justify-between items-start mb-10">
//           <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-600 flex items-center justify-center text-white shadow-lg shadow-${stat.color}-500/20 group-hover:rotate-6 transition-transform duration-500`}>
//             <stat.icon size={26} strokeWidth={2} />
//           </div>
//           <div className="text-right">
//             <div className={`px-3 py-1 rounded-full bg-${stat.color}-50 text-${stat.color}-600 text-[9px] font-black tracking-widest border border-${stat.color}-100 italic mb-2 inline-block`}>
//               {stat.tag} // SYS_SYNC
//             </div>
//             <p className="text-[8px] font-bold text-slate-300 font-mono tracking-widest uppercase">{stat.id}</p>
//           </div>
//         </div>

//         {/* الجزء الأوسط: القيمة الرقمية */}
//         <div className="mb-4">
//           <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic font-display group-hover:translate-x-1 transition-transform duration-500">
//             {stat.value}
//           </h3>
//           <div className={`h-1 w-10 bg-${stat.color}-500 mt-2 rounded-full group-hover:w-20 transition-all duration-700 shadow-[0_0_15px_rgba(var(--tw-color-${stat.color}-500),0.5)]`} />
//         </div>

//         {/* الجزء السفلي: المسمى الوظيفي */}
//         <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase font-mono italic flex items-center gap-2">
//           <span className={`w-1 h-1 rounded-full bg-${stat.color}-500`} />
//           {stat.label} // {stat.sub}
//         </p>
//       </div>
//     </motion.div>
//   ))}
// </div>

//       {/* Visionary Sudanese Statement Section */}
//       <section className="px-4 lg:px-16 mb-12 lg:mb-20 relative">
//         <div className="max-w-7xl mx-auto bg-white/40 backdrop-blur-3xl rounded-xl p-6 sm:p-10 lg:p-16 overflow-hidden relative border border-slate-100 shadow-2xl shimmer">
//           <div className="absolute inset-0 opacity-[0.01] sudan-pattern-modern pointer-events-none scale-150 rotate-3" />
//           <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
          
//           <div className="relative z-10 text-center space-y-6 sm:space-y-10 lg:space-y-12">
//             {/* <motion.div 
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               className="inline-flex items-center gap-3 lg:gap-4 px-6 lg:px-10 py-3 rounded-full bg-slate-100 border border-slate-200 text-emerald-600 text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.6em] backdrop-blur-3xl shadow-sm italic"
//             >
//               <Star size={16} className="text-amber-500 animate-spin-slow" />
//               مـيـثـاق الـبـنـاء والـتـعـمـيـر // VISION_2026
//             </motion.div> */}
//           <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="inline-flex items-center gap-4 px-8 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl"
//         >
//           <div className="flex items-center gap-2">
//             <Star size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
//             <span className="text-[10px] font-black uppercase tracking-[0.4em] font-mono">Vision_2026</span>
//           </div>
//           <div className="w-px h-4 bg-slate-700" />
//           <span className="text-[11px] font-bold italic text-slate-300">مـيـثـاق الـبـنـاء</span>
//         </motion.div>
            
//             <motion.h2 
//               initial={{ opacity: 0, scale: 0.9 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: 0.2 }}
//               className="text-3xl sm:text-5xl lg:text-8xl font-display text-slate-900 leading-[1.2] lg:leading-[1.1] italic tracking-tighter"
//             >
//               " نَبْنِي السُّودَانَ بِرُؤْيَةٍ وَطَنِـيَّةٍ <br className="hidden sm:block" /> 
//               <span className="text-emerald-600 drop-shadow-[0_0_30px_rgba(16,185,129,0.2)]">وَسَوَاعِدَ لاَ تَعْرِفُ المُسْتَحِيلَ </span>"
//             </motion.h2>
            
//             <motion.p 
//               initial={{ opacity: 0 }}
//               whileInView={{ opacity: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: 0.4 }}
//               className="max-w-3xl mx-auto text-slate-500 text-sm sm:text-base lg:text-2xl font-medium leading-[1.8] lg:leading-relaxed px-2 sm:px-4 italic"
//             >
//               نحن لا نقوم بترميم المباني فحسب، بل نعيد صياغة المستقبل الرقمي للسودان، حيث تكون الشفافية والعدالة والسرعة هي ركائز النهضة العمرانية الشاملة.
//             </motion.p>
            
//             {/* <div className="flex flex-wrap justify-center gap-4 sm:gap-8 lg:gap-16 pt-4 sm:pt-6 lg:pt-10">
//                {[
//                  { label: 'النزاهة', color: 'bg-emerald-500' },
//                  { label: 'السرعة', color: 'bg-blue-500' },
//                  { label: 'الشفافية', color: 'bg-amber-500' },
//                ].map((p, i) => (
//                  <motion.div 
//                    key={p.label}
//                    initial={{ opacity: 0, y: 20 }}
//                    whileInView={{ opacity: 1, y: 0 }}
//                    viewport={{ once: true }}
//                    transition={{ delay: 0.6 + (i * 0.1) }}
//                    className="flex items-center gap-4 group"
//                  >
//                    <div className={cn("w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] group-hover:scale-150 transition-transform", p.color)} />
//                    <span className="text-slate-900 font-black uppercase tracking-[0.4em] text-[11px] font-mono">{p.label}</span>
//                  </motion.div>
//                ))}
//             </div> */}
//                     <div className="flex flex-wrap justify-center gap-6 lg:gap-12 pt-8">
//           {[
//             { label: 'النزاهة', color: 'emerald' },
//             { label: 'السرعة', color: 'blue' },
//             { label: 'الشفافية', color: 'amber' },
//           ].map((p, i) => (
//             <motion.div 
//               key={p.label}
//               initial={{ opacity: 0, scale: 0.8 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: 0.7 + (i * 0.1) }}
//               className="flex items-center gap-4 bg-white/50 px-6 py-3 rounded-2xl border border-slate-100 shadow-sm group/item hover:bg-white transition-all"
//             >
//               <div className={`w-2.5 h-2.5 rounded-full bg-${p.color}-500 shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover/item:scale-125 transition-transform`} />
//               <span className="text-slate-900 font-black uppercase tracking-[0.2em] text-[12px] font-mono">{p.label}</span>
//             </motion.div>
//           ))}
//         </div>
//           </div>
//         </div>
//       </section>

//       {/* Multi-Channel Bridge Visualization */}
//       <div className="px-4 lg:px-16 mb-12 lg:mb-20">
//         <div className="bg-white/[0.02] backdrop-blur-3xl rounded-xl p-8 lg:p-14 relative overflow-hidden group border border-white/10 shadow-2xl">
//           <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] sudan-pattern-modern pointer-events-none scale-150 rotate-3" />
//           <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-1000" />
          
//           <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 relative z-10">
//             <div className="text-center lg:text-right space-y-6 max-w-xl">
//                <div className="flex items-center gap-4 justify-center lg:justify-end mb-6">
//                   <span className="px-6 py-2 rounded-full bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl backdrop-blur-xl">SYSTEM_BRIDGE</span>
//                   <div className="flex gap-1.5">
//                     {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-4 bg-emerald-500/30 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
//                   </div>
//                </div>
//             <h2 className="text-4xl lg:text-7xl font-black text-slate-900 font-display leading-tight italic tracking-tighter text-center lg:text-right">التوصيل الرقمي الشامل // OMNI_SDN</h2>
//             <p className="text-base lg:text-xl text-slate-500 font-medium leading-relaxed font-sans mt-2 text-center lg:text-right">
//               بنية تحتية مرنة تتجاوز قيود الاتصال. ندمج قنوات <span className="text-emerald-600 font-bold italic">الويب، الرسائل النصية، ونظام USSD</span> لضمان وصول صوت كل مواطن من أي مكان في السودان.
//             </p>
//             </div>

//             <div className="flex gap-8 lg:gap-12 flex-wrap justify-center">
//               {[
//                 { label: 'الويب والتطبيق', value: '٦٤٪', icon: <Globe size={28} />, color: 'bg-emerald-600', accent: 'group-hover/item:text-emerald-600' },
//                 { label: 'الرسائل النصية', value: '٢٢٪', icon: <MessageSquare size={28} />, iconSize: 24, color: 'bg-blue-600', accent: 'group-hover/item:text-blue-600' },
//                 { label: 'نظام USSD', value: '١٤٪', icon: <Hash size={28} />, iconSize: 24, color: 'bg-amber-600', accent: 'group-hover/item:text-amber-600' },
//               ].map((source, i) => (
//                 <div key={i} className="bg-white border border-slate-100 p-8 rounded-2xl w-52 text-center space-y-5 shadow-xl hover:border-emerald-500/30 transition-all group/item hover:-translate-y-3 duration-700">
//                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl transition-all group-hover/item:scale-110 group-hover/item:rotate-[10deg]", source.color)}>
//                       {source.icon}
//                    </div>
//                    <p className="text-4xl font-black text-slate-900 font-mono tracking-tighter italic">{source.value}</p>
//                    <p className={cn("text-[10px] font-black uppercase tracking-[0.4em] font-mono transition-colors text-slate-400", source.accent)}>{source.label}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>



// {/* Control Panel & Mission Grid // تحسين الواجهة وتبسيط المنطق البصري */}
// <div className="px-6 lg:px-16 pb-40 space-y-10 relative z-10">
  
//   {/* 1. منطقة البحث والتحكم السريع */}
//   <div className="flex flex-col lg:flex-row gap-6 items-center">
//     <div className="relative group flex-1 w-full">
//       <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={24} />
//       <input 
//         type="text" 
//         placeholder="البحث عن بلاغ أو منطقة..." 
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         className="w-full pr-16 pl-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-xl font-bold focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-right shadow-sm placeholder:text-slate-300"
//       />
//     </div>
    
//     <button 
//       onClick={() => setShowFilters(!showFilters)}
//       className={cn(
//         "flex items-center gap-3 px-8 py-5 rounded-[2rem] font-bold transition-all border-2",
//         showFilters ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-100 text-slate-600 hover:border-emerald-500"
//       )}
//     >
//       <span>{showFilters ? 'إغلاق التصفية' : 'تصفية النتائج'}</span>
//       <Filter size={20} />
//     </button>
//   </div>

//   {/* 2. قسم الفلاتر المبسط */}
//   <AnimatePresence>
//     {showFilters && (
//       <motion.div
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -10 }}
//         className="bg-slate-50/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white grid grid-cols-1 md:grid-cols-3 gap-8"
//       >
//         {/* فئة البلاغ */}
//         <div className="space-y-4">
//           <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right px-2">المؤسسة</label>
//           <select 
//             onChange={(e) => setSelectedInstitutionFilter(e.target.value)}
//             className="w-full p-4 rounded-2xl border-none shadow-sm font-bold text-right outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500"
//           >
//             <option value="all">كافة المؤسسات</option>
//             {INSTITUTIONS.map(inst => <option key={inst.id} value={inst.id}>{inst.fullName}</option>)}
//           </select>
//         </div>

//         {/* الترتيب */}
//         <div className="space-y-4">
//           <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right px-2">ترتيب حسب</label>
//           <div className="flex gap-2">
//             <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} className="p-4 bg-white rounded-2xl shadow-sm hover:text-emerald-500 transition-colors">
//               <MoreVertical size={20} className={cn("transition-transform", sortOrder === 'asc' && "rotate-180")} />
//             </button>
//             <button onClick={() => setSortBy('date')} className="flex-1 p-4 bg-white rounded-2xl shadow-sm font-bold text-slate-600">الأحدث أولاً</button>
//           </div>
//         </div>

//         {/* مصدر البلاغ */}
//         <div className="space-y-4">
//           <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right px-2">المصدر</label>
//           <button 
//             onClick={() => setCitizenOnly(!citizenOnly)}
//             className={cn("w-full p-4 rounded-2xl font-bold transition-all shadow-sm flex justify-between items-center", citizenOnly ? "bg-emerald-600 text-white" : "bg-white text-slate-600")}
//           >
//             <div className={cn("w-5 h-5 rounded-full border-2 border-current flex items-center justify-center", citizenOnly && "bg-white")}>
//                {citizenOnly && <Check size={12} className="text-emerald-600" />}
//             </div>
//             <span>بلاغات المواطنين فقط</span>
//           </button>
//         </div>
//       </motion.div>
//     )}
//   </AnimatePresence>

//   {/* 3. شبكة المحتوى (الخريطة والنشاط) */}
//   <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
    
//     {/* حاوية الخريطة */}
//     <div className="xl:col-span-8 relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white h-[600px] lg:h-[750px]">
      
//       {/* HUD: معلومات الخريطة الشفافة */}
//       <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
//         <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
//           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//           <span className="text-sm font-black text-slate-900 font-mono tracking-tighter">LIVE // {filteredIssues.length} REPORTS</span>
//         </div>
//       </div>

//       {/* الخريطة الفعلية */}
//       <div ref={mapRef} className="w-full h-full grayscale-[0.2] contrast-[1.1]" />

//       {/* شاشة الخطأ المبسطة */}
//       {mapError && (
//         <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-md flex items-center justify-center p-10 text-center z-30">
//           <div className="max-w-xs space-y-4">
//             <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
//               <AlertTriangle size={32} />
//             </div>
//             <h3 className="text-xl font-bold text-slate-900">الخريطة المتقدمة غير متوفرة</h3>
//             <p className="text-sm text-slate-500">تم تفعيل وضع العرض الاحتياطي لضمان استمرارية الخدمة.</p>
//             <button onClick={() => setMapError(null)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">متابعة</button>
//           </div>
//         </div>
//       )}
//     </div>

//     {/* حاوية النشاط الجانبية */}
//     <div className="xl:col-span-4 space-y-6 overflow-y-auto max-h-[750px] pr-2 no-scrollbar">
//        {/* هنا تضع قائمة البلاغات النشطة أو التنبيهات */}
//        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-50 shadow-xl">
//           <h4 className="text-2xl font-black text-slate-900 mb-6 italic">آخر النشاطات</h4>
//           <div className="space-y-4">
//             {/* مثال لبلاغ مبسط */}
//             {filteredIssues.slice(0, 5).map((issue) => (
//               <div key={issue.id} className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-colors cursor-pointer group border border-transparent hover:border-emerald-100">
//                 <div className="flex justify-between items-start mb-2">
//                   <span className="text-[10px] font-mono text-slate-400">#{issue.trackingId}</span>
//                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
//                 </div>
//                 <p className="font-bold text-slate-700 text-right leading-relaxed">{issue.description}</p>
//               </div>
//             ))}
//           </div>
//        </div>
//     </div>

//   </div>
// </div>
      

//        {/* National Partners Showcase - Premium Scrolling List */}
//        <div className="pt-20 pb-12 mt-16 bg-white/40 backdrop-blur-3xl rounded-[4rem] lg:rounded-[5rem] p-12 border border-slate-100 shadow-2xl">
//          {/* <div className="flex flex-col items-center mb-12 space-y-4">
//            <div className="w-16 h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-800 mb-6 rounded-full opacity-50" />
//            <h3 className="text-[14px] lg:text-[16px] font-black text-slate-900 text-center tracking-[0.3em] uppercase italic font-display">شركاء الإعمار الوطنيين الاستراتيجيين</h3>
//            <p className="text-[11px] text-slate-400 font-black italic tracking-widest uppercase font-mono">المؤسسات والوزارات والجهات المكلفة بالحلول // STRATEGIC_PARTNERS</p>
//          </div> */}
//         <div className="flex flex-col items-center mb-16 px-6 text-center">
//       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
//         <span className="relative flex h-2 w-2">
//           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
//           <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
//         </span>
//         <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest font-mono">Strategic Network</span>
//       </div>
//       <h3 className="text-xl lg:text-2xl font-black text-slate-900 mb-2 tracking-tight">شركاء الإعمار الوطنيين الاستراتيجيين</h3>
//       <p className="text-[10px] lg:text-xs text-slate-400 font-medium uppercase tracking-[0.1em]">المؤسسات والوزارات والجهات المكلفة بالحلول</p>
//     </div>
        

//         <div className="relative">
//       {/* تأثير التلاشي الجانبي (Glass Gradients) لإضفاء لمسة احترافية */}
//       <div className="absolute inset-y-0 left-0 w-24 lg:w-48 bg-gradient-to-r from-white/60 to-transparent z-10 pointer-events-none" />
//       <div className="absolute inset-y-0 right-0 w-24 lg:w-48 bg-gradient-to-l from-white/60 to-transparent z-10 pointer-events-none" />

//       {/* منطقة الحركة اللانهائية - نكرر المصفوفة لضمان استمرار الحركة */}
//       <div className="flex overflow-hidden group" dir="ltr">
//         {[...Array(2)].map((_, i) => (
//           <motion.div 
//             key={i}
//             initial={{ x: 0 }}
//             animate={{ x: "-100%" }}
//             transition={{ 
//               duration: 35, 
//               repeat: Infinity, 
//               ease: "linear" 
//             }}
//             className="flex shrink-0 items-center gap-12 lg:gap-24 pr-12 lg:pr-24"
//           >
//             {INSTITUTIONS.map((inst) => (
//               <div 
//                 key={inst.id}
//                 onClick={() => setViewingInstitution(inst)}
//                 className="flex flex-col items-center gap-5 group/item cursor-pointer transition-transform duration-500 hover:scale-110"
//               >
//                 {/* Logo Container - تصميم دائري بسيط وراقي */}
//                 <div className="w-20 h-20 lg:w-32 lg:h-32 rounded-full bg-white border border-slate-50 flex items-center justify-center p-5 shadow-sm group-hover/item:shadow-2xl group-hover/item:border-emerald-200 transition-all relative overflow-hidden">
//                   {inst.logo ? (
//                     <img 
//                       src={inst.logo} 
//                       alt={inst.name} 
//                       className="w-full h-full object-contain filter grayscale group-hover/item:grayscale-0 opacity-60 group-hover/item:opacity-100 transition-all duration-700" 
//                       referrerPolicy="no-referrer"
//                     />
//                   ) : (
//                     <Building className="text-slate-200" size={32} />
//                   )}
//                 </div>
                
//                 {/* معلومات المؤسسة - تظهر تحت الشعار مباشرة */}
//                 <div className="text-center space-y-1">
//                   <span className="text-[10px] lg:text-[12px] font-black text-slate-800 block whitespace-nowrap tracking-tight group-hover/item:text-emerald-700 transition-colors">
//                     {inst.name}
//                   </span>
//                   <span className={cn(
//                     "text-[8px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-md",
//                     inst.type !== 'partner' ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-500"
//                   )}>
//                     {inst.type !== 'partner' ? 'حكومي' : 'خاص'}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </motion.div>
//         ))}
//       </div>
//         </div>
        

//       </div>

      

//         {/* Real-time Reconstruction Log Terminal */}
//         <div className="mt-12 bg-white rounded-[3rem] p-8 border border-slate-100 overflow-hidden relative group shadow-2xl">
//            <div className="absolute inset-0 sudan-pattern-modern opacity-5 pointer-events-none" />
//            <div className="flex justify-between items-center mb-6">
//               <div className="flex items-center gap-3">
//                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
//                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] font-mono italic">OPERATIONAL_DATA_FEED // LIVE</h4>
//               </div>
//               <p className="text-[10px] font-black text-slate-300 font-mono tracking-widest">KRT_NODE_01</p>
//            </div>
           
//            <div className="space-y-3 font-mono text-[9px] text-emerald-700/70">
//               <div className="flex gap-4">
//                  <span className="text-slate-300 shrink-0">[{new Date().toLocaleTimeString()}]</span>
//                  <p><span className="text-slate-900 font-black">SYSTEM:</span> جاري تحديث الخرائط الميدانية لولاية الخرطوم... <span className="text-slate-400">DONE</span></p>
//               </div>
//               <div className="flex gap-4">
//                  <span className="text-slate-300 shrink-0">[{new Date().toLocaleTimeString()}]</span>
//                  <p><span className="text-slate-900 font-black">MAP:</span> تم رصد ٥ بلاغات جديدة في منطقة بحري - قطاع المياه.</p>
//               </div>
//               <div className="flex gap-4 animate-pulse">
//                 <span className="text-slate-300 shrink-0">[{new Date().toLocaleTimeString()}]</span>
//                 <p><span className="text-emerald-600 font-black">REBUILD:</span> فريق صيانة الكهرباء تحرك الآن في قطاع أمدرمان القديمة.</p>
//               </div>
//               <div className="flex gap-4 opacity-50">
//                 <span className="text-slate-300 shrink-0">[{new Date().toLocaleTimeString()}]</span>
//                 <p><span className="text-slate-900 font-black">AUTH:</span> تم التحقق من دخول مسؤول جديد عبر بوابة الوزارة.</p>
//               </div>
//            </div>
           
//            {/* Terminal Scanning Effect */}
//            <motion.div 
//              animate={{ top: ['0%', '100%'] }}
//              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
//              className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none"
//            />
//         </div>

//         <AnimatePresence>
//           {selectedIssue && (
//             <IssueDetail 
//               issue={selectedIssue} 
//               onClose={() => setSelectedIssue(null)} 
//             />
//           )}
//           {viewingInstitution && (
//             <InstitutionDetail 
//               institution={viewingInstitution} 
//               onClose={() => setViewingInstitution(null)} 
//               rank={INSTITUTIONS.findIndex(i => i.id === viewingInstitution.id) + 1}
//             />
//           )}
//           {showPitch && (
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 z-[100] bg-white overflow-y-auto"
//             >
//               <HackathonPitch onClose={() => setShowPitch(false)} />
//             </motion.div>
//           )}
//           <OfflineReporting 
//             isOpen={showOfflineMode} 
//             onClose={() => setShowOfflineMode(false)} 
//           />
//           {showPlatformProfile && (
//             <PlatformProfile onClose={() => setShowPlatformProfile(false)} />
//           )}
//         </AnimatePresence>

      
      

//     </div>
    

    
//     );
//   }

// function MapSkeleton() {
//   return (
//     <div className="absolute inset-0 bg-white flex items-center justify-center overflow-hidden">
//       <div className="absolute inset-0 opacity-[0.05] tech-grid-unified" />
//       <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-500/5 to-transparent animate-[shimmer_3s_infinite]" />
      
//       {/* Mock Map Lines - Tactical look */}
//       <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
//         <path d="M0 100 Q 250 50 500 150 T 1000 100" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="10 5" />
//         <path d="M-100 200 L 1200 400" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="5 5" />
//         <path d="M300 0 L 300 600" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="15 10" />
//       </svg>

//       <div className="relative flex flex-col items-center gap-10">
//         <div className="relative">
//           <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-xl flex items-center justify-center animate-pulse">
//             <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
//               <MapIcon size={40} className="animate-bounce" />
//             </div>
//           </div>
//           <motion.div 
//             animate={{ scale: [1, 2, 1], opacity: [0.05, 0.1, 0.05] }}
//             transition={{ duration: 3, repeat: Infinity }}
//             className="absolute -inset-10 bg-emerald-500 rounded-full -z-10 blur-3xl opacity-20"
//           />
//         </div>
//         <div className="text-center space-y-3">
//           <p className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.5em] animate-pulse font-mono italic">جاري تحميل الخريطة الميدانية // MAP_SYNC...</p>
//           <div className="w-48 h-1 bg-slate-100 mx-auto rounded-full overflow-hidden">
//              <motion.div 
//                animate={{ x: ['-100%', '100%'] }}
//                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
//                className="h-full w-1/2 bg-emerald-500 shadow-[0_0_10px_#10b981]"
//              />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

//       // {/* Control Panel & Mission Grid */}
//       // <div className="px-6 lg:px-16 pb-40 space-y-12 relative z-10">
        
//       //   {/* Search and Filters area - Command Center Style */}
//       //   <div className="flex flex-col lg:flex-row gap-8 items-stretch">
//       //     <div className="relative group flex-1">
//       //       <div className="absolute inset-0 bg-emerald-500/5 blur-[80px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
//       //       <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-4 z-20">
//       //          <Search className="text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500 scale-125" size={28} />
//       //          <div className="h-6 w-px bg-slate-100" />
//       //       </div>
//       //       <input
//       //         type="text"
//       //         placeholder="البحث الوطني // SEARCH_SDN"
//       //         value={searchQuery}
//       //         onChange={(e) => setSearchQuery(e.target.value)}
//       //         className="w-full pr-14 md:pr-24 pl-6 lg:pl-10 py-6 md:py-10 bg-white border border-slate-100 rounded-lg sm:rounded-xl text-xl md:text-3xl font-black focus:border-emerald-500/50 outline-none transition-all text-right shadow-2xl placeholder:text-slate-200 relative z-10 focus:bg-slate-50 font-mono italic text-slate-900 tracking-tighter"
//       //       />
//       //       <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-4 z-20">
//       //          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] font-mono italic">AI_ENHANCED_SEARCH</span>
//       //          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
//       //             <Command size={20} />
//       //          </div>
//       //       </div>
//       //     </div>
          
//       //     <button
//       //       onClick={() => setShowFilters(!showFilters)}
//       //       className={cn(
//       //         "px-10 rounded-xl flex items-center justify-center gap-4 transition-all active:scale-95 border-2 shrink-0 group relative overflow-hidden shadow-xl",
//       //         showFilters ? "bg-emerald-600 border-emerald-500 text-white" : "bg-white border-slate-100 text-slate-400 hover:border-emerald-500 hover:text-emerald-600"
//       //       )}
//       //     >
//       //       <span className="text-[11px] font-black uppercase tracking-[0.4em] italic">{showFilters ? 'إخفاء الفلاتر' : 'تخصيص'}</span>
//       //       <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all border", showFilters ? "bg-white/20 border-white/20" : "bg-slate-50 border-slate-100 group-hover:bg-emerald-600 group-hover:text-white")}>
//       //          <Filter size={20} className={cn("transition-transform duration-500", showFilters && "rotate-180")} />
//       //       </div>
//       //     </button>
//       //   </div>

//       //   <AnimatePresence>
//       //     {showFilters && (
//       //       <motion.div
//       //         initial={{ opacity: 0, scale: 0.98, y: -20 }}
//       //         animate={{ opacity: 1, scale: 1, y: 0 }}
//       //         exit={{ opacity: 0, scale: 0.98, y: -20 }}
//       //         className="bg-white p-8 rounded-xl border border-slate-100 mb-8 space-y-10 shadow-2xl"
//       //       >
//       //         <div className="flex flex-col xl:flex-row gap-12 items-stretch">
//       //           {/* Institution Filters */}
//       //           <div className="flex-1 space-y-6">
//       //             <div className="flex items-center justify-between px-6">
//       //                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] text-right font-mono italic">المؤسسة // SECTOR</p>
//       //                <Building size={16} className="text-slate-300" />
//       //             </div>
//       //             <div className="flex gap-3 overflow-x-auto p-2 no-scrollbar scroll-smooth">
//       //               {[
//       //                 { id: 'all', name: 'قاعدة البيانات العامة' },
//       //                 { id: 'unassigned', name: 'بلاغات قيد التوجيه' },
//       //                 ...INSTITUTIONS.map(inst => ({ id: inst.id, name: inst.fullName }))
//       //               ].map((item) => (
//       //                 <button
//       //                   key={item.id}
//       //                   onClick={() => setSelectedInstitutionFilter(item.id)}
//       //                   className={cn(
//       //                     "px-10 py-5 rounded-lg whitespace-nowrap text-[11px] font-black transition-all border shrink-0 uppercase tracking-widest italic",
//       //                     selectedInstitutionFilter === item.id
//       //                       ? "bg-emerald-600 border-emerald-500 text-white shadow-xl scale-105"
//       //                       : "bg-slate-50 border-slate-100 text-slate-400 hover:border-emerald-500 hover:bg-white hover:text-emerald-600"
//       //                   )}
//       //                   dir="rtl"
//       //                 >
//       //                   {item.name}
//       //                 </button>
//       //               ))}
//       //             </div>
//       //           </div>

//       //           <div className="flex flex-col md:flex-row gap-10">
//       //              {/* Sorting Controls */}
//       //              <div className="w-full md:w-72 space-y-6">
//       //                <div className="flex items-center justify-between px-6">
//       //                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] text-right font-mono italic">الترتيب // SORT</p>
//       //                   <TrendingUp size={16} className="text-slate-300" />
//       //                </div>
//       //                <div className="flex gap-3 h-16">
//       //                  <button
//       //                    onClick={() => setSortBy(sortBy === 'date' ? 'status' : 'date')}
//       //                    className="flex-1 px-8 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-black text-slate-500 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-between group"
//       //                  >
//       //                    <span className="opacity-60 uppercase tracking-widest italic font-mono">{sortBy === 'date' ? 'الزمن' : 'الحالة'}</span>
//       //                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
//       //                      <History size={16} />
//       //                    </div>
//       //                  </button>
//       //                  <button
//       //                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
//       //                    className="w-16 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-all group shadow-sm"
//       //                  >
//       //                    <MoreVertical size={20} className={cn("transition-transform duration-700", sortOrder === 'asc' && "rotate-180")} />
//       //                  </button>
//       //                </div>
//       //              </div>

//       //              {/* Source Filter */}
//       //              <div className="w-full md:w-64 space-y-6">
//       //                <div className="flex items-center justify-between px-6">
//       //                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] text-right font-mono italic">المصدر // SOURCE</p>
//       //                   <Globe size={16} className="text-slate-300" />
//       //                </div>
//       //                <button
//       //                  onClick={() => setCitizenOnly(!citizenOnly)}
//       //                  className={cn(
//       //                    "w-full h-16 px-8 rounded-lg text-[11px] font-black uppercase tracking-[0.4em] transition-all border flex items-center justify-between gap-6 italic",
//       //                    citizenOnly
//       //                     ? "bg-emerald-600 border-emerald-500 text-white shadow-xl"
//       //                     : "bg-slate-50 border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-500"
//       //                  )}
//       //                >
//       //                  <span>بلاغات المواطنين</span>
//       //                  {citizenOnly ? (
//       //                     <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center shadow-sm">
//       //                        <Check size={18} />
//       //                     </div>
//       //                  ) : (
//       //                     <div className="w-8 h-8 rounded-xl border-2 border-slate-200 bg-white shadow-sm" />
//       //                  )}
//       //                </button>
//       //              </div>
//       //           </div>
//       //         </div>
//       //       </motion.div>
//       //     )}
//       //   </AnimatePresence>

//       //   <AnimatePresence>
//       //     {loading && (
//       //       <motion.div
//       //         initial={{ opacity: 0 }}
//       //         animate={{ opacity: 1 }}
//       //         exit={{ opacity: 0 }}
//       //         className="absolute inset-0 z-50 bg-white/20 backdrop-blur-[2px] pointer-events-none overflow-hidden"
//       //       >
//       //         <motion.div
//       //           animate={{ top: ['-20%', '120%'] }}
//       //           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
//       //           className="absolute inset-x-0 h-[30%] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent -skew-y-12"
//       //         />
//       //       </motion.div>
//       //     )}
//       //   </AnimatePresence>

//       //   <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
//       //     {/* Map Column (Left/Primary) */}
//       //     <div className="lg:col-span-12 xl:col-span-8 order-1 sticky top-6">
//       //       <div
//       //         className="h-[400px] md:h-[500px] lg:h-[600px] xl:h-[750px] relative rounded-xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-4 border-white/5 group"
//       //       >
//       //         {/* National Brand Accent */}
//       //         <div className="absolute top-0 left-0 w-full h-1 flex">
//       //            <div className="flex-1 bg-brand-red" />
//       //            <div className="flex-1 bg-white" />
//       //            <div className="flex-1 bg-slate-50" />
//       //            <div className="flex-1 bg-emerald-500" />
//       //         </div>
              
//       //         {/* Mission Control Labels */}
//       //         <div className="absolute top-10 right-10 z-30 pointer-events-none">
//       //            <div className="bg-white/80 backdrop-blur-3xl border border-slate-100 p-6 rounded-[2.5rem] flex items-center gap-6 shadow-2xl">
//       //               <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_#10b981]" />
//       //               <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.4em] font-mono italic">بث حي // مركز المعلومات الرئيسي // {new Date().toLocaleTimeString('ar-SD')}</span>
//       //            </div>
//       //         </div>

//       //         {error && (
//       //           <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-xl p-8 text-center" dir="rtl">
//       //             <div className="max-w-md space-y-8">
//       //               <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl border border-rose-500/20">
//       //                 <AlertTriangle size={48} />
//       //               </div>
//       //               <div className="space-y-4">
//       //                  <h3 className="text-3xl font-black text-slate-900 font-display italic tracking-tighter">خطأ في الاتصال // SYS_ERR</h3>
//       //                  <p className="text-slate-400 font-medium font-sans leading-relaxed">{error}</p>
//       //               </div>
//       //               <button
//       //                 onClick={() => window.location.reload()}
//       //                 className="px-10 py-4 bg-emerald-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all hover:bg-emerald-500"
//       //               >
//       //                 إعادة المحاولة // REBOOT
//       //               </button>
//       //             </div>
//       //           </div>
//       //         )}

//       //         <div ref={mapRef} className={cn("w-full h-full", mapError && "hidden")} />
              
//       //         {/* Tactical Command Overlay */}
//       //         {!mapError && isMapLoaded && (
//       //           <div className="absolute inset-0 pointer-events-none z-20">
//       //             {/* Subtle Grid Overlay */}
//       //             <div className="absolute inset-0 opacity-[0.05] tech-grid-unified" />
                  
//       //             {/* Digital Vignette - Softened for light mode */}
//       //             <div className="absolute inset-0 shadow-[inset_0_0_300px_rgba(0,0,0,0.05)]" />

//       //             {/* Corner Markers - Command Style */}
//       //             <div className="absolute top-10 left-10 w-16 h-16 border-t-4 border-l-4 border-white/10 rounded-tl-3xl" />
//       //             <div className="absolute bottom-10 right-10 w-16 h-16 border-b-4 border-r-4 border-white/10 rounded-br-3xl" />

//       //             {/* Left Sidebar Info - Mission HUD */}
//       //             <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col gap-6 pointer-events-auto">
//       //               {[
//       //                 { icon: <SignalHigh size={20} />, label: 'NET_STRENGTH', value: 'OPTIMAL', color: 'text-emerald-500' },
//       //                 { icon: <Grid size={20} />, label: 'GRID_RESOLUTION', value: '450m', color: 'text-blue-500' },
//       //                 { icon: <ShieldCheck size={20} />, label: 'ENCRYPTION', value: 'ACTIVE', color: 'text-amber-500' },
//       //               ].map((item, i) => (
//       //                 <motion.div
//       //                   initial={{ opacity: 0, x: -20 }}
//       //                   animate={{ opacity: 1, x: 0 }}
//       //                   transition={{ delay: 0.5 + (i * 0.1) }}
//       //                   key={item.label}
//       //                   className="bg-white/80 backdrop-blur-3xl border border-slate-100 p-5 rounded-[2.5rem] shadow-xl flex items-center gap-5 group cursor-help hover:scale-110 transition-all border-l-4 border-l-emerald-500/50"
//       //                 >
//       //                    <div className={cn("w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center transition-all group-hover:bg-emerald-600 group-hover:text-white shadow-sm border border-slate-100", item.color)}>
//       //                       {item.icon}
//       //                    </div>
//       //                    <div className="pr-2">
//       //                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none mb-1 font-mono italic">{item.label}</p>
//       //                       <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none font-mono">{item.value}</p>
//       //                    </div>
//       //                 </motion.div>
//       //               ))}
//       //             </div>

//       //             {/* Bottom Command Strip */}
//       //             <div className="absolute bottom-10 inset-x-10 flex items-end justify-between">
//       //                <div className="flex gap-4 pointer-events-auto">
//       //                   <button
//       //                     onClick={resetMap}
//       //                     className="bg-white/80 backdrop-blur-3xl border border-slate-100 p-6 rounded-[2.5rem] text-slate-400 hover:bg-emerald-600 hover:text-white transition-all shadow-xl group active:scale-95"
//       //                     title="إعادة تعيين المشهد"
//       //                   >
//       //                      <History size={28} className="group-hover:rotate-[-90deg] transition-transform duration-700" />
//       //                   </button>
//       //                   <div className="bg-white/80 backdrop-blur-3xl border border-slate-100 p-2 rounded-[2.5rem] flex flex-col gap-2 shadow-xl">
//       //                      <button className="w-14 h-14 rounded-2xl bg-slate-50 hover:bg-emerald-600 text-slate-400 hover:text-white transition-all flex items-center justify-center font-black text-xl shadow-sm border border-slate-100 hover:border-emerald-500">＋</button>
//       //                      <div className="h-px bg-slate-100 mx-2" />
//       //                      <button className="w-14 h-14 rounded-2xl bg-slate-50 hover:bg-emerald-600 text-slate-400 hover:text-white transition-all flex items-center justify-center font-black text-xl shadow-sm border border-slate-100 hover:border-emerald-500">－</button>
//       //                   </div>
//       //                </div>

//       //                <div className="flex items-center gap-8 bg-white/90 backdrop-blur-3xl border border-slate-100 p-6 pr-12 rounded-[3rem] shadow-2xl text-right">
//       //                   <div className="space-y-1">
//       //                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.5em] mb-1 font-mono italic">MAP_ANALYTICS // SDN</p>
//       //                      <h4 className="text-2xl font-black text-slate-900 italic font-display tracking-tight">ولاية الخرطوم</h4>
//       //                      <div className="flex gap-2 items-center justify-end">
//       //                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">{filteredIssues.length} بلاغات نشطة</span>
//       //                         <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse" />
//       //                      </div>
//       //                   </div>
//       //                   <div className="h-16 w-px bg-slate-100" />
//       //                   <div className="text-[12px] font-black text-slate-200 uppercase tracking-[0.6em] font-mono italic">KRT_CMD</div>
//       //                </div>
//       //             </div>

//       //   {/* Active Marker HUD (When an issue is focused on map) */}
//       //   <AnimatePresence>
//       //     {activeMarkerIssue && (
//       //       <motion.div
//       //         initial={{ opacity: 0, scale: 0.9, y: 30 }}
//       //         animate={{ opacity: 1, scale: 1, y: 0 }}
//       //         exit={{ opacity: 0, scale: 0.9, y: 30 }}
//       //         className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none flex justify-center z-50 px-10"
//       //       >
//       //          <div className="max-w-2xl w-full bg-white/95 backdrop-blur-3xl border-4 border-emerald-500/50 p-12 rounded-[4rem] shadow-2xl pointer-events-auto relative overflow-hidden group">
//       //             <div className="absolute inset-0 sudan-pattern-modern opacity-[0.01] pointer-events-none scale-150 rotate-3" />
//       //             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-blue-500" />
                  
//       //             <div className="flex items-start justify-between mb-10 flex-row-reverse relative z-10">
//       //                <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-600 shadow-xl group-hover:scale-110 transition-transform duration-700">
//       //                   {getIssueIcon(activeMarkerIssue.type, 40)}
//       //                 </div>
//       //                <button
//       //                  onClick={() => setActiveMarkerIssue(null)}
//       //                  className="w-14 h-14 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white transition-all shadow-sm"
//       //                >
//       //                   <X size={24} />
//       //                </button>
//       //             </div>

//       //             <div className="space-y-8 relative z-10">
//       //                <div className="flex items-center gap-4 justify-end">
//       //                   <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">{formatTimeAgo(activeMarkerIssue.createdAt)}</span>
//       //                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
//       //                   <span className="text-[11px] font-black text-emerald-600 tracking-[0.5em] uppercase font-mono italic">{activeMarkerIssue.trackingId}</span>
//       //                </div>
//       //                <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight italic font-display text-right">{activeMarkerIssue.description}</h3>
                     
//       //                <div className="flex gap-6 pt-10">
//       //                   <button
//       //                     onClick={() => setSelectedIssue(activeMarkerIssue)}
//       //                     className="flex-1 py-7 bg-emerald-600 text-white rounded-[3rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all shadow-xl active:scale-95 italic"
//       //                   >
//       //                     معالجة البلاغ // MANAGE_REPORT
//       //                   </button>
//       //                   <button
//       //                     className="w-24 h-24 rounded-[3rem] border-2 border-slate-100 bg-slate-50 flex items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-400 transition-all shadow-sm"
//       //                   >
//       //                     <Share2 size={28} />
//       //                   </button>
//       //                </div>
//       //             </div>
//       //          </div>
//       //       </motion.div>
//       //     )}
//       //   </AnimatePresence>
//       //           </div>
//       //         )}

              
//       //         {mapError && (
//       //           <div className="absolute inset-0 z-40 bg-slate-100 flex flex-col">
//       //             {/* Warning Toast for API errors - More Integrated & Helpful */}
//       //             {mapError === 'ApiProjectMapError' && (
//       //               <motion.div
//       //                 initial={{ y: -100, opacity: 0 }}
//       //                 animate={{ y: 0, opacity: 1 }}
//       //                 className="absolute top-10 left-1/2 -translate-x-1/2 z-[1000] w-[95%] max-w-2xl bg-white text-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden"
//       //               >
//       //                 <div className="absolute inset-0 sudan-pattern-modern opacity-5 pointer-events-none" />
//       //                 <div className="flex flex-col md:flex-row items-center gap-6 text-right relative z-10" dir="rtl">
//       //                   <div className="w-16 h-16 bg-amber-500 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
//       //                     <AlertTriangle size={32} className="text-slate-950" />
//       //                   </div>
//       //                   <div className="flex-1">
//       //                     <div className="flex items-center gap-3 mb-2">
//       //                       <span className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-500/20">System_Optimization_Required</span>
//       //                       <h4 className="font-black text-lg tracking-tight font-display">تفعيل محرك الخرائط المتقدم</h4>
//       //                     </div>
//       //                     <p className="text-xs font-medium text-slate-400 leading-relaxed font-sans">
//       //                       تم تفعيل <span className="text-emerald-400 font-bold">الوضع الاحتياطي (OpenStreetMap)</span>. لتفعيل الخرائط المتقدمة من جوجل، يرجى التأكد من تفعيل "Maps JavaScript API" في حسابك، أو متابعة العمل في هذا الوضع.
//       //                     </p>
//       //                     <div className="mt-6 flex flex-wrap gap-4">
//       //                       <a
//       //                         href="https://console.cloud.google.com/google/maps-apis/api-list"
//       //                         target="_blank"
//       //                         rel="noopener noreferrer"
//       //                         className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-2"
//       //                       >
//       //                         <ArrowUpRight size={14} />
//       //                         تفعيل من Google Console
//       //                       </a>
//       //                       <button
//       //                         onClick={() => setMapError('using_fallback')}
//       //                         className="px-6 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100"
//       //                       >
//       //                         متابعة في الوضع الحالي
//       //                       </button>
//       //                     </div>
//       //                   </div>
//       //                 </div>
//       //               </motion.div>
//       //             )}

//       //             {mapError === 'missing_key' && (
//       //               <div className="absolute inset-0 z-[1000] flex items-center justify-center p-10 bg-white/60 backdrop-blur-md">
//       //                  <div className="max-w-md w-full bg-white rounded-[4rem] p-12 text-center shadow-2xl relative overflow-hidden" dir="rtl">
//       //                     <div className="absolute inset-0 sudan-pattern-modern opacity-5 pointer-events-none" />
//       //                     <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
//       //                        <MapIcon size={48} />
//       //                     </div>
//       //                     <h3 className="text-3xl font-black text-slate-950 mb-4 font-display">تهيئة الخرائط الوطنية</h3>
//       //                     <p className="text-slate-500 font-medium leading-relaxed mb-10">
//       //                       يرجى إضافة مفتاح Google Maps في إعدادات التطبيق لتفعيل العرض المتقدم، أو البدء باستخدام الخرائط المفتوحة حالياً.
//       //                     </p>
//       //                     <button
//       //                       onClick={() => setMapError('using_fallback')}
//       //                       className="w-full py-5 bg-emerald-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl active:scale-95"
//       //                     >
//       //                       موافق، استمر في العرض البديل
//       //                     </button>
//       //                  </div>
//       //               </div>
//       //             )}

//       //             {/* Fallback to Leaflet */}
//       //             <MapContainer
//       //               center={[15.5007, 32.5599]}
//       //               zoom={12}
//       //               style={{ height: '100%', width: '100%' }}
//       //               zoomControl={false}
//       //             >
//       //               <TileLayer
//       //                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//       //                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       //               />
//       //               <MarkerClusterGroup
//       //                 chunkedLoading
//       //                 maxClusterRadius={50}
//       //                 showCoverageOnHover={false}
//       //               >
//       //                 {filteredIssues.map((issue) => (
//       //                   <LeafletMarker
//       //                     key={issue.id}
//       //                     position={[issue.location.lat, issue.location.lng]}
//       //                     eventHandlers={{
//       //                       click: () => handleMarkerClick(issue),
//       //                     }}
//       //                   >
//       //                     <Popup>
//       //                       <div className="text-right font-black text-xs leading-tight">
//       //                         {issue.trackingId}<br/>
//       //                         {issue.type}
//       //                       </div>
//       //                     </Popup>
//       //                   </LeafletMarker>
//       //                 ))}
//       //               </MarkerClusterGroup>
//       //             </MapContainer>
//       //           </div>
//       //         )}

//       //         {loading && !mapError && (
//       //           <MapSkeleton />
//       //         )}

//       //         {/* Marker Popup Info Card */}
//       //         <AnimatePresence>
//       //           {activeMarkerIssue && (
//       //             <motion.div
//       //               initial={{ opacity: 0, scale: 0.85, y: 20, filter: 'blur(10px)' }}
//       //               animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
//       //               exit={{ opacity: 0, scale: 0.85, y: 20, filter: 'blur(10px)' }}
//       //               transition={{ type: 'spring', damping: 25, stiffness: 300 }}
//       //               className="absolute bottom-6 left-6 right-6 p-5 glass-card shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-30 border border-white/50"
//       //               onClick={(e) => e.stopPropagation()}
//       //             >
//       //               <div className="flex justify-between items-start mb-4">
//       //                 <div className="flex items-center gap-4">
//       //                   <div className={cn(
//       //                     "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-sm",
//       //                     activeMarkerIssue.severity === 3
//       //                       ? "bg-red-50 border-red-100 text-red-500"
//       //                       : "bg-emerald-50 border-emerald-100 text-emerald-500"
//       //                   )}>
//       //                     {getIssueIcon(activeMarkerIssue.type, 24)}
//       //                   </div>
//       //                   <div>
//       //                     <div className="flex items-center gap-2 mb-1 text-right">
//       //                       <h4 className="font-black text-slate-900 text-sm leading-tight font-display tracking-tight">
//       //                         {activeMarkerIssue.type === 'road' ? 'بلاغ طرق' :
//       //                         activeMarkerIssue.type === 'water' ? 'بلاغ مياه' :
//       //                         activeMarkerIssue.type === 'electricity' ? 'بلاغ كهرباء' : 'بلاغ نفايات'}
//       //                       </h4>
//       //                       <span className="px-1.5 py-0.5 bg-slate-100 text-slate-900 rounded-md text-[8px] font-black uppercase tracking-widest">
//       //                         {activeMarkerIssue.trackingId}
//       //                       </span>
//       //                     </div>
//       //                     <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest text-right">
//       //                       {activeMarkerIssue.location.address || 'موقع قيد المراجعة'}
//       //                     </p>
//       //                   </div>
//       //                 </div>
//       //                 <button
//       //                   onClick={() => setActiveMarkerIssue(null)}
//       //                   className="p-2 transition-colors rounded-full hover:bg-slate-100 text-slate-400"
//       //                 >
//       //                   <X size={18} />
//       //                 </button>
//       //               </div>

//       //               <p className="text-sm text-slate-600 line-clamp-2 mb-5 text-right font-medium leading-relaxed">
//       //                 {activeMarkerIssue.description}
//       //               </p>

//       //               <button
//       //                 onClick={() => {
//       //                   setSelectedIssue(activeMarkerIssue);
//       //                   setActiveMarkerIssue(null);
//       //                 }}
//       //                 className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
//       //               >
//       //                 <MapPin size={16} />
//       //                 <span>عرض التفاصيل والتحليلات</span>
//       //               </button>
//       //             </motion.div>
//       //           )}
//       //         </AnimatePresence>
//       //       </div>
//       //     </div>

//       //     {/* Activity/Content Column (Right) */}
//       //     <div className="lg:col-span-12 xl:col-span-4 order-2 space-y-8 min-h-[500px]">
//       //       {/* Tab Navigation Mini - Premium hardware style */}
//       //       <div className="flex gap-1.5 p-1.5 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 sticky top-4 z-40 mb-8 mx-2 overflow-x-auto no-scrollbar shadow-2xl">
//       //         {( (role === 'official' ? ['workstation', 'activity', 'archive', 'alerts', 'payments', 'compete'] : ['activity', 'archive', 'alerts', 'payments', 'compete']) as DashboardTab[]).map((tab) => (
//       //           <button
//       //             key={tab}
//       //             onClick={() => setActiveTab(tab)}
//       //             className={cn(
//       //               "relative flex-1 py-4 sm:py-5 min-w-[3.5rem] rounded-[2rem] flex items-center justify-center gap-2 sm:gap-3 transition-all duration-700 overflow-hidden shrink-0 lg:shrink",
//       //               activeTab === tab ? "text-white shadow-2xl" : "text-white/20 hover:text-white hover:bg-white/5"
//       //             )}
//       //             title={tab === 'activity' ? 'الميدان' : tab === 'archive' ? 'السجل الوطني' : tab === 'alerts' ? 'التحذيرات' : tab === 'payments' ? 'المدفوعات' : 'المنافسة'}
//       //           >
//       //             {activeTab === tab && (
//       //               <motion.div
//       //                 layoutId="activeTabBg"
//       //                 className="absolute inset-0 bg-emerald-600 shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-t border-white/20"
//       //                 transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
//       //               />
//       //             )}
//       //             <div className="relative z-10 flex items-center gap-3">
//       //               {tab === 'workstation' && <ShieldCheck size={18} />}
//       //               {tab === 'activity' && <Grid size={18} />}
//       //               {tab === 'archive' && <History size={18} />}
//       //               {tab === 'alerts' && <Bell size={18} />}
//       //               {tab === 'payments' && <Wallet size={18} />}
//       //               {tab === 'compete' && <Trophy size={18} />}
//       //               <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] font-mono italic">
//       //                 {tab === 'workstation' ? 'عمل' : tab === 'activity' ? 'الميدان' : tab === 'archive' ? 'السجل' : tab === 'alerts' ? 'تنبيه' : tab === 'payments' ? 'مساهمة' : 'فخر'}
//       //               </span>
//       //             </div>
//       //           </button>
//       //         ))}
//       //       </div>

//       //       <AnimatePresence mode="wait">
//       //         {activeTab === 'workstation' && (
//       //           <motion.div
//       //             key="workstation"
//       //             initial={{ opacity: 0, x: 20 }}
//       //             animate={{ opacity: 1, x: 0 }}
//       //             exit={{ opacity: 0, x: -20 }}
//       //             className="space-y-6"
//       //           >
//       //              {/* Dedicated Official Workstation Dashboard */}
//       //              <div className="bg-white rounded-[3.5rem] p-8 border border-slate-100 shadow-2xl relative overflow-hidden">
//       //                 <div className="absolute inset-0 sudan-texture opacity-[0.03] pointer-events-none" />
//       //                 <div className="relative z-10 space-y-8">
//       //                    <div className="flex justify-between items-start">
//       //                       <div className="text-right">
//       //                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-2">CONTROL_ROOM // LIVE_FEED</p>
//       //                          <h3 className="text-3xl font-black text-slate-900 font-display italic leading-tight">وحدة التحكم في البلاغات</h3>
//       //                       </div>
//       //                       <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl">
//       //                          <ShieldCheck size={28} />
//       //                       </div>
//       //                    </div>

//       //                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//       //                       <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
//       //                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">بلاغات غير موجهة</p>
//       //                          <p className="text-3xl font-black text-slate-900 font-mono tracking-tighter">{issues.filter(i => !i.assignedInstitution).length}</p>
//       //                       </div>
//       //                       <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
//       //                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">بلاغات قيد التنفيذ</p>
//       //                          <p className="text-3xl font-black text-slate-900 font-mono tracking-tighter">{issues.filter(i => i.status === 'in-progress').length}</p>
//       //                       </div>
//       //                       <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
//       //                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">معدل الاستجابة</p>
//       //                          <p className="text-3xl font-black text-emerald-600 font-mono tracking-tighter">٨٨٪</p>
//       //                       </div>
//       //                    </div>

//       //                    <div className="space-y-4">
//       //                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] pr-2">البلاغات الحرجة (تحتاج تعيين) //</p>
//       //                       <div className="space-y-3">
//       //                          {issues.filter(i => !i.assignedInstitution).slice(0, 3).map((issue) => (
//       //                            <motion.button
//       //                              key={issue.id}
//       //                              onClick={() => setSelectedIssue(issue)}
//       //                              className="w-full text-right p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-emerald-50 hover:border-emerald-500/30 transition-all flex items-center gap-6 group"
//       //                            >
//       //                               <div className={cn(
//       //                                 "w-14 h-14 rounded-xl flex items-center justify-center border-2 border-white/5 shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-6",
//       //                                 issue.severity === 3 ? "bg-rose-500/20 text-rose-400" : "bg-blue-500/20 text-blue-400"
//       //                               )}>
//       //                                  <MapPin size={28} />
//       //                               </div>
//       //                               <div className="flex-1 min-w-0">
//       //                                  <div className="flex justify-between items-center mb-1">
//       //                                     <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-black tracking-widest font-mono italic">#{issue.trackingId}</span>
//       //                                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono">NEW_REPORT</span>
//       //                                  </div>
//       //                                  <h4 className="text-lg font-black text-white tracking-tight truncate">{issue.description}</h4>
//       //                                  <p className="text-[8px] font-black text-slate-500 truncate uppercase tracking-widest mt-1">{issue.location.address}</p>
//       //                               </div>
//       //                               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
//       //                                  <ArrowRight size={20} className="rotate-180" />
//       //                               </div>
//       //                            </motion.button>
//       //                          ))}
//       //                       </div>
//       //                       {issues.filter(i => !i.assignedInstitution).length > 3 && (
//       //                          <button className="w-full py-4 text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em] hover:bg-white/5 rounded-xl transition-all">عرض كافة البلاغات المعلقة //</button>
//       //                       )}
//       //                    </div>
//       //                 </div>
//       //              </div>
//       //           </motion.div>
//       //         )}
//       //         {activeTab === 'activity' && (
//       //           <motion.div
//       //             key="activity"
//       //             initial={{ opacity: 0, x: 20 }}
//       //             animate={{ opacity: 1, x: 0 }}
//       //             exit={{ opacity: 0, x: -20 }}
//       //             className="space-y-8"
//       //           >
//       //             <div className="flex justify-between items-center px-6 mb-2">
//       //               <h3 className="text-[12px] font-black text-white/20 uppercase tracking-[0.5em] text-right font-mono italic">FEED_SYNC // {filteredIssues.length}_OBJ</h3>
//       //               <div className="flex items-center gap-2">
//       //                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
//       //                  <span className="text-[10px] font-black text-emerald-400 font-mono italic tracking-widest uppercase">تغطية وطنية</span>
//       //               </div>
//       //             </div>

//       //               <div
//       //                 ref={listContainerRef}
//       //                 onScroll={handleScroll}
//       //                 className="space-y-8 max-h-[1200px] overflow-y-auto no-scrollbar pr-3 -mr-3 pb-32"
//       //               >
//       //                 {filteredIssues.map((issue, idx) => {
//       //                   return (
//       //                     <motion.div
//       //                       key={issue.id}
//       //                       initial={{ opacity: 0, y: 30 }}
//       //                       animate={{ opacity: 1, y: 0 }}
//       //                       transition={{
//       //                         delay: (idx % 10) * 0.05,
//       //                         duration: 0.7,
//       //                         ease: "easeOut"
//       //                       }}
//       //                       onClick={() => setSelectedIssue(issue)}
//       //                       className="group cursor-pointer bg-slate-50 border border-slate-100 p-6 lg:p-8 rounded-[2.5rem] hover:border-emerald-500/30 hover:bg-white transition-all duration-700 active:scale-[0.97] relative overflow-hidden flex flex-col gap-6 shadow-sm"
//       //                     >
//       //                       {/* Tactical HUD Accents */}
//       //                       <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-500/10 rounded-tr-[2rem] group-hover:border-emerald-500/50 transition-colors" />
//       //                       <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-500/10 rounded-bl-[2rem] group-hover:border-emerald-500/50 transition-colors" />
                            
//       //                       {/* Premium Highlight Overlay */}
//       //                       <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
//       //                       <div className="absolute top-1/2 -right-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-1000" />
                            
//       //                       <div className="flex justify-between items-start flex-row-reverse relative z-10">
//       //                          <div className="relative group/icon shrink-0">
//       //                            <div className={cn(
//       //                              "w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl transition-all duration-700 group-hover:rotate-[15deg] group-hover:scale-110",
//       //                              issue.severity === 3 ? "bg-rose-500/20 text-rose-500 border-rose-500/20" :
//       //                              issue.severity === 2 ? "bg-amber-500/20 text-amber-600 shadow-amber-500/10 border-amber-100" :
//       //                              "bg-emerald-500/20 text-emerald-500 border-emerald-500/20"
//       //                            )}>
//       //                              {getIssueIcon(issue.type, 24)}
//       //                            </div>
//       //                            {issue.severity === 3 && (
//       //                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 border-2 border-brand-dark rounded-full animate-pulse shadow-[0_0_15px_#f43f5e]" />
//       //                            )}
//       //                          </div>
//       //                          <div className="text-right flex-1 pr-6">
//       //                           <div className="flex items-center gap-3 justify-end mb-2">
//       //                              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-white/30 font-mono tracking-[0.3em] uppercase italic">DATA_NODE // {issue.regionId?.toUpperCase() || 'GLOBAL'}</span>
//       //                              <p className="text-[10px] font-black font-mono text-emerald-500 tracking-widest italic leading-none">#SDN_{issue.trackingId}</p>
//       //                           </div>
//       //                           <h4 className="text-xl lg:text-2xl font-black text-white leading-tight group-hover:text-emerald-400 transition-colors mb-2 italic font-display tracking-tight">
//       //                             {issue.type === 'road' ? 'تأهيل البنية التحتية للطرق' :
//       //                              issue.type === 'water' ? 'تأمين الموارد المائية' :
//       //                              issue.type === 'electricity' ? 'معالجة الشبكة الكهربائية' : 'خدمات الإصحاح البيئي'}
//       //                           </h4>
//       //                          </div>
//       //                       </div>

//       //                       <p className="text-xs lg:text-sm font-medium text-white/40 leading-relaxed text-right line-clamp-2 pr-6 border-r-2 border-white/5 group-hover:border-emerald-500 group-hover:text-white/70 transition-all relative z-10 italic">
//       //                          {issue.description || issue.location.address}
//       //                       </p>

//       //                       <div className="flex justify-between items-center flex-row-reverse border-t border-white/5 pt-6 relative z-10 mt-2">
//       //                          <div className="flex items-center gap-4">
//       //                             <div className="flex flex-col items-end">
//       //                                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] font-mono leading-none mb-1">LOCATION_REF</span>
//       //                                <span className="text-[11px] font-black text-white font-accent tracking-tighter truncate max-w-[150px] italic">{issue.location.address || 'موقع قيد التدقيق'}</span>
//       //                             </div>
//       //                             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 shadow-2xl flex items-center justify-center text-white/20 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all duration-700">
//       //                                <MapPin size={18} />
//       //                             </div>
//       //                          </div>
//       //                          <div className="flex items-center gap-6">
//       //                             <div className="flex flex-col items-start pr-6 border-r border-white/5">
//       //                                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] font-mono leading-none mb-1">TIMESTAMP</span>
//       //                                <span className="text-[10px] font-black text-emerald-500 font-mono italic tracking-[0.1em]">{issue.createdAt ? formatTimeAgo(typeof issue.createdAt === 'number' ? issue.createdAt : (issue.createdAt as any).seconds * 1000) : 'مُنذ لحظة'}</span>
//       //                             </div>
//       //                             <div className="flex -space-x-3 flex-row-reverse">
//       //                                {[1, 2].map(i => (
//       //                                  <div key={i} className="w-9 h-9 rounded-full bg-brand-dark border border-white/10 flex items-center justify-center text-white/20 relative z-10 group-hover:border-emerald-500/50 transition-all shadow-2xl">
//       //                                     <Building size={14} />
//       //                                  </div>
//       //                                ))}
//       //                                <div className="w-9 h-9 rounded-full bg-emerald-600 border border-white/20 flex items-center justify-center text-[10px] font-black text-white relative z-20 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
//       //                                  <Activity size={16} />
//       //                                </div>
//       //                             </div>
//       //                          </div>
//       //                       </div>

//       //                       {/* Status Indicator Bar - Tech Meter Style */}
//       //                       <div className="absolute bottom-0 left-0 h-1.5 bg-white/5 w-full overflow-hidden">
//       //                          <motion.div
//       //                            initial={{ width: 0 }}
//       //                            animate={{ width: issue.status === 'resolved' ? '100%' : '40%' }}
//       //                            className={cn(
//       //                              "h-full transition-all duration-[2s] relative shadow-[0_0_15px_currentColor]",
//       //                              issue.status === 'resolved' ? "bg-emerald-500" : "bg-brand-accent/50"
//       //                            )}
//       //                          >
//       //                             <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
//       //                          </motion.div>
//       //                       </div>
//       //                     </motion.div>
//       //                   );
//       //                 })}

//       //                 {loadingMore && (
//       //                   <div className="flex justify-center py-16">
//       //                     <div className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-full shadow-2xl backdrop-blur-3xl">
//       //                       <Loader2 className="animate-spin text-emerald-500" size={20} />
//       //                       <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20 font-mono italic">تحميل البيانات // SYNCING...</span>
//       //                     </div>
//       //                   </div>
//       //                 )}
//       //               </div>
//       //             </motion.div>
//       //           )}

//       //           {activeTab === 'alerts' && <AlertsList />}
//       //           {activeTab === 'payments' && <UtilityPayments />}
//       //           {activeTab === 'compete' && <RegionalCompetition />}
//       //           {activeTab === 'archive' && (
//       //             <div className="text-center py-32 bg-white/5 rounded-[4rem] border-2 border-dashed border-white/10 shadow-2xl backdrop-blur-3xl">
//       //                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/10 text-white/20">
//       //                   <History size={48} />
//       //                </div>
//       //                <p className="text-[12px] font-black text-white/30 uppercase tracking-[0.5em] font-mono italic">الأرشفة الوطنية قيد التهيئة // ARCHIVE_INIT</p>
//       //             </div>
//       //           )}
//       //         </AnimatePresence>
//       //       </div>
//       //     </div>
// //   </div>
      



//         //  <div className="flex gap-10 overflow-x-auto pb-10 no-scrollbar scroll-smooth snap-x">
//         //    {INSTITUTIONS.map((inst, index) => (
//         //     <motion.div 
//         //       key={inst.id}
//         //       whileHover={{ y: -12, scale: 1.05 }}
//         //       whileTap={{ scale: 0.95 }}
//         //       onClick={() => setViewingInstitution(inst)}
//         //       className="shrink-0 flex flex-col items-center gap-6 group cursor-pointer snap-center"
//         //       title={inst.fullName}
//         //     >
//         //       <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-[3rem] bg-white border border-slate-100 flex items-center justify-center overflow-hidden transition-all duration-700 group-hover:border-emerald-500/50 shadow-xl group-hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] relative">
//         //          {/* Rank Badge */}
//         //          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xl z-20 opacity-0 group-hover:opacity-100 transition-all duration-500">
//         //            #{index + 1}
//         //          </div>
//         //          {inst.logo ? (
//         //           <img 
//         //             src={inst.logo} 
//         //             alt={inst.name} 
//         //             className="w-full h-full object-cover p-3 transition-transform duration-1000 group-hover:scale-125 group-hover:rotate-6 opacity-80 group-hover:opacity-100" 
//         //             referrerPolicy="no-referrer"
//         //           />
//         //         ) : (
//         //           <Building className="text-slate-200" size={40} />
//         //         )}
//         //       </div>
//         //       <div className="text-center">
//         //         <span className="text-[11px] font-black text-slate-900 block mb-1.5 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{inst.name}</span>
//         //         <span className={cn(
//         //           "text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border italic",
//         //           inst.type !== 'partner' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
//         //         )}>{inst.type !== 'partner' ? 'حكومي' : 'خاص'}</span>
//         //       </div>
//         //     </motion.div>
//         //   ))}
//         // </div>

import React, { useState, useEffect, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { 
  Search, MapPin, Filter, TrendingUp, MoreVertical, ThumbsUp, MessageSquare, Share2,
  Activity, Loader2, AlertTriangle, WifiOff, X, Bell, Wallet, Grid, Trophy, Truck,
  Droplets, Zap, Trash2, History, Map as MapIcon, ShieldCheck, Check, Building,
  HelpCircle, ArrowUpRight, Phone, SignalHigh, Star, CheckCircle2, Globe, Hash,
  Command, ArrowRight, ChevronRight, Download
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs, getDoc, doc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn, formatTimeAgo } from '../lib/utils';
import { Issue } from '../types';
import { INSTITUTIONS, InstitutionExtended } from '../constants';
import IssueDetail from './IssueDetail';
import InstitutionDetail from './InstitutionDetail';
import AlertsList from './Alerts';
import UtilityPayments from './Payments';
import RegionalCompetition from './RegionalCompetition';
import HackathonPitch from './HackathonPitch';
import OfflineReporting from './OfflineReporting';
import PlatformProfile from './PlatformProfile';
import { motion, AnimatePresence } from 'motion/react';
import { generatePitchDeck } from '../lib/pitchdeck';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type DashboardTab = 'activity' | 'alerts' | 'payments' | 'compete' | 'archive' | 'workstation';

export default function Dashboard({ role = 'citizen', profile }: { role?: 'citizen' | 'official' | 'partner'; profile?: any }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listContainerRef = React.useRef<HTMLDivElement>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [activeMarkerIssue, setActiveMarkerIssue] = useState<Issue | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('activity');
  const [selectedInstitutionFilter, setSelectedInstitutionFilter] = useState<string>(role === 'official' ? 'unassigned' : 'all');
  const [viewingInstitution, setViewingInstitution] = useState<InstitutionExtended | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showPitch, setShowPitch] = useState(false);
  const [showPlatformProfile, setShowPlatformProfile] = useState(false);
  const [showOfflineMode, setShowOfflineMode] = useState(false);
  const [lastNotification, setLastNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [citizenOnly, setCitizenOnly] = useState(false);
  const [showSystemNotice, setShowSystemNotice] = useState(() => !localStorage.getItem('system_notice_dismissed'));
  const [systemNotice] = useState("إشعار هام: بدأت أعمال الصيانة الكبرى في محطة مياه المقرن. قد يتأثر الإمداد في وسط الخرطوم.");
  const [govAlerts, setGovAlerts] = useState<any[]>([]);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dismissed_gov_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  const dismissGovAlert = (id: string) => {
    setDismissedAlertIds(prev => {
      const next = [...prev, id];
      localStorage.setItem('dismissed_gov_alerts', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const q = query(collection(db, 'alerts'), where('active', '==', true), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGovAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.warn("Alerts listener error:", err));
    return () => unsubscribe();
  }, []);

  const activeVisibleAlert = govAlerts.find(a => !dismissedAlertIds.includes(a.id));

  const dismissNotice = () => {
    setShowSystemNotice(false);
    localStorage.setItem('system_notice_dismissed', 'true');
  };

  useEffect(() => {
    const notifications = [
      "تم رصد بلاغ جديد في حي الرياض",
      "اكتمال مشروع ترميم مدرسة في بحري",
      "سفير عمراني جديد انضم للوحة الشرف",
    ];
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setLastNotification(notifications[Math.floor(Math.random() * notifications.length)]);
        setTimeout(() => setLastNotification(null), 5000);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);

  const filteredIssues = issues.filter(issue => {
    if (selectedInstitutionFilter !== 'all') {
      if (selectedInstitutionFilter === 'unassigned') { if (issue.assignedInstitution) return false; }
      else if (issue.assignedInstitution !== selectedInstitutionFilter) return false;
    }
    if (citizenOnly && !issue.reportedByCitizen) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!issue.trackingId?.toLowerCase().includes(q) && !issue.description?.toLowerCase().includes(q) && !issue.type?.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      const timeA = typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt as any)?.seconds * 1000 || 0;
      const timeB = typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt as any)?.seconds * 1000 || 0;
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    }
    const statusOrder = { 'pending': 0, 'verified': 1, 'in-progress': 2, 'completed': 3, 'resolved': 4 };
    const valA = statusOrder[a.status as keyof typeof statusOrder] || 0;
    const valB = statusOrder[b.status as keyof typeof statusOrder] || 0;
    return sortOrder === 'desc' ? valB - valA : valA - valB;
  });

  const getIssueIcon = (type: string, size = 20) => {
    switch(type) {
      case 'road': return <Truck size={size} />;
      case 'water': return <Droplets size={size} />;
      case 'electricity': return <Zap size={size} />;
      case 'waste': return <Trash2 size={size} />;
      case 'other': return <HelpCircle size={size} />;
      default: return <Activity size={size} />;
    }
  };

  const handleMarkerClick = (issue: Issue) => {
    if (googleMapRef.current) {
      googleMapRef.current.setZoom(16);
      googleMapRef.current.panTo({ lat: issue.location.lat, lng: issue.location.lng });
    }
    setActiveMarkerIssue(issue);
  };

  const resetMap = () => {
    if (googleMapRef.current) {
      googleMapRef.current.setZoom(12);
      googleMapRef.current.setCenter({ lat: 15.5, lng: 32.55 });
    }
    setActiveMarkerIssue(null);
  };

  useEffect(() => {
    (window as any).gm_authFailure = () => setMapError('ApiProjectMapError');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'YOUR_KEY_HERE' || apiKey.trim() === '') {
      setMapError('missing_key');
      return;
    }
    setOptions({ apiKey, version: 'weekly', libraries: ['maps', 'marker'] } as any);
    let mapInitTimeout: any;
    const initMap = async () => {
      mapInitTimeout = setTimeout(() => { if (!isMapLoaded && !mapError) setMapError('timeout'); }, 10000);
      (window as any).gm_authFailure = () => { setMapError('ApiProjectMapError'); clearTimeout(mapInitTimeout); };
      try {
        const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;
        await importLibrary('marker');
        if (mapRef.current) {
          const map = new Map(mapRef.current, {
            center: { lat: 15.5007, lng: 32.5599 },
            zoom: 12,
            disableDefaultUI: true,
            styles: [
              { featureType: "landscape", elementType: "geometry.fill", stylers: [{ color: "#f8fafc" }] },
              { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#e0f2fe" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
              { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
            ],
          });
          googleMapRef.current = map;
          setIsMapLoaded(true);
          clearTimeout(mapInitTimeout);
        }
      } catch (err) {
        console.error("Map init error:", err);
        setMapError('init_error');
        clearTimeout(mapInitTimeout);
      }
    };
    initMap();
    return () => clearTimeout(mapInitTimeout);
  }, []);

  const TABS: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { id: 'activity', label: 'الخريطة والنشاط', icon: <MapIcon size={16} /> },
    { id: 'alerts', label: 'التنبيهات', icon: <Bell size={16} /> },
    { id: 'payments', label: 'المدفوعات', icon: <Wallet size={16} /> },
    { id: 'compete', label: 'التنافس الإقليمي', icon: <Trophy size={16} /> },
    { id: 'archive', label: 'الأرشيف', icon: <History size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative" dir="rtl">

      {/* System Notice Bar */}
      <AnimatePresence>
        {showSystemNotice && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="bg-slate-900 text-white py-2.5 px-4 lg:px-8 flex items-center justify-between gap-4 relative z-[100]"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <p className="text-xs font-medium text-slate-200 truncate">{systemNotice}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { setActiveTab('alerts'); dismissNotice(); }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-colors"
              >
                عرض
              </button>
              <button onClick={dismissNotice} className="p-1 text-slate-400 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gov Alert Banner */}
      <AnimatePresence>
        {activeVisibleAlert && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className={cn(
              "py-3 px-4 lg:px-8 flex items-center justify-between gap-4 border-b relative z-[99]",
              activeVisibleAlert.type === 'critical' ? "bg-rose-600 text-white border-rose-500"
                : activeVisibleAlert.type === 'warning' ? "bg-amber-500 text-slate-900 border-amber-400"
                : "bg-blue-600 text-white border-blue-500"
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {activeVisibleAlert.type === 'critical'
                ? <AlertTriangle size={18} className="shrink-0 animate-pulse" />
                : <Bell size={18} className="shrink-0" />
              }
              <p className="text-sm font-bold truncate">
                <span className="font-black ml-2">{activeVisibleAlert.title}:</span>
                {activeVisibleAlert.message}
              </p>
            </div>
            <button
              onClick={() => dismissGovAlert(activeVisibleAlert.id)}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Header */}
      {/* Header - Responsive on all screens */}
      <div className="px-4 sm:px-8 lg:px-16 pt-5 sm:pt-8 pb-4 sm:pb-6">

        {/* Top Bar */}
        <div className="flex items-center justify-between bg-white rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-slate-100 shadow-sm gap-3">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-900 rounded-xl shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 font-mono tracking-wider uppercase hidden xs:inline">System Online</span>
              <span className="text-[9px] font-black text-emerald-400 font-mono uppercase xs:hidden">LIVE</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-slate-500">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span className="text-xs font-bold">Verified_Gov // SDN_AUTH_2026</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setShowPlatformProfile(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[11px] sm:text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <Star size={13} className="text-amber-500" />
              <span className="hidden sm:inline">ملف المنصة</span>
              <span className="sm:hidden">الملف</span>
            </button>
            <button
              onClick={generatePitchDeck}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <Download size={14} />
              Pitch Deck
            </button>
            <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1" />
            <span className="hidden md:block text-xs font-mono text-slate-400">{new Date().toLocaleTimeString('ar-SD')}</span>

            {/* Offline button - visible on mobile only here, desktop sees it in Hero */}
            <button
              onClick={() => setShowOfflineMode(true)}
              className="sm:hidden flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-700 transition-colors"
            >
              <WifiOff size={13} />
              <span>أوفلاين</span>
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6">

          {/* Left: Text */}
          <div className="sm:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter font-display leading-none mb-3 sm:mb-4">
                عُـمْـران<span className="text-emerald-500">.</span>
              </h1>
              <p className="text-base sm:text-xl font-bold text-slate-600 leading-relaxed border-r-4 border-emerald-500 pr-3 sm:pr-4 max-w-md">
                نحن لا نبني تطبيقاً.. نحن نبني نظام تشغيل{' '}
                <span className="text-emerald-600">للتعافي</span> وتجاوز الأزمات.
              </p>
              <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className="px-2 sm:px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0">
                  Vision 2026
                </span>
                <span className="text-xs sm:text-sm text-slate-500">البنية التحتية الرقمية لإعادة إعمار السودان</span>
              </div>
              <AnimatePresence>
                {lastNotification && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    className="mt-4 sm:mt-6 flex items-center gap-3 bg-white border border-amber-100 border-r-4 border-r-amber-500 p-3 rounded-xl shadow-sm max-w-sm"
                  >
                    <Bell size={16} className="text-amber-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-700">{lastNotification}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Map + Offline */}
          <div className="sm:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-sm flex flex-row sm:flex-col items-center justify-center gap-4 sm:gap-4">

            {/* Offline button card */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100 flex items-center justify-center relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-emerald-500/10 blur-2xl animate-pulse" />
              {/* <svg viewBox="0 0 200 250" className="w-14 h-14 sm:w-20 sm:h-20 text-emerald-600 opacity-20 absolute">
                <path d="M80,20 L130,20 L160,80 L130,230 L50,230 L20,80 Z" fill="currentColor" />
              </svg> */}
              <button
                onClick={() => setShowOfflineMode(true)}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 sm:gap-2 hover:bg-emerald-600/10 transition-colors group"
              >
                <WifiOff size={26} className="text-emerald-600 group-hover:scale-110 transition-transform sm:hidden" />
                <WifiOff size={32} className="text-emerald-600 group-hover:scale-110 transition-transform hidden sm:block" />
                <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity text-center px-1">
                  تقرير بدون إنترنت
                </span>
              </button>
            </div>

            {/* Location badge */}
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-900 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl">
              <MapPin size={14} className="text-emerald-400 shrink-0 sm:w-4 sm:h-4" />
              <div>
                <p className="text-[8px] sm:text-[9px] font-bold text-emerald-400 uppercase tracking-wider leading-none">
                  Core Node // KRT
                </p>
                <p className="text-xs sm:text-sm font-bold">الخرطوم، السودان</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 lg:px-16 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "البلاغات النشطة", value: "١٢", icon: Activity, color: "emerald", tag: "LIVE" },
          { label: "المساهمات", value: "٢٤٥", icon: ThumbsUp, color: "blue", tag: "+٤٢٪" },
          { label: "أمن النظام", value: "١٠٠٪", icon: ShieldCheck, color: "amber", tag: "SECURED" },
          { label: "مؤشر الإعمار", value: "٨.٥", icon: Trophy, color: "rose", tag: "PRIORITY" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3 }}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm overflow-hidden relative group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <stat.icon size={18} />
              </div>
              <span className={`text-[9px] font-black text-${stat.color}-600 bg-${stat.color}-50 px-2 py-1 rounded-lg`}>{stat.tag}</span>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight font-mono">{stat.value}</p>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Official Workstation Banner */}
      {role === 'official' && (
        <div className="px-4 lg:px-16 mb-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">محطة عمل المسؤول الحكومي</h3>
                  <p className="text-sm text-slate-500">
                    <span className="text-emerald-600 font-black">{filteredIssues.filter(i => i.status === 'pending' && !i.assignedInstitution).length} بلاغاً</span> تحتاج إلى توجيه فوري
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedInstitutionFilter('unassigned')}
                  className={cn("flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
                    selectedInstitutionFilter === 'unassigned' ? "bg-emerald-600 text-white shadow-lg" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  بلاغات غير موجهة ({issues.filter(i => !i.assignedInstitution).length})
                </button>
                <button
                  onClick={() => { setCitizenOnly(true); setSelectedInstitutionFilter('all'); }}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
                >
                  تدقيق المواطنين
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 lg:px-16 mb-6">
        <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm flex overflow-x-auto gap-1 no-scrollbar">
          {TABS.map((tab) => (

            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
          {/* Offline Report Button - visible on all screens */}
          <button
            onClick={() => setShowOfflineMode(true)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-emerald-700 bg-emerald-50 hover:bg-emerald-100 mr-auto"
          >
            <WifiOff size={16} />
            <span className="whitespace-nowrap">بدون إنترنت</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 lg:px-16 pb-40">
        <AnimatePresence mode="wait">
          {activeTab === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    placeholder="البحث عن بلاغ أو منطقة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-right shadow-sm placeholder:text-slate-300"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn("flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all border",
                    showFilters ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                  )}
                >
                  <Filter size={16} />
                  {showFilters ? 'إغلاق' : 'تصفية'}
                </button>
              </div>

              {/* Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-right">المؤسسة</label>
                      <select
                        onChange={(e) => setSelectedInstitutionFilter(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-100 text-sm font-medium text-right outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="all">كافة المؤسسات</option>
                        {INSTITUTIONS.map(inst => <option key={inst.id} value={inst.id}>{inst.fullName}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-right">ترتيب حسب</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                          className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
                        >
                          <MoreVertical size={16} className={cn(sortOrder === 'asc' && "rotate-180")} />
                        </button>
                        <button
                          onClick={() => setSortBy('date')}
                          className="flex-1 p-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          الأحدث أولاً
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-right">المصدر</label>
                      <button
                        onClick={() => setCitizenOnly(!citizenOnly)}
                        className={cn("w-full p-3 rounded-xl text-sm font-medium transition-all flex justify-between items-center",
                          citizenOnly ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", citizenOnly ? "border-white bg-white" : "border-slate-300")}>
                          {citizenOnly && <Check size={12} className="text-emerald-600" />}
                        </div>
                        بلاغات المواطنين فقط
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Map + Issues Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Map */}
                <div className="xl:col-span-8 relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 h-[450px] lg:h-[600px] bg-white">
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-black text-slate-900 font-mono">LIVE // {filteredIssues.length} REPORTS</span>
                    </div>
                  </div>

                  {mapError ? (
                    /* Leaflet Fallback */
                    <MapContainer
                      center={[15.5007, 32.5599]}
                      zoom={12}
                      className="w-full h-full"
                      zoomControl={false}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='© OpenStreetMap'
                      />
                      <MarkerClusterGroup>
                        {filteredIssues.filter(i => i.location?.lat && i.location?.lng).map(issue => (
                          <LeafletMarker
                            key={issue.id}
                            position={[issue.location.lat, issue.location.lng]}
                            eventHandlers={{ click: () => setSelectedIssue(issue) }}
                          >
                            <Popup>{issue.description || issue.location.address}</Popup>
                          </LeafletMarker>
                        ))}
                      </MarkerClusterGroup>
                    </MapContainer>
                  ) : (
                    <div ref={mapRef} className="w-full h-full" />
                  )}

                  {loading && !mapError && (
                    <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-30">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-emerald-600" size={32} />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">جاري تحميل الخريطة</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Issues List */}
                <div className="xl:col-span-4 space-y-3 overflow-y-auto max-h-[600px] no-scrollbar">
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <h4 className="text-base font-black text-slate-900 mb-4">آخر النشاطات</h4>
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : filteredIssues.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-sm text-slate-400 font-medium">لا توجد بلاغات مطابقة</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredIssues.slice(0, 10).map((issue) => (
                          <button
                            key={issue.id}
                            onClick={() => setSelectedIssue(issue)}
                            className="w-full p-4 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-100 transition-all border border-transparent text-right group"
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white",
                                issue.severity === 3 ? "bg-rose-500" : issue.severity === 2 ? "bg-amber-500" : "bg-emerald-600"
                              )}>
                                {getIssueIcon(issue.type, 14)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="text-[9px] font-mono text-slate-400">#{issue.trackingId}</span>
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                </div>
                                <p className="text-xs font-bold text-slate-700 leading-relaxed line-clamp-2">{issue.description || issue.location.address}</p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {issue.createdAt ? formatTimeAgo(typeof issue.createdAt === 'number' ? issue.createdAt : (issue.createdAt as any).seconds * 1000) : 'مُنذ لحظة'}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                        {hasMore && (
                          <button
                            onClick={() => {/* load more logic */}}
                            disabled={loadingMore}
                            className="w-full py-3 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
                            تحميل المزيد
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Data Feed */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <h5 className="text-xs font-black text-slate-600 uppercase tracking-wider font-mono">LIVE DATA FEED</h5>
                    </div>
                    <div className="space-y-3 text-xs font-mono">
                      {[
                        { label: "SYSTEM", text: "تحديث الخرائط الميدانية لولاية الخرطوم", done: true },
                        { label: "MAP", text: "رصد ٥ بلاغات جديدة في منطقة بحري" },
                        { label: "REBUILD", text: "فريق صيانة الكهرباء تحرك في أمدرمان", active: true },
                      ].map((log, i) => (
                        <div key={i} className={cn("flex gap-3 text-slate-500", log.active && "animate-pulse")}>
                          <span className="text-slate-300 shrink-0 text-[10px]">[{new Date().toLocaleTimeString()}]</span>
                          <p><span className="text-slate-800 font-black">{log.label}:</span> {log.text} {log.done && <span className="text-slate-300">DONE</span>}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Partners Ticker */}
              <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider font-mono">Strategic Network</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">شركاء الإعمار الوطنيين</h3>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                  <div className="flex overflow-hidden" dir="ltr">
                    {[...Array(2)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: 0 }}
                        animate={{ x: "-100%" }}
                        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                        className="flex shrink-0 items-center gap-8 pr-8"
                      >
                        {INSTITUTIONS.map((inst) => (
                          <button
                            key={inst.id}
                            onClick={() => setViewingInstitution(inst)}
                            className="flex flex-col items-center gap-3 group shrink-0"
                          >
                            <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center p-2 group-hover:border-emerald-200 group-hover:shadow-md transition-all overflow-hidden">
                              {inst.logo ? (
                                <img src={inst.logo} alt={inst.name} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
                              ) : (
                                <Building className="text-slate-300" size={20} />
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">{inst.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Omni Channel Section */}
              <div className="mt-6 bg-white rounded-2xl p-6 lg:p-8 border border-slate-100 shadow-sm">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-1 text-right">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider font-mono mb-2 block">OMNI_SDN</span>
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-3">التوصيل الرقمي الشامل</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      بنية تحتية مرنة تدمج قنوات <span className="text-emerald-600 font-bold">الويب، الرسائل النصية، ونظام USSD</span> لضمان وصول صوت كل مواطن.
                    </p>
                  </div>
                  <div className="flex gap-4 flex-wrap justify-center">
                    {[
                      { label: 'الويب', value: '٦٤٪', icon: <Globe size={20} />, color: 'bg-emerald-600' },
                      { label: 'SMS', value: '٢٢٪', icon: <MessageSquare size={20} />, color: 'bg-blue-600' },
                      { label: 'USSD', value: '١٤٪', icon: <Hash size={20} />, color: 'bg-amber-600' },
                    ].map((s, i) => (
                      <div key={i} className="bg-slate-50 p-5 rounded-2xl text-center w-28 border border-slate-100">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 text-white", s.color)}>{s.icon}</div>
                        <p className="text-xl font-black text-slate-900 font-mono">{s.value}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'alerts' && (
            <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AlertsList />
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <UtilityPayments />
            </motion.div>
          )}

          {activeTab === 'compete' && (
            <motion.div key="compete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RegionalCompetition />
            </motion.div>
          )}

          {activeTab === 'archive' && (
            <motion.div key="archive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
                <History size={40} className="text-slate-200 mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">الأرشيف قيد التهيئة</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedIssue && <IssueDetail issue={selectedIssue} onClose={() => setSelectedIssue(null)} />}
        {viewingInstitution && (
          <InstitutionDetail
            institution={viewingInstitution}
            onClose={() => setViewingInstitution(null)}
            rank={INSTITUTIONS.findIndex(i => i.id === viewingInstitution.id) + 1}
          />
        )}
        {showPitch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white overflow-y-auto">
            <HackathonPitch onClose={() => setShowPitch(false)} />
          </motion.div>
        )}
        <OfflineReporting isOpen={showOfflineMode} onClose={() => setShowOfflineMode(false)} />
        {showPlatformProfile && <PlatformProfile onClose={() => setShowPlatformProfile(false)} />}
      </AnimatePresence>
    </div>
  );
}