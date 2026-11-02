CapyFolio is an academic portfolio platform for Brazilian university students: students publish projects, certifications, event participation and project medals; recruiters and companies search and browse. The look is **outlined flat colour**, taken from the mascot's line art: flat fills, a 2px dark outline, hard offset shadows. Friendly and academic, with the capybara as the one playful element; professional enough for a recruiter, appealing to a 20-year-old.

## Content fundamentals

- **Write all UI copy in Brazilian Portuguese.** Code, token names and these guidelines stay in English.
- **Address the student as "você"**, warm and direct: "Acesse com seu e-mail institucional ou crie uma nova conta." Greet by first name: "Bem-vindo, Arthur".
- **Sentence case everywhere**, including buttons and headings: "Entrar na sua conta", "Projetos em destaque". Proper nouns keep their case (UFF, Ibmec Rio, React).
- **Buttons start with a verb**: "Entrar", "Ver portfólio", "Publicar projeto", "Limpar filtros", "Compartilhar". A leading "+" marks creation: "+ Publicar".
- **Headlines make one claim, short, often ending in a period**: "Conecte-se ao universo acadêmico.", "Onde o talento universitário é encontrado." Subcopy is one or two plain sentences.
- **Name things the way the product does**: Projetos, Pessoas, Feed, Eventos, Meu Portfólio; achievements are *Eventos*, *Certificações* and *Medalhas de projeto*; profile flags are *Pronto p/ Mercado* and *Perfil Verificado*; statuses are *Concluído* and *Em andamento*.
- **Brazilian formats**: "R$ 27,90", "28 abr. 2025", "ago/2027", "7º período", "Há 3 horas".
- **Never invent facts.** Unknown content stays in square brackets: "[Nome do evento]", "[Resumo do projeto]", "[Nome do estudante]", "[e-mail de contato]".
- **No emoji** in UI copy or headings. No exclamation marks in UI chrome; users' own posts may have them.

## Visual foundations

### Colour

- **`paper`** is the page background on every screen; **`surface`** (white) for cards, inputs and the nav bar.
- **`navy` leads.** Use it for hero blocks, headlines on paper (10.5:1), primary buttons and the default card shadow.
- **`green` supports**: success, check marks, eyebrows, text links and role lines on paper or surface (4.5:1+). On `green-tint`, small text goes in **`green-ink`**, never `green` (4.35:1).
- **`gold` highlights and never carries text on a light ground** (1.9:1 on paper). Use it for fills (CTA buttons, the active nav pill, selected chips, the sticker, medal emblems), borders and hard shadows. Text on gold is always **`ink`** (7.8:1). Where a gold-coloured word is unavoidable, use **`amber-ink`** on `gold-tint` or surface.
- **Tints** (`navy-tint`, `green-tint`, `gold-tint`) are the grounds for tags, achievement panels, status and highlight cards; their text is `ink` or the matching dark ink.
- **Text hierarchy**: `ink` (body, 14.5:1), `ink-soft` (muted body in panels), `ink-muted` (metadata, 5.9:1), `ink-subtle` only at 24px+ or for non-text (3.6:1, below 4.5:1 for small text).
- **On navy**: headlines and labels in `on-navy`, copy in `on-navy-muted`, links and subtitles in `gold-light`, outlines and secondary-button borders in `paper`.
- **Brazil is implicit.** Navy, green and gold appear together, but never as a flag, a stripe of green-and-yellow, or a national motif.

### Type

