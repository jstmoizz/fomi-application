"use client";

import { memo, useEffect, useId, useState } from "react";
import { Dices, Image as ImageIcon, SlidersHorizontal, Sparkles, Video, X } from "lucide-react";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Select from "@/components/ui/Select";
import { ASPECTS, COUNTS, DURATIONS, MODELS, PROMPT_MAX, STYLES } from "@/data/catalog";

const MODE_OPTIONS = [
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "video", label: "Video", icon: Video },
];

const PLACEHOLDER = {
  image: "Describe your imagination to be converted into a piece of art…",
  video: "Describe a shot: subject, motion and camera move…",
};

// The composer. Desktop/tablet: a fixed left column. Mobile: a bottom bar that expands into a sheet.
function PromptPanel({ draft, onChange, onGenerate, pendingCount, lastPrompt, textareaRef }) {
  const [expanded, setExpanded] = useState(false);
  const promptId = useId();
  const { mode, prompt } = draft;
  const settings = draft.settings[mode];
  const canSubmit = prompt.trim().length > 0 && prompt.length <= PROMPT_MAX;

  const set = (patch) => onChange((d) => ({ ...d, ...patch }));
  const setSetting = (key, value) =>
    onChange((d) => ({ ...d, settings: { ...d.settings, [d.mode]: { ...d.settings[d.mode], [key]: value } } }));

  function submit(e) {
    e?.preventDefault();
    if (!canSubmit) return;
    setExpanded(false);
    onGenerate();
  }

  // Esc closes the mobile sheet.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => e.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  return (
    <>
      {/* Mobile scrim behind the expanded sheet */}
      <div
        aria-hidden="true"
        onClick={() => setExpanded(false)}
        className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] transition-opacity duration-250 md:hidden ${
          expanded ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <form
        aria-label="Create"
        onSubmit={submit}
        data-expanded={expanded}
        className="group/panel flex flex-col gap-3 bg-panel p-3 max-md:fixed max-md:inset-x-0 max-md:bottom-[calc(61px+env(safe-area-inset-bottom))] max-md:z-40 max-md:max-h-[78dvh] max-md:rounded-t-[24px] max-md:border-t max-md:border-line max-md:shadow-float md:h-full md:overflow-y-auto md:rounded-[22px]"
      >
        <div className="flex items-center gap-2 max-md:hidden max-md:group-data-[expanded=true]/panel:flex">
          <SegmentedControl
            label="Output type"
            name="mode"
            value={mode}
            onChange={(m) => set({ mode: m })}
            options={MODE_OPTIONS}
            className="flex-1"
          />
          <IconButton label="Close settings" icon={X} onClick={() => setExpanded(false)} tooltip={false} className="md:hidden" />
        </div>

        {/* Prompt box — last on mobile so it stays by the thumb while the sheet grows upward */}
        <div className="relative rounded-[16px] border border-ink/80 bg-surface shadow-card transition-[border-color,box-shadow] duration-150 focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--accent-soft)] max-md:order-last">
          <label htmlFor={promptId} className="sr-only">
            Prompt
          </label>
          <textarea
            id={promptId}
            ref={textareaRef}
            value={prompt}
            onChange={(e) => set({ prompt: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
              // Terminal-style recall: ↑ in an empty box brings back the last prompt.
              if (e.key === "ArrowUp" && !prompt && lastPrompt) {
                e.preventDefault();
                set({ prompt: lastPrompt });
              }
            }}
            maxLength={PROMPT_MAX + 200}
            rows={2}
            placeholder={PLACEHOLDER[mode]}
            aria-describedby={`${promptId}-hint`}
            className="block max-h-[40dvh] min-h-14 w-full resize-none bg-transparent px-3.5 pt-3 text-[13px] leading-relaxed text-ink outline-none [field-sizing:content] placeholder:text-ink-3 md:min-h-36"
          />
          <div className="flex items-center justify-between gap-2 px-2 pb-2 pl-3.5">
            <span id={`${promptId}-hint`} className="text-[10px] tabular-nums text-ink-3">
              {prompt.length > PROMPT_MAX * 0.8 ? (
                <span className={prompt.length > PROMPT_MAX ? "font-semibold text-danger" : ""}>
                  {prompt.length}/{PROMPT_MAX}
                </span>
              ) : (
                <span className="max-md:hidden">
                  <kbd className="font-sans">Ctrl</kbd> + <kbd className="font-sans">Enter</kbd> to generate
                </span>
              )}
            </span>
            <div className="flex items-center gap-1.5">
              <IconButton
                label="Prompt settings"
                icon={SlidersHorizontal}
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                tooltip={false}
                className="md:hidden"
              />
              <Button type="submit" variant="primary" size="md" disabled={!canSubmit} className="group/gen">
                <Sparkles
                  size={15}
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-out group-hover/gen:rotate-12 group-hover/gen:scale-110"
                />
                Generate
                {pendingCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white/25 px-1 text-[10px] tabular-nums" aria-label={`${pendingCount} in progress`}>
                    {pendingCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Settings: always visible on md+, inside the expanded sheet on mobile */}
        <div className="flex flex-col gap-3 max-md:hidden max-md:overflow-y-auto max-md:group-data-[expanded=true]/panel:flex">
          <div className="flex flex-wrap gap-2">
            <Select
              label={mode === "image" ? "Number of images" : "Number of clips"}
              hideLabel
              value={settings.count}
              onChange={(v) => setSetting("count", Number(v))}
              options={COUNTS[mode].map((n) => ({ value: n, label: `${n} ${mode === "image" ? "img" : "clip"}${n > 1 ? "s" : ""}` }))}
            />
            <Select
              label="Aspect ratio"
              hideLabel
              value={settings.aspect}
              onChange={(v) => setSetting("aspect", v)}
              options={ASPECTS[mode].map((a) => ({ value: a, label: a }))}
            />
            {mode === "video" && (
              <Select
                label="Clip length"
                hideLabel
                value={settings.duration}
                onChange={(v) => setSetting("duration", Number(v))}
                options={DURATIONS.map((d) => ({ value: d, label: `${d}s` }))}
              />
            )}
            <Select
              label="Model"
              value={settings.model}
              onChange={(v) => setSetting("model", v)}
              options={MODELS[mode].map((m) => ({ value: m.id, label: m.name }))}
              className="min-w-[150px] flex-1"
            />
          </div>

          <Accordion title="Advanced" badge={draft.negativePrompt || draft.seed !== "" ? "On" : null}>
            <AdvancedFields draft={draft} set={set} />
          </Accordion>

          <Accordion title="Styles" badge={draft.style} defaultOpen>
            <div role="group" aria-label="Style" className="flex flex-wrap gap-1.5">
              {STYLES.map((s) => {
                const on = draft.style === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set({ style: on ? null : s })}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-[background-color,border-color,color,transform] duration-150 active:scale-95 ${
                      on
                        ? "border-transparent bg-ink text-bg"
                        : "border-line text-ink-2 hover:border-line-strong hover:text-ink"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </Accordion>
        </div>
      </form>
    </>
  );
}

function AdvancedFields({ draft, set }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label htmlFor={`${id}-neg`} className="mb-1 block text-xs font-medium text-ink-2">
          Negative prompt
        </label>
        <textarea
          id={`${id}-neg`}
          value={draft.negativePrompt}
          onChange={(e) => set({ negativePrompt: e.target.value })}
          rows={2}
          placeholder="What to avoid: blur, extra fingers, text…"
          className="block w-full resize-none rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent"
        />
      </div>
      <div>
        <label htmlFor={`${id}-seed`} className="mb-1 block text-xs font-medium text-ink-2">
          Seed <span className="font-normal text-ink-3">· same seed + prompt = same result</span>
        </label>
        <div className="flex gap-2">
          <input
            id={`${id}-seed`}
            inputMode="numeric"
            value={draft.seed}
            onChange={(e) => set({ seed: e.target.value.replace(/\D/g, "").slice(0, 9) })}
            placeholder="Random"
            className="h-9 min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-3 text-xs tabular-nums text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent"
          />
          <IconButton
            label="Random seed"
            icon={Dices}
            tone="solid"
            onClick={() => set({ seed: String(Math.floor(Math.random() * 1e9)) })}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(PromptPanel);
