import type { Metadata } from "next";
import "./globals.css";
import manifest from "./manifest";
import MenuIcon from "@/lib/icons/menu";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";

export const metadata: Metadata = {
  title: manifest().name,
  description: manifest().description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/fnd6ahv.css" />
      </head>
      <body
        suppressHydrationWarning
        className={`antialiased font-['tt-commons-pro']`}
      >
        <div className="flex items-center justify-between p-6 pb-0 top-0 left-0 w-full">
          <BackButton />
          <Button variant="option">
            <MenuIcon className="w-12 h-12" />
          </Button>
        </div>
        {children}
      </body>
    </html>
  );
}
