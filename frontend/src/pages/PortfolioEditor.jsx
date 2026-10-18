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
    const [enhancingSummary, setEnhancingSummary] = useState(false);

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
                title: `${portfolioData.full_name || 'Personal'}'s Portfolio`,
                template: template,
                data: portfolioData
            };
            const res = await axios.post('http://localhost:5000/api/portfolio', payload);
            alert(`PORTFOLIO PUBLISHED TO SUPABASE!\nLive at: /portfolio/${res.data.slug}`);
            navigate(`/portfolio/${res.data.slug}`);
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

    // AI Rewrite Feature for Summary / About Me
    const handleAiRewriteSummary = async () => {
        if (!portfolioData.professional_summary) return;
        setEnhancingSummary(true);
        try {
            const res = await axios.post('http://localhost:5000/api/ai/enhance', {
                text: portfolioData.professional_summary,
                type: 'summary',
                role: portfolioData.role || 'Software Engineer'
            });
            if (res.data && res.data.enhanced) {
                handleChange('professional_summary', res.data.enhanced);
            }
        } catch (err) {
            console.error('AI enhance summary error:', err);
            alert('Could not enhance summary at this moment.');
        } finally {
            setEnhancingSummary(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black pb-4 mb-6">
                <div>
                    <span className="text-xs font-black tracking-widest text-gray-500 uppercase">Live AI Editor & Preview</span>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Portfolio Studio</h1>
                </div>
                <div className="flex items-center gap-4 mt-3 md:mt-0">
                    <Link
                        to="/dashboard"
                        className="border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-gray-100 transition-colors"
                    >
                        ← Back to Dashboard
                    </Link>
                    <button
                        onClick={() => window.print()}
                        className="border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                    >
                        Print / PDF
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-black text-white px-6 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:bg-gray-400"
                    >
                        {saving ? 'COMMITTING TO SUPABASE...' : 'PUBLISH TO LIVE URL →'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-180px)]">
                {/* Editor Left Column */}
                <div className="lg:col-span-5 border-2 border-black p-6 bg-white overflow-y-auto space-y-6">
                    <div className="border-b-2 border-black pb-4">
                        <label className="block text-black font-black uppercase text-xs mb-2 tracking-widest">Select Design Template</label>
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

                    <div>
                        <label className="block text-black font-black uppercase text-xs mb-1 tracking-widest">Target Role / Headline</label>
                        <input 
                            type="text" 
                            value={portfolioData.role || ''} 
                            onChange={(e) => handleChange('role', e.target.value)} 
                            className="w-full px-3 py-2 border-2 border-black font-bold text-xs focus:outline-none" 
                            placeholder="e.g. Senior Full-Stack Engineer"
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
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-black font-black uppercase text-xs tracking-widest">Professional Summary</label>
                            <button
                                type="button"
                                onClick={handleAiRewriteSummary}
                                disabled={enhancingSummary}
                                className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 hover:bg-gray-800 transition-colors"
                            >
                                {enhancingSummary ? '✨ AI Rewriting...' : '✨ AI Rewrite'}
                            </button>
                        </div>
                        <textarea 
                            value={portfolioData.professional_summary || ''} 
                            onChange={(e) => handleChange('professional_summary', e.target.value)} 
                            className="w-full px-3 py-2 border-2 border-black text-xs font-medium h-28 leading-relaxed focus:outline-none" 
                        />
                    </div>

                    <div>
                        <label className="block text-black font-black uppercase text-xs mb-1 tracking-widest">Technical & Soft Skills (Comma Separated)</label>
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
                <div className="lg:col-span-7 border-2 border-black bg-gray-50 overflow-y-auto relative flex flex-col shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-black text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 flex justify-between items-center sticky top-0 z-20">
                        <span>LIVE PREVIEW MONITOR</span>
                        <span className="font-mono text-gray-400">TEMPLATE: {template.toUpperCase()}</span>
                    </div>
                    
                    <div className="p-6 md:p-10 flex-grow bg-white">
                        {template === 'modern' && (
                            <div className="space-y-8">
                                <div className="border-4 border-black p-8 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                    <div className="text-[10px] font-mono uppercase bg-black text-white px-2 py-0.5 inline-block font-bold mb-2">
                                        {portfolioData.role || 'FULL-STACK DEVELOPER'}
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter">
                                        {portfolioData.full_name || 'YOUR NAME'}
                                    </h1>
                                    <p className="text-xs font-mono text-gray-600 mt-2">
                                        {portfolioData.email} {portfolioData.location && `• ${portfolioData.location}`}
                                    </p>
                                    <p className="text-sm font-bold border-l-4 border-black pl-4 my-6 text-gray-800 leading-relaxed">
                                        {portfolioData.professional_summary}
                                    </p>
                                    
                                    <div className="mt-6">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-black mb-3">Core Stack & Competencies</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(portfolioData.skills) && portfolioData.skills.map((skill, i) => (
                                                <span key={i} className="border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider bg-white hover:bg-black hover:text-white transition-colors">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {Array.isArray(portfolioData.projects) && portfolioData.projects.length > 0 && (
                                    <div className="border-2 border-black p-6 bg-white">
                                        <h3 className="text-lg font-black uppercase tracking-wider mb-4 border-b-2 border-black pb-2">Featured Projects</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {portfolioData.projects.map((proj, i) => (
                                                <div key={i} className="border-2 border-black p-4 bg-gray-50">
                                                    <h4 className="font-black text-black text-sm uppercase">{proj.title}</h4>
                                                    <p className="text-xs text-gray-700 mt-1 leading-relaxed">{proj.description}</p>
                                                    {proj.technologies && (
                                                        <div className="flex flex-wrap gap-1 mt-3">
                                                            {(Array.isArray(proj.technologies) ? proj.technologies : [proj.technologies]).map((tech, j) => (
                                                                <span key={j} className="text-[9px] font-mono border border-black px-1.5 py-0.5 bg-white">
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {Array.isArray(portfolioData.experience) && portfolioData.experience.length > 0 && (
                                    <div className="border-2 border-black p-6 bg-white">
                                        <h3 className="text-lg font-black uppercase tracking-wider mb-4 border-b-2 border-black pb-2">Experience Timeline</h3>
                                        <div className="space-y-4">
                                            {portfolioData.experience.map((exp, i) => (
                                                <div key={i} className="border-l-2 border-black pl-4">
                                                    <div className="flex justify-between items-baseline">
                                                        <h4 className="font-black text-black text-sm">{exp.role}</h4>
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
                            <div className="font-mono text-sm space-y-8">
                                <div className="border-b-2 border-black pb-6 text-center">
                                    <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
                                        {portfolioData.role || 'SOFTWARE ENGINEER'}
                                    </div>
                                    <h1 className="text-3xl font-bold uppercase tracking-widest">{portfolioData.full_name}</h1>
                                    <p className="text-xs text-gray-600 mt-2">{portfolioData.email} {portfolioData.location && `| ${portfolioData.location}`}</p>
                                    <div className="flex justify-center gap-4 mt-2 text-xs font-bold">
                                        {portfolioData.github_url && <a href={portfolioData.github_url} className="underline" target="_blank" rel="noreferrer">GitHub</a>}
                                        {portfolioData.linkedin_url && <a href={portfolioData.linkedin_url} className="underline" target="_blank" rel="noreferrer">LinkedIn</a>}
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

                                {Array.isArray(portfolioData.projects) && portfolioData.projects.length > 0 && (
                                    <div>
                                        <span className="bg-black text-white px-2 py-0.5 text-xs font-bold uppercase tracking-widest">Project Highlights</span>
                                        <div className="mt-3 space-y-4">
                                            {portfolioData.projects.map((proj, i) => (
                                                <div key={i} className="border-l-2 border-black pl-3">
                                                    <h4 className="font-bold text-xs uppercase">{proj.title}</h4>
                                                    <p className="text-xs text-gray-700 mt-1">{proj.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {template === 'minimal' && (
                            <div className="py-8 px-4 max-w-xl mx-auto space-y-10">
                                <div>
                                    <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400 block mb-1">
                                        {portfolioData.role || 'CREATIVE DEVELOPER'}
                                    </span>
                                    <h1 className="text-3xl font-light tracking-wide text-black">{portfolioData.full_name}</h1>
                                    <p className="text-xs text-gray-500 mt-1">{portfolioData.email} • {portfolioData.location}</p>
                                </div>

                                <p className="text-sm font-light text-gray-800 leading-loose">
                                    {portfolioData.professional_summary}
                                </p>

                                <div>
                                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-3">Skills & Tools</h4>
                                    <p className="text-xs text-black font-medium leading-relaxed">
                                        {Array.isArray(portfolioData.skills) ? portfolioData.skills.join('  /  ') : portfolioData.skills}
                                    </p>
                                </div>

                                {Array.isArray(portfolioData.projects) && portfolioData.projects.length > 0 && (
                                    <div className="border-t border-gray-200 pt-6">
                                        <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-4">Projects</h4>
                                        <div className="space-y-4">
                                            {portfolioData.projects.map((p, i) => (
                                                <div key={i}>
                                                    <h5 className="font-medium text-xs text-black">{p.title}</h5>
                                                    <p className="text-xs font-light text-gray-600 mt-0.5">{p.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
