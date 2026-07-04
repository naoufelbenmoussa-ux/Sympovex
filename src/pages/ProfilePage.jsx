import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Image, FileText, Mail, Shield, Building, Check, ArrowLeft } from 'lucide-react';

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60"
];

export default function ProfilePage({ onBack }) {
  const { currentUser, updateUserProfile } = useDatabase();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);

  // Initialize values
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhoto(currentUser.photo || '');
      setDescription(currentUser.description || '');
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 italic">
        Please log in to view your profile.
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(currentUser.id, {
      name,
      photo,
      description
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-xs font-bold text-slate-550 hover:text-primary transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToDashboard') || '← Back to Dashboard'}
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
        
        {/* Title */}
        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('profileTitle') || 'Your User Profile'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('profileSubtitle') || 'Update your personal information, profile photo, and biography.'}
          </p>
        </div>

        {success && (
          <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/15 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 animate-in zoom-in-95">
            <Check className="w-4 h-4" />
            {t('profileSuccess') || 'Your profile has been updated successfully!'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Avatar Preview Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
            <div className="relative">
              {photo ? (
                <img
                  src={photo}
                  alt={name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary text-white font-bold flex items-center justify-center text-3xl shadow-md">
                  {name?.charAt(0) || currentUser.name?.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 text-center sm:text-left">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('profilePresetAvatars') || 'Or choose a preset avatar'}
              </h4>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhoto(url)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 cursor-pointer transition transform hover:scale-105 ${photo === url ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
                  >
                    <img src={url} alt="Preset Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid sm:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {t('profileName') || 'Full Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            {/* Profile Photo URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-slate-400" />
                {t('profilePhotoUrl') || 'Profile Photo URL'}
              </label>
              <input
                type="url"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                className="w-full text-xs rounded-xl px-3.5 py-2.5 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

          </div>

          {/* Description / Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              {t('profileBio') || 'Description / Biography'}
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full text-xs rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
            />
          </div>

          {/* Read-only Information */}
          <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-850 p-4 sm:p-5 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">{currentUser.email}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3" /> {t('profileRole') || 'Account Role'}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider text-[10px] bg-slate-200/50 dark:bg-slate-800 text-slate-800 dark:text-slate-305 px-2 py-0.5 rounded-full inline-block">
                  {currentUser.role}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium flex items-center gap-1">
                  <Building className="w-3 h-3" /> {t('profileAffiliation') || 'Affiliation / University'}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">{currentUser.affiliation}</span>
              </div>

            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl transition shadow-lg shadow-primary/10 cursor-pointer text-center"
          >
            {t('profileSaveBtn') || 'Save Changes'}
          </button>

        </form>

      </div>

    </div>
  );
}
