

<script lang="ts">
  import { onMount } from "svelte";
  import MsgNav from "./MsgNav.svelte";
  import MsgSidebar from "./MsgSidebar.svelte";
  import MsgChatArea from "./MsgChatArea.svelte";
  import "./MsgWidget.css";
  import { type Chat, type ThemeColors, type SvgIconColors, type Message, DARK_THEME, LIGHT_THEME } from "./MsgWidget";

  // ─────────────────────────────────────────────────────────────
  //  Props
  // ─────────────────────────────────────────────────────────────


  export type MsgWidgetProps = {
    colorMode?: "dark" | "light";
    themeOverrides?: Partial<ThemeColors>;
    iconColors?: Partial<SvgIconColors>;
    chats?: Chat[];
    initialActiveChat?: number;
    initialChatScrollToBottom?: boolean;
    appTitle?: string;
    filters?: string[];
    width?: string;
    height?: string;
    onSendMessage?: (chatId: number, text: string, msgId: number) => void;
    initialSidebarCollapsed?: boolean;
    showChatList?: boolean;
    initialMessageInput?: string;
  };


  let {
    colorMode = $bindable(),
    themeOverrides = {},
    iconColors = {},
    chats: initialChats = [],
    initialActiveChat,
    initialChatScrollToBottom = true,
    appTitle = "Whatsbotcord",
    filters = ["All", "Unread 4", "Favorites 1", "Groups 1"],
    width = "100%",
    height = "100%",
    onSendMessage,
    initialSidebarCollapsed = false,
    showChatList = $bindable(!initialSidebarCollapsed),
    initialMessageInput = "",
  }: MsgWidgetProps = $props();

  // ─────────────────────────────────────────────────────────────
  //  Defaults
  // ─────────────────────────────────────────────────────────────

  // svelte-ignore state_referenced_locally
  let chats = $state(initialChats);

  // ─────────────────────────────────────────────────────────────
  //  Reactive state
  // ─────────────────────────────────────────────────────────────

  // svelte-ignore state_referenced_locally
  let activeChat = $state(initialActiveChat  ?? 1);
  // let searchQuery = $state("");
  // svelte-ignore state_referenced_locally
  // let activeFilter = $state(filters[0] ?? "All");

  let themeObserver: MutationObserver | null = null;

  onMount(() => {
    const syncTheme = () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      if (currentTheme === "light" || currentTheme === "dark") {
        colorMode = currentTheme;
      }
    };

    syncTheme();

    themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

    return () => {
      if (themeObserver) {
        themeObserver.disconnect();
      }
    };
  });

  let theme = $derived({ ...(colorMode === "dark" ? DARK_THEME : LIGHT_THEME), ...themeOverrides });

  let icons = $derived({
    nav: iconColors.nav ?? theme.textMuted,
    navActive: iconColors.navActive ?? theme.accent,
    icon: iconColors.icon ?? theme.textMuted,
    accentIcon: iconColors.accentIcon ?? theme.accent,
  });



  let activeChatData = $derived(chats.find((c: Chat) => c.id === activeChat));

  // External listeners array
  let sendMessageListeners: Array<(chatId: number, text: string, msgId: number) => void> = [];
  
  export function onExternalSendMessage(listener: (chatId: number, text: string, msgId: number) => void) {
    sendMessageListeners.push(listener);
    return () => {
      sendMessageListeners = sendMessageListeners.filter(l => l !== listener);
    };
  }

  export function clearExternalSendListeners() {
    sendMessageListeners = [];
  }

  export function addReaction(chatId: number, messageId: number, emoji: string) {
    console.log(`addReaction called for chat ${chatId}, msg ${messageId}:`, emoji);
    const chatIndex = chats.findIndex((c: Chat) => c.id === chatId);
    if (chatIndex !== -1 && chats[chatIndex].messages) {
      const msgIndex = chats[chatIndex].messages.findIndex((m: Message) => m.id === messageId);
      if (msgIndex !== -1) {
        if (!chats[chatIndex].messages[msgIndex].reactions) {
          chats[chatIndex].messages[msgIndex].reactions = [];
        }
        chats[chatIndex].messages[msgIndex].reactions.push(emoji);
        chats = [...chats];
      }
    }
  }

  export function pushExternalMessage(chatId: number, message: Message) {
    console.log(`pushExternalMessage called for chat ${chatId}:`, message);
    const chatIndex = chats.findIndex((c: Chat) => c.id === chatId);
    if (chatIndex !== -1) {
      if (!chats[chatIndex].messages) chats[chatIndex].messages = [];
      chats[chatIndex].messages.push(message);
      
      // Update preview and time
      const previewText = message.text || message.stickerEmoji || "Media message";
      chats[chatIndex].preview = previewText;
      chats[chatIndex].time = message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Increment unread if not active
      if (activeChat !== chatId) {
        chats[chatIndex].unread = (chats[chatIndex].unread || 0) + 1;
      }
      
      chats = [...chats];
    } else {
      console.warn(`Chat ${chatId} not found in pushExternalMessage!`);
    }
  }

  export function getChats() {
    return chats;
  }

  export function setChatActivity(chatId: number, activity: "typing" | "recording" | "idle") {
    const chatIndex = chats.findIndex((c: Chat) => c.id === chatId);
    if (chatIndex !== -1) {
      if (activity === "typing") {
        chats[chatIndex].typing = true;
        chats[chatIndex].subtitle = "typing...";
      } else if (activity === "recording") {
        chats[chatIndex].typing = true;
        chats[chatIndex].subtitle = "recording audio...";
      } else {
        chats[chatIndex].typing = false;
        chats[chatIndex].subtitle = chats[chatIndex].isGroup ? "15 participants" : "online";
      }
      chats = [...chats];
    }
  }

  let containerRef: HTMLElement | undefined = $state(undefined);
  let sidebarWidth = $state(250);
  let isResizing = $state(false);



  function startResize(e: MouseEvent) {
    isResizing = true;
    document.body.style.cursor = "col-resize";
    window.addEventListener("mousemove", handleResize);
    window.addEventListener("mouseup", stopResize);
  }

  function handleResize(e: MouseEvent) {
    if (!isResizing || !containerRef) return;
    const rect = containerRef.getBoundingClientRect();
    let newWidth = e.clientX - rect.left - 72;
    if (newWidth < 150) {
      showChatList = false;
      stopResize();
      return;
    }
    if (newWidth < 250) newWidth = 250;
    if (newWidth > 600) newWidth = 600;
    sidebarWidth = newWidth;
  }

  function stopResize() {
    isResizing = false;
    document.body.style.cursor = "";
    window.removeEventListener("mousemove", handleResize);
    window.removeEventListener("mouseup", stopResize);
  }



  function handleSendMessage(text: string) {
    if (activeChat) {
      const chatIndex = chats.findIndex((c: Chat) => c.id === activeChat);
      if (chatIndex !== -1) {
        const newMsg: Message = {
          id: Date.now() + Math.random(),
          type: "outgoing",
          text: text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tick: "single"
        };
        
        if (!chats[chatIndex].messages) {
          chats[chatIndex].messages = [];
        }
        chats[chatIndex].messages.push(newMsg);
        chats[chatIndex].preview = newMsg.text || "Media message";
        chats[chatIndex].time = newMsg.time!;
        chats = [...chats];

        if (onSendMessage) {
          onSendMessage(activeChat, text, newMsg.id);
        }
        
        console.log(`Sending message: ${text} to chat ${activeChat}. Listeners count: ${sendMessageListeners.length}`);
        
        // Notify external listeners
        sendMessageListeners.forEach(listener => listener(activeChat, text, newMsg.id));
      }
    }
  }

  function handleClearChat(chatId: number) {
    const chatIndex = chats.findIndex((c: Chat) => c.id === chatId);
    if (chatIndex !== -1) {
      if (chats[chatIndex].messages) {
        chats[chatIndex].messages = chats[chatIndex].messages.filter(
          (m: Message) => m.type === "system" || m.type === "date-divider"
        );
      }
      chats[chatIndex].preview = "Say something to the bot!";
      chats = [...chats];
    }
  }

  import { getInitials } from "./MsgWidget";

  // CSS custom properties object → inline style string for the root container
  let cssVars = $derived(
    Object.entries({
      "--wa-app-bg": theme.appBg,
      "--wa-panel-bg": theme.panelBg,
      "--wa-chat-bg": theme.chatBg,
      "--wa-input-bg": theme.inputBg,
      "--wa-bubble-in": theme.bubbleIn,
      "--wa-bubble-out": theme.bubbleOut,
      "--wa-bubble-hl": theme.bubbleHighlight,
      "--wa-sticker-bg": theme.stickerBg,
      "--wa-date-bg": theme.dateBg,
      "--wa-text": theme.textPrimary,
      "--wa-muted": theme.textMuted,
      "--wa-typing": theme.textTyping,
      "--wa-sender": theme.senderNameColor,
      "--wa-border": theme.border,
      "--wa-accent": theme.accent,
      "--wa-accent-text": theme.accentText,
      "--wa-tick-read": theme.tickRead,
      "--wa-badge-bg": theme.unreadBadgeBg,
      "--wa-badge-text": theme.unreadBadgeText,
      "--wa-avatar-bg": theme.avatarBg,
      "--wa-avatar-text": theme.avatarText,
      "--wa-group-avatar-bg": theme.groupAvatarBg,
      "--wa-scroll": theme.scrollThumb,
      "--wa-icon": icons.icon,
      "--wa-icon-active": icons.navActive,
    })
      .map(([k, v]) => `${k}:${v}`)
      .join(";")
  );
</script>

<!-- ─────────────────────────────────────────────────────────────
     Template
───────────────────────────────────────────────────────────── -->
<article
  class="wa-container {showChatList ? '' : 'wa-container--collapsed'}"
  style="{cssVars}; --sidebar-width: {sidebarWidth}px; width: {width}; height: {height};"
  bind:this={containerRef}
>
  <!-- ── Col 1: Icon nav ── -->
  <MsgNav bind:showChatList />

  <!-- ── Col 2: Chat list ── -->
  {#if showChatList}
    <MsgSidebar {chats} {appTitle} bind:activeChat {startResize} />
  {/if}

  <!-- ── Col 3: Main chat ── -->
  <MsgChatArea {activeChatData} onSendMessage={handleSendMessage} onClearChat={handleClearChat} {initialChatScrollToBottom} {initialMessageInput} />
</article>


