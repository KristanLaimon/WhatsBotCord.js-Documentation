import type {
  IWhatsSocketVendorClient,
  WhatsappGroupMetadata,
  WhatsappMessage,
} from "../../lib/whatsbotcord-browser-lib.js";

import type { IMsgWidget } from "../../MsgWidget/MsgWidget.js";

// @ts-ignore
import type { IWhatsappAdapter } from "../../lib/whatsbotcord-browser-lib.js";

type CallbackFunction = (...args: any[]) => void;

export class WhatsSocketMockClient implements IWhatsSocketVendorClient {
  public ownJID = "bot@s.whatsapp.net";
  private listeners: Record<string, CallbackFunction[]> = {};
  private msgWidget: IMsgWidget;

  constructor(msgWidget: IMsgWidget) {
    this.msgWidget = msgWidget;
  }

  public on(eventName: string, callback: CallbackFunction): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  // Method to simulate receiving a message from the widget
  public _simulateIncomingMessage(msg: WhatsappMessage) {
    const callbacks = this.listeners["IncomingMessagesReceived"];
    if (callbacks) {
      callbacks.forEach(cb =>
        cb({
          messages: [msg],
          type: "notify",
        })
      );
    }
  }

  public normalizeJid(jid: string): string {
    return jid;
  }

  public getBotJid(): string {
    return this.ownJID;
  }

  public async sendMessage(chatId_JID: string, content: any, options?: any): Promise<WhatsappMessage | null> {
    if (!chatId_JID) {
      console.error("MsgWidgetAdapter.sendMessage called with falsy chatId_JID!", chatId_JID);
      return null;
    }

    const newMsgId = Date.now() + Math.random();

    // Check if it's a reaction
    if (typeof content === "object" && content && content.react) {
      const chatIdNum = parseInt(chatId_JID.split("@")[0]);
      const reactedMsgId = parseFloat(content.react.key.id);
      if (!isNaN(chatIdNum) && !isNaN(reactedMsgId)) {
        if (this.msgWidget && this.msgWidget.addReaction) {
          this.msgWidget.addReaction(chatIdNum, reactedMsgId, content.react.text);
        }
      }
      return {
        key: { remoteJid: chatId_JID, fromMe: true, id: newMsgId.toString() },
        message: content,
        messageTimestamp: Math.floor(Date.now() / 1000),
      } as WhatsappMessage;
    }

    // Directly push message to the UI widget
    if (this.msgWidget) {
      let text: string | undefined = undefined;
      let imageSrc: string | undefined = undefined;
      let videoSrc: string | undefined = undefined;
      let audioSrc: string | undefined = undefined;
      let documentSrc: string | undefined = undefined;
      let documentName: string | undefined = undefined;
      let stickerSrc: string | undefined = undefined;
      let pollTitle: string | undefined = undefined;
      let pollOptions: string[] | undefined = undefined;
      let location: any = undefined;
      let contacts: any = undefined;

      if (typeof content === "object" && content) {
        if ("text" in content) text = content.text;

        if ("image" in content) {
          imageSrc = content.image?.url || "/mock-multimedia/images/fox_vertical.jpg";
          if (content.caption) text = content.caption;
        }

        if ("video" in content) {
          videoSrc = content.video?.url || "/mock-multimedia/videos/buck-bunny.mp4";
          if (content.caption) text = content.caption;
        }

        if ("audio" in content) {
          audioSrc = content.audio?.url || "/mock-multimedia/videos/buck-bunny.mp4"; // Fallback to something
        }

        if ("document" in content) {
          documentSrc = content.document?.url || "/mock-multimedia/pdfs/pdf-sample.pdf";
          documentName = content.fileName || "document.pdf";
        }

        if ("sticker" in content) {
          stickerSrc = content.sticker?.url || "/mock-multimedia/gifs/eyes-anime.gif";
        }

        if ("poll" in content) {
          pollTitle = content.poll?.name;
          pollOptions = content.poll?.values;
        }

        if ("location" in content) {
          location = content.location;
        }

        if ("contacts" in content) {
          // just a rough mock
          contacts = content.contacts?.contacts?.map((c: any) => ({
            name: c.displayName || "Contact",
            phone: "1234567890",
          }));
        }
      } else if (typeof content === "string") {
        text = content;
      }

      if (
        !text &&
        !imageSrc &&
        !videoSrc &&
        !audioSrc &&
        !documentSrc &&
        !stickerSrc &&
        !pollTitle &&
        !location &&
        !contacts
      ) {
        text = "Unsupported message format in Mock Adapter";
      }

      const chatIdNum = parseInt(chatId_JID.split("@")[0]);
      if (!isNaN(chatIdNum)) {
        this.msgWidget.pushExternalMessage(chatIdNum, {
          id: newMsgId,
          type: "incoming",
          text,
          imageSrc,
          videoSrc,
          audioSrc,
          documentSrc,
          documentName,
          stickerSrc,
          pollTitle,
          pollOptions,
          location,
          contacts,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sender: "WhatsBotCord",
        });
      }
    }

    return {
      key: { remoteJid: chatId_JID, fromMe: true, id: newMsgId.toString() },
      message: content,
      messageTimestamp: Math.floor(Date.now() / 1000),
    } as WhatsappMessage;
  }

