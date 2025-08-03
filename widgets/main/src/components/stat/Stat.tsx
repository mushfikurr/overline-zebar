import { StatInline } from './components/StatInline';
import { weatherThresholds } from './defaults/thresholds';
import { StatRing, systemStatThresholds, Thresholds } from '@overline-zebar/ui';

interface StatProps {
  Icon: React.ReactNode;
  stat: string;
  threshold?: Thresholds;
  type: 'ring' | 'inline';
}

export default function Stat(props: StatProps) {
  const { type, ...p } = props;
  switch (type) {
    case 'ring':
      return (
        <StatRing {...p} threshold={p.threshold ?? systemStatThresholds} />
      );
    case 'inline':
      return <StatInline {...p} threshold={p.threshold ?? weatherThresholds} />;
    default:
      return null;
  }
}