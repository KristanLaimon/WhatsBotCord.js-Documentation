<script lang="ts">
  let active = $state(false);

  function toggle() {
    active = !active;
    window.dispatchEvent(new CustomEvent('toggle-widget', { detail: active }));
    // Actualizamos el DOM directamente para evitar problemas de contextos entre Astro/Svelte
    const tocs = document.querySelectorAll('.right-sidebar-toc');
    const widgets = document.querySelectorAll('.right-sidebar-widget');
    tocs.forEach(toc => {
      (toc as HTMLElement).style.display = active ? 'none' : 'block';
    });
    widgets.forEach(widget => {
      (widget as HTMLElement).style.display = active ? 'block' : 'none';
    });
  }
</script>

<button 
  class="widget-toggle-btn {active ? 'active' : ''}" 
  onclick={toggle}
  aria-label="Toggle Playground"
  title="Toggle Playground"
>
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
</button>

<style>
  .widget-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--sl-color-gray-5);
    color: var(--sl-color-text);
    border-radius: 6px;
    padding: 0.4rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .widget-toggle-btn:hover {
    background: var(--sl-color-gray-6);
    color: var(--sl-color-accent);
  }
  .widget-toggle-btn.active {
    background: var(--sl-color-accent-low);
    color: var(--sl-color-accent);
    border-color: var(--sl-color-accent);
  }
</style>
