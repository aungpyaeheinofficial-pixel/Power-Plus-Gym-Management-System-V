
import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getSafeImageSrc, handleImageError } from '../utils/imageUtils';
import { 
  DollarSign, Users, UserCheck, AlertTriangle, 
  TrendingUp, ArrowRight, UserPlus, ShoppingCart, Clock, Activity, ArrowUpRight, Package
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { TRANSLATIONS } from '../constants';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { transactions, members, checkIns, language } = useApp();
  const t = TRANSLATIONS[language];

  // Calculations
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayStr = now.toISOString().split('T')[0];
    const msPerDay = 24 * 60 * 60 * 1000;

    // Filter transactions for current month
    const monthlyTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // 1. Separate Revenue This Month: Membership vs Product Sales
    let membershipRevenue = 0;
    let productSalesRevenue = 0;

    monthlyTransactions.forEach(t => {
        if (t.type === 'Membership') {
            membershipRevenue += t.total;
        } else if (t.type === 'Product') {
            productSalesRevenue += t.total;
        } else if (t.type === 'Mixed') {
            // For mixed transactions, split by item type
            t.items.forEach(item => {
                const amount = item.price * item.quantity;
                if (item.type === 'Membership') {
                    membershipRevenue += amount;
                } else if (item.type === 'Product') {
                    productSalesRevenue += amount;
                }
            });
        }
    });

    const monthlyRevenue = membershipRevenue + productSalesRevenue;

    // 2. Active Members
    const activeMembers = members.filter(m => {
        const end = new Date(m.endDate);
        end.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);
        return end >= today;
    }).length;

    // 3. Check-ins Today
    const todayCheckIns = checkIns.filter(c => c.checkInTime.startsWith(todayStr)).length;

    // 4. Expiring Soon (Next 7 days)
    const expiringSoon = members.filter(m => {
        const end = new Date(m.endDate);
        end.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const diff = end.getTime() - today.getTime();
        const days = Math.ceil(diff / msPerDay);
        return days >= 0 && days <= 7;
    });

    // 5. Chart Data (Last 7 Days) - Separated by type
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        let dayMembership = 0;
        let dayProducts = 0;
        
        transactions
            .filter(t => t.date.startsWith(dateStr))
            .forEach(t => {
                if (t.type === 'Membership') {
                    dayMembership += t.total;
                } else if (t.type === 'Product') {
                    dayProducts += t.total;
                } else if (t.type === 'Mixed') {
                    t.items.forEach(item => {
                        const amount = item.price * item.quantity;
                        if (item.type === 'Membership') {
                            dayMembership += amount;
                        } else if (item.type === 'Product') {
                            dayProducts += amount;
                        }
                    });
                }
            });
            
        chartData.push({ 
            name: dayLabel, 
            membership: dayMembership,
            products: dayProducts,
            total: dayMembership + dayProducts
        });
    }

    return {
        monthlyRevenue,
        membershipRevenue,
        productSalesRevenue,
        activeMembers,
        todayCheckIns,
        expiringCount: expiringSoon.length,
        expiringList: expiringSoon.slice(0, 5),
        chartData
    };
  }, [transactions, members, checkIns]);

  const chartColor = '#FFEB3B';
  const gridColor = '#333';
  const textColor = '#999';

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
              <h1 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase italic transform -skew-x-6">Dashboard Overview</h1>
              <div className="h-1 w-20 bg-brand-yellow rounded-full"></div>
              <p className="text-gray-400 text-sm mt-2 font-medium">Real-time analytics and management summary</p>
          </div>
          <div className="text-right hidden md:block">
              <div className="text-4xl font-black text-brand-yellow font-mono tracking-tighter drop-shadow-sm">
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-[0.2em] bg-white/5 py-1 px-3 rounded-full mt-1">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
          </div>
      </div>

      {/* Stats Grid - "Hero Mode" Cards (Premium Dark) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="premium-card p-6 rounded-3xl relative overflow-hidden group border-t-4 border-t-brand-yellow">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500"><DollarSign size={100} className="text-brand-yellow"/></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-brand-yellow/10 rounded-2xl text-brand-yellow shadow-sm border border-brand-yellow/20"><DollarSign size={28} /></div>
                  <div className="flex items-center text-xs text-brand-yellow font-bold bg-brand-yellow/10 px-2 py-1 rounded-full border border-brand-yellow/20">
                    <ArrowUpRight size={12} className="mr-1" /> Total
                  </div>
              </div>
              <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                  <h3 className="text-4xl font-black text-white tracking-tight">{stats.monthlyRevenue.toLocaleString()} <span className="text-sm font-medium text-gray-600">Ks</span></h3>
              </div>
          </div>

          <div className="premium-card p-6 rounded-3xl relative overflow-hidden group border-t-4 border-t-blue-500">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500"><Users size={100} className="text-blue-500"/></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 shadow-sm border border-blue-500/20"><Users size={28} /></div>
                  <div className="flex items-center text-xs text-blue-500 font-bold bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
                    Membership
                  </div>
              </div>
              <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Membership Sales</p>
                  <h3 className="text-4xl font-black text-white tracking-tight">{stats.membershipRevenue.toLocaleString()} <span className="text-sm font-medium text-gray-600">Ks</span></h3>
              </div>
          </div>

          <div className="premium-card p-6 rounded-3xl relative overflow-hidden group border-t-4 border-t-green-500">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500"><Package size={100} className="text-green-500"/></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-green-500/10 rounded-2xl text-green-500 shadow-sm border border-green-500/20"><Package size={28} /></div>
                  <div className="flex items-center text-xs text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                    Products
                  </div>
              </div>
              <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Product Sales</p>
                  <h3 className="text-4xl font-black text-white tracking-tight">{stats.productSalesRevenue.toLocaleString()} <span className="text-sm font-medium text-gray-600">Ks</span></h3>
              </div>
          </div>

          <div className="premium-card p-6 rounded-3xl relative overflow-hidden group border-t-4 border-t-brand-yellow">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500"><Users size={100} className="text-brand-yellow"/></div>
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-brand-yellow/10 rounded-2xl text-brand-yellow shadow-sm border border-brand-yellow/20"><Users size={28} /></div>
                  <div className="flex items-center text-xs text-brand-yellow font-bold bg-brand-yellow/10 px-2 py-1 rounded-full border border-brand-yellow/20">
                    <UserPlus size={12} className="mr-1" /> +8 New
                  </div>
              </div>
              <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Active Members</p>
                  <h3 className="text-4xl font-black text-white tracking-tight">{stats.activeMembers}</h3>
              </div>
          </div>

          <div className="premium-card p-6 rounded-3xl relative overflow-hidden group border-t-4 border-t-brand-yellow">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500"><UserCheck size={100} className="text-brand-yellow"/></div>
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-brand-yellow/10 rounded-2xl text-brand-yellow shadow-sm border border-brand-yellow/20"><UserCheck size={28} /></div>
                  <div className="flex items-center text-xs text-gray-500 font-bold bg-white/5 px-2 py-1 rounded-full border border-white/5">
                    <Clock size={12} className="mr-1" /> Just now
                  </div>
              </div>
              <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Today's Visits</p>
                  <h3 className="text-4xl font-black text-white tracking-tight">{stats.todayCheckIns}</h3>
              </div>
          </div>

          <div onClick={() => onNavigate?.('members')} className="premium-card p-6 rounded-3xl relative overflow-hidden group border-t-4 border-t-brand-yellow cursor-pointer">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500"><AlertTriangle size={100} className="text-brand-yellow"/></div>
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-brand-yellow/10 rounded-2xl text-brand-yellow shadow-sm border border-brand-yellow/20"><AlertTriangle size={28} /></div>
                  <div className="flex items-center text-xs text-brand-yellow font-bold bg-brand-yellow/10 px-2 py-1 rounded-full border border-brand-yellow/20 animate-pulse">
                    Action Needed
                  </div>
              </div>
              <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Expiring Soon</p>
                  <h3 className="text-4xl font-black text-white tracking-tight">{stats.expiringCount}</h3>
              </div>
          </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 premium-card p-8 rounded-3xl flex flex-col shadow-sm border-brand-border overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-wide">
                      <div className="bg-brand-yellow h-8 w-1"></div>
                      Revenue Analytics
                  </h3>
                  <select className="bg-black border border-brand-border rounded-lg text-xs text-white p-2 outline-none font-bold uppercase tracking-wide hover:border-brand-yellow transition-colors cursor-pointer">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                  </select>
              </div>
              <div className="flex-1 w-full min-h-0" style={{ height: '350px', maxHeight: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.chartData}>
                          <defs>
                              <linearGradient id="colorMembership" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                          <XAxis 
                              dataKey="name" 
                              stroke={textColor} 
                              fontSize={12} 
                              tickLine={false} 
                              axisLine={false}
                              dy={10}
                              tick={{fill: textColor, fontWeight: 'bold'}}
                          />
                          <YAxis 
                              stroke={textColor} 
                              fontSize={12} 
                              tickLine={false} 
                              axisLine={false}
                              tickFormatter={(value) => `${(value/1000)}k`} 
                              tick={{fill: textColor, fontWeight: 'bold'}}
                          />
                          <Tooltip 
                              contentStyle={{ 
                                  backgroundColor: '#0A0A0A', 
                                  border: '1px solid #FFEB3B', 
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                              }}
                              itemStyle={{ fontWeight: 'bold', fontFamily: 'monospace' }}
                              labelStyle={{ color: '#fff', marginBottom: '8px', textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold' }}
                              cursor={{ stroke: '#FFEB3B', strokeWidth: 1, strokeDasharray: '5 5' }}
                              formatter={(value: number, name: string) => [`${value.toLocaleString()} Ks`, name === 'membership' ? 'Membership' : name === 'products' ? 'Product Sales' : 'Total Revenue']}
                          />
                          <Area 
                              type="monotone" 
                              dataKey="membership" 
                              stroke="#3B82F6" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorMembership)" 
                              animationDuration={1500}
                              name="membership"
                          />
                          <Area 
                              type="monotone" 
                              dataKey="products" 
                              stroke="#10B981" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorProducts)" 
                              animationDuration={1500}
                              name="products"
                          />
                          <Area 
                              type="monotone" 
                              dataKey="total" 
                              stroke={chartColor} 
                              strokeWidth={3}
                              fillOpacity={1} 
                              fill="url(#colorTotal)" 
                              animationDuration={1500}
                              name="total"
                          />
                      </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 text-xs mt-4 justify-center flex-shrink-0">
                      <div className="flex items-center gap-2 text-gray-400"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Membership</div>
                      <div className="flex items-center gap-2 text-gray-400"><span className="w-2 h-2 rounded-full bg-green-500"></span> Product Sales</div>
                      <div className="flex items-center gap-2 text-gray-400"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Total Revenue</div>
                  </div>
              </div>
          </div>

          {/* Quick Actions & Recent Checkins */}
          <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => onNavigate?.('pos')} className="p-6 btn-primary rounded-3xl flex flex-col items-center justify-center gap-3 hover:scale-[1.03] transition-transform shadow-lg group">
                      <ShoppingCart size={32} className="group-hover:rotate-12 transition-transform"/>
                      <span className="text-sm uppercase tracking-wide">POS Sale</span>
                  </button>
                  <button onClick={() => onNavigate?.('members')} className="p-6 bg-brand-surface border border-brand-border rounded-3xl text-white font-bold flex flex-col items-center justify-center gap-3 hover:border-brand-yellow hover:bg-brand-surface/80 transition-all shadow-sm hover:shadow-md group">
                      <UserPlus size={32} className="text-brand-yellow group-hover:scale-110 transition-transform" />
                      <span className="text-sm uppercase tracking-wide">Add Member</span>
                  </button>
                  <button onClick={() => onNavigate?.('checkin')} className="p-6 bg-brand-surface border border-brand-border rounded-3xl text-white font-bold flex flex-col items-center justify-center gap-3 hover:border-brand-yellow hover:bg-brand-surface/80 transition-all shadow-sm hover:shadow-md group">
                      <UserCheck size={32} className="text-brand-yellow group-hover:scale-110 transition-transform" />
                      <span className="text-sm uppercase tracking-wide">Check In</span>
                  </button>
                  <button onClick={() => onNavigate?.('reports')} className="p-6 bg-brand-surface border border-brand-border rounded-3xl text-white font-bold flex flex-col items-center justify-center gap-3 hover:border-brand-yellow hover:bg-brand-surface/80 transition-all shadow-sm hover:shadow-md group">
                      <TrendingUp size={32} className="text-brand-yellow group-hover:scale-110 transition-transform" />
                      <span className="text-sm uppercase tracking-wide">Reports</span>
                  </button>
              </div>

              {/* Recent Check-ins */}
              <div className="premium-card p-6 rounded-3xl flex-1 shadow-sm border-brand-border">
                  <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-wider flex items-center justify-between">
                      Recent Check-ins
                      <span className="text-[10px] bg-brand-yellow text-black px-2 py-1 rounded font-bold">{checkIns.length} today</span>
                  </h3>
                  <div className="space-y-4">
                      {checkIns.slice(0, 5).map((c, i) => {
                          const m = members.find(mem => mem.id === c.memberId);
                          if (!m) return null;
                          return (
                              <div key={i} className="flex items-center gap-4 group p-2 hover:bg-white/5 rounded-xl transition-colors">
                                  <div className="relative">
                                     <img src={m.photoUrl} className="w-12 h-12 rounded-xl bg-black object-cover border border-white/10" />
                                     <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-brand-surface"></div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-white truncate group-hover:text-brand-yellow transition-colors">{m.fullNameEN}</p>
                                      <p className="text-[10px] text-gray-500 font-mono">{new Date(c.checkInTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                  </div>
                              </div>
                          )
                      })}
                      {checkIns.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No check-ins yet today.</p>}
                  </div>
              </div>
          </div>
      </div>

      {/* Bottom Row: Expiring Members Table */}
      <div className="premium-card rounded-3xl overflow-hidden shadow-sm border-brand-border">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="font-bold text-white flex items-center gap-3 uppercase tracking-wide text-sm">
                  <AlertTriangle className="text-brand-yellow" size={18} />
                  Expiring Soon (Next 7 Days)
              </h3>
              <button onClick={() => onNavigate?.('members')} className="text-xs text-brand-yellow hover:text-white font-bold uppercase tracking-wider transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead className="bg-black/40 text-gray-500 uppercase text-xs font-bold tracking-wider">
                      <tr>
                          <th className="p-5 pl-8">Member</th>
                          <th className="p-5">Contact</th>
                          <th className="p-5">Plan</th>
                          <th className="p-5">Expires</th>
                          <th className="p-5 text-right pr-8">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                      {stats.expiringList.length > 0 ? (
                          stats.expiringList.map(m => (
                              <tr key={m.id} className="hover:bg-white/5 transition-colors group">
                                  <td className="p-5 pl-8 font-bold text-white flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-white/10 overflow-hidden"><img src={m.photoUrl} className="w-full h-full object-cover"/></div>
                                      <span className="group-hover:text-brand-yellow transition-colors">{m.fullNameEN}</span>
                                  </td>
                                  <td className="p-5 text-gray-400 font-mono text-xs">{m.phone}</td>
                                  <td className="p-5 text-brand-yellow font-bold text-xs uppercase tracking-wide">Membership</td>
                                  <td className="p-5 text-red-500 font-bold font-mono text-xs">{m.endDate}</td>
                                  <td className="p-5 text-right pr-8">
                                      <button onClick={() => onNavigate?.('pos')} className="text-xs bg-brand-yellow hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold transition-all shadow-[0_0_10px_rgba(255,235,59,0.2)]">
                                          RENEW
                                      </button>
                                  </td>
                              </tr>
                          ))
                      ) : (
                           <tr>
                              <td colSpan={5} className="p-10 text-center text-gray-500 italic">No memberships expiring soon.</td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};
