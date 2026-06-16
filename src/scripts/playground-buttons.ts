import { encodeCode } from "../utils/codeEncoder";

(function initPlaygroundButtons() {
  function getCodeFromPre(pre: HTMLPreElement): string {
    const lines = pre.querySelectorAll(".ec-line, .line");
    if (lines.length > 0) {
      return Array.from(lines)
        .map((line) => line.textContent || "")
        .join("\n");
    }
    return pre.textContent || "";
  }

  function extractTriggerText(code: string): string {
    // 1. Extract prefix
    let prefix = "!";
    const prefixMatch = code.match(/commandPrefix\s*:\s*(?:\[\s*)?["']([^"']+)["']/);
    if (prefixMatch && prefixMatch[1]) {
      prefix = prefixMatch[1];
    }

    // 2. Extract command name
    let cmdName = "";
    // Check for class name ending with Command (e.g. PingCommand)
    const classMatch = code.match(/class\s+(\w+)Command/i);
    if (classMatch && classMatch[1]) {
      cmdName = classMatch[1].toLowerCase();
    }
    // Check for name property: name: "ping" or name = "ping"
    const namePropMatch = code.match(/name\s*(?::|=)\s*["']([^"']+)["']/);
    if (namePropMatch && namePropMatch[1]) {
      cmdName = namePropMatch[1];
    }
    // Check for CreateCommand("ping")
    const createCmdMatch = code.match(/CreateCommand\(\s*["']([^"']+)["']/);
    if (createCmdMatch && createCmdMatch[1]) {
      cmdName = createCmdMatch[1];
    }

    if (cmdName) {
      return prefix + cmdName;
    }
    return "";
  }

  function mergeWhatsbotcordImports(code: string): { cleanCode: string; mergedImport: string } {
    // Regex to match named imports from "whatsbotcord" or 'whatsbotcord'
    const importRegex = /import\s+(?:type\s+)?\{\s*([^}]+)\s*\}\s*from\s*["']whatsbotcord["'];?/g;
    
    const namedImports: string[] = [];
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
    
    // Remove original import lines
    let cleanCode = code.replace(importRegex, "");
    
    // Remove default imports of Whatsbotcord (e.g. import Whatsbotcord from "whatsbotcord")
    const defaultImportRegex = /import\s+Whatsbotcord\s+from\s*["']whatsbotcord["'];?/g;
    cleanCode = cleanCode.replace(defaultImportRegex, "");
    
    cleanCode = cleanCode.trim();
    
    // Construct merged import statement
    const mergedImportList = Array.from(new Set(namedImports)).join(", ");
    const mergedImport = mergedImportList 
      ? `import Whatsbotcord, { ${mergedImportList} } from "whatsbotcord";`
      : `import Whatsbotcord from "whatsbotcord";`;
      
    return { cleanCode, mergedImport };
  }

  async function setupPlaygroundButtons() {
    const preElements = document.querySelectorAll("pre");
    for (const pre of preElements) {
      // Avoid processing the same block multiple times
      if (pre.dataset.playgroundProcessed) continue;
      pre.dataset.playgroundProcessed = "true";

      const code = getCodeFromPre(pre);
      const hasImport = code.includes("whatsbotcord");
      const hasNew = code.includes("new Whatsbotcord");
      const hasStart = code.includes("Start");

      const isComplete = hasImport && (hasNew || hasStart);
      const isCommandClass = code.includes("ICommand") && code.includes("class ");

      if (isComplete || isCommandClass) {
        try {
          let codeToSend = code;

          // If it is an incomplete command class, wrap and transform it dynamically
          if (!isComplete && isCommandClass) {
            const classMatch = code.match(/class\s+(\w+)\s+(?:implements|extends)\s+ICommand/) ||
                               code.match(/class\s+(\w+Command)\b/);
            const className = classMatch ? classMatch[1] : null;

            if (className) {
              const { cleanCode: codeWithoutImports, mergedImport } = mergeWhatsbotcordImports(code);
              
              // Remove export default class and export class, converting to just class
              const codeWithoutExports = codeWithoutImports
                .replace(/\bexport\s+default\s+class\b/g, "class")
                .replace(/\bexport\s+class\b/g, "class");

              const beginning = `${mergedImport}

const bot = new Whatsbotcord({
  commandPrefix: "!",
  tagPrefix: "@",
  credentialsFolder: "./auth",
  loggerMode: "recommended",
});

`;
              const ending = `

bot.Commands.Add(new ${className}());
bot.Start();
`;
              codeToSend = beginning + codeWithoutExports + ending;
            }
          }

          // Normalize consecutive newlines: collapse 3 or more newlines to exactly 2 newlines (a single empty line)
          codeToSend = codeToSend.replace(/\n{3,}/g, "\n\n");

          const encoded = await encodeCode(codeToSend);
          
          // Determine if it is a group chat example
          const isGroup = codeToSend.toLowerCase().includes("group");
          const chatId = isGroup ? 1000 : 999;
          
          // Extract default trigger text from the final code
          const triggerText = extractTriggerText(codeToSend);
          
          let playgroundUrl = `/playground?code=${encoded}&chat=${chatId}`;
          if (triggerText) {
            playgroundUrl += `&text=${encodeURIComponent(triggerText)}`;
          }

          const btn = document.createElement("a");
          btn.className = "test-playground-btn";
          btn.href = playgroundUrl;
          btn.target = "_blank"; // Open in new tab
          btn.title = "Test in Playground";
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>Test in Playground</span>
          `;

          // Find the container of the code block (usually div.expressive-code or figure.frame)
          const container = pre.closest(".expressive-code") || pre.parentElement;
          if (container) {
            // Create a wrapper div around the container to prevent overflow issues
            const wrapper = document.createElement("div");
            wrapper.className = "playground-button-wrapper";

            const hasHeader = !!container.querySelector("figcaption.header, div.header");
            if (hasHeader) {
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
