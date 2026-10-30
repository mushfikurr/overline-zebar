import { useWidgetSetting } from '@overline-zebar/config';
import {
  chipStyles,
  fadeSwap,
  iconFeedback,
  springLayout,
} from '@overline-zebar/ui';
import { AnimatePresence, motion } from 'motion/react';
import { GlazeWmOutput } from 'zebar';
import { tailwindConfig } from '../main';
import { cn } from '../utils/cn';
import { ContainerType, formatWindowTitle } from './windowTitle/WindowTitle';

type WorkspaceControlsProps = {
  glazewm: GlazeWmOutput | null;
};

export function WorkspaceControls({ glazewm }: WorkspaceControlsProps) {
  const [dynamicWorkspaceIndicator] = useWidgetSetting(
    'main',
    'dynamicWorkspaceIndicator'
  );

  if (!glazewm) return null;

  const isPaused = glazewm.isPaused;

  const workspaces = glazewm.currentWorkspaces;
  const focusedWorkspace = glazewm.focusedWorkspace;

  const borderRadius = tailwindConfig.theme.borderRadius['2xl'];
  const innerBorderRadius = `calc(${borderRadius} - 0.25rem)`;

  const getDynamicWorkspaceName = (id: string) => {
    if (!dynamicWorkspaceIndicator) return undefined;
    const target = glazewm.allWorkspaces.find((w) => w.id === id);
    if (!target) return undefined;

    const windows = target.children.filter(
      (w) => w.type === ContainerType.WINDOW
    );
    if (!windows.length) return undefined;

    const win = windows[0];
    if (win?.title && win?.processName) {
      return formatWindowTitle(win.title, win.processName);
    }
    return undefined;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isPaused) return;

    const delta = e.deltaY > 0 ? 1 : -1;
    const index = workspaces.indexOf(focusedWorkspace);
    const next = workspaces[index + delta];
    if (next) {
      glazewm.runCommand(`focus --workspace ${next.name}`);
    } else {
      const command =
        delta > 0 ? 'focus --next-workspace' : 'focus --prev-workspace';
      glazewm.runCommand(command);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        onWheel={handleWheel}
        {...fadeSwap}
        transition={{
          ...springLayout,
          layout: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
        }}
        layout="size"
        style={{ borderRadius }}
        className={cn(
          chipStyles,
          'flex items-center gap-1 p-1 h-full select-none overflow-hidden'
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {workspaces.map((workspace) => {
            const isActive = workspace.hasFocus;
            const label =
              getDynamicWorkspaceName(workspace.id) ??
              workspace.displayName ??
              workspace.name;

            return (
              <motion.button
                key={workspace.name}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: isPaused ? 0.5 : 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={springLayout}
                aria-disabled={isPaused}
                onClick={() => {
                  if (isPaused) return;
                  glazewm.runCommand(`focus --workspace ${workspace.name}`);
                }}
                className={cn(
                  'relative touch-hitbox flex items-center justify-center px-1 min-w-0 max-w-[10rem] h-full transition-[filter] duration-200 ease-out',
                  isPaused && 'saturate-50 cursor-not-allowed'
                )}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeWorkspace"
                    transition={springLayout}
                    className="absolute w-full h-full inset-0 bg-primary border border-primary-border drop-shadow-sm z-0"
                    style={{ borderRadius: innerBorderRadius }}
                  />
                )}
                <motion.span
                  {...fadeSwap}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'relative z-10 px-0.5 w-full h-full leading-none text-center flex items-center justify-center',
                    'transition-colors ease-in-out duration-200',
                    isActive
                      ? 'text-primary-text font-medium'
                      : cn('text-text-muted', !isPaused && 'hover:text-text')
                  )}
                >
                  <span className="truncate block min-w-0">{label}</span>
                </motion.span>
              </motion.button>
            );
          })}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {isPaused && (
            <motion.button
              key="resume"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              {...iconFeedback}
              onClick={() => glazewm.runCommand('wm-toggle-pause')}
              aria-label="Resume GlazeWM"
              title="Resume GlazeWM"
              className="relative z-10 flex h-full shrink-0 items-center justify-center whitespace-nowrap border border-button-border bg-button px-1.5 text-text shadow-xs cursor-pointer transition-colors ease-in-out duration-200 hover:bg-background/90"
              style={{ borderRadius: innerBorderRadius }}
            >
              <span className="px-0.5 leading-none font-medium">Resume</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
