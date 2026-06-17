# Whatsbotcord AI Agents Reference

This file contains essential context and recommended patterns to help AI agents build with Whatsbotcord.

## File: src\content\docs\essential_concepts\additional_api.mdx

`mdx
---
title: "Additional API"
description: "Overview of the AdditionalAPI object given to commands and how you can use the raw Bot API for cross-chat operations."
---

import { Tabs, TabItem } from "@astrojs/starlight/components";

Every command in WhatsBotCord receives three main arguments in its `run` method: `ctx`, `api`, and `args` (which you can learn more about in the [Command Arguments](/essential_concepts/command_args) page). While your `ctx` (our robust [Chat Context wrapper](/essential_concepts/chat_context)) focuses on interacting effortlessly with the exact chat the command was triggered from, the **`api` (`AdditionalAPI`)** provides access to lower-level bot mechanics and global cross-chat capabilities.

```ts
export default class MyCommand implements ICommand {
  name = "example";

  // The second argument `api` injected here is the `AdditionalAPI` object
  public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
    // ...
  }
}
```

## Structure of AdditionalAPI

The `api` object provides powerful submodules:

### 1. `Myself.Status`

Allows the bot to post status updates (WhatsApp Stories) directly to its broadcast list.

```ts
// Upload a text status visible to the provided specific contacts
await api.Myself.Status.UploadText(
  "Bot is online ✅",
  ["1234567890@s.whatsapp.net"] // WhatsApp IDs that can view your story
);
```

### 2. `Myself.Bot`

Provides read-only access to the minimal bot info. Useful if your command needs to read the current runtime configurations (like `api.Myself.Bot.Settings.commandPrefix`) or dynamically search other commands in the system.

```ts
// Example: Outputting the bot's configured prefixes
const prefixes = api.Myself.Bot.Settings.commandPrefix;
await ctx.SendText(`My configured prefixes are: ${prefixes.join(", ")}`);

// Example: Iterating over all registered commands
const allCommands = api.Myself.Bot.Commands.NormalCommands;
await ctx.SendText(`I have ${allCommands.length} normal commands registered!`);
```

### 3. `InternalSocket`

Direct access to the underlying WhatsApp socket implementation (the Vendor Adapter). Use it to send messages manually or tap into raw events.

> ⚠️ **Caution**: Bypassing `ChatContext` means you are responsible for handling errors, message formatting, and safe sending.

```ts
// Example: Send a raw message directly to another group using InternalSocket
const targetGroupId = "123456789@g.us";
await api.InternalSocket.Send.Text(targetGroupId, "Hello from the raw socket!");
```

---

## Global Cross-Chat Actions

Inside a command, your `ChatContext` is heavily bound to the chat the command was typed in. But what if you want to react to **external system events** and broadcast messages globally across multiple groups?

The main [Bot](/essential_concepts/bot) instance itself exposes direct dispatch components that can be used outside the command flow safely:

- `bot.SendMsg`
- `bot.ReceiveMsg`
- `bot.InternalSocket`

### Simple Example: Background Timer

You can use the bot instance globally to send messages when a `setTimeout` triggers, outside of any command.

```ts
import Whatsbotcord, { BaileysAdapter } from "whatsbotcord";

const bot = new Whatsbotcord({
  commandPrefix: "!",
}, new BaileysAdapter({ credentialsFolder: "./auth" }));

// Start the bot as usual
await bot.Start();

// Send a message 10 seconds after starting
setTimeout(async () => {
  const targetId = "1234567890@s.whatsapp.net";
  await bot.SendMsg.Text(targetId, "10 seconds have passed since the bot started!");
}, 10000);
```

### With express backend

Imagine you have an external web server (like Express) running alongside your bot. Whenever a specific HTTP endpoint is hit, you want your WhatsApp Bot to automatically alert a specific group.

Because this endpoint is triggered by a web request and is not bound to a user's `ChatContext`, you can utilize the `Bot` instance globally and use `bot.SendMsg`.

```ts
import express from "express";
import type { WhatsBot } from "whatsbotcord";

export function StartWebhookServer(bot: WhatsBot) {
  const app = express();
  app.use(express.json());

  app.post("/alert", async (req, res) => {
    // Send message to a specific group using the global Bot instance
    await bot.SendMsg.Text("123456789@g.us", `🚨 Alert triggered: ${req.body.message}`);
    res.send("Alert sent to WhatsApp!");
  });

  app.listen(8080, () => console.log("Server listening on port 8080"));
}
```

### When to use `bot.SendMsg` vs `ChatContext`?

- Formulating command replies, waiting for a user input, or quoting user messages 👉 Always use **`ChatContext`**.
- Broadcasting announcements, triggering cross-chat actions based on external database hooks, WebSockets, or file events 👉 Pass the **`Bot`** framework and use **`bot.SendMsg`**.


`

## File: src\content\docs\essential_concepts\bot.mdx

`mdx
---
title: "The Bot Instance"
description: "The core Whatsbotcord instance: Initialization, main components, and complete configuration options."
---

import { Tabs, TabItem, Aside, Steps } from "@astrojs/starlight/components";

The `Bot` (or `Whatsbotcord`) instance is the absolute core of your application. It manages the underlying WhatsApp socket connection, orchestrates the middleware pipeline, handles incoming events, and serves as the registry for all your commands.

---

## Minimal Initialization

To get your bot up and running, you only need to instantiate it and call `.Start()`. 

<Aside type="note">
Even though this code starts the bot and connects it to WhatsApp, **it won't actually do anything when users message it yet!** The bot relies entirely on commands and event listeners to interact.

To learn how to create your first command, check out the [Quick Start](/getting-started/quickstart) guide or explore the [Guides & Tutorials](/tutorials/waiting-input) section.
</Aside>

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```ts
    import Whatsbotcord from "whatsbotcord";

    const bot = new Whatsbotcord({
      commandPrefix: "!",
      loggerMode: "recommended",
    });

    await bot.Start();
    ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
    ```js
    import Whatsbotcord from "whatsbotcord";

    const bot = new Whatsbotcord({
      commandPrefix: "!",
      loggerMode: "recommended",
    });

    await bot.Start();
    ```
  </TabItem>
</Tabs>

---

## Core Components

The Bot instance exposes several powerful modules that you will use to shape your application.

- **`bot.Commands`**: The built-in command registry. Use `bot.Commands.Add(myCommand)` to register new commands.
- **`bot.Use(...)`**: The middleware pipeline manager. You can seamlessly intercept messages before they reach commands or apply official plugins.
- **`bot.Events`**: The global event emitter. Subscribe to socket events or command lifecycle hooks.
- **`bot.Settings`**: Access or mutate the bot's runtime settings dynamically.

Here is an example demonstrating how these core components fit together:

```ts
import Whatsbotcord, { CommandType, OfficialPlugin_OneCommandPerUserAtATime } from "whatsbotcord";
import { PingCommand, SendPrivately } from "./commands";

const bot = new Whatsbotcord({
  commandPrefix: ["!", "/"],
  credentialsFolder: "./auth",
});

// 1. Add Commands
bot.Commands.Add(new PingCommand(), CommandType.Normal);
bot.Commands.Add(new SendPrivately(), CommandType.Normal);

// 2. Use Middleware & Plugins
bot.Use(
  OfficialPlugin_OneCommandPerUserAtATime({
    msgToSend: (info, lastCommand, actualCommand) => {
      return `You ${info.pushName} have already started command !${lastCommand.name}, you can't use !${actualCommand.name} yet.`;
    },
    timeoutSecondsToForgetThem: 60 * 5,
  })
);

// 3. Mutate Runtime Settings dynamically
bot.Settings.defaultEmojiToSendReactionOnFailureCommand = "🦊";

// 4. Start the bot
await bot.Start();
```

---

## Configuration Reference

The `Whatsbotcord` constructor accepts an extensive set of configuration properties to fine-tune prefixes, connection throttling, error handling, interactive prompt defaults, and more.

Here is an example of a bot initialized with custom configuration values:

```ts
const bot = new Whatsbotcord({
  commandPrefix: ["$", "!", "/", "."],
  tagPrefix: ["@"],
  credentialsFolder: process.env.NODE_ENV === "development" ? "auth_canary" : "./auth",
  loggerMode: "recommended",
  delayMilisecondsBetweenMsgs: 1,
  cancelKeywords: ["cancelcustom"],
  defaultEmojiToSendReactionOnFailureCommand: "🦊",
});
```

### Basic Options

The main options you should always set or at least be aware of.

| Property            | Type                    | Default    | Description                                                                                          |
| :------------------ | :---------------------- | :--------- | :--------------------------------------------------------------------------------------------------- |
| `commandPrefix`     | `string \| string[]`    | `'!'`      | Character(s) used to prefix commands. Configure multiple prefixes with an array (e.g. `['!', '/']`). |
| `tagPrefix`         | `string \| string[]`    | `'@'`      | Character(s) used to tag the bot in messages (especially useful in group contexts).                  |
| `credentialsFolder` | `string`                | `"./auth"` | Path to the folder where WhatsApp session credentials are stored.                                    |
| `loggerMode`        | `WhatsSocketLoggerMode` | `"debug"`  | Logging verbosity level (e.g. `"recommended"`, `"silent"`, `"debug"`, `"error"`).                    |
| `ignoreSelfMessage` | `boolean`               | `true`     | If true, the bot ignores messages sent by its own account to prevent infinite loops.                 |

### Connection & Throttling Options

Tweak these options if you experience high concurrency messaging or encounter problems with WhatsApp rate-limiting your bot.

| Property                      | Type     | Default | Description                                                                                    |
| :---------------------------- | :------- | :------ | :--------------------------------------------------------------------------------------------- |
| `maxReconnectionRetries`      | `number` | `5`     | Maximum number of reconnection attempts if the socket drops unexpectedly.                      |
| `senderQueueMaxLimit`         | `number` | `20`    | Maximum number of messages queued globally. Buffers pending output to avoid dropping messages. |
| `delayMilisecondsBetweenMsgs` | `number` | `100`   | Delay between sending queued messages to prevent spamming/flooding the WhatsApp API.           |

### Command Error Handling

Configure how the bot reacts when a command crashes or throws an unhandled exception.

<Aside type="tip">
Keeping `enableCommandSafeNet` enabled is highly recommended for production to prevent your entire script from fatally crashing if a single command errors out.
</Aside>

| Property                                     | Type             | Default     | Description                                                                                            |
| :------------------------------------------- | :--------------- | :---------- | :----------------------------------------------------------------------------------------------------- |
| `enableCommandSafeNet`                       | `boolean`        | `true`      | Caught internal errors won't crash the entire bot.               |
| `defaultEmojiToSendReactionOnFailureCommand` | `string \| null` | `undefined` | Emoji to react with on the triggering message if a command fails unexpectedly (e.g. `"⚠️"` or `"❌"`). |
| `sendErrorToChatOnFailureCommand_debug`      | `boolean`        | `false`     | Sends a JSON representation of the caught error to the chat. Excellent for real-time debugging!        |

### Context & Interaction Defaults

These defaults define the behavior of `ChatContext` methods like `WaitYesOrNoAnswer()`. Setting them here saves you from configuring them manually on every command.

| Property                | Type       | Default  | Description                                                                                        |
| :---------------------- | :--------- | :------- | :------------------------------------------------------------------------------------------------- |
| `cancelKeywords`        | `string[]` | _Varies_ | Words that correctly cancel a running command or interactive prompt.                                                     |
| `positiveAnswerOptions` | `string[]` | _Varies_ | Keywords interpreted as an affirmative ("yes") response in `WaitYesOrNoAnswer` (case-insensitive). |
| `negativeAnswerOptions` | `string[]` | _Varies_ | Keywords interpreted as a negative ("no") response in `WaitYesOrNoAnswer` (case-insensitive).      |
| `timeoutSeconds`        | `number`   | `30`     | Default time limit for awaiting user input during interactive commands.                            |

### Advanced Injection (Testing)

These options are primarily intended for maintainers or advanced users writing automated integration tests. Incorrect usage can break the bot's standard behavior.

| Property                                | Type                         | Description                                                      |
| :-------------------------------------- | :--------------------------- | :--------------------------------------------------------------- |
| `ownWhatsSocketImplementation_Internal` | `IWhatsSocket`               | Replaces the built-in WhatsApp socket implementation.            |
| `ownChatContextCreationHook_Internal`   | `() => IChatContext \| null` | Replaces the default `ChatContext` that is sent to all commands. |

`

## File: src\content\docs\essential_concepts\chat_context.mdx

`mdx
---
title: "Chat context"
description: "Everything you need to know about the IChatContext object, how it works, and what it lets you do."
---

import { Tabs, TabItem } from "@astrojs/starlight/components";

The `IChatContext` (`ctx` by convention) interface is a declarative wrapper passed to every command execution. It binds the operational scope of the socket to the specific chat thread and sender that triggered the command, abstracting low-level participant extraction, JID resolution, and protocol formatting.

By maintaining stateful properties of the initial trigger event, `IChatContext` ensures standardized and reliable outbound interactions without manually tracking metadata.

Key immutable properties it carries:

- `FixedChatId`: The WhatsApp chat ID where this session permanently belongs to.
- `InitialMsg`: The original message payload that started it all.
- `FixedSenderType`: Whether the sender was a user, a group, the system, etc.
- `FixedParticipantPN`: The phone number (JID) of the participant who triggered the session (useful for groups).

---

# Context Injection

Commands naturally receive the `ctx` object as their very first argument in their `run` (or execution) function, alongside the [`api`](/essential_concepts/additional_api) mechanisms and [`args`](/essential_concepts/command_args) parameters. The core system generates this context whenever a valid command is detected and injects it straight into your logic.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";

export default class ExampleCommand implements ICommand {
name = "example";

    // 👇 The chat context is passed first
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      console.log(`Command triggered in chat: ${ctx.FixedChatId}`);
    }

}

````
</TabItem>
<TabItem label="JavaScript" icon="seti:javascript">
```js
import { CreateCommand } from "whatsbotcord";

// 👇 The chat context is passed first
export default CreateCommand("example", async function (ctx, api, args) {
  console.log(`Command triggered in chat: ${ctx.FixedChatId}`);
});
````

  </TabItem>
</Tabs>

---

# Capabilities Overview

The context exposes a unified API designed strictly for conversational workflows.

## Sending Payloads

Dispatching outbound payloads via `ctx` automatically routes the message to the origin chat.

- **`SendText`**: Send plain text.
- **`SendImg` & `SendVideo`**: Send media locally or from buffers.
- **`SendAudio` & `SendDocument`**: Send voice notes, MP3 files, and document attachments (PDFs, ZIPs).
- **`SendSticker`**: Send WebP graphics as stickers.
- **`SendReactEmojiToInitialMsg`**: Add an emoji reaction to the message that triggered the command.
- **`Ok`, `Loading`, `Fail`**: Send conventional status reactions (✅, ⌛, ❌).
- **`SendPoll`**: Send interactive polls.
- **`SendUbication` & `SendContact`**: Send map locations and vCards.

📚 **Learn more:** Check out the [Sending Messages](/essential_concepts/sending) chapter for in-depth examples!

## Awaiting Interactions

The context provides blocking `Wait...` methods to pause the async execution thread and capture sequential input strictly originating from the initial sender inside the bound chat identifier.

- **`WaitText`**: Waits for the user to send a raw text message.
- **`WaitYesOrNoAnswer`**: Waits for positive/negative confirmations ("yes", "no").
- **`WaitMultimedia`**: Waits for images, videos, audio, stickers, or documents explicitly.
- **`WaitUbication` & `WaitContact`**: Waits for the user to share a location or a contact.
- **`WaitMsg`**: Waits for a specific raw message type.

📚 **Learn more:** Check out the [Receiving Messages](/essential_concepts/receiving) chapter for examples!

## Cloning the Context

The `Clone...` methods facilitate context-forking for parallel execution logic or targeted state mutations without interfering the initial scope context.

- **`Clone`**: Creates an exact, independent copy of the current context. Useful for parallel async operations without sharing state mutations.
- **`CloneButTargetedToIndividualChat`**: Retargets the context to a specific private chat using a JID. Great for proactively messaging someone.
- **`CloneButTargetedToGroupChat`**: Retargets the context to a group chat. You can specify a particular participant within that group too.
- **`CloneButTargetedToWithInitialMsg`**: Forks a completely new context using another WhatsApp message as an anchor. This is the most reliable way to jump to another context because it accurately infers the sender, chat, and IDs.

Example: Replying privately to a user who triggered the command inside a group thread:

```ts
// Suppose args[0] is the JID of the group member you want to text privately
const privateCtx = ctx.CloneButTargetedToIndividualChat({
  userChatId: ctx.FixedParticipantPN!,
});

await privateCtx.SendText("Hello there! Here is the private response you requested.");
```

This flexibility ensures `IChatContext` is the only abstraction you need to perform powerful, context-aware operations!


`

## File: src\content\docs\essential_concepts\chat_mock.mdx

`mdx
---
title: "Testing & ChatMock"
description: "Execute and validate your commands in a locally simulated WhatsApp environment without requiring QR scans or active sockets."
---

import { Tabs, TabItem } from "@astrojs/starlight/components";

The `ChatMock` utility is a purpose-built simulation wrapper native to the WhatsBotCord library. It allows you to execute your commands locally, feed them synthetic inbound payloads, and assert their exact outbound responses within standard testing frameworks (like `bun:test`, `vitest`, or `jest`).

