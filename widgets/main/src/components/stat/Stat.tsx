import { WeatherThreshold } from '@overline-zebar/config';
import { StatRing, Thresholds } from '@overline-zebar/ui';
import { StatInline } from './components/StatInline';

interface BaseStatProps {
  Icon: React.ReactNode;
  stat: string;
}

type StatProps = BaseStatProps &
  (
    | { type: 'ring'; threshold?: Thresholds }
    | { type: 'inline'; threshold?: WeatherThreshold[] }
  );

export default function Stat(props: StatProps) {
  switch (props.type) {
    case 'ring':
      return (
        <StatRing
          Icon={props.Icon}
          stat={props.stat}
          threshold={props.threshold}
        />
      );
    case 'inline':
      return (
        <StatInline
          Icon={props.Icon}
          stat={props.stat}
          threshold={props.threshold}
        />
      );
    default:
      return null;
  }
}