- **Bricolage Grotesque** (`font-display`, 500/700/800) for headings, names, numbers, button labels and the wordmark, with tight negative tracking (−0.02 to −0.045em) at large sizes. Headlines are 800; card titles and buttons 700.
- **Instrument Sans** (`font-sans`, 400–700) for everything read: body, labels, nav, tags.
- Scale: `display-xl` 104 (a person's name) · `display-lg` 80 · `display` 68 · `title` 56 · `heading-1` 48 · `heading-2` 32 · `heading-3` 26 · `stat` 28 · `card-title` 21 · `button-lg` 17; text `lead` 19 · `eyebrow` 17 · `body` 16 · `nav` 16 · `label` 15 · `body-sm` 15 · `caption` 14 · `micro` 13 (the floor).
- Balance headline wraps (`text-wrap: balance`); keep paragraphs to 56–68ch. Use tabular figures for prices and tables.

### Outlines, shadows, radii

- **Outline every object** that sits on the page: cards, inputs, chips, buttons, tiles, avatars and emblems get a `border-width` (2px) solid `ink` outline. Only resting inputs use `field-border`; only skill tags on paper use `line`.
- **Shadows are hard offsets, never blurred**: `shadow-sm` (3px) for rows, `shadow-md` (4px) for buttons and tiles, 8px (`shadow-card`, `shadow-card-gold`, `shadow-card-green`) for main panels, `shadow-photo` (10px) for the hero photo. Colour the shadow by role: ink neutral, navy content, gold highlight / primary action, green forms and success. In a row of tiles, cycle the colours green, gold, navy, ink.
- **Radii are chunky and mixed**: `radius-sm` 12 (inputs, icon tiles) · `radius-md` 14 (buttons) · `radius-lg` 16 (rows) · `radius-xl` 20 (tiles) · `radius-2xl` 24 (cards) · `radius-3xl` 28 (featured) · `radius-4xl` 32 (hero photo) · `radius-pill` for chips, tags and nav links · `radius-full` for avatars, emblems and the mascot disc.

### Backgrounds and layout

- **Every page opens with a navy hero block** carrying the paper dot grid: `radial-gradient(dot-grid 1.5px, transparent 1.5px)` at `dot-pitch` (26px). No photos or gradients behind content otherwise.
- Content max width `content-max` (1344px) with `space-12` (48px) gutters; sections `space-18` (72px) to `space-24` (96px) apart; card padding `space-6` to `space-8`.
- Pages are fluid: flex-wrap and `repeat(auto-fit, minmax(min(Npx, 100%), 1fr))` grids, no fixed root widths. Stat tiles may overlap the hero's bottom edge by `space-14`.
- Project covers without an image use a flat colour field with a pattern (topographic rings on `green`, a dot grid on `gold`) and a single icon in a tile.

### Motion and states

- **Hover lifts**: `translate(-2px, -2px)` plus `shadow-hover`. **Active presses in**: `translate(2px, 2px)`, no shadow. 120ms.
- **One orchestrated moment per screen**: the gold sticker's "pop" entrance (`rise`, 0.7s). Nothing else animates.
- Respect `prefers-reduced-motion`: drop transitions and the entrance.
- **Focus**: a 3px `focus` (gold) outline at 3px offset on every interactive element. It reads 5.6:1 on navy but only 1.9:1 on paper and white, so on light grounds the element's own ink outline and the offset carry it; keep both.
- **Accessibility**: 44px minimum targets (`target-min`), `aria-pressed` on toggle chips, `aria-current="page"` on the active nav link, `aria-live="polite"` on result counts, visible labels on every input.

## Logo and mascot

- Use **`capyfolio-lockup.png`** (mascot over wordmark) on splash and print, **`capyfolio-wordmark.png`** where the mark must be horizontal, both on `paper` or white only.
- In the product UI the wordmark is **live text** in Bricolage 800: "Capy" in `navy` and "Folio" in `green` on white, or "Capy" in `on-navy` and "Folio" in `gold` on navy, next to the 36–44px mascot.
- **The mascot never sits directly on navy**: its dark outline disappears. Place it on a `paper` disc with an ink outline and a gold hard shadow (MascotDisc).
- Do not recolour, redraw, rotate or add effects to the capybara; it is the only illustration in the system.

## Iconography

- Line icons on a 24px grid, **stroke 2, round caps and joins, no fill**, drawn inline as SVG with `stroke` set to the colour of their context (`ink` by default, white on navy and green fills, `ink-muted` for the search glass). Sizes 14 (inside pills), 18–20 (buttons), 22–24 (icon tiles), 36–60 (covers).
- Icons appear inside an outlined tile or disc when they stand alone: 44px icon tiles (`radius-sm`, tinted) in lists, 60px tiles in sidebars, 24px discs in achievement pills.
- Fixed meanings: calendar = Evento, rosette = Certificação, star = Medalha de projeto, database = data projects, chip = AI projects, eye = computer vision; arrow right = go to, arrow up-right = opens in a new tab.
- The set is drawn in the Feather / Lucide idiom but not taken from a library; no icon font is used. Never use emoji as icons.