This means you don't need an active WhatsApp connection, a testing device, or QR scans to rigorously validate logic flows!

# Core Mechanics

A standard testing implementation involves four specific phases: **Configuration**, **Simulation Enqueueing**, **Execution**, and **Assertion Validation**.

```ts
import { test, expect } from "your-testing-framework";
import { ChatMock, SenderType } from "whatsbotcord";
// Import the command you want to test
import MyCommand from "./myCommand.js";

test("MyCommand should respond correctly", async () => {
  // 1. Configuration
  const chat = new ChatMock(new MyCommand(), {
    senderType: SenderType.Individual,
  });

  // 2. Simulation Enqueueing (Used if your command awaits input)
  // chat.EnqueueIncoming_Text("yes");

  // 3. Execution
  const botOutputs = await chat.StartChatSimulation();

  // 4. Assertion Validation
  expect(chat.SentFromCommand.Texts).toHaveLength(1);
  expect(chat.SentFromCommand.Texts[0].text).toEqual("Expected reply!");
});
```

---

# 1. Configuration (`MockingChatParams`)

When instantiating `ChatMock`, you can forge the origin state. The `MockingChatParams` parameter accepts comprehensive customization overrides:

### Chat & Sender Targeting

- **`senderType`**: Simulates whether the command executes inside an individual direct message (`SenderType.Individual` targeting `@s.whatsapp.net` identifiers) or a group chat (`SenderType.Group` targeting `@g.us` or `@lid` identifiers). Defaults to `Individual` unless a participant ID is explicitly provided.
- **`chatId`**: The simulated chat ID. If omitted, an ID with the correct WhatsApp suffix (`@g.us` or `@s.whatsapp.net`) is automatically generated.
- **`participantId_LID`**: The modern Linked Device identifier (`@lid`) of the simulated sender.
- **`participantId_PN`**: The standard phone number format ID (`@s.whatsapp.net`) of the simulated sender. 

```ts
// Example: Simulating a group message
const groupChatMock = new ChatMock(new MyCommand(), {
  senderType: SenderType.Group,
  chatId: "123456789@g.us",
  participantId_PN: "987654321@s.whatsapp.net"
});
```

### Message Setup

- **`args`**: Simulates text appended to the command trigger.
- **`msgType`**: The explicit type of the initial command-triggering message.

```ts
// Example: Simulating '!ban @user reason'
const argsMock = new ChatMock(new BanCommand(), {
  args: ["@123456789", "spamming"],
});
```

### Context Overrides

- **`botSettings`**: Temporarily overwrites internal `Bot` properties specifically for this test run.
- **`chatContextConfig`**: Granular overrides for the `ChatContext` pipeline.
- **`cancelKeywords`**: An array of string payloads that will immediately trigger an explicit Wait cancellation error during the execution. By default `["cancel"]`.

```ts
const chat = new ChatMock(command, {
  senderType: SenderType.Group,
  participantId_LID: "12345678@lid",
  args: ["testArg"],
  chatContextConfig: { timeoutSeconds: 30 },
  botSettings: {
    initialCommandsToAdd: [{ command: new HelperTargetCMD(), commandType: CommandType.Normal }]
  }
});
```

---

# 2. Simulation Enqueuing

If your command implements conversational flows utilizing `ctx.WaitText` or `ctx.WaitMultimedia`, the test will pause indefinitely and throw a deadlock error unless you provide the expected simulated responses preemptively (or via dynamic simulation).

`ChatMock` exposes strict enqueuing methods resolving precisely into the awaited flows:

- **`EnqueueIncoming_Text(text)`**: Simulates an incoming raw string.
- **`EnqueueIncoming_Img(urlOrOpts)` / `EnqueueIncoming_Video`**: Simulates rich media components.
- **`EnqueueIncoming_Contact(contacts)`**: Pushes specific virtual card datasets.

```ts
test("Multi-step configuration command", async () => {
  const chat = new ChatMock(new ConfigCommand(), { senderType: SenderType.Group });

  // Note: Enqueue methods return `void`. They just stage the payloads 
  // for when `StartChatSimulation()` reaches a wait operation.
  chat.EnqueueIncoming_Text("Confirm settings"); 
  chat.EnqueueIncoming_Text("yes"); 

  // Runs the command logic uninterrupted through the queues!
  // Returns an array of mocked outgoing payloads (BotReplies[])
  const outputs = await chat.StartChatSimulation();
  
  console.log("Bot replied with:", outputs);
});
```

---

# 3. Assertion Validation

Once `StartChatSimulation()` finishes resolving, the `ChatMock` instance formally exposes read-only property structures spanning everything your command did.

### Validating Outbound Sends

The `chat.SentFromCommand` property offers specific arrays storing chronological outbound payloads issued through the `IChatContext`:

```ts
// Example: Validating a text was sent
expect(chat.SentFromCommand.Texts[0].text).toBe("Hello world!");

// Example: Validating an emoji reaction
expect(chat.SentFromCommand.ReactedEmojis[0].emoji).toBe("✅");
```

- **`Texts`**: Stores all payloads fired via `ctx.SendText()`. Access output strings via `chat.SentFromCommand.Texts[0].text`.
- **`Images` / `Videos` / `Audios` / `Documents` / `Stickers`**: Stores multimedia outputs and their captions.
- **`ReactedEmojis`**: Specific emoji metrics logging responses to `ctx.SendReactEmojiToInitialMsg()`, `ctx.Ok()`, etc.
- **`Polls` / `Locations` / `Contacts`**: Complex associative payload objects evaluated inside specific test scopes.

### Validating Inbound Requests

The `chat.WaitedFromCommand` array explicitly chronicles what `WaitX()` calls the command initiated, capturing exact timestamp delays and expected return configurations dynamically queued inside your script.

```ts
// Check if the command requested text input
expect(chat.WaitedFromCommand[0].msgType).toBe(MsgType.Text);
```

### Validating Raw Socket Behavior

If your command leveraged the raw global bot properties (e.g., executing `api.InternalSocket.Send...`) rather than relying on context wrappers, you can validate system calls via:

- **`SentFromCommandSocketQueue`**: Simulated payloads specifically pushed through standard queue management arrays.
- **`SentFromCommandSocketWithoutQueue`**: Simulated payloads directly dispatched entirely bypassing rate-limits.

---

# Advanced examples

Here are robust examples ensuring commands correctly handle missing parameters, confirmation loops, and dynamic mocking utilizing `ChatMock`:

```ts
import { describe, expect, test } from "your-testing-framework";
import { ChatMock, SenderType } from "whatsbotcord";
import AddMemberCommand from "./commands/AddMemberCommand.js";

describe("Add Member Command Workflows", () => {
  test("Should execute failure payload when no arguments are provided", async () => {
    const command = new AddMemberCommand();
    const chat = new ChatMock(command, {
      senderType: SenderType.Group,
      args: [], // Represents missing arguments!
    });

    await chat.StartChatSimulation();

    // Assert the response texts
    expect(chat.SentFromCommand.Texts).toHaveLength(1);
    expect(chat.SentFromCommand.Texts[0].text).toContain("Required arguments missing");

    // Assert a Failure emoji reaction was posted over the original command msg
    expect(chat.SentFromCommand.ReactedEmojis[0].emoji).toBe("❌");
  });

  test("Should prompt for confirmation and finalize logic upon confirmation", async () => {
    const command = new AddMemberCommand();
    const chat = new ChatMock(command, {
      senderType: SenderType.Group,
      args: ["@123456789"],
    });

    // We enqueue 'yes' so the WaitYesOrNoAnswer method resolves correctly automatically
    chat.EnqueueIncoming_Text("yes");
    // We enqueue a generic PNG buffer mimicking a user sending a profile photo
    chat.EnqueueIncoming_Img({ imgContentBufferMock: Buffer.from("mockImgData") });

    await chat.StartChatSimulation();

    // Confirm execution sequence text output
    expect(chat.SentFromCommand.Texts).toHaveLength(2);
    expect(chat.SentFromCommand.Texts[0].text).toBe("Are you sure you want to add this member? (yes/no)");
    expect(chat.SentFromCommand.Texts[1].text).toBe("Member added successfully.");

    // Validate a success payload was emitted
    expect(chat.SentFromCommand.ReactedEmojis[0].emoji).toBe("✅");
  });
});
```

### Dynamic Simulation

Instead of enqueuing all inputs at once, you can step through the chat interactively using dynamic queues.

```ts
test("Interactive simulation", async () => {
  const chat = new ChatMock(new InteractiveCommand());
  
  // Start the simulation, it stops at the first `ctx.Wait*`
  const botOutputs = await chat.StartChatSimulation();
  expect(botOutputs[0].msg).toContain("Please send your name:");
  
  // Provide the user response interactively
  const nextOutputs = await chat.QueueAction_SimulateSendText("John Doe");
  expect(nextOutputs[0].msg).toContain("Hello John Doe!");
});
```

---

# Advanced Integration Testing (with Dependency Injection)

For production-scale applications, you should test your commands using robust test runners like `bun:test`, and inject mock databases or file systems into your commands using Dependency Injection (e.g., `tsyringe`). This ensures pure determinism across tests.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import { describe, expect, it } from "bun:test";
    import path from "path";
    import { container, Lifecycle } from "tsyringe";
    import { ChatMock, SenderType } from "whatsbotcord";

    // ... your domain specific mocks ...

    function createPerfilCommand({ players = [], fsEntries = {} } = {}) {
      const localContainer = container.createChildContainer();
      
      // Mock the database
      localContainer.register("PlayerRepository", { useValue: players }, { lifecycle: Lifecycle.Transient });
      
      // Mock the file system
      localContainer.register("IFileSystem", {
        useValue: new FileSystemMock({ entries: fsEntries }),
      });

      return localContainer.resolve(PerfilCommand);
    }

    describe("Perfil Command Tests", () => {
      
      it("INDIVIDUAL | User not found | Should send error msg", async () => {
        const command = createPerfilCommand();

        const chat = new ChatMock(command, {
          senderType: SenderType.Individual,
          chatId: "notvalid@s.whatsapp.net",
        });
        await chat.StartChatSimulation();

        expect(chat.SentFromCommand.Images).toHaveLength(0);
        expect(chat.SentFromCommand.Texts.at(0)!.text).toContain("Not found");
        expect(chat.SentFromCommand.ReactedEmojis[0].emoji).toBe("❌");
      });

      it("GROUP | User found | Should send profile card", async () => {
        const command = createPerfilCommand({
          players: [{ ID: "valid_id", name: "John" }],
          fsEntries: { "profile.png": "mockImgData" },
        });

        const chat = new ChatMock(command, {
          senderType: SenderType.Group,
          participantId_PN: "valid_id@s.whatsapp.net",
        });

        await chat.StartChatSimulation();

        expect(chat.SentFromCommand.Texts).toHaveLength(0);
        expect(chat.SentFromCommand.Images).toHaveLength(1);
        expect(chat.SentFromCommand.ReactedEmojis[0].emoji).toBe("✅");
      });

    });
    ```
  </TabItem>
</Tabs>

---

# Injecting Custom Adapters (Mocking the Entire Bot)

If you are writing holistic Integration tests for your application instead of isolating individual commands, or if you simply want to switch the underlying WhatsApp engine, `WhatsBot` supports injecting a Custom Adapter (or a Mock Adapter) right into its constructor. 

This prevents the bot from generating a real QR code or connecting to the Baileys network, while still allowing all your logic to execute.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import Whatsbotcord, { BaileysAdapter } from "whatsbotcord";
    // Optional: Import a custom adapter or MockAdapter
    // import { MyCustomWhatsappWebJsAdapter } from "./my-adapter";

    // 1. Standard initialization: Uses Baileys by default and connects to WhatsApp
    const bot = new Whatsbotcord({
      commandPrefix: "!",
    }, new BaileysAdapter({ credentialsFolder: "./auth" })); 

    // 2. Custom/Mock Initialization: Injects a different adapter engine
    // const botMocked = new Whatsbotcord({ commandPrefix: "!" }, new MyCustomWhatsappWebJsAdapter());
    ```
  </TabItem>
</Tabs>


`

## File: src\content\docs\essential_concepts\chat_mock_examples.mdx

`mdx
---
title: "ChatMock Examples"
description: "Realistic and practical use cases for testing command flows using ChatMock."
---

import { Tabs, TabItem, Code } from "@astrojs/starlight/components";

# Practical Examples

Here are several generic, real-world examples demonstrating how `ChatMock` seamlessly validates standard bot behaviors across different scenarios.

## Example 1: Handling Missing Arguments in a Group

When a user executes a command that strictly requires a `@user` mention, you should test that the command correctly aborts and warns the user if no relevant arguments are provided.


<Tabs>
  <TabItem label="KickCommand.ts">

    ```ts
    import type { ICommand, IChatContext, AdditionalAPI, CommandArgs } from "whatsbotcord";

    export default class KickCommand implements ICommand {
      name = "kick";

      public async run(ctx: IChatContext, _api: AdditionalAPI, args: CommandArgs): Promise<void> {
        if (!args.args.length) {
          await ctx.SendReactEmojiToInitialMsg("❌");
          await ctx.SendText("You must mention a user to kick.");
          return;
        }

        // ... Kick logic processing here
      }
    }
    ```

  </TabItem>

  <TabItem label="KickCommand.test.ts">

    ```ts
    import { describe, expect, test } from "your-testing-framework";
    import { ChatMock, SenderType } from "whatsbotcord";
    import KickCommand from "./KickCommand.js";

    describe("Kick Command Validation", () => {
      test("Should prompt a failure payload when no user is mentioned", async () => {
        // 1. Initialization: We pass an empty args array
        const chat = new ChatMock(new KickCommand(), {
          senderType: SenderType.Group,
          args: [], // Simulating "!kick" with nothing else
        });

        // 2. Execution
        await chat.StartChatSimulation();

        // 3. Assertion: The bot should send exactly one text message complaining
        expect(chat.SentFromCommand.Texts).toHaveLength(1);
        expect(chat.SentFromCommand.Texts[0].text).toContain("You must mention a user to kick.");

        // It should also drop a red cross on the user's message
        expect(chat.SentFromCommand.ReactedEmojis[0].emoji).toBe("❌");
      });
    });
    ```

  </TabItem>
</Tabs>

---

## Example 2: Parsing Predefined Confirmation Flows

If a command relies on `ctx.WaitYesOrNoAnswer` to prevent destructive actions, you should validate that supplying positive string literals correctly pushes the execution flow toward the success branch.

<Tabs>
  <TabItem label="ClearDatabaseCommand.ts">
    ```ts
    import type { ICommand, IChatContext } from "whatsbotcord";

    export default class ClearDatabaseCommand implements ICommand {
      name = "cleardb";

      public async run(ctx: IChatContext): Promise<void> {
        await ctx.SendText("Are you absolutely sure you want to delete everything? (yes/no)");

        const isConfirmed = await ctx.WaitYesOrNoAnswer({
          timeOutMiliseconds: 15000,
          expectedTextYes: "yes",
          expectedTextNo: "no"
        });

        if (isConfirmed) {
          await ctx.SendReactEmojiToInitialMsg("✅");
          await ctx.SendText("Database has been wiped successfully.");
        } else {
          await ctx.SendReactEmojiToInitialMsg("❌");
          await ctx.SendText("Action cancelled.");
        }
      }
    }
    ```

  </TabItem>

  <TabItem label="ClearDatabaseCommand.test.ts">
    ```ts
    import { test, expect } from "your-testing-framework";
    import { ChatMock, SenderType } from "whatsbotcord";
    import ClearDatabaseCommand from "./ClearDatabaseCommand.js";

    test("Should execute destructive action upon explicit positive confirmation", async () => {
      const chat = new ChatMock(new ClearDatabaseCommand(), {
        senderType: SenderType.Individual
      });

      // We explicitly enqueue the positive response so the prompt resolves smoothly
      chat.EnqueueIncoming_Text("yes");

      await chat.StartChatSimulation();

      expect(chat.SentFromCommand.Texts).toHaveLength(2);
      expect(chat.SentFromCommand.Texts[0].text).toBe("Are you absolutely sure you want to delete everything? (yes/no)");
      expect(chat.SentFromCommand.Texts[1].text).toContain("Database has been wiped successfully.");

      expect(chat.SentFromCommand.ReactedEmojis[0].emoji).toBe("✅");
    });
    ```

  </TabItem>
</Tabs>

---

## Example 3: Simulating Faux Multimedia Uploads

Sometimes commands await multimedia (like `WaitMultimedia`) to process documents, photos, or audio files. `ChatMock` accepts mock buffers simulating standard `Buffer` streams, allowing you to validate processing pipelines without actual downloads.

