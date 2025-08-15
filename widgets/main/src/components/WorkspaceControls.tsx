import { useAppSetting, useWidgetSetting } from '@overline-zebar/config';
import { Chip } from '@overline-zebar/ui';
import { motion } from 'framer-motion';
import useMeasure from 'react-use-measure';
import { GlazeWmOutput } from 'zebar';
import { cn } from '../utils/cn';
import { ContainerType, formatWindowTitle } from './windowTitle/WindowTitle';

type WorkspaceControlsProps = {
  glazewm: GlazeWmOutput | null;
};

export function WorkspaceControls({ glazewm }: WorkspaceControlsProps) {
  if (!glazewm) return;
  const workspaces = glazewm.currentWorkspaces;
  const [dynamicWorkspaceIndicator] = useWidgetSetting(
    'main',
    'dynamicWorkspaceIndicator'
  );

  const [ref, { width }] = useMeasure();
  const springConfig = {
    type: 'spring',
    stiffness: 120,
    damping: 20,
    mass: 0.8,
  };

  const getDynamicWorkspaceName = (currentWorkspaceId: string) => {
    if (dynamicWorkspaceIndicator) {
      const workspaces = glazewm.allWorkspaces;
      const findWorkspace = workspaces.find((f) => f.id === currentWorkspaceId);

      if (!findWorkspace) {
        return undefined;
      }

      const windows = findWorkspace.children.filter(
        (w) => w.type === ContainerType.WINDOW
      );

      if (!windows || !windows.length) {
        return undefined;
      }

      const lastWindow = windows[0]; // fixed index
      const lastWindowTitle = lastWindow?.title;

      if (lastWindowTitle && lastWindow?.processName) {
        return formatWindowTitle(lastWindowTitle, lastWindow.processName);
      }
    }
    return undefined;
  };

  const handleWheel = (e: React.WheelEvent<HTMLButtonElement>) => {
    const delta = e.deltaY > 0 ? 1 : -1;
    const workspaceName = workspaces.indexOf(glazewm.focusedWorkspace);
    const newWorkspaceName = workspaces[workspaceName + delta]?.name;

    if (workspaces[workspaceName + delta]) {
      glazewm.runCommand(`focus --workspace ${newWorkspaceName}`);
    } else {
      const command =
        delta > 0 ? 'focus --next-workspace' : 'focus --prev-workspace';
      glazewm.runCommand(command);
    }
  };

  const [radius] = useAppSetting('radius');

  return (
    <motion.div
      key="workspace-control-panel"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: width || 'auto', opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={springConfig}
      className="relative overflow-hidden h-full rounded-2xl"
    >
      <Chip
        className={cn(
          width ? 'absolute' : 'relative',
          'flex items-center select-none overflow-hidden p-0 px-1 py-1 h-full space-x-1'
        )}
        as="div"
        ref={ref}
        onWheel={handleWheel}
      >
        {workspaces.map((workspace) => {
          const isFocused = workspace.hasFocus;
          return (
            <button
              key={workspace.name}
              onClick={() =>
                glazewm.runCommand(`focus --workspace ${workspace.name}`)
              }
              className={cn(
                'relative transition duration-500 ease-in-out text-text-muted h-full',
                isFocused
                  ? 'text-primary-text hover:text-primary-text'
                  : 'hover:text-text',
                isFocused &&
                  'duration-700 transition-all ease-in-out font-medium'
              )}
              style={{
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {isFocused && (
                <motion.span
                  layoutId="bubble"
                  className={cn(
                    'bg-primary inset-0 border-primary-border drop-shadow-sm absolute -z-10',
                    isFocused && 'hover:bg-primary'
                  )}
                  style={{
                    borderRadius:
                      parseFloat(radius) > 0 ? `calc(${radius} + 0.25rem)` : 0,
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              <p className="z-10 max-w-40 truncate px-2">
                {getDynamicWorkspaceName(workspace.id) ??
                  workspace.displayName ??
                  workspace.name}
              </p>
            </button>
          );
        })}
      </Chip>
    </motion.div>
  );
}
