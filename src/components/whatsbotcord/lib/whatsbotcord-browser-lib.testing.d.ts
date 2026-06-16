import { I as IWhatsappSocketAdapterClient, d as WhatsappMessageContent, e as WhatsappMessageOptions, W as WhatsappMessage, c as WhatsappGroupMetadata, f as WhatsappGroupParticipantAction, g as WhatsappPollUpdateMessage, h as WhatsappPollVote, i as WhatsappPresenceState, j as WhatsappChatActivity, k as WhatsSocketVendorEventMap, a as IWhatsappAdapter } from './types-C_BnhUPh.js';
import { n as IWhatsSocket, D as Delegate, M as MsgType, S as SenderType, q as IWhatsSocket_Submodule_SugarSender, p as IWhatsSocket_Submodule_Receiver, k as IWhatsSocket_Submodule_Group, E as IWhatsSocket_Submodule_Presence } from './CommandsSearcher.types-Cl63i0Aw.js';
import { W as WhatsSocketMockMsgSent } from './types-O6OAA9xa.js';
export { C as ChatMock, f as WhatsSocket_Submodule_Receiver_MockingSuite } from './types-O6OAA9xa.js';

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

type WhatsSocketMockOptions = {
    maxQueueLimit?: number;
    customReceiver?: IWhatsSocket_Submodule_Receiver;
    customSugarSender?: IWhatsSocket_Submodule_SugarSender;
    customGroup?: IWhatsSocket_Submodule_Group;
    customPresence?: IWhatsSocket_Submodule_Presence;
    minimumMilisecondsDelayBetweenMsgs?: number;
};
type WhatsSocketMockSendingMsgOptions = {
    replaceTextWith?: string;
    replaceParticipantIdWith?: string;
    replaceChatIdWith?: string;
    customMsgType?: MsgType;
    changeSenderType?: SenderType;
};
declare class WhatsSocketMock implements IWhatsSocket {
    onRestart: Delegate<() => Promise<void>>;
    onSentMessage: Delegate<(chatId: string, rawContentMsg: WhatsappMessageContent, optionalMisc?: WhatsappMessageOptions) => void>;
    onIncomingMsg: Delegate<(participantId_LID: string | null, participantId_PN: string | null, chatId: string, rawMsg: WhatsappMessage, type: MsgType, senderType: SenderType) => void>;
    onUpdateMsg: Delegate<(participantId_LID: string | null, participantId_PN: string | null, chatId: string, rawMsgUpdate: WhatsappMessage, msgType: MsgType, senderType: SenderType) => void>;
    onGroupEnter: Delegate<(groupInfo: WhatsappGroupMetadata) => void>;
    onGroupUpdate: Delegate<(groupInfo: Partial<WhatsappGroupMetadata>) => void>;
    onStartupAllGroupsIn: Delegate<(allGroupsIn: WhatsappGroupMetadata[]) => void>;
    ownJID: string;
    Send: IWhatsSocket_Submodule_SugarSender;
    Receive: IWhatsSocket_Submodule_Receiver;
    group: IWhatsSocket_Submodule_Group;
    Presence: IWhatsSocket_Submodule_Presence;
    Socket: any;
    constructor(customVendorClient: IWhatsappSocketAdapterClient, options?: WhatsSocketMockOptions);
    constructor(options?: WhatsSocketMockOptions);
    SentMessagesThroughQueue: WhatsSocketMockMsgSent[];
    SentMessagesThroughRaw: WhatsSocketMockMsgSent[];
    GroupsIDTriedToFetch: string[];
    IsOn: boolean;
    Start(): Promise<void>;
    Shutdown(): Promise<void>;
    _SendSafe(chatId_JID: string, content: WhatsappMessageContent, options?: WhatsappMessageOptions): Promise<WhatsappMessage | null>;
    _SendRaw(chatId_JID: string, content: WhatsappMessageContent, options?: WhatsappMessageOptions): Promise<WhatsappMessage | null>;
    /**
     * Gets the metadata of a group chat by its chat ID. (e.g: "23423423123@g.us")
     * @param chatId The chat ID of the group you want to get metadata from.
     * @returns A promise that resolves to the group metadata.
     */
    GetRawGroupMetadata(chatId: string): Promise<WhatsappGroupMetadata>;
    ClearMock(): void;
    DownloadMediaMessage(_rawMsg: WhatsappMessage): Promise<Uint8Array>;
    GetPollVotes(_pollRawMsg: WhatsappMessage, _pollUpdates: WhatsappPollUpdateMessage[]): Promise<WhatsappPollVote[]>;
    /**
     * Simulates the reception of a message from whatsapp asynchronously!
     * @param rawMsg The message to be sent.
     * @param options Optional options to modify the message before sending it.
     *                Currently only supports replacing the text of the message.
     * @returns Resolves to void.
     */
    MockSendMsgAsync(rawMsg: WhatsappMessage, options?: WhatsSocketMockSendingMsgOptions): Promise<void>;
    /**
     * @deprecated Use 'MockSendMsgAsync()' instead from this object 'WhatsSocketMock'. Its more reliable and normally
     * all code logic related to mockSending is Promised-Based....
     *
     * Simulates the reception of a message from whatsapp synchronously!
     * @param rawMsg The message to be sent.
     * @param options Optional options to modify the message before sending it.
     *                Currently only supports replacing the text of the message.
     * @returns Resolves to void.
     */
    MockSendMsg(rawMsg: WhatsappMessage, options?: WhatsSocketMockSendingMsgOptions): void;
    private _extractInfoFromWhatsMsg;
}

/**
 * A mocking implementation of `IWhatsSocket_Submodule_Presence` designed for unit testing.
 * This class simulates the behavior of presence management without interacting
 * with the actual WhatsApp socket.
 */
declare class WhatsSocket_Submodule_Presence_MockingSuite implements IWhatsSocket_Submodule_Presence {
    HistoryActions: Array<{
        actionName: keyof IWhatsSocket_Submodule_Presence;
        chatId?: string;
        additionalArguments?: any;
    }>;
    ClearMocks(): void;
    SetGlobalPresenceState(state: WhatsappPresenceState): Promise<boolean>;
    StartTyping(chatId: string): Promise<boolean>;
    StopTyping(chatId: string): Promise<boolean>;
    StartRecording(chatId: string): Promise<boolean>;
    StopRecording(chatId: string): Promise<boolean>;
    WithTyping<T>(chatId: string, action: () => Promise<T>): Promise<T>;
    WithRecording<T>(chatId: string, action: () => Promise<T>): Promise<T>;
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

export { CreateMockAdapterFactory as CreateWhatsSocketVendorFactoryMock, MockAdapter as GenericSocketVendorClient_Mock, MockAdapter, WhatsSocketMock, WhatsSocket_Submodule_Presence_MockingSuite };
