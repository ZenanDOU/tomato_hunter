## ADDED Requirements

### Requirement: Bestiary collection view by family
The system SHALL provide a bestiary collection view that organizes all 15 species by their 5 ecological families. Each family section shows the family name, habitat, and a row of 3 species (prey → predator → apex). This view is embedded within the hunter profile tab.

#### Scenario: All families displayed
- **WHEN** the bestiary collection view renders
- **THEN** all 5 families are shown: 锈蚀机械兽, 枯彩幻灵, 蛀典书灵, 荒野蔓生兽, 迷雾幻形体

#### Scenario: Species within family ordered by tier
- **WHEN** a family section renders
- **THEN** species are ordered left-to-right: prey (幼年), predator (成年), apex (王级)

### Requirement: Species discovery state from task history
The system SHALL determine species discovery state by querying tasks with status='killed'. A species is "discovered" if at least one task with matching monster_variant has been killed. First discovery date is the earliest completed_at among those tasks.

#### Scenario: Species discovered via killed task
- **WHEN** a task with monster_variant="work-gear-bug" and status="killed" exists
- **THEN** the species "齿轮虫" is marked as discovered in the bestiary

#### Scenario: Species not discovered if only hunting
- **WHEN** a task with monster_variant="work-gear-bug" exists but status is "hunting" (not killed)
- **THEN** the species remains undiscovered in the bestiary

#### Scenario: Kill count aggregation
- **WHEN** multiple killed tasks share monster_variant="work-gear-bug"
- **THEN** the bestiary shows the total count of killed tasks for that species
