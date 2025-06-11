import { Card, CardTitle } from '@overline-zebar/ui';
import { Info, Wifi } from 'lucide-react';
import { useSearchParams } from 'wouter';
import * as zebar from 'zebar';
import PanelLayout from '../common/PanelLayout';
import InterfaceDetails from './components/InterfaceDetails';
import Traffic from './components/Traffic';

interface NetworkPanelProps {
  network: {
    interfaces: zebar.NetworkInterface[];
    gateway?: zebar.NetworkGateway | null;
    traffic?: zebar.NetworkTraffic | null;
  } | null;
}

export default function Network({ network }: NetworkPanelProps) {
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

  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'default';

  const defaultInterface =
    network.interfaces.find((iface) => iface.isDefault) ||
    network.interfaces[0];
  const currInterface =
    network.interfaces.find((iface) => iface.name === tab) ?? defaultInterface;

  if (!currInterface) {
    return (
      <PanelLayout title="Network">
        <div className="flex flex-col justify-center items-center select-text w-full text-text-muted h-full">
          <Info className="w-10 h-10 mb-4 text-text-muted" />
          <p>Error retrieving network interface.</p>
        </div>
      </PanelLayout>
    );
  }

  if (!defaultInterface) {
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
      <InterfaceDetails iface={currInterface} />
      {/* Gateway Info */}
      {network.gateway && (
        <Card>
          <CardTitle>
            Gateway {network.gateway.ssid ? `(${network.gateway.ssid})` : ''}
          </CardTitle>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div>
              <p className="text-text-muted">MAC Address</p>
              <p>{network.gateway.macAddress}</p>
            </div>
            {network.gateway.signalStrength !== null &&
              typeof network.gateway.signalStrength !== 'undefined' && (
                <div>
                  <p className="text-text-muted">Signal Strength</p>
                  <p className="flex items-center">
                    <Wifi className="w-3 h-3 mr-1" />{' '}
                    {network.gateway.signalStrength}%
                  </p>
                </div>
              )}
          </div>
          <div className="mt-1">
            <p className="text-text-muted">IPv4 Addresses</p>
            {network.gateway.ipv4Addresses.length > 0 ? (
              network.gateway.ipv4Addresses.map((ip) => <p key={ip}>{ip}</p>)
            ) : (
              <p>N/A</p>
            )}
          </div>
          <div className="mt-1">
            <p className="text-text-muted">IPv6 Addresses</p>
            {network.gateway.ipv6Addresses.length > 0 ? (
              network.gateway.ipv6Addresses.map((ip) => <p key={ip}>{ip}</p>)
            ) : (
              <p>N/A</p>
            )}
          </div>
        </Card>
      )}
    </PanelLayout>
  );
}
