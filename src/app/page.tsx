"use client"

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
import LayeredAnimation from "@/components/LayeredAnimation";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="flex flex-col items-center justify-center gap-4 w-full">
        <Image
          className="w-full min-w-[281px] max-w-[844px] p-4 md:p-12"
          src="/assets/Logo Amarelo- Juventude em Governo.svg" alt={manifest().name ?? "Logo"} width={308} height={129} />
        
        {/* Layered Background Animation */}
        <LayeredAnimation />
        
        <div className="flex flex-col items-center justify-center gap-4 w-fit">
          <div className="flex flex-col items-start gap-2 w-full">
            <Link href="/play">
              <Button variant="option">
                <PlayIcon />
                Jogar
              </Button>
            </Link>
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
    </div>
  );
}
