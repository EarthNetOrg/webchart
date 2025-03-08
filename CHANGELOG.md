# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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