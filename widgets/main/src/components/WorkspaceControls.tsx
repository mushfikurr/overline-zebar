import { useWidgetSetting } from '@overline-zebar/config';
import { chipStyles } from '@overline-zebar/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { GlazeWmOutput } from 'zebar';
import { tailwindConfig } from '../main';
import { cn } from '../utils/cn';
import { ContainerType, formatWindowTitle } from './windowTitle/WindowTitle';

type WorkspaceControlsProps = {
  glazewm: GlazeWmOutput | null;
};

export function WorkspaceControls({ glazewm }: WorkspaceControlsProps) {
  if (!glazewm) return null;

  const workspaces = glazewm.currentWorkspaces;
  const focusedWorkspace = glazewm.focusedWorkspace;
  const [dynamicWorkspaceIndicator] = useWidgetSetting(
    'main',
    'dynamicWorkspaceIndicator'
  );

  const borderRadius = tailwindConfig.theme.borderRadius['2xl'];
  const springConfig = { type: 'spring', stiffness: 300, damping: 30 };

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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={springConfig}
        layout="size"
        className={cn(
          chipStyles,
          'flex items-center gap-1 p-1 h-full rounded-2xl select-none overflow-hidden transition-[width] duration-200 ease-out'
        )}
      >
        {workspaces.map((workspace) => {
          const isActive = workspace.hasFocus;
          const label =
            getDynamicWorkspaceName(workspace.id) ??
            workspace.displayName ??
            workspace.name;

          return (
            <motion.button
              key={workspace.name}
              transition={springConfig}
              onClick={() =>
                glazewm.runCommand(`focus --workspace ${workspace.name}`)
              }
              className="relative touch-hitbox flex items-center justify-center px-1 max-w-[10rem] h-full"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isActive && (
                <motion.span
                  layoutId="activeWorkspace"
                  transition={springConfig}
                  className="absolute w-full h-full inset-0 bg-primary border border-primary-border drop-shadow-sm z-0"
                  style={{ borderRadius: `calc(${borderRadius} - 0.25rem)` }}
                />
              )}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'relative z-10 truncate px-0.5 w-full h-full leading-none text-center flex items-center justify-center',
                  'transition-colors ease-in-out duration-200',
                  isActive
                    ? 'text-primary-text font-medium'
                    : 'text-text-muted hover:text-text transition-colors'
                )}
              >
                {label}
              </motion.span>
            </motion.button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
