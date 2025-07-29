import { Button } from '@overline-zebar/ui';
import { BarChart, Globe, HardDrive, LucideIcon, Server } from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '../../utils/cn';

export default function Navbar() {
  return (
    <div className="h-full border-r border-border rounded-tl rounded-bl flex flex-col overflow-clip">
      <IconNavbarItem Icon={Server} title="Host" href="/" />
      <IconNavbarItem Icon={HardDrive} title="Storage" href="/storage" />
      <IconNavbarItem Icon={BarChart} title="Performance" href="/performance" />
      <IconNavbarItem Icon={Globe} title="Network" href="/network" />
    </div>
  );
}

function IconNavbarItem({
  Icon,
  title,
  href,
}: {
  Icon: LucideIcon;
  title?: string;
  href: string;
}) {
  const [location, navigate] = useLocation();
  const handleClick = () => {
    navigate(href);
  };
  return (
    <Button
      onClick={handleClick}
      className={cn(
        'group max-h-12 flex items-center gap-2 h-full px-4 bg-button/60 border-none border-b border-border rounded-none last:border-b-0',
        location === href && 'bg-background hover:bg-background text-text'
      )}
    >
      <Icon
        strokeWidth={2.6}
        className="h-5 w-5 text-icon group-hover:text-text transition-colors ease-in-out duration-200"
      />
      {title && title}
    </Button>
  );
}
