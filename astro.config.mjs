// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightThemeGalaxy from "starlight-theme-galaxy";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Whatsbotcord | Documentation",
      // plugins: [starlightThemeGalaxy()],
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/withastro/starlight" }],
      sidebar: [
        {
          label: "Getting started",
          autogenerate: { directory: "gettingstarted" },
        },
        {
          label: "Guides",
          items: [
            // Starlight will automatically look in /en/guides/ or /es/guides/ based on the user's language
            { label: "Example Guide", slug: "guides/example" },
          ],
        },
      ],
      defaultLocale: "root", // Tells Starlight the root folder is the default
      locales: {
        root: {
          // Defines the root folder as English
          label: "English",
          lang: "en",
        },
        es: {
          // Defines the /es/ folder as Spanish
          label: "Español",
          lang: "es",
        },
      },
    }),
  ],
});

