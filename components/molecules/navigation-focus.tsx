"use client";

import { Slot } from "@radix-ui/react-slot";
import { useEffect, useRef } from "react";

export type NavigationFocusProps = {
  id: string;
  delay?: number;
  children: React.ReactElement;
};

export function NavigationFocus(props: NavigationFocusProps) {
  const { id, delay = 100, children } = props;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const focus = new URLSearchParams(window.location.search).get("focus");
    if (focus !== id) return;

    const timeout = setTimeout(() => {
      ref.current?.focus();
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, delay);
    return () => clearTimeout(timeout);
  }, [id, delay]);

  return <Slot ref={ref}>{children}</Slot>;
}
