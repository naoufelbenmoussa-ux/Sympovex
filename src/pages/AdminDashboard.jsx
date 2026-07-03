import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import JSZip from 'jszip';
import { 
  Palette, UserPlus, Building, Mail, Award, Download, Check, Play, FileText, Settings, Upload 
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    currentConference,
    updateConferenceDetails,
    addKeynoteSpeaker,
    sponsors,
    addSponsor,
    users,
    speakers,
    activateUser,
    suspendUser,
    deleteUser,
    gallery,
    approveGalleryPhoto,
    deleteGalleryPhoto
  } = useDatabase();

  // Conference customization states
  const [confName, setConfName] = useState(currentConference?.name || '');
  const [confVenue, setConfVenue] = useState(currentConference?.venue || '');
  const [confLogo, setConfLogo] = useState(currentConference?.logo || '');
  const [confStart, setConfStart] = useState(currentConference?.startDate || '');
  const [confEnd, setConfEnd] = useState(currentConference?.endDate || '');

  // Theme color states
  const [primaryColor, setPrimaryColor] = useState(currentConference?.colors?.primary || '#6366f1');
  const [secondaryColor, setSecondaryColor] = useState(currentConference?.colors?.secondary || '#4f46e5');
  const [accentColor, setAccentColor] = useState(currentConference?.colors?.accent || '#f59e0b');
  const [themeSuccess, setThemeSuccess] = useState(false);

  // New speaker states
  const [spkName, setSpkName] = useState('');
  const [spkAffiliation, setSpkAffiliation] = useState('');
  const [spkBio, setSpkBio] = useState('');
  const [spkContact, setSpkContact] = useState('');
  const [spkTitle, setSpkTitle] = useState('');
  const [spkAbstract, setSpkAbstract] = useState('');
  const [speakerSuccess, setSpeakerSuccess] = useState(false);

  // New sponsor states
  const [spName, setSpName] = useState('');
  const [spTier, setSpTier] = useState('Gold');
  const [spDesc, setSpDesc] = useState('');
  const [spBrochure, setSpBrochure] = useState('');
  const [spVideo, setSpVideo] = useState('');
  const [spContact, setSpContact] = useState('');
  const [sponsorSuccess, setSponsorSuccess] = useState(false);

  // Mail Merge States
  const [docType, setDocType] = useState('Certificate'); // Certificate or Badge
  const [templateText, setTemplateText] = useState(
    `<h1>Official Attendance Certificate</h1>
<p>This document certifies that <strong>{{name}}</strong> ({{role}}), affiliated with <strong>{{affiliation}}</strong>, has actively participated in the <strong>{{conference_title}}</strong>.</p>
<p>Issued on 2026-07-01 by the Scientific Conference Board.</p>`
  );
  const [mergeSuccess, setMergeSuccess] = useState(false);

  // Handle saving general details & colors
  const handleSaveTheming = (e) => {
    e.preventDefault();
    updateConferenceDetails({
      name: confName,
      venue: confVenue,
      logo: confLogo,
      startDate: confStart,
      endDate: confEnd,
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor
      }
    });
    setThemeSuccess(true);
    setTimeout(() => setThemeSuccess(false), 4000);
  };

  // Add Keynote Speaker
  const handleAddSpeaker = (e) => {
    e.preventDefault();
    if (!spkName || !spkTitle) return;
    addKeynoteSpeaker({
      name: spkName,
      affiliation: spkAffiliation,
      bio: spkBio,
      contact: spkContact,
      talkTitle: spkTitle,
      talkAbstract: spkAbstract
    });
    setSpeakerSuccess(true);
    setSpkName('');
    setSpkAffiliation('');
    setSpkBio('');
    setSpkContact('');
    setSpkTitle('');
    setSpkAbstract('');
    setTimeout(() => setSpeakerSuccess(false), 4000);
  };

  // Add Sponsor
  const handleAddSponsor = (e) => {
    e.preventDefault();
    if (!spName) return;
    addSponsor({
      name: spName,
      tier: spTier,
      description: spDesc,
      brochure: spBrochure,
      videoUrl: spVideo,
      contactEmail: spContact
    });
    setSponsorSuccess(true);
    setSpName('');
    setSpDesc('');
    setSpBrochure('');
    setSpVideo('');
    setSpContact('');
    setTimeout(() => setSponsorSuccess(false), 4000);
  };

  // Handle Mail Merge ZIP Generation
  const handleMailMerge = () => {
    const zip = new JSZip();
    
    // Filter users belonging to this conference
    const confUsers = users.filter(u => !u.conferenceId || u.conferenceId === currentConference.id);

    confUsers.forEach(user => {
      // Replace tags
      let parsedHtml = templateText
        .replace(/\{\{name\}\}/g, user.name)
        .replace(/\{\{affiliation\}\}/g, user.affiliation || 'N/A')
        .replace(/\{\{role\}\}/g, user.role)
        .replace(/\{\{conference_title\}\}/g, currentConference.name);

      // Create full HTML document structure
      const fullDocument = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${user.name} - ${docType}</title>
  <style>
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      text-align: center;
      padding: 50px;
      margin: 0;
      color: #1e293b;
      background: #f8fafc;
    }
    .container {
      background: #ffffff;
      max-width: 750px;
      margin: 0 auto;
      padding: 60px 40px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      border: 8px solid ${primaryColor};
      position: relative;
    }
    .container::before {
      content: '';
      position: absolute;
      top: 5px; left: 5px; right: 5px; bottom: 5px;
      border: 2px solid ${accentColor};
      border-radius: 6px;
      pointer-events: none;
    }
    h1 {
      color: ${secondaryColor};
      font-size: 32px;
      margin-bottom: 30px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    p {
      line-height: 1.8;
      font-size: 16px;
      color: #475569;
    }
    strong {
      color: #0f172a;
    }
    .footer-mark {
      margin-top: 50px;
      font-size: 12px;
      color: #94a3b8;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container font-sans">
    ${parsedHtml}
    <div class="footer-mark">Sympovex Auto-Generated Mail Merge | ID: ${user.id}</div>
  </div>
</body>
</html>`;

      const safeFilename = `${docType.toLowerCase()}_${user.name.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
      zip.file(safeFilename, fullDocument);
    });

    zip.generateAsync({ type: 'blob' }).then(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${currentConference.id}_${docType.toLowerCase()}s_bulk.zip`;
      link.click();
      setMergeSuccess(true);
      setTimeout(() => setMergeSuccess(false), 4000);
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-350">
      
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Global Supervisor Dashboard</h2>
        <p className="text-sm text-slate-500">Configure public landing configurations, pick accents, add Plenary CVs, and deploy Mail Merge.</p>
      </div>

      {/* 1. DYNAMIC THEMING & GENERAL OPTIONS */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
          <Palette className="w-5 h-5 text-primary" />
          Theming & Landing Page Customizer
        </h3>

        <form onSubmit={handleSaveTheming} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Conference Name</label>
              <input
                type="text"
                value={confName}
                onChange={(e) => setConfName(e.target.value)}
                required
                className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Venue / Location</label>
              <input
                type="text"
                value={confVenue}
                onChange={(e) => setConfVenue(e.target.value)}
                required
                className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Start Date</label>
              <input
                type="date"
                value={confStart}
                onChange={(e) => setConfStart(e.target.value)}
                className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">End Date</label>
              <input
                type="date"
                value={confEnd}
                onChange={(e) => setConfEnd(e.target.value)}
                className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Logo Image Link</label>
              <input
                type="url"
                value={confLogo}
                onChange={(e) => setConfLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* COLOR PICKER MATRIX */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-850/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Brand Identity Palette Picker</h4>
            
            <div className="grid grid-cols-3 gap-6">
              {/* Primary */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded border-none cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="text-xs font-mono bg-white dark:bg-slate-900 border px-2 py-1 rounded w-20 text-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Secondary */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded border-none cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={secondaryColor} 
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="text-xs font-mono bg-white dark:bg-slate-900 border px-2 py-1 rounded w-20 text-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Accent */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Accent/Highlight</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded border-none cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={accentColor} 
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="text-xs font-mono bg-white dark:bg-slate-900 border px-2 py-1 rounded w-20 text-slate-950 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-primary hover:bg-secondary text-white font-semibold text-sm rounded-lg shadow-sm cursor-pointer transition flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" />
            Apply Styles & Configs
          </button>
        </form>

        {themeSuccess && (
          <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 p-3 rounded-lg border border-green-500/10 text-xs font-semibold">
            <Check className="w-4 h-4" />
            Styles and configs updated successfully! Landing Page and branding will reload with new variables.
          </div>
        )}
      </section>

      {/* 1.5. MEMBER ACTIVATION & ACCESS PORTAL */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Member Activation & Access Portal
        </h3>

        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Below are registration requests from delegates wishing to access this conference tenant. All registrations require explicit administrator validation before logins are authorized.
          </p>

          {users.filter(u => u.status === 'pending' && u.conferenceId === currentConference.id).length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs">
              No pending registration validation requests for this conference tenant.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <th className="py-2.5 px-3">Delegate Name</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Affiliation</th>
                    <th className="py-2.5 px-3">Requested Role</th>
                    <th className="py-2.5 px-3">Registered At</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.status === 'pending' && u.conferenceId === currentConference.id).map(u => (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">
                          {u.name.charAt(0)}
                        </div>
                        {u.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{u.affiliation}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {u.registeredAt ? new Date(u.registeredAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => activateUser(u.id)}
                          className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded text-[10px] shadow-sm cursor-pointer transition animate-in fade-in"
                        >
                          Approve & Activate
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[10px] shadow-sm cursor-pointer transition animate-in fade-in"
                        >
                          Decline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* 2. PLENARY SPEAKERS WRITER */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Register Keynote Speaker
          </h3>

          <form onSubmit={handleAddSpeaker} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Prof. Richard Feynman"
                  value={spkName}
                  onChange={(e) => setSpkName(e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Affiliation Institution</label>
                <input
                  type="text"
                  placeholder="Caltech"
                  value={spkAffiliation}
                  onChange={(e) => setSpkAffiliation(e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Contact Email</label>
                <input
                  type="email"
                  placeholder="feynman@caltech.edu"
                  value={spkContact}
                  onChange={(e) => setSpkContact(e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Talk Title</label>
                <input
                  type="text"
                  required
                  placeholder="Quantum Computing Simulating Physics"
                  value={spkTitle}
                  onChange={(e) => setSpkTitle(e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Speaker Biography</label>
              <textarea
                rows={3}
                placeholder="Brief summary profile biography..."
                value={spkBio}
                onChange={(e) => setSpkBio(e.target.value)}
                className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Talk Abstract Summary</label>
              <textarea
                rows={3}
                placeholder="Scientific talk abstract summary..."
                value={spkAbstract}
                onChange={(e) => setSpkAbstract(e.target.value)}
                className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary hover:bg-secondary text-white font-semibold text-sm rounded-lg cursor-pointer transition shadow-xs"
            >
              Add Keynote Speaker
            </button>
          </form>

          {speakerSuccess && (
            <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/10 rounded-lg text-xs font-semibold animate-fade-in">
              Speaker profile registered successfully!
            </div>
          )}
        </div>

        {/* 3. CORPORATE BOOTH BUILDER */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
            <Building className="w-5 h-5 text-primary" />
            Provision Sponsor Stand/Booth
          </h3>

          <form onSubmit={handleAddSponsor} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="Tesla Energy"
                  value={spName}
                  onChange={(e) => setSpName(e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Tier Tier</label>
                <select
                  value={spTier}
                  onChange={(e) => setSpTier(e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Gold">Gold Partner</option>
                  <option value="Silver">Silver Partner</option>
                  <option value="Bronze">Bronze Partner</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Brochure PDF Filename</label>
                <input
                  type="text"
                  placeholder="Tesla_Grid_Solutions.pdf"
                  value={spBrochure}
                  onChange={(e) => setSpBrochure(e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Promo Video MP4 URL</label>
                <input
                  type="url"
                  placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                  value={spVideo}
                  onChange={(e) => setSpVideo(e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Contact/Representative Email</label>
              <input
                type="email"
                placeholder="booth-ops@tesla.com"
                value={spContact}
                onChange={(e) => setSpContact(e.target.value)}
                className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Company description</label>
              <textarea
                rows={3}
                placeholder="Tesla Energy is changing utility scale energy storage infrastructure with Megapack grids..."
                value={spDesc}
                onChange={(e) => setSpDesc(e.target.value)}
                className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary hover:bg-secondary text-white font-semibold text-sm rounded-lg cursor-pointer transition shadow-xs"
            >
              Add Sponsor Booth
            </button>
          </form>

          {sponsorSuccess && (
            <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/10 rounded-lg text-xs font-semibold animate-fade-in">
              Sponsor Booth registered and virtual stands created!
            </div>
          )}
        </div>

      </div>

      {/* 4. PUBLIPOSTAGE - BADGES & CERTIFICATES TEMPLATE MERGE */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
          <Mail className="w-5 h-5 text-primary" />
          Mail Merge Certificates & Badges (Publipostage)
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Document Blueprint Type</label>
                <select
                  value={docType}
                  onChange={(e) => {
                    setDocType(e.target.value);
                    if (e.target.value === 'Badge') {
                      setTemplateText(`<h2>Participant Identification Badge</h2>
<p>Name: <strong>{{name}}</strong></p>
<p>Institution: <strong>{{affiliation}}</strong></p>
<p>Registered Role: <span class="role">{{role}}</span></p>
<p>Site: {{conference_title}}</p>`);
                    } else {
                      setTemplateText(`<h1>Official Attendance Certificate</h1>
<p>This document certifies that <strong>{{name}}</strong> ({{role}}), affiliated with <strong>{{affiliation}}</strong>, has actively participated in the <strong>{{conference_title}}</strong>.</p>
<p>Issued on 2026-07-01 by the Scientific Conference Board.</p>`);
                    }
                  }}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Certificate">Attendance Certificate</option>
                  <option value="Badge">Attendee Entrance Badge</option>
                </select>
              </div>

              <div className="flex-1 flex flex-col justify-end">
                <button
                  onClick={handleMailMerge}
                  className="py-2.5 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Generate Bulk Documents (ZIP)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">HTML Template Editor (supports variables)</label>
              <textarea
                rows={8}
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                className="w-full text-sm font-mono rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
              <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono">
                <span>Available Variables:</span>
                <span className="bg-slate-100 dark:bg-slate-850 px-1 rounded text-primary font-bold">{"{{name}}"}</span>
                <span className="bg-slate-100 dark:bg-slate-850 px-1 rounded text-primary font-bold">{"{{affiliation}}"}</span>
                <span className="bg-slate-100 dark:bg-slate-850 px-1 rounded text-primary font-bold">{"{{role}}"}</span>
                <span className="bg-slate-100 dark:bg-slate-850 px-1 rounded text-primary font-bold">{"{{conference_title}}"}</span>
              </div>
            </div>

            {mergeSuccess && (
              <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 p-3 rounded-lg border border-green-500/10 text-xs font-semibold">
                <Check className="w-4 h-4" />
                ZIP archive generated and bulk files downloaded successfully!
              </div>
            )}
          </div>

          {/* Live Preview Pane */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Mail Merge Document Preview</h4>
            
            <div 
              className="aspect-[4/3] rounded-xl bg-white border-4 p-8 flex flex-col justify-between text-center relative overflow-hidden" 
              style={{ 
                borderColor: primaryColor,
                color: '#1e293b'
              }}
            >
              <div className="absolute inset-2 border border-dashed rounded-lg pointer-events-none" style={{ borderColor: accentColor }} />
              
              <div 
                className="prose prose-xs max-w-full text-slate-700 font-sans"
                dangerouslySetInnerHTML={{
                  __html: templateText
                    .replace(/\{\{name\}\}/g, 'Lucas Bernard')
                    .replace(/\{\{affiliation\}\}/g, 'ENS Paris-Saclay')
                    .replace(/\{\{role\}\}/g, 'Author')
                    .replace(/\{\{conference_title\}\}/g, currentConference.name)
                }}
              />
              <div className="text-[9px] text-slate-400 font-mono">Sympovex Auto-Generated Mail Merge | ID: preview_01</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PHOTO MODERATION PANEL */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
          <Palette className="w-5 h-5 text-primary" />
          6. Live Event Photo Moderation
        </h3>

        <p className="text-xs text-slate-500">Approve or delete photos uploaded in real-time by participants for the landing gallery.</p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gallery.filter(item => item.conferenceId === currentConference.id).map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
              <img src={item.url} alt={item.caption} className="w-full aspect-video object-cover" />
              <div className="p-4 space-y-2">
                <p className="text-xs text-slate-700 dark:text-slate-350 italic">"{item.caption}"</p>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>By: {item.uploaderName || 'Anonymous'}</span>
                  <span className="font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="border-t pt-2 flex items-center justify-between">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                    item.status === 'approved' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {item.status || 'pending'}
                  </span>
                  <div className="flex gap-1.5">
                    {item.status !== 'approved' && (
                      <button
                        onClick={() => { approveGalleryPhoto(item.id); alert('Photo approved successfully.'); }}
                        className="px-2 py-1 bg-green-600 text-white font-bold text-[10px] rounded hover:bg-green-700 cursor-pointer"
                        title="Approve & Show in Gallery"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => { if (window.confirm("Confirm deletion of photo?")) deleteGalleryPhoto(item.id); }}
                      className="px-2 py-1 bg-red-650 text-white font-bold text-[10px] rounded hover:bg-red-750 cursor-pointer"
                      title="Delete photo"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {gallery.filter(item => item.conferenceId === currentConference.id).length === 0 && (
            <div className="col-span-3 text-center py-20 text-slate-405 italic text-xs">No photos uploaded yet.</div>
          )}
        </div>
      </section>

    </div>
  );
}
