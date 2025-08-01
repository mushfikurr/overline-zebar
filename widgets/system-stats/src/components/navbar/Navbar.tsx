import { Navbar as UiNavbar, NavbarItem } from '@overline-zebar/ui';
import { BarChart, Globe, HardDrive, Palette, Server } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Navbar() {
  const [location, navigate] = useLocation();

  return (
    <UiNavbar>
      <NavbarItem
        Icon={Server}
        title="Host"
        href="/"
        location={location}
        navigate={navigate}
      />
      <NavbarItem
        Icon={HardDrive}
        title="Storage"
        href="/storage"
        location={location}
        navigate={navigate}
      />
      <NavbarItem
        Icon={BarChart}
        title="Performance"
        href="/performance"
        location={location}
        navigate={navigate}
      />
      <NavbarItem
        Icon={Globe}
        title="Network"
        href="/network"
        location={location}
        navigate={navigate}
      />
      
    </UiNavbar>
  );
}