import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  FileText, Plus, Trash, Upload, MessageSquare, Send, Calendar,
  Check, X, Users, Download, AlertCircle, FileDown, CheckCircle, BookMarked,
  Star, Image, BookOpen, Sparkles, Mail, Clock
} from 'lucide-react';

export default function ParticipantDashboard() {
  const { t } = useLanguage();
  const {
    papers,
    submitPaperSubmission,
    uploadRevisedPaperVersion,
    tickets,
    replyToSupportTicket,
    users,
    chatMessages,
    sendChat,
    meetings,
    scheduleMeeting,
    updateMeeting,
    currentUser,
    currentConference,
    topics,
    submitSurvey,
    submitGalleryPhoto
  } = useDatabase();

  // Active sub-sections inside participant panel
  const [subTab, setSubTab] = useState('papers');

  // Submit Paper States
  const [paperTitle, setPaperTitle] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [paperType, setPaperType] = useState('Extended Paper');
  const [paperAbstract, setPaperAbstract] = useState('');
  const [paperKeywords, setPaperKeywords] = useState('');
  const [authors, setAuthors] = useState([{ name: '', affiliation: '', email: '' }]);
  const [paperFile, setPaperFile] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedPaperId, setSubmittedPaperId] = useState('');
  const [fileError, setFileError] = useState('');

  // Satisfaction Survey
  const [surveyRatingOrg, setSurveyRatingOrg] = useState(5);
  const [surveyRatingContent, setSurveyRatingContent] = useState(5);
  const [surveyComments, setSurveyComments] = useState('');
  const [surveySuccess, setSurveySuccess] = useState(false);

  // Gallery Upload
  const [galleryUrl, setGalleryUrl] = useState('');
  const [galleryCaption, setGalleryCaption] = useState('');
  const [gallerySuccess, setGallerySuccess] = useState(false);

  // Revision File State
  const [revisionFile, setRevisionFile] = useState(null);
  const [revisingPaperId, setRevisingPaperId] = useState(null);

  // Tickets support states
  const myTickets = tickets.filter(t => t.senderId === currentUser.id);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Networking Chat States
  const [chatRecipientId, setChatRecipientId] = useState('');
  const [chatText, setChatText] = useState('');
  
  // Meeting Schedule States
  const [meetRecipientId, setMeetRecipientId] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetSlot, setMeetSlot] = useState('10:00 - 10:30');
  const [meetPurpose, setMeetPurpose] = useState('');
  const [meetSuccess, setMeetSuccess] = useState(false);

  const selectedTicket = myTickets.find(t => t.id === activeTicketId);
  const myPapers = papers.filter(p => p.submitterId === currentUser.id && p.conferenceId === currentConference.id);

  // Filter other users for networking
  const networkingUsers = users.filter(u => u.id !== currentUser.id && (!u.conferenceId || u.conferenceId === currentConference.id));

  // Authors dynamic repeating form methods
  const handleAddAuthor = () => {
    setAuthors([...authors, { name: '', affiliation: '', email: '' }]);
  };

  const handleRemoveAuthor = (index) => {
    const updated = authors.filter((_, i) => i !== index);
    setAuthors(updated);
  };

  const handleAuthorChange = (index, field, value) => {
    const updated = [...authors];
    updated[index][field] = value;
    setAuthors(updated);
  };

  // Submit Initial Paper
  const handlePaperSubmit = (e) => {
    e.preventDefault();
    if (!paperTitle || !paperAbstract || !paperKeywords) return;
    
    if (selectedTopicIds.length === 0) {
      alert('Please select at least one scientific topic/track for your paper.');
      return;
    }

    // Matrix validation
    const invalidAuthor = authors.some(a => !a.name || !a.affiliation || !a.email);
    if (invalidAuthor) {
      alert('Please fill out all mandatory fields for all authors.');
      return;
    }

    if (!paperFile) {
      alert('Please attach your scientific manuscript file.');
      return;
    }

    const newPaper = submitPaperSubmission({
      title: paperTitle,
      abstract: paperAbstract,
      keywords: paperKeywords,
      authors: authors,
      fileName: paperFile.name,
      fileSize: `${(paperFile.size / (1024 * 1024)).toFixed(1)} MB`,
      topicIds: selectedTopicIds,
      paperType: paperType
    });

    setSubmittedPaperId(newPaper?.id?.toUpperCase() || '');
    setSubmitSuccess(true);
    setPaperTitle('');
    setPaperAbstract('');
    setPaperKeywords('');
    setAuthors([{ name: '', affiliation: '', email: '' }]);
    setSelectedTopicIds([]);
    setPaperType('Extended Paper');
    setPaperFile(null);
    setTimeout(() => setSubmitSuccess(false), 10000);
  };

  const handleSurveySubmit = (e) => {
    e.preventDefault();
    submitSurvey({
      ratingOrganization: Number(surveyRatingOrg),
      ratingContent: Number(surveyRatingContent),
      comments: surveyComments
    });
    setSurveySuccess(true);
    setSurveyComments('');
    setTimeout(() => setSurveySuccess(false), 5000);
  };

  const handleGallerySubmit = (e) => {
    e.preventDefault();
    if (!galleryUrl) {
      alert('Veuillez sélectionner une image d\'illustration.');
      return;
    }
    submitGalleryPhoto({
      url: galleryUrl,
      caption: galleryCaption,
      uploaderName: currentUser.name
    });
    setGallerySuccess(true);
    setGalleryUrl('');
    setGalleryCaption('');
    setTimeout(() => setGallerySuccess(false), 5000);
  };

  // File Upload Type Check (.doc, .docx, .tex, .pdf)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = ['doc', 'docx', 'tex', 'pdf'];
    const extension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setFileError('Invalid file type! Only .doc, .docx, .tex, and .pdf files are accepted.');
      setPaperFile(null);
    } else {
      setFileError('');
      setPaperFile(file);
    }
  };

  const handleRevisionFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = ['doc', 'docx', 'tex', 'pdf'];
    const extension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      alert('Invalid file format! Supported: .doc, .docx, .tex, .pdf');
      setRevisionFile(null);
    } else {
      setRevisionFile(file);
    }
  };

  // Submit Revision Upload
  const handleUploadRevision = (e) => {
    e.preventDefault();
    if (!revisionFile || !revisingPaperId) return;

    uploadRevisedPaperVersion(revisingPaperId, {
      fileName: revisionFile.name,
      fileSize: `${(revisionFile.size / (1024 * 1024)).toFixed(1)} MB`
    });

    setRevisionFile(null);
    setRevisingPaperId(null);
    alert('Revision version uploaded successfully! Status set back to Under Review.');
  };

  // Chat submit
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatText.trim() || !chatRecipientId) return;
    sendChat(chatRecipientId, chatText);
    setChatText('');
  };

  // Schedule meeting
  const handleScheduleMeeting = (e) => {
    e.preventDefault();
    if (!meetRecipientId || !meetDate) return;

    scheduleMeeting({
      guestId: meetRecipientId,
      date: meetDate,
      timeSlot: meetSlot,
      purpose: meetPurpose
    });

    setMeetSuccess(true);
    setMeetRecipientId('');
    setMeetDate('');
    setMeetPurpose('');
    setTimeout(() => setMeetSuccess(false), 4000);
  };

  // Reply to ticket
  const handleReplyTicket = (e) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !activeTicketId) return;
    replyToSupportTicket(activeTicketId, ticketReplyText);
    setTicketReplyText('');
  };

  // Get active chat messages thread
  const activeChats = chatMessages.filter(
    m => (m.fromId === currentUser.id && m.toId === chatRecipientId) || 
         (m.fromId === chatRecipientId && m.toId === currentUser.id)
  );

  // Get scheduled meetings where user is host or guest
  const userMeetings = meetings.filter(m => m.hostId === currentUser.id || m.guestId === currentUser.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-350">
      
      {/* SUBMISSION CONFIRMATION TOAST */}
      {submitSuccess && (
        <div className="fixed top-6 right-6 z-[100] max-w-sm w-full animate-in slide-in-from-right duration-300">
          <div className="bg-emerald-600 text-white rounded-2xl shadow-2xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-bold text-sm">{t('submitSuccess')}</p>
              </div>
              <button onClick={() => setSubmitSuccess(false)} className="text-white/70 hover:text-white cursor-pointer flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            {submittedPaperId && (
              <div className="bg-white/10 rounded-xl p-3 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">{t('submitSuccessId')}</p>
                <p className="font-mono font-black text-lg tracking-widest">{submittedPaperId}</p>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-white/80 text-[11px]">
              <Mail className="w-3.5 h-3.5" />
              {t('submitSuccessEmail')}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('participantConsole')}</h2>
        <p className="text-sm text-slate-500">{t('participantDesc')}</p>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        {[
          { id: 'papers', label: t('mySubmissions'), icon: FileText },
          { id: 'survey', label: t('surveyTitle'), icon: Star },
          { id: 'gallery', label: t('galleryUpload'), icon: Image },
          { id: 'tickets', label: t('supportTickets'), icon: MessageSquare },
          { id: 'networking', label: t('networkingTitle'), icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 border-b-2 text-sm font-semibold transition whitespace-nowrap cursor-pointer -mb-px ${
                subTab === tab.id
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

      {/* SUB TAB: PAPERS */}
      {subTab === 'papers' && (
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Submission list */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Submitted Manuscripts</h3>

            <div className="space-y-4">
              {myPapers.map(paper => (
                <div 
                  key={paper.id} 
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4"
                >
                  <div className="flex justify-between items-center pb-2 border-b">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">ID: {paper.id}</span>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{paper.title}</h4>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      paper.status === 'Accepted' ? 'bg-green-500/10 text-green-600 border border-green-500/25' :
                      paper.status === 'Revision Required' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/25' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-500 border'
                    }`}>
                      {paper.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Authors: {paper.authors.map(a => `${a.name} (${a.affiliation})`).join(', ')}
                  </p>

                  {/* Versions history list */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submission Versions History:</h5>
                    <div className="space-y-1.5">
                      {paper.versions.map((v, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border text-xs">
                          <div className="space-x-2">
                            <span className="font-bold text-primary">{v.version}</span>
                            <span className="text-slate-400 font-mono">{new Date(v.timestamp).toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400">({v.fileName})</span>
                          </div>
                          <button
                            onClick={() => alert(`Downloading ${v.fileName} file (mock file)`)}
                            className="text-primary hover:underline font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review Dispatched Banner — unlocks revision upload */}
                  {(paper.status === 'Review Dispatched' || paper.status === 'Revision Submitted') && (
                    <div className="bg-violet-500/8 border border-violet-500/20 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-violet-700 dark:text-violet-400">{t('reviewDispatchedBanner')}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{t('reviewDispatchedAction')}</p>
                        </div>
                      </div>

                      {paper.status === 'Review Dispatched' && (
                        revisingPaperId === paper.id ? (
                          <form onSubmit={handleUploadRevision} className="flex flex-wrap items-center gap-3 pt-1">
                            <input
                              type="file"
                              onChange={handleRevisionFileChange}
                              required
                              className="text-xs file:bg-violet-600 file:hover:bg-violet-700 file:text-white file:px-3 file:py-1.5 file:rounded-md file:border-none file:cursor-pointer file:font-semibold"
                            />
                            <div className="flex gap-2">
                              <button type="submit" className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-lg transition cursor-pointer">
                                {t('uploadRevisionBtn')}
                              </button>
                              <button type="button" onClick={() => setRevisingPaperId(null)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-lg cursor-pointer">
                                {t('cancel')}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => setRevisingPaperId(paper.id)}
                            className="w-full py-2 px-4 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" /> {t('uploadRevisionBtn')}
                          </button>
                        )
                      )}

                      {paper.status === 'Revision Submitted' && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> {t('uploadRevisionSuccess').replace('{n}', paper.versions?.length || 2)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Legacy Revision Required (old flow) */}
                  {paper.status === 'Revision Required' && (
                    <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 space-y-3">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Action Required: Upload Revision Version
                      </span>

                      {revisingPaperId === paper.id ? (
                        <form onSubmit={handleUploadRevision} className="flex flex-wrap items-center gap-4">
                          <input
                            type="file"
                            onChange={handleRevisionFileChange}
                            required
                            className="text-xs file:bg-primary file:hover:bg-secondary file:text-white file:px-3 file:py-1.5 file:rounded-md file:border-none file:cursor-pointer file:font-semibold"
                          />
                          
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-green-650 hover:bg-green-700 text-white font-bold text-xs rounded transition cursor-pointer"
                            >
                              Commit Upload
                            </button>
                            <button
                              type="button"
                              onClick={() => setRevisingPaperId(null)}
                              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setRevisingPaperId(paper.id)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" /> Submit Revision Document
                        </button>
                      )}
                    </div>
                  )}

                </div>
              ))}

              {myPapers.length === 0 && (
                <div className="text-center py-16 text-slate-400 italic text-xs border border-dashed rounded-xl bg-white dark:bg-slate-900">
                  You have not submitted any manuscripts yet. Fill the submission registry on the right panel.
                </div>
              )}
            </div>
          </div>

          {/* Submission form */}
          <div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            
            {/* Proceedings download banner */}
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-3">
              <h4 className="font-extrabold text-xs text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                <FileDown className="w-4 h-4" /> Actes Officiels du Congrès
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Téléchargez l'intégralité des articles acceptés et le recueil des résumés officiels (Proceedings).</p>
              <button
                onClick={() => alert('Téléchargement du fichier proceedings_gacs2026.pdf (Simulation)')}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg transition cursor-pointer shadow-xs flex items-center justify-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Télécharger Proceedings
              </button>
            </div>

            {currentConference?.authorInstructions && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 text-xs rounded-xl space-y-1">
                <span className="font-extrabold uppercase text-[9px] tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Consignes de Soumission (Guidelines)
                </span>
                <p className="leading-relaxed font-medium">{currentConference.authorInstructions}</p>
              </div>
            )}

            <h3 className="font-bold text-slate-900 dark:text-white text-base border-t pt-2">New Paper Submission</h3>

            <form onSubmit={handlePaperSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Format de Soumission (Paper Type)</label>
                <select
                  value={paperType}
                  onChange={(e) => setPaperType(e.target.value)}
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Extended Paper">Extended Paper (Article complet)</option>
                  <option value="Short Paper">Short Paper (Communication courte)</option>
                  <option value="Poster">Poster</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Paper Title</label>
                <input
                  type="text"
                  required
                  placeholder="Accelerating Quantum Logic..."
                  value={paperTitle}
                  onChange={(e) => setPaperTitle(e.target.value)}
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Abstract (Résumé)</label>
                <textarea
                  rows={4}
                  required
                  placeholder="In this paper we show..."
                  value={paperAbstract}
                  onChange={(e) => setPaperAbstract(e.target.value)}
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Keywords (Mots-clés)</label>
                <input
                  type="text"
                  required
                  placeholder="Quantum, Logic Gates, Superconductors"
                  value={paperKeywords}
                  onChange={(e) => setPaperKeywords(e.target.value)}
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              {/* Scientific Topics Multi-Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 block">Congress Scientific Topics / Tracks (Thématiques)</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60 max-h-40 overflow-y-auto">
                  {topics.filter(t => t.conferenceId === currentConference.id).map(topic => (
                    <label key={topic.id} className="flex items-center gap-2 text-xs text-slate-705 dark:text-slate-250 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedTopicIds.includes(topic.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTopicIds([...selectedTopicIds, topic.id]);
                          } else {
                            setSelectedTopicIds(selectedTopicIds.filter(id => id !== topic.id));
                          }
                        }}
                        className="rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 w-3.5 h-3.5"
                      />
                      <span>{topic.name}</span>
                    </label>
                  ))}
                  {topics.filter(t => t.conferenceId === currentConference.id).length === 0 && (
                    <span className="text-[10px] text-slate-400 italic col-span-2">No scientific topics configured by PSC yet.</span>
                  )}
                </div>
              </div>

              {/* DYNAMIC REPEATING AUTHORS MATRIX */}
              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Authors List Matrix</span>
                  <button
                    type="button"
                    onClick={handleAddAuthor}
                    className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="space-y-3">
                  {authors.map((author, index) => (
                    <div key={index} className="p-3 bg-white dark:bg-slate-900 border rounded-lg space-y-2 relative">
                      {authors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAuthor(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      )}
                      
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          required
                          placeholder="Author Full Name"
                          value={author.name}
                          onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                          className="w-full text-[10px] rounded px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border text-slate-950 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Affiliation / Org"
                          value={author.affiliation}
                          onChange={(e) => handleAuthorChange(index, 'affiliation', e.target.value)}
                          className="w-full text-[10px] rounded px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border text-slate-950 dark:text-white"
                        />
                        <input
                          type="email"
                          required
                          placeholder="Email"
                          value={author.email}
                          onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                          className="w-full text-[10px] rounded px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border text-slate-950 dark:text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FILE UPLOAD & RESTRICTIONS */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Attach Manuscript Document</label>
                <div className="border border-dashed rounded-lg p-3 bg-slate-50 dark:bg-slate-800/40 text-center space-y-2">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    required
                    className="text-xs w-full file:bg-primary file:hover:bg-secondary file:text-white file:px-2.5 file:py-1 file:rounded-md file:border-none file:cursor-pointer file:font-semibold"
                  />
                  <span className="text-[9px] text-slate-400 block leading-tight">Supported Extensions: .doc, .docx, .tex, .pdf</span>
                </div>
                {fileError && (
                  <span className="text-[10px] text-red-500 font-bold block">{fileError}</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-secondary text-white font-semibold text-xs rounded-lg transition"
              >
                Register Submission V1
              </button>
            </form>

            {submitSuccess && (
              <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/10 rounded-lg text-xs font-semibold">
                Paper submitted successfully! Wait for peer review feedback.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB: HELP TICKETS */}
      {subTab === 'tickets' && (
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* List */}
          <div className="md:col-span-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs max-h-[60vh] overflow-y-auto">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wide">My Ticket Log</h3>
            
            <div className="space-y-2">
              {myTickets.length > 0 ? (
                myTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => setActiveTicketId(ticket.id)}
                    className={`p-3 rounded-lg border transition cursor-pointer text-left ${
                      activeTicketId === ticket.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 font-bold uppercase">
                        {ticket.category}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        ticket.status === 'Open' ? 'bg-green-500/10 text-green-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 mt-1">{ticket.subject}</h4>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">{new Date(ticket.timestamp).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs italic">
                  You have not created any help desk tickets. Go to Landing Page tab "Contact Support" to create one.
                </div>
              )}
            </div>
          </div>

          {/* Details & Replies */}
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
                    <span className="text-[10px] font-bold text-slate-500 block">Your question:</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {selectedTicket.message}
                    </p>
                  </div>

                  {/* History of replies */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Committee Replies</h4>
                    
                    {selectedTicket.replies.map(r => (
                      <div key={r.id} className="text-xs p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-slate-650 dark:text-slate-350">
                        <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                          <span>{r.senderName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{new Date(r.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-1">{r.text}</p>
                      </div>
                    ))}

                    {selectedTicket.replies.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-900 rounded-lg border">
                        Wait for committee reviews response.
                      </div>
                    )}
                  </div>
                </div>

                {/* Reply panel */}
                <form onSubmit={handleReplyTicket} className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-3">
                  <textarea
                    rows={2}
                    placeholder="Write a follow-up response if needed..."
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    required
                    className="w-full text-xs rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-primary hover:bg-secondary text-white font-semibold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Reply
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center italic text-xs">
                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                Select a ticket from the left column to view message replies history.
              </div>
            )}
          </div>

        </div>
      )}

      {/* SUB TAB: NETWORKING HUB */}
      {subTab === 'networking' && (
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Members directory */}
          <div className="md:col-span-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs max-h-[65vh] overflow-y-auto">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wide">Conference Directory</h3>
            
            <div className="space-y-2">
              {networkingUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => {
                    setChatRecipientId(user.id);
                    setMeetRecipientId(user.id);
                  }}
                  className={`p-3 rounded-lg border transition cursor-pointer text-left flex items-center gap-3 ${
                    chatRecipientId === user.id
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover border" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{user.name}</h4>
                    <span className="text-[10px] text-slate-400 block font-semibold text-primary">{user.attribute || user.role}</span>
                    <span className="text-[9px] text-slate-500 block truncate max-w-[150px]">{user.affiliation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Panel & Meeting scheduler */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Split row: Chat on left, RDV on right */}
            <div className="grid sm:grid-cols-2 gap-6">
              
              {/* Chat Thread */}
              <div className="bg-white dark:bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between min-h-[40vh] shadow-xs">
                {chatRecipientId ? (
                  <div className="h-full flex flex-col justify-between flex-1 space-y-4">
                    <div className="border-b pb-2">
                      <span className="text-[9px] text-slate-400 font-mono">Chatting with</span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {users.find(u => u.id === chatRecipientId)?.name}
                      </h4>
                    </div>

                    {/* Chat Logs */}
                    <div className="flex-1 overflow-y-auto max-h-[25vh] space-y-3 p-1">
                      {activeChats.map(chat => {
                        const isMe = chat.fromId === currentUser.id;
                        return (
                          <div 
                            key={chat.id} 
                            className={`flex flex-col text-[11px] max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                          >
                            <p className={`p-2.5 rounded-xl border leading-relaxed ${
                              isMe 
                                ? 'bg-primary border-primary text-white rounded-br-none' 
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-750 text-slate-800 dark:text-slate-200 rounded-bl-none'
                            }`}>
                              {chat.text}
                            </p>
                            <span className="text-[8px] text-slate-400 mt-0.5">{new Date(chat.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        );
                      })}

                      {activeChats.length === 0 && (
                        <div className="text-center py-10 text-slate-400 italic text-[10px]">
                          No messages yet. Send a greeting to start networking!
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t">
                      <input
                        type="text"
                        placeholder="Type message..."
                        value={chatText}
                        onChange={(e) => setChatText(e.target.value)}
                        className="flex-1 text-xs rounded px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border text-slate-950 dark:text-white"
                      />
                      <button type="submit" className="bg-primary text-white p-1.5 rounded">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center italic text-xs">
                    <MessageCircle className="w-6 h-6 mb-1 text-slate-300" />
                    Select a member from the directory list to activate chat.
                  </div>
                )}
              </div>

              {/* Prise de RDV Scheduler */}
              <div className="bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-xs">
                {meetRecipientId ? (
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <span className="text-[9px] text-slate-400 font-mono">Prise de RDV with</span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {users.find(u => u.id === meetRecipientId)?.name}
                      </h4>
                    </div>

                    <form onSubmit={handleScheduleMeeting} className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Meeting Date</label>
                          <input
                            type="date"
                            required
                            value={meetDate}
                            onChange={(e) => setMeetDate(e.target.value)}
                            className="w-full text-[10px] rounded px-2.5 py-1.5 bg-slate-55 dark:bg-slate-800 border text-slate-950 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Timeslot Slot</label>
                          <select
                            value={meetSlot}
                            onChange={(e) => setMeetSlot(e.target.value)}
                            className="w-full text-[10px] rounded px-2 py-1.5 bg-slate-55 dark:bg-slate-800 border text-slate-900 dark:text-white"
                          >
                            <option value="10:00 - 10:30">10:00 - 10:30</option>
                            <option value="13:30 - 14:00">13:30 - 14:00</option>
                            <option value="15:00 - 15:30">15:00 - 15:30</option>
                            <option value="17:00 - 17:30">17:00 - 17:30</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Meeting Objective / Purpose</label>
                        <input
                          type="text"
                          required
                          placeholder="Discuss paper algorithms..."
                          value={meetPurpose}
                          onChange={(e) => setMeetPurpose(e.target.value)}
                          className="w-full text-[10px] rounded px-2.5 py-1.5 bg-slate-55 dark:bg-slate-800 border text-slate-950 dark:text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-1.5 bg-primary hover:bg-secondary text-white font-bold rounded flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Book Appointment slot
                      </button>
                    </form>

                    {meetSuccess && (
                      <div className="p-2.5 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-lg border border-green-500/10">
                        Appointment slot booked! Awaiting confirmation.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center italic text-xs">
                    <Calendar className="w-6 h-6 mb-1 text-slate-300" />
                    Select a member from the directory list to schedule a slot.
                  </div>
                )}
              </div>

            </div>

            {/* Meetings Log & Accept/Decline list */}
            <div className="bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Meeting Schedule Calendar</h3>
              
              <div className="space-y-2">
                {userMeetings.map(meet => {
                  const isHost = meet.hostId === currentUser.id;
                  const counterpartId = isHost ? meet.guestId : meet.hostId;
                  const counterpart = users.find(u => u.id === counterpartId);
                  
                  return (
                    <div key={meet.id} className="p-3 border rounded-xl flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {isHost ? 'Sent to' : 'Received from'}: {counterpart?.name}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                            meet.status === 'Approved' ? 'bg-green-500/10 text-green-600' :
                            meet.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {meet.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Date: {meet.date} | Slot: {meet.timeSlot} | Purpose: "{meet.purpose}"
                        </p>
                      </div>

                      {/* Accept / Decline actions for incoming meetings */}
                      {!isHost && meet.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              updateMeeting(meet.id, 'Approved');
                              alert('Meeting accepted and added to schedule.');
                            }}
                            className="bg-green-600 text-white p-1 rounded hover:bg-green-700 cursor-pointer"
                            title="Accept request"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              updateMeeting(meet.id, 'Cancelled');
                              alert('Meeting request declined.');
                            }}
                            className="bg-red-950/40 text-red-400 hover:bg-red-900 border border-red-900/50 p-1 rounded cursor-pointer"
                            title="Decline request"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {userMeetings.length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-xs italic">
                    No scheduled networking slots booked yet.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUB TAB: SATISFACTION SURVEY */}
      {subTab === 'survey' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Formulaire de Satisfaction de la Conférence</h3>
            <p className="text-xs text-slate-500">Aidez-nous à améliorer les prochaines éditions en évaluant votre expérience.</p>
          </div>

          <form onSubmit={handleSurveySubmit} className="space-y-4">
            {surveySuccess && (
              <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/15 rounded-xl text-xs font-semibold text-center animate-in zoom-in-95">
                Merci ! Votre questionnaire a été envoyé avec succès.
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block">Évaluation de l'organisation générale (1 à 5)</label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSurveyRatingOrg(num)}
                    className={`w-9 py-1 rounded-lg border font-bold text-xs cursor-pointer ${surveyRatingOrg === num ? 'bg-primary text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800'}`}
                  >
                    {num} ★
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block">Évaluation du contenu scientifique / présentations (1 à 5)</label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSurveyRatingContent(num)}
                    className={`w-9 py-1 rounded-lg border font-bold text-xs cursor-pointer ${surveyRatingContent === num ? 'bg-primary text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800'}`}
                  >
                    {num} ★
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Remarques et suggestions libres</label>
              <textarea
                rows={4}
                value={surveyComments}
                onChange={(e) => setSurveyComments(e.target.value)}
                placeholder="Indiquez ici vos remarques..."
                className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg transition shadow-md shadow-primary/10 cursor-pointer"
            >
              Envoyer le questionnaire
            </button>
          </form>
        </div>
      )}

      {/* SUB TAB: EVENT PHOTOS */}
      {subTab === 'gallery' && (
        <div className="space-y-6">
          <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Partager des photos de l'événement en temps réel</h3>
              <p className="text-xs text-slate-500">Sélectionnez une image d'illustration à envoyer pour la galerie photo du congrès.</p>
            </div>

            <form onSubmit={handleGallerySubmit} className="space-y-4">
              {gallerySuccess && (
                <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/15 rounded-xl text-xs font-semibold text-center animate-in zoom-in-95">
                  Photo envoyée avec succès ! Elle apparaîtra après validation.
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Choisissez une photo à soumettre</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=350",
                    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=350",
                    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=350"
                  ].map((urlOption, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setGalleryUrl(urlOption)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition cursor-pointer ${galleryUrl === urlOption ? 'border-primary' : 'border-transparent'}`}
                    >
                      <img src={urlOption} alt="Option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Légende de la photo</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Séance plénière du matin"
                  value={galleryCaption}
                  onChange={(e) => setGalleryCaption(e.target.value)}
                  className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg transition shadow-md shadow-primary/10 cursor-pointer"
              >
                Envoyer la photo pour modération
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
