import { Navbar as UiNavbar, NavbarItem } from '@overline-zebar/ui';
import { Palette } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Navbar() {
  const [location, navigate] = useLocation();

  return (
    <UiNavbar className="rounded-none">
      <NavbarItem
        className="rounded-none"
        Icon={Palette}
        title="Appearance"
        href="/appearance"
        location={location}
        navigate={navigate}
      />
    </UiNavbar>
  );
}
