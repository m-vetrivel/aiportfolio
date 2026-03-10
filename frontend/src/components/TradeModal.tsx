import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { X } from 'lucide-react';

interface TradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSymbol?: string;
    aiAnalysis?: string | null;
    isAnalyzing?: boolean;
}

export default function TradeModal({ isOpen, onClose, initialSymbol = '', aiAnalysis, isAnalyzing }: TradeModalProps) {
    const [symbol, setSymbol] = useState(initialSymbol);
    const [quantity, setQuantity] = useState(1);
    const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSymbol(initialSymbol);
            setMessage('');
            setError('');
            setQuantity(1);
            setAction('BUY');
        }
    }, [isOpen, initialSymbol]);

    if (!isOpen) return null;

    const handleTrade = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await api.post('/trade/', {
                symbol,
                quantity: parseInt(quantity.toString()),
                action
            });
            setMessage(`Success! ${res.data.message}. New Balance: ${formatCurrency(res.data.balance)}`);
            // Optional: Close after success or let user see message
            setTimeout(() => {
                // onClose(); // Uncomment if we want auto-close
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Trade failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Execute Trade
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {(isAnalyzing || aiAnalysis) && action === 'BUY' && (
                        <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
                            <h4 className="flex items-center text-indigo-800 dark:text-indigo-300 font-semibold mb-2 text-sm">
                                🤖 AI Trading Assistant
                            </h4>
                            {isAnalyzing ? (
                                <div className="flex items-center text-sm text-indigo-600 dark:text-indigo-400">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 dark:border-indigo-400 mr-2"></div>
                                    Analyzing your portfolio for this trade...
                                </div>
                            ) : (
                                <p className="text-sm text-indigo-700 dark:text-indigo-200 leading-relaxed">
                                    {aiAnalysis}
                                </p>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleTrade} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Symbol</label>
                            <input
                                type="text"
                                required
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="AAPL"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Action</label>
                            <div className="mt-1 flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setAction('BUY')}
                                    className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 flex justify-center transition-colors ${action === 'BUY'
                                        ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    BUY
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAction('SELL')}
                                    className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 flex justify-center transition-colors ${action === 'SELL'
                                        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    SELL
                                </button>
                            </div>
                        </div>

                        {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</div>}
                        {message && <div className="text-green-500 text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">{message}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Processing...' : `Confirm ${action}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