<Tabs>
  <TabItem label="ProcessInvoiceCommand.ts">
    ```ts
    import type { ICommand, IChatContext } from "whatsbotcord";

    export default class ProcessInvoiceCommand implements ICommand {
      name = "invoice";

      public async run(ctx: IChatContext): Promise<void> {
        const payload = await ctx.WaitMultimedia({ timeOutMiliseconds: 20000 });

        if (payload.mimetype === "application/pdf") {
          // Process payload.buffer here
          await ctx.SendText("Valid PDF received. Starting evaluation process...");
        } else {
          await ctx.SendText("Invalid format. Please upload a PDF.");
        }
      }
    }
    ```

  </TabItem>

  <TabItem label="ProcessInvoiceCommand.test.ts">
    ```ts
    import { test, expect } from "your-testing-framework";
    import { ChatMock, SenderType } from "whatsbotcord";
    import ProcessInvoiceCommand from "./ProcessInvoiceCommand.js";

    test("Should return a processing success response upon receiving a simulated PDF Document", async () => {
      const chat = new ChatMock(new ProcessInvoiceCommand(), {
        senderType: SenderType.Group,
        participantId_LID: "12345678@lid" // Restricting the sender to a group LID ID
      });

      // We enqueue a mocked PDF Document resolving directly into a mocked Buffer array!
      const fauxPdfBuffer = Buffer.from("fake-pdf-byte-array");
      chat.EnqueueIncoming_Document("http://example.com/invoice.pdf", "invoice.pdf", {
        mimeType: "application/pdf",
        imgContentBufferMock: fauxPdfBuffer // Injects the faux buffer instantly
      });

      await chat.StartChatSimulation();

      expect(chat.SentFromCommand.Texts).toHaveLength(1);
      expect(chat.SentFromCommand.Texts[0].text).toContain("Valid PDF received. Starting evaluation process...");
    });
    ```

  </TabItem>
</Tabs>

`

## File: src\content\docs\essential_concepts\command_args.mdx

`mdx
---
title: "Command Arguments"
description: "Understanding the CommandArgs object injected into your commands."
---

import { Tabs, TabItem } from "@astrojs/starlight/components";

When a user triggers a command in WhatsBotCord, the `run` method is executed with three main parameters: your `ctx` ([Chat Context](/essential_concepts/chat_context)), the `api` ([Additional API mechanisms](/essential_concepts/additional_api)), and the `args` array.

The **`args` (`CommandArgs`)** object contains all the extracted metadata about the incoming message, the text arguments parsed from the user's input, and details about the chat and sender.

```ts
export default class MyCommand implements ICommand {
  name = "example";

  public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
    console.log(args.args); // The string array of arguments
  }
}
```

## Structure of CommandArgs

Here is a breakdown of all properties available on the `args` object.

### The Parsed Arguments Array

- **`args`**: An array of strings containing the text typed after the command name.
  - If a user types `!ban @user reason here`, the `args` array will be `["@user", "reason", "here"]`.

```ts
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  if (args.args.length === 0) {
    await ctx.SendText("Please provide the arguments required.");
    return;
  }
  const firstArgument = args.args[0];
  await ctx.SendText(`You provided: ${firstArgument}`);
}
```

### Sender Identifiers

These properties help explicitly identify who executed the command.

- **`participantIdPN`**: The standard phone number format ID of the user (e.g., `1234567890@s.whatsapp.net`).
- **`participantIdLID`**: The modern Linked Device identifier (`@lid`), if the user sent the message from WhatsApp Desktop/Web in a group.

```ts
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  const userId = args.participantIdPN || args.participantIdLID;
  if (!userId) return;

  await ctx.SendText(`Command executed by: ${userId}`);
}
```

### Chat and Message Context

Contextual details about where the message landed.

- **`chatId`**: The WhatsApp ID of the chat. This could be a private chat (`@s.whatsapp.net`) or a group chat (`@g.us`).
- **`chatId_LID`**: The LID-normalized equivalent chat identifier. Only applies to individual private chats; it remains `undefined` for groups.
- **`senderType`**: Derived from the incoming message, it specifies if it is an `Individual` or `Group` chat.
- **`msgType`**: The format of the message that triggered the command (e.g., `Text`, `Image`, `Audio`).

```ts
import { SenderType } from "whatsbotcord";

public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  if (args.senderType === SenderType.Group) {
    await ctx.SendText("This command was executed in a Group Chat");
  } else {
    await ctx.SendText("This command was executed in a Private Chat");
  }
}
```

### Quoted Messages

- **`quotedMsgInfo`**: An object containing information about the message the user replied to when triggering the command. Excellent for actions like `!translate` or `!quote`.

```ts
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  if (args.quotedMsgInfo) {
    const quotedDetails = args.quotedMsgInfo.msg;
    const typeOfQuotedMessage = args.quotedMsgInfo.type;

    await ctx.SendText(`You replied to a message of type: ${typeOfQuotedMessage}`);
  }
}
```

### Advanced Raw Access

- **`originalRawMsg`**: The raw WhatsApp message payload object coming directly from Baileys. Gives full access to low-level byte and protobuf details if necessary.
- **`botInfo`**: Provides minimal read-only [Bot configuration](/essential_concepts/bot) variables, useful if your command logic needs to scale dynamically depending on the active bot options.


`

## File: src\content\docs\essential_concepts\groups.mdx

`mdx
---
title: "Groups Module"
description: "Manage WhatsApp group metadata, administrators, and participants."
---

import { Tabs, TabItem } from "@astrojs/starlight/components";

# The Groups Module

WhatsBotCord provides a unified, strongly-typed interface for handling WhatsApp Groups. All methods are designed to be safe, meaning they will gracefully return `false` or `null` instead of crashing the bot if an operation fails or if the bot lacks sufficient permissions.

## Access Points

The Groups API is accessible from two primary locations depending on where you are writing your code:

- **Inside a Command (`ChatContext`):** Use `ctx.Group` for actions related to the current chat context.
- **Globally (`WhatsBot` instance):** Use `bot.Groups` for external global actions (e.g., cron jobs or webhooks).

---

## Data Extraction

These methods allow you to retrieve metadata about the groups the bot is in.

### GetMetadata
Retrieves complete information about a specific group. If the bot is not in the group or the ID is invalid, it returns `null`.

```typescript
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  const metadata = await ctx.Group.GetMetadata(ctx.FixedChatId);
  if (metadata) {
    await ctx.SendText(`This group has ${metadata.members.length} members.`);
  }
}
```

### GetAll
Returns an array of metadata for all the groups the bot is currently a participant in.

```typescript
// Usually accessed globally
const allGroups = await bot.Groups.GetAll();
console.log(`The bot is currently active in ${allGroups.length} groups.`);
```

### FindByName
Searches through all groups the bot is in and returns the metadata of the first group that perfectly matches the provided name.

```typescript
const targetGroup = await bot.Groups.FindByName("VIP Admins");
if (targetGroup) {
  await ctx.SendText(`Found group ID: ${targetGroup.id}`);
}
```

### IsBotAdmin
Evaluates whether the bot has Administrator privileges in the specified group. You should almost always check this before trying to add or kick members.

```typescript
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  const isAdmin = await ctx.Group.IsBotAdmin(ctx.FixedChatId);
  if (!isAdmin) {
    await ctx.SendText("I cannot do this because I am not an admin here!");
    return;
  }
  // proceed with admin actions...
}
```

---

## Participant Management

These operational methods return a `Promise<boolean>`. If the operation succeeds, it returns `true`. If it fails (due to lack of permissions or network errors), it returns `false`.

### AddParticipants
Adds a list of user IDs to the group.

```typescript
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  const success = await ctx.Group.AddParticipants(ctx.FixedChatId, ["1234567890@s.whatsapp.net"]);
  if (success) {
    await ctx.SendText("User successfully added to the group!");
  }
}
```

### RemoveParticipants
Kicks a list of user IDs from the group.

```typescript
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  const kicked = await ctx.Group.RemoveParticipants(ctx.FixedChatId, ["1234567890@s.whatsapp.net"]);
  if (kicked) {
    await ctx.SendText("User has been removed.");
  }
}
```

### PromoteParticipants
Grants administrator privileges to the specified users.

```typescript
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  const promoted = await ctx.Group.PromoteParticipants(ctx.FixedChatId, ["1234567890@s.whatsapp.net"]);
  if (promoted) {
    await ctx.SendText("The user is now an Administrator.");
  }
}
```

### DemoteParticipants
Revokes administrator privileges from the specified users.

```typescript
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  const demoted = await ctx.Group.DemoteParticipants(ctx.FixedChatId, ["1234567890@s.whatsapp.net"]);
  if (demoted) {
    await ctx.SendText("The user is no longer an Administrator.");
  }
}
```

### RemoveAllParticipants
Kicks **all** participants from the group (except the bot itself). Use this with extreme caution.

```typescript
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  await ctx.SendText("Initiating total group purge...");
  await ctx.Group.RemoveAllParticipants(ctx.FixedChatId);
}
```

---

## Group Lifecycle & Cleanup

Manage the bot's presence within the group itself.

### Leave
Makes the bot voluntarily leave the group.

```typescript
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  await ctx.SendText("I have been commanded to leave. Goodbye!");
  await ctx.Group.Leave(ctx.FixedChatId);
}
```

### DeleteChat
Deletes the group's message history from the WhatsApp client's inbox. This is often used in conjunction with `Leave` to keep the bot's inbox clean.

```typescript
// Best used from the global instance after leaving
await bot.Groups.Leave("1234567890@g.us");
await bot.Groups.DeleteChat("1234567890@g.us");
```

### Cleanup
Performs an internal cleanup of the group's memory cache within the bot's Node.js process. You rarely need to call this manually unless you are aggressively managing memory limits.

```typescript
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  await ctx.Group.Cleanup(ctx.FixedChatId);
}
```

`

## File: src\content\docs\essential_concepts\helpers.mdx

`mdx
---
title: "Built-in Helpers"
description: "A comprehensive guide on WhatsBotCord utility functions for seamless message and ID parsing."
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

WhatsBotCord exports a global `Helpers` object containing robust utilities that simplify traversing deep Baileys structures, identifying media types, and debugging.

You can import them directly from the main package:

```ts
import { Helpers, MsgType, SenderType } from "whatsbotcord/helpers";
```

## Messages (`Helpers.Msg`)

Functions tailored for manipulating and extracting data from incoming `WhatsappMessage` objects.

### `FullMsg_GetText(rawMsg)`
Safely extracts the main text content, no matter if it's a standard text message, an extended conversation, or an image/video with a caption! Returns `null` if the message has no text.

```ts
const text = Helpers.Msg.FullMsg_GetText(args.originalRawMsg);
if (text) {
  console.log(`Received text: ${text}`);
} else {
  console.log("Message does not contain any text.");
}
```

### `FullMsg_GetMsgType(rawMsg)`
Determines what kind of message arrived, mapping the raw structure into the clean `MsgType` enum (e.g. `MsgType.Text`, `MsgType.Image`).

```ts
const incomingMsgType = Helpers.Msg.FullMsg_GetMsgType(args.originalRawMsg);
if (incomingMsgType === MsgType.Image) {
  await ctx.SendText("Nice image you sent!");
}
```

### `FullMsg_GetSenderType(rawMsg)`
Detects whether the message was sent inside an individual private chat (`SenderType.Individual`) or a group (`SenderType.Group`).

```ts
const senderType = Helpers.Msg.FullMsg_GetSenderType(args.originalRawMsg);
if (senderType === SenderType.Group) {
  await ctx.SendText("This was sent from a group!");
}
```

### `FullMsg_GetQuotedMsg(rawMsg)`
Returns the original message that the user replied (quoted) to.

```ts
const quotedMsg = Helpers.Msg.FullMsg_GetQuotedMsg(args.originalRawMsg);
if (quotedMsg) {
  console.log("This message is replying to another message.");
}
```

### `FullMsg_GetQuotedMsgText(rawMsg)`
Extracts the text purely from the quoted message, ideal for `!translate` commands.

```ts
const repliedText = Helpers.Msg.FullMsg_GetQuotedMsgText(args.originalRawMsg);
if (repliedText) {
  await ctx.SendText(`You quoted: ${repliedText}`);
}
```

## WhatsApp Identifiers (`Helpers.Whatsapp`)

Functions for managing Identifiers (JIDs, LIDs, Mention strings). For a deeper explanation on these prefixes, see [WhatsApp IDs](/essential_concepts/whatsapp_ids).

### `GetWhatsInfoFromSenderMsg(rawMsg)`
Fetches precise sender information (`@g.us`, `@lid`, `@s.whatsapp.net`) directly from the raw incoming Baileys payload.

```ts
const info = Helpers.Whatsapp.GetWhatsInfoFromSenderMsg(args.originalRawMsg);
if (info) {
  console.log(`Sender ID: ${info.rawId}`);
}
```

### `GetWhatsInfoFromWhatsappID(idStr)`
Parses standard raw suffix IDs.

```ts
const idStr = "1234567890@s.whatsapp.net";
const parsedInfo = Helpers.Whatsapp.GetWhatsInfoFromWhatsappID(idStr);
console.log(`Mention format: ${parsedInfo?.asMentionFormatted}`);
```

### Validations: `IsPNId`, `IsLIDId`, `IsMentionString`
Boolean validators that quickly assert if a string meets the required ID properties.

```ts
const userMentionedStr = args.args[0]; // "@1234567890"

if (Helpers.Whatsapp.IsMentionString(userMentionedStr)) {
  const formattedInfo = Helpers.Whatsapp.GetWhatsInfoFromMentionStr(userMentionedStr);
  console.log("Raw ID output:", formattedInfo?.rawId); // Returns specific system ID
}
```

### `IdentifiersPostfixes`
Object holding constants dictating suffixes (`Group_Suffix_ID`, `LID_Suffix_ID`, `PhoneNumber_Suffix_ID`).

```ts
console.log(Helpers.Whatsapp.IdentifiersPostfixes.Group_Suffix_ID); // "@g.us"
```

## Debugging & Utilities

### Event Interception Dump
When developing new features (like interactive buttons or new media types), you may want to see the exact raw JSON structure that Baileys drops in. Calling `Helpers.Debugging.StoreMsgInHistoryJson` will dump the `rawMsg` payload into a `.json` file locally on your disk.

```ts
import { Debug_StoreWhatsMsgHistoryInJson } from "whatsbotcord/debugging";

bot.Use(async (bot, senderLID, senderPN, chatId, rawMsg, msgType, senderType, next) => {
  if (senderPN === "1234567890@s.whatsapp.net") {
    // Saves rawMsg safely without crashing your console!
    Debug_StoreWhatsMsgHistoryInJson(rawMsg);
  }
  await next();
});
```

### Timeout/Aborts validation
If you use Wait methods inside your core [Chat Context waiting flows](/essential_concepts/receiving), an internal error will be thrown to interrupt execution if the user cancels or the prompt timeouts. You can safely verify if the error was a user interaction error or a system crash by using `Helpers.ChatContext_IsWaitError`.

```ts
try {
  await ctx.WaitText({ timeoutSeconds: 30 });
} catch (error) {
  if (Helpers.ChatContext_IsWaitError(error)) {
    console.log("User didn't answer in 30 seconds or they cancelled the prompt.");
  } else {
    console.error("Critical server error occurred!");
  }
}
```

`

## File: src\content\docs\essential_concepts\presence.mdx

`mdx
---
title: "Presence Module"
description: "Programmatically control the bot's online status and chat activity indicators."
---

import { Tabs, TabItem, Aside } from "@astrojs/starlight/components";

# The Presence Module

The Presence API allows you to control how the bot appears to other users on WhatsApp. You can toggle its global online status, or trigger "typing..." and "recording audio..." indicators in specific chats.

These indicators are fantastic for improving user experience (UX). When a command takes several seconds to execute (like querying a database or fetching an API), triggering a typing indicator lets the user know the bot is actively processing their request.

## Global Status API

You can configure the bot's global visibility. By default, the bot usually appears online when connected. You can explicitly set it to offline if you want the bot to operate in "stealth" mode.

```typescript
// Usually done on bot startup
await bot.InternalSocket.Presence.SetGlobalPresenceState("offline");
// OR
await bot.InternalSocket.Presence.SetGlobalPresenceState("online");
```

---

## Chat Activity Indicators

These methods trigger the indicators that appear at the top of a chat (e.g., "typing..." or "recording audio...").

### StartTyping / StopTyping
Use these methods to manually toggle the text typing indicator.

```typescript
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  // 1. Turn on the typing indicator
  await ctx.Presence.StartTyping(ctx.FixedChatId);
  
  // 2. Perform a slow task
  const data = await mySlowDatabaseQuery();
  
  // 3. Turn off the typing indicator
  await ctx.Presence.StopTyping(ctx.FixedChatId);
  
  // 4. Send the result
  await ctx.SendText(`Here are the results: ${data}`);
}
```

### StartRecording / StopRecording
Use these methods if your command generates and sends Voice Notes (audio files). It shows "recording audio..." instead of "typing...".

```typescript
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  await ctx.Presence.StartRecording(ctx.FixedChatId);
  
  const audioBuffer = await generateTextToSpeech("Hello!");
  
  await ctx.Presence.StopRecording(ctx.FixedChatId);
  await ctx.SendAudio(audioBuffer);
}
```

---

## Automatic Helpers (Recommended)

Manually calling `Start` and `Stop` can be risky. If an error is thrown during your slow task (e.g., your database query fails), the `StopTyping` line might never execute, leaving the bot stuck "typing..." forever in that chat.

To solve this cleanly, WhatsBotCord provides **Wrapper Methods**: `WithTyping` and `WithRecording`. 

These methods accept an asynchronous callback function. They will automatically turn the indicator ON, execute your function, and guarantee the indicator is turned OFF when the function completes (even if it throws an error!).

### WithTyping

<Aside type="tip">
This is the recommended way to use Presence indicators in your commands.
</Aside>

