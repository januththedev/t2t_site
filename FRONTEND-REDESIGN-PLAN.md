# T2T frontend redesign plan

Status: implemented on the `redesign/editorial-preview` feature branch for preview review. Not released to main.

## 1. Purpose

Make Theory to Trade by TRACE feel like a distinctive, credible place to develop practical skills and move into industry. A visitor should understand what T2T does, find a relevant program, and identify the next step without reading the entire site.

Primary journeys:
- Students and graduates: discover CRISP and understand practical career preparation.
- Technical learners: explore AI-X and its applied AI focus.
- Aspiring managers: explore Lead-x and its business/leadership pathway.
- Filmmakers: discover IFAP alongside the other programs.
- Organizations: find the corporate offering and contact the team.

Scope: presentation, information hierarchy, navigation, responsive layouts, frontend interactions, and accessibility. Keep existing public URLs, application destinations, downloads, chatbot API contracts, retrieval datasets, OpenRouter configuration, and Vercel deployment architecture intact.

## 2. Audit findings

Reviewed the current homepage, shared stylesheet, program page structure, registration redirect, build scripts, and an existing desktop screenshot. Synced the checkout to the performance improvements at cc87f22 before planning implementation.

- The desktop header combines long branding, six navigation entries, and five social links. The brand and primary action compete with secondary destinations.
- The hero has a long headline, generic promotional artwork, and boxed metrics. Its most important message and action need a clearer hierarchy.
- Repeated dark cards make unrelated sections look equally important.
- Visitors encounter lengthy introductory content before reaching the program choices.
- The homepage program list highlights CRISP, AI-X, and Lead-x but leaves IFAP out of the main set.
- Individual program pages have substantial separate styling and repeated long sections, making the experience inconsistent.
- Some application screens contain local success-state UI. Audit actual submission behavior before reusing it; visual polish must not imply that an application was received without confirmation.
- Recent responsive WebP generation, image loading improvements, and nonblocking font work are implementation constraints to retain.

## 3. Visual direction

Direction: an editorial learning brand with confident typography, real people, and generous space.

| Element | Proposed treatment |
| --- | --- |
| Main canvas | Warm ivory #F6F5EF with white content surfaces |
| Primary text | Deep charcoal #17221D |
| Brand accent | Forest green #17613E; pale mint #E5F0E8 for supporting surfaces |
| Contrast sections | Deep green #10291E for corporate programs and the closing invitation |
| Typography | One locally hosted variable sans family, provisionally Manrope, subject to license verification; system fallback |
| Type scale | Hero approximately 64–88px desktop / 40–48px mobile; body 17–18px; comfortable line lengths |
| Layout | Maximum content width around 1240px; 12-column desktop grid; intentional asymmetry in the hero |
| Spacing | Consistent 8px-based scale; approximately 96–120px between desktop sections and 56–72px on mobile |
| Shapes | Restrained 12–20px rounding for media/cards; solid primary buttons; fine borders and minimal shadows |
| Photography | Existing real workshops, learners, mentors, and filmmaking images; deliberate crops with real captions |
| Motion | Short 150–250ms transitions, subtle hover feedback, optional one-time reveals; reduced-motion support |

Keep the official T2T/TRACE logos and their proportions. Validate the palette against logo visibility and text contrast. Choose a readable logo surface rather than recoloring the brand marks.

Use photographs as evidence of the experience. Avoid adding synthetic learner images or fabricated statistics, employer relationships, testimonials, or intake availability. Keep decorative motion subordinate to content and never delay visibility until an animation runs.

## 4. Homepage composition

1. **Header:** compact T2T/TRACE identity; Programs, For organizations, About, and Events; clear Explore programs action. Move social links and secondary destinations to the footer. Programs menu lists all four programs with short descriptors and supports keyboard/touch interaction.
2. **Hero:** proposed headline, “Turn what you know into what you can do.” Supporting copy explains practical learning, industry mentors, and real project experience. Primary action: Explore programs. Secondary action: Talk to T2T. Pair this with a strong workshop photograph and a small supporting image/caption, not a text-filled poster.
3. **Program chooser:** “Find your next step.” Four clearly differentiated choices for CRISP, AI-X, Lead-x, and IFAP. Each shows audience, outcome, and a concise facts row sourced from its page. Default to all programs; lightweight audience filters are an enhancement, not a prerequisite for seeing the choices.
4. **Learning experience:** a short sequence—learn, apply, build confidence—using documented activities and real photographs. Merge repetitive About and audience explanations into this narrative.
5. **Learner voices:** one prominent existing quotation and two supporting stories with original names/images where supplied. Preserve the meaning and attribution of published quotes.
6. **Organizations:** a contrasting green section introducing the corporate pathway and a direct link to its page.
7. **Events:** a restrained editorial list with date, topic, and action. Clearly separate upcoming events from past events; provide an honest empty state when no upcoming event is published.
8. **Partners:** quiet, consistently sized existing partner marks with their original links. Keep partner relationships distinct from hiring claims.
9. **Closing invitation and footer:** one clear contact/program action; complete contact details, socials, program links, TRACE, and privacy information.

Use existing homepage anchor IDs where practical, including #programs, #about, #corporate, #testimonials, #events, and #partners, so existing links continue to land meaningfully.

## 5. Program page system

