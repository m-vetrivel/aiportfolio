import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';


import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';

import Chat from './pages/Chat';
import Market from './pages/Market';


function ProtectedLayout() {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            <main>
                <Outlet />
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route element={<ProtectedLayout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/portfolio" element={<Portfolio />} />

                            <Route path="/market" element={<Market />} />
                            <Route path="/chat" element={<Chat />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );

}

export default App;
