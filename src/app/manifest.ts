import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Juventude em governo",
    short_name: "Juventude em governo",
    description: "Um jogo para a juventude se conectar com o governo",
    start_url: "/",
    display: "standalone",
    background_color: "#2A1A40",
    theme_color: "#2A1A40",
    icons: [

      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}