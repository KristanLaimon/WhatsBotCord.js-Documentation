import { I as IWhatsappSocketAdapterClient, e as WhatsappMessageContent, f as WhatsappMessageOptions, W as WhatsappMessage, c as WhatsappGroupMetadata, g as WhatsappGroupParticipantAction, h as WhatsappPollUpdateMessage, i as WhatsappPollVote, d as WhatsappPresenceState, j as WhatsappChatActivity, k as WhatsSocketVendorEventMap, a as IWhatsappAdapter } from './types-CqnhN4HR.js';
export { C as ChatMock, W as WhatsSocket_Submodule_Receiver_MockingSuite } from './types-DYpP1B44.js';
import './CommandsSearcher.types-5f4mEWao.js';

type Mock<T extends (...args: any[]) => any> = T & {
    mock: any;
};
declare function CreateMockAdapterFactory(mockSocket: MockAdapter$1): IWhatsappAdapter;
/**
 * A mock implementation of the internal vendor client.
 * The name is kept for compatibility with existing tests.
 */
declare class MockAdapter$1 implements IWhatsappSocketAdapterClient {
    readonly ownJID = "mock-jid";
    user: {
        id: string;
    };
    private storedEvents;
    sendMessage: Mock<(jid: string, content: WhatsappMessageContent, options?: WhatsappMessageOptions) => Promise<WhatsappMessage>>;
    fetchGroupMetadata: Mock<(chatId: string) => Promise<WhatsappGroupMetadata>>;
    fetchAllGroups: Mock<() => Promise<WhatsappGroupMetadata[]>>;
    groupMetadata: Mock<(chatId: string) => Promise<WhatsappGroupMetadata>>;
    groupFetchAllParticipating: Mock<() => Promise<Record<string, WhatsappGroupMetadata>>>;
    normalizeJid: Mock<(jid: string) => string>;
    getBotJid: Mock<() => string>;
    updateGroupParticipants: Mock<(groupId: string, participants: string[], action: WhatsappGroupParticipantAction) => Promise<boolean>>;
    groupParticipantsUpdate: Mock<(groupId: string, participants: string[], action: WhatsappGroupParticipantAction) => Promise<boolean>>;
    leaveGroup: Mock<(groupId: string) => Promise<void>>;
    groupLeave: Mock<(groupId: string) => Promise<void>>;
    deleteChatLocally: Mock<(chatId: string) => Promise<void>>;
    chatModify: Mock<(_mutation: unknown, chatId: string) => Promise<void>>;
    downloadMediaMessage: Mock<(rawMsg: WhatsappMessage) => Promise<Uint8Array>>;
    getPollVotes: Mock<(pollRawMsg: WhatsappMessage, pollUpdates: WhatsappPollUpdateMessage[]) => Promise<WhatsappPollVote[]>>;
    setPresenceState: Mock<(state: WhatsappPresenceState) => Promise<boolean>>;
    setChatActivity: Mock<(chatId_JID: string, activity: WhatsappChatActivity) => Promise<boolean>>;
    shutdown: Mock<() => Promise<void>>;
    ws: {
        close: Mock<() => Promise<void>>;
    };
    on<EventName extends keyof WhatsSocketVendorEventMap>(eventName: EventName, callback: WhatsSocketVendorEventMap[EventName]): void;
    ev: {
        on: Mock<(eventName: string, callback: (...args: any[]) => void) => void>;
        emit: Mock<(eventName: string, ...args: any[]) => boolean>;
    };
}

/**
 * A syntax-sugar class that automatically initializes a RAM-ONLY adapter Mock (Won't work with whatsapp servers) for TESTING-ONLY
 *
 * @example
 * ```typescript
 * import { MockAdapter } from "whatsbotcord/testing";
 * const adapter = new MockAdapter();
 * const bot = new WhatsBot({ authFolder: "./auth" }, adapter);
 *
 * // Simulate events
 * adapter.mockClient.ev.emit("messages.upsert", { ... });
 * ```
 */
declare class MockAdapter implements IWhatsappAdapter {
    mockClient: MockAdapter$1;
    constructor();
    Create(): Promise<MockAdapter$1>;
}

export { CreateMockAdapterFactory as CreateWhatsSocketVendorFactoryMock, MockAdapter as GenericSocketVendorClient_Mock, MockAdapter };
