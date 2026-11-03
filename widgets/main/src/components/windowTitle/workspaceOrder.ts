// Live order is authoritative, but inactive workspaces must remain available
// when deriving the direction of a swap away from one of them.
export function mergeWorkspaceOrder(
  previous: string[],
  live: string[]
): string[] {
  const order = [...previous];
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
