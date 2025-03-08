/**
 * Represents a data point on the Spider Chart
 */
export interface SpiderDataPoint {
    /**
     * The label for this axis
     */
    axis: string;
    /**
     * The value for this axis
     */
    value: number;
    /**
     * Optional description for this axis
     */
    description?: string;
    /**
     * Optional rationale for this axis
     */
    rationale?: string;
    /**
     * Optional flag to mark this as a primary axis
     */
    primary?: boolean;
    /**
     * Optional nested data points for drill-down functionality
     */
    children?: SpiderDataPoint[];
}
/**
 * Configuration for the Spider Chart
 */
export interface SpiderChartConfig {
    /**
     * The minimum value for the chart (default: 0)
     */
    min?: number;
    /**
     * The maximum value for the chart (default: 100)
     */
    max?: number;
    /**
     * The number of concentric circles to draw (default: 5)
     */
    levels?: number;
    /**
     * The color for the chart (default: #2196F3)
     */
    color?: string;
    /**
     * The opacity for the chart fill (default: 0.5)
     */
    opacity?: number;
    /**
     * The width of the chart stroke (default: 2)
     */
    strokeWidth?: number;
    /**
     * The duration of animations in milliseconds (default: 500)
     */
    animationDuration?: number;
    /**
     * Whether to show axis labels (default: true)
     */
    showAxisLabels?: boolean;
    /**
     * Whether to show axis lines (default: true)
     */
    showAxisLines?: boolean;
    /**
     * Whether to show level labels (default: true)
     */
    showLevelLabels?: boolean;
    /**
     * Whether to enable interactive features like tooltips and drill-down (default: true)
     */
    interactive?: boolean;
    /**
     * Custom margin for the chart (default: { top: 50, right: 50, bottom: 50, left: 50 })
     */
    margin?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}
/**
 * Data series for the Spider Chart
 */
export interface SpiderChartSeries {
    /**
     * Name of the data series
     */
    name: string;
    /**
     * Data points for this series
     */
    data: SpiderDataPoint[];
    /**
     * Optional color for this series
     */
    color?: string;
    /**
     * Optional opacity for this series
     */
    opacity?: number;
}
/**
 * Props for the Spider Chart component
 */
export interface SpiderChartProps {
    /**
     * The data to display in the chart
     * Can be a single series of data points or multiple series
     */
    data: SpiderDataPoint[] | SpiderChartSeries[];
    /**
     * Optional configuration for the chart
     */
    config?: SpiderChartConfig;
    /**
     * Optional title for the chart
     */
    title?: string;
    /**
     * Optional description for the chart, displayed above the title
     */
    description?: string;
    /**
     * Optional rationale for the chart, displayed below the chart
     */
    rationale?: string;
    /**
     * Optional width for the chart (default: 100%)
     */
    width?: string | number;
    /**
     * Optional height for the chart (default: auto)
     */
    height?: string | number;
    /**
     * Optional CSS class to apply to the chart container
     */
    class?: string;
    /**
     * Optional CSS class to apply to the title element (default: "spider-chart-title")
     */
    titleClass?: string;
    /**
     * Optional CSS class to apply to the description element (default: "spider-chart-description")
     */
    descriptionClass?: string;
    /**
     * Optional CSS class to apply to the rationale element (default: "spider-chart-rationale")
     */
    rationaleClass?: string;
    /**
     * Optional CSS class to apply to the tooltip element (default: "spider-chart-tooltip")
     * This class can be used to customize the tooltip's appearance, including background and text colors.
     */
    tooltipClass?: string;
}
