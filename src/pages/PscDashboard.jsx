import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  FileText, UserCheck, MessageSquare, Check, X, Send, AlertCircle, RefreshCw,
  Plus, Edit, Trash2, Download, Upload, Mail, Users, Settings, Search, BookOpen,
  Eye, Clock, CheckCircle, ChevronRight, BookMarked, BarChart2
} from 'lucide-react';

export default function PscDashboard() {
  const {
    papers,
    reviews,
    users,
    tickets,
    topics,
    currentConference,
    assignReviewersToPaper,
    updatePaperStatus,
    replyToSupportTicket,
    updateTicketStatus,
    addTopic,
    updateTopic,
    deleteTopic,
    addPaper,
    updatePaper,
    deletePaper,
    promoteParticipantToReviewer,
    adminCreateUser,
    sendEmailCampaign,
    evaluationCriteria,
    addCriterion,
    deleteCriterion,
    updateConferenceGuidelines,
    dispatchReviewReport
  } = useDatabase();

  const { session } = useAuth();
  const { t } = useLanguage();

  // Tab State
  const [pscTab, setPscTab] = useState('papers');

  // Search & Filter States
  const [paperSearch, setPaperSearch] = useState('');
  const [paperTopicFilter, setPaperTopicFilter] = useState('');
  
  const [partSearch, setPartSearch] = useState('');

  // CRUD Modals and form states
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [paperModalMode, setPaperModalMode] = useState('create'); // 'create' or 'edit'
  const [editingPaperId, setEditingPaperId] = useState(null);
  const [formPaperTitle, setFormPaperTitle] = useState('');
  const [formPaperAbstract, setFormPaperAbstract] = useState('');
  const [formPaperKeywords, setFormPaperKeywords] = useState('');
  const [formPaperSubmitterId, setFormPaperSubmitterId] = useState('');
  const [formPaperAuthors, setFormPaperAuthors] = useState([{ name: '', affiliation: '', email: '' }]);
  const [formPaperTopicIds, setFormPaperTopicIds] = useState([]);

  // Topic Form States
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicModalMode, setTopicModalMode] = useState('create'); // 'create' or 'edit'
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [formTopicName, setFormTopicName] = useState('');
  const [formTopicDesc, setFormTopicDesc] = useState('');

  // Provisioning Form States
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provRole, setProvRole] = useState('Participant');
  const [provAffiliation, setProvAffiliation] = useState('');
  const [provPassword, setProvPassword] = useState('');
  const [provSuccess, setProvSuccess] = useState(false);
  const [provError, setProvError] = useState('');

  // Email Overlay States
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Guidelines State — lazy-init from conference once loaded
  const [guidelinesText, setGuidelinesText] = useState(() => currentConference?.authorInstructions || '');
  // Criteria State
  const [critName, setCritName] = useState('');
  const [critMaxScore, setCritMaxScore] = useState(5);

  const handleSaveGuidelines = (e) => {
    e.preventDefault();
    updateConferenceGuidelines(guidelinesText);
    alert('Guidelines updated and saved successfully.');
  };

  const handleCreateCriterion = (e) => {
    e.preventDefault();
    if (!critName) return;
    addCriterion({ name: critName, maxScore: Number(critMaxScore) });
    setCritName('');
    setCritMaxScore(5);
    alert('Evaluation criterion added successfully.');
  };

  // Reviewer assignment state
  const [assigningPaperId, setAssigningPaperId] = useState(null);
  const [selectedReviewerId, setSelectedReviewerId] = useState('');

  // Paper Detail Drawer
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [pscNote, setPscNote] = useState('');
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [drawerTab, setDrawerTab] = useState('history'); // 'history' | 'reports' | 'validate'

  // Support ticket state
  const pscTickets = tickets.filter(t => t.assignedTo === 'CS');
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Derived lists
  const confPapers = papers.filter(p => p.conferenceId === currentConference.id);
  const confTopics = topics.filter(t => t.conferenceId === currentConference.id);
  const participants = users.filter(u => u.conferenceId === currentConference.id && u.role === 'Participant');
  const reviewersList = users.filter(u => u.roles && u.roles.includes('Reviewer') && u.conferenceId === currentConference.id);

  // Filter papers
  const filteredPapers = confPapers.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(paperSearch.toLowerCase()) ||
      p.keywords.toLowerCase().includes(paperSearch.toLowerCase()) ||
      p.authors.some(a => a.name.toLowerCase().includes(paperSearch.toLowerCase()));
    const matchesTopic = !paperTopicFilter || p.topicIds?.includes(paperTopicFilter);
    return matchesSearch && matchesTopic;
  });

  // Filter participants
  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
    p.email.toLowerCase().includes(partSearch.toLowerCase()) ||
    p.affiliation.toLowerCase().includes(partSearch.toLowerCase())
  );

  // Helper to calculate score
  const calcAverageScore = (paperId) => {
    const paperReviews = reviews.filter(r => r.paperId === paperId);
    if (paperReviews.length === 0) return 'N/A';
    const total = paperReviews.reduce((sum, r) => sum + r.originality + r.methodology + r.relevance, 0);
    return (total / (paperReviews.length * 3)).toFixed(1) + ' / 5.0';
  };

  // Helper to download CSV
  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export submissions
  const handleExportPapers = () => {
    let csv = "ID,Title,Status,Submitter,Reviewers,Topics,Average Score\n";
    filteredPapers.forEach(p => {
      const topicNames = p.topicIds ? p.topicIds.map(id => confTopics.find(t => t.id === id)?.name || id).join('; ') : 'N/A';
      const reviewerNames = p.reviewerIds.map(id => users.find(u => u.id === id)?.name || id).join('; ');
      csv += `"${p.id}","${p.title.replace(/"/g, '""')}","${p.status}","${users.find(u => u.id === p.submitterId)?.name || 'N/A'}","${reviewerNames}","${topicNames}","${calcAverageScore(p.id)}"\n`;
    });
    downloadCSV(csv, `${currentConference.id}_submissions.csv`);
  };

  // Export participants
  const handleExportParticipants = () => {
    let csv = "ID,Name,Email,Affiliation,Registered At,Roles\n";
    filteredParticipants.forEach(p => {
      csv += `"${p.id}","${p.name}","${p.email}","${p.affiliation}","${p.registeredAt ? new Date(p.registeredAt).toLocaleDateString() : 'N/A'}","${p.roles ? p.roles.join('; ') : p.role}"\n`;
    });
    downloadCSV(csv, `${currentConference.id}_participants.csv`);
  };

  // Import participants simulator
  const handleImportSimulator = () => {
    // Inject 3 new pending participants with custom names
    const newGuests = [
      { name: 'Dr. Sarah Connor', email: 's.connor@cyberdyne.org', affiliation: 'Skynet Defense Lab' },
      { name: 'Prof. John Doe', email: 'j.doe@mit.edu', affiliation: 'MIT CSAIL' },
      { name: 'Alice Wonderland', email: 'alice.w@logic.net', affiliation: 'Oxford Quantum Lab' }
    ];

    let count = 0;
    newGuests.forEach(g => {
      const res = adminCreateUser({
        name: g.name,
        email: g.email,
        affiliation: g.affiliation,
        role: 'Participant',
        password: 'temporary123'
      });
      if (res.success) count++;
    });

    alert(`Spreadsheet Import Simulation successful! Imported ${count} new participants. They require first-login password changes.`);
  };

  // Handle Reviewer Assignment
  const handleAssignReviewer = (e) => {
    e.preventDefault();
    if (!selectedReviewerId || !assigningPaperId) return;

    const paper = papers.find(p => p.id === assigningPaperId);
    if (!paper) return;

    if (paper.reviewerIds.includes(selectedReviewerId)) {
      alert('Reviewer already assigned to this paper!');
      return;
    }

    const updatedReviewers = [...paper.reviewerIds, selectedReviewerId];
    assignReviewersToPaper(assigningPaperId, updatedReviewers);
    updatePaperStatus(assigningPaperId, 'Under Review');

    setSelectedReviewerId('');
    setAssigningPaperId(null);
    alert('Reviewer assigned and paper status set to Under Review.');
  };

  // Dispatch review report to author
  const handleDispatchReport = () => {
    if (!selectedPaper) return;
    if (!window.confirm(t('dispatchConfirm'))) return;
    dispatchReviewReport(selectedPaper.id, pscNote);
    setDispatchSuccess(true);
    setPscNote('');
    setTimeout(() => setDispatchSuccess(false), 5000);
  };

  // Reject submission
  const handleRejectPaper = () => {
    if (!selectedPaper) return;
    if (!window.confirm(t('rejectConfirm'))) return;
    updatePaperStatus(selectedPaper.id, 'Rejected');
    setSelectedPaper(null);
  };

  // Open detail drawer
  const openPaperDetail = (paper) => {
    setSelectedPaper(paper);
    setPscNote(paper.pscValidationNote || '');
    setDispatchSuccess(false);
    setDrawerTab('history');
  };

  // Paper CRUD Submit
  const handlePaperSubmit = (e) => {
    e.preventDefault();
    if (!formPaperTitle || !formPaperAbstract || !formPaperKeywords) return;

    const paperData = {
      title: formPaperTitle,
      abstract: formPaperAbstract,
      keywords: formPaperKeywords,
      submitterId: formPaperSubmitterId || 'usr_author1',
      authors: formPaperAuthors.filter(a => a.name),
      topicIds: formPaperTopicIds
    };

    if (paperModalMode === 'create') {
      addPaper(paperData);
      alert('Manuscript submission manually added successfully.');
    } else {
      updatePaper(editingPaperId, paperData);
      alert('Manuscript updated successfully.');
    }

    setIsPaperModalOpen(false);
    resetPaperForm();
  };

  const resetPaperForm = () => {
    setFormPaperTitle('');
    setFormPaperAbstract('');
    setFormPaperKeywords('');
    setFormPaperSubmitterId('');
    setFormPaperAuthors([{ name: '', affiliation: '', email: '' }]);
    setFormPaperTopicIds([]);
    setEditingPaperId(null);
  };

  const openEditPaper = (paper) => {
    setPaperModalMode('edit');
    setEditingPaperId(paper.id);
    setFormPaperTitle(paper.title);
    setFormPaperAbstract(paper.abstract);
    setFormPaperKeywords(paper.keywords);
    setFormPaperSubmitterId(paper.submitterId);
    setFormPaperAuthors(paper.authors || [{ name: '', affiliation: '', email: '' }]);
    setFormPaperTopicIds(paper.topicIds || []);
    setIsPaperModalOpen(true);
  };

  // Topic CRUD Submit
  const handleTopicSubmit = (e) => {
    e.preventDefault();
    if (!formTopicName) return;

    if (topicModalMode === 'create') {
      addTopic({ name: formTopicName, description: formTopicDesc });
      alert('Scientific topic added successfully.');
    } else {
      updateTopic(editingTopicId, { name: formTopicName, description: formTopicDesc });
      alert('Scientific topic updated successfully.');
    }

    setIsTopicModalOpen(false);
    setFormTopicName('');
    setFormTopicDesc('');
    setEditingTopicId(null);
  };

  const openEditTopic = (topic) => {
    setTopicModalMode('edit');
    setEditingTopicId(topic.id);
    setFormTopicName(topic.name);
    setFormTopicDesc(topic.description);
    setIsTopicModalOpen(true);
  };

  // Provision User Account
  const handleProvisionUser = (e) => {
    e.preventDefault();
    setProvError('');
    setProvSuccess(false);

    if (!provName || !provEmail || !provPassword) {
      setProvError('Please fill out all required fields.');
      return;
    }

    const res = adminCreateUser({
      name: provName,
      email: provEmail,
      role: provRole,
      affiliation: provAffiliation || 'Independent Researcher',
      password: provPassword
    });

    if (res.success) {
      setProvSuccess(true);
      setProvName('');
      setProvEmail('');
      setProvAffiliation('');
      setProvPassword('');
    } else {
      setProvError(res.error || 'Provisioning failed.');
    }
  };

  // Reply to ticket
  const handleReplyTicket = (e) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !activeTicketId) return;
    replyToSupportTicket(activeTicketId, ticketReplyText);
    updateTicketStatus(activeTicketId, 'Closed');
    setTicketReplyText('');
    alert('Reply sent and ticket resolved (Closed).');
  };

  // Email campaign
  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!emailTo || !emailSubject || !emailBody) return;
    
    sendEmailCampaign(emailSubject, 'Selected Delegates', emailBody);
    setEmailSuccess(true);
    setTimeout(() => {
      setEmailSuccess(false);
      setIsEmailModalOpen(false);
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
    }, 2000);
  };

  const openEmailOverlay = (toEmail, defaultSubject) => {
    setEmailTo(toEmail);
    setEmailSubject(defaultSubject || '');
    setIsEmailModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-350">
      
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('pscConsole')}</h2>
        <p className="text-sm text-slate-500">{t('pscDesc')}</p>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        {[
          { id: 'papers', label: t('tabPapers'), icon: FileText },
          { id: 'topics', label: t('tabTopics'), icon: Settings },
          { id: 'participants', label: t('tabParticipants'), icon: Users },
          { id: 'reviewers', label: t('tabReviewers'), icon: UserCheck },
          { id: 'tickets', label: t('tabTickets'), icon: MessageSquare },
          { id: 'provisioning', label: t('tabProvisioning'), icon: Plus },
          { id: 'guidelines', label: t('tabGuidelines'), icon: BookOpen }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setPscTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 border-b-2 text-sm font-semibold transition whitespace-nowrap cursor-pointer -mb-px ${
                pscTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MASTER SUBMISSIONS DASHBOARD */}
      {pscTab === 'papers' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border rounded-xl shadow-xs">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, author, or keyword..."
                  value={paperSearch}
                  onChange={(e) => setPaperSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <select
                value={paperTopicFilter}
                onChange={(e) => setPaperTopicFilter(e.target.value)}
                className="text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">Filter by Topics...</option>
                {confTopics.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setPaperModalMode('create'); resetPaperForm(); setIsPaperModalOpen(true); }}
                className="px-4 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg transition shadow-md shadow-primary/10 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Submission
              </button>
              <button
                onClick={handleExportPapers}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg border flex items-center gap-1 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export filtered
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b bg-slate-55 dark:bg-slate-900/50 text-slate-400 font-bold uppercase">
                        <th className="p-3">Title & Authors</th>
                        <th className="p-3">Selected Topics</th>
                        <th className="p-3">Assigned Reviewers</th>
                        <th className="p-3">Avg Score</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPapers.map(paper => {
                        const score = calcAverageScore(paper.id);
                        return (
                          <tr key={paper.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                            <td className="p-3 space-y-1 max-w-xs">
                              <span className="font-bold text-slate-900 dark:text-white block truncate">{paper.title}</span>
                              <div className="flex gap-2 text-[10px] text-slate-400">
                                <span>Author: {paper.authors[0]?.name || 'N/A'}</span>
                                <span>•</span>
                                <span>Status: <strong className="text-primary font-bold">{paper.status}</strong></span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {paper.topicIds && paper.topicIds.map(tId => {
                                  const topic = confTopics.find(t => t.id === tId);
                                  return (
                                    <span key={tId} className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 rounded">
                                      {topic ? topic.name.split(' ')[0] : tId}
                                    </span>
                                  );
                                })}
                                {(!paper.topicIds || paper.topicIds.length === 0) && (
                                  <span className="text-[10px] text-slate-400 italic">None</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1 items-center">
                                {paper.reviewerIds.map(rId => {
                                  const rev = reviewersList.find(u => u.id === rId);
                                  return (
                                    <span key={rId} className="text-[9px] font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded-full text-slate-655 dark:text-slate-350">
                                      {rev?.name.split(' ').slice(-1)[0]}
                                    </span>
                                  );
                                })}
                                <button
                                  onClick={() => setAssigningPaperId(paper.id)}
                                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 ml-1 cursor-pointer"
                                >
                                  + Assign
                                </button>
                              </div>
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                              {score}
                            </td>
                            <td className="p-3 text-right space-x-1.5">
                              <button
                                onClick={() => openPaperDetail(paper)}
                                className="p-1 hover:bg-indigo-500/10 rounded text-indigo-500 cursor-pointer"
                                title={t('paperDetail')}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditPaper(paper)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
                                title="Edit manuscript metadata"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { if (window.confirm("Confirm deletion of submission?")) deletePaper(paper.id); }}
                                className="p-1 hover:bg-red-500/10 rounded text-red-400 hover:text-red-600 cursor-pointer"
                                title="Delete submission"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEmailOverlay(paper.authors[0]?.email, `Update on Submission: ${paper.title.slice(0, 30)}...`)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-primary cursor-pointer"
                                title="Contact primary author"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Inline Reviewer Assignment */}
              {assigningPaperId && (
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase flex items-center gap-1">
                      <UserCheck className="w-4 h-4 text-primary" /> Assign Reviewer
                    </h4>
                    <button onClick={() => setAssigningPaperId(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs cursor-pointer">Close</button>
                  </div>
                  <form onSubmit={handleAssignReviewer} className="flex gap-4 items-center">
                    <select
                      value={selectedReviewerId}
                      onChange={(e) => setSelectedReviewerId(e.target.value)}
                      required
                      className="flex-1 text-xs rounded-lg px-3 py-2 bg-white dark:bg-slate-900 border text-slate-900 dark:text-white"
                    >
                      <option value="">Select Reviewer Profile...</option>
                      {reviewersList.map(rev => (
                        <option key={rev.id} value={rev.id}>{rev.name} ({rev.affiliation})</option>
                      ))}
                    </select>
                    <button type="submit" className="px-4 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg cursor-pointer">
                      Commit
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Side panel — click a row to open the Detail Drawer */}
            <div className="md:col-span-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b">{t('consolidatedReviews')}</h4>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {filteredPapers.map(paper => {
                  const paperReviews = reviews.filter(r => r.paperId === paper.id);
                  if (paperReviews.length === 0) return null;
                  return (
                    <div
                      key={paper.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border text-xs space-y-2 cursor-pointer hover:border-primary/40 transition"
                      onClick={() => openPaperDetail(paper)}
                    >
                      <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                        <span className="truncate max-w-[150px]">{paper.title}</span>
                        <span className="text-primary">{calcAverageScore(paper.id)}</span>
                      </div>
                      <div className="space-y-2 pt-1.5 border-t border-dashed">
                        {paperReviews.map(revData => (
                          <div key={revData.id} className="space-y-0.5 text-[10px]">
                            <span className="font-bold block text-slate-655 dark:text-slate-350">
                              {t('reviewerLabel')}: {users.find(u => u.id === revData.reviewerId)?.name || 'N/A'}
                            </span>
                            <p className="text-slate-550 dark:text-slate-450 italic line-clamp-2">"{revData.commentsScientific || revData.comments}"</p>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-primary/70 flex items-center gap-1 font-semibold">
                        <Eye className="w-3 h-3" /> {t('paperDetail')} &rarr;
                      </div>
                    </div>
                  );
                })}
                {confPapers.every(p => reviews.filter(r => r.paperId === p.id).length === 0) && (
                  <div className="text-center py-10 text-slate-400 italic text-xs">{t('noReviewsSidePanel')}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ PAPER DETAIL DRAWER ══════════════════════════════════ */}
      {selectedPaper && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setSelectedPaper(null); }}>
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-start justify-between">
              <div className="space-y-1 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                    {(() => {
                      const p = papers.find(x => x.id === selectedPaper.id) || selectedPaper;
                      return p.status;
                    })()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{t('paperId')}: {selectedPaper.id.toUpperCase()}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{selectedPaper.title}</h3>
                <p className="text-[11px] text-slate-500">
                  {t('paperSubmittedOn')}: {new Date(selectedPaper.versions[0]?.timestamp || Date.now()).toLocaleDateString()}
                  {' · '}{selectedPaper.paperType || 'Extended Paper'}
                  {' · '}{selectedPaper.authors[0]?.name}
                </p>
              </div>
              <button onClick={() => setSelectedPaper(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Sub-Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-2">
              {[
                { id: 'history', label: t('paperReviewHistory'), icon: Clock },
                { id: 'reports', label: t('paperReviewReports'), icon: BarChart2 },
                { id: 'validate', label: t('pscValidationPanel'), icon: CheckCircle }
              ].map(st => {
                const Icon = st.icon;
                return (
                  <button
                    key={st.id}
                    onClick={() => setDrawerTab(st.id)}
                    className={`flex items-center gap-1 px-4 py-2.5 border-b-2 text-xs font-semibold transition whitespace-nowrap cursor-pointer -mb-px ${
                      drawerTab === st.id ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />{st.label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 px-6 py-5 space-y-4">

              {/* ── HISTORY TAB ── */}
              {drawerTab === 'history' && (() => {
                const livePaper = papers.find(x => x.id === selectedPaper.id) || selectedPaper;
                const paperReviews = reviews.filter(r => r.paperId === livePaper.id);
                
                // Build timeline events
                const events = [];
                
                // V1 submission
                livePaper.versions?.forEach((ver, i) => {
                  events.push({
                    type: i === 0 ? 'submit' : 'revision',
                    label: i === 0 ? t('timelineSubmitted') : t('timelineRevisionReceived'),
                    detail: `${ver.version} — ${ver.fileName} (${ver.fileSize})`,
                    ts: ver.timestamp,
                    color: 'indigo'
                  });
                });
                
                // Reviewer assignments
                if (livePaper.reviewerIds?.length > 0) {
                  events.push({
                    type: 'assign',
                    label: t('timelineReviewerAssigned'),
                    detail: livePaper.reviewerIds.map(id => users.find(u => u.id === id)?.name || id).join(', '),
                    ts: livePaper.versions?.[0]?.timestamp,
                    color: 'amber'
                  });
                }
                
                // Reviews received
                paperReviews.forEach(rev => {
                  const totalScore = (rev.scores ? Object.values(rev.scores).reduce((s, v) => s + Number(v), 0) : (rev.originality || 0) + (rev.methodology || 0) + (rev.relevance || 0));
                  const criteriaCount = rev.scores ? Object.keys(rev.scores).length : 3;
                  events.push({
                    type: 'review',
                    label: t('timelineReviewReceived'),
                    detail: `${users.find(u => u.id === rev.reviewerId)?.name || 'Reviewer'} — Score: ${criteriaCount > 0 ? (totalScore / criteriaCount).toFixed(1) : 'N/A'}/5`,
                    ts: rev.timestamp,
                    color: 'emerald'
                  });
                });
                
                // Dispatch event
                if (livePaper.reviewDispatchedAt) {
                  events.push({
                    type: 'dispatch',
                    label: t('timelineReportDispatched'),
                    detail: `PSC → ${livePaper.authors[0]?.email}`,
                    ts: livePaper.reviewDispatchedAt,
                    color: 'violet'
                  });
                }
                
                events.sort((a, b) => new Date(a.ts) - new Date(b.ts));
                
                const colorMap = {
                  indigo: 'bg-indigo-500',
                  amber: 'bg-amber-500',
                  emerald: 'bg-emerald-500',
                  violet: 'bg-violet-500'
                };

                return (
                  <div className="space-y-3">
                    {/* Version Table */}
                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl border p-4">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                        <BookMarked className="w-3.5 h-3.5 text-primary" /> {t('paperVersionHistory')}
                      </h4>
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="text-slate-400 font-bold uppercase border-b">
                            <th className="pb-1.5">{t('colVersion')}</th>
                            <th className="pb-1.5">{t('colFile')}</th>
                            <th className="pb-1.5">{t('colDate')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {livePaper.versions?.map(ver => (
                            <tr key={ver.version} className="border-b last:border-0">
                              <td className="py-1.5 font-mono font-bold text-primary">{ver.version}</td>
                              <td className="py-1.5 text-slate-700 dark:text-slate-300">{ver.fileName}</td>
                              <td className="py-1.5 text-slate-400">{new Date(ver.timestamp).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Timeline */}
                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl border p-4">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" /> {t('paperReviewHistory')}
                      </h4>
                      <div className="relative pl-5 space-y-3">
                        <div className="absolute left-2 top-1 bottom-1 w-px bg-slate-200 dark:bg-slate-700" />
                        {events.map((ev, i) => (
                          <div key={i} className="relative flex items-start gap-3">
                            <div className={`absolute -left-3 w-2.5 h-2.5 rounded-full mt-0.5 border-2 border-white dark:border-slate-900 ${colorMap[ev.color]}`} />
                            <div className="flex-1">
                              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{ev.label}</p>
                              <p className="text-[10px] text-slate-500">{ev.detail}</p>
                              <p className="text-[10px] text-slate-400">{new Date(ev.ts).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                        {events.length === 0 && <p className="text-xs text-slate-400 italic">{t('noResults')}</p>}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── REPORTS TAB ── */}
              {drawerTab === 'reports' && (() => {
                const paperReviews = reviews.filter(r => r.paperId === selectedPaper.id);
                const confCriteria = evaluationCriteria.filter(c => c.conferenceId === (currentConference?.id || 'gacs2026'));
                
                if (paperReviews.length === 0) {
                  return <div className="text-center py-16 text-slate-400 italic text-sm">{t('noReviewsYet')}</div>;
                }

                return (
                  <div className="space-y-5">
                    {paperReviews.map((rev, idx) => {
                      const reviewer = users.find(u => u.id === rev.reviewerId);
                      const scores = rev.scores || { originality: rev.originality || 0, methodology: rev.methodology || 0, relevance: rev.relevance || 0 };
                      const totalScore = Object.values(scores).reduce((s, v) => s + Number(v), 0);
                      const avgScore = (totalScore / Object.keys(scores).length).toFixed(1);
                      
                      return (
                        <div key={rev.id} className="bg-slate-50 dark:bg-slate-800/30 rounded-xl border p-4 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                {t('reviewerLabel')} #{idx + 1}: {reviewer?.name || 'Anonymous'}
                              </p>
                              <p className="text-[10px] text-slate-400">{reviewer?.affiliation}</p>
                              <p className="text-[10px] text-slate-400">{new Date(rev.timestamp).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-black text-primary">{avgScore}<span className="text-xs font-normal text-slate-400">/5</span></p>
                              <p className="text-[10px] text-slate-400">{t('overallScore')}</p>
                            </div>
                          </div>

                          {/* Criteria Scores */}
                          <div className="grid grid-cols-2 gap-2">
                            {(confCriteria.length > 0 ? confCriteria : [
                              { id: 'originality', name: 'Originality' },
                              { id: 'methodology', name: 'Methodology' },
                              { id: 'relevance', name: 'Relevance' }
                            ]).map(crit => {
                              const sc = rev.scores?.[crit.id] ?? rev[crit.id.toLowerCase()] ?? 0;
                              const max = crit.maxScore || 5;
                              return (
                                <div key={crit.id} className="bg-white dark:bg-slate-900 border rounded-lg p-2.5">
                                  <p className="text-[10px] font-bold text-slate-500 truncate">{crit.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div className="h-full bg-primary rounded-full" style={{ width: `${(sc / max) * 100}%` }} />
                                    </div>
                                    <span className="text-xs font-mono font-bold text-primary">{sc}/{max}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Form Remarks */}
                          {(rev.commentsForm || rev.comments) && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{t('formRemarks')}</p>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-900 border rounded-lg p-2.5">
                                "{rev.commentsForm || rev.comments}"
                              </p>
                            </div>
                          )}

                          {/* Scientific Remarks */}
                          {rev.commentsScientific && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{t('scientificRemarks')}</p>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-900 border rounded-lg p-2.5">
                                "{rev.commentsScientific}"
                              </p>
                            </div>
                          )}

                          {/* Presentation Recommendation */}
                          {rev.presentationFormat && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">{t('recommendedFormat')}:</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                rev.presentationFormat === 'oral'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                              }`}>
                                {rev.presentationFormat === 'oral' ? t('oralFormat') : t('posterFormat')}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* ── VALIDATION TAB ── */}
              {drawerTab === 'validate' && (() => {
                const livePaper = papers.find(x => x.id === selectedPaper.id) || selectedPaper;
                const paperReviews = reviews.filter(r => r.paperId === livePaper.id);
                const alreadyDispatched = livePaper.status === 'Review Dispatched';

                return (
                  <div className="space-y-5">

                    {/* Status Banner */}
                    {alreadyDispatched && (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {t('reportAlreadySent')}
                        <span className="ml-auto text-[10px] font-normal text-emerald-500">
                          {livePaper.reviewDispatchedAt && new Date(livePaper.reviewDispatchedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {dispatchSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> {t('dispatchSuccess')}
                      </div>
                    )}

                    {/* Review summary */}
                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl border p-4 space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <BarChart2 className="w-3.5 h-3.5 text-primary" /> {t('paperReviewReports')} — {t('overallScore')}: {calcAverageScore(livePaper.id)}
                      </h4>
                      <p className="text-[11px] text-slate-500">{paperReviews.length} {paperReviews.length === 1 ? 'rapport reçu' : 'rapports reçus'} · Statut actuel: <strong className="text-primary">{livePaper.status}</strong></p>
                    </div>

                    {/* PSC Note */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('pscValidationNote')}</label>
                      <textarea
                        rows={4}
                        value={pscNote}
                        onChange={e => setPscNote(e.target.value)}
                        placeholder={t('pscValidationNotePlaceholder')}
                        disabled={alreadyDispatched}
                        className="w-full text-xs rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none disabled:opacity-50"
                      />
                    </div>

                    {/* PSC Validation note if already set */}
                    {alreadyDispatched && livePaper.pscValidationNote && (
                      <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl text-xs italic text-slate-600 dark:text-slate-400">
                        <span className="font-bold not-italic block mb-1 text-slate-500 uppercase text-[10px]">{t('pscValidationNote')} :</span>
                        {livePaper.pscValidationNote}
                      </div>
                    )}

                    {/* Actions */}
                    {!alreadyDispatched && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleDispatchReport}
                          disabled={paperReviews.length === 0}
                          className="flex-1 py-2.5 px-4 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl transition shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> {t('validateAndSendBtn')}
                        </button>
                        <button
                          onClick={handleRejectPaper}
                          className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl border border-red-500/20 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> {t('rejectPaperBtn')}
                        </button>
                      </div>
                    )}

                    {paperReviews.length === 0 && !alreadyDispatched && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {t('noReviewsYet')}
                      </p>
                    )}
                  </div>
                );
              })()}

            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCIENTIFIC TOPICS CRUD */}
      {pscTab === 'topics' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border rounded-xl shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Topics/tracks (Thématiques) list</h3>
              <p className="text-xs text-slate-500">Configure tracks for Author paper submissions and Reviewer specialties.</p>
            </div>
            <button
              onClick={() => { setTopicModalMode('create'); setFormTopicName(''); setFormTopicDesc(''); setIsTopicModalOpen(true); }}
              className="px-4 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg transition shadow-md shadow-primary/10 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Define Topic
            </button>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {confTopics.map(topic => (
              <div key={topic.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{topic.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{topic.description}</p>
                </div>
                <div className="flex justify-end gap-2 border-t pt-3">
                  <button
                    onClick={() => openEditTopic(topic)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-550 dark:text-slate-450 hover:text-primary cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { if (window.confirm("Delete topic track?")) deleteTopic(topic.id); }}
                    className="p-1.5 hover:bg-red-500/10 rounded text-red-400 hover:text-red-650 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {confTopics.length === 0 && (
              <div className="sm:col-span-2 md:col-span-3 text-center py-20 text-slate-400 italic text-xs">
                No scientific topics configured yet. Click "Define Topic" to start.
              </div>
            )}
          </div>

          {/* Scientific Guidelines & Evaluation Criteria split section */}
          <div className="grid md:grid-cols-2 gap-8 border-t pt-8">
            
            {/* GUIDELINES EDITOR */}
            <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Author Submission Guidelines</h3>
                <p className="text-xs text-slate-500">Provide official submission formatting instructions displayed to authors when submitting papers.</p>
              </div>

              <form onSubmit={handleSaveGuidelines} className="space-y-4">
                <textarea
                  rows={6}
                  value={guidelinesText}
                  onChange={(e) => setGuidelinesText(e.target.value)}
                  placeholder="E.g. All manuscripts must use the ACM format. Short papers have a limit of 4 pages..."
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-955 dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg transition shadow-md shadow-primary/10 cursor-pointer"
                >
                  Save Submission Instructions
                </button>
              </form>
            </div>

            {/* CRITERIA CRUD */}
            <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Scientific Evaluation Criteria</h3>
                <p className="text-xs text-slate-500">Configure dynamically rated items with custom maximum scores for peer review cards.</p>
              </div>

              {/* Form to add criterion */}
              <form onSubmit={handleCreateCriterion} className="flex gap-4 items-end">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500">Criterion Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Technical Rigor"
                    value={critName}
                    onChange={(e) => setCritName(e.target.value)}
                    className="w-full text-xs rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="w-24 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500">Max Score</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={critMaxScore}
                    onChange={(e) => setCritMaxScore(e.target.value)}
                    className="w-full text-xs rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg transition shadow-md shadow-primary/10 cursor-pointer"
                >
                  Add
                </button>
              </form>

              {/* List of criteria */}
              <div className="space-y-2 border-t pt-4">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wide">Configured Criteria</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {evaluationCriteria.filter(c => c.conferenceId === currentConference.id).map(crit => (
                    <div key={crit.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border flex items-center justify-between text-xs animate-in slide-in-from-left-1">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{crit.name}</span>
                        <span className="text-[10px] text-slate-400 ml-2">Max Points: {crit.maxScore || 5}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { if (window.confirm("Remove criterion?")) deleteCriterion(crit.id); }}
                        className="p-1 hover:bg-red-500/10 rounded text-red-400 hover:text-red-650 cursor-pointer"
                        title="Remove criterion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {evaluationCriteria.filter(c => c.conferenceId === currentConference.id).length === 0 && (
                    <div className="text-center py-6 text-slate-400 italic">No evaluation criteria configured. System defaults to Originality, Methodology, and Relevance.</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: PARTICIPANTS DIRECTORY & ROLE PROMOTION */}
      {pscTab === 'participants' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border rounded-xl shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or affiliation..."
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleImportSimulator}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg border border-indigo-200 dark:border-indigo-900 flex items-center gap-1 transition"
              >
                <Upload className="w-3.5 h-3.5" /> Import spreadsheet
              </button>
              <button
                onClick={handleExportParticipants}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg border flex items-center gap-1 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export directory
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-slate-55 dark:bg-slate-900/50 text-slate-400 font-bold uppercase">
                    <th className="p-3">Participant Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Affiliation</th>
                    <th className="p-3">Account status</th>
                    <th className="p-3">Roles</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map(part => {
                    const holdsReviewerRole = part.roles && part.roles.includes('Reviewer');
                    return (
                      <tr key={part.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <img src={part.photo} alt={part.name} className="w-6 h-6 rounded-full object-cover" />
                          {part.name}
                        </td>
                        <td className="p-3 font-mono text-slate-500">{part.email}</td>
                        <td className="p-3 text-slate-650 dark:text-slate-350">{part.affiliation}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            part.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            {part.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {part.roles ? part.roles.map(r => (
                              <span key={r} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                {r}
                              </span>
                            )) : (
                              <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{part.role}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          {!holdsReviewerRole ? (
                            <button
                              onClick={() => {
                                promoteParticipantToReviewer(part.id);
                                alert(`${part.name} has been promoted to Reviewer! They now hold both Participant and Reviewer roles.`);
                              }}
                              className="px-2.5 py-1 bg-primary hover:bg-secondary text-white font-bold rounded text-[9px] shadow-xs cursor-pointer transition"
                            >
                              Promote to Reviewer
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 italic">Reviewer Enabled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredParticipants.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-450 italic">
                        No participants registered or matched search queries.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REVIEWER MANAGEMENT TAB */}
      {pscTab === 'reviewers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border rounded-xl shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Academic Reviewer Registry</h3>
              <p className="text-xs text-slate-500">View academic specializations, assigned submissions, and bulk mail assessors.</p>
            </div>
            <button
              onClick={() => openEmailOverlay('reviewers@gacs2026.org', 'Urgent Action: Scientific Evaluation Campaign')}
              className="px-4 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg transition shadow-md shadow-primary/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" /> Email All Reviewers
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-slate-55 dark:bg-slate-900/50 text-slate-400 font-bold uppercase">
                    <th className="p-3">Assessor Profile</th>
                    <th className="p-3">Institution Affiliation</th>
                    <th className="p-3">Specialty Topics</th>
                    <th className="p-3">Assigned Submissions</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewersList.map(rev => {
                    const assignedPapers = confPapers.filter(p => p.reviewerIds.includes(rev.id));
                    return (
                      <tr key={rev.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <img src={rev.photo} alt={rev.name} className="w-6 h-6 rounded-full object-cover" />
                          <div>
                            <span className="font-bold block">{rev.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{rev.email}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-semibold">{rev.affiliation}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {rev.topics && rev.topics.map(t => (
                              <span key={t} className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-655 dark:text-slate-350">
                                {t}
                              </span>
                            ))}
                            {(!rev.topics || rev.topics.length === 0) && (
                              <span className="text-[10px] text-slate-400 italic">None logged</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <span className="text-xs font-mono font-bold text-slate-850 dark:text-slate-250">
                              {assignedPapers.length} Papers
                            </span>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {assignedPapers.map(p => (
                                <span key={p.id} className="text-[9px] font-bold text-primary bg-primary/10 px-1 rounded" title={p.title}>
                                  {p.id}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => openEmailOverlay(rev.email, 'Sympovex Reviewer Notification')}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-primary cursor-pointer inline-flex items-center"
                            title="Message Reviewer"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SCIENTIFIC TICKETS */}
      {pscTab === 'tickets' && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs max-h-[60vh] overflow-y-auto">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wide">Scientific Queries Desk</h3>
            
            <div className="space-y-2">
              {pscTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setActiveTicketId(ticket.id)}
                  className={`p-3 rounded-lg border transition cursor-pointer text-left ${
                    activeTicketId === ticket.id
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-100 dark:border-slate-850 hover:bg-slate-55 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-primary/15 text-primary rounded font-bold uppercase">
                      {ticket.category}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      ticket.status === 'Open' ? 'bg-green-500/10 text-green-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 mt-1">{ticket.subject}</h4>
                  <span className="text-[10px] text-slate-400 block mt-1">Sender: {ticket.senderName}</span>
                </div>
              ))}
              {pscTickets.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs italic">
                  No scientific support queries received.
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xs min-h-[40vh] flex flex-col justify-between">
            {selectedTicket ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
                    <div>
                      <span className="text-xs text-primary font-bold uppercase tracking-wider">{selectedTicket.category} Query</span>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-0.5">{selectedTicket.subject}</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">ID: {selectedTicket.id}</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-100 dark:border-slate-850 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 block">Original message by {selectedTicket.senderName}:</span>
                    <p className="text-xs text-slate-705 dark:text-slate-300 leading-relaxed font-medium">
                      {selectedTicket.message}
                    </p>
                  </div>

                  {/* History of replies */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Reply History</h4>
                    {selectedTicket.replies.map(r => (
                      <div key={r.id} className="text-xs p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-slate-655 dark:text-slate-350">
                        <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                          <span>{r.senderName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{new Date(r.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-1">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleReplyTicket} className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Write your response to resolve this scientific query..."
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    required
                    className="w-full text-xs rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 bg-primary hover:bg-secondary text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition">
                      <Send className="w-3.5 h-3.5" /> Send Response & Close Ticket
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center italic text-xs">
                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                Select a ticket from the left column to reply.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: MANUAL ACCOUNT PROVISIONING WITH TEMP PASSWORD */}
      {pscTab === 'provisioning' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Manual Account Provisioning</h3>
            <p className="text-xs text-slate-500">Create credentials for Participants or Reviewers. They will be forced to define a secure password on their very first login.</p>
          </div>

          <form onSubmit={handleProvisionUser} className="space-y-4">
            {provSuccess && (
              <div className="p-3.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/15 rounded-xl flex gap-2 text-xs font-semibold items-center animate-in zoom-in-95">
                <Check className="w-4 h-4 shrink-0" />
                <span>Account provisioned successfully! User status is Active with Forced Password Reset enabled.</span>
              </div>
            )}

            {provError && (
              <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl flex gap-2 text-xs font-semibold items-center">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{provError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Full Name</label>
              <input
                type="text"
                required
                value={provName}
                onChange={(e) => setProvName(e.target.value)}
                placeholder="Dr. Sarah Connor"
                className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Email Address</label>
                <input
                  type="email"
                  required
                  value={provEmail}
                  onChange={(e) => setProvEmail(e.target.value)}
                  placeholder="s.connor@cyberdyne.org"
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Security Role</label>
                <select
                  value={provRole}
                  onChange={(e) => setProvRole(e.target.value)}
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Participant">Participant / Delegate</option>
                  <option value="Reviewer">Academic Reviewer</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Affiliation Institution</label>
              <input
                type="text"
                value={provAffiliation}
                onChange={(e) => setProvAffiliation(e.target.value)}
                placeholder="Cyberdyne Systems"
                className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Temporary Password</label>
              <input
                type="text"
                required
                value={provPassword}
                onChange={(e) => setProvPassword(e.target.value)}
                placeholder="E.g. tempPass123"
                className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-md shadow-primary/10 mt-2"
            >
              Provision Active Account
            </button>
          </form>
        </div>
      )}

      {/* PAPER FORM MODAL (Full CRUD for submissions) */}
      {isPaperModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {paperModalMode === 'create' ? 'Add Scientific Paper' : 'Edit Scientific Paper'}
              </h3>
              <button onClick={() => { setIsPaperModalOpen(false); resetPaperForm(); }} className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaperSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Manuscript Title</label>
                <input
                  type="text"
                  required
                  value={formPaperTitle}
                  onChange={(e) => setFormPaperTitle(e.target.value)}
                  placeholder="Optimizing Transformer Attention..."
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Abstract Summary</label>
                <textarea
                  rows={4}
                  required
                  value={formPaperAbstract}
                  onChange={(e) => setFormPaperAbstract(e.target.value)}
                  placeholder="In this paper we explore..."
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Keywords</label>
                <input
                  type="text"
                  required
                  value={formPaperKeywords}
                  onChange={(e) => setFormPaperKeywords(e.target.value)}
                  placeholder="NLP, Transformer, AI"
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              {/* Submitter Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Associate Primary Submitter Profile</label>
                <select
                  value={formPaperSubmitterId}
                  onChange={(e) => setFormPaperSubmitterId(e.target.value)}
                  required
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">Select Submitter...</option>
                  {users.filter(u => u.conferenceId === currentConference.id).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              {/* Topics checkbox grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 block">Congress Scientific Topics / Tracks</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60 max-h-32 overflow-y-auto">
                  {confTopics.map(topic => (
                    <label key={topic.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-250 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formPaperTopicIds.includes(topic.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormPaperTopicIds([...formPaperTopicIds, topic.id]);
                          } else {
                            setFormPaperTopicIds(formPaperTopicIds.filter(id => id !== topic.id));
                          }
                        }}
                        className="rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 w-3.5 h-3.5"
                      />
                      <span>{topic.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Primary Author Info */}
              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
                <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wide">Primary Author Metadata</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Name"
                    value={formPaperAuthors[0]?.name || ''}
                    onChange={(e) => {
                      const updated = [...formPaperAuthors];
                      updated[0] = { ...updated[0], name: e.target.value };
                      setFormPaperAuthors(updated);
                    }}
                    className="w-full text-xs rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 border text-slate-900 dark:text-white"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={formPaperAuthors[0]?.email || ''}
                    onChange={(e) => {
                      const updated = [...formPaperAuthors];
                      updated[0] = { ...updated[0], email: e.target.value };
                      setFormPaperAuthors(updated);
                    }}
                    className="w-full text-xs rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 border text-slate-900 dark:text-white"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Institution Affiliation"
                  value={formPaperAuthors[0]?.affiliation || ''}
                  onChange={(e) => {
                    const updated = [...formPaperAuthors];
                    updated[0] = { ...updated[0], affiliation: e.target.value };
                    setFormPaperAuthors(updated);
                  }}
                  className="w-full text-xs rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 border text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t">
                <button
                  type="submit"
                  className="w-full py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg cursor-pointer transition shadow-md shadow-primary/10"
                >
                  {paperModalMode === 'create' ? 'Submit Manuscript' : 'Apply Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOPIC CRUD FORM MODAL */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {topicModalMode === 'create' ? 'Add Congress Scientific Topic' : 'Edit Scientific Topic'}
              </h3>
              <button onClick={() => setIsTopicModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTopicSubmit} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Topic/Track Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Computer Science Logic"
                  value={formTopicName}
                  onChange={(e) => setFormTopicName(e.target.value)}
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Topic Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly summarize what kind of research fits here..."
                  value={formTopicDesc}
                  onChange={(e) => setFormTopicDesc(e.target.value)}
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-955 dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg cursor-pointer transition shadow-md shadow-primary/10"
              >
                {topicModalMode === 'create' ? 'Create Scientific Topic' : 'Update Topic Track'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EMAIL DISPATCHER MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                <Mail className="w-5 h-5 text-primary" /> Integrated Mail Dispatcher
              </h3>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4 pt-4">
              {emailSuccess && (
                <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/15 rounded-xl flex gap-2 text-xs font-semibold items-center animate-in zoom-in-95">
                  <Check className="w-4 h-4" />
                  <span>Email sent successfully! Campaign saved to Mailing History.</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Recipient (To)</label>
                <input
                  type="text"
                  disabled
                  value={emailTo}
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Evaluation updates..."
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Message Body (Rich text HTML format)</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write your email here..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={emailSuccess}
                className="w-full py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg cursor-pointer transition shadow-md shadow-primary/10 flex items-center justify-center gap-1"
              >
                <Send className="w-3.5 h-3.5" /> Dispatch Mail
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
