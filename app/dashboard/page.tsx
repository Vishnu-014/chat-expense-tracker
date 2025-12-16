// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/lib/auth-context';
// import ProtectedRoute from '@/components/protected-route';
// import DateSelector from '@/components/date-selector';
// import {
//   Home as HomeIcon,
//   Car,
//   Utensils,
//   Receipt,
//   ShoppingBag,
//   MessageCircle,
//   ChevronDown,
//   Grid3x3,
//   Calendar,
//   ChevronRight,
//   Loader2,
//   TrendingDown,
//   TrendingUp,
//   ChartCandlestick,
//   PiggyBank,
//   X,
//   LogOut,
// } from 'lucide-react';
// import { DateFilterModal } from '@/components/date-filter-modal';

// const COLORS = {
//   EXPENSE: '#E55F78',
//   INCOME: '#74C4BB',
//   INVESTMENTS: '#A3CDF3',
//   SAVINGS: '#F6DB87',
//   BACKGROUND: '#152D37',
//   BAR_EXPENSE: '#C43D4F',
//   BAR_INCOME: '#53A292',
//   BAR_INVESTMENT: '#82ABCA',
//   BAR_SAVINGS: '#D5B95E',
//   BAR_FADED_EXPENSE: 'rgba(196, 61, 79, 0.4)',
//   BAR_FADED_INCOME: 'rgba(83, 162, 146, 0.4)',
//   BAR_FADED_INVESTMENT: 'rgba(130, 171, 202, 0.4)',
//   BAR_FADED_SAVINGS: 'rgba(213, 185, 94, 0.4)',
// };

// const getCategoryIcon = (category: string) => {
//   const categoryLower = category.toLowerCase();
//   if (categoryLower.includes('rent') || categoryLower.includes('housing'))
//     return HomeIcon;
//   if (categoryLower.includes('transport') || categoryLower.includes('travel'))
//     return Car;
//   if (
//     categoryLower.includes('food') ||
//     categoryLower.includes('restaurant') ||
//     categoryLower.includes('eating')
//   )
//     return Utensils;
//   if (
//     categoryLower.includes('bill') ||
//     categoryLower.includes('utility') ||
//     categoryLower.includes('utilities')
//   )
//     return Receipt;
//   if (categoryLower.includes('shopping') || categoryLower.includes('groceries'))
//     return ShoppingBag;
//   return ShoppingBag;
// };

// interface Category {
//   name: string;
//   amount: number;
//   count: number;
//   percentage: number;
// }

// interface Analytics {
//   expense: number;
//   income: number;
//   investments: number;
//   savings: number;
//   categories: {
//     EXPENSE: Category[];
//     INCOME: Category[];
//     INVESTMENTS: Category[];
//     SAVINGS: Category[];
//   };
//   period: string;
// }

// type ViewType = 'summary' | 'expense' | 'income' | 'investments' | 'savings';

// function DashboardContent() {
//   const router = useRouter();
//   const { user, token, logout } = useAuth();
//   const [analytics, setAnalytics] = useState<Analytics | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedMonth, setSelectedMonth] = useState('2025-12');
//   const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis'>(
//     'dashboard'
//   );
//   const [currentView, setCurrentView] = useState<ViewType>('summary');

//  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
//    const [startDate, setStartDate] = useState<string | null>('2025-12-01');
//    const [endDate, setEndDate] = useState<string | null>('2025-12-31');
//    const [dateLabel, setDateLabel] = useState("Dec'25");
//    const dateButtonRef = useRef<HTMLButtonElement>(null);

//   // Generate month options
//   const generateMonthOptions = () => {
//     const months = [];
//     const currentDate = new Date();
//     for (let i = 0; i < 12; i++) {
//       const date = new Date(
//         currentDate.getFullYear(),
//         currentDate.getMonth() - i,
//         1
//       );
//       const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1)
//         .toString()
//         .padStart(2, '0')}`;
//       const label = date.toLocaleDateString('en-US', {
//         month: 'short',
//         year: '2-digit',
//       });
//       months.push({ value: yearMonth, label });
//     }
//     return months;
//   };

//   const monthOptions = generateMonthOptions();

//   useEffect(() => {
//     if (user && token) {
//       fetchAnalytics();
//     }
//   }, [user, token, startDate, endDate]);

//   const fetchAnalytics = async () => {
//     if (!token) return;

//     try {
//       setIsLoading(true);

//       // Build query params
//       let queryParams = '';
//       console.log('====================================');
//       console.log(startDate, endDate, "startend");
//       console.log('====================================');
//       if (startDate && endDate) {
//         queryParams = `startDate=${startDate}&endDate=${endDate}`;
//       } else {
//         // Default to current month
//         queryParams = 'month=2025-12';
//       }

//       const response = await fetch(`/api/analytics?${queryParams}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.status === 401) {
//         logout();
//         return;
//       }

//       if (response.ok) {
//         const data = await response.json();
//         setAnalytics(data.analytics);
//       }
//     } catch (error) {
//       console.error('Error fetching analytics:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleTabSwitch = (tab: 'dashboard' | 'analysis') => {
//     setActiveTab(tab);
//     if (tab === 'analysis') {
//       router.push('/analysis');
//     }
//   };

//   const handleMonthChange = (month: string) => {
//     setSelectedMonth(month);
//     setCurrentView('summary'); // Reset to summary view when changing month
//   };

//   if (isLoading) {
//     return (
//       <div
//         className="h-screen flex items-center justify-center"
//         style={{ backgroundColor: COLORS.BACKGROUND }}
//       >
//         <Loader2 className="w-8 h-8 animate-spin text-white" />
//       </div>
//     );
//   }

//   const selectedMonthLabel =
//     monthOptions.find((m) => m.value === selectedMonth)?.label || "Mar'24";
//   const selectedMonthName = new Date(selectedMonth + '-01').toLocaleDateString(
//     'en-US',
//     { month: 'long' }
//   );

//   // Check if there's any data
//   const hasCategories =
//     analytics &&
//     Object.values(analytics.categories).some(
//       (categories) => categories.length > 0
//     );
//   const hasData =
//     analytics &&
//     (analytics.expense > 0 ||
//       analytics.income > 0 ||
//       analytics.investments > 0 ||
//       analytics.savings > 0 ||
//       hasCategories);

