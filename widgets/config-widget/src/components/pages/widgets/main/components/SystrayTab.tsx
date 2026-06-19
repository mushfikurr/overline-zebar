import { useWidgetSetting } from '@overline-zebar/config';
import {
  Input,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipTrigger,
} from '@overline-zebar/ui';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import * as zebar from 'zebar';

const providers = zebar.createProviderGroup({
  systray: { type: 'systray' },
});

function SystrayTab() {
  const [output, setOutput] = useState(providers.outputMap);
  const [pinnedSystrayIcons, setPinnedSystrayIcons] = useWidgetSetting(
    'main',
    'pinnedSystrayIcons'
  );

  useEffect(() => {
    providers.onOutput(() => setOutput(providers.outputMap));
  }, []);

  const icons = useMemo(() => output.systray?.icons, [output.systray]);

  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    if (!icons) return icons;
    const query = search.trim().toLowerCase();
    if (!query) return icons;
    return icons.filter((i) => i.tooltip.toLowerCase().includes(query));
  }, [icons, search]);

  const isIconPinned = (icon: zebar.SystrayIcon) => {
    return !!pinnedSystrayIcons.find((i: string) => icon.iconHash === i);
  };

  const handleCheckedChange = (toPin: zebar.SystrayIcon) => {
    if (isIconPinned(toPin)) {
      setPinnedSystrayIcons(
        pinnedSystrayIcons.filter((i: string) => i !== toPin.iconHash)
      );
    } else {
      setPinnedSystrayIcons([...pinnedSystrayIcons, toPin.iconHash]);
    }
  };

  return (
    <>
      <div className="space-y-0.5">
        <h1>Pinned Icons</h1>
        <p className="text-text-muted">
          These icons will stay visible in your system tray when it is
          collapsed.
        </p>
        <p className="text-text-muted">
          You can Shift + Click the system tray icons in the topbar to toggle
          between expanded or collapsed.
        </p>
      </div>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-4 -translate-y-1/2 text-text-muted" />
        <Input
          className="pl-9"
          placeholder="Search tray icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grow min-w-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Pinned</TableHead>
              <TableHead className="w-12">Icon</TableHead>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIcons?.map((i) => (
              <TableRow key={i.iconHash}>
                <TableCell>
                  <Switch
                    checked={isIconPinned(i)}
                    onCheckedChange={() => handleCheckedChange(i)}
                  />
                </TableCell>
                <TableCell>
                  <img className="h-6 w-6" src={i.iconUrl} alt="" />
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span className="block truncate" title={i.tooltip}>
                          {i.tooltip}
                        </span>
                      }
                    />
                    <TooltipPortal>
                      <TooltipPositioner>
                        <TooltipPopup>{i.tooltip}</TooltipPopup>
                      </TooltipPositioner>
                    </TooltipPortal>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default SystrayTab;
