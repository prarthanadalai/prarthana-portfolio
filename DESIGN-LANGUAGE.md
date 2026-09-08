# Design Language — "Warm Sketchbook Minimalism"

A reusable spec for the Prarthana Dalai portfolio. Capture the pieces below and you
can build matching pages anywhere.

The whole site is built on one metaphor: **a designer's paper desk** — cream paper,
sticky notes, polaroids, masking tape, handwritten captions, marker highlights, and
dashed "torn" dividers. Everything inherits from that.


## 1. Core personality (the 5 rules)

1. **Warm cream paper, never white.** Backgrounds are off-cream (#F7F3EB), with a
   faint SVG noise grain overlaid at 4% opacity (multiply blend) so it reads like
   real paper.
2. **One accent color: lilac/violet.** Used sparingly for emphasis, links, and the
   "ink" highlights. Three "sticky-note" secondaries (sun yellow, rose, mint) appear
   only as playful tints.
3. **Two-voice typography.** A clean geometric sans for structure + an *italic serif*
   for emotion/emphasis. Almost every heading mixes both — the italic serif word is
   the "felt" word.
4. **Physical paper objects, slightly rotated.** Cards, photos, and notes sit at
   small tilts (-3deg to +8deg), cast soft paper shadows, and straighten on hover.
   Tape/sticker accents pin them down.
5. **Hand-drawn touches.** Caveat handwriting font for captions, marker-underline
   SVGs under italic words, glyph bullets (flower / sparkle / arrow), dashed dividers
   instead of solid rules.


## 2. Color tokens

```css
/* Paper (backgrounds, light -> dark) */
--paper:   #F7F3EB;  --paper-2: #FFFCF6;  --paper-3: #EDE6D5;  --paper-4: #E1D8C2;

/* Ink (text, dark -> light) */
--ink:   #1F1A2E;  --ink-2: #4A4358;  --ink-3: #8B8497;  --ink-4: #BAB3C0;
--ink-line: #2D2640;

/* Lilac — the single accent */
--lilac: #7B5FC4;  --lilac-deep: #5A3FA8;  --lilac-soft: #E5D8F2;  --lilac-tint: #F4ECFA;

/* Sticky-note tints (decorative only) */
--sun:  #F5D67D;  --sun-soft:  #FCEEC2;
--rose: #FFB5C5;  --rose-soft: #FCDFE7;
--mint: #A8D5B8;  --mint-soft: #DBEEDF;
--sky:  #B8D5F5;

/* Borders (warm) */
--border: #D9D0BC;  --border-soft: #E8E0CB;  --border-ink: #1F1A2E;
```

Usage discipline:
- Body text = --ink-2, headings = --ink, captions/meta = --ink-3.
- The italic-serif emphasis word is always --lilac-deep.
- Soft tints (*-soft) fill cards; the saturated versions (--sun, --rose) are for
  tape/stickers only.


## 3. Typography

| Role                  | Font                        | Notes                                                        |
|-----------------------|-----------------------------|--------------------------------------------------------------|
| Body / headings       | Plus Jakarta Sans (400-800) | letter-spacing -0.02em, font-feature-settings "ss01","cv11"  |
| Emphasis / emotion    | Lora italic (500)           | second "voice" — one word per heading, dates, pull quotes    |
| Meta / labels / nums  | JetBrains Mono (400-500)     | uppercase, letter-spacing 0.08-0.10em, tabular-nums          |
| Captions / notes      | Caveat (handwriting)        | polaroid captions, sticky notes, to-do titles                |

Font variables:
```css
--font-body:   'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
--font-italic: 'Lora', Georgia, "Times New Roman", serif;
--font-mono:   'JetBrains Mono', ui-monospace, "SF Mono", Menlo, monospace;
--font-hand:   'Caveat', "Comic Sans MS", cursive;
```

Google Fonts link:
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:ital,wght@0,400..700;1,400..700&family=JetBrains+Mono:wght@400;500&family=Caveat:wght@500..700&display=swap" rel="stylesheet" />
```

Type scale (px, fixed):
```css
--t-2xs: 11px;  --t-xs: 12.5px;  --t-sm: 14px;  --t-base: 16px;  --t-md: 18px;
--t-lg: 21px;   --t-xl: 26px;    --t-2xl: 34px; --t-3xl: 44px;   --t-4xl: 56px;
--t-5xl: 72px;  --t-6xl: 96px;   --t-7xl: 128px;
```

The signature heading move — sans + inline italic serif with a marker underline:
```html
<h2 class="section__title">Selected <em>work</em></h2>
```
```css
.section__title    { font-weight: 700; letter-spacing: -0.035em; line-height: 0.96; }
.section__title em { font-family: var(--font-italic); font-style: italic; font-weight: 500; color: var(--lilac-deep); }
```

Big display headings use clamp(), e.g. hero clamp(48px, 8vw, 110px), with
line-height: 0.95, letter-spacing: -0.04em, and text-wrap: balance.


## 4. Spacing, layout & radii

```css
/* 8pt spacing scale */
--s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px; --s-5: 24px;
--s-6: 32px; --s-8: 48px; --s-10: 64px; --s-12: 96px; --s-16: 128px; --s-20: 192px;

/* Layout */
--container: 1180px;  --gutter: 24px;  --nav-h: 68px;

/* Radii — soft, organic */
--r-sm: 8px;  --r-md: 14px;  --r-lg: 22px;  --r-pill: 999px;
```

- Container: max-width 1180px, gutter 24px (-> 18px tablet, 16px mobile).
- Section rhythm: generous — padding-block: clamp(64px, 8vw, 120px).
- Section header pattern: two-column grid (title left, deck right, align-items: end)
  with a mono kicker "-> page 01 / work" above the title.
- Cards are mostly 12-14px radius. Polaroids use a tight 4px.


## 5. Shadows (soft, paper-like — never harsh)

```css
--shadow-sm:    0 1px 2px rgba(31,26,46,.06), 0 1px 3px rgba(31,26,46,.04);
--shadow-md:    0 8px 24px -10px rgba(31,26,46,.18), 0 2px 6px -2px rgba(31,26,46,.08);
--shadow-paper: 0 1px 0 rgba(31,26,46,.06), 0 4px 12px -4px rgba(31,26,46,.10), 0 12px 32px -12px rgba(31,26,46,.10);
```

Hover "lift" idiom (used everywhere — cards, pills, CTAs): nudge up-left and drop a
*hard offset shadow* in an accent color, no blur. This is the single most reusable
signature of the system:
```css
.card:hover { transform: translate(-2px,-2px); box-shadow: 4px 4px 0 var(--lilac); }
```


## 6. Components & their idioms

- Buttons — pill (border-radius: 999px). Primary = ink fill with a `0 4px 0 0 lilac`
  "stacked card" shadow that deepens on hover; lifts translateY(-2px), springs on
  press. Ghost = paper fill, ink border, lilac-tint hover.
- Tags / pills — mono uppercase text in a colored soft pill with matching border + a
  currentColor dot. Variants per sticky color.
- Marker highlight (.hl) — a linear-gradient band behind text (transparent 55% ->
  soft color), animated from 0% -> 100% width on scroll-reveal. Sun/rose variants.
- Inline link (.link) — lilac-deep, 1.5px lilac underline -> both turn ink on hover.
- Paper cards — --paper-2 fill, 1.5px solid var(--ink) border, 12-14px radius, slight
  rotation, tape/sticker pinned via ::before. Hover straightens + hard shadow.
- Sticky note (.sticky) — sun/lilac/rose/mint fill, Caveat font, a translucent "tape"
  strip via ::before, random rotation via --sticky-rot.
- Polaroid — paper frame with bottom-heavy padding (14px 14px 60px), square image
  (a real Polaroid image area is square; the source portrait is landscape and a 4/5
  crop clipped the subject), hairline border so the photo reads against the frame,
  handwritten caption absolutely positioned in the white margin, tilted -3deg.
- Dashed dividers — section breaks use 1.5px dashed var(--border) rather than solid
  lines (the "notebook" feel).
- Stat tiles — 4-up grid, each cell a different soft tint (lilac/sun/rose/mint by
  nth-child), italic-serif metric numbers, mono labels, JS count-up on scroll.
- Glyph bullets — lists use a sparkle glyph (lilac) instead of discs; kickers use an
  arrow; brand/headers use a flower glyph.


## 7. Motion

```css
--ease:     cubic-bezier(.22,.61,.36,1);
--ease-out: cubic-bezier(.16,1,.3,1);
--spring:   cubic-bezier(.34,1.56,.64,1);   /* overshoot — for pops & buttons */
--dur-1: 200ms;  --dur-2: 360ms;  --dur-3: 720ms;
```

- Scroll reveal: elements start opacity:0; translateY(16px), fade up via
  IntersectionObserver with index-based stagger (<=4 x 70ms).
- Entrance choreography (gated behind body.is-loaded after a one-time splash):
  polaroid springs in with rotation, stickies pop staggered, hand-drawn SVG scribbles
  "draw" via stroke-dashoffset, stars then drift forever.
- Count-up stat numbers (easeOutCubic, 1.5s).
- Everything respects @media (prefers-reduced-motion: reduce) — animations off,
  reveals shown.
- Springy micro-interactions: buttons lift+press, cards straighten, pills hover-tint.


## 8. Responsive

Three breakpoints:
- 1024px — multi-col -> single col.
- 768px — drops nav links, hides decorative scribbles/stickies, kills card rotations,
  stacks grids. Gutter -> 18px, nav-h -> 60px.
- 480px — full-width stacked CTAs, smaller type. Gutter -> 16px.

Mobile deliberately *declutters* the playful paper elements rather than shrinking them.


## 9. Paper-grain background (drop-in)

```css
body { background: #F7F3EB; }
body::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.04;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.10  0 0 0 0 0.08  0 0 0 0 0.16  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
```


## Minimum kit to reuse elsewhere

1. Paste the :root token block (color / type / space / shadow / motion).
2. Load the 4 Google Fonts (Plus Jakarta Sans, Lora, JetBrains Mono, Caveat).
3. Adopt the four signature moves:
   - cream + grain background
   - sans-with-italic-serif headings
   - bordered paper cards that tilt then straighten with a hard offset-shadow hover
   - dashed dividers + glyph bullets
