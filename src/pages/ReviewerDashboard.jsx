import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useLanguage } from '../context/LanguageContext';
import { FileText, CheckCircle, Clock, Send, Star, AlertCircle, Sparkles, Upload, Check, Download, FileDown } from 'lucide-react';

export default function ReviewerDashboard() {
  const {
    papers,
    reviews,
    currentUser,
    submitPaperReview,
    currentConference,
    evaluationCriteria,
    submitGalleryPhoto
  } = useDatabase();
  const { t } = useLanguage();

  const [revTab, setRevTab] = useState('papers'); // 'papers', 'gallery'
  const [evaluatingPaperId, setEvaluatingPaperId] = useState(null);
  
  // Custom criteria rating states
  const [critScores, setCritScores] = useState({}); // { [critId]: score }

  // Fallback defaults if no criteria configured
  const [originality, setOriginality] = useState(3);
  const [methodology, setMethodology] = useState(3);
  const [relevance, setRelevance] = useState(3);

  // Split Remarks
  const [formRemarks, setFormRemarks] = useState('');
  const [scientificRemarks, setScientificRemarks] = useState('');
  const [commentsFile, setCommentsFile] = useState(null);

  // Recommended Presentation format
  const [presentationFormat, setPresentationFormat] = useState('Oral Presentation');

  // Gallery Upload
  const [galleryUrl, setGalleryUrl] = useState('');
  const [galleryCaption, setGalleryCaption] = useState('');
  const [gallerySuccess, setGallerySuccess] = useState(false);

  // Get papers assigned to this reviewer
  const assignedPapers = papers.filter(
    p => p.conferenceId === currentConference.id && p.reviewerIds.includes(currentUser.id)
  );

  const selectedPaper = assignedPapers.find(p => p.id === evaluatingPaperId);
  const activeCriteria = evaluationCriteria.filter(c => c.conferenceId === currentConference.id);

  const handleSubmitEvaluation = (e) => {
    e.preventDefault();
    if (!evaluatingPaperId) return;

    // Calculate originality, methodology, relevance fallback averages
    let orig = originality;
    let meth = methodology;
    let rel = relevance;

    if (activeCriteria.length > 0) {
      const scores = activeCriteria.map(c => critScores[c.id] || 3);
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      orig = avg;
      meth = avg;
      rel = avg;
    }

    submitPaperReview({
      paperId: evaluatingPaperId,
      originality: parseInt(orig),
      methodology: parseInt(meth),
      relevance: parseInt(rel),
      critScores,
      formRemarks,
      scientificRemarks,
      presentationFormat,
      comments: `Scientific Content Remarks:\n${scientificRemarks}\n\nForm & Formatting Remarks:\n${formRemarks}`,
      commentsFileName: commentsFile ? commentsFile.name : null
    });

    setEvaluatingPaperId(null);
    setCritScores({});
    setOriginality(3);
    setMethodology(3);
    setRelevance(3);
    setFormRemarks('');
    setScientificRemarks('');
    setCommentsFile(null);
    alert('Scientific evaluation grid submitted successfully.');
  };

  const handleGallerySubmit = (e) => {
    e.preventDefault();
    if (!galleryUrl) return;
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

  return (
    <div className="space-y-8 animate-in fade-in duration-350">
      
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('reviewerConsole')}</h2>
        <p className="text-sm text-slate-500">{t('reviewerDesc')}</p>
      </div>

      {/* SUB TABS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        {[
          { id: 'papers', label: t('assignedPapers'), icon: FileText },
          { id: 'gallery', label: t('galleryUpload'), icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setRevTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 border-b-2 text-sm font-semibold transition cursor-pointer -mb-px ${
                revTab === tab.id
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

      {/* SUB TAB: ASSIGNED PAPERS */}
      {revTab === 'papers' && (
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Papers directory list */}
          <div className="md:col-span-2 space-y-4">
            
            {/* Proceedings download banner */}
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-extrabold text-xs text-indigo-755 dark:text-indigo-400 flex items-center gap-1">
                  <FileDown className="w-4 h-4" /> {t('proceedingsDownload')}
                </h4>
                <p className="text-[11px] text-slate-500 max-w-lg font-medium leading-relaxed">{t('proceedingsDesc')}</p>
              </div>
              <button
                onClick={() => alert('Téléchargement du fichier proceedings_gacs2026.pdf (Simulation)')}
                className="py-1.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> {t('proceedingsBtn')}
              </button>
            </div>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('assignedPapers')}</h3>
            
            <div className="space-y-3">
              {assignedPapers.map(paper => {
                const myReview = reviews.find(r => r.paperId === paper.id && r.reviewerId === currentUser.id);
                return (
                  <div key={paper.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-400">ID: {paper.id}</span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{paper.title}</h4>
                      <p className="text-xs text-slate-400">Authors: {paper.authors.map(a => a.name).join(', ')}</p>
                      
                      <div className="pt-2 flex items-center gap-4 text-[10px]">
                        <span className="text-slate-400">Version: {paper.versions[paper.versions.length - 1]?.version}</span>
                        <span className="text-slate-400">Uploaded: {new Date(paper.versions[paper.versions.length - 1]?.timestamp).toLocaleDateString()}</span>
                        <button
                          onClick={() => alert(`Downloading manuscript file: ${paper.versions[paper.versions.length - 1]?.fileName}`)}
                          className="text-primary hover:underline font-bold cursor-pointer"
                        >
                          {t('download')} {t('paperLabel')}
                        </button>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase block text-center ${
                        myReview ? 'bg-green-500/10 text-green-650' : 'bg-amber-500/10 text-amber-650'
                      }`}>
                        {myReview ? t('statusReviewed') : t('statusPending')}
                      </span>
                      <button
                        onClick={() => setEvaluatingPaperId(paper.id)}
                        className="px-3 py-1.5 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-xs"
                      >
                        {myReview ? t('viewScoreCard') : t('evaluateBtn')}
                      </button>
                    </div>
                  </div>
                );
              })}

              {assignedPapers.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-900 border rounded-2xl text-slate-400 italic text-xs shadow-xs">
                  {t('noAssignedPapersTrack')}
                </div>
              )}
            </div>
          </div>

          {/* EVALUATION PANE */}
          <div className="md:col-span-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
            {selectedPaper ? (
              <div className="space-y-6">
                <div className="border-b pb-2">
                  <span className="text-[10px] font-mono text-slate-400">{t('colStatus')}</span>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white mt-0.5 line-clamp-2 leading-tight">{selectedPaper.title}</h3>
                </div>

                {reviews.find(r => r.paperId === selectedPaper.id && r.reviewerId === currentUser.id) ? (
                  <div className="space-y-5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 bg-green-500/10 text-green-600 dark:text-green-400 p-3 rounded-lg border border-green-500/10 font-bold">
                      <CheckCircle className="w-4 h-4" />
                      {t('readOnlyReview')}
                    </div>
                    <button
                      onClick={() => setEvaluatingPaperId(null)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded font-semibold transition cursor-pointer"
                    >
                      {t('closePane')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
                    
                    {/* Render Criteria Dynamically */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white border-b pb-1">{t('scoreCriteria')}</h4>
                      {activeCriteria.map(crit => {
                        const score = critScores[crit.id] || 3;
                        return (
                          <div key={crit.id} className="space-y-1">
                            <div className="flex justify-between font-bold text-slate-500">
                              <span>{crit.name}</span>
                              <span className="text-primary font-mono">{score} / {crit.maxScore || 5}</span>
                            </div>
                            <input
                              type="range"
                              min={1}
                              max={crit.maxScore || 5}
                              value={score}
                              onChange={(e) => setCritScores({ ...critScores, [crit.id]: Number(e.target.value) })}
                              className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                          </div>
                        );
                      })}                      {activeCriteria.length === 0 && (
                        <>
                          <div className="space-y-1">
                            <div className="flex justify-between font-bold text-slate-500">
                              <span>{t('originalityNovelty')}</span>
                              <span className="text-primary font-mono">{originality} / 5</span>
                            </div>
                            <input
                              type="range"
                              min={1}
                              max={5}
                              value={originality}
                              onChange={(e) => setOriginality(e.target.value)}
                              className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between font-bold text-slate-500">
                              <span>{t('methodologyRigor')}</span>
                              <span className="text-primary font-mono">{methodology} / 5</span>
                            </div>
                            <input
                              type="range"
                              min={1}
                              max={5}
                              value={methodology}
                              onChange={(e) => setMethodology(e.target.value)}
                              className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Presentation format recommendation */}
                    <div className="space-y-1.5 border-t pt-3">
                      <label className="font-bold text-slate-500 block">{t('presentationFormat')}</label>
                      <select
                        value={presentationFormat}
                        onChange={(e) => setPresentationFormat(e.target.value)}
                        className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="Oral Presentation">{t('oralFormat')}</option>
                        <option value="Poster Presentation">{t('posterFormat')}</option>
                      </select>
                    </div>

                    {/* Scientific Comments */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">{t('commentsSciLabel')}</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Rédigez les remarques sur le fond scientifique..."
                        value={scientificRemarks}
                        onChange={(e) => setScientificRemarks(e.target.value)}
                        className="w-full text-xs rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>

                    {/* Formatting Comments */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">{t('commentsFormLabel')}</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Rédigez les remarques de forme, mise en page..."
                        value={formRemarks}
                        onChange={(e) => setFormRemarks(e.target.value)}
                        className="w-full text-xs rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>

                    {/* File Attachment */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500 block">{t('attachCommentsFile')}</label>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => setCommentsFile(e.target.files[0])}
                        className="w-full text-xs text-slate-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-primary hover:bg-secondary text-white font-semibold rounded-lg transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> {t('reviewSubmitBtn')}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center italic text-xs">
                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                {t('selectManuscriptPrompt')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB: EVENT GALLERY PHOTOS */}
      {revTab === 'gallery' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t('galleryUpload')}</h3>
            <p className="text-xs text-slate-500">{t('galleryDesc')}</p>
          </div>

          <form onSubmit={handleGallerySubmit} className="space-y-4">
            {gallerySuccess && (
              <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/15 rounded-xl text-xs font-semibold text-center animate-in zoom-in-95">
                {t('gallerySuccess')}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 block">{t('choosePhotoSubmit')}</label>
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
              <label className="text-xs font-bold text-slate-550">{t('galleryCaptionLabel')}</label>
              <input
                type="text"
                required
                placeholder={t('photoCaptionPlaceholder')}
                value={galleryCaption}
                onChange={(e) => setGalleryCaption(e.target.value)}
                className="w-full text-xs rounded-lg px-3 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg transition shadow-md shadow-primary/10 cursor-pointer"
            >
              {t('gallerySubmitBtn')}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
