import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Building2, Plus, Users, PlusCircle, ShieldAlert, Award, FileText, Activity } from 'lucide-react';

export default function SuperadminDashboard() {
  const { 
    conferences, 
    users, 
    papers, 
    tickets, 
    createNewConference, 
    createNewUser, 
    updateUserRole,
    activateUser,
    deleteUser
  } = useDatabase();

  const [newConfName, setNewConfName] = useState('');
  const [newConfAcronym, setNewConfAcronym] = useState('');
  const [newConfStart, setNewConfStart] = useState('');
  const [newConfEnd, setNewConfEnd] = useState('');
  const [newConfVenue, setNewConfVenue] = useState('');
  const [confSuccess, setConfSuccess] = useState(false);

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('President');
  const [newUserAffiliation, setNewUserAffiliation] = useState('');
  const [newUserConf, setNewUserConf] = useState('gacs2026');
  const [supabaseUrl, setSupabaseUrl] = useState('https://lhquqjndjmqxteswvx.supabase.co');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bXBvdmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMDAwMDAsImV4cCI6MjA1NDAwMDAwMH0.signature');
  const [jwtSecret, setJwtSecret] = useState('super-secret-jwt-signing-key-sympovex-123456');
  const [userSuccess, setUserSuccess] = useState(false);
  const [dbConfigSuccess, setDbConfigSuccess] = useState(false);

  const handleExportSql = () => {
    const sql = `-- Sympovex Production Supabase Relational Database Schema
-- Generated on 2026-07-03

CREATE TABLE conferences (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    colors JSONB,
    logo TEXT,
    author_instructions TEXT
);

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    affiliation VARCHAR(255),
    attribute VARCHAR(100),
    segment VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    password TEXT,
    photo TEXT,
    conference_id VARCHAR(50) REFERENCES conferences(id) ON DELETE SET NULL
);

CREATE TABLE papers (
    id VARCHAR(50) PRIMARY KEY,
    conference_id VARCHAR(50) REFERENCES conferences(id) ON DELETE CASCADE,
    submitter_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    abstract TEXT,
    keywords VARCHAR(255),
    paper_type VARCHAR(100) DEFAULT 'Extended Paper',
    status VARCHAR(50) DEFAULT 'Submitted',
    reviewer_ids TEXT[],
    authors JSONB
);

CREATE TABLE evaluation_criteria (
    id VARCHAR(50) PRIMARY KEY,
    conference_id VARCHAR(50) REFERENCES conferences(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    max_score INT DEFAULT 5
);

CREATE TABLE reviews (
    id VARCHAR(50) PRIMARY KEY,
    paper_id VARCHAR(50) REFERENCES papers(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    originality INT DEFAULT 3,
    methodology INT DEFAULT 3,
    relevance INT DEFAULT 3,
    comments TEXT,
    crit_scores JSONB,
    form_remarks TEXT,
    scientific_remarks TEXT,
    presentation_format VARCHAR(100),
    comments_file_name VARCHAR(255)
);

CREATE TABLE survey_submissions (
    id VARCHAR(50) PRIMARY KEY,
    conference_id VARCHAR(50) REFERENCES conferences(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    rating_organization INT,
    rating_content INT,
    comments TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gallery (
    id VARCHAR(50) PRIMARY KEY,
    conference_id VARCHAR(50) REFERENCES conferences(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption VARCHAR(255),
    uploader_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE votes (
    id VARCHAR(50) PRIMARY KEY,
    conference_id VARCHAR(50) REFERENCES conferences(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    candidate_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);`;
    const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "supabase_sympovex_schema.sql");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateConf = (e) => {
    e.preventDefault();
    if (!newConfName || !newConfVenue || !newConfAcronym) return;
    createNewConference({
      name: newConfName,
      acronym: newConfAcronym.toUpperCase(),
      startDate: newConfStart || '2026-10-12',
      endDate: newConfEnd || '2026-10-15',
      venue: newConfVenue
    });
    setConfSuccess(true);
    setNewConfName('');
    setNewConfAcronym('');
    setNewConfVenue('');
    setTimeout(() => setConfSuccess(false), 4000);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    createNewUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      affiliation: newUserAffiliation || 'Independent Researcher',
      conferenceId: newUserConf,
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60'
    });
    setUserSuccess(true);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserAffiliation('');
    setTimeout(() => setUserSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-350">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Superadmin Global SaaS Dashboard</h2>
        <p className="text-sm text-slate-500">Overview of tenants, provisioning managers, and platform configurations.</p>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Conferences', value: conferences.length, icon: Building2, color: 'text-indigo-500' },
          { label: 'Total Users Registered', value: users.length, icon: Users, color: 'text-emerald-500' },
          { label: 'Total Papers Submitted', value: papers.length, icon: FileText, color: 'text-amber-500' },
          { label: 'Active Support Tickets', value: tickets.filter(t => t.status === 'Open').length, icon: Activity, color: 'text-red-500' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block">{stat.label}</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* GLOBAL PENDING REGISTRATIONS ACTIVATION */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
          <Users className="w-5 h-5 text-indigo-500" />
          Pending Tenant Registrations Validation
        </h3>

        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Platform-wide registration requests awaiting security validation and activation. Approving a user enables their credentials immediately for the respective tenant.
          </p>

          {users.filter(u => u.status === 'pending').length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs">
              No pending registrations require validation on the platform.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <th className="py-2.5 px-3">Delegate Name</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Affiliation</th>
                    <th className="py-2.5 px-3">Conference Tenant</th>
                    <th className="py-2.5 px-3">Requested Role</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.status === 'pending').map(u => {
                    const conf = conferences.find(c => c.id === u.conferenceId);
                    return (
                      <tr key={u.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 font-bold flex items-center justify-center text-[10px]">
                            {u.name.charAt(0)}
                          </div>
                          {u.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{u.email}</td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{u.affiliation}</td>
                        <td className="py-3 px-3 font-semibold text-slate-850 dark:text-slate-250">
                          {conf ? conf.name.split(' (')[0] : 'Global'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-655 dark:text-indigo-400">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <button
                            onClick={() => activateUser(u.id)}
                            className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded text-[10px] shadow-sm cursor-pointer transition animate-in fade-in"
                          >
                            Activate Account
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="px-2.5 py-1 bg-red-650 hover:bg-red-700 text-white font-bold rounded text-[10px] shadow-sm cursor-pointer transition animate-in fade-in"
                          >
                            Decline
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* CREATE CONFERENCE TENANT */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
            <Plus className="w-5 h-5 text-indigo-500" />
            Provision New Conference Site
          </h3>

          <form onSubmit={handleCreateConf} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Conference Name</label>
                <input
                  type="text"
                  placeholder="International Conference on Biotech (ICB 2026)"
                  value={newConfName}
                  onChange={(e) => setNewConfName(e.target.value)}
                  required
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Acronym</label>
                <input
                  type="text"
                  placeholder="ICB 2026"
                  value={newConfAcronym}
                  onChange={(e) => setNewConfAcronym(e.target.value)}
                  required
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Start Date</label>
                <input
                  type="date"
                  value={newConfStart}
                  onChange={(e) => setNewConfStart(e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">End Date</label>
                <input
                  type="date"
                  value={newConfEnd}
                  onChange={(e) => setNewConfEnd(e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Venue / Location</label>
              <input
                type="text"
                placeholder="E.g. Geneva, Switzerland"
                value={newConfVenue}
                onChange={(e) => setNewConfVenue(e.target.value)}
                required
                className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg cursor-pointer transition shadow-xs"
            >
              Add Tenant Site
            </button>
          </form>

          {confSuccess && (
            <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/10 rounded-lg text-xs font-semibold">
              Conference tenant initialized successfully! Theme default set to Indigo.
            </div>
          )}
        </div>

        {/* PROVISION USER ACCOUNTS & ASSIGN ROLES */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
            <PlusCircle className="w-5 h-5 text-indigo-500" />
            Provision Management Accounts & RBAC Assignment
          </h3>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Full Name</label>
              <input
                type="text"
                placeholder="Dr. Mark Sterling"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
                className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Email Address</label>
                <input
                  type="email"
                  placeholder="m.sterling@domain.edu"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Role / Assignment</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="President">Conference President (Global Admin)</option>
                  <option value="POC">POC (Organizing Logistics, Support)</option>
                  <option value="PSC">PSC (Scientific Overseer)</option>
                  <option value="Reviewer">Reviewer (Evaluations)</option>
                  <option value="Author">Author/Participant</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Affiliation</label>
                <input
                  type="text"
                  placeholder="E.g. Oxford University"
                  value={newUserAffiliation}
                  onChange={(e) => setNewUserAffiliation(e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Assign to Conference Tenant</label>
                <select
                  value={newUserConf}
                  onChange={(e) => setNewUserConf(e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  {conferences.map(c => (
                    <option key={c.id} value={c.id}>{c.name.split(' (')[0]}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg cursor-pointer transition shadow-xs"
            >
              Provision Account
            </button>
          </form>

          {userSuccess && (
            <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/10 rounded-lg text-xs font-semibold">
              Account created and permissions provisioned in role: {newUserRole}!
            </div>
          )}
        </div>

      </div>

      {/* CONFERENCES DIRECTORY */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Conferences Directory</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                <th className="py-3 px-4">Conference Details</th>
                <th className="py-3 px-4">Venue & City</th>
                <th className="py-3 px-4">Timeline</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {conferences.map(conf => (
                <tr key={conf.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition text-xs">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img src={conf.logo} alt="Logo" className="w-8 h-8 rounded object-cover border" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm block">{conf.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">ID: {conf.id}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {conf.venue}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium">
                    {conf.startDate} to {conf.endDate}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => alert(`Reviewing settings for tenant ID: ${conf.id} (Direct mock bypass)`)}
                      className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer"
                    >
                      Audit tenant
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DATABASE INTEGRATIONS & CREDENTIALS MIGRATION PANEL */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Supabase Live Database Integration & Migration</h3>
          <p className="text-xs text-slate-500">Provide Supabase API parameters and export schemas to migrate from mock localStorage to server-side relational tables.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setDbConfigSuccess(true); setTimeout(() => setDbConfigSuccess(false), 4000); }} className="space-y-4">
          {dbConfigSuccess && (
            <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/15 rounded-xl text-xs font-semibold text-center animate-in zoom-in-95">
              Configuration parameters stored! Supabase context listeners initialized.
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Supabase URL</label>
              <input
                type="url"
                required
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">JWT Secret Key</label>
              <input
                type="password"
                required
                value={jwtSecret}
                onChange={(e) => setJwtSecret(e.target.value)}
                className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Anon API Key</label>
            <input
              type="text"
              required
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition cursor-pointer"
            >
              Update Credentials
            </button>
            <button
              type="button"
              onClick={handleExportSql}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition cursor-pointer"
            >
              Export Schema SQL Scripts
            </button>
          </div>
        </form>
      </section>

    </div>
  );
}
