# CapyFolio pitch video

`capyfolio-pitch.mp4` — 1920×1080, 30 fps, ~48 s, silent (add music/voice-over in your editor).

Structure: intro (logo + tagline) → problem (62% stat from the survey) → 5 captioned demo steps
(login, feed, projetos, eventos, meu portfólio) → outro with the prototype URL.

## Rebuild
```bash
node render-cards.js out                                         # animated title cards
node record-demo.js https://capyfolioprototype.vercel.app out    # or http://localhost:5173 with `npm run dev` in ../capyfolio
./compose.sh out                                                 # -> out/capyfolio-pitch.mp4
```
Needs Node + Playwright (Chromium) and ffmpeg. Brand colors/fonts follow the slides and `capyfolio/src/styles/tokens.css`.
