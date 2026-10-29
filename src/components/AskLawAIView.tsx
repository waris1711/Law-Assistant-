import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  STATUTORY_CROSS_MAPPINGS,
  INITIAL_LEGAL_BRIEFS,
  resolveAnySection,
} from '../data/legalDatabase';

export interface InstantLegalEntry {
  keys: string[];
  statute: string;
  principle: string;
  citation: string;
}

export interface FastCachedLegalAnswer {
  law: string;
  ratio: string;
  case: string;
}

// 1. Comprehensive Offline-First Legal Knowledge Engine (Instant 0ms + 1.5s Corpus Fallback)
export const INSTANT_LEGAL_BASE: InstantLegalEntry[] = [
  {
    keys: [
      'kya ma kisi ko maar sakta',
      'kisi ko maar sakta',
      'maar sakta hu',
      'maar sakta',
      'kisi ko maar',
      'private defence',
      'self defence',
      'self-defence',
      'jaan bachana',
      'maar',
      'defend',
      'bachao',
      'hamla',
      'sec 96',
      'sec 100',
      'sec 34 bns',
      'sec 38 bns',
    ],
    statute:
      'Section 96–106 IPC ➔ Section 34–44 BNS, 2023 (Right of Private Defence; Causing Death strictly restricted to Section 100 IPC ➔ Section 38 BNS)',
    principle:
      'No person is permitted to take the law into their own hands or commit culpable homicide/murder (Sec 101/103 BNS). However, under Section 34–44 BNS (Section 96–106 IPC), nothing is an offence which is done in the lawful exercise of the Right of Private Defence. Causing death is strictly restricted to Section 100 IPC / Section 38 BNS only when facing an imminent assault causing reasonable apprehension of: (1) Death, (2) Grievous hurt, (3) Rape, (4) Gratifying unnatural lust, (5) Kidnapping or abduction, (6) Wrongful confinement where public authorities cannot be approached, or (7) Acid attack, or under Section 103 IPC / Section 41 BNS (Robbery, house-breaking by night, mischief by fire/explosive to a dwelling). Force must be strictly proportional (Section 99 IPC / Section 37 BNS), preventive rather than punitive/retaliatory, and ceases the instant the threat ends.',
    citation:
      'Darshan Singh v. State of Punjab, (2010) 2 SCC 333 — Self-preservation is a basic human instinct; a person under imminent peril to life or limb is not expected to weigh force in "golden scales", provided the right is never used as a pretext for aggression or vengeance.',
  },
  {
    keys: [
      'arrest',
      'giraftar',
      'bina warrant',
      'without warrant',
      'civil insaan',
      'police arrest',
      '41 crpc',
      '41a crpc',
      '35 bnss',
      'dk basu',
      'arnesh kumar',
    ],
    statute:
      'Section 41, 41A & 50 CrPC ➔ Section 35, 47 & 48 BNSS, 2023 (Arrest Without Warrant & Mandatory Notice of Appearance)',
    principle:
      'Police cannot arrest automatically merely because an offence is cognizable. For offences punishable with imprisonment up to 7 years, police must record specific written reasons under Section 35(1)(b) BNSS (Section 41(1)(b) CrPC) or mandatorily issue a Section 35(3) BNSS (Section 41A CrPC) Notice of Appearance. Under D.K. Basu safeguards (codified in Sections 36, 47 & 48 BNSS), police must wear visible name tags, prepare an Arrest Memo attested by a family member or respectable local witness, communicate grounds of arrest in writing, inform a nominated relative/friend, and get medical examination done every 48 hours.',
    citation:
      'Arnesh Kumar v. State of Bihar, (2014) 8 SCC 273 & D.K. Basu v. State of West Bengal, (1997) 1 SCC 416 — Non-compliance with mandatory arrest safeguards renders detention illegal and invites departmental action as well as Contempt of Court.',
  },
  {
    keys: [
      'default bail',
      'statutory bail',
      'remand',
      'police custody',
      'judicial custody',
      '167 crpc',
      '187 bnss',
      'chargesheet',
      '60 days',
      '90 days',
    ],
    statute:
      'Section 167(2) CrPC ➔ Section 187(2)–(3) BNSS, 2023 (Remand, Police Custody Tranches & Default Bail)',
    principle:
      'Every arrested person must be produced before a Magistrate within 24 hours (Section 58 BNSS / Article 22(2)). Under Section 187(2) BNSS, 15 days of Police Custody remand may be authorized in whole or in tranches within the first 40 days (for 60-day offences) or first 60 days (for 90-day offences). Under Section 187(3) BNSS (Section 167(2) Proviso CrPC), if the investigation is not completed and the final Police Report (Chargesheet) is not filed within 60 days (or 90 days for offences punishable with death, life imprisonment, or 10+ years), the accused acquires an indefeasible fundamental right to Default Bail upon furnishing bail bonds.',
    citation:
      'M. Ravindran v. Directorate of Revenue Intelligence, (2021) 2 SCC 485 & Rakesh Kumar Paul v. State of Assam, (2017) 15 SCC 67 — Default bail under Section 167(2) CrPC / Section 187(3) BNSS is an integral facet of Article 21 personal liberty.',
  },
  {
    keys: [
      'confession',
      'iqbal-e-jurm',
      'kabulnama',
      'police statement',
      'custody statement',
      'discovery',
      'recovery',
      '24 iea',
      '25 iea',
      '26 iea',
      '27 iea',
      '22 bsa',
      '23 bsa',
    ],
    statute:
      'Sections 24–27 Indian Evidence Act ➔ Sections 22 & 23 Bharatiya Sakshya Adhiniyam (BSA), 2023 (Confessions & Discovery in Custody)',
    principle:
      'Under Section 22 BSA (Section 24 IEA), any confession caused by inducement, threat, coercion, or promise is irrelevant. Under Section 23(1)–(2) BSA (Sections 25–26 IEA), no confession made to a police officer or by any person while in police custody shall be proved against the accused unless made in the immediate presence of a Magistrate (Section 183 BNSS / Section 164 CrPC). Under the Proviso to Section 23(2) BSA (Section 27 IEA), only so much of the information received from an accused in police custody as distinctly leads to the discovery of a physical fact is admissible, strictly severing any self-incriminating confessional narrative.',
    citation:
      'Pulukuri Kottaya v. King-Emperor, AIR 1947 PC 67 & Aghnoo Nagesia v. State of Bihar, AIR 1966 SC 119 — "Fact discovered" means the physical object, the place from which it is produced, and the accused’s knowledge thereof, never the admission of guilt.',
  },
  {
    keys: [
      'search',
      'seizure',
      'talashi',
      'zabti',
      'raid',
      'panchnama',
      'videography',
      '100 crpc',
      '165 crpc',
      '103 bnss',
      '105 bnss',
      '185 bnss',
    ],
    statute:
      'Sections 100 & 165 CrPC ➔ Sections 103, 105 & 185 BNSS, 2023 (Search, Seizure & Mandatory Audio-Video Recording)',
    principle:
      'Every search and seizure must be conducted in the presence of two or more independent and respectable local witnesses (Panchas) under Section 103(4) BNSS (Section 100(4) CrPC), with a signed seizure list handed immediately to the occupant. Crucially, Section 105 BNSS introduces a mandatory requirement that the entire process of search and seizure (including preparation of the seizure list) MUST be recorded via audio-video electronic means (preferably on a mobile phone) and forwarded without delay to the District Magistrate, SDM, or Judicial Magistrate of the First Class.',
    citation:
      'State of Punjab v. Baldev Singh, (1999) 6 SCC 172 & Pooran Mal v. Director of Inspection, (1974) 1 SCC 345 — Statutory procedural safeguards during search and seizure protect citizens against planted evidence and arbitrary intrusion.',
  },
  {
    keys: [
      'bail',
      'zamanat',
      'regular bail',
      'anticipatory',
      '437 crpc',
      '438 crpc',
      '439 crpc',
      '480 bnss',
      '482 bnss',
      '483 bnss',
    ],
    statute:
      'Sections 437, 438 & 439 CrPC ➔ Sections 480, 482 & 483 BNSS, 2023 (Regular & Anticipatory Bail)',
    principle:
      'Bail is the rule and jail is the exception. Under Section 480 BNSS (Regular Bail before Magistrate), Section 482 BNSS (Anticipatory Bail / Direction for grant of bail to person apprehending arrest), and Section 483 BNSS (Special powers of High Court or Court of Session), courts evaluate the triple test: (1) Flight risk, (2) Likelihood of tampering with evidence, and (3) Influencing witnesses. Under Section 479 BNSS, first-time undertrial prisoners who have undergone one-third of the maximum sentence (not punishable with death or life imprisonment) are entitled to mandatory release on bail.',
    citation:
      'State of Rajasthan v. Balchand, (1977) 4 SCC 308; Satender Kumar Antil v. CBI, (2022) 10 SCC 51; Sushila Aggarwal v. State (NCT of Delhi), (2020) 5 SCC 1.',
  },
  {
    keys: [
      'fir',
      'zero fir',
      'efir',
      'e-fir',
      'complaint',
      'police report',
      '154 crpc',
      '173 bnss',
      'lalita kumari',
    ],
    statute:
      'Section 154 CrPC ➔ Section 173 BNSS, 2023 (Mandatory FIR, Zero FIR & e-FIR)',
    principle:
      'Registration of an FIR is mandatory if the information discloses the commission of a cognizable offence. Section 173(1) BNSS codifies "Zero FIR" (registration irrespective of territorial jurisdiction) and "e-FIR" (electronic information taken on record once signed by the informant within 3 days). Under Section 173(3) BNSS, for offences punishable with 3 to 7 years, the Officer-in-Charge may, with prior DSP permission, conduct a 14-day preliminary enquiry to ascertain whether a prima facie case exists. If police refuse to register an FIR, the informant can approach the SP under Section 173(4) BNSS and the Magistrate under Section 175(3) BNSS.',
    citation:
      'Lalita Kumari v. Government of Uttar Pradesh, (2014) 2 SCC 1 (5-Judge Constitution Bench) — Registration of FIR is mandatory under Section 154 CrPC / Section 173 BNSS when information discloses a cognizable offence.',
  },
  {
    keys: [
      '63 bsa',
      '65b',
      'electronic',
      'cctv',
      'whatsapp',
      'call recording',
      'digital evidence',
      'hash',
    ],
    statute:
      'Section 65B(4) IEA ➔ Section 63(4) & Schedule, Bharatiya Sakshya Adhiniyam (BSA), 2023 (Electronic Evidence)',
    principle:
      'Secondary electronic records (CCTV footage, WhatsApp chats, emails, server logs, call recordings) are inadmissible unless accompanied by a mandatory statutory certificate under Section 63(4) BSA in the format prescribed in the BSA Schedule: Part A (signed by the person in lawful control of the device/server) and Part B (signed by an Expert verifying the cryptographic SHA-256 hash value and unbroken integrity of the electronic output).',
    citation:
      'Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal, (2020) 7 SCC 1 — The Section 65B(4) IEA / Section 63(4) BSA certificate is a mandatory condition precedent whenever secondary electronic output is produced.',
  },
  {
    keys: [
      'murder',
      'qatl',
      'homicide',
      '302 ipc',
      '300 ipc',
      '299 ipc',
      '103 bns',
      '101 bns',
      '100 bns',
      'lynching',
    ],
    statute:
      'Sections 299, 300 & 302 IPC ➔ Sections 100, 101 & 103 BNS, 2023 (Culpable Homicide & Murder)',
    principle:
      'Culpable homicide (Section 100 BNS / Section 299 IPC) becomes Murder under Section 101 BNS (Section 300 IPC) if the act is done with the intention of causing death, or with the intention of causing bodily injury which is objectively sufficient in the ordinary course of nature to cause death (Clause Thirdly), unless covered by the five statutory Exceptions (Grave and sudden provocation, Exceeding private defence in good faith, Public servant act, Sudden fight in heat of passion, Consent). Section 103(2) BNS specifically penalizes murder by a group of 5 or more persons on specified grounds (mob lynching) with death or imprisonment for life.',
    citation:
      'Virsa Singh v. State of Punjab, AIR 1958 SC 465 & Bachan Singh v. State of Punjab, (1980) 2 SCC 684 — Objective sufficiency of the intentionally inflicted bodily injury establishes murder; death penalty is restricted to the "rarest of rare" cases.',
  },
  {
    keys: [
      'cheating',
      'dhokadhadi',
      'fraud',
      '420 ipc',
      '406 ipc',
      '318 bns',
      '316 bns',
      'quashing',
      '482 crpc',
      '528 bnss',
    ],
    statute:
      'Sections 420 & 406 IPC / Section 482 CrPC ➔ Sections 318(4) & 316(2) BNS / Section 528 BNSS, 2023 (Cheating, Criminal Breach of Trust & Quashing)',
    principle:
      'To constitute Cheating under Section 318(4) BNS (Section 420 IPC), fraudulent or dishonest intention must exist at the very inception of the transaction. A mere subsequent breach of contract or civil monetary dispute without mens rea at the outset cannot be weaponized into a criminal prosecution, and the High Court is empowered to quash such abusive FIRs under its inherent jurisdiction under Section 528 BNSS (Section 482 CrPC).',
    citation:
      'State of Haryana v. Bhajan Lal, 1992 Supp (1) SCC 335 & Hridaya Ranjan Prasad Verma v. State of Bihar, (2000) 4 SCC 168.',
  },
  {
    keys: ['res judicata', '11 cpc', 'civil suit', '9 cpc', 'injunction', 'order 39'],
    statute:
      'Sections 9 & 11 and Order XXXIX Rules 1–2, Code of Civil Procedure, 1908 (Civil Jurisdiction, Res Judicata & Injunctions)',
    principle:
      'Under Section 11 CPC (Res Judicata), no Civil Court shall try any suit or issue in which the matter directly and substantially in issue has been heard and finally decided between the same parties by a competent Court, including constructive res judicata under Explanation IV. For temporary injunctions under Order XXXIX Rules 1 & 2 CPC, the plaintiff must satisfy the triple test: (1) Prima facie case, (2) Balance of convenience, and (3) Irreparable injury.',
    citation:
      'Satyadhyan Ghosal v. Deorajin Debi, AIR 1960 SC 941 & Dalpat Kumar v. Prahlad Singh, (1992) 1 SCC 719.',
  },
];

