/**
 * # Delegate
 *
 * A simple delegate implementation inspired by C# delegates.
 * Useful for the Observer pattern and event-driven programming.
 *
 * @template functType - The function signature that the delegate can hold.
 *
 * @example
 * ```typescript
 * const onChange = new Delegate<(id: string) => void>();
 * onChange.Subscribe((id) => console.log(id));
 * onChange.CallAll("123");
 * ```
 */
declare class Delegate<functType extends (...args: any[]) => any> {
    /** Internal storage for all subscribed functions. */
    private functions;
    /**
     * The number of functions currently subscribed to this delegate.
     */
    get Length(): number;
    /**
     * Subscribes a new function to the delegate.
     *
     * @param funct - The function to add.
     */
    Subscribe(funct: functType): void;
    /**
     * Unsubscribes a previously added function from the delegate.
     *
     * @param funct - The function to remove.
     * @returns `true` if the function was found and removed, otherwise `false`.
     */
    Unsubscribe(funct: functType): boolean;
    /**
     * Calls all subscribed functions synchronously with the provided arguments.
     *
     * @param args - Arguments to pass to each subscribed function.
     */
    CallAll(...args: Parameters<functType>): Array<ReturnType<functType>>;
    /**
     * Calls all subscribed functions asynchronously with the provided arguments.
     * Each function is awaited sequentially.
     *
     * @param args - Arguments to pass to each subscribed function.
     * @returns A promise that resolves when all functions have been called.
     */
    CallAllAsync(...args: Parameters<functType>): Promise<Array<ReturnType<functType>>>;
    /**
     * Removes all subscribed functions from this delegate.
     */
    Clear(): void;
}

/**
 * # Message Type
 *
 * Enumeration mapping the type of the message received.
 *
 * @example
 * ```typescript
 * const type = MsgType.Text;
 * ```
 */
declare enum MsgType {
    Text = 1,
    Image = 2,
    Sticker = 3,
    Video = 4,
    Audio = 5,
    Contact = 6,
    Poll = 7,
    Ubication = 8,
    Document = 9,
    Unknown = 10
}
/**
 * # Sender Type
 *
 * Enumeration mapping the type of sender that sent the message.
 *
 * @example
 * ```typescript
 * const type = SenderType.Individual;
 * ```
 */
declare enum SenderType {
    Group = 1,
    Individual = 2,
    Unknown = 3
}

/**
 * # Logger Mode
 *
 * Represents the logger mode for WhatsSocket.
 * They are based on the 'pino' library/dependency logger levels. Just extracted them here for convenience.
 *
 * @example
 * ```typescript
 * const mode: WhatsSocketLoggerMode = "silent";
 * ```
 */
type WhatsSocketLoggerMode = "debug" | "error" | "fatal" | "info" | "silent" | "trace" | "warn" | "recommended";
/**
 * # WhatsApp Message Key
 *
 * Vendor-neutral identifier block for a WhatsApp message.
 *
 * @example
 * ```typescript
 * const key: WhatsappMessageKey = { remoteJid: "123@g.us", fromMe: false };
 * ```
 */
type WhatsappMessageKey = {
    remoteJid?: string | null;
    remoteJidAlt?: string | null;
    participant?: string | null;
    participantAlt?: string | null;
    fromMe?: boolean | null;
    id?: string | null;
    [key: string]: any;
};
/**
 * # WhatsApp Message Context Info
 *
 * Common metadata attached to a message or message option.
 * Vendors may expose more fields, but these are the fields WhatsBotCord
 * commonly reads or forwards.
 *
 * @example
 * ```typescript
 * const contextInfo: WhatsappMessageContextInfo = { quotedMessage: rawMsg.message };
 * ```
 */
type WhatsappMessageContextInfo = {
    quotedMessage?: WhatsappProtocolMessage | null;
    stanzaId?: string | null;
    participant?: string | null;
    mentionedJid?: string[] | null;
    expiration?: number | null;
    ephemeralSettingTimestamp?: number | string | null;
    disappearingMode?: {
        initiator?: string | number | null;
        [key: string]: any;
    } | null;
    forwardingScore?: number | null;
    isForwarded?: boolean | null;
    [key: string]: any;
};
/**
 * # WhatsApp Protocol Message
 *
 * Minimal message payload shape used by WhatsBotCord internals.
 * Vendor adapters may attach extra fields, but application code should only
 * depend on the fields declared here.
 *
 * @example
 * ```typescript
 * const msg: WhatsappProtocolMessage = { conversation: "hello" };
 * ```
 */
type WhatsappProtocolMessage = {
    conversation?: string | null;
    extendedTextMessage?: {
        text?: string | null;
        contextInfo?: WhatsappMessageContextInfo | null;
        [key: string]: any;
    } | null;
    imageMessage?: {
        caption?: string | null;
        url?: string | null;
        mimetype?: string | null;
        [key: string]: any;
    } | null;
    videoMessage?: {
        caption?: string | null;
        url?: string | null;
        mimetype?: string | null;
        [key: string]: any;
    } | null;
    audioMessage?: {
        url?: string | null;
        mimetype?: string | null;
        [key: string]: any;
    } | null;
    stickerMessage?: {
        url?: string | null;
        mimetype?: string | null;
        [key: string]: any;
    } | null;
    pollCreationMessage?: Record<string, any> | null;
    pollCreationMessageV3?: {
        name?: string | null;
        selectableOptionsCount?: number | null;
        options?: Array<{
            optionName?: string | null;
            [key: string]: any;
        }> | null;
        [key: string]: any;
    } | null;
    pollUpdateMessage?: WhatsappPollUpdateMessage | null;
    locationMessage?: {
        degreesLatitude?: number | null;
        degreesLongitude?: number | null;
        jpegThumbnail?: Uint8Array | null;
        isLive?: boolean | null;
        name?: string | null;
        address?: string | null;
        [key: string]: any;
    } | null;
    contactMessage?: {
        displayName?: string | null;
        vcard?: string | null;
        [key: string]: any;
    } | null;
    contactsArrayMessage?: {
        contacts?: Array<{
            displayName?: string | null;
            vcard?: string | null;
            [key: string]: any;
        }> | null;
        [key: string]: any;
    } | null;
    documentMessage?: {
        url?: string | null;
        fileName?: string | null;
        mimetype?: string | null;
        [key: string]: any;
    } | null;
    [key: string]: any;
};
/**
 * # WhatsApp Message
 *
 * Vendor-neutral raw message shape used across WhatsBotCord.
 *
 * @example
 * ```typescript
 * const msg: WhatsappMessage = { key: { remoteJid: "123@s.whatsapp.net" }, message: { conversation: "hello" } };
 * ```
 */
type WhatsappMessage = {
    key: WhatsappMessageKey;
    message?: WhatsappProtocolMessage | null;
    pushName?: string | null;
    [key: string]: any;
};
/**
 * # WhatsApp Message Content
 *
 * Vendor-neutral outgoing message content. The shape intentionally keeps an
 * index signature because WhatsApp vendors expose different optional features.
 *
 * @example
 * ```typescript
 * const content: WhatsappMessageContent = { text: "hello" };
 * ```
 */
type WhatsappMessageContent = {
    text?: string;
    mentions?: string[];
    image?: Uint8Array | {
        url: string;
    };
    video?: Uint8Array | {
        url: string;
    };
    audio?: Uint8Array | {
        url: string;
    };
    sticker?: Uint8Array | {
        url: string;
    };
    document?: Uint8Array | {
        url: string;
    };
    mimetype?: string;
    caption?: string;
    fileName?: string;
    react?: {
        text: string;
        key: WhatsappMessageKey;
    };
    poll?: {
        name: string;
        values: string[];
        selectableCount: number;
    };
    location?: {
        degreesLatitude: number;
        degreesLongitude: number;
        name?: string;
        address?: string;
    };
    contacts?: {
        displayName: string;
        contacts: Array<{
            vcard: string;
        }>;
    };
    [key: string]: any;
};
/**
 * # WhatsApp Message Options
 *
 * Vendor-neutral message sending options.
 *
 * @example
 * ```typescript
 * const options: WhatsappMessageOptions = { quoted: rawMsg };
 * ```
 */
type WhatsappMessageOptions = {
    /**
     * Message that the new outgoing message should reply to.
     * Each vendor adapter maps this to the vendor-specific quoted-message option.
     */
    quoted?: WhatsappMessage;
    /**
     * Optional context metadata to attach to the outgoing message.
     */
    contextInfo?: WhatsappMessageContextInfo;
    /**
     * Whether the outgoing message is a broadcast/status message.
     */
    broadcast?: boolean;
    /**
     * Contacts allowed to receive a status broadcast.
     */
    statusJidList?: string[];
    /**
     * Ephemeral duration in seconds when the vendor supports disappearing messages.
     */
    ephemeralExpiration?: number;
    [key: string]: any;
};
/**
 * # WhatsApp Group Participant
 *
 * Minimal participant metadata shape used by WhatsBotCord.
 *
 * @example
 * ```typescript
 * const participant: WhatsappGroupParticipant = { id: "123@s.whatsapp.net", admin: "admin" };
 * ```
 */
type WhatsappGroupParticipant = {
    id?: string | null;
    lid?: string | null;
    admin?: "admin" | "superadmin" | null;
    [key: string]: any;
};
/**
 * # WhatsApp Group Metadata
 *
 * Vendor-neutral group metadata used by WhatsBotCord.
 *
 * @example
 * ```typescript
 * const group: WhatsappGroupMetadata = { id: "123@g.us", subject: "Group", participants: [] };
 * ```
 */
type WhatsappGroupMetadata = {
    id: string;
    subject: string;
    participants: WhatsappGroupParticipant[];
    addressingMode?: "pn" | "lid" | string | null;
    subjectOwner?: string | null;
    owner?: string | null;
    desc?: string | null;
    inviteCode?: string | null;
    isCommunity?: boolean | null;
    restrict?: boolean | null;
    announce?: boolean | null;
    memberAddMode?: boolean | null;
    joinApprovalMode?: boolean | null;
    isCommunityAnnounce?: boolean | null;
    ephemeralDuration?: number | null;
    subjectTime?: number | null;
    creation?: number | null;
    [key: string]: any;
};
/**
 * # WhatsApp Group Participant Action
 *
 * Vendor-neutral participant update action supported by WhatsApp groups.
 *
 * @example
 * ```typescript
 * const action: WhatsappGroupParticipantAction = "promote";
 * ```
 */
type WhatsappGroupParticipantAction = "add" | "remove" | "promote" | "demote";
type WhatsappPresenceState = "online" | "offline";
type WhatsappChatActivity = "typing" | "recording" | "idle";
type WhatsappMessageUpdate = WhatsappMessage;
type WhatsappPollUpdateMessage = {
    pollCreationMessageKey?: WhatsappMessageKey | null;
    [key: string]: any;
};
type WhatsappPollVote = {
    name: string;
    voters: string[];
};
type WhatsSocketConnectionUpdate = {
    connection?: "open" | "close" | string;
    qr?: string;
    lastDisconnect?: {
        error?: unknown;
        statusCode?: number;
        isLoggedOut?: boolean;
    };
};
type WhatsSocketIncomingMessagesUpdate = {
    messages?: WhatsappMessage[];
    [key: string]: any;
};
type WhatsSocketVendorEventMap = {
    ConnectionStateChanged: (update: WhatsSocketConnectionUpdate) => void | Promise<void>;
    IncomingMessagesReceived: (messageUpdate: WhatsSocketIncomingMessagesUpdate) => void | Promise<void>;
    MessagesUpdated: (messagesUpdates: WhatsappMessageUpdate[]) => void | Promise<void>;
    GroupsJoined: (groups: WhatsappGroupMetadata[]) => void | Promise<void>;
    GroupsUpdated: (groups: Array<Partial<WhatsappGroupMetadata>>) => void | Promise<void>;
};
/**
 * # WhatsApp Vendor Client
 *
 * Low-level internal contract implemented by WhatsApp vendor adapters.
 * The rest of the application talks to this interface, never to Baileys
 * or another vendor directly.
 *
 * @example
 * ```typescript
 * const client: IWhatsSocketVendorClient = await factory.Create();
 * client.on("IncomingMessagesReceived", update => console.log(update.messages));
 * ```
 */
interface IWhatsappSocketAdapterClient {
    readonly ownJID: string;
    on<EventName extends keyof WhatsSocketVendorEventMap>(eventName: EventName, callback: WhatsSocketVendorEventMap[EventName]): void;
    normalizeJid(jid: string): string;
    getBotJid(): string;
    sendMessage(chatId_JID: string, content: WhatsappMessageContent, options?: WhatsappMessageOptions): Promise<WhatsappMessage | null>;
    fetchGroupMetadata(chatId: string): Promise<WhatsappGroupMetadata>;
    fetchAllGroups(): Promise<WhatsappGroupMetadata[]>;
    updateGroupParticipants(groupId: string, participants: string[], action: WhatsappGroupParticipantAction): Promise<boolean>;
    leaveGroup(groupId: string): Promise<void>;
    deleteChatLocally(chatId: string): Promise<void>;
    downloadMediaMessage(rawMsg: WhatsappMessage): Promise<Uint8Array>;
    getPollVotes(pollRawMsg: WhatsappMessage, pollUpdates: WhatsappPollUpdateMessage[]): Promise<WhatsappPollVote[]>;
    setPresenceState(state: WhatsappPresenceState): Promise<boolean>;
    setChatActivity(chatId_JID: string, activity: WhatsappChatActivity): Promise<boolean>;
    shutdown(): Promise<void>;
}
interface IWhatsappAdapter {
    Create(): Promise<IWhatsappSocketAdapterClient>;
}

/**
 * # WhatsApp ID Type
 *
 * Enum representing WhatsApp identifier conventions.
 *
 * @example
 * ```typescript
 * const myType = WhatsappIdType.Modern;
 * ```
 */
declare enum WhatsappIdType {
    /** Legacy group addressing mode (`pn`) */
    Legacy = "pn",
    /** Modern group addressing mode (`lid`) */
    Modern = "lid"
}
/**
 * # WhatsApp ID Information
 *
 * Structure detailing different formats of a WhatsApp ID.
 *
 * @example
 * ```typescript
 * const info: WhatsappIDInfo = {
 *   rawId: "1234567890@s.whatsapp.net",
 *   asMentionFormatted: "@1234567890",
 *   WhatsappIdType: WhatsappIdType.Legacy
 * };
 * ```
 */
type WhatsappIDInfo = {
    /**
     * The original WhatsApp ID as assigned by WhatsApp.
     * This is the raw identifier you receive in messages, without any formatting.
     */
    rawId?: string;
    /**
     * The phone number formatted for mentions in messages.
     * This is the normalized WhatsApp ID prefixed with '@', ready to be used in quotes or mentions.
     *
     * Example:
     * ```ts
     * // If the rawId is '1234567890@s.whatsapp.net', asMentionFormatted will be '@1234567890'
     * ```
     *
     * Note: When sending a message through the socket, make sure to include the sender's full raw ID in the array if required.
     */
    asMentionFormatted?: string;
    /**
     * Indicates the type of WhatsApp ID received.
     * - "lid": The ID comes from a group message as a linked device identifier. Messages cannot be sent directly to a `@lid`.
     * - "full": The ID comes from a private chat and is a full WhatsApp ID (e.g., '1234567890@s.whatsapp.net'), which can be used to send messages directly.
     */
    WhatsappIdType?: WhatsappIdType;
};
/**
 * # Extract Phone Info From Sender Message
 *
 * Extracts detailed phone number information from a raw WhatsApp message.
 *
 * @param rawMsg - The raw WhatsApp message.
 * @returns An object containing the extracted WhatsApp ID details.
 * @throws {Error} If both participant and remoteJid are undefined.
 *
 * @example
 * ```typescript
 * const phoneInfo = WhatsappHelper_ExtractWhatsappInfoInfoFromSenderRawMsg(rawMsg);
 * console.log("Sender Mention string:", phoneInfo.asMentionFormatted);
 * ```
 */
declare function WhatsappHelper_ExtractWhatsappInfoInfoFromSenderRawMsg(rawMsg: WhatsappMessage): WhatsappIDInfo;
/**
 * # Extract Info From WhatsApp ID
 *
 * Parses a given raw WhatsApp ID string into an informational structure.
 *
 * @param whatsappIDStr - The raw string identifier (e.g. "1234@s.whatsapp.net").
 * @returns The assembled `WhatsappIDInfo` data structure.
 *
 * @example
 * ```typescript
 * const info = WhatsappHelper_ExtractFromWhatsappID("123@s.whatsapp.net");
 * ```
 */
declare function WhatsappHelper_ExtractFromWhatsappID(whatsappIDStr: string): WhatsappIDInfo;
/**
 * # Extract WhatsApp Info From Mention
 *
 * Gets the WhatsApp identifier details out of a mention string if valid.
 *
 * @param mentionId - A localized mention string (e.g., "@12345").
 * @returns The `WhatsappIDInfo` or `null` if invalid.
 *
 * @example
 * ```typescript
 * const info = WhatsappHelper_ExtractWhatsappInfoFromMention("@12345");
 * ```
 */
declare function WhatsappHelper_ExtractWhatsappInfoFromMention(mentionId: string): WhatsappIDInfo | null;
/**
 * # Is LID Identifier
 *
 * Checks if a string acts as a modern Linked Device Identifier.
 *
 * @param whatsIdExpected - The raw ID string.
 * @returns True if it is a LID.
 *
 * @example
 * ```typescript
 * const isLid = WhatsappHelper_isLIDIdentifier("1234@lid");
 * ```
 */
declare function WhatsappHelper_isLIDIdentifier(whatsIdExpected: string): boolean;
/**
 * # Is Mention Identifier
 *
 * Checks if the given string is a valid mention ID for a WhatsApp user.
 *
 * @param numberStr - The mention formatted string to check.
 * @returns True if valid, false otherwise.
 *
 * @example
 * ```typescript
 * const isValid = WhatsappHelper_isMentionId('@1234567890123');
 * ```
 */
declare function WhatsappHelper_isMentionId(numberStr: string): boolean;
/**
 * # Is Full WhatsApp User ID
 *
 * Checks if the given string is a valid full WhatsApp ID for an individual user.
 *
 * @param expectedWhatsappId - The string to check.
 * @returns True if the string is a standard individual user ID.
 *
 * @example
 * ```typescript
 * const isValid = WhatsappHelper_isFullWhatsappIdUser('1234567890@s.whatsapp.net');
 * ```
 */
declare function WhatsappHelper_isFullWhatsappIdUser(expectedWhatsappId: string): boolean;

/**
 * # Presence Submodule Interface
 *
 * Defines the public contract for managing presence and chat activity within the bot.
 * Allows developers to safely toggle online/offline states and simulate typing/recording.
 */
interface IWhatsSocket_Submodule_Presence {
    /**
     * # Set Global Presence State
     *
     * Updates the global presence state of the bot.
     *
     * @param state The state to set: "online" or "offline".
     * @returns `true` if the state was updated successfully, `false` otherwise.
     *
     * @example
     * ```typescript
     * await bot.Presence.SetGlobalPresenceState("online");
     * ```
     */
    SetGlobalPresenceState(state: WhatsappPresenceState): Promise<boolean>;
    /**
     * # Start Typing
     *
     * Sets the chat activity to "typing".
     *
     * @param jid The JID of the chat.
     * @returns `true` if the activity was updated successfully, `false` otherwise.
     *
     * @example
     * ```typescript
     * await bot.Presence.StartTyping(message.chatId);
     * ```
     */
    StartTyping(jid: string): Promise<boolean>;
    /**
     * # Stop Typing
     *
     * Resets the chat activity from "typing" to "idle".
     *
     * @param jid The JID of the chat.
     * @returns `true` if the activity was updated successfully, `false` otherwise.
     *
     * @example
     * ```typescript
     * await bot.Presence.StopTyping(message.chatId);
     * ```
     */
    StopTyping(jid: string): Promise<boolean>;
    /**
     * # Start Recording
     *
     * Sets the chat activity to "recording".
     *
     * @param jid The JID of the chat.
     * @returns `true` if the activity was updated successfully, `false` otherwise.
     *
     * @example
     * ```typescript
     * await bot.Presence.StartRecording(message.chatId);
     * ```
     */
    StartRecording(jid: string): Promise<boolean>;
    /**
     * # Stop Recording
     *
     * Resets the chat activity from "recording" to "idle".
     *
     * @param jid The JID of the chat.
     * @returns `true` if the activity was updated successfully, `false` otherwise.
     *
     * @example
     * ```typescript
     * await bot.Presence.StopRecording(message.chatId);
     * ```
     */
    StopRecording(jid: string): Promise<boolean>;
    /**
     * # With Typing
     *
     * Wraps an action with a typing state. Automatically starts typing, executes the action,
     * and then stops typing.
     *
     * @param jid The JID of the chat.
     * @param action The async action to execute while typing.
     * @returns The result of the action.
     *
     * @example
     * ```typescript
     * await bot.Presence.WithTyping(message.chatId, async () => {
     *   await bot.SendText(message.chatId, "Hello!");
     * });
     * ```
     */
    WithTyping<T>(jid: string, action: () => Promise<T>): Promise<T>;
    /**
     * # With Recording
     *
     * Wraps an action with a recording state. Automatically starts recording, executes the action,
     * and then stops recording.
     *
     * @param jid The JID of the chat.
     * @param action The async action to execute while recording.
     * @returns The result of the action.
     *
     * @example
     * ```typescript
     * await bot.Presence.WithRecording(message.chatId, async () => {
     *   await bot.SendAudio(message.chatId, audioBuffer);
     * });
     * ```
     */
    WithRecording<T>(jid: string, action: () => Promise<T>): Promise<T>;
}

