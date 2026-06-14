export type TickStyle = "none" | "single" | "double" | "double-read";

export interface ChatAvatar {
  /** URL to an image. Takes priority over initials/label. */
  src?: string;
  /** Short text shown when no src (e.g. "KL", "JD"). Auto-generated from name if omitted. */
  label?: string;
  /** Background colour for the avatar circle. Defaults to theme avatarBg. */
  color?: string;
}

export interface Chat {
  id: number;
  name: string;
  /** Last message preview shown in the list */
  preview: string;
  /** Time label shown in the list (e.g. "8:41 AM", "Yesterday") */
  time: string;
  avatar?: ChatAvatar;
  /** Members subtitle shown in chat header when this chat is active */
  subtitle?: string;
  pinned?: boolean;
  muted?: boolean;
  typing?: boolean;
  tick?: TickStyle;
  unread?: number;
  /** Messages belonging to this chat */
  messages?: Message[];
  /** Pinned message shown in banner when chat is active */
  pinnedMessage?: { sender: string; text: string };
  /** Indicates if the bot is present in this chat */
  IsWhatsbotCordHere?: boolean;
  /** Indicates if this chat is a group chat */
  isGroup?: boolean;
  /** Indicates if this is the unique private chat with the bot */
  IsUniquePrivateChatWithBot?: boolean;
}

export interface IMsgWidget {
  getChats: () => Chat[];
  onExternalSendMessage: (listener: (chatId: number, text: string, msgId: number) => void) => () => void;
  clearExternalSendListeners: () => void;
  pushExternalMessage: (chatId: number, message: Message) => void;
  addReaction: (chatId: number, messageId: number, emoji: string) => void;
}

export type MessageType = "incoming" | "outgoing" | "system" | "date-divider";

export interface Message {
  id: number;
  type: MessageType;
  sender?: string;
  /** Colour for the sender name label (overrides theme senderNameColor) */
  senderColor?: string;
  text?: string;
  time?: string;
  highlight?: boolean;
  /** URL to an image rendered inside the bubble */
  imageSrc?: string;
  /** URL to a sticker image. Falls back to stickerEmoji if not provided. */
  stickerSrc?: string;
  /** Emoji rendered as a large sticker when stickerSrc is absent */
  stickerEmoji?: string;
  /** Caption rendered below a sticker image/emoji */
  stickerLabel?: string;
  /** Avatar image URL for the message sender thumbnail */
  avatarSrc?: string;
  tick?: TickStyle;
  videoSrc?: string;
  audioSrc?: string;
  documentSrc?: string;
  documentName?: string;
  pollTitle?: string;
  pollOptions?: string[];
  location?: { lat: number; lng: number; name?: string; address?: string };
  contacts?: Array<{ name: string; phone: string }>;
  reactions?: string[];
}

export interface ThemeColors {
  // Backgrounds
  appBg: string;
  panelBg: string;
  chatBg: string;
  inputBg: string;
  bubbleIn: string;
  bubbleOut: string;
  bubbleHighlight: string;
  stickerBg: string;
  dateBg: string;
  // Text
  textPrimary: string;
  textMuted: string;
  textTyping: string;
  senderNameColor: string;
  // Borders & accents
  border: string;
  accent: string;
  accentText: string;
  tickRead: string;
  unreadBadgeBg: string;
  unreadBadgeText: string;
  // Avatar fallback
  avatarBg: string;
  avatarText: string;
  groupAvatarBg: string;
  // Scrollbar
  scrollThumb: string;
}

export interface SvgIconColors {
  nav: string;
  navActive: string;
  icon: string;
  accentIcon: string;
}

// ─────────────────────────────────────────────────────────────
//  Built-in Themes
// ─────────────────────────────────────────────────────────────

export const DARK_THEME: ThemeColors = {
  appBg:             "#111b21",
  panelBg:           "#202c33",
  chatBg:            "#0b141a",
  inputBg:           "#2a3942",
  bubbleIn:          "#202c33",
  bubbleOut:         "#005c4b",
  bubbleHighlight:   "#1f2e36",
  stickerBg:         "#1a272f",
  dateBg:            "#182229",
  textPrimary:       "#e9edef",
  textMuted:         "#8696a0",
  textTyping:        "#00a884",
  senderNameColor:   "#53bdeb",
  border:            "#2a3942",
  accent:            "#00a884",
  accentText:        "#111b21",
  tickRead:          "#53bdeb",
  unreadBadgeBg:     "#00a884",
  unreadBadgeText:   "#111b21",
  avatarBg:          "#6b7c87",
  avatarText:        "#ffffff",
  groupAvatarBg:     "#2a6b4a",
  scrollThumb:       "#3b4a54",
};

