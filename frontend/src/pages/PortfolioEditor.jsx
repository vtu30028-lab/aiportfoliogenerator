import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PortfolioEditor() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [portfolioData, setPortfolioData] = useState(null);
    const [template, setTemplate] = useState('modern');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const data = localStorage.getItem('parsedResume');
        if (data) {
            setPortfolioData(JSON.parse(data).data);
        } else {
            navigate('/dashboard');
        }
    }, [navigate]);

    if (!portfolioData) return <div className="p-10 font-black uppercase tracking-widest text-center mt-20 text-2xl">Initializing Editor...</div>;

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                title: `${portfolioData.full_name}'s Portfolio`,
                template: template,
                data: portfolioData
            };
            await axios.post('http://localhost:5000/api/portfolio', payload);
            alert('PORTFOLIO SAVED.');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('ERROR SAVING.');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e, field) => {
        setPortfolioData({ ...portfolioData, [field]: e.target.value });
    };

    return (
        <div className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-80px)]">
            {/* Editor Form */}
            <div className="border-2 border-black p-6 bg-white overflow-y-auto">
                <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter border-b-4 border-black pb-4">Editor Engine</h2>
                
                <div className="mb-6">
                    <label className="block text-black font-bold uppercase text-xs mb-2 tracking-widest">Select Template</label>
                    <select 
                        value={template} 
                        onChange={(e) => setTemplate(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:ring-0 font-bold uppercase tracking-wider cursor-pointer bg-white"
                    >
                        <option value="modern">Modern Brutalism</option>
                        <option value="professional">Classic Monospace</option>
                        <option value="minimal">Ultra Minimal</option>
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-black font-bold uppercase text-xs mb-2 tracking-widest">Full Name</label>
                    <input type="text" value={portfolioData.full_name || ''} onChange={(e) => handleChange(e, 'full_name')} className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:ring-0 font-medium" />
                </div>
                
                <div className="mb-6">
                    <label className="block text-black font-bold uppercase text-xs mb-2 tracking-widest">Professional Summary</label>
                    <textarea 
                        value={portfolioData.professional_summary || ''} 
                        onChange={(e) => handleChange(e, 'professional_summary')} 
                        className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:ring-0 h-40 font-medium leading-relaxed" 
                    />
                </div>

                <div className="mb-8">
                    <label className="block text-black font-bold uppercase text-xs mb-2 tracking-widest">Skills (comma separated)</label>
                    <input 
                        type="text" 
                        value={portfolioData.skills ? portfolioData.skills.join(', ') : ''} 
                        onChange={(e) => {
                            const val = e.target.value.split(',').map(s => s.trim());
                            setPortfolioData({ ...portfolioData, skills: val });
                        }} 
                        className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:ring-0 font-mono text-sm" 
                    />
                </div>

                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="w-full bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                >
                    {saving ? 'COMMITTING...' : 'COMMIT CHANGES'}
                </button>
            </div>

            {/* Live Preview Pane */}
            <div className="border-2 border-black bg-gray-100 p-0 overflow-y-auto relative">
                <div className="sticky top-0 bg-black text-white text-xs font-black uppercase tracking-widest py-2 text-center z-10">
                    Live Render: {template}
                </div>
                
                {/* Template Previews */}
                <div className="bg-white min-h-full">
                    {template === 'modern' && (
                        <div className="p-12 border-8 border-white">
                            <div className="border-4 border-black p-10 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <h1 className="text-6xl font-black text-black mb-4 uppercase tracking-tighter leading-none">{portfolioData.full_name}</h1>
                                <p className="text-xl font-bold border-l-4 border-black pl-4 mb-10 text-gray-700">{portfolioData.professional_summary}</p>
                                <div className="flex flex-wrap gap-3">
                                    {portfolioData.skills && portfolioData.skills.map((skill, i) => (
                                        <span key={i} className="border-2 border-black px-4 py-2 text-sm font-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors cursor-default">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {template === 'professional' && (
                        <div className="p-12 font-mono">
                            <div className="border-b-2 border-black pb-6 mb-8 text-center">
                                <h1 className="text-4xl font-bold text-black uppercase tracking-widest mb-2">{portfolioData.full_name}</h1>
                                <p className="text-gray-500 text-sm">{portfolioData.email} {portfolioData.location && `| ${portfolioData.location}`}</p>
                            </div>
                            <h3 className="text-lg font-bold uppercase tracking-widest mb-4 bg-black text-white inline-block px-2 py-1">Profile</h3>
                            <p className="text-gray-800 leading-relaxed mb-10 text-sm">{portfolioData.professional_summary}</p>
                            
                            <h3 className="text-lg font-bold uppercase tracking-widest mb-4 bg-black text-white inline-block px-2 py-1">Core Competencies</h3>
                            <ul className="list-disc list-inside text-sm text-gray-800 columns-2">
                                {portfolioData.skills && portfolioData.skills.map((skill, i) => (
                                    <li key={i} className="mb-2">{skill}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {template === 'minimal' && (
                        <div className="max-w-2xl mx-auto py-20 px-10">
                            <h1 className="text-3xl font-light mb-12 text-black tracking-wide">{portfolioData.full_name}</h1>
                            <p className="text-gray-900 mb-16 text-lg font-light leading-loose">{portfolioData.professional_summary}</p>
                            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-6">Expertise</h3>
                            <p className="text-black font-medium leading-loose">
                                {portfolioData.skills?.join('  /  ')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
