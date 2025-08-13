import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from '@overline-zebar/ui';
import { useState } from 'react';

type Props = {
  onSaveAsNew: (newThemeName: string) => void;
};

function SaveAsNewDialog({ onSaveAsNew }: Props) {
  const [newThemeName, setNewThemeName] = useState('');

  const handleSaveAsNew = () => {
    if (!newThemeName) return;
    onSaveAsNew(newThemeName);
    setNewThemeName('');
  };

  return (
    <Dialog>
      <DialogTrigger
        render={(props) => <Button {...props}>Save As New</Button>}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save As New</DialogTitle>
          <DialogDescription>
            Create a new theme from the colours you have selected.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 h-10">
          <Input
            type="text"
            placeholder="New theme name"
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            inputContainerClassName="h-full"
            className="h-full"
          />
        </div>
        <DialogFooter>
          <Button
            className="h-full"
            onClick={handleSaveAsNew}
            disabled={!newThemeName}
          >
            Save As New
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SaveAsNewDialog;
