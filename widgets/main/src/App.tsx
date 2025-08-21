import { useWidgetSetting } from '@overline-zebar/config';
import { Chip } from '@overline-zebar/ui';
import { useEffect, useRef, useState } from 'react';
import * as zebar from 'zebar';
import { Center } from './components/Center';
import Media from './components/media';
import RightButtons from './components/rightButtons/RightButtons';
import Stat from './components/stat';
import Systray from './components/systray';
import { TilingControl } from './components/TilingControl';
import VolumeControl from './components/volume';
import { WindowTitle } from './components/windowTitle/WindowTitle';
import { WorkspaceControls } from './components/WorkspaceControls';
import {
  calculateWidgetPlacementFromLeft,
  calculateWidgetPlacementFromRight,
} from './utils/calculateWidgetPlacement';
import { cn } from './utils/cn';
import { useAutoTiling } from './utils/useAutoTiling';
import { getWeatherIcon } from './utils/weatherIcons';

const providers = zebar.createProviderGroup({
  media: { type: 'media' },
  network: { type: 'network' },
  glazewm: { type: 'glazewm' },
  cpu: { type: 'cpu' },
  date: { type: 'date', formatting: 'EEE d MMM t', locale: 'en-GB' },
  memory: { type: 'memory' },
  weather: { type: 'weather' },
  audio: { type: 'audio' },
  systray: { type: 'systray' },
});

function App() {
  const [output, setOutput] = useState(providers.outputMap);

  useEffect(() => {
    providers.onOutput(() => setOutput(providers.outputMap));
  }, []);

  useAutoTiling();

  const statIconClassnames = 'h-5 w-5 text-icon';
  const chipRef = useRef<HTMLDivElement | null>(null);

  const [weatherThresholds] = useWidgetSetting('main', 'weatherThresholds');
  const [weatherUnit] = useWidgetSetting('main', 'weatherUnit');
  const [marginX] = useWidgetSetting('main', 'marginX');
  const [paddingLeft] = useWidgetSetting('main', 'paddingLeft');
  const [paddingRight] = useWidgetSetting('main', 'paddingRight');
  const [statProviders] = useWidgetSetting('main', 'providers');

  const allProvidersDisabled = Object.values(statProviders || {}).every(
    (p) => !p
  );

  return (
    <div
      className={cn(
        'relative flex justify-between items-center bg-background/80 backdrop-blur-3xl text-text h-full antialiased select-none font-mono py-1.5',
        marginX > 0 && 'rounded-lg border border-border'
      )}
      style={{ margin: `0 ${marginX}px` }}
    >
      {/* Left */}
      <div
        className="flex items-center gap-2 h-full z-10"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <div className="flex items-center gap-1.5 h-full py-0.5">
          <TilingControl glazewm={output.glazewm} />
        </div>
        <div className="flex items-center gap-2 h-full">
          <WorkspaceControls glazewm={output.glazewm} />
        </div>
        <div className="flex items-center justify-center gap-2 h-full">
          <Media media={output.media} />
        </div>
      </div>

      <div className="absolute w-full h-full flex items-center justify-center left-0">
        <Center>
          <WindowTitle glazewm={output.glazewm} />
        </Center>
      </div>

      {/* Right */}
      <div className="flex gap-2 items-center h-full z-10">
        <div className="flex items-center h-full">
          {!allProvidersDisabled && (
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
              {statProviders.cpu && output.cpu && (
                <Stat
                  Icon={<p className="font-medium text-icon">CPU</p>}
                  stat={`${Math.round(output.cpu.usage)}%`}
                  type="ring"
                />
              )}

              {statProviders.memory && output.memory && (
                <Stat
                  Icon={<p className="font-medium text-icon">RAM</p>}
                  stat={`${Math.round(output.memory.usage)}%`}
                  type="ring"
                />
              )}

              {statProviders.weather && output.weather && (
                <Stat
                  Icon={getWeatherIcon(output.weather, statIconClassnames)}
                  stat={
                    weatherUnit === 'celsius'
                      ? `${Math.round(output.weather.celsiusTemp)}°C`
                      : `${Math.round(output.weather.fahrenheitTemp)}°F`
                  }
                  threshold={weatherThresholds}
                  type="inline"
                />
              )}
            </Chip>
          )}
        </div>
        <div className="flex items-center h-full">
          <VolumeControl
            audio={output.audio}
            statIconClassnames={statIconClassnames}
          />
        </div>
        <div className="h-full flex items-center px-0.5">
          <Systray systray={output.systray} />
        </div>
        <div className="h-full flex items-center justify-center px-1">
          {output?.date?.formatted ??
            new Intl.DateTimeFormat('en-GB', {
              weekday: 'short', // EEE
              day: 'numeric', // d
              month: 'short', // MMM
              hour: 'numeric', // t (hour part)
              minute: 'numeric', // t (minute part)
            })
              .format(new Date())
              .replace(/,/g, '')}
        </div>
        <div style={{ paddingRight: `${paddingRight}px` }}>
          <RightButtons />
        </div>
      </div>
    </div>
  );
}

export default App;
