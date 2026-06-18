import { M as MsgType, I as IChatContextConfig, q as IWhatsSocket_Submodule_Receiver, J as WhatsSocketReceiverWaitOptions, G as GroupMetadataInfo, K as WhatsMsgSenderSendingOptions, L as WhatsMsgMediaOptions, N as WhatsMsgSenderSendingOptionsMINIMUM, O as WhatsMsgAudioOptions, P as WhatsMsgDocumentOptions, Q as WhatsMsgPollOptions, R as WhatsMsgUbicationOptions, p as IWhatsSocket_Submodule_Group, T as IWhatsSocket_Submodule_Presence, l as ICommand, U as WhatsBotOptions, i as CommandType, S as SenderType } from './CommandsSearcher.types-ClCip9TY.js';
import { e as WhatsappMessageContent, f as WhatsappMessageOptions, W as WhatsappMessage } from './types-CqnhN4HR.js';

type WhatsSocketMockMsgSent = {
    chatId: string;
    content: WhatsappMessageContent;
    miscOptions?: WhatsappMessageOptions;
};

type WhatsSocketReceiverWaitObject = {
    rawMsg: WhatsappMessage;
    milisecondsDelayToRespondMock?: number;
};
type WhatsSocketReceiverMsgWaited = {
    waitedMsgType: MsgType;
    chatId: string;
    partipantId_LID: string | null;
    participantId_PN: string | null;
    options?: Partial<IChatContextConfig>;
};
declare class WhatsSocket_Submodule_Receiver_MockingSuite implements IWhatsSocket_Submodule_Receiver {
    /**
     * Pending msgs to send to command when executed.
     */
    private _queueWait;
    /**
     * All waited msgs from command after its execution
     */
    Waited: WhatsSocketReceiverMsgWaited[];
    AddWaitMsg(toAdd: WhatsSocketReceiverWaitObject): void;
    ClearMocks(): void;
    WaitMsg(userID_LID_ToWait: string | null, userID_PN_to_wait: string | null, chatId: string, expectedType: MsgType, _localOptions?: Partial<IChatContextConfig>): Promise<WhatsappMessage>;
    WaitUntilNextRawMsgFromUserIDInGroup(userID_LID_ToWait: string | null, userID_PN_toWait: string | null, chatToWaitOnID: string, expectedMsgType: MsgType, options: WhatsSocketReceiverWaitOptions): Promise<WhatsappMessage>;
    WaitUntilNextRawMsgFromUserIdInPrivateConversation(userIdToWait: string, expectedMsgType: MsgType, options: WhatsSocketReceiverWaitOptions): Promise<WhatsappMessage>;
    FetchGroupData(_chatId: string): Promise<GroupMetadataInfo | null>;
    DownloadMediaMessage(_rawMsg: WhatsappMessage): Promise<Uint8Array>;
}

/**
 * Extends {@link WhatsBotOptions} with additional settings specific to the mocking suite.
 */
type AdditionalWhatsBotOptions = {
    /**
     * An array of commands to pre-register in the bot's command handler
     * when the mock environment is initialized. This is useful for testing
     * commands that might depend on or interact with other commands.
     *
     * @example
     * ```ts
     * const chat = new ChatMock(myCommand, {
     *   botSettings: {
     *     initialCommandsToAdd: [new AnotherCommand(), new HelperCommand()]
     *   }
     * });
     * ```
     */
    initialCommandsToAdd: Array<{
        command: ICommand;
        commandType: CommandType;
    }>;
};
/**
 * Defines the configuration parameters for creating a `ChatMock` instance.
 *
 * This object allows for detailed customization of the simulated chat
 * environment, including sender details, bot settings, and message context.
 */
