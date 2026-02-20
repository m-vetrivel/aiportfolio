import { useEffect, useState } from 'react';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, Activity, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [marketStatus, setMarketStatus] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/trade/portfolio');
                setData(res.data);
                const statusRes = await api.get('/market/status');
                setMarketStatus(statusRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };
        fetchData();
    }, []);

    if (!data) return <div className="p-8 dark:text-white">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                {marketStatus && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${marketStatus.status === 'OPEN'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        }`}>
                        <Activity size={16} />
                        Market: {marketStatus.status}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard
                    title="Total Equity"
                    value={formatCurrency(data.total_equity)}
                    icon={<DollarSign className="h-6 w-6 text-white" />}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Cash Balance"
                    value={formatCurrency(data.balance)}
                    icon={<Wallet className="h-6 w-6 text-white" />}
                    color="bg-green-500"
                />
                <StatCard
                    title="Portfolio Value"
                    value={formatCurrency(data.portfolio_value)}
                    icon={<ArrowUpRight className="h-6 w-6 text-white" />}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Active Holdings"
                    value={data.holdings.length.toString()}
                    icon={<Wallet className="h-6 w-6 text-white" />}
                    color="bg-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Holdings Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Top Holdings</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">P/L</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {data.holdings.slice(0, 5).map((h: any) => (
                                    <tr key={h.symbol}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{h.symbol}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{h.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(h.market_value)}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${h.unrealized_pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {formatCurrency(h.unrealized_pnl)}
                                        </td>
                                    </tr>
                                ))}
                                {data.holdings.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No holdings yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AI & Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-lg p-6 shadow-lg">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                            <MessageSquare /> AI Assistant
                        </h2>
                        <p className="opacity-90 mb-4 text-sm">Ask about your portfolio, market trends, or get signals.</p>
                        <Link to="/chat" className="inline-block w-full text-center bg-white/20 hover:bg-white/30 py-2 rounded font-medium transition">
                            Chat Now
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/market" className="flex flex-col items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-600 transition">
                                <Activity className="mb-2 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-sm font-medium">Market</span>
                            </Link>
                            <Link to="/trade" className="flex flex-col items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-green-50 dark:hover:bg-slate-600 transition">
                                <DollarSign className="mb-2 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium">Trade</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
                        {icon}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
                            <dd className="text-lg font-medium text-gray-900 dark:text-white">{value}</dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
