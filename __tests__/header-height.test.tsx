import { cleanup, render } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} alt="" />,
}));

vi.mock("~/app/_components/NavAuth", () => ({
  default: () => <div data-testid="nav-auth" />,
}));

import { Header } from "~/components/layouts/header";

function mockHeaderHeight(height: number) {
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    value: height,
  });
}

describe("Header — --header-height", () => {
  afterEach(() => {
    cleanup();
    document.body.style.removeProperty("--header-height");
  });

  it("sets --header-height on the body from the header element", () => {
    mockHeaderHeight(72);

    render(<Header />);

    expect(document.body.style.getPropertyValue("--header-height")).toBe(
      "72px",
    );
  });

  it("removes --header-height when the header unmounts", () => {
    mockHeaderHeight(72);

    const { unmount } = render(<Header />);
    unmount();

    expect(document.body.style.getPropertyValue("--header-height")).toBe("");
  });
});
