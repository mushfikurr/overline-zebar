import { Navbar as UiNavbar, NavbarItem } from '@overline-zebar/ui';
import { Palette, Cog, LayoutGrid } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Navbar() {
  const [location, navigate] = useLocation();

  return (
    <UiNavbar className="rounded-none">
      <h3 className="px-4 my-3.5 text-text-muted">All Widgets</h3>
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
      <h3 className="px-4 my-3.5 text-text-muted">Widget Specific</h3>
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
