import { Card, CardTitle } from '@overline-zebar/ui';
import { ArrowDownUp, CloudDownload, CloudUpload } from 'lucide-react';
import { NetworkTraffic } from 'zebar';

type Props = {
  traffic?: NetworkTraffic | null;
};

interface DataSizeMeasure {
  bytes: number;
  siValue: number;
  siUnit: string;
  iecValue: number;
  iecUnit: string;
}

const formatDataSize = (measure: DataSizeMeasure): string => {
  if (!measure) return 'N/A';
  return `${measure.iecValue.toFixed(2)} ${measure.iecUnit}`;
};

export default function Traffic({ traffic }: Props) {
  if (!traffic) return;

  return (
    <section className="space-y-1.5">
      <h3 className="font-medium flex items-center text-text-muted gap-2">
        <ArrowDownUp className="h-4 w-4" aria-hidden="true" />
        Overall Traffic
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardTitle Icon={CloudDownload}>Received</CardTitle>
          <div className="text-text">{formatDataSize(traffic.received)}</div>
        </Card>
        <Card>
          <CardTitle Icon={CloudUpload}>Transmit</CardTitle>
          <div className="text-text">{formatDataSize(traffic.transmitted)}</div>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardTitle Icon={CloudDownload}>Total Received</CardTitle>
          <div className="text-text">
            {formatDataSize(traffic.totalReceived)}
          </div>
        </Card>
        <Card>
          <CardTitle Icon={CloudUpload}>Total Transmit</CardTitle>
          <div className="text-text">
            {formatDataSize(traffic.totalTransmitted)}
          </div>
        </Card>
      </div>
    </section>
  );
}
