import { useConfigDispatch, useWidgetSetting } from '@overline-zebar/config';
import { useEffect, useState } from 'react';
import { Route, Router, Switch } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import * as zebar from 'zebar';
import Navbar from './components/navbar';
import Host from './components/host';
import Storage from './components/storage';
import Network from './components/network';
import Performance from './components/performance';

const providers = zebar.createProviderGroup({
  cpu: { type: 'cpu' },
  memory: { type: 'memory' },
  weather: { type: 'weather' },
  host: { type: 'host' },
  battery: { type: 'battery' },
  disk: { type: 'disk' },
  network: { type: 'network' },
});

function App() {
  const [output, setOutput] = useState(providers.outputMap);

  useEffect(() => {
    providers.onOutput(() => setOutput(providers.outputMap));

    zebar.currentWidget().tauriWindow.listen('tauri://blur', () => {
      zebar.currentWidget().close();
    });
  }, []);

  // const sampleBattery = {
  //   chargePercent: 76,
  //   healthPercent: 92,
  //   cycleCount: 483,
  //   state: "discharging", // can also be: 'charging', 'full', 'empty', 'unknown'
  //   isCharging: true,
  //   timeTillEmpty: 7200000, // 2 hours in ms
  //   timeTillFull: 7200000, // since not charging
  //   powerConsumption: 12.5, // in watts
  //   voltage: 11.4 // in volts
  // } satisfies zebar.BatteryOutput;

  return (
    <Router hook={useHashLocation}>
      <div className="h-screen relative flex justify-between shadow-sm items-center bg-background/90 border border-button-border/80 backdrop-blur-xl text-text antialiased select-none rounded-lg font-mono">
        <div className="flex w-full h-full">
          <div className="flex flex-col">
            <Navbar />
          </div>

          <Switch>
            <Route path="/">
              <Host host={output.host} battery={output.battery} />
            </Route>
            <Route path="/storage">
              <Storage disk={output.disk} />
            </Route>
            <Route path="/performance">
              <Performance cpu={output.cpu} memory={output.memory} />
            </Route>
            <Route path="/network">
              <Network network={output.network} />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
