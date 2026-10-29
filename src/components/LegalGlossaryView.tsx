import React, { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowUpRight } from 'lucide-react';

export interface GlossaryItem {
  id: string;
  category: string;
  term: string;
  definition: string;
  definitionUr: string;
  statutoryOrCaseAnchor: string;
  keywords: string;
  presetPrompt: string;
}

export const LEGAL_GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    id: 'glossary-ratio-decidendi',
    category: 'Precedent Jurisprudence',
    term: 'Ratio Decidendi',
    definition:
      "The underlying legal principle or reason for a court's decision that constitutes binding authority for subordinate courts.",
    definitionUr:
      'Adalat ke faisle ka woh buniyadi qanooni asool jo aage aane wale cases aur nichli adalaton par lazmi taur par laagu hota hai.',
    statutoryOrCaseAnchor:
      'Article 141, Constitution of India — Law declared by Supreme Court binding on all courts.',
    keywords: 'ratio decidendi judicial precedent binding rule of law article 141',
    presetPrompt:
      'Demarcate the binding Ratio Decidendi from non-binding Obiter Dicta under Article 141 of the Constitution of India using the inversion test laid down by the Supreme Court in Islamic Academy of Education v. State of Karnataka, (2003) 6 SCC 697.',
  },
  {
    id: 'glossary-obiter-dicta',
    category: 'Precedent Jurisprudence',
    term: 'Obiter Dicta',
    definition:
      'Observations or remarks made by a judge in passing, not essential to the decision, holding persuasive but non-binding value.',
    definitionUr:
      'Judge ke faisle ke dauran diye gaye zaimni bayanaat jo binding nahi hote magar ahem rehnumai dete hain.',
    statutoryOrCaseAnchor:
      'Persuasive authority; does not operate as a binding ratio under Article 141.',
    keywords: 'obiter dicta judicial precedent observations in passing persuasive non-binding',
    presetPrompt:
      'Analyze when Supreme Court observations made in passing constitute non-binding Obiter Dicta versus authoritative judicial directions under Article 141 of the Constitution of India.',
  },
  {
    id: 'glossary-audi-alteram-partem',
    category: 'Natural Justice',
    term: 'Audi Alteram Partem',
    definition:
      "'Hear the other side.' Fundamental rule of procedural fairness ensuring no person is judged without a reasonable opportunity of being heard.",
    definitionUr:
      "'Doosri party ko bhi suno.' Qudrati insaf ka buniyadi asool ke kisi bhi shakhs ke khilaf usko sune baghair faisla na ho.",
    statutoryOrCaseAnchor:
      'Maneka Gandhi v. Union of India, (1978) 1 SCC 248; First Proviso to Section 223(1) BNSS, 2023.',
    keywords: 'audi alteram partem natural justice hear the other side procedural fairness',
    presetPrompt:
      'Analyze the statutory codification of Audi Alteram Partem at the pre-cognizance stage under the First Proviso to Section 223(1) of the Bharatiya Nagarik Suraksha Sanhita, 2023 and its constitutional roots under Articles 14 and 21.',
  },
  {
    id: 'glossary-actus-reus-mens-rea',
    category: 'Criminal Jurisprudence',
    term: 'Actus Reus & Mens Rea',
    definition:
      'The physical wrongful act (Actus Reus) combined with a guilty mental state or intention (Mens Rea), both required to establish criminal guilt.',
    definitionUr:
      'Mujrimana irada (Mens Rea) aur ghair-qanooni amal (Actus Reus) dono mil kar jurm bante hain.',
    statutoryOrCaseAnchor:
      'Actus non facit reum nisi mens sit rea — BNS, 2023 General Exceptions (§§14–44) & Mens Rea thresholds.',
    keywords: 'actus reus mens rea criminal jurisprudence guilty mind wrongful act intent',
    presetPrompt:
      'Analyze the interplay of Actus Reus and Mens Rea in distinguishing culpable homicide not amounting to murder under Section 100 BNS (299 IPC) from murder under Section 101 BNS (300 IPC).',
  },
  {
    id: 'glossary-res-judicata',
    category: 'Civil Procedure',
    term: 'Res Judicata (Sec 11 CPC)',
    definition:
      'A matter once adjudicated by a competent court cannot be litigated again by the same parties on the same cause of action.',
    definitionUr:
      'Jis muqaddame ka faisla ba-ikhtiyar adalat kar chuki ho, uspar doosri baar muqaddama dakhil nahi kiya ja sakta.',
    statutoryOrCaseAnchor:
      'Section 11, Code of Civil Procedure, 1908 (including Constructive Res Judicata under Explanation IV).',
    keywords: 'res judicata sec 11 cpc civil procedure final judgment constructive res judicata',
    presetPrompt:
      'Analyze the statutory requisites of Res Judicata and Constructive Res Judicata under Section 11 (Explanation IV) of the Code of Civil Procedure, 1908 and its applicability to writ proceedings under Article 226.',
  },
  {
    id: 'glossary-prima-facie',
    category: 'Evidence Law',
    term: 'Prima Facie',
    definition:
      "'At first sight.' Sufficient evidence to establish a legal presumption or fact unless disproved by rebuttal evidence.",
    definitionUr:
      "'Pehli nazar mein.' Woh saboot jo zahiri taur par kisi jurm ya daawe ko sach sabit karne ke liye kaafi ho.",
    statutoryOrCaseAnchor:
      'Section 250 / 251 BNSS (Discharge vs. Framing of Charge) & Bail threshold evaluation.',
    keywords: 'prima facie evidence law on the face of it charge framing bail',
    presetPrompt:
      'Examine the threshold of "Prima Facie Case" versus "Grave Suspicion" at the stage of discharge and framing of charges under Sections 250 and 251 of the Bharatiya Nagarik Suraksha Sanhita, 2023 (Sections 227/228 CrPC).',
  },
  {
    id: 'glossary-nemo-judex',
    category: 'Natural Justice',
    term: 'Nemo Judex In Causa Sua',
    definition:
      '"No one should be a judge in their own cause." The rule against pecuniary, personal, or departmental bias in adjudication.',
    definitionUr:
      '"Koi bhi shakhs apne hi muqaddame mein judge nahi ho sakta." Taraf-dari aur zaati mafaad ke khilaf qudrati insaf ka asool.',
    statutoryOrCaseAnchor:
      'A.K. Kraipak v. Union of India, (1969) 2 SCC 262; Section 525 BNSS (479 CrPC).',
    keywords: 'nemo judex in causa sua rule against bias natural justice',
    presetPrompt:
      'Analyze the doctrine of Nemo Judex In Causa Sua (Rule against Bias) and the "real likelihood of bias" test in administrative and quasi-judicial proceedings under Articles 14 and 226 of the Constitution.',
  },
  {
    id: 'glossary-falsus-in-uno',
    category: 'Evidence Law',
    term: 'Falsus In Uno, Falsus In Omnibus',
    definition:
      '"False in one thing, false in everything." In Indian criminal jurisprudence, this maxim is not a mandatory rule of law; courts separate grain from chaff.',
    definitionUr:
      '"Ek baat mein jhoota, har baat mein jhoota." Hindustani qanoon mein ye asool lazmi nahi hai; adalat gawah ke bayan mein se sach aur jhoot ko alag karti hai.',
    statutoryOrCaseAnchor:
      'Ugar Ahir v. State of Bihar, AIR 1965 SC 277 — Duty of court to sift truth from falsehood.',
    keywords: 'falsus in uno falsus in omnibus witness credibility grain from chaff evidence',
    presetPrompt:
      'Explain why the maxim "Falsus in uno, falsus in omnibus" does not apply as an absolute rule in India, and when an embellishment goes to the root of the prosecution story rendering the entire testimony unreliable.',
  },
  {
    id: 'glossary-autrefois-acquit',
    category: 'Constitutional & Criminal Law',
    term: 'Autrefois Acquit & Double Jeopardy',
    definition:
      'Protection against being prosecuted and punished more than once for the same offence after a prior acquittal or conviction by a court of competent jurisdiction.',
    definitionUr:
      'Ek hi jurm ke liye dobara muqaddama chalane aur dobara saza dene (Double Jeopardy) ke khilaf aaeeni aur qanooni tahaffuz.',
    statutoryOrCaseAnchor:
      'Article 20(2), Constitution of India & Section 337 BNSS, 2023 (Section 300 CrPC).',
    keywords: 'autrefois acquit autrefois convict double jeopardy article 20 337 bnss 300 crpc',
    presetPrompt:
      'Compare the scope of Constitutional Double Jeopardy under Article 20(2) ("prosecuted and punished") with the wider statutory bar of Autrefois Acquit and Autrefois Convict under Section 337 of the BNSS, 2023 (Section 300 CrPC).',
  },
  {
    id: 'glossary-ei-incumbit',
    category: 'Evidence Law',
    term: 'Ei Incumbit Probatio Qui Dicit, Non Qui Negat',
    definition:
      'The burden of proof lies upon the person who affirms a fact, not upon the person who denies it.',
    definitionUr:
      'Saboot ka bojh (Burden of Proof) us shakhs par hota hai jo kisi baat ka daawa karta hai, na ke inkar karne wale par.',
    statutoryOrCaseAnchor:
      'Sections 104–109, Bharatiya Sakshya Adhiniyam, 2023 (Sections 101–106 IEA, 1872).',
    keywords: 'ei incumbit probatio burden of proof bsa 104 109 iea 101 106',
    presetPrompt:
      'Analyze how the primary burden of proof on the prosecution (Sections 104–105 BSA) interacts with facts especially within the knowledge of the accused under Section 109 BSA (Section 106 IEA) in circumstantial evidence trials.',
  },
];

