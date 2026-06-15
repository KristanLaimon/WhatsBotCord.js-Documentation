<script lang="ts">
  type ConsoleLog = { type: "log" | "warn" | "error", message: string, time: string };

  let {
    consoleLogs,
    isConsoleCollapsed = $bindable(),
    consoleHeight
  }: {
    consoleLogs: ConsoleLog[];
    isConsoleCollapsed: boolean;
    consoleHeight: number;
  } = $props();
</script>

<div class="console-panel" style="height: {isConsoleCollapsed ? '32px' : consoleHeight + 'px'}">
  <div class="console-header">
    <span>Console Output</span>
    <button class="collapse-btn" onclick={() => isConsoleCollapsed = !isConsoleCollapsed} aria-label="Toggle Console">
      {isConsoleCollapsed ? "▲" : "▼"}
    </button>
  </div>
  {#if !isConsoleCollapsed}
    <div class="console-logs">
      {#each consoleLogs as log}
        <div class="log-entry log-{log.type}">
          <span class="log-time">[{log.time}]</span>
          <span class="log-message">{log.message}</span>
        </div>
      {/each}
      {#if consoleLogs.length === 0}
        <div class="log-entry log-log" style="color: #666; font-style: italic;">No logs yet...</div>
      {/if}
    </div>
  {/if}
</div>
