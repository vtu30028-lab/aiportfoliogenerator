import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function PortfolioEditor() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [portfolioData, setPortfolioData] = useState(null);
    const [template, setTemplate] = useState('modern');
    const [saving, setSaving] = useState(false);
    const [savedSlug, setSavedSlug] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('parsedResume');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setPortfolioData(parsed.data || parsed);
            } catch (e) {
                console.error(e);
            }
        } else {
            navigate('/dashboard');
        }
    }, [navigate]);

    if (!portfolioData) {
        return (
            <div className="p-12 text-center">
                <div className="border-4 border-black p-10 max-w-md mx-auto">
                    <p className="font-black uppercase tracking-widest text-lg mb-4">INITIALIZING ENGINE...</p>
                    <Link to="/dashboard" className="text-xs font-bold uppercase underline">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                title: `${portfolioData.full_name || 'My'}'s Portfolio`,
                template: template,
                data: portfolioData
            };
            const res = await axios.post('http://localhost:5000/api/portfolio', payload);
            setSavedSlug(res.data.slug);
            alert(`PORTFOLIO PUBLISHED TO SUPABASE!\nLive at: /portfolio/${res.data.slug}`);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to save portfolio: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setPortfolioData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black pb-4 mb-6">
                <div>
                    <span className="text-xs font-black tracking-widest text-gray-500 uppercase">Interactive Studio</span>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Portfolio Architect</h1>
                </div>
                <div className="flex items-center gap-4 mt-3 md:mt-0">
                    <button
                        onClick={() => window.print()}
                        className="border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                    >
                        Export / Print PDF
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-black text-white px-6 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:bg-gray-400"
                    >
                        {saving ? 'COMMITTING TO SUPABASE...' : 'PUBLISH PORTFOLIO →'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-180px)]">
                {/* Editor Left Column */}
                <div className="lg:col-span-5 border-2 border-black p-6 bg-white overflow-y-auto space-y-6">
                    <div className="border-b-2 border-black pb-4">
                        <label className="block text-black font-black uppercase text-xs mb-2 tracking-widest">Selected Style Template</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['modern', 'professional', 'minimal'].map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setTemplate(t)}
                                    className={`py-2 text-xs font-black uppercase tracking-wider border-2 border-black transition-all ${
                                        template === t ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-black font-black uppercase text-xs mb-1 tracking-widest">Full Name</label>
                        <input 
                            type="text" 
                            value={portfolioData.full_name || ''} 
                            onChange={(e) => handleChange('full_name', e.target.value)} 
                            className="w-full px-3 py-2 border-2 border-black font-bold uppercase text-sm focus:outline-none" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-black font-black uppercase text-xs mb-1 tracking-widest">Email</label>
                            <input 
                                type="email" 
                                value={portfolioData.email || ''} 
                                onChange={(e) => handleChange('email', e.target.value)} 
                                className="w-full px-3 py-2 border-2 border-black text-xs font-mono focus:outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-black font-black uppercase text-xs mb-1 tracking-widest">Location</label>
                            <input 
                                type="text" 
                                value={portfolioData.location || ''} 
                                onChange={(e) => handleChange('location', e.target.value)} 
                                className="w-full px-3 py-2 border-2 border-black text-xs font-medium focus:outline-none" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-black font-black uppercase text-xs mb-1 tracking-widest">Professional Summary</label>
                        <textarea 
                            value={portfolioData.professional_summary || ''} 
                            onChange={(e) => handleChange('professional_summary', e.target.value)} 
                            className="w-full px-3 py-2 border-2 border-black text-xs font-medium h-28 leading-relaxed focus:outline-none" 
                        />
                    </div>

                    <div>
                        <label className="block text-black font-black uppercase text-xs mb-1 tracking-widest">Technical & Soft Skills</label>
                        <input 
                            type="text" 
                            value={Array.isArray(portfolioData.skills) ? portfolioData.skills.join(', ') : (portfolioData.skills || '')} 
                            onChange={(e) => handleChange('skills', e.target.value.split(',').map(s => s.trim()))} 
                            className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" 
                            placeholder="React, Node.js, Python, PostgreSQL..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-black font-black uppercase text-xs mb-1 tracking-widest">GitHub URL</label>
                            <input 
                                type="text" 
                                value={portfolioData.github_url || ''} 
                                onChange={(e) => handleChange('github_url', e.target.value)} 
                                className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-black font-black uppercase text-xs mb-1 tracking-widest">LinkedIn URL</label>
                            <input 
                                type="text" 
                                value={portfolioData.linkedin_url || ''} 
                                onChange={(e) => handleChange('linkedin_url', e.target.value)} 
                                className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" 
                            />
                        </div>
                    </div>
                </div>

                {/* Live Preview Right Column */}
                <div className="lg:col-span-7 border-2 border-black bg-gray-50 overflow-y-auto relative flex flex-col">
                    <div className="bg-black text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 flex justify-between items-center sticky top-0 z-20">
                        <span>LIVE RENDER ENGINE</span>
                        <span className="font-mono text-gray-400">TEMPLATE: {template.toUpperCase()}</span>
                    </div>
                    
                    <div className="p-6 md:p-10 flex-grow bg-white">
                        {template === 'modern' && (
                            <div className="space-y-8">
                                <div className="border-4 border-black p-8 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                    <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter">
                                        {portfolioData.full_name || 'YOUR NAME'}
                                    </h1>
                                    <p className="text-xs font-mono text-gray-600 mt-2">
                                        {portfolioData.email} {portfolioData.location && `• ${portfolioData.location}`}
                                    </p>
                                    <p className="text-base font-bold border-l-4 border-black pl-4 my-6 text-gray-800 leading-relaxed">
                                        {portfolioData.professional_summary}
                                    </p>
                                    
                                    <div className="mt-6">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-black mb-3">Core Stack</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(portfolioData.skills) && portfolioData.skills.map((skill, i) => (
                                                <span key={i} className="border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider bg-white hover:bg-black hover:text-white transition-colors">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {Array.isArray(portfolioData.experience) && portfolioData.experience.length > 0 && (
                                    <div className="border-2 border-black p-6 bg-white">
                                        <h3 className="text-lg font-black uppercase tracking-wider mb-4 border-b-2 border-black pb-2">Experience</h3>
                                        <div className="space-y-4">
                                            {portfolioData.experience.map((exp, i) => (
                                                <div key={i}>
                                                    <div className="flex justify-between items-baseline">
                                                        <h4 className="font-black text-black">{exp.role}</h4>
                                                        <span className="text-xs font-bold text-gray-500 uppercase">{exp.company}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-700 mt-1 leading-relaxed">{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {template === 'professional' && (
                            <div className="font-mono text-sm space-y-6">
                                <div className="border-b-2 border-black pb-6 text-center">
                                    <h1 className="text-3xl font-bold uppercase tracking-widest">{portfolioData.full_name}</h1>
                                    <p className="text-xs text-gray-600 mt-1">{portfolioData.email} {portfolioData.location && `| ${portfolioData.location}`}</p>
                                    <div className="flex justify-center gap-4 mt-2 text-xs">
                                        {portfolioData.github_url && <a href={portfolioData.github_url} className="underline" target="_blank">GitHub</a>}
                                        {portfolioData.linkedin_url && <a href={portfolioData.linkedin_url} className="underline" target="_blank">LinkedIn</a>}
                                    </div>
                                </div>

                                <div>
                                    <span className="bg-black text-white px-2 py-0.5 text-xs font-bold uppercase tracking-widest">Executive Summary</span>
                                    <p className="mt-3 text-xs leading-relaxed text-gray-800">{portfolioData.professional_summary}</p>
                                </div>

                                <div>
                                    <span className="bg-black text-white px-2 py-0.5 text-xs font-bold uppercase tracking-widest">Technical Competencies</span>
                                    <p className="mt-3 text-xs text-gray-800 leading-relaxed font-bold">
                                        {Array.isArray(portfolioData.skills) ? portfolioData.skills.join(' • ') : portfolioData.skills}
                                    </p>
                                </div>
                            </div>
                        )}

                        {template === 'minimal' && (
                            <div className="py-8 px-4 max-w-xl mx-auto space-y-10">
                                <div>
                                    <h1 className="text-2xl font-light tracking-wide text-black">{portfolioData.full_name}</h1>
                                    <p className="text-xs text-gray-500 mt-1">{portfolioData.email} • {portfolioData.location}</p>
                                </div>

                                <p className="text-sm font-light text-gray-800 leading-loose">
                                    {portfolioData.professional_summary}
                                </p>

                                <div>
                                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-3">Skills</h4>
                                    <p className="text-xs text-black font-medium leading-relaxed">
                                        {Array.isArray(portfolioData.skills) ? portfolioData.skills.join('  /  ') : portfolioData.skills}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
