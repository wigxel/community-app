"use client";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { MarkdownEditor } from "./markdown-editor";

export function DescriptionSection() {
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
        </div>
      </CardHeader>

      <CardContent>
        <MarkdownEditor name="longDescription" label="" />
      </CardContent>
    </Card>
  );
}
