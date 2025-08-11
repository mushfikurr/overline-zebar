'use client';

import * as React from 'react';
import { RgbaStringColorPicker } from 'react-colorful';
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

    const parseColor = (colorString: string) => {
      const rgbaMatch = colorString.match(
        /rgba?\((\d+), (\d+), (\d+)(, ([0-9.]+))?\)/
      );
      if (rgbaMatch) {
        return {
          r: parseInt(rgbaMatch[1] || '0'),
          g: parseInt(rgbaMatch[2] || '0'),
          b: parseInt(rgbaMatch[3] || '0'),
          a: rgbaMatch[5] ? parseFloat(rgbaMatch[5]) : 1,
        };
      }
      return { r: 0, g: 0, b: 0, a: 1 };
    };

    const { r, g, b, a } = parseColor(color);

    const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newAlpha = parseFloat(e.target.value);
      const newColor = `rgba(${r}, ${g}, ${b}, ${newAlpha})`;
      handleColorChange(newColor);
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
              <RgbaStringColorPicker
                color={color}
                onChange={handleColorChange}
                className="!w-full"
              />
              <div className="mt-4">
                <label className="text-sm text-text-muted">Alpha</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={a}
                  onChange={handleAlphaChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
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
