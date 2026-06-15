<script lang="ts">
  import MsgWidgetWrapper from "./MsgWidgetWrapper.svelte";
  import CodeWidgetWrapper from "./CodeWidgetWrapper.svelte";

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
  let showChatList = $state(true); // Bindable state for MsgWidget's sidebar
  let wasOpenBeforeDrag = $state(false);
  let collapsedByDrag = $state(false);

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

<div 
  bind:this={containerRef}
  class="playground-layout" 
  class:is-dragging={isDragging}
>
  <div class="pane left-pane" style="width: {leftWidthPercent}%">
    <MsgWidgetWrapper 
      width="100%" 
      height="calc(100vh - 12rem);"
      bind:showChatList={showChatList}
      initialSidebarCollapsed={!showChatList} 
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
      onCodeRun={handleCodeRun}
      width="100%" 
      height="100%" 
    />
  </div>
</div>

<style>
  .playground-layout {
    display: flex;
    flex-direction: row;
    width: auto;
    height: calc(100vh - 12rem);
    overflow: hidden;
    position: relative;
    border: 1px solid var(--sl-color-gray-5, #cbd5e1);
    border-radius: 8px;
    background-color: var(--sl-color-black, #140f25);
    margin: 2rem;
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

  /* Responsive layout for mobile / tablet screens (md and below) */
  @media (max-width: 1200px) {
    .playground-layout {
      flex-direction: column-reverse; /* Stacks code widget on top, chat widget on bottom */
      height: auto !important;
      gap: 1.5rem;
      border: none;
      background-color: transparent;
      margin: 0.2rem;
    }

    .pane {
      width: 100% !important;
      height: auto !important;
    }

    .left-pane {
      height: 800px !important;
    }

    .left-pane :global(> div),
    .left-pane :global(.wa-container) {
      height: 100% !important;
      min-height: 800px !important;
    }

    .right-pane {
      height: 1200px !important;
    }

    .right-pane :global(> div),
    .right-pane :global(.code-widget) {
      height: 100% !important;
      min-height: 1200px !important;
    }

    .divider {
      display: none;
    }
  }
</style>
