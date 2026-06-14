<script lang="ts">
  import { getInitials, type Chat } from "./MsgWidget";

  let { activeChatData, onSendMessage }: {
    activeChatData?: Chat;
    onSendMessage: (text: string) => void;
  } = $props();

  let messageInput = $state("");

  function handleInputKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (messageInput.trim()) {
        onSendMessage(messageInput);
        messageInput = "";
      }
    }
  }
</script>

<section class="wa-chat" aria-live="polite">
  {#if activeChatData}
    <!-- Header -->
    <header class="wa-chat-header">
      <div
        class="wa-avatar wa-avatar--sm"
        style={activeChatData.avatar?.color ? `--av-bg:${activeChatData.avatar.color}` : ""}
      >
        {#if activeChatData.avatar?.src}
          <img src={activeChatData.avatar.src} alt={activeChatData.name} class="wa-avatar-img" />
        {:else}
          <div class="wa-avatar-initials" class:wa-avatar-initials--group={!!activeChatData.avatar?.label}>
            {activeChatData.avatar?.label ?? getInitials(activeChatData.name)}
          </div>
        {/if}
      </div>
      <div class="wa-chat-header-info">
        <p class="wa-chat-header-name">{activeChatData.name}</p>
        {#if activeChatData.subtitle}
          <p class="wa-chat-header-sub">{activeChatData.subtitle}</p>
        {/if}
      </div>
      <div class="wa-chat-header-actions">
        <button class="wa-icon-btn" title="Video call" aria-label="Video call">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8">
            <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </button>
        <button class="wa-icon-btn" title="Search" aria-label="Search in chat">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
        <button class="wa-icon-btn" title="Menu" aria-label="Chat menu">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Pinned message banner -->
    {#if activeChatData.pinnedMessage}
      <div class="wa-pinned-banner" role="note">
        <div class="wa-pinned-line"></div>
        <div class="wa-pinned-content">
          <span class="wa-pinned-sender">{activeChatData.pinnedMessage.sender}</span>
          <span class="wa-pinned-text">{activeChatData.pinnedMessage.text}</span>
        </div>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" class="wa-meta-icon">
          <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
        </svg>
      </div>
    {/if}

    <!-- Messages -->
    <div class="wa-messages">
      {#each activeChatData.messages ?? [] as msg (msg.id)}
        {#if msg.type === "date-divider"}
          <div class="wa-date-divider"><span>{msg.text}</span></div>
        {:else if msg.type === "system"}
          <div class="wa-system-msg">{msg.text} <span class="wa-msg-time-inline">{msg.time ?? ""}</span></div>
        {:else if msg.type === "incoming"}
          <div class="wa-msg-row wa-msg-row--in">
            <!-- Sender mini-avatar -->
            <div class="wa-msg-av">
              {#if msg.avatarSrc}
                <img src={msg.avatarSrc} alt={msg.sender ?? ""} class="wa-msg-av-img" />
              {:else}
                {getInitials(msg.sender ?? "?")}
              {/if}
            </div>

            {#if msg.stickerEmoji || msg.stickerSrc}
              <!-- Sticker -->
              <div class="wa-sticker-col">
                <span class="wa-sender-name" style={msg.senderColor ? `color:${msg.senderColor}` : ""}
                  >{msg.sender}</span
                >
                <div class="wa-sticker">
                  {#if msg.stickerSrc}
                    <img src={msg.stickerSrc} alt="sticker" class="wa-sticker-img" />
                  {:else}
                    <div class="wa-sticker-emoji" class:wa-sticker-emoji--labeled={!!msg.stickerLabel}>
                      {msg.stickerEmoji}
                    </div>
                  {/if}
                  {#if msg.stickerLabel}
                    <span class="wa-sticker-label">{msg.stickerLabel}</span>
                  {/if}
                </div>
                <span class="wa-msg-time wa-msg-time--below">{msg.time ?? ""}</span>
              </div>
            {:else}
              <!-- Text / image bubble -->
              <div class="wa-bubble wa-bubble--in" class:wa-bubble--hl={msg.highlight} style="position: relative;">
                <span class="wa-sender-name" style={msg.senderColor ? `color:${msg.senderColor}` : ""}
                  >{msg.sender}</span
                >
                {#if msg.imageSrc}
                  <img src={msg.imageSrc} alt="shared" class="wa-bubble-img" />
                {/if}
                {#if msg.videoSrc}
                  <!-- svelte-ignore a11y_media_has_caption -->
                  <video src={msg.videoSrc} controls class="wa-bubble-video" style="max-width: 100%; border-radius: 8px;"></video>
                {/if}
                {#if msg.audioSrc}
                  <audio src={msg.audioSrc} controls class="wa-bubble-audio" style="max-width: 100%;"></audio>
                {/if}
                {#if msg.documentSrc}
                  <div class="wa-bubble-document" style="display: flex; align-items: center; background: rgba(0,0,0,0.05); padding: 8px; border-radius: 6px; margin-bottom: 4px;">
                    <span style="font-size: 24px; margin-right: 8px;">📄</span>
                    <a href={msg.documentSrc} target="_blank" style="text-decoration: none; color: inherit; font-weight: 500;">{msg.documentName || "Document"}</a>
                  </div>
                {/if}
                {#if msg.pollTitle}
                  <div class="wa-bubble-poll" style="background: rgba(0,0,0,0.05); padding: 10px; border-radius: 6px; margin-bottom: 4px;">
                    <strong style="display: block; margin-bottom: 8px;">📊 {msg.pollTitle}</strong>
                    {#each msg.pollOptions || [] as option}
                      <div style="padding: 6px; border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 4px; background: white; cursor: pointer;">
                        {option}
                      </div>
                    {/each}
                  </div>
                {/if}
                {#if msg.location}
                  <div class="wa-bubble-location" style="margin-bottom: 4px;">
                    <div style="background: #e0e0e0; height: 120px; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
                      📍 Map View
                    </div>
                    {#if msg.location.name}<strong>{msg.location.name}</strong><br/>{/if}
                    <small>{msg.location.lat}, {msg.location.lng}</small>
                  </div>
                {/if}
                {#if msg.contacts}
                  <div class="wa-bubble-contacts" style="margin-bottom: 4px;">
                    {#each msg.contacts as contact}
                      <div style="display: flex; align-items: center; padding: 6px; border-bottom: 1px solid rgba(0,0,0,0.05);">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: #ccc; margin-right: 8px; display: flex; align-items: center; justify-content: center;">👤</div>
                        <div>
                          <strong>{contact.name}</strong><br/>
                          <small>{contact.phone}</small>
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
                {#if msg.text}
                  <p class="wa-bubble-text">{msg.text}</p>
                {/if}
                <span class="wa-msg-time">{msg.time ?? ""}</span>
                {#if msg.reactions && msg.reactions.length > 0}
                  <div class="wa-msg-reactions" style="position: absolute; bottom: -8px; right: 8px; background: var(--wa-panel-bg, #1f2c34); border-radius: 12px; padding: 2px 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.3); display: flex; gap: 2px; font-size: 12px; z-index: 10;">
                    {#each msg.reactions as reaction}
                      <span>{reaction}</span>
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {:else if msg.type === "outgoing"}
          <div class="wa-msg-row wa-msg-row--out">
            {#if msg.stickerEmoji || msg.stickerSrc}
              <div class="wa-sticker-col wa-sticker-col--out">
                <div class="wa-sticker">
                  {#if msg.stickerSrc}
                    <img src={msg.stickerSrc} alt="sticker" class="wa-sticker-img" />
                  {:else}
                    <div class="wa-sticker-emoji" class:wa-sticker-emoji--labeled={!!msg.stickerLabel}>
                      {msg.stickerEmoji}
                    </div>
                  {/if}
                  {#if msg.stickerLabel}
                    <span class="wa-sticker-label">{msg.stickerLabel}</span>
                  {/if}
                </div>
                <span class="wa-msg-time wa-msg-time--below wa-msg-time--out"
                  >{msg.time ?? ""}
                  {#if msg.tick === "double-read"}<span class="wa-tick wa-tick--read">✓✓</span>
                  {:else if msg.tick === "double"}<span class="wa-tick">✓✓</span>
                  {:else if msg.tick === "single"}<span class="wa-tick">✓</span>{/if}
                </span>
              </div>
            {:else}
              <div class="wa-bubble wa-bubble--out" style="position: relative;">
                {#if msg.imageSrc}
                  <img src={msg.imageSrc} alt="shared" class="wa-bubble-img" />
                {/if}
                {#if msg.videoSrc}
                  <!-- svelte-ignore a11y_media_has_caption -->
                  <video src={msg.videoSrc} controls class="wa-bubble-video" style="max-width: 100%; border-radius: 8px;"></video>
                {/if}
                {#if msg.audioSrc}
                  <audio src={msg.audioSrc} controls class="wa-bubble-audio" style="max-width: 100%;"></audio>
                {/if}
                {#if msg.documentSrc}
                  <div class="wa-bubble-document" style="display: flex; align-items: center; background: rgba(0,0,0,0.05); padding: 8px; border-radius: 6px; margin-bottom: 4px;">
                    <span style="font-size: 24px; margin-right: 8px;">📄</span>
                    <a href={msg.documentSrc} target="_blank" style="text-decoration: none; color: inherit; font-weight: 500;">{msg.documentName || "Document"}</a>
                  </div>
                {/if}
                {#if msg.pollTitle}
                  <div class="wa-bubble-poll" style="background: rgba(0,0,0,0.05); padding: 10px; border-radius: 6px; margin-bottom: 4px;">
                    <strong style="display: block; margin-bottom: 8px;">📊 {msg.pollTitle}</strong>
                    {#each msg.pollOptions || [] as option}
                      <div style="padding: 6px; border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 4px; background: white; color: black; cursor: pointer;">
                        {option}
                      </div>
                    {/each}
                  </div>
                {/if}
                {#if msg.location}
                  <div class="wa-bubble-location" style="margin-bottom: 4px;">
                    <div style="background: #e0e0e0; height: 120px; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
                      📍 Map View
                    </div>
                    {#if msg.location.name}<strong>{msg.location.name}</strong><br/>{/if}
                    <small>{msg.location.lat}, {msg.location.lng}</small>
                  </div>
                {/if}
                {#if msg.contacts}
                  <div class="wa-bubble-contacts" style="margin-bottom: 4px;">
                    {#each msg.contacts as contact}
                      <div style="display: flex; align-items: center; padding: 6px; border-bottom: 1px solid rgba(0,0,0,0.05);">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: #ccc; margin-right: 8px; display: flex; align-items: center; justify-content: center;">👤</div>
                        <div>
                          <strong>{contact.name}</strong><br/>
                          <small>{contact.phone}</small>
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
                {#if msg.text}
                  <p class="wa-bubble-text">{msg.text}</p>
                {/if}
                <span class="wa-msg-time">
                  {msg.time ?? ""}
                  {#if msg.tick === "double-read"}<span class="wa-tick wa-tick--read">✓✓</span>
                  {:else if msg.tick === "double"}<span class="wa-tick">✓✓</span>
                  {:else if msg.tick === "single"}<span class="wa-tick">✓</span>{/if}
                </span>
                {#if msg.reactions && msg.reactions.length > 0}
                  <div class="wa-msg-reactions" style="position: absolute; bottom: -8px; right: 8px; background: var(--wa-panel-bg, #1f2c34); border-radius: 12px; padding: 2px 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.3); display: flex; gap: 2px; font-size: 12px; z-index: 10;">
                    {#each msg.reactions as reaction}
                      <span>{reaction}</span>
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    </div>

    <!-- Input bar -->
    <footer class="wa-input-bar">
      <button class="wa-icon-btn" title="Emoji" aria-label="Emoji">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" stroke-width="3" stroke-linecap="round" />
          <line x1="15" y1="9" x2="15.01" y2="9" stroke-width="3" stroke-linecap="round" />
        </svg>
      </button>
      <button class="wa-icon-btn" title="Attach" aria-label="Attach file">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7">
          <path
            d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.42 16.41a2 2 0 0 1-2.83-2.83l8.49-8.48"
          />
        </svg>
      </button>
      <input class="wa-text-input" type="text" placeholder="Type a message" aria-label="Message input" bind:value={messageInput} onkeydown={handleInputKeydown} />
      <button class="wa-icon-btn" title="Voice message" aria-label="Voice message">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>
    </footer>
  {:else}
    <div class="wa-empty-chat">Select a chat to start messaging</div>
  {/if}
</section>
