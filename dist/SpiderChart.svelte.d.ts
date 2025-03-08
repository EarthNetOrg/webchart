import type { SpiderDataPoint, SpiderChartSeries } from "./types";
type $$ComponentProps = {
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
};
declare const SpiderChart: import("svelte").Component<$$ComponentProps, {
    navigateToChildren: (dataPoint: SpiderDataPoint) => void;
    handleNavigate: (index: number) => void;
    handleReset: () => void;
    testNavigateToDocumentation: () => void;
    forceUpdate: () => void;
}, "">;
type SpiderChart = ReturnType<typeof SpiderChart>;
export default SpiderChart;
