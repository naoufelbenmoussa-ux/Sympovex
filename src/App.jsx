import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import DashboardHub from './pages/DashboardHub';
import PortalPage from './pages/PortalPage';
import ProfilePage from './pages/ProfilePage';

function AppContent() {
  const { currentConference } = useDatabase();
  const [currentView, setCurrentView] = useState('portal'); // 'portal', 'landing', 'profile' or 'dashboard'

  // Sync hash routing if present
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const cleanHash = hash.replace(/^#\/?/, '');
      const parts = cleanHash.split('/').filter(Boolean);
      if (parts.length === 0) {
        setCurrentView('portal');
      } else if (parts[1] === 'dashboard') {
        setCurrentView('dashboard');
      } else if (parts[0] === 'profile' || parts[1] === 'profile') {
        setCurrentView('profile');
      } else {
        setCurrentView('landing');
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Init load
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash route when toggling views
  const setViewAndHash = (view) => {
    setCurrentView(view);
    const cleanHash = window.location.hash.replace(/^#\/?/, '');
    const parts = cleanHash.split('/').filter(Boolean);
    const acronym = parts[0];
    if (view === 'portal') {
      window.location.hash = '#/';
    } else if (view === 'dashboard') {
      window.location.hash = `#/${acronym || 'gacs2026'}/dashboard`;
    } else if (view === 'profile') {
      window.location.hash = `#/${acronym || 'gacs2026'}/profile`;
    } else {
      window.location.hash = `#/${acronym || 'gacs2026'}`;
    }
  };

  // Inject active conference colors dynamically into CSS :root properties
  const dynamicStyles = `
    :root {
      --color-primary: ${currentConference?.colors?.primary || '#6366f1'};
      --color-secondary: ${currentConference?.colors?.secondary || '#4f46e5'};
      --color-accent: ${currentConference?.colors?.accent || '#f59e0b'};
      --color-primary-rgb: ${hexToRgb(currentConference?.colors?.primary || '#6366f1')};
    }
    
    /* Global brand style adjustments */
    .bg-primary { background-color: var(--color-primary) !important; }
    .text-primary { color: var(--color-primary) !important; }
    .border-primary { border-color: var(--color-primary) !important; }
    .hover\\:bg-secondary:hover { background-color: var(--color-secondary) !important; }
    .ring-primary\\/20 { --tw-ring-color: rgba(var(--color-primary-rgb), 0.2) !important; }
    .ring-primary\\/30 { --tw-ring-color: rgba(var(--color-primary-rgb), 0.3) !important; }
    .bg-primary\\/10 { background-color: rgba(var(--color-primary-rgb), 0.1) !important; }
  `;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      <style>{dynamicStyles}</style>
      
      {/* Header Panel */}
      <Header currentView={currentView} setCurrentView={setViewAndHash} />

      {/* Main View Router */}
      <div className="flex-grow">
        {currentView === 'portal' ? (
          <PortalPage />
        ) : currentView === 'landing' ? (
          <LandingPage />
        ) : currentView === 'profile' ? (
          <ProfilePage onBack={() => setViewAndHash('dashboard')} />
        ) : (
          <DashboardHub />
        )}
      </div>
    </div>
  );
}

// Simple Helper to parse Hex to RGB triplets for utility opacity configurations
function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '99, 102, 241';
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DatabaseProvider>
          <AppContent />
        </DatabaseProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
