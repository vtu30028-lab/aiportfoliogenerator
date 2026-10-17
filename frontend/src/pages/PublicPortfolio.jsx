import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function PublicPortfolio() {
    const { slug } = useParams();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:5000/api/portfolio/${slug}`);
                setPortfolio(res.data);
            } catch (err) {
                console.error('Fetch public portfolio error:', err);
                setError('Portfolio not found or unavailable.');
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white font-mono text-sm font-bold uppercase tracking-widest">
                [LOADING PUBLISHED PORTFOLIO...]
            </div>
        );
    }

    if (error || !portfolio) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <div className="border-4 border-black p-12 max-w-md text-center">
                    <h1 className="text-3xl font-black uppercase mb-4 tracking-tighter">404 NOT FOUND</h1>
                    <p className="text-xs font-mono text-gray-600 mb-8">{error || 'This portfolio does not exist.'}</p>
                    <Link to="/" className="bg-black text-white px-6 py-3 font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const { template } = portfolio.portfolio || { template: 'modern' };
    const data = portfolio.data || {};

    return (
        <div className="min-h-screen bg-white">
            {/* Top Bar for Visitors */}
            <div className="border-b-2 border-black bg-black text-white py-2 px-6 flex justify-between items-center text-xs font-mono print:hidden">
                <Link to="/" className="font-bold tracking-widest uppercase hover:underline">
                    ← AI Portfolio Generator
                </Link>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.print()}
                        className="bg-white text-black px-3 py-1 font-bold uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-colors"
                    >
                        Download PDF / Print
                    </button>
                </div>
            </div>

            {/* Template Render */}
            <div className="container mx-auto py-12 px-6 max-w-4xl">
                {template === 'modern' && (
                    <div className="space-y-12">
                        <div className="border-4 border-black p-10 md:p-14 bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                            <h1 className="text-5xl md:text-7xl font-black text-black uppercase tracking-tighter">
                                {data.full_name || 'CANDIDATE'}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-600 mt-4 border-b-2 border-black pb-4">
                                {data.email && <span>{data.email}</span>}
                                {data.phone && <span>• {data.phone}</span>}
                                {data.location && <span>• {data.location}</span>}
                            </div>
                            
                            <p className="text-lg md:text-xl font-bold border-l-4 border-black pl-6 my-8 text-gray-800 leading-relaxed">
                                {data.professional_summary}
                            </p>

                            {data.skills && data.skills.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-black mb-4">Core Competencies</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {data.skills.map((skill, i) => (
                                            <span key={i} className="border-2 border-black px-4 py-1.5 text-xs font-black uppercase tracking-wider bg-white hover:bg-black hover:text-white transition-colors">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 mt-8 pt-6 border-t-2 border-black">
                                {data.github_url && (
                                    <a href={data.github_url} target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-widest underline hover:text-gray-600">
                                        GitHub Profile ↗
                                    </a>
                                )}
                                {data.linkedin_url && (
                                    <a href={data.linkedin_url} target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-widest underline hover:text-gray-600">
                                        LinkedIn Profile ↗
                                    </a>
                                )}
                            </div>
                        </div>

                        {data.experience && data.experience.length > 0 && (
                            <div className="border-2 border-black p-8 bg-white">
                                <h2 className="text-2xl font-black uppercase tracking-wider mb-6 border-b-2 border-black pb-3">Professional Experience</h2>
                                <div className="space-y-6">
                                    {data.experience.map((exp, i) => (
                                        <div key={i} className="border-l-2 border-black pl-4">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                                                <h3 className="font-black text-lg text-black">{exp.role}</h3>
                                                <span className="text-xs font-bold text-gray-500 uppercase">{exp.company}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.projects && data.projects.length > 0 && (
                            <div className="border-2 border-black p-8 bg-white">
                                <h2 className="text-2xl font-black uppercase tracking-wider mb-6 border-b-2 border-black pb-3">Featured Projects</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {data.projects.map((proj, i) => (
                                        <div key={i} className="border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <h3 className="font-black text-base text-black uppercase">{proj.title}</h3>
                                            <p className="text-xs text-gray-700 mt-2 leading-relaxed">{proj.description}</p>
                                            {proj.technologies && proj.technologies.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-4">
                                                    {proj.technologies.map((t, j) => (
                                                        <span key={j} className="text-[10px] font-mono border border-black px-1.5 py-0.5">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {template === 'professional' && (
                    <div className="font-mono text-sm space-y-10">
                        <div className="border-b-4 border-black pb-8 text-center">
                            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest text-black">{data.full_name}</h1>
                            <p className="text-xs text-gray-600 mt-3 font-medium">
                                {data.email} {data.phone && `| ${data.phone}`} {data.location && `| ${data.location}`}
                            </p>
                            <div className="flex justify-center gap-6 mt-4 text-xs font-bold">
                                {data.github_url && <a href={data.github_url} className="underline" target="_blank" rel="noreferrer">GitHub</a>}
                                {data.linkedin_url && <a href={data.linkedin_url} className="underline" target="_blank" rel="noreferrer">LinkedIn</a>}
                            </div>
                        </div>

                        <div>
                            <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">Executive Profile</span>
                            <p className="mt-4 text-sm leading-relaxed text-gray-800">{data.professional_summary}</p>
                        </div>

                        {data.skills && data.skills.length > 0 && (
                            <div>
                                <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">Core Technical Competencies</span>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {data.skills.map((s, i) => (
                                        <span key={i} className="border border-black px-2 py-1 text-xs font-bold">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.experience && data.experience.length > 0 && (
                            <div>
                                <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">Experience History</span>
                                <div className="mt-6 space-y-6">
                                    {data.experience.map((exp, i) => (
                                        <div key={i} className="border-b border-gray-300 pb-4">
                                            <div className="flex justify-between font-bold">
                                                <span>{exp.role}</span>
                                                <span className="text-gray-500">{exp.company}</span>
                                            </div>
                                            <p className="text-xs text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {template === 'minimal' && (
                    <div className="py-16 px-4 max-w-2xl mx-auto space-y-16">
                        <div>
                            <h1 className="text-4xl font-light tracking-wide text-black">{data.full_name}</h1>
                            <p className="text-xs text-gray-500 mt-2 tracking-widest uppercase">
                                {data.email} • {data.location}
                            </p>
                        </div>

                        <p className="text-base font-light text-gray-900 leading-loose">
                            {data.professional_summary}
                        </p>

                        {data.skills && data.skills.length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-4">Areas of Expertise</h3>
                                <p className="text-sm text-black font-medium leading-loose">
                                    {data.skills.join('  /  ')}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-6 text-xs font-light text-gray-500 border-t border-gray-200 pt-8">
                            {data.github_url && <a href={data.github_url} target="_blank" rel="noreferrer" className="underline hover:text-black">GitHub</a>}
                            {data.linkedin_url && <a href={data.linkedin_url} target="_blank" rel="noreferrer" className="underline hover:text-black">LinkedIn</a>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
