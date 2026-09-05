import { useEffect, useState } from 'react';

export type FontPermission =
  | 'granted'
  | 'denied'
  | 'prompt'
  | 'unsupported'
  | null;

interface UseFontPermissionResult {
  permission: FontPermission;
}

/**
 * Tracks the browser's "local-fonts" permission state while the picker
 * dialog is open. Falls back to `'unsupported'` when the Permissions API
 * rejects the `'fonts'` descriptor (e.g. Firefox / Safari).
 */
export function useFontPermission(open: boolean): UseFontPermissionResult {
  const [permission, setPermission] = useState<FontPermission>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let status: PermissionStatus | null = null;

    const check = async () => {
      try {
        status = await navigator.permissions.query({
          name: 'fonts' as PermissionName,
        });
        if (cancelled) return;
        setPermission(status.state as 'granted' | 'denied' | 'prompt');
        status.onchange = () => {
          if (!cancelled) {
            setPermission(status!.state as 'granted' | 'denied' | 'prompt');
          }
        };
      } catch {
        if (!cancelled) setPermission('unsupported');
      }
    };

    check();

    return () => {
      cancelled = true;
      if (status) status.onchange = null;
    };
  }, [open]);

  return { permission };
}
