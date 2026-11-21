import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "~/lib/utils";

interface MarkdownRendererProps {
  children: string;
  className?: string;
}

// Dark-theme prose styling for rendered Markdown, applied via arbitrary
// variants so we don't need the typography plugin.
const PROSE_CLASSES =
  "text-foreground/80 [&_a]:text-brand-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-3 [&_blockquote]:text-foreground/60 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:break-all [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:font-semibold [&_h4]:mt-3 [&_h4]:mb-1.5 [&_h4]:font-medium [&_img]:max-w-full [&_img]:rounded-lg [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black/40 [&_pre]:p-3 [&_pre]:text-xs [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_>*:first-child]:mt-0 [&_>*:last-child]:mb-0";

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
