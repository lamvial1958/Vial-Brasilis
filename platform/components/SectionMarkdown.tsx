import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugVerbo } from "@/lib/content/verbos";

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replaces verb infinitives in a markdown string with links to conjugacao.com.br.
 * Processes line-by-line; skips lines already containing conjugacao.com.br links.
 * Uses negative lookbehind/lookahead to avoid double-linking.
 */
function linkificarVerbos(markdown: string, verbos: string[]): string {
  if (!verbos.length) return markdown;

  // Longest first so "trabalhar" is matched before a hypothetical "balhar"
  const sorted = [...verbos].sort((a, b) => b.length - a.length);

  return markdown
    .split("\n")
    .map(line => {
      if (line.includes("conjugacao.com.br")) return line;

      let result = line;
      for (const verbo of sorted) {
        const url = `https://www.conjugacao.com.br/verbo-${slugVerbo(verbo)}/`;
        // (?<!\[) — not already inside [text]( — checks char before match
        // \b...\b — whole-word match (works for ASCII endings -ar/-er/-ir/-or)
        // (?!\]) — not immediately followed by ] (prevents matching verb inside [verb])
        const re = new RegExp(
          `(?<!\\[)\\b${escapeRe(verbo)}\\b(?!\\])`,
          "gi",
        );
        result = result.replace(re, `[$&](${url})`);
      }
      return result;
    })
    .join("\n");
}

export function SectionMarkdown({
  markdown,
  verbos = [],
}: {
  markdown: string;
  verbos?: string[];
}) {
  const md = linkificarVerbos(markdown, verbos);
  return (
    <div className="prose prose-sm max-w-none prose-table:w-full prose-th:text-left">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            const isVerbo = href?.includes("conjugacao.com.br");
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-inherit underline decoration-dotted underline-offset-2 hover:decoration-solid"
                {...props}
              >
                {children}
                {isVerbo && (
                  <span className="print:hidden not-prose text-[0.6em] align-super ml-[0.15em] opacity-50">
                    ↗
                  </span>
                )}
              </a>
            );
          },
        }}
      >
        {md}
      </ReactMarkdown>
    </div>
  );
}
