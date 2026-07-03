import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SuperadminDashboard from './SuperadminDashboard';
import AdminDashboard from './AdminDashboard';
import PocDashboard from './PocDashboard';
import PscDashboard from './PscDashboard';
import ReviewerDashboard from './ReviewerDashboard';
import ParticipantDashboard from './ParticipantDashboard';
import { ShieldCheck, User, LayoutDashboard, Lock } from 'lucide-react';

export default function DashboardHub() {
  const { currentUser, currentConference } = useDatabase();
  const { session, selectActiveRole, completePasswordChange, setAuthModalOpen } = useAuth();
  const { t } = useLanguage();

  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [pwError, setPwError] = React.useState('');

  const handlePasswordResetSubmit = (e) => {
    e.preventDefault();
    setPwError('');
    if (newPassword.length < 6) {
      setPwError(t('pwErrorLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError(t('pwErrorMatch'));
      return;
    }
    const success = completePasswordChange(newPassword);
    if (!success) {
      setPwError(t('pwErrorFail'));
    }
  };

  if (!currentUser) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-slate-955 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="mx-auto w-16 h-16 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center justify-center">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('accessRestricted')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Welcome to the Sympovex Secure Workspace. You must be signed in to view your role-specific dashboard, submit papers, perform reviews, or manage conference tenants.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-2.5 bg-primary hover:bg-secondary text-white font-bold text-sm rounded-lg transition cursor-pointer shadow-md shadow-primary/10"
            >
              {t('signinAccount')}
            </button>
            <p className="text-xs text-slate-450 dark:text-slate-500">
              {t('dontHaveAccount')}{' '}
              <button 
                onClick={() => setAuthModalOpen(true)} 
                className="text-primary font-bold hover:underline cursor-pointer bg-transparent border-none p-0 inline"
              >
                {t('createOneNow')}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 1. FORCED PASSWORD CHANGE RESET
  if (currentUser?.requiresPasswordChange) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-955 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('forcePasswordTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('forcePasswordDesc')}
            </p>
          </div>

          <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
            {pwError && (
              <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25 rounded-lg text-xs font-semibold">
                {pwError}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">{t('newPasswordLabel')}</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">{t('confirmPasswordLabel')}</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full text-sm rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-955 dark:text-white focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-secondary text-white font-bold text-sm rounded-lg transition cursor-pointer shadow-md shadow-primary/10"
            >
              {t('save')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. DUAL ROLE GATEWAY WORKSPACE SELECTOR
  if (session && !session.activeRole && currentUser?.roles && currentUser.roles.length > 1) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-955 p-6">
        <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl text-center animate-in zoom-in-95 duration-200">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('selectRoleTitle')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('welcomeBack')} <strong className="text-slate-900 dark:text-white font-bold">{currentUser.name}</strong>. {t('dualRoleContext')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            {currentUser.roles.map(role => {
              let title = role;
              let description = "";
              if (role === 'Participant' || role === 'Author') {
                title = t('partAuthorWorkspace');
                description = t('partAuthorWorkspaceDesc');
              } else if (role === 'Reviewer') {
                title = t('revPanel');
                description = t('revPanelDesc');
              } else if (role === 'PSC') {
                title = t('pscConsoleTitle');
                description = t('pscConsoleDesc');
              } else if (role === 'President') {
                title = t('presConsoleTitle');
                description = t('presConsoleDesc');
              } else if (role === 'Superadmin') {
                title = t('superadminConsoleTitle');
                description = t('superadminConsoleDesc');
              }
              
              return (
                <button
                  key={role}
                  onClick={() => selectActiveRole(role)}
                  className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 hover:border-primary hover:bg-primary/5 transition text-left space-y-2 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary">{title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{description}</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1 mt-3">
                    {t('enterWorkspace')} →
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const renderActiveDashboard = () => {
    const activeRole = session?.activeRole || currentUser?.role;
    switch (activeRole) {
      case 'Superadmin':
        return <SuperadminDashboard />;
      case 'President':
        return <AdminDashboard />;
      case 'POC':
        return <PocDashboard />;
      case 'PSC':
        return <PscDashboard />;
      case 'Reviewer':
        return <ReviewerDashboard />;
      case 'Author':
      case 'Participant':
        return <ParticipantDashboard />;
      default:
        return <ParticipantDashboard />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-200">
      
      {/* Workspace Banner */}
      <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-semibold text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>{t('secureInterface')}</span>
            <span className="text-slate-300">|</span>
            <span>{t('tenantLabel')}: <span className="text-slate-900 dark:text-white font-bold">{currentConference?.name}</span></span>
          </div>

          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-primary" />
            <span>{t('sessionRole')}: <span className="text-primary font-bold">{session?.activeRole || currentUser?.role}</span></span>
          </div>
        </div>
      </div>

      {/* Workspace Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm p-6 sm:p-8">
          {renderActiveDashboard()}
        </div>
      </div>
      
    </div>
  );
}