type MockingChatParams = {
    /**
     * Overrides for the `ChatContext` configuration, such as timeouts and
     * feedback messages. `cancelKeywords` is handled separately.
     */
    chatContextConfig?: Omit<Partial<IChatContextConfig>, "cancelKeywords">;
    /**
     * Overrides for the bot's settings (`WhatsBotOptions`), allowing customization
     * of prefixes, logging, and other bot behaviors for the test. Also includes
     * mock-specific options via `AdditionalWhatsBotOptions`.
     */
    botSettings?: Omit<Partial<WhatsBotOptions>, "cancelKeywords"> & Partial<AdditionalWhatsBotOptions>;
    /**
     * The simulated chat ID. If not provided, a default is generated.
     * The suffix (`@g.us` or `@s.whatsapp.net`) is automatically handled based on `senderType`.
     */
    chatId?: string;
    /**
     * The LID (Legacy ID) of the simulated message sender.
     * If provided, the `senderType` will default to `Group`.
     */
    participantId_LID?: string | null;
    /**
     * The PN (Phone Number ID) of the simulated message sender.
     * If provided, the `senderType` will default to `Group`.
     */
    participantId_PN?: string | null;
    /**
     * An array of strings representing the arguments passed to the command,
     * as if they were typed by the user after the command name.
     */
    args?: string[];
    /**
     * The type of the initial (command-triggering) message.
     * @default MsgType.Text
     */
    msgType?: MsgType;
    /**
     * The type of chat context to simulate.
     * - `SenderType.Individual`: A private one-on-one chat.
     * - `SenderType.Group`: A group chat.
     * @default SenderType.Individual (unless a participantId is provided)
     */
    senderType?: SenderType;
    /**
     * A list of keywords that will trigger a cancellation error when the
     * command is waiting for a user response.
     */
    cancelKeywords?: string[];
};
type MockEnqueueParamsMinimal = {
    pushName?: string;
    delayMilisecondsToReponse?: number;
};
type MockEnqueueParamsMultimediaMinimal = MockEnqueueParamsMinimal & {
    imgContentBufferMock?: Uint8Array;
};
type MockEnqueueParamsMultimedia = MockEnqueueParamsMultimediaMinimal & {
    caption?: string;
};
type MockEnqueueParamsDocument = MockEnqueueParamsMultimediaMinimal & {
    mimeType?: string;
};
type MockEnqueueParamsLocation = MockEnqueueParamsMinimal & {
    locationName?: string;
    addressDescription?: string;
};
/**
 * MockingChat is a helper utility designed to simulate a full WhatsApp chat session
 * against a given {@link ICommand}.
 *
 * It provides:
 * - Mocked **receiver**, **sender**, and **socket** modules for message flow control.
 * - Facilities to enqueue fake user messages (`SimulateTextSending`).
 * - Accessors to inspect messages that were sent/queued by the command under test.
 * - A fully configured {@link ChatContext} spy object for realistic command execution.
 *
 * Usage:
 * ```ts
 * const mock = new MockingChat(myCommand, { customParticipantId: "12345" });
 * mock.SimulateTextSending("hello");
 * await mock.StartChatSimulation();
 * ```
 */
