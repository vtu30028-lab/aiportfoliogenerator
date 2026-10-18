import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('details'); // 'details' | 'upload'
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [portfolios, setPortfolios] = useState([]);
    const [loadingPortfolios, setLoadingPortfolios] = useState(true);
    const navigate = useNavigate();

    // Form state for entering manual details
    const [details, setDetails] = useState({
        full_name: user?.username ? user.username.toUpperCase() : '',
        role: 'Full-Stack Software Engineer',
        email: user?.email || '',
        phone: '+1 555-0199',
        location: 'Bangalore, India',
        skills: 'React, Node.js, JavaScript, Python, PostgreSQL, Tailwind CSS, Docker, Git',
        experience_notes: 'Software Engineer building web applications, optimizing API latency, and designing database schemas.',
        project_notes: 'Full-stack SaaS platform with authentication, interactive dashboards, and real-time data sync.',
        education_notes: 'B.Tech in Computer Science and Engineering',
        github_url: 'https://github.com',
        linkedin_url: 'https://linkedin.com'
    });

    useEffect(() => {
        if (user) {
            setDetails(prev => ({
                ...prev,
                full_name: prev.full_name || (user.username ? user.username.toUpperCase() : ''),
                email: prev.email || user.email || ''
            }));
            fetchPortfolios();
        }
    }, [user]);

    const fetchPortfolios = async () => {
        try {
            setLoadingPortfolios(true);
            const res = await axios.get('http://localhost:5000/api/portfolio');
            setPortfolios(res.data);
        } catch (err) {
            console.error('Failed to fetch portfolios:', err);
        } finally {
            setLoadingPortfolios(false);
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto p-12 text-center">
                <div className="border-4 border-black p-12 max-w-xl mx-auto bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-4">AUTHENTICATION REQUIRED</h2>
                    <p className="text-gray-600 mb-8 font-medium">Please sign in to access your portfolio dashboard and AI generation tools.</p>
                    <Link to="/login" className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest inline-block hover:bg-gray-800 transition-colors">
                        GO TO LOGIN →
                    </Link>
                </div>
            </div>
        );
    }

    // 1. Generate Portfolio from Manual User Details via AI
    const handleGenerateFromDetails = async (e) => {
        e.preventDefault();
        setGenerating(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/ai/generate-portfolio', details);
            if (res.data && res.data.data) {
                localStorage.setItem('parsedResume', JSON.stringify(res.data));
                navigate('/editor');
            } else {
                setError('AI generation returned empty structure. Please retry.');
            }
        } catch (err) {
            console.error('AI Generation error:', err);
            setError(err.response?.data?.message || 'Failed to generate portfolio with AI. Please check server status.');
        } finally {
            setGenerating(false);
        }
    };

    // 2. Upload Resume PDF/DOCX to AI
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleUploadResume = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a PDF or DOCX file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        setUploading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/resume/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data && res.data.data) {
                localStorage.setItem('parsedResume', JSON.stringify(res.data));
                navigate('/editor');
            } else {
                setError('Could not extract structured data. Please try manual entry.');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Resume upload failed. Try entering details directly.');
        } finally {
            setUploading(false);
        }
    };

    const handleDeletePortfolio = async (id) => {
        if (!window.confirm('Delete this published portfolio permanently?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/portfolio/${id}`);
            setPortfolios(portfolios.filter(p => p.id !== id));
        } catch (err) {
            alert('Failed to delete portfolio.');
        }
    };

    return (
        <div className="container mx-auto p-6 md:p-10 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-6 mb-10">
                <div>
                    <span className="text-xs font-black tracking-widest text-gray-500 uppercase">AI PORTFOLIO STUDIO</span>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mt-1">OPERATOR: {user.username}</h1>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4">
                    <Link 
                        to="/job-analyzer"
                        className="bg-black text-white px-6 py-3 font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                        Job Analyzer ↗
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-black text-white p-4 mb-8 font-bold text-xs uppercase tracking-wide border-2 border-black">
                    [ERROR]: {error}
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Generation Engine Column */}
                <div className="lg:col-span-7 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    {/* Method Selector Tabs */}
                    <div className="grid grid-cols-2 border-b-2 border-black bg-gray-100">
                        <button
                            type="button"
                            onClick={() => setActiveTab('details')}
                            className={`py-4 text-xs font-black uppercase tracking-wider transition-colors ${
                                activeTab === 'details' ? 'bg-white text-black border-r-2 border-black' : 'text-gray-500 hover:text-black border-r-2 border-black'
                            }`}
                        >
                            ✨ 1. Enter Details & AI Generate
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('upload')}
                            className={`py-4 text-xs font-black uppercase tracking-wider transition-colors ${
                                activeTab === 'upload' ? 'bg-white text-black' : 'text-gray-500 hover:text-black'
                            }`}
                        >
                            📄 2. Upload Resume (PDF / DOCX)
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === 'details' ? (
                            <form onSubmit={handleGenerateFromDetails} className="space-y-5">
                                <div className="border-b border-gray-200 pb-3">
                                    <h3 className="text-xl font-black uppercase tracking-tight">AI Portfolio Generation from Your Details</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Provide your core skills and background notes. Gemini AI will architect a complete portfolio, generate professional executive summaries, craft project impact stories, and categorize skills automatically.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-black font-black uppercase text-[11px] mb-1 tracking-widest">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={details.full_name} 
                                            onChange={(e) => setDetails({ ...details, full_name: e.target.value })}
                                            required
                                            className="w-full p-2.5 border-2 border-black text-xs font-bold uppercase focus:outline-none"
                                            placeholder="e.g. Hemanth Kumar"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-black font-black uppercase text-[11px] mb-1 tracking-widest">Target Role / Title</label>
                                        <input 
                                            type="text" 
                                            value={details.role} 
                                            onChange={(e) => setDetails({ ...details, role: e.target.value })}
                                            required
                                            className="w-full p-2.5 border-2 border-black text-xs font-bold focus:outline-none"
                                            placeholder="e.g. Full-Stack Developer, AI Engineer"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-black font-black uppercase text-[11px] mb-1 tracking-widest">Key Skills & Tools (Comma Separated)</label>
                                    <input 
                                        type="text" 
                                        value={details.skills} 
                                        onChange={(e) => setDetails({ ...details, skills: e.target.value })}
                                        required
                                        className="w-full p-2.5 border-2 border-black text-xs font-mono focus:outline-none"
                                        placeholder="React, Node.js, Python, PostgreSQL, Docker, AWS"
                                    />
                                </div>

                                <div>
                                    <label className="block text-black font-black uppercase text-[11px] mb-1 tracking-widest">Experience & Achievements Notes</label>
                                    <textarea 
                                        value={details.experience_notes} 
                                        onChange={(e) => setDetails({ ...details, experience_notes: e.target.value })}
                                        className="w-full p-2.5 border-2 border-black text-xs font-medium h-20 focus:outline-none leading-relaxed"
                                        placeholder="Mention your past companies, internships, open source contributions, or key achievements..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-black font-black uppercase text-[11px] mb-1 tracking-widest">Featured Projects Highlights</label>
                                    <textarea 
                                        value={details.project_notes} 
                                        onChange={(e) => setDetails({ ...details, project_notes: e.target.value })}
                                        className="w-full p-2.5 border-2 border-black text-xs font-medium h-20 focus:outline-none leading-relaxed"
                                        placeholder="Rough titles or ideas of your projects (e.g. AI portfolio generator, e-commerce app)..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-black font-black uppercase text-[11px] mb-1 tracking-widest">Location / City</label>
                                        <input 
                                            type="text" 
                                            value={details.location} 
                                            onChange={(e) => setDetails({ ...details, location: e.target.value })}
                                            className="w-full p-2 border-2 border-black text-xs focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-black font-black uppercase text-[11px] mb-1 tracking-widest">Education Details</label>
                                        <input 
                                            type="text" 
                                            value={details.education_notes} 
                                            onChange={(e) => setDetails({ ...details, education_notes: e.target.value })}
                                            className="w-full p-2 border-2 border-black text-xs focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={generating}
                                    className={`w-full py-4 font-black uppercase tracking-widest text-sm transition-all ${
                                        generating 
                                            ? 'bg-gray-300 text-gray-600 cursor-wait' 
                                            : 'bg-black text-white hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                    }`}
                                >
                                    {generating ? '✨ AI ARCHITECTING PORTFOLIO WEBSITE...' : '✨ GENERATE PORTFOLIO WEBSITE WITH AI →'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleUploadResume} className="space-y-6">
                                <div className="border-b border-gray-200 pb-3">
                                    <h3 className="text-xl font-black uppercase tracking-tight">Upload Resume for AI Extraction</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Upload your PDF or DOCX resume document. Our NLP parser extracts all your experience, contact info, and skills into your portfolio.
                                    </p>
                                </div>

                                <div className="border-2 border-dashed border-gray-400 p-10 text-center hover:border-black transition-colors bg-gray-50">
                                    <input 
                                        type="file" 
                                        accept=".pdf,.docx,.doc,.txt" 
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-xs file:font-black file:uppercase file:bg-white file:text-black hover:file:bg-black hover:file:text-white cursor-pointer"
                                    />
                                    {file && (
                                        <p className="mt-4 text-xs font-bold text-black uppercase tracking-wider">
                                            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                        </p>
                                    )}
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={uploading || !file}
                                    className={`w-full py-4 font-black uppercase tracking-widest text-sm transition-all ${
                                        uploading 
                                            ? 'bg-gray-300 text-gray-600 cursor-wait' 
                                            : !file
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-black text-white hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                    }`}
                                >
                                    {uploading ? 'ANALYZING & GENERATING...' : 'UPLOAD & EXTRACT WITH AI →'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Published Portfolios Column */}
                <div className="lg:col-span-5 border-2 border-black p-8 bg-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-fit">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-3">
                        <h2 className="text-xl font-black uppercase tracking-wider">My Saved Portfolios</h2>
                        <span className="text-[10px] font-mono text-gray-400">COUNT: {portfolios.length}</span>
                    </div>

                    {loadingPortfolios ? (
                        <div className="border border-gray-800 p-8 text-center text-gray-400 font-mono text-xs">
                            FETCHING FROM SUPABASE...
                        </div>
                    ) : portfolios.length === 0 ? (
                        <div className="border border-gray-800 p-8 text-center space-y-3">
                            <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">
                                NO PORTFOLIOS SAVED YET
                            </p>
                            <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                                Fill in your details on the left and click Generate to publish your first personal website to Supabase!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                            {portfolios.map((p) => (
                                <div key={p.id} className="border border-gray-800 p-4 bg-neutral-950 flex flex-col justify-between gap-3 hover:border-gray-600 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{p.title || p.full_name}</h4>
                                            <span className="text-[10px] font-mono text-gray-400 block mt-0.5">/portfolio/{p.slug}</span>
                                        </div>
                                        <span className="text-[9px] font-mono uppercase bg-white text-black px-1.5 py-0.5 font-bold">
                                            {p.template}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-900">
                                        <Link
                                            to={`/portfolio/${p.slug}`}
                                            target="_blank"
                                            className="flex-1 text-center bg-white text-black py-1.5 text-xs font-black uppercase tracking-wider hover:bg-gray-200 transition-colors"
                                        >
                                            View Public Site ↗
                                        </Link>
                                        <button
                                            onClick={() => handleDeletePortfolio(p.id)}
                                            className="border border-red-600 text-red-500 hover:bg-red-600 hover:text-white px-2.5 py-1.5 text-xs font-bold uppercase transition-colors"
                                            title="Delete"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
