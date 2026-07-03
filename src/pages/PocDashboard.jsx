import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { 
  MessageSquare, Mail, BarChart3, Image, Check, Trash2, Send, Download, Upload, Plus, AlertCircle, FileText, Settings, Award
} from 'lucide-react';

export default function PocDashboard() {
  const {
    tickets,
    replyToSupportTicket,
    updateTicketStatus,
    users,
    createNewUser,
    sendEmailCampaign,
    mailingHistory,
    gallery,
    approveGalleryPhoto,
    deleteGalleryPhoto,
    currentConference,
    surveySubmissions,
    votes,
    posters,
    papers
  } = useDatabase();

  const [pocTab, setPocTab] = useState('tickets');

  // Support Tickets
  const coTickets = tickets.filter(t => t.assignedTo === 'CO');
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const selectedTicket = coTickets.find(t => t.id === activeTicketId);

  // Email Campaign States
  const [emailSubject, setEmailSubject] = useState('');
  const [emailSegment, setEmailSegment] = useState('All Registered Participants');
  const [emailBody, setEmailBody] = useState('');
  const [mailSuccess, setMailSuccess] = useState(false);

  // DB Contacts Segmentation state
  const [selectedContactSegment, setSelectedContactSegment] = useState('All'); // 'All', 'Student', 'Lab Chief', 'Diaspora', 'Engineer', 'Industrial'

  // CSV Import State
  const [csvInput, setCsvInput] = useState('');
  const [importCount, setImportCount] = useState(0);

  // Publipostage (Badges & Attestations)
  const [badgeTemplate, setBadgeTemplate] = useState('attendance'); // 'attendance', 'badge', 'presenter'
  const [isGeneratingPubli, setIsGeneratingPubli] = useState(false);

  const confUsers = users.filter(u => u.conferenceId === currentConference.id);
  const confVotes = votes.filter(v => v.conferenceId === currentConference.id);
  const confSurveys = surveySubmissions.filter(s => s.conferenceId === currentConference.id);

  // Filter contacts by segment
  const getContactsBySegment = () => {
    if (selectedContactSegment === 'All') return confUsers;
    return confUsers.filter(u => u.segment === selectedContactSegment || u.attribute === selectedContactSegment);
  };
  const segmentedContactsList = getContactsBySegment();

  // Calculate vote totals for candidate posters and papers
  const getLeaderboardData = (category) => {
    const counts = {};
    confVotes.filter(v => v.category === category).forEach(v => {
      counts[v.candidateId] = (counts[v.candidateId] || 0) + 1;
    });
    
    // Sort candidates by vote count
    return Object.entries(counts)
      .map(([candidateId, count]) => {
        let name = 'Unknown';
        if (category === 'Best Poster' || category === 'best_poster') {
          name = posters.find(p => p.id === candidateId)?.title || candidateId;
        } else {
          name = papers.find(p => p.id === candidateId)?.title || candidateId;
        }
        return { name, count };
      })
      .sort((a, b) => b.count - a.count);
  };

  const posterLeaderboard = getLeaderboardData('Best Poster');
  const presentationLeaderboard = getLeaderboardData('Best Presentation');

  // Calculate satisfaction survey stats
  const calculateSurveyStats = () => {
    if (confSurveys.length === 0) return { avgOrg: 0, avgContent: 0 };
    const totalOrg = confSurveys.reduce((sum, s) => sum + (s.ratingOrganization || 5), 0);
    const totalContent = confSurveys.reduce((sum, s) => sum + (s.ratingContent || 5), 0);
    return {
      avgOrg: (totalOrg / confSurveys.length).toFixed(1),
      avgContent: (totalContent / confSurveys.length).toFixed(1)
    };
  };
  const stats = calculateSurveyStats();

  const handleReplyTicket = (e) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !activeTicketId) return;
    replyToSupportTicket(activeTicketId, ticketReplyText);
    updateTicketStatus(activeTicketId, 'Closed');
    setTicketReplyText('');
    alert('Reply sent and ticket resolved (Closed).');
  };

  const handleSendMailCampaign = (e) => {
    e.preventDefault();
    if (!emailSubject || !emailBody) return;
    sendEmailCampaign(emailSubject, emailSegment, emailBody);
    setMailSuccess(true);
    setEmailSubject('');
    setEmailBody('');
    setTimeout(() => setMailSuccess(false), 4000);
  };

  const handleCsvImport = () => {
    if (!csvInput.trim()) return;
    const rows = csvInput.split('\n');
    let added = 0;
    rows.forEach(row => {
      const parts = row.split(',');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const email = parts[1].trim();
        const affiliation = parts[2] ? parts[2].trim() : 'External Institution';
        const segment = parts[3] ? parts[3].trim() : 'Student';
        
        if (name.toLowerCase() === 'name' || email.toLowerCase() === 'email') return;

        createNewUser({
          name,
          email,
          role: 'Participant',
          affiliation,
          segment,
          status: 'active',
          photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60'
        });
        added++;
      }
    });
    setImportCount(added);
    setCsvInput('');
    setTimeout(() => setImportCount(0), 4000);
  };

  const handleDownloadCSV = () => {
    let csv = "Name,Email,Affiliation,Segment\n";
    segmentedContactsList.forEach(u => {
      csv += `"${u.name}","${u.email}","${u.affiliation || ''}","${u.segment || 'Student'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${currentConference.id}_segmented_contacts.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGeneratePubli = () => {
    setIsGeneratingPubli(true);
    setTimeout(() => {
      setIsGeneratingPubli(false);
      let content = `SYMPOVEX PUBLIPOSTAGE EXPORT\nTemplate: ${badgeTemplate.toUpperCase()}\nDate: ${new Date().toLocaleDateString()}\n\n`;
      confUsers.forEach(u => {
        content += `----------------------------------------\n`;
        content += `RECIPIENT: ${u.name}\n`;
        content += `EMAIL: ${u.email}\n`;
        content += `AFFILIATION: ${u.affiliation}\n`;
        if (badgeTemplate === 'badge') {
          content += `ACCESS LEVEL: DELEGATE / PARTICIPANT\n`;
          content += `CONFERENCE: ${currentConference.name}\n`;
        } else {
          content += `STATEMENT: Attests presence at the scientific sessions of the summit.\n`;
        }
        content += `----------------------------------------\n\n`;
      });
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${currentConference.id}_publipostage_export.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-350">
      
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Organizing Committee (POC) Dashboard</h2>
        <p className="text-sm text-slate-500">Manage support tickets, create questionnaires, publipostage badges, segment database, and check real-time votes leaderboards.</p>
      </div>

      {/* DASHBOARD ROUTER TABS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        {[
          { id: 'tickets', label: 'Support Tickets', icon: MessageSquare },
          { id: 'surveys', label: 'Satisfaction Survey Stats', icon: BarChart3 },
          { id: 'segmentation', label: 'DB Segmentation', icon: Settings },
          { id: 'publi', label: 'Attestations & Badges', icon: FileText },
          { id: 'leaderboard', label: 'Votes Leaderboard', icon: Award },
          { id: 'mailing', label: 'Smart Mailing Lists', icon: Mail },
          { id: 'gallery', label: 'Live Photo Moderation', icon: Image }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setPocTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 border-b-2 text-sm font-semibold transition whitespace-nowrap cursor-pointer -mb-px ${
                pocTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SUPPORT TICKETS */}
      {pocTab === 'tickets' && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs max-h-[60vh] overflow-y-auto">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wide">Support Tickets Inbox</h3>
            <div className="space-y-2">
              {coTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setActiveTicketId(ticket.id)}
                  className={`p-3 rounded-lg border transition cursor-pointer text-left ${
                    activeTicketId === ticket.id ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-850 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-primary/10 text-primary rounded font-bold uppercase">
                      {ticket.category}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      ticket.status === 'Open' ? 'bg-green-500/10 text-green-600' : 'bg-slate-150 text-slate-500'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 mt-1">{ticket.subject}</h4>
                  <span className="text-[10px] text-slate-450 block">Sender: {ticket.senderName}</span>
                </div>
              ))}
              {coTickets.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs italic">No support tickets found.</div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xs min-h-[40vh] flex flex-col justify-between">
            {selectedTicket ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <div>
                      <span className="text-xs text-primary font-bold uppercase tracking-wider">{selectedTicket.category} Query</span>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-0.5">{selectedTicket.subject}</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">ID: {selectedTicket.id}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 block">Original message by {selectedTicket.senderName}:</span>
                    <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-medium">
                      {selectedTicket.message}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Reply History</h4>
                    {selectedTicket.replies.map(r => (
                      <div key={r.id} className="text-xs p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg">
                        <div className="flex justify-between font-semibold">
                          <span>{r.senderName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{new Date(r.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-1">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleReplyTicket} className="pt-4 border-t space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Write response to resolve logistical query..."
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    required
                    className="w-full text-xs rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 bg-primary hover:bg-secondary text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer">
                      Send Response & Close Ticket
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center italic text-xs">
                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" /> Select a support ticket to reply.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SATISFACTION SURVEY GRAPHICS */}
      {pocTab === 'surveys' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs text-center space-y-3">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">General Organization Rating</h3>
              <div className="text-4xl font-extrabold text-primary font-mono">{stats.avgOrg} / 5.0</div>
              <div className="w-full bg-slate-100 dark:bg-slate-850 h-3 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all" style={{ width: `${(stats.avgOrg / 5) * 100}%` }} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs text-center space-y-3">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Scientific Content Rating</h3>
              <div className="text-4xl font-extrabold text-primary font-mono">{stats.avgContent} / 5.0</div>
              <div className="w-full bg-slate-100 dark:bg-slate-850 h-3 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all" style={{ width: `${(stats.avgContent / 5) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-2">Participant Comments Feedback</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {confSurveys.map(item => (
                <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-dashed text-xs text-slate-700 dark:text-slate-350">
                  <div className="flex justify-between font-bold text-[10px] text-slate-400 mb-1">
                    <span>Org: {item.ratingOrganization} ★ | Content: {item.ratingContent} ★</span>
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="italic">"{item.comments || 'No written comments.'}"</p>
                </div>
              ))}
              {confSurveys.length === 0 && (
                <div className="text-center py-10 text-slate-405 italic">No survey responses received.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTACTS SEGMENTATION */}
      {pocTab === 'segmentation' && (
        <div className="space-y-6">
          <div className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-900 p-4 border rounded-xl shadow-xs gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Segment:</span>
              <select
                value={selectedContactSegment}
                onChange={(e) => setSelectedContactSegment(e.target.value)}
                className="text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="All">All Categories (Tout)</option>
                <option value="Student">Student (Étudiant)</option>
                <option value="Lab Chief">Lab Chief (Chef de Labo)</option>
                <option value="Diaspora">Diaspora</option>
                <option value="Engineer">Engineer (Ingénieur)</option>
                <option value="Industrial">Industrial (Industriel)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDownloadCSV}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg border flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export Segment CSV
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-2">Segmented Contacts List ({segmentedContactsList.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 dark:bg-slate-900/50 text-slate-400 font-bold">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Affiliation</th>
                    <th className="p-3">Segment Type</th>
                  </tr>
                </thead>
                <tbody>
                  {segmentedContactsList.map(u => (
                    <tr key={u.id} className="border-b hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{u.name}</td>
                      <td className="p-3 font-mono text-slate-500">{u.email}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{u.affiliation}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full font-bold text-[9px] uppercase">
                          {u.segment || 'Student'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BADGES & ATTESTATIONS GENERATION */}
      {pocTab === 'publi' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Badges & Attestations Mail Merge (Publipostage)</h3>
            <p className="text-xs text-slate-500">Mass-generate PDF access badges and presence certifications for all registered conference delegates.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Template Predesigned Layout</label>
              <select
                value={badgeTemplate}
                onChange={(e) => setBadgeTemplate(e.target.value)}
                className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="attendance">Presence Certificate (Attestation de présence)</option>
                <option value="badge">Access Badge (Badge d'Accès)</option>
                <option value="presenter">Presenter Certificate (Attestation de communication)</option>
              </select>
            </div>

            {/* Render Preview Mock */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-dashed rounded-xl flex items-center justify-center min-h-[25vh]">
              {badgeTemplate === 'badge' ? (
                <div className="w-52 bg-white dark:bg-slate-900 border-2 border-primary rounded-xl p-4 text-center space-y-4 shadow-md font-mono relative">
                  <span className="w-full h-2 bg-primary absolute top-0 left-0" />
                  <div className="font-black text-slate-900 dark:text-white text-xs mt-2 uppercase tracking-wide">GACS 2026</div>
                  <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto" />
                  <div>
                    <div className="font-extrabold text-[11px] text-slate-900">Cleo Sterling</div>
                    <div className="text-[9px] text-slate-400">Oxford University</div>
                  </div>
                  <div className="text-[10px] font-extrabold bg-primary text-white py-0.5 rounded uppercase">Delegate</div>
                </div>
              ) : (
                <div className="w-72 bg-white dark:bg-slate-900 border p-5 space-y-3 text-[10px] shadow-sm leading-relaxed text-slate-600 dark:text-slate-350">
                  <h4 className="font-bold text-slate-950 dark:text-white uppercase tracking-wider text-center text-xs">Certificate of Scientific Attendance</h4>
                  <p className="text-center font-serif italic">This certifies that</p>
                  <p className="text-center font-extrabold text-slate-950 dark:text-white text-xs border-b pb-1">Cleo Sterling</p>
                  <p className="font-serif">has successfully participated and attended the scientific presentations during the Global AI & Cyber-Security Summit, held in Paris, France.</p>
                </div>
              )}
            </div>

            <button
              onClick={handleGeneratePubli}
              disabled={isGeneratingPubli}
              className="w-full py-2.5 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg transition shadow-md shadow-primary/10 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isGeneratingPubli ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Compiling badges...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Generate & Export Attestations (Publipostage ZIP)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: PUBLIC VOTE LEADERBOARD */}
      {pocTab === 'leaderboard' && (
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Best Poster Leaderboard */}
          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Award className="w-5 h-5 text-amber-500 animate-bounce" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase">Best Poster Leaderboard</h3>
            </div>

            <div className="space-y-3">
              {posterLeaderboard.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border text-xs">
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <span className="font-bold text-primary font-mono text-xs">#{idx + 1}</span>
                    <span className="font-semibold text-slate-900 dark:text-white truncate" title={item.name}>{item.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-655 dark:text-slate-250 font-mono text-xs">
                    {item.count} Votes
                  </span>
                </div>
              ))}
              {posterLeaderboard.length === 0 && (
                <div className="text-center py-10 text-slate-400 italic text-xs">No public votes cast for best poster.</div>
              )}
            </div>
          </div>

          {/* Best Presentation Leaderboard */}
          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Award className="w-5 h-5 text-amber-500 animate-bounce" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase">Best Oral Presentation Leaderboard</h3>
            </div>

            <div className="space-y-3">
              {presentationLeaderboard.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border text-xs">
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <span className="font-bold text-primary font-mono text-xs">#{idx + 1}</span>
                    <span className="font-semibold text-slate-900 dark:text-white truncate" title={item.name}>{item.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-655 dark:text-slate-250 font-mono text-xs">
                    {item.count} Votes
                  </span>
                </div>
              ))}
              {presentationLeaderboard.length === 0 && (
                <div className="text-center py-10 text-slate-400 italic text-xs">No public votes cast for best presentation.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SMART MAILING */}
      {pocTab === 'mailing' && (
        <div className="grid md:grid-cols-3 gap-8">
          <form onSubmit={handleSendMailCampaign} className="md:col-span-2 bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase border-b pb-2">Create E-mail Campaign</h3>
            
            {mailSuccess && (
              <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/15 rounded-xl text-xs font-semibold text-center animate-in zoom-in-95">
                E-mailing campaign blasted and queued successfully !
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Mailing Segment</label>
                <select
                  value={emailSegment}
                  onChange={(e) => setEmailSegment(e.target.value)}
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="All Registered Participants">All Registered Participants</option>
                  <option value="Student">PhD & Graduate Students</option>
                  <option value="Lab Chief">Laboratory Heads & Chiefs</option>
                  <option value="Diaspora">Scientific Diaspora</option>
                  <option value="Engineer">Engineers</option>
                  <option value="Industrial">Industrial Partners</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">E-mail Campaign Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Official Notice: Schedule revisions..."
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Campaign Body content (Rich Text HTML format)</label>
              <textarea
                rows={6}
                required
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="<p>Dear attendees...</p>"
                className="w-full text-xs font-mono rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>

            <button type="submit" className="w-full py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg transition shadow-md shadow-primary/10 cursor-pointer">
              Queue and Dispatch E-mail Campaign
            </button>
          </form>

          <div className="md:col-span-1 bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase border-b pb-2">Mailing History logs</h3>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {mailingHistory.filter(m => m.conferenceId === currentConference.id).map(mail => (
                <div key={mail.id} className="p-3 bg-slate-50 dark:bg-slate-850 border rounded-xl text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">{mail.subject}</div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Segment: {mail.recipientSegment}</span>
                    <span>Sent: {mail.sentCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: LIVE GALLERY PHOTO MODERATION */}
      {pocTab === 'gallery' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Real-Time Photo Moderation</h3>
            <p className="text-xs text-slate-500">Approve photos uploaded by participants so they appear in the public landing page gallery.</p>
          </div>

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
                      item.status === 'approved' ? 'bg-green-500/10 text-green-650' : 'bg-amber-500/10 text-amber-655'
                    }`}>
                      {item.status || 'pending'}
                    </span>
                    <div className="flex gap-1.5">
                      {item.status !== 'approved' && (
                        <button
                          onClick={() => { approveGalleryPhoto(item.id); alert('Photo approved successfully.'); }}
                          className="p-1 hover:bg-green-500/10 text-green-600 rounded cursor-pointer"
                          title="Approve & Show in Gallery"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => { if (window.confirm("Confirm deletion of photo?")) deleteGalleryPhoto(item.id); }}
                        className="p-1 hover:bg-red-500/10 text-red-500 rounded cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {gallery.filter(item => item.conferenceId === currentConference.id).length === 0 && (
              <div className="col-span-3 text-center py-20 text-slate-400 italic text-xs">No photos uploaded yet.</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
