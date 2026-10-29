import React, { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowUpRight } from 'lucide-react';

export interface VerifiedCaseEntry {
  id: string;
  title: string;
  citation: string;
  court: string;
  badgeText: string;
  badgeType: 'good' | 'distinguished' | 'overruled';
  statute: string;
  shortIssue: string;
  shortIssueUr: string;
  shortRatio: string;
  shortRatioUr: string;
  facts: string;
  factsUr: string;
  fullIssue: string;
  fullIssueUr: string;
  fullRatio: string;
  fullRatioUr: string;
  paragraphs: string;
  statusDetail: string;
  tags: string;
}

export const VERIFIED_CASES: VerifiedCaseEntry[] = [
  {
    id: 'case1',
    title: 'Arnesh Kumar v. State of Bihar',
    citation: '(2014) 8 SCC 273',
    court: 'Supreme Court of India (2-Judge)',
    badgeText: 'Good Law (Verified)',
    badgeType: 'good',
    statute: 'Section 41 & 41A CrPC [Sec 35 BNSS], Sec 498A IPC [Sec 85 BNS]',
    shortIssue: 'Indiscriminate arrests under Section 41 CrPC / Section 35 BNSS.',
    shortIssueUr: 'Section 41 CrPC / Section 35 BNSS ke tehat bina wajah fori giraftari par rok.',
    shortRatio:
      'Mandatory Notice under Section 41A for offences up to 7 years imprisonment. Mechanical arrest prohibited.',
    shortRatioUr:
      '7 saal tak ki saza wale jurm mein Section 41A (Sec 35(3) BNSS) ka notice dena lazmi hai; meikani giraftari mana hai.',
    facts:
      'Wife alleged harassment over dowry. Accused sought pre-arrest protection against indiscriminate arrest under Section 498A IPC.',
    factsUr:
      'Section 498A IPC ki FIR darj hone par bina tehqeeqat ke fori aur meikani giraftari ke khilaf Supreme Court mein darkhwast.',
    fullIssue:
      'Whether police officers can indiscriminately arrest the accused without fulfilling objective statutory necessity under Section 41 CrPC (now Section 35 BNSS).',
    fullIssueUr:
      'Kya police Section 41 CrPC (ab Section 35 BNSS) ki maddi sharaait poori kiye baghair har FIR mein mulzim ko fori giraftar kar sakti hai?',
    fullRatio:
      'Arrest is not mandatory for offences punishable with imprisonment up to 7 years. Police must issue a notice of appearance (Sec 41A CrPC / Sec 35(3) BNSS) within 14 days and record objective reasons in writing before arresting. Magistrates must not authorize detention mechanically.',
    fullRatioUr:
      '7 saal tak ki saza wale jurm mein giraftari lazmi nahi hai. Police ko 14 din ke andar Section 41A CrPC (Sec 35(3) BNSS) ka notice dena hoga aur giraftari se pehle tehriri wajoohat likhni hongi. Khilaf-warzi par Contempt of Court aur departmental karwayi hogi.',
    paragraphs: 'Paragraphs 7, 8, 9, 11',
    statusDetail: 'Good Law (Affirmed in Satender Kumar Antil 2022)',
    tags: 'arrest guidelines safeguards 41 41a crpc 35 bnss arnesh kumar notice supreme court 498a 7 years',
  },
  {
    id: 'case2',
    title: 'Justice K.S. Puttaswamy (Retd.) v. Union of India',
    citation: '(2017) 10 SCC 1',
    court: 'Supreme Court of India (9-Judge Constitution Bench)',
    badgeText: 'Good Law (Landmark)',
    badgeType: 'good',
    statute: 'Article 21, Part III of the Constitution',
    shortIssue: 'Fundamental constitutional standing of the Right to Privacy under Article 21.',
    shortIssueUr: 'Article 21 ke tehat Right to Privacy (Niji Zindagi ki Razdari) ka aaeeni darja.',
    shortRatio:
      'Privacy is an inalienable fundamental right. State encroachments must clear the strict 3-fold proportionality test.',
    shortRatioUr:
      'Privacy ek buniyadi haq (Fundamental Right) hai; riyasati pabandi ko 3-shartiya Proportionality Test poora karna hoga.',
    facts:
      'Constitutional challenge to biometric identification on the ground that it unlawfully encroached on individual informational and bodily autonomy.',
    factsUr:
      'Biometric pehchan aur digital data ke nizam ko shehriyon ki zaati aur maloomati privacy ke buniyadi haq ke khilaf challenge kiya gaya.',
    fullIssue:
      'Whether the Right to Privacy is guaranteed as an independent Fundamental Right under Part III of the Constitution.',
    fullIssueUr:
      'Kya Right to Privacy Aaeen-e-Hind ke Part III aur Article 21 ke tehat ek mahfooz Buniyadi Haq (Fundamental Right) hai?',
    fullRatio:
      'Right to Privacy is an inalienable fundamental right flowing directly from Article 21 and the freedoms in Part III. Any state interference must clear the strict 3-fold proportionality standard: Legality, Legitimate State Aim, and Proportionality.',
    fullRatioUr:
      'Right to Privacy Article 21 (Zindagi aur Zaati Aazadi ke Haq) ka atoot hissa hai. Kisi bhi sarkari mudakhilat ke liye 3 sharaait lazmi hain: (1) Wajood-e-Qanoon (Legality), (2) Jaiz Riyasati Maqsad, aur (3) Munasib Tanasub (Proportionality).',
    paragraphs: 'Paragraphs 297, 310, 314',
    statusDetail: 'Good Law (Landmark 9-Judge Precedent)',
    tags: 'privacy article 21 puttaswamy aadhaar surveillance autonomy fundamental right data',
  },
  {
    id: 'case3',
    title: 'Bikramjit Singh v. State of Punjab',
    citation: '(2020) 10 SCC 616',
    court: 'Supreme Court of India (3-Judge Bench)',
    badgeText: 'Good Law (Verified)',
    badgeType: 'good',
    statute: 'Section 167(2) CrPC [Sec 187 BNSS], Section 43D UAPA',
    shortIssue: 'Default bail as an indefeasible fundamental right under Article 21 & Sec 167(2) CrPC.',
    shortIssueUr: 'Article 21 aur Sec 167(2) CrPC (Sec 187 BNSS) ke tehat Default Bail ka buniyadi haq.',
    shortRatio:
      'Accrued right to default bail cannot be frustrated by state filings subsequent to statutory timeline expiry.',
    shortRatioUr:
      'Muqarrar muddat (60/90 din) guzarne ke baad milne wala Default Bail ka haq baad mein dakhil ki gayi arzi se khatam nahi kiya ja sakta.',
    facts:
      'Plea for statutory default bail when chargesheet was not submitted within the statutory limitation period.',
    factsUr:
      'Qanooni muddat ke andar chargesheet pesh na hone par mulzim ne Default Bail ki darkhwast dakhil ki.',
    fullIssue:
      'Whether the statutory right to default bail can be extinguished by subsequent supplementary chargesheets or late applications by the state.',
    fullIssueUr:
      'Kya Section 167(2) CrPC (Sec 187(3) BNSS) ke tehat haasil shuda Default Bail ka haq baad mein chargesheet ya extension arzi dakhil karke chheena ja sakta hai?',
    fullRatio:
      'Default bail under Section 167(2) is not merely a statutory privilege; it is an indefeasible fundamental right under Article 21. Once the maximum statutory remand window expires without a chargesheet, the right accrues immediately and cannot be defeated.',
    fullRatioUr:
      'Default bail sirf qanooni riayat nahi balki Article 21 se nikalne wala Buniyadi Haq hai. Jaise hi 60 ya 90 din bina chargesheet ke mukammal hon aur mulzim bail maange, ye haq pakka ho jata hai.',
    paragraphs: 'Paragraphs 23, 24, 25',
    statusDetail: 'Good Law (Followed in M. Ravindran 2020)',
    tags: 'bail default bail 167 crpc 187 bnss bikramjit singh chargesheet uapa',
  },
  {
    id: 'case4',
    title: 'ADM Jabalpur v. Shivkant Shukla',
    citation: 'AIR 1976 SC 1207',
    court: 'Supreme Court of India (5-Judge Bench)',
    badgeText: 'Overruled (Bad Law)',
    badgeType: 'overruled',
    statute: 'Article 21, Article 359 (Emergency Provisions)',
    shortIssue: 'Suspension of fundamental rights & Habeas Corpus in emergency.',
    shortIssueUr: 'Emergency ke dauran Buniyadi Haqooq aur Habeas Corpus writ ki muattali.',
    shortRatio:
      'Held habeas corpus unavailable in Emergency. Expressly overruled by 9-Judge Bench in Puttaswamy (2017).',
    shortRatioUr:
      'Emergency mein Habeas Corpus writ ko na-qabil-e-samaat qarar diya tha. Puttaswamy (2017) ke 9-Judge Bench ne is faisle ko mukammal Overrule kar diya.',
    facts:
      'Detention of individuals during the Emergency without recourse to judicial review under Article 226.',
    factsUr:
      '1975 ki Emergency ke dauran siyasi qaidiyon ki nazar-bandi jise High Court mein Habeas Corpus ke zariye challenge kiya gaya.',
    fullIssue:
      'Whether a citizen has locus standi to move a High Court for Habeas Corpus during an Emergency when enforcement of Article 21 is suspended.',
    fullIssueUr:
      'Kya Emergency mein Article 21 muattal hone par koi shehri gair-qanooni hirasat ke khilaf High Court mein Habeas Corpus writ dakhil kar sakta hai?',
    fullRatio:
      'Majority held that upon presidential suspension of Part III enforcement, no person had legal standing to seek a writ of habeas corpus challenging executive detention.',
    fullRatioUr:
      'Aksariyati faisle ne kaha tha ke Emergency mein Article 21 muattal hone par koi shakhs Habeas Corpus nahi maang sakta (Justice H.R. Khanna ne tarihi ikhtilafi faisla likha). 44th Amendment aur Puttaswamy (2017) ne is faisle ko baatil (Overruled) qarar diya.',
    paragraphs: 'Paragraph 573',
    statusDetail: 'Overruled (Expressly overruled in K.S. Puttaswamy 2017)',
    tags: 'overruled bad law emergency habeas corpus adm jabalpur shivkant shukla article 359',
  },
  {
    id: 'case5',
    title: 'Satender Kumar Antil v. CBI',
    citation: '(2022) 10 SCC 51',
    court: 'Supreme Court of India (2-Judge Bench)',
    badgeText: 'Good Law (Active Standard)',
    badgeType: 'good',
    statute: 'Section 41, 41A, 88, 170, 437, 439 CrPC [BNSS Sec 35, 91, 190, 480, 483]',
    shortIssue:
      'Whether investigating agencies and trial courts are bound to follow strict categories for granting bail without mechanical arrest.',
    shortIssueUr:
      'Kya tafteeshi agencies aur adalatein bina meikani giraftari ke zamanat (bail) dene ke liye 4 categories (A, B, C, D) ki paband hain?',
    shortRatio:
      'Laid down nationwide guidelines categorizing offences (A, B, C, D) for bail. Non-compliance with Section 41 and 41A CrPC [Sec 35 BNSS] entitles the accused to immediate bail.',
    shortRatioUr:
      'Jurm ko 4 categories (A, B, C, D) mein baant kar nationwide bail guidelines jaari ki gayin. Section 41/41A CrPC (Sec 35 BNSS) ki khilaf-warzi par mulzim fori bail ka haqdar hai.',
    facts:
      'Guidelines sought to streamline uniform bail processing across trial courts to decongest overcrowded prisons and curb mechanical remand.',
    factsUr:
      'Trial courts mein bina giraftari chargesheet pesh hone par meikani remand rokne aur bail ke yaksaan asool tay karne ke liye Supreme Court ke rehnuma hidayat.',
    fullIssue:
      'Whether investigating agencies and trial courts are bound to follow strict categories for granting bail without mechanical arrest.',
    fullIssueUr:
      'Kya tafteeshi agencies aur trial courts Section 35 BNSS (41/41A CrPC) aur Section 190 BNSS (170 CrPC) mein meikani hirasat se bachne ke liye strict categories ki paband hain?',
    fullRatio:
      'Laid down comprehensive nationwide guidelines categorizing offences (A, B, C, D) for bail. Non-compliance with Section 41 and 41A CrPC [Section 35 BNSS] entitles the accused to immediate grant of bail, and when an accused appears pursuant to summons on a chargesheet where he was not arrested during investigation, mechanical remand to custody is prohibited.',
    fullRatioUr:
      'Supreme Court ne tamam jurm ko 4 categories (A, B, C, D) mein taqseem kiya. Agar Section 41 aur 41A CrPC (ab Section 35 BNSS) ki sharaait ki khilaf-warzi hui ho to mulzim fori zamanat ka haqdar hai.',
    paragraphs: 'Paragraphs 65 to 73, 100.2 to 100.11',
    statusDetail: 'Good Law (Active Mandatory Standard)',
    tags: 'satender kumar antil bail categories arrest 41a crpc 35 bnss guidelines',
  },
  {
    id: 'case6',
    title: 'Navtej Singh Johar v. Union of India',
    citation: '(2018) 10 SCC 1',
    court: 'Supreme Court of India (5-Judge Constitution Bench)',
    badgeText: 'Good Law (Landmark)',
    badgeType: 'good',
    statute: 'Section 377 IPC [Decriminalized in part], Articles 14, 15, 19, 21',
    shortIssue:
      'Whether Section 377 IPC violates constitutional guarantees of equality, personal dignity, and non-discrimination.',
    shortIssueUr:
      'Kya baaligh afraad ke darmiyan razamandi ke niji talluqat ko jurm qarar dena Articles 14, 15, 19 aur 21 ki khilaf-warzi hai?',
    shortRatio:
      'Consensual private acts between adults decriminalized. Constitutional morality prevails over social morality.',
    shortRatioUr:
      'Baaligh afraad ki niji zindagi aur izzat-e-nafs Article 21 mein mahfooz hai; Constitutional Morality samaji rasm-o-riwaj par faaiq hai.',
    facts:
      'Constitutional challenge to Section 377 IPC criminalizing consensual homosexual conduct between adults in private.',
    factsUr:
      'Section 377 IPC ki aaeeni haisiyat ko Articles 14, 15, 19 aur 21 (Right to Dignity & Privacy) ke tehat 5-Judge Constitution Bench ke samne challenge kiya gaya.',
    fullIssue:
      'Whether Section 377 IPC violates constitutional guarantees of equality, personal dignity, privacy, and non-discrimination.',
    fullIssueUr:
      'Kya Section 377 IPC aaeeni barabari (Art. 14), gair-imtiyazi salook (Art. 15), izhar-e-zaat (Art. 19) aur zaati waqar (Art. 21) ke khilaf hai?',
    fullRatio:
      'Section 377 IPC, in so far as it criminalizes consensual sexual acts between consenting adults in private, is unconstitutional, manifestly arbitrary, and violative of Articles 14, 15, 19, and 21. Constitutional morality must always prevail over majoritarian or social morality (Overruled Suresh Kumar Koushal 2013).',
    fullRatioUr:
      'Do baaligh afraad ke darmiyan niji razamandi ke amal ko jurm qarar dena Articles 14, 15, 19 aur 21 ke khilaf hai. Adalaton ko faisla karte waqt Social Morality ke bajaye Constitutional Morality (Aaeeni Ikhlaqiyat) ko tarjeeh deni hogi.',
    paragraphs: 'Paragraphs 267, 268',
    statusDetail: 'Good Law (Landmark Decriminalization)',
    tags: '377 ipc navtej johar constitutional morality equality dignity basic structure',
  },
  {
    id: 'case-kesavananda',
    title: 'Kesavananda Bharati v. State of Kerala',
    citation: '(1973) 4 SCC 225',
    court: 'Supreme Court (13-Judge Bench)',
    badgeText: 'Good Law (Landmark)',
    badgeType: 'good',
    statute: 'Article 368, Preamble & Part III of the Constitution',
    shortIssue: 'Scope of Parliament’s constituent power to amend the Constitution under Art. 368.',
    shortIssueUr: 'Article 368 ke tehat Parliman ke Aaeen mein tarmeem karne ke ikhtiyar ki had.',
    shortRatio:
      'Parliament can amend any part of the Constitution but cannot alter or destroy its Basic Structure.',
    shortRatioUr:
      'Parliman Aaeen ke kisi bhi hisse mein tarmeem kar sakti hai magar Aaeen ke Buniyadi Dhaanche (Basic Structure) ko tabdil ya khatam nahi kar sakti.',
    facts:
      'Challenge to the 24th, 25th, and 29th Constitutional Amendment Acts restricting property and fundamental rights.',
    factsUr:
      '24vein, 25vein aur 29vein Aaeeni Tarmeem ko Supreme Court ke 13-Judge Bench ke samne challenge kiya gaya.',
    fullIssue:
      'Whether Parliament’s power to amend the Constitution under Article 368 is unlimited or subject to implied substantive limitations.',
    fullIssueUr:
      'Kya Article 368 ke tehat Parliman ka tarmeemi ikhtiyar la-mehdood hai ya Basic Structure ke tabay hai?',
    fullRatio:
      'While Parliament possesses wide constituent power under Article 368 to amend every provision of the Constitution including Part III, such power does not extend to abrogating or destroying the Basic Structure or essential features of the Constitution (such as Supremacy of Constitution, Judicial Review, Secularism, Federalism, and Separation of Powers).',
    fullRatioUr:
      'Parliman ko Article 368 ke tehat wasee tarmeemi ikhtiyar haasil hai, lekin woh Aaeen ke Buniyadi Dhaanche (Basic Structure — jaise Judicial Review, Secularism, Rule of Law, aur Separation of Powers) ko khatam nahi kar sakti.',
    paragraphs: 'Paragraphs 292, 302, 1426',
    statusDetail: 'Good Law (Reaffirmed in Minerva Mills 1980 & I.R. Coelho 2007)',
    tags: 'basic structure doctrine article 368 kesavananda bharati judicial review',
  },
];

