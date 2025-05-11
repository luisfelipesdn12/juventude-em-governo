import Image from "next/image";
import InstallButton from "@/components/InstallButton";
import manifest from "./manifest";
import { Button } from "@/components/ui/button";
import { PlayIcon, PlaySquareIcon, MenuIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="flex flex-col items-center justify-center gap-4">
        <Image src="/logo-text.webp" alt={manifest().name ?? "Logo"} width={308} height={129} />
        <div className="flex flex-col items-start gap-2 w-full">
          <Button variant="option">
            <PlayIcon />
            Jogar
          </Button>
          <Button variant="option">
            <PlaySquareIcon />
            Vídeos de formação
          </Button>
          <Button variant="option">
            <MenuIcon />
            Menu
          </Button>
        </div>
          <InstallButton />
      </div>
    </div>
  );
}
