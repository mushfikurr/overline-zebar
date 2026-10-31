import { AnimatePresence, motion } from 'motion/react';
import type { MotionProps, Variants } from 'motion/react';
import { AppWindowIcon } from 'lucide-react';
import { forwardRef, useEffect, useRef, useState } from 'react';
import useMeasure from 'react-use-measure';
import { GlazeWmOutput } from 'zebar';
import { WindowControls } from './components/WindowControls';
import { cn } from '../../utils/cn';

// Direction-aware title swap: moving forward through the workspace strip
// (e.g. 1 -> 2) slides the new title in from the right; backward mirrors it;
// switching windows within a workspace has no direction and pure-fades.
// The exit runs ~2x faster than the enter so the old text is fully gone
// before the new one is mostly opaque (no crossfade ghosting), and a 2px
// blur during the swap masks the two text states blending. The enter starts
// at 0.975 scale (standards band: 0.9-0.97, never from 0) with the
// transform origin pinned to the entering side so the scale grows along
// the slide instead of fighting it.
const SWAP_EASE = [0.23, 1, 0.32, 1] as const;

const titleVariants: Variants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: 12 * dir,
    scale: 0.975,
    filter: 'blur(2px)',
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
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
// strong ease-out instead of a spring.
const widthTransition: MotionProps['transition'] = {
  duration: 0.26,
  ease: [0.23, 1, 0.32, 1],
};

// The wrapper keeps a REVEAL_BAND-wide strip past the text width. Its right
// end fades via mask and only overlaps text while the width tween runs —
// settled, the strip is empty and looks identical to no mask at all. A
// permanent mask means there is no class toggle to desync on interrupts or
// leave hanging on the last frame.
const REVEAL_BAND = 10;

// GlazeWM flaps while restoring a workspace: focused windows report late,
// so two or three titles can arrive within ~100ms of a workspace focus.
// Hold each title briefly and only commit a swap when it settles, so
// transient states never start an animation.
const TITLE_HOLD_MS = 80;

type WindowTitleProps = {
  glazewm: GlazeWmOutput | null;
};

export const WindowTitle = forwardRef<HTMLButtonElement, WindowTitleProps>(
  function WindowTitle({ glazewm }, ref) {
    const [show, setShow] = useState(false);
    const [measureRef, { width }] = useMeasure();

    const title = glazewm ? getWindowTitle(glazewm) : null;
    const titleKey = title ?? 'default-icon';
    const focusedName = glazewm?.focusedWorkspace?.name ?? null;
    // Unresolved focus state (entering a workspace that is being brought
    // back to life): there is no news worth committing — hold the last
    // title instead of rendering an intermediate one.
    const resolved = !!glazewm?.focusedWorkspace && !!glazewm?.focusedContainer;

    // Swap state commits only after TITLE_HOLD_MS of stability: `held`
    // drives the rendered swap (key, direction), `committed` is the base
    // the next swap's direction derives from.
    const [held, setHeld] = useState({
      titleKey: 'default-icon',
      workspaceName: null as string | null,
      title: null as string | null,
      dir: 0,
    });
    const firstRef = useRef(true);
    const committedRef = useRef({
      titleKey: 'default-icon',
      workspaceName: null as string | null,
      dir: 0,
    });

    useEffect(() => {
      if (!glazewm || !resolved) return;

      if (titleKey === committedRef.current.titleKey) {
        committedRef.current.workspaceName = focusedName;
        return;
      }

      const timer = setTimeout(
        () => {
          const prev = committedRef.current;
          let direction = prev.dir;
          if (
            focusedName &&
            prev.workspaceName &&
            focusedName !== prev.workspaceName
          ) {
            const order = glazewm.currentWorkspaces.map((w) => w.name);
            const nextIndex = order.indexOf(focusedName);
            const prevIndex = order.indexOf(prev.workspaceName);
            // A workspace not yet in the strip has no travel direction —
            // fade instead of guessing a side.
            direction =
              nextIndex === -1 || prevIndex === -1
                ? 0
                : Math.sign(nextIndex - prevIndex) || 0;
          }
          committedRef.current = {
            titleKey,
            workspaceName: focusedName,
            dir: direction,
          };
          setHeld({
            titleKey,
            workspaceName: focusedName,
            title,
            dir: direction,
          });
        },
        firstRef.current ? 0 : TITLE_HOLD_MS
      );
      firstRef.current = false;

      return () => clearTimeout(timer);
    }, [glazewm, titleKey, focusedName, title]);

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

    if (!glazewm) return;

    return (
      // Measured-width wrapper: the title never pops in at a new width — the
      // container tweens to size, wide enough to hold the reveal band.
      <motion.div
        initial={false}
        animate={{ width: width ? width + REVEAL_BAND : 'auto' }}
        transition={widthTransition}
        className="relative overflow-hidden h-full [mask-image:linear-gradient(to_right,black_calc(100%_-_10px),transparent_100%)]"
      >
        <div
          ref={measureRef}
          className={cn(
            width ? 'absolute' : 'relative',
            'w-max h-full flex items-center'
          )}
        >
          <AnimatePresence initial={false} mode="popLayout" custom={held.dir}>
            <motion.button
              ref={ref}
              key={held.titleKey}
              custom={held.dir}
              variants={titleVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{
                transformOrigin:
                  held.dir === 0
                    ? '50% 50%'
                    : held.dir > 0
                      ? '100% 50%'
                      : '0% 50%',
              }}
              className="font-medium relative h-full flex items-center cu"
              title={held.title ?? 'Focused Window'}
              onClick={(e: React.MouseEvent) =>
                handleWindowTitle(e, getWindowProcess(glazewm) ?? '')
              }
            >
              {held.title ?? <AppWindowIcon className="h-4 w-4 text-icon" />}
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

  // Entering a non-keep_alive workspace briefly reports no focused
  // container — reading through it would throw during render and blank
  // the title for a frame.
  if (!focusedWorkspace || !focusedContainer) return null;

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
