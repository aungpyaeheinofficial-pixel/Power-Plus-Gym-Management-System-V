
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, FileText, Download, Calendar, DollarSign, Users, Package, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// Colors for charts
const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#EF4444'];

export const ReportsPage: React.FC = () => {
  const { transactions, members, products, productCategories, language } = useApp();
  const [activeReport, setActiveReport] = useState<'Daily' | 'Monthly' | 'Yearly'>('Monthly');
  const [isExporting, setIsExporting] = useState(false);

  // --- 1. Summary Stats Calculation ---
  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
  
  const newMembersCount = members.filter(m => {
      const joinDate = new Date(m.joinDate);
      const now = new Date();
      // Simple logic: New members this month
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
  }).length;
  
  const productSalesCount = transactions
    .filter(t => t.type !== 'Membership')
    .reduce((acc, t) => acc + t.items.reduce((s, i) => s + (i.type === 'Product' ? i.quantity : 0), 0), 0);

  // --- 2. Revenue Trend Data (Last 6 Months) ---
  const revenueTrendData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    // Generate last 6 months keys
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = d.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., "Nov 2024"
        const monthFilter = d.getMonth();
        const yearFilter = d.getFullYear();

        // Aggregate transactions for this month
        let membership = 0;
        let productsRev = 0;

        transactions.forEach(t => {
            const tDate = new Date(t.date);
            if (tDate.getMonth() === monthFilter && tDate.getFullYear() === yearFilter) {
                // Split logic
                if (t.type === 'Membership') membership += t.total;
                else if (t.type === 'Product') productsRev += t.total;
                else {
                    // Mixed
                    t.items.forEach(item => {
                        const amount = item.price * item.quantity;
                        if (item.type === 'Membership') membership += amount;
                        else productsRev += amount;
                    });
                }
            }
        });

        data.push({
            month: monthKey,
            membership: membership,
            products: productsRev,
            total: membership + productsRev
        });
    }
    return data;
  }, [transactions]);

  // --- 3. Sales Breakdown Data ---
  const salesBreakdownData = useMemo(() => {
    const breakdown: Record<string, number> = {};

    transactions.forEach(t => {
        t.items.forEach(item => {
            const amount = item.price * item.quantity;
            let key = 'Other';

            if (item.type === 'Membership') {
                key = item.name; // e.g., "1 Month Membership"
            } else {
                // Find category for product
                // Note: item.name might differ slightly from product.nameEN depending on implementation, 
                // but usually matches. Better to check if we can link by ID if stored, but name is reliable enough here.
                const product = products.find(p => p.nameEN === item.name || p.nameMM === item.name);
                if (product) {
                    const cat = productCategories.find(c => c.id === product.categoryId);
                    key = cat ? (cat.nameEN || cat.nameMM) : 'Uncategorized';
                } else {
                    key = 'Uncategorized Product';
                }
            }

            breakdown[key] = (breakdown[key] || 0) + amount;
        });
    });

    const totalSales = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return Object.entries(breakdown)
        .map(([name, value]) => ({
            name,
            value,
            percentage: totalSales > 0 ? parseFloat(((value / totalSales) * 100).toFixed(1)) : 0
        }))
        .sort((a, b) => b.value - a.value); // Descending order
  }, [transactions, products, productCategories]);

  // --- Export Function ---
  const handleExportPDF = async () => {
      setIsExporting(true);
      const element = document.getElementById('report-content');
      if (element) {
          try {
              const canvas = await html2canvas(element, { 
                  scale: 2, 
                  backgroundColor: '#0a0a0a', // Dark background matching theme
                  logging: false
              });
              const imgData = canvas.toDataURL('image/png');
              const pdf = new jsPDF('p', 'mm', 'a4');
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
              
              pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
              pdf.save(`PowerPlusGym_${activeReport}_Report_${new Date().toISOString().slice(0,10)}.pdf`);
          } catch (e) {
              console.error("PDF Export Failed", e);
              alert("Failed to generate PDF");
          }
      }
      setIsExporting(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex bg-dark-900 border border-white/10 rounded-xl p-1">
                {['Daily', 'Monthly', 'Yearly'].map(r => (
                    <button 
                        key={r}
                        onClick={() => setActiveReport(r as any)}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeReport === r ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-gray-500 hover:text-white'}`}
                    >
                        {r} Report
                    </button>
                ))}
            </div>
            <button 
                onClick={handleExportPDF} 
                disabled={isExporting}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-white transition-colors border border-white/10 disabled:opacity-50"
            >
                {isExporting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Download size={18} />}
                {isExporting ? 'Generating...' : 'Export PDF'}
            </button>
        </div>

        {/* Report Content Area (Target for PDF) */}
        <div id="report-content" className="flex-1 overflow-y-auto custom-scrollbar bg-dark-950 p-2 sm:p-6 rounded-xl border border-white/5">
            {/* Header for PDF */}
            <div className="text-center mb-10 border-b border-white/10 pb-6">
                <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">Power Plus Gym</h1>
                <p className="text-gold-500 font-bold tracking-widest uppercase">{activeReport} Business Analytics</p>
                <p className="text-gray-500 text-xs mt-2 font-mono">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-dark-900 border border-white/5 p-6 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><DollarSign size={64}/></div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gold-500/10 rounded-lg text-gold-500"><DollarSign size={20}/></div>
                        <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total Revenue</span>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white font-mono">{totalRevenue.toLocaleString()} <span className="text-sm font-sans text-gray-500">Ks</span></h3>
                </div>
                <div className="bg-dark-900 border border-white/5 p-6 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Users size={64}/></div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Users size={20}/></div>
                        <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">New Members</span>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white font-mono">{newMembersCount}</h3>
                </div>
                <div className="bg-dark-900 border border-white/5 p-6 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Package size={64}/></div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><Package size={20}/></div>
                        <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Products Sold</span>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white font-mono">{productSalesCount}</h3>
                </div>
            </div>

            {/* --- REVENUE TREND SECTION --- */}
            <div className="bg-dark-900 border border-white/5 p-6 rounded-xl mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-white flex items-center gap-2">
                        <TrendingUp size={18} className="text-gold-500" />
                        Revenue Trend (Last 6 Months)
                    </h4>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-2 text-gray-400"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Membership</div>
                        <div className="flex items-center gap-2 text-gray-400"><span className="w-2 h-2 rounded-full bg-green-500"></span> Products</div>
                        <div className="flex items-center gap-2 text-gray-400"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Total</div>
                    </div>
                </div>
                
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis 
                                dataKey="month" 
                                stroke="#666" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis 
                                stroke="#666" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(value) => `${(value/1000)}k`} 
                            />
                            <RechartsTooltip 
                                contentStyle={{ 
                                    backgroundColor: '#000', 
                                    border: '1px solid #333', 
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                }}
                                itemStyle={{ fontWeight: 'bold' }}
                                formatter={(value: number) => [`${value.toLocaleString()} Ks`, '']}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                            <Line 
                                type="monotone" 
                                dataKey="membership" 
                                name="Membership"
                                stroke="#3B82F6" 
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="products" 
                                name="Product Sales"
                                stroke="#10B981" 
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="total" 
                                name="Total Revenue"
                                stroke="#8B5CF6" 
                                strokeWidth={3}
                                dot={{ r: 5, fill: '#8B5CF6', strokeWidth: 0 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- SALES BREAKDOWN SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Pie Chart */}
                <div className="bg-dark-900 border border-white/5 p-6 rounded-xl flex flex-col h-[400px]">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                        <PieChartIcon size={18} className="text-gold-500" />
                        Sales Distribution
                    </h4>
                    <div className="flex-1 w-full min-h-0">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={salesBreakdownData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {salesBreakdownData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    formatter={(value: number) => `${value.toLocaleString()} Ks`}
                                    contentStyle={{ 
                                        backgroundColor: '#000', 
                                        border: '1px solid #333', 
                                        borderRadius: '8px'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend 
                                    layout="vertical" 
                                    verticalAlign="middle" 
                                    align="right"
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
                                />
                            </PieChart>
                         </ResponsiveContainer>
                    </div>
                </div>

                {/* Detailed List */}
                <div className="bg-dark-900 border border-white/5 p-6 rounded-xl flex flex-col h-[400px]">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-gold-500" />
                        Detailed Breakdown
                    </h4>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                        {salesBreakdownData.length > 0 ? (
                            salesBreakdownData.map((item, index) => (
                                <div key={index} className="group">
                                    <div className="flex justify-between items-center mb-1 text-sm">
                                        <span className="text-gray-300 font-medium flex items-center gap-2">
                                            <span 
                                                className="w-2 h-2 rounded-full" 
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            ></span>
                                            {item.name}
                                        </span>
                                        <span className="text-white font-mono font-bold">{item.value.toLocaleString()} Ks</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                                        <span>{item.percentage}% of total</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ 
                                                width: `${item.percentage}%`,
                                                backgroundColor: COLORS[index % COLORS.length] 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                                No sales data available.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Transaction Table */}
            <div className="bg-dark-900 border border-white/5 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/5 font-bold text-white flex justify-between items-center">
                    <span>Recent Transactions Log</span>
                    <span className="text-xs text-gray-500 font-normal">Last 10 entries</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4">Time</th>
                                <th className="p-4">Invoice</th>
                                <th className="p-4">Details</th>
                                <th className="p-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactions.slice(0, 10).map((t, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-gray-400 font-mono">
                                        {new Date(t.date).toLocaleDateString()} <span className="text-xs opacity-50">{new Date(t.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    </td>
                                    <td className="p-4 text-white font-mono text-xs">{t.invoiceNumber}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold uppercase w-fit px-2 py-0.5 rounded ${t.type === 'Membership' ? 'bg-blue-500/10 text-blue-500' : t.type === 'Product' ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                                {t.type}
                                            </span>
                                            <span className="text-gray-400 text-xs mt-1 truncate max-w-[200px]">
                                                {t.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right text-gold-500 font-bold font-mono">{t.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 flex justify-between text-xs text-gray-500 font-mono">
                <p>Power Plus Gym Management System • Confidential Report</p>
                <p>Page 1 of 1</p>
            </div>
        </div>
    </div>
  );
};
