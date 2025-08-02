import { Chip } from '@overline-zebar/ui';
import { motion } from 'framer-motion';
import useMeasure from 'react-use-measure';
import { GlazeWmOutput } from 'zebar';
import { cn } from '../utils/cn';

type WorkspaceControlsProps = {
  glazewm: GlazeWmOutput | null;
};
export function WorkspaceControls({ glazewm }: WorkspaceControlsProps) {
  if (!glazewm) return;
  const workspaces = glazewm.currentWorkspaces;

  const [ref, { width }] = useMeasure();
  const springConfig = {
    type: 'spring',
    stiffness: 120,
    damping: 20,
    mass: 0.8,
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

  return (
    <motion.div
      key="workspace-control-panel"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: width || 'auto', opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={springConfig}
      className="relative overflow-hidden h-full"
    >
      <Chip
        className={cn(
          width ? 'absolute' : 'relative',
          'flex items-center select-none overflow-hidden p-1 h-full'
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
                'relative px-2.5 transition duration-500 ease-in-out text-text-muted h-full',
                isFocused ? '' : 'hover:text-text',
                isFocused &&
                  'text-text duration-700 transition-all ease-in-out font-medium'
              )}
              style={{
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {isFocused && (
                <motion.span
                  layoutId="bubble"
                  className={cn(
                    'bg-primary inset-0 rounded-[0.75rem] border-primary-border drop-shadow-sm absolute -z-10',
                    isFocused && 'hover:bg-primary'
                  )}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              <p className={cn('z-10')}>
                {workspace.displayName ?? workspace.name}
              </p>
            </button>
          );
        })}
      </Chip>
    </motion.div>
  );
}