  public async fetchGroupMetadata(chatId: string): Promise<WhatsappGroupMetadata> {
    return {
      id: chatId,
      subject: "Whatsgroup (Group with bot)",
      creation: Math.floor(Date.now() / 1000),
      owner: "54911000000@s.whatsapp.net",
      subjectOwner: "54911000000@s.whatsapp.net",
      desc: "This is a group chat where the bot is a member.",
      participants: Array.from({ length: 15 }, (_, i) => {
        const num = 54911000000 + i;
        return {
          id: `${num}@s.whatsapp.net`,
          admin: i === 0 ? "superadmin" : (i === 1 ? "admin" : null)
        };
      })
    } as unknown as WhatsappGroupMetadata;
  }
  public async fetchAllGroups(): Promise<WhatsappGroupMetadata[]> {
    return [];
  }
  public async updateGroupParticipants(
    groupId: string,
    participants: string[],
    action: "add" | "remove" | "promote" | "demote"
  ): Promise<boolean> {
    return true;
  }
  public async leaveGroup(groupId: string): Promise<void> {}
  public async deleteChatLocally(chatId: string): Promise<void> {}
  public async downloadMediaMessage(rawMsg: WhatsappMessage): Promise<Uint8Array> {
    return new Uint8Array();
  }
  public async getPollVotes(pollRawMsg: WhatsappMessage, pollUpdates: any[]): Promise<any[]> {
    return [];
  }
  public async setPresenceState(state: any): Promise<boolean> {
    return true;
  }
  public async setChatActivity(chatId_JID: string, activity: any): Promise<boolean> {
    const idStr = chatId_JID.split("@")[0];
    const chatId = parseInt(idStr, 10);
    if (!isNaN(chatId) && this.msgWidget && this.msgWidget.setChatActivity) {
      this.msgWidget.setChatActivity(chatId, activity);
    }
    return true;
  }
  public async shutdown(): Promise<void> {}
}

export class MsgWidgetAdapter implements IWhatsappAdapter {
  public client: WhatsSocketMockClient;
  private unsubscribeExternal?: () => void;

  constructor(public readonly msgWidget: IMsgWidget) {
    this.client = new WhatsSocketMockClient(msgWidget);

    // Listen to the UI sending messages directly!
    if (this.msgWidget && this.msgWidget.onExternalSendMessage) {
      this.unsubscribeExternal = this.msgWidget.onExternalSendMessage((chatId: number, text: string, msgId: number) => {
        const chats = this.msgWidget.getChats();
        const chat = chats.find(c => c.id === chatId);
        if (chat?.IsWhatsbotCordHere) {
          this.handleUserSendMessage(chatId, text, chat.isGroup ?? false, msgId);
        }
      });
    }
  }

  public destroy() {
    if (this.unsubscribeExternal) {
      this.unsubscribeExternal();
    }
  }

  public handleUserSendMessage(chatId: number, text: string, isGroup: boolean, msgId: number) {
    const jid = isGroup ? `${chatId}@g.us` : `${chatId}@s.whatsapp.net`;

    // Find the unique private chat to act as the user's phone number ID
    const chats = this.msgWidget.getChats();
    const privateChat = chats.find(c => c.IsUniquePrivateChatWithBot);
    const participantJid = privateChat ? `${privateChat.id}@s.whatsapp.net` : `${chatId}@s.whatsapp.net`;

    this.client._simulateIncomingMessage({
      key: {
        remoteJid: jid,
        fromMe: false,
        id: msgId.toString(),
        participant: isGroup ? participantJid : undefined,
        participantAlt: isGroup ? participantJid : undefined,
      },
      message: { extendedTextMessage: { text: text } },
      messageTimestamp: Math.floor(Date.now() / 1000),
      pushName: "User",
    });
  }

  public async Create(): Promise<IWhatsSocketVendorClient> {
    setTimeout(() => {
      if (this.client["listeners"]["ConnectionStateChanged"]) {
        this.client["listeners"]["ConnectionStateChanged"].forEach(cb => cb({ connection: "open" }));
      }
    }, 100);
    return this.client;
  }
}
