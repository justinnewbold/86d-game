# Phase 2 — Depth + Balance

**Objective:** Add systems depth while keeping complexity approachable.

## Scope
- Scenario timeline with cause/effect tagging.
- Milestone goals (monthly/quarterly objectives).
- Equipment lifecycle (maintenance, depreciation, upgrades).
- Difficulty presets (casual, standard, hardcore).
- Expanded staff dynamics and LTO menu experimentation.

## User Stories
- As a player, I want a timeline to understand how scenarios affected my results.
- As a mid-game player, I want periodic goals to stay motivated.
- As a strategist, I want difficulty presets to match my play style.

## Functional Requirements
### Scenario Timeline
- Log scenarios with tags (cost, reputation, staffing, marketing).
- Display sortable timeline with filters.

### Milestone Goals
- Generate goals based on progress and location count.
- Reward completion with bonuses or unlocks.

### Equipment Lifecycle
- Maintenance schedule with failure probability.
- Upgrade paths to reduce downtime.

### Difficulty Presets
- Modifiers for costs, scenario frequency, and demand.
- Surfaced during new game setup.

### Staff + Menu Experimentation
- Training levels and turnover risk.
- LTO performance metrics and customer feedback.

## Analytics
- timeline_opened
- goal_completed
- difficulty_selected
- lto_created

## Open Questions
- How to balance LTO variance without overwhelming UX?
- Should difficulty be changeable mid-run?
