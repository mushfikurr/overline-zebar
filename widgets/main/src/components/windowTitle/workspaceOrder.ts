// Live order is authoritative, but inactive workspaces must remain available
// when deriving the direction of a swap away from one of them.
export function mergeWorkspaceOrder(
  previous: string[],
  live: string[]
): string[] {
  const order = [...previous];

  // Empty, non-keep_alive workspaces may never coexist in a snapshot.
  // Seed unseen numbered workspaces by number rather than visit order;
  // the live ordering below still takes precedence (including custom orders).
  for (const name of live) {
    if (order.includes(name) || !/^\d+$/.test(name)) continue;
    const nextNumberIndex = order.findIndex(
      (existing) => /^\d+$/.test(existing) && Number(existing) > Number(name)
    );
    order.splice(
      nextNumberIndex === -1 ? order.length : nextNumberIndex,
      0,
      name
    );
  }

  let nextIndex = order.length;

  for (const name of [...live].reverse()) {
    const existingIndex = order.indexOf(name);
    if (existingIndex === -1) {
      order.splice(nextIndex, 0, name);
    } else if (existingIndex >= nextIndex) {
      order.splice(existingIndex, 1);
      order.splice(nextIndex, 0, name);
    } else {
      nextIndex = existingIndex;
    }
  }

  return order;
}
