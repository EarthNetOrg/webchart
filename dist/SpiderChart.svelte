<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as d3 from "d3";
  import type { SpiderDataPoint, SpiderChartSeries } from "./types";
  import {
    normalizeData,
    mergeConfig,
    calculateChartDimensions,
    createRadarLineGenerator,
    createRadarAreaGenerator,
    generateColorScale,
    findClosestDataPoint,
  } from "./utils";
  import Tooltip from "./Tooltip.svelte";
  import Breadcrumbs from "./Breadcrumbs.svelte";

  // Props with defaults
  export let data: SpiderDataPoint[] | SpiderChartSeries[] = [];
  export let config = {};
  export let title: string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let rationale: string | undefined = undefined;
  export let width: string | number = "100%";
  export let height: string | number = "100%";
  export let className: string = "";

  // Custom class props with defaults
  export let titleClass: string = "spider-chart-title";
  export let descriptionClass: string = "spider-chart-description";
  export let rationaleClass: string = "spider-chart-rationale";

  // Tooltip customization props
  export let tooltipClass: string = "spider-chart-tooltip";

  // Internal state
  let chartElement: HTMLDivElement;
  let containerWidth = 0;
  let containerHeight = 0;
  let observer: ResizeObserver;
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

  // Navigation state
  let currentSeries: SpiderChartSeries[] = [];
  let navigationPath: SpiderDataPoint[] = [];
  let navigationHistory: SpiderChartSeries[][] = [];

  // Tooltip state
  let tooltipVisible = false;
  let tooltipX = 0;
  let tooltipY = 0;
  let tooltipDataPoint: SpiderDataPoint | null = null;
  let tooltipSeries: SpiderChartSeries | null = null;

  // Reactive declarations
  $: mergedConfig = mergeConfig(config);
  $: normalizedData = normalizeData(data);
  $: currentSeries = navigationPath.length === 0 ? normalizedData : [];

  // Initialize the chart
  function initializeChart() {
    if (!chartElement) return;

    // Clear any existing SVG
    d3.select(chartElement).selectAll("svg").remove();

    // Create SVG element
    svg = d3
      .select(chartElement)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Add shadow filter definition
    const defs = svg.append("defs");

    defs
      .append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%")
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 1)
      .attr("stdDeviation", 2)
      .attr("flood-color", "rgba(0,0,0,0.3)");

    // Create chart group with translation to center
    chartGroup = svg.append("g");

    // Initial render
    updateChart();
  }

  // Update the chart when data or dimensions change
  function updateChart() {
    if (
      !chartElement ||
      !svg ||
      !chartGroup ||
      containerWidth === 0 ||
      containerHeight === 0
    )
      return;

    const { margin } = mergedConfig;
    const dimensions = calculateChartDimensions(
      containerWidth,
      containerHeight,
      margin || { top: 50, right: 50, bottom: 50, left: 50 }
    );

    // Update chart group position
    chartGroup.attr(
      "transform",
      `translate(${(margin || { left: 50 }).left + dimensions.centerX}, ${(margin || { top: 50 }).top + dimensions.centerY})`
    );

    // Get all unique axes from all series
    const allAxes = new Set<string>();
    currentSeries.forEach((series) => {
      series.data.forEach((point) => {
        allAxes.add(point.axis);
      });
    });

    const axesArray = Array.from(allAxes);
    const angleSlice = (Math.PI * 2) / axesArray.length;

    // Draw the circular grid
    drawCircularGrid(dimensions.radius, axesArray, angleSlice);

    // Draw the axes
    drawAxes(dimensions.radius, axesArray, angleSlice);

    // Draw the data series
    drawDataSeries(dimensions.radius, axesArray, angleSlice);
  }

  // Draw the circular grid
  function drawCircularGrid(
    radius: number,
    _axes: string[],
    _angleSlice: number
  ) {
    const { levels, min, max } = mergedConfig;

    // Remove existing grid
    chartGroup.selectAll(".grid-level").remove();

    // Create grid levels
    const gridLevels = d3.range(1, (levels || 5) + 1).map((i: number) => {
      const levelRadius = (radius * i) / (levels || 5);
      const levelValue =
        (min || 0) + (((max || 100) - (min || 0)) * i) / (levels || 5);
      return { radius: levelRadius, value: levelValue };
    });

    // Draw grid circles
    chartGroup
      .selectAll(".grid-level")
      .data(gridLevels)
      .join("circle")
      .attr("class", "grid-level")
      .attr("r", (d: any) => d.radius)
      .attr("fill", "none")
      .attr("stroke", "#ddd")
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-width", 1);

    // Add level labels if enabled
    if (mergedConfig.showLevelLabels) {
      chartGroup
        .selectAll(".level-label")
        .data(gridLevels)
        .join("text")
        .attr("class", "level-label")
        .attr("x", 5)
        .attr("y", (d: any) => -d.radius)
        .attr("font-size", "10px")
        .attr("fill", "#999")
        .text((d: any) => d.value.toFixed(0));
    }
  }

  // Draw the axes
  function drawAxes(radius: number, axes: string[], angleSlice: number) {
    // Remove existing axes
    chartGroup.selectAll(".axis-line").remove();
    chartGroup.selectAll(".axis-label").remove();
    chartGroup.selectAll(".axis-label-box").remove();
    chartGroup.selectAll(".axis-label-text").remove();

    // Draw axis lines
    if (mergedConfig.showAxisLines) {
      chartGroup
        .selectAll(".axis-line")
        .data(axes)
        .join("line")
        .attr("class", "axis-line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr(
          "x2",
          (_: any, i: number) => radius * Math.cos(angleSlice * i - Math.PI / 2)
        )
        .attr(
          "y2",
          (_: any, i: number) => radius * Math.sin(angleSlice * i - Math.PI / 2)
        )
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1);
    }

    // Draw axis labels with boxes
    if (mergedConfig.showAxisLabels) {
      // Find if the axis has children in any series
      const axesWithChildren = new Map<string, boolean>();
      currentSeries.forEach((series) => {
        series.data.forEach((point) => {
          if (point.children && point.children.length > 0) {
            axesWithChildren.set(point.axis, true);
          }
        });
      });

      // Create a group for each axis label
      const labelGroups = chartGroup
        .selectAll(".axis-label")
        .data(axes)
        .join("g")
        .attr("class", "axis-label")
        .attr("transform", (_: any, i: number) => {
          const x = (radius + 10) * Math.cos(angleSlice * i - Math.PI / 2);
          const y = (radius + 10) * Math.sin(angleSlice * i - Math.PI / 2);
          return `translate(${x}, ${y})`;
        });

      // Add background boxes
      labelGroups
        .append("rect")
        .attr("class", "axis-label-box")
        .attr("x", (d: string) => -Math.max(d.length * 3.5, 15) - 4)
        .attr("y", -10 - 4)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("width", (d: string) => Math.max(d.length * 7, 30) + 8)
        .attr("height", 20 + 8)
        .attr("fill", (d: string) =>
          axesWithChildren.has(d) ? "#f8f9fa" : "#ffffff"
        )
        .attr("stroke", (d: string) =>
          axesWithChildren.has(d) ? "#333333" : "#999999"
        )
        .attr("stroke-width", (d: string) =>
          axesWithChildren.has(d) ? 1.5 : 1
        )
        .attr("filter", (d: string) =>
          axesWithChildren.has(d) ? "url(#drop-shadow)" : "none"
        );

      // Add text
      labelGroups
        .append("text")
        .attr("class", "axis-label-text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .attr("fill", (d: string) =>
          axesWithChildren.has(d) ? "#333333" : "#666666"
        )
        .attr("font-weight", (d: string) =>
          axesWithChildren.has(d) ? "bold" : "normal"
        )
        .text((d: string) => d);

      // Add click handlers and styling for axes with children
      labelGroups.each(function (this: any, d: string) {
        const element = this as unknown as SVGGElement;
        const group = d3.select(element);
        const hasChildren = axesWithChildren.has(d);

        // Make all labels have pointer events
        group.style("pointer-events", "all");

        // Find the data point and series for this axis
        let axisDataPoint: SpiderDataPoint | null = null;
        let axisSeries: SpiderChartSeries | null = null;

        for (const [_, series] of currentSeries.entries()) {
          const dataPoint = series.data.find((p) => p.axis === d);
          if (dataPoint) {
            axisDataPoint = dataPoint;
            axisSeries = series;
            break;
          }
        }

        // Add hover effects and tooltip for all labels
        group.on("mouseenter", function (this: any) {
          const el = this as unknown as SVGGElement;

          // Get the position of the label for tooltip positioning
          const transform = el.getAttribute("transform");
          let labelX = 0;
          let labelY = 0;

          if (transform) {
            const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
            if (match && match[1] && match[2]) {
              labelX = parseFloat(match[1]);
              labelY = parseFloat(match[2]);
            }
          }

          // Show tooltip if we have data for this axis
          if (axisDataPoint && axisSeries) {
            tooltipVisible = true;
            tooltipX = labelX;
            tooltipY = labelY;
            tooltipDataPoint = axisDataPoint;
            tooltipSeries = axisSeries;
          }

          // Visual feedback - different for clickable vs non-clickable
          if (hasChildren) {
            d3.select(el)
              .select(".axis-label-box")
              .transition()
              .duration(200)
              .attr("fill", "#e3f2fd");

            d3.select(el)
              .select(".axis-label-text")
              .transition()
              .duration(200)
              .attr("fill", "#0d47a1");
          } else {
            d3.select(el)
              .select(".axis-label-box")
              .transition()
              .duration(200)
              .attr("fill", "#f5f5f5");

            d3.select(el)
              .select(".axis-label-text")
              .transition()
              .duration(200)
              .attr("fill", "#555555");
          }
        });

        group.on("mouseleave", function (this: any) {
          const el = this as unknown as SVGGElement;

          // Hide tooltip
          tooltipVisible = false;

          // Reset visual appearance
          if (hasChildren) {
            d3.select(el)
              .select(".axis-label-box")
              .transition()
              .duration(200)
              .attr("fill", "#f8f9fa");

            d3.select(el)
              .select(".axis-label-text")
              .transition()
              .duration(200)
              .attr("fill", "#333333");
          } else {
            d3.select(el)
              .select(".axis-label-box")
              .transition()
              .duration(200)
              .attr("fill", "#eeeeee");

            d3.select(el)
              .select(".axis-label-text")
              .transition()
              .duration(200)
              .attr("fill", "#666666");
          }
        });

        if (hasChildren) {
          // Set cursor style for the entire group
          group.style("cursor", "pointer");

          // Add click handler
          group.on("click", () => {
            // Find the data point with this axis name
            for (const series of currentSeries) {
              const dataPoint = series.data.find((p) => p.axis === d);
              if (
                dataPoint &&
                dataPoint.children &&
                dataPoint.children.length > 0
              ) {
                navigateToChildren(dataPoint);
                break;
              }
            }
          });
        } else {
          // Set default cursor for non-clickable labels
          group.style("cursor", "default");
        }
      });
    }
  }

  // Draw the data series
  function drawDataSeries(radius: number, axes: string[], angleSlice: number) {
    const { min, max, animationDuration } = mergedConfig;

    // Remove existing paths
    chartGroup.selectAll(".radar-area").remove();
    chartGroup.selectAll(".radar-stroke").remove();
    chartGroup.selectAll(".radar-point").remove();

    // Generate color scale
    const colorScale = generateColorScale(currentSeries);

    // Store all data points for tooltip interaction
    const allPoints: {
      x: number;
      y: number;
      dataPoint: SpiderDataPoint;
      seriesIndex: number;
    }[] = [];

    // Process each series
    currentSeries.forEach((series, seriesIndex) => {
      // Map axes to data points, using 0 for missing values
      const seriesData = axes.map((axis) => {
        const point = series.data.find((d) => d.axis === axis);
        return point || { axis, value: 0 };
      });

      // Create radar line and area generators
      const radarLine = createRadarLineGenerator(
        radius,
        angleSlice,
        min || 0,
        max || 100
      );
      const radarArea = createRadarAreaGenerator(
        radius,
        angleSlice,
        min || 0,
        max || 100
      );

      // Get color and opacity for this series
      const color = series.color || colorScale(seriesIndex);
      const opacity = series.opacity || mergedConfig.opacity || 0.5;

      // Draw radar area
      chartGroup
        .append("path")
        .datum(seriesData)
        .attr("class", "radar-area")
        .attr("d", radarArea as any)
        .attr("fill", color)
        .attr("fill-opacity", 0)
        .transition()
        .duration(animationDuration || 500)
        .attr("fill-opacity", opacity);

      // Draw radar stroke
      chartGroup
        .append("path")
        .datum(seriesData)
        .attr("class", "radar-stroke")
        .attr("d", radarLine as any)
        .attr("stroke", color)
        .attr("stroke-width", mergedConfig.strokeWidth || 2)
        .attr("fill", "none")
        .attr("stroke-opacity", 0)
        .transition()
        .duration(animationDuration || 500)
        .attr("stroke-opacity", 1);

      // Draw data points
      seriesData.forEach((point, i) => {
        // Calculate point position
        const normalizedValue = Math.max(
          0,
          Math.min(1, (point.value - (min || 0)) / ((max || 100) - (min || 0)))
        );
        const pointRadius = radius * normalizedValue;
        const x = pointRadius * Math.cos(angleSlice * i - Math.PI / 2);
        const y = pointRadius * Math.sin(angleSlice * i - Math.PI / 2);

        // Store point data for tooltip
        allPoints.push({ x, y, dataPoint: point, seriesIndex });

        // Draw point
        chartGroup
          .append("circle")
          .attr("class", "radar-point")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 4)
          .attr("fill", color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("opacity", 0)
          .transition()
          .duration(animationDuration || 500)
          .attr("opacity", 1);
      });
    });

    // Add interaction if enabled
    if (mergedConfig.interactive) {
      // Add invisible overlay for mouse interaction
      const overlay = chartGroup.selectAll(".interaction-overlay").data([null]);

      overlay
        .enter()
        .append("circle")
        .attr("class", "interaction-overlay")
        .merge(overlay as any)
        .attr("r", radius + 20)
        .attr("fill", "transparent")
        .attr("pointer-events", "all")
        .on("mousemove", (event: MouseEvent) => {
          const [mouseX, mouseY] = d3.pointer(event);
          const closest = findClosestDataPoint(
            mouseX,
            mouseY,
            currentSeries,
            allPoints
          );

          if (closest) {
            // Find the original point data with coordinates
            const closestPoint = allPoints.find(
              (p) => p.dataPoint === closest.dataPoint
            );

            if (closestPoint) {
              tooltipVisible = true;
              tooltipX = closestPoint.x;
              tooltipY = closestPoint.y;
              tooltipDataPoint = closest.dataPoint;
              tooltipSeries = closest.series || null;
            } else {
              tooltipVisible = false;
            }
          } else {
            tooltipVisible = false;
          }
        })
        .on("mouseleave", () => {
          tooltipVisible = false;
        })
        .on("click", () => {
          if (
            !tooltipVisible ||
            !tooltipDataPoint ||
            !tooltipDataPoint.children
          )
            return;

          // Handle drill-down
          navigateToChildren(tooltipDataPoint);
        });
    }
  }

  // Navigate to children of a data point
  function navigateToChildren(dataPoint: SpiderDataPoint) {
    if (!dataPoint.children || dataPoint.children.length === 0) return;

    // Save current state in history
    navigationHistory.push(currentSeries);

    // Update navigation path
    navigationPath = [...navigationPath, dataPoint];

    // Create new series from children
    currentSeries = [
      {
        name: dataPoint.axis,
        data: dataPoint.children,
      },
    ];

    // Update chart
    updateChart();
  }

  // Navigate to a specific level in the path
  function handleNavigate(index: number) {
    if (index >= navigationPath.length - 1) return;

    // Truncate path
    navigationPath = navigationPath.slice(0, index + 1);

    // Restore series from history
    currentSeries = navigationHistory[index] || [];
    navigationHistory = navigationHistory.slice(0, index);

    // Update chart
    updateChart();
  }

  // Reset to top level
  function handleReset() {
    navigationPath = [];
    navigationHistory = [];
    currentSeries = normalizedData;
    updateChart();
  }

  // Handle resize
  function handleResize(entries: ResizeObserverEntry[]) {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      containerWidth = width;
      containerHeight = height === 0 ? width * 0.75 : height; // Default to 4:3 aspect ratio

      if (svg) {
        svg.attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`);
        updateChart();
      }
    }
  }

  // Lifecycle hooks
  onMount(() => {
    // Initialize with current data
    currentSeries = normalizedData;

    // Set up resize observer
    observer = new ResizeObserver(handleResize);
    observer.observe(chartElement);

    // Initial render after a short delay to ensure container is sized
    setTimeout(() => {
      if (containerWidth === 0) {
        const rect = chartElement.getBoundingClientRect();
        containerWidth = rect.width;
        containerHeight = rect.height === 0 ? rect.width * 0.75 : rect.height;
      }
      initializeChart();
    }, 100);
  });

  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  // Watch for data changes
  $: if (normalizedData && svg) {
    if (navigationPath.length === 0) {
      currentSeries = normalizedData;
      updateChart();
    }
  }
</script>

<div class="spider-chart-container {className}" style:width style:height>
  <Breadcrumbs
    path={navigationPath}
    onNavigate={handleNavigate}
    onReset={handleReset}
    title={title || "Home"}
  />

  {#if title}
    <div class={titleClass}>{title}</div>
  {/if}

  {#if description}
    <div class={descriptionClass}>{description}</div>
  {/if}

  <div class="spider-chart" bind:this={chartElement}></div>

  {#if rationale}
    <div class={rationaleClass}>{rationale}</div>
  {/if}

  <Tooltip
    visible={tooltipVisible}
    x={tooltipX}
    y={tooltipY}
    dataPoint={tooltipDataPoint}
    series={tooltipSeries}
    {tooltipClass}
  />
</div>

<style>
  .spider-chart-container {
    position: relative;
  }

  .spider-chart {
    width: 100%;
    height: 100%;
    min-height: 300px;
  }

  .spider-chart-title {
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 16px;
  }

  .spider-chart-description {
    font-size: 14px;
    color: #666;
    text-align: center;
    margin-bottom: 8px;
    font-style: italic;
  }

  .spider-chart-rationale {
    font-size: 14px;
    color: #666;
    text-align: center;
    margin-top: 16px;
    padding: 8px;
    border-top: 1px solid #eee;
  }

  /* Default tooltip class that can be overridden by user */
  :global(.spider-chart-tooltip) {
    background-color: white;
    color: #333;
  }
</style>
