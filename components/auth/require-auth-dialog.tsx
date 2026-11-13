"use client";
import { motion, type Variants } from "motion/react";
import React from "react";
import SignInForm from "~/app/auth/sign-in/form";
import { DialogHeader, DialogTitle } from "~/components/ui/dialog";

export type RequireAuthDialogProps = {
  onSignedIn: () => void;
};

const variants: Variants = {
  show: {
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      ease: "easeOut",
    },
  },
  hide: {
    y: "25%",
    filter: "blur(4px)",
    scale: 0.98,
    transition: {
      ease: "easeIn",
    },
  },
};

export default function RequireAuthDialog(props: RequireAuthDialogProps) {
  const { onSignedIn } = props;
  // const [show, setShow] = React.useState(false);

  return (
    <motion.div
      className="flex flex-col justify-center"
      variants={variants}
      initial={"hide"}
      // animate={show ? 'show' : 'hide'}
      animate={"show"}
      exit={"hide"}
    >
      <DialogHeader>
        <DialogTitle className="sr-only">Sign in to to continue</DialogTitle>
      </DialogHeader>

      <SignInForm redirectTo="" onSuccess={onSignedIn} />
    </motion.div>
  );
}
