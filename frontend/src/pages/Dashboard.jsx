import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    if (!user) {
        return <div className="p-10 text-center font-bold uppercase text-2xl tracking-widest mt-20">Access Denied. Please Login.</div>;
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('FILE REQUIRED.');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        setUploading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/resume/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            localStorage.setItem('parsedResume', JSON.stringify(res.data));
            navigate('/editor');
        } catch (err) {
            setError(err.response?.data?.message || 'UPLOAD FAILED.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto p-10 max-w-6xl">
            <h1 className="text-4xl font-black mb-12 uppercase tracking-tighter border-b-4 border-black pb-4">Welcome, {user.username}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="border-2 border-black p-8 bg-white">
                    <h2 className="text-2xl font-bold mb-6 uppercase tracking-wider">Initialize Portfolio</h2>
                    <p className="text-gray-600 mb-8 font-medium">Upload your resume (PDF/DOCX). Our AI will extract your details and construct a professional portfolio structure.</p>
                    
                    {error && <p className="text-white bg-black p-2 mb-4 font-bold text-sm text-center">{error}</p>}
                    
                    <form onSubmit={handleUpload}>
                        <div className="border-2 border-dashed border-gray-300 p-6 mb-6 text-center hover:border-black transition-colors">
                            <input 
                                type="file" 
                                accept=".pdf,.docx" 
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-bold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={uploading || !file}
                            className={`w-full py-4 font-black uppercase tracking-widest transition-colors ${uploading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                        >
                            {uploading ? 'Processing...' : 'Upload & Generate'}
                        </button>
                    </form>
                </div>

                <div className="border-2 border-black p-8 bg-black text-white">
                    <h2 className="text-2xl font-bold mb-6 uppercase tracking-wider">My Portfolios</h2>
                    <div className="border border-gray-800 p-6 text-center text-gray-400">
                        <p className="font-medium tracking-wide">NO PORTFOLIOS PUBLISHED YET.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
