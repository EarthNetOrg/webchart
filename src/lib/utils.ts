import type { SpiderDataPoint, SpiderChartConfig, SpiderChartSeries } from './types';
import * as d3 from 'd3';

/**
 * Default configuration for the Spider Chart
 */
export const DEFAULT_CONFIG: SpiderChartConfig = {
  min: 0,
  max: 100,
  levels: 5,
  color: '#2196F3',
  opacity: 0.5,
  strokeWidth: 2,
  animationDuration: 500,
  showAxisLabels: true,
  showAxisLines: true,
  showLevelLabels: true,
  interactive: true,
  margin: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  }
};

/**
 * Recursively calculates and updates parent values based on the average of their children
 * @param dataPoint The data point to process
 * @returns The updated value (average of children or original value if no children)
 */
export function calculateHierarchicalValues(dataPoint: SpiderDataPoint): number {
  // If there are no children, return the original value
  if (!dataPoint.children || dataPoint.children.length === 0) {
    return dataPoint.value;
  }
  
  // Process all children first (recursive)
  dataPoint.children.forEach(child => {
    child.value = calculateHierarchicalValues(child);
  });
  
  // Calculate the sum of all children's values
  const sum = dataPoint.children.reduce((total, child) => total + child.value, 0);
  
  // Calculate the average of children's values
  const average = sum / dataPoint.children.length;
  
  // Update the parent's value with the average of its children
  dataPoint.value = average;
  
  return average;
}

/**
 * Processes data to update hierarchical values, calculating parent values as averages of their children
 * @param data The data to process
 * @returns The processed data with updated values
 */
export function processHierarchicalData(data: SpiderDataPoint[] | SpiderChartSeries[]): SpiderDataPoint[] | SpiderChartSeries[] {
  if (!data || data.length === 0) {
    return data;
  }
  
  // Handle series data
  if (data.length > 0 && 'name' in data[0] && 'data' in data[0]) {
    const seriesData = data as SpiderChartSeries[];
    seriesData.forEach(series => {
      series.data.forEach(dataPoint => {
        calculateHierarchicalValues(dataPoint);
      });
    });
    return seriesData;
  }
  
  // Handle simple data points
  const simpleData = data as SpiderDataPoint[];
  simpleData.forEach(dataPoint => {
    calculateHierarchicalValues(dataPoint);
  });
  
  return simpleData;
}

/**
 * Normalizes the data into a consistent series format
 * @param data The data to normalize
 * @returns The normalized data as an array of series
 */
export function normalizeData(data: SpiderDataPoint[] | SpiderChartSeries[]): SpiderChartSeries[] {
  if (!data || data.length === 0) {
    return [];
  }
  
  // Process hierarchical data first
  const processedData = processHierarchicalData(data);
  
  // Handle series data
  if (processedData.length > 0 && 'name' in processedData[0] && 'data' in processedData[0]) {
    const seriesData = processedData as SpiderChartSeries[];
    return seriesData;
  }
  
  // Handle single series data
  const pointData = processedData as SpiderDataPoint[];
  return [{
    name: 'Default',
    data: pointData
  }];
}

/**
 * Merges the provided configuration with the default configuration
 * @param config The user-provided configuration
 * @returns The merged configuration
 */
export function mergeConfig(config?: SpiderChartConfig): SpiderChartConfig {
  if (!config) {
    return { ...DEFAULT_CONFIG };
  }

  return {
    ...DEFAULT_CONFIG,
    ...config,
    margin: {
      ...DEFAULT_CONFIG.margin,
      ...config.margin
    }
  };
}

/**
 * Calculates the dimensions of the chart based on the container size and margins
 * @param containerWidth The width of the container
 * @param containerHeight The height of the container
 * @param margin The margins to apply
 * @returns The chart dimensions
 */
export function calculateChartDimensions(
  containerWidth: number,
  containerHeight: number,
  margin: { top: number; right: number; bottom: number; left: number }
) {
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;
  const radius = Math.min(width, height) / 2;

  return {
    width,
    height,
    radius,
    centerX: width / 2,
    centerY: height / 2
  };
}

/**
 * Generates a unique ID for SVG elements
 * @returns A unique ID string
 */
export function generateId(): string {
  return `spider-chart-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Creates a radar line generator function
 * @param radius The radius of the chart
 * @param angleSlice The angle between each axis
 * @param min The minimum value
 * @param max The maximum value
 * @returns A radar line generator function
 */
export function createRadarLineGenerator(
  radius: number,
  angleSlice: number,
  min: number,
  max: number
) {
  return d3
    .lineRadial<SpiderDataPoint>()
    .radius((d: SpiderDataPoint) => {
      // Normalize the value to the range [0, 1]
      const normalizedValue = Math.max(0, Math.min(1, (d.value - min) / (max - min)));
      return radius * normalizedValue;
    })
    .angle((_: SpiderDataPoint, i: number) => i * angleSlice)
    .curve(d3.curveLinearClosed);
}

/**
 * Creates a radar area generator function for D3
 * @param radius The radius of the chart
 * @param angleSlice The angle between each axis
 * @param min The minimum value
 * @param max The maximum value
 * @returns A D3 area generator function
 */
export function createRadarAreaGenerator(
  radius: number,
  angleSlice: number,
  min: number,
  max: number
) {
  return d3
    .areaRadial<SpiderDataPoint>()
    .angle((_, i) => i * angleSlice)
    .innerRadius(0)
    .outerRadius((d) => {
      // Normalize the value to the range [0, 1]
      const normalizedValue = Math.max(0, Math.min(1, (d.value - min) / (max - min)));
      return radius * normalizedValue;
    })
    .curve(d3.curveLinearClosed);
}

/**
 * Generates a color scale for multiple series
 * @param series The data series
 * @returns A function that returns a color for a given series index
 */
export function generateColorScale(series: SpiderChartSeries[]) {
  // Use provided colors or generate a color scale
  const colorScale = d3.scaleOrdinal<string>()
    .domain(series.map(s => s.name))
    .range(d3.schemeCategory10);
  
  return (seriesIndex: number) => {
    const s = series[seriesIndex];
    return s?.color || colorScale(s?.name);
  };
}

/**
 * Finds the closest data point to the mouse position
 * @param mouseX The mouse X position
 * @param mouseY The mouse Y position
 * @param series The data series
 * @param points All data points with their coordinates
 * @returns The closest data point and its series
 */
export function findClosestDataPoint(
  mouseX: number,
  mouseY: number,
  series: SpiderChartSeries[],
  points: { x: number; y: number; dataPoint: SpiderDataPoint; seriesIndex: number }[]
) {
  if (!points || points.length === 0) {
    return null;
  }
  
  // Find the closest point
  let minDistance = Infinity;
  let closestPoint: { x: number; y: number; dataPoint: SpiderDataPoint; seriesIndex: number } | undefined;
  
  points.forEach(point => {
    const distance = Math.sqrt(Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2));
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = point;
    }
  });
  
  // Only return if the point is close enough (within 50px)
  if (minDistance > 50 || !closestPoint) {
    return null;
  }
  
  return {
    dataPoint: closestPoint.dataPoint,
    series: series[closestPoint.seriesIndex]
  };
} 