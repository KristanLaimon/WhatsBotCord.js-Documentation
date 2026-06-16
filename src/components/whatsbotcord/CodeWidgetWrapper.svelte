<script lang="ts">
  import CodeWidget, {type CodeWidgetProps} from "./CodeWidget/CodeWidget.svelte";
  import type { IMsgWidget } from "./MsgWidget/MsgWidget.ts";
  import { onMount } from "svelte";
  import MsgWidgetStore from "./store/MsgWidgetStore.svelte.ts";

  let {
    initialCode,
    defaultCode,
    onCodeRun,
    width = "100%",
    height = "500px",
    theme = "dark",
    onReady
  }: Omit<CodeWidgetProps, "msgWidget"> & { onReady?: () => void } = $props();

  let msgWidgetToInject = $state<IMsgWidget | undefined>(undefined);

  onMount( ()=> {
    if (MsgWidgetStore.ActiveRef){
      msgWidgetToInject = MsgWidgetStore.ActiveRef;
    }
  })

  $effect(()=> {
    if (MsgWidgetStore.ActiveRef){
      msgWidgetToInject = MsgWidgetStore.ActiveRef;
    }
  });
   
</script>

<div style="height: {height}; width: {width}; min-height: {height}; max-width: 100%; border-radius: 8px; overflow: hidden; border: 1px solid {theme === 'light' ? '#cbd5e1' : 'var(--sl-color-gray-5)'};">
  {#if msgWidgetToInject}
    <CodeWidget 
      initialCode={initialCode} 
      defaultCode={defaultCode}
      msgWidget={msgWidgetToInject} 
      onCodeRun={onCodeRun}
      width="100%"
      height="100%"
      theme={theme}
      onReady={onReady}
    />
  {:else}
    <div style="padding: 2rem; text-align: center; color: {theme === 'light' ? '#475569' : 'var(--sl-color-gray-3)'}; background: {theme === 'light' ? '#f8fafc' : '#1e1e1e'}; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column;">
      <p>Cargando el entorno de chat... Si esto tarda demasiado, recarga la página. @debug: (No se encontró el MsgWidget en donde injectarse)</p>
    </div>
  {/if}
</div>
