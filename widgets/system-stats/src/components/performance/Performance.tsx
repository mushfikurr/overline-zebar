import { Card, CardTitle } from '@overline-zebar/ui';
import {
  BarChart3,
  Brain,
  CpuIcon,
  HardDriveDownload,
  MemoryStick,
  Zap,
} from 'lucide-react';
import { CpuOutput, MemoryOutput } from 'zebar';
import { PanelLayout } from '@overline-zebar/ui';

interface PerformanceProps {
  cpu: CpuOutput | null;
  memory: MemoryOutput | null;
}

export default function Performance({ cpu, memory }: PerformanceProps) {
  return (
    <PanelLayout title="Performance" className="space-y-3">
      <Memory memory={memory} />
      <Cpu cpu={cpu} />
    </PanelLayout>
  );
}

function Memory({ memory }: { memory: MemoryOutput | null }) {
  if (!memory) {
    return (
      <div className="flex flex-col justify-center items-center select-text w-full text-text-muted h-full">
        <p>Memory information not available.</p>
      </div>
    );
  }

  const toGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(1);
  const swapUsage =
    memory.totalSwap > 0
      ? ((memory.totalSwap - memory.freeSwap) / memory.totalSwap) * 100
      : 0;

  return (
    <div>
      <h3 className="font-medium flex items-center text-text-muted gap-2 mb-1.5">
        <MemoryStick className="h-5 w-5" aria-hidden="true" />
        Memory
      </h3>

      <div className="flex gap-2 mb-1.5">
        <Card>
          <CardTitle Icon={Brain}>Total</CardTitle>
          {`${toGB(memory.freeMemory)} GB`} / {`${toGB(memory.totalMemory)} GB`}
        </Card>
      </div>
      <div className="flex gap-2">
        <Card>
          <CardTitle Icon={BarChart3}>Memory Usage</CardTitle>
          {`${toGB(memory.totalMemory - memory.freeMemory)} GB`}{' '}
          {`(${memory.usage.toFixed(1)}%)`}
        </Card>
        <Card>
          <CardTitle Icon={HardDriveDownload}>Swap Usage</CardTitle>
          {`${toGB(memory.totalSwap - memory.freeSwap)} GB`}{' '}
          {`(${swapUsage.toFixed(1)}%)`}
        </Card>
      </div>
    </div>
  );
}

function Cpu({ cpu }: { cpu: CpuOutput | null }) {
  if (!cpu) {
    return (
      <div className="flex flex-col justify-center items-center select-text w-full text-text-muted h-full">
        <p>CPU information not available.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-medium flex items-center text-text-muted gap-2 mb-1.5">
        <CpuIcon className="h-5 w-5" aria-hidden="true" />
        CPU
      </h3>

      {cpu.vendor && <h1 className="font-medium mb-1.5">{cpu.vendor}</h1>}
      <div className="flex gap-2 mb-1.5">
        <Card>
          <CardTitle Icon={BarChart3}>Usage</CardTitle>
          {`${cpu.usage.toFixed(1)}%`}
        </Card>
        <Card>
          <CardTitle Icon={Zap}>Frequency</CardTitle>
          {`${cpu.frequency} GHz`}
        </Card>
      </div>
      <div className="flex gap-2">
        <Card>
          <CardTitle Icon={Brain}>Logical Cores</CardTitle>
          {`${cpu.logicalCoreCount}`}
        </Card>
        <Card>
          <CardTitle Icon={Brain}>Physical Cores</CardTitle>
          {`${cpu.physicalCoreCount}`}
        </Card>
      </div>
    </div>
  );
}
