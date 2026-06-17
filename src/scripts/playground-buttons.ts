import { encodeCode } from "../utils/codeEncoder";

(function initPlaygroundButtons() {
  function getCodeFromPre(pre: HTMLPreElement): string {
    const lines = pre.querySelectorAll(".ec-line, .line");
    if (lines.length > 0) {
      return Array.from(lines)
        .map(line => line.textContent || "")
        .join("\n");
    }
    return pre.textContent || "";
  }

  function extractTriggerText(code: string): string {
    let prefix = "!";
    const prefixMatch = code.match(/commandPrefix\s*:\s*(?:\[\s*)?["']([^"']+)["']/);
    if (prefixMatch && prefixMatch[1]) {
      prefix = prefixMatch[1];
    }

    let cmdName = "";
    const classMatch = code.match(/class\s+(\w+)Command/i);
    if (classMatch && classMatch[1]) {
      cmdName = classMatch[1].toLowerCase();
    }
    const namePropMatch = code.match(/name\s*(?::|=)\s*["']([^"']+)["']/);
    if (namePropMatch && namePropMatch[1]) {
      cmdName = namePropMatch[1];
    }
    const createCmdMatch = code.match(/CreateCommand\(\s*["']([^"']+)["']/);
    if (createCmdMatch && createCmdMatch[1]) {
      cmdName = createCmdMatch[1];
    }

    return cmdName ? prefix + cmdName : "";
  }

  function mergeWhatsbotcordImports(code: string): { cleanCode: string; mergedImport: string } {
    const importRegex =
      /import\s+(?:type\s+)?(?:Whatsbotcord|Bot)?\s*(?:,\s*)?\{\s*([^}]+)\s*\}\s*from\s*["']whatsbotcord["'];?/g;

    const namedImports: string[] = ["BaileysAdapter"];
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      const importsList = match[1].split(",");
      const isTypeImport = match[0].includes("import type");

      for (let item of importsList) {
        item = item.trim();
        if (item) {
          if (isTypeImport && !item.startsWith("type ")) {
            item = "type " + item;
          }
          namedImports.push(item);
        }
      }
    }

    let cleanCode = code.replace(importRegex, "");
    const defaultImportRegex = /import\s+(?:Whatsbotcord|Bot)\s+from\s*["']whatsbotcord["'];?/g;
    cleanCode = cleanCode.replace(defaultImportRegex, "").trim();

    const mergedImportList = Array.from(new Set(namedImports)).join(", ");
    const mergedImport = `import Whatsbotcord, { ${mergedImportList} } from "whatsbotcord";`;

    return { cleanCode, mergedImport };
  }

  async function setupPlaygroundButtons() {
    const preElements = document.querySelectorAll("pre");

    for (const pre of preElements) {
      if (pre.dataset.playgroundProcessed) continue;
      pre.dataset.playgroundProcessed = "true";

      const code = getCodeFromPre(pre);
      const hasImport = code.includes("whatsbotcord");
      const hasNew = code.includes("new Whatsbotcord");
      const hasStart = code.includes("Start");

      const isRunMethod =
        (code.includes("run(") || code.includes("run (")) && code.includes("ctx:") && !code.includes("class ");
      const isComplete = hasImport && (hasNew || hasStart);
      const isCommandClass = code.includes("ICommand") && code.includes("class ");

      if (isComplete || isCommandClass || isRunMethod) {
        try {
          let codeToSend = code;

          if (!isComplete && isCommandClass) {
            const classMatch =
              code.match(/class\s+(\w+)\s+(?:implements|extends)\s+ICommand/) || code.match(/class\s+(\w+Command)\b/);
            const className = classMatch ? classMatch[1] : null;

            if (className) {
              const { cleanCode, mergedImport } = mergeWhatsbotcordImports(code);
              const codeWithoutExports = cleanCode
                .replace(/\bexport\s+default\s+class\b/g, "class")
                .replace(/\bexport\s+class\b/g, "class");

              codeToSend = `${mergedImport}

const bot = new Whatsbotcord({
  commandPrefix: "!",
  tagPrefix: "@",
});

${codeWithoutExports}

bot.Commands.Add(new ${className}());
bot.Start();`;
            }
          } else if (!isComplete && isRunMethod) {
            const { cleanCode, mergedImport } = mergeWhatsbotcordImports(code);
            const subpathImportRegex =
              /import\s+(?:type\s+)?\{\s*([^}]+)\s*\}\s*from\s*["']whatsbotcord\/(?:types|helpers|testing|debugging)["'];?/g;
            const finalCleanCode = cleanCode.replace(subpathImportRegex, "").trim();

            codeToSend = `${mergedImport}
import type { AdditionalAPI, CommandArgs, IChatContext, ICommand } from "whatsbotcord/types";

const bot = new Whatsbotcord({
  commandPrefix: "!",
  tagPrefix: "@",
});

class ExampleCommand implements ICommand {
  name = "example";
  aliases = ["test"];

  ${finalCleanCode}
}

bot.Commands.Add(new ExampleCommand());
bot.Start();`;
          }

          codeToSend = codeToSend.replace(/\n{3,}/g, "\n\n");
          const encoded = await encodeCode(codeToSend);
          const isGroup = codeToSend.toLowerCase().includes("group");
          const chatId = isGroup ? 1000 : 999;
          const triggerText = extractTriggerText(codeToSend);

          let playgroundUrl = `/playground?code=${encoded}&chat=${chatId}`;
          if (triggerText) {
            playgroundUrl += `&text=${encodeURIComponent(triggerText)}`;
          }

          const btn = document.createElement("a");
          btn.className = "test-playground-btn";
          btn.href = playgroundUrl;
          btn.target = "_blank";
          btn.title = "Test in Playground";
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>Test in Playground</span>
          `;

          const container = pre.closest(".expressive-code") || pre.parentElement;
          if (container) {
            const wrapper = document.createElement("div");
            wrapper.className = "playground-button-wrapper";
            if (!!container.querySelector("figcaption.header, div.header")) {
              wrapper.classList.add("has-header");
            }
            if (container.parentNode) {
              container.parentNode.insertBefore(wrapper, container);
              wrapper.appendChild(btn);
              wrapper.appendChild(container);
            }
          }
        } catch (e) {
          console.error("Failed to inject playground button", e);
        }
      }
    }
  }

  function boot() {
    setupPlaygroundButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(boot));
  } else {
    requestAnimationFrame(boot);
  }

  document.addEventListener("astro:page-load", () => requestAnimationFrame(boot));
})();
