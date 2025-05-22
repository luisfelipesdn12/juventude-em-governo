"use client";

import { Button } from "@/components/ui/button";
import VoltarIcon from "@/lib/icons/voltar";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button variant="option" onClick={() => router.back()}>
      <VoltarIcon className="w-12 h-12" />
    </Button>
  );
}
