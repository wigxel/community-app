import { MediaImpl } from "~/lib/factories/project";
import type { Media } from "~/types/models";

const photoMedia: Media = {
  type: "photo",
  metadata: {
    url: "https://example.com/photo.jpg",
    filename: "photo.jpg",
    mimeType: "image/jpeg",
    size: 1024,
    width: 800,
    height: 600,
  },
};

const videoMedia: Media = {
  type: "video",
  metadata: {
    url: "https://example.com/video.mp4",
    filename: "video.mp4",
    mimeType: "video/mp4",
    size: 2048,
    duration: 120,
    width: 1920,
    height: 1080,
  },
};

const pdfMedia: Media = {
  type: "pdf",
  metadata: {
    url: "https://example.com/doc.pdf",
    filename: "doc.pdf",
    mimeType: "application/pdf",
    size: 4096,
  },
};

describe("MediaImpl.match", () => {
  it("calls photo matcher for photo media", () => {
    const result = MediaImpl.match(photoMedia, {
      photo: (m) => `photo: ${m.metadata.width}x${m.metadata.height}`,
      video: () => "video",
      pdf: () => "pdf",
    });
    expect(result).toBe("photo: 800x600");
  });

  it("calls video matcher for video media", () => {
    const result = MediaImpl.match(videoMedia, {
      photo: () => "photo",
      video: (m) => `video: ${m.metadata.duration}s`,
      pdf: () => "pdf",
    });
    expect(result).toBe("video: 120s");
  });

  it("calls pdf matcher for pdf media", () => {
    const result = MediaImpl.match(pdfMedia, {
      photo: () => "photo",
      video: () => "video",
      pdf: (m) => `pdf: ${m.metadata.filename}`,
    });
    expect(result).toBe("pdf: doc.pdf");
  });

  it("returns different types from each matcher", () => {
    const result = MediaImpl.match(photoMedia, {
      photo: () => 1,
      video: () => "two",
      pdf: () => true,
    });
    expect(result).toBe(1);
    expect(typeof result).toBe("number");
  });
});
