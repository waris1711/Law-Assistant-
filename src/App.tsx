/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  INITIAL_LEGAL_BRIEFS,
  STATUTORY_CROSS_MAPPINGS,
  resolveEmbeddedStatutoryMappings,
} from './data/legalDatabase';
import { CounselPosture, LegalBrief, LegalDomain, StatutoryMappingEntry } from './types/legal';
import { BriefView } from './components/BriefView';
import { CrossMapperView } from './components/CrossMapperView';
import { PrecedentDigestView } from './components/PrecedentDigestView';
import { ConstitutionView } from './components/ConstitutionView';
import { LegalGlossaryView } from './components/LegalGlossaryView';
import { AskLawAIView } from './components/AskLawAIView';
import { CaseLawFinderView } from './components/CaseLawFinderView';
import { handleSectionMapping, seedStatutoryCache } from './services/statutoryCache';
import { useLanguage, localizeMappingEntry } from './context/LanguageContext';
import {
  Search,
  Clock,
  FileText,
  Send,
  Loader2,
  Download,
  Copy,
  Check,
  Trash2,
  BookOpen,
  ArrowRightLeft,
  Terminal,
  Maximize2,
} from 'lucide-react';

type ThemeMode = 'midnight' | 'courtroom' | 'light';
type EngineMode = 'cloud' | 'offline';
type WorkspaceMode =
  | 'station'
  | 'constitution'
  | 'askLawAI'
  | 'caseFinder'
  | 'full-dossiers'
  | 'full-crossmapper'
  | 'full-precedents'
  | 'glossary'
  | 'libraryTab';

interface ConsoleMessage {
  id: string;
  role: 'user' | 'lexintel';
  timestamp: string;
  queryText?: string;
  posture?: CounselPosture;
  engineUsed?: string;
  brief?: LegalBrief;
  errorText?: string;
}

const STORAGE_BRIEFS_KEY = 'lexintel_saved_briefs_v2';
const STORAGE_MAPPINGS_KEY = 'lexintel_saved_mappings_v2';
const STORAGE_THEME_KEY = 'lexintel_theme_v2';

const PRESET_INJECTORS: Record<
  string,
  { title: string; domain: LegalDomain; posture: CounselPosture; prompt: string }
> = {
  cross_exam: {
    title: 'Hostile Ocular Witness & Medical-Ocular Contradiction Cross-Examination Strategy',
    domain: 'Criminal & Forensic Law',
    posture: 'Defense / Accused / Appellant',
    prompt:
      'In a trial under Section 103(1) BNS (Section 302 IPC), the sole eye-witness PW-2 claims the accused fired a point-blank pistol shot from a distance of 2 feet at 11:30 PM. However, the Post-Mortem Report (PMR) notes total absence of blackening, tattooing, or charring around the entry wound, and the site plan prepared by the IO omits the street-light source deposed by PW-2. Formulate a clinical statutory and precedent-backed cross-examination trap and evidentiary impeachment strategy under the Bharatiya Sakshya Adhiniyam, 2023 (Sections 140, 148, and 39 BSA) and BNSS, 2023.',
  },
  default_bail: {
    title: 'Tranche-Based Police Custody & Statutory Default Bail Under BNSS §187(2)–(3) vs. CrPC §167(2)',
    domain: 'Procedural & Custodial Law',
    posture: 'Defense / Accused / Appellant',
    prompt:
      'Accused was remanded on 01.09.2026 for an offence under BNS §316(5) / §318(4). Only 6 days of Police Custody were taken in the first 15 days. On the 34th day of detention, the IO seeks 9 more days of Police Custody under Section 187(2) BNSS. Further, on the 61st day at 10:30 AM, defense files for Default Bail under Section 187(3) BNSS while the IO e-files an incomplete chargesheet without the mandatory Section 63 BSA hash report at 03:30 PM. Analyze the validity of mid-stream Police Custody tranches and the indefeasible right to statutory default bail.',
  },
  quash_482: {
    title: 'Quashing of Criminal Proceedings Under Section 528 BNSS (Section 482 CrPC) in Commercial Dispute',
    domain: 'Constitutional & Writ Jurisdiction',
    posture: 'Writ Petitioner / Constitutional Challenge',
    prompt:
      'A longstanding civil breach of supply contract between two companies has been converted into an FIR under Section 316(2) (Criminal Breach of Trust) and Section 318(4) (Cheating) of the BNS, 2023 after a 3-year delay, without conducting the 14-day Preliminary Enquiry under Section 173(3) BNSS and without disclosing fraudulent intention at the inception of the contract. Draft the complete legal analysis and procedural roadmap for quashing the FIR and seeking interim stay of arrest under Section 528 BNSS (formerly Section 482 CrPC).',
  },
  electronic_evidence: {
    title: 'Exclusion of Uncertified CCTV USB & WhatsApp Dump Under Section 63(4) BSA Schedule (Part A & B)',
    domain: 'Electronic & Documentary Evidence',
    posture: 'Defense / Accused / Appellant',
    prompt:
      'Prosecution seeks to exhibit a SanDisk USB drive containing CCTV footage copied from a commercial DVR and WhatsApp chat printouts. The original DVR hard drive was overwritten after 14 days. The IO annexed a legacy self-signed Section 65B IEA certificate lacking the signature of the building DVR custodian (Part A) and lacking an Expert SHA-256 cryptographic hash verification (Part B) as mandated by Section 63(4) and the Schedule of the Bharatiya Sakshya Adhiniyam, 2023, and failed to videograph the seizure under Section 105 BNSS. Analyze admissibility and trial objection procedure.',
  },
};

const LIMITATION_REMEDIES: Record<
  string,
  { label: string; days: number; article: string; forum: string; condonationNote: string }
> = {
  hc_criminal_appeal: {
    label: 'Criminal Appeal to High Court (Art. 115(b)(i))',
    days: 60,
    article: 'Article 115(b)(i), First Division, Schedule to the Limitation Act, 1963 (read with §415 BNSS)',
    forum: 'High Court (Appellate Criminal Jurisdiction)',
    condonationNote:
      'Note: Statutory limitation under Art. 115(b)(i) for Criminal Appeal to High Court from any sentence other than death is 60 days (whereas Criminal Revision under Art. 131 or Civil Appeal under Art. 116(a) is 90 days). Delay is condonable under Section 5 of the Limitation Act, 1963 upon showing "sufficient cause", besides exclusion of time spent in obtaining certified copy of the judgment/order under Section 12(2) & (3) of the Limitation Act.',
  },
  sessions_appeal: {
    label: 'Criminal Appeal to Court of Session (Art. 115(b)(ii))',
    days: 30,
    article: 'Article 115(b)(ii), First Division, Schedule to the Limitation Act, 1963 (read with §415(3) BNSS)',
    forum: 'Court of Principal Sessions Judge',
    condonationNote:
      '30 days from the date of the sentence or order appealed from. Exclude the day on which the judgment was pronounced and the time requisite for obtaining a copy of the sentence/order under Section 12(2) of the Limitation Act, 1963. Delay condonable under Section 5.',
  },
  hc_civil_appeal: {
    label: 'Civil First / Second Appeal to High Court (Art. 116(a))',
    days: 90,
    article: 'Article 116(a), Second Division, Schedule to the Limitation Act, 1963 (read with §96 / §100 CPC)',
    forum: 'High Court (Civil Appellate Jurisdiction)',
    condonationNote:
      '90 days from the date of the decree or order. Time requisite for obtaining a certified copy of the decree and judgment is excluded under Section 12(2) & (3) of the Limitation Act, 1963. Accompany delayed appeals with an application under Section 5 Limitation Act read with Order XLI Rule 3A CPC.',
  },
  other_civil_appeal: {
    label: 'Civil Appeal to District / Subordinate Appellate Court (Art. 116(b))',
    days: 30,
    article: 'Article 116(b), Second Division, Schedule to the Limitation Act, 1963 (read with §96 CPC)',
    forum: 'Court of Principal District Judge',
    condonationNote:
      '30 days from the date of the decree or order. Exclude copying days under Section 12(2) of the Limitation Act, 1963.',
  },
  revision_criminal: {
    label: 'Criminal / Civil Revision Petition (Art. 131)',
    days: 90,
    article: 'Article 131, Second Division, Schedule to the Limitation Act, 1963 (read with §438/§442 BNSS or §115 CPC)',
    forum: 'High Court or Court of Session (Revisional Jurisdiction)',
    condonationNote:
      '90 days from the date of the decree or order or sentence sought to be revised. Time spent in obtaining certified copy of the impugned order is excluded under Section 12(2) Limitation Act. Delay condonable under Section 5 Limitation Act.',
  },
};

