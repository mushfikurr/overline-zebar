import { cn } from '../../../utils/cn';

const Ring = ({
  percentage,
  className,
  strokeColor = 'stroke-green-500',
  backgroundColor = 'stroke-background',
  strokeWidth = 14,
}: {
  percentage: number;
  className?: string;
  strokeColor?: string;
  backgroundColor?: string;
  strokeWidth?: number;
}) => {
  const size = 100;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center rounded-full overflow-hidden">
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        {/* Border Circle */}
        <circle
          cx="50"
          cy="50"
          r={radius + strokeWidth / 2}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          className={cn(backgroundColor)}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Foreground Circle (Progress Circle) */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          className={cn(strokeColor)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
    </div>
  );
};

export default Ring;
