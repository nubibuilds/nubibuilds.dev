/** Everything the interactive terminal knows about the site. Built once per page by SiteLayout. */
export interface TerminalData {
  site: {
    name: string;
    role: string;
    tagline: string;
    motto: string;
    links: { label: string; href: string; text: string }[];
  };
  /** Top-level destinations for `ls` and `cd`. `dir` adds a trailing slash in listings. */
  pages: { name: string; url: string; about: string; dir?: boolean }[];
  work: { slug: string; title: string; url: string; summary: string; lang: string }[];
  writing: { slug: string; title: string; url: string; summary: string; lang: string; date: string }[];
}
