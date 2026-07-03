import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, MapPin, Award, User, MessageSquare, Image, HelpCircle, 
  BookOpen, Building2, Send, Download, Vote, Check, ShieldAlert,
  Search, Eye, Clock, X, ExternalLink, Play
} from 'lucide-react';

export default function LandingPage() {
  const {
    currentConference,
    speakers,
    schedule,
    posters,
    gallery,
    sponsors,
    papers,
    currentUser,
    castUserVote,
    votes,
    uploadGalleryPhoto,
    createNewSupportTicket,
    addCommentToPoster,
    addSponsor
  } = useDatabase();

  const { setAuthModalOpen } = useAuth();

  const [activeTab, setActiveTab] = useState('home');
  
  // Search states for Posters
  const [posterSearch, setPosterSearch] = useState('');
  const [posterFilter, setPosterFilter] = useState('All');
  const [activePoster, setActivePoster] = useState(null);
  const [newComment, setNewComment] = useState('');

  // Sponsoring virtual booth state
  const [activeSponsor, setActiveSponsor] = useState(null);
  const [boothLeadSubmitted, setBoothLeadSubmitted] = useState(false);
  const [boothLeadName, setBoothLeadName] = useState('');
  const [boothLeadEmail, setBoothLeadEmail] = useState('');
  const [boothLeadMessage, setBoothLeadMessage] = useState('');

  // Gallery upload states
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [photoSubmitSuccess, setPhotoSubmitSuccess] = useState(false);

  // Voting states
  const [votedPosterSuccess, setVotedPosterSuccess] = useState('');
  const [votedPresentationSuccess, setVotedPresentationSuccess] = useState('');
  const [voteError, setVoteError] = useState('');

  // Ticket creation states
  const [ticketCategory, setTicketCategory] = useState('Technical');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Active schedule slot details
  const [activeSlot, setActiveSlot] = useState(null);

  // Keynote bio modal
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  
  // Selected day for program timeline
  const [selectedDay, setSelectedDay] = useState('Day 1');

  if (!currentConference) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Filter schedule for this conference
  const confSchedule = schedule.filter(s => s.conferenceId === currentConference.id);
  const days = Array.from(new Set(confSchedule.map(s => s.day)));


  // Filter accepted papers for proceedings
  const acceptedPapers = papers.filter(p => p.conferenceId === currentConference.id && p.status === 'Accepted');

  // Calculate vote leaderboards
  const confVotes = votes.filter(v => v.conferenceId === currentConference.id);
  const getVoteCounts = (category) => {
    const counts = {};
    confVotes.filter(v => v.category === category).forEach(v => {
      counts[v.candidateId] = (counts[v.candidateId] || 0) + 1;
    });
    return counts;
  };

  const posterVoteCounts = getVoteCounts('Best Poster');
  const presentationVoteCounts = getVoteCounts('Best Oral Presentation');

  // Handle Photo Upload Submit
  const handlePhotoUpload = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (!newPhotoUrl) return;
    uploadGalleryPhoto(newPhotoUrl, newPhotoCaption);
    setPhotoSubmitSuccess(true);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setTimeout(() => setPhotoSubmitSuccess(false), 5000);
  };

  // Handle Vote casting
  const handleCastVote = (category, candidateId) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    const res = castUserVote(category, candidateId);
    if (res.success) {
      if (category === 'Best Poster') {
        setVotedPosterSuccess('Thank you for voting!');
        setTimeout(() => setVotedPosterSuccess(''), 4000);
      } else {
        setVotedPresentationSuccess('Thank you for voting!');
        setTimeout(() => setVotedPresentationSuccess(''), 4000);
      }
      setVoteError('');
    } else {
      setVoteError(res.error);
      setTimeout(() => setVoteError(''), 4000);
    }
  };

  // Handle Support Ticket Submit
  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (!ticketSubject || !ticketMessage) return;

    // Rules logic: route to CO or CS
    // Messaging directed to CO (Comité d'Organisation) or CS (Comité Scientifique)
    // Categories: Technical, Registration/Payment, Scientific Track, Accommodation
    const targetCommittee = ticketCategory === 'Scientific Track' ? 'CS' : 'CO';

    createNewSupportTicket({
      category: ticketCategory,
      subject: ticketSubject,
      message: ticketMessage,
      assignedTo: targetCommittee
    });

    setTicketSuccess(true);
    setTicketSubject('');
    setTicketMessage('');
    setTimeout(() => setTicketSuccess(false), 5000);
  };

  // Add Comment to Poster
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (!newComment.trim() || !activePoster) return;
    addCommentToPoster(activePoster.id, newComment);
    
    // Update local active poster object comments for visual rendering in lightbox
    const updatedPosters = posters.find(p => p.id === activePoster.id);
    setActivePoster(updatedPosters);
    setNewComment('');
  };

  const handleBoothLeadSubmit = (e) => {
    e.preventDefault();
    setBoothLeadSubmitted(true);
    setTimeout(() => {
      setBoothLeadSubmitted(false);
      setBoothLeadName('');
      setBoothLeadEmail('');
      setBoothLeadMessage('');
    }, 4000);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      
      {/* CONFERENCE HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-purple-600 to-pink-500"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider text-amber-400 mb-6 border border-white/10 uppercase">
            <Award className="w-3.5 h-3.5" />
            Empowering Scientific Exchange
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-sm mb-6">
            {currentConference.name}
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8 font-medium">
            Join hundreds of researchers, professionals, and industrialists sharing insights on advanced science.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-slate-300">
            <span className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700/60 shadow-sm">
              <Calendar className="w-4 h-4 text-amber-500" />
              {currentConference.startDate} to {currentConference.endDate}
            </span>
            <span className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700/60 shadow-sm">
              <MapPin className="w-4 h-4 text-amber-500" />
              {currentConference.venue}
            </span>
          </div>
        </div>
      </section>

      {/* SUB NAVIGATION TABS */}
      <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto flex gap-1 py-2 scrollbar-none">
          {[
            { id: 'home', label: 'Keynotes & Intro', icon: User },
            { id: 'program', label: 'Interactive Program', icon: Calendar },
            { id: 'posters', label: 'E-Posters Space', icon: Award },
            { id: 'gallery', label: 'Live Gallery Feed', icon: Image },
            { id: 'proceedings', label: 'Proceedings (Papers)', icon: BookOpen },
            { id: 'sponsors', label: 'Sponsors & Booths', icon: Building2 },
            { id: 'voting', label: 'Public Voting', icon: Vote },
            { id: 'support', label: 'Contact Support', icon: HelpCircle }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[var(--color-primary)] text-white shadow-md shadow-primary/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TAB CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* 1. HOME & KEYNOTES */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            
            {/* WELCOME */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Address</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  We welcome academic scholars, research groups, industry giants, and postgraduate engineers to our annual {currentConference.name}. This platform delivers robust networking pathways, peer-evaluated paper sessions, e-poster visualizations, and collaborative keynotes.
                </p>
                <div className="pt-2 font-mono text-sm text-slate-500">
                  Organized by: <span className="font-semibold text-primary">{currentConference.name.split(' ')[0]} Committee</span>
                </div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=80" 
                alt="Conference Hall" 
                className="w-full md:w-80 h-48 rounded-xl object-cover shadow-inner"
              />
            </div>

            {/* KEYNOTE SPEAKERS SHOWCASE */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Plenary Session Keynote Speakers</h2>
                  <p className="text-sm text-slate-500">Distinguished international researchers presenting state-of-the-art research breakthroughs.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {speakers.filter(s => s.conferenceId === currentConference.id).map(speaker => (
                  <div 
                    key={speaker.id} 
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={speaker.photo} 
                          alt={speaker.name} 
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                        />
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{speaker.name}</h3>
                          <span className="text-xs text-primary font-semibold">{speaker.affiliation}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md border border-amber-500/10">
                          Talk: {speaker.talkTitle.substring(0, 50)}...
                        </span>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {speaker.bio}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-mono">{speaker.contact}</span>
                      <button
                        onClick={() => setActiveSpeaker(speaker)}
                        className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        Read Abstract
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. INTERACTIVE SCHEDULE/PROGRAM */}
        {activeTab === 'program' && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Scientific Session Schedule</h2>
              <p className="text-sm text-slate-500">Navigate presentations, talks, and breaks sorted by Day, Room and track tracks.</p>
            </div>

            {/* DAY SWITCHER */}
            <div className="flex justify-center gap-2">
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold border transition cursor-pointer ${
                    selectedDay === day
                      ? 'bg-primary border-primary text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* TIMELINE GRID */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                {['Amphitheater A', 'Room 101', 'Room 202'].map(room => {
                  const roomSlots = confSchedule.filter(s => s.day === selectedDay && s.room === room);
                  return (
                    <div key={room} className="p-6 space-y-4">
                      <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-center font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {room}
                      </div>

                      <div className="space-y-3">
                        {roomSlots.length > 0 ? (
                          roomSlots.map(slot => (
                            <div
                              key={slot.id}
                              onClick={() => setActiveSlot(slot)}
                              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/40 dark:hover:border-primary/40 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800/80 transition cursor-pointer shadow-xs relative group flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-center gap-2">
                                  <span className="text-[10px] font-mono px-2 py-0.5 bg-primary/10 text-primary rounded font-bold">
                                    {slot.time}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide font-mono">
                                    {slot.track}
                                  </span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug group-hover:text-primary transition line-clamp-2">
                                  {slot.title}
                                </h4>
                              </div>

                              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-3 flex items-center justify-between text-xs text-slate-500">
                                <span>Speaker: {slot.speaker?.split(' ')[1] || 'TBA'}</span>
                                <span className="text-primary hover:underline font-semibold flex items-center gap-0.5">
                                  Details <Eye className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 text-slate-400 text-xs italic">
                            No presentation scheduled in this room.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. E-POSTERS SPACE */}
        {activeTab === 'posters' && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Electronic Poster Exhibition</h2>
              <p className="text-sm text-slate-500">Explore digital poster contributions, query authors via Q&A tabs, and search topics.</p>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by topic, author, title or affiliation..."
                  value={posterSearch}
                  onChange={(e) => setPosterSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={posterFilter}
                onChange={(e) => setPosterFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-sm rounded-lg px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="All">All Topics</option>
                <option value="AI">Artificial Intelligence</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>

            {/* GALLERY GRID */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posters
                .filter(p => p.conferenceId === currentConference.id)
                .filter(p => {
                  const matchSearch = p.title.toLowerCase().includes(posterSearch.toLowerCase()) ||
                    p.author.toLowerCase().includes(posterSearch.toLowerCase()) ||
                    p.affiliation.toLowerCase().includes(posterSearch.toLowerCase()) ||
                    p.topic.toLowerCase().includes(posterSearch.toLowerCase());
                  const matchTopic = posterFilter === 'All' || p.topic === posterFilter;
                  return matchSearch && matchTopic;
                })
                .map(poster => (
                  <div
                    key={poster.id}
                    onClick={() => setActivePoster(poster)}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition cursor-pointer shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                        <img
                          src={poster.url}
                          alt={poster.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 bg-slate-900/80 text-white rounded backdrop-blur-xs">
                          {poster.topic}
                        </span>
                      </div>

                      <div className="p-5 space-y-2">
                        <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary transition">
                          {poster.title}
                        </h4>
                        <div className="flex flex-col text-xs text-slate-500 font-medium">
                          <span>Presenter: {poster.author}</span>
                          <span>Affiliation: {poster.affiliation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1 text-primary">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {poster.comments.length} Comments (Q&A)
                      </span>
                      <span className="flex items-center gap-0.5 text-primary hover:underline">
                        Open Lightbox <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 4. REAL-TIME GALLERY */}
        {activeTab === 'gallery' && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Crowdsourced Photo Feed</h2>
              <p className="text-sm text-slate-500">Snap and upload photos live from the venue. New uploads go directly to the moderation filter queue.</p>
            </div>

            {/* PHOTO UPLOAD MATRIX */}
            <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                <Image className="w-4 h-4 text-primary" />
                Upload Live Photo
              </h3>

              <form onSubmit={handlePhotoUpload} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Image Address (URL)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    required
                    className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Short Caption / Description</label>
                  <input
                    type="text"
                    placeholder="E.g. Great presentations in Room 101!"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-primary hover:bg-secondary text-white font-semibold text-sm rounded-lg shadow-sm cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Submit Photo to Moderation Queue
                </button>
              </form>

              {photoSubmitSuccess && (
                <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-lg border border-amber-500/10 text-xs font-semibold">
                  <Clock className="w-4 h-4" />
                  Photo submitted! It will appear on the wall once approved by the POC committee.
                </div>
              )}
            </div>

            {/* APPROVED IMAGES FEED */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Live Event Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery
                  .filter(g => g.conferenceId === currentConference.id && g.approved)
                  .map(photo => (
                    <div 
                      key={photo.id}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-xs"
                    >
                      <img
                        src={photo.url}
                        alt="Event item"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3 text-white">
                        <p className="text-xs font-semibold line-clamp-2">{photo.caption}</p>
                        <span className="text-[10px] text-slate-400 font-mono mt-1">Uploaded by: {photo.uploaderName}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}

        {/* 5. PROCEEDINGS */}
        {activeTab === 'proceedings' && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Proceedings Volume & Accepted Papers</h2>
              <p className="text-sm text-slate-500">Secure repository for validated, peer-reviewed documents in standard final formatting (.pdf).</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
              {acceptedPapers.length > 0 ? (
                acceptedPapers.map(paper => (
                  <div key={paper.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-bold">
                          Accepted final
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">
                          ID: {paper.id}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {paper.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Authors: {paper.authors.map(a => `${a.name} (${a.affiliation})`).join(', ')}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {paper.abstract}
                      </p>
                    </div>

                    <a
                      href={`#`}
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Downloading ${paper.versions[paper.versions.length - 1]?.fileName || 'paper.pdf'} (mock file trigger)`);
                      }}
                      className="px-4 py-2 bg-primary hover:bg-secondary text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF ({paper.versions[paper.versions.length - 1]?.fileSize || '2.2 MB'})
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-slate-400 italic text-sm">
                  The proceedings volume will become downloadable once peer reviews are completely validated.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. SPONSORS & BOOTHS */}
        {activeTab === 'sponsors' && (
          <div className="space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Corporate Partners & Virtual Booths</h2>
              <p className="text-sm text-slate-500">Explore booths, download documentation materials, and request inquiries.</p>
            </div>

            {/* GOLD SPONSORS */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider text-center flex items-center justify-center gap-2">
                <span className="w-8 h-px bg-amber-500/30" />
                Gold Sponsors
                <span className="w-8 h-px bg-amber-500/30" />
              </h3>
              
              <div className="grid sm:grid-cols-2 md:grid-cols-3 justify-center gap-6">
                {sponsors
                  .filter(s => s.conferenceId === currentConference.id && s.tier === 'Gold')
                  .map(sponsor => (
                    <div
                      key={sponsor.id}
                      onClick={() => setActiveSponsor(sponsor)}
                      className="bg-white dark:bg-slate-900 border-2 border-amber-500/20 hover:border-amber-500 rounded-2xl p-6 flex flex-col items-center text-center justify-between cursor-pointer transition shadow-sm hover:shadow-md"
                    >
                      <div className="space-y-4">
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          className="h-16 w-auto object-contain max-w-full"
                        />
                        <h4 className="font-bold text-slate-900 dark:text-white">{sponsor.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {sponsor.description}
                        </p>
                      </div>
                      
                      <span className="mt-4 text-xs font-semibold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/10 flex items-center gap-1 hover:bg-amber-500 hover:text-white transition">
                        Enter Virtual Stand
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* SILVER SPONSORS */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center gap-2">
                <span className="w-8 h-px bg-slate-400/30" />
                Silver Sponsors
                <span className="w-8 h-px bg-slate-400/30" />
              </h3>

              <div className="grid sm:grid-cols-3 gap-6">
                {sponsors
                  .filter(s => s.conferenceId === currentConference.id && s.tier === 'Silver')
                  .map(sponsor => (
                    <div
                      key={sponsor.id}
                      onClick={() => setActiveSponsor(sponsor)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 rounded-2xl p-5 flex flex-col items-center text-center justify-between cursor-pointer transition shadow-xs"
                    >
                      <div className="space-y-3">
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          className="h-12 w-auto object-contain max-w-full"
                        />
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{sponsor.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {sponsor.description}
                        </p>
                      </div>

                      <span className="mt-3 text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-0.5">
                        Open Booth Details <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. PUBLIC VOTING BALLOT */}
        {activeTab === 'voting' && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Live Public Voting Panel</h2>
              <p className="text-sm text-slate-500">Pick outstanding researchers for best presentations. Limited strictly to 1 vote per category per user.</p>
            </div>

            {voteError && (
              <div className="max-w-xl mx-auto flex items-center gap-2 bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-500/10 text-sm font-semibold">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                {voteError}
              </div>
            )}

            {!currentUser ? (
              <div className="max-w-xl mx-auto p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm animate-in fade-in">
                <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                  Voting is restricted to authenticated delegates of the conference. Please sign in to submit your vote for the best poster and presentation.
                </p>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-6 py-2.5 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg transition shadow-md shadow-primary/10 cursor-pointer"
                >
                  Sign In to Vote
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
              {/* VOTE CATEGORY 1 */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Best Electronic Poster</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-primary/10 text-primary rounded font-bold uppercase">1 Vote Limit</span>
                  </div>
                  
                  <div className="space-y-3">
                    {posters.filter(p => p.conferenceId === currentConference.id).map(poster => {
                      const totalVotes = posterVoteCounts[poster.id] || 0;
                      return (
                        <div key={poster.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <span className="text-xs text-primary font-semibold">{poster.author}</span>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{poster.title}</h4>
                          </div>
                          
                          <button
                            onClick={() => handleCastVote('Best Poster', poster.id)}
                            className="px-3 py-1 bg-primary hover:bg-secondary text-white font-semibold text-xs rounded transition flex items-center gap-1 cursor-pointer"
                          >
                            <Vote className="w-3.5 h-3.5" />
                            Vote ({totalVotes})
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {votedPosterSuccess && (
                  <div className="mt-4 flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 p-2.5 rounded-lg border border-green-500/10 text-xs font-semibold">
                    <Check className="w-4 h-4" />
                    {votedPosterSuccess}
                  </div>
                )}
              </div>

              {/* VOTE CATEGORY 2 */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Best Oral Presentation</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-primary/10 text-primary rounded font-bold uppercase">1 Vote Limit</span>
                  </div>

                  <div className="space-y-3">
                    {confSchedule.filter(s => s.track !== 'Plenary').map(slot => {
                      const totalVotes = presentationVoteCounts[slot.id] || 0;
                      return (
                        <div key={slot.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <span className="text-xs text-primary font-semibold">{slot.speaker}</span>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{slot.title}</h4>
                          </div>

                          <button
                            onClick={() => handleCastVote('Best Oral Presentation', slot.id)}
                            className="px-3 py-1 bg-primary hover:bg-secondary text-white font-semibold text-xs rounded transition flex items-center gap-1 cursor-pointer"
                          >
                            <Vote className="w-3.5 h-3.5" />
                            Vote ({totalVotes})
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {votedPresentationSuccess && (
                  <div className="mt-4 flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 p-2.5 rounded-lg border border-green-500/10 text-xs font-semibold">
                    <Check className="w-4 h-4" />
                    {votedPresentationSuccess}
                  </div>
                )}
              </div>
            </div>
          )}

            {/* LIVE LEADERBOARDS CHART */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl mx-auto space-y-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-center text-sm uppercase tracking-wider">
                Live Leaderboard Poll Charts
              </h3>

              <div className="grid sm:grid-cols-2 gap-8">
                {/* Poster Chart */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Poster Votes</h4>
                  <div className="space-y-2">
                    {posters.filter(p => p.conferenceId === currentConference.id).map(poster => {
                      const count = posterVoteCounts[poster.id] || 0;
                      const percentage = confVotes.filter(v => v.category === 'Best Poster').length > 0
                        ? (count / confVotes.filter(v => v.category === 'Best Poster').length) * 100
                        : 0;
                      return (
                        <div key={poster.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono font-medium">
                            <span className="truncate max-w-[150px]">{poster.author}</span>
                            <span>{count} votes ({Math.round(percentage)}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Presentation Chart */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Presentation Votes</h4>
                  <div className="space-y-2">
                    {confSchedule.filter(s => s.track !== 'Plenary').map(slot => {
                      const count = presentationVoteCounts[slot.id] || 0;
                      const percentage = confVotes.filter(v => v.category === 'Best Oral Presentation').length > 0
                        ? (count / confVotes.filter(v => v.category === 'Best Oral Presentation').length) * 100
                        : 0;
                      return (
                        <div key={slot.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono font-medium">
                            <span className="truncate max-w-[150px]">{slot.speaker}</span>
                            <span>{count} votes ({Math.round(percentage)}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-[var(--color-accent)] h-full rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 8. SUPPORT & ASSISTANCE (CO / CS ROUTING) */}
        {activeTab === 'support' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Help Desk & Support Tickets</h2>
              <p className="text-sm text-slate-500">Submit requests directly to the organizing (CO) or scientific (CS) committees based on question category.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">New Support Request</h3>
              
              {currentUser ? (
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Your Identity</label>
                      <input
                        type="text"
                        disabled
                        value={`${currentUser.name} (${currentUser.role})`}
                        className="w-full text-sm rounded-lg px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Query Category (Controls Routing)</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                      >
                        <option value="Technical">Technical (Routes to CO)</option>
                        <option value="Registration/Payment">Registration & Payment (Routes to CO)</option>
                        <option value="Scientific Track">Scientific Track Questions (Routes to CS)</option>
                        <option value="Accommodation">Accommodation & Travel (Routes to CO)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Subject Summary</label>
                    <input
                      type="text"
                      required
                      placeholder="Short description of your question..."
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Detailed Message</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Elaborate details here..."
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      className="w-full text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary hover:bg-secondary text-white font-semibold text-sm rounded-lg shadow-sm cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    Submit Ticket
                  </button>
                </form>
              ) : (
                <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                    You must be signed in to open a support ticket and message organizing committees.
                  </p>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="px-4 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-md shadow-primary/10"
                  >
                    Sign In to Submit Request
                  </button>
                </div>
              )}

              {ticketSuccess && (
                <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 p-3 rounded-lg border border-green-500/10 text-xs font-semibold">
                  <Check className="w-4 h-4" />
                  Ticket submitted successfully! Check its status and reply updates in your workspace.
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 text-center space-y-2">
        <p>© 2026 Sympovex Conference SaaS. All rights reserved.</p>
        <p className="text-slate-600 font-mono">Tenant ID: {currentConference.id} | Powered by React 19 & Tailwind v4</p>
      </footer>

      {/* MODALS */}
      {/* 1. SPEAKER DETAIL BIO ABSTRACT */}
      {activeSpeaker && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setActiveSpeaker(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <img 
                src={activeSpeaker.photo} 
                alt={activeSpeaker.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
              />
              <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white leading-tight">{activeSpeaker.name}</h3>
                <span className="text-sm text-primary font-semibold">{activeSpeaker.affiliation}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500">Biography</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {activeSpeaker.bio}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-2">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wide">Plenary Address Abstract</h4>
              <h5 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{activeSpeaker.talkTitle}</h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {activeSpeaker.talkAbstract}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. SCHEDULE SLOT DETAILS */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setActiveSlot(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-primary/10 text-primary rounded">
                {activeSlot.time}
              </span>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                {activeSlot.title}
              </h3>
            </div>

            <div className="space-y-3 pt-2 text-sm">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="text-slate-500 font-medium">Session Track:</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeSlot.track}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="text-slate-500 font-medium">Room location:</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeSlot.room}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="text-slate-500 font-medium">Session Chair:</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeSlot.chairperson}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="text-slate-500 font-medium">Presenter:</span>
                <span className="font-bold text-primary">{activeSlot.speaker}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-medium block">Overview Description:</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {activeSlot.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. POSTER LIGHTBOX WITH COMMENT SECTION */}
      {activePoster && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-2xl max-w-5xl w-full h-[85vh] flex flex-col md:flex-row border border-slate-200 dark:border-slate-850 shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => setActivePoster(null)}
              className="absolute top-4 right-4 z-50 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-1.5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Poster Media Box */}
            <div className="flex-[3] bg-slate-100 dark:bg-slate-900 relative flex items-center justify-center border-r border-slate-200 dark:border-slate-800 h-1/2 md:h-full">
              <img
                src={activePoster.url}
                alt={activePoster.title}
                className="max-w-full max-h-full object-contain"
              />
              <span className="absolute bottom-4 left-4 text-xs font-mono font-bold px-3 py-1 bg-slate-950/80 text-white rounded backdrop-blur-xs uppercase border border-slate-700">
                Topic: {activePoster.topic}
              </span>
            </div>

            {/* Q&A Comments Sidebar */}
            <div className="flex-[2] flex flex-col justify-between bg-white dark:bg-slate-900 h-1/2 md:h-full">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug">{activePoster.title}</h3>
                <div className="text-xs text-slate-500 font-medium">
                  <div>Presenter: <span className="text-primary font-semibold">{activePoster.author}</span></div>
                  <div>Affiliation: {activePoster.affiliation}</div>
                </div>
              </div>

              {/* COMMENTS LOG */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Q&A Chat Thread</h4>
                
                {activePoster.comments.length > 0 ? (
                  activePoster.comments.map(c => (
                    <div key={c.id} className="space-y-1 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="font-bold text-slate-900 dark:text-white">{c.user}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 leading-relaxed text-slate-700 dark:text-slate-300">
                        {c.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-slate-400 text-xs italic">
                    No questions asked yet. Be the first to inquire about this research!
                  </div>
                )}
              </div>

              {/* POST COMMENT FORM */}
              {currentUser ? (
                <form onSubmit={handleAddComment} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ask a question or comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 text-xs rounded-lg px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-primary hover:bg-secondary text-white p-2 rounded-lg cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center animate-in fade-in">
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer bg-transparent border-none p-0 inline"
                  >
                    Sign In to ask a question or comment
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 4. SPONSOR VIRTUAL BOOTH MODAL */}
      {activeSponsor && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full h-[80vh] flex flex-col border border-slate-200 dark:border-slate-850 shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-hidden">
            
            {/* Close */}
            <button
              onClick={() => setActiveSponsor(null)}
              className="absolute top-4 right-4 z-50 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-1.5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40">
              <img src={activeSponsor.logo} alt="Logo" className="h-12 w-auto object-contain max-w-[120px]" />
              <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">{activeSponsor.name}</h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded">
                  {activeSponsor.tier} Partner Stand
                </span>
              </div>
            </div>

            {/* Content panel */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Bio</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {activeSponsor.description}
                  </p>

                  {activeSponsor.brochure && (
                    <div className="pt-2">
                      <button
                        onClick={() => alert(`Downloading brochure: ${activeSponsor.brochure}`)}
                        className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-lg border border-primary/20 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF Brochure
                      </button>
                    </div>
                  )}
                </div>

                {/* Video Demo */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Promotional Video Demo</h4>
                  {activeSponsor.videoUrl ? (
                    <div className="rounded-xl overflow-hidden aspect-video bg-black border border-slate-200 dark:border-slate-800 shadow-sm relative group flex items-center justify-center">
                      <video 
                        src={activeSponsor.videoUrl} 
                        controls 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl aspect-video bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 border-dashed flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <Play className="w-8 h-8 text-slate-300 mb-2" />
                      <span className="text-xs italic font-medium">Corporate showcase video not uploaded.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Inquiry form */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Direct Booth Inquiry / Contact Form</h4>
                
                {boothLeadSubmitted ? (
                  <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 p-4 rounded-xl border border-green-500/10 text-sm font-semibold">
                    <Check className="w-5 h-5" />
                    Inquiry submitted! The sponsor representatives have been notified.
                  </div>
                ) : (
                  <form onSubmit={handleBoothLeadSubmit} className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Your Full Name</label>
                        <input
                          type="text"
                          required
                          value={boothLeadName}
                          onChange={(e) => setBoothLeadName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full text-xs rounded px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Work Email</label>
                        <input
                          type="email"
                          required
                          value={boothLeadEmail}
                          onChange={(e) => setBoothLeadEmail(e.target.value)}
                          placeholder="j.doe@company.com"
                          className="w-full text-xs rounded px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 flex flex-col justify-between">
                      <div className="space-y-1 flex-1">
                        <label className="text-[10px] font-bold text-slate-500">Message / Request</label>
                        <textarea
                          rows={2}
                          required
                          value={boothLeadMessage}
                          onChange={(e) => setBoothLeadMessage(e.target.value)}
                          placeholder="Write questions regarding products/technologies..."
                          className="w-full text-xs rounded px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white h-[66px] resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="py-1.5 bg-primary hover:bg-secondary text-white font-semibold text-xs rounded transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send Inquiry
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
