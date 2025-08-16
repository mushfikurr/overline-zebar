import { Navbar as UiNavbar, NavbarItem } from '@overline-zebar/ui';
import { Palette, Cog, LayoutGrid, DatabaseZap } from 'lucide-react';
import { useLocation } from 'wouter';
import { Separator } from '../common/Separator';

export default function Navbar() {
  const [location, navigate] = useLocation();

  return (
    <UiNavbar className="rounded-none">
      <h3 className="px-4 mt-4 mb-2 text-text-muted">All Widgets</h3>
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
        Icon={DatabaseZap}
        title="Config Management"
        href="/config-management"
        location={location}
        navigate={navigate}
      />
      <Separator />
      <h3 className="px-4 mb-2 text-text-muted">Widget Specific</h3>
      <NavbarItem
        className="rounded-none"
        Icon={LayoutGrid}
        title="Main (Topbar)"
        href="/widget/main"
        location={location}
        navigate={navigate}
      />
    </UiNavbar>
  );
}
