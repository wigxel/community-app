import { BadgeIcon } from "lucide-react";
import { safeStr } from "~/lib/data.helpers";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export type ProfileAvatarProps = {
  name: string;
  src?: string;
  className?: string;
  verified?: boolean;
};

export function ProfileAvatar(props: ProfileAvatarProps) {
  const { name, src, className, verified = false } = props;

  const initial = safeStr(name).charAt(0).toUpperCase();

  return (
    <div className="group relative inline-flex">
      <Avatar className={cn("size-14", className)}>
        <AvatarImage src={src || undefined} />
        <AvatarFallback
          className={cn("bg-blue-500/20 text-blue-300", className)}
        >
          {initial}
        </AvatarFallback>
      </Avatar>

      {!verified ? null : (
        <span className="absolute -inset-4 rounded-full p-0.5">
          <BadgeIcon
            strokeWidth="0.25"
            className="text-brand-primary animate group-hover:animation-duration-[10s] h-full w-full group-hover:animate-spin"
          />
        </span>
      )}
    </div>
  );
}
