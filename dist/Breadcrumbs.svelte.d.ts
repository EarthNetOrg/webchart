import type { SpiderDataPoint } from "./types";
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
declare const Breadcrumbs: $$__sveltets_2_IsomorphicComponent<{
    path?: SpiderDataPoint[];
    onNavigate: (index: number) => void;
    onReset: () => void;
    title?: string;
    breadcrumbsClass?: string;
}, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type Breadcrumbs = InstanceType<typeof Breadcrumbs>;
export default Breadcrumbs;
