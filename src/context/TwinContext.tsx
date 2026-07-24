import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createDTP, type Twin, type TwinEvent, type PhenotypeMapping, type StreamHandle } from '../lib/ontomorph';
import { CANDIDATE_CONDITIONS } from '../lib/candidates';
import { scoreAllCandidates, type ScoredCondition, type PhenotypeMatch } from '../lib/scoring';
import { getBodySystem } from '../lib/bodySystem';

export type SystemEvent = TwinEvent & {
  hpoMapping?: PhenotypeMapping | null;
};

type TwinState = {
  isConnecting: boolean;
  isConnected: boolean;
  twin: Twin | null;
  connectionError: string | null;

  events: SystemEvent[];
  eventsBySystem: Record<string, SystemEvent[]>;

  isAnalyzing: boolean;
  phenotypeMatches: PhenotypeMatch[];
  differentialResults: ScoredCondition[];
  analysisComplete: boolean;
  isStreaming: boolean;

  connect: (grantToken: string) => Promise<void>;
  addFinding: (finding: {
    display: string;
    code?: string;
    vocabulary?: string;
    system?: string;
    hpoId?: string;
    hpoLabel?: string;
    occurredAt?: string;
  }) => Promise<void>;
  runConstellation: () => Promise<void>;
  startStream: () => void;
  stopStream: () => void;
  reset: () => void;
};

const TwinContext = createContext<TwinState | null>(null);

