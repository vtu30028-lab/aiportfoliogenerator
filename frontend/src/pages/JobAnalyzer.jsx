import { useState } from 'react';
import axios from 'axios';

export default function JobAnalyzer() {
    const [jobDescription, setJobDescription] = useState('');
    const [userSkills, setUserSkills] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/job/analyze', {
                job_description: jobDescription,
                user_skills: userSkills
            });
            setAnalysis(res.data.data);
        } catch (err) {
            console.error(err);
            alert('Error analyzing job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-10 max-w-6xl">
            <h1 className="text-4xl font-black mb-10 uppercase tracking-tighter border-b-4 border-black pb-4">Job Analyzer</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <label className="block text-black font-bold uppercase text-sm mb-3 tracking-wider">Paste Job Description</label>
                    <textarea 
                        value={jobDescription} 
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full p-4 border-2 border-black h-64 focus:outline-none focus:ring-0 font-mono text-sm"
                        placeholder="INPUT JOB DESCRIPTION HERE..."
                    />
                    
                    <label className="block text-black font-bold uppercase text-sm mt-8 mb-3 tracking-wider">Your Skills (Comma Separated)</label>
                    <input 
                        type="text" 
                        value={userSkills} 
                        onChange={(e) => setUserSkills(e.target.value)}
                        className="w-full p-4 border-2 border-black focus:outline-none focus:ring-0 font-mono text-sm"
                        placeholder="E.G. REACT, NODE.JS, PYTHON"
                    />
                    
                    <button 
                        onClick={handleAnalyze} 
                        disabled={loading || !jobDescription}
                        className="w-full bg-black text-white py-4 font-black uppercase tracking-widest mt-8 hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
                    >
                        {loading ? 'Analyzing...' : 'Analyze Skills Match'}
                    </button>
                    <p className="text-xs text-gray-400 mt-4 text-center font-bold uppercase tracking-wider">* Analysis does not guarantee employment.</p>
                </div>

                <div className="border-2 border-black p-8 bg-gray-50">
                    <h2 className="text-2xl font-black mb-8 uppercase tracking-wider">Analysis Results</h2>
                    {!analysis ? (
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                            <p className="text-gray-400 font-bold uppercase tracking-widest">Awaiting Input...</p>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-8">
                                <h3 className="font-black text-black uppercase tracking-wider mb-4 border-b border-black pb-2">Matching Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.matching_skills?.map((skill, i) => (
                                        <span key={i} className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">{skill}</span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mb-8">
                                <h3 className="font-black text-black uppercase tracking-wider mb-4 border-b border-black pb-2">Missing Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.missing_skills?.map((skill, i) => (
                                        <span key={i} className="border-2 border-black text-black px-3 py-1 text-xs font-bold uppercase tracking-wider">{skill}</span>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-black text-black uppercase tracking-wider mb-4 border-b border-black pb-2">Strategic Advice</h3>
                                <p className="text-gray-800 leading-relaxed font-medium">{analysis.suggestions}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
