import { W as WhatsappHelper_ExtractWhatsappInfoInfoFromSenderRawMsg, a as WhatsappHelper_ExtractFromWhatsappID, b as WhatsappHelper_ExtractWhatsappInfoFromMention, c as WhatsappHelper_isLIDIdentifier, d as WhatsappHelper_isMentionId, e as WhatsappHelper_isFullWhatsappIdUser, f as WhatsSocketReceiverHelper_isReceiverError, B as Bot } from './CommandsSearcher.types-BpkRelKe.js';
export { A as AdditionalAPI, C as ChatContext, I as ChatContextConfig, g as CommandArgs, h as CommandEntry, i as CommandType, D as Delegate, G as GroupMetadataInfo, j as IChatContext, k as IChatGroupAPI, l as ICommand, m as IMsgServiceSocketMinimum, n as IWhatsSocket, o as IWhatsSocket_EventsOnly_Module, p as IWhatsSocket_Submodule_Group, q as IWhatsSocket_Submodule_Receiver, r as IWhatsSocket_Submodule_SugarSender, s as MiddlewareFunct_OnFoundCommand, M as MsgType, S as SenderType, t as WhatsSocket, u as WhatsSocketOptions, v as WhatsSocketReceiverError, w as WhatsSocketReceiverMsgError, x as WhatsappIDInfo, y as WhatsappIdType, z as WhatsbotcordMiddlewareFunct, E as WhatsbotcordPlugin } from './CommandsSearcher.types-BpkRelKe.js';
import { MsgHelper_FullMsg_GetQuotedMsgText, MsgHelper_FullMsg_GetMsgType, MsgHelper_FullMsg_GetText, MsgHelper_FullMsg_GetQuotedMsg, MsgHelper_FullMsg_GetSenderType, MsgHelper_QuotedMsg_GetText, MsgHelper_ProtoMsg_GetMsgType } from './whatsbotcord-browser-lib.helpers.js';
export { CreateCommand, WorkFlowNumericMany, WorkflowNumericArgs, WorkflowNumericSingle } from './whatsbotcord-browser-lib.helpers.js';
export { I as IWhatsSocketVendorClient, a as IWhatsSocketVendorFactory, b as WhatsSocketLoggerMode, c as WhatsappGroupMetadata, W as WhatsappMessage, d as WhatsappPresenceState } from './types-CqnhN4HR.js';
export { C as ChatMock, M as MockEnqueueParamsDocument, a as MockEnqueueParamsLocation, b as MockEnqueueParamsMinimal, c as MockEnqueueParamsMultimedia, d as MockEnqueueParamsMultimediaMinimal, e as MockingChatParams } from './types-D7vDAIXS.js';

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