interface ChatTurn {
  id: string;
  role: 'user' | 'ai';
  text?: string;
  htmlContent?: string;
  instantMatch?: InstantLegalEntry;
}

const PRESET_QUESTIONS = [
  {
    labelEn: 'Kya ma kisi ko maar sakta hu? (Private Defence)',
    labelUr: 'Kya ma kisi ko maar sakta hu? (Private Defence)',
    query: 'kya ma kisi ko maar sakta hu?',
  },
  {
    labelEn: 'Bina warrant arrest? (Sec 35 BNSS)',
    labelUr: 'Bina warrant arrest? (Sec 35 BNSS)',
    query: 'Kya police bina warrant arrest kar sakti hai?',
  },
  {
    labelEn: 'Default Bail & Remand (Sec 187 BNSS)',
    labelUr: 'Default Bail & Remand (Sec 187 BNSS)',
    query: 'Default bail, remand aur police custody par law kya hai?',
  },
  {
    labelEn: 'Confessions & Search (Sec 23 BSA / 105 BNSS)',
    labelUr: 'Confessions & Search (Sec 23 BSA / 105 BNSS)',
    query: 'Police custody confession aur search & seizure ka law kya hai?',
  },
  {
    labelEn: 'Bail & Liberty (Sec 480 BNSS)',
    labelUr: 'Bail & Liberty (Sec 480 BNSS)',
    query: 'Regular bail aur personal liberty par law kya hai?',
  },
];

