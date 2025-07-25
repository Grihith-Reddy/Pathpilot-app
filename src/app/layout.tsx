'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider, useAuth } from '@/lib/authContext';
import { FaRocket, FaSync } from 'react-icons/fa';
import Lightning from '@/components/Lightning';

const inter = Inter({ subsets: ['latin'] });

const Header = () => {
    const { user } = useAuth();
    return (
        <header className="bg-gray-950/50 backdrop-blur-lg border border-gray-800 rounded-full">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <a href="/" className="flex items-center space-x-2">
                             <FaRocket className="h-8 w-8 text-indigo-500" />
                             <span className="text-xl font-bold text-white">PathPilot</span>
                        </a>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="hidden md:flex items-baseline space-x-4">
                            <a href="/#about-us" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">About</a>
                            <a href="/dashboard" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                            <a href="/" className="flex items-center text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                <FaSync className="mr-2" />
                                Regenerate
                            </a>
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        {user ? (
                            <div className="flex items-center space-x-3">
                                <span className="text-white text-sm font-medium hidden sm:block">{user.displayName}</span>
                                {/* --- MODIFIED: Replaced Avatar with a static image --- */}
                                <img className="h-8 w-8 rounded-full" src="/Profile-pic.jpg" alt="User profile" />
                            </div>
                        ) : (
                             <a href="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Login</a>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
        <head>
            <title>PathPilot AI</title>
            <link rel="icon" href="/favicon.ico" />
        </head>
      <body className={`${inter.className} bg-black min-h-screen`}>
        <AuthProvider>
            <Lightning hue={240} speed={0.5} intensity={0.8} size={0.8} />
            <div className="relative z-10">
                <div className="p-4 fixed top-0 left-0 right-0 z-50">
                    <Header />
                </div>
                <main>{children}</main>
            </div>
        </AuthProvider>
      </body>
    </html>
  )
}