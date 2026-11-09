'use client';

import { useCallback, useEffect, useState } from 'react';

export type MicPermissionState = 'unknown' | 'granted' | 'denied' | 'prompt';

export function useMicPermission() {
  const [state, setState] = useState<MicPermissionState>('unknown');

  const refresh = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
      return;
    }
    try {
      const result = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });
      setState(result.state as MicPermissionState);
      result.onchange = () => {
        setState(result.state as MicPermissionState);
      };
    } catch {
      setState('unknown');
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [refresh]);

  const micBlocked = state === 'denied';

  return { micBlocked, permissionState: state, refresh };
}