declare class ChatMock {
    readonly ParticipantId_LID: string | null;
    readonly ParticipantId_PN: string | null;
    readonly ChatId: string;
    private readonly _senderType;
    private _constructorConfig?;
    private _chatContextMock;
    private _command;
    private _receiverMock;
    private _sugarSenderMock;
    private _groupMock;
    private _presenceMock;
    private _socketMock;
    /**
     * All messages "waited" (consumed) from the mocked receiver.
     * Useful to check what input the command attempted to consume.
     */
    get WaitedFromCommand(): WhatsSocketReceiverMsgWaited[];
    /**
     * All messages sent via the sugar-sender mock.
     * These are usually text responses triggered by the command logic.
     */
    get SentFromCommand(): {
        Texts: {
            chatId: string;
            text: string;
            options?: WhatsMsgSenderSendingOptions;
        }[];
        Images: {
            chatId: string;
            imageOptions: WhatsMsgMediaOptions;
            options?: WhatsMsgSenderSendingOptions;
        }[];
        ReactedEmojis: {
            chatId: string;
            rawMsgReactedTo: WhatsappMessage;
            emojiStr: string;
            options?: WhatsMsgSenderSendingOptionsMINIMUM;
        }[];
        Stickers: {
            chatId: string;
            stickerUrlSource: string | Uint8Array;
            options?: WhatsMsgSenderSendingOptionsMINIMUM;
        }[];
        Audios: {
            chatId: string;
            audioParams: WhatsMsgAudioOptions;
            options?: WhatsMsgSenderSendingOptionsMINIMUM;
        }[];
        Videos: {
            chatId: string;
            videoParams: WhatsMsgMediaOptions;
            options?: WhatsMsgSenderSendingOptions;
        }[];
        Documents: {
            chatId: string;
            docParams: WhatsMsgDocumentOptions;
            options?: WhatsMsgSenderSendingOptionsMINIMUM;
        }[];
        Polls: {
            chatId: string;
            pollTitle: string;
            selections: string[];
            pollParams: WhatsMsgPollOptions;
            moreOptions?: WhatsMsgSenderSendingOptionsMINIMUM;
        }[];
        Locations: {
            chatId: string;
            ubicationParams: WhatsMsgUbicationOptions;
            options?: WhatsMsgSenderSendingOptionsMINIMUM;
        }[];
        Contacts: {
            chatId: string;
            contacts: {
                name: string;
                phone: string;
            } | Array<{
                name: string;
                phone: string;
            }>;
            options?: WhatsMsgSenderSendingOptionsMINIMUM;
        }[];
    };
    /**
     * All actions executed through the group API.
     */
    get GroupActionsFromCommand(): {
        actionName: keyof IWhatsSocket_Submodule_Group;
        groupId: string;
        additionalArguments?: any;
    }[];
    get PresenceActionsFromCommand(): {
        actionName: keyof IWhatsSocket_Submodule_Presence;
        chatId?: string;
        additionalArguments?: any;
    }[];
    /**
     * Messages that were sent **through the queue** using the mocked socket.
     * This simulates queued delivery (e.g., internal socket enqueuing).
     */
    get SentFromCommandSocketQueue(): WhatsSocketMockMsgSent[];
    /**
     * Messages that were sent **directly without queueing** using the mocked socket.
     * This simulates "raw" delivery. ()
     */
    get SentFromCommandSocketWithoutQueue(): WhatsSocketMockMsgSent[];
    /**
     * Creates a new mock chat simulation environment for a given command.
     *
     * @param commandToTest - The {@link ICommand} instance to test.
     * @param additionalOptions - Optional parameters that customize chat setup,
     *   such as `customChatId`, `customParticipantId`, `args`, or `senderType`.
     *
     * Behavior:
     * - If `customParticipantId` is provided, a group chat ID is assumed unless overridden.
     * - Otherwise, defaults to a private one-to-one chat.
     * - Automatically ensures correct WhatsApp LID suffixes for IDs.
     */
    constructor(commandToTest: ICommand, additionalOptions?: MockingChatParams);
    /**
     * Simulates the sending of a text message into the mocked chat.
     * This enqueues the message into the mocked receiver, making it
     * available for the command to "consume" during execution.
     *
     * @param textToEnqueue - The message content to simulate.
     * @param options - Allows overriding the sender pushName (WhatsApp display name).
     */
    EnqueueIncoming_Text(textToEnqueue: string, options?: MockEnqueueParamsMinimal): void;
    /**
     * Simulates an incoming image message, enqueuing it for the command under test to consume.
     *
     * ### Overloads
     * This method provides two convenient overloads for simulating image messages:
     *
     * 1.  **`EnqueueIncoming_Img(imgUrl: string, opts?: MockEnqueueParamsMultimedia)`**
     *     - Simulates an image from a specific URL or file path.
     *     - Use the `opts` parameter to add a `caption`, `pushName`, or mock the download buffer.
     *
     * 2.  **`EnqueueIncoming_Img(opts?: MockEnqueueParamsMultimedia)`**
     *     - Simulates a generic, default placeholder image (`./whatsbotcord-mock-img.png`).
     *     - This is useful when the specific image content is not important for the test.
     *     - Can be called with no arguments.
     *
     * ### Multimedia Mocking
     * The `bufferToReturnOn_WaitMultimedia` option allows you to specify a `Buffer` that `ctx.WaitMultimedia()`
     * will resolve with. This is essential for testing multimedia handling logic without performing
     * actual downloads.
     *
     * @example
     * ```ts
     * // Overload 1: Simulate an image from a URL with a caption.
     * mock.EnqueueIncoming_Img("http://example.com/image.jpg", { caption: "Look at this!" });
     *
     * // Overload 2: Simulate a default image with a custom sender name.
     * mock.EnqueueIncoming_Img({ pushName: "Another User" });
     *
     * // Or just... to simulate a generic img coming from user.
     * mock.EnqueueIncoming_Img();
     * ```
     */
    EnqueueIncoming_Img(opts?: MockEnqueueParamsMultimedia): void;
    EnqueueIncoming_Img(imgUrl: string, opts?: MockEnqueueParamsMultimedia): void;
    /**
     * Simulates the sending of a sticker message into the mocked chat.
     * Enqueues the message into the mocked receiver for the command to
     * consume.
     *
     * If a `bufferToReturnOnWaitMultimedia` is set, that buffer will be
     * returned during multimedia waits instead of performing a real
     * download.
     *
     * @param urlSticker - URL of the sticker file (usually `.webp`).
     * @param opts - Optional parameters like pushName and a mock buffer.
     */
    EnqueueIncoming_Sticker(urlSticker: string, opts?: MockEnqueueParamsMultimediaMinimal): void;
    /**
     * Simulates the sending of an audio message into the mocked chat.
     * The message is added to the mocked receiver queue.
     *
     * If a mock buffer is provided, it will be used when awaiting
     * multimedia content via {@link WaitMultimedia}.
     *
     * @param urlaudio - URL of the audio file to simulate.
     * @param opts - Optional pushName and buffer override.
     */
    EnqueueIncoming_Audio(urlaudio: string, opts?: MockEnqueueParamsMultimediaMinimal): void;
    /**
     * Simulates the sending of a video message into the mocked chat.
     * This includes optional captions and sender details.
     *
     * If a buffer override is specified, it will be used during multimedia
     * waits instead of fetching from the URL.
     *
     * @param urlVideo - URL of the video file to simulate.
     * @param opts - Optional parameters (caption, pushName, buffer).
     */
    EnqueueIncoming_Video(urlVideo: string, opts?: MockEnqueueParamsMultimedia): void;
    /**
     * Simulates the sending of a document message into the mocked chat.
     * Enqueues the message with proper filename and mimetype resolution.
     *
     * A mock buffer can be attached to override multimedia waits for this
     * document.
     *
     * @param urlDocument - URL of the document to simulate.
     * @param fileName - Filename to associate with the document.
     * @param opts - Optional mimetype, pushName, and buffer override.
     */
    EnqueueIncoming_Document(urlDocument: string, fileName: string, opts?: MockEnqueueParamsDocument): void;
    /**
     * Simulates the sending of a location message into the mocked chat.
     * The message includes geographic coordinates and optional descriptive
     * fields like name and address.
     *
     * @param latitude - Latitude of the location.
     * @param longitude - Longitude of the location.
     * @param opts - Optional location name, address description, and pushName.
     */
    EnqueueIncoming_Location(latitude: number, longitude: number, opts?: MockEnqueueParamsLocation): void;
    /**
     * Simulates the contact(s) sending mdg into the mocked chat.
     * The messaged include all contact or contacts with all mocked
     * environment metadata included.
     *
     * @param contact_s - Contact or contacts array
     * @param opts - Optional config obj: Actually including only 'pushName' prop
     */
    EnqueueIncoming_Contact(contact_s: {
        name: string;
        phone: string;
    } | Array<{
        name: string;
        phone: string;
    }>, opts?: MockEnqueueParamsMinimal): void;
    /**
     * Starts the simulation by executing the command under test with the mocked context
     * and sending all queued msgs with this class EnqueueIncoming*() methods.
     *
     * Use it to start your test with your command
     *
     * This method:
     * - Creates a fake invocation of the command (`!commandName`).
     * - Injects mocked sender/receiver/socket modules into the execution context.
     * - Runs the command's `run` method as if in a real bot environment.
     */
    StartChatSimulation(): Promise<void>;
    /**
     * Overrides the group metadata used in this mocked chat environment.
     * This is useful for simulating different group states (e.g., id,
     * subject, participants) without relying on real WhatsApp server data.
     *
     * Behavior:
     * - Ensures the `id` field has the correct suffix depending on whether
     *   the current sender type is group or individual.
     * - Updates the `ChatId` internally and applies the metadata to the
     *   receiver and socket mocks.
     *
     * @param metadata - Partial group metadata to inject into the mock
     *   environment. If `id` is provided, it will be normalized.
     */
    SetGroupMetadataMock(metadata: Partial<GroupMetadataInfo>): void;
    /**
     * Resets the entire mocking environment back to its initial state.
     * This clears:
     * - Receiver mock state
     * - Sugar sender mock state
     * - Socket mock state
     * - Chat context mock state
     *
     * Use this before or after each test to ensure isolation between cases.
     */
    ClearMocks(): void;
    /**
     * Configure the buffer that will be returned in place of a real
     * downloaded multimedia message when using "ctx.WaitMultimedia(...)".
     *
     * @param anyBuffer - The buffer/Uint8Array to return on next `WaitMultimedia` calls.
     */
    SetWaitMsgBufferToReturnMock(anyBuffer: Uint8Array): void;
}

export { ChatMock as C, type MockEnqueueParamsDocument as M, WhatsSocket_Submodule_Receiver_MockingSuite as W, type MockEnqueueParamsLocation as a, type MockEnqueueParamsMinimal as b, type MockEnqueueParamsMultimedia as c, type MockEnqueueParamsMultimediaMinimal as d, type MockingChatParams as e };
