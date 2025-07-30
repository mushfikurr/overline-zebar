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
  media: MediaOutput | null;
};
// To allow cycling of Media sessions with Alt+Click we have to handle our own current session
// This is why there are two current sessions defined here:
// zebarCurrentSession: The actual session given from the Media provider.
// currentSession: Our own local state of Zebar session.
// This is not ideal and hopefully future Zebar releases will provide a way to change sessions internally.
export default function Media({ media }: MediaProps) {
  if (!media) return;
  const {
    allSessions,
    togglePlayPause,
    next,
    previous,
    currentSession: zebarCurrentSession,
  } = media;
  const zebarCurrentSessionIdx = allSessions.findIndex(
    (s) => s.sessionId === zebarCurrentSession?.sessionId
  );
  const [currentSessionIdx, setCurrentSessionIdx] = React.useState<number>(
    zebarCurrentSessionIdx === -1 ? 0 : zebarCurrentSessionIdx
  );
  const currentSession = allSessions[currentSessionIdx];

  const handlePlayPause = (e: React.MouseEvent, currentSessionIdx: number) => {
    const currentSession = allSessions[currentSessionIdx];

    if (e.shiftKey) {
      previous({ sessionId: currentSession?.sessionId });
      return;
    }

    if (e.ctrlKey) {
      next({ sessionId: currentSession?.sessionId });
      return;
    }

    if (e.altKey) {
      if (currentSessionIdx < allSessions.length - 1) {
        setCurrentSessionIdx((prev) => prev + 1);
      } else {
        setCurrentSessionIdx(0);
      }
      return;
    }

    if (currentSession) {
      togglePlayPause({ sessionId: currentSession.sessionId });
    }
  };

  return (
    <button
      className={
        'flex gap-2 select-none cursor-pointer outline-none relative h-full'
      }
      onClick={(e) => {
        handlePlayPause(e, currentSessionIdx);
      }}
    >
      <ConditionalPanel sessionActive={!!currentSession}>
        <Chip
          className={cn(
            'relative flex gap-2 select-none cursor-pointer overflow-clip group',
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