```typescript
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  
  // The indicator will stay active for as long as this inner callback runs
  await ctx.Presence.WithTyping(ctx.FixedChatId, async () => {
    
    const apiResponse = await fetch("https://api.example.com/data");
    const data = await apiResponse.json();
    
    await ctx.SendText(`Data fetched: ${data.result}`);
    
  }); 
  // <-- Stops typing automatically right here!
}
```

### WithRecording

Works identically, but displays the "recording audio..." indicator instead.

```typescript
public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
  
  await ctx.Presence.WithRecording(ctx.FixedChatId, async () => {
    const audioBuffer = await generateTextToSpeech("Hello!");
    await ctx.SendAudio(audioBuffer);
  });
  
}
```

`

## File: src\content\docs\essential_concepts\receiving.mdx

`mdx
---
title: "Receiving messages"
description: "How to wait for user input dynamically"
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

This section details how to pause command execution to await user input sequentially. The `IChatContext` interface exposes asynchronous methods to trap specific message types, user replies, or conversational interactions directly from the triggering sender.

## WaitMsg

Wait for a specific type of message (e.g., text, image, document) from the original sender. If you need to know more about the available message types, you can review the examples in [Sending](/essential_concepts/sending).

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";
  import { MsgType } from "whatsbotcord";

  export default class WaitMsgCommand implements ICommand {
    name = "waitmsg";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      await ctx.SendText("Please send any text message within 30 seconds.");
      
      const message = await ctx.WaitMsg(MsgType.Text, { timeoutSeconds: 30 });
      
      if (message) {
        await ctx.SendText(`Received message object! ID: ${message.key.id}`);
      } else {
        await ctx.SendText("No message received within the timeout.");
      }
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand, MsgType } from "whatsbotcord";

  export default CreateCommand("waitmsg", async function (ctx, api, args) {
    await ctx.SendText("Please send any text message within 30 seconds.");
    
    const message = await ctx.WaitMsg(MsgType.Text, { timeoutSeconds: 30 });
    
    if (message) {
      await ctx.SendText(`Received message object! ID: ${message.key.id}`);
    } else {
      await ctx.SendText("No message received within the timeout.");
    }
  });
  ```
  </TabItem>
</Tabs>

**Expected Functionality:** Stalls execution for up to 30 seconds awaiting a text submission, resolving the Promise with the full `WhatsappMessage` payload, or `null` upon timeout.

---

## WaitText

Waits specifically for a plain text message, simplifying the process by returning just the text string.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";

  export default class WaitTextCommand implements ICommand {
    name = "waittext";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      await ctx.SendText("What is your name?");
      
      const name = await ctx.WaitText({ timeoutSeconds: 20 });
      
      if (name) {
        await ctx.SendText(`Hello, ${name}!`);
      } else {
        await ctx.SendText("You didn't tell me your name in time.");
      }
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand } from "whatsbotcord";

  export default CreateCommand("waittext", async function (ctx, api, args) {
    await ctx.SendText("What is your name?");
    
    const name = await ctx.WaitText({ timeoutSeconds: 20 });
    
    if (name) {
      await ctx.SendText(`Hello, ${name}!`);
    } else {
      await ctx.SendText("You didn't tell me your name in time.");
    }
  });
  ```
  </TabItem>
</Tabs>

**Expected Functionality:** Emits a request and resolves the subsequent incoming payload directly to its plain `string` primitive value. Returns `null` if the timeout threshold is exceeded.

---

## WaitYesOrNoAnswer

A specialized abstraction of `WaitText` that parses predefined affirmative and negative literals (e.g., "yes", "no"). Resolves a boolean representing the interactive matrix.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";

  export default class WaitYesOrNoCommand implements ICommand {
    name = "confirm";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      await ctx.SendText("Do you want to continue? (yes/no)");
      
      const answer = await ctx.WaitYesOrNoAnswer({ normalConfig: { timeoutSeconds: 30 } });
      
      if (answer === true) {
        await ctx.SendText("Proceeding with the operation...");
      } else if (answer === false) {
        await ctx.SendText("Operation cancelled.");
      } else {
        await ctx.SendText("No valid response received in time.");
      }
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand } from "whatsbotcord";

  export default CreateCommand("confirm", async function (ctx, api, args) {
    await ctx.SendText("Do you want to continue? (yes/no)");
    
    const answer = await ctx.WaitYesOrNoAnswer({ normalConfig: { timeoutSeconds: 30 } });
    
    if (answer === true) {
      await ctx.SendText("Proceeding with the operation...");
    } else if (answer === false) {
      await ctx.SendText("Operation cancelled.");
    } else {
      await ctx.SendText("No valid response received in time.");
    }
  });
  ```
  </TabItem>
</Tabs>

**Expected Output:** Returns `true` for a positive answer, `false` for a negative answer, or `null` if the user's response is ambiguous, they cancel, or the wait times out.

---

## WaitMultimedia

Waits for the next multimedia message of a specified type (e.g., image, video, document, audio, sticker). The received media will be given as a `Buffer`, similarly to how you would dynamically send images or videos (see [Sending Images](/essential_concepts/sending#images) and [Sending Videos](/essential_concepts/sending#videos)).

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";
  import { MsgType } from "whatsbotcord";
  import fs from "fs";

  export default class WaitMultimediaCommand implements ICommand {
    name = "waitimage";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      await ctx.SendText("Please send me a profile picture (Image).");
      
      const imageBuffer = await ctx.WaitMultimedia(MsgType.Image, { timeoutSeconds: 60 });
      
      if (imageBuffer) {
        fs.writeFileSync("./saved_profile.webp", imageBuffer);
        await ctx.SendText("Image received and saved successfully!");
      } else {
        await ctx.SendText("No image was received.");
      }
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand, MsgType } from "whatsbotcord";
  import fs from "fs";

  export default CreateCommand("waitimage", async function (ctx, api, args) {
    await ctx.SendText("Please send me a profile picture (Image).");
    
    const imageBuffer = await ctx.WaitMultimedia(MsgType.Image, { timeoutSeconds: 60 });
    
    if (imageBuffer) {
      fs.writeFileSync("./saved_profile.webp", imageBuffer);
      await ctx.SendText("Image received and saved successfully!");
    } else {
      await ctx.SendText("No image was received.");
    }
  });
  ```
  </TabItem>
</Tabs>

**Expected Output:** Resolves with a `Buffer` containing the media (in this case, an image), allowing you to save it or process it further. Returns `null` on timeout.

---

## WaitUbication

