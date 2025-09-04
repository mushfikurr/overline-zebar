import { useWidgetSetting } from '@overline-zebar/config';
import { Chip } from '@overline-zebar/ui';
import { useRef } from 'react';
import { calculateWidgetPlacementFromRight } from '../../utils/calculateWidgetPlacement';
import * as zebar from 'zebar';
import Stat from '../stat/Stat';
import { getWeatherIcon } from '../../utils/weatherIcons';

type Props = {
  battery: zebar.BatteryOutput | null;
  memory: zebar.MemoryOutput | null;
  cpu: zebar.CpuOutput | null;
  weather: zebar.WeatherOutput | null;
};

function StatProviders({ cpu, memory, battery, weather }: Props) {
  const [statProviders] = useWidgetSetting('main', 'providers');
  const allProvidersDisabled = Object.values(statProviders || {}).every(
    (p) => !p
  );
  const [weatherThresholds] = useWidgetSetting('main', 'weatherThresholds');
  const [weatherUnit] = useWidgetSetting('main', 'weatherUnit');
  const chipRef = useRef<HTMLDivElement | null>(null);
  const statIconClassnames = 'h-5 w-5 text-icon';

  if (allProvidersDisabled) return null;

  return (
    <Chip
      ref={chipRef}
      className="flex items-center gap-3 h-full pl-3.5 pr-3"
      as="button"
      onClick={async () => {
        const widgetPlacement = await calculateWidgetPlacementFromRight(
          chipRef,
          { width: 400, height: 200 }
        );
        await zebar.startWidget('system-stats', widgetPlacement, {});
      }}
    >
      {statProviders.cpu && cpu && (
        <Stat
          Icon={<p className="font-medium text-icon">CPU</p>}
          stat={`${Math.round(cpu.usage)}%`}
          type="ring"
        />
      )}

      {statProviders.memory && memory && (
        <Stat
          Icon={<p className="font-medium text-icon">RAM</p>}
          stat={`${Math.round(memory.usage)}%`}
          type="ring"
        />
      )}

      {statProviders.weather && weather && (
        <Stat
          Icon={getWeatherIcon(weather, statIconClassnames)}
          stat={
            weatherUnit === 'celsius'
              ? `${Math.round(weather.celsiusTemp)}°C`
              : `${Math.round(weather.fahrenheitTemp)}°F`
          }
          threshold={weatherThresholds}
          type="inline"
        />
      )}

      <BatteryStat battery={battery} batteryProvider={statProviders.battery} />
    </Chip>
  );
}

type BatteryStatProps = {
  battery: zebar.BatteryOutput | null;
  batteryProvider: boolean;
};
function BatteryStat({ battery, batteryProvider }: BatteryStatProps) {
  if (!batteryProvider || !battery) return null;
  return (
    <Stat
      Icon={<p className="font-medium text-icon">RAM</p>}
      stat={`${Math.round(battery.chargePercent)}%`}
      type="ring"
    />
  );
}

export default StatProviders;
