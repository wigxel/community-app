import "@testing-library/jest-dom/vitest";

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
  HTMLElement.prototype.hasPointerCapture = function () {
    return false;
  };
}

// jsdom lacks scrollIntoView (used by Radix Select)
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = function () {
    return false;
  };
}