Waits for the next location (ubication) message from the original sender. The resulting object contains the coordinates, similar to what you would use in `SendUbication` (see [Location (Ubication)](/essential_concepts/sending#location-ubication)).

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";

  export default class WaitLocationCommand implements ICommand {
    name = "waitlocation";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      await ctx.SendText("Please share your current location.");
      
      const location = await ctx.WaitUbication({ timeoutSeconds: 45 });
      
      if (location) {
        await ctx.SendText(`Received location! Latitude: ${location.degreesLatitude}, Longitude: ${location.degreesLongitude}`);
      } else {
        await ctx.SendText("No location was received.");
      }
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand } from "whatsbotcord";

  export default CreateCommand("waitlocation", async function (ctx, api, args) {
    await ctx.SendText("Please share your current location.");
    
    const location = await ctx.WaitUbication({ timeoutSeconds: 45 });
    
    if (location) {
      await ctx.SendText(`Received location! Latitude: ${location.degreesLatitude}, Longitude: ${location.degreesLongitude}`);
    } else {
      await ctx.SendText("No location was received.");
    }
  });
  ```
  </TabItem>
</Tabs>

**Expected Output:** Resolves with an object containing location coordinates (latitude and longitude) and optionally a thumbnail, or `null` if no message is received.

---

## WaitContact

Waits for the next contact (vCard) message from the original sender. This is the exact inverse of sending a contact card; the format is similar to the object used in `SendContact` (see [Contacts (vCard)](/essential_concepts/sending#contacts-vcard)).

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";

  export default class WaitContactCommand implements ICommand {
    name = "waitcontact";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      await ctx.SendText("Please send me a contact card.");
      
      const contactData = await ctx.WaitContact({ timeoutSeconds: 30 });
      
      if (contactData) {
        // Handle single or multiple contacts
        const contacts = Array.isArray(contactData) ? contactData : [contactData];
        const contactNames = contacts.map(c => c.name).join(", ");
        
        await ctx.SendText(`Received contacts: ${contactNames}`);
      } else {
        await ctx.SendText("No contact was received.");
      }
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand } from "whatsbotcord";

  export default CreateCommand("waitcontact", async function (ctx, api, args) {
    await ctx.SendText("Please send me a contact card.");
    
    const contactData = await ctx.WaitContact({ timeoutSeconds: 30 });
    
    if (contactData) {
      // Handle single or multiple contacts
      const contacts = Array.isArray(contactData) ? contactData : [contactData];
      const contactNames = contacts.map(c => c.name).join(", ");
      
      await ctx.SendText(`Received contacts: ${contactNames}`);
    } else {
      await ctx.SendText("No contact was received.");
    }
  });
  ```
  </TabItem>
</Tabs>

**Expected Output:** Resolves with an object (or an array of objects) containing the contact's name, number, and full WhatsApp ID, or `null` if no message is received.

---

`

## File: src\content\docs\essential_concepts\sending.mdx

`mdx
---
title: "Commands"
description: "How can you create more customized commands?" 
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

This section covers the various methods available for dispatching messages via the `IChatContext` interface. The `IChatContext` object abstracts the underlying socket and provides streamlined methods for sending text, media, reactions, and interactive payloads.

## Text Messages

You can send plain text messages to the chat using `SendText`.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";

  export default class HelloCommand implements ICommand {
    name = "hello";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      await ctx.SendText("Hello world!");
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand } from "whatsbotcord";

  export default CreateCommand("hello", async function (ctx, api, args) {
    await ctx.SendText("Hello world!");
  });
  ```
  </TabItem>
</Tabs>

**Expected Output:** A plain text message saying "Hello world!".

---

## Reactions & Status

You can react to messages (like the one that triggered the command) using emojis. Reactions are great for showing the user that a command is processing (`Loading`), succeeded (`Ok`), failed (`Fail`), or sending a custom emoji.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";

  export default class ReactCommand implements ICommand {
    name = "react";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      // Indicate the command is starting (reacts with ⌛)
      await ctx.Loading();

      try {
        // ... some long process ...
        // React with a custom emoji to the original command message
        await ctx.SendReactEmojiToInitialMsg("🔥");
        
        // Indicate success (reacts with ✅)
        await ctx.Ok();
      } catch (error) {
        // Indicate failure (reacts with ❌)
        await ctx.Fail();
      }
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand } from "whatsbotcord";

  export default CreateCommand("react", async function (ctx, api, args) {
    // Indicate the command is starting (reacts with ⌛)
    await ctx.Loading();

    try {
      // ... some long process ...
      // React with a custom emoji to the original command message
      await ctx.SendReactEmojiToInitialMsg("🔥");
      
      // Indicate success (reacts with ✅)
      await ctx.Ok();
    } catch (error) {
      // Indicate failure (reacts with ❌)
      await ctx.Fail();
    }
  });
  ```
  </TabItem>
</Tabs>

**Expected Output:** The message that triggered the command will receive a ⌛ reaction, followed by a 🔥 reaction, and finally a ✅ (or ❌ if it fails).

---

## Images

Send images from local paths or memory buffers, with or without captions.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";
  import fs from "fs";

  export default class ImageCommand implements ICommand {
    name = "image";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      // Send an image from a local file path
      await ctx.SendImg("./assets/dog.png");
      
      // Send an image from a local file path with a caption
      await ctx.SendImgWithCaption("./assets/cat.jpg", "Look at this cat!");

      // Send dynamically from a buffer
      const myBuffer = fs.readFileSync("./assets/dynamic.png");
      await ctx.SendImgFromBuffer(myBuffer, "png");
      
      // Send from a buffer with a caption
      await ctx.SendImgFromBufferWithCaption(myBuffer, "png", "Dynamically generated image!");
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand } from "whatsbotcord";
  import fs from "fs";

  export default CreateCommand("image", async function (ctx, api, args) {
    // Send an image from a local file path
    await ctx.SendImg("./assets/dog.png");
    
    // Send an image from a local file path with a caption
    await ctx.SendImgWithCaption("./assets/cat.jpg", "Look at this cat!");

    // Send dynamically from a buffer
    const myBuffer = fs.readFileSync("./assets/dynamic.png");
    await ctx.SendImgFromBuffer(myBuffer, "png");
    
    // Send from a buffer with a caption
    await ctx.SendImgFromBufferWithCaption(myBuffer, "png", "Dynamically generated image!");
  });
  ```
  </TabItem>
</Tabs>

**Expected Output:** Four separate image messages: an uncaptioned dog image, a cat image with the caption "Look at this cat!", an uncaptioned dynamically loaded image, and a dynamically loaded image with the caption "Dynamically generated image!".

---

## Videos

Similarly to images, you can send videos directly from the filesystem or from buffers.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";
  import fs from "fs";

  export default class VideoCommand implements ICommand {
    name = "video";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      // Direct file path (no caption)
      await ctx.SendVideo("./media/intro.mp4");
      
      // Direct file path (with caption)
      await ctx.SendVideoWithCaption("./media/tutorial.mp4", "Watch this tutorial!");

      // Dynamic video from a buffer
      const videoBuffer = fs.readFileSync("./media/clip.mov");
      await ctx.SendVideoFromBuffer(videoBuffer, "mov");
      
      // Dynamic video from a buffer with caption
      await ctx.SendVideoFromBufferWithCaption(videoBuffer, "Watch this clip!", "mov");
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand } from "whatsbotcord";
  import fs from "fs";

  export default CreateCommand("video", async function (ctx, api, args) {
    // Direct file path (no caption)
    await ctx.SendVideo("./media/intro.mp4");
    
    // Direct file path (with caption)
    await ctx.SendVideoWithCaption("./media/tutorial.mp4", "Watch this tutorial!");

    // Dynamic video from a buffer
    const videoBuffer = fs.readFileSync("./media/clip.mov");
    await ctx.SendVideoFromBuffer(videoBuffer, "mov");
    
    // Dynamic video from a buffer with caption
    await ctx.SendVideoFromBufferWithCaption(videoBuffer, "Watch this clip!", "mov");
  });
  ```
  </TabItem>
</Tabs>

**Expected Output:** Four separate video messages sent to the chat, containing the respective video files and captions.

---

## Audio

Send audio files like voice notes or music tracks.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";
  import fs from "fs";

  export default class AudioCommand implements ICommand {
    name = "audio";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      // Local or remote URL
      await ctx.SendAudio("./audios/voice.mp3");
      await ctx.SendAudio("https://example.com/audio.mp3");

      // Generate audio on the fly and send it
      const audioBuf = fs.readFileSync("./audios/sfx.ogg");
      await ctx.SendAudioFromBuffer(audioBuf, "ogg");
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand } from "whatsbotcord";
  import fs from "fs";

  export default CreateCommand("audio", async function (ctx, api, args) {
    // Local or remote URL
    await ctx.SendAudio("./audios/voice.mp3");
    await ctx.SendAudio("https://example.com/audio.mp3");

    // Generate audio on the fly and send it
    const audioBuf = fs.readFileSync("./audios/sfx.ogg");
    await ctx.SendAudioFromBuffer(audioBuf, "ogg");
  });
  ```
  </TabItem>
</Tabs>

**Expected Output:** Playable audio messages inside the chat.

---

## Stickers

WebP graphics can be sent as WhatsApp stickers. The source can be a local file path, a remote URL, or a Buffer.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";
  import fs from "fs";

  export default class StickerCommand implements ICommand {
    name = "sticker";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      // Send sticker from a public URL
      await ctx.SendSticker("https://example.com/sticker.webp");

      // Send sticker using a buffer
      const buffer = fs.readFileSync("./stickers/dog.webp");
      await ctx.SendSticker(buffer);
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand } from "whatsbotcord";
  import fs from "fs";

  export default CreateCommand("sticker", async function (ctx, api, args) {
    // Send sticker from a public URL
    await ctx.SendSticker("https://example.com/sticker.webp");

    // Send sticker using a buffer
    const buffer = fs.readFileSync("./stickers/dog.webp");
    await ctx.SendSticker(buffer);
  });
  ```
  </TabItem>
</Tabs>

**Expected Output:** The sent `.webp` media displays natively as a sticker within WhatsApp.

---

## Polls

Send a poll with multiple selections. A minimum of 1 and maximum of 12 options can be provided.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";

  export default class PollCommand implements ICommand {
    name = "poll";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      await ctx.SendPoll(
        "What is your favorite color?", 
        ["Red", "Blue", "Green"], 
        { withMultiSelect: false }
      );
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand } from "whatsbotcord";

  export default CreateCommand("poll", async function (ctx, api, args) {
    await ctx.SendPoll(
      "What is your favorite color?", 
      ["Red", "Blue", "Green"], 
      { withMultiSelect: false }
    );
  });
  ```
  </TabItem>
</Tabs>

**Expected Output:** An interactive poll asking "What is your favorite color?" where users can vote.

---

## Location (Ubication)

Share a geographic coordinate. You can optionally include a descriptive name and address.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";

  export default class LocationCommand implements ICommand {
    name = "location";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      // Just coordinates
      await ctx.SendUbication(40.785091, -73.968285);
      
      // Coordinates with details
      await ctx.SendUbicationWithDescription(
        40.785091, 
        -73.968285, 
        "Central Park", 
        "New York, NY 10024"
      );
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand } from "whatsbotcord";

  export default CreateCommand("location", async function (ctx, api, args) {
    // Just coordinates
    await ctx.SendUbication(40.785091, -73.968285);
    
    // Coordinates with details
    await ctx.SendUbicationWithDescription(
      40.785091, 
      -73.968285, 
      "Central Park", 
      "New York, NY 10024"
    );
  });
  ```
  </TabItem>
</Tabs>

**Expected Output:** A map preview snippet in the chat which, when tapped, opens the location in WhatsApp's native location viewer.

---

## Documents

Send actual files (PDFs, ZIPs, DOCs, CSVs, etc.) as documents. The MIME type is automatically detected based on the extension or passed parameter.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";
  import fs from "fs";

  export default class DocumentCommand implements ICommand {
    name = "document";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      // Send a document normally
      await ctx.SendDocument("./reports/annual.pdf");

      // Send and change its displayed name
      await ctx.SendDocumentWithCustomName("./reports/data.csv", "Sales Data");

      // Send document generated in memory
      const pdfBuffer = fs.readFileSync("./generated/report-123.pdf");
      await ctx.SendDocumentFromBuffer(pdfBuffer, "Dynamic_Report", "pdf");
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand } from "whatsbotcord";
  import fs from "fs";

  export default CreateCommand("document", async function (ctx, api, args) {
    // Send a document normally
    await ctx.SendDocument("./reports/annual.pdf");

    // Send and change its displayed name
    await ctx.SendDocumentWithCustomName("./reports/data.csv", "Sales Data");

    // Send document generated in memory
    const pdfBuffer = fs.readFileSync("./generated/report-123.pdf");
    await ctx.SendDocumentFromBuffer(pdfBuffer, "Dynamic_Report", "pdf");
  });
  ```
  </TabItem>
</Tabs>

**Expected Output:** File attachments that users can download. The final example will appear as a PDF file named `Dynamic_Report.pdf`.

---

## Contacts (vCard)

Send one or more contact cards (vCards) for users to easily save phone numbers into their device. Note that phone numbers should be in international format without the `+`.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
  ```ts
  import type { CommandArgs, IChatContext, ICommand, AdditionalAPI } from "whatsbotcord";

  export default class ContactCommand implements ICommand {
    name = "contact";
    
    public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
      // A single contact
      await ctx.SendContact({ name: "Support Team", phone: "1234567890" });
      
      // Multiple contacts in an array
      await ctx.SendContact([
        { name: "Alice", phone: "1111111111" },
        { name: "Bob", phone: "2222222222" }
      ]);
    }
  }
  ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
  ```js
  import { CreateCommand } from "whatsbotcord";

  export default CreateCommand("contact", async function (ctx, api, args) {
    // A single contact
    await ctx.SendContact({ name: "Support Team", phone: "1234567890" });
    
    // Multiple contacts in an array
    await ctx.SendContact([
      { name: "Alice", phone: "1111111111" },
      { name: "Bob", phone: "2222222222" }
    ]);
  });
  ```
  </TabItem>
</Tabs>

**Expected Output:** Native WhatsApp contacts that prompt the user to "View contact" or "Message", or if multiple, "View all".

`

## File: src\content\docs\essential_concepts\whatsapp_ids.mdx

`mdx
---
title: "WhatsApp IDs"
description: "Understanding how WhatsApp identifies users, groups, and linked devices."
---

import { Tabs, TabItem } from "@astrojs/starlight/components";

WhatsApp API uses specific suffixes to differentiate between a private chat message, a group message, or a message sent from a linked device (WhatsApp Web/Desktop).

WhatsBotCord provides built-in utilities in `Helpers.Whatsapp` to easily extract, format, and understand these identifiers without manual regex parsing.

## The Three Suffixes

You will mostly encounter these three post-fixes when dealing with Raw WhatsApp IDs:

1. **`@s.whatsapp.net`** (Individual User)
   The standard identifier for a private chat with a regular phone number.
   _Example: `1234567890@s.whatsapp.net`_

2. **`@g.us`** (Group Chat)
   The identifier for a WhatsApp Group.
   _Example: `1234567890-987654@g.us`_

3. **`@lid`** (Linked Device)
   A modern identifier used when a user sends a message from a linked device (like WhatsApp Desktop) inside a group. Messages **cannot** be sent directly to a `@lid`, they must be mapped to their real phone number (`@s.whatsapp.net`) or the bot must reply gracefully using `ChatContext`.

You have reference to these exact suffix strings inside `Helpers.Whatsapp.IdentifiersPostfixes`.

## Extracting Info from a Raw Message

When receiving a raw message from Baileys, it can be tricky to know who sent what. `WhatsappHelper_ExtractWhatsappInfoInfoFromSenderRawMsg` safely extracts the sender's phone number information from standard individual messages AND linked device group messages.

```ts
import { Helpers } from "whatsbotcord";
import type { WhatsappIDInfo } from "whatsbotcord";

bot.Use(async (bot, senderLID, senderPN, chatId, rawMsg, msgType, senderType, next) => {
  const phoneInfo: WhatsappIDInfo = Helpers.Whatsapp.GetWhatsInfoFromSenderMsg(rawMsg);

  console.log("Raw ID:", phoneInfo.rawId); // "12345@s.whatsapp.net" or "9999@lid"
  console.log("Mention String:", phoneInfo.asMentionFormatted); // "@12345"
  console.log("Type:", phoneInfo.WhatsappIdType); // "pn" or "lid"

  await next();
});
```

## Parsing Mentions

When users mention each other in a group (e.g., `@12345`), the text arrives as a string formatted with an `@`. You can easily parse this string back into a manageable `WhatsappIDInfo` object:

```ts
// Suppose the command was: !ban @123456789
const arg = args[0]; // "@123456789"

const info = Helpers.Whatsapp.GetWhatsInfoFromMentionStr(arg);
if (info) {
  console.log(info.rawId); // "123456789@lid" (or appropriate type)
}
```

## Validation Helpers

You can quickly validate string formats using our boolean checkers to assert your command logic constraints:

- `Helpers.Whatsapp.IsPNId("123@s.whatsapp.net")` 👉 Returns `true`
- `Helpers.Whatsapp.IsLIDId("9876@lid")` 👉 Returns `true`
- `Helpers.Whatsapp.IsMentionString("@123456")` 👉 Returns `true`

Understanding these IDs will prevent errors when trying to dispatch messages directly via `bot.SendMsg` utilizing incorrect ID formats!


`

## File: src\content\docs\getting-started\installation.mdx

`mdx
---
title: Installation
description: Install Whatsbotcord.js and set up your project.
---

import { Aside } from "@astrojs/starlight/components";
import InstallTabs from "../../../components/InstallTabs.astro";

## Prerequisites

- **Node.js** 18 or later (or [Bun.js](https://bun.sh))
- **WhatsApp Account** — you need an active WhatsApp account on a mobile device to scan a QR code for Web Device Login

<Aside type="caution">
  Whatsbotcord uses the unofficial WhatsApp Web protocol via Baileys.js. It is **not** an official WhatsApp Business API
  integration.
</Aside>

## Install the package

<InstallTabs />

## What's included

Once installed, you get access to the full Whatsbotcord API:

| Feature               | Description                                                                                                                  |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **Command System**    | Discord-style `!command` and `@tag` support with aliases ([Command Arguments](/essential_concepts/command_args))             |
| **TypeScript types**  | Full type definitions for every API surface                                                                                  |
| **Middleware**        | Express-like [middleware pipeline](/guides/middleware) for messages and commands                                             |
| **Plugins**           | Official and third-party [plugin support](/guides/plugins)                                                                   |
| **Testing utilities** | `ChatMock` for local command testing without WhatsApp ([Mocking Guide](/intermediate_advanced_concepts/testing-and-mocking)) |

## Next steps

Ready to build your first bot? Head to the [Quick Start](/getting-started/quickstart/) guide.


`

## File: src\content\docs\getting-started\quickstart.mdx

`mdx
---
title: Quick Start
description: Create your first WhatsApp bot command in minutes.
---

import { Tabs, TabItem, Aside, Steps } from '@astrojs/starlight/components';

Initialize a functional bot instance and register a fundamental command in minutes.

<Steps>

1. **Create your project file**

   Create a new file (e.g. `index.ts` or `index.js`) in your project.

2. **Add the bot code**



   <Tabs>
        <TabItem label="TypeScript" icon="seti:typescript">
       ```ts
        import Whatsbotcord, { type AdditionalAPI, type CommandArgs, type IChatContext, type ICommand } from "whatsbotcord";

        const bot = new Whatsbotcord({
          commandPrefix: "!",
          tagPrefix: "@",
          credentialsFolder: "./auth",
          loggerMode: "recommended",
        });

        class PingCommand implements ICommand {
          name: string = "ping";
          aliases?: string[] | undefined = ["p"];
          public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
            await ctx.SendText("pong!");
          }
        }

        bot.Commands.Add(new PingCommand());

        bot.Start();
       ```
     </TabItem>
     <TabItem label="JavaScript" icon="seti:javascript">
      ```js
        import Whatsbotcord, { CreateCommand } from "whatsbotcord";

        const bot = new Whatsbotcord({
          commandPrefix: "!",
          tagPrefix: "@",
          credentialsFolder: "./auth",
          loggerMode: "recommended",
        }));

        const PongCommand = CreateCommand(
          "ping",
          async function (ctx, api, args) {
            await ctx.SendText("pong!");
          }, {
            aliases: ["p"],
          }
        );
        bot.Commands.Add(PongCommand);

        bot.Start();
      ```
     </TabItem>


          <TabItem label="Typescript/Javascript with inline command creation">

      ```js
      import Whatsbotcord, { CommandType } from "whatsbotcord";

      const bot = new Whatsbotcord({
        commandPrefix: "!",
        tagPrefix: "@",
        credentialsFolder: "./auth",
        loggerMode: "recommended",
      });

      bot.Commands.Add(
        {
          name: "ping",
          async run(chat, api, commandArgs) {
            await chat.SendText("pong!");
          },
        },
        CommandType.Normal
      );

      bot.Start();
      ```

     </TabItem>
   </Tabs>

3. **Run your bot**

   <Tabs>
     <TabItem label="Node.js">
       ```shell
       npx tsx index.ts
       ```
     </TabItem>
     <TabItem label="Bun">
       ```shell
       bun run index.ts
       ```
     </TabItem>
   </Tabs>

4. **Scan the QR code**

   A QR code will appear in your terminal. Open WhatsApp on your phone → **Linked Devices** → Scan the code.

5. **Test implementation**

   Dispatch the `!ping` command in any WhatsApp chat involving the bot's account (either a direct message or a group).
   
   The bot will acknowledge the trigger and return a `pong!` text payload.

</Steps>

## Configuration options

The `Whatsbotcord` [Bot constructor](/essential_concepts/bot) accepts a rich set of configuration properties. 
You can easily configure basic prefixes, connection throttling, error handling, interactive prompt defaults, and more. 
These are the most important ones:

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```ts
    import Whatsbotcord, { type AdditionalAPI, type CommandArgs, type IChatContext, type ICommand } from "whatsbotcord";

    const bot = new Whatsbotcord({
      // -------------------------------------------------------------------
      // 1. Basic Options
      // -------------------------------------------------------------------
      // Which characters should trigger a command? (Array or string)
      commandPrefix: ["!", "."],
      
      // Which characters should trigger a tag-based command?
      tagPrefix: ["@"],
      
      // Where to store the WhatsApp session authentication files (By default in local ./auth directory)
      credentialsFolder: "./auth",
      
      // Console logging detail level ("silent", "error", "debug", "recommended")
      loggerMode: "recommended",

      // Should the bot capture its own messages? (By default: false)
      ignoreSelfMessage: false,
    });

    class PingCommand implements ICommand {
      name: string = "ping";
      aliases?: string[] | undefined = ["p"];
      public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
        await ctx.SendText("pong!");
      }
    }

    bot.Commands.Add(new PingCommand());
    bot.Start();
    ```
  </TabItem>
  <TabItem label="JavaScript" icon="seti:javascript">
    ```js
    import Whatsbotcord from "whatsbotcord";

    const bot = new Whatsbotcord({
      // -------------------------------------------------------------------
      // 1. Basic Options
      // -------------------------------------------------------------------
      // Which characters should trigger a command? (Array or string)
      commandPrefix: ["!", "."],
      
      // Which characters should trigger a tag-based command?
      tagPrefix: ["@"],
      
      // Where to store the WhatsApp session authentication files (By default in local ./auth directory)
      credentialsFolder: "./auth",
      
      // Console logging detail level ("silent", "error", "debug", "recommended")
      loggerMode: "recommended",

      // Should the bot capture its own messages? (By default: false)
      ignoreSelfMessage: false,
    });

    bot.Commands.Add({
      ...
    });

    bot.Start();
    ```
  </TabItem>
</Tabs>



| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `commandPrefix` | `string \| string[]` | `'!'` | Character(s) used to prefix commands. Configure multiple prefixes with an array (e.g. `['!', '/']`). |
| `tagPrefix` | `string \| string[]` | `'@'` | Character(s) used to tag the bot in messages (especially useful in group contexts). |
| `credentialsFolder` | `string` | `"./auth"` | Path to the folder where WhatsApp session credentials are stored. |
| `loggerMode` | `WhatsSocketLoggerMode` | `"debug"` | Logging verbosity level (e.g. `"recommended"`, `"silent"`, `"debug"`, `"error"`). |
| `ignoreSelfMessage` | `boolean` | `true` | If true, the socket ignores messages sent by the bot itself. |


## Want to know what else you can config?
Check the [Bot page](/essential_concepts/bot)

`

## File: src\content\docs\getting-started\whats_next.mdx

`mdx
---
title: "What's Next?"
description: "A recommended learning roadmap for mastering the WhatsBotCord ecosystem."
---

import { LinkCard, CardGrid } from "@astrojs/starlight/components";
import logoSrc from "../../../assets/whatsbotcord_logo.png";

# Learning Roadmap

Now that you have your bot successfully running, mastering WhatsBotCord is just a matter of understanding its core architectural components.

We heavily recommend reading through the documentation in the following sequence. This order ensures you grasp the foundational abstractions before moving to the advanced testing, broadcasting APIs, and enterprise architecture patterns.

## Stage 1: The Core Foundation

These are the fundamental building blocks of reading messages and designing robust commands.

<CardGrid>
  <LinkCard
    title="1. Bot Configuration"
    href="/essential_concepts/bot"
    description="Understand the main Bot framework and its high-level lifecycle configuration."
  />
  <LinkCard
    title="2. WhatsApp IDs"
    href="/essential_concepts/whatsapp_ids"
    description="Understand @s.whatsapp.net, @lid, and @g.us identifiers natively to route data correctly."
  />
  <LinkCard
    title="3. Command Arguments"
    href="/essential_concepts/command_args"
    description="Learn exactly how arguments are parsed from incoming messages and injected into your code."
  />
  <LinkCard
    title="4. Chat Context"
    href="/essential_concepts/chat_context"
    description="Master the IChatContext interface, the core wrapper isolating state within specific chat threads."
  />
</CardGrid>

---

## Stage 2: Interaction

Once you understand how a command is structured and how IDs map out, learn how to interact fluidly with the users typing them.

<CardGrid>
  <LinkCard
    title="5. Sending Methods"
    href="/essential_concepts/sending"
    description="Explore all available methods for dispatching rich media, raw strings, and reactions."
  />
  <LinkCard
    title="6. Receiving Methods"
    href="/essential_concepts/receiving"
    description="Learn how to halt command execution to dynamically wait for user replies, multimedia, or confirmations."
  />
  <LinkCard
    title="7. Built-in Helpers"
    href="/essential_concepts/helpers"
    description="Discover built-in utilities for deep WhatsApp metadata extraction without manual regex."
  />
</CardGrid>

---

## Stage 2.5: Explore Real Command Examples

If you prefer to learn by reading actual code, jump straight into these hands-on command examples to see how everything ties together:

<CardGrid>
  <LinkCard
    title="Receiving User Input Example"
    href="/tutorials/waiting-input"
    description="Step-by-step tutorial on building a command that waits for a user to reply with an image."
  />
  <LinkCard
    title="Cancelling Commands Example"
    href="/guides/cancelling-commands"
    description="Examples showing how to gracefully handle cancellations when waiting for inputs."
  />
  <LinkCard
    title="Commands Examples"
    href="/guides/commands-examples"
    description="Real world examples showing how to build interactive commands using text, multimedia, and selections."
  />
  <LinkCard
    title="ChatMock Examples"
    href="/essential_concepts/chat_mock_examples"
    description="Review real-world testing suites demonstrating rigorous validation architectures for your commands."
  />
</CardGrid>

---

## Stage 3: Advanced APIs & Testing

Ready to break out of simple text commands? Dive into global broadcasting logic and headless execution.

<CardGrid>
  <LinkCard
    title="8. Additional API"
    href="/essential_concepts/additional_api"
    description="Access the raw socket state to broadcast webhook alerts globally, entirely independent from ChatContext."
  />
  <LinkCard
    title="9. Testing & ChatMock"
    href="/essential_concepts/chat_mock"
    description="Simulate environments systematically and validate logic offline without QR scans using mock injections."
  />
</CardGrid>

---

## Stage 4: Practical Guides & Tutorials

When you are ready to build real-world applications, these guides cover common scenarios and powerful middleware interceptors.

<CardGrid>
  <LinkCard
    title="Events & Lifecycle"
    href="/guides/events"
    description="Hook into the socket's lifecycle to detect connections, disconnections, and command errors."
  />
  <LinkCard
    title="Middleware & Plugins"
    href="/guides/middleware"
    description="Intercept messages before they reach commands to apply global rate limits, bans, or logging."
  />
  <LinkCard
    title="Tags & Groups"
    href="/guides/tags-and-groups"
    description="Learn how to target specific users in groups and handle administrative operations."
  />
</CardGrid>

---

## Stage 5: Enterprise Architecture

For massive deployments and large teams, adhering to these decoupled architectural patterns is essential.

<CardGrid>
  <LinkCard
    title="Database Integration"
    href="/intermediate_advanced_concepts/database-integration"
    description="Learn the Abstract Command Bridge pattern to inject secure database connections into your commands."
  />
  <LinkCard
    title="Dependency Injection"
    href="/intermediate_advanced_concepts/dependency-injection"
    description="Use DI containers (like tsyringe) to dynamically swap Production DBs for isolated RAM instances."
  />
  <LinkCard
    title="Testing Architecture"
    href="/intermediate_advanced_concepts/testing-and-mocking"
    description="Combine DI with ChatMock to achieve blazing fast, deterministic unit tests."
  />
</CardGrid>

<div style={{ textAlign: "center", marginTop: "4rem", marginBottom: "2rem" }}>
  <h2>Thanks for using Whatsbotcord.js!</h2>
  <img src={logoSrc.src} alt="Whatsbotcord.js Logo" style={{ width: "250px", margin: "2rem auto", display: "block" }} />
</div>


`

## File: src\content\docs\guides\additional-api.mdx

`mdx
---
title: AdditionalAPI & Internal Socket
description: Break out of the sandbox and access the raw WhatsApp web protocol.
---

Each command receives an `api: AdditionalAPI` object alongside `ctx`.

While `ctx` is your high-level, per-chat conversational helper (handling 95% of usecases), `api.InternalSocket` provides raw access to the underlying Baileys socket. Use it to configure custom metrics, tap analytics streams, upload statuses, or force arbitrary payload deliveries.

## When to reach for InternalSocket

- Sending payloads across disjoint groups without context bridging
- Subscribing to raw socket events for telemetry/logging
- Publishing stories/statuses using `api.Myself.Status.UploadText(...)`
- Calling core WhatsApp features not yet abstracted by the library

<hr />

## Sending to Arbitrary Chats

The `InternalSocket.Send.*` endpoint mirrors the syntax of `ChatContext.Send*`, but demands explicit target JIDs (WhatsApp Internal IDs), rather than inferring them from the command scope.

- **Private Chats**: Append `@whatsapp.es` (e.g., `123456789@whatsapp.es`)
- **Groups**: Append `@g.us` (e.g., `987654321@g.us`)

```typescript
import type { AdditionalAPI, CommandArgs, IChatContext, ICommand } from "whatsbotcord";

class Broadcast implements ICommand {
  name = "broadcast";

  async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
    const groups = ["123456789@g.us", "987654321@g.us"];
    const text = args.args.join(" ") || "Hello everyone!";

    for (const chatId of groups) {
      // Fire payload to hardcoded JIDs globally
      await api.InternalSocket.Send.Text(chatId, `📢 ${text}`);
    }

    await ctx.SendText("Sent your message to all configured groups.");
  }
}
```

_Note:_ Standard broadcasts flow through a safety-queue to prevent WhatsApp from terminating your account due to rate-limiting. Bypassing this queue is strictly disallowed unless deliberately toggled using `sendRawWithoutEnqueue: true`.

<hr />

## Listening to Raw Socket Events

Occasionally you will need to peek beneath the surface of commands and inspect raw socket emissions (such as `onIncomingMsg`).

```typescript
import { MsgType } from "whatsbotcord";

class TapRawStream implements ICommand {
  name = "tapprobe";

  async run(ctx: IChatContext, api: AdditionalAPI): Promise<void> {
    const handler = (senderLID, chatId, _rawMsg, msgType) => {
      console.log(`[raw] ${chatId} from ${senderLID ?? "unknown"}:`, MsgType[msgType]);
    };

    // Attach listener
    api.InternalSocket.onIncomingMsg.Subscribe(handler);
    await ctx.SendText("Subscribed to raw incoming messages! 🕵️");

    // Remember to detach to prevent memory leaks in hot-reload scenarios!
    // api.InternalSocket.onIncomingMsg.Unsubscribe(handler);
  }
}
```

## InternalSocket Best Practices

1. **Prefer `ChatContext`:** Always lean on your `ctx` payload for strictly-scoped command interactions. Internal scope guarantees isolation; the socket leaks scope intentionally.
2. **Correct JIDs:** Always rigorously test your Target JID's suffix (`@whatsapp.es` / `@g.us`). A malformed target will blindly fail payload transmission.
3. **Queue Awareness:** Lean on the queued infrastructure! Hard-sending 50 socket packets unconditionally is the fastest way to get your bot's phone number blacklisted by WhatsApp.


`

## File: src\content\docs\guides\cancelling-commands.mdx

`mdx
---
title: Cancelling Commands
description: Allow users to gracefully abort long-running multi-step commands.
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

If you have long-running command workflows (like waiting for a user to upload an image or type a long response), users can cancel them using specific **cancel words**. 

By default, the cancel words are `"cancel"` (English) and `"cancelar"` (Spanish).

For example, if a bot is expecting the user to send an image msg via `!forwardmsg`, but the user changes their mind and sends `"cancel"`, the command will immediately abort.

## Global Config

You can configure which words should act as global cancellation keywords when you first instantiate the bot:

```javascript
const bot = new WhatsbotCord({
  commandPrefix: ["$", "!", "/", "."],
  credentialsFolder: "./auth",
  loggerMode: "recommended",
  delayMilisecondsBetweenMsgs: 1,
  // 1. Define global cancel keywords here
  cancelKeywords: ["abort", "stop", "cancel"], 
});
```

Now, any time your command is waiting for user input using a `Wait*` method, saying "abort", "stop", or "cancel" will exit the execution.

## Local Config

You can temporarily override the global cancel keywords just for a single `Wait*()` method. This is useful if a specific step requires different fallback words, or if "stop" might be a valid answer to a specific prompt!

```javascript
const imgReceived = await chat.WaitMultimedia(MsgType.Image, {
  timeoutSeconds: 60,
  wrongTypeFeedbackMsg: "Hey, send me an img, try again!",
  
  // 2. Override for this wait action only
  cancelKeywords: ["cancelcustomword"],
});
```

In this specific call, only `"cancelcustomword"` will abort the flow. If you use another `WaitMultimedia(...)` or `WaitMsg(...)` method later down the line without providing `cancelKeywords`, it will fall back to the global bot config (e.g., `["abort", "stop", "cancel"]`).

## Full Example: An Abortable Command

Here is a complete example of a command that asks for a profile photo. If the user decides they don't want to change their photo anymore and replies with `"cancel"`, the command halts automatically without executing any further code.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import { type AdditionalAPI, type IChatContext, type CommandArgs, type ICommand, MsgType } from "whatsbotcord";

    export class UpdatePhotoCommand implements ICommand {
      public name: string = "updatephoto";
      
      public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
        await ctx.Loading();
        await ctx.SendText("📸 Send me your new profile photo! (Or type 'cancel' to abort)");
        
        // The command will pause here.
        // If the user sends "cancel" (or any registered keyword), the command is killed instantly.
        const imgBuffer = await ctx.WaitMultimedia(MsgType.Image, { timeoutSeconds: 60 });
        
        if (!imgBuffer) {
           await ctx.SendText("You took too long!");
           return;
        }

        // This line will NEVER execute if the user sent "cancel".
        await ctx.SendText("✅ Photo updated successfully!");
        await ctx.Ok();
      }
    }
    ```
  </TabItem>
</Tabs>

### Testing Cancellations with ChatMock

You can easily verify that your commands correctly abort using `ChatMock`:

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import { test, expect } from "bun:test";
    import { ChatMock, SenderType } from "whatsbotcord";
    import { UpdatePhotoCommand } from "./UpdatePhotoCommand.js";

    test("User cancels the photo update", async () => {
      const chat = new ChatMock(new UpdatePhotoCommand(), { senderType: SenderType.Individual });

      // Simulate the user sending the cancel keyword
      chat.EnqueueIncoming_Text("cancel");

      await chat.StartChatSimulation();

      // Assert that the bot ONLY sent the initial prompt and nothing else!
      expect(chat.SentFromCommand.Texts).toHaveLength(1);
      expect(chat.SentFromCommand.Texts[0].text).toContain("Send me your new profile photo!");
      
      // The "Photo updated successfully!" text is never sent because execution aborted.
    });
    ```
  </TabItem>
</Tabs>

`

## File: src\content\docs\guides\chat-context.mdx

`mdx
---
title: Manipulating the Chat Context
description: Clone contexts to reply privately, switch groups, or spin off parallel tasks.
---

The `IChatContext` object (`ctx`) is your primary tool for interacting with a chat. By default, it's tied to the chat where a command was triggered. However, you can seamlessly **clone** or **retarget** it to perform actions in other chats, execute background logic, or reply to a group user privately in their DMs.

<hr/>

## 1. Replying Privately to a Group Command

The most reliable way to transition a conversation from a grouped arena to a private user chat.

**The Pattern:**
1. Send an "anchor" message right to the user's private DM using the low-level `api.InternalSocket`.
2. Generate a new context aimed at that private chat by cloning the original context using `CloneButTargetedToWithInitialMsg()`.

```typescript
import type { AdditionalAPI, CommandArgs, IChatContext, ICommand } from "whatsbotcord";

class PrivateReplyCommand implements ICommand {
  name = "myinfo";

  public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
    // 1. Send an anchor message directly to the targeted user.
    const privateMsg = await api.InternalSocket.Send.Text(
      args.participantIdPN!, // The user's phone number ID
      "Replying privately as you requested..."
    );

    // 2. Create the new context targeting their private chat using the anchor message.
    const privateCtx = ctx.CloneButTargetedToWithInitialMsg({ initialMsg: privateMsg! });

    // 3. Now, all instructions sent via `privateCtx` strictly hit their DMs! 🤫
    await privateCtx.SendText(`Hi ${args.originalRawMsg.pushName}, here is your private info!`);
  }
}
```

<hr/>

## 2. Targeting a New Conversation

Sometimes you possess a raw ID (like a user or an announcements group) and just want to send a standalone message.

### Messaging a Private Chat by ID

Use `CloneButTargetedToIndividualChat` when aiming at a strict Phone Number ID (`@whatsapp.es`).

```typescript
class StartPrivateChatCommand implements ICommand {
  name = "contactme";

  public async run(ctx: IChatContext, _api: AdditionalAPI, args: CommandArgs): Promise<void> {
    // Generate private targeted context
    const privateCtx = ctx.CloneButTargetedToIndividualChat({
      userChatId: args.participantIdPN!, // e.g. 234234234@whatsapp.es
    });

    await privateCtx.SendText("Hello! You asked me to contact you.");
  }
}
```

### Messaging Another Group by ID

If you need your bot to broadcast across groups, utilize `CloneButTargetedToGroupChat`.

```typescript
class AnnounceCommand implements ICommand {
  name = "announce";

  public async run(ctx: IChatContext, _api: AdditionalAPI, args: CommandArgs): Promise<void> {
    const announcement = args.args.join(" ");
    const targetGroupId = "1234567890@g.us"; 

    // Target the auxiliary group
    const announcementCtx = ctx.CloneButTargetedToGroupChat({ groupChatId: targetGroupId });

    // Send payload
    await announcementCtx.SendText(`📢 Announcement: ${announcement}`);
    await ctx.SendText("I've posted your message in the announcements group!");
  }
}
```

<hr/>

## 3. Creating a Simple Parallel Clone

If you want to maintain the same target parameters but require an independent tracker object (e.g. spinning off a `setTimeout` payload), utilize the simple `Clone()`.

```typescript
class ParallelTaskCommand implements ICommand {
  name = "starttask";

  public async run(ctx: IChatContext, _api: AdditionalAPI, _args: CommandArgs): Promise<void> {
    await ctx.SendText("Starting a background task for you now...");

    // Spawn identical independent clone
    const clonedCtx = ctx.Clone();

    // The original context flow isn't interrupted by background waits.
    setTimeout(async () => {
      await clonedCtx.SendText("Background task finished! ✅");
    }, 10000);
  }
}
```

`

## File: src\content\docs\guides\commands-examples.mdx

`mdx
---
title: Commands Examples
description: A comprehensive collection of real-world command examples categorized by difficulty.
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

This guide provides real-world examples of how to build interactive commands. These examples are inspired by production environments and are divided into **Easy**, **Medium**, and **Complex** categories to help you progressively understand the WhatsBotCord ecosystem.

---

## 🟢 Easy Examples

These commands represent the basics of bot interaction: reading arguments, sending simple messages, and calling external APIs.

### 1. Simple Reply (Goodnight Command)
A straightforward command that reads the sender's details and replies with a personalized message.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import { type AdditionalAPI, type IChatContext, type CommandArgs, type ICommand } from "whatsbotcord";

    export class GoodnightCommand implements ICommand {
      public name: string = "goodnight";
      public aliases: string[] = ["gn"];
      
      public async run(ctx: IChatContext, _api: AdditionalAPI, _args: CommandArgs): Promise<void> {
        await ctx.Loading();
        await ctx.SendText(`Goodnight! Rest well. 🌙`);
        await ctx.Ok();
      }
    }
    ```
  </TabItem>
</Tabs>

### 2. API Integration (Action Command)
A command that fetches a random GIF from a public API and sends it as an image with a caption.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import { type AdditionalAPI, type IChatContext, type CommandArgs, type ICommand } from "whatsbotcord";

    export class KissCommand implements ICommand {
      public name: string = "kiss";
      
      public async run(ctx: IChatContext, _api: AdditionalAPI, args: CommandArgs): Promise<void> {
        await ctx.Loading();
        
        // Fetch random image URL from a generic API
        const response = await fetch("https://api.otakugifs.com/v1/gifs/kiss");
        const data = await response.json();

        // Mention a user if provided in args
        const target = args.args.length > 0 ? args.args.join(" ") : "someone";

        await ctx.SendImgWithCaption(data.url, `You gave a kiss to ${target}! 😘`);
        await ctx.Ok();
      }
    }
    ```
  </TabItem>
</Tabs>

### 3. Update Bot Status
Using the `AdditionalAPI` to modify the bot's own WhatsApp state (story).

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import { type AdditionalAPI, type IChatContext, type CommandArgs, type ICommand, SenderType } from "whatsbotcord";

    export class SetStatusCommand implements ICommand {
      public name: string = "status";
      
      public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
        await ctx.Loading();
        
        if (args.args.length === 0) {
          await ctx.SendText("❌ Please provide the text for the status.");
          await ctx.Fail();
          return;
        }

        const statusText = args.args.join(" ");
        const targetViewer = args.senderType === SenderType.Individual ? args.chatId! : args.participantIdPN!;
        
        // Uploads to WhatsApp Status and makes it visible only to the specified user
        await api.Myself.Status.UploadText(statusText, [targetViewer]);
        
        await ctx.SendText("✅ Status updated successfully!");
        await ctx.Ok();
      }
    }
    ```
  </TabItem>
</Tabs>

---

## 🟡 Medium Examples

Medium commands involve **halting execution** to wait for user interactions, parsing inputs, and validating data using `while` loops.

### 4. Wait for Text (Date Parsing)
Halts execution to ask the user for text input and validates it. It uses a `while (true)` loop to handle invalid inputs gracefully without restarting the command.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import { type AdditionalAPI, type IChatContext, type CommandArgs, type ICommand } from "whatsbotcord";

    export class AskForDateCommand implements ICommand {
      public name: string = "askdate";
      
      public async run(ctx: IChatContext, _api: AdditionalAPI, _args: CommandArgs): Promise<void> {
        await ctx.Loading();
        await ctx.SendText("📅 Please provide a date in the format YYYY/MM/DD (e.g., 2024/10/24):");
        
        while (true) {
          const result = await ctx.WaitText({ timeoutSeconds: 60 });
          
          if (!result) {
            await ctx.SendText("❌ You haven't responded in time. Please try again:");
            continue;
          }

          const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
          if (!dateRegex.test(result)) {
            await ctx.SendText("❌ Invalid date format. It should be YYYY/MM/DD. Try again:");
            continue;
          }

          await ctx.SendText(`✅ Success! The date you entered is: ${result}`);
          await ctx.Ok();
          break;
        }
      }
    }
    ```
  </TabItem>
</Tabs>

### 5. Wait for Multimedia (Profile Photo)
Asks the user to upload an image. Highly useful for registration flows or profile updates.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import { type AdditionalAPI, type IChatContext, type CommandArgs, type ICommand, MsgType } from "whatsbotcord";
    import * as fs from "fs";

    export class UpdateProfilePhotoCommand implements ICommand {
      public name: string = "updatephoto";
      
      public async run(ctx: IChatContext, _api: AdditionalAPI, _args: CommandArgs): Promise<void> {
        await ctx.Loading();
        await ctx.SendText("🖼️ Send me your new profile photo (Send an image, not text):");
        
        while (true) {
          const imgBuffer = await ctx.WaitMultimedia(MsgType.Image, { timeoutSeconds: 60 });
          
          if (!imgBuffer) {
            await ctx.SendText("❌ There was an error receiving your photo or you took too long. Please try again:");
            continue;
          }
          
          // Normally you would save imgBuffer to your file system or database
          // fs.writeFileSync(`profile_${Date.now()}.png`, imgBuffer);

          await ctx.SendText("✅ I have successfully received and updated your profile photo!");
          await ctx.Ok();
          break;
        }
      }
    }
    ```
  </TabItem>
</Tabs>

### 6. Numeric Selection Menu
Shows a list of items and asks the user to select one by typing its number. This is an extremely common pattern for navigating menus.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import { type AdditionalAPI, type IChatContext, type CommandArgs, type ICommand } from "whatsbotcord";

    export class SelectLanguageCommand implements ICommand {
      public name: string = "setlanguage";
      
      public async run(ctx: IChatContext, _api: AdditionalAPI, _args: CommandArgs): Promise<void> {
        await ctx.Loading();
        
        const availableLangs = ["English", "Spanish", "French", "German"];
        const menuText = availableLangs.map((lang, index) => `${index + 1}. ${lang}`).join("\n");
        
        await ctx.SendText(`🌐 Language selection. Reply with the number of your preferred language:\n\n${menuText}`);
        
        while (true) {
          const result = await ctx.WaitText({ timeoutSeconds: 30 });
          if (!result) {
            await ctx.SendText("❌ Process canceled.");
            await ctx.Fail();
            return;
          }

          const selectedIndex = parseInt(result.trim()) - 1;
          if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= availableLangs.length) {
            await ctx.SendText("⚠️ Bad selection. Try selecting by number (e.g., '1' for English):");
            continue;
          }

          await ctx.SendText(`✅ Language successfully set to: ${availableLangs[selectedIndex]}`);
          await ctx.Ok();
          break;
        }
      }
    }
    ```
  </TabItem>
</Tabs>

---

## 🔴 Complex Examples

Complex commands integrate multiple steps, handle logical validations, interact with a database, and manage advanced states like **Matchmaking Queues** or **Admin Operations**.

### 7. Multi-step Admin Creation (Add Member)
This command validates permissions, executes multiple `WaitText` prompts in sequence to gather data, and saves a record in a simulated database.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import { type AdditionalAPI, type IChatContext, type CommandArgs, type ICommand } from "whatsbotcord";

    export class AddMemberCommand implements ICommand {
      public name: string = "addmember";
      
      public async run(ctx: IChatContext, _api: AdditionalAPI, args: CommandArgs): Promise<void> {
        await ctx.Loading();
        
        // 1. Permission Validation Simulation
        const isAdmin = true; // In reality, fetch from your DB
        if (!isAdmin) {
          await ctx.SendText("❌ You don't have permission to use this command.");
          await ctx.Fail();
          return;
        }

        // 2. Step One: Ask for Username
        await ctx.SendText("👤 Please type the new member's username:");
        const username = await ctx.WaitText({ timeoutSeconds: 60 });
        if (!username) {
          await ctx.SendText("❌ Timed out waiting for a username. Cancelled.");
          await ctx.Fail();
          return;
        }

        // 3. Step Two: Ask for Phone Number
        await ctx.SendText(`📱 Now, what is ${username}'s WhatsApp number? (Include country code)`);
        let phone: string;
        while(true) {
          const input = await ctx.WaitText({ timeoutSeconds: 60 });
          if (!input) return; // Silent cancel
          
          if (!/^\d{10,15}$/.test(input)) {
            await ctx.SendText("⚠️ Invalid number format. It should only contain digits. Try again:");
            continue;
          }
          phone = input;
          break;
        }

        // 4. Database Simulation
        // await db.members.create({ username, phone });

        await ctx.SendText(`✅ Successfully added member **${username}** with phone **${phone}**.`);
        await ctx.Ok();
      }
    }
    ```
  </TabItem>
</Tabs>

### 8. API, Database, and Mention Handling (Kiss Command)
This complex command showcases how to parse tagged users (mentions), validate arguments, interact with a database to keep track of interactions (e.g., how many times two users have kissed), fetch external data from an API, and use dynamic language localization.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import { 
      type AdditionalAPI, 
      type IChatContext, 
      type CommandArgs, 
      type ICommand,
      Helpers, 
      WhatsappHelpers 
    } from "whatsbotcord";
    
    // Example OtakuGifs API wrapper
    import { GlobalOtakuGifs_API } from "./OtakuGifs.api.js";

    export class KissCommand implements ICommand {
      public name: string = "kiss";
      public aliases?: string[] = ["k"];
      
      public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
        await ctx.Loading();

        // 1. Arguments Validation
        if (args.args.length < 1) {
          await ctx.SendText("❌ You must mention someone! Use: !kiss @someone", { quoted: args.originalRawMsg });
          await ctx.Fail();
          return;
        }

        if (args.args.length > 1) {
          await ctx.SendText("🤓 You can't kiss more than 1 person at a time!", { quoted: args.originalRawMsg });
          await ctx.Fail();
          return;
        }

        // 2. Mention Extraction
        const mentionedId: string = args.args[0];
        if (!Helpers.Whatsapp.IsMentionString(mentionedId)) {
          await ctx.SendText("🥲 Invalid mention. Try again with @someone.", { quoted: args.originalRawMsg });
          await ctx.Fail();
          return;
        }

        // 3. Simulated Database Interaction
        const kisserId = args.participantIdLID || args.participantIdPN || args.chatId!;
        const kissedWhatsInfo = WhatsappHelpers.GetWhatsInfoFromMentionStr(mentionedId);
        
        if (!kissedWhatsInfo) {
          await ctx.SendText("🥲 There was a strange error fetching info about the user.");
          await ctx.Fail();
          return;
        }

        // Fetch user profiles from database
        // const kisserProfile = await db.Players.Find(kisserId);
        // const kissedProfile = await db.Players.Find(kissedWhatsInfo.rawId);

        // Update database counts
        // const currentKisses = await db.Kisses.Increment(kisserId, kissedWhatsInfo.rawId);
        const currentKisses = 1; // Simulated result

        // 4. External API Call
        const kissImg = await GlobalOtakuGifs_API.GetRandomAnimeKissGiff();
        
        const messageToSend = currentKisses === 1 
          ? `💋 You kissed for the first time!` 
          : `💋 You have kissed ${currentKisses} times!`;

        // 5. Rich Response with Mentions and Media
        if (kissImg) {
          await ctx.SendImgFromBufferWithCaption(kissImg.imgBuffer, kissImg.extension, messageToSend);
        } else {
          // Send text tagging both users
          await ctx.SendText(messageToSend, { 
            quoted: args.originalRawMsg, 
            mentionsIds: [kisserId, kissedWhatsInfo.rawId] 
          });
        }

        await ctx.Ok();
      }
    }
    ```
  </TabItem>
</Tabs>

### 9. Pagination and Discovery (Help Command)
The `!help` command is often the most complex command in any bot. This example demonstrates how to filter available commands dynamically based on the user's role privileges, provide paginated menus, and parse specific command requests using `string-similarity` to suggest alternatives.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import stringSimilarity from "string-similarity";
    import { type AdditionalAPI, type CommandArgs, type IChatContext, type ICommand, CommandType } from "whatsbotcord";
    
    // Assume you have a custom Command wrapper (e.g. KLCommand) that has minimumPrivileges and localization
    export class HelpCommand implements ICommand {
      public name: string = "help";
      public aliases?: string[] = ["h", "ayuda"];
      
      public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
        await ctx.Loading();

        // 1. Fetch user privileges (simulated)
        // const userRoleWeight = await getUserWeight(args.chatId);
        const userRoleWeight = 1; // Example: 0 = Anyone, 1 = Member, 2 = Admin

        // 2. Filter commands by privileges dynamically
        const availableCommands = api.Myself.Bot.Commands.NormalCommands.filter(entry => {
           // const requiredWeight = getRequiredWeightForCommand(entry.commandObj);
           // return userRoleWeight >= requiredWeight;
           return true;
        });

        // 3. Specific Command Search
        if (args.args.length === 1 && isNaN(Number(args.args[0]))) {
          const searchName = args.args[0]!.toLowerCase();
          
          let foundCommand = api.Myself.Bot.Commands.GetWhateverWithAlias(searchName, CommandType.Normal);

          if (foundCommand) {
            await ctx.SendText(`📖 Help for command: ${foundCommand.name}`);
            await ctx.Ok();
          } else {
            // Suggest similar commands
            const commandNames = availableCommands.map(entry => entry.commandObj.name);
            const matches = stringSimilarity.findBestMatch(searchName, commandNames);
            
            if (matches.bestMatch.rating > 0.3) {
              await ctx.SendText(`❌ Command not found. Did you mean !${matches.bestMatch.target}?`);
            } else {
              await ctx.SendText(`❌ Command not found.`);
            }
            await ctx.Fail();
          }
          return;
        }

        // 4. Pagination System
        const resultsPerPage = 5;
        const totalPages = Math.ceil(availableCommands.length / resultsPerPage) || 1;
        let currentPage = 1;

        if (args.args.length === 1 && !isNaN(Number(args.args[0]))) {
          currentPage = Number(args.args[0]);
        }

        if (currentPage < 1 || currentPage > totalPages) {
          await ctx.SendText(`❌ Invalid page. Max pages: ${totalPages}`);
          await ctx.Fail();
          return;
        }

        const startIndex = (currentPage - 1) * resultsPerPage;
        const pageCommands = availableCommands.slice(startIndex, startIndex + resultsPerPage);

        // 5. Render Page
        const prefix = typeof api.Myself.Bot.Settings.commandPrefix === "string" 
            ? api.Myself.Bot.Settings.commandPrefix 
            : api.Myself.Bot.Settings.commandPrefix[0];

        const msgToSend = [
          `📖 Help (Page ${currentPage}/${totalPages})`,
          `----------------------------------`,
          ...pageCommands.map(c => `▪️ ${prefix}${c.commandObj.name}`)
        ];

        await ctx.SendText(msgToSend.join("\n"), { quoted: args.originalRawMsg });
        await ctx.Ok();
      }
    }
    ```
  </TabItem>
</Tabs>

### 10. Cross-Chat Interactions (Sending DMs from a Group)

This advanced example demonstrates how to start a command inside a Group Chat, temporarily shift the execution context to a Direct Message to ask the user something privately, and then return back to the Group Chat to confirm success.

We achieve this by utilizing `ctx.CloneButTargetedToIndividualChat(...)`, which spins up a completely identical sub-context but safely directs all its `Send*` and `Wait*` functions strictly into the private chat!

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import { type AdditionalAPI, type IChatContext, type CommandArgs, type ICommand, SenderType } from "whatsbotcord";

    export class SecretQuestionCommand implements ICommand {
      public name: string = "secretquestion";
      
      public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
        // 1. Initial Validation
        if (args.senderType === SenderType.Individual) {
          await ctx.SendText("😶‍🌫️ This command can only be executed inside a Group!");
          await ctx.Fail();
          return;
        }

        // 2. Notify the group that we will slide into their DMs
        await ctx.SendText("⚠️ I will send you a private message to ask you a secret question.");

        // We try to get the user's private Phone Number ID or LID
        const foundUserChatID = args.participantIdPN || args.participantIdLID;

        if (!foundUserChatID) {
          await ctx.SendText("🥲 I couldn't find a way to DM you...");
          await ctx.Fail();
          return;
        }

        // 3. 💥 CLONE THE CONTEXT DIRECTED TO THE DM! 💥
        const privateChat = ctx.CloneButTargetedToIndividualChat({ userChatId: foundUserChatID });

        // 4. Send messages and wait for inputs INSIDE THE PRIVATE CHAT
        await privateChat.SendText(`Tell me a secret! Nobody in the group will see this.`);
        
        const secretAnswer = await privateChat.WaitText({ timeoutSeconds: 60 });

        if (!secretAnswer) {
          await privateChat.SendText("You took too long. Aborting.");
          await ctx.Fail(); // Failing the original context will react to the original group message!
          return;
        }

        await privateChat.SendText("Got it! I won't tell anyone. I'm going back to the group now.");

        // 5. Back to the original GROUP CHAT context
        await ctx.SendText(`✅ The user successfully answered the secret question in my DMs!`);
        await ctx.Ok();
      }
    }
    ```
  </TabItem>
