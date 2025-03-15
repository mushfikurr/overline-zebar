import { motion } from "framer-motion";
import { Workspace } from "glazewm";
import { GlazeWmOutput } from "zebar";
import { cn } from "../utils/cn";
import { buttonStyles } from "./common/Button";
import { Chip } from "./common/Chip";
import useMeasure from "react-use-measure";

interface WorkspaceControlsProps {
  glazewm: GlazeWmOutput | null;
}

export function WorkspaceControls({ glazewm }: WorkspaceControlsProps) {
  if (!glazewm) return null;
  const workspaces = glazewm.allWorkspaces;

  const [ref, { width }] = useMeasure();
  const springConfig = {
    type: "spring",
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
        delta > 0 ? "focus --next-workspace" : "focus --prev-workspace";
      glazewm.runCommand(command);
    }
  };

  return (
    <motion.div
      key="workspace-control-panel"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: width || "auto", opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={springConfig}
      className="relative overflow-hidden h-full"
    >
      <Chip
        className={cn(
          width ? "absolute" : "relative",
          "flex items-center gap-1.5 select-none overflow-hidden px-[1px] h-full"
        )}
        as="div"
        ref={ref}
        onWheel={handleWheel}
      >
        {glazewm.allWorkspaces?.map((workspace: Workspace, idx) => {
          const isFocused = workspace.hasFocus;
          return (
            <button
              key={workspace.name}
              onClick={() =>
                glazewm.runCommand(`focus --workspace ${workspace.name}`)
              }
              className={cn(
                "relative rounded-xl px-2 transition duration-500 ease-in-out text-text/80 h-full",
                isFocused ? "" : "hover:text-text",
                isFocused &&
                  "text-icon duration-700 transition-all ease-in-out font-medium"
              )}
              style={{
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <p className={cn("z-10")}>
                {workspace.displayName ?? workspace.name}
              </p>

              {isFocused && (
                <motion.span
                  layoutId="bubble"
                  className={cn(
                    buttonStyles,
                    "bg-background-subtle/70 border-text/10 drop-shadow-sm rounded-[0.5rem] absolute inset-0 -z-10",
                    isFocused && "hover:bg-background-subtle"
                  )}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </Chip>
    </motion.div>
  );
}
