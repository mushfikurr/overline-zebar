import { Route, Router, Switch } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import TitleBar from './components/TitleBar';
import Navbar from './components/navbar';
import AppearanceSettings from './components/pages/AppearanceSettings';
import { GeneralSettings } from './components/pages/GeneralSettings';
import { TilingSettings } from './components/pages/TilingSettings';

function App() {
  return (
    <Router hook={useHashLocation}>
      <div className="relative flex flex-col shadow-sm items-center bg-background border border-button-border/80 backdrop-blur-xl text-text h-full antialiased select-none rounded-lg font-mono">
        <TitleBar />
        <div className="flex w-full h-full">
          <div className="flex flex-col w-full max-w-sm">
            <Navbar />
          </div>

          <Switch>
            <Route path="/">
              <GeneralSettings />
            </Route>
            <Route path="/appearance">
              <AppearanceSettings />
            </Route>
            <Route path="/tiling">
              <TilingSettings />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
