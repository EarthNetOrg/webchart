import type { SpiderDataPoint, SpiderChartSeries } from "./types";
interface $$__sveltets_2_IsomorphicComponent<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any, Exports = {}, Bindings = string> {
    new (options: import('svelte').ComponentConstructorOptions<Props>): import('svelte').SvelteComponent<Props, Events, Slots> & {
        $$bindings?: Bindings;
    } & Exports;
    (internal: unknown, props: Props & {
        $$events?: Events;
        $$slots?: Slots;
    }): Exports & {
        $set?: any;
        $on?: any;
    };
    z_$$bindings?: Bindings;
}
declare const SpiderChart: $$__sveltets_2_IsomorphicComponent<{
    data?: SpiderDataPoint[] | SpiderChartSeries[];
    config?: {};
    title?: string | undefined;
    description?: string | undefined;
    rationale?: string | undefined;
    width?: string | number;
    height?: string | number;
    className?: string;
    titleClass?: string;
    descriptionClass?: string;
    rationaleClass?: string;
    breadcrumbsClass?: string;
    breadcrumbItemClass?: string;
    tooltipClass?: string;
}, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type SpiderChart = InstanceType<typeof SpiderChart>;
export default SpiderChart;
