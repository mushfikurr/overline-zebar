import { convertFileSrc } from '@tauri-apps/api/core';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

export function CustomIconPreview({
  path,
  className = 'size-6',
}: {
  path: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [path]);

  if (failed) {
    return (
      <span
        className={cn(
          'border-danger text-danger flex items-center justify-center rounded border border-dashed',
          className
        )}
      >
        <X className="size-3.5" />
      </span>
    );
  }

  return (
    <img
      src={convertFileSrc(path)}
      onError={() => setFailed(true)}
      className={cn(
        'rounded object-contain outline outline-1 outline-white/10',
        className
      )}
      alt=""
    />
  );
}