//   // Summary bars data
//   const summaryBars = [
//     {
//       name: 'Expense',
//       amount: analytics?.expense || 0,
//       color: COLORS.BAR_EXPENSE,
//       fadedColor: COLORS.BAR_FADED_EXPENSE,
//       icon: TrendingDown,
//       type: 'expense' as ViewType,
//     },
//     {
//       name: 'Income',
//       amount: analytics?.income || 0,
//       color: COLORS.BAR_INCOME,
//       fadedColor: COLORS.BAR_FADED_INCOME,
//       icon: TrendingUp,
//       type: 'income' as ViewType,
//     },
//     {
//       name: 'Investments',
//       amount: analytics?.investments || 0,
//       color: COLORS.BAR_INVESTMENT,
//       fadedColor: COLORS.BAR_FADED_INVESTMENT,
//       icon: ChartCandlestick,
//       type: 'investments' as ViewType,
//     },
//     {
//       name: 'Savings',
//       amount: analytics?.savings || 0,
//       color: COLORS.BAR_SAVINGS,
//       fadedColor: COLORS.BAR_FADED_SAVINGS,
//       icon: PiggyBank,
//       type: 'savings' as ViewType,
//     },
//   ];

//   const categoryBars =
//     currentView !== 'summary' && analytics
//       ? (
//           analytics.categories[
//             currentView.toUpperCase() as keyof typeof analytics.categories
//           ] || []
//         ).slice(0, 10)
//       : [];

//   const maxSummaryAmount = Math.max(...summaryBars.map((b) => b.amount), 1);
//   const maxCategoryAmount =
//     categoryBars.length > 0
//       ? Math.max(...categoryBars.map((c) => c.amount), 1)
//       : 1;

//   const topCategories = analytics?.categories.EXPENSE.slice(0, 5) || [];

//   const budgetsMet = topCategories.filter(
//     (c) => c.percentage !== undefined && c.percentage < 100
//   ).length;

//   const totalCategoryCount = Object.values(analytics?.categories ?? {})
//     .flat()
//     .reduce((sum, c) => sum + c.count, 0);

//   /* -------------------- DATE HANDLING -------------------- */
//   const handleDateApply = (start: string | null, end: string | null) => {
//     setStartDate(start);
//     setEndDate(end);

