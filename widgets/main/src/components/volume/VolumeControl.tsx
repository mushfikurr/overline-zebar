import { Chip } from '@overline-zebar/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume, Volume1, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AudioOutput } from 'zebar';
import Slider from './components/Slider';

export default function VolumeControl({
  statIconClassnames,
  audio,
}: {
  statIconClassnames: string;
  audio: AudioOutput | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [preMuteVolume, setPreMuteVolume] = useState(50);
  const ref = useRef<HTMLButtonElement>(null);

  // Close the slider when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!audio) return;

  const { setVolume, defaultPlaybackDevice: playbackDevice } = audio;

  if (!playbackDevice) return;

  const handleWheel = (e: React.WheelEvent<HTMLButtonElement>) => {
    if (!playbackDevice) return;

    const delta = e.deltaY > 0 ? -3 : 3;
    setVolume(Math.min(Math.max(playbackDevice.volume + delta, 0), 100));
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!playbackDevice) return;

    if (e.shiftKey) {
      if (playbackDevice.volume > 0) {
        setPreMuteVolume(playbackDevice.volume);
        setVolume(0);
      } else {
        setVolume(preMuteVolume);
      }
      return;
    }

    setExpanded(!expanded);
  };

  const handleDoubleClick = () => {
    if (!playbackDevice) return;
    setVolume(100);
  };

  const renderIcon = () => {
    if (playbackDevice.volume === 0) {
      return <Volume className={statIconClassnames} strokeWidth={3} />;
    } else if (playbackDevice.volume > 0 && playbackDevice.volume < 60) {
      return <Volume1 className={statIconClassnames} strokeWidth={3} />;
    } else {
      return <Volume2 className={statIconClassnames} strokeWidth={3} />;
    }
  };

  return (
    <Chip
      ref={ref}
      as="button"
      onClick={handleClick}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      className="outline-none"
    >
      <div className="flex items-center">
        <div>{renderIcon()}</div>

        <div>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ width: 0, marginLeft: 0, opacity: 0 }}
                animate={{ width: 'auto', marginLeft: '6px', opacity: 1 }}
                exit={{ width: 0, marginLeft: 0, opacity: 0 }}
                className="overflow-hidden"
                transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
              >
                <Slider value={playbackDevice.volume} setValue={setVolume} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Chip>
  );
}
