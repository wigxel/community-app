"use client";

import { Maximize2, RotateCcw, RotateCw, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageDataUrl: string) => void;
}

export function ImageUpload({ currentImage, onImageChange }: ImageUploadProps) {
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

  function handleRemove() {
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      <div className="flex items-center gap-4">
        {currentImage && (
          <div className="relative">
            <Image
              src={currentImage}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover border-2 border-white/20"
              width={240}
              height={240}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button type="button" variant="outline" asChild>
              <span className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                {currentImage ? "Change Image" : "Upload Image"}
              </span>
            </Button>
          </label>
          <p className="text-xs text-white/60">
            Max size: 5MB. Supports JPG, PNG, GIF
          </p>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={handleCancel}>
        <DialogContent className="!max-w-[600px] !w-[600px] p-0 gap-0 bg-white overflow-hidden [&>button]:hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <DialogTitle className="text-base font-semibold text-gray-900">
              Edit image
            </DialogTitle>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex h-[350px]">
            <div className="flex-1 bg-gray-200 p-4 flex items-center justify-center relative overflow-hidden">
              {imgSrc && (
                <div className="relative w-full h-full flex items-center justify-center">
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
                      className="max-w-[280px] max-h-[280px] object-contain pointer-events-none"
                    />
                  </button>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 rounded-full border-4 border-white shadow-2xl relative">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                        }}
                      />
                    </div>
                  </div>

                  <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-700 font-medium bg-white/80 py-1">
                    Drag to reposition • Use zoom to adjust size
                  </p>
                </div>
              )}
            </div>

            <div className="w-52 bg-white border-l flex flex-col">
              <Tabs defaultValue="crop" className="flex-1 flex flex-col">
                <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent h-auto p-0">
                  <TabsTrigger
                    value="crop"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-gray-600 data-[state=active]:text-gray-900 py-2 text-xs"
                  >
                    Crop
                  </TabsTrigger>
                  <TabsTrigger
                    value="filter"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-gray-600 data-[state=active]:text-gray-900 py-2 text-xs"
                  >
                    Filter
                  </TabsTrigger>
                  <TabsTrigger
                    value="adjust"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-gray-600 data-[state=active]:text-gray-900 py-2 text-xs"
                  >
                    Adjust
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="crop"
                  className="flex-1 p-3 space-y-3 mt-0 overflow-y-auto"
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
                      className="w-full text-xs text-gray-900"
                      onClick={() => changeInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-3 w-3" />
                      Select Different Image
                    </Button>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 mb-2">Adjust Image</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleRotateLeft}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="Rotate left"
                    >
                      <RotateCcw size={16} className="text-gray-700" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRotateRight}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="Rotate right"
                    >
                      <RotateCw size={16} className="text-gray-700" />
                    </button>
                    <button
                      type="button"
                      onClick={handleResetZoom}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="Reset"
                    >
                      <Maximize2 size={16} className="text-gray-700" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="zoom-slider"
                      className="text-xs font-medium text-gray-700"
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
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                    />
                    <div className="text-xs text-gray-500 text-right">
                      {Math.round(zoom * 100)}%
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="filter" className="flex-1 p-3 mt-0">
                  <p className="text-xs text-gray-500">Filters coming soon</p>
                </TabsContent>

                <TabsContent value="adjust" className="flex-1 p-3 mt-0">
                  <p className="text-xs text-gray-500">
                    Adjustments coming soon
                  </p>
                </TabsContent>
              </Tabs>

              <div className="p-3 border-t">
                <Button
                  type="button"
                  onClick={handleSave}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                >
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
