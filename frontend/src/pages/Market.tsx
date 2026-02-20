import { useEffect, useState } from 'react';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { Search, PlusCircle, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import TradeModal from '../components/TradeModal';

// Mock Symbol Map for search (Since yfinance free API doesn't support full text search easily)
const SYMBOL_MAP: Record<string, string> = {
    'APPLE': 'AAPL', 'MICROSOFT': 'MSFT', 'GOOGLE': 'GOOGL', 'AMAZON': 'AMZN', 'TESLA': 'TSLA',
    'NVIDIA': 'NVDA', 'META': 'META', 'FACEBOOK': 'META', 'NETFLIX': 'NFLX', 'BITCOIN': 'BTC-USD',
    'AMD': 'AMD', 'INTEL': 'INTC', 'DISNEY': 'DIS', 'COKE': 'KO', 'PEPSI': 'PEP'
};

const POPULAR_LISTS = {
    "Tech Giants": ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META'],
    "Trends": ['TSLA', 'BTC-USD', 'AMD', 'NFLX'],
    "Defensive": ['KO', 'PEP', 'DIS', 'JNJ', 'PG']
};

export default function Market() {
    const [search, setSearch] = useState('');
    const [quote, setQuote] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState("Tech Giants");
    const [displayedQuotes, setDisplayedQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Trade Modal State
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
    const [selectedSymbol, setSelectedSymbol] = useState('');

    useEffect(() => {
        // Fetch quotes for active category
        const fetchCategory = async () => {
            setLoading(true);
            const symbols = POPULAR_LISTS[activeCategory as keyof typeof POPULAR_LISTS];
            const promises = symbols.map(sym => api.get(`/market/quote/${sym}`).catch(() => null));
            const results = await Promise.all(promises);
            setDisplayedQuotes(results.map(r => r?.data).filter(Boolean));
            setLoading(false);
        };
        fetchCategory();
    }, [activeCategory]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const term = search.toUpperCase().trim();
        const mappedSymbol = SYMBOL_MAP[term] || term;

        try {
            const res = await api.get(`/market/quote/${mappedSymbol}`);
            setQuote(res.data);
        } catch (error) {
            setQuote(null);
            alert('Symbol not found. Try entering the Ticker Symbol (e.g. AAPL)');
        }
    };

    const openTrade = (symbol: string) => {
        setSelectedSymbol(symbol);
        setIsTradeModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full bg-gray-50 dark:bg-slate-900 transition-colors">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-2">Market Watch</h1>
                <p className="text-gray-600 dark:text-gray-400">Real-time prices and trading execution.</p>
            </div>

            {/* Search */}
            <div className="max-w-xl mb-12 relative z-10">
                <form onSubmit={handleSearch} className="relative flex items-center shadow-lg rounded-lg">
                    <input
                        type="text"
                        placeholder="Search Company or Symbol (e.g. Apple or AAPL)"
                        className="w-full pl-5 pr-14 py-4 rounded-lg border-0 ring-1 ring-gray-200 dark:ring-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-shadow"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button type="submit" className="absolute right-2 p-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 transition-colors shadow-md">
                        <Search size={22} />
                    </button>
                </form>

                {quote && (
                    <div className="mt-6 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-indigo-50 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{quote.symbol}</h2>
                                <div className="text-4xl font-extrabold mt-2 text-gray-900 dark:text-white">{formatCurrency(quote.price)}</div>
                                <div className={`flex items-center mt-2 text-lg ${quote.change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {quote.change_percent >= 0 ? <ArrowUp size={24} /> : <ArrowDown size={24} />}
                                    <span className="ml-1 font-semibold">{quote.change_percent.toFixed(2)}%</span>
                                </div>
                            </div>
                            <button
                                onClick={() => openTrade(quote.symbol)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 font-medium"
                            >
                                <PlusCircle size={20} />
                                Trade Now
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Filters & Grid */}
            <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
                <span className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                    <Filter size={16} className="mr-2" /> Categories
                </span>
                {Object.keys(POPULAR_LISTS).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeCategory === cat
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500/20'
                                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayedQuotes.map((q) => (
                        <div key={q.symbol} className="group bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 hover:-translate-y-1">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{q.symbol}</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${q.change_percent >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                                    {q.change_percent >= 0 ? '+' : ''}{q.change_percent.toFixed(2)}%
                                </span>
                            </div>
                            <div className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{formatCurrency(q.price)}</div>
                            <button
                                onClick={() => openTrade(q.symbol)}
                                className="w-full py-2.5 bg-gray-50 dark:bg-slate-700/50 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-gray-900 dark:text-white rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-indigo-600"
                            >
                                Trade
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <TradeModal
                isOpen={isTradeModalOpen}
                onClose={() => setIsTradeModalOpen(false)}
                initialSymbol={selectedSymbol}
            />
        </div>
    );
}
