import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

// jsdom lacks ResizeObserver (used by Radix/shadcn Card)
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;
}

// jsdom lacks pointer capture methods (used by Radix Select)
if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = () => false;
}

// jsdom lacks scrollIntoView (used by Radix Select)
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = () => false;
}

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});
