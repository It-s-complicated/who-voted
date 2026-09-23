import { defineConfig, fontProviders } from "astro/config";
import cards from "astro-cards";

export default defineConfig({
  // Netlify injects the production URL at build time; og:image needs an absolute origin.
  site: process.env.URL ?? "http://localhost:4321",
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Fraunces",
      cssVariable: "--font-display",
      // Variable font: range serves every weight the site and OG card use.
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
    },
  ],
  integrations: [cards()],
});
