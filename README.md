# Theory to Trade (T2T) by TRACE

## Running Locally

This is a React and TypeScript website, prerendered to static HTML with Vite.
Material UI provides themed controls, with custom CSS and progressive Three.js
for restrained depth. A Vercel Node.js function runs T2T Guide, its source-grounded
OpenRouter chatbot. Node.js 24 is required; no database is required.

See `REACT-REDESIGN.md` for the current content, component, and build architecture.

Start the complete website and chat API:

```sh
npm ci
npm run dev
```

Then open http://localhost:3000. Stop the server with Ctrl+C. Re-run
`npm run build` after editing React components, `src/content.json`, CSS, or knowledge files. The watcher restarts
the server when its imported modules or generated knowledge change. To use AI
locally, put your OpenRouter configuration in ignored `.env.local`, using
`.env.example` for variable names. Without a key, the guide answers from its
published FAQ dataset and source excerpts. A static-only server such as Python
or `serve` does not run the chat API.

## Deploying to Vercel

1. Push these changes to a repository you can access in Vercel, then import it
   as a new Vercel project.
2. Use the repository root as the **Root Directory** (`.`), and **Other** as
   the framework preset. The checked-in `vercel.json` sets these build options:

   | Setting | Value |
   | --- | --- |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm ci --include=dev` |
   | Node.js Version | `24.x` |

3. In Vercel's Environment Variables settings, add `OPENROUTER_API_KEY` as a
   server-side secret for the environments where you want AI replies. Optionally
   set `OPENROUTER_MODEL` to a currently available free model ending in `:free`.
   The default is `openrouter/free`; paid model IDs are rejected by the app.
4. Deploy (or redeploy after changing environment variables). Vercel serves
   the website from `dist/` and runs `api/chat.mjs` for `/api/chat/`. The
   function configuration bundles the generated knowledge file separately;
   API code and private knowledge files are never copied to the public output.

Directory pages retain trailing slashes so relative asset URLs resolve
correctly (for example, `/programs/leadx/`). Existing `index.html` links are
supported; this is a multi-page website and has no catch-all SPA rewrite.
The `/register/` page retains its existing redirect to `/programs/ifap/`.

The build copies root HTML/CSS/JavaScript files and these content directories:
`corporate-programs`, `data`, `docs`, `events`, `images`, `privacy_policy`,
`programs`, `register`, `chatbot`, and `licenses`. Add new top-level content directories to
`scripts/build.mjs`. Repository metadata, setup files, and `CNAME` are not
published. `CNAME` remains available for GitHub Pages; configure any custom
domain separately in Vercel's project settings after verifying the deployment.

Existing Google Forms, social links, and other external services continue to
use their current URLs. Hosting this site does not add a form-submission backend.

## Image loading and performance

The build creates responsive WebP variants for the images referenced by HTML
and the events feed, then rewrites only `dist/` to use them. The original images
and PDFs remain available. New or updated images are optimized automatically
on the next build; generated variants do not need to be committed.

Variants have content-hashed URLs under `/assets/images/` and immutable browser
caching. HTML remains revalidated. Images receive intrinsic dimensions to
reduce layout shifts, responsive `srcset`/`sizes`, async decoding, and lazy
loading except for logos and the main hero images. Homepage and IFAP hero images
are loaded eagerly with high fetch priority. The homepage event list uses lightweight text rows rather than downloading
every event poster. The redesign self-hosts the Manrope variable font. No third-party font requests
are made. Motion respects reduced-motion preferences; page content is present
before JavaScript and below-fold reveals remain progressive enhancements.

Run `npm run build` to see the image-byte reduction for the current sources.
The optimization happens at build time, with no image-processing requests or
additional services needed when visitors load a page.

Before the editorial redesign, a local cold-cache mobile check (390 × 844, DPR 2, measured through 1.2 seconds
after load) reduced initial image payload from 9.80 MB to 0.95 MB on the homepage
and from 54.95 MB to 0.05 MB on IFAP. External Google Fonts was blocked in both
runs to isolate local assets. These are image-byte measurements, not production
page-speed scores; browser lazy-loading decisions can vary.

## T2T Guide chatbot

The floating **Ask T2T** widget is available across pages, with mobile layouts,
keyboard controls, source links, suggested follow-ups, clear-chat, stop/retry,
and conversation continuity in this browser tab's session storage. Shadow DOM
keeps widget styling separate from each program page's styles.

The knowledge layer includes **50+ curated FAQs plus extracted source passages** from
eight current source pages and 12 event listings. `npm run build` rebuilds the
dataset from the website. BM25-style retrieval combines synonyms, program
topics, question intent, recent conversation, and the current page. It sends
at most six compact passages to a free OpenRouter model. This is RAG; the model
is not fine-tuned. No embedding API or vector database is needed for this corpus.

Reviewed exact FAQ matches answer without model calls. Unknown facts are not
guessed. Missing keys, provider failures, and rejected outputs use source-based
fallbacks. Event dates are checked against the current date in Asia/Colombo,
and old listings are not presented as future events. Retrieved source links
come from the dataset rather than being invented by the model. The initial
retrieval dataset targets English questions.

Each request is limited to 1,000 characters, six history messages, bounded
evidence, and a maximum of 700 output tokens. The API rejects cross-origin
browser calls and invalid payloads. Its 12-requests/minute burst guard is
**per function instance**, not a distributed or daily limit. For a public
launch, use Vercel Firewall controls if stronger rate limiting is required.
OpenRouter's account-level free-model quotas still apply; free model capacity
and availability are not guaranteed. The app does not fall back to paid models.

Messages are not stored in a database or logged by this app. AI requests send
the question, recent conversation, and retrieved public passages to OpenRouter
and its selected model provider; their data policies apply. The browser's
session history can be removed using Start a new chat. The widget and Privacy
Policy explain this processing to visitors.

Run `npm test` for retrieval, API, fallback, and grounding regression checks.
These tests mock the provider and do not spend API quota. See
`knowledge/README.md` for dataset maintenance and known limitations. Configure
a key and separately verify live model responses before launch.

## Contributing

### Maintaining Events

The events showcased on the main site are loaded dynamically. Instead of updating the `index.html`, all event data should be maintained inside `data/events.json`.

**Display order:**
The frontend sorts upcoming events by their next date, followed by past events
from newest to oldest. Dates are parsed as calendar dates, independent of the
visitor’s time zone; upcoming status uses Asia/Colombo. Missing years are not
guessed. Three events appear initially; View all events reveals the rest.

**Event JSON Structure:**
Each event in the array should follow this structure:

```json
{
  "image": "events/your-event-image.jpg",
  "title": "Your Event Title",
  "date": "Day, DD Mon YYYY",
  "meta": "Short summary \u2022 Categories",
  "description": "Full details about the event.",
  "buttons": [
    {
      "text": "Register Now",
      "link": "https://example.com/register",
      "class": "btn",
      "target": "_blank",
      "rel": "noopener"
    },
    {
      "text": "Closed",
      "title": "Registration closed",
      "class": "btn disabled",
      "isButton": true
    }
  ]
}
```

**Key Points:**
- `image`: Keep the source image path for event records and future detail views. The homepage list does not load posters. Place images in `events/` or `images/`.
- `date`: Clearly specified dates (e.g., "Wed, 17 Dec 2025").
- `buttons`: Existing event destinations. The list uses an available details/recap link; registration links are offered only for upcoming events. Otherwise the action opens the T2T contact route.
  - If it's a clickable link, specify the `link`, `target`, and `rel`.
  - If it's an inactive or regular `<button>` tag instead of an anchor `<a>` tag, set `"isButton": true`.
  - Button styling uses CSS classes such as `"btn"`, `"btn secondary"`, or `"btn disabled"`.

## Editorial frontend and preview workflow

The redesign is on `redesign/react-depth-preview`; it is not a production release.
Keep `main` as the Vercel Production Branch. With the repository Git integration
enabled, pushes to this feature branch create Preview deployments. Open the
branch’s deployment or draft PR check to review the site. Do not merge or
promote it until the design has been reviewed.

If a preview does not start automatically, use Vercel’s Create Deployment action
for this project and select `redesign/react-depth-preview` as the Git branch and
Preview as the environment. Configure `OPENROUTER_API_KEY` and optional
`OPENROUTER_MODEL` for Preview if model-generated answers are needed there;
without them the existing source-based answers continue to work.

- `src/App.tsx` and `src/components/Footer.tsx`: prerendered React page shell, navigation, hero, program explorer, and contextual footer.
- `src/refined.css`, `src/theme.ts`, and `src/fonts.css`: current visual system and self-hosted typography.
- `styles.css`: retained layout foundations for detailed page content.
- `src/enhance.js`: event listing, chatbot launcher, and section highlighting.
- `event-dates.js`: calendar-date parsing and Colombo date handling.
- Program pages: shared layout with preserved content and application URLs.
- `chatbot/widget.css`: matching light chat theme; provider and retrieval unchanged.

Run `npm run build` after frontend edits; the local server serves `dist/`.
Header and footer components are rendered into each page at build time, not runtime fetches. The dev
server also accepts `--host` and `--port` for managed previews.

`npm test` covers retrieval/API behavior, image optimization, internal links and
anchors, calendar dates, shared markup, and real application destinations.
The frontend stays usable for core reading and navigation without JavaScript.
