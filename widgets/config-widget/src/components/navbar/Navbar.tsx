import { NavbarItem, Navbar as UiNavbar } from '@overline-zebar/ui';
import { Cog, DatabaseZap, LayoutGrid, Palette } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Navbar() {
  const [location, navigate] = useLocation();

  return (
    <UiNavbar className="rounded-none">
      <h3 className="px-4 mt-3.5 mb-1.5 text-text-muted font-medium">
        All Widgets
      </h3>
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
      <h3 className="px-4 mt-4 mb-1.5 text-text-muted font-medium">
        Widget Specific
      </h3>
      <NavbarItem
        className="rounded-none"
        Icon={LayoutGrid}
        title="Main (Topbar)"
        href="/widget/main"
        location={location}
        navigate={navigate}
      />
      <NavbarItem
        className="rounded-none"
        Icon={LayoutGrid}
        title="Script Launcher"
        href="/widget/script-launcher"
        location={location}
        navigate={navigate}
      />
    </UiNavbar>
  );
}
