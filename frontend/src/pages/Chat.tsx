import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { Send, Bot, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    isTyping?: boolean;
}

export default function Chat() {
    const { theme } = useTheme();
    const [messages, setMessages] = useState<Message[]>([
        { id: 0, text: "Hello! I'm your AI Trading Assistant. Ask me about your portfolio or stock recommendations.", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // Simulate typing effect
    const addBotMessageWithTyping = (text: string) => {
        const id = Date.now();
        setMessages(prev => [...prev, { id, text: "", sender: 'bot', isTyping: true }]);

        let i = -1;
        const interval = setInterval(() => {
            i++;
            if (i < text.length) {
                setMessages(prev => prev.map(msg =>
                    msg.id === id ? { ...msg, text: msg.text + text.charAt(i) } : msg
                ));
            } else {
                clearInterval(interval);
                setMessages(prev => prev.map(msg =>
                    msg.id === id ? { ...msg, isTyping: false } : msg
                ));
            }
        }, 15); // Speed of typing
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/chat/', { message: userMsg.text });
            addBotMessageWithTyping(res.data.response);
        } catch (error) {
            addBotMessageWithTyping("Sorry, I couldn't reach the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">AI Assistant</h1>

            <div className="flex-1 bg-white dark:bg-slate-800 shadow rounded-lg flex flex-col overflow-hidden border border-gray-200 dark:border-slate-700">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`flex max-w-[80%] items-start space-x-2 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${msg.sender === 'user' ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-slate-700'}`}>
                                    {msg.sender === 'user' ? <User size={20} className="text-indigo-600 dark:text-indigo-300" /> : <Bot size={20} className="text-gray-600 dark:text-gray-300" />}
                                </div>
                                <div
                                    className={`p-3 rounded-lg text-sm ${msg.sender === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                                        }`}
                                >
                                    {msg.text}
                                    {msg.isTyping && <span className="animate-pulse">|</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 rounded-full bg-gray-100 dark:bg-slate-700">
                                    <Bot size={20} className="text-gray-600 dark:text-gray-300" />
                                </div>
                                <div className="bg-gray-100 dark:bg-slate-700 p-3 rounded-lg rounded-bl-none">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
                    <form onSubmit={handleSend} className="flex space-x-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about stocks, portfolio, or market trends..."
                            disabled={loading} // Disable input while responding to prevent sync issues
                            className="flex-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