</Tabs>

`

## File: src\content\docs\guides\events.mdx

`mdx
---
title: Events
description: Subscribe to lifecycle events and incoming WhatsApp data flow.
---

Whatsbotcord provides a curated list of events you can subscribe to. This allows you to hook into WhatsApp's background activity, command lifecycles, and group updates.

## Subscribing to Events

You can access events through the `bot.Events` object:

```ts
import Whatsbotcord from "whatsbotcord";

const bot = new Whatsbotcord({ /* config */ });

bot.Events.onGroupEnter.Subscribe((groupMetadata) => {
  console.log(`Bot joined a new group: ${groupMetadata.subject}`);
});

bot.Events.onCommandNotFound.Subscribe((ctx, commandNameStrNotFound) => {
  ctx.SendText(`Couldn't find command '!${commandNameStrNotFound}'. Try again.`);
});
```

## Available Events

Here are all the events you can listen to:

| Event | Description |
| :--- | :--- |
| `onGroupEnter` | Triggered when the bot is added to or joins a new group. |
| `onGroupUpdate` | Triggered when a group updates its name, description, or members count. |
| `onIncomingMsg` | Triggered when *any* message arrives. This is the most raw way to hook into incoming data. |
| `onRestart` | Triggered when the bot restarts itself in the event of an error or connection drop. |
| `onSentMessage` | Triggered immediately following a successful outgoing message. |
| `onStartupAllGroupsIn` | Triggered during boot when the bot syncs all the groups it is currently a part of. |
| `onUpdateMsg` | Triggered on message edits, like someone reacting to an existing message with an emoji. |
| `onCommandNotFound` | Triggered when a user tries to execute a command that is not registered. |
| `onMiddlewareEnd` | Triggered after all middleware layers execute successfully (if defined). |
| `onCommandFound` | Triggered when a valid command is parsed and matched, right *before* it gets executed. |
| `onCommandFoundAfterItsExecution` | Triggered *after* a valid command finishes running (whether it succeeded or threw an error). |

`