Apply one common structure to CRISP, AI-X, Lead-x, and IFAP, with restrained program-specific color and imagery.

1. Breadcrumb, program name, audience, and concise outcome statement.
2. At-a-glance facts: duration, format, fees, and accurately described application status.
3. Primary application/contact action plus brochure download where available.
4. What participants will learn or produce, with scannable outcomes.
5. Curriculum grouped into clear modules; accessible accordions for long details.
6. Mentors and practical learning evidence where the source provides them.
7. Eligibility, fees, scholarships, schedules, and conditional opportunities, preserving qualifications and ambiguity in the source.
8. FAQ and final application/contact section.

On desktop, a compact sticky facts/action panel can accompany the content. On mobile, show a single bottom action only where useful and reserve space so it never covers content, the chatbot launcher, or the keyboard.

Retain archived CRISP batch information as historical content. Give archive pages the shared navigation, typography, and footer without presenting their dates or applications as current.

## 6. Remaining surfaces

- **Corporate page:** strong opening promise; simplify the existing maturity journey into an accessible step sequence; retain service details and real contact destinations.
- **Event detail:** consistent title/date/status block, readable agenda, speaker information, and accurate registration/download states.
- **Privacy page:** shared shell and readable document layout.
- **Registration redirect:** retain its destination and accessible fallback link.
- **Chatbot:** align typography, colors, spacing, launcher, source chips, and loading/error states with the new site. Keep its existing knowledge retrieval, citations, conversation behavior, and model environment variables. Retain disclosures and ensure the panel has keyboard access and mobile keyboard clearance.
- **Forms and dialogs:** unify labels, focus states, validation, loading, cancellation, and errors. Show a success state only when the existing integration confirms success. Where a form has no working integration, use the existing verified contact route rather than adding a backend in this scope.

## 7. Frontend implementation approach

- Continue with static HTML, CSS, and small JavaScript modules in the current repository.
- Define shared design tokens and base components in styles.css, with explicitly scoped program variations.
- Consolidate repeated inline overrides during each page migration, rather than adding another override layer.
- Keep shared navigation/footer markup consistent across pages. Use a small build-time partial mechanism only if it reduces duplication without disrupting source extraction or deployment.
- Preserve semantic headings and meaningful section text so the existing build-time knowledge extraction still works.
- Keep the responsive WebP build pipeline and immutable asset caching. Include intrinsic image sizes; eager-load only critical imagery; lazy-load below-fold assets.
- Use one locally hosted font family with limited files and swap behavior, provided its license permits redistribution.
- Ensure core content and links work without JavaScript. JS enhances navigation, filters, accordions, dialogs, and chat.
- Do not introduce a framework migration, authentication, database, payment flow, or new chatbot provider for this redesign.

## 8. Build sequence and reviewable outputs

| Phase | Work | Output |
| --- | --- | --- |
| 1 — Foundation and homepage | Tokens, typography, navigation/footer, image selection, complete homepage composition | Working desktop and mobile homepage establishing the visual direction |
| 2 — Program system | Build CRISP as the reference, then adapt AI-X, Lead-x, and IFAP | Four consistent program pages with accurate content and working actions |
| 3 — Remaining pages and interactions | Corporate, event detail, archives, privacy, forms/dialogs, chatbot appearance | Complete frontend with no old-style islands |
| 4 — Verification and polish | Responsive review, keyboard checks, content/link audit, browser testing, performance comparison | Tested changes and a concise report of checks and any remaining limitations |

The first implementation milestone is a complete, working homepage plus the shared design system. Use that as the concrete visual reference for the rest of the site. The implementation remains a feature-branch preview; production is unchanged.

## 9. Acceptance criteria

- Review representative pages at 360px, 390px, 768px, 1024px, and 1440px widths; no clipped text or horizontal overflow.
- All four programs are discoverable near the top of the homepage, and corporate visitors have a direct route.
- Typography, spacing, controls, navigation, and footer are consistent across current and archived pages.
- Menus, accordions, dialogs, and chatbot work with keyboard input, visible focus, Escape where appropriate, and appropriate focus restoration.
- Interactive targets are at least 44px where practical; text contrast meets WCAG AA; reduced-motion preference is honored.
- Images retain suitable quality, correct aspect ratios, responsive sources, and reserved layout space.
- Keep initial mobile image transfer at or below the current optimized homepage baseline under the same measurement conditions; investigate any increase before release.
- Aim for LCP <= 2.5s and CLS <= 0.1 in a documented mobile test. Distinguish lab results from production field performance; do not promise a score before measuring.
- Existing URLs, anchors, brochures, event data, registration destinations, and contact links continue to work.
- No invented fees, unsupported outcomes, misleading event status, or simulated successful applications.
- Run the production build and existing chat, retrieval, and performance checks after structural changes. Check representative chatbot answers to ensure presentation changes do not damage evidence extraction.
- Inspect the final homepage, a long program page, corporate page, and chatbot in a real browser at mobile and desktop sizes before reporting visual completion.

## 10. Decisions established for the first build

Proceed with a light editorial foundation, deep green contrast sections, the existing brand marks, real available photography, a unified four-program system, and the current static architecture. These are proposed design decisions, not claims about an existing official brand guide. Adjust them if T2T supplies additional brand constraints.
