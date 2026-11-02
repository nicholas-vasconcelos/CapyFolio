# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: Brazilian undergraduates, mostly in computing and data courses (Engenharia de Software, Ciência da Computação, Ciência de Dados e IA, and similar), at universities such as Ibmec Rio, PUC-Rio, UFRJ, UFF and USP. They come to CapyFolio to showcase their work: building a portfolio of projects and research so that peers, professors and recruiters can find them and judge what they have done.

Secondary: other community members (fellow students, researchers, event organizers) who browse projects, follow events and connect with people. The primary job is still the student presenting their work.

## Product Purpose
CapyFolio is an academic social network where students publish and present their projects and research, share updates in a feed, find and sign up for academic events, and connect with people by area, course and institution.

Success means a student's profile and featured projects represent their work well enough that the right people discover and contact them.

## Positioning
Projects are the unit of identity. A CapyFolio profile centers on featured projects and work in progress, where LinkedIn centers on job titles, Lattes on formal CVs, and ResearchGate on publications and citations. Students who have built things but have no titles or papers yet still have something real to show.

## Operating Context
- It began as a university Design Thinking course project and is meant to become a real product with a backend.
- Core flows: log in or register (`/login`, `/cadastro`), feed with posts, likes, comments and post or project creation (`/feed`), project list, favorites and detail pages (`/projetos`, `/projeto/:id`), event agenda, detail pages and sign-up (`/eventos`, `/evento/:id`), people search and connections (`/pessoas`), and own or other profiles with a featured project (`/perfil`, `/perfil/:id`).

## Capabilities and Constraints
- Stack: React 19, TypeScript, Vite, Tailwind CSS 3, React Router 7, lucide-react icons. Deployed on Vercel as an SPA (`capyfolio/vercel.json`).
- Data and auth are currently local mocks (`capyfolio/src/data/*.json`, `capyfolio/src/services/*`), written to be easy to swap for a backend. There is no real persistence, messaging or notifications yet.
- Language: the UI is Brazilian Portuguese today, and English is planned. New UI copy should be easy to externalize, and layouts must tolerate longer strings. (`index.html` still says `lang="en"`, which is wrong for the current content.)
- Domain terms used in the UI: Feed, Projetos, Eventos, Pessoas, Perfil, projeto em destaque, conectar, inscrição.
- Open decisions: backend and auth provider, whether institutions are verified, moderation, and the English rollout timeline.

## Brand Commitments
- Name: **CapyFolio**.
- The capybara mascot is a binding part of the identity (`capyfolio/src/components/CapyMascot.tsx`, `CapyLoginIllustration.tsx`).
- Keep the current logo and wordmark (`capyfolio/src/assets/capy_logo.png`, `capyfolio/src/components/CapyWordmark.tsx`, `capyfolio/public/favicon.svg`).

## Evidence on Hand
- Mock content only: users, posts, projects and events in `capyfolio/src/data/`, including placeholder entries such as "Universidade de Teste".
- Images: `capyfolio/src/assets/hero.png`, `artur.png`, plus illustrated covers (`LlmEventCover.tsx`, `SpatialMapProjectCover.tsx`).
- There are no real users, testimonials, partner universities, usage numbers or press. Future work must not present the mock data or institution names as real adoption or endorsement.

## Product Principles
1. **The work comes first.** Projects carry a profile. Every screen should make it easier to show, find or understand what someone built.
2. **Credible without credentials.** An undergrad with no papers or job titles should still look worth contacting.
3. **One academic community, across institutions.** Course and university give context, not walls.
4. **Ready for a backend, honest about mocks.** Build real flows and never imply data, scale or features that don't exist.
5. **Warm, not corporate.** The capybara identity keeps it approachable and distinct from LinkedIn-style professionalism.

## Accessibility & Inclusion
No formal standard has been set. Internationalization (pt-BR now, English later) is a confirmed need.
