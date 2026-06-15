<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";
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
  let editor = $state<monaco.editor.IStandaloneCodeEditor | null>(null);
  let monacoInstance: typeof monaco;

  // svelte-ignore state_referenced_locally
  let code = $state(initialCode);
  let activeTheme = $state(theme);
  let themeObserver: MutationObserver | null = null;
  let runTimeout: ReturnType<typeof setTimeout> | null = null;
  let currentAdapter: any = null;

  let statusMessage = $state("");
  let statusType = $state<"success" | "error">("success");
  let statusTimeout: ReturnType<typeof setTimeout> | null = null;

  function showStatus(message: string, type: "success" | "error") {
    statusMessage = message;
    statusType = type;
    if (statusTimeout) clearTimeout(statusTimeout);
    statusTimeout = setTimeout(() => {
      statusMessage = "";
    }, 4000);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      handleRun();
    }
  }

  let vimModeEnabled = $state(localStorage.getItem("whatsbotcord_vim_mode") === "true");
  let vimModeInstance: any = null;
  let vimStatusBar = $state<HTMLElement | null>(null);

  function handleVimToggle() {
    vimModeEnabled = !vimModeEnabled;
  }

  $effect(() => {
    // Save Vim mode preference to localStorage
    localStorage.setItem("whatsbotcord_vim_mode", String(vimModeEnabled));

    if (vimModeEnabled && editor && vimStatusBar) {
      import("monaco-vim").then(({ initVimMode }) => {
        if (vimModeInstance) vimModeInstance.dispose();
        vimModeInstance = initVimMode(editor, vimStatusBar);
      }).catch(e => console.error("Error initializing Vim mode:", e));
    } else {
      if (vimModeInstance) {
        vimModeInstance.dispose();
        vimModeInstance = null;
      }
    }
    if (editor) {
      // Trigger layout adjustment on state change
      setTimeout(() => {
        if (editor) editor.layout();
      }, 0);
    }
  });

  onMount(async () => {
    const syncTheme = () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      if (currentTheme === "light" || currentTheme === "dark") {
        activeTheme = currentTheme;
      }
    };

    syncTheme();

    themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

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
      theme: activeTheme === "light" ? "vs" : "vs-dark",
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

    // Register Ctrl+S keyboard shortcut command inside the editor text area
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
      () => {
        handleRun();
      }
    );

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
    if (vimModeInstance) {
      vimModeInstance.dispose();
      vimModeInstance = null;
    }
    if (editor) {
      editor.dispose();
    }
    if (currentAdapter && typeof currentAdapter.destroy === "function") {
      currentAdapter.destroy();
    }
    if (themeObserver) {
      themeObserver.disconnect();
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
      showStatus("Saved and loaded changes...", "success");
    } catch(err: any) {
      if (currentRunId === runIdCounter) {
        customConsole.error("Error executing bot code:", err.message || err);
        showStatus("Error, check logs", "error");
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
    activeTheme = theme;
  });

  $effect(() => {
    if (editor && monacoInstance) {
      monacoInstance.editor.setTheme(activeTheme === "light" ? "vs" : "vs-dark");
    }
  });
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="code-widget" class:light={activeTheme === "light"} class:dark={activeTheme === "dark"} style="width: {width}; height: {height};" onkeydown={handleKeyDown}>
  <div class="header">
    <div class="title-container">
      <h3>WhatsBotCord Bot Editor</h3>
      {#if statusMessage}
        <span transition:fade={{ duration: 250 }} class="status-msg {statusType}">
          {statusMessage}
        </span>
      {/if}
    </div>
    <div class="controls-container">
      <div class="vim-toggle-wrapper">
        <span class="vim-label">Vim Mode</span>
        <button 
          class="switch-btn" 
          class:active={vimModeEnabled} 
          onclick={handleVimToggle}
          aria-label="Toggle Vim Mode"
        >
          <span class="switch-slider"></span>
        </button>
      </div>
      <button class="run-btn" onclick={handleRun}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        Run Bot
      </button>
    </div>
  </div>
  <div class="editor-area" style="cursor: {isDragging ? 'row-resize' : 'default'}">
    <div class="editor-container" bind:this={editorContainer} onmousedown={() => editor && editor.layout()}></div>
    {#if vimModeEnabled}
      <div class="vim-status-bar" bind:this={vimStatusBar}></div>
    {/if}
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
    overflow: visible;
    position: relative;
    text-align: left;
  }

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

  .title-container {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .status-msg {
    font-size: 11px;
    font-weight: 600;
    margin-top: 2px;
    letter-spacing: 0.2px;
  }

  .status-msg.success {
    color: #4ade80;
  }

  .status-msg.error {
    color: #f87171;
  }

  .light .status-msg.success {
    color: #15803d;
  }

  .light .status-msg.error {
    color: #b91c1c;
  }

  .controls-container {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .vim-toggle-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    user-select: none;
  }

  .vim-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--header-text);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .switch-btn {
    position: relative;
    width: 38px;
    height: 20px;
    background-color: var(--border-color);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    cursor: pointer;
    padding: 0;
    transition: background-color 0.2s, border-color 0.2s;
    display: flex;
    align-items: center;
  }

  .switch-btn.active {
    background-color: #0e639c;
    border-color: #0e639c;
  }

  .switch-slider {
    position: absolute;
    left: 2px;
    width: 14px;
    height: 14px;
    background-color: var(--text-color);
    border-radius: 50%;
    transition: transform 0.2s;
  }

  .switch-btn.active .switch-slider {
    transform: translateX(18px);
  }

  .vim-status-bar {
    background-color: var(--console-header-bg);
    color: var(--console-header-text);
    border-top: 1px solid var(--border-color);
    padding: 4px 12px;
    font-family: "Consolas", "Courier New", monospace;
    font-size: 12px;
    height: 24px;
    display: flex;
    align-items: center;
    user-select: none;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .vim-status-bar :global(.status-span) {
    font-weight: bold;
    text-transform: uppercase;
  }

  .vim-status-bar :global(.status-input) {
    background: transparent;
    border: none;
    outline: none;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
    width: 100%;
    padding: 0;
    margin: 0;
  }
</style>