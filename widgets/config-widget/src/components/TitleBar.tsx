import { cn } from '@/utils/cn';
import { buttonVariants } from '@overline-zebar/ui';
import { X } from 'lucide-react';
import * as zebar from 'zebar';

export default function TitleBar() {
  const onClose = () => {
    zebar.currentWidget().close();
  };

  return (
    <div className="bg-background-deeper border-border flex items-center justify-between w-full rounded-t-lg">
      <h1 className="pl-4 py-2 font-medium">overline-zebar</h1>
      <button
        onClick={onClose}
        className={cn(
          buttonVariants(),
          'px-3 h-full rounded-lg rounded-b-none rounded-l-none border-0'
        )}
      >
        <X className="h-4 w-4" strokeWidth={3} />
      </button>
    </div>
  );
}
