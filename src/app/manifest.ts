import type { MetadataRoute } from "next";

// Makes the site installable ("Add to Home Screen"). start_url "/" lets the proxy open the app
// in the visitor's saved or browser language.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Lebna — لبنة",
    short_name: "Lebna",
    description: "Financement participatif immobilier en Tunisie · التمويل التشاركي العقاري في تونس",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf8f3",
    theme_color: "#0e2b4c",
    categories: ["finance", "business"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
