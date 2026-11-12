"use client";
import SignInForm from "~/app/auth/sign-in/form";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export type RequireAuthDialogProps = {
  onSignedIn: () => void;
};

export default function RequireAuthDialog(props: RequireAuthDialogProps) {
  const { onSignedIn } = props;

  return (
    <DialogContent className="aspect-[2/2.3]">
      <DialogHeader>
        <DialogTitle className="sr-only">Sign in to to continue</DialogTitle>
      </DialogHeader>

      <SignInForm redirectTo="" onSuccess={onSignedIn} />
    </DialogContent>
  );
}
