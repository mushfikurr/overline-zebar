import { Route, Router, Switch } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import TitleBar from './components/TitleBar';
import { ThemeEditor } from './components/theme/ThemeEditor';
import Navbar from './components/navbar';
import { GeneralSettings } from './components/GeneralSettings';
import { TilingSettings } from './components/TilingSettings';

function App() {
  return (
    <Router hook={useHashLocation}>
      <div className="relative flex flex-col shadow-sm items-center bg-background/95 border border-button-border/80 backdrop-blur-xl text-text h-full antialiased select-none rounded-lg font-mono">
        <TitleBar />
        <div className="flex w-full h-full">
          <div className="flex flex-col w-full max-w-sm">
            <Navbar />
          </div>

          <Switch>
            <Route path="/">
              <p>Hello World</p>
            </Route>
            <Route path="/general">
              <GeneralSettings />
            </Route>
            <Route path="/appearance">
              <ThemeEditor />
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
