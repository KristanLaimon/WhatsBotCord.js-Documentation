<script lang="ts">
  interface TabState {
    id: string;
    name: string;
    code: string;
    isMain?: boolean;
  }

  // Props
  let {
    tabs = $bindable(),
    activeTabId = $bindable(),
    renamingTabId = $bindable(),
    renamingText = $bindable(),
    onTabSelect,
    onTabAdd,
    onTabDelete,
    onTabRename,
  }: {
    tabs: TabState[];
    activeTabId: string;
    renamingTabId: string | null;
    renamingText: string;
    onTabSelect: (id: string) => void;
    onTabAdd: () => void;
    onTabDelete: (id: string, event: MouseEvent) => void;
    onTabRename: (tab: TabState, oldName: string, newName: string) => void;
  } = $props();

  // Internal Drag and Drop State for tab reordering
  let draggedIndex = $state<number | null>(null);
  let dragOverIndex = $state<number | null>(null);

  function handleDragStart(e: DragEvent, index: number) {
    draggedIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", index.toString());
    }
  }

  function handleDragOver(e: DragEvent, index: number) {
    if (index === 0 || draggedIndex === null || draggedIndex === index) return;
    e.preventDefault();
  }

  function handleDragEnter(e: DragEvent, index: number) {
    if (index === 0 || draggedIndex === null || draggedIndex === index) return;
    dragOverIndex = index;
  }

  function handleDragLeave(index: number) {
    if (dragOverIndex === index) {
      dragOverIndex = null;
    }
  }

  function handleDrop(e: DragEvent, targetIndex: number) {
    if (draggedIndex === null || draggedIndex === targetIndex || targetIndex === 0) return;

    const draggedTab = tabs[draggedIndex];
    tabs.splice(draggedIndex, 1);
    tabs.splice(targetIndex, 0, draggedTab);

    draggedIndex = null;
    dragOverIndex = null;
  }

  function handleDragEnd() {
    draggedIndex = null;
    dragOverIndex = null;
  }

  // Rename triggers
  function startRename(tab: TabState) {
    renamingTabId = tab.id;
    renamingText = tab.name;

    setTimeout(() => {
      const input = document.getElementById(`rename-input-${tab.id}`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 50);
  }

  function finishRename(tab: TabState) {
    if (renamingTabId !== tab.id) return;

    let newName = renamingText.trim();
    if (!newName) {
      renamingTabId = null;
      return;
    }

    if (!newName.endsWith(".ts") && !newName.endsWith(".js") && !newName.endsWith(".d.ts")) {
      newName += ".ts";
    }

    const duplicate = tabs.find(t => t.id !== tab.id && t.name.toLowerCase() === newName.toLowerCase());
    if (duplicate) {
      alert(`A file named ${newName} already exists.`);
      renamingTabId = null;
      return;
    }

    const oldName = tab.name;
    // Tell parent to update Monaco model, then we update UI state
    onTabRename(tab, oldName, newName);
    renamingTabId = null;
  }

  function handleRenameKeyDown(e: KeyboardEvent, tab: TabState) {
    if (e.key === "Enter") {
      finishRename(tab);
    } else if (e.key === "Escape") {
      renamingTabId = null;
    }
  }

  function handleTabKeyDown(e: KeyboardEvent, tab: TabState) {
    if (e.key === "F2") {
      e.preventDefault();
      startRename(tab);
    }
  }
</script>

<div class="tab-bar">
  <div class="tabs-container">
    {#each tabs as tab, i (tab.id)}
      <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
      <div
        class="tab"
        class:active={activeTabId === tab.id}
        class:drag-over={dragOverIndex === i}
        onclick={() => onTabSelect(tab.id)}
        ondoubleclick={() => startRename(tab)}
        onkeydown={e => handleTabKeyDown(e, tab)}
        draggable={!tab.isMain}
        ondragstart={e => handleDragStart(e, i)}
        ondragover={e => handleDragOver(e, i)}
        ondragenter={e => handleDragEnter(e, i)}
        ondragleave={() => handleDragLeave(i)}
        ondragend={handleDragEnd}
        ondrop={e => handleDrop(e, i)}
        role="tab"
        aria-selected={activeTabId === tab.id}
        tabindex="0"
      >
        {#if renamingTabId === tab.id}
          <input
            id="rename-input-{tab.id}"
            type="text"
            class="tab-name-input"
            bind:value={renamingText}
            onblur={() => finishRename(tab)}
            onkeydown={e => handleRenameKeyDown(e, tab)}
            onclick={e => e.stopPropagation()}
          />
        {:else}
          <div class="tab-icon">
            {#if tab.name.endsWith(".ts")}
              <svg viewBox="0 0 100 100" width="14" height="14">
                <rect width="100" height="100" fill="#3178c6" rx="15" />
                <text
                  x="50"
                  y="70"
                  font-family="system-ui, sans-serif"
                  font-weight="900"
                  font-size="52"
                  fill="#ffffff"
                  text-anchor="middle">TS</text
                >
              </svg>
            {:else if tab.name.endsWith(".js")}
              <svg viewBox="0 0 100 100" width="14" height="14">
                <rect width="100" height="100" fill="#f7df1e" rx="15" />
                <text
                  x="50"
                  y="70"
                  font-family="system-ui, sans-serif"
                  font-weight="900"
                  font-size="52"
                  fill="#000000"
                  text-anchor="middle">JS</text
                >
              </svg>
            {:else}
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            {/if}
          </div>
          <span class="tab-name">{tab.name}</span>

          {#if !tab.isMain}
            <button class="tab-close" onclick={e => onTabDelete(tab.id, e)} title="Delete file">
              <svg
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          {/if}
        {/if}
      </div>
    {/each}
  </div>
  <button class="add-tab-btn" onclick={onTabAdd} title="New file">
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  </button>
</div>
