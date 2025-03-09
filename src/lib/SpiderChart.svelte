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
    value = undefined,
    width = "",
    height = "",
    containerClass = "",
    chartClass = "spider-chart",
    titleClass = "",
    descriptionClass = "",
    rationaleClass = "",
    valueClass = "",
    breadcrumbsClass = "",
    breadcrumbItemClass = "breadcrumb-item",
    tooltipClass = "spider-chart-tooltip",
    min = 0,
    max = 100,
  } = $props<{
    data: SpiderDataPoint[] | SpiderChartSeries[];
    config?: any;
    title?: string;
    description?: string;
    rationale?: string;
    value?: string | number;
    width?: string | number;
    height?: string | number;
    containerClass?: string;
    chartClass?: string;
    titleClass?: string;
    descriptionClass?: string;
    rationaleClass?: string;
    valueClass?: string;
    breadcrumbsClass?: string;
    breadcrumbItemClass?: string;
    tooltipClass?: string;
    min?: number;
    max?: number;
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
  const mergedConfig = $derived(mergeConfig({ ...config, min, max }));
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
    try {
      if (!chartElement) {
        console.error("Cannot initialize chart: chartElement is null");
        return;
      }

      // Ensure we have valid dimensions
      if (containerWidth <= 0 || containerHeight <= 0) {
        console.error(
          "Invalid container dimensions:",
          containerWidth,
          containerHeight
        );
        containerWidth = containerWidth <= 0 ? 400 : containerWidth;
        containerHeight = containerHeight <= 0 ? 300 : containerHeight;
      }

      // Clear any existing SVG
      try {
        d3.select(chartElement).selectAll("svg").remove();
      } catch (e) {
        console.error("Error clearing existing SVG:", e);
      }

      // Create SVG element
      try {
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
      } catch (e) {
        console.error("Error creating SVG element:", e);
        return;
      }

      // Initial render
      try {
        updateChart();
      } catch (e) {
        console.error("Error in initial updateChart call:", e);
      }
    } catch (error) {
      console.error("Error in initializeChart:", error);
    }
  }

  // Update the chart when data or dimensions change
  function updateChart() {
    try {
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

      // Ensure we have valid dimensions to prevent errors
      if (
        isNaN(containerWidth) ||
        isNaN(containerHeight) ||
        containerWidth < 0 ||
        containerHeight < 0 ||
        containerWidth > 10000 ||
        containerHeight > 10000
      ) {
        console.error(
          "Invalid container dimensions:",
          containerWidth,
          containerHeight
        );
        return;
      }

      const { margin } = mergedConfig;
      const dimensions = calculateChartDimensions(
        containerWidth,
        containerHeight,
        margin || { top: 50, right: 50, bottom: 50, left: 50 }
      );

      // Validate dimensions to prevent errors
      if (dimensions.radius <= 0 || isNaN(dimensions.radius)) {
        console.error("Invalid radius:", dimensions.radius);
        return;
      }

      // Force a reflow to ensure the container has the correct dimensions
      chartElement.getBoundingClientRect();

      // Update chart group position
      chartGroup.attr(
        "transform",
        `translate(${(margin || { left: 50 }).left + dimensions.centerX}, ${(margin || { top: 50 }).top + dimensions.centerY})`
      );

      // Get all unique axes from all series
      const allAxes = new Set<string>();
      currentSeries.forEach((series) => {
        if (series && series.data && Array.isArray(series.data)) {
          series.data.forEach((point) => {
            if (point && point.axis) {
              allAxes.add(point.axis);
            }
          });
        }
      });

      const axesArray = Array.from(allAxes);

      // Ensure we have at least one axis
      if (axesArray.length === 0) {
        console.warn("No axes found in data");
        return;
      }

      const angleSlice = (Math.PI * 2) / axesArray.length;

      // Draw the circular grid
      drawCircularGrid(dimensions.radius, axesArray, angleSlice);

      // Draw the axes
      drawAxes(dimensions.radius, axesArray, angleSlice);

      // Draw the data series
      drawDataSeries(dimensions.radius, axesArray, angleSlice);
    } catch (error) {
      console.error("Error updating chart:", error);
      // Try to recover by clearing and reinitializing
      try {
        if (chartElement) {
          d3.select(chartElement).selectAll("*").remove();
        }
      } catch (e) {
        console.error("Error during recovery:", e);
      }
    }
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
    try {
      // Remove existing axes
      chartGroup.selectAll(".axis-line").remove();
      chartGroup.selectAll(".axis-label").remove();
      chartGroup.selectAll(".axis-label-box").remove();
      chartGroup.selectAll(".axis-label-text").remove();

      // Draw axis lines
      if (mergedConfig.showAxisLines) {
        try {
          chartGroup
            .selectAll(".axis-line")
            .data(axes)
            .join("line")
            .attr("class", "axis-line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr(
              "x2",
              (_: any, i: number) =>
                radius * Math.cos(angleSlice * i - Math.PI / 2)
            )
            .attr(
              "y2",
              (_: any, i: number) =>
                radius * Math.sin(angleSlice * i - Math.PI / 2)
            )
            .attr("stroke", "#ddd")
            .attr("stroke-width", 1);
        } catch (e) {
          console.error("Error drawing axis lines:", e);
        }
      }

      // Draw axis labels with boxes
      if (mergedConfig.showAxisLabels) {
        try {
          // Find if the axis has children in any series
          const axesWithChildren = new Map<string, boolean>();
          currentSeries.forEach((series) => {
            if (series && series.data && Array.isArray(series.data)) {
              series.data.forEach((point) => {
                if (point && point.children && point.children.length > 0) {
                  axesWithChildren.set(point.axis, true);
                }
              });
            }
          });

          // Create a group for each axis label
          const labelGroups = chartGroup
            .selectAll(".axis-label")
            .data(axes)
            .join("g")
            .attr("class", "axis-label")
            .attr("transform", (_: any, i: number) => {
              const x = (radius + 5) * Math.cos(angleSlice * i - Math.PI / 2);
              const y = (radius + 5) * Math.sin(angleSlice * i - Math.PI / 2);
              return `translate(${x}, ${y})`;
            });

          // Add background boxes - these will be our clickable elements
          labelGroups
            .append("rect")
            .attr("class", "axis-label-box")
            .attr("x", (d: string) => -Math.max(d.length * 3.5, 15) - 25)
            .attr("y", -10 - 25)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("width", (d: string) => Math.max(d.length * 7, 30) + 50)
            .attr("height", 20 + 50)
            .attr("fill", "rgba(0,0,0,0)") // Completely transparent
            .attr("stroke", "none") // No border
            .attr("stroke-width", 0)
            // Make the background boxes capture pointer events
            .style("pointer-events", "all")
            .style("cursor", (d: string) =>
              axesWithChildren.has(d) ? "pointer" : "default"
            );

          // Add a second, visually smaller box on top to maintain the visual appearance
          labelGroups
            .append("rect")
            .attr("class", "axis-label-visual-box")
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
            )
            .style("pointer-events", "none"); // This visual box doesn't capture events

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
            .text((d: string) => d)
            // Make sure text doesn't capture pointer events
            .style("pointer-events", "none");

          // Add click handlers to the background boxes
          try {
            labelGroups
              .filter((d: string) => axesWithChildren.has(d))
              .select(".axis-label-box") // Select the background box
              .on("click", function (event: MouseEvent, d: string) {
                try {
                  event.stopPropagation();

                  // Find the data point with this axis name
                  let dataPoint = null;
                  let foundDataPoint = false;

                  for (const series of currentSeries) {
                    if (!series || !series.data) continue;

                    dataPoint = series.data.find((p) => p && p.axis === d);

                    if (dataPoint) {
                      foundDataPoint = true;

                      if (dataPoint.children && dataPoint.children.length > 0) {
                        // Call custom onClick handler if it exists
                        if (typeof dataPoint.onClick === "function") {
                          try {
                            const result = dataPoint.onClick();
                            if (result === false) {
                              return; // Skip navigation if handler returns false
                            }
                          } catch (e) {
                            console.error("Error in onClick handler:", e);
                          }
                        }

                        navigateToChildren(dataPoint);
                        break;
                      }
                    }
                  }

                  if (!foundDataPoint) {
                    console.log("No data point found with axis:", d);
                  }
                } catch (e) {
                  console.error("Error in click handler:", e);
                }
              });
          } catch (e) {
            console.error("Error setting up click handlers:", e);
          }

          // Apply hover effects to all label groups
          try {
            labelGroups.each(function (this: any, d: string) {
              try {
                const element = this as unknown as SVGGElement;
                const group = d3.select(element);
                const hasChildren = axesWithChildren.has(d);

                // Find the data point and series for this axis
                let axisDataPoint: SpiderDataPoint | null = null;
                let axisSeries: SpiderChartSeries | null = null;

                for (const [_, series] of currentSeries.entries()) {
                  if (!series || !series.data) continue;

                  const dataPoint = series.data.find((p) => p && p.axis === d);
                  if (dataPoint) {
                    axisDataPoint = dataPoint;
                    axisSeries = series;
                    break;
                  }
                }

                // Add hover effects and tooltip for all labels
                // Apply the hover handler to the background box
                group
                  .select(".axis-label-box")
                  .on("mouseenter", function (this: any) {
                    try {
                      const el = element; // Use the parent element for visual effects

                      // Get the position of the label for tooltip positioning
                      const transform = el.getAttribute("transform");
                      let labelX = 0;
                      let labelY = 0;

                      if (transform) {
                        const match = transform.match(
                          /translate\(([^,]+),\s*([^)]+)\)/
                        );
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
                          .duration(200);

                        d3.select(el)
                          .select(".axis-label-text")
                          .transition()
                          .duration(200)
                          .attr("fill", "#0d47a1");
                      } else {
                        d3.select(el)
                          .select(".axis-label-box")
                          .transition()
                          .duration(200);

                        d3.select(el)
                          .select(".axis-label-text")
                          .transition()
                          .duration(200)
                          .attr("fill", "#555555");
                      }
                    } catch (e) {
                      console.error("Error in mouseenter handler:", e);
                    }
                  });

                group
                  .select(".axis-label-box")
                  .on("mouseleave", function (this: any) {
                    try {
                      const el = element; // Use the parent element for visual effects

                      // Hide tooltip
                      tooltipVisible = false;

                      // Reset visual appearance
                      if (hasChildren) {
                        d3.select(el)
                          .select(".axis-label-box")
                          .transition()
                          .duration(200);

                        d3.select(el)
                          .select(".axis-label-text")
                          .transition()
                          .duration(200)
                          .attr("fill", "#333333");
                      } else {
                        d3.select(el)
                          .select(".axis-label-box")
                          .transition()
                          .duration(200);

                        d3.select(el)
                          .select(".axis-label-text")
                          .transition()
                          .duration(200)
                          .attr("fill", "#666666");
                      }
                    } catch (e) {
                      console.error("Error in mouseleave handler:", e);
                    }
                  });
              } catch (e) {
                console.error("Error setting up hover effects for label:", e);
              }
            });
          } catch (e) {
            console.error("Error setting up hover effects:", e);
          }
        } catch (e) {
          console.error("Error drawing axis labels:", e);
        }
      }
    } catch (error) {
      console.error("Error in drawAxes:", error);
    }
  }

  // Draw the data series
  function drawDataSeries(radius: number, axes: string[], angleSlice: number) {
    try {
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
        if (!series || !series.data || !Array.isArray(series.data)) {
          console.warn("Invalid series data:", series);
          return;
        }

        // Map axes to data points, using 0 for missing values
        const seriesData = axes.map((axis) => {
          const point = series.data.find((d) => d && d.axis === axis);
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
        try {
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
        } catch (e) {
          console.error("Error drawing radar area:", e);
        }

        // Draw radar stroke
        try {
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
        } catch (e) {
          console.error("Error drawing radar stroke:", e);
        }

        // Draw data points
        seriesData.forEach((point, i) => {
          try {
            // Calculate point position
            const normalizedValue = Math.max(
              0,
              Math.min(
                1,
                (point.value - (min || 0)) / ((max || 100) - (min || 0))
              )
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
          } catch (e) {
            console.error("Error drawing data point:", e);
          }
        });
      });

      // Add interaction if enabled
      if (mergedConfig.interactive) {
        try {
          // Add invisible overlay for mouse interaction
          const overlay = chartGroup
            .selectAll(".interaction-overlay")
            .data([null]);

          overlay
            .enter()
            .append("circle")
            .attr("class", "interaction-overlay")
            .merge(overlay as any)
            .attr("r", radius + 20)
            .attr("fill", "transparent")
            .attr("pointer-events", "all")
            .on("mousemove", (event: MouseEvent) => {
              try {
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
              } catch (e) {
                console.error("Error in mousemove handler:", e);
                tooltipVisible = false;
              }
            })
            .on("mouseleave", () => {
              tooltipVisible = false;
            })
            .on("click", () => {
              try {
                if (
                  !tooltipVisible ||
                  !tooltipDataPoint ||
                  !tooltipDataPoint.children
                )
                  return;

                // Handle drill-down
                navigateToChildren(tooltipDataPoint);
              } catch (e) {
                console.error("Error in click handler:", e);
              }
            });
        } catch (e) {
          console.error("Error setting up interaction overlay:", e);
        }
      }
    } catch (error) {
      console.error("Error in drawDataSeries:", error);
    }
  }

  // Navigate to children of a data point
  export function navigateToChildren(dataPoint: SpiderDataPoint) {
    try {
      if (!dataPoint) {
        console.error("Cannot navigate: dataPoint is null or undefined");
        return;
      }

      if (!dataPoint.children || dataPoint.children.length === 0) {
        console.log("No children to navigate to for:", dataPoint.axis);
        return;
      }

      // Save current state in history (limit history size to prevent memory issues)
      if (navigationHistory.length > 20) {
        navigationHistory = navigationHistory.slice(-20);
      }
      navigationHistory.push(JSON.parse(JSON.stringify(currentSeries)));

      // Create a deep copy of the data point to ensure we preserve all properties
      const dataPointCopy = JSON.parse(JSON.stringify(dataPoint));

      // Update navigation path with the complete data point (limit path size to prevent memory issues)
      if (navigationPath.length > 10) {
        navigationPath = navigationPath.slice(-10);
      }
      navigationPath = [...navigationPath, dataPointCopy];

      // Create new series from children
      const newSeries = {
        name: dataPoint.axis,
        data: JSON.parse(JSON.stringify(dataPoint.children)),
      };

      // Ensure the children data is valid
      if (!newSeries.data || newSeries.data.length === 0) {
        console.error("Children data is empty or invalid");
        return;
      }

      // Update current series
      currentSeries = [newSeries];

      // Update chart immediately
      setTimeout(() => {
        updateChart();
      }, 0);
    } catch (error) {
      console.error("Error in navigateToChildren:", error);
      // Recover from error by resetting to top level
      navigationPath = [];
      navigationHistory = [];
      currentSeries = JSON.parse(JSON.stringify(normalizedData));
      updateChart();
    }
  }

  // Navigate to a specific level in the path
  export function handleNavigate(index: number) {
    if (index >= navigationPath.length - 1) {
      console.log("Invalid navigation index");
      return;
    }

    // Store the new path before making other changes
    // Make a deep copy to ensure we preserve all properties
    const newPath = JSON.parse(
      JSON.stringify(navigationPath.slice(0, index + 1))
    );

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

          // Find the parent in the original data
          for (const series of normalizedData) {
            const parentPoint = series.data.find(
              (p) => p.axis === parentItem?.axis
            );
            if (parentPoint && parentPoint.children) {
              // Found the parent, now find the current item
              const currentPoint = parentPoint.children.find(
                (p) => p.axis === lastPathItem.axis
              );
              if (currentPoint && currentPoint.children) {
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
          if (index < navigationHistory.length) {
            const historySeries = navigationHistory[index];
            if (historySeries && historySeries.length > 0) {
              // Deep clone to avoid reference issues
              currentSeries = JSON.parse(JSON.stringify(historySeries));

              // Only truncate history up to the index we're navigating to
              navigationHistory = navigationHistory.slice(0, index);
            } else {
              console.warn(
                "History entry is undefined or empty at index:",
                index
              );
              rebuildSeriesFromPath(newPath);
            }
          } else {
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
      // Make sure to preserve all properties from the path item
      const dataToUse = originalDataPoint
        ? { ...lastPathItem, ...originalDataPoint }
        : lastPathItem;

      // Ensure we have children data before creating the series
      if (dataToUse.children && dataToUse.children.length > 0) {
        currentSeries = [
          {
            name: dataToUse.axis,
            data: JSON.parse(JSON.stringify(dataToUse.children)),
          },
        ];
      } else {
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
    navigationPath = [];
    navigationHistory = [];
    currentSeries = JSON.parse(JSON.stringify(normalizedData));
    updateChart();
  }

  // Handle resize
  function handleResize(entries: ResizeObserverEntry[]) {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;

      // Ensure we have a valid height
      let newHeight = height;

      // If height is 0 or very small, use a default based on width
      if (newHeight < 100) {
        // Check if a height prop was provided
        const heightProp = typeof height === "string" ? height : "";
        if (heightProp && heightProp !== "auto" && heightProp !== "0") {
          // Try to use the height prop if it's a valid CSS value
          chartElement.style.height = heightProp;
          // Get the new height after applying the style
          const rect = chartElement.getBoundingClientRect();
          newHeight = rect.height;
        } else {
          // Default to 4:3 aspect ratio if no valid height
          newHeight = width * 0.75;
        }
      }

      // Ensure height doesn't exceed a reasonable maximum to prevent infinite expansion
      const maxHeight = 2000; // Set a reasonable maximum height
      newHeight = Math.min(newHeight, maxHeight);

      containerWidth = width;
      containerHeight = newHeight;

      if (svg) {
        svg.attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`);
        updateChart();
      }
    }
  }

  // Lifecycle hooks
  onMount(() => {
    try {
      // Initialize with current data
      currentSeries = normalizedData;

      // Apply height style if provided as a prop
      if (height && typeof height === "string" && height !== "auto") {
        chartElement.style.height = height;
      } else if (height && typeof height === "number" && height > 0) {
        chartElement.style.height = `${height}px`;
      }

      // Set up resize observer with error handling
      try {
        observer = new ResizeObserver((entries) => {
          try {
            handleResize(entries);
          } catch (e) {
            console.error("Error in resize observer callback:", e);
          }
        });
        observer.observe(chartElement);
      } catch (e) {
        console.error("Error setting up resize observer:", e);
        // Fallback to a fixed size if resize observer fails
        containerWidth = chartElement.clientWidth || 400;
        containerHeight = chartElement.clientHeight || 300;
        initializeChart();
      }

      // Initial render after a short delay to ensure container is sized
      setTimeout(() => {
        try {
          if (containerWidth === 0) {
            const rect = chartElement.getBoundingClientRect();
            containerWidth = rect.width || 400; // Fallback to 400 if width is 0

            // Ensure we have a valid height
            let newHeight = rect.height;

            // If height is still 0 or very small, use a default based on width
            if (newHeight < 100) {
              newHeight = rect.width * 0.75; // Default to 4:3 aspect ratio

              // Apply the calculated height to the element
              chartElement.style.height = `${newHeight}px`;
            }

            // Ensure height doesn't exceed a reasonable maximum
            const maxHeight = 2000;
            containerHeight = Math.min(newHeight, maxHeight);
          }

          // Ensure we have valid dimensions
          if (containerWidth <= 0) containerWidth = 400;
          if (containerHeight <= 0) containerHeight = 300;

          initializeChart();

          // Add a second update after a short delay to ensure proper positioning of axis labels
          setTimeout(() => {
            updateChart();
          }, 50);
        } catch (e) {
          console.error("Error in initial render:", e);
        }
      }, 100);
    } catch (error) {
      console.error("Error in onMount:", error);
    }
  });

  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  // Force an update of the chart
  export function forceUpdate() {
    updateChart();
  }
</script>

<div class="spider-chart-container {containerClass}" style:width style:height>
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

  {#if description || (navigationPath.length > 0 && navigationPath[navigationPath.length - 1]?.description)}
    <div class={descriptionClass}>
      {#if navigationPath.length > 0 && navigationPath[navigationPath.length - 1]?.description}
        {navigationPath[navigationPath.length - 1]?.description}
      {:else}
        {description}
      {/if}
    </div>
  {/if}

  {#if rationale || (navigationPath.length > 0 && (navigationPath[navigationPath.length - 1]?.rationale || navigationPath[navigationPath.length - 1]?.value !== undefined))}
    <div class={rationaleClass}>
      {#if navigationPath.length > 0}
        {#if navigationPath[navigationPath.length - 1]?.value !== undefined}
          <span class={valueClass}>
            {typeof navigationPath[navigationPath.length - 1]?.value ===
            "number"
              ? `${Number(navigationPath[navigationPath.length - 1]?.value).toLocaleString(undefined, { maximumFractionDigits: 1 })} / ${mergedConfig.max || max}`
              : navigationPath[navigationPath.length - 1]?.value}
          </span>
        {/if}
        {navigationPath[navigationPath.length - 1]?.rationale || rationale}
      {:else}
        {#if value !== undefined}
          <span class={valueClass}>
            {typeof value === "number"
              ? `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })} / ${mergedConfig.max || max}`
              : value}
          </span>
        {/if}
        {rationale}
      {/if}
    </div>
  {/if}

  <div class="spider-chart {chartClass}" bind:this={chartElement}></div>

  <Tooltip
    visible={tooltipVisible}
    x={tooltipX}
    y={tooltipY}
    dataPoint={tooltipDataPoint}
    series={tooltipSeries}
    {tooltipClass}
    max={mergedConfig.max || max}
  />
</div>

<style>
  .spider-chart-container {
    position: relative;
    overflow: hidden; /* Prevent content from expanding outside */
  }

  .spider-chart {
    min-height: 300px;
    overflow: hidden; /* Prevent content from expanding outside */
  }

  /* Default tooltip class that can be overridden by user */
  :global(.spider-chart-tooltip) {
    background-color: white;
    color: #333;
  }
</style>
