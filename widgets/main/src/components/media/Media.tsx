import React from 'react';
import { MediaOutput } from 'zebar';
import { cn } from '../../utils/cn';
import { useMostRecentMediaSession } from '../../utils/useMostRecentMediaSession';
import { ConditionalPanel } from '../common/ConditionalPanel';
import { ProgressBar } from './components/ProgressBar';
import { Status } from './components/Status';
import { TitleDetails } from './components/TitleDetails';
import { Chip } from '@overline-zebar/ui';

export const TitleDetailsMemo = React.memo(TitleDetails);

type MediaProps = {
  media: MediaOutput;
};

export default function Media({ media }: MediaProps) {
  const {
    allSessions,
    togglePlayPause,
    next,
    previous,
    currentSession: zebarCurrentSession,
  } = media;
  const { currentSession, cycleSession } = useMostRecentMediaSession(
    allSessions,
    zebarCurrentSession,
  );

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
      cycleSession();
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
