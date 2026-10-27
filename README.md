# Fomi — Frontend Assessment

Two surfaces for Fomi's AI image and video platform:

| Route | What it is |
|---|---|
| `/` | **Part A**: the provided mockup, built as a responsive, production-quality generation page. |
| `/workspace` | **Part B**: an original Image Generation Workspace for professionals (lineage, directions, locks, deliverable slots). See [PRODUCT_THINKING.md](PRODUCT_THINKING.md). |

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests for the mock generation engine
npm run lint
npm run build && npm start
```

Deploys to Vercel as-is (no environment variables).

## Stack

Next.js 16 (App Router) · JavaScript · Tailwind CSS v4 · `lucide-react` icons. No other runtime dependencies.

## Structure

```
src/
  app/
    page.js                     Part A (server component, prerenders the first history page)
    workspace/page.js           Part B
    api/generations/route.js    Mock API: GET (paginated history), POST (validated generation, fake latency, ?fail=1)
    layout.js, globals.css      Fonts, flash-free theme script, design tokens (light + dark)
  components/
    ui/          Button, IconButton, Select, SegmentedControl, Accordion, Toast, Spinner
    layout/      TopNav, HistoryStrip, ThemeToggle, Logo
    generate/    Part A: Studio (state owner), PromptPanel, GenerationFeed, GenerationBatch,
                 MediaCard, Lightbox*, Gallery*                       (* code-split)
    workspace/   Part B: WorkspaceApp, LineagePanel, Stage, CompareSlider, DirectionComposer,
                 BriefPanel, CommandPalette*
  hooks/         useGenerations (Part A history), useProject (Part B reducer + lineage helpers)
  data/          catalog.js (models, ratios, styles), generations.js (mock DB), project.js, media.json
  lib/           api.js (fetch wrappers), mock-engine.js (+ test)
public/media/    Images and short clips used by the mock API
```

## Notable decisions

- **Native elements first:** `<dialog>` (focus trap, Esc, inert background), `<details>` (accordions), `<select>` (pickers), and radios for segmented controls. Accessibility and mobile behaviour come free, with less JavaScript.
- **Optimistic generation:** a pending batch with skeletons and progress appears instantly and is replaced in place when the API responds. Failures become an inline retry. Deletes and slot placement have Undo.
- **Designed per breakpoint:** on mobile, Part A uses a bottom tab bar plus a thumb-reachable composer that expands into a settings sheet. Tablet gets a two-column layout, desktop matches the mockup, and large screens get wider panels with a capped content width. Part B shows one panel at a time on mobile, uses a brief drawer on laptops, and has three columns on desktop.
- **Work survives a reload:** your generations, the prompt you were writing, favorites and the whole Part B project (branches, slots, locks) are saved in `localStorage`. Saved data is read after hydration, so prerendering still works. If storage is blocked, the app works as before; it just doesn't remember. A Part B iteration that was running during a reload comes back as "Interrupted", with Retry.
- **Long generations stay manageable:** you can cancel a pending batch (the request is aborted). The tab title shows `(n) Generating…`, a toast with "View" appears when a batch finishes off-screen, and the browser warns before you close the tab mid-generation.
- **Shortcuts:** Part A: `/` focus prompt, `Ctrl/⌘+Enter` generate, `↑` in an empty prompt recalls the last one. Part B: `⌘K` palette, `J/K` iterations, `←/→` options, `C` compare, `1–4` place in slot, `/` direct.
- **Theme:** an inline script applies the saved or system theme before first paint, so there's no flash.

## Credits

Photos: [Unsplash](https://unsplash.com/license). Video clips: [Mixkit](https://mixkit.co/license/). Both are free to use.
