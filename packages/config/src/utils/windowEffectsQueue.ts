// Native effects cannot be cancelled once started. Serialize both clearing and
// applying, and skip superseded requests before each native operation.
export function createWindowEffectsQueue() {
  let tail = Promise.resolve();
  let latest = 0;

  function request(clear: () => Promise<void>, apply?: () => Promise<void>) {
    const version = ++latest;
    tail = tail
      .then(async () => {
        if (version !== latest) return;
        // Effects are experimental; a failed operation must not block the queue.
        await clear().catch(() => {});
        if (version === latest) await apply?.();
      })
      .catch(() => {});

    return () => {
      if (version === latest) {
        // Also undo an apply that was already in flight during cleanup. A new
        // setup supersedes this clear, but still waits for that apply to settle.
        request(clear);
      }
    };
  }

  return request;
}