/**
 * # Receiver Submodule Interface
 *
 * Defines the contract for the receiver submodule.
 *
 * @example
 * ```typescript
 * const receiver: IWhatsSocket_Submodule_Receiver = socket.Receive;
 * ```
 */
interface IWhatsSocket_Submodule_Receiver {
    /**
     * Waits for the next message from a specific user in a group chat.
     *
     * The returned promise resolves only if the specified participant sends
     * a message of the expected type.
     *
     * If the timeout is reached, or if the wait is explicitly cancelled,
     * the promise may reject or throw an error depending on configuration.
     *
     * @throws error if timeout reached or user canceled with a cancel keyword
     * @param userIDToWait - The participant ID to wait for.
     * @param chatToWaitOnID - Group chat ID to monitor.
     * @param expectedMsgType - The type of message to wait for.
     * @param options - Options such as timeout duration, cancel keywords, etc.
     * @returns Resolves with the next `WhatsappMessage` from the specified user,
     *          or rejects/throws on timeout or cancellation.
     * @example
     * ```ts
     * const receiver: IWhatsSocket_Submodule_Receiver; // Assume initialized
     * const userId = "1234567890@s.whatsapp.net";
     * const groupId = "123456789-987654321@g.us";
     * const options: WhatsSocketReceiverWaitOptions = {
     *   timeoutSeconds: 60,
     *   cancelKeywords: ["cancel", "stop"],
     *   wrongTypeFeedbackMsg: "Please send a text message.",
     *   cancelFeedbackMsg: "Operation cancelled.",
     *   ignoreSelfMessages: true
     * };
     * try {
     *   const message = await receiver.WaitUntilNextRawMsgFromUserIDInGroup(
     *     userId,
     *     groupId,
     *     MsgType.Text,
     *     options
     *   );
     *   console.log("Received message:", message);
     * } catch (error) {
     *   console.error("Error waiting for message:", error);
     * }
     * ```
     */
    WaitUntilNextRawMsgFromUserIDInGroup(userID_LID_ToWait: string | null, userID_PN_toWait: string | null, chatToWaitOnID: string, expectedMsgType: MsgType, options: WhatsSocketReceiverWaitOptions): Promise<WhatsappMessage>;
    /**
     * Waits for the next message from a specific user in a private 1:1 conversation.
     *
     * Fun fact: WhatsApp treats the user ID itself as the chat ID in private conversations.
     *
     * The returned promise resolves only if the specified user sends a message of
     * the expected type.
     *
     * If the timeout is reached, or if the wait is explicitly cancelled,
     * the promise may reject or throw an error depending on configuration.
     * @throws error if timeout reached or user canceled with a cancel keyword
     * @param userIdToWait - The user ID to wait for.
     * @param expectedMsgType - The type of message to wait for.
     * @param options - Options such as timeout duration, cancel keywords, etc.
     * @returns Resolves with the next `WhatsappMessage` from the specified user,
     *          or rejects/throws on timeout or cancellation.
     * @example
     * ```ts
     * const receiver: IWhatsSocket_Submodule_Receiver; // Assume initialized
     * const userId = "1234567890@s.whatsapp.net";
     * const options: WhatsSocketReceiverWaitOptions = {
     *   timeoutSeconds: 30,
     *   cancelKeywords: ["cancel"],
     *   wrongTypeFeedbackMsg: "Expected a text message.",
     *   cancelFeedbackMsg: "Cancelled by user.",
     *   ignoreSelfMessages: true
     * };
     * try {
     *   const message = await receiver.WaitUntilNextRawMsgFromUserIdInPrivateConversation(
     *     userId,
     *     MsgType.Text,
     *     options
     *   );
     *   console.log("Received private message:", message);
     * } catch (error) {
     *   console.error("Error waiting for private message:", error);
     * }
     * ```
     */
    WaitUntilNextRawMsgFromUserIdInPrivateConversation(userIdToWait: string, expectedMsgType: MsgType, options: WhatsSocketReceiverWaitOptions): Promise<WhatsappMessage>;
    /**
     * Downloads media content from a raw WhatsApp message.
     *
     * @param rawMsg - Message containing media.
     * @returns A Uint8Array with the media bytes.
     */
    DownloadMediaMessage(rawMsg: WhatsappMessage): Promise<Uint8Array>;
    /**
     * @deprecated ⚠️ **DEPRECATED**: This method has been moved to the `group` submodule for better architectural consistency.
     *
     * Please use the new `FetchGroupData` method from the `group` submodule instead.
     *
     * @example
     * **Old Way (Deprecated):**
     * ```ts
     * const groupData = await socket.Receive.FetchGroupData("123@g.us");
     * ```
     *
     * **New Way:**
     * ```ts
     * const groupData = await socket.group.FetchGroupData("123@g.us");
     * ```
     *
     * @param chatId - The WhatsApp ID of the group.
     * @returns A promise resolving to `GroupMetadataInfo` or `null`.
     */
    FetchGroupData(chatId: string): Promise<GroupMetadataInfo | null>;
}

/**
 * # Minimum Sending Options
 *
 * @example
 * ```typescript
 * const opts: WhatsMsgSenderSendingOptionsMINIMUM = { sendRawWithoutEnqueue: false };
 * ```
 */
type WhatsMsgSenderSendingOptionsMINIMUM = {
    /**
     * If true, bypasses the safe anti-spam queue system and sends the message
     * immediately through the socket.
     *
     * Warning:
     *   - This may cause issues if too many messages are sent too quickly
     *   - Use only for critical cases where immediate delivery is required
     *   - Default: false (messages go through the queue)
     *
     * Use at your own risk!
     */
    sendRawWithoutEnqueue?: boolean;
    /**
     * An array of WhatsApp user IDs to mention in the message.
     *
     * In WhatsApp, to mention someone you:
     *   1. Include their phone number + WhatsApp ID (e.g., "234234567890@s.whatsapp.net") in this array.
     *   2. Use the same mention placeholder in the message content (e.g., "@234234567890").
     *
     * The socket library will replace the placeholders with proper mentions and notify the users.
     *
     * Example:
     * ```ts
     * socket.SendTxt("12345@g.us", "Hello '@234567890!'", { mentionsIds: ["234567890@s.whatsapp.net"] });
     * ```
     *
     * Default: undefined (no users mentioned)
     */
    mentionsIds?: string[];
} & WhatsappMessageOptions;
/**
 * # Complete Sending Options
 *
 * @example
 * ```typescript
 * const opts: WhatsMsgSenderSendingOptions = { normalizeMessageText: true };
 * ```
 */
type WhatsMsgSenderSendingOptions = WhatsMsgSenderSendingOptionsMINIMUM & {
    /**
     * If true, applies text normalization before sending the message.
     * Normalization ensures:
     *   - Trimming leading and trailing whitespace
     *   - Removing extra spaces at the start/end of each line
     *   - Preserving empty lines without extra whitespace
     *
     * Useful for cleaning up multi-line or user-generated strings
     * before sending them.
     *
     * Default: true (message text is normalized by default)
     */
    normalizeMessageText?: boolean;
} & WhatsappMessageOptions;
/**
 * # Media With Caption Options
 *
 * @example
 * ```typescript
 * const opts: WhatsMsgMediaWithCaption = { caption: "Look at this!" };
 * ```
 */
type WhatsMsgMediaWithCaption = {
    /**
     * Optional text to include along with the image.
     *
     * - Appears as a caption below the image in WhatsApp
     * - Can be used for descriptions, notes, or additional context
     */
    caption?: string;
};
/**
 * # Media String Source
 *
 * @example
 * ```typescript
 * const source: WhatsMsgMediaStringSource = { source: "./image.png" };
 * ```
 */
type WhatsMsgMediaStringSource = {
    /**
     * Path to the source file to send.
     *
     * - Supports both relative and absolute paths
     * - For projects where this library is compiled/bundled,
     *   using absolute paths is recommended to avoid issues
     *   with build environments or working directories
     */
    source: string;
};
/**
 * # Media Uint8Array Source
 *
 * @example
 * ```typescript
 * const source: WhatsMsgMediaBufferSource = { source: Uint8Array.from([]), formatExtension: "png" };
 * ```
 */
type WhatsMsgMediaBufferSource = {
    /**
     * Path to the source file to send.
     *
     * - Supports both relative and absolute paths
     * - For projects where this library is compiled/bundled,
     *   using absolute paths is recommended to avoid issues
     *   with build environments or working directories
     */
    source: Uint8Array;
    /**
     * Mandatory file extension if using sourcePath Uint8Array (without the leading ".") such as `"mp4"`, `"ogv"`, or `"avi"`.
     *
     * This value is used as a hint when inferring the document's MIME type.
     * While the MIME type is primarily detected from the file Uint8Array,
     * some formats require the extension as additional metadata to resolve
     * correctly. If omitted, detection may fall back to
     * `"application/octet-stream"`.
     */
    formatExtension: string;
};
/**
 * # Media Options
 *
 * @example
 * ```typescript
 * const opts: WhatsMsgMediaOptions = { source: "./video.mp4" };
 * ```
 */
type WhatsMsgMediaOptions = WhatsMsgMediaWithCaption & (WhatsMsgMediaStringSource | WhatsMsgMediaBufferSource);
/**
 * # Audio Options
 *
 * @example
 * ```typescript
 * const opts: WhatsMsgAudioOptions = { source: "./audio.mp3" };
 * ```
 */
type WhatsMsgAudioOptions = WhatsMsgMediaStringSource | WhatsMsgMediaBufferSource;
/**
 * # Document Options
 *
 * @example
 * ```typescript
 * const opts: WhatsMsgDocumentOptions = { source: "./doc.pdf", fileNameToDisplay: "report.pdf" };
 * ```
 */
type WhatsMsgDocumentOptions = (WhatsMsgMediaStringSource & {
    fileNameToDisplay?: string;
}) | (WhatsMsgMediaBufferSource & {
    fileNameWithoutExtension: string;
});
/**
 * # Poll Options
 *
 * @example
 * ```typescript
 * const opts: WhatsMsgPollOptions = { withMultiSelect: false };
 * ```
 */
type WhatsMsgPollOptions = {
    withMultiSelect: boolean;
    normalizeTitleText?: boolean;
    normalizeOptionsText?: boolean;
};
/**
 * # Ubication Options
 *
 * @example
 * ```typescript
 * const opts: WhatsMsgUbicationOptions = { degreesLatitude: 40.71, degreesLongitude: -74.00 };
 * ```
 */
type WhatsMsgUbicationOptions = {
    degreesLatitude: number;
    degreesLongitude: number;
    name?: string;
    addressText?: string;
};
/**
 * # Sugar Sender Submodule Interface
 *
 * @example
 * ```typescript
 * const sender: IWhatsSocket_Submodule_SugarSender = socket.Send;
 * ```
 */
