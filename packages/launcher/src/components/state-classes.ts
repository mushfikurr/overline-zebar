/** Shared state paint for launcher items so the launcher widget and the
 * settings applications tab can never drift: escalating ring affordances
 * for the dwell-commit, dwell, and selection states. Hosting surfaces
 * may append their own scale/text tokens on top. */
export const ITEM_STATE_CLASSES = {
  folderTarget: 'bg-primary/15 ring-primary/60 ring-[3px]',
  dwellTarget: 'bg-primary/10 ring-primary/40 ring-2',
  selected: 'bg-primary/10 ring-primary/50 ring-2',
} as const;
