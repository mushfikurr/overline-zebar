import React from 'react';
import { MediaOutput } from 'zebar';
import { cn } from '../../utils/cn';
import { ConditionalPanel } from '../common/ConditionalPanel';
import { ProgressBar } from './components/ProgressBar';
import { Status } from './components/Status';
import { TitleDetails } from './components/TitleDetails';
import { Chip } from '@overline-zebar/ui';

export const TitleDetailsMemo = React.memo(TitleDetails);

type MediaProps = {
  media: MediaOutput;
};
// Alt+Click cycles sessions manually; otherwise the widget follows the session
// that started playing most recently. Play-state transitions are tracked
// ourselves because the OS/Zebar "current session" designation is sticky and
// doesn't reliably change when a second app starts playing.
export default function Media({ media }: MediaProps) {
  const {
    allSessions,
    togglePlayPause,
    next,
    previous,
    currentSession: zebarCurrentSession,
  } = media;
  const zebarSessionId = zebarCurrentSession?.sessionId ?? null;

  const [overrideSessionId, setOverrideSessionId] = React.useState<
    string | null
  >(null);
  const [, setActivationTick] = React.useState(0);

  const lastPlayedAtRef = React.useRef<Record<string, number>>({});
  const prevPlayingRef = React.useRef<Record<string, boolean>>({});

  React.useEffect(() => {
    const now = Date.now();

    if (
      zebarSessionId &&
      lastPlayedAtRef.current[zebarSessionId] === undefined
    ) {
      lastPlayedAtRef.current[zebarSessionId] = now + 1;
    }

    for (const session of allSessions) {
      const wasPlaying = prevPlayingRef.current[session.sessionId];

      if (session.isPlaying && !wasPlaying) {
        lastPlayedAtRef.current[session.sessionId] =
          now + (session.sessionId === zebarSessionId ? 1 : 0);
        setActivationTick(tick => tick + 1);
        setOverrideSessionId(prev =>
          prev && prev !== session.sessionId ? null : prev,
        );
      }
    }

    prevPlayingRef.current = Object.fromEntries(
      allSessions.map(session => [session.sessionId, session.isPlaying]),
    );

    const activeIds = new Set(allSessions.map(session => session.sessionId));
    for (const sessionId of Object.keys(lastPlayedAtRef.current)) {
      if (!activeIds.has(sessionId)) {
        delete lastPlayedAtRef.current[sessionId];
      }
    }
  }, [allSessions, zebarSessionId]);

  let mostRecentSessionId: string | null = null;
  let mostRecentPlayedAt = -Infinity;
  for (const session of allSessions) {
    const playedAt = lastPlayedAtRef.current[session.sessionId];
    if (playedAt !== undefined && playedAt >= mostRecentPlayedAt) {
      mostRecentPlayedAt = playedAt;
      mostRecentSessionId = session.sessionId;
    }
  }

  const currentSession =
    allSessions.find(session => session.sessionId === overrideSessionId) ??
    allSessions.find(session => session.sessionId === mostRecentSessionId) ??
    zebarCurrentSession ??
    allSessions[0];

  const handlePlayPause = (e: React.MouseEvent) => {
    if (!currentSession) return;

    if (e.shiftKey) {
      previous({ sessionId: currentSession.sessionId });
      return;
    }

    if (e.ctrlKey) {
      next({ sessionId: currentSession.sessionId });
      return;
    }

    if (e.altKey) {
      const currentIdx = Math.max(
        0,
        allSessions.findIndex(
          session => session.sessionId === currentSession.sessionId,
        ),
      );
      const nextIdx = currentIdx < allSessions.length - 1 ? currentIdx + 1 : 0;
      setOverrideSessionId(allSessions[nextIdx]?.sessionId ?? null);
      return;
    }

    togglePlayPause({ sessionId: currentSession.sessionId });
  };

  return (
    <button
      className={
        'flex gap-2 select-none cursor-pointer outline-none relative h-full'
      }
      onClick={(e) => {
        handlePlayPause(e);
      }}
    >
      <ConditionalPanel sessionActive={!!currentSession}>
        <Chip
          className={cn(
            'relative flex gap-1.5 select-none cursor-pointer overflow-clip group',
            'active:bg-background-deeper/90'
          )}
        >
          <Status isPlaying={currentSession?.isPlaying ?? false} />
          <TitleDetails
            title={currentSession?.title}
            artist={currentSession?.artist}
          />

          <ProgressBar currentSession={currentSession} />
        </Chip>
      </ConditionalPanel>
    </button>
  );
}
