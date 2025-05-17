import type { Metadata } from "next";
import "./globals.css";
import manifest from "./manifest";

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
        className={`antialiased bg-[#360575] font-['tt-commons-pro']`}
      >
        {children}
      </body>
    </html>
  );
}
