<script lang="ts">
  import type { SpiderDataPoint } from "./types";

  const {
    path = [],
    onNavigate,
    onReset,
    title = "Home",
    breadcrumbsClass = "breadcrumbs",
    breadcrumbItemClass = "breadcrumb-item",
  } = $props<{
    path: SpiderDataPoint[];
    onNavigate: (index: number) => void;
    onReset: () => void;
    title: string;
    breadcrumbsClass: string;
    breadcrumbItemClass: string;
  }>();

  // Event handlers
  function handleReset() {
    onReset();
  }

  function handleNavigate(index: number) {
    onNavigate(index);
  }
</script>

{#if path.length > 0}
  <div class={breadcrumbsClass}>
    <button
      class="breadcrumb-item"
      onclick={handleReset}
      title="Return to main chart"
    >
      {title}
    </button>

    {#each path.slice(0, path.length - 1) as item, index}
      <span class="separator">›</span>
      <button
        class={breadcrumbItemClass}
        onclick={() => handleNavigate(index)}
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
