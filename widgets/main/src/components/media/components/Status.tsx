import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownUp, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { usePlayPause } from '../../../utils/usePlayPause';

export enum PlayPauseState {
  Played = 'played',
  Paused = 'paused',
}

export enum StatusAction {
  Previous = 'previous',
  Next = 'next',
  Switch = 'switch',
}

export function Status({ isPlaying }: { isPlaying: boolean }) {
  const { isPlaying: state, statusAction: trackAction } =
    usePlayPause(isPlaying);

  const icon = getIcon(trackAction, state);
  const key = trackAction ?? (state ? 'pause' : 'play');

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={key}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1.1 }} // 1.1 to mitigate the blurry icon
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.2 }}
      >
        <PlayPauseIcon LucideIcon={icon} />
      </motion.div>
    </AnimatePresence>
  );
}

function getIcon(trackAction: StatusAction | null, isPlaying: boolean) {
  if (trackAction) {
    if (trackAction === StatusAction.Previous) {
      return SkipBack;
    } else if (trackAction === StatusAction.Next) {
      return SkipForward;
    } else if (trackAction === StatusAction.Switch) {
      return ArrowDownUp;
    }
  }
  return isPlaying ? Pause : Play;
}

const PlayPauseIcon = ({ LucideIcon }: { LucideIcon: React.ElementType }) => (
  <LucideIcon className="text-icon h-3 w-3" strokeWidth={3} />
);
