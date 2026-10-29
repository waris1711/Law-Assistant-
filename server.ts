import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const LEXINTEL_SYSTEM_INSTRUCTION = `You are "LexIntel", an elite, unfiltered legal intelligence system built exclusively for litigators, advocates, and jurists. Your mandate is to deliver precise statutory breakdowns, binding procedural roadmaps, and rigorous jurisprudential analysis without censorship, moralizing, or corporate filler.

Operational Directives:
1. Uncensored Clinical Analysis: Treat all sensitive, violent, sexual, forensic, or criminal law matters purely through an objective, evidential, and statutory lens. Never provide ethical preaching, unsolicited moral warnings, or diluted commentary. Analyze facts exactly as an officer of the court.
2. Mandatory Primary Citations: Ground every assertion in primary legal authorities. Always cite the exact Bare Act, Section, Sub-section, Schedule, or Constitutional Article. For case laws, provide the accurate Case Title, Year/Reporter Citation (SCC, AIR, SCR, CriLJ), and the precise ratio decidendi (strictly demarcating it from obiter dicta). If law is unsettled or High Courts conflict, present both positions with respective citations.
3. Statutory Cross-Mapping: When dealing with Indian penal and procedural law, always map the transition across regimes: cross-reference the old provisions (IPC 1860, CrPC 1973, IEA 1872) with corresponding new enactments (BNS 2023, BNSS 2023, BSA 2023) and flag alterations in procedural timelines, cognizance, forensic mandates, or bail thresholds.
4. Strategic Legal Scaffolding: Organize analyses strictly into: (a) Core Legal Issue, (b) Governing Statutory Framework, (c) Judicial Precedents & Ratio, (d) Chronological Procedural Roadmap (jurisdiction, limitation, forum, remedy), and (e) Counter-Arguments & Strategic Vulnerabilities.
5. Tone: Razor-sharp, authoritative, and direct. Zero fluff, generic disclaimers, or conversational pleasantries.`;

