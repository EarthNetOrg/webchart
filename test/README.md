# SpiderChart Test App

This is a simple test application for the SpiderChart component. It provides a UI for testing multi-level navigation and debugging any issues.

## Running the Test App

To run the test app, use the following commands:

```bash
# Start the development server
pnpm dev:test

# Build the test app
pnpm build:test

# Preview the built test app
pnpm preview:test
```

## Features

The test app includes:

1. A simple test case with multi-level navigation
2. A more complex example with your original data structure
3. Debug tools for inspecting the chart state
4. Navigation buttons for testing different levels of navigation
5. A fix button for resolving issues with axis names

## Debugging

When using the test app:

1. Open your browser's developer console to see debug logs
2. Use the "Log Chart State" button to inspect the internal state
3. Follow the numbered navigation buttons in sequence
4. If navigation doesn't work, try the "Fix Chart State" button

## Troubleshooting

If you encounter issues with multi-level navigation:

1. Check the console logs for error messages
2. Verify that the axis names match between the data and the chart
3. Try the "Navigate to Exact Documentation" button which uses the exact axis name
4. Use the "Fix Chart State" button to manually correct the axis names 