<script lang="ts">
  import type { SpiderDataPoint, SpiderChartSeries } from "./types";
  import { onMount } from "svelte";

  export let visible = false;
  export let x = 0;
  export let y = 0;
  export let dataPoint: SpiderDataPoint | null = null;
  export let series: SpiderChartSeries | null = null;
  export let tooltipClass: string = "spider-chart-tooltip";

  // Reference to the chart container
  let chartContainer: HTMLElement | null = null;

  // Variables to store adjusted positions
  let adjustedX = 0;
  let adjustedY = 0;

  // Browser check
  let isBrowser = false;

  onMount(() => {
    isBrowser = true;
    // Find the chart container
    chartContainer = document.querySelector(".spider-chart");
    updatePositions();
  });

  // Update positions when coordinates change
  function updatePositions() {
    if (isBrowser && visible && chartContainer) {
      // Get the SVG element's position
      const svgRect = chartContainer.getBoundingClientRect();

      // Get the chart group's transform
      const chartGroup = chartContainer.querySelector("g");
      let offsetX = 0;
      let offsetY = 0;

      if (chartGroup) {
        const transform = chartGroup.getAttribute("transform");
        if (transform) {
          const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
          if (match && match[1] && match[2]) {
            offsetX = parseFloat(match[1]);
            offsetY = parseFloat(match[2]);
          }
        }
      }

      // Convert SVG coordinates to screen coordinates
      const screenX = svgRect.left + offsetX + x + 15; // Add a small offset
      const screenY = svgRect.top + offsetY + y;

      // Ensure tooltip stays within viewport
      adjustedX = Math.min(
        screenX,
        typeof window !== "undefined" ? window.innerWidth - 200 : screenX
      );
      adjustedY = Math.min(
        screenY,
        typeof window !== "undefined" ? window.innerHeight - 100 : screenY
      );
    } else {
      adjustedX = 0;
      adjustedY = 0;
    }
  }

  $: if (visible || x || y) updatePositions();
</script>

{#if visible && dataPoint && series}
  <div
    class="tooltip {tooltipClass}"
    style:left="{adjustedX}px"
    style:top="{adjustedY}px"
  >
    <div class="tooltip-header">
      <span class="series-name">{dataPoint.axis}</span>
    </div>

    <div class="tooltip-content">
      {#if dataPoint.description}
        <div class="axis-description">{dataPoint.description}</div>
      {/if}
      <div class="axis-value">{dataPoint.value}</div>
      {#if dataPoint.rationale}
        <div class="axis-rationale">{dataPoint.rationale}</div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .tooltip {
    position: fixed; /* Changed from absolute to fixed */
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    padding: 8px;
    pointer-events: none;
    z-index: 1000;
    min-width: 150px;
    max-width: 250px;
    font-size: 12px;
    transform: translate(0, -50%); /* Adjusted to center vertically */
    background-color: white; /* Default background color */
  }

  .tooltip-header {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    padding-bottom: 4px;
    border-bottom: 1px solid #eee;
  }

  .series-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 8px;
  }

  .series-name {
    font-weight: bold;
  }

  .tooltip-content {
    margin-bottom: 8px;
  }

  .axis-name {
    font-weight: bold;
    margin-bottom: 4px;
  }

  .axis-value {
    margin-top: 4px;
    font-size: 18px;
    font-weight: bold;
    color: #333; /* Default text color */
  }

  .axis-description {
    margin-top: 4px;
    color: #666;
    font-style: italic;
  }

  .axis-rationale {
    margin-top: 4px;
    color: #666;
    padding-top: 4px;
    border-top: 1px dotted #eee;
  }

  .tooltip-footer {
    font-size: 10px;
    color: #666;
    text-align: center;
    padding-top: 4px;
    border-top: 1px solid #eee;
  }

  .drill-down-hint {
    display: inline-block;
    font-style: italic;
  }

  /* Default tooltip class */
  .spider-chart-tooltip {
    background-color: white;
    color: #333;
  }

  /* The tooltip class will override these defaults */
</style>