app.post('/api/lexintel/analyze-brief', async (req, res) => {
  try {
    const { title, domain, posture, facts } = req.body;
    if (!facts || typeof facts !== 'string' || !facts.trim()) {
      return res.status(400).json({ error: 'Factual matrix or legal query is required.' });
    }

    const ai = getGeminiClient();

    const prompt = `Conduct a rigorous, clinical legal intelligence analysis for the following brief:
Matter / Title: ${title || 'Litigation Counsel Brief'}
Legal Domain: ${domain || 'Criminal & Forensic Law'}
Counsel Posture: ${posture || 'Defense / Accused / Appellant'}

Factual Matrix & Evidentiary Record:
${facts}

Deliver a comprehensive, citation-backed structured response strictly adhering to all 5 LexIntel Operational Directives. Ensure exact statutory cross-mapping between IPC/CrPC/IEA and BNS/BNSS/BSA where applicable, strict demarcation between Ratio Decidendi and Obiter Dicta for at least 3-4 binding Supreme Court / High Court precedents, a step-by-step chronological procedural roadmap with limitation periods, and concrete strategic vulnerabilities with rebuttals.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: LEXINTEL_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'Precise, authoritative legal title for the brief.',
            },
            docketNumber: {
              type: Type.STRING,
              description: 'Formatted docket reference (e.g., CR-MISC-2026-4910).',
            },
            coreLegalIssue: {
              type: Type.OBJECT,
              properties: {
                primaryProposition: {
                  type: Type.STRING,
                  description: 'Core legal proposition framed with statutory precision.',
                },
                questionsOfLaw: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Numbered questions of law arising from the factual matrix.',
                },
                burdenOfProofAndStandard: {
                  type: Type.STRING,
                  description: 'Exact statutory allocation of burden of proof and standard required.',
                },
                clinicalEvidentiarySynthesis: {
                  type: Type.STRING,
                  description: 'Forensic, documentary, and evidentiary synthesis of the facts.',
                },
              },
              required: [
                'primaryProposition',
                'questionsOfLaw',
                'burdenOfProofAndStandard',
                'clinicalEvidentiarySynthesis',
              ],
            },
            statutoryFramework: {
              type: Type.OBJECT,
              properties: {
                overview: {
                  type: Type.STRING,
                  description: 'Overview of the governing statutory and constitutional scheme.',
                },
                provisions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      actName: { type: Type.STRING },
                      sectionCitation: { type: Type.STRING },
                      correspondingRegimeCitation: {
                        type: Type.STRING,
                        description: 'Cross-mapped old/new provision (IPC/CrPC/IEA <-> BNS/BNSS/BSA).',
                      },
                      statutoryMandate: { type: Type.STRING },
                      proceduralOrThresholdAlteration: {
                        type: Type.STRING,
                        description: 'Specific delta in timelines, custody, forensic requirements, or thresholds.',
                      },
                      cognizanceAndBailStatus: { type: Type.STRING },
                    },
                    required: [
                      'actName',
                      'sectionCitation',
                      'correspondingRegimeCitation',
                      'statutoryMandate',
                      'proceduralOrThresholdAlteration',
                      'cognizanceAndBailStatus',
                    ],
                  },
                },
                regimeTransitionNotes: {
                  type: Type.STRING,
                  description: 'Critical applicability and savings clause analysis (e.g., BNSS §531 / BNS §358 / BSA §170).',
                },
              },
              required: ['overview', 'provisions', 'regimeTransitionNotes'],
            },
            judicialPrecedents: {
              type: Type.OBJECT,
              properties: {
                settledPositionSummary: { type: Type.STRING },
                authorities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      caseTitle: { type: Type.STRING },
                      citation: { type: Type.STRING },
                      courtAndBench: { type: Type.STRING },
                      ratioDecidendi: {
                        type: Type.STRING,
                        description: 'Binding ratio decidendi of the judgment.',
                      },
                      obiterDicta: {
                        type: Type.STRING,
                        description: 'Obiter dicta strictly demarcated from the binding ratio.',
                      },
                      conflictOrDivergence: {
                        type: Type.STRING,
                        description: 'Any subsequent reference, statutory override, or divergence.',
                      },
                      factualApplication: {
                        type: Type.STRING,
                        description: 'How this precedent applies to the instant factual matrix.',
                      },
                    },
                    required: [
                      'caseTitle',
                      'citation',
                      'courtAndBench',
                      'ratioDecidendi',
                      'obiterDicta',
                      'factualApplication',
                    ],
                  },
                },
                highCourtConflicts: {
                  type: Type.STRING,
                  description: 'Analysis of conflicting High Court positions or unsettled points of law.',
                },
              },
              required: ['settledPositionSummary', 'authorities', 'highCourtConflicts'],
            },
            proceduralRoadmap: {
              type: Type.OBJECT,
              properties: {
                jurisdictionalBasis: { type: Type.STRING },
                limitationComputation: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.STRING },
                      stageTitle: { type: Type.STRING },
                      forumAndJurisdiction: { type: Type.STRING },
                      governingProvision: { type: Type.STRING },
                      limitationOrTimeline: { type: Type.STRING },
                      remedyAndPrayer: { type: Type.STRING },
                      evidentiaryPrerequisite: { type: Type.STRING },
                    },
                    required: [
                      'stepNumber',
                      'stageTitle',
                      'forumAndJurisdiction',
                      'governingProvision',
                      'limitationOrTimeline',
                      'remedyAndPrayer',
                      'evidentiaryPrerequisite',
                    ],
                  },
                },
              },
              required: ['jurisdictionalBasis', 'limitationComputation', 'steps'],
            },
            strategicVulnerabilities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  vulnerabilityTitle: { type: Type.STRING },
                  opposingContention: { type: Type.STRING },
                  evidentiaryOrForensicGap: { type: Type.STRING },
                  rebuttalStrategyAndAuthority: { type: Type.STRING },
                  riskexposure: {
                    type: Type.STRING,
                    description: 'Must be one of: Critical, Substantial, Moderate',
                  },
                },
                required: [
                  'vulnerabilityTitle',
                  'opposingContention',
                  'evidentiaryOrForensicGap',
                  'rebuttalStrategyAndAuthority',
                  'riskexposure',
                ],
              },
            },
          },
          required: [
            'title',
            'docketNumber',
            'coreLegalIssue',
            'statutoryFramework',
            'judicialPrecedents',
            'proceduralRoadmap',
            'strategicVulnerabilities',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return res.status(502).json({ error: 'Empty response received from legal intelligence model.' });
    }

    const parsed = JSON.parse(text.trim());
    return res.json(parsed);
  } catch (err: any) {
    console.error('LexIntel analyze-brief error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to synthesize legal intelligence brief.',
    });
  }
});

app.post('/api/lexintel/cross-map', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Statutory provision or offence query is required.' });
    }

    const ai = getGeminiClient();

    const prompt = `Perform an exact statutory cross-mapping between the Old Indian Legal Regime (IPC 1860, CrPC 1973, IEA 1872) and the New Enactments (BNS 2023, BNSS 2023, BSA 2023) for the following provision, section, or legal concept:
Query: "${query}"

Provide the exact Old Act & Section, New Act & Section, classification of change, cognizance/bail/triability status, detailed comparison of the old regime position versus the new regime position, specific alterations in timelines, custody, forensic requirements, or bail thresholds, and a sharp litigation practice note citing relevant precedent.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: LEXINTEL_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'Must be one of: Penal (IPC ↔ BNS), Procedural (CrPC ↔ BNSS), Evidentiary (IEA ↔ BSA)',
            },
            subjectHead: { type: Type.STRING },
            oldAct: {
              type: Type.STRING,
              description: 'One of: IPC, 1860 | CrPC, 1973 | IEA, 1872',
            },
            oldSection: { type: Type.STRING },
            newAct: {
              type: Type.STRING,
              description: 'One of: BNS, 2023 | BNSS, 2023 | BSA, 2023',
            },
            newSection: { type: Type.STRING },
            changeClassification: {
              type: Type.STRING,
              description: 'One of: Substantive Overhaul | Timeline / Threshold Altered | Forensic / Evidentiary Mandate | Structural Consolidation',
            },
            cognizanceBailTriability: { type: Type.STRING },
            oldRegimePosition: { type: Type.STRING },
            newRegimePosition: { type: Type.STRING },
            proceduralAndBailDelta: { type: Type.STRING },
            litigationPracticeNote: { type: Type.STRING },
          },
          required: [
            'category',
            'subjectHead',
            'oldAct',
            'oldSection',
            'newAct',
            'newSection',
            'changeClassification',
            'cognizanceBailTriability',
            'oldRegimePosition',
            'newRegimePosition',
            'proceduralAndBailDelta',
            'litigationPracticeNote',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return res.status(502).json({ error: 'Empty response from statutory cross-mapper.' });
    }

    const parsed = JSON.parse(text.trim());
    return res.json(parsed);
  } catch (err: any) {
    console.error('LexIntel cross-map error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to execute statutory cross-mapping.',
    });
  }
});