export function TwinProvider({ children }: { children: React.ReactNode }) {
  const dtp = useRef(createDTP());
  const streamRef = useRef<StreamHandle | null>(null);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [twin, setTwin] = useState<Twin | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [eventsBySystem, setEventsBySystem] = useState<Record<string, SystemEvent[]>>({});

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [phenotypeMatches, setPhenotypeMatches] = useState<PhenotypeMatch[]>([]);
  const [differentialResults, setDifferentialResults] = useState<ScoredCondition[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const groupBySystem = (evts: SystemEvent[]): Record<string, SystemEvent[]> => {
    const grouped: Record<string, SystemEvent[]> = {};
    for (const evt of evts) {
      if (!grouped[evt.system]) grouped[evt.system] = [];
      grouped[evt.system].push(evt);
    }
    return grouped;
  };

  const connect = useCallback(async (grantToken: string) => {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      const connectedTwin = await dtp.current.twins.connect(grantToken);
      setTwin(connectedTwin);

      const rawEvents = await connectedTwin.events.list();

      // resolve HPO mappings for each coded event
      const enrichedEvents: SystemEvent[] = await Promise.all(
        rawEvents.map(async (evt) => {
          let hpoMapping: PhenotypeMapping | null = null;
          if (evt.data.code && evt.data.vocabulary) {
            hpoMapping = await dtp.current.holon.mappings.translate(
              evt.data.code,
              evt.data.vocabulary,
              'HPO'
            );
          }
          return { ...evt, hpoMapping };
        })
      );

      setEvents(enrichedEvents);
      setEventsBySystem(groupBySystem(enrichedEvents));
      setIsConnected(true);
    } catch (err) {
      setConnectionError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const runConstellation = useCallback(async () => {
    if (events.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisComplete(false);

    // brief delay for the loading animation
    await new Promise((r) => setTimeout(r, 400));

    const matches: PhenotypeMatch[] = events
      .filter((evt) => evt.hpoMapping)
      .map((evt) => ({
        hpoId: evt.hpoMapping!.hpoId,
        label: evt.hpoMapping!.hpoLabel,
        system: getBodySystem(evt.hpoMapping!.hpoId),
        sourceEventId: evt.id,
      }));

    setPhenotypeMatches(matches);

    const scored = scoreAllCandidates(matches, CANDIDATE_CONDITIONS);
    setDifferentialResults(scored);

    // let the animation play out before showing results
    await new Promise((r) => setTimeout(r, 800));
    setIsAnalyzing(false);
    setAnalysisComplete(true);
  }, [events]);

  const addFinding = useCallback(
    async (finding: {
      display: string;
      code?: string;
      vocabulary?: string;
      system?: string;
      hpoId?: string;
      hpoLabel?: string;
      occurredAt?: string;
    }) => {
      let hpoMapping: PhenotypeMapping | null = null;

      if (finding.hpoId && finding.hpoLabel) {
        hpoMapping = {
          sourceCode: finding.code || 'CUSTOM',
          sourceVocabulary: finding.vocabulary || 'ICD-10',
          hpoId: finding.hpoId,
          hpoLabel: finding.hpoLabel,
          confidence: 0.95,
        };
      } else if (finding.code && finding.vocabulary) {
        hpoMapping = await dtp.current.holon.mappings.translate(
          finding.code,
          finding.vocabulary,
          'HPO'
        );
      }

      const assignedSystem =
        finding.system ||
        (hpoMapping ? getBodySystem(hpoMapping.hpoId) : 'nervous');

      const newEvent: SystemEvent = {
        id: `evt-log-${Date.now()}`,
        timestamp: finding.occurredAt || new Date().toISOString(),
        system: assignedSystem,
        data: {
          code: finding.code || 'CUSTOM',
          vocabulary: finding.vocabulary || 'CLINICAL',
          display: finding.display,
        },
        hpoMapping,
      };

      // try to flag the real twin if connected
      if (twin) {
        try {
          await twin.flag(assignedSystem, {
            occurredAt: newEvent.timestamp,
            title: finding.display,
            code: finding.code || 'CUSTOM',
            vocabulary: finding.vocabulary || 'CLINICAL',
          });
        } catch {
          // grant scope might not allow flagging, that's ok
        }
      }

      setEvents((prev) => {
        const next = [newEvent, ...prev];
        setEventsBySystem(groupBySystem(next));

        // if we've already run analysis, re-score with the new finding
        if (analysisComplete) {
          const matches: PhenotypeMatch[] = next
            .filter((evt) => evt.hpoMapping)
            .map((evt) => ({
              hpoId: evt.hpoMapping!.hpoId,
              label: evt.hpoMapping!.hpoLabel,
              system: getBodySystem(evt.hpoMapping!.hpoId),
              sourceEventId: evt.id,
            }));
          setPhenotypeMatches(matches);
          const scored = scoreAllCandidates(matches, CANDIDATE_CONDITIONS);
          setDifferentialResults(scored);
        }

        return next;
      });
    },
    [analysisComplete]
  );

  const startStream = useCallback(() => {
    if (!twin) return;
    setIsStreaming(true);
    streamRef.current = twin.events.stream({}, (newEvent) => {
      const enriched: SystemEvent = { ...newEvent };
      setEvents((prev) => {
        const next = [...prev, enriched];
        setEventsBySystem(groupBySystem(next));
        return next;
      });
    });
  }, [twin]);

  const stopStream = useCallback(() => {
    streamRef.current?.stop();
    streamRef.current = null;
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    stopStream();
    setIsConnected(false);
    setTwin(null);
    setEvents([]);
    setEventsBySystem({});
    setPhenotypeMatches([]);
    setDifferentialResults([]);
    setAnalysisComplete(false);
    setIsAnalyzing(false);
  }, [stopStream]);

  return (
    <TwinContext.Provider
      value={{
        isConnecting, isConnected, twin, connectionError,
        events, eventsBySystem,
        isAnalyzing, phenotypeMatches, differentialResults, analysisComplete,
        isStreaming,
        connect, addFinding, runConstellation, startStream, stopStream, reset,
      }}
    >
      {children}
    </TwinContext.Provider>
  );
}

export function useTwin(): TwinState {
  const ctx = useContext(TwinContext);
  if (!ctx) throw new Error('useTwin must be used within TwinProvider');
  return ctx;
}
