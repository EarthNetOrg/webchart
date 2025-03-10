<script lang="ts">
  import SpiderChart from "../src/lib/SpiderChart.svelte";
  import { onMount } from "svelte";

  // Reference to original chart component
  let originalChart: any;

  // Simple test data with multiple levels
  const testData = [
    {
      axis: "Level 1",
      value: 80,
      description: "Top level item",
      rationale: "Testing multi-level navigation",
      children: [
        {
          axis: "Level 2A",
          value: 70,
          description: "Second level item A",
          rationale: "Should have children",
          onClick: () => {
            return true; // Allow normal navigation
          },
          children: [
            { axis: "Level 3A", value: 60, rationale: "Third level item A" },
            { axis: "Level 3B", value: 80, rationale: "Third level item B" },
          ],
        },
        { axis: "Level 2B", value: 90, description: "Second level item B" },
      ],
    },
  ];

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
          description: "Measured in transactions per second",
          rationale: "Very fast",
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

  // Function to manually navigate to Support
  function navigateToSupport() {
    if (!originalChart) {
      console.error("Original chart not initialized");
      return;
    }

    const supportItem = originalData.find((item) => item.axis === "Support");
    if (!supportItem) {
      console.error("Support item not found");
      return;
    }

    console.log("Manually navigating to Support");
    // Access the component's internal navigateToChildren function
    if (typeof originalChart.navigateToChildren === "function") {
      originalChart.navigateToChildren(supportItem);
    } else {
      console.error("navigateToChildren function not available");
    }
  }

  // Function to manually navigate to Documentation
  function navigateToDocumentation() {
    if (!originalChart) {
      console.error("Original chart not initialized");
      return;
    }

    const supportItem = originalData.find((item) => item.axis === "Support");
    if (!supportItem || !supportItem.children) {
      console.error("Support item or its children not found");
      return;
    }

    const docItem = supportItem.children.find(
      (item) => item.axis === "Documentation"
    );
    if (!docItem) {
      console.error("Documentation item not found");
      return;
    }

    console.log("Manually navigating to Documentation");
    console.log("Documentation item:", docItem);
    console.log("Children:", (docItem as any).children);

    // Access the component's internal navigateToChildren function
    if (typeof originalChart.navigateToChildren === "function") {
      // First navigate to Support if not already there
      if (
        originalChart["navigationPath"] &&
        originalChart["navigationPath"].length === 0
      ) {
        originalChart.navigateToChildren(supportItem);

        // Then navigate to Documentation after a short delay
        setTimeout(() => {
          originalChart.navigateToChildren(docItem);
        }, 500);
      } else {
        // Directly navigate to Documentation
        originalChart.navigateToChildren(docItem);
      }
    } else {
      console.error("navigateToChildren function not available");
    }
  }

  // Function to manually navigate to Documentation with exact axis name
  function navigateToExactDocumentation() {
    if (!originalChart) {
      console.error("Original chart not initialized");
      return;
    }

    // First navigate to Support
    const supportItem = originalData.find((item) => item.axis === "Support");
    if (!supportItem) {
      console.error("Support item not found");
      return;
    }

    console.log("Manually navigating to Support");
    originalChart.navigateToChildren(supportItem);

    // Wait for the chart to update
    setTimeout(() => {
      // Get the current series from the chart
      const currentSeries = originalChart["currentSeries"];
      console.log("Current series after navigating to Support:", currentSeries);

      if (!currentSeries || currentSeries.length === 0) {
        console.error("Current series is empty after navigating to Support");
        return;
      }

      // Log all available axes
      const availableAxes = currentSeries[0].data.map((p: any) => p.axis);
      console.log("Available axes:", availableAxes);

      // Find the Documentation item with the exact name from the console logs
      const docItem = currentSeries[0].data.find(
        (item: any) =>
          item.axis === "More Documentation" || item.axis === "Documentation"
      );

      if (!docItem) {
        console.error("Documentation item not found with either name");
        return;
      }

      console.log("Found Documentation item:", docItem);
      console.log("Children:", (docItem as any).children);

      // Navigate to Documentation
      originalChart.navigateToChildren(docItem);
    }, 500);
  }

  onMount(() => {
    console.log("Test page mounted");
  });
</script>

