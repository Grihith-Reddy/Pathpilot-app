'use client';

import { useState, FC, ChangeEvent, useEffect, useMemo } from 'react';
import { signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaLinkedin, FaFilePdf, FaCheckCircle, FaFileAlt, FaRocket } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import CurvedLoop from '@/components/CurvedLoop';
import MatrixAnimation from '@/components/MatrixAnimation';

const LoadingAnalysis: FC = () => {
    const messages = ["Connecting to AI model...","Parsing your resume...","Analyzing LinkedIn profile...", "Fetching your GitHub repositories...", "Sending profile data for analysis...", "Compiling skill matrix...", "Generating personalized feedback...", "Building your career roadmap...", "Finalizing recommendations..."];
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    useEffect(() => { const interval = setInterval(() => { setCurrentMessageIndex(prev => (prev + 1) % messages.length); }, 1500); return () => clearInterval(interval); }, [messages.length]);
    return <div className="fixed inset-0 bg-black flex items-center justify-center z-50"><MatrixAnimation /><div className="w-full max-w-md mx-auto text-center p-8 bg-black/50 backdrop-blur-sm rounded-2xl border border-gray-800"><div className="animate-pulse text-5xl mb-6">🧠</div><h2 className="text-2xl font-bold text-white mb-4">AI Analysis in Progress</h2><p className="text-gray-400 mb-6">PathPilot is building your personalized career roadmap...</p><div className="bg-gray-900 rounded-lg p-4 text-left font-mono text-sm text-green-400 h-32 overflow-hidden relative">{messages.map((msg, index) => (<p key={index} className={`transition-all duration-500 ease-in-out absolute inset-0 ${index === currentMessageIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}><span className="text-green-500">&gt;</span> {msg}</p>))}</div></div></div>;
};

const Onboarding: FC = () => {
    const { user } = useAuth();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [githubLogin, setGithubLogin] = useState<string | null>(null);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const router = useRouter();

    const isLinkedinValid = useMemo(() => { const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/; return linkedinRegex.test(linkedinUrl); }, [linkedinUrl]);
    useEffect(() => { const queryParams = new URLSearchParams(window.location.search); const githubSuccess = queryParams.get('github') === 'success'; const login = queryParams.get('login'); const token = queryParams.get('token'); if (githubSuccess && login && token) { setGithubLogin(login); sessionStorage.setItem('githubLogin', login); sessionStorage.setItem('githubToken', token); window.history.replaceState({}, document.title, "/"); } else { const storedLogin = sessionStorage.getItem('githubLogin'); if (storedLogin) setGithubLogin(storedLogin); } }, []);
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) setResumeFile(e.target.files[0]); };
    const handleStartAnalysis = async () => { if (!githubLogin) { alert("Please connect your GitHub account first."); return; } if (!isLinkedinValid) { alert("Please enter a valid LinkedIn profile URL."); return; } if (!resumeFile) { alert("Please upload your resume to continue."); return; } const githubToken = sessionStorage.getItem('githubToken'); if (!githubToken) { alert("GitHub connection error. Please try connecting again."); return; } setIsAnalyzing(true); try { const formData = new FormData(); formData.append('linkedinUrl', linkedinUrl); formData.append('githubLogin', githubLogin); formData.append('resume', resumeFile); formData.append('githubToken', githubToken); const response = await fetch('http://localhost:8000/api/analyze', { method: 'POST', body: formData }); if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); const data = await response.json(); sessionStorage.setItem('pathpilotDashboardData', JSON.stringify(data)); router.push('/dashboard'); } catch (error) { console.error("Failed to fetch from backend:", error); alert('Error: Could not get a response from the AI. Check the backend console.'); setIsAnalyzing(false); } };

    if (isAnalyzing) return <LoadingAnalysis />;
    if (!user) return null;

    return (
        <div className="w-full max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="text-center md:text-left">
                {/* --- MODIFIED: Replaced Avatar with a static image --- */}
                <img src="/Profile-pic.jpg" alt="User" className="w-32 h-32 rounded-full mx-auto md:mx-0 mb-6 border-4 border-gray-700"/>
                <h2 className="text-5xl font-bold text-white mb-4">
                    Welcome, <span className="text-indigo-500">{user.displayName}!</span>
                </h2>
            </div>
            <div className="w-full max-w-md mx-auto">
                 <div className="space-y-4 text-left bg-black/20 backdrop-blur-sm p-8 rounded-2xl border border-gray-800">
                    {githubLogin ? (<div className="w-full bg-green-900/50 text-green-300 font-bold py-3 px-4 rounded-lg flex items-center justify-center"><FaCheckCircle className="mr-3 text-xl" /> GitHub Connected: {githubLogin}</div>) : (<a href="http://localhost:8000/api/github/connect" className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"><FaGithub className="mr-3 text-2xl" /> Connect GitHub Account</a>)}
                    <div className="w-full bg-gray-800 text-white rounded-lg flex items-center px-4">
                        <FaLinkedin className="mr-3 text-2xl text-blue-500" />
                        <input type="text" placeholder="Paste your LinkedIn Profile URL" className="w-full bg-transparent py-3 focus:outline-none" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
                        {isLinkedinValid && <FaCheckCircle className="text-green-500 text-xl" />}
                    </div>
                    <label htmlFor="resume-upload" className="w-full bg-gray-800 text-gray-400 rounded-lg flex items-center justify-center px-4 py-10 border-2 border-dashed border-gray-600 cursor-pointer hover:border-indigo-500 hover:bg-gray-700/50 transition-colors"><input id="resume-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />{resumeFile ? (<div className="text-center text-green-400"><FaFileAlt className="mx-auto text-4xl mb-2"/><p className="font-bold">{resumeFile.name}</p><p className="text-xs mt-1">Ready to be analyzed!</p></div>) : (<div className="text-center"><FaFilePdf className="mx-auto text-4xl mb-2"/><p>Drag & Drop or <span className="text-indigo-400 font-semibold">browse</span> to upload Resume</p><p className="text-xs mt-1">(PDF only, up to 5MB)</p></div>)}</label>
                    <button onClick={handleStartAnalysis} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={!githubLogin || !resumeFile}>Generate My Career Roadmap</button>
                    <button onClick={() => { signOut(auth); sessionStorage.clear(); }} className="w-full text-sm text-gray-500 hover:text-gray-300 pt-2">Sign Out</button>
                </div>
            </div>
        </div>
    );
};

const Login: FC = () => {
    const handleGoogleLogin = async () => { const provider = new GoogleAuthProvider(); try { await signInWithPopup(auth, provider); } catch (error) { console.error("Error signing in with Google: ", error); } };
    return <div className="w-full max-w-sm mx-auto text-center p-8"><h1 className="text-4xl font-bold text-white mb-2">PathPilot 🚀</h1><p className="text-gray-400 mb-8">Your AI career coach for the tech world.</p><button onClick={handleGoogleLogin} className="w-full bg-white text-gray-800 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-transform transform hover:scale-105"><FcGoogle className="mr-3 text-2xl" />Continue with Google</button><div className="my-6 flex items-center"><div className="flex-grow border-t border-gray-700"></div><span className="flex-shrink mx-4 text-gray-500">or</span><div className="flex-grow border-t border-gray-700"></div></div><form className="space-y-4" onSubmit={(e) => e.preventDefault()}><input type="email" placeholder="Email address" className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/><button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg">Continue with Email</button></form><p className="text-xs text-gray-600 mt-6">"You don’t need an uncle in tech to make it."</p></div>;
};

const AboutUs = () => {
    return (
        <section id="about-us" className="py-20 text-white">
                            <CurvedLoop marqueeText="Let's build your future, one commit at a time." curveAmount={50} />

            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-black/20 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-gray-800 text-center">
                    <FaRocket className="h-16 w-16 text-indigo-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4">What is PathPilot?</h2>
                    <p className="text-lg text-gray-300 leading-relaxed">
                        PathPilot is your personal AI career coach, designed specifically for Gen Z students navigating the often-confusing world of tech. We believe that everyone deserves clear, actionable guidance, regardless of their background or connections. By analyzing your real-world skills from GitHub, LinkedIn, and your resume, PathPilot cuts through the noise to give you a personalized, step-by-step roadmap to success. No more guessing, just a clear path forward.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default function Home() {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex min-h-screen flex-col items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div></div>;
    return <div className="text-white font-sans"><div className="min-h-screen flex flex-col items-center justify-center pt-24">{user ? <Onboarding /> : <Login />}</div><AboutUs /></div>;
}
