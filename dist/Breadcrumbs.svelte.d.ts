import type { SpiderDataPoint } from "./types";
type $$ComponentProps = {
    path: SpiderDataPoint[];
    onNavigate: (index: number) => void;
    onReset: () => void;
    title: string;
    breadcrumbsClass: string;
    breadcrumbItemClass: string;
};
declare const Breadcrumbs: import("svelte").Component<$$ComponentProps, {}, "">;
type Breadcrumbs = ReturnType<typeof Breadcrumbs>;
export default Breadcrumbs;
