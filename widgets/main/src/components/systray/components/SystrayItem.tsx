import { SystrayIcon, SystrayOutput } from 'zebar';

const buttonType = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2,
};

interface SystrayItemProps {
  icon: SystrayIcon;
  systray: SystrayOutput;
}

export function SystrayItem({ icon, systray }: SystrayItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.shiftKey) return;
    switch (e.button) {
      case buttonType['LEFT']:
        systray.onLeftClick(icon.id);
        break;
      case buttonType['MIDDLE']:
        systray.onMiddleClick(icon.id);
        break;
      case buttonType['RIGHT']:
        systray.onRightClick(icon.id);
        break;
    }
  };

  return (
    <button
      onMouseDown={(e) => handleClick(e)}
      // Toggle firing right click event so it can use the trayicons one
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <img src={icon.iconUrl} className="h-4 w-4" />
    </button>
  );
}
