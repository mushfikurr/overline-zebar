import { AnimatePresence, motion } from 'motion/react';
import type { MotionProps, Variants } from 'motion/react';
import { AppWindowIcon } from 'lucide-react';
import { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import useMeasure from 'react-use-measure';
import { GlazeWmOutput } from 'zebar';
import { WindowControls } from './components/WindowControls';
import { cn } from '../../utils/cn';

const SWAP_EASE = [0.23, 1, 0.32, 1] as const;
const SWAP_TRAVEL = 8;
const EXIT_TRAVEL = 3;

type SwapDir = { dx: number; dy: number };

const titleVariants: Variants = {
  enter: (dir: SwapDir) => ({
    opacity: 0,
    x: SWAP_TRAVEL * dir.dx,
    y: SWAP_TRAVEL * dir.dy,
    scale: 0.975,
    filter: 'blur(2px)',
  }),
  center: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.24, ease: SWAP_EASE },
  },
  exit: (dir: SwapDir) => ({
    opacity: 0,
    x: -EXIT_TRAVEL * dir.dx,
    y: -EXIT_TRAVEL * dir.dy,
    filter: 'blur(4px)',
    transition: { duration: 0.09, ease: SWAP_EASE },
  }),
};

// Tween the layout width while the text itself slides and fades freely.
const widthTransition: MotionProps['transition'] = {
  duration: 0.26,
  ease: [0.23, 1, 0.32, 1],
};

// GlazeWM flaps while restoring a workspace: focused windows report late,
// so two or three titles can arrive within ~100ms of a workspace focus.
// Only hold workspace fallbacks. A resolved window title should replace the
// previous one immediately, rather than displaying stale text for another 80ms.
const TITLE_HOLD_MS = 80;

const GEOMETRY_FADE_PX = 24;
const windowSwapDir = (
  allWindows: GlazeWmOutput['allWindows'],
  prevId: string,
  nextId: string
): SwapDir => {
  const prevWin = allWindows.find((w) => w.id === prevId);
  const nextWin = allWindows.find((w) => w.id === nextId);
  if (!prevWin || !nextWin) return { dx: 0, dy: 0 };
  const dx = nextWin.x + nextWin.width / 2 - (prevWin.x + prevWin.width / 2);
  const dy = nextWin.y + nextWin.height / 2 - (prevWin.y + prevWin.height / 2);
  if (Math.max(Math.abs(dx), Math.abs(dy)) < GEOMETRY_FADE_PX)
    return { dx: 0, dy: 0 };
  return Math.abs(dx) >= Math.abs(dy)
    ? { dx: Math.sign(dx), dy: 0 }
    : { dx: 0, dy: Math.sign(dy) };
};

type WindowTitleProps = {
  glazewm: GlazeWmOutput | null;
};

function hasResolvedFocus(glazewm: GlazeWmOutput | null): boolean {
  const workspace = glazewm?.focusedWorkspace;
  const focused = glazewm?.focusedContainer;
  if (!workspace || !focused) return false;
  if (focused.type === 'window' && !focused.title) return false;

  // Workspace activation and container focus arrive in separate provider
  // updates. Do not combine a new workspace with the previous container.
  const containsFocus = (
    container: GlazeWmOutput['focusedContainer']
  ): boolean =>
    container.id === focused.id ||
    ('children' in container && container.children.some(containsFocus));

  return containsFocus(workspace);
}

