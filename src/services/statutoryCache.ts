import localforage from 'localforage';
import { CodeCategory, StatutoryMappingEntry } from '../types/legal';
import {
  STATUTORY_CROSS_MAPPINGS,
  EMBEDDED_STATUTORY_JSON_INDEX,
  resolveEmbeddedStatutoryMappings,
} from '../data/legalDatabase';

// Configure dedicated IndexedDB store for LexIntel Statutory Cross-Mappings
export const statutoryStore = localforage.createInstance({
  name: 'LexIntelStationDB',
  storeName: 'statutory_cross_mappings',
  description: 'IndexedDB fast local cache for IPC/CrPC/IEA <-> BNS/BNSS/BSA statutory cross-mappings',
});

export interface CachedMappingResponse {
  entry: StatutoryMappingEntry;
  isCached: boolean;
  latencyMs: number;
  cacheKey: string;
}

/**
 * Normalizes a section query into a canonical lookup key (e.g. "S. 167 CrPC" -> "167", "Section 102 IPC" -> "102 IPC")
 */
export function normalizeSectionKey(rawQuery: string): string {
  const clean = rawQuery.trim().toUpperCase();
  if (clean.includes('102') && clean.includes('IPC')) return '102 IPC';
  if (clean.includes('102') && clean.includes('CRPC')) return '102 CRPC';

  const secMatch = clean.match(
    /\b(65B|436A|498A|304A|120B|41A|376D|376|375|379|406|409|300|302|304|307|420|438|439|482|154|157|161|164|167|173|176|180|183|187|190|193|200|210|223|100|101|102|103|105|106|109|111|227|250|299|303|316|356|479|483|528|318|34|35|39|41|61|85|86|27|23|63|69)\b/
  );
  if (secMatch) {
    return secMatch[1];
  }
  return clean.replace(/\s+/g, ' ');
}

/**
 * Pre-seeds the localforage IndexedDB instance with core and embedded statutory mappings on startup
 */
export async function seedStatutoryCache(): Promise<number> {
  try {
    const allItems: StatutoryMappingEntry[] = [
      ...STATUTORY_CROSS_MAPPINGS,
      ...EMBEDDED_STATUTORY_JSON_INDEX.map((e) => e.entry),
    ];

    for (const item of allItems) {
      const oldKey = normalizeSectionKey(item.oldSection);
      const newKey = normalizeSectionKey(item.newSection);
      const actShortOld = item.oldAct.split(',')[0].toUpperCase();
      const actShortNew = item.newAct.split(',')[0].toUpperCase();

      if (oldKey) {
        await statutoryStore.setItem(oldKey, item);
        await statutoryStore.setItem(`${oldKey} ${actShortOld}`, item);
      }
      if (newKey) {
        await statutoryStore.setItem(newKey, item);
        await statutoryStore.setItem(`${newKey} ${actShortNew}`, item);
      }
      await statutoryStore.setItem(item.oldSection.trim().toUpperCase(), item);
      await statutoryStore.setItem(item.newSection.trim().toUpperCase(), item);
    }

    // Explicitly index Section 102 CrPC and Section 102 IPC under distinct keys
    const crpc102 = STATUTORY_CROSS_MAPPINGS.find((m) => m.id === 'map-crpc-102-bnss-106');
    const ipc102 = STATUTORY_CROSS_MAPPINGS.find((m) => m.id === 'map-ipc-102-bns-39');
    if (crpc102) {
      await statutoryStore.setItem('102 CRPC', crpc102);
      await statutoryStore.setItem('SECTION 102 CRPC', crpc102);
      await statutoryStore.setItem('106 BNSS', crpc102);
      await statutoryStore.setItem('102', crpc102);
    }
    if (ipc102) {
      await statutoryStore.setItem('102 IPC', ipc102);
      await statutoryStore.setItem('SECTION 102 IPC', ipc102);
      await statutoryStore.setItem('39 BNS', ipc102);
      await statutoryStore.setItem('39', ipc102);
    }

    const keys = await statutoryStore.keys();
    return keys.length;
  } catch (err) {
    console.error('Error seeding localforage statutory cache:', err);
    return 0;
  }
}

