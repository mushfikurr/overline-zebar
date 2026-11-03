import { Chip, iconFeedback, iconSwap } from '@overline-zebar/ui';
import { AnimatePresence, motion } from 'motion/react';
import { Volume, Volume1, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AudioOutput } from 'zebar';
import Slider from './components/Slider';
import { ConditionalPanel } from '../common/ConditionalPanel';

export default function VolumeControl({
  iconClassnames,
  audio,
}: {
  iconClassnames: string;
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

  const volumeLevel =
    playbackDevice.volume === 0
      ? 'muted'
      : playbackDevice.volume < 60
        ? 'low'
        : 'high';

  const VolumeIcon =
    volumeLevel === 'muted'
      ? Volume
      : volumeLevel === 'low'
        ? Volume1
        : Volume2;

  return (
    <Chip
      ref={ref}
      as="button"
      onClick={handleClick}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      className="outline-none active:bg-background-deeper/90"
    >
      <div className="flex items-center">
        <div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={volumeLevel} {...iconSwap} {...iconFeedback}>
              <VolumeIcon className={iconClassnames} strokeWidth={3} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="h-4">
          <ConditionalPanel sessionActive={expanded} subtleExit>
            <div className="h-full flex items-center pl-1.5">
              <Slider value={playbackDevice.volume} setValue={setVolume} />
            </div>
          </ConditionalPanel>
        </div>
      </div>
    </Chip>
  );
}
