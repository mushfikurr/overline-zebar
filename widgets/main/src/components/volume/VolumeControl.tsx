import { Chip } from '@overline-zebar/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume, Volume1, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AudioOutput } from 'zebar';
import { cn } from '../../utils/cn';
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

  const renderIcon = () => {
    if (!playbackDevice) return null;
    if (playbackDevice.volume === 0) {
      return (
        <Volume className={statIconClassnames} size={16} strokeWidth={3} />
      );
    } else if (playbackDevice.volume > 0 && playbackDevice.volume < 60) {
      return (
        <Volume1 className={statIconClassnames} size={16} strokeWidth={3} />
      );
    } else {
      return (
        <Volume2 className={statIconClassnames} size={16} strokeWidth={3} />
      );
    }
  };

  if (!playbackDevice) return;

  return (
    <Chip
      ref={ref}
      as="button"
      onClick={handleClick}
      onWheel={handleWheel}
      className="outline-none pr-4"
    >
      <div className="flex items-center">
        <div>{renderIcon()}</div>

        <div
          className={cn(
            'transition duration-200 ease-in-out mx-1 w-full',
            expanded && 'mx-1.5'
          )}
        >
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden"
                transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
              >
                <Slider value={playbackDevice.volume} setValue={setVolume} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p>{playbackDevice.volume}%</p>
      </div>
    </Chip>
  );
}