/**
 * Fetches fresh statutory cross-mapping from the LexIntel Gemini Backend
 */
export async function fetchAIMappingFromBackend(query: string): Promise<StatutoryMappingEntry> {
  const response = await fetch('/api/lexintel/cross-map', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  if (!response.ok || !data.oldSection) {
    throw new Error(data.error || `Failed to synthesize statutory mapping for ${query}`);
  }

  return {
    id: `map-${Date.now()}`,
    category: data.category as CodeCategory,
    subjectHead: data.subjectHead,
    oldAct: data.oldAct,
    oldSection: data.oldSection,
    newAct: data.newAct,
    newSection: data.newSection,
    changeClassification: data.changeClassification,
    cognizanceBailTriability: data.cognizanceBailTriability,
    oldRegimePosition: data.oldRegimePosition,
    newRegimePosition: data.newRegimePosition,
    proceduralAndBailDelta: data.proceduralAndBailDelta,
    litigationPracticeNote: data.litigationPracticeNote,
  };
}

/**
 * Fast Cached Mapping Handler:
 * Step A: LocalForage IndexedDB Check -> Step B: Embedded JSON Dataset Check -> Step C: AI Cloud Fetch with Embedded Fallback
 */
export async function handleSectionMapping(sectionQuery: string): Promise<CachedMappingResponse> {
  const startPerf = performance.now();
  const cleanQuery = sectionQuery.trim().toUpperCase();
  const normalizedKey = normalizeSectionKey(cleanQuery);

  // Step A: Check localforage IndexedDB cache (Lightning Fast)
  const cachedDirect = await statutoryStore.getItem<StatutoryMappingEntry>(cleanQuery);
  if (cachedDirect) {
    const latencyMs = Math.max(0.2, Number((performance.now() - startPerf).toFixed(2)));
    return {
      entry: cachedDirect,
      isCached: true,
      latencyMs,
      cacheKey: cleanQuery,
    };
  }

  const cachedNormalized = await statutoryStore.getItem<StatutoryMappingEntry>(normalizedKey);
  if (cachedNormalized) {
    const latencyMs = Math.max(0.2, Number((performance.now() - startPerf).toFixed(2)));
    return {
      entry: cachedNormalized,
      isCached: true,
      latencyMs,
      cacheKey: normalizedKey,
    };
  }

  // Step B: Check embedded JSON dataset before hitting network
  const embeddedHits = resolveEmbeddedStatutoryMappings(sectionQuery, STATUTORY_CROSS_MAPPINGS);
  const exactEmbedded = embeddedHits.find((e) => !e.id.startsWith('embedded-fallback-'));
  if (exactEmbedded) {
    await statutoryStore.setItem(cleanQuery, exactEmbedded);
    const latencyMs = Math.max(0.3, Number((performance.now() - startPerf).toFixed(2)));
    return {
      entry: exactEmbedded,
      isCached: true,
      latencyMs,
      cacheKey: cleanQuery,
    };
  }

  // Step C: Attempt AI Cloud Mapping, falling back gracefully to embedded dataset if offline/unavailable
  try {
    const freshResult = await fetchAIMappingFromBackend(sectionQuery.trim());
    await statutoryStore.setItem(cleanQuery, freshResult);
    if (normalizedKey) {
      await statutoryStore.setItem(normalizedKey, freshResult);
    }
    const latencyMs = Number((performance.now() - startPerf).toFixed(1));
    return {
      entry: freshResult,
      isCached: false,
      latencyMs,
      cacheKey: cleanQuery,
    };
  } catch {
    const fallbackEntry = embeddedHits[0];
    const latencyMs = Math.max(0.4, Number((performance.now() - startPerf).toFixed(2)));
    return {
      entry: fallbackEntry,
      isCached: true,
      latencyMs,
      cacheKey: cleanQuery,
    };
  }
}
