"use client";

import { PlusIcon, X } from "lucide-react";
import Image from "next/image";
import { CoverImageUpload } from "./cover-image-upload";
import {
  EditableAvatar,
  ImageActionButton,
  ImageHoverOverlay,
} from "./editable-avatar";
import { ImageUpload } from "./image-upload";

interface ProfileImagesEditorProps {
  profileImage?: string;
  coverImage?: string;
  onProfileImageChange: (imageDataUrl: string) => void;
  onCoverImageChange: (imageDataUrl: string) => void;
  fallbackInitial?: string;
}

export function ProfileImagesEditor(props: ProfileImagesEditorProps) {
  const {
    profileImage,
    coverImage,
    onProfileImageChange,
    onCoverImageChange,
    fallbackInitial,
  } = props;

  return (
    <div className="overflow-hidden rounded-(--app-card-radius) border">
      <CoverImageUpload
        currentImage={coverImage}
        onImageChange={onCoverImageChange}
        trigger={({ open, remove }) => (
          <div className="group relative aspect-4/1 w-full bg-linear-to-r from-slate-900 via-slate-800 to-slate-700">
            {coverImage && (
              <Image
                src={coverImage}
                alt="Cover image"
                fill
                className="object-cover"
                unoptimized={coverImage.startsWith("data:")}
              />
            )}
            <ImageHoverOverlay />
            <div className="absolute inset-0 flex items-end justify-end gap-3 p-2">
              <ImageActionButton
                size="default"
                onClick={open}
                icon={PlusIcon}
                label={coverImage ? "Change image" : "Upload cover image"}
              />
              {coverImage && (
                <ImageActionButton
                  size="default"
                  onClick={remove}
                  label="Remove cover image"
                  icon={X}
                />
              )}
            </div>
          </div>
        )}
      />

      <div className="flex items-center gap-4 px-4 pt-4 pb-4">
        <ImageUpload
          currentImage={profileImage}
          onImageChange={onProfileImageChange}
          trigger={(open) => (
            <EditableAvatar
              image={profileImage}
              fallbackInitial={fallbackInitial}
              onClick={open}
              className="-mt-10"
              avatarClassName="size-20 sm:size-24"
            />
          )}
        />
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium text-white">
            Profile & cover images
          </p>
          <p className="text-muted-foreground text-xs">
            Use the camera icons to change them. <br /> Max 5MB — JPG, PNG, GIF.
          </p>
        </div>
      </div>
    </div>
  );
}
