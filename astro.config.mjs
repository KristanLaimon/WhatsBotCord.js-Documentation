// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Whatsbotcord.js",
      logo: {
        src: "./src/assets/whatsbotcord_logo.png",
        alt: "Whatsbotcord Logo",
      },
      components: {
        Head: "./src/components/Head.astro",
        Header: "./src/components/Header.astro",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/KristanLaimon/WhatsBotCord.js",
        },
        {
          icon: "discord",
          label: "npm",
          href: "https://www.npmjs.com/package/whatsbotcord",
        },
      ],
      customCss: ["./src/styles/custom.css"],
      sidebar: [
        {
          label: "Getting Started: First steps",
          items: [
            { label: "Installation", slug: "getting-started/installation" },
            { label: "Quick Start", slug: "getting-started/quickstart" },
            { label: "Commands", slug: "getting-started/commands" },
            { label: "Tags", slug: "getting-started/tags" },
          ],
        },
        {
          label: "Essential concepts",
          items: [
            { label: "Bot", slug: "essential_concepts/bot" },
            { label: "Bot configuration", slug: "essential_concepts/bot_configuration" },
            {
              label: "Chat context: The way your commands talk to whatsapp chats",
              slug: "essential_concepts/chat_context",
            },
          ],
        },
        {
          label: "Intermediate/Advanced concepts",
          items: [],
        },
        {
          label: "Guides",
          items: [
            { label: "Advanced Usage", slug: "guides/advanced-usage" },
            {
              label: "Cancelling Commands",
              slug: "guides/cancelling-commands",
            },
            { label: "Events", slug: "guides/events" },
            { label: "Middleware", slug: "guides/middleware" },
            { label: "Plugins", slug: "guides/plugins" },
            { label: "Tags & Groups", slug: "guides/tags-and-groups" },
            {
              label: "Manipulating Chat Context",
              slug: "guides/chat-context",
            },
            {
              label: "AdditionalAPI & Internal Socket",
              slug: "guides/additional-api",
            },
          ],
        },
        {
          label: "Testing",
          items: [{ label: "Mocking & Testing", slug: "testing/testing" }],
        },
        {
          label: "Reference",
          items: [{ label: "Contributing", slug: "reference/contributing" }],
        },
      ],
    }),
  ],
});

