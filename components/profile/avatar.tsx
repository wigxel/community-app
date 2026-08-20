import { safeStr } from "~/lib/data.helpers";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function ProfileAvatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string;
  className?: string;
}) {
  const initial = safeStr(name).charAt(0).toUpperCase();

  return (
    <Avatar className={cn("size-14", className)}>
      <AvatarImage src={src || undefined} />
      <AvatarFallback className={cn("bg-blue-500/20 text-blue-300", className)}>
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
