import { Button } from '@overline-zebar/ui';
import { Power, Settings2, X } from 'lucide-react';
import { useState } from 'react';
import * as zebar from 'zebar';
import { cn } from '../../utils/cn';
import { logger } from '@overline-zebar/config/src/utils/logger';

export default function RightButtons() {
  const handleOpenSettings = () => {
    zebar.startWidgetPreset('config-widget', 'default');
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="icon" onClick={handleOpenSettings}>
        <Settings2 strokeWidth={3} className="h-4 w-4" />
      </Button>
      <PowerOffButton />
    </div>
  );
}

function PowerOffButton() {
  const [shuttingDown, setShuttingDown] = useState(false);

  const handlePowerOff = async () => {
    if (shuttingDown) {
      await zebar
        .shellSpawn('shutdown', '/a')
        .then((shellProcess) => {
          logger.log('Terminating OS shutdown');
          shellProcess.onStderr((line) => logger.log(line));
          setShuttingDown(false);
        })
        .catch((err) => {
          logger.error('Error executing OS shutdown');
          logger.error(err);
        });
    } else {
      await zebar
        .shellSpawn('shutdown', ['/s'])
        .then((shellProcess) => {
          logger.log('Executing OS shutdown');
          shellProcess.onStderr((line) => logger.log(line));
          setShuttingDown(true);
        })
        .catch((err) => {
          logger.error('Error executing OS shutdown');
          logger.error(err);
        });
    }
  };

  return (
    <Button
      size="icon"
      onClick={handlePowerOff}
      className={cn(shuttingDown && 'animate-pulse border-danger')}
    >
      {!shuttingDown ? (
        <Power strokeWidth={3} className="text-danger h-4 w-4" />
      ) : (
        <X strokeWidth={3} className="text-danger h-4 w-4" />
      )}
    </Button>
  );
}
