import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { ArrowUp, ArrowDown, ArrowLeft, Activity, Info, TrendingUp, TrendingDown, DollarSign, Briefcase } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TradeModal from '../components/TradeModal';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function StockDetail() {
    const { symbol } = useParams<{ symbol: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [info, setInfo] = useState<any>(null);
    const [quote, setQuote] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
    
    // AI Suggestion State
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        const fetchStockData = async () => {
             if (!symbol) return;
             setLoading(true);
             try {
                 const [quoteRes, infoRes, historyRes] = await Promise.all([
                     api.get(`/market/quote/${symbol}`),
                     api.get(`/market/info/${symbol}`),
                     api.get(`/market/history/${symbol}?period=3mo`)
                 ]);
                 
                 setQuote(quoteRes.data);
                 setInfo(infoRes.data);
                 setHistory(historyRes.data.map((d: any) => ({
                     date: new Date(d.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                     price: d.Close
                 })));
             } catch (error) {
                 console.error("Failed to fetch stock info", error);
             } finally {
                 setLoading(false);
             }
        };
        fetchStockData();
    }, [symbol]);

    const handleBuyClick = async () => {
        if (!symbol) return;
        setAnalyzing(true);
        setIsTradeModalOpen(true);
        try {
            const res = await api.get(`/trade/analyze-buy/${symbol}`);
            setAiAnalysis(res.data.analysis);
        } catch (error) {
            setAiAnalysis("Failed to get AI recommendation.");
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!quote || !info) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stock not found</h2>
                <button onClick={() => navigate('/market')} className="mt-4 text-indigo-600 hover:underline">Return to Market</button>
            </div>
        );
    }

    const isPositive = quote.change_percent >= 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button 
                onClick={() => navigate('/market')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={16} className="mr-1" /> Back to Market
            </button>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-baseline gap-3 mb-1">
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{info.symbol}</h1>
                        <span className="text-xl text-gray-500 font-medium">{info.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Briefcase size={14} /> {info.sector} &bull; {info.industry}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        {formatCurrency(quote.price)}
                    </div>
                    <div className={cn("flex items-center justify-end text-lg font-bold mt-1", isPositive ? "text-green-500" : "text-red-500")}>
                        {isPositive ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                        <span className="ml-1">{quote.change_percent.toFixed(2)}%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
               {/* Left Col: Chart & Meta */}
               <div className="lg:col-span-2 space-y-8">
                   {/* Chart */}
                   <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                           <Activity className="mr-2 text-indigo-500" size={20} /> 
                           3-Month Performance
                       </h3>
                       <div className="h-80">
                           <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={history}>
                                   <defs>
                                       <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                           <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                                           <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                                       </linearGradient>
                                   </defs>
                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                   <XAxis 
                                       dataKey="date" 
                                       axisLine={false} 
                                       tickLine={false} 
                                       tick={{ fill: '#6b7280', fontSize: 12 }} 
                                       dy={10} 
                                       minTickGap={30}
                                   />
                                   <YAxis 
                                       domain={['auto', 'auto']} 
                                       axisLine={false} 
                                       tickLine={false} 
                                       tick={{ fill: '#6b7280', fontSize: 12 }} 
                                       tickFormatter={(val) => `$${val}`}
                                       dx={-10}
                                   />
                                   <Tooltip 
                                       contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                                       itemStyle={{ color: '#fff' }}
                                       formatter={(val: number) => [`$${val.toFixed(2)}`, 'Price']}
                                   />
                                   <Area 
                                       type="monotone" 
                                       dataKey="price" 
                                       stroke={isPositive ? "#10b981" : "#ef4444"} 
                                       strokeWidth={3} 
                                       fillOpacity={1} 
                                       fill="url(#colorPrice)" 
                                   />
                               </AreaChart>
                           </ResponsiveContainer>
                       </div>
                   </div>

                   {/* About Company */}
                   <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                           <Info className="mr-2 text-indigo-500" size={20} /> About {info.name}
                       </h3>
                       <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                           {info.summary}
                       </p>
                   </div>
               </div>

               {/* Right Col: Stats & Action */}
               <div className="space-y-6">
                   {/* Action Box */}
                   <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
                        <h3 className="text-white text-xl font-bold mb-2">Trade {info.symbol}</h3>
                        <p className="text-indigo-100 text-sm mb-6">Invest in {info.name} today. Our AI will analyze your portfolio before you buy.</p>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={handleBuyClick}
                                className="w-full py-3 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-md flex items-center justify-center gap-2"
                            >
                                <TrendingUp size={18} /> Buy {info.symbol}
                            </button>
                        </div>
                   </div>

                   {/* Key Statistics */}
                   <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Key Statistics</h3>
                       <div className="space-y-4">
                           <StatRow label="Market Cap" value={info.marketCap ? formatCurrency(info.marketCap) : 'N/A'} />
                           <StatRow label="Volume" value={info.volume ? info.volume.toLocaleString() : 'N/A'} />
                           <StatRow label="Avg Volume" value={info.averageVolume ? info.averageVolume.toLocaleString() : 'N/A'} />
                           <StatRow label="52 Week High" value={info.fiftyTwoWeekHigh ? formatCurrency(info.fiftyTwoWeekHigh) : 'N/A'} />
                           <StatRow label="52 Week Low" value={info.fiftyTwoWeekLow ? formatCurrency(info.fiftyTwoWeekLow) : 'N/A'} />
                           <StatRow label="Trailing P/E" value={info.trailingPE ? info.trailingPE.toFixed(2) : 'N/A'} />
                           <StatRow label="Div Yield" value={info.dividendYield ? `${(info.dividendYield * 100).toFixed(2)}%` : 'N/A'} />
                       </div>
                   </div>
               </div>
            </div>

            {/* Integrated Trade Modal with AI Analysis */}
            <TradeModal
                isOpen={isTradeModalOpen}
                onClose={() => {
                    setIsTradeModalOpen(false);
                    setAiAnalysis(null);
                }}
                initialSymbol={info.symbol}
                aiAnalysis={aiAnalysis}
                isAnalyzing={analyzing}
            />
        </div>
    );
}

function StatRow({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-slate-700/50 last:border-0">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
        </div>
    )
}
