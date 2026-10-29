import React, { useState } from 'react';
import { LegalBrief } from '../types/legal';
import { Copy, Check, Printer, Scale, BookOpen, GitCompare, Clock, ShieldAlert } from 'lucide-react';

interface BriefViewProps {
  brief: LegalBrief;
  onInspectMapping?: (searchQuery: string) => void;
}

export const BriefView: React.FC<BriefViewProps> = ({ brief, onInspectMapping }) => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'a' | 'b' | 'c' | 'd' | 'e'>('all');

  const formatBriefAsCourtMemorandum = (b: LegalBrief): string => {
    const lines: string[] = [
      `LEXINTEL CLINICAL LEGAL MEMORANDUM`,
      `DOCKET REF: ${b.docketNumber} · DATE: ${b.createdAt}`,
      `DOMAIN: ${b.domain} · POSTURE: ${b.posture}`,
      `MATTER: ${b.title}`,
      `================================================================================`,
      ``,
      `FACTUAL MATRIX & EVIDENTIARY RECORD:`,
      b.factualMatrixSummary,
      ``,
      `(a) CORE LEGAL ISSUE`,
      `--------------------------------------------------------------------------------`,
      `Primary Proposition: ${b.coreLegalIssue.primaryProposition}`,
      ``,
      `Questions of Law:`,
      ...b.coreLegalIssue.questionsOfLaw.map((q) => `  ${q}`),
      ``,
      `Burden of Proof & Standard: ${b.coreLegalIssue.burdenOfProofAndStandard}`,
      `Clinical Evidentiary Synthesis: ${b.coreLegalIssue.clinicalEvidentiarySynthesis}`,
      ``,
      `(b) GOVERNING STATUTORY FRAMEWORK & REGIME CROSS-MAPPING`,
      `--------------------------------------------------------------------------------`,
      b.statutoryFramework.overview,
      ``,
      ...b.statutoryFramework.provisions.map(
        (p, idx) =>
          `${idx + 1}. ${p.actName} — ${p.sectionCitation} [Cross-Mapped: ${p.correspondingRegimeCitation}]\n   Mandate: ${p.statutoryMandate}\n   Regime Delta: ${p.proceduralOrThresholdAlteration}\n   Cognizance / Bail / Effect: ${p.cognizanceAndBailStatus}`
      ),
      ``,
      `Regime Transition Note: ${b.statutoryFramework.regimeTransitionNotes}`,
      ``,
      `(c) JUDICIAL PRECEDENTS & RATIO DECIDENDI`,
      `--------------------------------------------------------------------------------`,
      b.judicialPrecedents.settledPositionSummary,
      ``,
      ...b.judicialPrecedents.authorities.map(
        (a, idx) =>
          `${idx + 1}. ${a.caseTitle} — ${a.citation} (${a.courtAndBench})\n   RATIO DECIDENDI: ${a.ratioDecidendi}\n   OBITER DICTA: ${a.obiterDicta}${
            a.conflictOrDivergence ? `\n   DIVERGENCE / STATUTORY SHIFT: ${a.conflictOrDivergence}` : ''
          }\n   APPLICATION TO FACTS: ${a.factualApplication}`
      ),
      ``,
      `High Court Conflicts / Unsettled Law: ${b.judicialPrecedents.highCourtConflicts}`,
      ``,
      `(d) CHRONOLOGICAL PROCEDURAL ROADMAP`,
      `--------------------------------------------------------------------------------`,
      `Jurisdiction: ${b.proceduralRoadmap.jurisdictionalBasis}`,
      `Limitation Computation: ${b.proceduralRoadmap.limitationComputation}`,
      ``,
      ...b.proceduralRoadmap.steps.map(
        (s) =>
          `Step ${s.stepNumber}: ${s.stageTitle}\n   Forum: ${s.forumAndJurisdiction}\n   Provision: ${s.governingProvision}\n   Limitation / Timeline: ${s.limitationOrTimeline}\n   Remedy & Prayer: ${s.remedyAndPrayer}\n   Evidentiary Prerequisite: ${s.evidentiaryPrerequisite}`
      ),
      ``,
      `(e) COUNTER-ARGUMENTS & STRATEGIC VULNERABILITIES`,
      `--------------------------------------------------------------------------------`,
      ...b.strategicVulnerabilities.map(
        (v, idx) =>
          `${idx + 1}. ${v.vulnerabilityTitle} [Exposure: ${v.riskexposure}]\n   Opposing Contention: ${v.opposingContention}\n   Evidentiary / Forensic Gap: ${v.evidentiaryOrForensicGap}\n   Rebuttal Strategy & Authority: ${v.rebuttalStrategyAndAuthority}`
      ),
    ];
    return lines.join('\n');
  };

  const handleCopyMemorandum = async () => {
    try {
      await navigator.clipboard.writeText(formatBriefAsCourtMemorandum(brief));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const showSection = (sec: 'a' | 'b' | 'c' | 'd' | 'e') =>
    activeSection === 'all' || activeSection === sec;

  return (
    <div className="dossier-brief-container space-y-6 text-[#f1f5f9]">
      {/* Dossier Header Sheet */}
      <section className="dossier-dark-sheet bg-[#161a22] border border-[#2d343f] rounded-xl p-6 lg:p-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2d343f]">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#cbd5e1] font-mono tabular-nums">
            <span className="font-bold text-[#f59e0b]">{brief.docketNumber}</span>
            <span aria-hidden="true" className="text-[#64748b]">·</span>
            <span className="text-[#94a3b8]">Filed {brief.createdAt}</span>
            <span aria-hidden="true" className="text-[#64748b]">·</span>
            <span className="font-sans font-semibold text-[#38bdf8]">{brief.domain}</span>
            <span aria-hidden="true" className="text-[#64748b]">·</span>
            <span className="font-sans text-[#f59e0b] font-semibold">{brief.posture}</span>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              type="button"
              onClick={handleCopyMemorandum}
              className="dossier-action-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#f59e0b] bg-[#12151b] border border-[#2d343f] hover:border-[#f59e0b] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Memorandum' : 'Copy Memorandum'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="dossier-action-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#38bdf8] bg-[#12151b] border border-[#2d343f] hover:border-[#38bdf8] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Brief
            </button>
          </div>
        </div>

        <h1 className="mt-5 text-xl lg:text-2xl font-serif font-bold text-[#f1f5f9] leading-snug">
          {brief.title}
        </h1>

        <div className="mt-5 pt-5 border-t border-[#2d343f]">
          <div className="text-xs font-mono uppercase tracking-wider text-[#f59e0b] font-bold mb-2">
            Operative Factual Matrix &amp; Evidentiary Record
          </div>
          <p className="text-sm text-[#cbd5e1] leading-relaxed bg-[#12151b] border border-[#2d343f] rounded-lg p-4">
            {brief.factualMatrixSummary}
          </p>
        </div>

        {/* Interactive Scaffolding Filter Bar */}
        <div className="mt-6 pt-4 border-t border-[#2d343f] flex flex-wrap items-center justify-between gap-4 no-print">
          <span className="text-xs text-[#94a3b8] font-semibold uppercase tracking-wider font-mono">
            Strategic Legal Scaffolding View:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#12151b] border border-[#2d343f] rounded-lg">
            {[
              { id: 'all', label: 'Complete Brief (a–e)' },
              { id: 'a', label: '(a) Core Issue' },
              { id: 'b', label: '(b) Statutory Framework' },
              { id: 'c', label: '(c) Precedents & Ratio' },
              { id: 'd', label: '(d) Procedural Roadmap' },
              { id: 'e', label: '(e) Vulnerabilities' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSection === tab.id
                    ? 'bg-[#f59e0b] text-[#0b0c0e] font-bold border border-[#f59e0b]'
                    : 'bg-[#161a22] text-[#cbd5e1] border border-[#2d343f] hover:border-[#f59e0b] hover:text-[#f59e0b]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* (a) CORE LEGAL ISSUE */}
      {showSection('a') && (
        <section className="dossier-dark-sheet bg-[#161a22] border border-[#2d343f] rounded-xl p-6 lg:p-8 shadow-lg">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#2d343f]">
            <div>
              <span className="text-xs font-mono text-[#38bdf8] font-semibold">
                SECTION (a) · FRAMING OF ISSUES &amp; EVIDENTIARY THRESHOLD
              </span>
              <h2 className="text-lg lg:text-xl font-serif font-bold text-[#f1f5f9] mt-0.5">
                (a) Core Legal Issue
              </h2>
            </div>
            <Scale className="w-5 h-5 text-[#f59e0b] shrink-0" />
          </div>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#f59e0b] font-bold mb-2">
                Primary Legal Proposition
              </h3>
              <p className="text-sm lg:text-base font-medium text-[#f1f5f9] leading-relaxed bg-[#12151b] border border-[#2d343f] rounded-lg p-4">
                {brief.coreLegalIssue.primaryProposition}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#38bdf8] font-bold mb-2.5">
                Questions of Law for Determination
              </h3>
              <div className="divide-y divide-[#2d343f] border border-[#2d343f] rounded-lg overflow-hidden bg-[#12151b]">
                {brief.coreLegalIssue.questionsOfLaw.map((q, i) => (
                  <div key={i} className="p-4 text-sm text-[#cbd5e1] leading-relaxed bg-[#12151b]">
                    {q}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
              <div className="border border-[#2d343f] rounded-lg p-4 bg-[#12151b]">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#f59e0b] font-bold mb-2">
                  Statutory Burden of Proof &amp; Standard
                </h3>
                <p className="text-sm text-[#cbd5e1] leading-relaxed">
                  {brief.coreLegalIssue.burdenOfProofAndStandard}
                </p>
              </div>
              <div className="border border-[#2d343f] rounded-lg p-4 bg-[#12151b]">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#38bdf8] font-bold mb-2">
                  Clinical &amp; Forensic Evidentiary Synthesis
                </h3>
                <p className="text-sm text-[#cbd5e1] leading-relaxed">
                  {brief.coreLegalIssue.clinicalEvidentiarySynthesis}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* (b) GOVERNING STATUTORY FRAMEWORK */}
      {showSection('b') && (
        <section className="dossier-dark-sheet bg-[#161a22] border border-[#2d343f] rounded-xl p-6 lg:p-8 shadow-lg">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#2d343f]">
            <div>
              <span className="text-xs font-mono text-[#38bdf8] font-semibold">
                SECTION (b) · BARE ACT CITATIONS &amp; IPC/CrPC/IEA ↔ BNS/BNSS/BSA CROSS-MAPPING
              </span>
              <h2 className="text-lg lg:text-xl font-serif font-bold text-[#f1f5f9] mt-0.5">
                (b) Governing Statutory Framework
              </h2>
            </div>
            <GitCompare className="w-5 h-5 text-[#f59e0b] shrink-0" />
          </div>

          <p className="mt-4 text-sm text-[#cbd5e1] leading-relaxed">
            {brief.statutoryFramework.overview}
          </p>

          <div className="mt-6 overflow-x-auto border border-[#2d343f] rounded-lg bg-[#12151b]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#161a22] border-b border-[#2d343f] text-xs font-mono text-[#f59e0b]">
                  <th className="py-3 px-4 font-bold">Primary Provision &amp; Bare Act</th>
                  <th className="py-3 px-4 font-bold">Regime Cross-Map</th>
                  <th className="py-3 px-4 font-bold">Statutory Mandate</th>
                  <th className="py-3 px-4 font-bold">Procedural / Threshold Alteration</th>
                  <th className="py-3 px-4 font-bold">Cognizance, Bail &amp; Effect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d343f] text-sm bg-[#12151b]">
                {brief.statutoryFramework.provisions.map((prov, idx) => (
                  <tr key={idx} className="hover:bg-[#161a22] transition-colors align-top">
                    <td className="py-4 px-4 min-w-[200px]">
                      <div className="font-mono font-bold text-[#f1f5f9] tabular-nums">
                        {prov.sectionCitation}
                      </div>
                      <div className="text-xs text-[#94a3b8] mt-1">{prov.actName}</div>
                      {onInspectMapping && (
                        <button
                          type="button"
                          onClick={() => onInspectMapping(prov.sectionCitation)}
                          className="mt-2 text-xs font-semibold text-[#38bdf8] hover:text-[#f59e0b] hover:underline cursor-pointer no-print"
                        >
                          Inspect in Cross-Mapper →
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-4 min-w-[180px] font-mono text-xs text-[#f59e0b] font-semibold tabular-nums">
                      {prov.correspondingRegimeCitation}
                    </td>
                    <td className="py-4 px-4 min-w-[240px] text-[#cbd5e1] leading-relaxed">
                      {prov.statutoryMandate}
                    </td>
                    <td className="py-4 px-4 min-w-[260px] text-[#f1f5f9] leading-relaxed bg-[#161a22]/60">
                      {prov.proceduralOrThresholdAlteration}
                    </td>
                    <td className="py-4 px-4 min-w-[190px] text-xs text-[#38bdf8] leading-relaxed font-medium">
                      {prov.cognizanceAndBailStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 p-4 bg-[#12151b] border border-[#2d343f] border-l-[3px] border-l-[#f59e0b] rounded-lg">
            <div className="text-xs font-mono uppercase tracking-wider text-[#f59e0b] font-bold mb-1">
              Savings Clause &amp; Regime Transition Directive (BNSS §531 / BNS §358 / BSA §170)
            </div>
            <p className="text-sm text-[#cbd5e1] leading-relaxed">
              {brief.statutoryFramework.regimeTransitionNotes}
            </p>
          </div>
        </section>
      )}

      {/* (c) JUDICIAL PRECEDENTS & RATIO */}
      {showSection('c') && (
        <section className="dossier-dark-sheet bg-[#161a22] border border-[#2d343f] rounded-xl p-6 lg:p-8 shadow-lg">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#2d343f]">
            <div>
              <span className="text-xs font-mono text-[#38bdf8] font-semibold">
                SECTION (c) · BINDING AUTHORITIES (RATIO DECIDENDI VS. OBITER DICTA)
              </span>
              <h2 className="text-lg lg:text-xl font-serif font-bold text-[#f1f5f9] mt-0.5">
                (c) Judicial Precedents &amp; Ratio
              </h2>
            </div>
            <BookOpen className="w-5 h-5 text-[#f59e0b] shrink-0" />
          </div>

          <p className="mt-4 text-sm text-[#cbd5e1] leading-relaxed">
            {brief.judicialPrecedents.settledPositionSummary}
          </p>

          <div className="mt-6 space-y-5">
            {brief.judicialPrecedents.authorities.map((auth, idx) => (
              <div key={idx} className="border border-[#2d343f] rounded-lg p-5 bg-[#12151b]">
                <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#2d343f]">
                  <h3 className="text-base lg:text-lg font-serif font-bold text-[#f1f5f9] italic">
                    {idx + 1}. {auth.caseTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums text-[#cbd5e1]">
                    <span className="font-bold text-[#f59e0b]">{auth.citation}</span>
                    <span aria-hidden="true" className="text-[#64748b]">·</span>
                    <span className="text-[#38bdf8]">{auth.courtAndBench}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-[#161a22] border border-[#2d343f] border-l-[3px] border-l-[#f59e0b] rounded-md">
                    <div className="text-xs font-mono font-bold text-[#f59e0b] uppercase tracking-wider mb-1.5">
                      Ratio Decidendi (Binding Authority)
                    </div>
                    <p className="text-sm text-[#f1f5f9] leading-relaxed">
                      {auth.ratioDecidendi}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#161a22] border border-[#2d343f] border-l-[3px] border-l-[#38bdf8] rounded-md">
                    <div className="text-xs font-mono font-bold text-[#38bdf8] uppercase tracking-wider mb-1.5">
                      Obiter Dicta (Demarcated Non-Binding Observations)
                    </div>
                    <p className="text-sm text-[#cbd5e1] leading-relaxed">
                      {auth.obiterDicta}
                    </p>
                  </div>
                </div>

                {auth.conflictOrDivergence && (
                  <div className="mt-3 p-3 bg-[#161a22] border border-[#2d343f] rounded-md text-xs text-[#cbd5e1] leading-relaxed">
                    <span className="font-mono font-bold text-[#f59e0b]">
                      DOCTRINAL REFERENCE / STATUTORY OVERRIDE:{' '}
                    </span>
                    {auth.conflictOrDivergence}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-[#2d343f] text-sm text-[#cbd5e1] leading-relaxed">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#38bdf8] font-bold mr-2">
                    Application to Instant Matrix:
                  </span>
                  {auth.factualApplication}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-[#12151b] border border-[#2d343f] rounded-lg">
            <div className="text-xs font-mono uppercase tracking-wider text-[#f59e0b] font-bold mb-1">
              Inter-High Court Conflicts &amp; Unsettled Jurisprudential Positions
            </div>
            <p className="text-sm text-[#cbd5e1] leading-relaxed">
              {brief.judicialPrecedents.highCourtConflicts}
            </p>
          </div>
        </section>
      )}

      {/* (d) CHRONOLOGICAL PROCEDURAL ROADMAP */}
      {showSection('d') && (
        <section className="dossier-dark-sheet bg-[#161a22] border border-[#2d343f] rounded-xl p-6 lg:p-8 shadow-lg">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#2d343f]">
            <div>
              <span className="text-xs font-mono text-[#38bdf8] font-semibold">
                SECTION (d) · FORUM, JURISDICTION, LIMITATION &amp; BINDING REMEDY SEQUENCE
              </span>
              <h2 className="text-lg lg:text-xl font-serif font-bold text-[#f1f5f9] mt-0.5">
                (d) Chronological Procedural Roadmap
              </h2>
            </div>
            <Clock className="w-5 h-5 text-[#f59e0b] shrink-0" />
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-[#12151b] border border-[#2d343f] rounded-lg">
              <div className="text-xs font-mono uppercase tracking-wider text-[#f59e0b] font-bold mb-1">
                Competent Forum &amp; Jurisdictional Basis
              </div>
              <p className="text-sm text-[#cbd5e1] leading-relaxed">
                {brief.proceduralRoadmap.jurisdictionalBasis}
              </p>
            </div>
            <div className="p-4 bg-[#12151b] border border-[#2d343f] rounded-lg">
              <div className="text-xs font-mono uppercase tracking-wider text-[#38bdf8] font-bold mb-1">
                Statutory Limitation &amp; Computation Rule
              </div>
              <p className="text-sm text-[#cbd5e1] leading-relaxed font-mono text-xs tabular-nums">
                {brief.proceduralRoadmap.limitationComputation}
              </p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-[#2d343f] border border-[#2d343f] rounded-lg overflow-hidden bg-[#12151b]">
            {brief.proceduralRoadmap.steps.map((step, idx) => (
              <div key={idx} className="p-5 bg-[#12151b] hover:bg-[#161a22] transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#161a22] border border-[#2d343f] text-[#f59e0b] tabular-nums">
                      STEP {step.stepNumber}
                    </span>
                    <h3 className="text-base font-bold text-[#f1f5f9]">
                      {step.stageTitle}
                    </h3>
                  </div>
                  <div className="text-xs font-mono tabular-nums text-[#38bdf8] font-semibold">
                    Limitation / Window: {step.limitationOrTimeline}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#94a3b8] font-mono mb-3">
                  <span>Forum: <strong className="text-[#cbd5e1]">{step.forumAndJurisdiction}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Governing Provision: <strong className="text-[#f59e0b]">{step.governingProvision}</strong></span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#2d343f] text-sm">
                  <div>
                    <span className="block text-xs font-mono uppercase text-[#f59e0b] font-bold mb-1">
                      Specific Remedy &amp; Prayer
                    </span>
                    <p className="text-[#cbd5e1] leading-relaxed">{step.remedyAndPrayer}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-mono uppercase text-[#38bdf8] font-bold mb-1">
                      Mandatory Annexures &amp; Evidentiary Prerequisite
                    </span>
                    <p className="text-[#cbd5e1] leading-relaxed">{step.evidentiaryPrerequisite}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* (e) COUNTER-ARGUMENTS & STRATEGIC VULNERABILITIES */}
      {showSection('e') && (
        <section className="dossier-dark-sheet bg-[#161a22] border border-[#2d343f] rounded-xl p-6 lg:p-8 shadow-lg">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#2d343f]">
            <div>
              <span className="text-xs font-mono text-[#38bdf8] font-semibold">
                SECTION (e) · ADVERSARIAL STRESS-TEST, FORENSIC GAPS &amp; REBUTTAL MATRIX
              </span>
              <h2 className="text-lg lg:text-xl font-serif font-bold text-[#f1f5f9] mt-0.5">
                (e) Counter-Arguments &amp; Strategic Vulnerabilities
              </h2>
            </div>
            <ShieldAlert className="w-5 h-5 text-[#f59e0b] shrink-0" />
          </div>

          <div className="mt-6 space-y-5">
            {brief.strategicVulnerabilities.map((vuln, idx) => (
              <div key={idx} className="border border-[#2d343f] rounded-lg p-5 bg-[#12151b]">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#2d343f]">
                  <h3 className="text-base font-bold text-[#f1f5f9]">
                    0{idx + 1}. {vuln.vulnerabilityTitle}
                  </h3>
                  <div className="text-xs font-mono tabular-nums">
                    <span className="text-[#94a3b8]">Adversarial Exposure: </span>
                    <span
                      className={
                        vuln.riskexposure === 'Critical'
                          ? 'text-red-400 font-bold'
                          : vuln.riskexposure === 'Substantial'
                          ? 'text-[#f59e0b] font-bold'
                          : 'text-[#38bdf8] font-bold'
                      }
                    >
                      {vuln.riskexposure}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                  <div className="p-3.5 bg-[#161a22] border border-[#2d343f] rounded-md">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#f59e0b] font-bold mb-1.5">
                      Anticipated Opposing Contention
                    </div>
                    <p className="text-[#cbd5e1] leading-relaxed">{vuln.opposingContention}</p>
                  </div>

                  <div className="p-3.5 bg-[#161a22] border border-[#2d343f] rounded-md">
                    <div className="text-xs font-mono uppercase tracking-wider text-red-400 font-bold mb-1.5">
                      Evidentiary / Forensic Lacuna
                    </div>
                    <p className="text-[#cbd5e1] leading-relaxed">{vuln.evidentiaryOrForensicGap}</p>
                  </div>

                  <div className="p-3.5 bg-[#161a22] border border-[#2d343f] border-l-[3px] border-l-[#38bdf8] rounded-md">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#38bdf8] font-bold mb-1.5">
                      Clinical Rebuttal &amp; Controlling Authority
                    </div>
                    <p className="text-[#f1f5f9] leading-relaxed">{vuln.rebuttalStrategyAndAuthority}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
