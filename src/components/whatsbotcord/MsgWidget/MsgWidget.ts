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
  setChatActivity?: (chatId: number, activity: "typing" | "recording" | "idle") => void;
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
