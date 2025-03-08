# Svelte Spider Chart

An interactive Spider Chart (Radar Chart) component for Svelte 5 projects, built with D3.js.

## Features

- Interactive Spider/Radar chart visualization
- Support for multiple data series
- Drill-down navigation for hierarchical data
- Automatic calculation of parent values from children
- Tooltips for data point inspection
- Descriptive text and rationales for data points and charts
- Responsive design that adapts to container size
- Customizable appearance and behavior
- Built with Svelte 5 and D3.js

## Installation

```bash
npm install svelte-spider-chart d3
```

## Usage

```svelte
<script>
  import { SpiderChart } from 'svelte-spider-chart';
  
  const data = [
    { axis: "Strength", value: 80, description: "Physical power", rationale: "Based on weight lifting capacity" },
    { axis: "Intelligence", value: 70, description: "Mental acuity", rationale: "Based on problem-solving tests" },
    { axis: "Agility", value: 90, description: "Nimbleness and speed", rationale: "Based on obstacle course time" },
    { axis: "Stamina", value: 60, description: "Endurance", rationale: "Based on long-distance running" },
    { axis: "Speed", value: 85, description: "Quickness", rationale: "Based on sprint times" },
    { axis: "Accuracy", value: 75, description: "Precision", rationale: "Based on target practice" }
  ];
  
  const config = {
    color: '#ff3e00',
    opacity: 0.7
  };
</script>

<SpiderChart 
  {data} 
  {config} 
  title="Character Stats" 
  description="A visual representation of character attributes"
  rationale="These stats are used to determine character abilities in gameplay"
  min={0}
  max={100}
/>
```

## Custom Styling Example

You can customize the appearance of the title, description, and rationale elements by providing custom CSS classes:

```svelte
<script>
  import { SpiderChart } from 'svelte-spider-chart';
  
  const data = [
    { axis: "Strength", value: 80 },
    { axis: "Intelligence", value: 70 },
    { axis: "Agility", value: 90 },
    { axis: "Stamina", value: 60 },
    { axis: "Speed", value: 85 },
    { axis: "Accuracy", value: 75 }
  ];
</script>

<style>
  .custom-title {
    font-size: 24px;
    font-weight: bold;
    color: #ff3e00;
    text-align: center;
    margin-bottom: 20px;
    text-transform: uppercase;
  }
  
  .custom-description {
    font-size: 16px;
    color: #333;
    text-align: center;
    margin-bottom: 12px;
    font-style: normal;
    line-height: 1.5;
  }
  
  .custom-rationale {
    font-size: 14px;
    color: #555;
    text-align: center;
    margin-top: 20px;
    padding: 12px;
    border-top: 2px dashed #ccc;
    font-style: italic;
  }
  
  .custom-tooltip {
    background-color: #f8f9fa;
    color: #ff3e00;
  }
</style>

<SpiderChart 
  {data} 
  title="Character Stats" 
  description="A visual representation of character attributes"
  rationale="These stats are used to determine character abilities in gameplay"
  titleClass="custom-title"
  descriptionClass="custom-description"
  rationaleClass="custom-rationale"
  tooltipClass="custom-tooltip"
/>
```

This example customizes:
- The title with a larger, uppercase, colored font
- The description with a normal font style and darker color
- The rationale with a dashed border and italic style
- The tooltip with a light gray background and the same accent color as the title

## Multiple Series Example

