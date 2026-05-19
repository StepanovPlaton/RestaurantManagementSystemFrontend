import GithubSlugger from "github-slugger";

export function slugifyHeading(text: string): string {
  const slugger = new GithubSlugger();
  return slugger.slug(text);
}
