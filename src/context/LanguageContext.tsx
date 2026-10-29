import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageMode = 'en' | 'ur';
export type BookmarkCategory = 'art' | 'mapper' | 'case';

export interface BookmarkItem {
  type: BookmarkCategory;
  id: string;
  title: string;
  summary: string;
  note: string;
  date: string;
}

interface LanguageContextValue {
  lang: LanguageMode;
  setLang: (mode: LanguageMode) => void;
  toggleLang: () => void;
  t: (enText: string, urText: string) => string;
  bookmarks: BookmarkItem[];
  isBookmarked: (type: BookmarkCategory, id: string) => boolean;
  toggleBookmark: (
    e: React.MouseEvent,
    type: BookmarkCategory,
    id: string,
    title: string,
    summary: string
  ) => void;
  updateBookmarkNote: (index: number, note: string) => void;
  removeBookmark: (index: number) => void;
  exportBookmarks: () => void;
  isFeedbackModalOpen: boolean;
  feedbackSubject: string;
  openFeedbackModal: (initialSubject?: string) => void;
  closeFeedbackModal: () => void;
  triggerHaptic: () => void;
}

const STORAGE_LANG_KEY = 'lexintel_language_mode_v1';
const STORAGE_BOOKMARKS_KEY = 'lexintel_bookmarks';

