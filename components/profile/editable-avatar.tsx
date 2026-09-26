"use client";

import { Camera, type LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface ImageActionButtonProps {
  onClick: () => void;
  label: string;
  icon?: LucideIcon;
  className?: string;
}

export function ImageActionButton(props: ImageActionButtonProps) {
  const { onClick, label, icon: Icon = Camera, className } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-image-action
      className={cn(
        "relative z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white/80 transition-colors hover:bg-black/60 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export type ImageHoverOverlayProps = { className?: string };

export function ImageHoverOverlay(props: ImageHoverOverlayProps) {
  const { className } = props;

  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-0 transition-colors group-has-[[data-image-action]:hover]:bg-black/25",
        className,
      )}
    />
  );
}

interface EditableAvatarProps {
  image?: string;
  fallbackInitial?: string;
  onClick: () => void;
  className?: string;
  avatarClassName?: string;
}

export function EditableAvatar(props: EditableAvatarProps) {
  const { image, fallbackInitial, onClick, className, avatarClassName } = props;

  return (
    <div className={cn("group relative shrink-0 rounded-full", className)}>
      <Avatar className={cn("border-background border-4", avatarClassName)}>
        <AvatarImage src={image || undefined} alt="Profile" />
        <AvatarFallback className="bg-gray-500 text-xl uppercase">
          {fallbackInitial || "--"}
        </AvatarFallback>
      </Avatar>
      <ImageHoverOverlay className="inset-1 rounded-full" />
      <ImageActionButton
        onClick={onClick}
        label={image ? "Change profile image" : "Upload profile image"}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
}
