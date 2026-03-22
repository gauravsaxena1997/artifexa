# UX/UI Principles

## Product Experience Direction
- Not chat-first.
- Guided workspace with visible progress and structured outcomes.
- Human-readable process language over technical jargon.

## Naming & Information Architecture
Preferred top-level term: **Studios**
- Product Studio
- Creative / Media Studio
- (future) Marketing Studio, etc.

Avoid user-facing terms as primary nav labels:
- pipeline
- simulator
- agent swarm

## Landing Page Structure
1. Hero
   - clear value statement
   - fast CTA into a studio
2. Studios Grid
   - scalable cards with short purpose + example
3. How It Works
   - simple 3-4 step visual
4. Example Outcomes
   - input -> output showcase
5. Minimal Footer

## Studio Workspace Layout
Three-panel layout:
- **Left: Input Panel**
  - text input
  - upload + OCR
  - mode selector
- **Center: Process View**
  - stage timeline/status
  - expandable step summaries
  - `Show Thinking` toggle
- **Right: Output Panel**
  - prompt/doc/json tabs
  - copy/download/regenerate actions

## Process Visualization
Prefer stage cards and statuses over raw logs:
- Understanding input
- Planning
- Specialist execution
- Quality review
- Refinement
- Final output

## Canvas/Document Interaction
For document-heavy outputs:
- open side canvas on demand (not default)
- support scroll, copy, download
- future-ready for version history

## Micro-UX Requirements
- useful empty-state examples
- descriptive loading states (which stage is running)
- clear non-technical error recovery messages
- mobile-responsive stacking behavior for 3-panel layout

## Scale UX Strategy (5-10+ studios)
- searchable studio directory
- category filters (Creative, Product, Business)
- consistent card template and workspace shell

## Core UX Principle
Users should feel guided by expert collaboration without being forced to parse technical internals.
