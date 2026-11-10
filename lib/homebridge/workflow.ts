import { Workspace } from "./schema";
/** Context changes invalidate generated document revisions without silently changing proposed terms. */
export function invalidateDocuments(
  state: Workspace,
  ids: string[],
): Workspace["offers"] {
  const next = { ...state.offers };
  for (const id of ids) {
    const draft = next[id];
    if (draft)
      next[id] = {
        ...draft,
        revision: draft.revision + 1,
        updatedAt: new Date().toISOString(),
      };
  }
  return next;
}
