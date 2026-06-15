# Documentación: Componentes del Playground de Whatsbotcord

Este documento explica cómo utilizar los componentes `MsgWidget` y `CodeWidget` para crear un entorno de pruebas interactivo (playground) para bots de WhatsApp construidos con `whatsbotcord`.

## Componentes Principales

El playground se compone de dos widgets principales que trabajan en conjunto:

### 1. `MsgWidget`
Es la interfaz visual de chat que simula la apariencia de WhatsApp Web. Permite a los usuarios interactuar enviando mensajes, visualizando burbujas de texto, multimedia, y reacciones.

**Propiedades importantes:**
- `chats`: Un arreglo de objetos `Chat` que define las conversaciones disponibles en la barra lateral.
- `height` y `width`: Dimensiones del widget.
- `bind:this`: Permite exponer la referencia del componente para que el simulador interno pueda enviar mensajes a la interfaz.

### 2. `CodeWidget`
Es el editor de código integrado (basado en Monaco Editor) que permite escribir código de `whatsbotcord` en TypeScript/JavaScript, compilarlo en tiempo real, y ejecutarlo dentro del navegador.

**Propiedades importantes:**
- `initialCode`: El código fuente (string) que aparecerá por defecto en el editor.
- `msgWidget`: Recibe la referencia instanciada del `MsgWidget`. El simulador necesita esta referencia para interceptar y enrutar correctamente la red (enviar/recibir mensajes simulados entre el bot y el widget visual).
- `width`: El ancho del widget (CSS string, por ejemplo `"100%"` o `"500px"`). Por defecto `"100%"`.
- `height`: El alto del widget (CSS string, por ejemplo `"500px"` o `"100vh"`). Por defecto `"100%"`.
- `theme`: El tema visual del editor y la consola (`"light"` para tema claro o `"dark"` para tema oscuro). Por defecto `"dark"`.

## Ejemplo de Uso (`App.svelte`)

A continuación se muestra un ejemplo completo de cómo integrar ambos componentes en tu aplicación Svelte. En este ejemplo, dividimos la pantalla a la mitad: el chat a la izquierda y el código a la derecha.

```svelte
<script lang="ts">
  import MsgWidget from "./Whatsbotcord/MsgWidget/MsgWidget.svelte";
  import CodeWidget from "./Whatsbotcord/CodeWidget/CodeWidget.svelte";
  import type { Chat } from "./Whatsbotcord/MsgWidget/MsgWidget.js";

  // Referencias a los componentes instanciados
  let msgWidgetRef: ReturnType<typeof MsgWidget>;
  let codeWidgetRef: ReturnType<typeof CodeWidget>;

  // 1. Definimos los chats iniciales del simulador
  export const initialChats: Chat[] = [
    {
      id: 9,
      name: "Bot User (Individual)",
      preview: "Say something to the bot!",
      time: "Now",
      unread: 0,
      IsWhatsbotCordHere: true, // Indica que el bot escucha este chat
      isGroup: false,
      IsUniquePrivateChatWithBot: true, // Se usa para simular el chat privado directo con el usuario
      messages: [
        { id: 1, type: "date-divider", text: "Today" },
        { id: 2, type: "system", text: "This is a private chat with the bot." },
      ],
    },
    {
      id: 10,
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

  // 2. Definimos el código por defecto del editor
  // Importante: Escapar correctamente los backticks (\`) y los signos de interpolación (\$)
  const INITIAL_CODE = \`import Whatsbotcord, { type AdditionalAPI, type CommandArgs, type IChatContext, type ICommand } from "whatsbotcord";

const bot = new Whatsbotcord({
  commandPrefix: "!",
  tagPrefix: "@",
});

class PingCommand implements ICommand {
  name: string = "ping";
  aliases?: string[] | undefined = ["p"];
  public async run(ctx: IChatContext, api: AdditionalAPI, args: CommandArgs): Promise<void> {
    const privateMsg = await api.InternalSocket.Send.Text(
      args.participantIdPN!, 
      "Replying privately as you requested..."
    );

    const privateCtx = ctx.CloneButTargetedToWithInitialMsg({ initialMsg: privateMsg! });
    await privateCtx.SendText(\\\`Hi \\\${args.originalRawMsg.pushName}, here is your private info!\\\`);
  }
}

bot.Commands.Add(new PingCommand());
bot.Start();\`;

</script>

<div class="app-layout">
  <!-- Widget Visual (Chat) -->
  <section class="widget-section" style="flex: 1; max-width: 50%;">
    <MsgWidget 
      bind:this={msgWidgetRef}
      chats={initialChats} 
      height="100%" 
      width="100%" 
    />
  </section>

  <!-- Widget de Código (Editor) -->
  <!-- Requiere la referencia msgWidgetRef para conectar la API del bot -->
  <section class="widget-section code-section" style="flex: 1; max-width: 50%;">
    <CodeWidget 
      bind:this={codeWidgetRef}
      initialCode={INITIAL_CODE} 
      msgWidget={msgWidgetRef} 
    />
  </section>
</div>

<style>
  .app-layout {
    display: flex;
    flex-direction: row;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #111b21;
  }
  .widget-section {
    display: flex;
    height: 100%;
    position: relative;
  }
</style>
```

## Detalles de Implementación

1. **El Enlace de Componentes:** Observa cómo `MsgWidget` se enlaza a `msgWidgetRef` usando la directiva `bind:this`. Luego, esta misma referencia se pasa como prop al `CodeWidget`. Esto es crucial porque el `CodeWidget` implementa un simulador interno (`MsgWidgetAdapter`) que utiliza los métodos expuestos por el componente del chat (como `pushExternalMessage` o `addReaction`) para actualizar la UI visual con las respuestas del código que estás programando.
2. **Reacciones y Estados:** Los componentes simulan fidedignamente características como notificaciones de mensajes no leídos (actualizando un contador en el chat inactivo), tipos de mensajes, identificadores de grupo, y soporte directo para renderizar un arreglo de `reactions` en tiempo real.
3. **Escapado de Código:** Si el código TypeScript dentro del `INITIAL_CODE` usa *template literals* (texto entre *backticks*), siempre debes recordar escapar esos caracteres y el símbolo de dólar para evitar romper el formato en tu componente Svelte padre.
