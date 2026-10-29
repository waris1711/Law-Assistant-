export type LegalDomain =
  | 'Criminal & Forensic Law'
  | 'Procedural & Custodial Law'
  | 'Electronic & Documentary Evidence'
  | 'Constitutional & Writ Jurisdiction'
  | 'Commercial & Civil Litigation';

export type CounselPosture =
  | 'Defense / Accused / Appellant'
  | 'Prosecution / Complainant / State'
  | 'Neutral Judicial / Amicus Curiae'
  | 'Writ Petitioner / Constitutional Challenge';

export interface StatutoryProvisionAnalysis {
  actName: string;
  sectionCitation: string;
  correspondingRegimeCitation: string;
  statutoryMandate: string;
  proceduralOrThresholdAlteration: string;
  cognizanceAndBailStatus: string;
}

export interface PrecedentAuthority {
  caseTitle: string;
  citation: string;
  courtAndBench: string;
  ratioDecidendi: string;
  obiterDicta: string;
  conflictOrDivergence?: string;
  factualApplication: string;
}

export interface ProceduralStep {
  stepNumber: string;
  stageTitle: string;
  forumAndJurisdiction: string;
  governingProvision: string;
  limitationOrTimeline: string;
  remedyAndPrayer: string;
  evidentiaryPrerequisite: string;
}

export interface StrategicVulnerability {
  vulnerabilityTitle: string;
  opposingContention: string;
  evidentiaryOrForensicGap: string;
  rebuttalStrategyAndAuthority: string;
  riskexposure: 'Critical' | 'Substantial' | 'Moderate';
}

export interface LegalBrief {
  id: string;
  docketNumber: string;
  title: string;
  createdAt: string;
  domain: LegalDomain;
  posture: CounselPosture;
  factualMatrixSummary: string;
  // (a) Core Legal Issue
  coreLegalIssue: {
    primaryProposition: string;
    questionsOfLaw: string[];
    burdenOfProofAndStandard: string;
    clinicalEvidentiarySynthesis: string;
  };
  // (b) Governing Statutory Framework & Cross-Mapping
  statutoryFramework: {
    overview: string;
    provisions: StatutoryProvisionAnalysis[];
    regimeTransitionNotes: string;
  };
  // (c) Judicial Precedents & Ratio
  judicialPrecedents: {
    settledPositionSummary: string;
    authorities: PrecedentAuthority[];
    highCourtConflicts: string;
  };
  // (d) Chronological Procedural Roadmap
  proceduralRoadmap: {
    jurisdictionalBasis: string;
    limitationComputation: string;
    steps: ProceduralStep[];
  };
  // (e) Counter-Arguments & Strategic Vulnerabilities
  strategicVulnerabilities: StrategicVulnerability[];
}

export type CodeCategory = 'Penal (IPC ↔ BNS)' | 'Procedural (CrPC ↔ BNSS)' | 'Evidentiary (IEA ↔ BSA)';

export interface StatutoryMappingEntry {
  id: string;
  category: CodeCategory;
  subjectHead: string;
  oldAct: 'IPC, 1860' | 'CrPC, 1973' | 'IEA, 1872';
  oldSection: string;
  newAct: 'BNS, 2023' | 'BNSS, 2023' | 'BSA, 2023';
  newSection: string;
  changeClassification: 'Substantive Overhaul' | 'Timeline / Threshold Altered' | 'Forensic / Evidentiary Mandate' | 'Structural Consolidation';
  cognizanceBailTriability: string;
  oldRegimePosition: string;
  newRegimePosition: string;
  proceduralAndBailDelta: string;
  litigationPracticeNote: string;
}
