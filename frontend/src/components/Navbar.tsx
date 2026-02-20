import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, LogOut, PieChart, TrendingUp, MessageSquare, Sun, Moon, BarChart2 } from 'lucide-react';
import { cn } from '../lib/utils';



export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-white border-b border-gray-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-indigo-600">AI Trader</span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <NavLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                            <NavLink to="/market" icon={<BarChart2 size={18} />} label="Market" />
                            <NavLink to="/portfolio" icon={<PieChart size={18} />} label="Portfolio" />

                            <NavLink to="/chat" icon={<MessageSquare size={18} />} label="AI Assistant" />

                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            {theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-500" />}
                        </button>

                        <div className="flex-shrink-0">
                            <span className="mr-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                                {user.username}
                            </span>
                            <button
                                onClick={handleLogout}

                                className="relative inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            to={to}
            className={cn(
                "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
            )}
        >
            <span className="mr-2">{icon}</span>
            {label}
        </Link>
    )
}