## File: src\content\docs\guides\middleware.mdx

`mdx
---
title: Middleware
description: Inspect and intercept traffic with a robust middleware pipeline.
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

Your bot supports optional middleware, similar to how it works in popular web frameworks like [Express.js](https://expressjs.com/). There are two types of middleware you can use to intercept traffic and add pre-execution hooks.

<hr/>

## 1. General Middleware (`bot.Use()`)

This is the main middleware that runs on **every** raw incoming message, checking it before the bot even decides if it's a valid command or just a regular conversation.

- Middlewares are executed in the exact order they are added.
- Each middleware receives the full context of the incoming message and decides whether to continue the chain by calling `next()`.

Use this for features that need to inspect all traffic, such as:
- Global logging and analytics
- Spam protection / Rate limiting
- Blocking users across the entire bot

```typescript
const bot = new WhatsbotCord({
  commandPrefix: ["!"],
  credentialsFolder: "./auth",
});

// Add a general middleware for logging
bot.Use((bot, senderId_LID, senderId_PN, chatId, rawMsg, msgType, senderType, next) => {
  // ✅ This code runs for EVERY incoming message
  console.log(`Incoming message from ${senderId_LID} in ${chatId}`);

  // Continue to the next middleware (or to command parsing)
  next();
});
```

<hr/>

## 2. Command-Specific Middleware (`bot.Use_OnCommandFound()`)

This is targeted middleware that runs **only after a valid command is found**, but *before* that command’s `run()` method is executed. This applies to both regular Commands and Tags.

This makes it the perfect place for logic that should only apply to intentional bot interactions, such as:
- **Permission Checks**: Is the user an admin? Do they have a specific role?
- **Command-Specific Logging**: Tracking who uses what command.
- **Cooldowns**: Preventing spam on intensive commands.

The function signature includes an extra `commandFound` object carrying the command's profile.

```typescript
// Register an admin-only command
bot.Commands.Add(
  {
    name: "ban",
    async run(ctx) {
      await ctx.SendText("Banning user...");
    },
  },
  CommandType.Normal
);

// Add middleware for permission checks
bot.Use_OnCommandFound(async (bot, senderId_LID, senderId_PN, chatId, rawMsg, msgType, senderType, commandFound, next) => {
  const admins = ["admin1@s.whatsapp.net", "admin2@s.whatsapp.net"];

  // ✅ This code ONLY runs if a valid !command is triggered

  // Check if command is 'ban' and if the user is an admin
  if (commandFound.name === "ban" && !admins.includes(senderId_LID)) {
    // Block the command and send feedback
    await bot.SendMsg.Text(chatId, "❌ You don't have permission to use the 'ban' command.");
    
    // IMPORTANT: Return without calling next() to halt execution
    return;
  }

  // Allow execution to continue and actually trigger the run() method
  await next();
});
```

### Important Notes

If you don't call `next()`, the middleware chain **stops dead in its tracks**.

- In a **general middleware**, the message will not be evaluated for commands.
- In a **command-specific middleware**, the command's `run()` method **will not be executed**.

`

## File: src\content\docs\guides\plugins.mdx

