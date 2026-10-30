import { useEffect, useMemo, useRef, useState } from 'react';
import { MediaSession } from 'zebar';

// The OS/Zebar "current session" designation is sticky and doesn't change when
// a second app starts playing, so paused-to-playing transitions are tracked
// per session and the most recent play-start wins. Alt+Click pins a session
// until another one starts playing.
type SelectionState = {
  rank: Record<string, number>;
  overrideSessionId: string | null;
};

export function useMostRecentMediaSession(
  allSessions: MediaSession[],
  zebarCurrentSession: MediaSession | null
) {
  const zebarSessionId = zebarCurrentSession?.sessionId ?? null;

  const [selection, setSelection] = useState<SelectionState>({
    rank: {},
    overrideSessionId: null,
  });
  const prevPlayingRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const prevPlaying = prevPlayingRef.current;

    setSelection((prev) => {
      let next = prev;

      const touch = () => {
        if (next === prev) {
          next = { ...prev, rank: { ...prev.rank } };
        }
      };

      // Evaluate the OS-designated session last so first-sight ties prefer it.
      const orderedSessions = zebarSessionId
        ? [
            ...allSessions.filter((s) => s.sessionId !== zebarSessionId),
            ...allSessions.filter((s) => s.sessionId === zebarSessionId),
          ]
        : allSessions;

      for (const session of orderedSessions) {
        const { sessionId } = session;
        const known = prev.rank[sessionId] !== undefined;
        const startedPlaying =
          session.isPlaying && prevPlaying[sessionId] === false;
        const firstSeenActive =
          !known && (session.isPlaying || sessionId === zebarSessionId);

        if (!startedPlaying && !firstSeenActive) continue;

        touch();
        next.rank[sessionId] = Math.max(0, ...Object.values(next.rank)) + 1;

        if (next.overrideSessionId && next.overrideSessionId !== sessionId) {
          next.overrideSessionId = null;
        }
      }

      const activeIds = new Set(
        allSessions.map((session) => session.sessionId)
      );
      for (const sessionId of Object.keys(next.rank)) {
        if (!activeIds.has(sessionId)) {
          touch();
          delete next.rank[sessionId];
        }
      }

      return next;
    });

    prevPlayingRef.current = Object.fromEntries(
      allSessions.map((session) => [session.sessionId, session.isPlaying])
    );
  }, [allSessions, zebarSessionId]);

  const mostRecentSessionId = useMemo(() => {
    let bestSessionId: string | null = null;
    let bestRank = 0;

    for (const session of allSessions) {
      const rank = selection.rank[session.sessionId];
      if (rank !== undefined && rank >= bestRank) {
        bestRank = rank;
        bestSessionId = session.sessionId;
      }
    }

    return bestSessionId;
  }, [allSessions, selection.rank]);

  const currentSession =
    allSessions.find(
      (session) => session.sessionId === selection.overrideSessionId
    ) ??
    allSessions.find((session) => session.sessionId === mostRecentSessionId) ??
    zebarCurrentSession ??
    allSessions[0];

  const cycleSession = () => {
    if (!currentSession) return;

    const currentIdx = Math.max(
      0,
      allSessions.findIndex(
        (session) => session.sessionId === currentSession.sessionId
      )
    );
    const nextIdx = currentIdx < allSessions.length - 1 ? currentIdx + 1 : 0;

    setSelection((prev) => ({
      ...prev,
      overrideSessionId: allSessions[nextIdx]?.sessionId ?? null,
    }));
  };

  return { currentSession, cycleSession };
}
