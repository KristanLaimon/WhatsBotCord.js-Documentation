import * as WhatsbotcordLib from "../lib/whatsbotcord-browser-lib.js";
import type { IMsgWidget } from "../MsgWidget/MsgWidget.js";
import { MsgWidgetAdapter } from "./MsgWidgetAdapter.js";

export async function runBotCode(code: string, msgWidget: IMsgWidget, customConsole?: any): Promise<MsgWidgetAdapter> {
  if (customConsole) customConsole.log("Running bot code...");
  else console.log("Running bot code... msgWidget is:", msgWidget);

  const activeAdapter = new MsgWidgetAdapter(msgWidget);

  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  // Strip out import statements so it can be evaluated as a script
  const executableCode = code.replace(/import\s+[\s\S]*?from\s+['"]whatsbotcord['"];?/g, "");

  const Whatsbotcord = WhatsbotcordLib.default || (WhatsbotcordLib as any).Whatsbotcord;

  // Create a wrapper function that behaves like a constructor
  function MockedWhatsbotcord(options: any = {}) {
    const bot = new Whatsbotcord(options, activeAdapter);

    // Subscribe to internal events to provide console logs
    if (bot.Events) {
      if (bot.Events.onCommandFound) {
        bot.Events.onCommandFound.Subscribe((ctx: any, cmd: any) => {
          if (customConsole) customConsole.info(`[BOT]: Responding command '${cmd.name}'`);
          else console.log(`[BOT]: Responding command '${cmd.name}'`);
        });
      }
      if (bot.Events.onCommandFoundAfterItsExecution) {
        bot.Events.onCommandFoundAfterItsExecution.Subscribe((ctx: any, cmd: any, success: boolean) => {
          if (customConsole) customConsole.info(`Command '${cmd.name}' executed`);
          else console.log(`Command '${cmd.name}' executed`);
        });
      }
    }

    return bot;
  }

  const MockMedia = {
    Images: {
      Fox: "/mock-multimedia/images/fox_vertical.jpg",
      Frieren: "/mock-multimedia/images/frieren_ratio_1_1.webp",
    },
    Videos: {
      BuckBunny: "/mock-multimedia/videos/buck-bunny.mp4",
    },
    Pdfs: {
      Sample: "/mock-multimedia/pdfs/pdf-sample.pdf",
    },
    Gifs: {
      EyesAnime: "/mock-multimedia/gifs/eyes-anime.gif",
    },
  };

  const libExports: any = { ...WhatsbotcordLib };
  libExports.Whatsbotcord = MockedWhatsbotcord;

  // Filter out 'default' since it's a reserved keyword and cannot be used as an argument name
  const safeExportKeys = Object.keys(libExports).filter(k => k !== "default");

  const argNames = [...safeExportKeys, "MockMedia", "console"];
  const argValues = [...safeExportKeys.map(k => libExports[k]), MockMedia, customConsole || console];

  const runner = new AsyncFunction(...argNames, executableCode);

  try {
    await runner(...argValues);
    return activeAdapter;
  } catch (err) {
    activeAdapter.destroy();
    throw err;
  }
}

