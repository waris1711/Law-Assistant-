import React, { useState, useMemo, useRef } from 'react';
import { LegalBrief, LegalDomain } from '../types/legal';
import { useLanguage } from '../context/LanguageContext';
import { ArrowUpRight } from 'lucide-react';

interface PrecedentDigestViewProps {
  briefs: LegalBrief[];
  onSelectBrief: (briefId: string) => void;
}

const FEATURED_DIGEST_CARDS = [
  {
    id: 'featured-bail-187',
    tag: 'Precedent Digest • BNSS § 187',
    title: 'Bail & Default Bail Computation',
    enText:
      'Binding Ratio: Once the statutory investigation period (60/90 days) elapses without a chargesheet, an indefeasible right to default bail accrues and cannot be defeated by subsequent filings.',
    urText:
      'Faisle ki buniyad: Muqarrar waqt (60/90 din) mein chargesheet dakhil na hone par default bail ka haq fori laagu ho jata hai.',
    ratio:
      'Once the statutory period lapses, right accrues and cannot be defeated by subsequent chargesheet filing on the same day (Bikramjit Singh v. State of Punjab, (2020) 10 SCC 616; Rakesh Kumar Paul v. State of Assam, (2017) 15 SCC 67).',
    keywords: 'bail default bail section 187 bnss supreme court bikramjit singh rakesh kumar paul',
  },
  {
    id: 'featured-basic-structure',
    tag: 'Constitutional Law • 13-Judge Bench',
    title: 'Basic Structure Doctrine (Kesavananda Bharati)',
    enText:
      'Binding Ratio: Parliament possesses vast amending power under Article 368, but it lacks the constituent competence to abrogate or damage the essential framework of the Constitution.',
    urText:
      'Faisle ki buniyad: Parliman ko aaeen mein tarmeem ka ikhtiyar hai magar woh aaeen ke buniyadi dhaanche ko khatam nahi kar sakti.',
    ratio:
      'Judicial review, supremacy of the Constitution, rule of law, and separation of powers are integral facets of the Basic Structure and cannot be ousted by constitutional amendments.',
    keywords: 'basic structure doctrine judicial review kesavananda bharati article 368',
  },
  {
    id: 'featured-dk-basu',
    tag: 'Criminal Procedure • Guidelines',
    title: 'Police Interrogation & Arrest Safeguards (D.K. Basu)',
    enText:
      'Binding Ratio: Failure of police personnel to prepare an arrest memo or inform a relative of arrest constitutes contempt of court and departmental misconduct.',
    urText:
      'Faisle ki buniyad: Giraftari ke waqt memo na banana aur rishtedaron ko itteha na dena qanooni khilaf-warzi aur contempt hai.',
    ratio:
      'Failure of police officers to prepare arrest memos and notify family violates Article 21 and Section 36/48 BNSS (Sec 41B/50A CrPC), inviting departmental action and contempt.',
    keywords: 'police interrogation arrest safeguards dk basu memo relative article 21 contempt',
  },
];

