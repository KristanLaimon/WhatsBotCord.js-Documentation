import * as WhatsbotcordLib from "../../lib/whatsbotcord-browser-lib.js";
import * as WhatsbotcordTestLib from "../../lib/testing_framework_mock/whatsbotcord-browser-test.js";
import * as WhatsbotcordTesting from "../../lib/whatsbotcord-browser-lib.testing.js";
import * as WhatsbotcordTypes from "../../lib/whatsbotcord-browser-lib.types.js";
import * as WhatsbotcordDebugging from "../../lib/whatsbotcord-browser-lib.debugging.js";
import * as WhatsbotcordHelpers from "../../lib/whatsbotcord-browser-lib.helpers.js";
import type { IMsgWidget } from "../../MsgWidget/MsgWidget.js";
import { MsgWidgetAdapter } from "./MsgWidgetAdapter.js";

function resolveRelativePath(referrerUri: string, importPath: string): string {
  if (importPath.startsWith("file:///")) {
    return importPath;
  }
  
  if (!importPath.startsWith(".") && !importPath.startsWith("/")) {
    importPath = "./" + importPath;
  }

  const parts = referrerUri.split("/");
  parts.pop(); // Remove referrer filename
  
  const importParts = importPath.split("/");
  for (const part of importParts) {
    if (part === ".") {
      continue;
    } else if (part === "..") {
      parts.pop();
    } else if (part !== "") {
      parts.push(part);
    }
  }
  
  return parts.join("/");
}

export async function runBotCode(
  transpiledFiles: Record<string, string>,
  entryPointUri: string,
  msgWidget: IMsgWidget,
  customConsole?: any
): Promise<MsgWidgetAdapter> {
  if (customConsole) customConsole.log("Running bot code...");
  else console.log("Running bot code... msgWidget is:", msgWidget);

  const activeAdapter = new MsgWidgetAdapter(msgWidget);

  const Whatsbotcord = WhatsbotcordLib.default || (WhatsbotcordLib as any).Whatsbotcord;

  // Create a wrapper function that behaves like a constructor
  function MockedWhatsbotcord(options: any = {}) {
    const bot = new Whatsbotcord(options, activeAdapter);

    // Subscribe to internal events to provide console logs
    if (bot.Events) {
      if (bot.Events.onCommandFound) {
        bot.Events.onCommandFound.Subscribe((ctx: any, cmd: any) => {
          if (customConsole) customConsole.info(`[BOT]: Starting command '${cmd.name}'`);
          else console.log(`[BOT]: Starting command '${cmd.name}'`);
        });
      }
      if (bot.Events.onCommandFoundAfterItsExecution) {
        bot.Events.onCommandFoundAfterItsExecution.Subscribe((ctx: any, cmd: any, success: boolean) => {
          if (customConsole) customConsole.info(`[BOT]: Finished command '${cmd.name}'`);
          else console.log(`[BOT]: Finished command '${cmd.name}'`);
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
  libExports.default = MockedWhatsbotcord;

  // Wrap compiled modules into functions
  const modules: Record<string, Function> = {};
  for (const uri in transpiledFiles) {
    const jsCode = transpiledFiles[uri];
    try {
      // Inject module system arguments, MockMedia, and console
      modules[uri] = new Function("exports", "require", "module", "MockMedia", "console", jsCode);
    } catch (err: any) {
      const filename = uri.replace("file:///", "");
      throw new Error(`Syntax error in ${filename}: ${err.message}`);
    }
  }

  const cache: Record<string, { exports: any }> = {};

  function requireModule(name: string, referrerUri: string): any {
    if (name === "whatsbotcord") {
      return libExports;
    }
    if (name === "whatsbotcord-browser-test") {
      return WhatsbotcordTestLib;
    }
    if (name === "whatsbotcord/testing") {
      return WhatsbotcordTesting;
    }
    if (name === "whatsbotcord/types") {
      return WhatsbotcordTypes;
    }
    if (name === "whatsbotcord/debugging") {
      return WhatsbotcordDebugging;
    }
    if (name === "whatsbotcord/helpers") {
      return WhatsbotcordHelpers;
    }
    
    // Resolve relative path
    const resolvedUri = resolveRelativePath(referrerUri, name);
    
    let actualUri = resolvedUri;
    if (!modules[actualUri]) {
      const lowerUri = resolvedUri.toLowerCase();
      const keys = Object.keys(modules);
      
      // Try exact case-insensitive match
      let foundKey = keys.find(k => k.toLowerCase() === lowerUri);
      
      // Try with extensions case-insensitively
      if (!foundKey) {
        const fallbacks = [".ts", ".js", "/index.ts", "/index.js"];
        for (const fb of fallbacks) {
          foundKey = keys.find(k => k.toLowerCase() === (lowerUri + fb));
          if (foundKey) break;
        }
      }
      
      if (foundKey) {
        actualUri = foundKey;
      }
    }
    
    // Check module cache using the actual resolved URI
    if (cache[actualUri]) {
      return cache[actualUri].exports;
    }
    
    if (!modules[actualUri]) {
      throw new Error(`Cannot find module '${name}' imported from '${referrerUri.replace("file:///", "")}'`);
    }
    
    const moduleObj = { exports: {} };
    cache[actualUri] = moduleObj;
    
    try {
      modules[actualUri](
        moduleObj.exports,
        (depName: string) => requireModule(depName, actualUri),
        moduleObj,
        MockMedia,
        customConsole || console
      );
    } catch (err: any) {
      const filename = actualUri.replace("file:///", "");
      err.message = `[${filename}] ${err.message}`;
      throw err;
    }
    
    return moduleObj.exports;
  }

  try {
    // Run the entry point file
    requireModule(entryPointUri, "file:///");
    return activeAdapter;
  } catch (err) {
    activeAdapter.destroy();
    throw err;
  }
}


