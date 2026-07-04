import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useLanguage } from '../context/LanguageContext';
import { Building2, Calendar, MapPin, Globe, Shield, Sparkles, Users, ArrowRight } from 'lucide-react';

export default function PortalPage() {
  const { conferences } = useDatabase();
  const { t } = useLanguage();

  const activeCongresses = conferences.filter(c => c.status === 'active' || !c.status);
  const archivedCongresses = conferences.filter(c => c.status === 'archived');

  const handleEnterCongress = (acronym) => {
    window.location.hash = `#/${acronym.toLowerCase()}`;
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-24 sm:py-32 bg-slate-900 text-white border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-550/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-bold font-mono tracking-wider uppercase animate-in slide-in-from-top-4 duration-300">
            <Sparkles className="w-3.5 h-3.5" />
            Sympovex SaaS Gateway
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1] animate-in fade-in zoom-in-95 duration-500">
            {t('portalTitle') || 'Premium SaaS Platform for Scientific Congresses'}
          </h1>
          
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in duration-600">
            {t('portalSub') || 'Manage submissions, conduct double-blind peer reviews, drive attendee networking, and track survey analytics in real-time.'}
          </p>

          <div className="pt-4 animate-in slide-in-from-bottom-4 duration-700">
            <a 
              href="#explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              Explore Congresses <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('platformFeatures') || 'Platform Features'}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Engineered to empower scientific program committees and delegates globally.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Feature 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3 hover:border-indigo-500/30 transition duration-200">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t('featureMultiTenant') || 'Multi-Tenant'}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t('featureMultiTenantDesc') || 'Host multiple independent congresses with isolated themes and database states.'}</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3 hover:border-indigo-500/30 transition duration-200">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t('featureTranslation') || 'Full Localization'}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t('featureTranslationDesc') || 'Dynamic real-time translation of all static and dynamic text content for global delegates.'}</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3 hover:border-indigo-500/30 transition duration-200">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t('featureReview') || 'Double-Blind Review'}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t('featureReviewDesc') || 'Smart reviewer assignment, consolidated reports, and validation pipeline for the program committee.'}</p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3 hover:border-indigo-500/30 transition duration-200">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t('featureNetworking') || 'Networking & Gallery'}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t('featureNetworkingDesc') || 'Instant messaging, face-to-face meeting scheduling, and live interactive event galleries.'}</p>
          </div>

        </div>
      </section>

      {/* CONGRESSES DIRECTORY */}
      <section id="explore" className="py-16 bg-slate-100 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* ACTIVE CONGRESSES */}
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                {t('activeCongresses') || 'Active Congresses'}
              </h3>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeCongresses.map(conf => (
                <div key={conf.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-350 transition duration-200">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <img src={conf.logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover border border-slate-150" />
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-full uppercase">
                        {conf.acronym || conf.id}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 dark:text-white leading-snug text-base">{conf.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{conf.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-850/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(conf.startDate).toLocaleDateString()}</span>
                    </div>
                    
                    <button
                      onClick={() => handleEnterCongress(conf.acronym || conf.id)}
                      className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      {t('enterCongress') || 'Enter Congress →'}
                    </button>
                  </div>
                </div>
              ))}
              {activeCongresses.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 italic text-sm">
                  No active congresses configured at this time.
                </div>
              )}
            </div>
          </div>

          {/* ARCHIVED CONGRESSES */}
          <div className="space-y-6 pt-8">
            <div className="border-b pb-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-slate-400 rounded-full" />
                {t('archivedCongresses') || 'Archived Congresses'}
              </h3>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {archivedCongresses.map(conf => (
                <div key={conf.id} className="bg-white/40 dark:bg-slate-900/30 backdrop-blur-xs rounded-2xl border border-slate-200/60 dark:border-slate-850/40 overflow-hidden flex flex-col justify-between opacity-80 hover:opacity-100 transition duration-200">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <img src={conf.logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover border border-slate-150 grayscale" />
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-slate-500/10 text-slate-500 border border-slate-500/20 rounded-full uppercase">
                        {conf.acronym || conf.id}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-350 leading-snug text-base">{conf.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{conf.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-100/40 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-850/40 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(conf.startDate).toLocaleDateString()}</span>
                    </div>
                    
                    <button
                      onClick={() => handleEnterCongress(conf.acronym || conf.id)}
                      className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-155 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg transition cursor-pointer"
                    >
                      {t('viewArchives') || 'View Archives'}
                    </button>
                  </div>
                </div>
              ))}
              {archivedCongresses.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 italic text-sm">
                  No archived congresses found.
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
