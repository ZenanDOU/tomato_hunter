## ADDED Requirements

### Requirement: Application error boundary
The application SHALL display a friendly error screen instead of a blank page when a rendering error occurs. The error screen SHALL show an error description and a "Reload" button. ErrorBoundary components SHALL wrap the main village layout and the hunt window layout independently.

#### Scenario: Component rendering error caught
- **WHEN** a React component throws an error during rendering
- **THEN** the ErrorBoundary catches the error and displays a pixel-styled error screen with a reload button instead of a white screen

#### Scenario: Hunt window error does not crash village
- **WHEN** the hunt window encounters a rendering error
- **THEN** only the hunt window shows the error screen; the main village window remains functional

### Requirement: Keyboard shortcuts
The application SHALL support keyboard shortcuts for core actions: Escape to close modals/panels, Space to pause/resume the timer during focus phase, and Enter to confirm/submit in prep and review phases.

#### Scenario: Escape closes modal
- **WHEN** user presses Escape while a modal (lore, settings) is open in the village
- **THEN** the modal closes

#### Scenario: Space pauses timer
- **WHEN** user presses Space during focus phase
- **THEN** the timer pauses; pressing Space again resumes

#### Scenario: Enter confirms review
- **WHEN** user presses Enter in review phase (not inside a textarea)
- **THEN** the review form submits

### Requirement: ARIA accessibility labels
All icon-only buttons SHALL have an `aria-label` attribute describing their function. Dialog/modal containers SHALL have `role="dialog"` and `aria-modal="true"`. Form inputs SHALL have associated `aria-label` attributes.

#### Scenario: Icon button has label
- **WHEN** a screen reader encounters an icon-only button (e.g., the lore 📜 button)
- **THEN** it reads the button's `aria-label` (e.g., "View world lore")

#### Scenario: Dialog announced correctly
- **WHEN** a modal opens
- **THEN** the container has `role="dialog"` and `aria-modal="true"`
