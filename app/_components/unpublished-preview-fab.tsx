"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@hyperbridge/ui";
import { EyeIcon, EyeOffIcon, PencilIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import React from "react";
import { FAButton } from "~/components/ui/fab-button";

interface UnpublishedPreviewFabProps {
  projectId: string;
  exitPreview: () => Promise<void>;
}

/**
 * Floating toggle for the owner previewing an unpublished project.
 * Collapsed: an eye. Open: a dropdown with what it means plus the way out.
 */
export function UnpublishedPreviewFab(props: UnpublishedPreviewFabProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed end-6 bottom-6 z-90">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <FAButton title="Preview options" aria-expanded={isOpen}>
            {/* Outgoing icon twists -45deg out while the incoming untwists
                in. */}
            <span className="relative block size-5">
              <AnimatePresence initial={false}>
                <motion.span
                  key={isOpen ? "close" : "eye"}
                  className="absolute inset-0 grid place-content-center"
                  initial={{ opacity: 0, rotate: -45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -45 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {isOpen ? (
                    <XIcon className="text-background" size={20} />
                  ) : (
                    <EyeIcon className="text-background" size={20} />
                  )}
                </motion.span>
              </AnimatePresence>
            </span>
          </FAButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="top" className="max-w-[30ch]">
          <span className="text-foreground mb-2 block px-2 py-1.5 text-xs">
            Preview mode. <br />
            <span className="text-muted-foreground">
              Only you can see this project.
            </span>
          </span>

          <Link href={`/dashboard/projects/edit/${props.projectId}`}>
            <DropdownMenuItem>
              <PencilIcon className="text-muted-foreground" />
              Edit project
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem onClick={() => void props.exitPreview()}>
            <EyeOffIcon className="text-muted-foreground" />
            Exit preview
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
