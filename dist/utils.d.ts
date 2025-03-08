import type { SpiderDataPoint, SpiderChartConfig, SpiderChartSeries } from './types';
import * as d3 from 'd3';
/**
 * Default configuration for the Spider Chart
 */
export declare const DEFAULT_CONFIG: SpiderChartConfig;
/**
 * Recursively calculates and updates parent values based on the average of their children
 * @param dataPoint The data point to process
 * @returns The updated value (average of children or original value if no children)
 */
export declare function calculateHierarchicalValues(dataPoint: SpiderDataPoint): number;
/**
 * Processes data to update hierarchical values, calculating parent values as averages of their children
 * @param data The data to process
 * @returns The processed data with updated values
 */
export declare function processHierarchicalData(data: SpiderDataPoint[] | SpiderChartSeries[]): SpiderDataPoint[] | SpiderChartSeries[];
/**
 * Normalizes the data into a consistent series format
 * @param data The data to normalize
 * @returns The normalized data as an array of series
 */
export declare function normalizeData(data: SpiderDataPoint[] | SpiderChartSeries[]): SpiderChartSeries[];
/**
 * Merges the provided configuration with the default configuration
 * @param config The user-provided configuration
 * @returns The merged configuration
 */
export declare function mergeConfig(config?: SpiderChartConfig): SpiderChartConfig;
/**
 * Calculates the dimensions of the chart based on the container size and margins
 * @param containerWidth The width of the container
 * @param containerHeight The height of the container
 * @param margin The margins to apply
 * @returns The chart dimensions
 */
export declare function calculateChartDimensions(containerWidth: number, containerHeight: number, margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
}): {
    width: number;
    height: number;
    radius: number;
    centerX: number;
    centerY: number;
};
/**
 * Generates a unique ID for SVG elements
 * @returns A unique ID string
 */
export declare function generateId(): string;
/**
 * Creates a radar line generator function
 * @param radius The radius of the chart
 * @param angleSlice The angle between each axis
 * @param min The minimum value
 * @param max The maximum value
 * @returns A radar line generator function
 */
export declare function createRadarLineGenerator(radius: number, angleSlice: number, min: number, max: number): d3.LineRadial<SpiderDataPoint>;
/**
 * Creates a radar area generator function for D3
 * @param radius The radius of the chart
 * @param angleSlice The angle between each axis
 * @param min The minimum value
 * @param max The maximum value
 * @returns A D3 area generator function
 */
export declare function createRadarAreaGenerator(radius: number, angleSlice: number, min: number, max: number): d3.AreaRadial<SpiderDataPoint>;
/**
 * Generates a color scale for multiple series
 * @param series The data series
 * @returns A function that returns a color for a given series index
 */
export declare function generateColorScale(series: SpiderChartSeries[]): (seriesIndex: number) => string;
/**
 * Finds the closest data point to the mouse position
 * @param mouseX The mouse X position
 * @param mouseY The mouse Y position
 * @param series The data series
 * @param points All data points with their coordinates
 * @returns The closest data point and its series
 */
export declare function findClosestDataPoint(mouseX: number, mouseY: number, series: SpiderChartSeries[], points: {
    x: number;
    y: number;
    dataPoint: SpiderDataPoint;
    seriesIndex: number;
}[]): {
    dataPoint: SpiderDataPoint;
    series: SpiderChartSeries | undefined;
} | null;