export function formatThreePartLegalHtml(
  entry: InstantLegalEntry,
  headerBadge = '⚡ LEXINTEL Statutory Counsel'
): string {
  return `
    <div style="font-size: 11px; color: #f59e0b; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.04em;">${headerBadge}</div>
    <div style="margin-bottom: 8px;"><strong style="color: #fbbf24;">① Applicable Sections (IPC/CrPC ➔ BNS/BNSS):</strong><br/><span>${entry.statute}</span></div>
    <div style="margin-bottom: 8px;"><strong style="color: #fbbf24;">② Exact Legal Position &amp; Conditions:</strong><br/><span>${entry.principle}</span></div>
    <div style="color: #38bdf8; font-size: 12.5px;"><strong style="color: #38bdf8;">③ Landmark Supreme Court Precedent:</strong><br/><em>${entry.citation}</em></div>
  `.trim();
}

export function matchInstantLegalBase(query: string): InstantLegalEntry | null {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return null;

  const directMatch = INSTANT_LEGAL_BASE.find((item) =>
    item.keys.some((k) => lowerQuery.includes(k))
  );
  if (directMatch) return directMatch;

  // Check exact match in STATUTORY_CROSS_MAPPINGS
  for (const item of STATUTORY_CROSS_MAPPINGS) {
    const oldClean = item.oldSection.toLowerCase();
    const newClean = item.newSection.toLowerCase();
    const subjectClean = item.subjectHead.toLowerCase();
    if (
      lowerQuery.includes(oldClean) ||
      lowerQuery.includes(newClean) ||
      lowerQuery.includes(subjectClean)
    ) {
      return {
        keys: [oldClean, newClean],
        statute: `${item.oldAct} (${item.oldSection}) ➔ ${item.newAct} (${item.newSection}) — ${item.subjectHead}`,
        principle: `${item.oldTextSummary} ➔ ${item.newTextSummary} ${item.proceduralAndBailDelta}`,
        citation: item.litigationPracticeNote,
      };
    }
  }

  // Check INITIAL_LEGAL_BRIEFS for matching case titles or keywords
  for (const brief of INITIAL_LEGAL_BRIEFS) {
    const titleLower = brief.caseTitle.toLowerCase();
    const firstParty = titleLower.split(' v. ')[0]?.trim() || '';
    if (
      (firstParty.length > 3 && lowerQuery.includes(firstParty)) ||
      brief.tags.some((t) => lowerQuery.includes(t.toLowerCase()))
    ) {
      return {
        keys: [firstParty],
        statute: brief.statutesInvolved.join(' | '),
        principle: `${brief.ratioDecidendi} ${brief.bnsTransitionImpact}`,
        citation: `${brief.caseTitle}, ${brief.citation} (${brief.court} — ${brief.benchStrength})`,
      };
    }
  }

  // Check section query via resolveAnySection if user mentions any section number
  if (/(sec|section|dafaa|dhara|\b\d{1,3}[a-z]?\b)/i.test(lowerQuery)) {
    const resolved = resolveAnySection(lowerQuery);
    if (resolved) {
      return {
        keys: [lowerQuery],
        statute: `${resolved.oldAct} (${resolved.oldSection}) ➔ ${resolved.newAct} (${resolved.newSection}) — ${resolved.title}`,
        principle: `Statutory concordance governing ${resolved.title} (${resolved.category}). Under Section 358 BNS / Section 531 BNSS / Section 170 BSA transitional savings doctrine, offences or proceedings instituted prior to July 1, 2024 are governed by ${resolved.oldAct} (${resolved.oldSection}), whereas causes of action on or after July 1, 2024 are governed by ${resolved.newAct} (${resolved.newSection}).`,
        citation: `In Re: Bharatiya Nyaya Sanhita & BNSS Statutory Transition (Section 358 BNS / Section 531 BNSS); Maneka Gandhi v. Union of India, (1978) 1 SCC 248 (Article 21 Due Process).`,
      };
    }
  }

  return null;
}

