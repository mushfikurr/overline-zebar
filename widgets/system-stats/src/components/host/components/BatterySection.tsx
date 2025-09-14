import { Battery, Cable, Heart, PlugZap, RefreshCcw, Zap } from 'lucide-react';
import { BatteryOutput } from 'zebar';
import { formatMsToHumanDuration } from '@/utils/time';
import { cn } from '@/utils/cn';

type BatteryProps = {
  battery: BatteryOutput;
};
export function BatterySection({ battery }: BatteryProps) {
  const timeTillFullOrEmpty = battery.isCharging
    ? battery.timeTillFull
    : battery.timeTillEmpty;
  const status = battery.isCharging ? 'until full' : 'until empty';
  const formatTimeTillFullOrEmpty = timeTillFullOrEmpty
    ? `${formatMsToHumanDuration(timeTillFullOrEmpty)} ${status}`
    : null;
  const batteryThreshold = () => {
    const batteryPercentage = battery.chargePercent;
    if (batteryPercentage >= 0 && batteryPercentage <= 20) {
      return 'danger';
    } else if (batteryPercentage >= 20 && batteryPercentage <= 60) {
      return 'warning';
    } else {
      return 'success';
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            {battery.isCharging ? (
              <Zap
                className="h-4 w-4 text-icon animate-pulse"
                strokeWidth={2.6}
              />
            ) : (
              <Battery className="h-4 w-4 text-icon" />
            )}
            <p className="text-text">{battery.chargePercent}%</p>
          </div>
          {formatTimeTillFullOrEmpty && (
            <p>{`~ ${formatTimeTillFullOrEmpty}`}</p>
          )}
        </div>
        <div className="h-2 w-full bg-background border-border border overflow-clip rounded">
          <div
            title={`${battery.chargePercent}%`}
            className={cn(
              'h-full',
              batteryThreshold() === 'danger' && 'bg-danger',
              batteryThreshold() === 'warning' && 'bg-warning',
              batteryThreshold() === 'success' && 'bg-success'
            )}
            style={{ width: battery.chargePercent + '%' }}
          />
        </div>
      </div>
      <div className="w-full flex items-center justify-center gap-3">
        <IconSection title="Health Percentage">
          <IconContainer>
            <Heart className="h-4 w-4" strokeWidth={2.5} />
          </IconContainer>
          <p>{battery.healthPercent}%</p>
        </IconSection>
        <IconSection title="Cycle Count">
          <IconContainer>
            <RefreshCcw className="h-4 w-4" strokeWidth={2.5} />
          </IconContainer>
          <p>{battery.cycleCount}</p>
        </IconSection>
        <IconSection title="Voltage">
          <IconContainer>
            <Cable className="h-4 w-4" />
          </IconContainer>
          <p>{battery.powerConsumption}V</p>
        </IconSection>
        <IconSection title="Power Consumption">
          <IconContainer>
            <PlugZap className="h-4 w-4" />
          </IconContainer>
          <p>{battery.voltage}W</p>
        </IconSection>
      </div>
    </div>
  );
}

function IconContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-4 w-4 text-icon flex items-center justify-center">
      {children}
    </div>
  );
}

function IconSection({
  children,
  title,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-1 items-center justify-center hover:text-text transition-colors ease-in-out duration-200 cursor-default"
      title={title}
    >
      {children}
    </div>
  );
}

export default BatterySection;