//     // Update label
//     if (start && end) {
//       const startDateObj = new Date(start);
//       const endDateObj = new Date(end);
//       const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//       if (startDateObj.getFullYear() === endDateObj.getFullYear() &&
//           startDateObj.getMonth() === endDateObj.getMonth()) {
//         // Same month
//         setDateLabel(`${monthNames[startDateObj.getMonth()]}'${startDateObj.getFullYear().toString().slice(2)}`);
//       } else if (startDateObj.getFullYear() === endDateObj.getFullYear()) {
//         // Same year, different months
//         setDateLabel(`${monthNames[startDateObj.getMonth()]}-${monthNames[endDateObj.getMonth()]}'${startDateObj.getFullYear().toString().slice(2)}`);
//       } else {
//         // Different years
//         setDateLabel(`${monthNames[startDateObj.getMonth()]}'${startDateObj.getFullYear().toString().slice(2)}-${monthNames[endDateObj.getMonth()]}'${endDateObj.getFullYear().toString().slice(2)}`);
//       }
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await fetch('/api/auth/logout', {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       logout();
//     }
//   };

//   return (
//     <div
//       className="min-h-screen pb-24"
//       style={{ backgroundColor: COLORS.BACKGROUND }}
//     >
//       {/* Tab Switcher */}
//       <div className="flex justify-center pt-6 pb-4">
//         <div className="relative bg-white/10 backdrop-blur-lg rounded-full p-1 border border-white/20 w-64">
//           <div
//             className="absolute top-1 bottom-1 bg-white rounded-full transition-all duration-300 ease-out"
//             style={{
//               left: activeTab === 'dashboard' ? '4px' : 'calc(50% + 4px)',
//               width: 'calc(50% - 8px)',
//             }}
//           />
//           <div className="relative flex">
//             <button
//               onClick={() => handleTabSwitch('dashboard')}
//               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-colors z-10 ${
//                 activeTab === 'dashboard' ? 'text-slate-800' : 'text-slate-300'
//               }`}
//             >
//               <Grid3x3 className="w-4 h-4" />
//               <span className="font-semibold text-sm">Dashboard</span>
//             </button>
//             <button
//               onClick={() => handleTabSwitch('analysis')}
//               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-colors z-10 ${
//                 activeTab === 'analysis' ? 'text-slate-800' : 'text-slate-300'
//               }`}
//             >
//               <span className="font-semibold text-sm">Analysis</span>
//             </button>
//           </div>
//         </div>
//       </div>
//       {/* Profile Section */}
//       <div className="px-6 mt-8 flex items-center justify-end gap-4">
//       <button
//               onClick={handleLogout}
//               className="w-10 h-10 bg-red-500/50 rounded-full flex items-center justify-center hover:bg-red-500 transition"
//               title="Logout"
//             >
//               <LogOut className="w-5 h-5 text-white" />
//             </button>
//         <div
//           className="px-6 py-2 rounded-full rounded-bl-sm rounded-tl-2xl"
//           style={{
//             background: 'linear-gradient(135deg, #F4E099 0%, #F9F1CA 100%)',
//           }}
//         >
//           <p className="text-slate-800 font-bold text-sm">
//             Don't thank me just ...
//           </p>
//         </div>
//         <div
//           className="w-16 h-16 rounded-full border-2 flex items-center justify-center bg-white text-2xl font-bold shadow-lg"
//           style={{
//             borderColor: '#F4E099',
//             boxShadow: '0 4px 12px rgba(244, 224, 153, 0.5)',
//           }}
//         >
//           {user?.name?.charAt(0).toUpperCase() || 'U'}
//         </div>
//       </div>

//       {/* Summary Header */}
//       <div className="px-6 mt-8">
//         <div className="flex items-center justify-between mb-3">
//           <h1 className="text-white text-xl font-bold">
//             {selectedMonthName} Summary
//           </h1>

//           <button
//           ref={dateButtonRef}
//           onClick={() => setIsDateModalOpen(true)}
//           className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
//         >
//           <Calendar className="w-4 h-4 text-slate-600" />
//           <span className="text-sm font-medium">{dateLabel}</span>
//           <ChevronDown className="w-4 h-4 text-slate-600" />
//         </button>

//          {/* Date Filter Modal */}
//                <DateFilterModal
//                  isOpen={isDateModalOpen}
//                  onClose={() => setIsDateModalOpen(false)}
//                  onApply={handleDateApply}
//                  currentStartDate={startDate}
//                  currentEndDate={endDate}
//                  anchorRef={dateButtonRef}
//                />
//         </div>

//         {hasData && (
//           <>
//             <button className="flex items-center gap-2 text-white text-base font-bold">
//               <span>🏆</span>
//               <span>
//                 {budgetsMet} out of {topCategories.length} budgets met
//               </span>
//               <ChevronRight className="w-5 h-5" />
//             </button>

//             <div className="flex items-center justify-end gap-4 mt-4 text-xs">
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full border-2 border-white/60"></div>
//                 <span className="text-slate-400">Budget</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded bg-slate-500"></div>
//                 <span className="text-slate-400">Actual</span>
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       {/* Bar Chart Section */}
//       <div className="px-6 mt-6">
//         <div
//           className="border-2 rounded-2xl p-5"
//           style={{
//             borderColor:
//               currentView === 'summary'
//                 ? COLORS.EXPENSE
//                 : summaryBars.find((b) => b.type === currentView)?.color ||
//                   COLORS.EXPENSE,
//           }}
//         >
//           {/* Header with back button if not in summary */}
//           <div className="flex items-center justify-between mb-6">
//             {currentView !== 'summary' && (
//               <button
//                 onClick={() => setCurrentView('summary')}
//                 className="p-1 hover:bg-white/10 rounded-full transition"
//               >
//                 <ChevronRight className="w-5 h-5 text-white rotate-180" />
//               </button>
//             )}
//             <h2 className="text-white text-sm font-bold flex-1">
//               {currentView === 'summary'
//                 ? 'Summary'
//                 : `${
//                     currentView.charAt(0).toUpperCase() + currentView.slice(1)
//                   } Categories`}
//             </h2>
//           </div>

//           {!hasData ? (
//             /* No Data Message */
//             <div className="text-center py-12">
//               <div className="text-6xl mb-4">📊</div>
//               <p className="text-white text-lg font-medium mb-2">
//                 No data for {selectedMonthLabel}
//               </p>
//               <p className="text-slate-400 text-sm">
//                 Start tracking your expenses to see insights here
//               </p>
//               <button
//                 onClick={() => router.push('/chat')}
//                 className="mt-6 px-6 py-3 rounded-full text-white font-medium"
//                 style={{ backgroundColor: COLORS.EXPENSE }}
//               >
//                 Add Your First Transaction
//               </button>
//             </div>
//           ) : currentView === 'summary' ? (
//             /* Summary Bars - 4 Transaction Types */
//             <>
//               <div
//                 className="flex items-end justify-around gap-2 px-2"
//                 style={{ height: '140px' }}
//               >
//                 {summaryBars.map((bar, index) => {
//                   const heightPercent = (bar.amount / maxSummaryAmount) * 100;
//                   const Icon = bar.icon;

//                   return (
//                     <button
//                       key={index}
//                       onClick={() => bar.amount > 0 && setCurrentView(bar.type)}
//                       className="flex flex-col items-center justify-end hover:opacity-80 transition cursor-pointer"
//                       style={{ width: '22%' }}
//                       disabled={bar.amount === 0}
//                     >
//                       <div
//                         className="w-full rounded-lg relative overflow-hidden"
//                         style={{
//                           height: '100px',
//                           backgroundColor: bar.fadedColor,
//                         }}
//                       >
//                         <div
//                           className="absolute bottom-0 w-full rounded-lg transition-all duration-500 flex items-end justify-center pb-2"
//                           style={{
//                             height: `${Math.max(
//                               heightPercent,
//                               bar.amount > 0 ? 20 : 0
//                             )}%`,
//                             backgroundColor: bar.color,
//                           }}
//                         >
//                           {bar.amount > 0 && (
//                             <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
//                               <Icon className="w-4 h-4 text-white" />
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>

//               <div className="flex justify-around gap-2 mt-3 px-2">
//                 {summaryBars.map((bar, index) => (
//                   <div
//                     key={index}
//                     className="flex flex-col items-center"
//                     style={{ width: '22%' }}
//                   >
//                     <p className="text-white text-xs text-center mb-1 font-medium">
//                       {bar.name}
//                     </p>
//                     <p className="text-white text-sm font-bold">
//                       ₹
//                       {bar.amount >= 1000
//                         ? `${(bar.amount / 1000).toFixed(1)}k`
//                         : bar.amount}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </>
//           ) : /* Category Bars - For Selected Type */
//           categoryBars.length > 0 ? (
//             <>
//               <div
//                 className={`grid gap-2 px-2 items-end ${
//                   categoryBars.length > 5
//                     ? 'grid-cols-5 md:grid-cols-10'
//                     : 'grid-cols-5'
//                 }`}
//                 style={{ height: '140px' }}
//               >
//                 {categoryBars.map((category, index) => {
//                   const heightPercent =
//                     (category.amount / maxCategoryAmount) * 100;
//                   const Icon = getCategoryIcon(category.name);
//                   const barColor =
//                     summaryBars.find((b) => b.type === currentView)?.color ||
//                     COLORS.BAR_EXPENSE;
//                   const fadedColor =
//                     summaryBars.find((b) => b.type === currentView)
//                       ?.fadedColor || COLORS.BAR_FADED_EXPENSE;

//                   return (
//                     <div
//                       key={index}
//                       className="flex flex-col items-center justify-end"
//                     >
//                       <div
//                         className="w-full rounded-lg relative overflow-hidden"
//                         style={{
//                           height: '100px',
//                           backgroundColor: fadedColor,
//                         }}
//                       >
//                         <div
//                           className="absolute bottom-0 w-full rounded-lg transition-all duration-500 flex items-end justify-center pb-2"
//                           style={{
//                             height: `${Math.max(heightPercent, 20)}%`,
//                             backgroundColor: barColor,
//                           }}
//                         >
//                           <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
//                             <Icon className="w-4 h-4 text-white" />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               <div
//                 className={`grid gap-2 mt-3 px-2 ${
//                   categoryBars.length > 5
//                     ? 'grid-cols-5 md:grid-cols-10'
//                     : 'grid-cols-5'
//                 }`}
//               >
//                 {categoryBars.map((category, index) => (
//                   <div key={index} className="flex flex-col items-center">
//                     <p className="text-white text-[10px] text-center mb-1 truncate w-full leading-tight">
//                       {category.name}
//                     </p>
//                     <p className="text-white text-xs font-bold">
//                       ₹
//                       {category.amount >= 1000
//                         ? `${(category.amount / 1000).toFixed(1)}k`
//                         : category.amount}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </>
//           ) : (
//             <div className="text-center py-8 text-slate-400">
//               No {currentView} data for this month
//             </div>
//           )}

//           {/* View All Button - Only show in category view */}
//           {currentView !== 'summary' && categoryBars.length > 0 && (
//             <button
//               onClick={() => router.push('/categories')}
//               className="w-full mt-6 py-3 border border-white/20 rounded-full text-white hover:bg-white/5 transition text-sm font-medium"
//             >
//               View all categories
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Stats Cards */}
//       {hasData && (
//         <div className="px-6 mt-6 space-y-4">
//           <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-slate-400 text-sm">Started Passbook</span>
//               <span className="text-2xl">📅</span>
//             </div>
//             <p className="text-white text-lg font-bold">10 Mar 2024</p>
//           </div>

//           <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-slate-400 text-sm">Lifetime entries</span>
//               <span className="text-2xl">💬</span>
//             </div>
//             <p className="text-white text-lg font-bold">
//               {totalCategoryCount}
//             </p>
//           </div>

//           <div className="bg-gradient-to-r from-yellow-100/20 to-yellow-200/20 backdrop-blur-sm border border-yellow-300/30 rounded-2xl p-4 flex items-center justify-between">
//             <p className="text-white text-sm">
//               You are in the <span className="font-bold">top 10%</span> Passbook
//               users
//             </p>
//             <span className="text-3xl">♟️</span>
//           </div>
//         </div>
//       )}

//       {/* Floating Action Button */}
//       <button
//         onClick={() => router.push('/chat')}
//         className="fixed bottom-6 right-6 px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50 hover:scale-105 transition-transform"
//         style={{ backgroundColor: COLORS.BACKGROUND }}
//       >
//         <MessageCircle className="w-5 h-5 text-white" />
//         <span className="text-white font-bold text-sm">Input expense</span>
//       </button>

//     </div>
//   );
// }

// export default function DashboardPage() {
//   return (
//     <ProtectedRoute>
//       <DashboardContent />
//     </ProtectedRoute>
//   );
// }

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import {
  Home as HomeIcon,
  Car,
  Utensils,
  Receipt,
  ShoppingBag,
  MessageCircle,
  ChevronDown,
  Grid3x3,
  Calendar,
  ChevronRight,
  Loader2,
  TrendingDown,
  TrendingUp,
  ChartCandlestick,
  PiggyBank,
  LogOut,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import { DateFilterModal } from '@/components/date-filter-modal';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const COLORS = {
  EXPENSE: '#E55F78',
  INCOME: '#74C4BB',
  INVESTMENTS: '#A3CDF3',
  SAVINGS: '#F6DB87',
  BACKGROUND: '#152D37',
  BAR_EXPENSE: '#C43D4F',
  BAR_INCOME: '#53A292',
  BAR_INVESTMENT: '#82ABCA',
  BAR_SAVINGS: '#D5B95E',
  BAR_FADED_EXPENSE: 'rgba(196, 61, 79, 0.4)',
  BAR_FADED_INCOME: 'rgba(83, 162, 146, 0.4)',
  BAR_FADED_INVESTMENT: 'rgba(130, 171, 202, 0.4)',
  BAR_FADED_SAVINGS: 'rgba(213, 185, 94, 0.4)',
};

const getCategoryIcon = (category: string) => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('rent') || categoryLower.includes('housing'))
    return HomeIcon;
  if (categoryLower.includes('transport') || categoryLower.includes('travel'))
    return Car;
  if (
    categoryLower.includes('food') ||
    categoryLower.includes('restaurant') ||
    categoryLower.includes('eating')
  )
    return Utensils;
  if (
    categoryLower.includes('bill') ||
    categoryLower.includes('utility') ||
    categoryLower.includes('utilities')
  )
    return Receipt;
  if (categoryLower.includes('shopping') || categoryLower.includes('groceries'))
    return ShoppingBag;
  return ShoppingBag;
};

