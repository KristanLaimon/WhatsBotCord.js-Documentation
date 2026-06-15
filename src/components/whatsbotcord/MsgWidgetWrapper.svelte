<script lang="ts">
  import MsgWidget, { type MsgWidgetProps } from "./MsgWidget/MsgWidget.svelte";
  import type { Chat } from "./MsgWidget/MsgWidget";
  import { type IMsgWidget } from "./MsgWidget/MsgWidget.ts";
  import MsgWidgetStore from "./store/MsgWidgetStore.svelte.ts"; 
  import { onMount } from "svelte";


  let {
    chats = [],
    colorMode = $bindable(),
    showChatList = $bindable(),
    ...restProps
  }: MsgWidgetProps  = $props();


  let innerMsgWidget = $state<IMsgWidget | undefined>();

  onMount(() => {
    return () => {
      MsgWidgetStore.ActiveRef = undefined;
    }
  })

  $effect(() => {
    if(innerMsgWidget){
      MsgWidgetStore.ActiveRef = innerMsgWidget
    }
  });
  
  const DEFAULT_CHATS: Chat[] = [
    {
      id: 998,
      name: "Instructions and notes",
      preview: "Read me to know how to use this playground",
      time: "Now",
      unread: 0,
      IsWhatsbotCordHere: false,
      isGroup: true,
      messages: [
        { id: 1, type: "date-divider", text: "Since the creation of whatsbtocord docs..." },
        { id: 2, type: "system", text: "Docs chat only. (Bot not available here)" },
        { id: 2.5,      
          type: "incoming", 
          sender: "Whatsbotcord Docs", 
          senderColor: "#5e4ec2", 
          time: "Docs", 
          imageSrc: "/mock-multimedia/images/whatsbotcord_fox_vertical.png",
        },
        { id: 3, type: "incoming", sender: "Whatsbotcord Docs", senderColor: "#5e4ec2", time: "Docs", text: "Welcome to the Whatsbotcord Playground! 🚀" },
        { id: 3.5, type: "incoming", sender: "Whatsbotcord Docs", senderColor: "#5e4ec2", time: "Docs", text: "Start by opening the chats sidebar and going to any chat to start !using! the bot!" },
        { id: 4, type: "incoming", sender: "Whatsbotcord Docs", senderColor: "#5e4ec2", time: "Docs", text: "This is a fully mocked/simulated environment running 100% in your browser using a browser-friendly version of the library. It imitates the most possible to the Node.js/Bun/Deno library version of whatsbotcord library." },
        { id: 5, type: "incoming", sender: "Whatsbotcord Docs", senderColor: "#5e4ec2", time: "Docs", text: "⚠️ Please note that 100% of the original API might not be available or work in this virtual sandbox, since the library is originally designed to run in backend environments (Node.js, Bun, Deno)." },
        { id: 6, type: "incoming", sender: "Whatsbotcord Docs", senderColor: "#5e4ec2", time: "Docs", text: "However, you can still test the vast mayority of this library including but not limited to command flows, Emojis, reactions, media, and more!" },
        { id: 7, type: "incoming", sender: "Whatsbotcord Docs", senderColor: "#5e4ec2", time: "Docs", text: "To send media (images, gifs, documents, PDFs), use the global `MockMedia` object injected in the editor. For example:\n\nawait ctx.SendImg(MockMedia.Images.Fox)\n\nThis will send a fox image to the chat in real-time. You can also test with gifs, PDFs, and documents using similar properties from MockMedia." },
        { id: 8, type: "incoming", sender: "Whatsbotcord Docs", senderColor: "#5e4ec2", time: "Docs", text: "Use the sidebar on the left to switch between this notes channel, the WhatsBot private chat ('WhatsBot'), or the test group ('Whatsgroup') to test your commands. Have fun! ⚡" },
        { id: 9, type: "incoming", sender: "Whatsbotcord Docs", senderColor: "#5e4ec2", time: "Docs", text: "Below are examples of how each media type looks and the code you write to send them:" },
        { 
          id: 10, 
          type: "incoming", 
          sender: "Whatsbotcord Docs", 
          senderColor: "#5e4ec2", 
          time: "Docs", 
          imageSrc: "/mock-multimedia/images/frieren_ratio_1_1.webp",
          text: "await ctx.SendImgWithCaption(MockMedia.Images.Frieren, \"The eternal Journey\");" 
        },
        { 
          id: 11, 
          type: "incoming", 
          sender: "Whatsbotcord Docs", 
          senderColor: "#5e4ec2", 
          time: "Docs", 
          videoSrc: "/mock-multimedia/videos/buck-bunny.mp4",
          text: "await ctx.SendVideoWithCaption(MockMedia.Videos.BuckBunny, \"Bunny bunny\");" 
        },
        { 
          id: 12, 
          type: "incoming", 
          sender: "Whatsbotcord Docs", 
          senderColor: "#5e4ec2", 
          time: "Docs", 
          documentSrc: "/mock-multimedia/pdfs/pdf-sample.pdf",
          documentName: "Sample.pdf",
          text: "await ctx.SendDocumentWithCustomName(MockMedia.Pdfs.Sample, \"Sample.pdf\");" 
        },
        { 
          id: 13, 
          type: "incoming", 
          sender: "Whatsbotcord Docs", 
          senderColor: "#5e4ec2", 
          time: "Docs", 
          stickerSrc: "/mock-multimedia/gifs/eyes-anime.gif",
          text: "await ctx.SendSticker(MockMedia.Gifs.EyesAnime);" 
        },
        { id: 14, type: "incoming", sender: "Whatsbotcord Docs", senderColor: "#5e4ec2", time: "Docs", text: "Any problems, bugs, or suggestions you have, create an issue in this documentation repo! \n\n https://github.com/KristanLaimon/WhatsBotCord.js-Documentation/issues" }
      ]

    },
    {
      id: 999,
      name: "WhatsBot (Private Chat with bot)",
      preview: "Use me to test private chat environment in your commands!",
      time: "Now",
      unread: 0,
      IsWhatsbotCordHere: true,
      isGroup: false,
      IsUniquePrivateChatWithBot: true,
      subtitle: "online",
      messages: [
        { id: 1, type: "date-divider", text: "Today" },
        { id: 2, type: "system", text: "This is a private chat with the bot." },
      ],
      
    },
    {
      id: 1000,
      name: "Whatsgroup (Group with bot)",
      preview: "Use me to test group environments in your commands!",
      time: "Now",
      avatar: { label: "BG", color: "#43a57c" },
      unread: 0,
      IsWhatsbotCordHere: true,
      isGroup: true,
      subtitle: "15 participants",
      messages: [
        { id: 1, type: "date-divider", text: "Today" },
        { id: 2, type: "system", text: "This is a group chat where the bot is a member." },
        { id: 3, type: "incoming", sender: "[Documentation]", text: "This is a 'group chat' having the bot as member of it"},
        { id: 4, type: "incoming", sender: "[Documentation]", text: "So adding your bot merely as member is enough to make it work in any group!"},
        { id: 5, type: "incoming", sender: "[Documentation]", text: "Try sending me any command here or the default '!ping'."},
        { id: 6, type: "incoming", sender: "[Documentation]", text: "Enter your in txt-box below and press *Enter*"}
      ],
    },
  ];

  const mergedChats : Chat[] = $derived([...DEFAULT_CHATS, ...chats])
</script>

<MsgWidget 
  bind:this={innerMsgWidget}
  chats={mergedChats}
  bind:showChatList={showChatList}
  {...restProps}
/>