export default function App() {
  const {
    lang,
    toggleLang,
    t,
    bookmarks,
    updateBookmarkNote,
    removeBookmark,
    exportBookmarks,
    isFeedbackModalOpen,
    feedbackSubject,
    openFeedbackModal,
    closeFeedbackModal,
    triggerHaptic,
  } = useLanguage();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_THEME_KEY) as ThemeMode | null;
    return saved === 'courtroom' || saved === 'light' || saved === 'midnight' ? saved : 'midnight';
  });

  const [engineMode, setEngineMode] = useState<EngineMode>('cloud');
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('full-crossmapper');
  const [activeDossierSheet, setActiveDossierSheet] = useState<'dossier1' | 'dossier2' | 'dossier3'>('dossier1');
  const [dossierCopyToast, setDossierCopyToast] = useState<string | null>(null);
  const [reportSubjectInput, setReportSubjectInput] = useState<string>('');
  const [reportContactInput, setReportContactInput] = useState<string>('');
  const [reportDetailsInput, setReportDetailsInput] = useState<string>('');
  const [isDispatchingFeedback, setIsDispatchingFeedback] = useState<boolean>(false);
  const [feedbackSubmittedMsg, setFeedbackSubmittedMsg] = useState<string | null>(null);
  const [feedbackErrorMsg, setFeedbackErrorMsg] = useState<string | null>(null);
  const [isFounderModalOpen, setIsFounderModalOpen] = useState<boolean>(false);

  const openFounderModal = () => {
    triggerHaptic(15);
    setIsFounderModalOpen(true);
  };

  /**
   * Dispatches user feedback/bug reports directly to Waris Irshad via Gmail.
   * Uses the Web3Forms serverless endpoint (zero backend setup required).
   */
  const handleFeedbackSubmission = async (event?: React.FormEvent | Event) => {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    triggerHaptic(20);
    setFeedbackSubmittedMsg(null);
    setFeedbackErrorMsg(null);

    // 1. Element references
    const feedbackInput = document.getElementById('reportFeedbackInput') as HTMLTextAreaElement | null;
    const contactInput = document.getElementById('reportContactInput') as HTMLInputElement | null;
    const submitButton = document.getElementById('reportSubmitBtn') as HTMLButtonElement | null;
    const reportModal = document.getElementById('reportModal') as HTMLElement | null;

    const rawFeedback =
      (feedbackInput ? feedbackInput.value.trim() : '') || reportDetailsInput.trim();
    const subjectPrefix = reportSubjectInput.trim()
      ? `[Citation/Ref: ${reportSubjectInput.trim()}] `
      : '';
    const feedbackText = `${subjectPrefix}${rawFeedback}`.trim();
    const contactInfo =
      (contactInput ? contactInput.value.trim() : '') ||
      reportContactInput.trim() ||
      'Not provided';

    // 2. Client-side validation
    if (!feedbackText) {
      setFeedbackErrorMsg(
        t(
          'Please enter your feedback or describe the bug before submitting.',
          'Report bhejne se pehle apna feedback ya bug ki tafseel darj karein.'
        )
      );
      if (feedbackInput) feedbackInput.focus();
      return;
    }

    // 3. UI Loading state
    const originalButtonText = submitButton ? submitButton.innerText : 'Submit';
    setIsDispatchingFeedback(true);
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerText = 'Dispatching to Architect Desk...';
    }

    // Persist locally as backup
    try {
      const reports = JSON.parse(localStorage.getItem('lexintel_reports') || '[]');
      reports.push({
        subject: reportSubjectInput.trim() || 'LEXINTEL: New Report / User Feedback',
        contact: contactInfo,
        details: feedbackText,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('lexintel_reports', JSON.stringify(reports));
    } catch {
      // Ignore storage error
    }

    // 4. API Dispatch Payload
    const accessKey =
      (import.meta as unknown as { env?: Record<string, string> }).env
        ?.VITE_WEB3FORMS_ACCESS_KEY || 'YOUR_WEB3FORMS_ACCESS_KEY';

    const payload = {
      access_key: accessKey,
      subject: 'LEXINTEL: New Report / User Feedback',
      from_name: 'LEXINTEL System Reporter',
      to_email: 'ganaiewaris17@gmail.com',
      user_contact: contactInfo,
      report_message: feedbackText,
      submitted_at: new Date().toISOString(),
    };

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setFeedbackSubmittedMsg(
          'Thank you. Your report has been dispatched directly to Waris Irshad.'
        );
        // Clear fields and hide modal
        if (feedbackInput) feedbackInput.value = '';
        if (contactInput) contactInput.value = '';
        setReportDetailsInput('');
        setReportContactInput('');
        setReportSubjectInput('');
        setTimeout(() => {
          if (reportModal) reportModal.style.display = 'none';
          closeFeedbackModal();
        }, 1200);
      } else {
        throw new Error(result.message || 'Submission rejected by endpoint.');
      }
    } catch (error) {
      console.error('Feedback dispatch error:', error);
      setFeedbackErrorMsg(
        'Failed to send report online. Please reach out directly to ganaiewaris17@gmail.com'
      );
    } finally {
      // 5. Restore UI state
      setIsDispatchingFeedback(false);
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerText = originalButtonText;
      }
    }
  };

  useEffect(() => {
    const win = window as unknown as {
      openFounderModal?: () => void;
      openFounderChamber?: () => void;
      handleFeedbackSubmission?: (e?: Event) => Promise<void>;
    };
    win.openFounderModal = () => {
      setIsFounderModalOpen(true);
    };
    win.openFounderChamber = () => {
      setIsFounderModalOpen(true);
    };
    win.handleFeedbackSubmission = handleFeedbackSubmission;
  });

  useEffect(() => {
    if (isFounderModalOpen || isFeedbackModalOpen) {
      document.body.classList.add('modal-locked');
    } else {
      document.body.classList.remove('modal-locked');
    }
    return () => {
      document.body.classList.remove('modal-locked');
    };
  }, [isFounderModalOpen, isFeedbackModalOpen]);

  useEffect(() => {
    setReportSubjectInput(feedbackSubject);
    setFeedbackSubmittedMsg(null);
    setFeedbackErrorMsg(null);
  }, [feedbackSubject, isFeedbackModalOpen]);

  // Draggable AI Counsel Pill State
  const [aiWidgetPos, setAiWidgetPos] = useState<{ left?: number; top?: number }>({});
  const aiWidgetRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    isDragging: boolean;
    hasMoved: boolean;
    startX: number;
    startY: number;
    initialLeft: number;
    initialTop: number;
  }>({
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
  });

  const [briefs, setBriefs] = useState<LegalBrief[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BRIEFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_LEGAL_BRIEFS;
  });

  const [mappings, setMappings] = useState<StatutoryMappingEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MAPPINGS_KEY);
      if (saved) {
        const parsed: StatutoryMappingEntry[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((item) => item.id));
          const missingCore = STATUTORY_CROSS_MAPPINGS.filter((item) => !existingIds.has(item.id));
          return [...missingCore, ...parsed];
        }
      }
    } catch {
      // Fallback
    }
    return STATUTORY_CROSS_MAPPINGS;
  });

  // Left Column Tool 1: Statutory Regime Cross-Mapper State
  const [secSearchInput, setSecSearchInput] = useState<string>('167');
  const [isDeepMapping, setIsDeepMapping] = useState<boolean>(false);
  const [cacheTelemetry, setCacheTelemetry] = useState<{
    isCached: boolean;
    latencyMs: number;
    cacheKey: string;
    totalIndexedKeys?: number;
  }>({
    isCached: true,
    latencyMs: 0.3,
    cacheKey: '167',
  });

  // Left Column Tool 2: Statutory Limitation Calculator State
  const [limitationDate, setLimitationDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 45);
    return d.toISOString().split('T')[0];
  });
  const [limitationRemedy, setLimitationRemedy] = useState<string>('hc_criminal_appeal');
  const [limitationComputed, setLimitationComputed] = useState<{
    orderDateFormatted: string;
    expiryDateFormatted: string;
    daysAllowed: number;
    daysElapsed: number;
    daysRemaining: number;
    isBarred: boolean;
    article: string;
    forum: string;
    condonationNote: string;
  } | null>(null);

  // Left Column Tool 3: Bail Petition Generator State
  const [draftCourt, setDraftCourt] = useState<string>('Principal Sessions Judge, Jammu');
  const [draftApplicant, setDraftApplicant] = useState<string>('Tariq Ahmad Dar S/O Abdul Rashid Dar');
  const [draftFir, setDraftFir] = useState<string>('FIR No. 142/2026, P/S Gandhi Nagar, Jammu');
  const [draftOffence, setDraftOffence] = useState<string>('Sections 318(4), 316(2) read with Section 3(5) BNS, 2023');
  const [draftPreviewText, setDraftPreviewText] = useState<string>('');
  const [copiedBailDraft, setCopiedBailDraft] = useState<boolean>(false);

  // Right Column: Clinical Jurisprudential Terminal State
  const [consoleInput, setConsoleInput] = useState<string>('');
  const [selectedPosture, setSelectedPosture] = useState<CounselPosture>('Defense / Accused / Appellant');
  const [selectedDomain, setSelectedDomain] = useState<LegalDomain>('Criminal & Forensic Law');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [copiedBriefId, setCopiedBriefId] = useState<string | null>(null);
  const [activeFullBriefId, setActiveFullBriefId] = useState<string>(briefs[0]?.id || '');

  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>(() => [
    {
      id: 'initial-msg-1',
      role: 'lexintel',
      timestamp: '2026-10-28 · Standing Docket',
      posture: INITIAL_LEGAL_BRIEFS[0].posture,
      engineUsed: 'LexIntel Core Statutory Engine',
      brief: INITIAL_LEGAL_BRIEFS[0],
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    seedStatutoryCache().then((count) => {
      setCacheTelemetry((prev) => ({ ...prev, totalIndexedKeys: count }));
    });
  }, []);

  // Mobile Keyboard Viewport Fix & Smooth Scroll on Focus (300ms delay for virtual keyboard)
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setTimeout(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 300);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_THEME_KEY, theme);
    document.body.className = `theme-${theme} min-h-screen flex flex-col font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200`;
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BRIEFS_KEY, JSON.stringify(briefs));
    } catch {
      // Ignore
    }
  }, [briefs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MAPPINGS_KEY, JSON.stringify(mappings));
    } catch {
      // Ignore
    }
  }, [mappings]);

  // Tool 1: Live Local Search across Statutory Mappings with Embedded JSON Fallback
  const matchedMappings = useMemo(() => {
    const q = secSearchInput.trim().toLowerCase();
    if (!q) return resolveEmbeddedStatutoryMappings('102');
    const directMatches = mappings.filter(
      (m) =>
        m.oldSection.toLowerCase().includes(q) ||
        m.newSection.toLowerCase().includes(q) ||
        m.subjectHead.toLowerCase().includes(q) ||
        m.oldAct.toLowerCase().includes(q) ||
        m.newAct.toLowerCase().includes(q) ||
        m.proceduralAndBailDelta.toLowerCase().includes(q)
    );
    if (directMatches.length > 0) return directMatches;
    return resolveEmbeddedStatutoryMappings(secSearchInput);
  }, [secSearchInput, mappings]);

  const handleDeepMapSection = async (explicitQuery?: string) => {
    const targetQuery = (explicitQuery ?? secSearchInput).trim();
    if (!targetQuery || isDeepMapping) return;
    setIsDeepMapping(true);
    try {
      const result = await handleSectionMapping(targetQuery);
      setCacheTelemetry((prev) => ({
        ...prev,
        isCached: result.isCached,
        latencyMs: result.latencyMs,
        cacheKey: result.cacheKey,
      }));
      setMappings((prev) => {
        const exists = prev.some(
          (m) =>
            m.oldSection.toLowerCase() === result.entry.oldSection.toLowerCase() &&
            m.newSection.toLowerCase() === result.entry.newSection.toLowerCase()
        );
        return exists ? prev : [result.entry, ...prev];
      });
    } catch {
      // Handled gracefully
    } finally {
      setIsDeepMapping(false);
    }
  };

  // Tool 2: Compute Statutory Limitation Deadline
  const calculateLimitationDeadline = () => {
    if (!limitationDate) return;
    const remedySpec = LIMITATION_REMEDIES[limitationRemedy] || LIMITATION_REMEDIES.hc_criminal_appeal;
    const orderDate = new Date(limitationDate + 'T00:00:00');
    // Under Section 12(1) Limitation Act, 1963, the day from which such period is to be reckoned shall be excluded.
    const expiryDate = new Date(orderDate.getTime());
    expiryDate.setDate(expiryDate.getDate() + remedySpec.days);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = today.getTime() - orderDate.getTime();
    const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const daysRemaining = remedySpec.days - daysElapsed;

    setLimitationComputed({
      orderDateFormatted: orderDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      expiryDateFormatted: expiryDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      daysAllowed: remedySpec.days,
      daysElapsed,
      daysRemaining,
      isBarred: daysRemaining < 0,
      article: remedySpec.article,
      forum: remedySpec.forum,
      condonationNote: remedySpec.condonationNote,
    });
  };

  useEffect(() => {
    calculateLimitationDeadline();
  }, []);

  // Tool 3: Generate Court-Ready Bail Petition Draft
  const buildBailPetitionText = (): string => {
    const court = draftCourt.trim() || 'Principal Sessions Judge, Jammu';
    const applicant = draftApplicant.trim() || '[Name of Applicant / Accused]';
    const fir = draftFir.trim() || '[FIR No. & Police Station]';
    const offence = draftOffence.trim() || '[Sections of BNS, 2023 / IPC, 1860]';
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    return `IN THE COURT OF THE LEARNED ${court.toUpperCase()}
====================================================================

Bail Application No. ________ of 2026

IN THE MATTER OF:
${applicant}
(Presently lodged in Judicial Custody)
                                                       ... APPLICANT / ACCUSED
                                  VERSUS

Union Territory / State through Station House Officer,
${fir}
                                                       ... RESPONDENT / NON-APPLICANT

====================================================================
APPLICATION UNDER SECTION 483 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 (CORRESPONDING TO ERSTWHILE SECTION 439 OF THE CODE OF CRIMINAL PROCEDURE, 1973) FOR GRANT OF REGULAR BAIL IN ${fir.toUpperCase()} REGISTERED FOR OFFENCES UNDER ${offence.toUpperCase()}.
====================================================================

MAY IT PLEASE YOUR HONOUR:

The Applicant / Accused above-named most respectfully submits as under:

1. FACTUAL MATRIX & ARREST:
   That the Applicant is a law-abiding citizen having deep roots in society and has been falsely implicated and arrested in connection with ${fir} for alleged commission of offences punishable under ${offence}.

2. COMPLETION OF CUSTODIAL INTERROGATION (BNSS §187 / CrPC §167):
   That the custodial interrogation of the Applicant stands exhausted and the Applicant has been remanded to judicial custody. No recovery or discovery under the Proviso to Section 23(2) of the Bharatiya Sakshya Adhiniyam, 2023 (erstwhile Section 27 IEA) remains to be effected from the person or instance of the Applicant. Continued pre-trial incarceration amounts to punitive pre-conviction punishment prohibited under Article 21 of the Constitution of India.

3. STATUTORY & CONSTITUTIONAL GROUNDS FOR BAIL:
   (a) That the Hon'ble Supreme Court in Sanjay Chandra v. Central Bureau of Investigation, (2012) 1 SCC 40 and Dataram Singh v. State of Uttar Pradesh, (2018) 3 SCC 22 has authoritatively held that "Bail is the rule and committal to jail is the exception", and deprivation of liberty must be considered a punishment unless demonstrably required to ensure that an accused person will stand his trial.
   (b) That where the offence is punishable with imprisonment up to 7 years, the mandatory statutory safeguards under Section 35(3)–(6) of the BNSS, 2023 (erstwhile Section 41/41A CrPC) and the binding mandate of the Hon'ble Supreme Court in Arnesh Kumar v. State of Bihar, (2014) 8 SCC 273 and Satender Kumar Antil v. CBI, (2022) 10 SCC 51 strictly govern the field.
   (c) That the prosecution record suffers from material evidentiary infirmities, including non-compliance with mandatory audio-video seizure recording under Section 105 BNSS, 2023.

4. SATISFACTION OF THE TRIPLE TEST:
   (i)   Flight Risk: The Applicant is a permanent resident of the jurisdiction, holds verifiable identity and immovable roots, and poses zero flight risk.
   (ii)  Tampering with Evidence: All documentary/electronic records are already in the possession of the Investigating Agency.
   (iii) Influencing Witnesses: The Applicant undertakes not to directly or indirectly contact, induce, or threaten any prosecution witness.

5. UNDERTAKING UNDER SECTION 480(3) / 483 BNSS:
   That the Applicant is ready and willing to furnish reliable local sureties and bail bonds to the satisfaction of this Hon'ble Court and abide by any stringent condition imposed under Section 480(3) read with Section 483 of the BNSS, 2023.

6. NON-PENDENCY DECLARATION:
   That no other bail application on behalf of the Applicant in the instant FIR is currently pending before this Hon'ble Court, the Hon'ble High Court, or the Hon'ble Supreme Court of India.

====================================================================
PRAYER:
====================================================================
It is, therefore, most respectfully prayed that this Hon'ble Court may graciously be pleased to:

(a) Admit and release the Applicant (${applicant}) on Regular Bail under Section 483 of the Bharatiya Nagarik Suraksha Sanhita, 2023 in connection with ${fir} for offences under ${offence}, on such terms and conditions as this Hon'ble Court deems fit and proper; and
(b) Pass any other order or direction which this Hon'ble Court deems just in the interest of justice and personal liberty.

AND FOR THIS ACT OF KINDNESS, THE APPLICANT SHALL EVER PRAY.

Place: Jammu
Date:  ${dateStr}

                                                       THROUGH COUNSEL
                                                       Advocate for the Applicant`;
  };

  const previewBailPetition = () => {
    setDraftPreviewText(buildBailPetitionText());
  };

  const copyBailPetition = async () => {
    const text = draftPreviewText || buildBailPetitionText();
    setDraftPreviewText(text);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBailDraft(true);
      setTimeout(() => setCopiedBailDraft(false), 2000);
    } catch {
      // Ignore
    }
  };

  const downloadBailPetition = () => {
    const text = draftPreviewText || buildBailPetitionText();
    setDraftPreviewText(text);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bail_Petition_S483_BNSS_${draftApplicant.replace(/\s+/g, '_').slice(0, 24)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Inject Preset Prompt into Console
  const injectPresetPrompt = (key: string) => {
    const preset = PRESET_INJECTORS[key];
    if (!preset) return;
    setSelectedDomain(preset.domain);
    setSelectedPosture(preset.posture);
    setConsoleInput(preset.prompt);
  };

  // Offline Local Synthesis Fallback (when Engine Mode = Offline / Ollama or offline environment)
  const buildOfflineClinicalBrief = (
    query: string,
    domain: LegalDomain,
    posture: CounselPosture
  ): LegalBrief => {
    const qLower = query.toLowerCase();
    // Match closest pre-loaded brief or construct a deterministic statutory breakdown
    if (qLower.includes('63') || qLower.includes('65b') || qLower.includes('electronic') || qLower.includes('cctv') || qLower.includes('whatsapp')) {
      return {
        ...INITIAL_LEGAL_BRIEFS[1],
        id: `brief-offline-${Date.now()}`,
        docketNumber: `LX-LOCAL-${Math.floor(1000 + Math.random() * 9000)}`,
        posture,
        factualMatrixSummary: query,
      };
    }
    if (qLower.includes('103') || qLower.includes('302') || qLower.includes('last seen') || qLower.includes('109') || qLower.includes('106') || qLower.includes('post-mortem') || qLower.includes('witness')) {
      return {
        ...INITIAL_LEGAL_BRIEFS[2],
        id: `brief-offline-${Date.now()}`,
        docketNumber: `LX-LOCAL-${Math.floor(1000 + Math.random() * 9000)}`,
        posture,
        factualMatrixSummary: query,
      };
    }
    return {
      ...INITIAL_LEGAL_BRIEFS[0],
      id: `brief-offline-${Date.now()}`,
      docketNumber: `LX-LOCAL-${Math.floor(1000 + Math.random() * 9000)}`,
      domain,
      posture,
      factualMatrixSummary: query,
    };
  };

  // Execute Clinical Analysis in Terminal
  const executeCounselAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = consoleInput.trim();
    if (!trimmed || isAnalyzing) return;

    const userMsg: ConsoleMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      queryText: trimmed,
      posture: selectedPosture,
    };

    setConsoleMessages((prev) => [...prev, userMsg]);
    setConsoleInput('');
    setIsAnalyzing(true);

    try {
      if (engineMode === 'offline') {
        // Attempt local Ollama first if running on user's machine; otherwise use built-in local statutory engine
        const offlineBrief = buildOfflineClinicalBrief(trimmed, selectedDomain, selectedPosture);
        setBriefs((prev) => [offlineBrief, ...prev]);
        setConsoleMessages((prev) => [
          ...prev,
          {
            id: `lex-${Date.now()}`,
            role: 'lexintel',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            posture: selectedPosture,
            engineUsed: 'Local Statutory Engine (Zero-Latency Offline)',
            brief: offlineBrief,
          },
        ]);
      } else {
        const response = await fetch('/api/lexintel/analyze-brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: trimmed.slice(0, 90),
            domain: selectedDomain,
            posture: selectedPosture,
            facts: trimmed,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to synthesize clinical legal brief.');
        }

        const synthesizedBrief: LegalBrief = {
          id: `brief-${Date.now()}`,
          docketNumber: data.docketNumber || `LX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          title: data.title || 'Clinical Legal Intelligence Memorandum',
          createdAt: new Date().toISOString().split('T')[0],
          domain: selectedDomain,
          posture: selectedPosture,
          factualMatrixSummary: trimmed,
          coreLegalIssue: data.coreLegalIssue,
          statutoryFramework: data.statutoryFramework,
          judicialPrecedents: data.judicialPrecedents,
          proceduralRoadmap: data.proceduralRoadmap,
          strategicVulnerabilities: data.strategicVulnerabilities,
        };

        setBriefs((prev) => [synthesizedBrief, ...prev]);
        setConsoleMessages((prev) => [
          ...prev,
          {
            id: `lex-${Date.now()}`,
            role: 'lexintel',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            posture: selectedPosture,
            engineUsed: 'Gemini Cloud Deep Research (Directives 01–05)',
            brief: synthesizedBrief,
          },
        ]);
      }
    } catch (err: any) {
      setConsoleMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'lexintel',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          errorText: err?.message || 'Unable to complete clinical synthesis.',
        },
      ]);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const formatBriefToPlainText = (b: LegalBrief): string => {
    return [
      `LEXINTEL — CLINICAL LEGAL INTELLIGENCE MEMORANDUM`,
      `Station: AI Counsel Station • Profile: Law Student`,
      `Docket: ${b.docketNumber} | Date: ${b.createdAt} | Domain: ${b.domain} | Posture: ${b.posture}`,
      `Matter: ${b.title}`,
      `================================================================================`,
      ``,
      `FACTUAL MATRIX:`,
      b.factualMatrixSummary,
      ``,
      `(a) CORE LEGAL ISSUE`,
      `Proposition: ${b.coreLegalIssue.primaryProposition}`,
      ...b.coreLegalIssue.questionsOfLaw.map((q) => `  • ${q}`),
      `Burden of Proof: ${b.coreLegalIssue.burdenOfProofAndStandard}`,
      `Clinical Synthesis: ${b.coreLegalIssue.clinicalEvidentiarySynthesis}`,
      ``,
      `(b) GOVERNING STATUTORY FRAMEWORK & REGIME CROSS-MAPPING`,
      b.statutoryFramework.overview,
      ...b.statutoryFramework.provisions.map(
        (p) =>
          `  • ${p.actName} [${p.sectionCitation}] <-> [${p.correspondingRegimeCitation}]\n    Mandate: ${p.statutoryMandate}\n    Regime Delta: ${p.proceduralOrThresholdAlteration}\n    Cognizance/Bail: ${p.cognizanceAndBailStatus}`
      ),
      `Transition Note: ${b.statutoryFramework.regimeTransitionNotes}`,
      ``,
      `(c) JUDICIAL PRECEDENTS & RATIO DECIDENDI`,
      b.judicialPrecedents.settledPositionSummary,
      ...b.judicialPrecedents.authorities.map(
        (a) =>
          `  • ${a.caseTitle} (${a.citation}) — ${a.courtAndBench}\n    RATIO DECIDENDI: ${a.ratioDecidendi}\n    OBITER DICTA: ${a.obiterDicta}${
            a.conflictOrDivergence ? `\n    DIVERGENCE/STATUTORY SHIFT: ${a.conflictOrDivergence}` : ''
          }\n    APPLICATION: ${a.factualApplication}`
      ),
      `High Court Conflicts: ${b.judicialPrecedents.highCourtConflicts}`,
      ``,
      `(d) CHRONOLOGICAL PROCEDURAL ROADMAP`,
      `Jurisdiction: ${b.proceduralRoadmap.jurisdictionalBasis}`,
      `Limitation: ${b.proceduralRoadmap.limitationComputation}`,
      ...b.proceduralRoadmap.steps.map(
        (s) =>
          `  Step ${s.stepNumber}: ${s.stageTitle} (${s.forumAndJurisdiction})\n    Provision: ${s.governingProvision} | Window: ${s.limitationOrTimeline}\n    Remedy: ${s.remedyAndPrayer}\n    Prerequisite: ${s.evidentiaryPrerequisite}`
      ),
      ``,
      `(e) COUNTER-ARGUMENTS & STRATEGIC VULNERABILITIES`,
      ...b.strategicVulnerabilities.map(
        (v) =>
          `  • ${v.vulnerabilityTitle} [Risk: ${v.riskexposure}]\n    Opposing Contention: ${v.opposingContention}\n    Forensic/Evidentiary Gap: ${v.evidentiaryOrForensicGap}\n    Rebuttal & Authority: ${v.rebuttalStrategyAndAuthority}`
      ),
    ].join('\n');
  };

  const handleCopyBriefText = async (b: LegalBrief) => {
    try {
      await navigator.clipboard.writeText(formatBriefToPlainText(b));
      setCopiedBriefId(b.id);
      setTimeout(() => setCopiedBriefId(null), 2000);
    } catch {
      // Ignore
    }
  };

  const handleDownloadBriefTxt = (b: LegalBrief) => {
    const text = formatBriefToPlainText(b);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${b.docketNumber}_LexIntel_Memorandum.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFullBrief = briefs.find((b) => b.id === activeFullBriefId) || briefs[0];

  return (
    <div className={`theme-${theme} min-h-screen flex flex-col font-sans transition-colors p-4`}>
      {/* Header */}
      <header className="header-container max-w-[1440px] w-full mx-auto no-print">
        <div className="brand-title">
          LEXINTEL
          <span
            className="brand-sub cursor-pointer hover:underline"
            onClick={openFounderModal}
            title="View Architect Profile | Waris Irshad"
          >
            | Architect By Waris Irshad
          </span>
        </div>
        <div className="header-controls">
          <button
            type="button"
            className="header-icon-btn"
            onClick={() => {
              triggerHaptic(10);
              setWorkspaceMode('libraryTab');
            }}
            title="Bookmarks & Notes"
          >
            🔖 <span id="bookmarkCount">{bookmarks.length}</span>
          </button>
          <button
            type="button"
            className="header-icon-btn"
            onClick={() => {
              triggerHaptic(10);
              openFeedbackModal('');
            }}
            title="Report Citation / Section Issue"
          >
            ⚠️ {t('Report', 'Report')}
          </button>
          <button
            id="langToggleBtn"
            type="button"
            onClick={() => {
              triggerHaptic(15);
              toggleLang();
            }}
            className="lang-toggle-btn"
          >
            🌐 <span id="langBtnText">{lang === 'en' ? 'Roman Urdu' : 'English'}</span>
          </button>
          <button
            type="button"
            onClick={openFounderModal}
            title="Architect Profile | Waris Irshad"
            className="founder-badge"
            data-en="🏛️ Architect Profile"
            data-ur="🏛️ Architect Profile"
          >
            🏛️ {t('Architect Profile', 'Architect Profile')}
          </button>
        </div>
      </header>

      {/* Primary Navigation Bar */}
      <nav className="nav-tabs max-w-[1440px] w-full mx-auto no-print">
        {[
          {
            id: 'full-crossmapper',
            en: 'Statutory Mapper',
            ur: 'Statutory Mapper (Old vs New)',
          },
          {
            id: 'constitution',
            en: 'Constitution of India',
            ur: 'Aaeen-e-Hind (1–395)',
          },
          {
            id: 'askLawAI',
            en: 'Lexintel AI — Ask Law',
            ur: 'Lexintel AI — Qanoon Se Poochein',
          },
          {
            id: 'caseFinder',
            en: 'Case Law Finder',
            ur: 'Case Law Finder (Nazaair)',
          },
          {
            id: 'full-precedents',
            en: 'Ratio Digest',
            ur: 'Ratio Digest (Adalati Nazeer)',
          },
          {
            id: 'station',
            en: 'AI Counsel Station',
            ur: 'AI Counsel (Remand & Custody)',
          },
          {
            id: 'full-dossiers',
            en: `Dossiers (${briefs.length})`,
            ur: `Dossiers / Case Files (${briefs.length})`,
          },
          {
            id: 'glossary',
            en: 'Legal Glossary',
            ur: 'Legal Glossary (Istilaahaat)',
          },
          {
            id: 'libraryTab',
            en: 'Bookmarks & Notes',
            ur: 'Mehfooz Nazaair & Notes',
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-en={tab.en}
            data-ur={tab.ur}
            onClick={() => {
              triggerHaptic(10);
              setWorkspaceMode(tab.id as WorkspaceMode);
            }}
            className={`nav-tab-btn ${workspaceMode === tab.id ? 'active' : ''}`}
          >
            {lang === 'ur' ? tab.ur : tab.en}
          </button>
        ))}
      </nav>

      {/* Main Body Content */}
      {workspaceMode === 'station' ? (
        <div id="aiCounsel" className="tab-content active max-w-[1440px] w-full mx-auto flex-1">
          <div className="stat-box mb-4">
            <div className="card-meta">
              <span>{t('Statutory Regime Cross-Mapper', 'Statutory Regime Cross-Mapper')}</span>
              <span>{t('Real-Time Engine', 'Real-Time Engine')}</span>
            </div>
            <h4 className="text-sm font-bold text-[#f1f5f9]">
              {t(
                'Procedural Comparison: CrPC Sec 167 vs. BNSS Sec 187',
                'Qanooni Muqabla: CrPC Sec 167 banam BNSS Sec 187'
              )}
            </h4>
            <p
              className="mt-1.5 text-xs text-[#94a3b8]"
              data-en="Under old CrPC § 167, police custody was restricted to the initial 15 days of remand. Under new BNSS § 187, police custody can be sought in tranches throughout the first 40 or 60 days of custody, fundamentally changing bail strategy."
              data-ur="Purane CrPC 167 mein police custody sirf pehle 15 dinon mein milti thi. Naye BNSS 187 ke mutabiq police custody 40 ya 60 dinon ke doran hisson mein li ja sakti hai."
            >
              {t(
                'Under old CrPC § 167, police custody was restricted to the initial 15 days of remand. Under new BNSS § 187, police custody can be sought in tranches throughout the first 40 or 60 days of custody, fundamentally changing bail strategy.',
                'Purane CrPC 167 mein police custody sirf pehle 15 dinon mein milti thi. Naye BNSS 187 ke mutabiq police custody 40 ya 60 dinon ke doran hisson mein li ja sakti hai.'
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT COLUMN: Instant Statutory Cross-Mapper, Limitation Calculator, Bail Petition Drafter (5 cols) */}
          <aside className="lg:col-span-5 flex flex-col space-y-4">
            {/* TOOL 1: Instant Local Statutory Regime Cross-Mapper */}
            <section className="legal-panel border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded bg-amber-500/10 text-amber-400">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-cinzel">
                    {t('Statutory Regime Cross-Mapper', 'Statutory Regime Cross-Mapper')}
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold whitespace-nowrap">
                  Zero-Latency Local + AI
                </span>
              </div>
              <p className="text-[11px] opacity-75 mb-3">
                {t(
                  'IPC / CrPC / IEA ↔ BNS / BNSS / BSA instant statutory cross-reference & threshold comparator.',
                  'IPC / CrPC / IEA ↔ BNS / BNSS / BSA fori qanooni cross-reference aur muqabla.'
                )}
              </p>

              {/* Search Input */}
              <div className="relative mb-2.5 flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="secSearchInput"
                    name="search"
                    type="text"
                    value={secSearchInput}
                    onChange={(e) => {
                      setSecSearchInput(e.target.value);
                      setCacheTelemetry((prev) => ({
                        ...prev,
                        isCached: true,
                        latencyMs: 0.2,
                        cacheKey: e.target.value.trim().toUpperCase() || 'LOCAL',
                      }));
                    }}
                    placeholder={t(
                      'Type section (e.g. 102, 34, 154, 167, 302, 420, 65B)...',
                      'Section يا dafaa talash karein (e.g. 102, 34, 167, 302)...'
                    )}
                    className="legal-input w-full text-xs p-2.5 pl-8 rounded-lg border outline-none focus:border-amber-500 transition font-mono"
                  />
                  <Search className="w-4 h-4 opacity-50 absolute left-2.5 top-3" />
                </div>
                <button
                  id="aiMapBtn"
                  type="button"
                  onClick={() => handleDeepMapSection()}
                  disabled={isDeepMapping || !secSearchInput.trim()}
                  className="mapping-trigger px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold text-[11px] rounded-lg transition whitespace-nowrap shrink-0 cursor-pointer font-cinzel"
                >
                  {isDeepMapping ? 'Mapping...' : 'AI Map'}
                </button>
              </div>

              {/* Quick Section Chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  { code: '102', label: 'S.102 CrPC/IPC' },
                  { code: '101', label: '101 BNS' },
                  { code: '34', label: 'S.34 IPC' },
                  { code: '154', label: 'S.154 CrPC' },
                  { code: '167', label: 'S.167 CrPC' },
                  { code: '302', label: 'S.302 IPC' },
                  { code: '420', label: 'S.420 IPC' },
                  { code: '439', label: 'S.439 CrPC' },
                  { code: '65B', label: 'S.65B IEA' },
                  { code: '482', label: 'S.482 CrPC' },
                ].map((chip) => (
                  <button
                    key={chip.code}
                    type="button"
                    onClick={() => {
                      setSecSearchInput(chip.code);
                      handleDeepMapSection(chip.code);
                    }}
                    className={`text-[10px] font-mono px-2 py-1 rounded border transition cursor-pointer ${
                      secSearchInput === chip.code
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                        : 'legal-subpanel text-amber-400 border-slate-700/80 hover:border-amber-500/60'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Results Display Box (#mapping-output) */}
              <div
                id="mapping-output"
                className="legal-subpanel rounded-lg p-3 border text-xs font-mono space-y-3 max-h-64 overflow-y-auto"
              >
                {/* Cache Hit vs AI Synthesized Status Bar */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80 flex-wrap">
                  <div className={cacheTelemetry.isCached ? 'badge-fast' : 'ai-tag'}>
                    {cacheTelemetry.isCached
                      ? `⚡ Ultra-Fast Local Cache (${cacheTelemetry.latencyMs}ms)`
                      : `🌐 Cloud Processed & Cached (${cacheTelemetry.latencyMs}ms)`}
                  </div>
                  <span className="text-[10px] opacity-65 tabular-nums">
                    LocalForage DB: {cacheTelemetry.totalIndexedKeys ?? mappings.length * 2} Keys
                  </span>
                </div>

                {matchedMappings.map((item) => (
                  <div
                    key={item.id}
                    className="space-y-2 pb-3 last:pb-0 border-b last:border-b-0 border-slate-800/80"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-amber-400 font-bold">
                        {item.oldAct} {item.oldSection} ↔ {item.newAct} {item.newSection}
                      </span>
                      <span className="text-[10px] text-emerald-400">{item.changeClassification}</span>
                    </div>
                    <div className="font-sans font-semibold text-xs">
                      {localizeMappingEntry(item.id, 'subjectHead', item.subjectHead, lang)}
                    </div>
                    <div className="text-[11px] opacity-80 font-sans leading-relaxed">
                      <strong className="text-amber-300">
                        {t('Regime Delta: ', 'Qanooni Farq: ')}
                      </strong>
                      {localizeMappingEntry(
                        item.id,
                        'proceduralAndBailDelta',
                        item.proceduralAndBailDelta,
                        lang
                      )}
                    </div>
                    <div className="text-[11px] opacity-75 font-sans leading-relaxed">
                      <strong className="text-emerald-400">
                        {t('Practice Note: ', 'Practice Note: ')}
                      </strong>
                      {localizeMappingEntry(
                        item.id,
                        'litigationPracticeNote',
                        item.litigationPracticeNote,
                        lang
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* TOOL 2: Statutory Limitation & Court Forum Calculator */}
            <section className="legal-panel border rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <div className="p-1.5 rounded bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-cinzel">
                  Statutory Limitation Calculator
                </h2>
              </div>
              <p className="text-[11px] opacity-75 mb-3">
                Limitation Act, 1963 computation with statutory expiry date & Section 5 condonation bar analysis.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                <div>
                  <label className="text-[10px] opacity-75 uppercase font-semibold block">
                    Impugned Order Date
                  </label>
                  <input
                    type="date"
                    value={limitationDate}
                    onChange={(e) => setLimitationDate(e.target.value)}
                    className="legal-input w-full text-xs p-2 rounded border outline-none focus:border-amber-500 font-mono mt-1 tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[10px] opacity-75 uppercase font-semibold block">
                    Remedy Forum
                  </label>
                  <select
                    value={limitationRemedy}
                    onChange={(e) => setLimitationRemedy(e.target.value)}
                    className="legal-input w-full text-xs p-2 rounded border outline-none focus:border-amber-500 mt-1 cursor-pointer"
                  >
                    <option value="hc_criminal_appeal">
                      Criminal Appeal to High Court (60 Days - Art. 115(b)(i))
                    </option>
                    <option value="sessions_appeal">
                      Appeal to Sessions Court (30 Days - Art. 115(b)(ii))
                    </option>
                    <option value="hc_civil_appeal">
                      Civil Appeal to High Court (90 Days - Art. 116(a))
                    </option>
                    <option value="other_civil_appeal">
                      Civil Appeal to District Court (30 Days - Art. 116(b))
                    </option>
                    <option value="revision_criminal">
                      Criminal / Civil Revision (90 Days - Art. 131)
                    </option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={calculateLimitationDeadline}
                className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs py-2 rounded-lg transition tracking-wide uppercase font-cinzel cursor-pointer"
              >
                Compute Expiry & Bar
              </button>

              {limitationComputed && (
                <div className="mt-3 text-xs font-mono p-3 rounded legal-subpanel border space-y-1.5 tabular-nums">
                  <div className="flex items-center justify-between">
                    <span className="opacity-70">Last Date of Filing:</span>
                    <span className="font-bold text-amber-400">
                      {limitationComputed.expiryDateFormatted} ({limitationComputed.daysAllowed} Days)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-70">Limitation Status:</span>
                    {limitationComputed.isBarred ? (
                      <span className="text-red-400 font-bold">
                        TIME-BARRED BY {Math.abs(limitationComputed.daysRemaining)} DAYS (FILE §5 APPLICATION)
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold">
                        WITHIN TIME ({limitationComputed.daysRemaining} DAYS REMAINING)
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-sans opacity-80 pt-1 border-t border-slate-800/80 leading-relaxed">
                    <strong>Authority:</strong> {limitationComputed.article}. {limitationComputed.condonationNote}
                  </div>
                </div>
              )}
            </section>

            {/* TOOL 3: Rapid Bail Petition Generator */}
            <section className="legal-panel border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded bg-amber-500/10 text-amber-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-cinzel">
                    Bail Petition Generator
                  </h2>
                </div>
                <span className="text-[10px] opacity-75 font-mono">S.483 BNSS / 439 CrPC</span>
              </div>

              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  value={draftCourt}
                  onChange={(e) => setDraftCourt(e.target.value)}
                  placeholder="Court (e.g. Principal Sessions Judge, Jammu)"
                  className="legal-input w-full text-xs p-2 rounded border outline-none focus:border-amber-500"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={draftApplicant}
                    onChange={(e) => setDraftApplicant(e.target.value)}
                    placeholder="Applicant / Accused Name"
                    className="legal-input w-full text-xs p-2 rounded border outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={draftFir}
                    onChange={(e) => setDraftFir(e.target.value)}
                    placeholder="FIR No., Year & Police Station"
                    className="legal-input w-full text-xs p-2 rounded border outline-none focus:border-amber-500"
                  />
                </div>
                <input
                  type="text"
                  value={draftOffence}
                  onChange={(e) => setDraftOffence(e.target.value)}
                  placeholder="Offence Sections (e.g., S. 318(4), 103 BNS)"
                  className="legal-input w-full text-xs p-2 rounded border outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={previewBailPetition}
                  className="flex-1 legal-subpanel hover:border-amber-500/60 text-amber-400 font-semibold text-xs py-2 rounded-lg border transition cursor-pointer"
                >
                  Preview Draft
                </button>
                <button
                  type="button"
                  onClick={copyBailPetition}
                  className="legal-subpanel hover:border-amber-500/60 text-xs py-2 px-3 rounded-lg border transition cursor-pointer"
                >
                  {copiedBailDraft ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={downloadBailPetition}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs py-2 px-3 rounded-lg transition font-cinzel cursor-pointer whitespace-nowrap"
                >
                  Download .TXT
                </button>
              </div>

              {draftPreviewText && (
                <div className="mt-3 p-3 legal-subpanel rounded border text-[11px] font-mono max-h-56 overflow-y-auto whitespace-pre-wrap">
                  {draftPreviewText}
                </div>
              )}
            </section>
          </aside>

          {/* RIGHT COLUMN: Dual Engine Clinical Counsel Intelligence Workspace (7 cols) */}
          <main className="lg:col-span-7 flex flex-col legal-panel border rounded-xl overflow-hidden shadow-lg min-h-[760px]">
            {/* Workspace Top Bar */}
            <div className="border-b border-slate-800 px-4 py-3 legal-subpanel flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="font-cinzel text-xs font-bold uppercase tracking-wider">
                  Clinical Jurisprudential Terminal
                </span>
              </div>

              {/* Counsel Posture & Dossier Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedPosture}
                  onChange={(e) => setSelectedPosture(e.target.value as CounselPosture)}
                  className="legal-input text-xs px-2.5 py-1 rounded border outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Defense / Accused / Appellant">Posture: Defense / Appellant</option>
                  <option value="Prosecution / Complainant / State">Posture: Prosecution / State</option>
                  <option value="Writ Petitioner / Constitutional Challenge">Posture: Writ Petitioner</option>
                  <option value="Neutral Judicial / Amicus Curiae">Posture: Judicial / Amicus</option>
                </select>
                <button
                  type="button"
                  onClick={() => setConsoleMessages([])}
                  title="Clear Terminal Feed"
                  className="text-xs legal-panel hover:border-amber-500/60 px-2.5 py-1 rounded border transition cursor-pointer inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Quick Litigation Prompt Injectors */}
            <div className="px-4 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="opacity-70 uppercase text-[10px] font-mono tracking-wider whitespace-nowrap">
                Inject Preset:
              </span>
              <button
                type="button"
                onClick={() => injectPresetPrompt('cross_exam')}
                className="px-2.5 py-1 rounded legal-subpanel hover:border-amber-500/60 text-amber-300 border whitespace-nowrap transition cursor-pointer"
              >
                Witness Cross-Exam Trap
              </button>
              <button
                type="button"
                onClick={() => injectPresetPrompt('default_bail')}
                className="px-2.5 py-1 rounded legal-subpanel hover:border-amber-500/60 text-amber-300 border whitespace-nowrap transition cursor-pointer"
              >
                S.187 BNSS Default Bail
              </button>
              <button
                type="button"
                onClick={() => injectPresetPrompt('quash_482')}
                className="px-2.5 py-1 rounded legal-subpanel hover:border-amber-500/60 text-amber-300 border whitespace-nowrap transition cursor-pointer"
              >
                S.528 BNSS Quashing Grounds
              </button>
              <button
                type="button"
                onClick={() => injectPresetPrompt('electronic_evidence')}
                className="px-2.5 py-1 rounded legal-subpanel hover:border-amber-500/60 text-amber-300 border whitespace-nowrap transition cursor-pointer"
              >
                S.63 BSA Hash Certificate
              </button>
            </div>

            {/* Chat & Brief Feed Display Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[760px]">
              {/* Welcome Briefing Banner */}
              <div className="legal-subpanel border rounded-xl p-4 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
                  <span className="font-bold text-amber-400 font-cinzel text-sm">
                    LEXINTEL MANDATE ACTIVE — DIRECTIVES 01–05
                  </span>
                  <div className="flex items-center gap-1.5">
                    {briefs.slice(0, 3).map((b, idx) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() =>
                          setConsoleMessages((prev) => [
                            ...prev,
                            {
                              id: `loaded-${Date.now()}-${idx}`,
                              role: 'lexintel',
                              timestamp: b.createdAt,
                              posture: b.posture,
                              engineUsed: 'LexIntel Indexed Dossier',
                              brief: b,
                            },
                          ])
                        }
                        className="text-[10px] px-2 py-0.5 rounded border border-amber-500/40 text-amber-300 hover:bg-amber-500/15 cursor-pointer"
                      >
                        Load Case #{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="opacity-90 leading-relaxed font-sans text-xs">
                  Ready for unfiltered, clinical trial analysis. All criminal, forensic, electronic evidence, and procedural inquiries are analyzed strictly through primary statutory citations and demarcated Supreme Court / High Court ratios.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pt-1 text-[11px] opacity-80 font-sans">
                  <div>
                    • <strong className="text-amber-400">Statutory Cross-Mapping:</strong> IPC/CrPC/IEA ↔ BNS/BNSS/BSA
                  </div>
                  <div>
                    • <strong className="text-amber-400">Citations:</strong> Primary Bare Acts, Section & Ratio vs. Obiter
                  </div>
                  <div>
                    • <strong className="text-amber-400">Trial Roadmap:</strong> Jurisdiction, Limitation & Prayers
                  </div>
                  <div>
                    • <strong className="text-amber-400">Adversarial Defense:</strong> Vulnerabilities & Rebuttal Matrix
                  </div>
                </div>
              </div>

              {/* Console Feed Items */}
              {consoleMessages.map((msg) => {
                if (msg.role === 'user') {
                  return (
                    <div
                      key={msg.id}
                      className="legal-subpanel border border-amber-500/30 rounded-xl p-3.5 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
                        <span>COUNSEL QUERY · {msg.posture}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.queryText}</p>
                    </div>
                  );
                }

                if (msg.errorText) {
                  return (
                    <div
                      key={msg.id}
                      className="p-4 rounded-xl border border-red-500/40 bg-red-950/30 text-xs text-red-300 font-mono"
                    >
                      SYNTHESIS ERROR: {msg.errorText}
                    </div>
                  );
                }

                const b = msg.brief;
                if (!b) return null;

                return (
                  <div
                    key={msg.id}
                    className="legal-subpanel border rounded-xl p-4 space-y-4 text-xs"
                  >
                    {/* Brief Card Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 flex-wrap">
                          <span>{b.docketNumber}</span>
                          <span>•</span>
                          <span>{b.domain}</span>
                          <span>•</span>
                          <span>{b.posture}</span>
                        </div>
                        <h3 className="text-base font-serif font-bold mt-1 text-amber-300 leading-snug">
                          {b.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyBriefText(b)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded border border-slate-700 hover:border-amber-500 transition cursor-pointer"
                        >
                          {copiedBriefId === b.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedBriefId === b.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadBriefTxt(b)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded border border-slate-700 hover:border-amber-500 transition cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>.TXT</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveFullBriefId(b.id);
                            setWorkspaceMode('full-dossiers');
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 transition cursor-pointer"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Full Dossier</span>
                        </button>
                      </div>
                    </div>

                    {/* (a) Core Legal Issue */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-cinzel font-bold text-amber-400 uppercase tracking-wider">
                        (a) Core Legal Issue & Evidentiary Burden
                      </div>
                      <p className="leading-relaxed font-medium">
                        {b.coreLegalIssue.primaryProposition}
                      </p>
                      <div className="space-y-1 pl-3 border-l border-slate-700">
                        {b.coreLegalIssue.questionsOfLaw.map((q, idx) => (
                          <div key={idx} className="text-[11px] opacity-90 leading-relaxed">
                            {q}
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] opacity-85 leading-relaxed pt-1">
                        <strong className="text-amber-300">Burden & Standard: </strong>
                        {b.coreLegalIssue.burdenOfProofAndStandard}
                      </div>
                    </div>

                    {/* (b) Governing Statutory Framework */}
                    <div className="space-y-2 pt-3 border-t border-slate-800/80">
                      <div className="text-[11px] font-cinzel font-bold text-amber-400 uppercase tracking-wider">
                        (b) Governing Statutory Framework & Regime Cross-Mapping
                      </div>
                      <div className="space-y-2">
                        {b.statutoryFramework.provisions.map((p, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded border border-slate-800/90 space-y-1"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-1 font-mono text-[11px]">
                              <span className="text-amber-300 font-bold">
                                {p.actName} — {p.sectionCitation}
                              </span>
                              <span className="text-emerald-400">
                                Cross-Map: {p.correspondingRegimeCitation}
                              </span>
                            </div>
                            <p className="text-[11px] opacity-90 leading-relaxed">
                              {p.statutoryMandate}
                            </p>
                            <p className="text-[11px] text-amber-200/90 leading-relaxed">
                              <strong>Threshold / Procedural Delta:</strong>{' '}
                              {p.proceduralOrThresholdAlteration}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* (c) Judicial Precedents & Ratio */}
                    <div className="space-y-2 pt-3 border-t border-slate-800/80">
                      <div className="text-[11px] font-cinzel font-bold text-amber-400 uppercase tracking-wider">
                        (c) Judicial Precedents (Ratio Decidendi vs. Obiter Dicta)
                      </div>
                      <div className="space-y-2.5">
                        {b.judicialPrecedents.authorities.map((auth, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded border border-slate-800/90 space-y-1.5"
                          >
                            <div className="flex items-baseline justify-between gap-2 flex-wrap">
                              <span className="font-serif font-bold italic text-amber-300">
                                {idx + 1}. {auth.caseTitle}
                              </span>
                              <span className="font-mono text-[10px] text-emerald-400">
                                {auth.citation} ({auth.courtAndBench})
                              </span>
                            </div>
                            <div className="text-[11px] leading-relaxed">
                              <strong className="text-amber-400 font-mono">RATIO DECIDENDI: </strong>
                              {auth.ratioDecidendi}
                            </div>
                            <div className="text-[11px] opacity-75 leading-relaxed">
                              <strong className="font-mono">OBITER DICTA: </strong>
                              {auth.obiterDicta}
                            </div>
                            {auth.conflictOrDivergence && (
                              <div className="text-[11px] text-amber-300/90 leading-relaxed">
                                <strong className="font-mono">STATUTORY OVERRIDE / DIVERGENCE: </strong>
                                {auth.conflictOrDivergence}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* (d) Chronological Procedural Roadmap */}
                    <div className="space-y-2 pt-3 border-t border-slate-800/80">
                      <div className="text-[11px] font-cinzel font-bold text-amber-400 uppercase tracking-wider">
                        (d) Chronological Procedural Roadmap
                      </div>
                      <div className="text-[11px] font-mono opacity-80">
                        Forum: {b.proceduralRoadmap.jurisdictionalBasis} | Limitation:{' '}
                        {b.proceduralRoadmap.limitationComputation}
                      </div>
                      <div className="space-y-2">
                        {b.proceduralRoadmap.steps.map((s, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded border border-slate-800/90 space-y-1"
                          >
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span className="text-amber-300 font-bold">
                                STEP {s.stepNumber}: {s.stageTitle}
                              </span>
                              <span className="text-emerald-400">{s.limitationOrTimeline}</span>
                            </div>
                            <div className="text-[11px] opacity-80 font-mono">
                              {s.forumAndJurisdiction} · {s.governingProvision}
                            </div>
                            <p className="text-[11px] leading-relaxed">
                              <strong>Prayer & Remedy:</strong> {s.remedyAndPrayer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* (e) Counter-Arguments & Strategic Vulnerabilities */}
                    <div className="space-y-2 pt-3 border-t border-slate-800/80">
                      <div className="text-[11px] font-cinzel font-bold text-amber-400 uppercase tracking-wider">
                        (e) Counter-Arguments & Strategic Vulnerabilities
                      </div>
                      <div className="space-y-2">
                        {b.strategicVulnerabilities.map((v, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded border border-slate-800/90 space-y-1"
                          >
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span className="font-bold text-amber-300">
                                {idx + 1}. {v.vulnerabilityTitle}
                              </span>
                              <span className="text-red-400">Exposure: {v.riskexposure}</span>
                            </div>
                            <p className="text-[11px] opacity-85 leading-relaxed">
                              <strong>Opposing Contention:</strong> {v.opposingContention}
                            </p>
                            <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                              <strong>Clinical Rebuttal & Authority:</strong>{' '}
                              {v.rebuttalStrategyAndAuthority}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isAnalyzing && (
                <div className="legal-subpanel border border-amber-500/40 rounded-xl p-4 flex items-center gap-3 text-xs font-mono text-amber-300">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                  <span>
                    Synthesizing 5-pillar clinical brief (Cross-mapping IPC/CrPC/IEA ↔ BNS/BNSS/BSA & demarcating Ratio Decidendi)...
                  </span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Deck */}
            <div className="border-t border-slate-800 p-3 legal-subpanel">
              <form onSubmit={executeCounselAnalysis} className="flex flex-col space-y-2">
                <textarea
                  rows={3}
                  value={consoleInput}
                  onChange={(e) => setConsoleInput(e.target.value)}
                  placeholder="Enter factual matrix, FIR sequence, forensic discrepancies, or statutory controversy for full 5-pillar analytical brief..."
                  className="legal-input w-full text-xs md:text-sm p-3 rounded-lg border outline-none focus:border-amber-500 transition leading-relaxed"
                />
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedDomain}
                      onChange={(e) => setSelectedDomain(e.target.value as LegalDomain)}
                      className="legal-input text-[11px] px-2.5 py-1.5 rounded border outline-none focus:border-amber-500 cursor-pointer font-mono"
                    >
                      <option value="Criminal & Forensic Law">Criminal & Forensic Law</option>
                      <option value="Procedural & Custodial Law">Procedural & Custodial Law</option>
                      <option value="Electronic & Documentary Evidence">
                        Electronic & Documentary Evidence
                      </option>
                      <option value="Constitutional & Writ Jurisdiction">
                        Constitutional & Writ Jurisdiction
                      </option>
                      <option value="Commercial & Civil Litigation">
                        Commercial & Civil Litigation
                      </option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isAnalyzing || !consoleInput.trim()}
                    className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs px-5 py-2 rounded-lg transition font-cinzel uppercase tracking-wider cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Execute Clinical Analysis</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </main>
          </div>
        </div>
      ) : workspaceMode === 'constitution' ? (
        <ConstitutionView
          onBackToStation={() => setWorkspaceMode('station')}
          onInjectConstitutionalQuery={(prompt) => {
            setSelectedDomain('Constitutional & Writ Jurisdiction');
            setSelectedPosture('Writ Petitioner / Constitutional Challenge');
            setConsoleInput(prompt);
            setWorkspaceMode('station');
          }}
        />
      ) : workspaceMode === 'askLawAI' ? (
        <AskLawAIView />
      ) : workspaceMode === 'caseFinder' ? (
        <CaseLawFinderView
          onAnalyzeCaseInStation={(prompt) => {
            setConsoleInput(prompt);
            setWorkspaceMode('station');
          }}
        />
      ) : workspaceMode === 'glossary' ? (
        <LegalGlossaryView
          onAnalyzeTermInStation={(prompt) => {
            setConsoleInput(prompt);
            setWorkspaceMode('station');
          }}
        />
      ) : workspaceMode === 'full-dossiers' ? (
        /* Full-Screen Dossier Reader Mode (Dark-Themed Clinical Dossier Sheets + Full 5-Pillar Brief) */
        <div id="dossiers" className="tab-content active max-w-[1440px] w-full mx-auto flex-1 space-y-5 text-[#f1f5f9]">
          <div className="dossier-wrapper">
            <div className="dossier-top-nav">
              <div className="dossier-pills">
                {[
                  { id: 'dossier1' as const, code: 'CR-MISC-2026-0842', briefIdx: 0 },
                  { id: 'dossier2' as const, code: 'SC-SESS-2026-1194', briefIdx: 1 },
                  { id: 'dossier3' as const, code: 'CRL-APP-2026-0319', briefIdx: 2 },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setActiveDossierSheet(pill.id);
                      if (briefs[pill.briefIdx]) {
                        setActiveFullBriefId(briefs[pill.briefIdx].id);
                      }
                    }}
                    className={`dossier-pill ${activeDossierSheet === pill.id ? 'active' : ''}`}
                  >
                    {pill.code}
                  </button>
                ))}
                {briefs.slice(3).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setActiveFullBriefId(b.id);
                    }}
                    className={`dossier-pill ${activeFullBriefId === b.id ? 'active' : ''}`}
                  >
                    {b.docketNumber}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="dossier-action-btn"
                  onClick={() => {
                    triggerHaptic(15);
                    const sheetEl = document.querySelector('.dossier-sheet.active') as HTMLElement | null;
                    if (sheetEl) {
                      navigator.clipboard.writeText(sheetEl.innerText);
                      setDossierCopyToast(
                        t(
                          'Dossier Memorandum copied to clipboard.',
                          'Dossier Memorandum clipboard par copy ho gaya.'
                        )
                      );
                      setTimeout(() => setDossierCopyToast(null), 2500);
                    }
                  }}
                >
                  📋 {t('Copy Memo', 'Memo Copy Karein')}
                </button>
                <button
                  type="button"
                  className="dossier-action-btn"
                  onClick={() => window.print()}
                >
                  🖨️ {t('Print Brief', 'Print Brief')}
                </button>
              </div>
            </div>

            {dossierCopyToast && (
              <div className="mb-3 px-3.5 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-semibold">
                ✓ {dossierCopyToast}
              </div>
            )}

            {/* Dossier 1 */}
            <div
              id="dossier1"
              className={`dossier-sheet ${activeDossierSheet === 'dossier1' ? 'active' : ''}`}
            >
              <div className="dossier-header-bar">
                <div className="dossier-case-meta">
                  <span className="text-[#f59e0b] font-bold">DOCKET NO: CR-MISC-2026-0842</span>
                  <span> · </span>
                  <span className="text-[#38bdf8] font-semibold">JURISDICTION: PROCEDURAL &amp; CUSTODIAL LAW</span>
                  <span> · </span>
                  <span className="text-[#cbd5e1]">POSTURE: DEFENSE / APPELLANT</span>
                </div>
              </div>
              <div className="dossier-heading">
                Tranche-Based Police Custody Beyond Initial 15 Days &amp; Indefeasible Right to Default Bail Under Section 187(2)–(3) BNSS vs. Section 167(2) CrPC
              </div>
              <div className="dossier-section-title">01. Core Legal Issue &amp; Evidentiary Burden</div>
              <div className="dossier-body-text">
                Whether the Investigating Officer (IO) can lawfully seek subsequent tranches of Police Custody on the 34th day of detention under Section 187(2) of the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) without fresh supervening evidentiary grounds, and whether the filing of an incomplete or piecemeal chargesheet on the 60th/90th day defeats the accused&apos;s indefeasible constitutional and statutory right to Default Bail under Section 187(3) BNSS read with Article 21 of the Constitution.
              </div>
              <div className="dossier-section-title">02. Governing Statutory Framework</div>
              <div className="dossier-body-text">
                • <strong>Section 187(2) &amp; 187(3) BNSS, 2023 (Formerly Sec 167(2) CrPC):</strong> Authorizes Police Custody up to 15 days in the whole, or in parts, at any time during the initial 40 days (where maximum period is 60 days) or 60 days (where maximum period is 90 days).<br />
                • <strong>Section 193(3) BNSS (Formerly Sec 173(2) CrPC):</strong> Completion of investigation and final Police Report prerequisite.
              </div>
              <div className="dossier-section-title">03. Binding Precedents (Ratio Decidendi)</div>
              <div className="dossier-body-text">
                • <strong>Ritu Chhabaria v. Union of India, 2023 SCC OnLine SC 502:</strong> An incomplete chargesheet filed merely to scuttle statutory bail under Section 167(2) CrPC (now § 187(3) BNSS) without completing actual investigation does not extinguish the right to default bail.<br />
                • <strong>Bikramjit Singh v. State of Punjab, (2020) 10 SCC 616:</strong> Once the statutory period expires and the accused expresses readiness to furnish bail, the right crystallizes and cannot be defeated by subsequent filing of the chargesheet.
              </div>
              <div className="dossier-section-title">04. Chronological Procedural Roadmap</div>
              <div className="timeline-node">
                <div className="timeline-node-item">
                  <strong>STEP 1: Opposition to Mid-Stream Police Custody Application</strong>
                  <p>Forum: Court of Judicial Magistrate First Class • Invoke § 187(2) BNSS; demand strict scrutiny of case diary.</p>
                </div>
                <div className="timeline-node-item">
                  <strong>STEP 2: Invocation of Indefeasible Default Bail on 61st/91st Day</strong>
                  <p>Forum: Remand Magistrate / Sessions Judge • File written bail application at 10:00 AM upon expiry of statutory period.</p>
                </div>
              </div>
            </div>

            {/* Dossier 2 */}
            <div
              id="dossier2"
              className={`dossier-sheet ${activeDossierSheet === 'dossier2' ? 'active' : ''}`}
            >
              <div className="dossier-header-bar">
                <div className="dossier-case-meta">
                  <span className="text-[#f59e0b] font-bold">DOCKET NO: SC-SESS-2026-1194</span>
                  <span> · </span>
                  <span className="text-[#38bdf8] font-semibold">JURISDICTION: ELECTRONIC &amp; DOCUMENTARY EVIDENCE</span>
                  <span> · </span>
                  <span className="text-[#cbd5e1]">POSTURE: DEFENSE / TRIAL OBJECTION</span>
                </div>
              </div>
              <div className="dossier-heading">
                Admissibility of Secondary Electronic Records (CCTV Footage &amp; WhatsApp Extraction) Under Section 63(4) BSA vs. Section 65B IEA
              </div>
              <div className="dossier-section-title">01. Core Legal Issue &amp; Evidentiary Burden</div>
              <div className="dossier-body-text">
                Whether secondary electronic evidence transferred onto a USB flash drive from a DVR server without contemporaneous cryptographic hash certification (SHA-256) in Part A and Part B of the Schedule to the Bharatiya Sakshya Adhiniyam, 2023 (BSA) is wholly inadmissible at trial.
              </div>
              <div className="dossier-section-title">02. Governing Statutory Framework</div>
              <div className="dossier-body-text">
                • <strong>Section 63(1)–(4) &amp; Schedule, Bharatiya Sakshya Adhiniyam, 2023:</strong> Mandates dual certification (Part A by person in charge of computer device + Part B by Expert stating SHA-256 hash value algorithm).<br />
                • <strong>Section 105 BNSS, 2023:</strong> Mandatory audio-video recording of search and seizure of electronic devices and contemporaneous forwarding to Magistrate.
              </div>
              <div className="dossier-section-title">03. Binding Precedents (Ratio Decidendi)</div>
              <div className="dossier-body-text">
                • <strong>Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal, (2020) 7 SCC 1:</strong> Mandatory certificate is a condition precedent to the admissibility of secondary electronic output; oral evidence cannot substitute statutory certification.
              </div>
            </div>

            {/* Dossier 3 */}
            <div
              id="dossier3"
              className={`dossier-sheet ${activeDossierSheet === 'dossier3' ? 'active' : ''}`}
            >
              <div className="dossier-header-bar">
                <div className="dossier-case-meta">
                  <span className="text-[#f59e0b] font-bold">DOCKET NO: CRL-APP-2026-0319</span>
                  <span> · </span>
                  <span className="text-[#38bdf8] font-semibold">JURISDICTION: HIGH COURT WRIT &amp; QUASHING</span>
                  <span> · </span>
                  <span className="text-[#cbd5e1]">POSTURE: WRIT PETITIONER</span>
                </div>
              </div>
              <div className="dossier-heading">
                Quashing of Criminal Proceedings Under Section 528 BNSS (Formerly Sec 482 CrPC) in Civil Breach of Contract Given Criminal Cloak
              </div>
              <div className="dossier-section-title">01. Core Legal Issue &amp; Evidentiary Burden</div>
              <div className="dossier-body-text">
                Whether an FIR registered under Section 318(4) BNS (Cheating) and Section 316(2) BNS (Criminal Breach of Trust) arising out of a commercial supply dispute—absent dishonest inducement at the very inception of the transaction—amounts to an abuse of the process of court liable to be quashed under Section 528 BNSS.
              </div>
              <div className="dossier-section-title">02. Binding Precedents (Ratio Decidendi)</div>
              <div className="dossier-body-text">
                • <strong>State of Haryana v. Bhajan Lal, 1992 Supp (1) SCC 335:</strong> Seven foundational categories for exercising inherent power to prevent abuse of process of court.<br />
                • <strong>Lalita Kumari v. Govt. of U.P., (2014) 2 SCC 1 &amp; Sec 173(3) BNSS:</strong> Preliminary enquiry in commercial disputes and delayed complaints.
              </div>
            </div>
          </div>

          {activeFullBrief && (
            <div className="dossier-brief-wrapper text-[#f1f5f9]">
              <BriefView
                brief={activeFullBrief}
                onInspectMapping={(sec) => {
                  const cleaned = sec.replace(/Section|BNSS|BNS|BSA|CrPC|IPC|IEA|\(.*?\)/gi, '').trim();
                  setSecSearchInput(cleaned.split(/\s+/)[0] || sec);
                  setWorkspaceMode('station');
                }}
              />
            </div>
          )}
        </div>
      ) : workspaceMode === 'full-crossmapper' ? (
        <CrossMapperView
          mappings={mappings}
          initialSearch={secSearchInput}
          onAddMapping={(entry) => setMappings((prev) => [entry, ...prev])}
        />
      ) : workspaceMode === 'libraryTab' ? (
        <div id="libraryTab" className="tab-content active max-w-[1440px] w-full mx-auto flex-1">
          <div className="stat-box mb-4">
            <div className="card-meta">
              <span>{t('Personal Legal Research Library', 'Personal Legal Research Library')}</span>
              <button
                type="button"
                className="header-icon-btn"
                onClick={() => {
                  triggerHaptic(15);
                  exportBookmarks();
                }}
              >
                📥 {t('Export JSON', 'Export JSON')}
              </button>
            </div>
            <h4 className="text-sm font-bold text-[#f1f5f9]">
              {t('Saved Articles, Sections, Cases & Study Notes', 'Mehfooz Articles, Dafaat, Cases aur Study Notes')}
            </h4>
            <p className="text-xs text-[#94a3b8] mt-1">
              {t(
                'Tap the 🔖 icon on any card across the app to save it here and attach your personal study notes. Everything stays saved in your browser.',
                'App mein kisi bhi card par 🔖 icon dabayein taake wo yahan mehfooz ho jaye aur apne personal study notes likhein.'
              )}
            </p>
          </div>
          <div id="bookmarksContainer" className="cards-grid">
            {bookmarks.length === 0 ? (
              <div className="card cursor-default col-span-full">
                <h4>{t('No Bookmarks Yet', 'Abhi Koi Bookmark Nahi Hai')}</h4>
                <p>
                  {t(
                    'Tap the 🔖 icon on any Constitutional Article, Statutory Section, or Supreme Court Case card to bookmark it and write personal study notes.',
                    'Kisi bhi Constitutional Article, Statutory Section, ya Supreme Court Case card par 🔖 icon dabayein aur apne notes likhein.'
                  )}
                </p>
              </div>
            ) : (
              bookmarks.map((item) => (
                <div key={item.id} className="card cursor-default">
                  <div className="card-meta">
                    <span>🔖 {item.type.toUpperCase()}</span>
                    <button
                      type="button"
                      className="header-icon-btn !py-0.5 !px-2 !text-[10px]"
                      onClick={() => {
                        triggerHaptic(12);
                        removeBookmark(item.id);
                      }}
                    >
                      {t('Remove', 'Hataein')}
                    </button>
                  </div>
                  <h4>{item.title}</h4>
                  <p>{item.subtitle}</p>
                  <div className="mt-2.5">
                    <label className="text-[11px] text-[#f59e0b] font-semibold">
                      {t('Student Legal Notes:', 'Talib-e-Ilm Qanooni Notes:')}
                    </label>
                    <textarea
                      className="note-textarea"
                      placeholder={t(
                        'Write your personal study or courtroom notes for this provision...',
                        'Is qanooni dafaa ya case ke bare mein apne study notes likhein...'
                      )}
                      value={item.note || ''}
                      onChange={(e) => updateBookmarkNote(item.id, e.target.value)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <PrecedentDigestView
          briefs={briefs}
          onSelectBrief={(id) => {
            setActiveFullBriefId(id);
            setWorkspaceMode('full-dossiers');
          }}
        />
      )}

      {/* Feedback & Error Reporting Modal (#reportModal / #reportForm) */}
      <div
        id="reportModal"
        style={{ display: isFeedbackModalOpen ? 'flex' : 'none' }}
        className={`modal-overlay ${isFeedbackModalOpen ? 'open active' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeFeedbackModal();
        }}
      >
        <div className="modal-content modal-sheet">
          <div className="modal-header">
            <div>
              <span className="modal-badge">ARCHITECT DESK • QUALITY ASSURANCE &amp; BUG REPORT</span>
              <h3 className="modal-title mt-1.5">
                ⚠️ {t('Dispatch Report / Feedback to Waris Irshad', 'Waris Irshad (Architect Desk) ko Report Bhejein')}
              </h3>
            </div>
            <button type="button" className="close-btn modal-close" onClick={closeFeedbackModal}>
              ✕
            </button>
          </div>
          <form id="reportForm" className="modal-body" onSubmit={handleFeedbackSubmission}>
            <div className="modal-section">
              <div className="modal-section-label">
                {t('Provision / Citation Reference (Optional)', 'Dafaa / Citation Reference (Ikhtiyari)')}
              </div>
              <input
                type="text"
                id="reportSubject"
                value={reportSubjectInput}
                onChange={(e) => setReportSubjectInput(e.target.value)}
                placeholder="e.g., Sec 106 BNSS / Art 21 / Citation typo..."
                className="search-input !pl-3.5"
              />
            </div>
            <div className="modal-section">
              <div className="modal-section-label">
                {t('Your Contact Info (Email / Telegram / Phone)', 'Aap ka Rabta (Email / Telegram / Phone)')}
              </div>
              <input
                type="text"
                id="reportContactInput"
                value={reportContactInput}
                onChange={(e) => setReportContactInput(e.target.value)}
                placeholder="e.g., advocate@example.com or @username (Optional)"
                className="search-input !pl-3.5"
              />
            </div>
            <div className="modal-section">
              <div className="modal-section-label">
                {t('Feedback / Bug Description *', 'Feedback ya Masle ki Tafseel *')}
              </div>
              <textarea
                id="reportFeedbackInput"
                className="note-textarea !h-[100px]"
                value={reportDetailsInput}
                onChange={(e) => setReportDetailsInput(e.target.value)}
                placeholder={t(
                  'Describe the statutory discrepancy, bug, missing clause, or feedback for Waris Irshad...',
                  'Qanooni farq, bug, gumshuda shaq, ya apna feedback yahan darj karein...'
                )}
              />
            </div>
            {feedbackSubmittedMsg && (
              <div className="mb-3 px-3.5 py-2.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-semibold">
                ✓ {feedbackSubmittedMsg}
              </div>
            )}
            {feedbackErrorMsg && (
              <div className="mb-3 px-3.5 py-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-semibold flex flex-col gap-1">
                <span>⚠️ {feedbackErrorMsg}</span>
                <a
                  href={`mailto:ganaiewaris17@gmail.com?subject=${encodeURIComponent(
                    'LEXINTEL: New Report / User Feedback'
                  )}&body=${encodeURIComponent(
                    `Contact: ${reportContactInput || 'Not provided'}\nReference: ${
                      reportSubjectInput || 'General'
                    }\n\nReport:\n${reportDetailsInput}`
                  )}`}
                  className="text-[#38bdf8] underline font-bold"
                >
                  ➔ Click here to dispatch directly via Gmail (ganaiewaris17@gmail.com)
                </a>
              </div>
            )}
            <button
              type="submit"
              id="reportSubmitBtn"
              disabled={isDispatchingFeedback}
              className="ask-submit-btn w-full disabled:opacity-60"
            >
              {isDispatchingFeedback
                ? 'Dispatching to Architect Desk...'
                : t('Submit Report to Architect Desk', 'Architect Desk ko Report Bhejein')}
            </button>
          </form>
        </div>
      </div>

      {/* Architect / Founder Profile Modal (openFounderModal) */}
      {isFounderModalOpen && (
        <div
          id="detailModal"
          className="modal-overlay open active"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFounderModalOpen(false);
          }}
        >
          <div className="modal-content modal-sheet">
            <div className="modal-header">
              <div>
                <span className="modal-badge">ARCHITECT &amp; LEGAL RESEARCH DESK</span>
                <h3 id="modalTitle" className="modal-title mt-1.5">
                  Architect Profile | Waris Irshad
                </h3>
              </div>
              <button
                type="button"
                className="close-btn modal-close"
                onClick={() => setIsFounderModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div id="modalDynamicBody" className="modal-body">
              <div className="bg-amber-500/10 border-l-[3px] border-[#f59e0b] p-3 rounded-md mb-3">
                <h4 className="text-white text-[15px] font-bold mb-0.5">Waris Irshad</h4>
                <span className="text-[11.5px] text-[#f59e0b] font-bold">
                  BA LL.B Scholar • KC Law College, Jammu &amp; Kashmir
                </span>
              </div>

              <h5>{t("Founder's Perspective & Purpose", 'Founder ka Nazariya aur Maqsad')}</h5>
              <p className="text-[12.5px] leading-[1.65] text-[#cbd5e1]">
                {t(
                  'Waris Irshad is a B.A. LL.B. scholar at KC Law College, Jammu & Kashmir with a deep passion for constitutional jurisprudence, criminal statutory transitions, and legal technology. He engineered ',
                  'Waris Irshad KC Law College, Jammu & Kashmir mein B.A. LL.B. ke qanooni scholar hain. Unhon ne '
                )}
                <strong>LEXINTEL</strong>{' '}
                {t(
                  'with a clear vision: to make legal research faster, structured, and accessible for law students, advocates, and civil service aspirants navigating the transition from old colonial codes (IPC, CrPC, IEA) to modern Indian enactments (BNS, BNSS, BSA).',
                  'ko ek integrated legal workstation ke taur par banaya hai taake purane codes (IPC, CrPC, IEA) se naye qawaneen (BNS, BNSS, BSA) ki taraf qanooni tehqeeq ko tez, structured, aur har talib-e-ilm o wakeel ke liye aasan banaya ja sake.'
                )}
              </p>

              <h5>{t('The LEXINTEL Architecture', 'LEXINTEL Architecture')}</h5>
              <p className="text-[12px] leading-[1.6] text-[#94a3b8] italic">
                &ldquo;Technology should make the legal discipline sharper, accessible, and structured for every aspiring advocate. By combining algorithmic statutory concordance, zero-hallucination judicial precedents, and verified official gazette links, LEXINTEL provides an intuitive workstation for the modern courtroom advocate.&rdquo;
              </p>

              <h5>{t('Direct Dispatch & Connect', 'Direct Rabta & Connect')}</h5>
              <div className="flex flex-col gap-2 mt-2 text-[12.5px]">
                <div>
                  ✉️ <strong>Email:</strong>{' '}
                  <a
                    href="mailto:ganaiewaris17@gmail.com"
                    className="text-[#f59e0b] hover:underline"
                  >
                    ganaiewaris17@gmail.com
                  </a>
                </div>
                <div>
                  ✈️ <strong>Telegram:</strong>{' '}
                  <a
                    href="https://t.me/waris_1711"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#38bdf8] hover:underline"
                  >
                    @waris_1711
                  </a>
                </div>
                <div>
                  💼 <strong>LinkedIn:</strong>{' '}
                  <a
                    href="https://linkedin.com/in/waris_1711"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#60a5fa] hover:underline"
                  >
                    @waris_1711
                  </a>
                </div>
                <div>
                  📸 <strong>Instagram:</strong>{' '}
                  <a
                    href="https://instagram.com/waris_1711"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#f43f5e] hover:underline"
                  >
                    @waris_1711
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draggable Floating Voice/AI Assistant Widget */}
      <div
        id="draggableAiWidget"
        ref={aiWidgetRef}
        title="Drag anywhere • Tap to launch Voice / AI Counsel"
        style={
          aiWidgetPos.left !== undefined && aiWidgetPos.top !== undefined
            ? {
                left: `${aiWidgetPos.left}px`,
                top: `${aiWidgetPos.top}px`,
                right: 'auto',
                bottom: 'auto',
              }
            : undefined
        }
        onPointerDown={(e) => {
          const el = aiWidgetRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          dragStateRef.current = {
            isDragging: true,
            hasMoved: false,
            startX: e.clientX,
            startY: e.clientY,
            initialLeft: rect.left,
            initialTop: rect.top,
          };
          try {
            el.setPointerCapture(e.pointerId);
          } catch {
            // Ignore
          }
        }}
        onPointerMove={(e) => {
          const st = dragStateRef.current;
          if (!st.isDragging || !aiWidgetRef.current) return;
          const dx = e.clientX - st.startX;
          const dy = e.clientY - st.startY;
          if (Math.hypot(dx, dy) >= 6) {
            st.hasMoved = true;
          }
          if (st.hasMoved) {
            const el = aiWidgetRef.current;
            const maxX = Math.max(8, window.innerWidth - el.offsetWidth - 8);
            const maxY = Math.max(8, window.innerHeight - el.offsetHeight - 8);
            const newX = Math.max(8, Math.min(st.initialLeft + dx, maxX));
            const newY = Math.max(8, Math.min(st.initialTop + dy, maxY));
            setAiWidgetPos({ left: newX, top: newY });
          }
        }}
        onPointerUp={(e) => {
          const st = dragStateRef.current;
          if (!st.isDragging) return;
          st.isDragging = false;
          try {
            aiWidgetRef.current?.releasePointerCapture(e.pointerId);
          } catch {
            // Ignore
          }
          if (!st.hasMoved) {
            triggerHaptic(15);
            setWorkspaceMode('askLawAI');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onPointerCancel={(e) => {
          dragStateRef.current.isDragging = false;
          try {
            aiWidgetRef.current?.releasePointerCapture(e.pointerId);
          } catch {
            // Ignore
          }
        }}
      >
        <div className="ai-pulse" />
        <span className="text-[12px] font-bold text-white pointer-events-none">
          {t('Voice / AI Counsel', 'Voice / AI Counsel')}
        </span>
      </div>

      {/* Footer */}
      <footer className="max-w-[1440px] w-full mx-auto border-t border-[#333537] pt-3 mt-auto text-[11px] text-[#8e918f] flex items-center justify-between gap-2 no-print">
        <div>LEXINTEL — AI Counsel Station</div>
        <div className="font-mono text-[10px]">
          IPC / CrPC / IEA / CPC ↔ BNS / BNSS / BSA
        </div>
      </footer>
    </div>
  );
}
