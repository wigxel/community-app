"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function ReturnButton() {
  const router = useRouter();

  const handleOnClick = () => {
    // TODO: check if the previous route contains `/catalog`
    // else use `router.push('/catalog')`
    router.back();
  };

  return (
    <Button variant={"ghost"} onClick={handleOnClick}>
      <ArrowLeft /> Return
    </Button>
  );
}
