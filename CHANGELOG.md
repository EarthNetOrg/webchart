# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.9.13] - 2024-07-16

### Added
- Added direct `min` and `max` props to the component for easier configuration of chart value ranges
- Updated documentation to reflect the new props and their usage

### Changed
- Improved the configuration merging to properly handle min and max values from both props and config
- Enhanced the visual appearance of axis labels with a two-layer approach for better clickability

## [0.1.9.12] - 2024-07-16

### Fixed
- Fixed issue where axis labels were only partially clickable when the chart first loads
- Improved clickability of axis labels by making the entire label group capture mouse events
- Increased the clickable area around labels for better user experience
- Enhanced event handling to ensure consistent behavior between initial render and after navigation

## [0.1.9.11] - 2024-07-15

### Fixed
- Fixed persistent issue with breadcrumb navigation where clicking on Support would still display the top-level chart
- Added special handling for Support level navigation to ensure correct data is displayed
- Improved navigation logic to prioritize finding data in the original dataset before falling back to history
- Enhanced parent-child relationship tracking for more reliable navigation between levels

## [0.1.9.10] - 2024-07-15

### Fixed
- Fixed issue where chart axes weren't updating correctly when navigating with breadcrumbs
- Improved series restoration from history with proper deep cloning
- Added recursive search for data points in the original data to ensure complete information
- Enhanced fallback mechanisms when history data is unavailable or incomplete

## [0.1.9.9] - 2024-07-15

### Fixed
- Fixed breadcrumb navigation issue where clicking on Support would display the Home level instead of the Support level
- Improved history management in breadcrumb navigation to ensure correct state restoration
- Added fallback navigation mechanism when history is not available
- Enhanced tooltip positioning with proper state management in Svelte 5

## [0.1.9.8] - 2024-07-15

### Fixed
- Fixed breadcrumb navigation issue when clicking on Support after navigating to Documentation
- Fixed tooltip positioning issue where tooltips would appear in the top-left corner
- Added proper state management for tooltip positioning in Svelte 5
- Improved error handling in tooltip positioning logic

## [0.1.9.7] - 2024-07-15

### Fixed
- Fixed issue with Documentation axis navigation when clicking directly on the axis
- Added special handling for Documentation axis to ensure proper navigation path
- Improved reactivity with enhanced state management for navigation paths
- Cleaned up console logs to reduce verbosity while maintaining essential debugging information

### Changed
- Enhanced the reactive effect system to ensure currentSeries is always properly populated
- Added more robust error checking throughout the navigation process
- Improved user experience by providing better fallback mechanisms for navigation

## [0.1.7] - 2024-07-11

### Added
- Enhanced title display to show the current axis name when viewing children charts
- Updated description to show "Viewing details for [axis name]" when navigating to children
- Added support for displaying axis-specific rationale text when available
- Improved navigation context by dynamically updating all text elements based on the current drill-down level

### Changed
- Modified Breadcrumbs component to not display the current axis in the navigation path
- Simplified breadcrumb navigation by only showing parent levels, avoiding redundancy with the title

## [0.1.6] - 2024-07-10

### Changed
- Enhanced Breadcrumbs component with customizable `breadcrumbsClass` prop (default: "breadcrumbs")
- Simplified breadcrumb styling by removing specific color styling for better theme integration
- Improved CSS structure in Breadcrumbs component for easier customization
- Reorganized SpiderChart layout to display breadcrumbs above the title and description

## [0.1.5] - 2024-07-10

### Changed
- Improved Breadcrumbs component to use chart title instead of "Home" text
- Breadcrumbs are now only shown when the user is not at the top level of the chart
- Added title prop to Breadcrumbs component with a default value of "Home"

## [0.1.4] - 2024-03-10

### Changed
- Replaced direct tooltip styling props (`tooltipBackgroundColor` and `tooltipTextColor`) with a single `tooltipClass` prop
- Added default global styles for the tooltip that can be overridden with custom CSS
- Updated documentation and examples to demonstrate the new class-based tooltip customization

## [0.1.3] - 2024-03-08

### Changed
- Modified hierarchical value calculation to use average of children instead of sum
- Updated examples and documentation to reflect the new calculation method

## [0.1.2] - 2024-03-08

### Added
- Tooltips now appear when hovering over axis labels
- Visual feedback for all axis labels on hover (not just clickable ones)

## [0.1.1] - 2024-03-08

### Fixed
- Fixed tooltip positioning issue where tooltips would appear far away from data points
- Tooltips now appear right beside the data point labels
- Added proper handling of SVG coordinate transformations for accurate tooltip placement

## [0.1.0] - Initial Release

### Added
- Initial release of the Svelte Spider Chart component
- Interactive radar/spider chart with drill-down capabilities
- Customizable appearance and behavior
- Tooltips for data inspection
- Breadcrumb navigation for multi-level data 