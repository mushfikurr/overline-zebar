import { AppIcon, IconSquare } from '../../../../icons';
import { LauncherCommand } from '@overline-zebar/config/src/types';
import { resolveIconBackground } from '@overline-zebar/config/src/utils/icon-backgrounds';
import {
  Tooltip,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipTrigger,
} from '@overline-zebar/ui';
import { MouseEventHandler, useEffect, useRef, useState } from 'react';

/**
 * The visual identity of a script: icon tile, title, command, and argument
 * chips. Shared by the settings list and the edit modal's live preview so
 * the two can never drift apart.
 */
export function ScriptItemContent({
  app,
  fallbackTitle = app.title,
}: {
  app: LauncherCommand;
  fallbackTitle?: string;
}) {
  const visibleArgs = app.args.filter((arg) => arg.trim() !== '');
  const { background } = resolveIconBackground(app.iconColor);
  const [copied, setCopied] = useState(false);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyResetTimer.current !== null) clearTimeout(copyResetTimer.current);
    };
  }, []);

  const handleCopyCommand: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    navigator.clipboard
      .writeText(app.command)
      .then(() => {
        setCopied(true);
        if (copyResetTimer.current !== null) {
          clearTimeout(copyResetTimer.current);
        }
        copyResetTimer.current = setTimeout(() => setCopied(false), 1000);
      })
      .catch((err) => {
        console.error('Failed to copy command to clipboard:', err);
      });
  };

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {background ? (
        <IconSquare app={app} className="size-9" glyphClassName="size-5" />
      ) : (
        <span className="border-border bg-background-deeper flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border">
          <AppIcon app={app} className="size-5" />
        </span>
      )}
      <div className="flex min-w-0 flex-col items-start gap-1.5">
        <span className="max-w-full truncate text-sm font-medium leading-none">
          {fallbackTitle}
        </span>
        {app.command && (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={handleCopyCommand}
                  aria-label={`Copy command to clipboard: ${app.command}`}
                  className={`-ml-1.5 block max-w-full cursor-pointer truncate rounded-sm bg-background-deeper px-1.5 py-0.5 text-xs leading-none outline-none transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-primary/50 ${
                    copied
                      ? 'text-success'
                      : 'text-text-muted hover:bg-button/60 hover:text-text'
                  }`}
                >
                  {app.command}
                </button>
              }
            />
            <TooltipPortal>
              <TooltipPositioner>
                <TooltipPopup>
                  {copied ? 'Copied to clipboard' : app.command}
                </TooltipPopup>
              </TooltipPositioner>
            </TooltipPortal>
          </Tooltip>
        )}
        {visibleArgs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {visibleArgs.map((arg, index) => (
              <span
                key={index}
                className="border-border bg-background-deeper text-text w-fit rounded-md border px-1.5 py-0.5 text-xs leading-none"
              >
                {arg}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
