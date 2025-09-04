import { logger } from '@overline-zebar/config/src/utils/logger';
import { Button } from '@overline-zebar/ui';
import { Power, X } from 'lucide-react';
import { useState } from 'react';
import * as zebar from 'zebar';
import { cn } from '../../utils/cn';

export default function RightButtons() {
  return (
    <div className="flex items-center gap-2">
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