<div class="container">
  <h1>Spider Chart Test Page</h1>

  <div class="chart-container">
    <h2>Simple Test Case</h2>
    <p>
      This is a simplified test case with just one top-level item and
      multi-level navigation.
    </p>
    <div class="chart">
      <SpiderChart
        data={testData}
        {config}
        title="Test Chart"
        description="Testing multi-level navigation"
        rationale="This chart is for debugging purposes"
        height="400px"
        width="100%"
      />
    </div>
  </div>

  <div class="chart-container">
    <h2>Original Data Structure</h2>
    <p>
      This is your original data structure with the Documentation item having
      children.
    </p>
    <div class="chart" style="height: 400px">
      <SpiderChart
        bind:this={originalChart}
        data={originalData}
        {config}
        title="Original Chart"
        description="Testing with original data"
        rationale="This chart uses your original data structure"
        height="400px"
        width="400px"
      />
    </div>
  </div>

  <div class="debug-panel">
    <h3>Debug Panel</h3>
    <p>Check the browser console for debug messages.</p>

    <div class="button-group">
      <h4>Data Inspection</h4>
      <button on:click={() => console.log("Current test data:", testData)}>
        Log Test Data
      </button>
      <button
        on:click={() => console.log("Current original data:", originalData)}
      >
        Log Original Data
      </button>
      <button
        on:click={() => {
          if (originalChart) {
            console.log("Chart internal state:");
            console.log("- navigationPath:", originalChart["navigationPath"]);
            console.log(
              "- navigationHistory:",
              originalChart["navigationHistory"]
            );
            console.log("- currentSeries:", originalChart["currentSeries"]);
          } else {
            console.error("Chart not initialized");
          }
        }}
      >
        Log Chart State
      </button>
    </div>

    <div class="button-group">
      <h4>Test Navigation</h4>
      <button
        on:click={() => {
          // Find the Documentation data point
          const supportSeries = originalData.find(
            (item) => item.axis === "Support"
          );
          if (supportSeries && supportSeries.children) {
            const docItem = supportSeries.children.find(
              (item) => item.axis === "Documentation"
            );
            if (docItem) {
              console.log("Found Documentation item:", docItem);
              console.log("Children:", (docItem as any).children);
            } else {
              console.log("Documentation item not found");
            }
          } else {
            console.log("Support series not found");
          }
        }}
      >
        Test Find Documentation
      </button>
    </div>

    <div class="button-group">
      <h4>Navigation Actions</h4>
      <button on:click={navigateToSupport} class="primary-button">
        1. Navigate to Support
      </button>

      <button on:click={navigateToDocumentation} class="primary-button">
        2. Navigate to Documentation
      </button>

      <button on:click={navigateToExactDocumentation} class="primary-button">
        3. Navigate to Exact Documentation
      </button>

      <button
        on:click={() => {
          if (
            originalChart &&
            typeof originalChart.testNavigateToDocumentation === "function"
          ) {
            originalChart.testNavigateToDocumentation();
          } else {
            console.error("Test navigation function not available");
          }
        }}
        class="primary-button"
      >
        4. Test Direct Navigation
      </button>
    </div>

    <div class="button-group">
      <h4>Fixes</h4>
      <button
        on:click={() => {
          if (!originalChart) {
            console.error("Original chart not initialized");
            return;
          }

          // Get the current series from the chart
          const currentSeries = originalChart["currentSeries"];
          console.log("Current series before fix:", currentSeries);

          // Check if we're at the Support level
          const navigationPath = originalChart["navigationPath"];
          if (!navigationPath || navigationPath.length === 0) {
            console.error("Not at Support level yet");
            return;
          }

          const lastPathItem = navigationPath[navigationPath.length - 1];
          if (lastPathItem.axis !== "Support") {
            console.error(
              "Not at Support level, current level:",
              lastPathItem.axis
            );
            return;
          }

          // Find the Documentation item in the original data
          const supportItem = originalData.find(
            (item) => item.axis === "Support"
          );
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

          // Directly set the current series to include the Documentation item with the correct name
          const newData = [];

          // Add the Documentation item with the correct name
          newData.push({
            axis: "Documentation", // Use the exact name from the original data
            value: docItem.value,
            rationale: docItem.rationale,
            children: (docItem as any).children,
            onClick: (docItem as any).onClick,
          });

          // Add all other items except Documentation
          if (currentSeries[0] && currentSeries[0].data) {
            for (const item of currentSeries[0].data) {
              if (
                item.axis !== "More Documentation" &&
                item.axis !== "Documentation"
              ) {
                newData.push(item);
              }
            }
          }

          originalChart["currentSeries"] = [
            {
              name: "Support",
              data: newData,
            },
          ];

          console.log("Fixed current series:", originalChart["currentSeries"]);

          // Force an update
          if (typeof originalChart.forceUpdate === "function") {
            originalChart.forceUpdate();
          } else if (typeof originalChart.updateChart === "function") {
            originalChart.updateChart();
          } else {
            console.error("No update function available");
          }
        }}
        class="fix-button"
      >
        Fix Chart State
      </button>
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
    overflow: hidden; /* Prevent content from expanding outside */
  }

  .chart {
    margin-top: 20px;
    height: 400px; /* Fixed height */
    width: 100%;
    position: relative;
    overflow: hidden; /* Prevent content from expanding outside */
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
  }

  .button-group h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
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
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 4px;
  }

  .primary-button {
    background-color: #2196f3;
    font-weight: bold;
    display: block;
    width: 100%;
    margin: 8px 0;
    padding: 12px;
  }

  .fix-button {
    background-color: #ff5722;
    font-weight: bold;
    display: block;
    width: 100%;
    margin: 8px 0;
    padding: 12px;
  }

  button:hover {
    opacity: 0.9;
  }

  .primary-button:hover {
    background-color: #0b7dda;
  }

  .fix-button:hover {
    background-color: #e64a19;
  }

  .spider-chart-container {
    position: relative;
    height: 400px !important; /* Force fixed height */
    max-height: 400px !important; /* Limit maximum height */
    overflow: hidden !important; /* Prevent content from expanding outside */
  }

  .spider-chart {
    min-height: 300px;
    height: 400px !important; /* Force fixed height */
    max-height: 400px !important; /* Limit maximum height */
    overflow: hidden !important; /* Prevent content from expanding outside */
  }
</style>
