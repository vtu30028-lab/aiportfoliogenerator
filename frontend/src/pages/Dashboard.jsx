import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [portfolios, setPortfolios] = useState([]);
    const [loadingPortfolios, setLoadingPortfolios] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
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
                <div className="border-4 border-black p-12 max-w-xl mx-auto bg-white">
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-4">ACCESS RESTRICTED</h2>
                    <p className="text-gray-600 mb-8 font-medium">Please sign in to access your portfolio dashboard and AI generation tools.</p>
                    <Link to="/login" className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest inline-block hover:bg-gray-800 transition-colors">
                        GO TO LOGIN
                    </Link>
                </div>
            </div>
        );
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a PDF or DOCX resume file.');
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
                setError('Unexpected AI parser output. Please try again.');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Resume extraction failed. Check file format or try manual creation.');
        } finally {
            setUploading(false);
        }
    };

    const handleCreateManual = () => {
        const starterData = {
            data: {
                full_name: user.username ? user.username.toUpperCase() : "YOUR NAME",
                email: user.email || "",
                phone: "+1 555-0100",
                location: "Location",
                professional_summary: "Experienced software engineer passionate about building modern web applications, scalable APIs, and intuitive user experiences.",
                career_objective: "To design and deploy impactful web technologies.",
                skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "Tailwind CSS"],
                experience: [
                    {
                        company: "Company Name",
                        role: "Software Developer",
                        description: "Developed and maintained full-stack web features, enhanced database queries, and collaborated with cross-functional teams."
                    }
                ],
                projects: [
                    {
                        title: "AI Portfolio Generator",
                        description: "Full-stack application allowing automated portfolio generation and template customisation.",
                        technologies: ["React", "Express", "Supabase"]
                    }
                ],
                github_url: "https://github.com",
                linkedin_url: "https://linkedin.com"
            }
        };
        localStorage.setItem('parsedResume', JSON.stringify(starterData));
        navigate('/editor');
    };

    const handleDeletePortfolio = async (id) => {
        if (!window.confirm('Are you sure you want to delete this portfolio?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/portfolio/${id}`);
            setPortfolios(portfolios.filter(p => p.id !== id));
        } catch (err) {
            alert('Failed to delete portfolio.');
        }
    };

    return (
        <div className="container mx-auto p-6 md:p-10 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-6 mb-12">
                <div>
                    <span className="text-xs font-black tracking-widest text-gray-500 uppercase">Authenticated Dashboard</span>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mt-1">OPERATOR: {user.username}</h1>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4">
                    <button 
                        onClick={handleCreateManual}
                        className="border-2 border-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors text-sm"
                    >
                        + Create Manually
                    </button>
                    <Link 
                        to="/job-analyzer"
                        className="bg-black text-white px-6 py-3 font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors text-sm"
                    >
                        Job Analyzer →
                    </Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Upload Section */}
                <div className="lg:col-span-5 border-2 border-black p-8 bg-white h-fit">
                    <h2 className="text-2xl font-black mb-3 uppercase tracking-wider">AI Resume Engine</h2>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed font-medium">
                        Upload your PDF or DOCX resume. Our AI extracts contact details, skills, experience, and generates professional summaries automatically.
                    </p>
                    
                    {error && (
                        <div className="bg-black text-white p-3 mb-6 font-bold text-xs uppercase tracking-wide">
                            [ERROR]: {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleUpload}>
                        <div className="border-2 border-dashed border-gray-400 p-8 mb-6 text-center hover:border-black transition-colors bg-gray-50">
                            <input 
                                type="file" 
                                id="resume-file-input"
                                accept=".pdf,.docx,.doc,.txt" 
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-xs file:font-black file:uppercase file:bg-white file:text-black hover:file:bg-black hover:file:text-white cursor-pointer"
                            />
                            {file && (
                                <p className="mt-3 text-xs font-bold text-black uppercase tracking-wider">
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
                            {uploading ? 'ANALYZING & GENERATING...' : 'UPLOAD & EXTRACT WITH AI'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Or skip resume upload</span>
                        <button
                            onClick={handleCreateManual}
                            className="block w-full mt-2 text-xs font-black uppercase tracking-widest text-black underline hover:text-gray-600"
                        >
                            Start from scratch with starter template →
                        </button>
                    </div>
                </div>

                {/* My Portfolios List */}
                <div className="lg:col-span-7 border-2 border-black p-8 bg-black text-white">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                        <h2 className="text-2xl font-black uppercase tracking-wider">My Published Portfolios</h2>
                        <span className="text-xs font-mono text-gray-400">COUNT: {portfolios.length}</span>
                    </div>

                    {loadingPortfolios ? (
                        <div className="border border-gray-800 p-12 text-center text-gray-400 font-mono text-sm">
                            QUERYING SUPABASE DATABASE...
                        </div>
                    ) : portfolios.length === 0 ? (
                        <div className="border border-gray-800 p-12 text-center">
                            <p className="font-bold text-gray-400 uppercase tracking-widest text-sm mb-4">
                                NO PORTFOLIOS CREATED YET
                            </p>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                                Upload your resume on the left or create one manually to publish your first personal website.
                            </p>
                            <button
                                onClick={handleCreateManual}
                                className="border border-white text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                            >
                                Create First Portfolio
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {portfolios.map((p) => (
                                <div key={p.id} className="border border-gray-800 p-5 bg-neutral-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-600 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-white text-lg tracking-tight">{p.title || p.full_name}</h3>
                                            <span className="text-[10px] font-mono uppercase bg-white text-black px-2 py-0.5 font-bold">
                                                {p.template}
                                            </span>
                                        </div>
                                        <p className="text-xs font-mono text-gray-400 mt-1">
                                            URL: /portfolio/{p.slug}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <Link
                                            to={`/portfolio/${p.slug}`}
                                            target="_blank"
                                            className="flex-1 sm:flex-none text-center bg-white text-black px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-gray-200 transition-colors"
                                        >
                                            View Public ↗
                                        </Link>
                                        <button
                                            onClick={() => handleDeletePortfolio(p.id)}
                                            className="border border-red-600 text-red-500 hover:bg-red-600 hover:text-white px-3 py-2 text-xs font-bold uppercase transition-colors"
                                            title="Delete portfolio"
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
