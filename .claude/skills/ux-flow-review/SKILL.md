---
name: ux-flow-review
description: >
  On-demand UX/flow and visual-design audit for factulink-front (Angular 20 + CoreUI). Delegates
  to two specialist sub-agents — one evaluating how understandable each module's real-world flow
  is (forms, navigation, feedback, errors, consistency across ~15 CRUD modules), the other
  evaluating color usage and proposing a palette that aids identification (active/inactive,
  success/warning/danger, document types) without visual fatigue. Produces a prioritized,
  trade-off-aware report — never auto-implements. Separate, opt-in track from the regular
  fix/test workflow.
  Trigger: "revisar UX", "revisión de flujos", "auditoría de UX", "paleta de colores", "mejorar
  experiencia de usuario", "ux-flow-review", "identidad visual", "cómo se ve el sistema".
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- User explicitly asks for a UX/flow review, a visual/color review, or invokes `/ux-flow-review`.
- After a batch of backend/frontend fixes is stable and the user wants to step back and look at
  overall usability instead of individual bugs.
- **NOT** triggered automatically at the end of a session, and **NOT** folded into the regular
  maintenance/fix/test loop. If the user hasn't asked for it, don't suggest running it — this is
  a deliberately separate, opt-in track (per explicit user instruction: "un apartado aparte que no
  debe afectar el flujo normal").

## Critical Patterns

### Pattern 0: Scope confirmation

If the user's request doesn't already specify it, confirm before launching sub-agents:
- All ~15 CRUD modules (Categoria, Marca, Unidad, Moneda, TipoDocumento, MetodoPago, Serie, Banco,
  Sucursal, Cliente, Proveedor, Producto, Almacen, Kardex, Cotizacion, Compra, Venta), or a subset?
- Review only, or does the user also want a follow-up implementation pass for approved proposals?
  (Default: review only — implementation is always a separate, explicit next step.)

If scope was already stated in the request, skip the question and proceed.

### Pattern 1: Two blind specialist sub-agents, never an inline review

Launch both via the `Agent` tool, in parallel, each blind to the other's findings:

- **Flow Auditor** — walks through each module's list → create → edit → delete flow. Judges
  clarity of forms, navigation depth, feedback on actions (does the user know something
  succeeded/failed?), error message quality, number of steps to complete a task, and consistency
  of patterns across modules (a user shouldn't have to relearn the UI module to module).
- **Visual/Color Auditor** — audits current color usage (status badges, buttons, alerts, CoreUI
  theme variables) and proposes a semantic palette: active/inactive, success/warning/danger,
  document-type identification. Optimizes for both quick identification AND avoiding visual
  fatigue (contrast, saturation, repetition) — a "good impression" palette, not a loud one.

Do the synthesis yourself as orchestrator — never review inline instead of delegating. Keeping the
review out of the main thread is the whole point of this being a separate track.

### Pattern 2: Prefer seeing the real app over reading code alone

A UX judgment made purely from reading `.html`/`.ts` files misses spacing, real rendered contrast,
and actual flow friction. Before delegating, check whether the `run` skill (or an equivalent
screenshot-capable path: `ng serve` + a browser/screenshot tool) is usable in the current
environment:

- **If yes**: instruct both sub-agents to start the app and navigate through real screens
  (screenshots > descriptions) for at least the create/edit modal and the list/search page of a
  representative sample of modules (don't need all ~15 — 4-5 covering different patterns is
  enough to generalize, e.g. one simple catalog like `brand`, one with a rich form, one with a
  parent-child relationship like `quotation`/`sale`).
- **If no**: fall back to a thorough code-based review (templates, CoreUI class usage, form
  validation rules, error-handling in services/components) and say so explicitly in the report —
  don't silently pretend it was a visual review.

### Pattern 3: Findings are proposals, not edits

This skill **never modifies code** as part of the review itself. Every finding must include:
1. What's confusing/inconsistent today, with a concrete file or screen reference
2. A concrete proposal (not just "this is bad")
3. Trade-offs — effort vs impact, and what else changes if the pattern is shared across modules

Implementation of any approved proposal is always a **separate, explicit** follow-up task the user
requests afterward — never auto-chained from the review.

### Pattern 4: The palette is a visual artifact, not hex codes in prose

A palette described only as `#00A24F, #FFC900...` in text is unreviewable — the user needs to see
it. The Visual/Color Auditor's output must be rendered as an `Artifact` (HTML) showing real
swatches, applied to mocked-up examples of this app's own components (a status badge, a table row,
an alert), not a generic color wheel. Load the `dataviz`/`artifact-design` skills for the
contrast-validation methodology and light/dark-theme awareness, but adapt the semantics to this
app's needs (active/inactive, success/warning/danger, document types) — this is not a
data-visualization palette.

### Pattern 5: Report persists, isn't just chat

Save the synthesized report to `docs/ux-review/{YYYY-MM-DD}-review.md` in factulink-front (create
`docs/ux-review/` if it doesn't exist) so findings survive across sessions and can be tracked over
time, in addition to summarizing in chat. If Engram is available, also `mem_save` a short
`discovery`/`project`-type entry pointing to the report path and its top 3 findings, so future
sessions know it exists without re-reading the whole file.

## Decision Tree

```
User asks for a UX/flow or color review
│
├── Scope unclear (all modules? which ones? review-only or implement too)?
│   └── Pattern 0 — ask, then continue
│
▼
Check if visual inspection is possible (run skill / ng serve + screenshots)
│
├── Yes → sub-agents will navigate real screens
└── No  → sub-agents do a thorough code-based review (say so in the report)
│
▼
Launch Flow Auditor + Visual/Color Auditor in parallel (Agent tool, blind to each other)
│
▼
Wait for both to complete
│
▼
Synthesize: cross-reference findings (e.g. a Flow finding about "can't tell active vs
inactive at a glance" should link to the Visual Auditor's palette proposal that solves it)
│
▼
Render the palette as an Artifact (Pattern 4)
▼
Write the report to docs/ux-review/{date}-review.md (Pattern 5) + mem_save summary
▼
Present prioritized findings to the user in chat — ask which proposals (if any) they want
implemented. Do NOT implement anything unless explicitly told to.
```

## Sub-Agent Prompt Templates

### Flow Auditor Prompt

```
You are auditing the UX of factulink-front (Angular 20 + CoreUI), a business ERP frontend
(inventory, invoicing, purchases, sales, quotations). Your job is to judge how understandable
the app is for a REAL, non-technical business user — not whether the code is well-written.

## Scope
{list of modules to review, or "all ~15 CRUD modules" — sample deeply on 4-5 covering different
patterns (simple catalog, rich form, parent-child relationship) rather than shallow on all}

## Method
{if visual inspection is available}
Start the app (see the `run` skill) and actually navigate: open the list page, open create/edit
modals, submit valid and invalid data, delete a record, use search/filters. Take screenshots of
anything confusing.
{if not available}
Read the actual component templates, form builders, and error-handling code for the modules in
scope — do not guess from memory, read the real files.

## What to judge
- Can a first-time user tell what a button/action will do before clicking it?
- Does the app give clear feedback after create/edit/delete (success, failure, why)?
- Are error messages actionable (tell the user what to fix) or generic ("Error")?
- How many steps/screens does a common task take? Any unnecessary friction?
- Is the pattern consistent across modules, or does each one behave slightly differently in a
  way that forces the user to relearn?
- Anything that actively misleads (e.g. a button that looks disabled but isn't, or vice versa)?

## Return format
For each finding:
- Module/screen: {name + file path}
- What's confusing today: {concrete description}
- Proposal: {concrete alternative}
- Trade-off: {effort vs impact; does this pattern repeat elsewhere?}

Do not praise. Do not summarize what already works well unless directly relevant to a trade-off.
Be concrete — vague findings ("improve UX") are not useful.
```

### Visual/Color Auditor Prompt

```
You are auditing the color system of factulink-front (Angular 20 + CoreUI). Your job is to
propose a palette that helps a business user quickly IDENTIFY things (active/inactive records,
success/warning/danger states, document types) while giving a professional, calm impression —
not a loud or fatiguing one.

## Method
{if visual inspection is available}
Start the app and look at real screens: status badges, buttons, alerts/toasts, table rows.
{if not available}
Read the actual CSS/SCSS, CoreUI theme variables in use, and component templates for color
classes (bg-success, badge colors, etc.) across the modules in scope.

## What to evaluate
- Is color used consistently for the same meaning across modules (e.g. is "inactive" always the
  same shade of gray/red everywhere, or does it vary)?
- Contrast: does anything fail basic readability (light text on light background, etc.)?
- Fatigue: is there overuse of saturated/loud colors that would feel exhausting over a full
  workday of use?
- Does the palette work in both light and dark theme if the app supports theme switching?
- Where color is the ONLY signal (no icon/text), is that a problem for accessibility?

## Deliverable
Propose a concrete semantic palette (not a generic color wheel): specific colors for
active/inactive, success/warning/danger/info, and any document-type or category identification
need found in the app. Give hex values AND where each is currently used vs where you'd apply it.

Load the `dataviz`/`artifact-design` skills for the contrast-validation method and theme-awareness
approach, adapting the semantics to this app rather than to charts.

## Return format
- Current state: {what's used today, module by module if it varies}
- Proposed palette: {semantic name → hex, with contrast notes}
- Trade-off: {what changes if adopted everywhere vs just in new/updated modules}
```

## Output Format

```markdown
# Revisión de UX y Diseño Visual — factulink-front
Fecha: {date}
Alcance: {modules reviewed}
Método: {visual (screenshots) | código (sin renderizado), y por qué}

## Resumen ejecutivo
{2-3 sentences: overall impression, most impactful finding}

## Hallazgos de flujo (Flow Auditor)
| Módulo/Pantalla | Qué confunde hoy | Propuesta | Esfuerzo/Impacto |
|---|---|---|---|
| ... | ... | ... | ... |

## Hallazgos visuales/color (Visual Auditor)
| Elemento | Estado actual | Propuesta | Esfuerzo/Impacto |
|---|---|---|---|
| ... | ... | ... | ... |

## Paleta propuesta
{link to the rendered Artifact with swatches}

## Prioridad sugerida
1. {quick win, high impact}
2. {quick win, lower impact}
3. {bigger investment, high impact}
...

## Qué NO se tocó
{anything explicitly out of scope this pass}
```

After presenting this, ask the user: "¿Cuáles de estas propuestas querés que implemente?" — never
implement without an explicit answer.

## Commands

```bash
# No CLI — pure orchestration skill. Triggered via the Skill tool or `/ux-flow-review`.
# If visual inspection is used, the sub-agent invokes the `run` skill / `ng serve` itself.
```

## Resources

- **Templates**: See [assets/report-template.md](assets/report-template.md) for the exact report
  skeleton to fill in.
- **Related skills**: `dataviz` and `artifact-design` (color/contrast methodology, reused not
  duplicated — adapt semantics, don't copy their palette wholesale), `run` (launching the app for
  visual inspection).
