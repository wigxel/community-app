"use client";

import { IconButton } from "@hyperbridge/ui";
import { Maximize2, RotateCcw, RotateCw, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useWatch } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageDataUrl: string) => void;
}

export function ImageUpload({ currentImage, onImageChange }: ImageUploadProps) {
  const firstName = useWatch({ name: "firstName" });
  const [isOpen, setIsOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const changeInputRef = useRef<HTMLInputElement>(null);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(reader.result?.toString() || "");
        setIsOpen(true);
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
        setIsDragging(false);
      });
      reader.readAsDataURL(file);
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  function getCroppedImg(): string | null {
    const image = imgRef.current;
    if (!image) return null;

    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const containerSize = 400;
    const circleSize = 256;
    const scale = size / circleSize;

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom * scale, zoom * scale);
    ctx.translate(position.x, position.y);

    const imgAspect = image.naturalWidth / image.naturalHeight;
    let drawWidth: number;
    let drawHeight: number;

    if (imgAspect > 1) {
      drawWidth = Math.min(containerSize, image.naturalWidth);
      drawHeight = drawWidth / imgAspect;
    } else {
      drawHeight = Math.min(containerSize, image.naturalHeight);
      drawWidth = drawHeight * imgAspect;
    }

    ctx.drawImage(
      image,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight,
    );
    ctx.restore();

    return canvas.toDataURL("image/jpeg", 0.9);
  }

  function handleSave() {
    const croppedImage = getCroppedImg();
    if (croppedImage) {
      onImageChange(croppedImage);
      setIsOpen(false);
      setImgSrc("");
    }
  }

  function handleCancel() {
    setIsOpen(false);
    setImgSrc("");
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (changeInputRef.current) {
      changeInputRef.current.value = "";
    }
  }

  function handleRotateLeft() {
    setRotation((prev) => prev - 90);
  }

  function handleRotateRight() {
    setRotation((prev) => prev + 90);
  }

  function handleResetZoom() {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex aspect-square w-full flex-col items-center justify-center rounded-2xl border">
          <Avatar className="size-[40%]">
            <AvatarImage
              src={currentImage ?? undefined}
              alt="Profile"
              width={240}
              height={240}
            />
            <AvatarFallback className="bg-gray-500 text-xl uppercase">
              {firstName?.[0] ?? "--"}
            </AvatarFallback>
          </Avatar>

          <div className="mt-4 flex flex-col items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onSelectFile}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button
                type="button"
                variant="outline"
                className="border-white/30 bg-white/10 !text-white hover:bg-white/20"
                asChild
              >
                <span className="flex cursor-pointer items-center">
                  <Upload className="mr-2 h-4 w-4" />
                  {currentImage ? "Change Image" : "Upload Image"}
                </span>
              </Button>
            </label>
            <p className="text-muted-foreground text-xs">
              Max size: 5MB. Supports JPG, PNG, GIF
            </p>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={handleCancel}>
        <DialogContent className="bg-background aspect-2/1.5 w-[70svh] max-w-[800px] gap-0 overflow-hidden p-0 [&>button]:hidden">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <DialogTitle className="text-foreground text-base font-semibold">
              Edit image
            </DialogTitle>

            <IconButton
              type="button"
              className="text-gray-400 transition-colors hover:text-gray-600"
              onClick={handleCancel}
              variant={"unset"}
            >
              <X size={20} />
            </IconButton>
          </div>

          <div className="flex">
            <div className="bg-muted relative flex flex-1 items-center justify-center overflow-hidden p-4">
              {imgSrc && (
                <div className="relative flex h-full w-full items-center justify-center">
                  <button
                    type="button"
                    className="relative cursor-move select-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                      }
                    }}
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                      transition: isDragging ? "none" : "transform 0.1s ease",
                    }}
                  >
                    {/* biome-ignore lint/performance/noImgElement: Requires ref for canvas cropping, not compatible with next/image */}
                    <img
                      ref={imgRef}
                      src={imgSrc}
                      alt="Crop preview"
                      draggable={false}
                      className="pointer-events-none size-70 object-contain"
                    />
                  </button>

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="relative h-64 w-64 rounded-full border-4 border-white shadow-2xl">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <p className="bg-background/80 text-foreground absolute right-0 bottom-0 left-0 py-2 text-center text-xs font-medium">
                Drag to reposition • Use zoom to adjust size
              </p>
            </div>

            <div className="bg-background flex w-52 flex-col border-l">
              <Tabs defaultValue="crop" className="flex flex-1 flex-col">
                <TabsList className="grid h-auto w-full grid-cols-3 rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="crop"
                    className="data-[state=active]:text-foreground rounded-none border-b-2 border-transparent py-2 text-xs text-gray-600 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                  >
                    Crop
                  </TabsTrigger>
                  {/*<TabsTrigger
                    value="filter"
                    className="data-[state=active]:text-foreground rounded-none border-b-2 border-transparent py-2 text-xs text-gray-600 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                  >
                    Filter
                  </TabsTrigger>
                  <TabsTrigger
                    value="adjust"
                    className="data-[state=active]:text-foreground rounded-none border-b-2 border-transparent py-2 text-xs text-gray-600 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                  >
                    Adjust
                  </TabsTrigger>*/}
                </TabsList>

                <TabsContent
                  value="crop"
                  className="mt-0 flex-1 space-y-3 overflow-y-auto p-3"
                >
                  <div>
                    <input
                      ref={changeInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onSelectFile}
                      className="hidden"
                      id="image-upload-change"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-foreground w-full text-xs"
                      onClick={() => changeInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-3 w-3" />
                      Select Different Image
                    </Button>
                  </div>

                  <div className="border-t pt-3">
                    <p className="mb-2 text-xs text-gray-500">Adjust Image</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleRotateLeft}
                      className="hover:bg-muted rounded p-1.5 transition-colors"
                      title="Rotate left"
                    >
                      <RotateCcw size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRotateRight}
                      className="hover:bg-muted rounded p-1.5 transition-colors"
                      title="Rotate right"
                    >
                      <RotateCw size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={handleResetZoom}
                      className="hover:bg-muted rounded p-1.5 transition-colors"
                      title="Reset"
                    >
                      <Maximize2 size={16} className="text-muted-foreground" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="zoom-slider"
                      className="text-muted-foreground text-xs font-medium"
                    >
                      Zoom
                    </label>
                    <input
                      id="zoom-slider"
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="bg-muted h-1.5 w-full cursor-pointer appearance-none rounded-lg accent-gray-900"
                    />
                    <div className="text-right text-xs text-gray-500">
                      {Math.round(zoom * 100)}%
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="filter" className="mt-0 flex-1 p-3">
                  <p className="text-xs text-gray-500">Filters coming soon</p>
                </TabsContent>

                <TabsContent value="adjust" className="mt-0 flex-1 p-3">
                  <p className="text-xs text-gray-500">
                    Adjustments coming soon
                  </p>
                </TabsContent>
              </Tabs>

              <div className="border-t p-3">
                <Button type="button" onClick={handleSave} className="w-full">
                  Save changes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
