import React, { useState } from 'react';
import { CounselPosture, LegalBrief, LegalDomain } from '../types/legal';
import { PRESET_FACTUAL_SCENARIOS } from '../data/legalDatabase';
import { Loader2, FileText, X } from 'lucide-react';

interface NewBriefComposerProps {
  onBriefCreated: (brief: LegalBrief) => void;
  onCancel: () => void;
}

const DOMAINS: LegalDomain[] = [
  'Criminal & Forensic Law',
  'Procedural & Custodial Law',
  'Electronic & Documentary Evidence',
  'Constitutional & Writ Jurisdiction',
  'Commercial & Civil Litigation',
];

const POSTURES: CounselPosture[] = [
  'Defense / Accused / Appellant',
  'Prosecution / Complainant / State',
  'Writ Petitioner / Constitutional Challenge',
  'Neutral Judicial / Amicus Curiae',
];

export const NewBriefComposer: React.FC<NewBriefComposerProps> = ({
  onBriefCreated,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState<LegalDomain>('Criminal & Forensic Law');
  const [posture, setPosture] = useState<CounselPosture>('Defense / Accused / Appellant');
  const [facts, setFacts] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadPreset = (preset: (typeof PRESET_FACTUAL_SCENARIOS)[number]) => {
    setTitle(preset.title);
    setDomain(preset.domain);
    setPosture(preset.posture);
    setFacts(preset.facts);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facts.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/lexintel/analyze-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || undefined,
          domain,
          posture,
          facts: facts.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to synthesize legal brief.');
      }

      const newBrief: LegalBrief = {
        id: `brief-${Date.now()}`,
        docketNumber: data.docketNumber || `LX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: data.title || title.trim() || 'Counsel Legal Intelligence Brief',
        createdAt: new Date().toISOString().split('T')[0],
        domain,
        posture,
        factualMatrixSummary: facts.trim(),
        coreLegalIssue: data.coreLegalIssue,
        statutoryFramework: data.statutoryFramework,
        judicialPrecedents: data.judicialPrecedents,
        proceduralRoadmap: data.proceduralRoadmap,
        strategicVulnerabilities: data.strategicVulnerabilities,
      };

      onBriefCreated(newBrief);
    } catch (err: any) {
      setError(err.message || 'An error occurred during legal synthesis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white border border-stone-200 p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <span className="text-xs font-mono text-[#1E3A8A] font-semibold">
            CLINICAL LITIGATION SYNTHESIS · DIRECTIVES 01–05 ACTIVE
          </span>
          <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-stone-900 mt-1">
            Draft New Counsel Intelligence Brief
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-3xl">
            Enter the factual matrix, FIR / remand sequence, forensic findings, or statutory controversy. LexIntel will generate an unfiltered 5-part breakdown with Bare Act citations, IPC/CrPC/IEA ↔ BNS/BNSS/BSA cross-mapping, demarcated ratio decidendi, and chronological procedural roadmap.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-[#FBF9F5] border border-stone-300 hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          Return to Active Brief
        </button>
      </div>

      {/* Quick-Load Preset Factual Matrices */}
      <div className="mt-5 pb-5 border-b border-stone-200">
        <div className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-2.5">
          Load Sample Factual Matrix & Evidentiary Record:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_FACTUAL_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleLoadPreset(preset)}
              className="text-left p-3.5 bg-[#FBF9F5] border border-stone-200 hover:border-[#1E3A8A] transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#1E3A8A] font-semibold mb-1">
                <span className="truncate">{preset.label}</span>
                <FileText className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
              </div>
              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {preset.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-1.5">
              Subject Domain
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value as LegalDomain)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-stone-300 text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-1.5">
              Counsel Posture / Brief Perspective
            </label>
            <select
              value={posture}
              onChange={(e) => setPosture(e.target.value as CounselPosture)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-stone-300 text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
            >
              {POSTURES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-1.5">
              Matter Heading / Cause Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Challenge to Section 187(2) BNSS Remand Order..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#1E3A8A]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-1.5">
            Factual Matrix, Chronology of Events, Forensic Findings & Statutory Query *
          </label>
          <textarea
            rows={7}
            value={facts}
            onChange={(e) => setFacts(e.target.value)}
            required
            placeholder="Detail the exact chronology: Date of incident/FIR, sections invoked (IPC/CrPC/IEA or BNS/BNSS/BSA), arrest/remand timestamps, seizure panchnama details, medical/autopsy or FSL findings, and the specific relief or legal question under examination..."
            className="w-full p-4 text-sm bg-[#FBF9F5] border border-stone-300 text-stone-900 placeholder:text-stone-400 leading-relaxed focus:outline-none focus:border-[#1E3A8A]"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-800">
            Synthesis Error: {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-200">
          <div className="text-xs text-stone-500 font-mono">
            Output Format: (a) Core Issue · (b) Statutory Cross-Map · (c) Ratio vs. Obiter · (d) Procedural Roadmap · (e) Vulnerabilities
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-medium text-stone-700 bg-[#FBF9F5] border border-stone-300 hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !facts.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-[#172E6E] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Synthesizing Clinical Brief...
                </>
              ) : (
                'Generate Brief'
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
