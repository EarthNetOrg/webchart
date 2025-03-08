# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.7] - 2024-07-11

### Added
- Enhanced title display to show the current axis name when viewing children charts
- Improved navigation context by dynamically updating the title based on the current drill-down level

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