interface CaseLawFinderViewProps {
  onAnalyzeCaseInStation: (prompt: string) => void;
}

export const CaseLawFinderView: React.FC<CaseLawFinderViewProps> = ({
  onAnalyzeCaseInStation,
}) => {
  const { lang, t, isBookmarked, toggleBookmark, openFeedbackModal, triggerHaptic } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCaseModal, setActiveCaseModal] = useState<VerifiedCaseEntry | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return VERIFIED_CASES;
    return VERIFIED_CASES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.citation.toLowerCase().includes(q) ||
        c.statute.toLowerCase().includes(q) ||
        c.shortIssue.toLowerCase().includes(q) ||
        c.shortIssueUr.toLowerCase().includes(q) ||
        c.shortRatio.toLowerCase().includes(q) ||
        c.shortRatioUr.toLowerCase().includes(q) ||
        c.tags.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const fillCaseSearch = (val: string) => {
    triggerHaptic();
    setSearchQuery((prev) => (prev === val ? '' : val));
  };

  const handleFocus = () => {
    setTimeout(() => {
      inputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
  };

  return (
    <div id="caseFinder" className="tab-content active max-w-[1440px] w-full mx-auto flex-1">
      <input
        ref={inputRef}
        type="text"
        id="caseSearchInput"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={handleFocus}
        className="search-box"
        placeholder={t(
          'Search by Act, Section, Case Name, Citation or Legal Issue...',
          'Act, Section, Case ka naam ya issue talash karein...'
        )}
      />

      <div className="chip-container">
        <span
          onClick={() => {
            triggerHaptic();
            setSearchQuery('');
          }}
          className={`chip ${searchQuery === '' ? 'active' : ''}`}
        >
          {t('All Cases', 'Tamam Cases')}
        </span>
        {[
          { label: t('Arrest Safeguards', 'Giraftari ke Asool'), value: 'Arrest' },
          { label: 'Privacy (Art 21)', value: 'Privacy' },
          { label: 'Default Bail', value: 'Default Bail' },
          { label: 'Basic Structure', value: 'Basic Structure' },
          { label: t('Overruled Precedents', 'Overruled Faisle'), value: 'Overruled' },
        ].map((chip) => (
          <span
            key={chip.value}
            onClick={() => fillCaseSearch(chip.value)}
            className={`chip ${searchQuery === chip.value ? 'active' : ''}`}
          >
            {chip.label}
          </span>
        ))}
      </div>

      <div id="casesList" className="grid-container">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            data-tags={c.tags}
            onClick={() => {
              triggerHaptic();
              setActiveCaseModal(c);
            }}
            className="card case-card"
          >
            <div className="card-meta pr-6">
              <span>
                {c.citation} • {c.court.split('(')[0].trim()}
              </span>
              <span
                className={`badge-status ${
                  c.badgeType === 'good'
                    ? 'badge-good'
                    : c.badgeType === 'distinguished'
                    ? 'badge-distinguished'
                    : 'badge-overruled'
                }`}
              >
                {c.badgeText}
              </span>
            </div>
            <h4>{c.title}</h4>
            <p>
              <strong>{t('Issue:', 'Qanooni Sawal (Issue):')}</strong>{' '}
              {lang === 'ur' ? c.shortIssueUr : c.shortIssue}
            </p>
            <p className="mt-1">
              <strong>{t('Ratio:', 'Faisle ka Asool (Ratio):')}</strong>{' '}
              {lang === 'ur' ? c.shortRatioUr : c.shortRatio}
            </p>
            <button
              type="button"
              title={t('Bookmark case precedent', 'Case nazeer bookmark karein')}
              className={`card-bookmark-btn ${isBookmarked('case', c.id) ? 'saved' : ''}`}
              onClick={(e) => toggleBookmark(e, 'case', c.id, c.title, c.fullRatio)}
            >
              🔖
            </button>
          </div>
        ))}
      </div>

      {/* Interactive Case Law Detail Modal */}
      <div
        className={`modal-overlay ${activeCaseModal ? 'open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setActiveCaseModal(null);
          }
        }}
      >
        {activeCaseModal && (
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{activeCaseModal.title}</div>
                <div className="text-xs font-mono text-[#94a3b8] mt-1">
                  <span className="text-[#f59e0b] font-bold">Citation:</span>{' '}
                  {activeCaseModal.citation} | {activeCaseModal.court}
                </div>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setActiveCaseModal(null)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <h5>{t('Applicable Statute & Sections', 'Laagu Qanoon aur Dafaat')}</h5>
              <p>{activeCaseModal.statute}</p>

              <h5>{t('Factual Matrix', 'Muqaddame ke Waqiaat (Facts)')}</h5>
              <p>{lang === 'ur' ? activeCaseModal.factsUr : activeCaseModal.facts}</p>

              <h5>{t('Core Legal Issue', 'Buniyadi Qanooni Sawal (Issue)')}</h5>
              <p>{lang === 'ur' ? activeCaseModal.fullIssueUr : activeCaseModal.fullIssue}</p>

              <h5>
                {t(
                  'Ratio Decidendi (Binding Legal Principle)',
                  'Faisle ka Buniyadi Qanooni Asool (Ratio Decidendi)'
                )}
              </h5>
              <p>
                <strong>
                  {lang === 'ur' ? activeCaseModal.fullRatioUr : activeCaseModal.fullRatio}
                </strong>
              </p>

              <h5>{t('Verified Paragraphs & Judicial Standing', 'Tasdeeq Shuda Paragraphs aur Status')}</h5>
              <p>
                Paragraphs: {activeCaseModal.paragraphs}
                <br />
                Status: <strong>{activeCaseModal.statusDetail}</strong>
              </p>

              <div className="mt-4 pt-3 border-t border-[#2b313c] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      activeCaseModal.title + ' ' + activeCaseModal.citation + ' site:sci.gov.in'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dossier-action-btn"
                  >
                    View on sci.gov.in Registry ➔
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const subj = `${activeCaseModal.title} (${activeCaseModal.citation})`;
                      setActiveCaseModal(null);
                      openFeedbackModal(subj);
                    }}
                    className="dossier-action-btn"
                  >
                    ⚠️ {t('Report Citation', 'Citation Report Karein')}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const prompt = `Analyze the ratio decidendi, statutory transition under BNS/BNSS/BSA, and courtroom application of ${activeCaseModal.title}, ${activeCaseModal.citation} (${activeCaseModal.statute}).`;
                    setActiveCaseModal(null);
                    onAnalyzeCaseInStation(prompt);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#f59e0b] text-black font-semibold text-xs cursor-pointer"
                >
                  <span>{t('Open in AI Counsel Station', 'AI Counsel Station Mein Kholein')}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
