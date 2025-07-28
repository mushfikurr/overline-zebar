import { Info } from 'lucide-react';
import { useSearchParams } from 'wouter';
import * as zebar from 'zebar';
import PanelLayout from '../common/PanelLayout';
import InterfaceDetails from './components/InterfaceDetails';
import Traffic from './components/Traffic';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@overline-zebar/ui';

interface NetworkPanelProps {
  network: {
    interfaces: zebar.NetworkInterface[];
    gateway?: zebar.NetworkGateway | null;
    traffic?: zebar.NetworkTraffic | null;
  } | null;
}

export default function Network({ network }: NetworkPanelProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'default';

  if (!network || !network.interfaces || network.interfaces.length === 0) {
    return (
      <PanelLayout title="Network">
        <div className="flex flex-col justify-center items-center select-text w-full text-text-muted h-full">
          <Info className="w-10 h-10 mb-4 text-text-muted" />
          <p>Network information not available.</p>
          <p>No network interfaces found.</p>
        </div>
      </PanelLayout>
    );
  }

  const defaultInterface =
    network.interfaces.find((iface) => iface.isDefault) ||
    network.interfaces[0];
  const currInterface =
    network.interfaces.find((iface) => iface.name === tab) ?? defaultInterface;

  if (!currInterface || !defaultInterface) {
    return (
      <PanelLayout title="Network">
        <div className="flex flex-col justify-center items-center select-text w-full text-text-muted h-full">
          <Info className="w-10 h-10 mb-4 text-text-muted" />
          <p>Error retrieving network interface.</p>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      title={`Network: ${
        defaultInterface.friendlyName || defaultInterface.name
      }`}
      className="space-y-6"
    >
      <Traffic traffic={network.traffic} />

      <div className="flex items-center gap-3">
        <Select
          value={currInterface.name}
          onValueChange={(value) => {
            const selected = value as string;
            setSearchParams((prev) => {
              const params = new URLSearchParams(prev);
              params.set('tab', selected);
              return params;
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Interface..."></SelectValue>
          </SelectTrigger>
          <SelectContent position="item-aligned">
            {network.interfaces.map((i) => (
              <SelectItem key={i.name} value={i.name}>
                {i.friendlyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <InterfaceDetails iface={currInterface} />
    </PanelLayout>
  );
}
