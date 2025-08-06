
import { useState } from 'react';
import { SystrayIcon, SystrayOutput } from 'zebar';
import { ExpandingCarousel } from './components/ExpandingCarousel';
import { SystrayItem } from './components/SystrayItem';
import { useAppSetting } from '@overline-zebar/config';

type SystrayProps = {
  systray: SystrayOutput | null;
};

function arrangeIconsWithPinnedCenter(
  pinnedIcons: SystrayIcon[],
  icons: SystrayIcon[]
) {
  const pinnedHashes = pinnedIcons.map((icon) => icon.iconHash);

  const pinned = icons
    .filter((icon) => pinnedHashes.includes(icon.iconHash))
    .sort(
      (a, b) =>
        pinnedHashes.indexOf(a.iconHash) - pinnedHashes.indexOf(b.iconHash)
    );

  const others = icons
    .filter((icon) => !pinnedHashes.includes(icon.iconHash))
    .sort((a, b) => a.tooltip.localeCompare(b.tooltip));

  const half = Math.ceil(others.length / 2);
  return [...others.slice(0, half), ...pinned, ...others.slice(half)];
}

export default function Systray({ systray }: SystrayProps) {
  if (!systray) return;
  const icons = systray.icons;

  const [expanded, setExpanded] = useState(false);
  const ICON_CUTOFF = 4;

  // Toggle icon expansion on Shift+Click
  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      setExpanded(!expanded);
    }
  };

  const [pinnedSystrayIcons] = useAppSetting('pinnedSystrayIcons');

  const arrangedIcons = arrangeIconsWithPinnedCenter(pinnedSystrayIcons, icons);

  const unpinnedCount = icons.length - pinnedSystrayIcons.length;
  const firstPinnedIndex = Math.ceil(unpinnedCount / 2);

  let startIndex;
  if (pinnedSystrayIcons.length > 0) {
    startIndex = Math.floor(
      firstPinnedIndex - (ICON_CUTOFF - pinnedSystrayIcons.length) / 2
    );
  }

  const systrayIcons = arrangedIcons.map((item) => (
    <SystrayItem key={item.id} systray={systray} icon={item} />
  ));

  return (
    <div className="flex items-center gap-1.5" onClick={handleClick}>
      <ExpandingCarousel
        items={systrayIcons}
        expanded={expanded}
        gap={6}
        itemWidth={16}
        visibleCount={ICON_CUTOFF}
        startIndex={startIndex}
      />
    </div>
  );
}
