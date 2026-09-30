import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(username, email, password);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-white">
            <div className="border-2 border-black p-10 w-[400px]">
                <h2 className="text-3xl font-black mb-8 text-center uppercase tracking-widest">Register</h2>
                {error && <p className="text-white bg-black p-2 mb-6 text-center text-sm font-bold">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-black font-bold uppercase text-sm mb-2">Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-2 focus:ring-black rounded-none" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-black font-bold uppercase text-sm mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-2 focus:ring-black rounded-none" />
                    </div>
                    <div className="mb-8">
                        <label className="block text-black font-bold uppercase text-sm mb-2">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-2 focus:ring-black rounded-none" />
                    </div>
                    <button type="submit" className="w-full bg-black text-white py-4 font-bold hover:bg-gray-800 transition-colors uppercase tracking-widest">Join</button>
                </form>
                <p className="mt-8 text-center text-gray-500 text-sm">Already have an account? <Link to="/login" className="text-black font-bold border-b border-black hover:text-gray-700">Login</Link></p>
            </div>
        </div>
    );
}
