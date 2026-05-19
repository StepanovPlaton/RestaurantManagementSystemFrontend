"use client";

import { useMemo, useRef } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { TocEntry } from "@/content/help/get-help-document";
import { slugifyHeading } from "@/shared/lib/heading-slug";
import { cn } from "@/shared/lib/utils";

function headingClass(level: 1 | 2 | 3 | 4) {
  const base = "scroll-mt-24 font-semibold tracking-tight";
  if (level === 1) return cn(base, "text-3xl mt-0 mb-6");
  if (level === 2) return cn(base, "text-2xl mt-10 mb-4 border-b pb-2");
  if (level === 3) return cn(base, "text-xl mt-8 mb-3");
  return cn(base, "text-lg mt-6 mb-2");
}

function makeHeading(
  level: 1 | 2 | 3 | 4,
  toc: TocEntry[],
  tocIndexRef: { current: number },
) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
  return function HelpHeading({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) {
    const text = String(children ?? "").replace(/\s*\{#.+\}\s*$/, "");
    let id = slugifyHeading(text);
    if (level === 2 || level === 3) {
      const entry = toc[tocIndexRef.current];
      if (entry) {
        id = entry.id;
        tocIndexRef.current += 1;
      }
    }
    return (
      <Tag
        id={id}
        data-help-heading={id}
        className={headingClass(level)}
        {...props}
      >
        {children}
      </Tag>
    );
  };
}

function buildMarkdownComponents(
  toc: TocEntry[],
  tocIndexRef: { current: number },
): Components {
  return {
  h1: makeHeading(1, toc, tocIndexRef),
  h2: makeHeading(2, toc, tocIndexRef),
  h3: makeHeading(3, toc, tocIndexRef),
  h4: makeHeading(4, toc, tocIndexRef),
  a: ({ href, children, ...props }) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        className="text-primary underline-offset-4 hover:underline"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt }) => (
    <figure className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        className="border-border w-full rounded-lg border shadow-sm"
      />
      {alt ? (
        <figcaption className="text-muted-foreground mt-2 text-center text-sm">
          {alt}
        </figcaption>
      ) : null}
    </figure>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[28rem] border-collapse text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="bg-muted border-b px-3 py-2 text-left font-medium">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b px-3 py-2 align-top">{children}</td>
  ),
};
}

type HelpMarkdownProps = {
  markdown: string;
  toc: TocEntry[];
  className?: string;
};

export function HelpMarkdown({ markdown, toc, className }: HelpMarkdownProps) {
  const tocIndexRef = useRef(0);
  const components = useMemo(() => {
    tocIndexRef.current = 0;
    return buildMarkdownComponents(toc, tocIndexRef);
  }, [markdown, toc]);

  return (
    <article
      className={cn(
        "prose prose-neutral dark:prose-invert max-w-none",
        "prose-headings:text-foreground prose-p:text-foreground/90",
        "prose-li:text-foreground/90 prose-strong:text-foreground",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
