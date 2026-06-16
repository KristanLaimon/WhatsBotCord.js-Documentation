import { M as MsgType, S as SenderType, j as IChatContext, A as AdditionalAPI, g as CommandArgs, l as ICommand } from './CommandsSearcher.types-Cl63i0Aw.js';
export { a as WhatsappHelper_ExtractFromWhatsappID, b as WhatsappHelper_ExtractWhatsappInfoFromMention, W as WhatsappHelper_ExtractWhatsappInfoInfoFromSenderRawMsg, e as WhatsappHelper_isFullWhatsappIdUser, c as WhatsappHelper_isLIDIdentifier, d as WhatsappHelper_isMentionId, x as WhatsappIdType } from './CommandsSearcher.types-Cl63i0Aw.js';
import { W as WhatsappMessage, l as WhatsappProtocolMessage } from './types-C_BnhUPh.js';

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

export { CreateCommand, MsgHelper_FullMsg_GetMsgType, MsgHelper_FullMsg_GetQuotedMsg, MsgHelper_FullMsg_GetQuotedMsgText, MsgHelper_FullMsg_GetSenderType, MsgHelper_FullMsg_GetText, MsgHelper_ProtoMsg_GetMsgType, MsgHelper_QuotedMsg_GetText };
