import React from 'react';
import { GlazeWmOutput } from 'zebar';
import { ConditionalPanel } from '../../common/ConditionalPanel';
import { CopyProcessName } from './commands/CopyProcessName';
import { ToggleFloating } from './commands/ToggleFloating';
import { Chip } from '@overline-zebar/ui';
import { ToggleFullscreen } from './commands/ToggleFullscreen';

interface WindowControlsProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  glazewm: GlazeWmOutput | null;
  parentRef: React.ForwardedRef<HTMLButtonElement>;
}

export function WindowControls({ glazewm, ...props }: WindowControlsProps) {
  const ref = React.useRef<HTMLButtonElement>(null);

  return (
    <ConditionalPanel sessionActive={props.show}>
      <div className="py-1">
        <Chip
          as="button"
          className="mx-2.5 h-full py-1"
          ref={ref}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
          }}
        >
          <ControlList glazewm={glazewm} />
        </Chip>
      </div>
    </ConditionalPanel>
  );
}

/**
 * TODO: Investigate controls. At the moment, I can't find an accurate state to bind controls to.
 * For example, when setting a window to be floating, the type of the window is not updated until
 * the user brings the window forward with ALT+SHIFT+SPACE.
 * I may have to use the WebSocket API to get a more responsive state.
 * I am currently avoiding tracking any state locally and then replicating it to GlazeWM, as it could cause desync issues.
 */
const ControlList = ({ glazewm }: { glazewm: GlazeWmOutput | null }) => {
  const controls = [CopyProcessName, ToggleFloating, ToggleFullscreen];

  return (
    <div className="flex items-center h-full gap-1.5">
      {controls.map((Control, idx) => (
        <Control key={idx} glazewm={glazewm} />
      ))}
    </div>
  );
};
