import { W as WhatsappHelper_ExtractWhatsappInfoInfoFromSenderRawMsg, a as WhatsappHelper_ExtractFromWhatsappID, b as WhatsappHelper_ExtractWhatsappInfoFromMention, c as WhatsappHelper_isLIDIdentifier, d as WhatsappHelper_isMentionId, e as WhatsappHelper_isFullWhatsappIdUser, f as WhatsSocketReceiverHelper_isReceiverError, B as Bot } from './CommandsSearcher.types-Cl63i0Aw.js';
export { A as AdditionalAPI, C as ChatContext, I as ChatContextConfig, g as CommandArgs, h as CommandEntry, i as CommandType, D as Delegate, G as GroupMetadataInfo, j as IChatContext, k as IChatGroupAPI, l as ICommand, m as IMsgServiceSocketMinimum, n as IWhatsSocket, o as IWhatsSocket_EventsOnly_Module, k as IWhatsSocket_Submodule_Group, p as IWhatsSocket_Submodule_Receiver, q as IWhatsSocket_Submodule_SugarSender, r as MiddlewareFunct_OnFoundCommand, M as MsgType, S as SenderType, s as WhatsSocket, t as WhatsSocketOptions, u as WhatsSocketReceiverError, v as WhatsSocketReceiverMsgError, w as WhatsappIDInfo, x as WhatsappIdType, y as WhatsbotcordMiddlewareFunct, z as WhatsbotcordPlugin } from './CommandsSearcher.types-Cl63i0Aw.js';
import { MsgHelper_FullMsg_GetQuotedMsgText, MsgHelper_FullMsg_GetMsgType, MsgHelper_FullMsg_GetText, MsgHelper_FullMsg_GetQuotedMsg, MsgHelper_FullMsg_GetSenderType, MsgHelper_QuotedMsg_GetText, MsgHelper_ProtoMsg_GetMsgType } from './whatsbotcord-browser-lib.helpers.js';
export { CreateCommand } from './whatsbotcord-browser-lib.helpers.js';
export { I as IWhatsSocketVendorClient, a as IWhatsSocketVendorFactory, b as WhatsSocketLoggerMode, c as WhatsappGroupMetadata, W as WhatsappMessage } from './types-C_BnhUPh.js';
export { C as ChatMock, M as MockEnqueueParamsDocument, a as MockEnqueueParamsLocation, b as MockEnqueueParamsMinimal, c as MockEnqueueParamsMultimedia, d as MockEnqueueParamsMultimediaMinimal, e as MockingChatParams } from './types-O6OAA9xa.js';

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

export { Helpers, WhatsappHelpers, WhatsappIdentifiers, Bot as Whatsbotcord, Bot as default };
