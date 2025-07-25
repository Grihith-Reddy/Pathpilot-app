'use client';

import { FC, useEffect, useState, ReactNode } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { FaGithub, FaLinkedin, FaLightbulb, FaCheckCircle } from 'react-icons/fa';
import { FiTarget } from 'react-icons/fi';
import { GoGoal } from "react-icons/go";
import { useAuth } from '@/lib/authContext';
import Link from 'next/link';

interface DashboardData {
    userScore: number;
    roadmapSteps: { text: string; completed: boolean }[];
    githubReview: { repo: string; feedback: string };
    linkedinReview: string;
    excelAt: string[];
}

// --- NEW: Reusable Dashboard Card Component ---
interface DashboardCardProps {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    className?: string;
}
const DashboardCard: FC<DashboardCardProps> = ({ title, icon, children, className = '' }) => {
    return (
        <div className={`bg-[#111119]/50 backdrop-blur-lg p-6 rounded-2xl border border-gray-800 shadow-lg ${className}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className="text-indigo-400 text-2xl">{icon}</div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>
            <div>{children}</div>
        </div>
    );
};


const VerticalRoadmap = ({ steps }: { steps: { text: string; completed: boolean }[] }) => {
    return (
        <div className="relative pl-8 mt-4">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-700"></div>
            <div className="space-y-8">
                {(steps || []).map((step, index) => (
                    <div key={index} className="relative">
                        <div className="absolute -left-1.5 top-1.5">{step.completed ? <FaCheckCircle className="h-7 w-7 text-green-500 bg-gray-900 rounded-full" /> : <div className="h-7 w-7 rounded-full bg-gray-800 border-2 border-indigo-500 flex items-center justify-center"><div className="h-3 w-3 rounded-full bg-indigo-500"></div></div>}</div>
                        <div className={`ml-8 p-4 rounded-lg ${step.completed ? 'bg-gray-800/50 text-gray-500' : 'bg-gray-800'}`}><p className={`font-medium ${step.completed ? 'line-through' : 'text-white'}`}>{step.text}</p></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DashboardPage: FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        const savedData = sessionStorage.getItem('pathpilotDashboardData');
        if (savedData) setData(JSON.parse(savedData));
        setDataLoading(false);
    }, []);

    if (dataLoading || authLoading) return <div className="flex min-h-screen items-center justify-center pt-24"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div></div>;
    
    if (!data) return <div className="flex min-h-screen flex-col items-center justify-center text-white pt-24"><h2 className="text-2xl font-bold mb-4">No analysis data found.</h2><p className="text-gray-400">Please go back to the home page and generate your roadmap.</p><Link href="/" className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg">Go Home</Link></div>;

    const chartData = [{ name: 'score', value: data.userScore, fill: '#8884d8' }];

    return (
        <div className="p-4 sm:p-6 lg:p-8 text-white pt-28">
            <div className="max-w-7xl mx-auto">
                <br />
                <br />
                <br />
                <header className="mb-8">
                    <h1 className="text-5xl font-bold text-white">
                        Welcome, {user?.displayName}!
                    </h1>
                </header>
                {/* --- MODIFIED: Using the new DashboardCard component for all sections --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DashboardCard title="Your Personalized Roadmap" icon={<GoGoal />} className="lg:col-span-2">
                        <VerticalRoadmap steps={data.roadmapSteps} />
                    </DashboardCard>

                    <div className="space-y-6">
                        <DashboardCard title="Career Skill Score" icon={<FiTarget />}>
                            <div className="w-48 h-48 mx-auto"><ResponsiveContainer width="100%" height="100%"><RadialBarChart innerRadius="70%" outerRadius="100%" data={chartData} startAngle={90} endAngle={-270} barSize={20}><PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} /><RadialBar background dataKey='value' cornerRadius={10} /><text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-4xl font-bold">{data.userScore}</text><text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-400 text-sm">/ 100</text></RadialBarChart></ResponsiveContainer></div>
                        </DashboardCard>
                        <DashboardCard title="You would Excel At..." icon={<FaLightbulb />}>
                            <div className="flex flex-wrap gap-2 justify-center pt-2">{(data.excelAt || []).map(skill => (<span key={skill} className="bg-indigo-500/20 text-indigo-300 py-1 px-3 rounded-full text-sm font-medium">{skill}</span>))}</div>
                        </DashboardCard>
                    </div>

                    <DashboardCard title="GitHub Repo Review" icon={<FaGithub />} className="lg:col-span-3 lg:col-start-1 md:col-span-1">
                         <p className="font-mono text-sm text-gray-300 pt-2"><span className="font-bold text-white">{data.githubReview?.repo}:</span> {data.githubReview?.feedback}</p>
                    </DashboardCard>

                    <DashboardCard title="LinkedIn Improvements" icon={<FaLinkedin />} className="lg:col-span-3 md:col-span-1">
                        <p className="text-sm text-gray-300 pt-2">{data.linkedinReview}</p>
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
};
export default DashboardPage;
