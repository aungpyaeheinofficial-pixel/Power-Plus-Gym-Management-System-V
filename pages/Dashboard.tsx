
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { 
  DollarSign, Users, ShoppingBag, Activity, UserPlus, 
  BarChart3, TrendingUp, TrendingDown, Calendar, Filter,
  ArrowRight, CreditCard
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// --- Count Up Animation Component ---
const CountUp: React.FC<{ value: number, prefix?: string, suffix?: string }> = ({ value, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1000; // 1 second animation
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Ease out quart function
      const easeOut = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(progress === 1 ? value : Math.floor(value * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>
  );
};

// --- Stat Card Component ---
interface StatCardProps {
  title: string;
  value: number;
  prevValue: number;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  isCurrency?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, prevValue, icon: Icon, gradient, iconColor, isCurrency }) => {
  const percentChange = prevValue > 0 ? ((value - prevValue) / prevValue) * 100 : 0;
  const isPositive = percentChange >= 0;

  return (
    <div className={`relative bg-dark-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 overflow-hidden group hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
      {/* Background Gradient Glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-3xl ${gradient}`}></div>
      
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-opacity-10 ${iconColor} bg-white border border-white/5`}>
          <Icon size={24} className={iconColor.replace('bg-', 'text-')} />
        </div>
        {percentChange !== 0 && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${isPositive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(percentChange).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1 relative z-10">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-white">
          <CountUp value={value} suffix={isCurrency ? ' Ks' : ''} />
        </h3>
        <p className="text-xs text-gray-500">
           vs previous period ({isCurrency ? prevValue.toLocaleString() + ' Ks' : prevValue})
        </p>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { language, members, transactions, checkIns } = useApp();
  const t = TRANSLATIONS[language];

  // --- Date Filter State ---
  const [dateFilter, setDateFilter] = useState<'Today' | 'Week' | 'Month' | 'Custom'>('Month');
  const [customStart, setCustomStart] = useState(new Date().toISOString().split('T')[0]);
  const [customEnd, setCustomEnd] = useState(new Date().toISOString().split('T')[0]);

  // --- Data Processing ---
  const { currentStats, previousStats, chartData, paymentMethods } = useMemo(() => {
    // 1. Determine Date Ranges
    const now = new Date();
    let start = new Date();
    let end = new Date();
    let prevStart = new Date();
    let prevEnd = new Date();

    // Reset times for accurate day comparison
    const resetTime = (d: Date) => { d.setHours(0,0,0,0); return d; };
    const setEndTime = (d: Date) => { d.setHours(23,59,59,999); return d; };

    switch (dateFilter) {
      case 'Today':
        start = resetTime(new Date());
        end = setEndTime(new Date());
        prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - 1);
        prevEnd = new Date(end); prevEnd.setDate(prevEnd.getDate() - 1);
        break;
      case 'Week':
        // Current Week (starting Monday for simplicity or simply last 7 days)
        // Let's use Last 7 Days as it's common for "This Week" views in dashboards
        start = new Date(); start.setDate(start.getDate() - 6); resetTime(start);
        end = setEndTime(new Date());
        prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - 7);
        prevEnd = new Date(end); prevEnd.setDate(prevEnd.getDate() - 7);
        break;
      case 'Month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = setEndTime(new Date(now.getFullYear(), now.getMonth() + 1, 0)); // Last day of month
        prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'Custom':
        start = resetTime(new Date(customStart));
        end = setEndTime(new Date(customEnd));
        // Calculate duration to find previous period
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        prevEnd = new Date(start); prevEnd.setDate(prevEnd.getDate() - 1); setEndTime(prevEnd);
        prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - diffDays); resetTime(prevStart);
        break;
    }

    // Helper to calculate stats for a range
    const calc = (s: Date, e: Date) => {
      // Filter Transactions
      const rangeTrans = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= s && d <= e;
      });

      // Filter New Members (by join date)
      const rangeNewMembers = members.filter(m => {
        const d = new Date(m.joinDate);
        return d >= s && d <= e;
      });

      // Revenue Logic
      let totalRev = 0;
      let memRev = 0;
      let prodRev = 0;

      rangeTrans.forEach(t => {
        totalRev += t.total;
        // Split revenue based on type
        // Note: Simple logic assuming type is mostly correct on transaction
        if (t.type === 'Membership') {
           memRev += t.total;
        } else if (t.type === 'Product') {
           prodRev += t.total;
        } else {
           // Mixed: Estimate ratio from items
           let mSub = 0, pSub = 0;
           t.items.forEach(i => {
             if(i.type === 'Membership') mSub += i.price * i.quantity;
             else pSub += i.price * i.quantity;
           });
           const ratio = t.subtotal ? t.total / t.subtotal : 1;
           memRev += mSub * ratio;
           prodRev += pSub * ratio;
        }
      });

      return {
        totalRevenue: totalRev,
        membershipRevenue: memRev,
        productRevenue: prodRev,
        newMembers: rangeNewMembers.length,
        transactionsCount: rangeTrans.length
      };
    };

    const current = calc(start, end);
    const previous = calc(prevStart, prevEnd);
    
    // Active Members (Snapshot currently, using total active members as base)
    // For "Active Members" metric card, we usually show TOTAL current active members
    // Trends would be how many joined vs expired in period, but simplified:
    // We show Current Total vs Total at start of period (approx).
    // For now, let's just use Current Total vs (Current Total - New + Expired).
    // Simplified: Just showing 'New Members' trend is more accurate for this timeframe.
    // We will pass the total active members count separately.
    const activeMembersCount = members.filter(m => {
       const endDate = new Date(m.endDate);
       return endDate >= new Date(); // Not expired
    }).length;
    
    // Previous active members estimate: Current - New (in range) + Expired (in range)
    // This is complex, so for "Previous" value of Active Members, let's just use "Active Members Count - New Members in Period" as a rough proxy for growth.
    const prevActiveMembersEstimate = activeMembersCount - current.newMembers; 


    // --- Chart Data Generation (Daily breakdown of current range) ---
    // If range > 31 days, maybe group by week/month? For now daily.
    const chart = [];
    let iter = new Date(start);
    while (iter <= end) {
      const dayKey = iter.toLocaleDateString('en-CA'); // YYYY-MM-DD
      
      const dayTrans = transactions.filter(t => t.date.startsWith(dayKey));
      let mRev = 0, pRev = 0;
      
      dayTrans.forEach(t => {
         // Simplified split
         if(t.type === 'Membership') mRev += t.total;
         else if(t.type === 'Product') pRev += t.total;
         else { mRev += t.total / 2; pRev += t.total / 2; } // Rough split for mixed
      });

      chart.push({
        date: iter.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: dayKey,
        membership: mRev,
        product: pRev,
        total: mRev + pRev
      });
      
      iter.setDate(iter.getDate() + 1);
    }
    
    // --- Payment Methods Breakdown (Current Period) ---
    const methodStats: Record<string, number> = {};
    let rangeTotal = 0;
    
    // Re-filter transactions for current range to be safe
    const currentRangeTrans = transactions.filter(t => {
       const d = new Date(t.date);
       return d >= start && d <= end;
    });

    currentRangeTrans.forEach(t => {
      const method = t.paymentMethod || 'Cash';
      methodStats[method] = (methodStats[method] || 0) + t.total;
      rangeTotal += t.total;
    });

    const pMethods = Object.entries(methodStats)
      .map(([name, value]) => ({
        name,
        value,
        percentage: rangeTotal > 0 ? Math.round((value / rangeTotal) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);

    return {
      currentStats: { ...current, activeMembers: activeMembersCount },
      previousStats: { ...previous, activeMembers: prevActiveMembersEstimate },
      chartData: chart,
      paymentMethods: pMethods
    };

  }, [dateFilter, customStart, customEnd, transactions, members]);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* --- Filter Section (Sticky Top) --- */}
      <div className="sticky top-0 z-30 bg-dark-950/80 backdrop-blur-xl border-b border-white/5 -mx-4 px-4 py-4 md:-mx-8 md:px-8 mb-6 transition-all duration-300">
         <div className="flex flex-col lg:flex-row justify-between items-end lg:items-center gap-4 max-w-7xl mx-auto">
            <div>
               <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                 {language === 'MM' ? 'ဒက်ရှ်ဘုတ်' : 'Dashboard Overview'}
               </h1>
               <p className="text-gray-400 text-xs mt-1">
                 {language === 'MM' ? 'လုပ်ငန်းဆောင်ရွက်မှု အနှစ်ချုပ်' : 'Real-time financial & member analytics'}
               </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-dark-900/50 p-1.5 rounded-xl border border-white/10">
               <div className="flex bg-dark-950 rounded-lg p-1 border border-white/5">
                 {(['Today', 'Week', 'Month', 'Custom'] as const).map(filter => (
                   <button
                     key={filter}
                     onClick={() => setDateFilter(filter)}
                     className={`px-4 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                       dateFilter === filter 
                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                       : 'text-gray-400 hover:text-white hover:bg-white/5'
                     }`}
                   >
                     {filter === 'Today' && (language === 'MM' ? 'ယနေ့' : 'Today')}
                     {filter === 'Week' && (language === 'MM' ? 'ယခုအပတ်' : 'This Week')}
                     {filter === 'Month' && (language === 'MM' ? 'ယခုလ' : 'This Month')}
                     {filter === 'Custom' && (language === 'MM' ? 'ရွေးချယ်ရန်' : 'Custom')}
                   </button>
                 ))}
               </div>

               {dateFilter === 'Custom' && (
                 <div className="flex items-center gap-2 animate-slide-in-right px-2">
                    <div className="flex items-center gap-2 bg-dark-950 border border-white/10 rounded-lg px-2 py-1.5">
                       <Calendar size={14} className="text-gray-400" />
                       <input 
                         type="date" 
                         value={customStart}
                         onChange={(e) => setCustomStart(e.target.value)}
                         className="bg-transparent text-white text-xs outline-none w-24"
                       />
                    </div>
                    <span className="text-gray-500">-</span>
                    <div className="flex items-center gap-2 bg-dark-950 border border-white/10 rounded-lg px-2 py-1.5">
                       <input 
                         type="date" 
                         value={customEnd}
                         onChange={(e) => setCustomEnd(e.target.value)}
                         className="bg-transparent text-white text-xs outline-none w-24"
                       />
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* --- Key Metrics Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Row 1: Financials */}
         <StatCard 
            title={language === 'MM' ? 'စုစုပေါင်းဝင်ငွေ' : 'Total Revenue'}
            value={currentStats.totalRevenue}
            prevValue={previousStats.totalRevenue}
            icon={DollarSign}
            gradient="bg-blue-500"
            iconColor="text-blue-500"
            isCurrency
         />
         <StatCard 
            title={language === 'MM' ? 'အသင်းဝင်ခ' : 'Membership Revenue'}
            value={currentStats.membershipRevenue}
            prevValue={previousStats.membershipRevenue}
            icon={Users}
            gradient="bg-purple-500"
            iconColor="text-purple-500"
            isCurrency
         />
         <StatCard 
            title={language === 'MM' ? 'ပစ္စည်းရောင်းချမှု' : 'Product Sales'}
            value={currentStats.productRevenue}
            prevValue={previousStats.productRevenue}
            icon={ShoppingBag}
            gradient="bg-green-500"
            iconColor="text-green-500"
            isCurrency
         />

         {/* Row 2: Operational */}
         <StatCard 
            title={language === 'MM' ? 'အသက်ဝင်နေသောအသင်းဝင်' : 'Active Members'}
            value={currentStats.activeMembers}
            prevValue={previousStats.activeMembers}
            icon={Activity}
            gradient="bg-orange-500"
            iconColor="text-orange-500"
         />
         <StatCard 
            title={language === 'MM' ? 'အသင်းဝင်အသစ်' : 'New Members'}
            value={currentStats.newMembers}
            prevValue={previousStats.newMembers}
            icon={UserPlus}
            gradient="bg-pink-500"
            iconColor="text-pink-500"
         />
         <StatCard 
            title={language === 'MM' ? 'ငွေပေးငွေယူ' : 'Transactions'}
            value={currentStats.transactionsCount}
            prevValue={previousStats.transactionsCount}
            icon={BarChart3}
            gradient="bg-indigo-500"
            iconColor="text-indigo-500"
         />
      </div>

      {/* --- Charts & Breakdown --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Chart */}
         <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col min-h-[400px]">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 size={20} className="text-gold-500" />
                    Revenue Trend
                 </h3>
                 <div className="flex gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-gold-500 shadow-[0_0_8px_rgba(255,193,7,0.5)]"></span> Total
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span> Membership
                    </div>
                 </div>
             </div>
             
             <div className="flex-1 w-full h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFC107" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FFC107" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10} 
                        minTickGap={30}
                      />
                      <YAxis 
                        stroke="#666" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(10, 10, 10, 0.9)', 
                          border: '1px solid #333', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        labelStyle={{ color: '#9ca3af', marginBottom: '8px', fontSize: '12px' }}
                        formatter={(value: number) => value.toLocaleString() + ' Ks'}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#FFC107" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorTotal)" 
                        animationDuration={1500}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="membership" 
                        stroke="#a855f7" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorMem)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                 </ResponsiveContainer>
             </div>
         </div>

         {/* Payment Methods */}
         <div className="glass-panel p-6 rounded-2xl flex flex-col">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-blue-500" />
                {language === 'MM' ? 'ငွေပေးချေမှုနည်းလမ်း' : 'Payment Methods'}
             </h3>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-2">
                {paymentMethods.length > 0 ? (
                  paymentMethods.map((method, idx) => (
                    <div key={idx} className="group">
                       <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg bg-opacity-20 ${getMethodColorClass(method.name)} transition-colors duration-300`}>
                                <CreditCard size={16} className={getMethodTextColor(method.name)} />
                             </div>
                             <div>
                                <div className="text-sm font-bold text-white">{method.name}</div>
                                <div className="text-[10px] text-gray-500 font-mono">
                                   {method.percentage}% • {method.value.toLocaleString()} Ks
                                </div>
                             </div>
                          </div>
                       </div>
                       <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getMethodBgColor(method.name)}`} 
                            style={{ width: `${method.percentage}%` }}
                          ></div>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                     <CreditCard size={40} className="mb-2" />
                     <p className="text-xs">No transactions in this period</p>
                  </div>
                )}
             </div>

             <div className="mt-6 pt-4 border-t border-white/5 text-center">
                 <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1 mx-auto transition-colors">
                    View Full Report <ArrowRight size={12} />
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
};

// --- Helper Functions for Colors ---
function getMethodColorClass(method: string): string {
   if (method === 'Cash') return 'bg-green-500';
   if (method === 'KBZPay') return 'bg-blue-500';
   if (method === 'WavePay') return 'bg-yellow-500';
   if (method === 'AYA Pay') return 'bg-red-500';
   if (method === 'CB Pay') return 'bg-orange-500';
   if (method === 'Bank Transfer') return 'bg-purple-500';
   if (method === 'Credit Card') return 'bg-pink-500';
   return 'bg-gray-500';
}

function getMethodTextColor(method: string): string {
   if (method === 'Cash') return 'text-green-500';
   if (method === 'KBZPay') return 'text-blue-500';
   if (method === 'WavePay') return 'text-yellow-500';
   if (method === 'AYA Pay') return 'text-red-500';
   if (method === 'CB Pay') return 'text-orange-500';
   if (method === 'Bank Transfer') return 'text-purple-500';
   if (method === 'Credit Card') return 'text-pink-500';
   return 'text-gray-500';
}

function getMethodBgColor(method: string): string {
   if (method === 'Cash') return 'bg-green-500';
   if (method === 'KBZPay') return 'bg-blue-500';
   if (method === 'WavePay') return 'bg-yellow-500';
   if (method === 'AYA Pay') return 'bg-red-500';
   if (method === 'CB Pay') return 'bg-orange-500';
   if (method === 'Bank Transfer') return 'bg-purple-500';
   if (method === 'Credit Card') return 'bg-pink-500';
   return 'bg-gray-500';
}
