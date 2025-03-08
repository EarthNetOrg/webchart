<script lang="ts">
  import { SpiderChart } from "./index";

  // Basic data example
  const basicData = [
    {
      axis: "Strength",
      value: 80,
      description: "Physical power",
      rationale: "Based on weight lifting capacity",
    },
    {
      axis: "Intelligence",
      value: 70,
      description: "Mental acuity",
      rationale: "Based on problem-solving tests",
    },
    {
      axis: "Agility",
      value: 90,
      description: "Nimbleness and speed",
      rationale: "Based on obstacle course time",
    },
    {
      axis: "Stamina",
      value: 60,
      description: "Endurance",
      rationale: "Based on long-distance running",
    },
    {
      axis: "Speed",
      value: 85,
      description: "Quickness",
      rationale: "Based on sprint times",
    },
    {
      axis: "Accuracy",
      value: 75,
      description: "Precision",
      rationale: "Based on target practice",
    },
  ];

  // Multiple series example
  const multiSeriesData = [
    {
      name: "Character 1",
      color: "#ff3e00",
      data: [
        { axis: "Strength", value: 80, rationale: "Trained in weightlifting" },
        {
          axis: "Intelligence",
          value: 70,
          rationale: "Self-taught in many subjects",
        },
        { axis: "Agility", value: 90, rationale: "Former gymnast" },
        { axis: "Stamina", value: 60, rationale: "Recovering from injury" },
        { axis: "Speed", value: 85, rationale: "Track and field background" },
        {
          axis: "Accuracy",
          value: 75,
          rationale: "Regular practice at shooting range",
        },
      ],
    },
    {
      name: "Character 2",
      color: "#40b3ff",
      data: [
        {
          axis: "Strength",
          value: 65,
          rationale: "Focuses on technique over power",
        },
        {
          axis: "Intelligence",
          value: 85,
          rationale: "Advanced academic degrees",
        },
        { axis: "Agility", value: 70, rationale: "Yoga practitioner" },
        { axis: "Stamina", value: 75, rationale: "Marathon runner" },
        {
          axis: "Speed",
          value: 60,
          rationale: "Prefers endurance over sprinting",
        },
        { axis: "Accuracy", value: 90, rationale: "Professional marksman" },
      ],
    },
  ];

  // Hierarchical data example with values that will be overridden by children averages
  const hierarchicalData = [
    {
      axis: "Performance",
      value: 0, // This will be overridden by the average of children ((90 + 80 + 85) / 3 = 85)
      description: "Overall system performance",
      rationale: "Average of speed, reliability, and efficiency metrics",
      children: [
        {
          axis: "Speed",
          value: 90,
          rationale: "Measured in transactions per second",
        },
        {
          axis: "Reliability",
          value: 80,
          rationale: "Based on uptime percentage",
        },
        {
          axis: "Efficiency",
          value: 85,
          rationale: "Resource utilization metrics",
        },
      ],
    },
    {
      axis: "Features",
      value: 0, // This will be overridden by the average of children ((80 + 70 + 75) / 3 = 75)
      description: "Product capabilities",
      rationale: "Average of usability, functionality, and flexibility scores",
      children: [
        {
          axis: "Usability",
          value: 80,
          rationale: "User testing scores",
        },
        {
          axis: "Functionality",
          value: 70,
          rationale: "Feature checklist completion",
        },
        {
          axis: "Flexibility",
          value: 75,
          rationale: "Adaptation to different use cases",
        },
      ],
    },
    {
      axis: "Support",
      value: 0, // This will be overridden by the average of children ((65 + 80 + 65) / 3 = 70)
      description: "Customer support quality",
      rationale:
        "Average of documentation, community, and response time metrics",
      children: [
        {
          axis: "Documentation",
          value: 65,
          rationale: "Completeness and clarity of docs",
        },
        {
          axis: "Community",
          value: 80,
          rationale: "Size and activity of user community",
        },
        {
          axis: "Response Time",
          value: 65,
          rationale: "Average time to resolve tickets",
        },
      ],
    },
    {
      axis: "Cost",
      value: 0, // This will be overridden by the average of children ((50 + 70 + 60) / 3 = 60)
      description: "Financial considerations",
      rationale: "Average of initial, maintenance, and upgrade costs",
      children: [
        {
          axis: "Initial",
          value: 50,
          rationale: "Purchase and setup costs",
        },
        {
          axis: "Maintenance",
          value: 70,
          rationale: "Ongoing support costs",
        },
        {
          axis: "Upgrade",
          value: 60,
          rationale: "Cost of future upgrades",
        },
      ],
    },
    {
      axis: "Reliability",
      value: 0, // This will be overridden by the average of children ((85 + 75 + 80) / 3 = 80)
      description: "System dependability",
      rationale: "Average of uptime, error rate, and recovery metrics",
      children: [
        {
          axis: "Uptime",
          value: 85,
          rationale: "Percentage of time system is available",
        },
        {
          axis: "Error Rate",
          value: 75,
          rationale: "Frequency of errors in production",
        },
        {
          axis: "Recovery",
          value: 80,
          rationale: "Time to recover from failures",
        },
      ],
    },
  ];

  // Nested hierarchical data example to demonstrate recursive calculation
  const nestedHierarchicalData = [
    {
      axis: "Product Quality",
      value: 0, // Will be average of all nested children
      description: "Overall product quality assessment",
      rationale: "Aggregated from all sub-metrics",
      children: [
        {
          axis: "Performance",
          value: 0, // Will be average of children
          description: "System performance metrics",
          rationale: "Technical performance indicators",
          children: [
            {
              axis: "Speed",
              value: 90,
              rationale: "Response time measurements",
            },
            {
              axis: "Stability",
              value: 85,
              rationale: "Crash frequency and severity",
            },
          ],
        },
        {
          axis: "Usability",
          value: 0, // Will be average of children
          description: "User experience metrics",
          rationale: "How users interact with the product",
          children: [
            {
              axis: "Learnability",
              value: 75,
              rationale: "Time to become proficient",
            },
            {
              axis: "Satisfaction",
              value: 80,
              rationale: "User satisfaction surveys",
            },
            {
              axis: "Efficiency",
              value: 70,
              rationale: "Task completion time",
            },
          ],
        },
      ],
    },
  ];

  // Custom configuration
  const config = {
    min: 0,
    max: 100,
    levels: 5,
    color: "#ff3e00",
    opacity: 0.7,
    strokeWidth: 2,
    animationDuration: 800,
    showLevelLabels: true,
  };
