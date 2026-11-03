import { useState, useEffect } from 'react';
import { MediaSession } from 'zebar';

export function ProgressBar({
  currentSession,
}: {
  currentSession: MediaSession | undefined;
}) {
  const [progress, setProgress] = useState<number>(
    currentSession?.position ?? 0
  );

  useEffect(() => {
    if (!currentSession?.position) {
      setProgress(0);
      return;
    }

    setProgress(currentSession.position);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < currentSession.endTime) {
          if (!currentSession.isPlaying) {
            return prev;
          }
          return prev + 1;
        } else {
          setProgress(0);
          clearInterval(interval);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession, currentSession?.position]);

  const fraction = currentSession
    ? Math.min(1, progress / currentSession.endTime || 0)
    : 0;

  return (
    <div
      className="absolute h-[1.5px] w-full bg-primary bottom-0 left-0 origin-left transition-transform duration-200 ease-out"
      style={{ transform: `scaleX(${fraction})` }}
    ></div>
  );
}
