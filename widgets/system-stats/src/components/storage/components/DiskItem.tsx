import { useEffect, useState } from 'react';
import { Card, CardTitle, Progress } from '@overline-zebar/ui';
import type { Disk } from 'zebar';

interface DiskItemProps {
  disk: Disk;
  initialAnimationDelay?: number;
}

export default function DiskItem({
  disk,
  initialAnimationDelay = 50,
}: DiskItemProps) {
  const totalSpaceValue = disk.totalSpace.siValue;
  const totalSpaceUnit = disk.totalSpace.siUnit;
  const availableSpaceValue = disk.availableSpace.siValue;
  const availableSpaceUnit = disk.availableSpace.siUnit;

  const availableSpaceFormatted = `${availableSpaceValue.toFixed(
    2
  )} ${availableSpaceUnit} free of ${totalSpaceValue.toFixed(
    2
  )} ${totalSpaceUnit}`;
  const driveTypeFormatted =
    disk.driveType === 'Unknown' ? '?' : disk.driveType;

  const usedSpace = disk.totalSpace.bytes - disk.availableSpace.bytes;
  const usedSpacePercentage = (usedSpace / disk.totalSpace.bytes) * 100;

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setProgress(usedSpacePercentage);
    }, initialAnimationDelay);

    return () => clearTimeout(timeout);
  }, [usedSpacePercentage]);

  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <CardTitle>
          <span className="w-full">
            {disk.name} ({disk.mountPoint})
          </span>
        </CardTitle>
        <p className="text-sm font-medium text-muted/20 tracking-wider flex items-center justify-center leading-none">
          {driveTypeFormatted}
        </p>
      </div>

      <div className="space-y-1.5">
        <Progress value={progress} />
        <p className="text-muted-foreground">{availableSpaceFormatted}</p>
      </div>
    </Card>
  );
}
