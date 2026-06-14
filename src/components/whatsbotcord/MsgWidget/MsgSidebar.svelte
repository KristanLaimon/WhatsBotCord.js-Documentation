<script lang="ts">
  import { getInitials, type Chat } from "./MsgWidget";

  let {
    chats,
    appTitle,
    activeChat = $bindable(),
    startResize,
  }: {
    chats: Chat[];
    appTitle: string;
    activeChat: number | null;
    startResize: (e: MouseEvent) => void;
  } = $props();

  let searchQuery = $state("");
  let filters = ["All", "Unread", "Favorites", "Groups"];
  let activeFilter = $state("All");

  let filteredChats = $derived(
    chats.filter(
      (c: Chat) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (activeFilter === "All" ||
          (activeFilter === "Unread" && (c.unread ?? 0) > 0) ||
          (activeFilter === "Groups" && c.isGroup) ||
          (activeFilter === "Favorites" && c.pinned))
    )
  );

  function setActive(id: number) {
    activeChat = id;
    const chatIndex = chats.findIndex(c => c.id === id);
    if (chatIndex !== -1) {
      chats[chatIndex].unread = 0;
    }
  }
</script>

<section class="wa-chatlist">
  <header class="wa-chatlist-header">
    <h1 class="wa-wordmark">{appTitle}</h1>
    <div class="wa-header-actions">
      <button class="wa-icon-btn" title="New chat" aria-label="New chat">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </button>
      <button class="wa-icon-btn" title="Menu" aria-label="Menu">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
    </div>
  </header>

  <!-- Search -->
  <div class="wa-search-wrap">
    <div class="wa-search">
      <svg
        class="wa-search-icon"
        viewBox="0 0 24 24"
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
      >
        <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        class="wa-search-input"
        type="text"
        placeholder="Search or start a new chat"
        bind:value={searchQuery}
        aria-label="Search chats"
      />
    </div>
    <button class="wa-icon-btn wa-icon-btn--sm" title="Filter by" aria-label="Filter">
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
      </svg>
    </button>
  </div>

  <!-- Filter pills -->
  <div class="wa-filters" role="tablist">
    {#each filters as f}
      <button
        class="wa-pill {activeFilter === f ? 'wa-pill--active' : ''}"
        role="tab"
        aria-selected={activeFilter === f}
        onclick={() => (activeFilter = f)}>{f}</button
      >
    {/each}
    <button class="wa-pill-add" title="Add filter" aria-label="Add filter">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  </div>

  <!-- Chat rows -->
  <ul class="wa-chats-ul" role="listbox" aria-label="Chats">
    {#each filteredChats as chat (chat.id)}
      {@const isActive = chat.id === activeChat}
      <li
        class="wa-chat-row {isActive ? 'wa-chat-row--active' : ''}"
        role="option"
        aria-selected={isActive}
        tabindex="0"
        onclick={() => setActive(chat.id)}
        onkeydown={e => e.key === "Enter" && setActive(chat.id)}
      >
        <!-- Avatar -->
        <div class="wa-avatar" style={chat.avatar?.color ? `--av-bg:${chat.avatar.color}` : ""}>
          {#if chat.avatar?.src}
            <img src={chat.avatar.src} alt={chat.name} class="wa-avatar-img" />
          {:else}
            <div class="wa-avatar-initials" class:wa-avatar-initials--group={!!chat.avatar?.label}>
              {chat.avatar?.label ?? getInitials(chat.name)}
            </div>
          {/if}
        </div>

        <div class="wa-chat-info">
          <div class="wa-chat-row-top">
            <span class="wa-chat-name">{chat.name}</span>
            <span class="wa-chat-time" class:wa-chat-time--unread={(chat.unread ?? 0) > 0}>{chat.time}</span>
          </div>
          <div class="wa-chat-row-bottom">
            <div class="wa-preview-wrap">
              {#if chat.tick === "double-read"}
                <span class="wa-tick wa-tick--read">✓✓</span>
              {:else if chat.tick === "double"}
                <span class="wa-tick">✓✓</span>
              {:else if chat.tick === "single"}
                <span class="wa-tick">✓</span>
              {/if}
              <span class="wa-chat-preview" class:wa-chat-preview--typing={chat.typing}>{chat.preview}</span>
            </div>
            <div class="wa-chat-badges">
              {#if isActive}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div class="wa-chat-id-badge" title="Click to copy ID" onclick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(chat.isGroup ? chat.id + '@g.us' : chat.id + '@s.whatsapp.net');
                  alert('ID copiado al portapapeles!');
                }}>
                  ID: {chat.isGroup ? chat.id + '@g.us' : chat.id + '@s.whatsapp.net'}
                </div>
              {/if}
              {#if chat.pinned}
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" class="wa-meta-icon">
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                </svg>
              {/if}
              {#if chat.muted}
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" class="wa-meta-icon">
                  <path
                    d="M13 3a1 1 0 0 0-1.707-.707L7 6.586H5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2l4.293 4.293A1 1 0 0 0 13 17V3z"
                  />
                  <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" stroke-width="2" />
                </svg>
              {/if}
              {#if (chat.unread ?? 0) > 0}
                <span class="wa-badge">{chat.unread}</span>
              {/if}
            </div>
          </div>
        </div>
      </li>
    {/each}

    {#if filteredChats.length === 0}
      <li class="wa-empty-state">No chats match "{searchQuery}"</li>
    {/if}
  </ul>
</section>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="wa-resizer" onmousedown={startResize} role="separator" tabindex="0" aria-orientation="vertical"></div>