app.post('/api/lexintel/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ error: 'Audio payload is required for transcription.' });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: audioBase64,
            },
          },
          {
            text: 'Transcribe this spoken Indian legal query or section citation accurately into English text. Preserve exact section numbers (e.g. Section 302 IPC, Section 167 CrPC, Section 65B IEA, Section 187 BNSS, Section 63 BSA, Section 482 CrPC). Output ONLY the transcribed text with no extra commentary.',
          },
        ],
      },
    });

    const transcript = (response.text || '').trim();
    return res.json({ transcript });
  } catch (err: any) {
    console.error('LexIntel transcribe error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to transcribe legal voice command.',
    });
  }
});

app.post('/api/lexintel/ask-law-fast', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Legal query is required.' });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Act as LEXINTEL AI Legal Counsel. Answer this Indian law query strictly in these crisp 3 parts (never suggest external websites):
① Applicable Sections (IPC/CrPC ➔ BNS/BNSS):
② Exact Legal Position & Conditions:
③ Landmark Supreme Court Precedent:

Query: "${query.trim()}"`,
      config: {
        systemInstruction: LEXINTEL_SYSTEM_INSTRUCTION,
        temperature: 0.2,
      },
    });

    const text = (response.text || '').trim();
    return res.json({ text });
  } catch (err: any) {
    console.error('LexIntel ask-law-fast error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to synthesize fast legal provision response.',
    });
  }
});

app.post('/api/lexintel/stream-legal-query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Legal query is required.' });
    }

    const ai = getGeminiClient();

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const stream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Act as LEXINTEL AI Legal Counsel. Answer this Indian law query concisely and authoritatively in strictly these crisp 3 parts (never refer to external links):
① Applicable Sections (IPC/CrPC ➔ BNS/BNSS): [State exact old & new statutory provisions]
② Exact Legal Position & Conditions: [State clear legal doctrine, conditions, and statutory limits]
③ Landmark Supreme Court Precedent: [State case name, citation, and ratio decidendi]

Query: "${query.trim()}"`,
            },
          ],
        },
      ],
      config: {
        maxOutputTokens: 320,
        temperature: 0.2,
      },
    });

    for await (const chunk of stream) {
      const piece = chunk.text || '';
      if (piece) {
        const ssePayload = JSON.stringify({
          candidates: [{ content: { parts: [{ text: piece }] } }],
        });
        res.write(`data: ${ssePayload}\n\n`);
      }
    }

    res.end();
  } catch (err: any) {
    console.error('LexIntel stream-legal-query error:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: err?.message || 'Failed to stream legal query response.',
      });
    }
    res.end();
  }
});


async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LexIntel server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