export function triggerHapticFeedback() {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(15);
    } catch {
      // Ignore vibration errors
    }
  }
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  t: (enText) => enText,
  bookmarks: [],
  isBookmarked: () => false,
  toggleBookmark: () => {},
  updateBookmarkNote: () => {},
  removeBookmark: () => {},
  exportBookmarks: () => {},
  isFeedbackModalOpen: false,
  feedbackSubject: '',
  openFeedbackModal: () => {},
  closeFeedbackModal: () => {},
  triggerHaptic: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LanguageMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      return saved === 'ur' ? 'ur' : 'en';
    } catch {
      return 'en';
    }
  });

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_BOOKMARKS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage errors
    }
    return [];
  });

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackSubject, setFeedbackSubject] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch {
      // Ignore storage errors
    }
  }, [bookmarks]);

  const setLang = (mode: LanguageMode) => {
    triggerHapticFeedback();
    setLangState(mode);
  };

  const toggleLang = () => {
    triggerHapticFeedback();
    setLangState((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const t = (enText: string, urText: string) => (lang === 'ur' ? urText : enText);

  const isBookmarked = (type: BookmarkCategory, id: string) =>
    bookmarks.some((b) => b.type === type && b.id === id);

  const toggleBookmark = (
    e: React.MouseEvent,
    type: BookmarkCategory,
    id: string,
    title: string,
    summary: string
  ) => {
    e.stopPropagation();
    triggerHapticFeedback();
    setBookmarks((prev) => {
      const existsIdx = prev.findIndex((b) => b.type === type && b.id === id);
      if (existsIdx > -1) {
        const copy = [...prev];
        copy.splice(existsIdx, 1);
        return copy;
      }
      return [
        ...prev,
        {
          type,
          id,
          title,
          summary,
          note: '',
          date: new Date().toLocaleDateString(),
        },
      ];
    });
  };

  const updateBookmarkNote = (index: number, note: string) => {
    setBookmarks((prev) => {
      if (!prev[index]) return prev;
      const copy = [...prev];
      copy[index] = { ...copy[index], note };
      return copy;
    });
  };

  const removeBookmark = (index: number) => {
    triggerHapticFeedback();
    setBookmarks((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  const exportBookmarks = () => {
    triggerHapticFeedback();
    const blob = new Blob([JSON.stringify(bookmarks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lexintel_Legal_Notes_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openFeedbackModal = (initialSubject = '') => {
    triggerHapticFeedback();
    setFeedbackSubject(initialSubject ? `Correction: ${initialSubject}` : '');
    setIsFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    triggerHapticFeedback();
    setIsFeedbackModalOpen(false);
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t,
        bookmarks,
        isBookmarked,
        toggleBookmark,
        updateBookmarkNote,
        removeBookmark,
        exportBookmarks,
        isFeedbackModalOpen,
        feedbackSubject,
        openFeedbackModal,
        closeFeedbackModal,
        triggerHaptic: triggerHapticFeedback,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

/**
 * Translates any StatutoryMappingEntry's subjectHead, delta, and practice note into natural Roman Urdu
 * when Roman Urdu mode is active, while preserving exact Bare Act section numbers.
 */
export function localizeMappingEntry(
  id: string,
  field:
    | 'subjectHead'
    | 'oldRegimePosition'
    | 'newRegimePosition'
    | 'proceduralAndBailDelta'
    | 'litigationPracticeNote',
  fallbackEn: string,
  lang: LanguageMode
): string {
  if (lang === 'en') return fallbackEn;

  const dictionary: Record<string, Partial<Record<typeof field, string>>> = {
    'map-crpc-102-bnss-106': {
      subjectHead:
        'Police Officer ka Mashkook ya Chori ki Property Zabt (Seize) Karne aur Bank Account Freeze Karne ka Ikhtiyar',
      oldRegimePosition:
        'Section 102(1) CrPC ke tahat police officer kisi bhi aisi property ko seize kar sakta tha jis par chori hone ya kisi jurm se jude hone ka shuba ho (Tapas D. Neogy case mein Bank Account shamil maan liya gaya, lekin Nevada Properties case ke mutabiq zameen/immovable property seize nahi ho sakti). Section 102(3) ke tahat Magistrate ko fauran (forthwith) report dena lazmi tha.',
      newRegimePosition:
        'Section 106(1)–(3) BNSS mein Section 102 CrPC ka ikhtiyar barqarar rakha gaya hai aur Magistrate ko fauran ittila dena lazmi hai. Iske sath ab Section 105 BNSS (seizure ki mobile audio-video recording) aur Section 107 BNSS (Magistrate ke hukm se jurm ki kamaai/proceeds of crime ki attachment) shamil kiye gaye hain.',
      proceduralAndBailDelta:
        '1. Section 106 BNSS ke har physical seizure mein Section 105 BNSS ki audio-video recording lazmi hai.\n2. Immovable property ya proceeds of crime attach karne ke liye ab Section 107 BNSS mein DSP/SP ki manzoori se Magistrate ke samne alag qanooni rasta banaya gaya hai.\n3. Section 106(3) BNSS ke tahat Magistrate ko fauran report na bhejne par bank account freeze gair-qanooni ho jata hai.',
      litigationPracticeNote:
        'Agar police ne Section 106 BNSS (102 CrPC) mein bina Magistrate ko fauran report kiye bank account freeze kiya hai, to Section 497/503 BNSS (451/457 CrPC) ya High Court Writ (Art. 226) ke zariye account de-freeze karwayein.',
    },
    'map-ipc-102-bns-39': {
      subjectHead:
        'Jism ke Zaati Difa (Right of Private Defence of Body) ka Shuru Hona aur Jaari Rehna',
      oldRegimePosition:
        'Section 102 IPC ke mutabiq jism ke zaati difa (self-defence) ka haq us waqt fauran shuru ho jata hai jab kisi jurm ki koshish ya dhamki se jism ko khatre ka maqool khauf (reasonable apprehension) paida ho, chahe hamla abhi mukammal na hua ho; aur ye haq tab tak jaari rehta hai jab tak khatre ka khauf baqi rahe.',
      newRegimePosition:
        'Bharatiya Nyaya Sanhita (BNS), 2023 ki Section 39 mein Section 102 IPC ke alfaaz aur qanooni asool ko bilkul usi tarah Chapter III (General Exceptions — Sections 34 se 44 BNS) mein mehfooz rakha gaya hai.',
      proceduralAndBailDelta:
        'IPC ke Private Defence ke tamam sections (Sections 96 se 106 IPC) ab BNS mein Sections 34 se 44 ban gaye hain (§96 IPC ➔ §34 BNS; §97 IPC ➔ §35 BNS; §100 IPC ➔ §38 BNS; §102 IPC ➔ §39 BNS; §103 IPC ➔ §40 BNS).',
      litigationPracticeNote:
        'Darshan Singh v. State of Punjab (2010) ke mutabiq khatre mein ghire shaks se ye umeed nahi ki ja sakti ke wo apne bachao ke har waar ko "sone ke tarazu" (golden scales) mein tole; jaise hi maqool khatra paida ho, Section 39 BNS ka haq shuru ho jata hai.',
    },
    'map-ipc-300-bns-101': {
      subjectHead:
        'Qatl (Murder) ki Tareef aur 5 Qanooni Istisnaat (Exceptions — Achanak Ishtiaal, Zaati Difa, Achanak Jhagda)',
      proceduralAndBailDelta:
        'Section 300 IPC ke Clauses Firstly–Fourthly ab Section 101 BNS mein Clauses (a) se (d) ban gaye hain. Culpable Homicide ab Section 100 BNS (§299 IPC) aur uski saza Section 105 BNS (§304 IPC) mein hai.',
      litigationPracticeNote:
        'Section 108 BSA (105 IEA) ke tahat apne case ko Section 101 BNS ki 5 Exceptions mein lane ka bojh accused par hota hai jo prosecution gawahon ke cross-examination se bhi sabit kiya ja sakta hai.',
    },
    'map-ipc-302-bns-103': {
      subjectHead: 'Qatl (Murder) ki Saza aur Mob Lynching ka Naya Qanoon',
      proceduralAndBailDelta:
        'Section 103(1) BNS mein qatl ki saza (Maut ya Umar Qaid + Jurmana) wahi hai. Section 103(2) BNS mein 5 ya zyada logon ke giroh dwara zaat, mazhab ya zuban ke naam par Mob Lynching karne par har shamil shaks ke liye Maut ya Umar Qaid ki saza rakhi gayi hai.',
      litigationPracticeNote:
        'Qatl ke muqadme mein hamesha Section 101 BNS ki 5 Exceptions aur Section 105 BNS (Culpable Homicide not amounting to murder) ke pehlu ko check karein.',
    },
    'map-ipc-34-bns-3-5': {
      subjectHead:
        'Mushtarqa Irade (Common Intention) ke Tahat Kai Logon Dwara Kiya Gaya Jurm (Joint Liability)',
      proceduralAndBailDelta:
        'Qanooni asool ("pehle se tay shuda mansooba / meeting of minds") bilkul wahi hai (Mahbub Shah case), lekin 01.07.2024 ke baad FIR aur Chargesheet mein Section 34 IPC ki jagah Section 3(5) BNS likha jayega.',
      litigationPracticeNote:
        'Mehaz mauqa-e-wardat par maujood rehne wale be-qusoor ghar walon ya rahgeeron par bina kisi active role ke Section 3(5) BNS lagane ko challenge karein.',
    },
    'map-crpc-167-bnss-187': {
      subjectHead:
        '24 Ghante mein Tafteesh Mukammal Na Hone par Remand aur Default Bail (60 / 90 Din)',
      proceduralAndBailDelta:
        '1. Police Custody Tranches: 15 din ki kul police custody ab shuru ke 40 din (60 din wale case mein) ya 60 din (90 din wale case mein) ke andar kiston (tranches) mein li ja sakti hai.\n2. 60 ya 90 din mein mukammal chargesheet file na hone par Section 187(3) BNSS mein Default Bail ka haq fauran mil jata hai.',
      litigationPracticeNote:
        '15 din ke baad police custody ki maang hone par Case Diary (Section 192 BNSS) ka muaina maangein taaki bina naye saboot ke police custody na di jaye.',
    },
    'map-crpc-154-bnss-173': {
      subjectHead: 'Cognizable Jurm mein FIR, Zero FIR, e-FIR aur 14-Din ki Preliminary Enquiry',
      proceduralAndBailDelta:
        '1. e-FIR bhejne ke 3 din ke andar shikayat-kuninda ke dastakhat (signature) lazmi hain.\n2. 3 se 7 saal se kam saza wale mamlat mein DSP ki ijazat se 14 din ki Preliminary Enquiry (Section 173(3) BNSS) ho sakti hai.',
      litigationPracticeNote:
        'Karobari ya civil len-den ke jhagdon mein 3 se 7 saal wali dafaat lagne par DSP se Section 173(3) BNSS ke tahat 14-din ki Preliminary Enquiry ki darkhwast karein.',
    },
    'map-iea-65b-bsa-63': {
      subjectHead:
        'Electronic Records (CCTV, WhatsApp, CDR) ki Qabiliyat-e-Qabooliyat aur Hash Certificate',
      proceduralAndBailDelta:
        'Ab IO ka sada kagaz par khud sign kiya hua 65B certificate kafi nahi hai; BSA Schedule ke mutabiq Part A (Device In-charge) aur Part B (Expert SHA-256 Hash Certificate) dono lazmi hain.',
      litigationPracticeNote:
        'Agar pen-drive ya WhatsApp printout ke sath Part B Expert SHA-256 Hash Certificate nahi laga hai, to exhibit mark hone se pehle hi fauran tehreeri aitraaz (objection) darj karwayein.',
    },
    'map-iea-27-bsa-23': {
      subjectHead:
        'Police Custody mein Mulzim ke Bayan se Baramadgi (Discovery / Recovery under Sec 27 IEA ➔ Sec 23 BSA)',
      proceduralAndBailDelta:
        'Section 25 aur 26 IEA (Police confession par pabandi) ab Section 23(1) aur 23(2) BSA hain, jabki Section 27 IEA (Discovery / Recovery exception) ab Section 23(2) BSA ka Proviso ban gaya hai.',
      litigationPracticeNote:
        'Pulukuri Kottaya case ke mutabiq sirf chhupane ki jagah ki maloomat admissible hai, jurm qabool karne wala hissa nahi.',
    },
    'map-ipc-420-bns-318': {
      subjectHead: 'Dhoka-dahi (Cheating) aur Be-imaani se Property Hawale Karwana',
      proceduralAndBailDelta:
        'Sada cheating ki saza 1 saal se badha kar 3 saal (§318(2) BNS) kar di gayi hai, jabki Section 318(4) BNS (pehle 420 IPC) mein 7 saal tak ki saza barqarar hai—isliye Arnesh Kumar aur Section 35(3) BNSS ka Notice lazmi hai.',
      litigationPracticeNote:
        'Civil contract ke jhagde ko cheating banane par Section 173(3) BNSS ki Preliminary Enquiry aur Section 528 BNSS (482 CrPC) mein Quashing file karein.',
    },
    'map-crpc-439-bnss-483': {
      subjectHead: 'High Court aur Sessions Court ke Regular Bail Dene ke Khaas Ikhtiyarat',
      proceduralAndBailDelta:
        'Section 483 BNSS mein Sessions Court aur High Court ke Regular Bail ke ikhtiyarat barqarar hain; Triple Test (bhagne ka khatra na hona, saboot se chhed-chhad na karna, gawahon ko na dhamkana) par faisla hota hai.',
      litigationPracticeNote:
        'Regular bail darkhwast mein Sanjay Chandra v. CBI aur Satender Kumar Antil v. CBI ke "Bail is the rule, jail is the exception" asool ka hawala dein.',
    },
    'map-crpc-482-bnss-528': {
      subjectHead: 'High Court ke Inherent Powers (FIR aur Chargesheet Quash Karne ka Ikhtiyar)',
      proceduralAndBailDelta:
        'Section 482 CrPC ab Section 528 BNSS ban gaya hai. State of Haryana v. Bhajan Lal ke 7 sunehri asool bilkul usi tarah laagu hote hain.',
      litigationPracticeNote:
        'Agar diwani (civil) jhagde ko zabardasti fauj-daari (criminal) FIR banaya gaya ho to Section 528 BNSS mein FIR quash karne aur stay of arrest ki maang karein.',
    },
    'map-cpc-11': {
      subjectHead:
        'Res Judicata (Diwani Muqaddame ka Hatmi Faisla — Ek Hi Jhagde par Dobara Muqaddama Band)',
      proceduralAndBailDelta:
        'Section 11 CPC, 1908 (Explanation I–VIII samet Constructive Res Judicata) kisi bhi ba-ikhtiyar adalat se faisla hone ke baad wahi muqaddama dobara chalane par mukammal qanooni rok lagata hai.',
      litigationPracticeNote:
        'Daryao v. State of U.P. (1961) ke mutabiq Res Judicata ka asool Article 226 aur 32 ki Writ Petitions par bhi laagu hota hai (siwaye Habeas Corpus ke).',
    },
    'map-cpc-9': {
      subjectHead:
        'Tamam Diwani (Civil Nature) Muqaddamat Sunne ka Civil Courts ka Ikhtiyar (Sec 9 CPC)',
      proceduralAndBailDelta:
        'Section 9 CPC ke tehat Civil Courts ko har diwani nauiyat ka muqaddama sunne ka mukammal ikhtiyar hai jab tak kisi khaas qanoon se uspe wazeh (express) ya zaimni (implied) rok na ho.',
      litigationPracticeNote:
        'Dhulabhai v. State of M.P. (1968) ke 7 asoolon ke mutabiq Civil Court ki jurisdiction ka ouster asani se farz nahi kiya ja sakta.',
    },
    'map-cpc-o39': {
      subjectHead:
        'Temporary Injunctions & Stay Orders (Order 39 Rules 1 & 2 CPC — Interim Relief Triple Test)',
      proceduralAndBailDelta:
        'Order 39 Rules 1 & 2 CPC ke tehat kisi bhi interim stay ya status quo ke liye 3 sharaait (Triple Test) lazmi hain: (1) Prima Facie Case, (2) Balance of Convenience, aur (3) Irreparable Injury.',
      litigationPracticeNote:
        'Dalpat Kumar v. Prahlad Singh (1992) 1 SCC 719 ke mutabiq teeno sharaait ek sath poori hone par hi adalat Temporary Injunction manzoor karti hai.',
    },
  };

  return dictionary[id]?.[field] || fallbackEn;
}
