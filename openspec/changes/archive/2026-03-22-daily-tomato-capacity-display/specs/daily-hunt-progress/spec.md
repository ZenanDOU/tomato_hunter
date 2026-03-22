## MODIFIED Requirements

### Requirement: Daily progress summary bar
The system SHALL display a progress summary bar at the top of the DailyPlanBoard showing the overall daily energy consumption status, anchored to the user's daily budget.

#### Scenario: Progress bar displays energy ratio
- **WHEN** user views the DailyPlanBoard
- **THEN** the top area SHALL show a PixelProgressBar with completed pomodoros / daily budget (e.g., "已用 5 / 预算 12 🍅"), updating in real-time as pomodoros complete

#### Scenario: Progress bar shows remaining energy context
- **WHEN** user views the progress summary
- **THEN** below the progress bar, the system SHALL display remaining energy (t3) and remaining task demand (t4) as prominent paired numbers, plus estimated remaining time based on t4 × weapon focus duration

#### Scenario: All tasks completed
- **WHEN** all planned pomodoros for the day are completed and no active tasks remain
- **THEN** the progress bar SHALL show 100% fill with a celebratory label "今日讨伐完成！🎉"
