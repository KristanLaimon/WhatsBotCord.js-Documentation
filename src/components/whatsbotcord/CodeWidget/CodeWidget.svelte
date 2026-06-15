<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import loader from "@monaco-editor/loader";
  import type * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

  // @ts-ignore
  import dtsContents from "../lib/whatsbotcord-browser-lib.d.ts?raw";
  import { runBotCode } from "./BotRunner";

  import type { IMsgWidget } from "../MsgWidget/MsgWidget";


  export type CodeWidgetProps = {
    initialCode?: string;
    msgWidget?: IMsgWidget;
    onCodeRun?: (code: string) => void;
    width?: string;
    height?: string;
    theme?: "light" | "dark";
  }

  const {
    initialCode = "",
    msgWidget,
    onCodeRun,
    width = "100%",
    height = "100%",
    theme = "dark",
  }: CodeWidgetProps = $props();

  let editorContainer: HTMLElement;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let monacoInstance: typeof monaco;

  // svelte-ignore state_referenced_locally
  let code = $state(initialCode);
  let runTimeout: ReturnType<typeof setTimeout> | null = null;
  let currentAdapter: any = null;

  onMount(async () => {
    monacoInstance = await loader.init();

    // Add library types for IntelliSense
    const tsLang: any = monacoInstance.languages.typescript;
    const tsOpts: any = tsLang.typescriptDefaults;

    tsOpts.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    tsOpts.setCompilerOptions({
      target: tsLang.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: tsLang.ModuleResolutionKind.NodeJs,
      module: tsLang.ModuleKind.ESNext,
      typeRoots: ["node_modules/@types"],
    });

    const wrappedDts = `declare module "whatsbotcord" {
      ${dtsContents}
    }`;

    // Provide the library declaration
    tsOpts.addExtraLib(
      wrappedDts,
      "ts:filename/whatsbotcord.d.ts"
    );

    const globalDeclarations = `
      declare var msgWidget: {
        pushExternalMessage(chatId: string, message: any): void;
        chats: any[];
      };
      
      declare var MockMedia: {
        Images: { Fox: string, Frieren: string };
        Videos: { BuckBunny: string };
        Pdfs: { Sample: string };
        Gifs: { EyesAnime: string };
      };
    `;
    tsOpts.addExtraLib(globalDeclarations, "ts:filename/globalDeclarations.d.ts");

    // FIX: Do NOT set lineHeight manually — let Monaco derive it from fontSize.
    // A fixed lineHeight that doesn't match the rendered font causes the caret
    // to appear offset (typically 2 lines below the actual cursor position).
    editor = monacoInstance.editor.create(editorContainer, {
      value: code,
      language: "typescript",
      theme: theme === "light" ? "vs" : "vs-dark",
      minimap: { enabled: false },
      automaticLayout: true,
      fontSize: 14,
      // lineHeight intentionally omitted — Monaco calculates it correctly from fontSize + font metrics
      fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, "Cascadia Code", Menlo, Monaco, "Courier New", monospace',
      autoIndent: "full",
      autoIndentOnPaste: true,
      // FIX: ensure sticky scroll (class headers) renders correctly
      stickyScroll: { enabled: true },
      // FIX: fix widget overflow so IntelliSense dropdowns escape the container
      fixedOverflowWidgets: true,
    });

    // FIX: Wait for fonts to be ready, then remeasure and relayout.
    // This is the correct sequence to prevent layout drift on mount.
    const doRemeasure = () => {
      if (monacoInstance) monacoInstance.editor.remeasureFonts();
      if (editor) editor.layout();
    };

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(doRemeasure);
    }

    // Additional ticks cover cases where the container size settles after CSS transitions
    [100, 300, 800].forEach(delay => setTimeout(doRemeasure, delay));

    editor.onDidChangeModelContent(() => {
      code = editor.getValue();
      
      // Auto-run debounce logic (2 seconds)
      if (runTimeout) clearTimeout(runTimeout);
      runTimeout = setTimeout(() => {
        handleRun();
      }, 2000);
    });

    // Run the bot code on mount once the msgWidget is likely ready
    setTimeout(() => {
      handleRun();
    }, 500);
  });

  onDestroy(() => {
    if (runTimeout) clearTimeout(runTimeout);
    if (editor) {
      editor.dispose();
    }
    if (currentAdapter && typeof currentAdapter.destroy === "function") {
      currentAdapter.destroy();
    }
  });

  type ConsoleLog = { type: "log" | "warn" | "error", message: string, time: string };
  let consoleLogs = $state<ConsoleLog[]>([]);

  function pushLog(type: "log" | "warn" | "error", args: any[]) {
    const message = args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ");
    const time = new Date().toLocaleTimeString();
    consoleLogs.push({ type, message, time });
  }

  const customConsole = {
    log: (...args: any[]) => { pushLog("log", args); console.log(...args); },
    warn: (...args: any[]) => { pushLog("warn", args); console.warn(...args); },
    error: (...args: any[]) => { pushLog("error", args); console.error(...args); },
    info: (...args: any[]) => { pushLog("log", args); console.info(...args); }
  };

  let runIdCounter = 0;
  async function handleRun() {
    if (onCodeRun) {
      onCodeRun(code);
    }
    
    const currentRunId = ++runIdCounter;
    try {
      if (!msgWidget) {
        throw new Error("MsgWidget is not yet mounted");
      }
      
      consoleLogs = []; // Clear previous logs
      let executableJs = code;
      
      // Attempt to compile TypeScript to JavaScript using Monaco's worker
      try {
        if (monacoInstance && editor) {
          const model = editor.getModel();
          if (model) {
            const tsLang: any = monacoInstance.languages.typescript;
            const getWorker = await tsLang.getTypeScriptWorker();
            const worker = await getWorker(model.uri);
            const emitOutput = await worker.getEmitOutput(model.uri.toString());
            if (emitOutput && emitOutput.outputFiles && emitOutput.outputFiles.length > 0) {
              executableJs = emitOutput.outputFiles[0].text;
            }
          }
        }
      } catch (e) {
        customConsole.warn("Failed to transpile TypeScript, falling back to raw code");
      }
      
      // Check if a newer run was started while we were compiling
      if (currentRunId !== runIdCounter) {
        return; // Abort this run since a newer one is active
      }
      
      const newAdapter = await runBotCode(executableJs, msgWidget, customConsole);

      // Check again after execution in case another run started
      if (currentRunId !== runIdCounter) {
        if (newAdapter && typeof newAdapter.destroy === "function") {
          newAdapter.destroy();
        }
        return;
      }

      if (currentAdapter && typeof currentAdapter.destroy === "function") {
        currentAdapter.destroy();
      }
      
      currentAdapter = newAdapter;
    } catch(err: any) {
      if (currentRunId === runIdCounter) {
        customConsole.error("Error executing bot code:", err.message || err);
      }
    }
  }

  // Resizing logic
  let consoleHeight = $state(150);
  let isConsoleCollapsed = $state(false);
  let isDragging = $state(false);

  function startDrag(e: MouseEvent) {
    isDragging = true;
    e.preventDefault();
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    const widgetRect = document.querySelector(".code-widget")?.getBoundingClientRect();
    if (widgetRect) {
      const newHeight = widgetRect.bottom - e.clientY;
      if (newHeight > 30 && newHeight < widgetRect.height - 100) {
        consoleHeight = newHeight;
        isConsoleCollapsed = false;
        
        if (editor) {
          setTimeout(() => editor!.layout(), 0);
        }
      }
    }
  }

  function handleMouseUp() {
    if (isDragging) {
      isDragging = false;
      if (editor) editor.layout();
    }
  }

  $effect(() => {
    if (editor && monacoInstance) {
      monacoInstance.editor.setTheme(theme === "light" ? "vs" : "vs-dark");
    }
  });
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div class="code-widget" class:light={theme === "light"} class:dark={theme === "dark"} style="width: {width}; height: {height};">
  <div class="header">
    <h3>WhatsBotCord Bot Editor</h3>
    <button class="run-btn" onclick={handleRun}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
      Run Bot
    </button>
  </div>
  <div class="editor-area" style="cursor: {isDragging ? 'row-resize' : 'default'}">
    <div class="editor-container" bind:this={editorContainer} onmousedown={() => editor && editor.layout()}></div>
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="resizer" role="separator" tabindex="0" onmousedown={startDrag}></div>
    <div class="console-panel" style="height: {isConsoleCollapsed ? '32px' : consoleHeight + 'px'}">
      <div class="console-header">
        <span>Console Output</span>
        <button class="collapse-btn" onclick={() => isConsoleCollapsed = !isConsoleCollapsed}>
          {isConsoleCollapsed ? "▲" : "▼"}
        </button>
      </div>
      {#if !isConsoleCollapsed}
        <div class="console-logs">
          {#each consoleLogs as log}
            <div class="log-entry log-{log.type}">
              <span class="log-time">[{log.time}]</span>
              <span class="log-message">{log.message}</span>
            </div>
          {/each}
          {#if consoleLogs.length === 0}
            <div class="log-entry log-log" style="color: #666; font-style: italic;">No logs yet...</div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .code-widget {
    /* Theme variables - Default (Dark) */
    --bg-color: #1e1e1e;
    --text-color: #ffffff;
    --border-color: #333333;
    --header-bg: #252526;
    --header-text: #cccccc;
    --console-bg: #1e1e1e;
    --console-header-bg: #2d2d2d;
    --console-header-text: #cccccc;
    --console-text: #d4d4d4;
    --resizer-bg: #333333;
    --collapse-btn-color: #888888;
    --collapse-btn-hover: #ffffff;

    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: var(--bg-color);
    color: var(--text-color);
    font-family: sans-serif;
    border-left: 1px solid var(--border-color);
    text-align: left;
  }

  .code-widget.light {
    /* Light theme values */
    --bg-color: #ffffff;
    --text-color: #1e293b;
    --border-color: #e2e8f0;
    --header-bg: #f8fafc;
    --header-text: #475569;
    --console-bg: #f8fafc;
    --console-header-bg: #f1f5f9;
    --console-header-text: #475569;
    --console-text: #1e293b;
    --resizer-bg: #e2e8f0;
    --collapse-btn-color: #64748b;
    --collapse-btn-hover: #0f172a;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--header-text);
  }

  .run-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #0e639c;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .run-btn:hover {
    background-color: #1177bb;
  }

  .editor-area {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .editor-container {
    flex: 1;
    min-height: 0;
    /* FIX: Use 'visible' instead of 'hidden' so Monaco's overflow widgets
       (IntelliSense dropdown, sticky scroll header, hover tooltips) can escape
       the container bounds and render correctly. Monaco positions these widgets
       via fixedOverflowWidgets:true using document-level coordinates, but
       'overflow:hidden' on the container clips them visually. */
    overflow: visible;
    position: relative;
    text-align: left;
  }

  /* FIX: Removed all the aggressive :global overrides on .view-lines,
     .view-line, and .view-line * that were setting box-sizing, margin,
     padding, line-height, and vertical-align.
     
     These overrides were the root cause of the bugs:
     - `line-height: inherit` on span children forced Monaco's internal
       line-height calculations to inherit the wrong value, causing the
       caret to appear ~2 lines below the actual cursor position.
     - `box-sizing: content-box` broke Monaco's pixel-perfect width
       measurements for token spans, causing text rendering misalignment.
     - `margin: 0 / padding: 0 / border: none` on view-line elements
       conflicted with Monaco's own layout, breaking sticky scroll.
     - Overriding IntelliSense widget children caused the dropdown text
       to become invisible (inheriting wrong color or zero-height).
     
     Monaco is a self-contained layout system. Only override what is
     strictly necessary and at the container level. */

  /* Keep only safe, non-destructive overrides */
  .editor-container :global(.monaco-editor) {
    text-align: left;
  }

  .resizer {
    height: 4px;
    background-color: var(--resizer-bg);
    cursor: row-resize;
    flex-shrink: 0;
    transition: background-color 0.2s;
  }

  .resizer:hover,
  .resizer:active {
    background-color: #0e639c;
  }

  .console-panel {
    background-color: var(--console-bg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex-shrink: 0;
  }

  .console-header {
    background-color: var(--console-header-bg);
    padding: 6px 12px;
    font-size: 12px;
    font-weight: bold;
    color: var(--console-header-text);
    border-bottom: 1px solid var(--border-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    flex-shrink: 0;
  }

  .collapse-btn {
    background: none;
    border: none;
    color: var(--collapse-btn-color);
    cursor: pointer;
    font-size: 10px;
    padding: 4px;
  }

  .collapse-btn:hover {
    color: var(--collapse-btn-hover);
  }

  .console-logs {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px;
    font-family: "Consolas", "Courier New", monospace;
    font-size: 13px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .log-entry {
    word-break: break-all;
    line-height: 1.4;
  }

  .log-time {
    color: #888;
    margin-right: 8px;
    font-size: 12px;
  }

  .log-message {
    color: var(--console-text);
  }

  .log-error .log-message {
    color: #f14c4c;
  }

  .log-warn .log-message {
    color: #cca700;
  }
</style>