</script>

<div class="examples">
  <h1>Svelte Spider Chart Examples</h1>

  <div class="example">
    <h2>Basic Example</h2>
    <div class="chart-container">
      <SpiderChart
        data={basicData}
        {config}
        title="Character Stats"
        description="A visual representation of character attributes"
        rationale="These stats are used to determine character abilities in gameplay"
      />
    </div>
  </div>

  <div class="example">
    <h2>Multiple Series Example</h2>
    <div class="chart-container">
      <SpiderChart
        data={multiSeriesData}
        title="Character Comparison"
        description="Comparing the attributes of two different characters"
        rationale="This comparison helps in balancing character abilities for fair gameplay"
      />
    </div>
  </div>

  <div class="example">
    <h2>Hierarchical Data Example</h2>
    <p>Click on any axis to drill down into its details</p>
    <p>
      <strong>Note:</strong> Parent values are calculated as the average of their
      children's values
    </p>
    <div class="chart-container">
      <SpiderChart
        data={hierarchicalData}
        title="Product Evaluation"
        description="Comprehensive assessment of product qualities"
        rationale="This evaluation is used for product development prioritization and marketing"
      />
    </div>
  </div>

  <div class="example">
    <h2>Nested Hierarchical Data Example</h2>
    <p>
      Demonstrates recursive calculation of values from deeply nested children
    </p>
    <div class="chart-container">
      <SpiderChart
        data={nestedHierarchicalData}
        title="Multi-level Product Quality Assessment"
        description="Hierarchical evaluation with multiple levels"
        rationale="Values are calculated by averaging all child values recursively"
      />
    </div>
  </div>
</div>

<style>
  .examples {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  h1 {
    text-align: center;
    margin-bottom: 40px;
  }

  .example {
    margin-bottom: 60px;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  h2 {
    margin-top: 0;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }

  .chart-container {
    height: 400px;
    margin-top: 20px;
  }
</style>
