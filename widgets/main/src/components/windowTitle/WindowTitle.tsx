import { AnimatePresence, motion } from 'motion/react';
import type { MotionProps, Variants } from 'motion/react';
import { AppWindowIcon } from 'lucide-react';
import { forwardRef, useRef, useState } from 'react';
import useMeasure from 'react-use-measure';
import { GlazeWmOutput } from 'zebar';
import { WindowControls } from './components/WindowControls';
import { cn } from '../../utils/cn';

// Direction-aware title swap: moving forward through the workspace strip
// (e.g. 1 -> 2) slides the new title in from the right; backward mirrors it;
// switching windows within a workspace has no direction and pure-fades.
// The exit runs ~2x faster than the enter so the old text is fully gone
// before the new one is mostly opaque (no crossfade ghosting), and a 2px
// blur during the swap masks the two text states blending.
const SWAP_EASE = [0.23, 1, 0.32, 1] as const;

const titleVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: 12 * dir, filter: 'blur(2px)' }),
  center: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.24, ease: SWAP_EASE },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: -12 * dir,
    filter: 'blur(2px)',
    transition: { duration: 0.12, ease: SWAP_EASE },
  }),
};

// Width reveal is predetermined state, not gesture-driven: tween with a
// strong ease-out instead of a spring. While it runs, the wrapper clips the
// text — soften that edge with a gradient mask instead of a hard cut.
const widthTransition: MotionProps['transition'] = {
  duration: 0.26,
  ease: [0.23, 1, 0.32, 1],
};

const REVEAL_MASK =
  '[mask-image:linear-gradient(to_right,black_calc(100%_-_10px),transparent_100%)]';

type WindowTitleProps = {
  glazewm: GlazeWmOutput | null;
};

export const WindowTitle = forwardRef<HTMLButtonElement, WindowTitleProps>(
  function WindowTitle({ glazewm }, ref) {
    const [show, setShow] = useState(false);
    const [revealing, setRevealing] = useState(false);
    const [measureRef, { width }] = useMeasure();

    // Derived during render so the direction is known in the same render as
    // the key change (an effect would always lag one swap behind).
    const swapRef = useRef({
      titleKey: '',
      workspaceName: null as string | null,
      dir: 0,
    });

    if (!glazewm) return;

    const title = getWindowTitle(glazewm);
    const titleKey = title ?? 'default-icon';
    const focusedName = glazewm.focusedWorkspace?.name ?? null;

    const prev = swapRef.current;
    let direction = prev.dir;
    if (titleKey !== prev.titleKey) {
      direction = 0;
      if (
        focusedName &&
        prev.workspaceName &&
        focusedName !== prev.workspaceName
      ) {
        const order = glazewm.currentWorkspaces.map((w) => w.name);
        const delta =
          order.indexOf(focusedName) - order.indexOf(prev.workspaceName);
        direction = Math.sign(delta) || 0;
      }
    }
    swapRef.current = { titleKey, workspaceName: focusedName, dir: direction };

    function handleWindowTitle(e: React.MouseEvent, textToCopy: string) {
      if (e.altKey) {
        navigator.clipboard
          .writeText(textToCopy)
          .then(() => {
            console.log(`Copied to clipboard: ${textToCopy}`);
          })
          .catch((err) => {
            console.error('Failed to copy text to clipboard:', err);
          });
        return;
      }

      setShow(!show);
    }

    return (
      // Measured-width wrapper: the title never pops in at a new width — the
      // container tweens to size. While tweening, a gradient mask fades the
      // clip edge instead of slicing text with a hard overflow cut.
      <motion.div
        initial={false}
        animate={{ width: width || 'auto' }}
        transition={widthTransition}
        onAnimationStart={() => setRevealing(true)}
        onAnimationComplete={() => setRevealing(false)}
        className={cn(
          'relative overflow-hidden h-full',
          revealing && REVEAL_MASK
        )}
      >
        <div
          ref={measureRef}
          className={cn(
            width ? 'absolute' : 'relative',
            'w-max h-full flex items-center'
          )}
        >
          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            <motion.button
              ref={ref}
              key={titleKey}
              custom={direction}
              variants={titleVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="font-medium relative h-full flex items-center cu"
              title={title ?? 'Focused Window'}
              onClick={(e: React.MouseEvent) =>
                handleWindowTitle(e, getWindowProcess(glazewm) ?? '')
              }
            >
              {title ?? <AppWindowIcon className="h-4 w-4 text-icon" />}
              <WindowControls
                glazewm={glazewm}
                show={show}
                setShow={setShow}
                parentRef={ref}
              />
            </motion.button>
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }
);

export enum ContainerType {
  ROOT = 'root',
  MONITOR = 'monitor',
  WORKSPACE = 'workspace',
  SPLIT = 'split',
  WINDOW = 'window',
}

const SPLIT_WINDOW_PROCESS_EXCLUSIONS = ['Spotify'];
const SPLIT_WINDOW_TITLE_REGEX = /[-—]/;

export const formatWindowTitle = (title: string, process: string) => {
  const isExcluded =
    typeof title === 'string' &&
    SPLIT_WINDOW_PROCESS_EXCLUSIONS.some((exclusion) =>
      process.startsWith(exclusion)
    );

  const splitWindowTitle = title?.split(SPLIT_WINDOW_TITLE_REGEX) || [];

  const lastSplitWindowTitle = isExcluded
    ? process
    : (splitWindowTitle.at(-1) ?? title);

  return lastSplitWindowTitle;
};

const getWindowTitle = (glazewm: GlazeWmOutput): string | null => {
  const focusedWorkspace = glazewm.focusedWorkspace;
  const focusedContainer = glazewm.focusedContainer;

  if (focusedContainer.type === ContainerType.WINDOW) {
    return formatWindowTitle(
      focusedContainer.title,
      focusedContainer.processName
    );
  }

  // If the focused container is not a window, return workspace displayName. If displayName is not available, fallback to workspace name.
  const focusedWorkspaceDisplayName = focusedWorkspace.displayName
    ? focusedWorkspace.displayName
    : `Workspace ${focusedWorkspace.name}`;
  return focusedWorkspaceDisplayName;
};

const getWindowProcess = (glazewm: GlazeWmOutput): string | null => {
  const focusedContainer = glazewm.focusedContainer;

  if (focusedContainer.type === ContainerType.WINDOW) {
    return focusedContainer.processName;
  }

  return null;
};

export default WindowTitle;
