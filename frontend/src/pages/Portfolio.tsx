import { useEffect, useState } from 'react';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Lightbulb, RefreshCw } from 'lucide-react';

export default function Portfolio() {
    const [data, setData] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [aiInsight, setAiInsight] = useState<string>('');
    const [loadingInsight, setLoadingInsight] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/trade/portfolio');
                setData(res.data);

                // Process data for chart
                if (res.data.holdings) {
                    const cData = res.data.holdings.map((h: any) => ({
                        name: h.symbol,
                        value: h.market_value
                    }));
                    setChartData(cData);

                    // Fetch AI Insight if we have holdings
                    if (cData.length > 0) {
                        fetchAiInsight(res.data.holdings);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch portfolio", error);
            }
        };
        fetchData();
    }, []);

    const fetchAiInsight = async (holdings: any[]) => {
        setLoadingInsight(true);
        try {
            // Transform holdings to match backend expectation if needed (backend accepts list of dicts)
            const payload = {
                holdings: holdings.map(h => ({
                    symbol: h.symbol,
                    market_value: h.market_value,
                    quantity: h.quantity
                }))
            };
            const res = await api.post('/recommendations/portfolio', payload);
            setAiInsight(res.data.insight);
        } catch (error) {
            console.error("Failed to fetch AI insight", error);
            setAiInsight("AI analysis unavailable at the moment.");
        } finally {
            setLoadingInsight(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    if (!data) return <div className="p-8 text-gray-900 dark:text-white">Loading...</div>;

    const totalValue = data.portfolio_value;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full bg-gray-50 dark:bg-slate-900 transition-colors">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Portfolio</h1>

            {/* Summary & Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 shadow rounded-lg p-6 border border-gray-100 dark:border-slate-700 relative">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Portfolio Distrubution</h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b' }}
                                        itemStyle={{ color: '#1e293b' }}
                                    />
                                    <Legend wrapperStyle={{ color: 'inherit' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-gray-500 dark:text-gray-400">No holdings to display</div>
                        )}
                    </div>
                </div>

                {/* AI Insights & Stats */}
                <div className="space-y-6">
                    {/* Value Card */}
                    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 border border-gray-100 dark:border-slate-700">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalValue)}</p>
                    </div>

                    {/* AI Suggestion Card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 shadow rounded-lg p-6 border border-indigo-100 dark:border-indigo-800 relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="text-yellow-500" size={24} />
                                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">AI Insight</h3>
                            </div>
                            {loadingInsight && <RefreshCw size={16} className="text-indigo-400 animate-spin" />}
                        </div>
                        <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed min-h-[60px]">
                            {aiInsight || (chartData.length === 0 ? "Start trading to get personalized AI insights!" : "Analyzing portfolio...")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg border border-gray-100 dark:border-slate-700">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Holdings Details</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Price</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">P/L</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">P/L %</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {data.holdings.map((h: any) => (
                                <tr key={h.symbol}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{h.symbol}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{h.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(h.avg_price)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(h.current_price)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(h.market_value)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${h.unrealized_pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatCurrency(h.unrealized_pnl)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${h.pnl_percent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {h.pnl_percent.toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
