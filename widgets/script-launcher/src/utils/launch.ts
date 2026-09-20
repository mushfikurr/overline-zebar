import { logger, type LauncherCommand } from '@overline-zebar/config';
import type * as zebar from 'zebar';

export async function launch(
  application: LauncherCommand,
  glazewm: zebar.GlazeWmOutput | null
) {
  if (!glazewm) return;
  logger.log('Launching command', application.command, application.args);
  await glazewm.runCommand(
    `shell-exec ${application.command} ${application.args.join(' ')}`
  );
}
