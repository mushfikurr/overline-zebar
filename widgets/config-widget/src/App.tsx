import { Route, Router, Switch } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import TitleBar from './components/TitleBar';
import Navbar from './components/navbar';
import AppearanceSettings from './components/pages/AppearanceSettings';
import { GeneralSettings } from './components/pages/GeneralSettings';
import { MainSettings } from './components/pages/widgets/main/MainSettings';
import { ConfigManagement } from './components/pages/ConfigManagement';
import { ScriptLauncherSettings } from './components/pages/widgets/script-launcher/ScriptLauncherSettings';

function App() {
  return (
    <Router hook={useHashLocation}>
      <div className="relative flex flex-col shadow-sm items-center bg-background border border-button-border/80 backdrop-blur-xl text-text h-screen antialiased select-none rounded-lg font-mono">
        <TitleBar />
        <div className="flex w-full flex-grow min-h-0">
          <div className="flex flex-col w-72 shrink-0">
            <Navbar />
          </div>

          <div className="flex-grow min-w-0 h-full flex flex-col bg-background">
            <Switch>
              <Route path="/">
                <GeneralSettings />
              </Route>
              <Route path="/appearance">
                <AppearanceSettings />
              </Route>
              <Route path="/config-management">
                <ConfigManagement />
              </Route>
              <Route path="/widget/main">
                <MainSettings />
              </Route>
              <Route path="/widget/script-launcher">
                <ScriptLauncherSettings />
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;