```svelte
<script>
  import { SpiderChart } from 'svelte-spider-chart';
  
  const data = [
    {
      name: "Character 1",
      color: "#ff3e00",
      data: [
        { axis: "Strength", value: 80, rationale: "Trained in weightlifting" },
        { axis: "Intelligence", value: 70, rationale: "Self-taught in many subjects" },
        { axis: "Agility", value: 90, rationale: "Former gymnast" },
        { axis: "Stamina", value: 60, rationale: "Recovering from injury" },
        { axis: "Speed", value: 85, rationale: "Track and field background" },
        { axis: "Accuracy", value: 75, rationale: "Regular practice at shooting range" }
      ]
    },
    {
      name: "Character 2",
      color: "#40b3ff",
      data: [
        { axis: "Strength", value: 65, rationale: "Focuses on technique over power" },
        { axis: "Intelligence", value: 85, rationale: "Advanced academic degrees" },
        { axis: "Agility", value: 70, rationale: "Yoga practitioner" },
        { axis: "Stamina", value: 75, rationale: "Marathon runner" },
        { axis: "Speed", value: 60, rationale: "Prefers endurance over sprinting" },
        { axis: "Accuracy", value: 90, rationale: "Professional marksman" }
      ]
    }
  ];
</script>

<SpiderChart 
  {data} 
  title="Character Comparison" 
  description="Comparing the attributes of two different characters"
  rationale="This comparison helps in balancing character abilities for fair gameplay"
/>
```

## Hierarchical Data with Drill-down and Automatic Value Calculation

The component automatically calculates parent values as the average of their children's values. This calculation is recursive, starting from the deepest level and propagating upward.

```svelte
<script>
  import { SpiderChart } from 'svelte-spider-chart';
  
  const data = [
    { 
      axis: "Performance", 
      value: 0, // Will be calculated as sum of children (90 + 80 + 85 = 255)
      description: "Overall system performance",
      rationale: "Sum of speed, reliability, and efficiency metrics",
      children: [
        { axis: "Speed", value: 90, rationale: "Measured in transactions per second" },
        { axis: "Reliability", value: 80, rationale: "Based on uptime percentage" },
        { axis: "Efficiency", value: 85, rationale: "Resource utilization metrics" }
      ]
    },
    { 
      axis: "Features", 
      value: 0, // Will be calculated as sum of children (80 + 70 + 75 = 225)
      description: "Product capabilities",
      rationale: "Sum of usability, functionality, and flexibility scores",
      children: [
        { axis: "Usability", value: 80, rationale: "User testing scores" },
        { axis: "Functionality", value: 70, rationale: "Feature checklist completion" },
        { axis: "Flexibility", value: 75, rationale: "Adaptation to different use cases" }
      ]
    },
    { 
      axis: "Support", 
      value: 0, // Will be calculated as sum of children (65 + 80 + 65 = 210)
      description: "Customer support quality",
      rationale: "Sum of documentation, community, and response time metrics",
      children: [
        { axis: "Documentation", value: 65, rationale: "Completeness and clarity of docs" },
        { axis: "Community", value: 80, rationale: "Size and activity of user community" },
        { axis: "Response Time", value: 65, rationale: "Average time to resolve tickets" }
      ]
    }
  ];
</script>

<SpiderChart 
  {data} 
  title="Product Evaluation" 
  description="Comprehensive assessment of product qualities"
  rationale="This evaluation is used for product development prioritization and marketing"
/>
```

## Deeply Nested Hierarchical Data

The component can handle multiple levels of nesting, with values calculated recursively from the deepest level up:

