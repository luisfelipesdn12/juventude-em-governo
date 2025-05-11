import Image from "next/image";
import InstallButton from "@/components/InstallButton";
import manifest from "./manifest";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Image src="/logo-text.webp" alt={manifest().name ?? "Logo"} width={308} height={129} />
      <InstallButton />
    </div>
  );
}
