import type { SpiderDataPoint, SpiderChartSeries } from "./types";
type $$ComponentProps = {
    visible: boolean;
    x: number;
    y: number;
    dataPoint: SpiderDataPoint | null;
    series: SpiderChartSeries | null;
    tooltipClass: string;
    max?: number;
};
declare const Tooltip: import("svelte").Component<$$ComponentProps, {}, "">;
type Tooltip = ReturnType<typeof Tooltip>;
export default Tooltip;
