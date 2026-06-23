import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function SectionMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-table:w-full prose-th:text-left">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
