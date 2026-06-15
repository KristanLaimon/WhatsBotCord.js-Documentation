// @ts-check
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightVersionsPlugin from "starlight-versions";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: "https://whatsbotcord.sbs/",
  integrations: [starlight({
    title: "Whatsbotcord.js",
    expressiveCode: {
      themes: ["github-dark"],
    },
    plugins: [
      starlightVersionsPlugin({
        versions: [
          { slug: "v1.0.3", redirect: "same-page" },
          // { slug: "v2.x.x", label: "v2.0.0-rc.1", redirect: "same-page" },
        ],
        current: { label: "Latest (v2.0.0-rc.1)", redirect: "same-page" },
      }),
    ],
    logo: {
      src: "./src/assets/favicon.svg",
      alt: "Whatsbotcord Logo",
    },
    components: {
      Head: "./src/components/Head.astro",
      Search: "./src/components/Search.astro",
      ThemeSelect: "./src/components/ThemeSelect.astro",
      RightSidebar: "./src/components/RightSidebar.astro",
      //@ts-expect-error for some reason doesn't find this prop when in reality it exists...
      Icons: "./src/components/Icon.astro",
    },
    social: [
      {
        icon: "github",
        label: "GitHub",
        href: "https://github.com/KristanLaimon/WhatsBotCord.js",
      },
      {
        icon: "npm",
        label: "npm",
        href: "https://www.npmjs.com/package/whatsbotcord",
      },
    ],
    customCss: ["./src/styles/custom.css"],
    sidebar: [
      {
        label: "Release Notes",
        items: [
          { label: "v2.0.0", slug: "release-notes" },
        ],
      },
      {
        label: "Getting Started",
        items: [
          { label: "Installation", slug: "getting-started/installation" },
          { label: "Quick Start", slug: "getting-started/quickstart" },
          { label: "What's Next?", slug: "getting-started/whats_next" },
        ],
      },
      {
        label: "Essential Concepts",
        items: [
          { label: "Bot", slug: "essential_concepts/bot" },
          { label: "Command Arguments", slug: "essential_concepts/command_args" },
          { label: "WhatsApp IDs", slug: "essential_concepts/whatsapp_ids" },
          { label: "Built-in Helpers", slug: "essential_concepts/helpers" },
          { label: "Sending", slug: "essential_concepts/sending" },
          { label: "Receiving", slug: "essential_concepts/receiving" },
          { label: "Groups", slug: "essential_concepts/groups" },
          { label: "Presence", slug: "essential_concepts/presence" },
          { label: "Chat Context", slug: "essential_concepts/chat_context" },
          { label: "Additional API", slug: "essential_concepts/additional_api" },
          { label: "Testing & ChatMock", slug: "essential_concepts/chat_mock" },
          { label: "ChatMock Examples", slug: "essential_concepts/chat_mock_examples" },
        ],
      },
      {
        label: "Guides & Tutorials",
        items: [
          { label: "Receiving User Input", slug: "tutorials/waiting-input" },
          { label: "Cancelling Commands", slug: "guides/cancelling-commands" },
          { label: "Manipulating Chat Context", slug: "guides/chat-context" },
          { label: "AdditionalAPI & Internal Socket", slug: "guides/additional-api" },
          { label: "Events", slug: "guides/events" },
          { label: "Middleware", slug: "guides/middleware" },
          { label: "Plugins", slug: "guides/plugins" },
          { label: "Tags & Groups", slug: "guides/tags-and-groups" },
          { label: "Commands Examples", slug: "guides/commands-examples" },
        ],
      },
      {
        label: "Guides & Tutorials | Deeper",
        items: [
          { label: "How would my index.ts look?", slug: "intermediate_advanced_concepts/main-setup" },
        ],
      },
      {
        label: "Reference",
        items: [{ label: "Contributing", slug: "reference/contributing" }],
      },
    ],
  }), svelte()],
});