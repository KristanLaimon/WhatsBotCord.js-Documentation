<script lang="ts">
  let { showChatList = $bindable() }: { showChatList: boolean } = $props();

  function toggleChatList() {
    showChatList = !showChatList;
  }
</script>

<aside class="wa-nav">
  <div class="wa-nav-top">
    <div class="wa-avatar wa-avatar--self">
      <div class="wa-avatar-initials">Me</div>
    </div>
  </div>

  <nav class="wa-nav-icons">
    <!-- Chats -->
    <button
      class="wa-nav-btn {showChatList ? 'wa-nav-btn--active' : ''}"
      title="Chats"
      aria-label="Chats"
      onclick={toggleChatList}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
    <!-- Status -->
    <button class="wa-nav-btn" title="Status" aria-label="Status">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  </nav>

  <div class="wa-nav-bottom">
    <!-- Settings -->
    <button class="wa-nav-btn" title="Settings" aria-label="Settings">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="12" cy="12" r="3" />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0
        15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0
        8.6 15a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0
        4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0
        9 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0
        15.4 9a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06A1.65 1.65 0 0 0 19.4 15z"
        />
      </svg>
    </button>
  </div>
</aside>