export const WindowTitle = forwardRef<HTMLButtonElement, WindowTitleProps>(
  function WindowTitle({ glazewm }, ref) {
    const [show, setShow] = useState(false);
    // The button scales on entry; its transformed bounds are not its layout width.
    const [measureRef, { width }] = useMeasure({ offsetSize: true });

    const title = glazewm ? getWindowTitle(glazewm) : null;
    const titleKey = title ?? 'default-icon';
    const focusedName = glazewm?.focusedWorkspace?.name ?? null;
    const resolved = hasResolvedFocus(glazewm);

    // `held` drives the rendered swap; `committed` is the base the next
    // swap's direction derives from. Ignore unresolved focus snapshots.
    const [held, setHeld] = useState({
      titleKey: 'default-icon',
      workspaceName: null as string | null,
      title: null as string | null,
      dir: { dx: 0, dy: 0 } as SwapDir,
    });
    const firstRef = useRef(true);
    const committedRef = useRef({
      titleKey: 'default-icon',
      workspaceName: null as string | null,
      windowId: null as string | null,
      dir: { dx: 0, dy: 0 } as SwapDir,
    });
    // GlazeWM drops non-keep_alive workspaces from currentWorkspaces after
    // leaving them. Retain the observed order so returning across several
    // such workspaces still has a stable direction.
    const workspaceOrderRef = useRef<string[]>([]);

    useLayoutEffect(() => {
      if (glazewm) {
        const seen = new Set(workspaceOrderRef.current);
        for (const workspace of glazewm.currentWorkspaces) {
          if (!seen.has(workspace.name)) {
            workspaceOrderRef.current.push(workspace.name);
            seen.add(workspace.name);
          }
        }
      }
      if (!glazewm || !resolved) return;

      const nextWindowId =
        glazewm.focusedContainer.type === 'window'
          ? glazewm.focusedContainer.id
          : null;

      if (titleKey === committedRef.current.titleKey) {
        committedRef.current.workspaceName = focusedName;
        committedRef.current.windowId = nextWindowId;
        return;
      }

      const commit = () => {
        const prev = committedRef.current;
        let direction: SwapDir = { dx: 0, dy: 0 };
        if (
          focusedName &&
          prev.workspaceName &&
          focusedName !== prev.workspaceName
        ) {
          const order = workspaceOrderRef.current;
          const nextIndex = order.indexOf(focusedName);
          const prevIndex = order.indexOf(prev.workspaceName);
          // Unknown workspaces fade; observed workspaces keep their position
          // in history even after GlazeWM removes them from the live list.
          direction =
            nextIndex === -1 || prevIndex === -1
              ? { dx: 0, dy: 0 }
              : { dx: Math.sign(nextIndex - prevIndex), dy: 0 };
        } else if (nextWindowId && prev.windowId) {
          direction = windowSwapDir(
            glazewm.allWindows,
            prev.windowId,
            nextWindowId
          );
        }
        committedRef.current = {
          titleKey,
          workspaceName: focusedName,
          windowId: nextWindowId,
          dir: direction,
        };
        setHeld({
          titleKey,
          workspaceName: focusedName,
          title,
          dir: direction,
        });
      };
      const delay = nextWindowId || firstRef.current ? 0 : TITLE_HOLD_MS;
      firstRef.current = false;

      if (!delay) {
        commit();
        return;
      }

      const timer = setTimeout(commit, delay);

      return () => clearTimeout(timer);
    }, [glazewm, resolved, titleKey, focusedName, title]);

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

    function setButtonRef(node: HTMLButtonElement | null) {
      measureRef(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    }

    // Retain AnimatePresence during provider gaps: remounting it would
    // show its first child immediately because initial={false}.
    if (!glazewm && held.title === null) return null;

    return (
      // Animate layout without clipping the incoming or outgoing title to
      // the intermediate width. This also leaves the blur's edges intact.
      <motion.div
        initial={false}
        animate={{ width: width || 'auto' }}
        transition={widthTransition}
        className="relative overflow-visible h-full"
      >
        <div
          className={cn(
            width ? 'absolute inset-0 justify-center' : 'relative w-max',
            'h-full flex items-center'
          )}
        >
          {/* Let the outgoing label finish before revealing the next one. */}
          <AnimatePresence initial={false} mode="wait" custom={held.dir}>
            <motion.button
              ref={setButtonRef}
              key={held.titleKey}
              custom={held.dir}
              variants={titleVariants}
              initial="enter"
              animate="center"
              exit="exit"
              // Keep Motion's exit on its JS driver. WAAPI can restore the
              // button's underlying opacity for a frame when a new focus
              // arrives before the previous exit finishes.
              onUpdate={() => {}}
              style={{
                transformOrigin:
                  held.dir.dy !== 0
                    ? '50% 50%'
                    : held.dir.dx > 0
                      ? '100% 50%'
                      : held.dir.dx < 0
                        ? '0% 50%'
                        : '50% 50%',
              }}
              className="font-medium relative h-full flex shrink-0 items-center w-max whitespace-nowrap cu"
              title={held.title ?? 'Focused Window'}
              onClick={(e: React.MouseEvent) =>
                handleWindowTitle(
                  e,
                  glazewm ? (getWindowProcess(glazewm) ?? '') : ''
                )
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

  if (focusedContainer?.type === ContainerType.WINDOW) {
    return focusedContainer.processName;
  }

  return null;
};

export default WindowTitle;