interface IWhatsSocket_Submodule_SugarSender {
    /**
     * Sends a text message to the specified chat.
     *
     * @param chatId - The ID of the chat where the message will be sent.
     * @param text - The text message to be sent.
     * @param sanitizeText - A boolean indicating whether to sanitize the text or not. Defaults to true.
     * @param options - Miscellaneous message generation options.
     * @param mentionsIds - Array of IDs of users to mention in the message. The 'text' must contain '@' characters in the same order as this array.
     * @returns The msg sent, null if it couldn't be send.
     */
    Text(chatId: string, text: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    /**
     * Sends an image message to a specific chat.
     * @throws {Error} If image path leads to unexisting content (no valid img path)
     * @param chatId - The target chat JID (WhatsApp ID).
     * @param imageOptions - Options for the image being sent:
     * @param options - Additional sending options:
     *   - `normalizeMessageText`: If true, normalizes the caption
     *      (trims spaces, cleans up multi-line text).
     *   - `mentionsIds`: List of WhatsApp IDs to tag (`@user`) in the caption.
     *   - `sendRawWithoutEnqueue`: If true, bypasses the safe queue system
     *      and sends immediately.
     *   - Any other Baileys `Record<string, any>`.
     *
     * Behavior:
     * - Reads the image file from `imagePath` into memory and attaches it.
     * - If a caption is provided and normalization is enabled,
     *   it is cleaned before sending.
     * - Mentions are injected if `mentionsIds` is specified.
     *
     * Example:
     * ```ts
     * await socket.Send.Img("12345@s.whatsapp.net", {
     *   imagePath: "/absolute/path/to/image.png",
     *   caption: "Hello '@user'"
     * }, {
     *   mentionsIds: ["12345@s.whatsapp.net"],
     *   normalizeMessageText: true
     * });
     * ```
     */
    Image(chatId: string, imageOptions: WhatsMsgMediaOptions, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    /**
     * Sends a reaction emoji to a specific message in a chat.
     * @param chatId - The target chat JID (WhatsApp ID).
     * @param rawMsgToReactTo - The message to react to.
     * @param emojiStr - The emoji string to send as a reaction.
     * @param options - Additional sending options:
     *   - `normalizeMessageText`: If true, normalizes the emoji reaction
     *      (trims spaces, cleans up multi-line text).
     *   - Any other Baileys `Record<string, any>`.
     *
     * Behavior:
     * - If the emoji string is not a single emoji character, throws an error.
     * - If the emoji reaction is valid, sends it to the target chat.
     */
    ReactEmojiToMsg(chatId: string, rawMsgToReactTo: WhatsappMessage, emojiStr: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends a sticker message to a specific chat.
     *
     * This method supports sending stickers from either:
     * 1. A **local file or Uint8Array** containing WebP data. IMPORTANT:(Sticker file must have '.webp' format/extension)
     * 2. A **remote URL** pointing to an accessible image (e.g., WebP hosted publicly).
     *
     * If `stickerUrlSource` is a `Uint8Array`, it will be sent directly.
     * If it is a `string` URL, Baileys will attempt to fetch the content from that URL.
     *
     * @param chatId - The target chat JID (WhatsApp ID), e.g., '5216121407908@s.whatsapp.net'.
     * @param stickerUrlSource - The sticker content to send:
     *   - `Uint8Array`: Directly sends the WebP sticker.
     *   - `string`: A public URL pointing to the sticker file. Note: WhatsApp encrypted `.enc` URLs **will not work** unless downloaded and decrypted first.
     * @param options - Optional sending options:
     *   - `sendRawWithoutEnqueue`: If true, bypasses the safe queue system and sends immediately.
     *   - Any other Baileys `Record<string, any>` like `quoted`, `contextInfo`, etc.
     *
     * @example
     * // Send a local WebP sticker
     * await bot.Sticker(chatId, fs.readFileSync('./stickers/dog.webp'));
     *
     * @example
     * // Send a public URL sticker (must be directly accessible)
     * await bot.Sticker(chatId, 'https://example.com/sticker.webp');
     */
    Sticker(chatId: string, stickerUrlSource: string | Uint8Array, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends an **audio message** to the specified chat.
     *
     * ### Supported sources
     * 1. **Local file path** (`string`):
     *    - Absolute or relative path to an audio file (e.g., MP3, OGG, M4A).
     *    - The path is validated; an error is thrown if the file does not exist.
     * 2. **Raw Uint8Array** (`Uint8Array`):
     *    - Must include a `formatExtension` (e.g., `"mp3"`, `"ogg"`, `"flac"`)
     *      so the correct MIME type can be resolved.
     *
     * @param chatId - Target chat JID (WhatsApp ID), e.g., `"5216121407908@s.whatsapp.net"`.
     * @param audioParams - The audio content to send:
     *   - `{ source: string, caption?: string }` → A local file path.
     *   - `{ source: Uint8Array, formatExtension: string }` → Raw Uint8Array + extension hint.
     * @param options - Additional sending options:
     *   - `sendRawWithoutEnqueue?` → If true, bypasses the safe queue system and sends immediately.
     *   - `mentionsIds?` → JIDs of users to mention in the message.
     *   - Any other Baileys `Record<string, any>` like `quoted`, `contextInfo`, etc.
     *
     * @throws
     * - If a string path is provided but the file does not exist.
     * - If a Uint8Array source is provided without `formatExtension`.
     *
     * ---
     * @example
     * // Send an MP3 file from local disk
     * await bot.Audio(chatId, { source: "./audios/voice.mp3" });
     *
     * @example
     * // Send an OGG audio Uint8Array (e.g., downloaded from somewhere else)
     * import fs from "fs";
     *
     * const Uint8Array = fs.readFileSync("./downloads/sample.ogg");
     * await bot.Audio(chatId, { source: Uint8Array, formatExtension: "ogg" });
     */
    Audio(chatId: string, audioParams: WhatsMsgAudioOptions, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends a video message to a specific chat.
     *
     * This method supports sending videos from either:
     * 1. A **local file path** (e.g., MP4, MOV, AVI).
     * 2. A **Uint8Array** containing raw video data.
     *
     * Behavior:
     * - If a `caption` is provided, it is normalized if
     *   `options.normalizeMessageText` is true.
     * - The MIME type is determined by the file extension:
     *   - `.mov` → `video/mov`
     *   - `.avi` → `video/avi`
     *   - Otherwise → defaults to `video/mp4`
     * - Uses the safe queue system unless `sendRawWithoutEnqueue` is set.
     *
     * @param chatId - The target chat JID (WhatsApp ID), e.g. `5216121407908@s.whatsapp.net`.
     * @param videoParams - The video to send:
     *   - `sourcePath`: Absolute/relative path to video file OR a `Uint8Array`.
     *   - `caption` (optional): Text shown below the video in WhatsApp.
     * @param options - Additional sending options:
     *   - `normalizeMessageText`: Normalize caption text (default: true).
     *   - `mentionsIds`: Users to mention in the caption.
     *   - `sendRawWithoutEnqueue`: Send immediately, bypassing the queue.
     *   - Any other Baileys `Record<string, any>`.
     *
     * @example
     * // Send a local MP4 with caption
     * await bot.Video(chatId, { sourcePath: "./video.mp4", caption: "Check this out!" });
     *
     * @example
     * // Send a raw Uint8Array without queuing
     * await bot.Video(chatId, { sourcePath: fs.readFileSync("./clip.mov") }, { sendRawWithoutEnqueue: true });
     */
    Video(chatId: string, videoParams: WhatsMsgMediaOptions, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    /**
     * Sends a document (any file type) to the specified WhatsApp chat.
     *
     * The document source can be provided in two ways:
     * - As a local file path (`string`)
     * - As a `Uint8Array` containing the raw file data
     *
     * A display name for the document must be provided via `displayNameFile`.
     * If a file path is given, and no display name is provided, the basename of
     * the path will be used automatically.
     *
     * The MIME type is inferred from the file contents and `fileExtension`
     * (via `GetMimeType`). If it cannot be determined, it falls back to
     * `"application/octet-stream"`.
     *
     * @param chatId - WhatsApp chat JID (e.g. `"1234567890@s.whatsapp.net"`).
     * @param docParams - An object containing:
     *   - `source`: The file path or a Uint8Array with the document data.
     *   - `displayNameFile`: The name shown in WhatsApp for the document.
     *   - `fileExtension`: File extension (e.g. `"pdf"`, `"zip"`) to assist MIME detection.
     * @param options - Additional message-sending options (e.g. sender overrides).
     * @returns A `WhatsappMessage` if successfully sent, otherwise `null`.
     *
     * @throws If the file path does not exist, or if `source` is neither a string nor a Uint8Array.
     *
     * @example
     * // From local file
     * await sender.Document("1234567890@s.whatsapp.net", {
     *   source: "./files/report.pdf",
     *   displayNameFile: "report.pdf",
     *   fileExtension: "pdf"
     * });
     *
     * @example
     * // From Uint8Array
     * const buf = fs.readFileSync("./files/data.zip");
     * await sender.Document("1234567890@s.whatsapp.net", {
     *   source: buf,
     *   displayNameFile: "data.zip",
     *   fileExtension: "zip"
     * });
     */
    Document(chatId: string, docParams: WhatsMsgDocumentOptions, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends a poll message to a specific chat.
     * Only works for sending, can't retrieve any data from that. (Idk how baileys library works for that, its not documented at all... 🥲)
     * WhatsApp polls allow either:
     * - **Single-answer polls** (one option selectable).
     * - **Multi-answer polls** (multiple options selectable).
     *
     * Behavior:
     * - `pollTitle` can be normalized if `normalizeTitleText` is true.
     * - `selections` can be normalized if `normalizeOptionsText` is true.
     *
     * Constraints:
     * - Poll must contain **1–12 options** (`selections` array length).
     *
     * @param chatId - The target chat JID (WhatsApp ID).
     * @param pollTitle - The question/title of the poll.
     * @param selections - Array of answer choices (min 1, max 12).
     * @param pollOptions - Options for poll behavior:
     *   - `withMultiSelect`: If true, allows multiple answers.
     *   - `normalizeTitleText`: Normalize the poll title text.
     *   - `normalizeOptionsText`: Normalize each option string.
     * @param moreOptions - Additional sending options:
     *   - `sendRawWithoutEnqueue`: Send immediately, bypass queue.
     *   - Any other Baileys `Record<string, any>`.
     * @returns Poll autoself-updating obj with the poll actualvotes, in case the poll couldn't be send, will return null instead.
     *
     * @example
     * // Single-answer poll
     * await bot.Poll(chatId, "Favorite color?", ["Red", "Blue", "Green"], { withMultiSelect: false });
     *
     * @example
     * // Multi-answer poll with normalization
     * await bot.Poll(chatId, "Pick your hobbies:", ["  Reading ", " Coding ", "Gaming"], {
     *   withMultiSelect: true,
     *   normalizeOptionsText: true,
     *   normalizeTitleText: true
     * }, { sendRawWithoutEnqueue: true });
     *
     */
    Poll(chatId: string, pollTitle: string, selections: string[], pollParams: WhatsMsgPollOptions, moreOptions?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends a location (geographic coordinates) message to a specific chat.
     *
     * This method allows sharing a point on the map with optional metadata.
     *
     * Behavior:
     * - Validates that the latitude is between **-90 and 90** and longitude is
     *   between **-180 and 180**. If invalid, it throws an error.
     * - Uses the safe queue system unless `sendRawWithoutEnqueue` is set.
     *
     * @param chatId - The target chat JID (WhatsApp ID), e.g. `5216121407908@s.whatsapp.net`.
     * @param ubicationParams - Location parameters:
     *   - `degreesLatitude`: Latitude of the location (range: -90 to 90).
     *   - `degreesLongitude`: Longitude of the location (range: -180 to 180).
     *   - `name` (optional): Short label/name for the location.
     *   - `addressText` (optional): Human-readable address string.
     * @param options - Additional sending options:
     *   - `sendRawWithoutEnqueue`: Send immediately, bypassing the queue.
     *   - Any other Baileys `Record<string, any>`.
     *
     * @returns A `WhatsappMessage` object representing the sent location,
     *          or `null` if the message could not be sent.
     *
     * @example
     * // Send basic coordinates
     * await bot.Ubication(chatId, {
     *   degreesLatitude: 19.4326,
     *   degreesLongitude: -99.1332
     * });
     *
     * @example
     * // Send coordinates with a label and address
     * await bot.Ubication(chatId, {
     *   degreesLatitude: 40.7128,
     *   degreesLongitude: -74.0060,
     *   name: "New York City",
     *   addressText: "NY, USA"
     * }, { sendRawWithoutEnqueue: true });
     */
    Location(chatId: string, ubicationParams: WhatsMsgUbicationOptions, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends a contact card (vCard) to a specific chat.
     *
     * This method generates a valid vCard internally from simple
     * `name` and `phone` fields, so callers don’t need to deal
     * with raw vCard formatting.
     *
     * Supports:
     * - Single contact card
     * - Multiple contact cards (by passing an array of contact info)
     *
     * Behavior:
     * - Phone numbers should include country code (e.g. `5216121407908`).
     * - WhatsApp requires the `waid` parameter inside the vCard to link
     *   the number to a WhatsApp account.
     *
     * @param chatId - The target chat JID (WhatsApp ID).
     * @param contacts - A single contact object or an array of contacts:
     *   - `name`: Display name for the contact.
     *   - `phone`: Phone number in international format (no `+` required).
     * @param options - Additional sending options:
     *   - `sendRawWithoutEnqueue`: Send immediately, bypass queue.
     *   - Any other Baileys `Record<string, any>`.
     *
     * @example
     * // Send one contact
     * await bot.Contact(chatId, { name: "Christian", phone: "52161402883029" });
     *
     * @example
     * // Send multiple contacts
     * await bot.Contact(chatId, [
     *   { name: "Alice", phone: "5211111111111" },
     *   { name: "Bob", phone: "5212222222222" }
     * ]);
     *
     * @note Number follows "countrycode" + "1" + "10 digits number" for latin-american countries like "5216239389304" for example in mexico. Check
     * how your country number displays in international format
     */
    Contact(chatId: string, contacts: {
        name: string;
        phone: string;
    } | Array<{
        name: string;
        phone: string;
    }>, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
}

/**
 * # WhatsApp Socket Sending Module
 *
 * Internal interface defining the core sending capabilities.
 *
 * @example
 * ```typescript
 * const sender: IWhatsSocket_SendingMsgsOnly_Module = socket;
 * ```
 */
interface IWhatsSocket_SendingMsgsOnly_Module {
    /**
     * Send a message to a specific chat ID with content and optionally with other options.
     *
     * _*This is the function you must use to send messages generally.*_
     *
     * _Do not use SendRaw() from this class unless you know what are you doing._
     *
     * This Send() function uses a queue to normalize the quantity of messages to send, to prevent
     * overflow of messages in case this socket has been spammed with msgs from someone.
     *
     * SendRaw() doesn't protect you from that, it's the direct interface to most 'low level'
     * interaction with the socket.
     * @param chatId_JID Whatsapp chat id of the user you want to send the message to (e.g: "1234567890@c.us")
     * @param content The content of the message. It can be a string, a Uint8Array, an object, or a function that returns a string or Uint8Array.
     * @param options A collection of options that can be used to customize the message. Check the type definition of any for more information.
     */
    _SendSafe(chatId_JID: string, content: WhatsappMessageContent, options?: WhatsappMessageOptions): Promise<WhatsappMessage | null>;
    /**
     * Sends a message to a specific chat ID with content and optionally with other options.
     *
     * _Do not use this unless you know what are you doing._
     *
     * This is the direct interface to most 'low level' interaction with the socket.
     * It doesn't protect you from flooding the socket with messages and causing a ban.
     *
     * Use Send() from this class instead, unless you really need to send messages directly
     * to the socket without any kind of protection.
     *
     * @param chatId_JID Whatsapp chat id of the user you want to send the message to (e.g: "1234567890@c.us")
     * @param content The content of the message. It can be a string, a Uint8Array, an object, or a function that returns a string or Uint8Array.
     * @param options A collection of options that can be used to customize the message. Check the type definition of any for more information.
     */
    _SendRaw(chatId_JID: string, content: WhatsappMessageContent, options?: WhatsappMessageOptions): Promise<WhatsappMessage | null>;
}
/**
 * # Minimum Socket Service
 *
 * @example
 * ```typescript
 * const minSender: IMsgServiceSocketMinimum = socket;
 * ```
 */
interface IMsgServiceSocketMinimum extends IWhatsSocket_SendingMsgsOnly_Module {
}
/**
 * # WhatsApp Socket Events Module
 *
 * Event-only module of the WhatsSocket.
 *
 * Provides delegates (C#-like event emitters) for subscribing to lifecycle,
 * message, and group-related events.
 *
 * ## Example: subscribing to a message event
 * ```ts
 * socket.onMessageUpsert.Subscribe((senderId, chatId, msg, msgType, senderType) => {
 *   console.log(`New message in ${chatId}:`, msgType, msg);
 * });
 * ```
 *
 * ## Example: unsubscribing
 * ```ts
 * const handler = (group) => console.log("Entered group:", group.subject);
 * socket.onGroupEnter.Subscribe(handler);
 *
 * // Later...
 * socket.onGroupEnter.Unsubscribe(handler);
 * ```
 *
 * @example
 * ```typescript
 * const events: IWhatsSocket_EventsOnly_Module = socket;
 * ```
 */
interface IWhatsSocket_EventsOnly_Module {
    /**
     * Triggered when the socket restarts (e.g., after a reconnection).
     *
     * Example:
     * ```ts
     * socket.onRestart.Subscribe(async () => {
     *   console.log("Socket restarted. Re-initializing state...");
     * });
     * ```
     */
    onRestart: Delegate<() => Promise<void>>;
    /**
     * Triggered after a message is successfully sent.
     * Useful for verifying delivery or logging outgoing messages.
     *
     * Example:
     * ```ts
     * socket.onSentMessage.Subscribe((chatId, rawContent, misc) => {
     *   console.log(`Sent a message to ${chatId}`, rawContent, misc);
     * });
     * ```
     */
    onSentMessage: Delegate<(chatId: string, rawContentMsg: WhatsappMessageContent, optionalMisc?: WhatsappMessageOptions) => void>;
    /**
     * Triggered when a new raw message arrives.
     *
     * Example:
     * ```ts
     * socket.onMessageUpsert.Subscribe((senderId, chatId, rawMsg, type, senderType) => {
     *   console.log(`[${chatId}] ${senderId}:`, rawMsg);
     * });
     * ```
     */
    onIncomingMsg: Delegate<(senderId_LID: string | null, senderId_PN: string | null, chatId: string, rawMsg: WhatsappMessage, msgType: MsgType, senderType: SenderType) => void>;
    /**
     * Triggered when an already sent message receives an update
     * (e.g., delivery receipts, edits, or reactions).
     *
     * Example:
     * ```ts
     * socket.onMessageUpdate.Subscribe((senderId, chatId, update, type) => {
     *   console.log(`Message update in ${chatId}:`, update);
     * });
     * ```
     */
    onUpdateMsg: Delegate<(senderId_LID: string | null, senderId_PN: string | null, chatId: string, rawMsgUpdate: WhatsappMessage, msgType: MsgType, senderType: SenderType) => void>;
    /**
     * Triggered when the bot enters a group.
     *
     * Example:
     * ```ts
     * socket.onGroupEnter.Subscribe((groupInfo) => {
     *   console.log("Joined group:", groupInfo.subject);
     * });
     * ```
     */
    onGroupEnter: Delegate<(groupInfo: WhatsappGroupMetadata) => void>;
    /**
     * Triggered when a group’s metadata changes
     * (e.g., subject, description, settings).
     *
     * Example:
     * ```ts
     * socket.onGroupUpdate.Subscribe((update) => {
     *   console.log("Group updated:", update);
     * });
     * ```
     */
    onGroupUpdate: Delegate<(groupInfo: Partial<WhatsappGroupMetadata>) => void>;
    /**
     * Triggered once on startup with metadata for all groups
     * the bot is currently a member of.
     *
     * Example:
     * ```ts
     * socket.onStartupAllGroupsIn.Subscribe((groups) => {
     *   console.log("Bot is in groups:", groups.map(g => g.subject));
     * });
     * ```
     */
    onStartupAllGroupsIn: Delegate<(allGroupsIn: WhatsappGroupMetadata[]) => void>;
}
/**
 * # WhatsApp Socket Main Interface
 *
 * Public interface for the WhatsSocket class.
 *
 * Defines the contract for interacting with the WhatsApp socket client.
 *
 * Responsibilities:
 * - Provides modules for sending messages and receiving events.
 * - Manages connection lifecycle (start, shutdown).
 * - Exposes utility methods for chat and group operations.
 *
 * @example
 * ```typescript
 * const socket: IWhatsSocket = new WhatsSocket(options);
 * await socket.Start();
 * ```
 */
interface IWhatsSocket extends IWhatsSocket_SendingMsgsOnly_Module, IWhatsSocket_EventsOnly_Module {
    /**
     * The JID (WhatsApp ID) of the connected account (e.g., "123456789@s.whatsapp.net").
     */
    ownJID: string;
    /**
     * High-level "sugar" sender module for dispatching all types of messages.
     *
     * Supported types: text, images, videos, polls, documents, etc.
     *
     * Prefer this module over raw sending methods since it handles
     * formatting, throttling, and common WhatsApp-specific quirks.
     */
    Send: IWhatsSocket_Submodule_SugarSender;
    /**
     * High-level receive module for handling incoming messages and events.
     *
     * Normally you won’t call this directly—commands and event listeners
     * should be wired to it under the hood. Use it when you need fine-grained
     * control over incoming raw events.
     */
    Receive: IWhatsSocket_Submodule_Receiver;
    Socket: IWhatsappSocketAdapterClient;
    /**
     * Grouped API for WhatsApp group utilities.
     *
     * @example
     * ```typescript
     * const groups = await socket.group.getAll();
     * await socket.group.addParticipants("123@g.us", ["456@s.whatsapp.net"]);
     * ```
     */
    group: IWhatsSocket_Submodule_Group;
    /**
     * Submodule for managing WhatsApp presence states and chat activity.
     */
    Presence: IWhatsSocket_Submodule_Presence;
    /**
     * Establishes the socket connection and starts the client.
     * Must be called before using `Send` or `Receive`.
     */
    Start(): Promise<void>;
    /**
     * Gracefully shuts down the socket connection, cleaning up resources
     * and ensuring the client disconnects properly.
     */
    Shutdown(): Promise<void>;
    /**
     * Retrieves the metadata of a group chat.
     *
     * @param chatId - The chat ID of the group (e.g., "1234567890@g.us").
     * @returns A promise resolving to the group’s metadata object.
     * @throws If the provided chatId does not represent a group.
     *
     * Typical metadata includes:
     * - Group subject (name)
     * - Participant list
     * - Admin information
     * - Group settings
     *
     * @deprecated Use `socket.group.getMetadata(chatId)` instead.
     */
    GetRawGroupMetadata(chatId: string): Promise<WhatsappGroupMetadata>;
    /**
     * Downloads the media payload attached to a raw message.
     *
     * @param rawMsg - Message containing downloadable media.
     * @returns A Uint8Array with the downloaded media.
     */
    DownloadMediaMessage(rawMsg: WhatsappMessage): Promise<Uint8Array>;
    /**
     * Calculates current votes for a poll message.
     *
     * @param pollRawMsg - Original poll creation message.
     * @param pollUpdates - Poll update messages received after creation.
     * @returns The current aggregated poll votes.
     */
    GetPollVotes(pollRawMsg: WhatsappMessage, pollUpdates: WhatsappPollUpdateMessage[]): Promise<WhatsappPollVote[]>;
}

/**
 * # Wait Options
 *
 * Options used to configure the wait message behavior in Receiver module.
 *
 * @example
 * ```typescript
 * const waitOpts: WhatsSocketReceiverWaitOptions = { timeoutSeconds: 10, cancelKeywords: ["stop"], ignoreSelfMessages: true };
 * ```
 */
type WhatsSocketReceiverWaitOptions = {
    /** Maximum time (in seconds) to wait for a valid message before rejecting. */
    timeoutSeconds: number;
    /** Array of keywords that, if present in a message, will cancel the wait. */
    cancelKeywords: string[];
    /** Message sent back to the user if they send a message of the wrong type. */
    wrongTypeFeedbackMsg?: string;
    cancelFeedbackMsg?: string;
    /** Whether to ignore messages sent by the bot itself. Default: true */
    ignoreSelfMessages: boolean;
};
/**
 * # Receiver Error
 *
 * Represents an error that occurs during message reception waiting.
 *
 * @example
 * ```typescript
 * const err: WhatsSocketReceiverError = {
 *   errorMessage: WhatsSocketReceiverMsgError.Timeout,
 *   wasAbortedByUser: false,
 *   chatId: "123",
 *   participantId_LID: null,
 *   participantId_PN: null
 * };
 * ```
 */
type WhatsSocketReceiverError = {
    /** Human-readable error message. */
    errorMessage: WhatsSocketReceiverMsgError;
    /** Whether the wait was aborted because the user sent a cancel keyword. */
    wasAbortedByUser: boolean;
    /**
     * If this error msg comes from group, this will be the participant ID who
     * triggered this waiting msg.
     * Otherwise, if this comes from private chat, will be null
     */
    participantId_LID: string | null;
    participantId_PN: string | null;
    /**
     * Whatsapp chat ID where this msgError came from
     */
    chatId: string;
};
/**
 * # Receiver Error Reason
 *
 * Enumeration mapping the reason for the receiver failure.
 *
 * @example
 * ```typescript
 * const reason = WhatsSocketReceiverMsgError.Timeout;
 * ```
 */
declare enum WhatsSocketReceiverMsgError {
    Timeout = "User didn't responded in time",
    UserCanceledWaiting = "User has canceled the dialog"
}
/**
 * # Is Receiver Error
 *
 * Checks if an object is a `WhatsSocketReceiverError`. This error comes from ChatContext if using "Wait" methods,
 * or directly from WhatsMsgReceiver Submodule.
 *
 * @param anything The thing to check.
 * @returns Whether `anything` is a `WhatsSocketReceiverError`.
 * @category Internal
 *
 * @example
 * ```typescript
 * if(WhatsSocketReceiverHelper_isReceiverError(error)) {
 *   console.log(error.errorMessage);
 * }
 * ```
 */
declare function WhatsSocketReceiverHelper_isReceiverError(anything: unknown): anything is WhatsSocketReceiverError;
/**
 * # Receiver Submodule
 *
 * Submodule responsible for listening and waiting for messages through a WhatsSocket instance.
 *
 * @example
 * ```typescript
 * const receiver = new WhatsSocket_Submodule_Receiver(socket);
 * ```
 */
declare class WhatsSocket_Submodule_Receiver implements IWhatsSocket_Submodule_Receiver {
    private _whatsSocket;
    /**
     * @param socket - An instance of a WhatsSocket (must implement IWhatsSocket).
     */
    constructor(socket: IWhatsSocket);
    /**
     * @deprecated ⚠️ **DEPRECATED**: This method has been moved to the `group` submodule for better architectural consistency.
     *
     * Please use the new `FetchGroupData` method from the `group` submodule instead.
     *
     * @example
     * **Old Way (Deprecated):**
     * ```ts
     * const groupData = await socket.Receive.FetchGroupData("123@g.us");
     * ```
     *
     * **New Way:**
     * ```ts
     * const groupData = await socket.group.FetchGroupData("123@g.us");
     * ```
     *
     * @param chatId - The WhatsApp ID of the group.
     * @returns A promise resolving to `GroupMetadataInfo` or `null`.
     */
    FetchGroupData(chatId: string): Promise<GroupMetadataInfo | null>;
    /**
     * Internal helper that waits for the next message satisfying a success condition.
     * Cancel logic and MsgType checking validation is made here, do not do it on successConditionCallback
     *
     * @param successConditionCallback - Callback to determine if the message meets the success criteria.
     * @param chatIdToLookFor - Chat ID where the message should arrive.
     * @param expectedMsgType - Expected type of the message.
     * @param options - Configuration options for timeout, cancel keywords, etc.
     * @returns Promise that resolves with the WhatsappMessage that met the condition or rejects with an error.
     */
    private _waitNextMsg;
    WaitUntilNextRawMsgFromUserIDInGroup(userID_LID_ToWait: string | null, userID_PN_toWait: string | null, chatToWaitOnID: string, expectedMsgType: MsgType, options: WhatsSocketReceiverWaitOptions): Promise<WhatsappMessage>;
    WaitUntilNextRawMsgFromUserIdInPrivateConversation(chatIdPrivateUserToWait: string, expectedMsgType: MsgType, options: WhatsSocketReceiverWaitOptions): Promise<WhatsappMessage>;
    DownloadMediaMessage(rawMsg: WhatsappMessage): Promise<Uint8Array>;
}
/**
 * # Participant Information
 *
 * Represents a participant in a WhatsApp group.
 *
 * @example
 * ```typescript
 * const pInfo: ParticipantInfo = { isAdmin: true, rawId: "123" };
 * ```
 */
type ParticipantInfo = {
    /** Whether this participant is an admin */
    isAdmin: boolean;
} & WhatsappIDInfo;
/**
 * # Group Metadata
 *
 * Represents all relevant metadata for a WhatsApp group chat.
 *
 * @example
 * ```typescript
 * // const metadata: GroupMetadataInfo = await receiver.FetchGroupData("123@g.us");
 * ```
 */
type GroupMetadataInfo = {
    /** Group ID */
    id: string;
    /** Sending mode of the group */
    sendingMode: WhatsappIdType;
    /** Name of the group owner */
    ownerName: string | null;
    /** Display name of the group */
    groupName: string;
    /** Group description */
    groupDescription: string | null;
    /** ID of the parent community if the group belongs to one */
    communityIdWhereItBelongs: string | null;
    /** Whether only admins can change group settings */
    onlyAdminsCanChangeGroupSettings: boolean | null;
    /** Whether only admins can send messages */
    onlyAdminsCanSendMsgs: boolean | null;
    /** Whether members can add other members */
    membersCanAddOtherMembers: boolean | null;
    /** Whether joining requires approval */
    needsRequestApprovalToJoinIn: boolean | null;
    /** Whether the group is a community announce channel */
    isCommunityAnnounceChannel: boolean | null;
    /** Total number of participants */
    membersCount: number | null;
    /** Ephemeral message duration in seconds, if enabled */
    ephemeralDuration: number | null;
    /** Invite code for the group */
    inviteCode: string | null;
    /** Timestamp of the last group name change */
    lastNameChangeDateTime: number | null;
    /** The person who added the bot or changed a setting */
    author: string | null;
    /** Timestamp of group creation */
    creationDate: number | null;
    /** Array of group participants */
    members: ParticipantInfo[];
};

/**
 * # WhatsSocket Group Submodule
 *
 * Public grouped API for WhatsApp group utilities.
 *
 * @example
 * ```typescript
 * const groups = await socket.group.getAll();
 * const isAdmin = await socket.group.isBotAdmin("123@g.us");
 * ```
 */
interface IWhatsSocket_Submodule_Group {
    /**
     * Normalizes any WhatsApp JID into the vendor canonical form.
     *
     * @param jid - WhatsApp JID to normalize.
     * @returns The normalized WhatsApp JID.
     *
     * @example
     * ```typescript
     * const jid = socket.group.normalizeJid("123@s.whatsapp.net");
     * ```
     */
    NormalizeJid(jid: string): string;
    /**
     * Gets the connected bot account JID.
     *
     * @returns The normalized bot JID.
     *
     * @example
     * ```typescript
     * const botJid = socket.group.getBotJid();
     * ```
     */
    GetBotJid(): string;
    /**
     * Fetches raw metadata for one group.
     *
     * @param groupId - WhatsApp group JID.
     * @returns Group metadata.
     *
     * @example
     * ```typescript
     * const metadata = await socket.group.getMetadata("123@g.us");
     * ```
     */
    GetMetadata(groupId: string): Promise<WhatsappGroupMetadata>;
    /**
     * Fetches every group the bot is participating in.
     *
     * @returns All participating group metadata.
     *
     * @example
     * ```typescript
     * const groups = await socket.group.getAll();
     * ```
     */
    GetAll(): Promise<WhatsappGroupMetadata[]>;
    /**
     * Finds a participating group by its exact subject.
     *
     * @param name - Group subject to search for.
     * @returns Matching metadata or `null`.
     *
     * @example
     * ```typescript
     * const group = await socket.group.findByName("Team");
     * ```
     */
    FindByName(name: string): Promise<WhatsappGroupMetadata | null>;
    /**
     * Checks whether the bot is an admin in a group.
     *
     * @param groupId - WhatsApp group JID.
     * @returns `true` when the bot is admin or superadmin.
     *
     * @example
     * ```typescript
     * if (await socket.group.isBotAdmin("123@g.us")) {
     *   await socket.group.addParticipants("123@g.us", ["456@s.whatsapp.net"]);
     * }
     * ```
     */
    IsBotAdmin(groupId: string): Promise<boolean>;
    /**
     * # Update Group Participants
     *
     * Executes a participant action (add, remove, promote, demote) on a group.
     * Internal method typically wrapped by specific action methods.
     *
     * @param groupId - WhatsApp group JID.
     * @param participants - Array of participant JIDs.
     * @param action - Action to perform (`WhatsappGroupParticipantAction`).
     * @returns A boolean indicating if the action was executed successfully.
     *
     * @example
     * ```typescript
     * const success = await socket.group.updateParticipants("123@g.us", ["456@s.whatsapp.net"], "add");
     * ```
     */
    UpdateParticipants(groupId: string, participants: string[], action: WhatsappGroupParticipantAction): Promise<boolean>;
    /**
     * # Add Participants
     *
     * Adds new participants to the group. The bot must be an admin.
     *
     * @param groupId - WhatsApp group JID.
     * @param participants - Array of participant JIDs to add.
     * @returns A boolean indicating if the additions were executed successfully.
     *
     * @example
     * ```typescript
     * const success = await socket.group.addParticipants("123@g.us", ["456@s.whatsapp.net", "789@s.whatsapp.net"]);
     * ```
     */
    AddParticipants(groupId: string, participants: string[]): Promise<boolean>;
    /**
     * # Remove Participants
     *
     * Removes existing participants from the group. The bot must be an admin.
     *
     * @param groupId - WhatsApp group JID.
     * @param participants - Array of participant JIDs to remove.
     * @returns A boolean indicating if the removals were executed successfully.
     *
     * @example
     * ```typescript
     * const success = await socket.group.removeParticipants("123@g.us", ["456@s.whatsapp.net"]);
     * ```
     */
    RemoveParticipants(groupId: string, participants: string[]): Promise<boolean>;
    /**
     * # Promote Participants
     *
     * Promotes regular participants to admins. The bot must be an admin.
     *
     * @param groupId - WhatsApp group JID.
     * @param participants - Array of participant JIDs to promote.
     * @returns A boolean indicating if the promotions were executed successfully.
     *
     * @example
     * ```typescript
     * const success = await socket.group.promoteParticipants("123@g.us", ["456@s.whatsapp.net"]);
     * ```
     */
    PromoteParticipants(groupId: string, participants: string[]): Promise<boolean>;
    /**
     * # Demote Participants
     *
     * Demotes admins to regular participants. The bot must be an admin.
     *
     * @param groupId - WhatsApp group JID.
     * @param participants - Array of participant JIDs to demote.
     * @returns A boolean indicating if the demotions were executed successfully.
     *
     * @example
     * ```typescript
     * const success = await socket.group.demoteParticipants("123@g.us", ["456@s.whatsapp.net"]);
     * ```
     */
    DemoteParticipants(groupId: string, participants: string[]): Promise<boolean>;
    /**
     * # Remove All Participants
     *
     * Removes every non-admin participant from the group. The bot must be an admin.
     *
     * @param groupId - WhatsApp group JID.
     * @returns Resolves when the operation is complete.
     *
     * @example
     * ```typescript
     * await socket.group.removeAllParticipants("123@g.us");
     * ```
     */
    RemoveAllParticipants(groupId: string): Promise<void>;
    /**
     * # Leave Group
     *
     * Instructs the bot to leave the specified group.
     *
     * @param groupId - WhatsApp group JID.
     * @returns Resolves when the bot successfully leaves.
     *
     * @example
     * ```typescript
     * await socket.group.leave("123@g.us");
     * ```
     */
    Leave(groupId: string): Promise<void>;
    /**
     * # Delete Chat
     *
     * Deletes the specified chat from the bot's local chat history.
     *
     * @param groupId - WhatsApp group JID.
     * @returns Resolves when the chat is deleted locally.
     *
     * @example
     * ```typescript
     * await socket.group.deleteChat("123@g.us");
     * ```
     */
    DeleteChat(groupId: string): Promise<void>;
    /**
     * # Cleanup Group
     *
     * Removes all participants and then leaves and deletes the group.
     * Equivalent to a full group wipe out.
     *
     * @param groupId - WhatsApp group JID.
     * @returns Resolves when cleanup is entirely complete.
     *
     * @example
     * ```typescript
     * await socket.group.cleanup("123@g.us");
     * ```
     */
    Cleanup(groupId: string): Promise<void>;
    /**
     * # Fetch Group Data
     *
     * Retrieves metadata about a WhatsApp group chat.
     *
     * This method fetches all relevant information from the WhatsApp group,
     * including the list of participants, group owner, description, invite code, and
     * group settings like whether only admins can send messages or change group settings.
     *
     * @param chatId - The WhatsApp ID of the group to fetch metadata for.
     * @returns A promise resolving to `GroupMetadataInfo` containing the group metadata,
     *          or `null` if the metadata could not be retrieved.
     *
     * @example
     * ```typescript
     * const groupId = "123456789-987654321@g.us";
     * const groupData = await socket.group.FetchGroupData(groupId);
     *
     * if (groupData) {
     *   console.log("Group Name:", groupData.groupName);
     *   console.log("Participants:", groupData.members.map(m => m.rawId));
     * } else {
     *   console.error("Failed to fetch group metadata.");
     * }
     * ```
     */
    FetchGroupData(chatId: string): Promise<GroupMetadataInfo | null>;
}

/**
 * # Group Submodule
 *
 * Developer-friendly group utilities backed by the active WhatsApp adapter.
 *
 * @example
 * ```typescript
 * const groups = await socket.group.getAll();
 * const isAdmin = await socket.group.isBotAdmin("123@g.us");
 * ```
 */
declare class WhatsSocket_Submodule_Group implements IWhatsSocket_Submodule_Group {
    private readonly socket;
    /**
     * Creates a group utility wrapper around the high-level WhatsSocket.
     *
     * @param socket - Active WhatsSocket instance.
     */
    constructor(socket: IWhatsSocket);
    NormalizeJid(jid: string): string;
    GetBotJid(): string;
    GetMetadata(groupId: string): Promise<WhatsappGroupMetadata>;
    GetAll(): Promise<WhatsappGroupMetadata[]>;
    FindByName(name: string): Promise<WhatsappGroupMetadata | null>;
    IsBotAdmin(groupId: string): Promise<boolean>;
    UpdateParticipants(groupId: string, participants: string[], action: WhatsappGroupParticipantAction): Promise<boolean>;
    AddParticipants(groupId: string, participants: string[]): Promise<boolean>;
    RemoveParticipants(groupId: string, participants: string[]): Promise<boolean>;
    PromoteParticipants(groupId: string, participants: string[]): Promise<boolean>;
    DemoteParticipants(groupId: string, participants: string[]): Promise<boolean>;
    RemoveAllParticipants(groupId: string): Promise<void>;
    Leave(groupId: string): Promise<void>;
    DeleteChat(groupId: string): Promise<void>;
    Cleanup(groupId: string): Promise<void>;
    FetchGroupData(chatId: string): Promise<GroupMetadataInfo | null>;
    private _assertGroupId;
    private _assertNotEmpty;
    private _assertValidAction;
}

declare class WhatsSocket_Submodule_Presence implements IWhatsSocket_Submodule_Presence {
    private readonly _parent;
    constructor(parent: IWhatsSocket);
    SetGlobalPresenceState(state: WhatsappPresenceState): Promise<boolean>;
    StartTyping(jid: string): Promise<boolean>;
    StopTyping(jid: string): Promise<boolean>;
    StartRecording(jid: string): Promise<boolean>;
    StopRecording(jid: string): Promise<boolean>;
    WithTyping<T>(jid: string, action: () => Promise<T>): Promise<T>;
    WithRecording<T>(jid: string, action: () => Promise<T>): Promise<T>;
}

/**
 * # Sugar Sender Submodule
 *
 * A utility class for sending various types of WhatsApp messages with simplified APIs.
 * This class acts as a wrapper around the core WhatsApp socket functionality,
 * providing methods to send text, images, videos, audio, stickers, documents,
 * polls, locations, and contacts with proper validation and formatting.
 *
 * @remarks
 * - All methods support optional sending configurations, such as bypassing the
 *   safe queue system or mentioning users.
 * - Media-related methods validate file existence and MIME types before sending.
 * - The class accepts vendor-neutral message options for additional
 *   message customization.
 *
 * @example
 * ```typescript
 * const sender = new WhatsSocket_Submodule_SugarSender(socket);
 * await sender.Text("123@s.whatsapp.net", "Hello World!");
 * ```
 */
declare class WhatsSocket_Submodule_SugarSender implements IWhatsSocket_Submodule_SugarSender {
    /** Strong dependency, needs to be inejcted from constructor */
    private socket;
    /**
     * Initializes the SugarSender with a WhatsApp socket instance.
     *
     * @param socket - The WhatsApp socket instance used for sending messages.
     */
    constructor(socket: IWhatsSocket);
    Text(chatId: string, text: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    Image(chatId: string, imageOptions: WhatsMsgMediaOptions, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    ReactEmojiToMsg(chatId: string, rawMsgToReactTo: WhatsappMessage, emojiStr: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    Sticker(chatId: string, stickerUrlSource: string | Uint8Array, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    Audio(chatId: string, audioParams: WhatsMsgAudioOptions, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    Video(chatId: string, videoParams: WhatsMsgMediaOptions, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    Document(chatId: string, docParams: WhatsMsgDocumentOptions, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    Poll(chatId: string, pollTitle: string, selections: string[], pollParams: WhatsMsgPollOptions, moreOptions?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    Location(chatId: string, ubicationParams: WhatsMsgUbicationOptions, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    Contact(chatId: string, contacts: {
        name: string;
        phone: string;
    } | Array<{
        name: string;
        phone: string;
    }>, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Selects the sending method based on the options provided.
     *
     * If `options` is not provided or `sendRawWithoutEnqueue` is false,
     * the safe queue system will be used to send the message.
     *
     * If `options.sendRawWithoutEnqueue` is true, the message will be
     * sent immediately without using the safe queue system.
     *
     * @param options - The sending options, or undefined to use the default behavior.
     * @returns The method to call to send the message.
     */
    private _getSendingMethod;
}

/**
 * # WhatsApp Socket Options
 *
 * Configuration options for the WhatsApp Socket behavior.
 *
 * @example
 * ```typescript
 * const options: WhatsSocketOptions = { loggerMode: "silent", maxReconnectionRetries: 3, ownWhatsSocketVendorFactory_Internal: vendorFactory };
 * ```
 */
type WhatsSocketOptions = {
    /**
     * Determines the logging level of the WhatsSocket instance.
     * - "debug": full details for troubleshooting.
     * - "silent": minimal output (no logs).
     *
     * @default "debug"
     */
    loggerMode?: WhatsSocketLoggerMode;
    /**
     * Path to the folder where authentication credentials are stored.
     * Can be relative to the project root or the current working directory.
     *
     * @default "./auth"
     */
    credentialsFolder?: string;
    /**
     * Maximum number of reconnection attempts if the socket encounters errors.
     *
     * @default 5
     */
    maxReconnectionRetries?: number;
    /**
     * If true, the socket ignores messages sent by itself, so they won't trigger
     * the 'onIncomingMessage' event.
     *
     * @default true
     */
    ignoreSelfMessage?: boolean;
    /**
     * Maximum number of messages that can be queued for sending globally.
     * Useful for buffering pending messages if the bot receives many messages
     * in a short time.
     *
     * @default 20
     */
    senderQueueMaxLimit?: number;
    /**
     * Delay (in milliseconds) between sending queued messages.
     * Helps prevent spamming or flooding when sending many messages rapidly.
     *
     * @default 100
     */
    delayMilisecondsBetweenMsgs?: number;
    /**
     * Vendor factory used to create the internal WhatsApp socket client.
     * `WhatsSocket` does not create a default vendor by itself; callers must provide one.
     */
    ownWhatsSocketVendorFactory_Internal: IWhatsappAdapter;
};
/**
 * # WhatsApp Socket Core
 *
 * Class used to interact with the configured WhatsApp vendor client.
 * Will start the socket and keep it connected until you call the Shutdown method.
 * Provides some events you can subscribe to, to get notified when different things happen.
 *
 * @example
 * ```typescript
 * const socket = new WhatsSocket({
 *    credentialsFolder: "./auth",
 *    loggerMode: "silent",
 *    maxReconnectionRetries: 5,
 *    ignoreSelfMessage: true,
 *    ownWhatsSocketVendorFactory_Internal: vendorFactory
 * });
 *
 * socket.onIncomingMsg.Subscribe((senderId, chatId, rawMsg, msgType, senderType) => {
 *    console.log(`Msg: ${msgType} | SenderId: ${senderId}`);
 * });
 *
 * socket.Start().then(() => {
 *    console.log("WhatsSocket initialized successfully!");
 * }).catch((error) => {
 *    console.error("Error initializing WhatsSocket:", error);
 * });
 * ```
 */
declare class WhatsSocket implements IWhatsSocket {
    onIncomingMsg: Delegate<(senderId_LID: string | null, sender_PN: string | null, chatId: string, rawMsg: WhatsappMessage, msgType: MsgType, senderType: SenderType) => void>;
    onUpdateMsg: Delegate<(senderId_LID: string | null, senderId_PN: string | null, chatId: string, rawMsgUpdate: WhatsappMessage, msgType: MsgType, senderType: SenderType) => void>;
    onSentMessage: Delegate<(chatId: string, rawContentMsg: WhatsappMessageContent, optionalMisc?: WhatsappMessageOptions) => void>;
    onRestart: Delegate<() => Promise<void>>;
    onGroupEnter: Delegate<(groupInfo: WhatsappGroupMetadata) => void>;
    onGroupUpdate: Delegate<(groupInfo: Partial<WhatsappGroupMetadata>) => void>;
    onStartupAllGroupsIn: Delegate<(allGroupsIn: WhatsappGroupMetadata[]) => void>;
    get ownJID(): string;
    Socket: IWhatsappSocketAdapterClient;
    private _senderQueue;
    /**
     * Sender module and sugar layer for sending all kinds of msgs.
     * Text, Images, Videos, Polls, etc...
     */
    Send: WhatsSocket_Submodule_SugarSender;
    /**
     * Receive internal module. To wait for someone msg's.
     */
    Receive: WhatsSocket_Submodule_Receiver;
    /**
     * Group utility module for metadata, participant updates, and cleanup actions.
     */
    group: WhatsSocket_Submodule_Group;
    /**
     * Presence submodule for managing WhatsApp presence states and chat activity.
     */
    Presence: WhatsSocket_Submodule_Presence;
    ActualReconnectionRetries: number;
    private _loggerMode;
    private _ignoreSelfMessages;
    private _maxReconnectionRetries;
    private _senderQueueMaxLimit;
    private _milisecondsDelayBetweenSentMsgs;
    private _socketVendorFactory;
    constructor(options: WhatsSocketOptions);
    private _isRestarting;
    /**
     * Initializes the WhatsSocket instance and start connecting to Whatsapp.
     * After this method is called, the socket will be listening for incoming messages and events all the time.
     * Can be canceled and shutdown by calling the `Shutdown` method.
     * @returns A promise that will be running in the background all the time until the socket is closed.
     */
    Start(): Promise<void>;
    /**
     * Restarts the socket by shutting down current one and then starting a new instance, effectively "restarting" the socket.
     * @returns A promise that will be running in the background all the time until the socket is closed.
     */
    Restart(): Promise<void>;
    private _initializeSelf;
    private InitializeInternalSocket;
    Shutdown(): Promise<void>;
    private ConfigureReconnection;
    private ConfigureMessageIncoming;
    private ConfigureMessagesUpdates;
    /**
     * Gets the metadata of a group chat by its chat ID. (e.g: "23423423123@g.us")
     * @param chatId The chat ID of the group you want to get metadata from.
     * @throws Will throw an error if the provided chatId is not a group chat ID
     * @returns A promise that resolves to the group metadata.
     */
    GetRawGroupMetadata(chatId: string): Promise<WhatsappGroupMetadata>;
    private ConfigureGroupsEnter;
    private ConfigureGroupsUpdates;
    _SendSafe(chatId_JID: string, content: WhatsappMessageContent, options?: WhatsappMessageOptions): Promise<WhatsappMessage | null>;
    _SendRaw(chatId_JID: string, content: WhatsappMessageContent, options?: WhatsappMessageOptions): Promise<WhatsappMessage | null>;
    DownloadMediaMessage(rawMsg: WhatsappMessage): Promise<Uint8Array>;
    GetPollVotes(pollRawMsg: WhatsappMessage, pollUpdates: WhatsappPollUpdateMessage[]): Promise<WhatsappPollVote[]>;
}

interface IChatContext_PresenceAPI {
    SetGlobalPresenceState(state: WhatsappPresenceState): Promise<boolean>;
    StartTyping(): Promise<boolean>;
    StopTyping(): Promise<boolean>;
    StartRecording(): Promise<boolean>;
    StopRecording(): Promise<boolean>;
    WithTyping<T>(action: () => Promise<T>): Promise<T>;
    WithRecording<T>(action: () => Promise<T>): Promise<T>;
}
/**
 * # Chat Context Ubication
 *
 * Represents a location shared in a chat.
 *
 * @example
 * ```typescript
 * const location: ChatContextUbication = { degreesLatitude: 40.7128, degreesLongitude: -74.0060, thumbnailJpegBuffer: null, isLive: false };
 * ```
 */
type ChatContextUbication = {
    /** Latitude in decimal degrees */
    degreesLatitude: number;
    /** Longitude in decimal degrees */
    degreesLongitude: number;
    /** Optional JPEG thumbnail preview of the location */
    thumbnailJpegBuffer: Uint8Array | null;
    /** Whether the location is live/real-time */
    isLive: boolean | null;
};
/**
 * # Chat Context Contact Result
 *
 * Represents a contact shared in a chat.
 *
 * @example
 * ```typescript
 * const contact: ChatContextContactRes = { name: "John Doe", number: "123456789", whatsappId_PN: "123456789@s.whatsapp.net" };
 * ```
 */
type ChatContextContactRes = {
    /** Display name of the contact */
    name: string;
    /** Phone number of the contact */
    number: string;
    /** WhatsApp ID of the contact */
    whatsappId_PN: string;
};
/**
 * # Chat Context Interface
 *
 * Interface for the ChatContext sugar-layer abstraction.
 *
 * Simplifies sending/receiving messages bound to a fixed chat.
 * Encapsulates all common bot patterns and helpers.
 *
 * @example
 * ```typescript
 * async function run(ctx: IChatContext) {
 *   await ctx.SendText("Hello");
 * }
 * ```
 */
interface IChatContext {
    /**
     * The unique ID of the original participant who triggered
     * this session, if available.
     *
     * - `null` when the origin is a system event or when the
     *   participant cannot be resolved.
     * - Typically corresponds to a phone number JID or group member JID.
     *
     * **Immutable**: set only in the constructor.
     */
    readonly FixedParticipantPN: string | null;
    readonly FixedParticipantLID: string | null;
    /**
     * The WhatsApp chat ID this session is permanently bound to.
     *
     * - Always points to a valid chat JID (user, group, or broadcast).
     * - Remains constant for the lifetime of the session.
     */
    readonly FixedChatId: string;
    /**
     * The initial WhatsApp message that triggered creation of this context.
     *
     * Use this when you need the message payload itself (e.g., replying,
     * quoting, or inspecting structured message content).
     */
    readonly InitialMsg: WhatsappMessage | null;
    /**
     * Indicates the type of the original sender (user, group, system, etc.)
     * extracted from the initial message.
     *
     * This is derived at construction time and remains constant.
     */
    readonly FixedSenderType: SenderType;
    /**
     * Configuration options for this chat context.
     *
     * Provides toggles, timeouts, or feature flags that control
     * how the session should behave.
     */
    Config: IChatContextConfig;
    /**
     * Group helpers scoped to this context's fixed chat.
     *
     * @example
     * ```typescript
     * if (await ctx.group.isBotAdmin()) {
     *   await ctx.group.removeParticipants(["123@s.whatsapp.net"]);
     * }
     * ```
     */
    Group: IWhatsSocket_Submodule_Group;
    /**
     * Presence helpers scoped to this context's fixed chat.
     *
     * @example
     * ```typescript
     * await ctx.Presence.StartTyping();
     * ```
     */
    Presence: IChatContext_PresenceAPI;
    /**
     * Sends a plain text message to the chat.
     *
     * @param text - Message body
     * @param options - Optional send configuration
     * @returns The WhatsApp message object, or `null` if sending failed
     */
    SendText(text: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    /**
     * Sends an image without a caption.
     *
     * @param imagePath - Local file path to the image
     * @param options - Optional send configuration
     * @returns The WhatsApp message object, or `null` if sending failed
     *
     *  Behavior:
     * - Reads the image file from `imagePath` into memory and attaches it.
     * - Mentions are injected if `mentionsIds` is specified.
     */
    SendImg(imagePath: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    /**
     * Sends an image to a WhatsApp chat from a local file path.
     *
     * @param imagePath - Path to the local image file.
     * @param caption - Text caption to include with the image.
     * @param options - Optional configuration for sending the message.
     * @returns A promise that resolves to the sent WhatsApp message object, or `null` if sending fails.
     *
     * @remarks
     * - Reads the image from the provided `imagePath` into memory before sending.
     * - If `options.normalizeMessageText` is `true`, the caption will be cleaned/normalized.
     * - Mentions can be included using `options.mentionsIds`.
     */
    SendImgWithCaption(imagePath: string, caption: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    /**
     * Sends an image to a WhatsApp chat from a Uint8Array.
     *
     * @param imageBuffer - The image as a Uint8Array (ArrayBuffer).
     * @param extensionType - The image file extension/type (e.g., "png", "jpg").
     * @param options - Optional configuration for sending the message.
     * @returns A promise that resolves to the sent WhatsApp message object, or `null` if sending fails.
     *
     * @remarks
     * - Useful when the image is generated or received dynamically and not saved on disk.
     * - This method does not include a caption. Use `SendImgFromBufferWithCaption` for captioned images.
     */
    SendImgFromBuffer(imageBuffer: Uint8Array, extensionType: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    /**
     * Sends an image to a WhatsApp chat from a Uint8Array with a caption.
     *
     * @param imagePath - The image as a Uint8Array (ArrayBuffer).
     * @param extensionType - The image file extension/type (e.g., "png", "jpg").
     * @param caption - Text caption to include with the image.
     * @param options - Optional configuration for sending the message.
     * @returns A promise that resolves to the sent WhatsApp message object, or `null` if sending fails.
     *
     * @remarks
     * - Combines the behavior of `SendImgFromBuffer` and `SendImgWithCaption`.
     * - Useful for sending dynamically created images along with captions.
     * - Supports normalization and mentions if specified in `options`.
     */
    SendImgFromBufferWithCaption(imagePath: Uint8Array, extensionType: string, caption: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    /**
     * Reacts with an emoji to a specific message.
     *
     * @param msgToReactTo - The message to react to
     * @param emojiStr - Emoji string (e.g. "✅", "❌")
     * @param options - Optional send configuration
     * @returns The WhatsApp message object, or `null` if sending failed
     */
    SendReactEmojiTo(msgToReactTo: WhatsappMessage, emojiStr: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Reacts with an emoji to the initial message that started the session.
     *
     * @param emojiStr - Emoji string (e.g. "✅", "❌")
     * @param options - Optional send configuration
     * @returns The WhatsApp message object, or `null` if sending failed
     *
     * Behavior:
     * - If the emoji string is not a single emoji character, throws an error.
     * - If the emoji reaction is valid, sends it to the target chat.
     */
    SendReactEmojiToInitialMsg(emojiStr: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Reacts with a ✅ emoji to the initial message.
     *
     * Typically used to indicate that the command completed successfully.
     *
     * @param options - Optional send configuration
     * @returns The WhatsApp message object, or `null` if sending failed
     */
    Ok(options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Reacts with a ⌛ emoji to the initial message.
     *
     * Typically used to indicate that the command is loading.
     *
     * @param options - Optional send configuration
     * @returns The WhatsApp message object, or `null` if sending failed
     */
    Loading(options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Reacts with a ❌ emoji to the initial message.
     *
     * Typically used to indicate that the command failed or was invalid.
     *
     * @param options - Optional send configuration
     * @returns The WhatsApp message object, or `null` if sending failed
     */
    Fail(options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends a sticker
     *
     * This method supports sending stickers from either:
     * 1. A **local file or Uint8Array** containing WebP data.
     * 2. A **remote URL** pointing to an accessible image (e.g., WebP hosted publicly).
     *
     * If `stickerUrlSource` is a `Uint8Array`, it will be sent directly.
     * If it is a `string` URL, Baileys will attempt to fetch the content from that URL.
     *
     * @param stickerUrlSource - The sticker content to send:
     *   - `Uint8Array`: Directly sends the WebP sticker.
     *   - `string`: A public URL pointing to the sticker file. Note: WhatsApp encrypted `.enc` URLs **will not work** unless downloaded and decrypted first.
     * @param options - Optional sending options:
     *   - `sendRawWithoutEnqueue`: If true, bypasses the safe queue system and sends immediately.
     *   - Any other Baileys `MiscMessageGenerationOptions` like `quoted`, `contextInfo`, etc.
     *
     * @example
     * // Send a local WebP sticker
     * await bot.Sticker(chatId, fs.readFileSync('./stickers/dog.webp'));
     *
     * @example
     * // Send a public URL sticker (must be directly accessible)
     * await bot.Sticker(chatId, 'https://example.com/sticker.webp');
     *
     */
    SendSticker(stickerUrlSource: string | Uint8Array, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends an audio message to cha.
     *
     * This method supports sending audio from:
     * 1. A **local file path** (MP3, OGG, M4A, etc.).
     *
     * @param audioSource - The audio content to send:
     *   - `string`: Either a local file path or a public URL, it will be converted to absolute path if relative given.
     *   - `WAMessage`: A WhatsApp message object containing an audioMessage.
     * @param audioFormat The audio format should be treated for. (e.g "mp3", "ogg", "flac")
     * @param options - Optional sending options:
     *   - `sendRawWithoutEnqueue`: If true, bypasses the safe queue system and sends immediately.
     *   - Any other Baileys `MiscMessageGenerationOptions` like `quoted`, `contextInfo`, etc.
     *
     * @example
     * // Send a local MP3
     * await bot.Audio(chatId, './audios/voice.mp3');
     *
     * @example
     * // Send a remote URL audio
     * await bot.Audio(chatId, 'https://example.com/audio.mp3');
     *
     * @example
     * // Forward a received WhatsApp audio message
     * await bot.Audio(chatId, receivedMessage);
     */
    SendAudio(audioSource: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends an audio message to a WhatsApp chat from a Uint8Array.
     *
     * @param audioSource - Audio content as a `Uint8Array`.
     * @param formatFile - File format/extension of the audio (e.g., "mp3", "ogg").
     * @param options - Optional configuration for sending the message.
     * @returns A promise that resolves to the sent WhatsApp message object, or `null` if sending fails.
     *
     * @remarks
     * - Useful for sending audio that is generated or downloaded dynamically and not saved on disk.
     * - The `formatFile` parameter ensures WhatsApp knows how to handle the audio format correctly.
     * - Supports optional normalization, mentions, or other sending options via `options`.
     */
    SendAudioFromBuffer(audioSource: Uint8Array, formatFile: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends a video message from a local file path.
     *
     * @param videoPath - Absolute or relative path to the video file (MP4, MOV, AVI, etc.).
     * @param options - Optional configuration for sending the message:
     *   - `normalizeMessageText`: Normalize caption text (default: true).
     *   - `mentionsIds`: Array of user IDs to mention.
     *   - `sendRawWithoutEnqueue`: Send immediately, bypassing the queue.
     *   - Any other Baileys `MiscMessageGenerationOptions`.
     * @returns A promise that resolves to the sent WhatsApp message object, or `null` if sending fails.
     *
     * @remarks
     * - MIME type is inferred from file extension:
     *   - `.mov` → `video/mov`
     *   - `.avi` → `video/avi`
     *   - Otherwise → `video/mp4`
     *
     * @example
     * // Send a local MP4 video
     * await chatContext.SendVideo("./video.mp4");
     *
     * @example
     * // Send a local AVI video mentioning specific users
     * await chatContext.SendVideo("./clip.avi", { mentionsIds: ["12345@s.whatsapp.net"] });
     */
    SendVideo(videoPath: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    /**
     * Sends a video message with a caption from a local file path.
     *
     * @param videoPath - Absolute or relative path to the video file.
     * @param caption - Text caption to include with the video.
     * @param options - Optional configuration for sending the message.
     * @returns A promise that resolves to the sent WhatsApp message object, or `null` if sending fails.
     *
     * @remarks
     * - MIME type detection and safe queue system are the same as `SendVideo`.
     *
     * @example
     * // Send MP4 video with caption
     * await chatContext.SendVideoWithCaption("./video.mp4", "Check this out!");
     *
     * @example
     * // Send MOV video with caption and immediate sending
     * await chatContext.SendVideoWithCaption("./clip.mov", "Important!", { sendRawWithoutEnqueue: true });
     */
    SendVideoWithCaption(videoPath: string, caption: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    /**
     * Sends a video message from a Uint8Array.
     *
     * @param videoBuffer - Video content as a `Uint8Array`.
     * @param formatFile - File format/extension of the video (e.g., "mp4", "mov").
     * @param options - Optional configuration for sending the message.
     * @returns A promise that resolves to the sent WhatsApp message object, or `null` if sending fails.
     *
     * @remarks
     * - Useful when the video is generated or downloaded dynamically and not saved on disk.
     * - The `formatFile` ensures WhatsApp interprets the video format correctly.
     *
     * @example
     * // Send a dynamically downloaded MP4 Uint8Array
     * const buf = fs.readFileSync("./video.mp4");
     * await chatContext.SendVideoFromBuffer(buf, "mp4");
     */
    SendVideoFromBuffer(videoBuffer: Uint8Array, formatFile: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    /**
     * Sends a video message from a Uint8Array with a caption.
     *
     * @param videoBuffer - Video content as a `Uint8Array`.
     * @param caption - Text caption to include with the video.
     * @param formatFile - File format/extension of the video (e.g., "mp4", "mov").
     * @param options - Optional configuration for sending the message.
     * @returns A promise that resolves to the sent WhatsApp message object, or `null` if sending fails.
     *
     * @remarks
     * - Combines the behavior of `SendVideoFromBuffer` and `SendVideoWithCaption`.
     * - Supports optional normalization, mentions, or other sending options via `options`.
     *
     * @example
     * // Send Uint8Array with caption
     * const buf = fs.readFileSync("./clip.mov");
     * await chatContext.SendVideoFromBufferWithCaption(buf, "Check this!", "mov");
     *
     * @example
     * // Send Uint8Array immediately bypassing queue
     * await chatContext.SendVideoFromBufferWithCaption(buf, "Urgent!", "mov", { sendRawWithoutEnqueue: true });
     */
    SendVideoFromBufferWithCaption(videoBuffer: Uint8Array, caption: string, formatFile: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    /**
     * Sends a poll message.
     *
     * WhatsApp polls allow either:
     * - **Single-answer polls** (one option selectable).
     * - **Multi-answer polls** (multiple options selectable).
     *
     * Behavior:
     * - `pollTitle` can be normalized if `normalizeTitleText` is true.
     * - `selections` can be normalized if `normalizeOptionsText` is true.
     *
     * Constraints:
     * - Poll must contain **1–12 options** (`selections` array length).
     * - At the time of writing (31-august-2025). This can't fetch all votes
     *  from this poll, is only sending.
     *
     * @param pollTitle - The question/title of the poll.
     * @param selections - Array of answer choices (min 1, max 12).
     * @param pollOptions - Options for poll behavior:
     *   - `withMultiSelect`: If true, allows multiple answers.
     *   - `normalizeTitleText`: Normalize the poll title text.
     *   - `normalizeOptionsText`: Normalize each option string.
     * @param options - Additional sending options:
     *   - `sendRawWithoutEnqueue`: Send immediately, bypass queue.
     *   - Any other Baileys `MiscMessageGenerationOptions`.
     *
     * @example
     * // Single-answer poll
     * await bot.Poll(chatId, "Favorite color?", ["Red", "Blue", "Green"], { withMultiSelect: false });
     *
     * @example
     * // Multi-answer poll with normalization
     * await bot.Poll(chatId, "Pick your hobbies:", ["  Reading ", " Coding ", "Gaming"], {
     *   withMultiSelect: true,
     *   normalizeOptionsText: true,
     *   normalizeTitleText: true
     * }, { sendRawWithoutEnqueue: true });
     *
     */
    SendPoll(pollTitle: string, selections: string[], pollParams: WhatsMsgPollOptions, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends a location (geopoint) to the chat.
     *
     * @param degreesLatitude - Latitude of the location
     * @param degreesLongitude - Longitude of the location
     * @param options - Optional send configuration
     * @returns The WhatsApp message object, or `null` if sending failed
     */
    SendUbication(degreesLatitude: number, degreesLongitude: number, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends a location (geopoint) with additional description to the chat.
     *
     * @param degreesLatitude - Latitude of the location
     * @param degreesLongitude - Longitude of the location
     * @param ubicationName - A name/title for the location (e.g., "Central Park")
     * @param moreInfoAddress - Extra textual description for the location (e.g., street, landmark)
     * @param options - Optional send configuration
     * @returns The WhatsApp message object, or `null` if sending failed
     */
    SendUbicationWithDescription(degreesLatitude: number, degreesLongitude: number, ubicationName: string, moreInfoAddress: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends a contact card (vCard).
     *
     * Supports:
     * - Single contact card
     * - Multiple contact cards (by passing an array of contact info)
     *
     * Behavior:
     * - Phone numbers should include country code (e.g. `5216121407908`).
     *
     * @param contacts - A single contact object or an array of contacts:
     *   - `name`: Display name for the contact.
     *   - `phone`: Phone number in international format (no `+` required).
     * @param options - Additional sending options:
     *   - `sendRawWithoutEnqueue`: Send immediately, bypass queue.
     *   - Any other Baileys `MiscMessageGenerationOptions`.
     *
     * @example
     * // Send one contact
     * await bot.Contact(chatId, { name: "Christian", phone: "52161402883029" });
     *
     * @example
     * // Send multiple contacts
     * await bot.Contact(chatId, [
     *   { name: "Alice", phone: "5211111111111" },
     *   { name: "Bob", phone: "5212222222222" }
     * ]);
     *
     * @note Number follows "countrycode" + "1" + "10 digits number" for latin-american countries like "5216239389304" for example in mexico. Check
     * how your country number displays in international format to prevent any errors.
     */
    SendContact(contacts: {
        name: string;
        phone: string;
    } | Array<{
        name: string;
        phone: string;
    }>, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends a document message from a local file path.
     *
     * @param docPath - Absolute or relative path to the document file.
     * @param options - Optional configuration for sending the message.
     * @returns A promise that resolves to the sent WhatsApp message object, or `null` if sending fails.
     *
     * @remarks
     * - The document file is read from the specified path and sent as a WhatsApp document message.
     * - MIME type is automatically detected based on the file extension using the `mime` library.
     * - Supports all file types compatible with WhatsApp document messages (e.g., PDF, DOC, TXT).
     * - Uses the safe queue system unless `sendRawWithoutEnqueue` is set to `true` in `options`.
     *
     * @example
     * // Send a PDF document
     * await chatContext.SendDocument("./report.pdf");
     *
     * @example
     * // Send a document with mentions and immediate sending
     * await chatContext.SendDocument("./file.txt", {
     *   mentionsIds: ["5211234567890@s.whatsapp.net"],
     *   sendRawWithoutEnqueue: true
     * });
     */
    SendDocument(docPath: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends a document message from a local file path with a custom display name.
     *
     * @param docPath - Absolute or relative path to the document file.
     * @param fileNameToDisplay - Custom name to display for the document in WhatsApp.
     * @param options - Optional configuration for sending the message.
     * @returns A promise that resolves to the sent WhatsApp message object, or `null` if sending fails.
     *
     * @remarks
     * - Similar to `SendDocument`, but allows specifying a custom display name for the document.
     * - The `fileNameToDisplay` overrides the default file name derived from `docPath`.
     * - MIME type is detected based on the file extension of `docPath`.
     * - Uses the safe queue system unless `sendRawWithoutEnqueue` is set to `true` in `options`.
     *
     * @example
     * // Send a PDF with a custom display name
     * await chatContext.SendDocumentWithCustomName("./report.pdf", "Annual Report 2025");
     *
     * @example
     * // Send a document with a custom name and additional options
     * await chatContext.SendDocumentWithCustomName("./data.csv", "Sales Data", {
     *   timestamp: new Date(),
     *   ephemeralExpiration: 86400
     * });
     */
    SendDocumentWithCustomName(docPath: string, fileNameToDisplay: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Sends a document message from a Uint8Array with a custom display name and file extension.
     *
     * @param docBuffer - Document content as a `Uint8Array`.
     * @param fileNameToDisplayWithoutExt - Display name for the document (without extension).
     * @param extensionFileTypeOnly - File extension (e.g., "pdf", "docx") to determine MIME type.
     * @param options - Optional configuration for sending the message.
     * @returns A promise that resolves to the sent WhatsApp message object, or `null` if sending fails.
     *
     * @remarks
     * - Useful for sending documents generated or downloaded dynamically without saving to disk.
     * - The `extensionFileTypeOnly` determines the MIME type (e.g., "pdf" → "application/pdf").
     * - The `fileNameToDisplayWithoutExt` is used as the display name, with `extensionFileTypeOnly` appended.
     * - Uses the safe queue system unless `sendRawWithoutEnqueue` is set to `true` in `options`.
     *
     * @example
     * // Send a dynamically generated PDF Uint8Array
     * const buf = fs.readFileSync("./document.pdf");
     * await chatContext.SendDocumentFromBuffer(buf, "Report", "pdf");
     *
     * @example
     * // Send a Uint8Array with mentions and immediate sending
     * const buf = Uint8Array.from("Sample text");
     * await chatContext.SendDocumentFromBuffer(buf, "Note", "txt", {
     *   mentionsIds: ["5211234567890@s.whatsapp.net"],
     *   sendRawWithoutEnqueue: true
     * });
     */
    SendDocumentFromBuffer(docBuffer: Uint8Array, fileNameToDisplayWithoutExt: string, extensionFileTypeOnly: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    /**
     * Waits for the next message of the specified type from the original sender.
     *
     * @param expectedType - Type of message to wait for (e.g., text, media, location).
     * @param localOptions - Optional configuration overrides (e.g., timeout, cancel keywords).
     * @returns Resolves with the next matching `WhatsappMessage`, or `null` if no message is received.
     *
     * @example
     * ```ts
     * const message = await chatContext.WaitMsg(MsgType.Text, { timeoutSeconds: 30 });
     * if (message) console.log("Received message:", message);
     * else console.log("No message received within timeout");
     * ```
     */
    WaitMsg(expectedType: MsgType, localOptions?: Partial<IChatContextConfig>): Promise<WhatsappMessage | null>;
    /**
     * Waits for the next text message from the original sender.
     *
     * @param localOptions - Optional configuration overrides (e.g., timeout, cancel keywords).
     * @returns Resolves with the plain text of the next message, or `null` if no message is received.
     *
     * @example
     * ```ts
     * const text = await chatContext.WaitText({ timeoutSeconds: 20 });
     * if (text) console.log("User sent:", text);
     * else console.log("No text message received");
     * ```
     */
    WaitText(localOptions?: Partial<IChatContextConfig>): Promise<string | null>;
    /**
     * Waits for a "yes" or "no" response from the user.
     *
     * This is a specialized version of `WaitText` that interprets common
     * affirmative and negative responses.
     *
     * - **Positive responses**: "yes", "y", "si", "s", "ok" (and more, case-insensitive).
     * - **Negative responses**: "no", "n" (and more, case-insensitive).
     *
     * You can override the default keywords using the `localOptions` parameter.
     *
     * @param localOptions - Optional configuration to override default "yes"/"no" keywords
     *                       and to pass standard waiting options like timeout.
     * @returns `true` for a positive answer, `false` for a negative answer, or `null`
     *          if the user's response is ambiguous, they cancel, or the wait times out.
     *
     * @example
     * ```ts
     * await ctx.SendText("Do you want to continue? (yes/no)");
     * const answer = await ctx.WaitYesOrNoAnswer({ normalConfig: { timeoutSeconds: 30 } });
     *
     * if (answer === true) {
     *   await ctx.SendText("Proceeding...");
     * } else if (answer === false) {
     *   await ctx.SendText("Operation cancelled.");
     * } else {
     *   await ctx.SendText("No valid response received.");
     * }
     * ```
     */
    WaitYesOrNoAnswer(localOptions?: Partial<IChatContext_WaitYesOrNoAnswer_Params>): Promise<boolean | null>;
    /**
     * Waits for the next multimedia message of the specified type (e.g., image, video, audio).
     *
     * @param msgTypeToWaitFor - Multimedia type to wait for.
     * @param localOptions - Optional configuration overrides (e.g., timeout).
     * @returns Resolves with a `Uint8Array` containing the media, or `null` if no message is received.
     *
     * @example
     * ```ts
     * const imageBuffer = await chatContext.WaitMultimedia(MsgType.Image, { timeoutSeconds: 30 });
     * if (imageBuffer) saveFile("image.webp", imageBuffer);
     * ```
     */
    WaitMultimedia(msgTypeToWaitFor: MsgType.Image | MsgType.Sticker | MsgType.Video | MsgType.Document | MsgType.Audio, localOptions?: Partial<IChatContextConfig>): Promise<Uint8Array | null>;
    /**
     * Waits for the next location message from the original sender.
     *
     * @param localOptions - Optional configuration overrides (e.g., timeout).
     * @returns Resolves with an object containing location coordinates and thumbnail, or `null` if no message is received.
     *
     * @example
     * ```ts
     * const location = await chatContext.WaitUbication({ timeoutSeconds: 30 });
     * if (location) console.log(`Lat: ${location.degreesLatitude}, Lon: ${location.degreesLongitude}`);
     * ```
     */
    WaitUbication(localOptions?: Partial<IChatContextConfig>): Promise<ChatContextUbication | null>;
    /**
     * Waits for the next contact message from the original sender.
     *
     * @param localOptions - Optional configuration overrides (e.g., timeout).
     * @returns Resolves with an object containing contact name, number, and full WhatsApp ID, or `null` if no message is received.
     *
     * @example
     * ```ts
     * const contact = await chatContext.WaitContact({ timeoutSeconds: 30 });
     * if (contact) console.log(`Name: ${contact.name}, Number: ${contact.number}, WhatsApp ID: ${contact.whatsappId}`);
     * ```
     */
    WaitContact(localOptions?: Partial<IChatContextConfig>): Promise<ChatContextContactRes | ChatContextContactRes[] | null>;
    /**
     * Fetches the group data for a specific chat.
     *
     * This method retrieves detailed information about the group, including its ID,
     * sending mode, owner, and participant details.
     *
     * Fun fact: The WhatsApp group sending mode can affect how messages are delivered
     * to participants, with 'Legacy' indicating older behavior and 'Modern' for the newer format.
     *
     * @returns Resolves with the `ChatContextGroupData` object containing group details,
     *          or `null` if the chat is an individual/private chat.
     *
     * @example
     * ```ts
     * const groupData = await chatContext.FetchGroupData();
     * if (groupData) {
     *   console.log("Group name:", groupData.groupName);
     *   console.log("Participants:", groupData.members.map(m => m.info?.id));
     * } else {
     *   console.log("This is an individual chat, not a group.");
     * }
     * ```
     * @throws Error if there is a problem fetching group metadata.
     */
    FetchGroupData(): Promise<GroupMetadataInfo | null>;
    /**
     * Creates a new, independent `IChatContext` instance that is a copy of the current one.
     *
     * This is useful for scenarios where you need to perform operations in parallel or
     * create a new interaction flow without modifying the state of the original context.
     * The cloned context will share the same initial configuration and properties but
     * can be modified independently.
     *
     * @returns A new `IChatContext` instance.
     */
    Clone(): IChatContext;
    /**
     * Clones the context and retargets it to a specific individual chat using their ID.
     *
     * This is useful for proactively starting a new conversation with a user when you
     * only have their `userChatId`. The new context will be configured to send
     * messages directly to that user.
     *
     * @param params - The parameters required to target the individual chat.
     * @returns A new `IChatContext` instance targeted at the specified user's private chat.
     */
    CloneButTargetedToIndividualChat(params: IChatContext_CloneTargetedTo_FromIds_Individual_Params): IChatContext;
    /**
     * Clones the context and retargets it to a specific group chat using its ID.
     *
     * This method allows you to initiate actions or send messages to any group,
     * even if the original command did not come from there. You can optionally
     * specify a participant within that group to provide more granular context.
     *
     * @param params - The parameters required to target the group chat.
     * @returns A new `IChatContext` instance targeted at the specified group.
     */
    CloneButTargetedToGroupChat(params: IChatContext_CloneTargetedTo_FromIds_GROUP_Params): IChatContext;
    /**
     * Clones the context and retargets it based on an existing WhatsApp message.
     *
     * This is the most reliable way to fork a context, as the `initialMsg` provides
     * a perfect "anchor" containing all the necessary metadata (chat ID, sender, etc.).
     * Its primary use case is replying privately to a user who issued a command in a group.
     *
     * @param params - The parameters containing the anchor message.
     * @returns A new `IChatContext` instance accurately targeted to the chat of the initial message.
     */
    CloneButTargetedToWithInitialMsg(params: IChatContext_CloneTargetedTo_FromWhatsmsg_Params): IChatContext;
}
/**
 * # Context Clone Parameters via Message
 *
 * Parameters for creating a new, retargeted `IChatContext` from an existing message.
 *
 * This method is ideal for forking a context because the `initialMsg` object
 * provides a reliable "anchor" with all the necessary metadata to establish the new chat.
 *
 * @example
 * ```typescript
 * const params: IChatContext_CloneTargetedTo_FromWhatsmsg_Params = { initialMsg: msg };
 * const newCtx = ctx.CloneButTargetedToWithInitialMsg(params);
 * ```
 */
type IChatContext_CloneTargetedTo_FromWhatsmsg_Params = {
    /**
     * The foundational message for the new context.
     *
     * This message is crucial as it's used to determine the new context's properties
     * (like sender type, chat ID, and who to respond to) and serves as the target for all feedback emojis.
     */
    initialMsg: WhatsappMessage;
    /**
     * Optional new configuration for the cloned context. If not provided, the original context's configuration is used.
     */
    newConfig?: IChatContextConfig;
};
/**
 * Parameters for cloning and targeting a context to an individual chat via their ID.
 */
type IChatContext_CloneTargetedTo_FromIds_Individual_Params = {
    /**
     * The unique identifier (`JID`) of the user's private chat.
     */
    userChatId: string;
    /**
     * Optional new configuration for the cloned context.
     * If not provided, the original context's configuration is used.
     */
    newConfig?: IChatContextConfig;
};
/**
 * Parameters for cloning and targeting a context to a group chat via its ID.
 */
type IChatContext_CloneTargetedTo_FromIds_GROUP_Params = {
    /**
     * The unique identifier (`JID`) of the group chat.
     */
    groupChatId: string;
    /**
     * (Optional) The phone number of a specific participant within the group.
     * Useful if the new context needs to be aware of a particular user.
     */
    participant_PN?: string;
    /**
     * (Optional) The LID (Login ID) of a specific participant within the group.
     * An alternative identifier for a user.
     */
    participant_LID?: string;
    /**
     * Optional new configuration for the cloned context.
     * If not provided, the original context's configuration is used.
     */
    newConfig?: IChatContextConfig;
};
/**
 * Configuration for customizing the keywords recognized by `WaitYesOrNoAnswer`.
 *
 * @example
 * ```ts
 * const customYesNo: IChatContext_WaitYesOrNoAnswerConfig = {
 *   overridePositiveAnswerOptions: ['accept', 'confirm'],
 *   overrideNegativeAnswerOptions: ['reject', 'deny']
 * };
 *
 * const answer = await ctx.WaitYesOrNoAnswer({
 *   waitYesOrNoOptions: customYesNo
 * });
 * ```
 */
type IChatContext_WaitYesOrNoAnswerConfig = {
    /**
     * An array of strings to use as affirmative answers, overriding the defaults.
     * The check is case-insensitive.
     * The check is always case-insensitive.
     * @default ["yes", "y", "si", "s", "ok", "vale", "dale"]
     */
    positiveAnswerOptions?: string[];
    /**
     * An array of strings to use as negative answers, overriding the defaults.
     * The check is case-insensitive.
     * The check is always case-insensitive.
     * @default ["no", "n"]
     */
    negativeAnswerOptions?: string[];
};
/**
 * Parameters for configuring the `WaitYesOrNoAnswer` method.
 *
 *
 * This type allows for both customizing the "yes/no" keyword detection
 * and passing standard waiting configurations like timeouts.
 */
type IChatContext_WaitYesOrNoAnswer_Params = {
    /**
     * Options to customize the affirmative and negative keywords.
     * If not provided, default "yes"/"no" keywords will be used.
     */
    waitYesOrNoOptions: IChatContext_WaitYesOrNoAnswerConfig;
    /**
     * Standard waiting configuration, such as `timeoutSeconds` and `cancelKeywords`.
     * These options are passed down to the underlying `WaitText` call.
     *
     * @example
     * ```ts
     * // Wait for 10 seconds and allow "stop" as a cancel keyword.
     * await ctx.WaitYesOrNoAnswer({ normalConfig: { timeoutSeconds: 10, cancelKeywords: ['stop'] } });
     * ```
     */
    normalConfig: Partial<IChatContextConfig>;
};

/**
 * # Chat Context Configuration
 *
 * Extra configuration properties for the Chat Context initializing.
 *
 * @example
 * ```typescript
 * const config: IChatContextConfig = { timeoutSeconds: 30 };
 * ```
 */
type IChatContextConfig = WhatsSocketReceiverWaitOptions & {
    /**
     * Used primarly in mocking system
     */
    explicitSenderType?: SenderType;
    /**
     * Default keywords to be interpreted as an affirmative ("yes") response
     * in `WaitYesOrNoAnswer`. Case-insensitive.
     *
     * @default ["yes", "y", "si", "s", "ok", "vale", "sí"]
     */
    positiveAnswerOptions?: string[];
    /**
     * Default keywords to be interpreted as a negative ("no") response
     * in `WaitYesOrNoAnswer`. Case-insensitive.
     *
     * @default ["no", "n"]
     */
    negativeAnswerOptions?: string[];
};
/**
 * # Chat Context
 *
 * A sugar-layer abstraction for sending/receiving msgs bound to the actual chat.
 *
 * This class simplifies sending messages and reactions to a fixed chat
 * without needing to repeatedly provide the chat ID. It also provides
 * helpers for common bot patterns like reacting with checkmarks or crosses to the
 * initial message and other common high-level utilities.
 *
 * @example
 * ```typescript
 * await ctx.SendText("Hello");
 * ```
 */
declare class ChatContext implements IChatContext {
    /**
     * Low-level sender dependency responsible for dispatching
     * messages, reactions, edits, and other outbound events.
     *
     * This is an internal utility—use higher-level convenience
     * methods instead of calling this directly where possible.
     */
    private _internalSend;
    /**
     * Low-level receiver dependency responsible for listening
     * to incoming WhatsApp events (messages, status updates, etc).
     *
     * Exposed internally so that session features can react to
     * real-time events within the same chat context.
     */
    private _internalReceive;
    private _internalGroup;
    private _internalPresence;
    readonly FixedParticipantPN: string | null;
    readonly FixedParticipantLID: string | null;
    readonly FixedChatId: string;
    InitialMsg: WhatsappMessage | null;
    readonly FixedSenderType: SenderType;
    Config: IChatContextConfig;
    get Group(): IWhatsSocket_Submodule_Group;
    get Presence(): IChatContext_PresenceAPI;
    /**
     * Creates a new chat session bound to a specific chat and initial message.
     *
     * @param participantID_LID - The ID of the participant that triggered this session,
     *   or `null` if the origin cannot be determined.
     * @param fixedChatId - The WhatsApp chat JID this context is tied to.
     * @param initialMsg - The original message object that caused this context to spawn.
     * @param senderDependency - Internal sender utility for dispatching messages.
     * @param receiverDependency - Internal receiver utility for subscribing to events.
     * @param groupDependency - Internal group utility for scoped group operations.
     * @param presenceDependency - Internal presence utility for scoped presence operations.
     * @param config - Context configuration controlling runtime behavior.
     *
     * @remarks
     * - All `Fixed*` properties are immutable once the context is created.
     * - The context is designed to encapsulate state and metadata for a
     *   single session, preventing accidental leakage between chats.
     */
    constructor(participantID_LID: string | null, participantID_PN: string | null, fixedChatId: string, initialMsg: WhatsappMessage | null, senderDependency: IWhatsSocket_Submodule_SugarSender, receiverDependency: IWhatsSocket_Submodule_Receiver, groupDependency: IWhatsSocket_Submodule_Group | null, presenceDependency: IWhatsSocket_Submodule_Presence, config: IChatContextConfig);
    Clone(): IChatContext;
    CloneButTargetedToWithInitialMsg(params: IChatContext_CloneTargetedTo_FromWhatsmsg_Params): IChatContext;
    CloneButTargetedToIndividualChat(params: IChatContext_CloneTargetedTo_FromIds_Individual_Params): IChatContext;
    CloneButTargetedToGroupChat(params: IChatContext_CloneTargetedTo_FromIds_GROUP_Params): IChatContext;
    private _GetGroupDependency;
    private HandlePrimaryMsg;
    SendText(text: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    SendImg(imagePath: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    SendImgWithCaption(imagePath: string, caption: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    SendImgFromBuffer(imagePath: Uint8Array | Uint8Array<ArrayBuffer>, extensionType: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    SendImgFromBufferWithCaption(imagePath: Uint8Array, extensionType: string, caption: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    SendReactEmojiTo(msgToReactTo: WhatsappMessage, emojiStr: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    SendReactEmojiToInitialMsg(emojiStr: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    Ok(options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    Loading(options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    Fail(options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    SendSticker(stickerUrlSource: string | Uint8Array, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    SendAudio(audioSource: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    SendAudioFromBuffer(audioSource: Uint8Array, formatFile: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    SendVideo(videopath: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    SendVideoWithCaption(videoPath: string, caption: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    SendVideoFromBuffer(videoBuffer: Uint8Array, formatFile: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    SendVideoFromBufferWithCaption(videoBuffer: Uint8Array, caption: string, formatFile: string, options?: WhatsMsgSenderSendingOptions): Promise<WhatsappMessage | null>;
    SendPoll(pollTitle: string, selections: string[], pollParams: WhatsMsgPollOptions, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    SendUbication(degreesLatitude: number, degreesLongitude: number, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    SendUbicationWithDescription(degreesLatitude: number, degreesLongitude: number, ubicationName: string, moreInfoAddress: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    SendContact(contacts: {
        name: string;
        phone: string;
    } | Array<{
        name: string;
        phone: string;
    }>, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    SendDocument(docPath: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    SendDocumentWithCustomName(docPath: string, fileNameToDisplay: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    SendDocumentFromBuffer(docBuffer: Uint8Array, fileNameToDisplayWithoutExt: string, extensionFileTypeOnly: string, options?: WhatsMsgSenderSendingOptionsMINIMUM): Promise<WhatsappMessage | null>;
    WaitMsg(expectedType: MsgType, localOptions?: Partial<IChatContextConfig>): Promise<WhatsappMessage | null>;
    WaitText(localOptions?: Partial<IChatContextConfig>): Promise<string | null>;
    WaitYesOrNoAnswer(localOptions?: Partial<IChatContext_WaitYesOrNoAnswer_Params>): Promise<boolean | null>;
    WaitMultimedia(msgTypeToWaitFor: MsgType.Image | MsgType.Sticker | MsgType.Video | MsgType.Document | MsgType.Audio, localOptions?: Partial<IChatContextConfig>): Promise<Uint8Array | null>;
    WaitUbication(localOptions?: Partial<IChatContextConfig>): Promise<ChatContextUbication | null>;
    WaitContact(localOptions?: Partial<IChatContextConfig>): Promise<ChatContextContactRes | ChatContextContactRes[] | null>;
    FetchGroupData(): Promise<GroupMetadataInfo | null>;
}

type MyselfStatusTextParams = Omit<Omit<WhatsappMessageOptions, "statusJidList">, "broadcast">;
/**
 * Submodule responsible for sending status updates ("stories")
 * through the WhatsApp socket.
 *
 * This is a lightweight abstraction around the socket API for the
 * `status@broadcast` JID, enabling text uploads visible only to
 * selected WhatsApp IDs.
 *
 * Typical usage (from inside a command):
 * ```ts
 * await api.Myself.Status.UploadText("Working on the bot 🚀", [
 *   "123456789@s.whatsapp.net",
 *   "987654321@s.whatsapp.net",
 * ]);
 * ```
 */
declare class Myself_Submodule_Status {
    /**
     * Reserved WhatsApp ID for the "status" broadcast channel.
     * All status updates must be sent to this JID.
     *
     * @internal
     */
    private readonly IDStatusToSend;
    private _whatsSocket;
    /**
     * Creates a new `Myself_Submodule_Status` tied to a given socket.
     *
     * @param chatContextOwner - The active WhatsApp socket instance
     * that will handle sending the status update.
     */
    constructor(chatContextOwner: IWhatsSocket);
    /**
     * Uploads a plain text status update, visible only to the provided
     * list of WhatsApp IDs.
     *
     * This method sends a message to the special `status@broadcast` JID
     * with additional metadata indicating which contacts should see it.
     *
     * @param txtToSendToStatus - The text content of the status.
     * @param whatsappIdsToShowStatus - List of WhatsApp user IDs allowed to view the status.
     * All ID's must be PN (PhoneNumber) old version. e.g ["12345@s.whatsapp.net", "anotherID@s.whatsapp.net"]
     *
     * @returns A `WhatsappMessage` object representing the sent status, or `null`
     * if the message failed to send safely.
     *
     * @example
     * ```ts
     * const status = new Myself_Submodule_Status(socket);
     * await status.UploadText("Bot is online ✅", ["12345@s.whatsapp.net"]);
     * ```
     */
    UploadText(txtToSendToStatus: string, whatsappIdsToShowStatus: string[], options?: MyselfStatusTextParams): Promise<WhatsappMessage | null>;
}

/**
 * # Command Arguments
 *
 * Arguments provided to a bot command when it is executed.
 *
 * Contains both metadata about the incoming message and
 * pre-parsed arguments extracted from the message text.
 *
 * @example
 * ```typescript
 * const args: CommandArgs = {
 *   originalRawMsg: msg,
 *   chatId: "123",
 *   senderType: SenderType.Individual,
 *   msgType: MsgType.Text,
 *   args: ["help"],
 *   quotedMsgInfo: null,
 *   botInfo: {},
 *   participantIdLID: null,
 *   participantIdPN: "123"
 * };
 * ```
 */
type CommandArgs = {
    /**
     * The raw WhatsApp message object from the configured vendor.
     * Gives full access to low-level details of the incoming message.
     */
    originalRawMsg: WhatsappMessage;
    /**
     * Partipant ID new @LID whatsapp version. (Modern, used on newer groups)
     * Whatsapp ID of the user who triggered the command.
     * Example:
     */
    participantIdLID: string | null;
    /**
     * Participant ID old @whatsapp.es whatsapp version. (Legacy for older groups)
     * WhatsApp ID of the user who triggered the command.
     * Example: `5216121407908@s.whatsapp.net`.
     * Undefined if the sender could not be resolved.
     */
    participantIdPN: string | null;
    /**
     * WhatsApp ID of the chat where the command was triggered.
     * Can be a private chat ID or a group chat ID.
     */
    chatId: string;
    /**
     * LID-normalized chat identifier where the command was triggered.
     * - For private chats, `chatId` remains the PN-format ID while `chatId_LID`
     *   provides the equivalent LID version if it was resolved.
     * - For group chats, this will be `undefined` (js type) and
     *   may be undefined as well for older groups that only expose PN IDs.
     *
     * @version Added in `v0.24.0`
     */
    chatId_LID?: string;
    /**
     * Type of sender (e.g. private user, group participant, system).
     * Derived from the incoming message context.
     */
    senderType: SenderType;
    /**
     * The detected type of the incoming message.
     * Example: `"text"`, `"image"`, `"audio"`, etc.
     */
    msgType: MsgType;
    /**
     * Parsed arguments passed to the command.
     * Example: in `!ban @user reason here`, args would be `["@user", "reason", "here"]`.
     */
    args: string[];
    /**
     * Information about a quoted (replied-to) message, if present.
     * Useful for commands that operate on a specific previous message.
     */
    quotedMsgInfo: FoundQuotedMsg | null;
    botInfo: BotMinimalInfo;
};
/**
 * # Found Quoted Message
 *
 * Represents a quoted (replied-to) message.
 *
 * @example
 * ```typescript
 * const quoted: FoundQuotedMsg = { msg: quotedRawMsg, type: MsgType.Text };
 * ```
 */
type FoundQuotedMsg = {
    /**
     * The raw quoted WhatsApp message object from the configured vendor.
     */
    msg: WhatsappProtocolMessage;
    /**
     * The type of the quoted message (text, image, audio, etc.).
     */
    type: MsgType;
};

/**
 * # Command Interface
 *
 * Represents a bot command.
 *
 * Each command has a unique `name`, optional aliases, a description,
 * and a `run` method which contains the logic to execute when the command
 * is invoked.
 *
 * @example
 * ```typescript
 * const ping: ICommand = {
 *   name: "ping",
 *   aliases: ["p"],
 *   run: async (ctx, api, args) => { await ctx.SendText("Pong!"); }
 * };
 * ```
 */
interface ICommand {
    /** Unique name of the command (used to trigger it) */
    name: string;
    /** Optional alternative names for the command */
    aliases?: string[];
    /**
     * Executes the command.
     * @param api - (Low-Level API for sending and receiving methods)
     *                Direct usage of bot's whatsapp socket, you need to provide
     *                your own whatsapp chatID and params are more explicit.
     *                *Use it if you need finer control of how msgs are sent*
     * @param ctx - (High-Level API sbstraction for sending and receiving methods)
     *               The chat session this command is being executed in.
     *               Provides helper methods to send messages, react, ask questions, etc
     *               and strictly bound to this command chat.
     *               *Recommended, you would use this almost all the time, but if you
     *               need to send messages across chats, use rawMsgApi instead or create
     *               another ChatSession object on your own.
     * @param args - Arguments passed to the command when invoked.
     */
    run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void>;
}
/**
 * # Additional API
 *
 * Low-level utilities and direct socket access.
 *
 * Exposes internal submodules and helpers that extend beyond what
 * `ChatContext` provides. This API is intended for **advanced use cases**
 * where commands require broader control or functionality.
 *
 * ⚡ Typical scenarios where `AdditionalAPI` is useful:
 * - Sending messages to arbitrary chats without constructing a `ChatContext`.
 * - Publishing statuses/stories via the `Myself.Status` submodule.
 * - Leveraging raw socket features (`InternalSocket`) not surfaced through `ChatContext`.
 *
 * 🚫 For most command implementations, prefer using `ChatContext`
 * (the higher-level abstraction). Only fall back to `AdditionalAPI`
 * when you need cross-chat operations, raw access, or bot-wide state control.
 *
 * @example
 * ```typescript
 * async function run(ctx: IChatContext, api: AdditionalAPI) {
 *    const metadata = await api.InternalSocket.GetRawGroupMetadata("123@g.us");
 * }
 * ```
 */
type AdditionalAPI = {
    /**
     * Submodule for managing the bot’s own account features.
     */
    readonly Myself: {
        readonly Status: Myself_Submodule_Status;
        readonly Bot: BotMinimalInfo;
    };
    /**
     * Direct access to the underlying WhatsApp socket implementation.
     *
     * ⚠️ Use with caution: bypassing `ChatContext` means you are
     * responsible for handling errors, message formatting, and safe sending.
     */
    readonly InternalSocket: IWhatsSocket;
};

/**
 * # Command Type
 *
 * Different categories of commands supported by the searcher.
 * - `Normal`: explicit commands that match directly.
 * - `Tag`: commands triggered by a tag (metadata, alias, or secondary marker).
 *
 * @example
 * ```typescript
 * const type = CommandType.Normal;
 * ```
 */
declare enum CommandType {
    Normal = "Normal",
    Tag = "Tag"
}
/**
 * # Command Entry
 *
 * Central registry and search helper type for commands.
 *
 * Commands are separated into two namespaces:
 * - **Normal commands**: Standard commands invoked by name.
 * - **Tag commands**: Commands bound to tags or metadata.
 *
 * A default command or tag may be defined. These act as a global fallback
 * when no specific match is found.
 *
 * @example
 * ```typescript
 * const entry: CommandEntry = { commandName: "ping", commandObj: pingCommand };
 * ```
 */
type CommandEntry = {
    commandName: string;
    commandObj: ICommand;
};
/**
 * # Commands Searcher System
 *
 * Central registry and search mechanism for commands.
 * Resolves commands by name or alias and manages fallback commands.
 *
 * @example
 * ```typescript
 * const searcher = new CommandsSearcher();
 * searcher.Add(myCmd);
 * ```
 */
declare class CommandsSearcher {
    private _normalCommands;
    private _tagCommands;
    /**
     * Optional global fallback command.
     * Executed if no specific "normal" command is matched.
     */
    private _defaultCommand?;
    /**
     * Optional global fallback tag command.
     * Executed if no specific "tag" command is matched.
     */
    private _defaultTag?;
    /**
     * Provides access to the currently configured defaults.
     * - `Command`: fallback normal command
     * - `Tag`: fallback tag command
     */
    get Defaults(): {
        Command: ICommand | undefined;
        Tag: ICommand | undefined;
    };
    /**
     * Registers the global fallback normal command.
     * Used when no explicit normal command is found.
     */
    SetDefaultCommand(commandDefault: ICommand): void;
    /**
     * Registers the global fallback tag command.
     * Used when no explicit tag command is found.
     */
    SetDefaultTag(commandDefault: ICommand): void;
    /**
     * Returns a list of all registered normal commands.
     * Each entry includes the command name and its implementation.
     */
    get NormalCommands(): CommandEntry[];
    /**
     * Returns a list of all registered tag commands.
     * Each entry includes the tag name and its implementation.
     */
    get TagCommands(): CommandEntry[];
    /**
     * Registers a new command, validating it and adding it to the appropriate
     * namespace (`Normal` or `Tag`).
     *
     * The method ensures that command names are valid (non-empty, single-word),
     * unique within their type, and that their aliases do not conflict with
     * other commands of the same type. All names and aliases are normalized to
     * lowercase for case-insensitive matching.
     *
     * @param commandToAdd The {@link ICommand} instance to register.
     * @param addCommandAsType The type of command, either `CommandType.Normal` (default) or `CommandType.Tag`.
     *
     * @example
     * // Add a simple normal command
     * searcher.Add({ name: 'help', run: ... });
     *
     * // Add a tag command with aliases
     * searcher.Add({ name: 'admin', aliases: ['mod'], run: ... }, CommandType.Tag);
     *
     * @example <caption>Error Scenarios</caption>
     * // Throws error for duplicate command name
     * searcher.Add({ name: 'help', run: ... }); // OK
     * searcher.Add({ name: 'help', run: ... }); // Throws Error
     *
     * // Throws error for alias conflict
     * searcher.Add({ name: 'kick', aliases: ['remove'], run: ... }); // OK
     * searcher.Add({ name: 'ban', aliases: ['remove'], run: ... }); // Throws Error
     *
     * // Throws error for invalid name
     * searcher.Add({ name: 'bad name', run: ... }); // Throws Error
     *
     * @throws {Error} If the command name is empty or contains spaces.
     * @throws {Error} If a command with the same name already exists for the given type.
     * @throws {Error} If an alias conflicts with an existing command's name or aliases of the same type.
     */
    Add(commandToAdd: ICommand, addCommandAsType?: CommandType): void;
    /**
     * Checks whether a command exists in either namespace.
     *
     * @example
     * ```ts
     * searcher.Exists("ping"); // true
     * searcher.Exists("unknown"); // false
     * ```
     */
    Exists(commandName: string): boolean;
    /**
     * Determines the type of a command.
     *
     * @example
     * ```ts
     * searcher.GetTypeOf("ping"); // CommandType.Normal
     * searcher.GetTypeOf("mod");  // CommandType.Tag
     * searcher.GetTypeOf("ghost"); // null
     * ```
     */
    GetTypeOf(commandName: string): CommandType | null;
    /**
     * Retrieves a normal command.
     * Falls back to the default command if not found.
     *
     * @example
     * ```ts
     * searcher.GetCommand("ping"); // returns ICommand for "ping"
     * searcher.GetCommand("unknown"); // returns default command (if set) or null
     * ```
     */
    GetCommand(commandName: string): ICommand | null;
    /**
     * Retrieves a tag command.
     * Falls back to the default tag command if not found.
     *
     * @example
     * ```ts
     * searcher.GetTag("mod"); // returns ICommand for "mod"
     * searcher.GetTag("ghost"); // returns default tag (if set) or null
     * ```
     */
    GetTag(tagName: string): ICommand | null;
    /**
     * Finds a command by one of its aliases.
     *
     * @example
     * ```ts
     * searcher.Add({
     *   name: "ban",
     *   aliases: ["block", "remove"],
     *   execute: () => "banned"
     * });
     *
     * searcher.GetWhateverWithAlias("block", CommandType.Normal);
     * // returns the "ban" command
     * ```
     */
    GetWhateverWithAlias(possibleAlias: string, commandTypeToLookFor: CommandType): ICommand | null;
}

/**
 * # Minimal Bot Information
 *
 * Defines the essential, public-facing components of a bot instance.
 *
 * This type is useful for scenarios where a full `Bot` instance is not
 * required, but access to its core configuration and command system is needed.
 * It serves as a minimal interface implemented by the main `Bot` class.
 *
 * @example
 * ```typescript
 * const minBot: BotMinimalInfo = { Settings, Commands };
 * ```
 */
type BotMinimalInfo = {
    /**
     * The bot's current configuration settings.
     *
     * Provides access to all runtime options, such as command prefixes,
     * timeouts, and logging modes.
     */
    Settings: WhatsBotOptions;
    /**
     * The command management system for the bot.
     *
     * Allows for registering, searching, and managing all bot commands.
     */
    Commands: WhatsBotCommands;
};
type WhatsBotOptions = Omit<WhatsSocketOptions, "ownWhatsSocketVendorFactory_Internal"> & Omit<Partial<IChatContextConfig>, "ignoreSelfMessages"> & {
    /**
     * Character(s) used to tag the bot in messages.
     *
     * Useful in group contexts where multiple bots or members exist;
     * allows users to explicitly "mention" the bot.
     *
     * @default '@'
     * @example
     * tagCharPrefix: ['@', '#'] // bot reacts to both "@bot" and "#bot"
     */
    tagPrefix?: string | string[];
    /**
     * Character(s) used to prefix commands.
     *
     * Common convention is `"!"`, but you can use any characters or multiple
     * prefixes to support different command styles.
     *
     * @default '!'
     * @example
     * commandPrefix: ['/'] // commands triggered with "/help"
     */
    commandPrefix?: string | string[];
    /**
     * # Custom Socket Implementation
     *
     * For advanced users and maintainers: replace the internal WhatsApp socket implementation.
     *
     * If provided, the bot will use this custom implementation instead of the
     * built-in `WhatsSocket`. Useful for testing, extending, or mocking.
     *
     * Warning: Use at your own risk. Incorrect implementations can break bot behavior.
     *
     * @example
     * ```typescript
     * const opts: WhatsBotOptions = { ownWhatsSocketImplementation_Internal: myMock };
     * ```
     */
    ownWhatsSocketImplementation_Internal?: IWhatsSocket;
    /**
     * # Custom Chat Context Hook
     *
     * For advanced users and maintainers: replaces the ChatContext that will be sent to all commands.
     *
     * Used primarily for testing.
     *
     * Warning: Use at your own risk. Incorrect implementations can break bot behavior.
     *
     * @example
     * ```typescript
     * const opts: WhatsBotOptions = { ownChatContextCreationHook_Internal: () => myCtx };
     * ```
     */
    ownChatContextCreationHook_Internal?: () => IChatContext | null;
    /**
     * Enables or disables the "safe net" around command execution.
     *
     * - When `true` (default): command errors are caught internally, logged,
     *   and prevented from crashing the bot.
     * - When `false`: errors bubble up to the caller, allowing external handling
     *   (useful for integration tests or advanced error pipelines).
     *
     * @default true
     * @remarks This setting is primarily for developers who want fine-grained
     * control over error handling.
     */
    enableCommandSafeNet?: boolean;
    /**
     * Default emoji reaction to send when a command fails unexpectedly.
     *
     * If set, the bot will react to the triggering message with this emoji
     * whenever a command throws or exits with an error.
     *
     * @default undefined (no reaction sent on command failure)
     * @example
     * defaultEmojiToSendReactionOnFailureCommand: "⚠️"
     */
    defaultEmojiToSendReactionOnFailureCommand?: string | null;
    /**
     * Send to chat a json representation of catched error when a
     * commands fails unexpectedly. Useful for debug in real time.
     */
    sendErrorToChatOnFailureCommand_debug?: boolean;
};
/**
 * # WhatsApp Bot Events
 *
 * Defines all events emitted by the Bot instance.
 *
 * This type aggregates events from the underlying WhatsApp socket
 * (`IWhatsSocket_EventsOnly_Module`) and adds bot-specific events
 * related to command processing and middleware execution.
 *
 * @example
 * ```typescript
 * bot.Events.onIncomingMsg.Subscribe((msg) => console.log(msg));
 * ```
 */
type WhatsBotEvents = IWhatsSocket_EventsOnly_Module & {
    /**
     * Fires after the main middleware chain has finished executing.
     *
     * This event is triggered for every incoming message that passes through
     * the middleware pipeline.
     *
     * @param completedSuccessfully - `true` if the chain ran to completion
     * (all middleware called `next()`), `false` if a middleware broke the chain.
     */
    onMainMiddlewareEnd: Delegate<(completedSuccessfully: boolean) => void | Promise<void>>;
    /**
     * Fires after the "on command found" middleware chain has finished executing.
     *
     * This event only triggers if a valid command was found in the message.
     *
     * @param completedSuccessfully - `true` if the chain ran to completion,
     * `false` if a middleware broke the chain before command execution.
     */
    onFoundCommandMiddlewareEnd: Delegate<(completedSuccessfully: boolean) => void | Promise<void>>;
    /**
     * Fires when a message is identified as a command (e.g., starts with `!`),
     * but no matching command or alias is registered.
     *
     * Useful for providing "did you mean?" suggestions or a generic help message.
     *
     * @param ctx - The chat context of the incoming message.
     * @param commandNameThatCouldntBeFound - The name of the command the user tried to run.
     */
    onCommandNotFound: Delegate<(ctx: IChatContext, commandNameThatCouldntBeFound: string) => void | Promise<void>>;
    /**
     * Fires when a valid command is found in a message, but **before** it is executed.
     *
     * This serves as a pre-execution hook, ideal for logging, analytics, or
     * dynamic permission checks that shouldn't be part of the command's core logic.
     *
     * @param ctx - The chat context of the incoming message.
     * @param commandToRun - The command object that is about to be executed.
     */
    onCommandFound: Delegate<(ctx: IChatContext, commandToRun: ICommand) => void | Promise<void>>;
    /**
     * Fires **after** a command has been executed.
     *
     * This serves as a post-execution hook, useful for logging the outcome,
     * cleaning up resources, or performing follow-up actions.
     *
     * @param ctx - The chat context of the incoming message.
     * @param commandExecuted - The command object that was just run.
     * @param ranSuccessfully - `true` if the command's `run` method completed
     * without throwing an error, `false` otherwise.
     */
    onCommandFoundAfterItsExecution: Delegate<(ctx: IChatContext, commandExecuted: ICommand, ranSuccessfully: boolean) => void>;
};
type WhatsBotSender = IWhatsSocket_Submodule_SugarSender;
type WhatsBotReceiver = IWhatsSocket_Submodule_Receiver;
type WhatsBotGroup = IWhatsSocket_Submodule_Group;
type WhatsBotCommands = CommandsSearcher;
type WhatsbotcordMiddlewareFunct = (bot: Bot, senderId_LID: string | null, senderId_PN: string | null, chatId: string, rawMsg: WhatsappMessage, msgType: MsgType, senderType: SenderType, next: () => Promise<void>) => Promise<void> | void;
type WhatsbotcordMiddlewareFunct_OnFoundCommand = (bot: Bot, senderId_LID: string | null, senderId_PN: string | null, chatId: string, rawMsg: WhatsappMessage, msgType: MsgType, senderType: SenderType, commandFound: ICommand, next: () => Promise<void>) => Promise<void> | void;
type WhatsbotcordPlugin = {
    plugin: (bot: Bot) => void;
};
/**
 * # WhatsApp Bot
 *
 * Represents the main WhatsApp Bot instance.
 *
 * The `Bot` class orchestrates the WhatsApp socket connection and provides a
 * command-driven interaction system (similar to Discord bots).
 *
 * Typical usage involves registering and handling commands via the internal
 * `Command` prop.
 *
 * @example
 * ```typescript
 * const bot = new Bot();
 * await bot.Start();
 *
 * // Commands are usually registered in the command system
 * bot.Commands.Register("ping", async (ctx) => ctx.Reply("pong"));
 * ```
 */
declare class Bot implements BotMinimalInfo {
    InternalSocket: IWhatsSocket;
    private _commandSearcher;
    private _internalMiddleware;
    private _internalMiddleware_OnCommandFound;
    /** Bot Specific Events */
    /**
     * Event triggered when the bot receives a message that looks like a command,
     * but no registered command or alias matches it.
     *
     * Example usage:
     * ```ts
     * bot.Events.onCommandNotFound.Subscribe((name) => {
     *   console.log(`User tried unknown command: ${name}`);
     * });
     * ```
     */
    private _EVENT_onCommandNotFound;
    private _EVENT_onCommandFound;
    private _EVENT_onAfterCommandExecution;
    /**
     * Event triggered **after the middleware chain finishes running**.
     *
     * - The argument is `true` if the chain executed successfully to the end.
     * - The argument is `false` if some middleware stopped the chain by not calling `next()`.
     *
     * Example usage:
     * ```ts
     * bot.Events.onMiddlewareEnd.Subscribe((success) => {
     *   if (success) console.log("All middleware finished");
     *   else console.log("Middleware chain was interrupted early");
     * });
     * ```
     */
    private _EVENT_onMainMiddlewareEnd;
    private _EVENT_OnFoundCommandMiddlewareEnd;
    /**
     * Current bot configuration settings.
     *
     * These settings are derived from the constructor options, with defaults applied
     * where values were not provided.
     *
     * ⚠️ Changing properties on this object **after the bot has started** can affect its actual functionality.
     *
     * Typical use cases:
     * - Reading the active command or tag prefix
     * - Inspecting runtime limits (timeouts, queue limits, etc.)
     *
     * Example:
     * ```ts
     * console.log(bot.Settings.commandPrefix); // ["!"]
     * ```
     */
    Settings: WhatsBotOptions;
    /**
     * Gets the primary command prefix configured for the bot.
     *
     * If multiple prefixes are configured (e.g., `["!", "/"]`), this method
     * returns the first one in the array. If no prefix is explicitly configured,
     * it returns the default `"!"`.
     *
     * This is an utility Get Function to avoid unnecesary logic in your code
     * due to the nature of `this.Settings.commandPrefix` type  "string | string[] | undefined"
     * (Triple validation? ugh, use this method instead!)
     *
     * @returns {string} The primary command prefix.
     */
    get Settings_GetCommandPrefix(): string;
    /**
     * Direct access to the underlying send messaging module.
     *
     * ⚠️ Normally you should not use this directly.
     * Use the bot’s command system to send replies and interact with users.
     *
     * This exists for advanced cases where you need to bypass the command
     * framework (e.g., sending raw messages to specific chats).
     */
    get SendMsg(): WhatsBotSender;
    /**
     * Direct access to the underlying receive messaging module.
     *
     * ⚠️ Normally you should not use this directly.
     * The bot’s command system will handle incoming messages for you.
     *
     * This exists for advanced use cases like:
     * - Listening to non-command events (group joins, reactions, etc.).
     * - Building custom listeners outside of the command framework.
     */
    get ReceiveMsg(): WhatsBotReceiver;
    /**
     * Grouped API for WhatsApp group utilities.
     *
     * @example
     * ```typescript
     * const groups = await bot.group.getAll();
     * await bot.group.cleanup("123@g.us");
     * ```
     */
    get Groups(): WhatsBotGroup;
    /** Exposes all bot-related events that consumers can subscribe to.
     *
     * These events are implemented using `Delegate`, which provides `Subscribe` and
     * `Unsubscribe` methods to attach or detach handlers.
     *
     * Example usage:
     * ```ts
     * bot.Events.onIncomingMsg.Subscribe((msg) => {
     *   console.log("Raw incoming message:", msg);
     * });
     *
     * bot.Events.onCommandNotFound.Subscribe((name) => {
     *   console.warn(`Unknown command: ${name}`);
     * });
     *
     * bot.Events.onMiddlewareEnd.Subscribe((success) => {
     *   console.log(success ? "Middleware chain finished" : "Middleware interrupted");
     * });
     * ```
     */
    get Events(): WhatsBotEvents;
    get Commands(): WhatsBotCommands;
    /**
     * Creates a new `Bot` instance with customizable behavior.
     *
     * The constructor accepts a `WhatsBotOptions` object that allows overriding
     * runtime settings such as logging, message delays, and command handling.
     *
     * @param options - Optional configuration for customizing bot behavior.
     * @param optionalAdapter -  You can provide your own WhatsApp adapter. Defaults to the built-in `Baileys.js` adapter.
     *
     * Default values:
     * - `credentialsFolder`: `"./auth"`
     *   Folder path where WhatsApp session credentials are stored and reused.
     *
     * - `delayMilisecondsBetweenMsgs`: `100`
     *   Minimum delay (in ms) between consecutive outgoing messages.
     *   Helps avoid spam detection and rate-limiting by WhatsApp.
     *
     * - `ignoreSelfMessage`: `true`
     *   When enabled, the bot ignores messages sent by its own account.
     *
     * - `loggerMode`: `"recommended"`
     *   Logging verbosity. `"recommended"` provides balanced visibility;
     *   other modes may increase or decrease log detail.
     *
     * - `maxReconnectionRetries`: `5`
     *   Number of reconnection attempts before giving up when the socket disconnects.
     *
     * - `senderQueueMaxLimit`: `20`
     *   Maximum number of pending messages allowed in the send queue.
     *   Prevents unbounded memory growth if the bot cannot send fast enough.
     *
     * - `commandPrefix`: `["!"]`
     *   One or more prefixes that trigger command execution.
     *   Can be a string or string[]; strings are normalized into arrays.
     *
     * - `tagCharPrefix`: `["@"]`
     *   Characters used to denote mentions or tagging in commands.
     *   Similar normalization rules as `commandPrefix`.
     *
     * - `cancelFeedbackMsg`:
     *   `"canceled ❌ (Default Message: Change me using Bot constructor params options)"`
     *   Feedback message shown when a user cancels an interactive flow.
     *
     * - `cancelKeywords`: `["cancel", "cancelar", "para", "stop"]`
     *   Keywords that trigger cancellation of interactive sessions.
     *
     * - `timeoutSeconds`: `30`
     *   Default timeout for interactive flows (in seconds).
     *
     * - `wrongTypeFeedbackMsg`:
     *   `"wrong expected msg type ❌ (Default Message: Change me using Bot constructor params options)"`
     *   Feedback shown when the received message type doesn’t match expectations.
     *
     * - `ownWhatsSocketImplementation`: `undefined`
     *   Allows injecting a custom `WhatsSocket` implementation. If omitted,
     *   the built-in socket (`new WhatsSocket(Settings)`) is used.
     *
     * - `enableCommandSafeNet`: `true`
     *   Enables a safeguard layer around command execution, preventing
     *   crashes or unintended side effects from propagating.
     *
     * - `optionalAdapter`: `undefined`
     *   Optional second constructor parameter to use an alternative whatsbotcord WhatsApp-adapter
     *   If omitted, the built-in Baileys.js adapter will be used.
     *
     * @remarks
     * - So far, this library only has 1 official adapters built-in (Baileys.js). In the future there will be more.
     * - For production bots, consider raising `delayMilisecondsBetweenMsgs`
     *   slightly to avoid WhatsApp anti-spam systems.
     */
    constructor(options?: WhatsBotOptions, optionalAdapter?: IWhatsappAdapter);
    /**
     * Starts the bot by initializing the WhatsApp socket connection.
     *
     * This method must be called before the bot can process commands.
     *
     * Example:
     * ```ts
     * const bot = new Bot();
     * await bot.Start();
     * ```
     */
    Start(): Promise<void>;
    /**
     * Registers a middleware function or a plugin to intercept incoming messages.
     *
     * This method serves as the main entry point for extending bot functionality.
     * Middleware is executed in registration order **before** any command processing.
     *
     * ### Use as Middleware
     * Pass a function to inspect, modify, or block messages globally. Each
     * middleware receives a `next()` function. Call `next()` to pass control
     * to the next middleware. If `next()` is not called, the processing chain
     * stops, preventing subsequent middleware and commands from running.
     *
     * ### Use as a Plugin
     * Pass an object with a `plugin` method. Plugins are ideal for encapsulating
     * complex or reusable logic, such as registering multiple commands and listeners at once.
     *
     * @param usePluginOrMiddleware - The middleware function or plugin object to register.
     *
     * @example
     * // ----- Using `WhatsbotcordMiddlewareFunct` param -----
     *
     * // Middleware for logging all incoming messages
     * bot.Use(async (bot, senderId_LID, senderId_PN, chatId, rawMsg, msgType, senderType, next) => {
     *     console.log(`New message in chat ${chatId}`);
     *     await next(); // Continue to the next middleware
     * });
     *
     * @example
     * // Middleware to block a specific user
     * bot.Use((bot, senderId_LID, senderId_PN, chatId, rawMsg, msgType, senderType, next) => {
     *     if (senderId_PN === "user-to-block@s.whatsapp.net") {
     *     return; // Stop the chain by not calling next()
     * }
     * next();
     * });
     *
     * // ---- Using `WhatsbotcordPlugin` param -----
     * @example
     * // Plugin that registers multiple commands
     * const myPlugin: WhatsbotcordPlugin = {
     *   plugin: (bot) => {
     *     bot.Commands.Register("ping", async (ctx) => ctx.Reply("pong"));
     *     bot.Commands.Register("help", async (ctx) => ctx.Reply("Here is some help!"));
     *   }
     * };
     * bot.Use(myPlugin);
     */
    Use(usePluginOrMiddleware: WhatsbotcordMiddlewareFunct | WhatsbotcordPlugin): void;
    /**
     * Registers middleware that runs only when a valid command is found.
     *
     * This hook executes **after** a command has been identified but **before** the
     * command's `run` method is called. It's the ideal place for command-specific
     * logic like permission checks, cooldowns, or logging.
     *
     * Like general middleware, you must call `next()` to proceed. If `next()` is
     * not called, the command will not be executed.
     *
     * @param useMiddleware - The middleware function to execute. It receives all
     * standard message parameters, plus the `commandFound` object.
     * @see Use for general-purpose middleware that runs on all messages.
     *
     * @example
     * // Middleware to allow a command only for admins
     * bot.Use_OnCommandFound(async (bot, senderId_LID, senderId_PN, chatId, rawMsg, msgType, senderType, commandFound, next) => {
     * const admins = ["admin1@s.whatsapp.net", "admin2@s.whatsapp.net"];
     * if (commandFound.name === "ban" && (!senderId_PN || !admins.includes(senderId_PN))) {
     * // User is not an admin, block the command
     * await bot.SendMsg.Text(chatId, "You don't have permission to use that command.");
     * return;
     * }
     * // User has permission, proceed to execute the command
     * await next();
     * });
     */
    Use_OnCommandFound(useMiddleware: WhatsbotcordMiddlewareFunct_OnFoundCommand): void;
    private EVENT_OnMessageIncoming;
}

/**
 * # Extract Full Message Text
 *
 * Extracts the textual content from a raw WhatsApp message.
 *
 * This function inspects a `WAMessage` object and returns the main text associated with it.
 * It supports multiple message types, including simple text, extended text, and media captions.
 * If the message has no text content, it returns `null`.
 *
 * @param rawMsg - The raw message object received from Baileys.
 * @returns The text content of the message, or `null` if none is found.
 *
 * @example
 * ```typescript
 * const text = MsgHelper_FullMsg_GetText(rawMsg);
 * if (text) {
 *   console.log("Message text:", text);
 * }
 * ```
 */
declare function MsgHelper_FullMsg_GetText(rawMsg: WhatsappMessage): string | null;
/**
 * # Extract Quoted Message Text
 *
 * Extracts the text from a quoted message if it includes one inside a WAMessage.
 *
 * @param rawMsg - The raw message containing the quote.
 * @returns The extracted quoted text or `null` if it doesn't exist.
 *
 * @example
 * ```typescript
 * const quotedText = MsgHelper_FullMsg_GetQuotedMsgText(rawMsg);
 * console.log(quotedText);
 * ```
 */
declare function MsgHelper_FullMsg_GetQuotedMsgText(rawMsg: WhatsappMessage): string | null;
/**
 * # Extract Text From Quoted Message Object
 *
 * Extracts text content directly from a quoted message prototype object.
 *
 * @param quotedMsgOnly - The proto message object representing the quote.
 * @returns The text representation of the quoted message.
 *
 * @example
 * ```typescript
 * const quotedProto = MsgHelper_FullMsg_GetQuotedMsg(rawMsg);
 * if (quotedProto) {
 *   const text = MsgHelper_QuotedMsg_GetText(quotedProto);
 * }
 * ```
 */
declare function MsgHelper_QuotedMsg_GetText(quotedMsgOnly: WhatsappProtocolMessage): string | null;
/**
 * # Get Quoted Message Object
 *
 * Safely extracts the quoted message prototype object from a full WhatsApp message.
 *
 * @param rawMsg - The raw WhatsApp message that might contain a quote.
 * @returns The quoted message protocol object or `null` if not found.
 *
 * @example
 * ```typescript
 * const quotedProto = MsgHelper_FullMsg_GetQuotedMsg(rawMsg);
 * ```
 */
declare function MsgHelper_FullMsg_GetQuotedMsg(rawMsg: WhatsappMessage): WhatsappProtocolMessage | null;
/**
 * # Get Message Type
 *
 * Determines the type of a WhatsApp message from a raw Baileys `WAMessage` object.
 *
 * This function inspects the `message` field of the raw message and returns
 * a `MsgType` representing its type. If empty or unrecognized, returns `MsgType.Unknown`.
 *
 * @param rawMsg - The raw message object received from Baileys.
 * @returns The detected message type (`MsgType` enum).
 *
 * @example
 * ```typescript
 * const msgType = MsgHelper_FullMsg_GetMsgType(rawMsg);
 * if (msgType === MsgType.Text) {
 *   console.log("Received a text message.");
 * }
 * ```
 */
declare function MsgHelper_FullMsg_GetMsgType(rawMsg: WhatsappMessage): MsgType;
/**
 * # Get Sender Type
 *
 * Detects whether the sender chat of the message is a group or an individual.
 *
 * @param rawMsg - The received WhatsApp message object.
 * @returns A `SenderType` indicating if it comes from a Group or Individual.
 *
 * @example
 * ```typescript
 * const senderType = MsgHelper_FullMsg_GetSenderType(rawMsg);
 * if (senderType === SenderType.Group) {
 *   console.log("Message is from a group chat.");
 * }
 * ```
 */
declare function MsgHelper_FullMsg_GetSenderType(rawMsg: WhatsappMessage): SenderType;
/**
 * # Parse Prototype Message Type
 *
 * Gets the type of the message from the pure protocol message object.
 *
 * @param generic - The `IMessage` object from Baileys representing message content.
 * @returns The determined type of the message as a `MsgType` enum.
 *
 * @example
 * ```typescript
 * const msgType = MsgHelper_ProtoMsg_GetMsgType(rawMsg.message);
 * ```
 */
declare function MsgHelper_ProtoMsg_GetMsgType(generic: WhatsappProtocolMessage): MsgType;

/**
 * # Command Parameters
 *
 * Optional parameters to define additional properties for a newly created command, such as aliases.
 *
 * @example
 * ```typescript
 * const params: CommandParams = { aliases: ["ping", "p"] };
 * ```
 */
type CommandParams = {
    aliases?: string[];
};
/**
 * # Create Command Helper
 *
 * A simple function to create commands primarily for JS developers.
 * Gives you intellisense when creating your commands without needing
 * manual typings inline.
 *
 * @param commandName - The main trigger string for the command.
 * @param run - The execution function where the logic is defined.
 * @param params - Optional parameters like aliases.
 * @returns A structured `ICommand` ready to be registered in the bot.
 *
 * @example
 * ```typescript
 * const pingCommand = CreateCommand("ping", async (ctx) => {
 *   await ctx.Reply("pong");
 * });
 * ```
 */
declare function CreateCommand(commandName: string, run: (ctx: IChatContext, api: AdditionalAPI, args: CommandArgs) => Promise<void>, params?: CommandParams): ICommand;

declare const WhatsappIdentifiers: {
    Group_Suffix_ID: string;
    LID_Suffix_ID: string;
    PhoneNumber_Suffix_ID: string;
};
declare const WhatsappHelpers: {
    GetWhatsInfoFromSenderMsg: typeof WhatsappHelper_ExtractWhatsappInfoInfoFromSenderRawMsg;
    GetWhatsInfoFromWhatsappID: typeof WhatsappHelper_ExtractFromWhatsappID;
    GetWhatsInfoFromMentionStr: typeof WhatsappHelper_ExtractWhatsappInfoFromMention;
    IsLIDId: typeof WhatsappHelper_isLIDIdentifier;
    IsMentionString: typeof WhatsappHelper_isMentionId;
    IsPNId: typeof WhatsappHelper_isFullWhatsappIdUser;
    IdentifiersPostfixes: {
        Group_Suffix_ID: string;
        LID_Suffix_ID: string;
        PhoneNumber_Suffix_ID: string;
    };
};
declare const Helpers: {
    Msg: {
        FullMsg_GetQuotedMsgText: typeof MsgHelper_FullMsg_GetQuotedMsgText;
        FullMsg_GetMsgType: typeof MsgHelper_FullMsg_GetMsgType;
        FullMsg_GetText: typeof MsgHelper_FullMsg_GetText;
        FullMsg_GetQuotedMsgObj: typeof MsgHelper_FullMsg_GetQuotedMsg;
        FullMsg_GetSenderType: typeof MsgHelper_FullMsg_GetSenderType;
        QuotedMsg_GetText: typeof MsgHelper_QuotedMsg_GetText;
        AnyMsg_GetMsgType: typeof MsgHelper_ProtoMsg_GetMsgType;
    };
    Whatsapp: {
        GetWhatsInfoFromSenderMsg: typeof WhatsappHelper_ExtractWhatsappInfoInfoFromSenderRawMsg;
        GetWhatsInfoFromWhatsappID: typeof WhatsappHelper_ExtractFromWhatsappID;
        GetWhatsInfoFromMentionStr: typeof WhatsappHelper_ExtractWhatsappInfoFromMention;
        IsLIDId: typeof WhatsappHelper_isLIDIdentifier;
        IsMentionString: typeof WhatsappHelper_isMentionId;
        IsPNId: typeof WhatsappHelper_isFullWhatsappIdUser;
        IdentifiersPostfixes: {
            Group_Suffix_ID: string;
            LID_Suffix_ID: string;
            PhoneNumber_Suffix_ID: string;
        };
    };
    ChatContext_IsWaitError: typeof WhatsSocketReceiverHelper_isReceiverError;
};

export { type AdditionalAPI, ChatContext, type IChatContextConfig as ChatContextConfig, type CommandArgs, type CommandEntry, CommandType, CreateCommand, Delegate, type GroupMetadataInfo, Helpers, type IChatContext, type IWhatsSocket_Submodule_Group as IChatGroupAPI, type ICommand, type IMsgServiceSocketMinimum, type IWhatsSocket, type IWhatsappSocketAdapterClient as IWhatsSocketVendorClient, type IWhatsappAdapter as IWhatsSocketVendorFactory, type IWhatsSocket_EventsOnly_Module, type IWhatsSocket_Submodule_Group, type IWhatsSocket_Submodule_Receiver, type IWhatsSocket_Submodule_SugarSender, type WhatsbotcordMiddlewareFunct_OnFoundCommand as MiddlewareFunct_OnFoundCommand, MsgType, SenderType, WhatsSocket, type WhatsSocketLoggerMode, type WhatsSocketOptions, type WhatsSocketReceiverError, WhatsSocketReceiverMsgError, type WhatsappGroupMetadata, WhatsappHelpers, type WhatsappIDInfo, WhatsappIdType, WhatsappIdentifiers, type WhatsappMessage, Bot as Whatsbotcord, type WhatsbotcordMiddlewareFunct, type WhatsbotcordPlugin, Bot as default };
