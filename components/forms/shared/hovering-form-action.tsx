import { Button } from "@hyperbridge/ui";
import { motion } from "motion/react";
import { useFormState } from "react-hook-form";

const boxVariant = {
  hidden: { y: "200%" },
  visible: { y: "0%" },
};

export function HoveringFormActions({
  mode = "create",
  onCancel,
}: {
  mode?: "create" | "edit";
  onCancel: VoidFunction;
}) {
  const { isSubmitting, isDirty } = useFormState();

  return (
    <motion.div
      variants={boxVariant}
      initial="hidden"
      animate={isDirty ? "visible" : "hidden"}
      className="bg-foreground/10 border-brand-primary/20 fixed start-1/2 bottom-5 flex -translate-x-1/2 items-center gap-1.5 rounded-3xl border border-r-white/10 border-b-white/20 p-2 shadow backdrop-blur-xs"
    >
      <Button
        type="submit"
        variant="default"
        disabled={isSubmitting || !isDirty}
      >
        {isSubmitting
          ? mode === "create"
            ? "Submitting..."
            : "Saving…"
          : mode === "create"
            ? "Submit"
            : "Save changes"}
      </Button>

      <Button
        type="button"
        variant="destructive"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
    </motion.div>
  );
}
