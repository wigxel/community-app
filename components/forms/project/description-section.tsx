"use client";
import { Button } from "@hyperbridge/ui";
import { FileText } from "lucide-react";
import dynamic from "next/dynamic";
import React from "react";
import { useFormContext } from "react-hook-form";
import { MarkdownRenderer } from "~/components/markdown/markdown-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { ProjectFormValues } from "./project-form";

// The Tiptap bundle is heavy; only load it when the dialog actually opens.
const FullDescriptionDialog = dynamic(
  () =>
    import("./full-description-dialog").then((m) => m.FullDescriptionDialog),
  { ssr: false },
);

const FADE_MASK = "linear-gradient(to bottom, black 75%, transparent 100%)";

export function DescriptionSection() {
  const { watch } = useFormContext<ProjectFormValues>();
  const longDescription = watch("longDescription") ?? "";

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3 text-left">
            <div className="text-brand-primary bg-brand-black-450 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
              <FileText size={15} />
            </div>

            <CardTitle className="text-foreground truncate text-base">
              Full description
            </CardTitle>
          </div>

          <Button
            size="sm"
            type="button"
            variant="default"
            className="px-4"
            onClick={() => setDialogOpen(true)}
          >
            Edit
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {longDescription.trim() === "" ? (
          <p className="text-muted-foreground text-sm">
            No full description yet — click Edit to write one.
          </p>
        ) : (
          <div
            ref={previewRef}
            className="max-h-[10lh] overflow-hidden leading-normal"
            style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
          >
            <MarkdownRenderer className="max-w-none">
              {longDescription.slice(0, 500)}
            </MarkdownRenderer>
          </div>
        )}
      </CardContent>

      {dialogOpen ? (
        <FullDescriptionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      ) : null}
    </Card>
  );
}