interface Category {
  name: string;
  amount: number;
  count: number;
  percentage: number;
}

interface Analytics {
  expense: number;
  income: number;
  investments: number;
  savings: number;
  categories: {
    EXPENSE: Category[];
    INCOME: Category[];
    INVESTMENTS: Category[];
    SAVINGS: Category[];
  };
  period: string;
}

type ViewType = 'summary' | 'expense' | 'income' | 'investments' | 'savings';

function DashboardContent() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis'>(
    'dashboard'
  );
  const [currentView, setCurrentView] = useState<ViewType>('summary');

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<string | null>('2025-12-01');
  const [endDate, setEndDate] = useState<string | null>('2025-12-31');
  const [dateLabel, setDateLabel] = useState("Dec'25");
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (user && token) {
      fetchAnalytics();
    }
  }, [user, token, startDate, endDate]);

  const fetchAnalytics = async () => {
    if (!token) return;

    try {
      setIsLoading(true);

      let queryParams = '';
      if (startDate && endDate) {
        queryParams = `startDate=${startDate}&endDate=${endDate}`;
      } else {
        queryParams = 'month=2025-12';
      }

      const response = await fetch(`/api/analytics?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabSwitch = (tab: 'dashboard' | 'analysis') => {
    setActiveTab(tab);
  };

  const handleDateApply = (start: string | null, end: string | null) => {
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      if (
        startDateObj.getFullYear() === endDateObj.getFullYear() &&
        startDateObj.getMonth() === endDateObj.getMonth()
      ) {
        setDateLabel(
          `${monthNames[startDateObj.getMonth()]}'${startDateObj
            .getFullYear()
            .toString()
            .slice(2)}`
        );
      } else if (startDateObj.getFullYear() === endDateObj.getFullYear()) {
        setDateLabel(
          `${monthNames[startDateObj.getMonth()]}-${
            monthNames[endDateObj.getMonth()]
          }'${startDateObj.getFullYear().toString().slice(2)}`
        );
      } else {
        setDateLabel(
          `${monthNames[startDateObj.getMonth()]}'${startDateObj
            .getFullYear()
            .toString()
            .slice(2)}-${monthNames[endDateObj.getMonth()]}'${endDateObj
            .getFullYear()
            .toString()
            .slice(2)}`
        );
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
    }
  };

  if (isLoading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: COLORS.BACKGROUND }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const hasCategories =
    analytics &&
    Object.values(analytics.categories).some(
      (categories) => categories.length > 0
    );
  const hasData =
    analytics &&
    (analytics.expense > 0 ||
      analytics.income > 0 ||
      analytics.investments > 0 ||
      analytics.savings > 0 ||
      hasCategories);

  const summaryBars = [
    {
      name: 'Expense',
      amount: analytics?.expense || 0,
      color: COLORS.BAR_EXPENSE,
      fadedColor: COLORS.BAR_FADED_EXPENSE,
      icon: TrendingDown,
      type: 'expense' as ViewType,
    },
    {
      name: 'Income',
      amount: analytics?.income || 0,
      color: COLORS.BAR_INCOME,
      fadedColor: COLORS.BAR_FADED_INCOME,
      icon: TrendingUp,
      type: 'income' as ViewType,
    },
    {
      name: 'Investments',
      amount: analytics?.investments || 0,
      color: COLORS.BAR_INVESTMENT,
      fadedColor: COLORS.BAR_FADED_INVESTMENT,
      icon: ChartCandlestick,
      type: 'investments' as ViewType,
    },
    {
      name: 'Savings',
      amount: analytics?.savings || 0,
      color: COLORS.BAR_SAVINGS,
      fadedColor: COLORS.BAR_FADED_SAVINGS,
      icon: PiggyBank,
      type: 'savings' as ViewType,
    },
  ];

  const categoryBars =
    currentView !== 'summary' && analytics
      ? (
          analytics.categories[
            currentView.toUpperCase() as keyof typeof analytics.categories
          ] || []
        ).slice(0, 10)
      : [];

  const maxSummaryAmount = Math.max(...summaryBars.map((b) => b.amount), 1);
  const maxCategoryAmount =
    categoryBars.length > 0
      ? Math.max(...categoryBars.map((c) => c.amount), 1)
      : 1;

  const topCategories = analytics?.categories.EXPENSE.slice(0, 5) || [];
  const budgetsMet = topCategories.filter(
    (c) => c.percentage !== undefined && c.percentage < 100
  ).length;
  const totalCategoryCount = Object.values(analytics?.categories ?? {})
    .flat()
    .reduce((sum, c) => sum + c.count, 0);

  // Chart Data Preparation
  const transactionTypeData = {
    labels: ['Expense', 'Income', 'Investments', 'Savings'],
    datasets: [
      {
        label: 'Amount',
        data: [
          analytics?.expense || 0,
          analytics?.income || 0,
          analytics?.investments || 0,
          analytics?.savings || 0,
        ],
        backgroundColor: [
          COLORS.BAR_EXPENSE,
          COLORS.BAR_INCOME,
          COLORS.BAR_INVESTMENT,
          COLORS.BAR_SAVINGS,
        ],
        borderColor: [
          COLORS.EXPENSE,
          COLORS.INCOME,
          COLORS.INVESTMENTS,
          COLORS.SAVINGS,
        ],
        borderWidth: 2,
      },
    ],
  };

  const categoryBreakdownData = {
    labels: analytics?.categories.EXPENSE.slice(0, 8).map((c) => c.name) || [],
    datasets: [
      {
        label: 'Expense by Category',
        data:
          analytics?.categories.EXPENSE.slice(0, 8).map((c) => c.amount) || [],
        backgroundColor: [
          'rgba(196, 61, 79, 0.8)',
          'rgba(83, 162, 146, 0.8)',
          'rgba(130, 171, 202, 0.8)',
          'rgba(213, 185, 94, 0.8)',
          'rgba(196, 61, 79, 0.6)',
          'rgba(83, 162, 146, 0.6)',
          'rgba(130, 171, 202, 0.6)',
          'rgba(213, 185, 94, 0.6)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const cashFlowData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Income',
        data: [
          analytics?.income ? analytics.income * 0.25 : 0,
          analytics?.income ? analytics.income * 0.25 : 0,
          analytics?.income ? analytics.income * 0.25 : 0,
          analytics?.income ? analytics.income * 0.25 : 0,
        ],
        borderColor: COLORS.INCOME,
        backgroundColor: COLORS.BAR_FADED_INCOME,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expense',
        data: [
          analytics?.expense ? analytics.expense * 0.3 : 0,
          analytics?.expense ? analytics.expense * 0.2 : 0,
          analytics?.expense ? analytics.expense * 0.25 : 0,
          analytics?.expense ? analytics.expense * 0.25 : 0,
        ],
        borderColor: COLORS.EXPENSE,
        backgroundColor: COLORS.BAR_FADED_EXPENSE,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        ticks: { color: '#fff', font: { size: 11 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      x: {
        ticks: { color: '#fff', font: { size: 11 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#fff',
          font: { size: 10 },
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
  };

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: COLORS.BACKGROUND }}
    >
      {/* Tab Switcher */}
      <div className="flex justify-center pt-6 pb-4">
        <div className="relative bg-white/10 backdrop-blur-lg rounded-full p-1 border border-white/20 w-64">
          <div
            className="absolute top-1 bottom-1 bg-white rounded-full transition-all duration-300 ease-out"
            style={{
              left: activeTab === 'dashboard' ? '4px' : 'calc(50% + 4px)',
              width: 'calc(50% - 8px)',
            }}
          />
          <div className="relative flex">
            <button
              onClick={() => handleTabSwitch('dashboard')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-colors z-10 ${
                activeTab === 'dashboard' ? 'text-slate-800' : 'text-slate-300'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="font-semibold text-sm">Dashboard</span>
            </button>
            <button
              onClick={() => handleTabSwitch('analysis')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-colors z-10 ${
                activeTab === 'analysis' ? 'text-slate-800' : 'text-slate-300'
              }`}
            >
              <span className="font-semibold text-sm">Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-6 mt-8 flex items-center justify-end gap-4">
        <button
          onClick={handleLogout}
          className="w-10 h-10 bg-red-500/50 rounded-full flex items-center justify-center hover:bg-red-500 transition"
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-white" />
        </button>
        <div
          className="px-6 py-2 rounded-full rounded-bl-sm rounded-tl-2xl"
          style={{
            background: 'linear-gradient(135deg, #F4E099 0%, #F9F1CA 100%)',
          }}
        >
          <p className="text-slate-800 font-bold text-sm">
            Don't thank me just ...
          </p>
        </div>
        <div
          className="w-16 h-16 rounded-full border-2 flex items-center justify-center bg-white text-2xl font-bold shadow-lg"
          style={{
            borderColor: '#F4E099',
            boxShadow: '0 4px 12px rgba(244, 224, 153, 0.5)',
          }}
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>

      {/* Date Filter - Common for both tabs */}
      <div className="px-6 mt-6 flex items-center justify-end">
        <button
          ref={dateButtonRef}
          onClick={() => setIsDateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white border border-white/10 hover:bg-white/20 transition"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">{dateLabel}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <DateFilterModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onApply={handleDateApply}
        currentStartDate={startDate}
        currentEndDate={endDate}
        anchorRef={dateButtonRef}
      />

      {/* Conditional Content Based on Active Tab */}
      {activeTab === 'dashboard' ? (
        /* DASHBOARD TAB CONTENT */
        <>
          {/* Summary Header */}
          <div className="px-6 mt-6">
            {hasData && (
              <>
                <button className="flex items-center gap-2 text-white text-base font-bold">
                  <span>🏆</span>
                  <span>
                    {budgetsMet} out of {topCategories.length} budgets met
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="flex items-center justify-end gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-white/60"></div>
                    <span className="text-slate-400">Budget</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-slate-500"></div>
                    <span className="text-slate-400">Actual</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bar Chart Section */}
          <div className="px-6 mt-6">
            <div
              className="border-2 rounded-2xl p-5"
              style={{
                borderColor:
                  currentView === 'summary'
                    ? COLORS.EXPENSE
                    : summaryBars.find((b) => b.type === currentView)?.color ||
                      COLORS.EXPENSE,
              }}
            >
              <div className="flex items-center justify-between mb-6">
                {currentView !== 'summary' && (
                  <button
                    onClick={() => setCurrentView('summary')}
                    className="p-1 hover:bg-white/10 rounded-full transition"
                  >
                    <ChevronRight className="w-5 h-5 text-white rotate-180" />
                  </button>
                )}
                <h2 className="text-white text-sm font-bold flex-1">
                  {currentView === 'summary'
                    ? 'Summary'
                    : `${
                        currentView.charAt(0).toUpperCase() +
                        currentView.slice(1)
                      } Categories`}
                </h2>
              </div>

              {!hasData ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-white text-lg font-medium mb-2">
                    No data for selected period
                  </p>
                  <p className="text-slate-400 text-sm">
                    Start tracking your expenses to see insights here
                  </p>
                  <button
                    onClick={() => router.push('/chat')}
                    className="mt-6 px-6 py-3 rounded-full text-white font-medium"
                    style={{ backgroundColor: COLORS.EXPENSE }}
                  >
                    Add Your First Transaction
                  </button>
                </div>
              ) : currentView === 'summary' ? (
                <>
                  <div
                    className="flex items-end justify-around gap-2 px-2"
                    style={{ height: '140px' }}
                  >
                    {summaryBars.map((bar, index) => {
                      const heightPercent =
                        (bar.amount / maxSummaryAmount) * 100;
                      const Icon = bar.icon;

                      return (
                        <button
                          key={index}
                          onClick={() =>
                            bar.amount > 0 && setCurrentView(bar.type)
                          }
                          className="flex flex-col items-center justify-end hover:opacity-80 transition cursor-pointer"
                          style={{ width: '22%' }}
                          disabled={bar.amount === 0}
                        >
                          <div
                            className="w-full rounded-lg relative overflow-hidden"
                            style={{
                              height: '100px',
                              backgroundColor: bar.fadedColor,
                            }}
                          >
                            <div
                              className="absolute bottom-0 w-full rounded-lg transition-all duration-500 flex items-end justify-center pb-2"
                              style={{
                                height: `${Math.max(
                                  heightPercent,
                                  bar.amount > 0 ? 20 : 0
                                )}%`,
                                backgroundColor: bar.color,
                              }}
                            >
                              {bar.amount > 0 && (
                                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                  <Icon className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-around gap-2 mt-3 px-2">
                    {summaryBars.map((bar, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center"
                        style={{ width: '22%' }}
                      >
                        <p className="text-white text-xs text-center mb-1 font-medium">
                          {bar.name}
                        </p>
                        <p className="text-white text-sm font-bold">
                          ₹
                          {bar.amount >= 1000
                            ? `${(bar.amount / 1000).toFixed(1)}k`
                            : bar.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : categoryBars.length > 0 ? (
                <>
                  <div
                    className={`grid gap-2 px-2 items-end ${
                      categoryBars.length > 5
                        ? 'grid-cols-5 md:grid-cols-10'
                        : 'grid-cols-5'
                    }`}
                    style={{ height: '140px' }}
                  >
                    {categoryBars.map((category, index) => {
                      const heightPercent =
                        (category.amount / maxCategoryAmount) * 100;
                      const Icon = getCategoryIcon(category.name);
                      const barColor =
                        summaryBars.find((b) => b.type === currentView)
                          ?.color || COLORS.BAR_EXPENSE;
                      const fadedColor =
                        summaryBars.find((b) => b.type === currentView)
                          ?.fadedColor || COLORS.BAR_FADED_EXPENSE;

                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center justify-end"
                        >
                          <div
                            className="w-full rounded-lg relative overflow-hidden"
                            style={{
                              height: '100px',
                              backgroundColor: fadedColor,
                            }}
                          >
                            <div
                              className="absolute bottom-0 w-full rounded-lg transition-all duration-500 flex items-end justify-center pb-2"
                              style={{
                                height: `${Math.max(heightPercent, 20)}%`,
                                backgroundColor: barColor,
                              }}
                            >
                              <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className={`grid gap-2 mt-3 px-2 ${
                      categoryBars.length > 5
                        ? 'grid-cols-5 md:grid-cols-10'
                        : 'grid-cols-5'
                    }`}
                  >
                    {categoryBars.map((category, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <p className="text-white text-[10px] text-center mb-1 truncate w-full leading-tight">
                          {category.name}
                        </p>
                        <p className="text-white text-xs font-bold">
                          ₹
                          {category.amount >= 1000
                            ? `${(category.amount / 1000).toFixed(1)}k`
                            : category.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No {currentView} data for this period
                </div>
              )}

              {currentView !== 'summary' && categoryBars.length > 0 && (
                <button
                  onClick={() => router.push('/categories')}
                  className="w-full mt-6 py-3 border border-white/20 rounded-full text-white hover:bg-white/5 transition text-sm font-medium"
                >
                  View all categories
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          {hasData && (
            <div className="px-6 mt-6 space-y-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">
                    Started Passbook
                  </span>
                  <span className="text-2xl">📅</span>
                </div>
                <p className="text-white text-lg font-bold">10 Mar 2024</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">
                    Lifetime entries
                  </span>
                  <span className="text-2xl">💬</span>
                </div>
                <p className="text-white text-lg font-bold">
                  {totalCategoryCount}
                </p>
              </div>

              <div className="bg-gradient-to-r from-yellow-100/20 to-yellow-200/20 backdrop-blur-sm border border-yellow-300/30 rounded-2xl p-4 flex items-center justify-between">
                <p className="text-white text-sm">
                  You are in the <span className="font-bold">top 10%</span>{' '}
                  Passbook users
                </p>
                <span className="text-3xl">♟️</span>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ANALYSIS TAB CONTENT */
        /* ANALYSIS TAB CONTENT */
        <div className="px-6 mt-6 space-y-6">
          {!hasData ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📈</div>
              <p className="text-white text-lg font-medium mb-2">
                No analysis data available
              </p>
              <p className="text-slate-400 text-sm">
                Add some transactions to see detailed insights
              </p>
            </div>
          ) : (
            <>
              {/* Overview Cards - Now Clickable */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {summaryBars.map((bar, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentView(bar.type)}
                    className={`bg-white/5 backdrop-blur-sm border rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                      currentView === bar.type
                        ? 'border-white/40 bg-white/10 shadow-lg'
                        : 'border-white/10'
                    }`}
                    style={{
                      animation: `slideInUp 0.${idx + 3}s ease-out`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 hover:rotate-12"
                        style={{ backgroundColor: bar.color }}
                      >
                        <bar.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-400 text-xs">{bar.name}</span>
                      {currentView === bar.type && (
                        <span className="ml-auto text-green-400 text-xs">
                          ●
                        </span>
                      )}
                    </div>
                    <p className="text-white text-xl font-bold">
                      ₹
                      {bar.amount >= 1000
                        ? `${(bar.amount / 1000).toFixed(1)}k`
                        : bar.amount}
                    </p>
                    <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${(bar.amount / maxSummaryAmount) * 100}%`,
                          backgroundColor: bar.color,
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>

              {/* Main Chart - Changes based on selected type */}
              <div
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 transition-all duration-500"
                style={{ animation: 'fadeIn 0.5s ease-out' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-white" />
                    <h3 className="text-white text-lg font-bold">
                      {currentView === 'summary'
                        ? 'All Transactions Overview'
                        : `${
                            currentView.charAt(0).toUpperCase() +
                            currentView.slice(1)
                          } Analysis`}
                    </h3>
                  </div>
                  {currentView !== 'summary' && (
                    <button
                      onClick={() => setCurrentView('summary')}
                      className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1"
                    >
                      <ChevronRight className="w-3 h-3 rotate-180" />
                      Back to Overview
                    </button>
                  )}
                </div>

                {currentView === 'summary' ? (
                  <div style={{ height: '280px' }}>
                    <Bar
                      data={transactionTypeData}
                      options={{
                        ...chartOptions,
                        animation: {
                          duration: 1500,
                          easing: 'easeInOutQuart',
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ height: '280px' }}>
                    <Bar
                      data={{
                        labels: analytics.categories[
                          currentView.toUpperCase() as keyof typeof analytics.categories
                        ]
                          .slice(0, 8)
                          .map((c) => c.name),
                        datasets: [
                          {
                            label: `${currentView} by Category`,
                            data: analytics.categories[
                              currentView.toUpperCase() as keyof typeof analytics.categories
                            ]
                              .slice(0, 8)
                              .map((c) => c.amount),
                            backgroundColor: summaryBars.find(
                              (b) => b.type === currentView
                            )?.fadedColor,
                            borderColor: summaryBars.find(
                              (b) => b.type === currentView
                            )?.color,
                            borderWidth: 2,
                            borderRadius: 8,
                          },
                        ],
                      }}
                      options={{
                        ...chartOptions,
                        animation: {
                          duration: 1500,
                          easing: 'easeInOutQuart',
                        },
                        indexAxis: 'y' as const,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Distribution Pie Chart */}
                <div
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5"
                  style={{ animation: 'slideInLeft 0.6s ease-out' }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="w-5 h-5 text-white" />
                    <h3 className="text-white text-base font-bold">
                      {currentView === 'summary' ? 'Expense' : currentView}{' '}
                      Distribution
                    </h3>
                  </div>
                  <div style={{ height: '220px' }}>
                    <Doughnut
                      data={{
                        labels:
                          currentView === 'summary'
                            ? analytics.categories.EXPENSE.slice(0, 6).map(
                                (c) => c.name
                              )
                            : analytics.categories[
                                currentView.toUpperCase() as keyof typeof analytics.categories
                              ]
                                .slice(0, 6)
                                .map((c) => c.name),
                        datasets: [
                          {
                            data:
                              currentView === 'summary'
                                ? analytics.categories.EXPENSE.slice(0, 6).map(
                                    (c) => c.amount
                                  )
                                : analytics.categories[
                                    currentView.toUpperCase() as keyof typeof analytics.categories
                                  ]
                                    .slice(0, 6)
                                    .map((c) => c.amount),
                            backgroundColor: [
                              'rgba(196, 61, 79, 0.9)',
                              'rgba(83, 162, 146, 0.9)',
                              'rgba(130, 171, 202, 0.9)',
                              'rgba(213, 185, 94, 0.9)',
                              'rgba(196, 61, 79, 0.6)',
                              'rgba(83, 162, 146, 0.6)',
                            ],
                            borderWidth: 0,
                          },
                        ],
                      }}
                      options={{
                        ...doughnutOptions,
                        animation: {
                          animateRotate: true,
                          animateScale: true,
                          duration: 1500,
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Transaction Count */}
                <div
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5"
                  style={{ animation: 'slideInRight 0.6s ease-out' }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-white" />
                    <h3 className="text-white text-base font-bold">
                      Transaction Count
                    </h3>
                  </div>
                  <div style={{ height: '220px' }}>
                    <Bar
                      data={{
                        labels:
                          currentView === 'summary'
                            ? ['Expense', 'Income', 'Investments', 'Savings']
                            : analytics.categories[
                                currentView.toUpperCase() as keyof typeof analytics.categories
                              ]
                                .slice(0, 6)
                                .map((c) => c.name),
                        datasets: [
                          {
                            label: 'Count',
                            data:
                              currentView === 'summary'
                                ? [
                                    analytics.categories.EXPENSE.reduce(
                                      (sum, c) => sum + c.count,
                                      0
                                    ),
                                    analytics.categories.INCOME.reduce(
                                      (sum, c) => sum + c.count,
                                      0
                                    ),
                                    analytics.categories.INVESTMENTS.reduce(
                                      (sum, c) => sum + c.count,
                                      0
                                    ),
                                    analytics.categories.SAVINGS.reduce(
                                      (sum, c) => sum + c.count,
                                      0
                                    ),
                                  ]
                                : analytics.categories[
                                    currentView.toUpperCase() as keyof typeof analytics.categories
                                  ]
                                    .slice(0, 6)
                                    .map((c) => c.count),
                            backgroundColor:
                              currentView === 'summary'
                                ? [
                                    COLORS.BAR_FADED_EXPENSE,
                                    COLORS.BAR_FADED_INCOME,
                                    COLORS.BAR_FADED_INVESTMENT,
                                    COLORS.BAR_FADED_SAVINGS,
                                  ]
                                : summaryBars.find(
                                    (b) => b.type === currentView
                                  )?.fadedColor,
                            borderColor:
                              currentView === 'summary'
                                ? [
                                    COLORS.EXPENSE,
                                    COLORS.INCOME,
                                    COLORS.INVESTMENTS,
                                    COLORS.SAVINGS,
                                  ]
                                : summaryBars.find(
                                    (b) => b.type === currentView
                                  )?.color,
                            borderWidth: 2,
                            borderRadius: 6,
                          },
                        ],
                      }}
                      options={{
                        ...chartOptions,
                        animation: {
                          duration: 1200,
                          easing: 'easeOutBounce',
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Cash Flow Trend - Full Width */}
              <div
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5"
                style={{ animation: 'slideInUp 0.7s ease-out' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-white" />
                  <h3 className="text-white text-lg font-bold">
                    {currentView === 'summary'
                      ? 'Income vs Expense Trend'
                      : `${currentView} Trend`}
                  </h3>
                </div>
                <div style={{ height: '250px' }}>
                  <Line
                    data={
                      currentView === 'summary'
                        ? cashFlowData
                        : {
                            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                            datasets: [
                              {
                                label: currentView,
                                data: [
                                  summaryBars.find(
                                    (b) => b.type === currentView
                                  )?.amount
                                    ? summaryBars.find(
                                        (b) => b.type === currentView
                                      )!.amount * 0.3
                                    : 0,
                                  summaryBars.find(
                                    (b) => b.type === currentView
                                  )?.amount
                                    ? summaryBars.find(
                                        (b) => b.type === currentView
                                      )!.amount * 0.2
                                    : 0,
                                  summaryBars.find(
                                    (b) => b.type === currentView
                                  )?.amount
                                    ? summaryBars.find(
                                        (b) => b.type === currentView
                                      )!.amount * 0.25
                                    : 0,
                                  summaryBars.find(
                                    (b) => b.type === currentView
                                  )?.amount
                                    ? summaryBars.find(
                                        (b) => b.type === currentView
                                      )!.amount * 0.25
                                    : 0,
                                ],
                                borderColor: summaryBars.find(
                                  (b) => b.type === currentView
                                )?.color,
                                backgroundColor: summaryBars.find(
                                  (b) => b.type === currentView
                                )?.fadedColor,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 6,
                                pointHoverRadius: 8,
                              },
                            ],
                          }
                    }
                    options={{
                      ...chartOptions,
                      animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart',
                      },
                    }}
                  />
                </div>
              </div>

              {/* Top Categories/Items List */}
              <div
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5"
                style={{ animation: 'fadeIn 0.8s ease-out' }}
              >
                <h3 className="text-white text-lg font-bold mb-4">
                  {currentView === 'summary'
                    ? 'Top Spending Categories'
                    : `Top ${currentView} Categories`}
                </h3>
                <div className="space-y-3">
                  {(currentView === 'summary'
                    ? analytics.categories.EXPENSE
                    : analytics.categories[
                        currentView.toUpperCase() as keyof typeof analytics.categories
                      ]
                  )
                    .slice(0, 5)
                    .map((cat, idx) => {
                      const Icon = getCategoryIcon(cat.name);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-102"
                          style={{
                            animation: `slideInRight ${
                              0.2 + idx * 0.1
                            }s ease-out`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 hover:rotate-12"
                              style={{
                                backgroundColor:
                                  currentView === 'summary'
                                    ? COLORS.BAR_FADED_EXPENSE
                                    : summaryBars.find(
                                        (b) => b.type === currentView
                                      )?.fadedColor,
                              }}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {cat.name}
                              </p>
                              <p className="text-slate-400 text-xs">
                                {cat.count} transactions
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">
                              ₹{cat.amount.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-1000"
                                  style={{
                                    width: `${cat.percentage}%`,
                                    backgroundColor:
                                      currentView === 'summary'
                                        ? COLORS.EXPENSE
                                        : summaryBars.find(
                                            (b) => b.type === currentView
                                          )?.color,
                                  }}
                                />
                              </div>
                              <span className="text-slate-400 text-xs">
                                {cat.percentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Insights Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-300/30 rounded-2xl p-4"
                  style={{ animation: 'slideInUp 0.9s ease-out' }}
                >
                  <div className="text-3xl mb-2">💡</div>
                  <p className="text-white text-sm font-medium mb-1">
                    Average Transaction
                  </p>
                  <p className="text-white text-2xl font-bold">
                    ₹
                    {currentView === 'summary'
                      ? Math.round(
                          analytics.expense /
                            analytics.categories.EXPENSE.reduce(
                              (sum, c) => sum + c.count,
                              0
                            ) || 0
                        ).toLocaleString()
                      : Math.round(
                          summaryBars.find((b) => b.type === currentView)
                            ?.amount! /
                            analytics.categories[
                              currentView.toUpperCase() as keyof typeof analytics.categories
                            ].reduce((sum, c) => sum + c.count, 0) || 0
                        ).toLocaleString()}
                  </p>
                </div>

                <div
                  className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-300/30 rounded-2xl p-4"
                  style={{ animation: 'slideInUp 1s ease-out' }}
                >
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-white text-sm font-medium mb-1">
                    Total Transactions
                  </p>
                  <p className="text-white text-2xl font-bold">
                    {currentView === 'summary'
                      ? Object.values(analytics.categories)
                          .flat()
                          .reduce((sum, c) => sum + c.count, 0)
                      : analytics.categories[
                          currentView.toUpperCase() as keyof typeof analytics.categories
                        ].reduce((sum, c) => sum + c.count, 0)}
                  </p>
                </div>

                <div
                  className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-300/30 rounded-2xl p-4"
                  style={{ animation: 'slideInUp 1.1s ease-out' }}
                >
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="text-white text-sm font-medium mb-1">
                    Top Category
                  </p>
                  <p className="text-white text-xl font-bold truncate">
                    {currentView === 'summary'
                      ? analytics.categories.EXPENSE[0]?.name || 'N/A'
                      : analytics.categories[
                          currentView.toUpperCase() as keyof typeof analytics.categories
                        ][0]?.name || 'N/A'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => router.push('/chat')}
        className="fixed bottom-6 right-6 px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50 hover:scale-105 transition-transform"
        style={{ backgroundColor: COLORS.BACKGROUND }}
      >
        <MessageCircle className="w-5 h-5 text-white" />
        <span className="text-white font-bold text-sm">Input expense</span>
      </button>
    </div>
  );
}
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
