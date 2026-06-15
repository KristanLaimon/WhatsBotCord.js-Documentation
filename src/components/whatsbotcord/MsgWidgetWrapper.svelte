<script lang="ts">
  import MsgWidget, { type MsgWidgetProps } from "./MsgWidget/MsgWidget.svelte";
  import type { Chat } from "./MsgWidget/MsgWidget";
  import { type IMsgWidget } from "./MsgWidget/MsgWidget.ts";
  import MsgWidgetStore from "./store/MsgWidgetStore.svelte.ts"; 
  import { onMount } from "svelte";


  let {
    chats = [],
    colorMode = $bindable(),
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
      id: 999,
      name: "Bot User (Individual)",
      preview: "Say something to the bot!",
      time: "Now",
      unread: 0,
      IsWhatsbotCordHere: true,
      isGroup: false,
      IsUniquePrivateChatWithBot: true,
      messages: [
        { id: 1, type: "date-divider", text: "Today" },
        { id: 2, type: "system", text: "This is a private chat with the bot." },
      ],
    },
    {
      id: 1000,
      name: "Bot Test Group",
      preview: "Say something to the bot!",
      time: "Now",
      avatar: { label: "BG", color: "#43a57c" },
      unread: 0,
      IsWhatsbotCordHere: true,
      isGroup: true,
      messages: [
        { id: 1, type: "date-divider", text: "Today" },
        { id: 2, type: "system", text: "This is a group chat where the bot is a member." },
      ],
    },
  ];

  const mergedChats : Chat[] = $derived([...DEFAULT_CHATS, ...chats])
</script>

<MsgWidget 
  bind:this={innerMsgWidget}
  chats={mergedChats}
  {...restProps}
/>
