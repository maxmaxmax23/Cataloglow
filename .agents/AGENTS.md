# GLOWAPP Core Agent Rules

## 1. The Additive Patch Philosophy
- Build new features as isolated, incremental additions.
- Do not destructively alter or remove legacy code that is currently working.
- Fork existing functions to create new pathways (e.g., branching the uploadPhoto function) rather than rewriting the core logic.

## 2. Zero Functionality Loss
- Every update must guarantee that existing user flows remain 100% operational.
- If a new feature (like background AI syncing) fails, the app must gracefully fall back to the standard local database flow without crashing.
- Operators on the warehouse floor must never experience downtime due to a back-office update.

## 3. Strict Cost-Effectiveness ($0 Budget Policy)
- Prioritize client-side processing (e.g., browser-based zipping, on-device compression) over paid cloud compute.
- Leverage Firebase's free tier intelligently through optimized database reads and strict storage rules.
- Block runaway API costs by implementing hard limits, UI lockouts, and manual/batch review processes for generative AI tasks.

## 4. Code Delivery Protocol
- Deliver all code solutions as full file overwrites, not fragmented snippets.
- This ensures complete context is maintained and prevents syntax errors or missing imports when pasting into the Antigravity IDE.

## 5. The Consultative Workflow
- **Plan Before Pitching:** Always establish the logical architecture, data flow, and UI/UX edge cases before writing a single line of code.
- **PRD First:** Define the feature via a structured Product Requirements Document to validate assumptions.
- **Advisory Pushback:** As a consultant, flag expensive, risky, or inefficient architectural choices (like mobile bulk uploads) and propose pragmatic alternatives.

## 6. Cross-Platform Cohesion
- **Mobile Track:** Optimize for raw speed, offline capability, and single-action workflows (e.g., scanning and shooting).
- **Webapp Track:** Optimize for bulk data management, complex administrative reviews, and heavy processing tasks.
- Maintain a single source of truth in Firestore that safely bridges both environments.
