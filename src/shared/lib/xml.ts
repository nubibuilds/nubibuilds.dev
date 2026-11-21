/** Escape text for use inside XML elements and attributes. */
export const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** Absolute URL for a site path, with the trailing slash Astro's static build uses. */
export const absoluteUrl = (path: string, site: URL | undefined) => {
  const base = site ?? new URL('http://localhost:4321');
  const withSlash = path.endsWith('/') || path.includes('.') ? path : `${path}/`;
  return new URL(withSlash, base).href;
};
