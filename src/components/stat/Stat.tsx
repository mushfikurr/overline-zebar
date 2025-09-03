import { StatInline } from "./components/StatInline";
import { StatRing } from "./components/StatRing";
import {systemStatThresholds, weatherThresholds, batteryThresholds} from "./defaults/thresholds";
import { Thresholds } from "./types/thresholds";

interface StatProps {
  Icon: React.ReactNode;
  stat: string;
  // Use either explicit threshold or preset
  threshold?: Thresholds;
  preset?: "system" | "weather" | "battery";
  type: "ring" | "inline";
}

export default function Stat(props: StatProps) {
  const { type, ...p } = props;
  const resolveThresholds = (): Thresholds => {
    if (p.threshold) return p.threshold;
    switch (p.preset) {
      case "battery":
        return batteryThresholds;
      case "system":
        return systemStatThresholds;
      case "weather":
        return weatherThresholds;
      default:
        break;
    }
    if (type === "ring") return systemStatThresholds;
    return weatherThresholds;
  };
  const resolvedThreshold = resolveThresholds();
  switch (type) {
    case "ring":
      return <StatRing {...p} threshold={resolvedThreshold} />;
    case "inline":
      return <StatInline {...p} threshold={resolvedThreshold} />;
    default:
      return null;
  }
}