export const PrecedentDigestView: React.FC<PrecedentDigestViewProps> = ({
  briefs,
  onSelectBrief,
}) => {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<'ALL' | LegalDomain>('ALL');
  const digestSearchRef = useRef<HTMLInputElement>(null);

  const flattenedAuthorities = useMemo(() => {
    const list: Array<{
      briefId: string;
      docketNumber: string;
      briefTitle: string;
      domain: LegalDomain;
      caseTitle: string;
      citation: string;
      courtAndBench: string;
      ratioDecidendi: string;
      obiterDicta: string;
      conflictOrDivergence?: string;
      factualApplication: string;
    }> = [];

    for (const b of briefs) {
      for (const auth of b.judicialPrecedents.authorities) {
        list.push({
          briefId: b.id,
          docketNumber: b.docketNumber,
          briefTitle: b.title,
          domain: b.domain,
          ...auth,
        });
      }
    }
    return list;
  }, [briefs]);

  const filteredFeatured = useMemo(() => {
    if (!searchQuery.trim()) return FEATURED_DIGEST_CARDS;
    const q = searchQuery.toLowerCase();
    return FEATURED_DIGEST_CARDS.filter(
      (c) =>
        c.tag.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.enText.toLowerCase().includes(q) ||
        c.urText.toLowerCase().includes(q) ||
        c.ratio.toLowerCase().includes(q) ||
        c.keywords.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredAuthorities = useMemo(() => {
    return flattenedAuthorities.filter((item) => {
      if (selectedDomain !== 'ALL' && item.domain !== selectedDomain) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.caseTitle.toLowerCase().includes(q) ||
        item.citation.toLowerCase().includes(q) ||
        item.ratioDecidendi.toLowerCase().includes(q) ||
        item.obiterDicta.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q) ||
        (item.conflictOrDivergence && item.conflictOrDivergence.toLowerCase().includes(q))
      );
    });
  }, [flattenedAuthorities, selectedDomain, searchQuery]);

  const handleFocus = () => {
    setTimeout(() => {
      digestSearchRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
  };

  return (
    <div id="ratioDigest" className="tab-content active max-w-[1440px] w-full mx-auto flex-1">
      <div className="search-container space-y-3">
        <input
          ref={digestSearchRef}
          type="text"
          id="ratioSearch"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleFocus}
          className="search-box"
          placeholder={t(
            'Search precedents, ratio decidendi, doctrines...',
            'Adalati nazeer, faisle ki buniyad talash karein...'
          )}
        />

        <div className="nav-tabs">
          {[
            {
              id: 'ALL',
              label: t(
                `All Precedents (${flattenedAuthorities.length + FEATURED_DIGEST_CARDS.length})`,
                `Tamam Nazaair (${flattenedAuthorities.length + FEATURED_DIGEST_CARDS.length})`
              ),
            },
            { id: 'Procedural & Custodial Law', label: 'Procedural & Custodial' },
            { id: 'Electronic & Documentary Evidence', label: 'Electronic Evidence' },
            { id: 'Criminal & Forensic Law', label: 'Criminal & Forensic' },
            { id: 'Constitutional & Writ Jurisdiction', label: 'Constitutional & Writ' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedDomain(tab.id as any)}
              className={`nav-tab-btn ${selectedDomain === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div id="ratioContainer" className="grid-container">
        {selectedDomain === 'ALL' &&
          filteredFeatured.map((card) => (
            <div key={card.id} data-keywords={card.keywords} className="card">
              <div className="card-meta">
                <span>{card.tag}</span>
                <span>{t('Binding Ratio', 'Faisle ka buniyadi qanooni asool')}</span>
              </div>
              <h4>{card.title}</h4>
              <p data-en={card.enText} data-ur={card.urText}>
                {lang === 'ur' ? card.urText : card.enText}
              </p>
              <div className="ratio-digest-box">{card.ratio}</div>
            </div>
          ))}

        {filteredAuthorities.map((auth, idx) => (
          <div
            key={`${auth.briefId}-${idx}`}
            data-keywords={`${auth.caseTitle} ${auth.citation} ${auth.domain}`.toLowerCase()}
            className="card flex flex-col justify-between"
          >
            <div>
              <div className="card-meta">
                <span>{auth.citation}</span>
                <span>{auth.courtAndBench}</span>
              </div>

              <h4>{auth.caseTitle}</h4>

              <div className="ratio-digest-box">
                <strong>{t('Binding Ratio:', 'Faisle ka buniyadi qanooni asool:')}</strong>{' '}
                {auth.ratioDecidendi}
              </div>

              <div className="ratio-digest-box opacity-85">
                <strong className="text-amber-300">
                  {t('Obiter Dicta (Non-Binding):', 'Zaimni Bayanaat (Obiter Dicta):')}
                </strong>{' '}
                {auth.obiterDicta}
              </div>

              {auth.conflictOrDivergence && (
                <div className="ratio-digest-box">
                  <strong className="text-emerald-400">
                    {t('Statutory Transition / Reference:', 'Qanooni Tabdeeli / Hawala:')}
                  </strong>{' '}
                  {auth.conflictOrDivergence}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#2d3748] flex items-center justify-between gap-2">
              <span className="text-[11px] opacity-75 truncate">{auth.domain}</span>
              <button
                type="button"
                onClick={() => onSelectBrief(auth.briefId)}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#f59e0b] hover:underline cursor-pointer shrink-0"
              >
                <span>
                  {t(`Open Docket ${auth.docketNumber}`, `Docket Kholein ${auth.docketNumber}`)}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