interface LegalGlossaryViewProps {
  onAnalyzeTermInStation: (prompt: string) => void;
}

export const LegalGlossaryView: React.FC<LegalGlossaryViewProps> = ({
  onAnalyzeTermInStation,
}) => {
  const { lang, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return LEGAL_GLOSSARY_ITEMS;
    return LEGAL_GLOSSARY_ITEMS.filter(
      (item) =>
        item.term.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.definitionUr.toLowerCase().includes(q) ||
        item.statutoryOrCaseAnchor.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const handleFocus = () => {
    setTimeout(() => {
      inputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
  };

  return (
    <div id="glossary" className="tab-content active max-w-[1440px] w-full mx-auto flex-1">
      <input
        ref={inputRef}
        type="text"
        id="glossarySearch"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={handleFocus}
        className="search-box"
        placeholder={t(
          'Search Latin maxims, legal terms, principles...',
          'Latin maxims aur qanooni istilaahaat talash karein...'
        )}
      />

      <div id="glossaryList" className="grid-container">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            data-keywords={item.keywords}
            className="card glossary-item flex flex-col justify-between"
          >
            <div>
              <div className="card-meta">
                <span>{item.category}</span>
                <span>{t('Legal Maxim / Term', 'Qanooni Istilaah')}</span>
              </div>
              <h4>{item.term}</h4>
              <p data-en={item.definition} data-ur={item.definitionUr}>
                {lang === 'ur' ? item.definitionUr : item.definition}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#2d3748] flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-[#94a3b8]">
                {item.statutoryOrCaseAnchor}
              </span>
              <button
                type="button"
                onClick={() => onAnalyzeTermInStation(item.presetPrompt)}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-[#f59e0b] hover:underline cursor-pointer shrink-0"
              >
                <span>{t('Analyze in Station', 'Station Mein Tajziya')}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
