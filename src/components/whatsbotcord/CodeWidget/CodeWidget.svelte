<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import loader from "@monaco-editor/loader";
  import type * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
  import { encodeCode } from "../../../utils/codeEncoder";

  import TabBar from "./components/TabBar.svelte";
  import ConsolePanel from "./components/ConsolePanel.svelte";
  import "./style/CodeWidget.css";

  // @ts-ignore
  import dtsContents from "../lib/whatsbotcord-browser-lib.d.ts?raw";
  import { runBotCode } from "./logic/BotRunner";
  import type { IMsgWidget } from "../MsgWidget/MsgWidget";

  export type CodeWidgetProps = {
    initialCode?: string;
    defaultCode?: string;
    msgWidget?: IMsgWidget;
    onCodeRun?: (code: string) => void;
    width?: string;
    height?: string;
    theme?: "light" | "dark";
    onReady?: () => void;
  }

  const {
    initialCode = "",
    defaultCode,
    msgWidget,
    onCodeRun,
    width = "100%",
    height = "100%",
    theme = "dark",
    onReady,
  }: CodeWidgetProps = $props();

  let editorContainer: HTMLElement;
  let editor = $state<monaco.editor.IStandaloneCodeEditor | null>(null);
  let monacoInstance: typeof monaco;

  interface TabState {
    id: string;
    name: string;
    code: string;
    isMain?: boolean;
  }

  // Parse initial code or load default
  let initialTabs: TabState[] = [];
  // svelte-ignore state_referenced_locally
  if (initialCode && initialCode.trim().startsWith("[")) {
    try {
      // svelte-ignore state_referenced_locally
      initialTabs = JSON.parse(initialCode);
    } catch (e) {
      console.error("Failed to parse initialCode as tabs JSON:", e);
    }
  }

  if (initialTabs.length === 0) {
    initialTabs = [
      {
        id: "main-tab",
        name: "main.ts",
        // svelte-ignore state_referenced_locally
        code: initialCode || defaultCode || "",
        isMain: true
      }
    ];
  }

  let tabs = $state<TabState[]>(initialTabs);
  let activeTabId = $state<string>(initialTabs[0].id);
  let renamingTabId = $state<string | null>(null);
  let renamingText = $state("");

  // svelte-ignore state_referenced_locally
  let activeTheme = $state(theme);
  let themeObserver: MutationObserver | null = null;

  let runTimeout: ReturnType<typeof setTimeout> | null = null;
  let currentAdapter: any = null;

  let statusMessage = $state("");
  let statusType = $state<"success" | "error">("success");
  let statusTimeout: ReturnType<typeof setTimeout> | null = null;

  // Tab management functions
  function saveTabsToStorage() {
    const serialized = JSON.stringify(
      tabs.map(t => ({
        id: t.id,
        name: t.name,
        code: t.code,
        isMain: t.isMain
      }))
    );
    if (onCodeRun) {
      onCodeRun(serialized);
    }
  }

  function getOrCreateModel(name: string, code: string): monaco.editor.ITextModel | null {
    if (!monacoInstance) return null;
    const uri = monacoInstance.Uri.parse(`file:///${name}`);
    let model = monacoInstance.editor.getModel(uri);
    const language = name.endsWith(".js") ? "javascript" : "typescript";
    if (!model) {
      model = monacoInstance.editor.createModel(code, language, uri);
    } else {
      model.setValue(code);
      monacoInstance.editor.setModelLanguage(model, language);
    }
    return model;
  }

  function handleTabAdd() {
    let count = 1;
    let name = `module_${count}.ts`;
    while (tabs.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      count++;
      name = `module_${count}.ts`;
    }

    const newTab: TabState = {
      id: "tab-" + Date.now() + Math.random().toString(36).substring(2, 7),
      name,
      code: `export function hello() {\n  console.log("Hello from ${name}!");\n}\n`,
    };

    tabs.push(newTab);
    activeTabId = newTab.id;

    const model = getOrCreateModel(newTab.name, newTab.code);
    if (model && editor) {
      editor.setModel(model);
    }

    saveTabsToStorage();
    handleRun();

    // Trigger renaming
    renamingTabId = newTab.id;
    renamingText = newTab.name;
  }

  function handleTabDelete(id: string, event: MouseEvent) {
    event.stopPropagation();
    const index = tabs.findIndex(t => t.id === id);
    if (index === -1) return;

    const tabToDelete = tabs[index];
    if (tabToDelete.isMain) return;

    if (confirm(`Are you sure you want to delete "${tabToDelete.name}"?`)) {
      if (monacoInstance) {
        const model = monacoInstance.editor.getModel(monacoInstance.Uri.parse(`file:///${tabToDelete.name}`));
        if (model) {
          model.dispose();
        }
      }

      tabs.splice(index, 1);

      if (activeTabId === id) {
        const newActiveIndex = Math.max(0, index - 1);
        activeTabId = tabs[newActiveIndex].id;

        if (editor && monacoInstance) {
          const activeTab = tabs[newActiveIndex];
          const model = monacoInstance.editor.getModel(monacoInstance.Uri.parse(`file:///${activeTab.name}`));
          if (model) {
            editor.setModel(model);
          }
        }
      }

      saveTabsToStorage();
      handleRun();
    }
  }

  function handleTabRename(tab: TabState, oldName: string, newName: string) {
    tab.name = newName;

    if (monacoInstance) {
      const oldUri = monacoInstance.Uri.parse(`file:///${oldName}`);
      const oldModel = monacoInstance.editor.getModel(oldUri);
      const currentCode = oldModel ? oldModel.getValue() : tab.code;

      if (oldModel) {
        oldModel.dispose();
      }

      const newModel = getOrCreateModel(newName, currentCode);
      if (activeTabId === tab.id && editor && newModel) {
        editor.setModel(newModel);
      }
    }

    saveTabsToStorage();
    handleRun();
  }

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

  function handleRestoreDefault() {
    if (confirm("Are you sure you want to reset the code to the default example? All your changes will be lost.")) {
      const resetValue = defaultCode || initialCode;
      
      // Dispose old models
      if (monacoInstance) {
        tabs.forEach(tab => {
          const model = monacoInstance.editor.getModel(monacoInstance.Uri.parse(`file:///${tab.name}`));
          if (model) model.dispose();
        });
      }

      // Restore to a single main.ts tab
      tabs = [
        {
          id: "main-tab",
          name: "main.ts",
          code: resetValue,
          isMain: true
        }
      ];
      activeTabId = "main-tab";

      const model = getOrCreateModel("main.ts", resetValue);
      if (model && editor) {
        editor.setModel(model);
      }

      saveTabsToStorage();
      handleRun();
    }
  }

  async function handleExportLink() {
    try {
      let codeToEncode = "";
      if (tabs.length === 1 && tabs[0].name === "main.ts") {
        codeToEncode = tabs[0].code;
      } else {
        codeToEncode = JSON.stringify(
          tabs.map(t => ({
            id: t.id,
            name: t.name,
            code: t.code,
            isMain: t.isMain
          }))
        );
      }

      const encoded = await encodeCode(codeToEncode);
      const url = `${window.location.origin}/playground?code=${encoded}`;
      
      await navigator.clipboard.writeText(url);
      showStatus("Playground link copied to clipboard!", "success");
    } catch (err: any) {
      console.error("Failed to export playground link:", err);
      showStatus("Failed to copy link", "error");
    }
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

  $effect(() => {
    if (editor && monacoInstance && activeTabId) {
      const targetTab = tabs.find(t => t.id === activeTabId);
      if (targetTab) {
        const uri = monacoInstance.Uri.parse(`file:///${targetTab.name}`);
        const model = monacoInstance.editor.getModel(uri);
        if (model && editor.getModel() !== model) {
          editor.setModel(model);
        }
      }
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
      module: tsLang.ModuleKind.CommonJS,
      typeRoots: ["node_modules/@types"],
    });

    // Eagerly sync all models (like background tabs) to the worker so relative imports resolve on initial load
    tsOpts.setEagerModelSync(true);
    monacoInstance.languages.typescript.javascriptDefaults.setEagerModelSync(true);

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

    // Initialize models for all tabs
    tabs.forEach(tab => {
      getOrCreateModel(tab.name, tab.code);
    });

    // Get model for active tab
    const activeTabObj = tabs.find(t => t.id === activeTabId) || tabs[0];
    const activeModel = monacoInstance.editor.getModel(monacoInstance.Uri.parse(`file:///${activeTabObj.name}`));

    // FIX: Do NOT set lineHeight manually — let Monaco derive it from fontSize.
    // A fixed lineHeight that doesn't match the rendered font causes the caret
    // to appear offset (typically 2 lines below the actual cursor position).
    editor = monacoInstance.editor.create(editorContainer, {
      model: activeModel,
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

    if (onReady) {
      onReady();
    }

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
      const currentModel = editor.getModel();
      if (currentModel) {
        const val = currentModel.getValue();
        const currentTab = tabs.find(t => monacoInstance.Uri.parse(`file:///${t.name}`).toString() === currentModel.uri.toString());
        if (currentTab) {
          currentTab.code = val;
          saveTabsToStorage();
        }
      }
      
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
    if (monacoInstance) {
      tabs.forEach(tab => {
        const model = monacoInstance.editor.getModel(monacoInstance.Uri.parse(`file:///${tab.name}`));
        if (model) model.dispose();
      });
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
    isConsoleCollapsed = false; // Auto-expand logs panel
  }

  const customConsole = {
    log: (...args: any[]) => { pushLog("log", args); console.log(...args); },
    warn: (...args: any[]) => { pushLog("warn", args); console.warn(...args); },
    error: (...args: any[]) => { pushLog("error", args); console.error(...args); },
    info: (...args: any[]) => { pushLog("log", args); console.info(...args); }
  };

  let runIdCounter = 0;
  let initialRunRetries = 0;
  async function handleRun() {
    saveTabsToStorage();
    
    const currentRunId = ++runIdCounter;
    try {
      if (!msgWidget) {
        throw new Error("MsgWidget is not yet mounted");
      }
      
      consoleLogs = []; // Clear previous logs
      
      const transpiledFiles: Record<string, string> = {};
      let entryPointUri = "";
      
      if (monacoInstance) {
        const tsLang: any = monacoInstance.languages.typescript;
        const getWorker = await tsLang.getTypeScriptWorker();
        
        for (const tab of tabs) {
          const uri = monacoInstance.Uri.parse(`file:///${tab.name}`);
          const model = monacoInstance.editor.getModel(uri);
          
          if (model) {
            if (tab.name.endsWith(".js")) {
              transpiledFiles[model.uri.toString()] = model.getValue();
            } else {
              try {
                const worker = await getWorker(model.uri);
                const emitOutput = await worker.getEmitOutput(model.uri.toString());
                if (emitOutput && emitOutput.outputFiles && emitOutput.outputFiles.length > 0) {
                  transpiledFiles[model.uri.toString()] = emitOutput.outputFiles[0].text;
                } else {
                  throw new Error("Compiler worker is initializing");
                }
              } catch (e: any) {
                if (e.message === "Compiler worker is initializing") {
                  throw e;
                }
                console.warn(`Failed to transpile ${tab.name}, falling back to raw code`, e);
                transpiledFiles[model.uri.toString()] = model.getValue();
              }
            }
          } else {
            transpiledFiles[uri.toString()] = tab.code;
          }
          
          if (tab.isMain) {
            entryPointUri = uri.toString();
          }
        }
      }
      
      if (!entryPointUri && tabs.length > 0) {
        entryPointUri = monacoInstance.Uri.parse(`file:///${tabs[0].name}`).toString();
      }
      
      // Check if a newer run was started while we were compiling
      if (currentRunId !== runIdCounter) {
        return; // Abort this run since a newer one is active
      }
      
      const newAdapter = await runBotCode(transpiledFiles, entryPointUri, msgWidget, customConsole);

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
        if (err.message === "Compiler worker is initializing" && initialRunRetries < 5) {
          initialRunRetries++;
          setTimeout(handleRun, 200);
          return;
        }
        customConsole.error("Error executing bot code:", err.message || err);
        showStatus("Error, check logs", "error");
      }
    }
  }

  // Resizing logic
  let consoleHeight = $state(150);
  let isConsoleCollapsed = $state(true);
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
      <button class="restore-btn" onclick={handleRestoreDefault} title="Reset code to the default example">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        Restore default code
      </button>
      <button class="restore-btn" onclick={handleExportLink} title="Copy shareable playground link to clipboard">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Export link
      </button>
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
        Execute/Update code
      </button>
    </div>
  </div>
  <div class="editor-area" style="cursor: {isDragging ? 'row-resize' : 'default'}">
    <TabBar
      bind:tabs={tabs}
      bind:activeTabId={activeTabId}
      bind:renamingTabId={renamingTabId}
      bind:renamingText={renamingText}
      onTabSelect={(id) => activeTabId = id}
      onTabAdd={handleTabAdd}
      onTabDelete={handleTabDelete}
      onTabRename={handleTabRename}
    />

    <div class="editor-container" bind:this={editorContainer} onmousedown={() => editor && editor.layout()}></div>
    {#if vimModeEnabled}
      <div class="vim-status-bar" bind:this={vimStatusBar}></div>
    {/if}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="resizer" role="separator" tabindex="0" onmousedown={startDrag}></div>
    
    <ConsolePanel
      consoleLogs={consoleLogs}
      bind:isConsoleCollapsed={isConsoleCollapsed}
      consoleHeight={consoleHeight}
    />
  </div>
</div>