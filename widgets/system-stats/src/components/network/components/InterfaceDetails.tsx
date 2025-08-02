import { Card, CardTitle } from '@overline-zebar/ui';
import { ArrowDown, ArrowUp, Globe, Rss } from 'lucide-react';
import * as zebar from 'zebar';
import List from './List';
import { CopyToClipboard } from '@/components/common/CopyToClipboard';

const formatSpeed = (bytesPerSecond: number | null | undefined): string => {
  if (!bytesPerSecond || bytesPerSecond < 0) return 'N/A';
  if (bytesPerSecond === 0) return '0 Mbps';
  const bps = bytesPerSecond * 8;
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(2)} Mbps`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(2)} Kbps`;
  return `${bps.toFixed(2)} bps`;
};

interface Props {
  iface: zebar.NetworkInterface;
}

export default function InterfaceDetails({ iface }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">
          {iface.friendlyName || iface.name} ({iface.type})
        </h3>
        <p className="text-text-muted">{iface.description}</p>
      </div>
      <section className="space-y-1.5">
        <h3 className="font-medium flex items-center text-text-muted gap-2">
          <Rss className="h-5 w-5" aria-hidden="true" />
          Connection Speed
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Card className="space-y-1.5">
            <CardTitle Icon={ArrowDown}>Receive</CardTitle>
            {formatSpeed(iface.receiveSpeed)}
          </Card>
          <Card className="space-y-1.5 select-all">
            <CardTitle Icon={ArrowUp}>Transmit</CardTitle>
            <span className="select-all">
              {/* 
              // @ts-expect-error - zebar types are wrong */}
              {formatSpeed(iface.transmitSpeed)}
            </span>
          </Card>
        </div>
      </section>
      <section className="space-y-1.5">
        <h3 className="font-medium flex items-center text-text-muted gap-2">
          <Globe className="h-5 w-5" aria-hidden="true" />
          Network Addresses
        </h3>
        <Card>
          <CardTitle>MAC Address</CardTitle>
          <CopyToClipboard textToCopy={iface.macAddress}>
            {iface.macAddress}
          </CopyToClipboard>
        </Card>
        <Card>
          <CardTitle>IPv4 Address</CardTitle>
          <List ips={iface.ipv4Addresses} />
        </Card>
        <Card>
          <CardTitle>IPv6 Address</CardTitle>
          <List ips={iface.ipv6Addresses} />
        </Card>
        <Card>
          <CardTitle>DNS Servers</CardTitle>
          <List ips={iface.dnsServers} />
        </Card>
      </section>
    </div>
  );
}
