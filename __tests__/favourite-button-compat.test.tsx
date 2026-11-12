import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";

const { mockUseQuery, mockUseMutation } = vi.hoisted(() => ({
  mockUseQuery: vi.fn(),
  mockUseMutation: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

import { FavouriteButton } from "~/app/_components/FavouriteButton";
import type { Id } from "~/convex/_generated/dataModel";

describe("FavouriteButton ref/prop compatibility", () => {
  beforeEach(() => {
    mockUseQuery.mockReturnValue({ count: 0, isFavourited: null });
    mockUseMutation.mockReturnValue(vi.fn());
  });

  afterEach(cleanup);

  it.each(["overlay", "card", "inline"] as const)(
    "forwards ref and parent handlers (%s)",
    (variant) => {
      const ref = React.createRef<HTMLButtonElement>();
      const onClickCapture = vi.fn();
      render(
        <FavouriteButton
          ref={ref}
          projectId={"p1" as Id<"project">}
          variant={variant}
          onClickCapture={onClickCapture}
        />,
      );
      const button = screen.getByRole("button", { name: /favourite/i });
      expect(ref.current).toBe(button);
      fireEvent.click(button);
      expect(onClickCapture).toHaveBeenCalledTimes(1);
    },
  );
});
