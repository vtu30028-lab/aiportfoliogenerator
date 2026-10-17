import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function JobAnalyzer() {
    const { user } = useContext(AuthContext);
    const [jobDescription, setJobDescription] = useState('');
    const [userSkills, setUserSkills] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAnalyze = async () => {
        if (!jobDescription.trim()) {
            setError('Please paste a job description.');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/job/analyze', {
                job_description: jobDescription,
                user_skills: userSkills
            });
            setAnalysis(res.data.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error analyzing job description. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTransferToEditor = () => {
        if (!analysis) return;
        const matched = analysis.matching_skills || [];
        const existingData = localStorage.getItem('parsedResume');
        let profile = {};
        if (existingData) {
            try {
                profile = JSON.parse(existingData);
            } catch (e) {}
        }
        const currentData = profile.data || {};
        const mergedSkills = Array.from(new Set([...(currentData.skills || []), ...matched]));
        
        const updated = {
            data: {
                ...currentData,
                skills: mergedSkills,
                full_name: currentData.full_name || (user?.username ? user.username.toUpperCase() : "PORTFOLIO OWNER")
            }
        };
        localStorage.setItem('parsedResume', JSON.stringify(updated));
        navigate('/editor');
    };

    return (
        <div className="container mx-auto p-6 md:p-10 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-6 mb-10">
                <div>
                    <span className="text-xs font-black tracking-widest text-gray-500 uppercase">AI Career Intelligence</span>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mt-1">Job Description Analyzer</h1>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link to="/dashboard" className="border-2 border-black px-6 py-2.5 font-bold uppercase tracking-wider text-xs hover:bg-black hover:text-white transition-colors">
                        ← Dashboard
                    </Link>
                </div>
            </div>
            
            {error && (
                <div className="bg-black text-white p-3 mb-6 font-bold text-xs uppercase tracking-wide">
                    [ERROR]: {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Input Column */}
                <div className="lg:col-span-6 border-2 border-black p-8 bg-white">
                    <label className="block text-black font-black uppercase text-xs mb-2 tracking-widest">
                        1. Paste Job Posting
                    </label>
                    <textarea 
                        value={jobDescription} 
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full p-4 border-2 border-black h-56 focus:outline-none font-mono text-xs leading-relaxed"
                        placeholder="Paste requirements, job description, or company responsibilities..."
                    />
                    
                    <label className="block text-black font-black uppercase text-xs mt-6 mb-2 tracking-widest">
                        2. Your Current Skills (Comma Separated)
                    </label>
                    <input 
                        type="text" 
                        value={userSkills} 
                        onChange={(e) => setUserSkills(e.target.value)}
                        className="w-full p-3 border-2 border-black focus:outline-none font-mono text-xs"
                        placeholder="e.g. React, Node.js, Python, PostgreSQL, Docker"
                    />
                    
                    <button 
                        onClick={handleAnalyze} 
                        disabled={loading || !jobDescription.trim()}
                        className={`w-full py-4 font-black uppercase tracking-widest text-xs mt-6 transition-all ${
                            loading 
                                ? 'bg-gray-300 text-gray-600 cursor-wait' 
                                : !jobDescription.trim()
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-black text-white hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                    >
                        {loading ? 'AI MODEL ANALYZING REQUIREMENTS...' : 'ANALYZE SKILL GAP WITH AI'}
                    </button>
                    <p className="text-[10px] text-gray-400 mt-4 text-center font-bold uppercase tracking-wider">
                        * Automated analysis does not predict or guarantee employment outcomes.
                    </p>
                </div>

                {/* Results Column */}
                <div className="lg:col-span-6 border-2 border-black p-8 bg-black text-white">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-3">
                        <h2 className="text-xl font-black uppercase tracking-wider">AI Skill Match Report</h2>
                        <span className="text-[10px] font-mono text-gray-400">
                            {analysis ? 'STATUS: COMPLETE' : 'STATUS: WAITING'}
                        </span>
                    </div>

                    {!analysis ? (
                        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-gray-800 text-center p-6">
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2">
                                NO ANALYSIS RUN
                            </p>
                            <p className="text-gray-600 text-[11px] max-w-xs font-mono">
                                Enter a job description on the left to identify matched skills, missing competencies, and learning recommendations.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Matching Skills */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-black text-white uppercase tracking-wider text-xs">
                                        Matching Competencies
                                    </h3>
                                    <span className="text-[10px] font-mono bg-white text-black px-1.5 font-bold">
                                        {analysis.matching_skills?.length || 0} FOUND
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.matching_skills && analysis.matching_skills.length > 0 ? (
                                        analysis.matching_skills.map((skill, i) => (
                                            <span key={i} className="bg-white text-black px-3 py-1 text-xs font-black uppercase tracking-wider">
                                                ✓ {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-500 font-mono">None identified from provided list.</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Missing Skills */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-black text-white uppercase tracking-wider text-xs">
                                        Missing / Required Skills
                                    </h3>
                                    <span className="text-[10px] font-mono border border-gray-600 text-gray-300 px-1.5 font-bold">
                                        {analysis.missing_skills?.length || 0} GAPS
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.missing_skills && analysis.missing_skills.length > 0 ? (
                                        analysis.missing_skills.map((skill, i) => (
                                            <span key={i} className="border border-gray-700 text-gray-300 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                                                + {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-500 font-mono">No significant skill gaps identified.</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* AI Suggestions */}
                            <div className="border-t border-gray-800 pt-4">
                                <h3 className="font-black text-white uppercase tracking-wider text-xs mb-2">
                                    Strategic Recommendation
                                </h3>
                                <p className="text-gray-300 text-xs leading-relaxed font-mono bg-neutral-950 p-4 border border-gray-800">
                                    {analysis.suggestions || "Focus on building proof-of-work projects covering the key required technologies."}
                                </p>
                            </div>

                            <button
                                onClick={handleTransferToEditor}
                                className="w-full bg-white text-black py-3 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                            >
                                Apply Skills to Portfolio Editor →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
