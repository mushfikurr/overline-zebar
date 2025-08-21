import { usePersistentWidget } from '@overline-zebar/config';
import { Button } from '@overline-zebar/ui';

function App() {
  usePersistentWidget({ widgetName: 'app-launcher' });

  return (
    <div className="relative shadow-sm bg-background/95 border border-button-border/80 backdrop-blur-xl text-text h-full antialiased select-none rounded-lg font-mono">
      <div className="grid grid-cols-3">
        <Button className="h-full w-full">Launcher</Button>
        <Button className="h-full w-full">Launcher</Button>
        <Button className="h-full w-full">Launcher</Button>
      </div>
    </div>
  );
}

export default App;

