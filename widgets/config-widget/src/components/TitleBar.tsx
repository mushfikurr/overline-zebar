import { cn } from '@/utils/cn';
import { useConfigDispatch, useWidgetSetting } from '@overline-zebar/config';
import { buttonVariants } from '@overline-zebar/ui';
import { X } from 'lucide-react';
import * as zebar from 'zebar';

export default function TitleBar() {
  const [isAlwaysOn] = useWidgetSetting('config-widget', 'alwaysOn');
  const dispatch = useConfigDispatch();

  const onClose = () => {
    if (isAlwaysOn) {
      dispatch({
        type: 'SET_WIDGET_SETTING',
        widget: 'config-widget',
        key: 'isVisible',
        value: false,
      });
    } else {
      zebar.currentWidget().close();
    }
  };

  return (
    <div className="bg-background-deeper border-b border-border flex items-center justify-between w-full rounded-t-lg">
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
