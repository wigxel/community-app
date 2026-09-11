import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { MediaSection } from "~/components/forms/project/media-section";
import { pendingFiles } from "~/components/forms/project/media-row";
import type { ProjectFormValues } from "~/components/forms/project/project-form";

// jsdom lacks URL.createObjectURL
if (!globalThis.URL.createObjectURL) {
  globalThis.URL.createObjectURL = () => "blob:mock";
  globalThis.URL.revokeObjectURL = () => {};
} else {
  const origCreate = URL.createObjectURL;
  const origRevoke = URL.revokeObjectURL;
  // keep but mock for test
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
}

// Mock Image for extractMetadata
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 800;
  naturalHeight = 600;
  set src(_v: string) {
    setTimeout(() => this.onload && this.onload(), 0);
  }
}
// @ts-expect-error mock
globalThis.Image = MockImage;

// Mock video element
const origCreateElement = document.createElement.bind(document);
vi.spyOn(document, "createElement").mockImplementation(
  (tagName: string, options?: unknown) => {
    if (tagName === "video") {
      const el = origCreateElement(
        tagName,
        options as ElementCreationOptions,
      ) as HTMLVideoElement;
      Object.defineProperties(el, {
        videoWidth: { value: 1920, writable: true },
        videoHeight: { value: 1080, writable: true },
        duration: { value: 120, writable: true },
      });
      setTimeout(() => {
        el.onloadedmetadata?.(new Event("loadedmetadata"));
      }, 0);
      return el;
    }
    return origCreateElement(tagName);
  },
);

const DEFAULT_PROJECT: ProjectFormValues = {
  userId: "",
  title: "",
  description: "",
  timeline: { start: null, end: null },
  ongoing: false,
  media: [],
  link: [],
};

function renderMedia() {
  const Wrapper = () => {
    const form = useForm<ProjectFormValues>({ defaultValues: DEFAULT_PROJECT });
    return (
      <FormProvider {...form}>
        <MediaSection />
      </FormProvider>
    );
  };
  return { user: userEvent.setup(), ...render(<Wrapper />) };
}

describe("MediaRow", () => {
  afterEach(() => {
    cleanup();
    pendingFiles.clear();
  });

  it("shows upload button when no file", async () => {
    const { user } = renderMedia();
    await user.click(screen.getByRole("button", { name: /Add media/i }));
    expect(screen.getByText(/Click to upload/i)).toBeDefined();
  });

  it("shows error for unsupported format", async () => {
    const { user } = renderMedia();
    await user.click(screen.getByRole("button", { name: /Add media/i }));
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["x"], "file.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() =>
      expect(screen.getByText(/Unsupported format/i)).toBeDefined(),
    );
  });

  it("shows error for pdf and gif now unsupported", async () => {
    const { user } = renderMedia();
    await user.click(screen.getByRole("button", { name: /Add media/i }));
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const pdf = new File(["x"], "doc.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [pdf] } });
    await waitFor(() =>
      expect(screen.getByText(/Unsupported format/i)).toBeDefined(),
    );
    cleanup();
    pendingFiles.clear();
    const { user: user2 } = renderMedia();
    await user2.click(screen.getByRole("button", { name: /Add media/i }));
    const input2 = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const gif = new File(["x"], "anim.gif", { type: "image/gif" });
    fireEvent.change(input2, { target: { files: [gif] } });
    await waitFor(() =>
      expect(screen.getByText(/Unsupported format/i)).toBeDefined(),
    );
  });

  it("shows error for too large image", async () => {
    const { user } = renderMedia();
    await user.click(screen.getByRole("button", { name: /Add media/i }));
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const big = new File([new ArrayBuffer(11 * 1024 * 1024)], "big.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(big, "size", { value: 11 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [big] } });
    await waitFor(() =>
      expect(screen.getByText(/File too large/i)).toBeDefined(),
    );
  });

  it("accepts valid image and adds to pendingFiles", async () => {
    const { user } = renderMedia();
    await user.click(screen.getByRole("button", { name: /Add media/i }));
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(pendingFiles.size).toBe(1));
    expect(screen.getByText(/photo\.jpg/i)).toBeDefined();
    expect(screen.getByText(/image\/jpeg/i)).toBeDefined();
  });

  it("remove clears pendingFiles and shows empty state", async () => {
    const { user } = renderMedia();
    await user.click(screen.getByRole("button", { name: /Add media/i }));
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(pendingFiles.size).toBe(1));
    const trash = document.querySelector(
      'button[class*="hover:bg-red"]',
    ) as HTMLElement;
    await user.click(trash);
    await waitFor(() => {
      expect(pendingFiles.size).toBe(0);
      expect(screen.getByText(/No media added yet/i)).toBeDefined();
    });
  });
});
