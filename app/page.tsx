'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/firebase/auth-context';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to the dashboard
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Custom cursor animation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const animateCursor = () => {
      setCursorPosition(prev => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.15,
        y: prev.y + (mousePosition.y - prev.y) * 0.15
      }));
      requestAnimationFrame(animateCursor);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animateCursor();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mousePosition]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A1A2F' }}>
        <div className="text-center space-y-4">
          <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-8 w-8 animate-spin" style={{ color: '#0052CC' }} />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: '#0A1A2F', color: '#FFFFFF' }}>
        {/* Custom Cursor */}
        <div 
          className="fixed w-5 h-5 border-2 rounded-full pointer-events-none z-50 transition-transform duration-150 mix-blend-difference"
          style={{ 
            borderColor: 'rgba(0, 82, 204, 0.8)',
            left: cursorPosition.x - 10,
            top: cursorPosition.y - 10
          }}
        />
        <div 
          className="fixed w-1 h-1 rounded-full pointer-events-none z-50 shadow-lg"
          style={{ 
            background: 'linear-gradient(135deg, #0052CC, #00B8D9)',
            boxShadow: '0 0 20px rgba(0, 82, 204, 0.8)',
            left: mousePosition.x - 2,
            top: mousePosition.y - 2
          }}
        />

        {/* Animated Background */}
        <div 
          className="fixed top-0 left-0 w-full h-full z-0 opacity-15"
          style={{
            background: 'linear-gradient(135deg, #0052CC 0%, #6554C0 25%, #00B8D9 50%, #0052CC 75%, #6554C0 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite'
          }}
        />

        {/* Navigation */}
        <nav className="fixed top-0 w-full px-4 sm:px-5 py-4 sm:py-6 flex justify-between items-center z-40 backdrop-blur-md" style={{ background: 'rgba(10, 26, 47, 0.7)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="flex items-center transition-transform duration-300 hover:scale-105">
            <img src="/logos/Gravyty_logo_All White.svg" alt="Gravyty Logo" className="h-8 sm:h-10 md:h-12 w-auto" />
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center text-center px-4 sm:px-6 md:px-8 z-10 pt-16 sm:pt-20">
          <div className="max-w-4xl animate-fade-in-up">
            <h1 
              className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 leading-tight"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #0052CC 50%, #00B8D9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Gravyty Labs
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 font-normal tracking-wide" style={{ color: '#6C757D' }}>
              Innovation in Motion
            </p>
            <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 font-light max-w-4xl mx-auto leading-relaxed px-2" style={{ color: '#6C757D' }}>
              Pushing the boundaries of technology to create solutions that matter. Experience the future of digital innovation with Gravyty Labs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Link href="/login" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'linear-gradient(135deg, #0052CC 0%, #6554C0 100%)',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(0, 82, 204, 0.4)'
                  }}
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/signup" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full transition-all duration-300 hover:-translate-y-1 backdrop-blur-md"
                  style={{
                    background: 'transparent',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>


        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-float-particle pointer-events-none"
            style={{
              background: 'rgba(0, 82, 204, 0.5)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`
            }}
          />
        ))}

        <style jsx>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float-particle {
            0%, 100% {
              transform: translate(0, 0);
              opacity: 0;
            }
            10%, 90% {
              opacity: 1;
            }
            50% {
              transform: translate(100vw, -100vh);
            }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 1s ease;
          }
          
          .animate-float-particle {
            animation: float-particle 20s infinite;
          }
        `}</style>
      </div>
    );
  }

  // This should not render for authenticated users due to the redirect above
  // But keeping as fallback
  return null;
}
