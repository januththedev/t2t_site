# Theory to Trade (T2T) by TRACE

## Running Locally

This is an HTML/CSS/JavaScript website with a Vercel Node.js function for
T2T Guide, its source-grounded OpenRouter chatbot. Node.js 24 is required;
there are no npm dependencies or databases.

Start the complete website and chat API:

```sh
npm run dev
```

Then open http://localhost:3000. Stop the server with Ctrl+C. Re-run
`npm run build` after editing HTML, CSS, or knowledge files. The watcher restarts
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
   | Install Command | Empty (no dependencies) |
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
`programs`, `register`, and `chatbot`. Add new top-level content directories to
`scripts/build.mjs`. Repository metadata, setup files, and `CNAME` are not
published. `CNAME` remains available for GitHub Pages; configure any custom
domain separately in Vercel's project settings after verifying the deployment.

Existing Google Forms, social links, and other external services continue to
use their current URLs. Hosting this site does not add a form-submission backend.

## T2T Guide chatbot

The floating **Ask T2T** widget is available across pages, with mobile layouts,
keyboard controls, source links, suggested follow-ups, clear-chat, stop/retry,
and conversation continuity in this browser tab's session storage. Shadow DOM
keeps widget styling separate from each program page's styles.

The knowledge layer includes **50 curated FAQs and 144 total passages** from
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

**Order Rule:**
When adding new events to the JSON array, ensure they are ordered **chronologically from oldest to newest** (i.e., older events at the top of the file, and the newest/latest events appended to the very bottom). The frontend automatically reverses the array before rendering so that the most recent events are always displayed first.

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
- `image`: Supported event images will be rendered with `object-fit: contain` to prevent truncation. Place new images in the `events/` or `images/` directory.
- `date`: Clearly specified dates (e.g., "Wed, 17 Dec 2025").
- `buttons`: An array of buttons to render for the event.
  - If it's a clickable link, specify the `link`, `target`, and `rel`.
  - If it's an inactive or regular `<button>` tag instead of an anchor `<a>` tag, set `"isButton": true`.
  - Button styling uses CSS classes such as `"btn"`, `"btn secondary"`, or `"btn disabled"`.
