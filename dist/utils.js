import * as d3 from 'd3';
/**
 * Default configuration for the Spider Chart
 */
export const DEFAULT_CONFIG = {
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
export function calculateHierarchicalValues(dataPoint) {
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
export function processHierarchicalData(data) {
    if (!data || data.length === 0) {
        return data;
    }
    // Handle series data
    if (data.length > 0 && 'name' in data[0] && 'data' in data[0]) {
        const seriesData = data;
        seriesData.forEach(series => {
            series.data.forEach(dataPoint => {
                calculateHierarchicalValues(dataPoint);
            });
        });
        return seriesData;
    }
    // Handle simple data points
    const simpleData = data;
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
export function normalizeData(data) {
    if (!data || data.length === 0) {
        return [];
    }
    // Process hierarchical data first
    const processedData = processHierarchicalData(data);
    // Handle series data
    if (processedData.length > 0 && 'name' in processedData[0] && 'data' in processedData[0]) {
        const seriesData = processedData;
        return seriesData;
    }
    // Handle single series data
    const pointData = processedData;
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
export function mergeConfig(config) {
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
export function calculateChartDimensions(containerWidth, containerHeight, margin) {
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
export function generateId() {
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
export function createRadarLineGenerator(radius, angleSlice, min, max) {
    return d3
        .lineRadial()
        .radius((d) => {
        // Normalize the value to the range [0, 1]
        const normalizedValue = Math.max(0, Math.min(1, (d.value - min) / (max - min)));
        return radius * normalizedValue;
    })
        .angle((_, i) => i * angleSlice)
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
export function createRadarAreaGenerator(radius, angleSlice, min, max) {
    return d3
        .areaRadial()
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
export function generateColorScale(series) {
    // Use provided colors or generate a color scale
    const colorScale = d3.scaleOrdinal()
        .domain(series.map(s => s.name))
        .range(d3.schemeCategory10);
    return (seriesIndex) => {
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
export function findClosestDataPoint(mouseX, mouseY, series, points) {
    if (!points || points.length === 0) {
        return null;
    }
    // Find the closest point
    let minDistance = Infinity;
    let closestPoint;
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
