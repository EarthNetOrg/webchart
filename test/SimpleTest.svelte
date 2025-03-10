<script>
  import SpiderChart from "../src/lib/SpiderChart.svelte";
  import Breadcrumbs from "../src/lib/Breadcrumbs.svelte";

  // Your original data structure
  const originalData = [
    {
      axis: "Performance",
      value: 85,
      description: "Overall system performance",
      rationale: "Sum of speed, reliability, and efficiency metrics",
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
      value: 75,
      description: "Product capabilities",
      rationale: "Sum of usability, functionality, and flexibility scores",
      children: [
        { axis: "Usability", value: 80, rationale: "User testing scores" },
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
      value: 70,
      description: "Customer support quality",
      rationale: "Sum of documentation, community, and response time metrics",
      children: [
        {
          axis: "Documentation",
          value: 65,
          rationale: "Completeness and clarity of docs",
          onClick: () => {
            console.log("Documentation clicked with custom handler");
            return true;
          },
          children: [
            {
              axis: "API Docs",
              value: 60,
              rationale: "API documentation quality",
            },
            {
              axis: "User Guides",
              value: 70,
              rationale: "User guide completeness",
            },
          ],
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
  ];

  // Configuration with debugging enabled
  const config = {
    interactive: true,
    showAxisLabels: true,
    showAxisLines: true,
    showLevelLabels: true,
    levels: 5,
    min: 0,
    max: 100,
    opacity: 0.5,
    strokeWidth: 2,
    animationDuration: 500,
  };

  let chart;

  // Navigation state for external breadcrumbs - using $state for reactivity in Svelte 5
  let navigationPath = $state([]);
  let currentLevel = $state("Home");

  function logChartState() {
    if (chart) {
      console.log("Chart internal state:");
      console.log("- navigationPath:", chart.navigationPath);
      console.log("- navigationHistory:", chart.navigationHistory);
      console.log("- currentSeries:", chart.currentSeries);

      // Update our external navigation path
      if (chart.navigationPath) {
        navigationPath = [...chart.navigationPath];
        currentLevel =
          navigationPath.length > 0
            ? navigationPath[navigationPath.length - 1].axis
            : "Home";
      }
    } else {
      console.error("Chart not initialized");
    }
  }

  function navigateToSupport() {
    if (!chart) {
      console.error("Chart not initialized");
      return;
    }

    const supportItem = originalData.find((item) => item.axis === "Support");
    if (!supportItem) {
      console.error("Support item not found");
      return;
    }

    console.log("Manually navigating to Support");
    if (typeof chart.navigateToChildren === "function") {
      chart.navigateToChildren(supportItem);

      // Update our external navigation path
      setTimeout(() => {
        if (chart.navigationPath) {
          navigationPath = [...chart.navigationPath];
          currentLevel = "Support";
        }
      }, 100);
    } else {
      console.error("navigateToChildren function not available");
    }
  }

  function fixDocumentationAxis() {
    if (!chart) {
      console.error("Chart not initialized");
      return;
    }

    // Check if we're at the Support level
    if (!chart.navigationPath || chart.navigationPath.length === 0) {
      console.log("Not at Support level yet, navigating to Support first");
      navigateToSupport();

      // Wait for navigation to complete before continuing
      setTimeout(() => {
        fixDocumentationAxis_internal();
      }, 300);
      return;
    }

    fixDocumentationAxis_internal();
  }

  // Internal function to fix the Documentation axis
  function fixDocumentationAxis_internal() {
    const lastPathItem = chart.navigationPath[chart.navigationPath.length - 1];
    if (lastPathItem.axis !== "Support") {
      console.error("Not at Support level, current level:", lastPathItem.axis);
      return;
    }

    // Get the current series
    const currentSeries = chart.currentSeries;
    if (
      !currentSeries ||
      currentSeries.length === 0 ||
      !currentSeries[0].data
    ) {
      console.error("Current series is invalid");
      return;
    }

    console.log("Current series before fix:", currentSeries);
    console.log(
      "Current series data axes:",
      currentSeries[0].data.map((d) => d.axis)
    );

    // Find the Documentation item in the original data
    const supportItem = originalData.find((item) => item.axis === "Support");
    if (!supportItem || !supportItem.children) {
      console.error("Support item not found in original data");
      return;
    }

    const docItem = supportItem.children.find(
      (item) => item.axis === "Documentation"
    );
    if (!docItem) {
      console.error("Documentation item not found in original data");
      return;
    }

    console.log("Original Documentation item:", docItem);

    // Look for any Documentation-like items in the current series
    const existingDocItem = currentSeries[0].data.find(
      (item) =>
        item.axis === "Documentation" ||
        item.axis === "More Documentation" ||
        item.axis.includes("Documentation")
    );

    console.log("Found existing Documentation-like item:", existingDocItem);

    // Create a new data array with the correct Documentation item
    const newData = [];

    // Add the Documentation item with the correct name and ensure it has children
    newData.push({
      axis: "Documentation", // Use the exact name from the original data
      value: docItem.value,
      rationale: docItem.rationale,
      children: [...docItem.children], // Make sure to clone the children array
      onClick: docItem.onClick,
    });

    // Add all other items except Documentation-like items
    for (const item of currentSeries[0].data) {
      if (!item.axis.includes("Documentation")) {
        newData.push(item);
      }
    }

    // Update the current series
    chart.currentSeries = [
      {
        name: "Support",
        data: newData,
      },
    ];

    console.log("Fixed current series:", chart.currentSeries);
    console.log("Fixed Documentation item:", newData[0]);
    console.log("Documentation children:", newData[0].children);

    // Force an update
    if (typeof chart.forceUpdate === "function") {
      chart.forceUpdate();
      console.log("Forced chart update");

      // Update our breadcrumbs after fixing
      setTimeout(logChartState, 100);

      // Try to navigate to Documentation after fixing
      setTimeout(() => {
        tryNavigateToDocumentation();
      }, 500);
    } else if (typeof chart.updateChart === "function") {
      chart.updateChart();
      console.log("Updated chart");

      // Update our breadcrumbs after fixing
      setTimeout(logChartState, 100);

      // Try to navigate to Documentation after fixing
      setTimeout(() => {
        tryNavigateToDocumentation();
      }, 500);
    } else {
      console.error("No update function available");
    }
  }

  // Function to try navigating to Documentation
  function tryNavigateToDocumentation() {
    if (!chart) {
      console.error("Chart not initialized");
      return;
    }

    console.log("Trying to navigate to Documentation");

    // Check if the chart has a direct test function for Documentation navigation
    if (typeof chart.testNavigateToDocumentation === "function") {
      console.log(
        "Using chart's built-in testNavigateToDocumentation function"
      );
      chart.testNavigateToDocumentation();

      // Update our external navigation path after a delay
      setTimeout(updateBreadcrumbs, 500);
      return;
    }

    // If no direct test function, use our step-by-step approach
    console.log("Using step-by-step navigation approach");

    // First, check if we're at the Support level
    const isAtSupportLevel =
      chart.navigationPath &&
      chart.navigationPath.length > 0 &&
      chart.navigationPath[chart.navigationPath.length - 1].axis === "Support";

    if (!isAtSupportLevel) {
      console.log("Not at Support level, navigating to Support first");
      navigateToSupport();

      // Wait for navigation to complete before continuing
      setTimeout(() => {
        // Fix the Documentation axis and then try to navigate
        fixDocumentationAxis_internal();

        // Wait for the fix to complete before navigating
        setTimeout(() => {
          navigateToDocumentation();
        }, 300);
      }, 300);
      return;
    }

    // If we're already at Support level, make sure Documentation is fixed
    if (!chart.currentSeries || chart.currentSeries.length === 0) {
      console.error("Current series not available");
      fixDocumentationAxis_internal();

      // Wait for the fix to complete before navigating
      setTimeout(() => {
        navigateToDocumentation();
      }, 300);
      return;
    }

    // Now try to navigate to Documentation
    navigateToDocumentation();
  }

  // Helper function to actually navigate to Documentation
  function navigateToDocumentation() {
    if (!chart || !chart.currentSeries || chart.currentSeries.length === 0) {
      console.error("Chart or current series not available");
      return;
    }

    // Find the Documentation item in the current series
    const docItem = chart.currentSeries[0].data.find(
      (item) => item.axis === "Documentation"
    );

    if (!docItem) {
      console.error("Documentation item not found in current series");
      console.log(
        "Available items:",
        chart.currentSeries[0].data.map((item) => item.axis)
      );
      return;
    }

    console.log("Found Documentation item:", docItem);
    console.log("Documentation children:", docItem.children);

    // Navigate to Documentation
    if (typeof chart.navigateToChildren === "function") {
      chart.navigateToChildren(docItem);
      console.log("Navigated to Documentation");

      // Update our external navigation path
      setTimeout(updateBreadcrumbs, 100);
    } else {
      console.error("navigateToChildren function not available");
    }
  }

  // Handle navigation from external breadcrumbs
  function onNavigate(index) {
    if (chart && typeof chart.handleNavigate === "function") {
      console.log("External breadcrumb navigation to index:", index);
      chart.handleNavigate(index);

      // Force immediate update of our state
      logChartState();
    }
  }

  // Handle reset from external breadcrumbs
  function onReset() {
    if (chart && typeof chart.handleReset === "function") {
      console.log("External breadcrumb reset");
      chart.handleReset();

      // Force immediate update
      navigationPath = [];
      currentLevel = "Home";
      console.log("Reset navigation state");
    }
  }

  // Function to manually update the breadcrumbs
  function updateBreadcrumbs() {
    if (chart && chart.navigationPath) {
      console.log("Manually updating breadcrumbs");
      console.log("Chart navigation path:", chart.navigationPath);

      navigationPath = [...chart.navigationPath];
      currentLevel =
        navigationPath.length > 0
          ? navigationPath[navigationPath.length - 1].axis
          : "Home";

      console.log("Updated navigation path:", navigationPath);
      console.log("Updated current level:", currentLevel);
    } else {
      console.error("Chart or navigation path not available");
    }
  }

  // Set up an interval to periodically update the breadcrumbs
  // This ensures they stay in sync with the chart's internal state
  let updateInterval;

  $effect(() => {
    // Set up the interval when the component is mounted
    updateInterval = setInterval(() => {
      if (chart && chart.navigationPath) {
        const chartPath = chart.navigationPath;

        // Only update if there's a difference
        if (
          chartPath.length !== navigationPath.length ||
          (chartPath.length > 0 &&
            navigationPath.length > 0 &&
            chartPath[chartPath.length - 1].axis !==
              navigationPath[navigationPath.length - 1].axis)
        ) {
          navigationPath = [...chartPath];
          currentLevel =
            navigationPath.length > 0
              ? navigationPath[navigationPath.length - 1].axis
              : "Home";

          console.log("Auto-updated breadcrumbs to match chart state");
        }
      }
    }, 200); // Check more frequently (200ms)

    // Clean up the interval when the component is unmounted
    return () => {
      clearInterval(updateInterval);
    };
  });
</script>

<div class="container">
  <h1>Spider Chart Simple Test</h1>

  <div class="chart-container">
    <h2>Multi-Level Navigation Test</h2>
    <p>
      This chart tests multi-level navigation with the Documentation item having
      children.
    </p>

    <!-- External Breadcrumbs for better visibility -->
    <div class="external-breadcrumbs">
      <h3>Current Navigation Path:</h3>
      <Breadcrumbs path={navigationPath} {onNavigate} {onReset} title="Home" />
      <div class="current-level">
        <strong>Current Level:</strong>
        {currentLevel}
      </div>
    </div>

    <div class="chart" style="height: 800px">
      <SpiderChart
        bind:this={chart}
        data={originalData}
        {config}
        title="Test Chart"
        description="Testing multi-level navigation"
        rationale="This chart is for debugging purposes"
        height="800px"
        width="100%"
      />
    </div>
  </div>

  <div class="debug-panel">
    <h3>Debug Controls</h3>
    <div class="button-group">
      <button onclick={logChartState}>Log Chart State</button>
      <button onclick={navigateToSupport} class="primary-button"
        >1. Navigate to Support</button
      >
      <button onclick={fixDocumentationAxis} class="primary-button"
        >2. Fix Documentation Axis</button
      >
    </div>

    <div class="button-group">
      <button onclick={tryNavigateToDocumentation} class="doc-button">
        3. Navigate to Documentation
      </button>
      <button onclick={updateBreadcrumbs} class="update-button">
        Update Breadcrumbs
      </button>
    </div>

    <div class="instructions">
      <h4>Instructions:</h4>
      <ol>
        <li>Click "1. Navigate to Support" to go to the Support level</li>
        <li>Then try to click on "Documentation" in the chart</li>
        <li>
          If clicking on Documentation doesn't work, click "2. Fix Documentation
          Axis"
        </li>
        <li>
          After fixing, you can click "3. Navigate to Documentation" to directly
          navigate to the Documentation level
        </li>
        <li>Check the console logs for debugging information</li>
      </ol>
      <p class="note">
        <strong>Note:</strong> The issue is that sometimes the axis name in the chart
        appears as "More Documentation" instead of "Documentation". The "Fix Documentation
        Axis" button corrects this by ensuring the exact name matches what's in your
        data.
      </p>
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  h1 {
    text-align: center;
    margin-bottom: 30px;
  }

  .chart-container {
    margin-bottom: 40px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .chart {
    height: 500px;
    margin-top: 20px;
  }

  .debug-panel {
    background-color: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    margin-top: 30px;
  }

  .button-group {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 10px;
  }

  button {
    background-color: #4caf50;
    border: none;
    color: white;
    padding: 10px 15px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 14px;
    cursor: pointer;
    border-radius: 4px;
    flex: 1;
  }

  .primary-button {
    background-color: #2196f3;
    font-weight: bold;
  }

  .update-button {
    background-color: #9c27b0;
    font-weight: bold;
  }

  .doc-button {
    background-color: #ff9800;
    font-weight: bold;
  }

  button:hover {
    opacity: 0.9;
  }

  .instructions {
    margin-top: 20px;
    padding: 15px;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .instructions h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #333;
  }

  ol {
    margin: 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }

  .note {
    margin-top: 15px;
    padding: 10px;
    background-color: #fff3cd;
    border-left: 4px solid #ffc107;
    color: #856404;
  }

  /* External breadcrumbs styling */
  .external-breadcrumbs {
    margin: 20px 0;
    padding: 15px;
    background-color: #e3f2fd;
    border-radius: 6px;
    border-left: 4px solid #2196f3;
  }

  .external-breadcrumbs h3 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #0d47a1;
    font-size: 16px;
  }

  .external-breadcrumbs-nav {
    margin-bottom: 10px;
  }

  .external-breadcrumb-item {
    background-color: #bbdefb;
    color: #0d47a1;
    font-weight: bold;
  }

  .current-level {
    margin-top: 10px;
    font-size: 14px;
    color: #0d47a1;
  }
</style>
