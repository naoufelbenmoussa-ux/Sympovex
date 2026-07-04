import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AuthModal from './AuthModal';
import { Shield, Sparkles, RefreshCw, LogIn, Compass, LayoutDashboard, Bell } from 'lucide-react';

export default function Header({ currentView, setCurrentView }) {
  const {
    conferences,
    currentConfId,
    setCurrentConferenceId,
    users,
    currentUserId,
    setCurrentUserId,
    currentConference,
    currentUser,
    meetings,
    resetDatabase
  } = useDatabase();

  const { session, logout, setAuthModalOpen, selectActiveRole } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const handleReset = () => {
    if (window.confirm('Reset the mock database to initial seed data?')) {
      resetDatabase();
      window.location.reload();
    }
  };

  // Filter users relevant to active conference (or Superadmin who sees everything)
  const availableUsers = users.filter(u => !u.conferenceId || u.conferenceId === currentConfId || u.role === 'Superadmin');

  // Count pending meeting requests for the logged-in user
  const pendingMeetings = (meetings && currentUser) 
    ? meetings.filter(m => m.inviteeId === currentUser.id && m.status === 'pending') 
    : [];
  const notificationCount = pendingMeetings.length;

  return (
    <header className="w-full flex flex-col border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-50 animate-in fade-in">
      {/* TESTER PANEL */}
      {currentUser?.role === 'Superadmin' && (
        <div className="bg-slate-900 text-slate-100 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-2 font-mono">
            <Shield className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="font-bold text-amber-400">SYMPOVEX MOCK SaaS PANEL:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono">
            {/* Tenant Switcher */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Tenant:</span>
              <select
                value={currentConfId}
                onChange={(e) => setCurrentConferenceId(e.target.value)}
                className="bg-slate-800 text-white font-semibold rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-amber-500 text-[11px]"
              >
                {conferences.map(c => (
                  <option key={c.id} value={c.id}>{c.name.split(' (')[0]}</option>
                ))}
              </select>
            </div>

            {/* User Impersonator */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Impersonate:</span>
              <select
                value={currentUserId || ''}
                onChange={(e) => {
                  setCurrentUserId(e.target.value || null);
                  setCurrentView('dashboard');
                }}
                className="bg-slate-800 text-white font-semibold rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-amber-500 text-[11px]"
              >
                <option value="">Guest Mode (Logged Out)</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.roles ? u.roles.join(', ') : u.role}) {u.status === 'pending' ? '[PENDING]' : u.status === 'suspended' ? '[SUSPENDED]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Colors Indicator */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 mr-1">Colors:</span>
              <span className="w-3.5 h-3.5 rounded-full border border-slate-600" style={{ backgroundColor: currentConference?.colors?.primary }} title="Primary" />
              <span className="w-3.5 h-3.5 rounded-full border border-slate-600" style={{ backgroundColor: currentConference?.colors?.secondary }} title="Secondary" />
              <span className="w-3.5 h-3.5 rounded-full border border-slate-600" style={{ backgroundColor: currentConference?.colors?.accent }} title="Accent" />
            </div>

            {/* Reset DB button */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1 bg-red-955/40 text-red-400 hover:bg-red-955 hover:text-white px-2 py-0.5 rounded border border-red-900 transition font-medium cursor-pointer text-[10px]"
              title="Wipe database modifications"
            >
              <RefreshCw className="w-3 h-3" />
              Reset DB
            </button>
          </div>
        </div>
      )}

      {/* PUBLIC NAVBAR */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Conference Logo & Name */}
        <div
          onClick={() => {
            if (currentView !== 'portal') {
              window.location.hash = '#/';
            }
          }}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          {currentView === 'portal' ? (
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold border border-indigo-500/20">
              SV
            </div>
          ) : currentConference?.logo ? (
            <img
              src={currentConference.logo}
              alt="Logo"
              className="w-10 h-10 rounded-lg object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              SV
            </div>
          )}
          <div>
            <div className="font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 leading-none text-base">
              {currentView === 'portal' ? 'Sympovex' : currentConference?.name?.split(' (')[0]}
              {currentView !== 'portal' && (
                <span className="text-[10px] font-bold text-primary hover:underline ml-2">
                  {t('viewAllCongresses') || '← All Congresses'}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-550 font-medium">
              {currentView === 'portal' ? 'Scientific Congress SaaS Portal' : currentConference?.venue?.split(', ')?.slice(-2)?.join(', ')}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        {currentView !== 'portal' && (
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
                currentView === 'landing'
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/50'
              }`}
            >
              <Compass className="w-4 h-4" />
              {t('landingPage')}
            </button>
            
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
                currentView === 'dashboard'
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {t('workspaceDashboard')}
              {notificationCount > 0 && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title={`${notificationCount} pending alerts`} />
              )}
            </button>
          </nav>
        )}

        {/* User Identity & Utility Actions */}
        <div className="flex items-center gap-3">
          
          {/* EN/FR Language Selector Toggle */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700/60 text-[10px]">
            <button
              onClick={() => setLang('fr')}
              className={`px-1.5 py-0.5 rounded font-extrabold transition cursor-pointer ${
                lang === 'fr' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-1.5 py-0.5 rounded font-extrabold transition cursor-pointer ${
                lang === 'en' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-3">
              
              {/* Workspace Selector Dropdown for Dual Role users */}
              {currentUser.roles && currentUser.roles.length > 1 && (
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700/60 mr-1 animate-in fade-in">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider hidden lg:inline">{t('contextSelector')}:</span>
                  <select
                    value={session?.activeRole || ''}
                    onChange={(e) => {
                      selectActiveRole(e.target.value || null);
                      setCurrentView('dashboard');
                    }}
                    className="bg-transparent text-slate-800 dark:text-slate-100 font-extrabold text-[10px] border-none focus:outline-none focus:ring-0 cursor-pointer p-0"
                  >
                    <option value="">Select...</option>
                    {currentUser.roles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notification Bell alert */}
              {notificationCount > 0 && (
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-amber-500 animate-bounce relative cursor-pointer"
                  title={`${notificationCount} pending meeting invitations!`}
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                </button>
              )}

              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {t('role')}: <span className="text-primary font-semibold">{session?.activeRole || currentUser.role}</span>
                </div>
              </div>
              
              <div className="relative">
                {currentUser.photo ? (
                  <img
                    src={currentUser.photo}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/30"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">
                    {currentUser.name?.charAt(0)}
                  </div>
                )}
                <span 
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-slate-900 rounded-full ${
                    currentUser.status === 'active' ? 'bg-green-500' : currentUser.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                  }`} 
                  title={`Status: ${currentUser.status}`} 
                />
              </div>

              <button
                onClick={logout}
                className="ml-2 text-xs font-bold text-slate-500 hover:text-red-500 border border-slate-200 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-950 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 transition cursor-pointer"
              >
                {t('signOut')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 bg-primary hover:bg-secondary text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer shadow-md shadow-primary/10 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                {t('signIn')}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal />
    </header>
  );
}
