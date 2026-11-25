import type { MetadataRoute } from "next";
import { siteName, siteDescription } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: "Empowers",
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#05060a",
    theme_color: "#05060a",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/logo_icon_glow.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
