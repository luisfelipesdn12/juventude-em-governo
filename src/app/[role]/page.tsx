"use server"

import Image from "next/image";
import InstallButton from "@/components/InstallButton";
import manifest from "../manifest";
import { Button } from "@/components/ui/button";
import { EyeIcon, History } from "lucide-react";
import Link from "next/link";
import PlayIcon from "@/lib/icons/play";
import MenuIcon from '@/lib/icons/menu';
import VideoIcon from '@/lib/icons/video';
import LayeredAnimation from "@/components/LayeredAnimation";

interface HomeProps {
  params: Promise<{
    role: "admin" | "player" | "applyer";
  }>;
}

export default async function Home({ params }: HomeProps) {
  const { role } = await params;

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-60px)] gap-4">
      <div className="flex flex-col items-center justify-center gap-4 w-full">
        <Image
          className="w-full min-w-[281px] max-w-[844px] p-4 md:p-12"
          src="/assets/Logo Amarelo- Juventude em Governo.svg" alt={manifest().name ?? "Logo"} width={308} height={129} />

        {/* Layered Background Animation */}
        <LayeredAnimation />

        <HomeMenu role={role} />
      </div>
    </div>
  );
}

function HomeMenu({ role = "player" }: { role?: "admin" | "player" | "applyer" }) {
  const options: Record<"admin" | "player" | "applyer", {
      label: string;
      href: string;
      icon: React.ReactNode;
  }[]> = {
    player: [
      {
        label: "Jogar",
        href: "/play",
        icon: <PlayIcon />
      },
      {
        label: "Últimos jogos",
        href: "/player/past",
        icon: <History />
      },
      {
        label: "Vídeos de formação",
        href: "/videos",
        icon: <VideoIcon />
      },
      {
        label: "Menu",
        href: "/menu",
        icon: <MenuIcon />
      },
    ],
    admin: [
      {
        label: "Preview",
        href: "/preview",
        icon: <EyeIcon />
      }
    ],
    applyer: [
      {
        label: "Criar sala",
        href: "/applyer/create-room",
        icon: <PlayIcon />
      },
      {
        label: "Continuar",
        href: "/applyer/continue-room",
        icon: <PlayIcon />
      },
    ]
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-fit">
      <div className="flex flex-col items-start gap-2 w-full">
        {options[role].map((option, index) => (
          <Link href={option.href} key={index}>
            <Button variant="option">
              {option.icon}
              {option.label}
            </Button>
          </Link>
        ))}
      </div>
      <InstallButton />
    </div>
  );
}