`mdx
---
title: Plugins
description: Extend your bot with official and custom plugins.
---

Whatsbotcord uses a pluggable architecture allowing you to dynamically improve your bot. You can use official plugins maintained by the project or build your own custom extensions.

## Official Plugins

### One Command Per User at a Time

By default, if you have a long, multi-step command workflow, a user can trigger the command again in the chat while their first request is still executing. This can lead to unexpected state issues.

If your use case requires it, you can lock execution using the official **One Command Per User At A Time** plugin.

```javascript
import WhatsbotCord, { 
  OfficialPlugin_OneCommandPerUserAtATime 
} from "whatsbotcord";

const bot = new WhatsbotCord({
  /* bot config */
});

// Add your commands
// bot.Commands.Add(...)

// Enforce the plugin natively
bot.Use(
  OfficialPlugin_OneCommandPerUserAtATime({
    // Feedback message sent if user interrupts
    msgToSend: (info, lastCommand, actualCommand) => {
      return `❌ You can't use !${actualCommand.name}. Wait until you finish the previous command !${lastCommand.name}!`;
    },
    // The timeout lock resets after 5 minutes
    timeoutSecondsToForgetThem: 60 * 5,
  })
);
```

`

## File: src\content\docs\guides\tags-and-groups.mdx

`mdx
---
title: Tags & Groups
description: Handle group properties, execute @mentions, and recreate Discord's @everyone.
---

import { Tabs, TabItem } from "@astrojs/starlight/components";

Commands can be invoked as **Tags** instead of normal prefixes. By default, tags are triggered via `@`. You can change this behavior setting the `tagPrefix` option when creating your Bot.

## Recreating `@everyone`

Here we'll create a command that works exactly like Discord's `@everyone` by fetching all group members, wrapping their IDs in mention syntax, and sending a broadcast.

<Tabs>
  <TabItem label="JavaScript" icon="seti:javascript">
    ```javascript
    import Bot, { CommandType, CreateCommand } from "whatsbotcord";

    const everyoneTag = CreateCommand(
      "everyone",
      async (chat, api, args) => {
        // Fetch properties from the current group context
        const res = await chat.FetchGroupData();

        if (res) {
          /**
           * `res.members` contains everyone's formatted IDs
           * abstracted for you by the library!
           */
          const mentions = res.members.map((m) => m.asMentionFormatted);
          const ids = res.members.map((m) => m.rawId);

          // Reply with all mentions, telling WhatsApp who to actually tag
          await chat.SendText(mentions.join(" "), { mentionsIds: ids });
        }
      },
      // Now it can be used like @e
      { aliases: ["e"] }
    );

    const bot = new Bot({
      commandPrefix: ["!"],
      tagPrefix: ["@"],
      credentialsFolder: "./auth",
    });

    /** IMPORTANT: Use CommandType.Tag prop to make it use the @ prefix */
    bot.Commands.Add(everyoneTag, CommandType.Tag);
    bot.Start();
    ```

  </TabItem>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import type { AdditionalAPI, ChatContext, CommandArgs, ICommand } from "whatsbotcord/types";
    import Bot, { CommandType, SenderType } from "whatsbotcord";

    class EveryoneTag implements ICommand {
      name: string = "everyone";
      aliases: string[] = ["e"];

      async run(ctx: ChatContext, _api: AdditionalAPI, args: CommandArgs): Promise<void> {
        if (args.senderType === SenderType.Individual) {
          await ctx.SendText("This command can only be used in groups!");
          return;
        }

        const groupData = await ctx.FetchGroupData();
        if (!groupData) {
          await ctx.SendText("There was an error trying to get the group data!...");
          return;
        }

        // Format: 234234234@lid
        const allIds = groupData.members.map((m) => m.rawId!);
        
        // Format: @23423423
        const allMentionsIds: string[] = groupData.members.map((m) => m.asMentionFormatted!);

        await ctx.SendText(allMentionsIds.join(" "), { mentionsIds: allIds });
      }
    }

    const bot = new Bot({
      commandPrefix: ["!"],
      tagPrefix: ["@"],
      credentialsFolder: "./auth",
    });

    bot.Commands.Add(new EveryoneTag(), CommandType.Tag);
    bot.Start();
    ```

  </TabItem>
</Tabs>

Now whenever someone sends `"@everyone"` or `"@e"`, the bot will broadcast out the mention block. (Note: the bot must have permissions/presence in that group to read group data and send messages).


`

## File: src\content\docs\intermediate_advanced_concepts\main-setup.mdx

`mdx
---
title: "Production Main Setup"
description: "An example of a real-world index.ts initializing WhatsBotCord with multiple commands, middlewares, and plugins."
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

As your bot grows, your entry file (`index.ts` or `main.ts`) will become the central hub linking your configurations, middlewares, and commands.

Below is a reference of a production-level `index.ts` utilizing environment validations, customized plugins, and registering numerous commands mapped to specific categories.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    /**
     * index.ts | Main entry for WhatsBot
     */

    // 1. Main Dependencies
    import type { ICommand } from "whatsbotcord";
    import Whatsbotcord, { BaileysAdapter, CommandType, OfficialPlugin_OneCommandPerUserAtATime } from "whatsbotcord";

    // 2. Configuration & Helpers
    import { ENV_AuthFolder, ENV_IsDev } from "./envs.js";

    // 3. Middlewares (Custom examples)
    import ChatTypeValidatorMiddleware from "./middlewares/chattype_middleware.js";
    import CommandPrivilegesMiddleware from "./middlewares/privileges_middleware.js";

    // 4. Commands (Truncated imports for brevity)
    import PerfilCommand from "./commands/essentials/perfil.js";
    import HelpCommand from "./commands/essentials/help.js";
    import StatusCommand from "./commands/essentials/status.js";
    import QueueCommand from "./commands/matchmaking/queue.js";
    import KissCommand from "./commands/misc/kiss.js";
    import EveryoneTag from "./commands/tags/everyone.js";
    import TestCommand from "./commands/test/test.js";
    
    // Environment Logs
    console.log(`✉️ Starting Bot in ${ENV_IsDev ? "DEV" : "PROD"} mode`);

    /** =================================== MAIN ======================================= */
    
    // 5. Core Bot Initialization
    const Bot = new Whatsbotcord({
      commandPrefix: ["!", "/"],
      tagPrefix: "@",
      defaultEmojiToSendReactionOnFailureCommand: "❌",
      enableCommandSafeNet: true,
      delayMilisecondsBetweenMsgs: 500,
      senderQueueMaxLimit: 12,
    }, new BaileysAdapter({
      credentialsFolder: ENV_AuthFolder,
      loggerMode: "info",
    }));

    /** ============================= Bot configuration =============================== */
    {
      // === Middlewares ===
      Bot.Use_OnCommandFound(ChatTypeValidatorMiddleware());
      Bot.Use_OnCommandFound(CommandPrivilegesMiddleware());

      // ==== Plugins ===
      const plugin = OfficialPlugin_OneCommandPerUserAtATime({
        msgToSend: (_, commandRunning: ICommand, newCommand: ICommand) => {
          return `⏳ You are already running the command '${commandRunning.name}'. Finish or wait before using '${newCommand.name}'.`;
        },
        timeoutSecondsToForgetThem: 60 * 5,
      });
      Bot.Use(plugin);
    }

    // ======================================= Commands =====================================
    {
      // ==== Developer Helpers ====
      if (ENV_IsDev) {
        Bot.Commands.Add(new TestCommand());
      }

      // ===== Core Commands =====
      Bot.Commands.Add(new PerfilCommand());
      Bot.Commands.Add(new HelpCommand());
      Bot.Commands.Add(new StatusCommand());

      // ==== Miscelanea ====
      Bot.Commands.Add(new KissCommand());

      // ==== Matchmaking related ====
      Bot.Commands.Add(new QueueCommand());

      // ======================================= Tags =====================================
      Bot.Commands.Add(new EveryoneTag(), CommandType.Tag);
    }

    async function Main(): Promise<void> {
      // 6. Connect to WhatsApp!
      await Bot.Start();
    }

    Main();
    ```
  </TabItem>
</Tabs>

`

## File: src\content\docs\release-notes.mdx

`mdx
---
title: "WhatsBotCord.js v2.0.0"
description: "Release notes for version 2.0.0"
---

# Release Notes: WhatsBotCord.js v2.0.0

Welcome to version **2.0.0** of **WhatsBotCord.js**.

**Why a major version bump (v2.0.0)?**
In theory, the entire API from the previous version `1.3.0` is compatible (with some deprecations and possible minor changes in imports, nothing too severe). However, in version `2.0.0` the exports are divided by "namespace" (such as `whatsbotcord/testing`, `whatsbotcord/debugging`). This new Sub-path Exports system is what will be considered for future versions, which constitutes a justified architectural *breaking change* to jump to version 2.0.0. Despite this, the new features have been designed to maintain the highest possible compatibility with version 1.3.0.

This version introduces profound architectural changes, a new typed module system to manage Groups and Presence, and a drastic improvement in developer experience (DX) thanks to the new _Sub-path Exports_.

---

## 1. Vendor Adapters Architecture and Unit Testing

The biggest architectural change in this version is the complete abstraction of `Baileys.js`. The bot no longer has a tight coupling with Baileys, but now operates under a **Vendor Adapters** architecture.

### Custom Adapters Injection

Now the main `Whatsbotcord` class accepts an optional second parameter in its constructor that implements the `IWhatsappAdapter` interface. If none is provided, the bot will automatically use the official Baileys adapter (`BaileysAdapter`).

```typescript
import Whatsbotcord, { BaileysAdapter } from "whatsbotcord";
// Optional: Import a custom adapter
// import { MyCustomWhatsappWebJsAdapter } from "./my-adapter";

const bot = new Whatsbotcord({
  commandPrefix: "!",
}, new BaileysAdapter({ credentialsFolder: "./auth" })); // Uses Baileys by default
// const bot = new Whatsbotcord({ commandPrefix: "!" }, new MyCustomWhatsappWebJsAdapter());
```

### Testing Utilities (Mocking)

Thanks to this new abstraction, it is now possible to perform **Unit Testing and E2E Testing** on your bot without needing to scan a QR code or connect to WhatsApp servers. A new testing tool is exposed: `MockAdapter`.

```typescript
import Whatsbotcord, { CommandType } from "whatsbotcord";
import { MockAdapter, ChatMock } from "whatsbotcord/testing";

// 1. Initialize the bot with the mock adapter (starts instantly in memory)
const mockAdapter = new MockAdapter();
const bot = new Whatsbotcord({
  commandPrefix: "!",
}, mockAdapter);

// 2. You can add commands and test them
bot.Commands.AddCommand(CommandType.Normal, {
  name: "ping",
  async run(ctx) {
    await ctx.SendText("pong!");
  },
});

// 3. You can use ChatMock to simulate a real user sending a message
const chatSimulation = new ChatMock(bot.Commands.NormalCommands[0]);
await chatSimulation.StartChatSimulation(); // Simulates sending "!ping"
```

---

## 2. Overview: The New Groups Module

Previously, actions on WhatsApp groups lacked a unified interface. With this update, we have created the **Groups Module**.

**Critical API Changes (General Rules):**

1. **PascalCase:** Following a style similar to C#, all group module methods start with a capital letter (e.g., `GetMetadata`, `AddParticipants`).
2. **Safe Boolean Returns:** Operational actions (such as modifying administrators) no longer return a confusing untyped array. They now return a clear and simple **`Promise<boolean>`**.
3. **Internal Error Handling:** All methods in this module are internally wrapped in `try/catch` blocks. If an operation fails, the method will simply return `false` instead of crashing the bot.

👉 **[Read the complete Groups Module documentation here](/essential_concepts/groups)** to see full code examples on extracting metadata, managing participants, promoting admins, and handling group lifecycles.

---

## 4. New Presence Module (Presence API)

The new **Presence** module has been added to programmatically control the bot's online status and chat activity (typing, recording audio). 

These indicators are fantastic for improving user experience (UX) when a command takes several seconds to execute.

👉 **[Read the complete Presence Module documentation here](/essential_concepts/presence)** to see full code examples on how to correctly and safely trigger the "typing..." and "recording audio..." indicators using the new Wrapper methods (`WithTyping` / `WithRecording`).

---

## 5. Modularization Improvements and "Sub-path Exports"

With version v2.0.0, the library introduces **Sub-path Exports** to improve the developer experience (DX), allowing you to import specific tools without bloating your production application. The main `whatsbotcord` API has not suffered severe compatibility breakages (mostly _non-breaking changes_, though it is considered a _breaking change_ at the modular exports level).

Now you can access specialized modules cleanly:

- **`whatsbotcord/testing`**: Tools for Unit Testing (`MockAdapter`, `ChatMock`, `GenericSocketVendorClient_Mock`).
- **`whatsbotcord/helpers`**: Utility functions such as mention extractors, text formatters, etc.
- **`whatsbotcord/types`**: Pure TypeScript interfaces and types (`ICommand`, `ChatContext`, etc.).
- **`whatsbotcord/debugging`**: Specific debugging utilities (e.g., `Debug_StoreWhatsMsgHistoryInJson`).

**Modularized usage example:**

```typescript
import { WhatsBot } from "whatsbotcord";
import { MockAdapter } from "whatsbotcord/testing";
import type { ICommand } from "whatsbotcord/types";
```

In addition, the codebase was restructured internally:

- Types were moved to the `/src/types/` folder.
- Playground files were moved from the root of `/src` to `/src/playground/`.
- The bundling system now uses `tsdown`, generating optimized _chunks_ without code duplication.


`

## File: src\content\docs\tutorials\waiting-input.mdx

`mdx
---
title: "Receiving User Input"
description: "A comprehensive guide on how to halt commands and wait for user replies dynamically."
---

import { Tabs, TabItem, Steps } from '@astrojs/starlight/components';

One of the most powerful features of WhatsBotCord is the ability to halt command execution and wait for the user to reply. This allows you to build highly interactive, multi-step flows without managing complex external states.

Instead of splitting the code into fragmented pieces, here is a complete, production-ready example of how to wait for user input robustly.

## The Production Pattern: Validation Loops

When receiving input, users might send invalid data, the wrong media type, or simply take too long. The best practice is to wrap the wait logic inside a `while (true)` loop. This allows you to reject bad input and ask again without cancelling the entire command.

<Tabs>
  <TabItem label="TypeScript" icon="seti:typescript">
    ```typescript
    import {
      type AdditionalAPI,
      type CommandArgs,
      type IChatContext,
      type ICommand,
    } from "whatsbotcord";

    export class AskNameCommand implements ICommand {
      public name: string = "askname";
      
      public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
        await ctx.Loading();
        await ctx.SendText("🤖 Hello! Please tell me your first name:");

        let validName: string;

        // The Validation Loop
        while (true) {
          // 1. Wait for a text response for up to 60 seconds
          const result: string | null = await ctx.WaitText({ timeoutSeconds: 60 }); 
          
          // 2. Handle Timeouts
          if (result === null) {
            await ctx.SendText("⏳ You took too long to respond. Please send your name:");
            continue; // Ask again!
          }

          // 3. Handle Validation
          const trimmedName = result.trim();
          if (trimmedName.length < 2) {
            await ctx.SendText("⚠️ That name is too short. Try again:");
            continue; // Ask again!
          }

          // 4. Success! Break the loop
          validName = trimmedName;
          break;
        }

        // 5. Continue execution
        await ctx.SendText(`✅ Nice to meet you, ${validName}!`);
        await ctx.Ok();
      }
    }
    ```
  </TabItem>
</Tabs>

## Breaking Down the Logic

<Steps>

1. **`ctx.WaitText(...)`**
   This is a built-in helper that halts the function's execution until the user replies. By default, it filters out images, audios, or videos, returning only the text content.
   
2. **Handling Timeouts (`null`)**
   If the user does not reply within the `timeoutSeconds` window, the function resolves to `null`. In our loop, we simply catch this `null`, inform the user, and use `continue` to start waiting again.

3. **Validation and `continue`**
   Since we are inside a `while (true)` loop, if the user sends text but it doesn't meet our criteria (e.g., too short, invalid format), we send a warning and use `continue` to jump back to `WaitText()`.

4. **Breaking the Loop**
   Once the input passes all validations, we save the result into our `validName` variable and use `break` to exit the loop and finish the command.

</Steps>

## Waiting for Multimedia (Images, Audio, Video)

Sometimes you don't want text, you want a file. Instead of `WaitText`, you can use `WaitMultimedia`. It works exactly the same way but returns a binary `Buffer` containing the downloaded media.

```typescript
import { MsgType } from "whatsbotcord";

// ... inside your run method ...

await ctx.SendText("🖼️ Please send me an image:");

while(true) {
    // Specify what type of media you are waiting for
    const imgBuffer: Buffer | null = await ctx.WaitMultimedia(MsgType.Image, { 
        timeoutSeconds: 60 
    });

    if (imgBuffer === null) {
        await ctx.SendText("❌ I didn't receive an image in time. Try again:");
        continue;
    }

    // You now have the binary data! You can save it, manipulate it, or send it back.
    await ctx.SendText("✅ Image received! Size: " + imgBuffer.length + " bytes.");
    break;
}
```

> **Note:** Just like `WaitText`, `WaitMultimedia` automatically ignores messages that don't match the requested `MsgType`. If you ask for an `Image` and the user sends text or an audio note, it will gracefully ignore it until they send an actual image or the timeout is reached.

`

