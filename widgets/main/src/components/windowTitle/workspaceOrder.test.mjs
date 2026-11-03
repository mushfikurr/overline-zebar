import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeWorkspaceOrder } from './workspaceOrder.ts';

test('empty numbered workspaces keep their direction in every visit order', () => {
  const permanent = ['1', '2', '3', '4', '5'];
  const permutations = (items) =>
    items.length === 0
      ? [[]]
      : items.flatMap((item) =>
          permutations(items.filter((other) => other !== item)).map((rest) => [
            item,
            ...rest,
          ])
        );

  for (const visits of permutations(['6', '7', '8', '9', '10'])) {
    let order = permanent;
    let previous = '5';
    // Also revisit every workspace after its original instance disappeared.
    for (const name of [...visits, ...visits.toReversed()]) {
      order = mergeWorkspaceOrder(order, permanent);
      order = mergeWorkspaceOrder(order, [...permanent, name]);
      assert.equal(
        Math.sign(order.indexOf(name) - order.indexOf(previous)),
        Math.sign(Number(name) - Number(previous)),
        `${visits.join(',')}: ${previous} -> ${name}`
      );
      previous = name;
    }
  }
});

test('explicit live ordering overrides numeric guesses', () => {
  assert.deepEqual(mergeWorkspaceOrder(['1', '2', '3'], ['3', '2', '1']), [
    '3',
    '2',
    '1',
  ]);
});

test('named workspaces retain observed ordering across disappearance', () => {
  const previous = ['code', 'web', 'chat'];
  assert.deepEqual(mergeWorkspaceOrder(previous, ['code', 'chat']), previous);
  assert.deepEqual(mergeWorkspaceOrder(previous, ['code', 'mail', 'chat']), [
    'code',
    'web',
    'mail',
    'chat',
  ]);
});
