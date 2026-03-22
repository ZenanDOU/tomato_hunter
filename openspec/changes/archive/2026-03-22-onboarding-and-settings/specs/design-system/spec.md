## ADDED Requirements

### Requirement: Spotlight overlay component
The system SHALL provide a SpotlightOverlay component that renders a semi-transparent dark overlay with a rectangular cutout around a target element. The component SHALL use the pixel-style design system aesthetics.

#### Scenario: Spotlight renders around target
- **WHEN** SpotlightOverlay receives a target element reference
- **THEN** a dark overlay (rgba(0,0,0,0.7)) covers the entire viewport with a rectangular cutout matching the target element's bounding rect plus 8px padding

#### Scenario: Spotlight repositions on resize
- **WHEN** the window is resized while SpotlightOverlay is active
- **THEN** the cutout position updates to match the target element's new position

### Requirement: Pixel tooltip component
The system SHALL provide a PixelTooltip component with pixel-style border (2px #333333), cream background (#FFF8E8), and configurable arrow direction. The tooltip SHALL support title text, description text, and action buttons.

#### Scenario: Tooltip renders with content
- **WHEN** PixelTooltip is rendered with title "侦查" and description "在这里创建任务"
- **THEN** it displays a pixel-bordered box with title in bold, description below, and 2px pixel-black border with right-bottom shadow

#### Scenario: Tooltip arrow points to target
- **WHEN** PixelTooltip position is "bottom" relative to target
- **THEN** an upward-pointing pixel arrow appears at the top edge of the tooltip, pointing toward the target element
