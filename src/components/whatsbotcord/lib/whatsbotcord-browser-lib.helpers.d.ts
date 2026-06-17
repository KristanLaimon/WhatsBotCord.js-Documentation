import { M as MsgType, S as SenderType, j as IChatContext, A as AdditionalAPI, g as CommandArgs, l as ICommand } from './CommandsSearcher.types-5f4mEWao.js';
export { a as WhatsappHelper_ExtractFromWhatsappID, b as WhatsappHelper_ExtractWhatsappInfoFromMention, W as WhatsappHelper_ExtractWhatsappInfoInfoFromSenderRawMsg, e as WhatsappHelper_isFullWhatsappIdUser, c as WhatsappHelper_isLIDIdentifier, d as WhatsappHelper_isMentionId, E as WhatsappIdType } from './CommandsSearcher.types-5f4mEWao.js';
import { W as WhatsappMessage, l as WhatsappProtocolMessage } from './types-CqnhN4HR.js';

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

/**
 * Configuration arguments for the `WorkflowNumeric` class.
 * @template T The type of the options to be presented.
 */
type WorkflowNumericArgs<T> = {
    /** A function that converts an option of type `T` into a display string for the user. */
    FrontEndSelector: (option: T, index: number) => string /** The introductory message to send before listing the options. */;
    StartingMsg: string /** The message to send when the user provides an invalid (non-numeric or out-of-range) response. */;
    WrongMsg: string /** The time in milliseconds to wait for a user's response before the workflow times out. */;
    TimeoutMS: number /** The number to start the list from (e.g., 1). Defaults to 1. */;
    startingNumber?: number;
};

/**
 * Manages an interactive workflow where a user is prompted to select an option from a numbered list.
 *
 * This class sends a list of choices to the user and waits for them to reply with a number
 * corresponding to their selection. It handles input validation, retries, and timeouts.
 *
 * @template T The type of the options to be presented.
 */
declare class WorkflowNumericSingle<T> {
    ctx: IChatContext;
    config: WorkflowNumericArgs<T>;
    options: T[];
    /** The regular expression used to validate that the user's response is one of the valid numbers. */
    private responseRegex;
    /**
     * Initializes a new numeric selection workflow.
     * @param ctx The chat context where the workflow will run.
     * @param config The configuration for the workflow's messages and behavior.
     * @param options An array of options of type `T` for the user to choose from.
     */
    constructor(ctx: IChatContext, config: WorkflowNumericArgs<T>, options: T[]);
    /**
     * Starts the workflow and waits for the user to select a single valid option.
     * @returns A `Promise` that resolves to the selected option of type `T`, or `null` if the user fails to respond in time.
     */
    selectOne(): Promise<T | null>;
    /**
     * Handles the core loop of sending options, waiting for a reply, and validating it.
     * @returns A `Promise` that resolves to the number chosen by the user, or `null` on timeout.
     */
    private askUntilGetValidOption;
}

/**
 * Manages an interactive workflow where a user can select multiple options from a numbered list.
 *
 * This class sends a list of choices and waits for the user to reply with one or more numbers
 * corresponding to their selections (e.g., "1, 3, 4"). It handles input validation, retries, and timeouts.
 *
 * @template T The type of the options to be presented.
 */
declare class WorkFlowNumericMany<T> {
    ctx: IChatContext;
    config: WorkflowNumericArgs<T>;
    options: T[];
    /**
     * Initializes a new multi-selection workflow.
     * @param ctx The chat context where the workflow will run.
     * @param config The configuration for the workflow's messages and behavior.
     * @param options An array of options for the user to choose from.
     */
    constructor(ctx: IChatContext, config: WorkflowNumericArgs<T>, options: T[]);
    /**
     * Starts the workflow and waits for the user to select one or more valid options.
     * @returns A `Promise` that resolves to an array of the selected options of type `T`,
     * or `null` if the user fails to respond in time.
     */
    selectMany(): Promise<T[] | null>;
    /**
     * Handles the core loop of sending options, waiting for a reply, and validating it for multiple numbers.
     * @returns A `Promise` that resolves to an array of unique numbers chosen by the user, or `null` on timeout.
     */
    private askUntilGetValidOptions;
}

export { CreateCommand, MsgHelper_FullMsg_GetMsgType, MsgHelper_FullMsg_GetQuotedMsg, MsgHelper_FullMsg_GetQuotedMsgText, MsgHelper_FullMsg_GetSenderType, MsgHelper_FullMsg_GetText, MsgHelper_ProtoMsg_GetMsgType, MsgHelper_QuotedMsg_GetText, WorkFlowNumericMany, type WorkflowNumericArgs, WorkflowNumericSingle };