/**
 * Comprehensive Offline-First Synthesis:
 * Always guarantees a rich, authoritative 3-part Indian law response from the built-in
 * Lexintel corpus even when a query is open-ended and the live network is slow (>1.5s) or offline.
 */
export function synthesizeOfflineLegalCorpus(query: string): InstantLegalEntry {
  const direct = matchInstantLegalBase(query);
  if (direct) return direct;

  const q = query.toLowerCase();

  if (
    q.includes('maar') ||
    q.includes('kill') ||
    q.includes('hurt') ||
    q.includes('attack') ||
    q.includes('fight') ||
    q.includes('weapon') ||
    q.includes('threat')
  ) {
    return INSTANT_LEGAL_BASE[0]; // Private Defence & Section 100 IPC / Section 38 BNS
  }

  if (
    q.includes('police') ||
    q.includes('thana') ||
    q.includes('lockup') ||
    q.includes('custody') ||
    q.includes('warrant') ||
    q.includes('notice')
  ) {
    return INSTANT_LEGAL_BASE[1]; // Arrest without warrant & Section 35 BNSS
  }

  if (
    q.includes('remand') ||
    q.includes('jail') ||
    q.includes('60') ||
    q.includes('90') ||
    q.includes('charge')
  ) {
    return INSTANT_LEGAL_BASE[2]; // Default bail & remand
  }

  if (
    q.includes('statement') ||
    q.includes('admit') ||
    q.includes('evidence') ||
    q.includes('witness')
  ) {
    return INSTANT_LEGAL_BASE[3]; // Confessions & Section 23 BSA
  }

  if (
    q.includes('phone') ||
    q.includes('house') ||
    q.includes('check') ||
    q.includes('talaashi') ||
    q.includes('property')
  ) {
    return INSTANT_LEGAL_BASE[4]; // Search & Seizure
  }

  // General Authoritative Indian Constitutional & Criminal Procedure Synthesis
  return {
    keys: [q],
    statute:
      'Bharatiya Nyaya Sanhita (BNS), 2023 | Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 | Bharatiya Sakshya Adhiniyam (BSA), 2023 & Article 21, Constitution of India',
    principle: `In respect of "${query.trim()}", Indian criminal and civil jurisprudence mandates strict adherence to procedure established by law: (1) Substantive penal liability requires both actus reus and mens rea under the BNS, 2023 (saving General Exceptions under Sections 14–44 BNS, including Right of Private Defence under Sections 34–44 BNS); (2) Procedural fairness requires mandatory FIR registration for cognizable offences (Sec 173 BNSS), restraint on arbitrary arrest for offences punishable up to 7 years via mandatory notice (Sec 35(3) BNSS), audio-video recording of search & seizure (Sec 105 BNSS), and statutory default bail if investigation exceeds 60/90 days (Sec 187(3) BNSS).`,
    citation:
      'Maneka Gandhi v. Union of India, (1978) 1 SCC 248; Arnesh Kumar v. State of Bihar, (2014) 8 SCC 273; Lalita Kumari v. Govt. of U.P., (2014) 2 SCC 1.',
  };
}

