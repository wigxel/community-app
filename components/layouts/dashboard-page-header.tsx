"use client";
import { motion, stagger, useInView, type Variants } from "motion/react";
import React from "react";
import { createPortal } from "react-dom";

const PORTAL_ID = "dashboard-header-portal";

export function DBHeader(props: { children: React.ReactNode }) {
  return <div className="pt-4">{props.children}</div>;
}

const parent: Variants = {
  show: {
    opacity: 1,
    y: 0,
    transition: { delayChildren: stagger(0.1) },
  },
  hidden: {
    y: 0,
    opacity: 0,
    transition: { delayChildren: stagger(0.1, { from: "last" }) },
  },
};

const items: Variants = {
  show: { y: "0%" },
  hidden: { y: "50%" },
};

export function DBHeaderTitle(
  props: React.ComponentProps<"h1"> & { text: string },
) {
  const { text, ...restProps } = props;
  const attempt = React.useRef(0);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const [mounted, setMounted] = React.useState<HTMLElement>();

  const isInView = useInView(headingRef);

  React.useEffect(() => {
    const id = setInterval(() => {
      attempt.current++;

      const rootEl = document.querySelector(
        `#${PORTAL_ID}`,
      ) as HTMLElement | null;

      if (attempt.current > 5) return clearInterval(id);
      if (rootEl == null) return;

      setMounted(rootEl);
      clearInterval(id);
    }, 16);

    return () => clearInterval(id);
  }, []);

  return (
    <>
      <h1
        ref={headingRef}
        className="text-4xl leading-none font-semibold"
        {...restProps}
      >
        {text}
      </h1>

      {mounted
        ? createPortal(
            <AnimateWords animate={!isInView} text={text} />,
            mounted,
          )
        : null}
    </>
  );
}

function AnimateWords({ text, animate }: { text: string; animate: boolean }) {
  const words = React.useMemo(
    () => text.split(" ").map((word, index) => [word, index]),
    [text],
  );

  return (
    <motion.div
      variants={parent}
      animate={animate ? "show" : "hidden"}
      initial="hidden"
      className="flex"
    >
      {words.map(([word, index]) => {
        return (
          <motion.div key={index} variants={items}>
            {word}&nbsp;
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function DBHeaderDescription(props: React.ComponentProps<"p">) {
  return (
    <p
      className="text-muted-foreground mt-4 text-base leading-none"
      {...props}
    />
  );
}

export function DBHeaderPortal(props: React.ComponentProps<"div">) {
  return (
    <div
      id={PORTAL_ID}
      className="text-foreground inline-flex items-center p-2 font-medium"
      {...props}
    />
  );
}
