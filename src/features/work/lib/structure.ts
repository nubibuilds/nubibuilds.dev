/*
 * The shape every published case study body must have:
 *   - no `#` heading: the page heading (H1) is `title` from the frontmatter;
 *   - at least four `##` headings: the first four are Problem, Architecture, Implementation and
 *     Result (in Indonesian: Masalah, Arsitektur, Implementasi, Hasil). The overview links its four
 *     steps to them by position, and they get the section numbers and colours. Further `##`
 *     sections may follow them.
 * Lines inside fenced code blocks are skipped, so a `# comment` in a shell or Python block is not
 * taken for a heading.
 */
import { headingLines } from '@shared/lib/markdown-headings';

export const REQUIRED_SECTIONS = 4;

/** What is wrong with the headings of a case study body, as readable messages (empty when it is fine). */
export function structureProblems(body: string): string[] {
  const h1 = headingLines(body, 1);
  const h2 = headingLines(body, 2);
  const problems: string[] = [];
  if (h1.length > 0)
    problems.push(`remove the "#" heading (${h1[0]}): the page heading comes from \`title\`; start sections with "##"`);
  if (h2.length < REQUIRED_SECTIONS)
    problems.push(
      `the body has ${h2.length} "##" section(s); it must start with ${REQUIRED_SECTIONS}: Problem, Architecture, Implementation, Result (Masalah, Arsitektur, Implementasi, Hasil)`,
    );
  return problems;
}
