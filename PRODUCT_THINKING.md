# Fomi Workspace — Product Thinking

**Live:** `<your-vercel-url>/workspace` (Part B) · `<your-vercel-url>/` (Part A)

## 1. What problem was I trying to solve?

Today's AI image tools are built around a **single prompt box and an endless feed**. That works for someone trying the product once. It breaks down for a professional who spends hours a day on one client project:

- **Iteration gets lost.** You try "warmer", then "closer crop", then go back to the version from before "warmer". In a chronological feed that version is 40 images down, and the reasoning behind it is gone.
- **Consistency is manual.** The same character, palette and lens have to be retyped into every prompt, and one forgotten phrase breaks the campaign.
- **There is no finish line.** The real job is "a 16:9 web hero, a 3:4 product shot, a 1:1 post and a 9:16 story". Generators know nothing about that, so creators track it in their heads, in Figma or in a spreadsheet.

**Who I designed for:** a professional creator (agency designer, in-house brand creative, freelance art director). They are signed in, returning to an existing client project, and live in the tool for hours. They know what they want, care about speed and control, and are measured on delivering a set of on-brand assets.

## 2. The three most important UX decisions

1. **Lineage instead of a feed.** Every generation is a node that remembers its parent and the *direction* that produced it ("Golden hour window light"). The left panel is the project's iteration tree, and the stage breadcrumb shows the path (`Mara · base look › Bigger smile › Golden hour`). You can branch from any point, and nothing is lost.
   *Why:* creative work is exploratory and non-linear. A tree matches how people actually think ("what if we went the other way from here?") and makes going back free.

2. **Directions, not prompts.** The composer asks "what should change?" rather than "describe everything again". You type *softer shadows* or tap a nudge (Warmer, Closer crop…). The system composes the full prompt from the parent prompt, the direction and the active locks.
   *Why:* models keep getting better at following instructions, so the bottleneck moves from prompt engineering to art direction. The interface should feel like directing a photographer, not writing a spec.

3. **The brief is always on screen: deliverable slots plus locks.** The right panel shows what this project must ship (slots with aspect ratios and a progress bar, 2/4) and what must stay true (locks for character, palette, light and lens, carried into every iteration). Placing an option into a slot is one click, or the keys `1`–`4`.
   *Why:* it turns "generating images" into "finishing a job". The workspace knows when you're done, and consistency becomes a toggle instead of a discipline.

Supporting decisions: **Compare with parent** (a wipe slider that shows exactly what your last direction changed), a **⌘K command palette** that lists every action with its shortcut so pros learn the fast path, and **J/K, ←/→, C, /, 1–4** shortcuts for a keyboard-first workflow.

## 3. What I intentionally left out

| Left out | Why |
|---|---|
| Community / explore feed | The brief is a workspace for someone on a client project. Inspiration browsing is a different mode and belongs elsewhere. |
| Model marketplace and dozens of model knobs | Model choice is inherited per lineage branch. Exposing every parameter optimises for tinkerers, not professionals shipping work ("maximum capability, minimum complexity"). |
| Node-graph editor | Powerful but heavy. The lineage tree gives 80% of the benefit (branching, history) with almost no learning curve. |
| Credits / upsell banners in the workspace | Every pixel should have a purpose, and that purpose is the work. |
| Full editing tools (masking, inpainting) | A separate workspace in Fomi's product. Mixing them would blur the core loop: direct → compare → place. |
| Real-time multiplayer | Valuable for agencies (see §5), but not needed to prove the core idea. |

## 4. Products that inspired me

- **Figma:** the panel layout (structure left, canvas centre, properties right) and the command-palette culture. *I'd improve:* nothing to fix; I borrowed the mental model.
- **Cursor:** describe a *change* rather than rewriting everything, and the diff/compare view. That inspired "directions" and "compare with parent".
- **Git:** branching history where nothing is lost and any point can be revisited.
- **Krea / Leonardo / Higgsfield:** fast generation and beautiful result grids. *I'd improve:* they are feed-first, so history becomes a scroll problem, and there is no notion of a project brief or consistency across outputs.
- **Magnific / OpenArt:** clean, professional dark UIs and strong model controls. *I'd improve:* the left panel tries to show every setting at once. I'd hide what's inherited and show only what changes.
- **Instagram / Pinterest:** effortless simplicity. I kept the one-thumb mobile pattern: on phones the workspace becomes *review → compare → place*, not full editing.

## 5. With another month

- **Real persistence and resume:** autosave the project tree, and open exactly where you left off on any device.
- **Smarter locks:** extract a lock from any image ("lock this palette", "lock this face") instead of choosing from presets, plus visual drift warnings when a result breaks a lock.
- **Slot-aware generation:** generate *for* a slot (correct aspect, safe areas, text space for the web hero) and export the finished pack in one click.
- **Collaboration:** share a branch with a client, collect comments on nodes, and approve or reject straight into slots.
- **Video-specific stage:** a timeline scrubber, shot-to-shot continuity locks, and compare that plays both clips in sync.
- **Measured quality:** usability tests with 5–8 working creatives, plus instrumentation (time to fill all slots, branches per slot, how often people revert).

## 6. What differentiates this workspace

**The project brief drives the workspace.** Lineage, locks and deliverable slots work together: you direct changes instead of rewriting prompts, every attempt is kept in a tree you can branch from, consistency is enforced by locks, and the workspace tracks progress toward the actual deliverables. Most AI tools help you *make images*. This one helps you *finish a job*.

## Design trade-offs

- **Prioritised:** the core loop (direct → compare → place), keyboard speed, and always-visible project state.
- **Simplified:** model and settings are inherited from the branch you're on, not re-chosen every time. Locks are on/off switches, not weighted sliders. The lineage is an indented tree, not a free-form canvas.
- **Removed:** feeds, marketplace, upsells and per-generation parameter panels.
- **Why:** a professional's scarcest resources are attention and consistency. Every removal protects one of them. The cost is less raw flexibility per generation, which I think is the right trade for people delivering client work.

---

### Engineering notes (both parts)

- **Next.js 16 App Router, JavaScript, Tailwind CSS v4.** Pages are server-rendered and statically prerendered. Only interactive leaves are client components. Overlays (lightbox, gallery, command palette) are code-split with `next/dynamic`.
- **Mock backend:** `GET/POST /api/generations` with validation, simulated latency, error simulation (`?fail=1`) and a deterministic keyword-matching "model". Both Part A and Part B use it.
- **Performance:** `next/image` everywhere with blur placeholders generated at build time, `fetchPriority` on the above-the-fold image, lazy loading elsewhere, memoised feed components. Lighthouse (mobile): Accessibility 100, Best Practices 96–100, SEO 100, CLS ≤ 0.07.
- **Accessibility:** native `<dialog>`, `<details>` and `<select>` for free focus management and keyboard support, labelled controls, skip link, `role="switch"` locks, an accessible range input for the compare slider, `prefers-reduced-motion`, WCAG AA contrast (axe: 0 violations, light and dark).
