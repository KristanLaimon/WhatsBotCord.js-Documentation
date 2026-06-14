<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import loader from "@monaco-editor/loader";
  import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

  // @ts-ignore
  import dtsContents from "../lib/whatsbotcord-browser-lib.d.ts?raw";
  import { runBotCode } from "./BotRunner";

  import type { IMsgWidget } from "../MsgWidget/MsgWidget";

  const {
    initialCode = "",
    msgWidget,
    onCodeRun,
  }: {
    initialCode?: string;
    msgWidget?: IMsgWidget;
    onCodeRun?: (code: string) => void;
  } = $props();

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

    editor = monacoInstance.editor.create(editorContainer, {
      value: code,
      language: "typescript",
      theme: "vs-dark",
      minimap: { enabled: false },
      automaticLayout: true,
      fontSize: 14,
      autoIndent: "full",
      autoIndentOnPaste: true,
    });

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
    if (currentAdapter && typeof currentAdapter.destroy === 'function') {
      currentAdapter.destroy();
    }
  });

  type ConsoleLog = { type: 'log' | 'warn' | 'error', message: string, time: string };
  let consoleLogs = $state<ConsoleLog[]>([]);

  function pushLog(type: 'log' | 'warn' | 'error', args: any[]) {
    const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    const time = new Date().toLocaleTimeString();
    consoleLogs.push({ type, message, time });
    
    // Auto-scroll logic if needed could go here or using overflow-y: auto in css with flex-direction: column-reverse
  }

  const customConsole = {
    log: (...args: any[]) => { pushLog('log', args); console.log(...args); },
    warn: (...args: any[]) => { pushLog('warn', args); console.warn(...args); },
    error: (...args: any[]) => { pushLog('error', args); console.error(...args); },
    info: (...args: any[]) => { pushLog('log', args); console.info(...args); }
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
        if (newAdapter && typeof newAdapter.destroy === 'function') {
          newAdapter.destroy();
        }
        return;
      }

      if (currentAdapter && typeof currentAdapter.destroy === 'function') {
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
    const widgetRect = document.querySelector('.code-widget')?.getBoundingClientRect();
    if (widgetRect) {
      const newHeight = widgetRect.bottom - e.clientY;
      if (newHeight > 30 && newHeight < widgetRect.height - 100) {
        consoleHeight = newHeight;
        isConsoleCollapsed = false;
        
        // Let Monaco editor resize automatically
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
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div class="code-widget">
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
    <div class="editor-container" bind:this={editorContainer}></div>
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="resizer" role="separator" tabindex="0" onmousedown={startDrag}></div>
    <div class="console-panel" style="height: {isConsoleCollapsed ? '32px' : consoleHeight + 'px'}">
      <div class="console-header">
        <span>Console Output</span>
        <button class="collapse-btn" onclick={() => isConsoleCollapsed = !isConsoleCollapsed}>
          {isConsoleCollapsed ? '▲' : '▼'}
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
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: #1e1e1e;
    color: #fff;
    font-family: sans-serif;
    border-left: 1px solid #333;
    text-align: left;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background-color: #252526;
    border-bottom: 1px solid #333;
  }
  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #cccccc;
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
    text-align: left;
  }
  .resizer {
    height: 4px;
    background-color: #333;
    cursor: row-resize;
    transition: background-color 0.2s;
  }
  .resizer:hover, .resizer:active {
    background-color: #0e639c;
  }
  .console-panel {
    background-color: #1e1e1e;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .console-header {
    background-color: #2d2d2d;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: bold;
    color: #ccc;
    border-bottom: 1px solid #333;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
  }
  .collapse-btn {
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    font-size: 10px;
    padding: 4px;
  }
  .collapse-btn:hover {
    color: #fff;
  }
  .console-logs {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px;
    font-family: 'Consolas', 'Courier New', monospace;
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
    color: #d4d4d4;
  }
  .log-error .log-message {
    color: #f14c4c;
  }
  .log-warn .log-message {
    color: #cca700;
  }
</style>