export const LIGHT_THEME: ThemeColors = {
  appBg:             "#f0f2f5",
  panelBg:           "#ffffff",
  chatBg:            "#efeae2",
  inputBg:           "#f0f2f5",
  bubbleIn:          "#ffffff",
  bubbleOut:         "#d9fdd3",
  bubbleHighlight:   "#e7f8ee",
  stickerBg:         "#d4e8d9",
  dateBg:            "#ffffff",
  textPrimary:       "#111b21",
  textMuted:         "#667781",
  textTyping:        "#00a884",
  senderNameColor:   "#06a7e0",
  border:            "#e9edef",
  accent:            "#00a884",
  accentText:        "#ffffff",
  tickRead:          "#53bdeb",
  unreadBadgeBg:     "#00a884",
  unreadBadgeText:   "#ffffff",
  avatarBg:          "#b7bec3",
  avatarText:        "#ffffff",
  groupAvatarBg:     "#43a57c",
  scrollThumb:       "#c4ccd0",
};

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return (
    name
      .replace(/[^\w\s]/gi, "")
      .trim()
      .split(/\s+/)
      .map(w => w[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

// ─────────────────────────────────────────────────────────────
//  Defaults
// ─────────────────────────────────────────────────────────────

export const DEFAULT_CHATS: Chat[] = [
  {
    id: 1,
    name: "Notes | Docs n' Images 🦊",
    preview: "📷 Photo",
    time: "Yesterday",
    pinned: true,
    isGroup: false,
    tick: "double",
    unread: 0,
    messages: [
      { id: 1, type: "date-divider", text: "Yesterday" },
      { id: 2, type: "outgoing", text: "Hey, sending the new screenshots 📷", time: "3:12 PM", tick: "double-read" },
      { id: 3, type: "incoming", sender: "Notes Bot", text: "Got them! Saved to /docs/screenshots.", time: "3:13 PM" },
      { id: 4, type: "date-divider", text: "Today" },
      { id: 5, type: "incoming", sender: "Notes Bot", text: "Check this out too.", time: "10:00 AM" },
      { id: 6, type: "outgoing", text: "Nice!", time: "10:01 AM", tick: "double-read" },
      { id: 7, type: "incoming", sender: "Notes Bot", text: "More updates coming.", time: "10:02 AM" },
      { id: 8, type: "outgoing", text: "Okay, I am ready.", time: "10:03 AM", tick: "double-read" },
      { id: 9, type: "incoming", sender: "Notes Bot", text: "Update 1: added feature X", time: "10:04 AM" },
      { id: 10, type: "incoming", sender: "Notes Bot", text: "Update 2: fixed bug Y", time: "10:05 AM" },
      { id: 11, type: "outgoing", text: "Awesome.", time: "10:06 AM", tick: "double-read" },
      { id: 12, type: "incoming", sender: "Notes Bot", text: "Update 3: removed old code", time: "10:07 AM" },
      { id: 13, type: "incoming", sender: "Notes Bot", text: "Update 4: added tests", time: "10:08 AM" },
      { id: 14, type: "outgoing", text: "Good job.", time: "10:09 AM", tick: "double-read" },
      { id: 15, type: "incoming", sender: "Notes Bot", text: "Update 5: pushed to master", time: "10:10 AM" },
      { id: 16, type: "incoming", sender: "Notes Bot", text: "Update 6: deployed", time: "10:11 AM" },
      { id: 17, type: "outgoing", text: "I'll check the live site.", time: "10:12 AM", tick: "double-read" },
      { id: 18, type: "incoming", sender: "Notes Bot", text: "Let me know if it works.", time: "10:13 AM" },
      { id: 19, type: "incoming", sender: "Notes Bot", text: "Wait, I found another bug.", time: "10:14 AM" },
      { id: 20, type: "outgoing", text: "Oh no.", time: "10:15 AM", tick: "double-read" },
      { id: 21, type: "incoming", sender: "Notes Bot", text: "Never mind, false alarm.", time: "10:16 AM" },
      { id: 22, type: "outgoing", text: "Phew.", time: "10:17 AM", tick: "double-read" },
    ],
  },
  {
    id: 2,
    name: "Lalo Carry",
    preview: "typing...",
    time: "8:41 AM",
    typing: true,
    isGroup: false,
    unread: 0,
    messages: [
      { id: 1, type: "date-divider", text: "Today" },
      { id: 2, type: "incoming", sender: "Lalo", text: "bro waiting on you", time: "8:39 AM" },
      { id: 3, type: "incoming", sender: "Lalo", text: "...", time: "8:41 AM" },
    ],
  },
  {
    id: 3,
    name: "Caleb 😮 (El Que Tiene 12)",
    preview: "🎭 Sticker",
    time: "8:14 AM",
    isGroup: false,
    unread: 0,
    messages: [
      { id: 1, type: "date-divider", text: "Today" },
      { id: 2, type: "incoming", sender: "Caleb", stickerEmoji: "😮", time: "8:14 AM" },
    ],
  },
  {
    id: 4,
    name: "Jonathan",
    preview: "🎭 Sticker",
    time: "8:08 AM",
    tick: "double-read",
    isGroup: false,
    unread: 0,
    messages: [
      { id: 1, type: "date-divider", text: "Today" },
      { id: 2, type: "outgoing", stickerEmoji: "🤙", time: "8:08 AM", tick: "double-read" },
    ],
  },
  {
    id: 5,
    name: "Papá",
    preview: "https://play.google.com/store/apps/deta...",
    time: "7:28 AM",
    tick: "single",
    isGroup: false,
    unread: 0,
    messages: [
      { id: 1, type: "date-divider", text: "Today" },
      { id: 2, type: "outgoing", text: "https://play.google.com/store/apps/details?id=com.example", time: "7:28 AM", tick: "single" },
    ],
  },
  {
    id: 6,
    name: "KL - Chat Principal 🌐",
    preview: "Starfield (Gamex 2): 🎭 Sticker",
    time: "6:59 AM",
    muted: true,
    isGroup: true,
    avatar: { label: "KL", color: "#2a6b4a" },
    subtitle: "Jersito, ☁️ KL Uber, KL, KL, ...",
    unread: 0,
    pinnedMessage: {
      sender: "KL Lenon",
      text: "Así que tienes que sacar top 1 mínimo 2 temporadas",
    },
    messages: [
      { id: 1, type: "system", text: "Dnd bb", time: "10:50 PM" },
      {
        id: 2,
        type: "incoming",
        sender: "KL Julián 🦎",
        text: "Huele a esmegma\nPobre sakura hoy comió pura verga",
        time: "11:29 PM",
        highlight: true,
      },
      { id: 3, type: "date-divider", text: "Today" },
      { id: 4, type: "incoming", sender: "KL Lenon", stickerEmoji: "🐺", time: "5:22 AM" },
      {
        id: 5,
        type: "incoming",
        sender: "Starfield (Gamex 2)",
        stickerEmoji: "🤓",
        stickerLabel: "Campendejo lover",
        time: "6:59 AM",
      },
    ],
  },
  {
    id: 7,
    name: "Kings Of Logic",
    preview: "Starfield (Gamex 2) replied to an announce",
    time: "6:58 AM",
    isGroup: true,
    avatar: { label: "KL", color: "#2a6b4a" },
    unread: 9,
    messages: [
      { id: 1, type: "date-divider", text: "Today" },
      { id: 2, type: "incoming", sender: "Starfield (Gamex 2)", text: "replied to an announcement", time: "6:58 AM" },
    ],
  },
  {
    id: 8,
    name: "Segurólogos/Auditólogos Yuen...",
    preview: "No pasa nada",
    time: "Yesterday",
    tick: "double",
    isGroup: true,
    unread: 0,
    messages: [
      { id: 1, type: "date-divider", text: "Yesterday" },
      { id: 2, type: "outgoing", text: "No pasa nada", time: "6:10 PM", tick: "double" },
    ],
  },
  {
    id: 9,
    name: "Bot User (Individual)",
    preview: "Say something to the bot!",
    time: "Now",
    unread: 0,
    IsWhatsbotCordHere: true,
    isGroup: false,
    messages: [
      { id: 1, type: "date-divider", text: "Today" },
      { id: 2, type: "system", text: "This is a private chat with the bot." },
    ],
  },
  {
    id: 10,
    name: "Bot Test Group",
    preview: "Say something to the bot!",
    time: "Now",
    avatar: { label: "BG", color: "#43a57c" },
    unread: 0,
    IsWhatsbotCordHere: true,
    isGroup: true,
    messages: [
      { id: 1, type: "date-divider", text: "Today" },
      { id: 2, type: "system", text: "This is a group chat where the bot is a member." },
    ],
  },
];
