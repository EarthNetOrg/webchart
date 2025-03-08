<script lang="ts">
  import type { SpiderDataPoint } from "./types";

  export let path: SpiderDataPoint[] = [];
  export let onNavigate: (index: number) => void;
  export let onReset: () => void;
  export let title: string = "Home";
  export let breadcrumbsClass: string = "breadcrumbs";
  export let breadcrumbItemClass: string = "breadcrumb-item";
</script>

{#if path.length > 0}
  <div class={breadcrumbsClass}>
    <button
      class="breadcrumb-item"
      on:click={onReset}
      title="Return to main chart"
    >
      {title}
    </button>

    {#each path as item, index}
      <span class="separator">›</span>
      <button
        class="{breadcrumbItemClass} {index === path.length - 1
          ? 'active'
          : ''}"
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
    border-radius: 4px;
    transition: background-color 0.2s;
  }
  .breadcrumb-item.active {
    font-weight: bold;
    cursor: default;
  }

  .breadcrumb-item.active:hover {
    background-color: transparent;
  }

  .separator {
    margin: 0 4px;
    opacity: 0.5;
  }
</style>
