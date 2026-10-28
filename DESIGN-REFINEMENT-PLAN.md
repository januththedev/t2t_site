# T2T design refinement — 28 October 2026

## Aim

Make the website feel deliberately composed, distinctive to T2T, and easy to use. The visual story remains the move from knowledge to practical experience. Retain the official blue logo, real photography, real program facts, current application forms, and grounded chatbot.

## Design decisions

1. **A more deliberate opening.** A large, direct headline shares the first screen with two complementary workshop photographs. Use an asymmetric composition, a restrained blue surface, and fine connecting lines. Remove the multiple floating badges and repeated decorative captions. Keep a clear primary program action and a quieter approach link.
2. **Programs as a useful interaction.** Replace the repeated gradient-card grid with a program selector and one focused spotlight panel. Show all four names and audiences, then the selected program's duration, learning format, description, and detail link. Give keyboard users arrow-key, Home, and End navigation, and preserve sensible content before JavaScript. The change must help someone choose, not just animate a panel.
3. **A compact ending.** Retire the oversized typographic footer signature. Use the actual T2T mark, a short contextual invitation, a clear action, and practical program/contact/social links. Keep the fixed guide clear of footer controls. Application anchors and destinations remain program-specific.
4. **Visual rhythm.** Use white, ink, and T2T blue with one restrained cool accent. Keep the slim navigation. Balance photographic sections with open text sections; reduce repetitive taglines and card borders. Use the existing self-hosted Manrope font with a clear hierarchy and readable supporting text.
5. **Restrained motion.** Keep ambient light faint, use one brief content entrance, and add direct interaction feedback. Respect reduced-motion preferences. Essential content must not wait for animation or WebGL.

## Implementation sequence

- Recompose the hero and replace the program grid with an accessible selector.
- Rebuild the footer and align lower homepage sections and detailed-page surfaces.
- Review real browser views on desktop and mobile, correcting wrapping, spacing, hierarchy, and interaction failures.
- Run TypeScript, existing grounding/API/link/image checks, and meaningful selector tests. Publish the feature branch to the existing Vercel Preview after checks.

## Acceptance

- Visitor can understand T2T and find a suitable program from the first two sections.
- Program selection works with pointer and keyboard, with current facts and correct links.
- Official logo stays legible; footer is materially shorter and has a clear hierarchy.
- No horizontal overflow at 320, 360, 390, 768, 1024, and 1440px on current page types.
- No lost application/download/source anchors; chatbot dataset generation and fallback remain functional.
- No new framework or animation dependency. Keep main untouched; publish only redesign/react-depth-preview.

## Implementation and review

The hero, partner ribbon, program navigator, and compact footer are implemented. The official T2T logo is used at both ends of the page. The program navigator was checked with pointer, arrow, Home, End, and Ctrl+End navigation. Eight current page types passed 48 layout checks across the six target widths. Application destinations and source-grounded chatbot checks remain in the automated suite.

A preview rebuild could previously expose HTML before its CSS and React links were attached. The build now prepares the full output before replacing the served directory. A new asset-loading check guards this case. TypeScript and all 72 automated checks pass. Hardware WebGL remains unavailable in the cloud browser; the static fallback is used for visual review.

The live guide check exposed a missing AI-X duration FAQ. The dataset now includes the published 6-week duration and 4-week intensive phase, with source links and a regression check that confirms no model quota is needed.
