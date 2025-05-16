import Image from "next/image";
import InstallButton from "@/components/InstallButton";
import manifest from "./manifest";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import PlayIcon from "@/lib/icons/play";
import MenuIcon from '@/lib/icons/menu';
import VideoIcon from '@/lib/icons/video';
// import VoltarIcon from '@/lib/icons/voltar';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="flex flex-col items-center justify-center gap-4">
        <Image src="/assets/Logo Amarelo- Juventude em Governo.svg" alt={manifest().name ?? "Logo"} width={308} height={129} />
        <div className="flex flex-col items-start gap-2 w-full">
          <Button variant="option">
            <PlayIcon />
            Jogar
          </Button>
          <Button variant="option">
            <VideoIcon />
            Vídeos de formação
          </Button>
          <Button variant="option">
            <MenuIcon />
            Menu
          </Button>
          <Link href="/preview">
            <Button variant="option">
              <EyeIcon />
              Preview
            </Button>
          </Link>
        </div>
        <InstallButton />
      </div>
    </div>
  );
}
