import { Navbar as UiNavbar, NavbarItem } from '@overline-zebar/ui';
import { Palette, Cog, LayoutGrid } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Navbar() {
  const [location, navigate] = useLocation();

  return (
    <UiNavbar className="rounded-none">
      <NavbarItem
        className="rounded-none"
        Icon={Cog}
        title="General"
        href="/"
        location={location}
        navigate={navigate}
      />
      <NavbarItem
        className="rounded-none"
        Icon={Palette}
        title="Appearance"
        href="/appearance"
        location={location}
        navigate={navigate}
      />
      <NavbarItem
        className="rounded-none"
        Icon={LayoutGrid}
        title="Tiling"
        href="/tiling"
        location={location}
        navigate={navigate}
      />
    </UiNavbar>
  );
}
