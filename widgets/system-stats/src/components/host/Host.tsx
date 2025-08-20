import { formatMsToHumanDuration } from '@/utils/time';
import { PanelLayout, WindowsIcon } from '@overline-zebar/ui';
import { BatteryOutput, HostOutput } from 'zebar';
import { BatterySection } from './components/BatterySection';

export default function Host({
  host,
  battery,
}: {
  host: HostOutput | null;
  battery: BatteryOutput | null;
}) {
  if (!host) return null;

  const bootedAt = new Date(Number(host.bootTime));
  const uptimeDisplay = formatMsToHumanDuration(Number(host.uptime));
  const renderOsIcon = (osName: string | null) => {
    if (osName === 'Windows') {
      return <WindowsIcon className="h-5 w-5 text-text-muted" />;
    }
    return null;
  };

  return (
    <PanelLayout title="Host">
      <div className="flex flex-col justify-between select-text w-full text-text-muted h-full">
        <div className="space-y-1.5">
          <div className="flex items-start">
            <div className="text-text border-text-muted/40 w-full">
              <div className="w-full overflow-hidden">
                <span className="flex items-center gap-2">
                  {renderOsIcon(host.osName)}
                  <p className="font-medium truncate whitespace-nowrap overflow-hidden">
                    {host.osName} - {host.friendlyOsVersion}
                  </p>
                </span>
              </div>
              <p>{host.hostname}</p>
            </div>
          </div>

          <div>
            <p>Booted at {bootedAt.toLocaleTimeString()}</p>
            <p>Up for {uptimeDisplay}</p>
          </div>
        </div>
        <div>{battery && <BatterySection battery={battery} />}</div>
      </div>
    </PanelLayout>
  );
}
