# T2T React redesign

The frontend uses React, strict TypeScript, Vite, and a custom Material UI theme. The light blue visual system adds depth with layered real photography, shallow shadows, and a small optional Three.js scene. Original T2T logo artwork is framed at a readable size without its large transparent margins shrinking the mark.

## Editing and building

- `src/App.tsx`: React navigation, paired-photo hero, partner ribbon, and shared page shell.
- `src/programs.ts`: typed program descriptions, audiences, durations, and formats.
- `src/components/ProgramNavigator.tsx`: an accessible selector with roving focus, arrow/Home/End keys, and program links that work without JavaScript.
- `src/home-content.ts`: shared photo and partner references used by the renderer and page.
- `src/content.json`: reviewed page content and metadata, migrated from the previous HTML. Edit this for current program detail pages and the homepage's editorial sections. HTML is trusted repository content, never user input.
- `src/theme.ts` and `src/refined.css`: Material UI theme and responsive visual system.
- `src/enhance.js`: native JavaScript enhancements within published content (events, section index, chatbot launcher).
- `src/components/Footer.tsx`: compact contextual application/contact action, official T2T logo, and useful links. This replaces the earlier oversized signature and duplicate closing banners.
- `src/components/ProgramGlyph.tsx`: small program-specific line illustrations.
- `src/fonts.css`: self-hosted Manrope font, with license under `licenses/`.
- Existing root and program HTML files remain historical migration inputs; the React build replaces their output with pages from `src/content.json`.

Run `npm ci`, `npm run typecheck`, `npm test`, and `npm run dev`. The build generates route-specific HTML with React server rendering, creates responsive images, rerenders using the same image manifest supplied to hydration, indexes the generated HTML for chatbot knowledge, then bundles browser modules with Vite. Existing URLs, fragments, applications, downloads, and the Node chatbot API continue to work.

The browser receives only its own page payload. Essential content and links exist before JavaScript. React owns header and explorer state; native enhancements operate on retained published content. Three.js loads separately after the hero, skips small screens and reduced-motion preferences, and checks WebGL2 support before loading the renderer. Rendering pauses offscreen and when the tab is hidden, and stops once pointer movement settles. A CSS depth treatment remains available without WebGL.

## Chatbot

The backend and OpenRouter configuration are preserved. Set `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` in Vercel's Preview environment for model-backed preview testing. Keys remain server-only. The existing free-model restrictions and factual FAQ fallback still apply. Knowledge is now generated from rendered React pages, so current content is indexed together with the 50 curated FAQs.

## Validation

TypeScript and automated retrieval, API, link, image, source, and hydration checks run locally. Browser checks cover program filters, mobile menu/Escape, and widths 360, 768, and 1440 across the homepage, four programs, corporate, event, and privacy pages. The cloud browser has WebGL disabled: fallback behavior is verified; hardware-rendered Three.js still needs a WebGL-capable browser. No production Lighthouse score is claimed.

Publish only `redesign/react-depth-preview` to the GitHub destination `januththedev/t2t_site`. Vercel Git integration creates a Preview deployment. Do not merge or push to main as part of this work.

## Ambient polish

The shared navigation is 72px on desktop and 66px on mobile, with a smaller, readable official mark and a translucent glass background. Glass surfaces also appear in the program facts and hero note. Every page has two restrained motion treatments: low-opacity ambient light in its hero and gentle heading/section entrances. `PageMotion.tsx` observes hero visibility to pause ambient animations offscreen and pauses motion in hidden tabs. Reveals happen once as below-fold sections approach; content remains visible with JavaScript disabled. Reduced-motion preferences disable animation and restore pending content. Unsupported backdrop filters use solid readable surfaces.

## Competition polish

The footer is a compact closing composition: a contextual next step, the official T2T mark, and grouped practical links. Program pages retain a unique `#apply` anchor pointing at their own application. Duplicate closing banners were removed. The fixed chatbot launcher has reserved space in the legal row.

The same typography, blue palette, spacing, and surfaces carry through the homepage, program details, corporate, event, privacy, and archive pages. Real source photography and testimonials are preserved. The optional Three.js form now echoes the arch in the T2T logo rather than showing an unrelated ring. Program-specific SVG glyphs, a self-hosted variable font, and readable metadata replace the previous mixed presentation. Partner marks with excessive empty margins are trimmed during image optimization; the ISC2 mark retains its full lettering on a contrasting surface.

## Current refinement

The current implementation follows `DESIGN-REFINEMENT-PLAN.md`: a paired-photo opening, a four-program navigator in place of the repeated card grid, and a compact footer built around the official logo. The home asset list is shared with prerendering to keep responsive image URLs identical during hydration. Modified key combinations are left to the browser, so Ctrl+Home/End and assistive-technology shortcuts work normally. The navigator links retain real program destinations before JavaScript loads.

Local rebuilds prepare complete HTML, images, and Vite assets in a staging directory before replacing the served output. Failed builds keep the previous complete output available. Asset checks verify that every prerendered React page contains working module and stylesheet links.
