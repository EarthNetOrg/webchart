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

  // Props with defaults using Svelte 5 runes syntax
  const {
    data = [],
    config = {},
    title = undefined,
    description = undefined,
    rationale = undefined,
    width = "100%",
    height = "100%",
    className = "",
    titleClass = "spider-chart-title",
    descriptionClass = "spider-chart-description",
    rationaleClass = "spider-chart-rationale",
    breadcrumbsClass = "",
    breadcrumbItemClass = "breadcrumb-item",
    tooltipClass = "spider-chart-tooltip",
  } = $props<{
    data: SpiderDataPoint[] | SpiderChartSeries[];
    config: any;
    title?: string;
    description?: string;
    rationale?: string;
    width: string | number;
    height: string | number;
    className: string;
    titleClass: string;
    descriptionClass: string;
    rationaleClass: string;
    breadcrumbsClass: string;
    breadcrumbItemClass: string;
    tooltipClass: string;
  }>();

  // Internal state
  let chartElement: HTMLDivElement;
  let containerWidth = 0;
  let containerHeight = 0;
  let observer: ResizeObserver;
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

  // Navigation state with $state for reactivity in Svelte 5
  let currentSeries = $state<SpiderChartSeries[]>([]);
  let navigationPath = $state<SpiderDataPoint[]>([]);
  let navigationHistory = $state<SpiderChartSeries[][]>([]);

  // Tooltip state with $state for reactivity in Svelte 5
  let tooltipVisible = $state(false);
  let tooltipX = $state(0);
  let tooltipY = $state(0);
  let tooltipDataPoint = $state<SpiderDataPoint | null>(null);
  let tooltipSeries = $state<SpiderChartSeries | null>(null);

  // Reactive declarations using Svelte 5 runes
  const mergedConfig = $derived(mergeConfig(config));
  const normalizedData = $derived(normalizeData(data));

  // Effect to ensure currentSeries is always populated
  $effect(() => {
    if (navigationPath.length === 0) {
      // At top level, use normalized data
      currentSeries = normalizedData;
    } else if (currentSeries.length === 0 && navigationPath.length > 0) {
      // If we have a navigation path but empty currentSeries, try to rebuild it
      const lastPathItem = navigationPath[navigationPath.length - 1];
      if (lastPathItem) {
        console.log(
          "Rebuilding currentSeries from navigationPath, last item:",
          lastPathItem.axis
        );

        if (lastPathItem.children && lastPathItem.children.length > 0) {
          currentSeries = [
            {
              name: lastPathItem.axis,
              data: JSON.parse(JSON.stringify(lastPathItem.children)),
            },
          ];
        } else {
          console.warn(
            "Last path item has no children, cannot rebuild currentSeries"
          );
        }
      } else {
        console.warn(
          "Navigation path is invalid, cannot rebuild currentSeries"
        );
      }
    }
  });

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
    console.log("Updating chart with currentSeries:", currentSeries);

    if (
      !chartElement ||
      !svg ||
      !chartGroup ||
      containerWidth === 0 ||
      containerHeight === 0
    ) {
      console.error("Cannot update chart: missing elements or dimensions");
      return;
    }

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
    console.log("Axes for chart:", axesArray);

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
        })
        // Make the entire group clickable
        .style("pointer-events", "all")
        .style("cursor", (d: string) =>
          axesWithChildren.has(d) ? "pointer" : "default"
        );

      // Add background boxes - make them larger to increase clickable area
      labelGroups
        .append("rect")
        .attr("class", "axis-label-box")
        .attr("x", (d: string) => -Math.max(d.length * 3.5, 15) - 8)
        .attr("y", -10 - 8)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("width", (d: string) => Math.max(d.length * 7, 30) + 16)
        .attr("height", 20 + 16)
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

      // Add click handlers directly to the label groups
      labelGroups
        .filter((d: string) => axesWithChildren.has(d))
        .on("click", function (event: MouseEvent, d: string) {
          console.log("Label click on axis:", d);
          event.stopPropagation();

          // Find the data point with this axis name
          let dataPoint = null;
          let foundDataPoint = false;

          for (const series of currentSeries) {
            dataPoint = series.data.find((p) => p.axis === d);

            if (dataPoint) {
              foundDataPoint = true;

              if (dataPoint.children && dataPoint.children.length > 0) {
                console.log("Children found:", dataPoint.children.length);

                // Call custom onClick handler if it exists
                if (typeof dataPoint.onClick === "function") {
                  console.log("Calling custom onClick handler");
                  const result = dataPoint.onClick();
                  if (result === false) {
                    return; // Skip navigation if handler returns false
                  }
                }

                console.log("Proceeding with navigation to children");
                navigateToChildren(dataPoint);
                break;
              }
            }
          }

          if (!foundDataPoint) {
            console.log("No data point found with axis:", d);
          }
        });

      // Apply hover effects to all label groups
      labelGroups.each(function (this: any, d: string) {
        const element = this as unknown as SVGGElement;
        const group = d3.select(element);
        const hasChildren = axesWithChildren.has(d);

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
  export function navigateToChildren(dataPoint: SpiderDataPoint) {
    console.log("Navigating to children of:", dataPoint.axis);

    if (!dataPoint) {
      console.error("Cannot navigate: dataPoint is null or undefined");
      return;
    }

    if (!dataPoint.children || dataPoint.children.length === 0) {
      console.log("No children to navigate to for:", dataPoint.axis);
      return;
    }

    console.log(
      "Navigation path before:",
      navigationPath.map((p) => p.axis)
    );

    // Save current state in history
    navigationHistory.push(JSON.parse(JSON.stringify(currentSeries)));

    // Update navigation path
    navigationPath = [...navigationPath, dataPoint];
    console.log(
      "Navigation path after:",
      navigationPath.map((p) => p.axis)
    );

    // Create new series from children
    const newSeries = {
      name: dataPoint.axis,
      data: JSON.parse(JSON.stringify(dataPoint.children)),
    };

    console.log("Children data length:", newSeries.data.length);

    // Ensure the children data is valid
    if (!newSeries.data || newSeries.data.length === 0) {
      console.error("Children data is empty or invalid");
      return;
    }

    // Update current series
    currentSeries = [newSeries];

    // Update chart immediately
    updateChart();
  }

  // Navigate to a specific level in the path
  export function handleNavigate(index: number) {
    console.log(
      "Navigating to index:",
      index,
      "current path length:",
      navigationPath.length
    );

    if (index >= navigationPath.length - 1) {
      console.log("Invalid navigation index");
      return;
    }

    // Store the new path before making other changes
    const newPath = navigationPath.slice(0, index + 1);
    console.log(
      "New navigation path:",
      newPath.map((p) => p.axis)
    );

    // Special case: if we're navigating to Support directly
    if (newPath.length > 0 && newPath[newPath.length - 1].axis === "Support") {
      console.log("Special handling for Support navigation");

      // Find Support in the original data
      const supportSeries = normalizedData.find((series) =>
        series.data.some((point) => point.axis === "Support")
      );

      if (supportSeries) {
        const supportPoint = supportSeries.data.find(
          (point) => point.axis === "Support"
        );

        if (supportPoint && supportPoint.children) {
          console.log(
            "Found Support point in original data, using its children"
          );

          // Set the navigation path
          navigationPath = newPath;

          // Create a new series from the Support children
          currentSeries = [
            {
              name: "Support",
              data: JSON.parse(JSON.stringify(supportPoint.children)),
            },
          ];

          // Update history
          navigationHistory = navigationHistory.slice(0, index);

          // Force update the chart
          setTimeout(() => updateChart(), 50);
          return;
        }
      }
    }

    // Restore series from history
    if (index < 0) {
      // Reset to top level
      navigationPath = [];
      navigationHistory = [];
      currentSeries = JSON.parse(JSON.stringify(normalizedData));
    } else {
      // Set the path first to ensure reactivity works correctly
      navigationPath = newPath;

      // Try to find the data for this level directly from the original data
      const lastPathItem = newPath[newPath.length - 1];
      if (lastPathItem) {
        console.log("Looking for data for:", lastPathItem.axis);

        // Try to find this item in the original data
        let foundOriginalData = false;

        // If it's a top-level item
        if (newPath.length === 1) {
          // Just use normalized data
          currentSeries = JSON.parse(JSON.stringify(normalizedData));
          foundOriginalData = true;
        } else if (newPath.length > 1) {
          // It's a nested item, try to find its parent
          const parentItem = newPath[newPath.length - 2];
          console.log("Looking for parent item:", parentItem.axis);

          // Find the parent in the original data
          for (const series of normalizedData) {
            const parentPoint = series.data.find(
              (p) => p.axis === parentItem.axis
            );
            if (parentPoint && parentPoint.children) {
              // Found the parent, now find the current item
              const currentPoint = parentPoint.children.find(
                (p) => p.axis === lastPathItem.axis
              );
              if (currentPoint && currentPoint.children) {
                console.log("Found item in original data:", currentPoint.axis);

                // Create a new series from the children
                currentSeries = [
                  {
                    name: currentPoint.axis,
                    data: JSON.parse(JSON.stringify(currentPoint.children)),
                  },
                ];

                foundOriginalData = true;
                break;
              }
            }
          }
        }

        // If we couldn't find the data in the original data, try the history
        if (!foundOriginalData) {
          console.log("Could not find data in original data, trying history");

          if (index < navigationHistory.length) {
            const historySeries = navigationHistory[index];
            if (historySeries && historySeries.length > 0) {
              console.log("Restoring series from history at index:", index);

              // Deep clone to avoid reference issues
              currentSeries = JSON.parse(JSON.stringify(historySeries));

              // Only truncate history up to the index we're navigating to
              navigationHistory = navigationHistory.slice(0, index);

              console.log("Current series after restore:", currentSeries);
            } else {
              console.warn(
                "History entry is undefined or empty at index:",
                index
              );
              rebuildSeriesFromPath(newPath);
            }
          } else {
            console.warn(
              "History index out of bounds:",
              index,
              "history length:",
              navigationHistory.length
            );
            rebuildSeriesFromPath(newPath);
          }
        } else {
          // We found the data in the original data, update history
          navigationHistory = navigationHistory.slice(0, index);
        }
      } else {
        console.warn("No last path item found, using fallback");
        rebuildSeriesFromPath(newPath);
      }
    }

    // Force a redraw of the chart after a short delay to ensure state is updated
    setTimeout(() => {
      console.log("Forcing chart update after navigation");
      updateChart();
    }, 50);
  }

  // Helper function to rebuild series from path
  function rebuildSeriesFromPath(path: SpiderDataPoint[]) {
    if (path.length === 0) {
      currentSeries = JSON.parse(JSON.stringify(normalizedData));
      return;
    }

    // Get the last item in the path
    const lastPathItem = path[path.length - 1];
    if (lastPathItem && lastPathItem.children) {
      console.log("Rebuilding series from last path item:", lastPathItem.axis);

      // Try to find the original data point in the normalized data to ensure we have all properties
      let originalDataPoint = null;

      // Search through all series in normalized data
      for (const series of normalizedData) {
        // First check if it's in the top level
        const topLevelMatch = series.data.find(
          (p) => p.axis === lastPathItem.axis
        );
        if (topLevelMatch) {
          originalDataPoint = topLevelMatch;
          break;
        }

        // If not found at top level, search through children recursively
        for (const point of series.data) {
          if (point.children) {
            const foundPoint = findPointInChildren(
              point.children,
              lastPathItem.axis
            );
            if (foundPoint) {
              originalDataPoint = foundPoint;
              break;
            }
          }
        }

        if (originalDataPoint) break;
      }

      // Use the original data point if found, otherwise use the path item
      const dataToUse = originalDataPoint || lastPathItem;

      // Ensure we have children data before creating the series
      if (dataToUse.children && dataToUse.children.length > 0) {
        currentSeries = [
          {
            name: dataToUse.axis,
            data: JSON.parse(JSON.stringify(dataToUse.children)),
          },
        ];
        console.log(
          "Rebuilt series from navigation path as fallback, data length:",
          currentSeries[0].data.length
        );
      } else {
        console.error("Data point has no children, cannot rebuild series");
        // Fallback to normalized data if we can't rebuild
        currentSeries = JSON.parse(JSON.stringify(normalizedData));
      }
    } else {
      console.error("Could not rebuild series, navigation may be incomplete");
      // Fallback to normalized data
      currentSeries = JSON.parse(JSON.stringify(normalizedData));
    }
  }

  // Helper function to find a data point in children by axis name
  function findPointInChildren(
    children: SpiderDataPoint[],
    axisName: string
  ): SpiderDataPoint | null {
    for (const child of children) {
      if (child.axis === axisName) {
        return child;
      }

      if (child.children) {
        const found = findPointInChildren(child.children, axisName);
        if (found) return found;
      }
    }

    return null;
  }

  // Reset to top level
  export function handleReset() {
    console.log("Resetting to top level");
    navigationPath = [];
    navigationHistory = [];
    currentSeries = JSON.parse(JSON.stringify(normalizedData));
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

  // Test function to directly navigate to a specific data point
  export function testNavigateToDocumentation() {
    console.log("Test navigation to Documentation");

    // First navigate to Support
    const supportSeries = normalizedData.find((series) =>
      series.data.some((point) => point.axis === "Support")
    );

    if (!supportSeries) {
      console.error("Support series not found in normalizedData");
      console.log(
        "Available series:",
        normalizedData.map((s) => s.name)
      );
      return;
    }

    const supportPoint = supportSeries.data.find(
      (point) => point.axis === "Support"
    );

    if (!supportPoint) {
      console.error("Support point not found");
      console.log(
        "Available points in series:",
        supportSeries.data.map((p) => p.axis)
      );
      return;
    }

    console.log("Found Support point:", supportPoint);

    // Reset to top level first to ensure clean navigation
    handleReset();

    // Wait a moment for the reset to complete
    setTimeout(() => {
      // Navigate to Support
      navigateToChildren(supportPoint);

      // Wait for navigation to complete
      setTimeout(() => {
        // Now find Documentation in the current series
        if (!currentSeries || currentSeries.length === 0) {
          console.error("Current series is empty after navigating to Support");
          return;
        }

        // Make sure currentSeries[0] exists before accessing its properties
        if (!currentSeries[0]) {
          console.error("First series is undefined");
          return;
        }

        console.log(
          "Current series data:",
          currentSeries[0].data.map((p) => p.axis)
        );

        const docPoint = currentSeries[0].data.find(
          (point) => point.axis === "Documentation"
        );

        if (!docPoint) {
          console.error("Documentation point not found in current series");
          console.log(
            "Available points:",
            currentSeries[0].data.map((p) => p.axis)
          );

          // Try to find any point that contains "Documentation" in its name
          const fuzzyDocPoint = currentSeries[0].data.find((point) =>
            point.axis.includes("Documentation")
          );

          if (fuzzyDocPoint) {
            console.log(
              "Found a fuzzy match for Documentation:",
              fuzzyDocPoint.axis
            );
            console.log("Navigating to fuzzy match");
            navigateToChildren(fuzzyDocPoint);
          } else {
            console.error("No Documentation-like point found");
          }

          return;
        }

        console.log("Found Documentation point:", docPoint);

        // Navigate to Documentation
        navigateToChildren(docPoint);
      }, 300);
    }, 100);
  }

  // Force an update of the chart
  export function forceUpdate() {
    console.log("Forcing chart update");
    updateChart();
  }
</script>

<div class="spider-chart-container {className}" style:width style:height>
  <Breadcrumbs
    path={navigationPath}
    onNavigate={handleNavigate}
    onReset={handleReset}
    title={title || "Home"}
    {breadcrumbsClass}
    {breadcrumbItemClass}
  />

  {#if title}
    <div class={titleClass}>
      {#if navigationPath.length > 0}
        {navigationPath[navigationPath.length - 1]?.axis || title}
      {:else}
        {title}
      {/if}
    </div>
  {/if}

  {#if description}
    <div class={descriptionClass}>
      {#if navigationPath.length > 0}
        Viewing details for {navigationPath[navigationPath.length - 1]?.axis ||
          ""}
      {:else}
        {description}
      {/if}
    </div>
  {/if}

  <div class="spider-chart" bind:this={chartElement}></div>

  {#if rationale}
    <div class={rationaleClass}>
      {#if navigationPath.length > 0}
        {navigationPath[navigationPath.length - 1]?.rationale || rationale}
      {:else}
        {rationale}
      {/if}
    </div>
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
