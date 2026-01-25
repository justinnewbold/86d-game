# Phase 1 — Onboarding + Weekly Feedback

**Objective:** Improve early retention and clarity of the core loop.

## Scope
- Guided first-3-weeks tutorial with prompts and explainers.
- Weekly recap panel explaining profit/loss drivers.
- Actionable insights panel with top 2-3 next actions.
- Save slot naming + last played metadata.

## User Stories
- As a new player, I want a guided first month so I understand how choices affect cash flow.
- As a returning player, I want a quick weekly summary to see what changed.
- As a player, I want clear next actions so I don’t stall.

## Functional Requirements
### Tutorial
- Step-driven prompts triggered by week milestones.
- Skip/exit path at any time.
- Completion badge or reward.

### Weekly Recap
- Shows revenue, labor, rent, food cost, marketing.
- Highlights largest deltas vs. prior week.
- Includes 1-2 narrative callouts (e.g., “Vendor price creep +4%”).

### Actionable Insights
- Top 2-3 recommendations with rationale.
- Each recommendation maps to a single UI action.
- Prioritize based on cash runway, morale, and staffing.

### Save Slots
- Name slots, last played timestamp, current week.

## Non-Functional Requirements
- Must work on iOS/Android/Web.
- Minimal extra taps (max 2 to dismiss recap).
- Recap and insights accessible from a dashboard entry point.

## Analytics
- tutorial_start, tutorial_complete
- recap_viewed, recap_dismissed
- insight_clicked

## Open Questions
- Should tutorial be mandatory for first run?
- Should weekly recap be auto-opened or user-triggered?
- How many insights per week is too many?
