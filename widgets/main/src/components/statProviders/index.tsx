import { useRef } from 'react';
import * as zebar from 'zebar';
import { useWidgetSetting, Threshold } from '@overline-zebar/config';
import { Chip } from '@overline-zebar/ui';
import { calculateWidgetPlacementFromRight } from '../../utils/calculateWidgetPlacement';
import { getWeatherIcon } from '../../utils/weatherIcons';

// ============================================================================
// BATTERY TESTING - Toggle this variable to test different battery levels
// ============================================================================
const TEST_BATTERY: zebar.BatteryOutput | null = {
  chargePercent: 65, // Change to test: 15 (danger), 25 (warning), 55 (text)
  isCharging: true, // Toggle true/false to test charging states
  healthPercent: 92,
  cycleCount: 250,
  powerConsumption: 12.5,
  voltage: 11.4,
  timeTillFull: null,
  timeTillEmpty: 7200000,
  state: 'discharging',
};
// Set to null to use real battery, or uncomment above to test
const USE_TEST_BATTERY = false; // Toggle to true to enable testing
// ============================================================================

import Stat from '../stat/Stat';

import {
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
} from 'lucide-react';

type Props = {
  battery: zebar.BatteryOutput | null;
  memory: zebar.MemoryOutput | null;
  cpu: zebar.CpuOutput | null;
  weather: zebar.WeatherOutput | null;
};

export default function StatProviders({
  cpu,
  memory,
  battery,
  weather,
}: Props) {
  const [statProviders] = useWidgetSetting('main', 'providers');
  const allProvidersDisabled = Object.values(statProviders || {}).every(
    (p) => !p
  );
  const [weatherThresholds] = useWidgetSetting('main', 'weatherThresholds');
  const [weatherUnit] = useWidgetSetting('main', 'weatherUnit');
  const [useInlineStats] = useWidgetSetting('main', 'useInlineStats');
  const [systemStatThresholds] = useWidgetSetting(
    'main',
    'systemStatThresholds'
  );
  const [batteryThresholds] = useWidgetSetting('main', 'batteryThresholds');
  const chipRef = useRef<HTMLDivElement | null>(null);
  const statIconClassnames = 'size-3.5 text-icon';

  if (allProvidersDisabled) return null;

  return (
    <Chip
      ref={chipRef}
      className="flex items-center gap-3 h-full pl-3 pr-2.5 active:bg-background-deeper/90"
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
          type={useInlineStats ? 'inline' : 'ring'}
          threshold={systemStatThresholds}
        />
      )}

      {statProviders.memory && memory && (
        <Stat
          Icon={<p className="font-medium text-icon">RAM</p>}
          stat={`${Math.round(memory.usage)}%`}
          type={useInlineStats ? 'inline' : 'ring'}
          threshold={systemStatThresholds}
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

      <BatteryStat
        battery={USE_TEST_BATTERY ? TEST_BATTERY : battery}
        batteryProvider={statProviders.battery}
        batteryThresholds={batteryThresholds}
      />
    </Chip>
  );
}

type BatteryStatProps = {
  battery: zebar.BatteryOutput | null;
  batteryProvider: boolean;
  batteryThresholds: Threshold[];
};

function BatteryStat({
  battery,
  batteryProvider,
  batteryThresholds,
}: BatteryStatProps) {
  if (!batteryProvider || !battery) return null;

  const chargePercent = Math.round(battery.chargePercent);

  const renderBatteryIcon = () => {
    if (battery.isCharging) {
      return (
        <BatteryCharging strokeWidth={3} className="h-3.5 w-3.5 text-icon" />
      );
    }

    if (chargePercent >= 80) {
      return <BatteryFull strokeWidth={3} className="h-3.5 w-3.5 text-icon" />;
    }

    if (chargePercent >= 40) {
      return (
        <BatteryMedium strokeWidth={3} className="h-3.5 w-3.5 text-icon" />
      );
    }

    return <BatteryLow strokeWidth={3} className="h-3.5 w-3.5 text-icon" />;
  };

  return (
    <Stat
      Icon={renderBatteryIcon()}
      stat={`${chargePercent}%`}
      type="inline"
      threshold={batteryThresholds}
    />
  );
}
