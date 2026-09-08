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
