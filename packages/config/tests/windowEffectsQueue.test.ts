import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createWindowEffectsQueue } from '../src/utils/windowEffectsQueue.ts';

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

// Drain promise continuations without wall-clock delays.
const flush = () => new Promise<void>((resolve) => setImmediate(resolve));

test('None supersedes Acrylic while its clear is pending', async () => {
  const request = createWindowEffectsQueue();
  const pending = deferred();
  const calls: string[] = [];
  const cleanup = request(
    async () => {
      calls.push('clear Acrylic');
      await pending.promise;
    },
    async () => {
      calls.push('apply Acrylic');
    }
  );
  await flush();
  cleanup();
  request(async () => {
    calls.push('clear None');
  });
  await flush();
  assert.deepEqual(calls, ['clear Acrylic']);
  pending.resolve();
  await flush();
  assert.deepEqual(calls, ['clear Acrylic', 'clear None']);
});

test('None waits for an in-flight apply and clears its result', async () => {
  const request = createWindowEffectsQueue();
  const pending = deferred();
  const calls: string[] = [];
  let backdrop = 'none';
  const cleanup = request(
    async () => {
      calls.push('clear Acrylic');
    },
    async () => {
      calls.push('start Acrylic');
      await pending.promise;
      backdrop = 'acrylic';
      calls.push('finish Acrylic');
    }
  );
  await flush();
  cleanup();
  request(async () => {
    calls.push('clear None');
    backdrop = 'none';
  });
  await flush();
  assert.deepEqual(calls, ['clear Acrylic', 'start Acrylic']);
  pending.resolve();
  await flush();
  assert.deepEqual(calls, [
    'clear Acrylic',
    'start Acrylic',
    'finish Acrylic',
    'clear None',
  ]);
  assert.equal(backdrop, 'none');
});

test('rapid theme/effect changes skip queued work and apply only the latest', async () => {
  const request = createWindowEffectsQueue();
  const pending = deferred();
  const calls: string[] = [];
  request(
    () => pending.promise,
    async () => {
      calls.push('old theme');
    }
  );
  await flush();
  request(
    async () => {
      calls.push('intermediate clear');
    },
    async () => {
      calls.push('intermediate theme');
    }
  );
  request(
    async () => {
      calls.push('latest clear');
    },
    async () => {
      calls.push('latest theme');
    }
  );
  pending.resolve();
  await flush();
  assert.deepEqual(calls, ['latest clear', 'latest theme']);
});

test('cleanup cancels a pending apply and clears on unmount', async () => {
  const request = createWindowEffectsQueue();
  const pending = deferred();
  const calls: string[] = [];
  const cleanup = request(
    async () => {
      calls.push('clear');
      await pending.promise;
    },
    async () => {
      calls.push('apply');
    }
  );
  await flush();
  cleanup();
  pending.resolve();
  await flush();
  assert.deepEqual(calls, ['clear', 'clear']);
});

test('cleanup clears an in-flight apply even without another setup', async () => {
  const request = createWindowEffectsQueue();
  const pending = deferred();
  let backdrop = 'none';
  const cleanup = request(
    async () => {
      backdrop = 'none';
    },
    async () => {
      await pending.promise;
      backdrop = 'acrylic';
    }
  );
  await flush();
  cleanup();
  pending.resolve();
  await flush();
  assert.equal(backdrop, 'none');
});

test('Strict Mode setup/cleanup/setup and old cleanup preserve the latest request', async () => {
  const request = createWindowEffectsQueue();
  const calls: string[] = [];
  const cleanup = request(
    async () => {
      calls.push('old clear');
    },
    async () => {
      calls.push('old apply');
    }
  );
  cleanup();
  request(
    async () => {
      calls.push('new clear');
    },
    async () => {
      calls.push('new apply');
    }
  );
  cleanup();
  await flush();
  assert.deepEqual(calls, ['new clear', 'new apply']);
});

test('rejected native operations do not poison later requests', async () => {
  const request = createWindowEffectsQueue();
  const calls: string[] = [];
  request(
    async () => {
      throw new Error('clear failed');
    },
    async () => {
      calls.push('apply attempted');
      throw new Error('apply failed');
    }
  );
  await flush();
  request(async () => {
    calls.push('clear None');
  });
  await flush();
  assert.deepEqual(calls, ['apply attempted', 'clear None']);
});
