/**
 * Name for a cross-page view transition. Giving a list title and the detail
 * page's heading the same name makes the browser morph one into the other.
 */
export const transitionName = (prefix: string, id: string) => `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
