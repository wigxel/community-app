"use client";

import { Eye } from "lucide-react";
import NextImage from "next/image";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

interface MediaPreviewModalProps {
  type: "photo" | "video" | "pdf";
  url: string;
  title?: string;
}

export function MediaPreviewModal(props: MediaPreviewModalProps) {
  const { type, url, title } = props;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-foreground/30 absolute top-2 right-2 h-6 w-6 hover:bg-blue-500/10 hover:text-blue-300"
        >
          <Eye size={13} />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-4xl border-none bg-[#252323] p-0">
        <DialogHeader>
          <DialogTitle className="border-b border-white/10 p-5">
            Media Preview
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preview uploaded media
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center overflow-auto p-2 pt-0">
          {type === "photo" && (
            <NextImage
              src={url}
              alt={title ?? "Photo preview"}
              width={200}
              height={200}
              className="max-h-[75vh] w-full object-contain"
            />
          )}
          {type === "video" && (
            <video src={url} controls autoPlay className="max-h-[75vh] w-full">
              <track
                kind="captions"
                srcLang="en"
                label="English captions"
                src={url}
              />
            </video>
          )}
          {type === "pdf" && (
            <iframe
              src={url}
              className="min-h-[75vh] w-full"
              title={title ?? "Untitled Document"}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
