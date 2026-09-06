import "@testing-library/jest-dom/vitest";

// jsdom lacks ResizeObserver (used by Radix/shadcn Card)
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof globalThis.ResizeObserver === "undefined") {
  // @ts-expect-error polyfill
  globalThis.ResizeObserver = MockResizeObserver;
}
