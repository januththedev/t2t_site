# T2T React redesign

The frontend uses React, strict TypeScript, Vite, and a custom Material UI theme. The light blue visual system adds depth with layered real photography, shallow shadows, and a small optional Three.js scene. Original T2T logo artwork is framed at a readable size without its large transparent margins shrinking the mark.

## Editing and building

- `src/App.tsx`: React navigation, hero, program explorer, and shared page shell.
- `src/programs.ts`: typed program explorer content.
- `src/content.json`: reviewed page content and metadata, migrated from the previous HTML. Edit this for current program detail pages and the homepage's editorial sections. HTML is trusted repository content, never user input.
- `src/theme.ts` and `src/refined.css`: Material UI theme and responsive visual system.
- `src/enhance.js`: native JavaScript enhancements within published content (events, section index, chatbot launcher).
- `ui/footer.html`: shared footer content.
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
