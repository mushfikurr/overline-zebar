import * as React from 'react';
import { HexAlphaColorPicker } from 'react-colorful';
import {
  Popover,
  PopoverTrigger,
  PopoverPortal,
  PopoverPositioner,
  PopoverPopup,
} from './popover/Popover';
import { Button } from './button';
import { Input } from './input';
import { cn } from '../utils/cn';
import { Pipette } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const ColorPicker = React.forwardRef<HTMLButtonElement, ColorPickerProps>(
  ({ value, onChange, className }, ref) => {
    const [color, setColor] = React.useState(value);

    React.useEffect(() => {
      setColor(value);
    }, [value]);

    const handleColorChange = (newColor: string) => {
      setColor(newColor);
      onChange(newColor);
    };

    const openEyeDropper = async () => {
      if (!window.EyeDropper) {
        alert('EyeDropper API is not supported in this browser.');
        return;
      }
      try {
        const eyeDropper = new window.EyeDropper();
        const { sRGBHex } = await eyeDropper.open();
        handleColorChange(sRGBHex);
      } catch (e) {
        console.error(e);
      }
    };

    return (
      <Popover>
        <PopoverTrigger>
          <Button
            ref={ref}
            className={cn(
              'w-full justify-start text-left font-normal',
              className
            )}
          >
            <div className="flex w-full items-center gap-2">
              <div
                className="h-6 w-6 rounded-md border border-border shadow-xs"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1">{color}</div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverPositioner>
            <PopoverPopup className="w-64 p-4">
              <HexAlphaColorPicker
                color={color}
                onChange={handleColorChange}
                className="!w-full"
              />

              <div className="mt-4 flex items-center gap-2">
                <Input
                  className="h-9"
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                />
                <Button variant="ghost" size="icon" onClick={openEyeDropper}>
                  <Pipette className="h-4 w-4" />
                </Button>
              </div>
            </PopoverPopup>
          </PopoverPositioner>
        </PopoverPortal>
      </Popover>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';

export { ColorPicker };
