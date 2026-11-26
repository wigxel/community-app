import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "~/lib/utils";

interface MarkdownRendererProps {
  children: string;
  className?: string;
}

// prose-invert for the dark theme; see app/globals.css where the typography
// plugin is loaded.
const PROSE_CLASSES = "prose lg:prose-lg prose-invert";

/**
 * Sanitised GitHub-flavoured Markdown renderer, shared by the editor preview
 * and the project details page. rehype-sanitize strips raw HTML by default.
 */
export function MarkdownRenderer(props: MarkdownRendererProps) {
  const { children, className } = props;

  return (
    <div className={cn(PROSE_CLASSES, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