```svelte
<script>
  import { SpiderChart } from 'svelte-spider-chart';
  
  const data = [
    {
      axis: "Product Quality",
      value: 0, // Will be sum of all nested children
      description: "Overall product quality assessment",
      rationale: "Aggregated from all sub-metrics",
      children: [
        {
          axis: "Performance",
          value: 0, // Will be sum of children (90 + 85 = 175)
          description: "System performance metrics",
          rationale: "Technical performance indicators",
          children: [
            { axis: "Speed", value: 90, rationale: "Response time measurements" },
            { axis: "Stability", value: 85, rationale: "Crash frequency and severity" }
          ]
        },
        {
          axis: "Usability",
          value: 0, // Will be sum of children (75 + 80 + 70 = 225)
          description: "User experience metrics",
          rationale: "How users interact with the product",
          children: [
            { axis: "Learnability", value: 75, rationale: "Time to become proficient" },
            { axis: "Satisfaction", value: 80, rationale: "User satisfaction surveys" },
            { axis: "Efficiency", value: 70, rationale: "Task completion time" }
          ]
        }
      ]
    }
  ];
</script>

<SpiderChart 
  {data} 
  title="Multi-level Product Quality Assessment"
  description="Hierarchical evaluation with multiple levels"
  rationale="Values are calculated by summing up all child values recursively"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `SpiderDataPoint[] \| SpiderChartSeries[]` | `[]` | The data to display in the chart |
| `config` | `SpiderChartConfig` | `{}` | Configuration options for the chart |
| `title` | `string \| undefined` | `undefined` | Optional title for the chart |
| `description` | `string \| undefined` | `undefined` | Optional description for the chart, displayed above the title |
| `rationale` | `string \| undefined` | `undefined` | Optional rationale for the chart, displayed below the chart |
| `width` | `string \| number` | `'100%'` | Width of the chart container |
| `height` | `string \| number` | `'auto'` | Height of the chart container |
| `class` | `string` | `''` | Additional CSS class for the chart container |
| `titleClass` | `string` | `'spider-chart-title'` | CSS class for the title element |
| `descriptionClass` | `string` | `'spider-chart-description'` | CSS class for the description element |
| `rationaleClass` | `string` | `'spider-chart-rationale'` | CSS class for the rationale element |
| `tooltipClass` | `string` | `'spider-chart-tooltip'` | CSS class for the tooltip element |
| `min` | `number` | `0` | Minimum value for the chart (can also be set via config) |
| `max` | `number` | `100` | Maximum value for the chart (can also be set via config) |

## Configuration Options

The `config` prop accepts an object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `min` | `number` | `0` | Minimum value for the chart |
| `max` | `number` | `100` | Maximum value for the chart |
| `levels` | `number` | `5` | Number of concentric circles to draw |
| `color` | `string` | `'#2196F3'` | Default color for the chart |
| `opacity` | `number` | `0.5` | Opacity for the chart fill |
| `strokeWidth` | `number` | `2` | Width of the chart stroke |
| `animationDuration` | `number` | `500` | Duration of animations in milliseconds |
| `showAxisLabels` | `boolean` | `true` | Whether to show axis labels |
| `showAxisLines` | `boolean` | `true` | Whether to show axis lines |
| `showLevelLabels` | `boolean` | `true` | Whether to show level labels |
| `interactive` | `boolean` | `true` | Whether to enable interactive features |
| `margin` | `object` | `{ top: 50, right: 50, bottom: 50, left: 50 }` | Margins for the chart |

## Types

```typescript
interface SpiderDataPoint {
  axis: string;
  value: number;
  description?: string;
  rationale?: string;
  primary?: boolean;
  children?: SpiderDataPoint[];
}

interface SpiderChartSeries {
  name: string;
  data: SpiderDataPoint[];
  color?: string;
  opacity?: number;
}

interface SpiderChartConfig {
  min?: number;
  max?: number;
  levels?: number;
  color?: string;
  opacity?: number;
  strokeWidth?: number;
  animationDuration?: number;
  showAxisLabels?: boolean;
  showAxisLines?: boolean;
  showLevelLabels?: boolean;
  interactive?: boolean;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

interface SpiderChartProps {
  data: SpiderDataPoint[] | SpiderChartSeries[];
  config?: SpiderChartConfig;
  title?: string;
  description?: string;
  rationale?: string;
  width?: string | number;
  height?: string | number;
  class?: string;
  titleClass?: string;
  descriptionClass?: string;
  rationaleClass?: string;
  tooltipClass?: string;
}
```

## License

MIT 

This example customizes:
- The title with a larger, uppercase, colored font
- The description with a normal font style and darker color
- The rationale with a dashed border and italic style
- The tooltip with a light gray background and the same accent color as the title 