<script lang="ts">
  import type { SpiderDataPoint } from "./types";

  export let path: SpiderDataPoint[] = [];
  export let onNavigate: (index: number) => void;
  export let onReset: () => void;
</script>

{#if path.length > 0}
  <div class="breadcrumbs">
    <button
      class="breadcrumb-item home"
      on:click={onReset}
      title="Return to main chart"
    >
      Home
    </button>

    {#each path as item, index}
      <span class="separator">›</span>
      <button
        class="breadcrumb-item {index === path.length - 1 ? 'active' : ''}"
        on:click={() => onNavigate(index)}
        title={item.description || item.axis}
      >
        {item.axis}
      </button>
    {/each}
  </div>
{/if}

<style>
  .breadcrumbs {
    display: flex;
    align-items: center;
    font-size: 12px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .breadcrumb-item {
    background: none;
    border: none;
    padding: 4px 8px;
    cursor: pointer;
    color: #666;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .breadcrumb-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #333;
  }

  .breadcrumb-item.active {
    font-weight: bold;
    color: #333;
    cursor: default;
  }

  .breadcrumb-item.active:hover {
    background-color: transparent;
  }

  .breadcrumb-item.home {
    color: #2196f3;
  }

  .separator {
    margin: 0 4px;
    color: #ccc;
  }
</style>