export function fastCheckCache(query: string): FastCachedLegalAnswer | null {
  const match = matchInstantLegalBase(query);
  if (!match) return null;
  return {
    law: match.statute,
    ratio: match.principle,
    case: match.citation,
  };
}

export const AskLawAIView: React.FC = () => {
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      id: 'welcome-ai',
      role: 'ai',
      htmlContent: `<div style="font-size: 11px; color: #f59e0b; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">⚡ LEXINTEL AI Legal Counsel</div><div>Ask any Indian law question (e.g., <em>"kya ma kisi ko maar sakta hu?"</em>, Police Arrest under Sec 35 BNSS, Default Bail, Confessions, Search &amp; Seizure). Every response delivers crisp 3-part statutory analysis: <strong>① Applicable Sections (IPC/CrPC ➔ BNS/BNSS)</strong>, <strong>② Exact Legal Position &amp; Conditions</strong>, and <strong>③ Landmark Supreme Court Precedent</strong>.</div>`,
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 2. Real-Time Streaming AI Function with 0ms Instant Engine & 1.5s Local Corpus Synthesis
  const sendLegalQuery = useCallback(
    async (explicitQuery?: string) => {
      const raw = explicitQuery !== undefined ? explicitQuery : inputVal;
      const query = raw.trim();
      if (!query || isStreaming) return;

      const userId = `u-${Date.now()}`;
      const aiId = `ai-${Date.now() + 1}`;

      if (explicitQuery === undefined) {
        setInputVal('');
      }

      // A. Check 0ms Local Knowledge Engine First
      const match = matchInstantLegalBase(query);
      if (match) {
        setMessages((prev) => [
          ...prev,
          { id: userId, role: 'user', text: query },
          { id: aiId, role: 'ai', instantMatch: match },
        ]);
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(12);
          } catch {
            // Ignore if blocked
          }
        }
        setTimeout(scrollToBottom, 10);
        return;
      }

      // B. Create User Message & AI Response Container immediately
      setMessages((prev) => [
        ...prev,
        { id: userId, role: 'user', text: query },
        {
          id: aiId,
          role: 'ai',
          htmlContent:
            '<span style="color: #94a3b8;">Synthesizing statutory provisions (IPC/CrPC ➔ BNS/BNSS)...</span>',
        },
      ]);
      setIsStreaming(true);

      // Helper to stream the built-in Lexintel legal corpus smoothly if API takes > 1.5s or fails
      const streamOfflineCorpusAnswer = async (entry: InstantLegalEntry) => {
        const fullHtml = formatThreePartLegalHtml(entry, '⚡ LEXINTEL Statutory Synthesis');
        const tokens = fullHtml.split(/(?=<div|<br|\s+)/);
        let built = '';
        const step = Math.max(4, Math.floor(tokens.length / 12));
        for (let i = 0; i < tokens.length; i += step) {
          built += tokens.slice(i, i + step).join('');
          const snapshot = built;
          setMessages((prev) =>
            prev.map((m) => (m.id === aiId ? { ...m, htmlContent: snapshot } : m))
          );
          scrollToBottom();
          await new Promise((r) => setTimeout(r, 18));
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId ? { ...m, instantMatch: entry, htmlContent: undefined } : m
          )
        );
      };

      const controller = new AbortController();
      let receivedFirstChunk = false;
      const timeoutId = setTimeout(() => {
        if (!receivedFirstChunk) {
          controller.abort();
        }
      }, 1500);

      try {
        const response = await fetch('/api/lexintel/stream-legal-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ query }),
        });

        if (!response.ok || !response.body) {
          throw new Error('Stream unavailable');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.substring(6));
                const textPiece = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (textPiece) {
                  if (!receivedFirstChunk) {
                    receivedFirstChunk = true;
                    clearTimeout(timeoutId);
                  }
                  accumulatedText += textPiece;
                  const formatted = `<div style="font-size: 11px; color: #f59e0b; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.04em;">⚡ LEXINTEL Live Statutory Counsel</div>${accumulatedText
                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fbbf24;">$1</strong>')
                    .replace(
                      /(①\s*Applicable Sections[^:\n]*:?)/g,
                      '<strong style="color: #fbbf24;">$1</strong>'
                    )
                    .replace(
                      /(②\s*Exact Legal Position[^:\n]*:?)/g,
                      '<strong style="color: #fbbf24;">$1</strong>'
                    )
                    .replace(
                      /(③\s*Landmark Supreme Court Precedent[^:\n]*:?)/g,
                      '<strong style="color: #38bdf8;">$1</strong>'
                    )
                    .replace(/\n/g, '<br>')}`;

                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === aiId ? { ...m, htmlContent: formatted } : m
                    )
                  );
                  scrollToBottom();
                }
              } catch {
                // Ignore incomplete chunk parse error
              }
            }
          }
        }

        clearTimeout(timeoutId);

        if (!accumulatedText.trim()) {
          throw new Error('Empty stream');
        }
      } catch {
        clearTimeout(timeoutId);
        // Never show an error or external link — immediately synthesize & stream from built-in Lexintel corpus
        const fallbackEntry = synthesizeOfflineLegalCorpus(query);
        await streamOfflineCorpusAnswer(fallbackEntry);
      } finally {
        setIsStreaming(false);
        setTimeout(scrollToBottom, 10);
      }
    },
    [inputVal, isStreaming, scrollToBottom]
  );

  // Expose sendLegalQuery, handleAskLawFast, INSTANT_LEGAL_BASE, and fastCheckCache on window
  useEffect(() => {
    const win = window as unknown as {
      sendLegalQuery?: (q?: string) => Promise<void>;
      handleAskLawFast?: (q?: string) => Promise<void>;
      INSTANT_LEGAL_BASE?: InstantLegalEntry[];
      fastCheckCache?: typeof fastCheckCache;
    };
    const triggerFromDomOrArg = (q?: string) => {
      const domInput = document.getElementById('aiQueryInput') as HTMLInputElement | null;
      const targetQ = q ?? domInput?.value ?? '';
      return sendLegalQuery(targetQ);
    };
    win.sendLegalQuery = triggerFromDomOrArg;
    win.handleAskLawFast = triggerFromDomOrArg;
    win.INSTANT_LEGAL_BASE = INSTANT_LEGAL_BASE;
    win.fastCheckCache = fastCheckCache;
  }, [sendLegalQuery]);

  const handleFocus = () => {
    setTimeout(() => {
      inputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
  };

  return (
    <div id="askLawAI" className="tab-content active max-w-[1440px] w-full mx-auto flex-1">
      <div className="chip-container">
        {PRESET_QUESTIONS.map((item) => (
          <span
            key={item.labelEn}
            onClick={() => sendLegalQuery(item.query)}
            className="chip"
          >
            {lang === 'ur' ? item.labelUr : item.labelEn}
          </span>
        ))}
      </div>

      <div ref={chatContainerRef} className="chat-container" id="chatMessages">
        {messages.map((m) =>
          m.role === 'user' ? (
            <div
              key={m.id}
              className="chat-bubble chat-user"
              style={{
                background: '#1e242d',
                border: '1px solid #334155',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '10px',
                fontSize: '13.5px',
                color: '#fff',
                alignSelf: 'flex-end',
              }}
            >
              {m.text}
            </div>
          ) : m.instantMatch ? (
            <div
              key={m.id}
              className="chat-bubble chat-ai"
              style={{
                background: '#141820',
                border: '1px solid #28303e',
                borderLeft: '3px solid #f59e0b',
                padding: '12px 15px',
                borderRadius: '10px',
                marginBottom: '12px',
                fontSize: '13.5px',
                color: '#e2e8f0',
                lineHeight: 1.6,
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#f59e0b',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  letterSpacing: '0.04em',
                }}
              >
                ⚡ Instant Statutory Response
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#fbbf24' }}>
                  ① Applicable Sections (IPC/CrPC ➔ BNS/BNSS):
                </strong>
                <div style={{ marginTop: '2px' }}>{m.instantMatch.statute}</div>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#fbbf24' }}>
                  ② Exact Legal Position &amp; Conditions:
                </strong>
                <div style={{ marginTop: '2px' }}>{m.instantMatch.principle}</div>
              </div>
              <div style={{ color: '#38bdf8', fontSize: '12.5px' }}>
                <strong style={{ color: '#38bdf8' }}>
                  ③ Landmark Supreme Court Precedent:
                </strong>
                <div style={{ marginTop: '2px' }}>
                  <em>{m.instantMatch.citation}</em>
                </div>
              </div>
            </div>
          ) : (
            <div
              key={m.id}
              className="chat-bubble chat-ai"
              style={{
                background: '#141820',
                border: '1px solid #28303e',
                borderLeft: '3px solid #f59e0b',
                padding: '12px 15px',
                borderRadius: '10px',
                marginBottom: '12px',
                fontSize: '13.5px',
                color: '#e2e8f0',
                lineHeight: 1.6,
              }}
              dangerouslySetInnerHTML={{ __html: m.htmlContent || m.text || '' }}
            />
          )
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendLegalQuery();
        }}
        className="chat-input-bar"
      >
        <input
          ref={inputRef}
          type="text"
          id="aiQueryInput"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onFocus={handleFocus}
          className="search-box !mb-0"
          placeholder={t(
            'Ask: e.g., kya ma kisi ko maar sakta hu? / Section 35 BNSS arrest rules',
            'Poochiye: Maslan, kya ma kisi ko maar sakta hu? / Section 35 BNSS arrest rules'
          )}
        />
        <button type="submit" className="chat-send-btn">
          {t('Ask', 'Poochein')}
        </button>
      </form>
    </div>
  );
};
