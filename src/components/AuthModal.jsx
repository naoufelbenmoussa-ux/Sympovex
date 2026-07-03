import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import { useLanguage } from '../context/LanguageContext';
import { X, Mail, Lock, User, Globe, Building, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, login, register } = useAuth();
  const { conferences, refreshState } = useDatabase();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Participant');
  const [regAffiliation, setRegAffiliation] = useState('');
  const [regConfId, setRegConfId] = useState(conferences[0]?.id || 'gacs2026');
  
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    
    const res = login(loginEmail, loginPassword);
    if (res.success) {
      setAuthModalOpen(false);
      // Reset form
      setLoginEmail('');
      setLoginPassword('');
    } else {
      if (res.error === 'pending') {
        setLoginError('pending');
      } else {
        setLoginError(res.error || t('loginError'));
      }
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess(false);

    if (!regName || !regEmail || !regPassword) {
      setRegError('Please fill in all required fields.');
      return;
    }

    const res = register({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      affiliation: regAffiliation || 'Independent Researcher',
      conferenceId: regConfId
    });

    if (res.success) {
      setRegSuccess(true);
      // Reset inputs
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegAffiliation('');
      
      // Refresh DB state to show the pending user to the admin in real-time
      if (refreshState) refreshState();
    } else {
      setRegError(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-55 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{t('authTitle')}</h3>
          </div>
          <button 
            onClick={() => setAuthModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        {!regSuccess && (
          <div className="flex border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => { setActiveTab('login'); setLoginError(''); }}
              className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition cursor-pointer ${
                activeTab === 'login'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('loginTitle')}
            </button>
            <button
              onClick={() => { setActiveTab('register'); setRegError(''); }}
              className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition cursor-pointer ${
                activeTab === 'register'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('createAccount')}
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeTab === 'login' && !regSuccess && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Errors/Status messages */}
              {loginError === 'pending' && (
                <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl space-y-1.5 flex gap-3 text-xs leading-normal">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold block">{t('awaitingValTitle')}</span>
                    {t('awaitingValDesc')}
                  </div>
                </div>
              )}

              {loginError && loginError !== 'pending' && (
                <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl flex gap-2 text-xs font-semibold items-center">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">{t('emailLabel')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full text-sm rounded-lg pl-10 pr-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">{t('passwordLabel')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm rounded-lg pl-10 pr-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-secondary text-white font-bold text-sm rounded-lg transition cursor-pointer shadow-md shadow-primary/10 mt-2"
              >
                {t('loginTitle')}
              </button>
            </form>
          )}

          {activeTab === 'register' && !regSuccess && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {regError && (
                <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl flex gap-2 text-xs font-semibold items-center">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">{t('nameLabel')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Lucas Bernard"
                    className="w-full text-sm rounded-lg pl-10 pr-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">{t('emailLabel')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="lucas.b@domain.edu"
                    className="w-full text-sm rounded-lg pl-10 pr-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">{t('passwordLabel')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full text-sm rounded-lg pl-10 pr-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{t('roleLabel')}</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full text-sm rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="Participant">Participant</option>
                    <option value="Author">Author</option>
                    <option value="Reviewer">Reviewer</option>
                    <option value="POC">POC (Logistics)</option>
                    <option value="PSC">PSC (Scientific)</option>
                    <option value="President">President (Admin)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{t('conferenceLabel')}</label>
                  <select
                    value={regConfId}
                    onChange={(e) => setRegConfId(e.target.value)}
                    className="w-full text-sm rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                  >
                    {conferences.map(c => (
                      <option key={c.id} value={c.id}>{c.name.split(' (')[0]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">{t('affiliationLabel')}</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={regAffiliation}
                    onChange={(e) => setRegAffiliation(e.target.value)}
                    placeholder="E.g. MIT, Paris-Saclay, etc."
                    className="w-full text-sm rounded-lg pl-10 pr-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-secondary text-white font-bold text-sm rounded-lg transition cursor-pointer shadow-md shadow-primary/10 mt-2"
              >
                {t('submitReg')}
              </button>
            </form>
          )}

          {regSuccess && (
            <div className="py-6 space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">{t('regSuccessTitle')}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-450 px-2 leading-relaxed">
                  {t('regSuccessDesc')}
                </p>
              </div>

              <button
                onClick={() => {
                  setRegSuccess(false);
                  setActiveTab('login');
                }}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-850 dark:text-slate-200 font-bold text-sm rounded-lg transition cursor-pointer"
              >
                {t('loginTitle')}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
