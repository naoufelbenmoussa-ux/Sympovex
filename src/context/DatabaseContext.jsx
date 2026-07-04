import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbInstance } from '../db/mockDb';
import { useAuth } from './AuthContext';

const DatabaseContext = createContext();

export const DatabaseProvider = ({ children }) => {
  const { session, impersonate } = useAuth();
  const [dbState, setDbState] = useState({
    conferences: [],
    users: [],
    papers: [],
    reviews: [],
    posters: [],
    speakers: [],
    schedule: [],
    tickets: [],
    surveys: [],
    gallery: [],
    votes: [],
    sponsors: [],
    mailingHistory: [],
    chatMessages: [],
    meetings: [],
    topics: [],
    evaluationCriteria: [],
    surveySubmissions: []
  });

  const [currentConfId, setCurrentConfId] = useState(() => {
    const hash = window.location.hash;
    const cleanHash = hash.replace(/^#\/?/, '');
    const parts = cleanHash.split('/').filter(Boolean);
    const acronym = parts[0];
    if (acronym) {
      try {
        const stored = localStorage.getItem('sympovex_db');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.conferences) {
            const match = parsed.conferences.find(c => c.id === acronym || (c.acronym && c.acronym.toLowerCase() === acronym.toLowerCase()));
            if (match) return match.id;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  // Sync state when URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const cleanHash = hash.replace(/^#\/?/, '');
      const parts = cleanHash.split('/').filter(Boolean);
      const acronym = parts[0];
      if (acronym) {
        const confs = dbInstance.getTable('conferences');
        const match = confs.find(c => c.id === acronym || (c.acronym && c.acronym.toLowerCase() === acronym.toLowerCase()));
        if (match) {
          if (match.id !== currentConfId) {
            setCurrentConfId(match.id);
          }
        } else {
          window.location.hash = '';
        }
      } else {
        if (currentConfId !== null) {
          setCurrentConfId(null);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentConfId]);

  const changeConference = (confId) => {
    const confs = dbInstance.getTable('conferences');
    const conf = confs.find(c => c.id === confId);
    if (conf) {
      const acronym = (conf.acronym || conf.id).toLowerCase();
      const currentHash = window.location.hash.replace(/^#\/?/, '');
      const isDashboard = currentHash.includes('/dashboard');
      window.location.hash = `#/${acronym}${isDashboard ? '/dashboard' : ''}`;
      setCurrentConfId(confId);
    }
  };

  const currentUserId = session?.userId || null;
  const setCurrentUserId = (userId) => {
    impersonate(userId);
  };

  // Load database state
  const refreshState = () => {
    setDbState({
      conferences: dbInstance.getTable('conferences'),
      users: dbInstance.getTable('users'),
      papers: dbInstance.getTable('papers'),
      reviews: dbInstance.getTable('reviews'),
      posters: dbInstance.getTable('posters'),
      speakers: dbInstance.getTable('speakers'),
      schedule: dbInstance.getTable('schedule'),
      tickets: dbInstance.getTable('tickets'),
      surveys: dbInstance.getTable('surveys'),
      gallery: dbInstance.getTable('gallery'),
      votes: dbInstance.getTable('votes'),
      sponsors: dbInstance.getTable('sponsors'),
      mailingHistory: dbInstance.getTable('mailingHistory'),
      chatMessages: dbInstance.getTable('networking').messages || [],
      meetings: dbInstance.getTable('networking').meetings || [],
      topics: dbInstance.getTable('topics'),
      evaluationCriteria: dbInstance.getTable('evaluationCriteria'),
      surveySubmissions: dbInstance.getTable('surveySubmissions')
    });
  };

  useEffect(() => {
    refreshState();
  }, []);

  const currentConference = dbState.conferences.find(c => c.id === currentConfId) || dbState.conferences[0];
  const currentUserObj = currentUserId ? (dbState.users.find(u => u.id === currentUserId) || null) : null;
  const currentUser = currentUserObj ? {
    ...currentUserObj,
    role: session?.activeRole || currentUserObj.role
  } : null;

  // Wrapper functions to modify state
  const updateConferenceDetails = (updateData) => {
    dbInstance.updateConference(currentConfId, updateData);
    refreshState();
  };

  const createNewConference = (confData) => {
    const confs = dbInstance.getTable('conferences');
    const cleanAcronym = confData.acronym 
      ? confData.acronym.toLowerCase().replace(/[^a-z0-9]/g, '')
      : confData.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
    const newId = cleanAcronym;
    const newConf = {
      id: newId,
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
      colors: { primary: '#6366f1', secondary: '#4f46e5', accent: '#f59e0b' },
      status: 'active',
      ...confData,
      acronym: confData.acronym || newId.toUpperCase()
    };
    confs.push(newConf);
    dbInstance.updateTable('conferences', confs);
    refreshState();
    return newConf;
  };

  const adminUpdateConference = (confId, updateData) => {
    dbInstance.updateConference(confId, updateData);
    refreshState();
  };

  const createNewUser = (userData) => {
    const newUser = dbInstance.createUser({ conferenceId: currentConfId, ...userData });
    refreshState();
    return newUser;
  };

  const updateUserRole = (userId, newRole) => {
    const users = dbInstance.getTable('users');
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].role = newRole;
      dbInstance.updateTable('users', users);
      refreshState();
    }
  };

  const updateUserProfile = (userId, profileData) => {
    const users = dbInstance.getTable('users');
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...profileData };
      dbInstance.updateTable('users', users);
      refreshState();
    }
  };

  const activateUser = (userId) => {
    dbInstance.activateUser(userId);
    refreshState();
  };

  const suspendUser = (userId) => {
    dbInstance.suspendUser(userId);
    refreshState();
  };

  const deleteUser = (userId) => {
    dbInstance.deleteUser(userId);
    refreshState();
  };

  // Topics CRUD
  const addTopic = (topicData) => {
    dbInstance.createTopic({ conferenceId: currentConfId, ...topicData });
    refreshState();
  };

  const updateTopic = (topicId, updateData) => {
    dbInstance.updateTopic(topicId, updateData);
    refreshState();
  };

  const deleteTopic = (topicId) => {
    dbInstance.deleteTopic(topicId);
    refreshState();
  };

  // PSC Paper CRUD
  const addPaper = (paperData) => {
    dbInstance.createPaper({ conferenceId: currentConfId, ...paperData });
    refreshState();
  };

  const updatePaper = (paperId, updateData) => {
    dbInstance.updatePaper(paperId, updateData);
    refreshState();
  };

  const deletePaper = (paperId) => {
    dbInstance.deletePaper(paperId);
    refreshState();
  };

  // User Admin
  const promoteParticipantToReviewer = (userId) => {
    dbInstance.promoteParticipantToReviewer(userId);
    refreshState();
  };

  const adminCreateUser = (userData) => {
    const res = dbInstance.adminCreateUser({ conferenceId: currentConfId, ...userData });
    refreshState();
    return res;
  };

  // Criteria CRUD
  const addCriterion = (critData) => {
    dbInstance.createEvaluationCriterion({ conferenceId: currentConfId, ...critData });
    refreshState();
  };

  const updateCriterion = (critId, updateData) => {
    dbInstance.updateEvaluationCriterion(critId, updateData);
    refreshState();
  };

  const deleteCriterion = (critId) => {
    dbInstance.deleteEvaluationCriterion(critId);
    refreshState();
  };

  // Surveys
  const submitSurvey = (surveyData) => {
    const res = dbInstance.submitSurvey({ conferenceId: currentConfId, userId: currentUserId, ...surveyData });
    refreshState();
    return res;
  };

  // Gallery
  const submitGalleryPhoto = (photoData) => {
    const res = dbInstance.submitGalleryPhoto({ conferenceId: currentConfId, userId: currentUserId, ...photoData });
    refreshState();
    return res;
  };

  const approveGalleryPhoto = (photoId) => {
    dbInstance.approveGalleryPhoto(photoId);
    refreshState();
  };

  const deleteGalleryPhoto = (photoId) => {
    dbInstance.deleteGalleryPhoto(photoId);
    refreshState();
  };

  // Guidelines
  const updateConferenceGuidelines = (guidelines) => {
    dbInstance.updateConferenceGuidelines(currentConfId, guidelines);
    refreshState();
  };

  // Networking Confirmations
  const acceptMeeting = (meetingId) => {
    const success = dbInstance.acceptMeeting(meetingId);
    refreshState();
    return success;
  };

  const declineMeeting = (meetingId) => {
    const success = dbInstance.declineMeeting(meetingId);
    refreshState();
    return success;
  };

  // Sponsors
  const updateSponsorInfo = (sponsorId, updateData) => {
    const res = dbInstance.updateSponsorInfo(sponsorId, updateData);
    refreshState();
    return res;
  };

  // PSC Review Dispatch
  const dispatchReviewReport = (paperId, pscNote) => {
    const result = dbInstance.dispatchReviewReport(paperId, pscNote, currentUser?.name || 'PSC');
    refreshState();
    return result;
  };


  const submitPaperSubmission = (paperData) => {
    const newPaper = dbInstance.createPaper({
      conferenceId: currentConfId,
      submitterId: currentUser.id,
      reviewerIds: [],
      ...paperData
    });

    // Log confirmation email to mailing history
    const mailingHistory = dbInstance.getTable('mailingHistory');
    mailingHistory.push({
      id: 'm_' + Math.random().toString(36).substr(2, 9),
      conferenceId: currentConfId,
      senderName: 'Sympovex System',
      subject: `[GACS 2026] Réception de votre soumission — Réf: ${newPaper.id.toUpperCase()}`,
      recipientSegment: currentUser.email,
      body: `Bonjour ${currentUser.name},\n\nVotre article "${newPaper.title}" a été enregistré avec succès.\nRéférence : ${newPaper.id.toUpperCase()}\nStatut : Soumission Initiale\n\nLe Comité Scientifique vous contactera lors de l'affectation des relecteurs.`,
      sentCount: 1,
      paperId: newPaper.id,
      timestamp: new Date().toISOString()
    });
    dbInstance.updateTable('mailingHistory', mailingHistory);

    refreshState();
    return newPaper;
  };

  const uploadRevisedPaperVersion = (paperId, versionData) => {
    dbInstance.uploadNewVersion(paperId, versionData);
    refreshState();
  };

  const updatePaperStatus = (paperId, status) => {
    const papers = dbInstance.getTable('papers');
    const idx = papers.findIndex(p => p.id === paperId);
    if (idx !== -1) {
      papers[idx].status = status;
      dbInstance.updateTable('papers', papers);
      refreshState();
    }
  };

  const assignReviewersToPaper = (paperId, reviewerIds) => {
    const papers = dbInstance.getTable('papers');
    const idx = papers.findIndex(p => p.id === paperId);
    if (idx !== -1) {
      papers[idx].reviewerIds = reviewerIds;
      dbInstance.updateTable('papers', papers);
      refreshState();
    }
  };

  const submitPaperReview = (reviewData) => {
    dbInstance.submitReview({ reviewerId: currentUser.id, ...reviewData });
    refreshState();
  };

  const createNewSupportTicket = (ticketData) => {
    const newTicket = dbInstance.createTicket({
      conferenceId: currentConfId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      ...ticketData
    });
    refreshState();
    return newTicket;
  };

  const replyToSupportTicket = (ticketId, text) => {
    dbInstance.addTicketReply(ticketId, currentUser.name + ` (${currentUser.role})`, text);
    refreshState();
  };

  const updateTicketStatus = (ticketId, status) => {
    const tickets = dbInstance.getTable('tickets');
    const idx = tickets.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      tickets[idx].status = status;
      dbInstance.updateTable('tickets', tickets);
      refreshState();
    }
  };

  const createNewSurvey = (surveyData) => {
    const newSurvey = dbInstance.createSurvey({
      conferenceId: currentConfId,
      ...surveyData
    });
    refreshState();
    return newSurvey;
  };

  const blastSurveyLink = (surveyId) => {
    const surveys = dbInstance.getTable('surveys');
    const idx = surveys.findIndex(s => s.id === surveyId);
    if (idx !== -1) {
      surveys[idx].blastCount = (surveys[idx].blastCount || 0) + 1;
      dbInstance.updateTable('surveys', surveys);
      refreshState();
    }
  };

  const submitSurveyFeedback = (surveyId, answerData) => {
    dbInstance.submitSurveyResponse(surveyId, answerData);
    refreshState();
  };

  const addCommentToPoster = (posterId, text) => {
    dbInstance.addPosterComment(posterId, currentUser.name, text);
    refreshState();
  };

  const castUserVote = (category, candidateId) => {
    const res = dbInstance.castVote(currentUser.id, currentConfId, category, candidateId);
    refreshState();
    return res;
  };

  const sendChat = (toId, text) => {
    dbInstance.sendChatMessage({
      conferenceId: currentConfId,
      fromId: currentUser.id,
      toId,
      text
    });
    refreshState();
  };

  const scheduleMeeting = (meetingData) => {
    dbInstance.createMeeting({
      conferenceId: currentConfId,
      hostId: currentUser.id,
      ...meetingData
    });
    refreshState();
  };

  const updateMeeting = (meetingId, status) => {
    dbInstance.updateMeetingStatus(meetingId, status);
    refreshState();
  };

  const uploadGalleryPhoto = (url, caption) => {
    const gallery = dbInstance.getTable('gallery');
    gallery.push({
      id: Math.random().toString(36).substr(2, 9),
      conferenceId: currentConfId,
      uploaderName: currentUser.name,
      url,
      caption,
      approved: false, // Default pending moderation queue
      timestamp: new Date().toISOString()
    });
    dbInstance.updateTable('gallery', gallery);
    refreshState();
  };



  const updateSponsorBooth = (sponsorId, updateData) => {
    const sponsors = dbInstance.getTable('sponsors');
    const idx = sponsors.findIndex(s => s.id === sponsorId);
    if (idx !== -1) {
      sponsors[idx] = { ...sponsors[idx], ...updateData };
      dbInstance.updateTable('sponsors', sponsors);
      refreshState();
    }
  };

  const addSponsor = (sponsorData) => {
    const sponsors = dbInstance.getTable('sponsors');
    sponsors.push({
      id: 'sp_' + Math.random().toString(36).substr(2, 9),
      conferenceId: currentConfId,
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
      videoUrl: '',
      brochure: '',
      ...sponsorData
    });
    dbInstance.updateTable('sponsors', sponsors);
    refreshState();
  };

  const sendEmailCampaign = (subject, recipientSegment, body) => {
    const mailingHistory = dbInstance.getTable('mailingHistory');
    const recipientUsers = dbState.users.filter(u => {
      if (recipientSegment === 'All Registered Participants') return true;
      if (recipientSegment === 'PhD Students' && u.attribute === 'PhD Student') return true;
      if (recipientSegment === 'Research Professors' && u.attribute === 'Research Professor') return true;
      if (recipientSegment === 'Authors' && u.role === 'Author') return true;
      return false;
    });

    mailingHistory.push({
      id: 'm_' + Math.random().toString(36).substr(2, 9),
      conferenceId: currentConfId,
      senderName: currentUser.name + ` (${currentUser.role})`,
      subject,
      recipientSegment,
      sentCount: recipientUsers.length,
      body,
      timestamp: new Date().toISOString()
    });
    dbInstance.updateTable('mailingHistory', mailingHistory);
    refreshState();
  };

  const addKeynoteSpeaker = (speakerData) => {
    const speakers = dbInstance.getTable('speakers');
    speakers.push({
      id: 'spk_' + Math.random().toString(36).substr(2, 9),
      conferenceId: currentConfId,
      photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=60',
      ...speakerData
    });
    dbInstance.updateTable('speakers', speakers);
    refreshState();
  };

  const addScheduleSlot = (slotData) => {
    const schedule = dbInstance.getTable('schedule');
    schedule.push({
      id: 'sch_' + Math.random().toString(36).substr(2, 9),
      conferenceId: currentConfId,
      ...slotData
    });
    dbInstance.updateTable('schedule', schedule);
    refreshState();
  };

  const resetDatabase = () => {
    const cleanDb = dbInstance.reset();
    refreshState();
    return cleanDb;
  };

  return (
    <DatabaseContext.Provider value={{
      ...dbState,
      currentConference,
      currentUser,
      currentConfId,
      currentUserId,
      setCurrentConferenceId: changeConference,
      setCurrentUserId,
      updateConferenceDetails,
      adminUpdateConference,
      createNewConference,
      createNewUser,
      updateUserRole,
      updateUserProfile,
      activateUser,
      suspendUser,
      deleteUser,
      addTopic,
      updateTopic,
      deleteTopic,
      addPaper,
      updatePaper,
      deletePaper,
      promoteParticipantToReviewer,
      adminCreateUser,
      addCriterion,
      updateCriterion,
      deleteCriterion,
      submitSurvey,
      submitGalleryPhoto,
      approveGalleryPhoto,
      deleteGalleryPhoto,
      updateConferenceGuidelines,
      acceptMeeting,
      declineMeeting,
      updateSponsorInfo,
      dispatchReviewReport,
      submitPaperSubmission,
      uploadRevisedPaperVersion,
      updatePaperStatus,
      assignReviewersToPaper,
      submitPaperReview,
      createNewSupportTicket,
      replyToSupportTicket,
      updateTicketStatus,
      createNewSurvey,
      blastSurveyLink,
      submitSurveyFeedback,
      addCommentToPoster,
      castUserVote,
      sendChat,
      scheduleMeeting,
      updateMeeting,
      uploadGalleryPhoto,
      updateSponsorBooth,
      addSponsor,
      sendEmailCampaign,
      addKeynoteSpeaker,
      addScheduleSlot,
      resetDatabase
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
