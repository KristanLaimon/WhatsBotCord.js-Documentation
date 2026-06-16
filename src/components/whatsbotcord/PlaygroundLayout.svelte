<script lang="ts">
  import MsgWidgetWrapper from "./MsgWidgetWrapper.svelte";
  import CodeWidgetWrapper from "./CodeWidgetWrapper.svelte";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  let { initialCode }: { initialCode: string } = $props();

  const localStorageKey = "whatsbotcord_playground_code";
  const savedCode = localStorage.getItem(localStorageKey) || null;
  // svelte-ignore state_referenced_locally
  let codeToUse = savedCode || initialCode;

  function handleCodeRun(code: string) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(localStorageKey, code);
    }
  }

  let containerRef = $state<HTMLElement | null>(null);
  let isDragging = $state(false);
  let leftWidthPercent = $state(50); // Initial 50% split
  let showChatList = $state(false); // Bindable state for MsgWidget's sidebar
  let wasOpenBeforeDrag = $state(false);
  let collapsedByDrag = $state(false);

  // Ready states for the widgets to manage initial loading animation
  let isMsgWidgetReady = $state(false);
  let isCodeWidgetReady = $state(false);
  let isFullyReady = $derived(isMsgWidgetReady && isCodeWidgetReady);

  let progress = $derived.by(() => {
    let val = 15;
    if (isMsgWidgetReady) val += 35;
    if (isCodeWidgetReady) val += 50;
    return val;
  });

  let statusText = $derived.by(() => {
    if (!isMsgWidgetReady) return "Initializing chat preview...";
    if (!isCodeWidgetReady) return "Loading Monaco editor & compiling bot code...";
    return "Ready!";
  });

  onMount(() => {
    if (typeof window !== "undefined") {
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const windowHeightRem = window.innerHeight / rootFontSize;
      if (windowHeightRem > 64) {
        showChatList = false;
      } else {
        showChatList = window.innerWidth >= 640;
      }
    }
  });

  let activeTab = $state<"chat" | "editor">("chat");

  $effect(() => {
    if (activeTab) {
      const triggerResize = () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("resize"));
        }
      };
      triggerResize();
      const t1 = setTimeout(triggerResize, 100);
      const t2 = setTimeout(triggerResize, 250);
      const t3 = setTimeout(triggerResize, 400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  });

  function handlePointerDown(e: PointerEvent) {
    if (!containerRef) return;
    e.preventDefault();
    isDragging = true;

    const rect = containerRef.getBoundingClientRect();
    const containerWidth = rect.width;
    const startX = e.clientX;
    const startWidthPercent = leftWidthPercent;

    // Record the sidebar state before drag starts
    wasOpenBeforeDrag = showChatList;

    function handlePointerMove(moveEvent: PointerEvent) {
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      let newPercent = startWidthPercent + deltaPercent;

      // 10px minimum width constraint (represented as a percentage of container)
      const minPercent = (10 / containerWidth) * 100;
      const maxPercent = 100 - minPercent;

      if (newPercent < minPercent) newPercent = minPercent;
      if (newPercent > maxPercent) newPercent = maxPercent;

      leftWidthPercent = newPercent;

      // Smart sidebar toggle based on 300px width threshold
      const currentWidthPx = (newPercent / 100) * containerWidth;
      const threshold = 800;

      if (currentWidthPx < threshold) {
        if (wasOpenBeforeDrag && showChatList) {
          showChatList = false;
          collapsedByDrag = true;
        }
      } else {
        if (collapsedByDrag && !showChatList) {
          showChatList = true;
          collapsedByDrag = false;
        }
      }
    }

    function handlePointerUp() {
      isDragging = false;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }
</script>

<div class="playground-wrapper">
  {#if !isFullyReady}
    <div class="loading-overlay" transition:fade={{ duration: 300 }}>
      <div class="loading-card">
        <div class="logo-wrapper">
          <img src="/favicon.svg" alt="Whatsbotcord Logo" class="loading-logo" />
          <div class="pulse-ring"></div>
          <div class="pulse-ring-outer"></div>
        </div>
        <h2>Preparing Playground</h2>
        <p class="status-msg">{statusText}</p>
        <div class="progress-track">
          <div class="progress-bar" style="width: {progress}%"></div>
        </div>
        <div class="loading-steps">
          <div class="step" class:active={isMsgWidgetReady}>
            <span class="dot"></span> Chat Environment
          </div>
          <div class="step" class:active={isCodeWidgetReady}>
            <span class="dot"></span> Code Editor & Compiler
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Mobile Toggle -->
  <div class="mobile-toggle-container">
    <div class="segment-control">
      <button 
        class="segment-btn" 
        class:active={activeTab === 'chat'} 
        onclick={() => activeTab = 'chat'}
      >
        Preview / Chat
      </button>
      <button 
        class="segment-btn" 
        class:active={activeTab === 'editor'} 
        onclick={() => activeTab = 'editor'}
      >
        Editor
      </button>
      <div class="sliding-pill" class:right={activeTab === 'editor'}></div>
    </div>
  </div>

  <div 
    bind:this={containerRef}
    class="playground-layout" 
    class:is-dragging={isDragging}
    class:show-chat={activeTab === 'chat'}
    class:show-editor={activeTab === 'editor'}
  >
    <div class="pane left-pane" style="width: {leftWidthPercent}%">
      <MsgWidgetWrapper 
        width="100%" 
        height="100%"
        bind:showChatList={showChatList}
        initialSidebarCollapsed={!showChatList} 
        initialActiveChat={998} /** Documentation chat (ID) */
        initialChatScrollToBottom={false} /** Start at the top of the notes */
        onReady={() => isMsgWidgetReady = true}
      />
    </div>
    
    <div 
      class="divider" 
      role="separator"
      onpointerdown={handlePointerDown}
    ></div>
    
    <div class="pane right-pane">
      <CodeWidgetWrapper 
        initialCode={codeToUse} 
        defaultCode={initialCode}
        onCodeRun={handleCodeRun}
        width="100%" 
        height="100%" 
        onReady={() => isCodeWidgetReady = true}
      />
    </div>
  </div>
</div>

<style>
  .playground-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100vh - var(--var-header-height-starlight, 4rem));
    padding: 1rem;
    box-sizing: border-box;
  }

  /* Loading Overlay Styles */
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, rgba(20, 15, 37, 0.98) 0%, rgba(10, 7, 19, 0.99) 100%);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    border-radius: 8px;
  }

  .loading-card {
    background: rgba(30, 21, 51, 0.45);
    border: 1px solid rgba(94, 78, 194, 0.25);
    border-radius: 16px;
    padding: 3rem 2.5rem;
    width: 90%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .logo-wrapper {
    position: relative;
    width: 84px;
    height: 84px;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-logo {
    width: 64px;
    height: 64px;
    z-index: 2;
    filter: drop-shadow(0 0 8px rgba(94, 78, 194, 0.5));
  }

  .pulse-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid var(--sl-color-accent, #5e4ec2);
    opacity: 0;
    animation: pulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    z-index: 1;
  }

  .pulse-ring-outer {
    position: absolute;
    width: 120%;
    height: 120%;
    border-radius: 50%;
    border: 2px dashed rgba(94, 78, 194, 0.3);
    opacity: 0.8;
    animation: rotate 12s linear infinite;
    z-index: 0;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.6);
      opacity: 0;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      transform: scale(1.3);
      opacity: 0;
    }
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading-card h2 {
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.025em;
  }

  .status-msg {
    color: var(--sl-color-gray-3, #94a3b8);
    font-size: 0.9rem;
    margin: 0 0 2rem 0;
    min-height: 1.25rem;
  }

  .progress-track {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--sl-color-accent, #5e4ec2) 0%, #3d7edd 100%);
    border-radius: 3px;
    box-shadow: 0 0 10px var(--sl-color-accent, #5e4ec2);
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .loading-steps {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    align-items: flex-start;
    padding-left: 2rem;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.4);
    transition: color 0.3s ease;
  }

  .step.active {
    color: #ffffff;
  }

  .step .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
  }

  .step.active .dot {
    background: #3dd968;
    box-shadow: 0 0 8px #3dd968;
  }

  .mobile-toggle-container {
    display: none;
  }

  .playground-layout {
    display: flex;
    flex-direction: row;
    width: auto;
    height: 100%;
    overflow: hidden;
    position: relative;
    border: 1px solid var(--sl-color-gray-5, #cbd5e1);
    border-radius: 8px;
    background-color: var(--sl-color-black, #140f25);
    margin: 0;
  }

  .pane {
    overflow: hidden;
    height: 100%;
  }

  .left-pane {
    flex-shrink: 0;
  }

  .right-pane {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0%;
    width: 0;
    min-width: 0;
  }

  .divider {
    width: 12px;
    background-color: var(--sl-color-bg-nav, #140f25);
    cursor: col-resize;
    position: relative;
    flex-shrink: 0;
    transition: background-color 0.2s ease;
    border-left: 1px solid var(--sl-color-gray-5, #cbd5e1);
    border-right: 1px solid var(--sl-color-gray-5, #cbd5e1);
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    touch-action: none;
  }

  .divider::after {
    content: "";
    width: 4px;
    height: 40px;
    background-color: var(--sl-color-gray-4, #cbd5e1);
    border-radius: 2px;
    transition: background-color 0.2s ease, height 0.2s ease;
  }

  .divider:hover {
    background-color: var(--sl-color-accent, #5e4ec2);
  }

  .divider:hover::after {
    background-color: #ffffff;
    height: 60px;
  }

  .playground-layout.is-dragging .pane {
    pointer-events: none;
    user-select: none;
  }

  .playground-layout.is-dragging .divider {
    background-color: var(--sl-color-accent, #5e4ec2);
  }

  .playground-layout.is-dragging .divider::after {
    background-color: #ffffff;
    height: 60px;
  }

  /* Responsive layout for mobile (< 640px) */
  @media (max-width: 639px) {
    .playground-wrapper {
      height: auto !important;
      padding: 0 !important;
    }

    .mobile-toggle-container {
      display: flex;
      justify-content: center;
      margin: 0.5rem 1rem 0;
    }

    .segment-control {
      position: relative;
      display: flex;
      background-color: var(--sl-color-black, #140f25);
      border: 1px solid var(--sl-color-gray-5, #cbd5e1);
      border-radius: 30px;
      padding: 2px;
      width: 100%;
      max-width: 320px;
      z-index: 10;
    }

    .segment-btn {
      flex: 1;
      background: none;
      border: none;
      padding: 5px 12px;
      font-size: 13px;
      font-weight: 600;
      color: var(--sl-color-gray-3, #94a3b8);
      cursor: pointer;
      z-index: 2;
      transition: color 0.2s ease;
      text-align: center;
      outline: none;
    }

    .segment-btn.active {
      color: #ffffff;
    }

    .sliding-pill {
      position: absolute;
      top: 2px;
      left: 2px;
      width: calc(50% - 2px);
      height: calc(100% - 4px);
      background-color: var(--sl-color-accent, #5e4ec2);
      border-radius: 26px;
      z-index: 1;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sliding-pill.right {
      transform: translateX(100%);
    }

    .playground-layout {
      margin-top: 0.5rem !important;
      height: calc(100vh - var(--var-header-height-starlight, 4rem) - 3.5rem) !important;
      display: block !important;
      position: relative !important;
      border: 1px solid var(--sl-color-gray-5, #cbd5e1);
      border-radius: 8px;
      background-color: var(--sl-color-black, #140f25);
      overflow: hidden;
      margin-bottom: 0.5rem !important;
    }

    .divider {
      display: none !important;
    }

    .pane {
      width: 100% !important;
      height: 100% !important;
      position: absolute !important;
      top: 0;
      left: 0;
      transition: opacity 0.25s ease, transform 0.25s ease;
    }

    .left-pane {
      opacity: 0;
      pointer-events: none;
      transform: translateX(-20px);
    }

    .right-pane {
      opacity: 0;
      pointer-events: none;
      transform: translateX(20px);
    }

    .show-chat .left-pane {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(0);
      z-index: 1;
    }

    .show-editor .right-pane {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(0);
      z-index: 1;
    }
  }
</style>
