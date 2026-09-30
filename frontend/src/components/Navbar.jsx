import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-black text-white p-4 border-b border-gray-800">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-black uppercase tracking-widest">AI Portfolio</Link>
                <div className="space-x-6 flex items-center text-sm font-medium">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="hover:text-gray-400 transition-colors">Dashboard</Link>
                            <Link to="/job-analyzer" className="hover:text-gray-400 transition-colors">Job Analyzer</Link>
                            <span className="text-gray-600">|</span>
                            <span className="font-semibold text-gray-300">{user.username}</span>
                            <button onClick={handleLogout} className="border border-white hover:bg-white hover:text-black px-4 py-1.5 rounded-none transition-colors">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-gray-400 transition-colors">Login</Link>
                            <Link to="/register" className="bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-none transition-colors">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
