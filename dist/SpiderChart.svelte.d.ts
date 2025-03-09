import type { SpiderDataPoint, SpiderChartSeries } from "./types";
type $$ComponentProps = {
    data: SpiderDataPoint[] | SpiderChartSeries[];
    config: any;
    title?: string;
    description?: string;
    rationale?: string;
    value?: string | number;
    width: string | number;
    height: string | number;
    className: string;
    titleClass: string;
    descriptionClass: string;
    rationaleClass: string;
    valueClass: string;
    breadcrumbsClass: string;
    breadcrumbItemClass: string;
    tooltipClass: string;
    min?: number;
    max?: number;
};
declare const SpiderChart: import("svelte").Component<$$ComponentProps, {
    navigateToChildren: (dataPoint: SpiderDataPoint) => void;
    handleNavigate: (index: number) => void;
    handleReset: () => void;
    forceUpdate: () => void;
}, "">;
type SpiderChart = ReturnType<typeof SpiderChart>;
export default SpiderChart;
