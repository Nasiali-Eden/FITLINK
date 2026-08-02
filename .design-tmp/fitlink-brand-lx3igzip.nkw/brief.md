# FITLINK brand integration brief

## Objective
Integrate the user-supplied FITLINK brand assets and palette consistently across the existing React/Vite fitness marketplace without redesigning its content or information architecture. The result should feel energetic, credible, distinctly Kenyan, polished, and accessible.

## Audience
Kenyan fitness customers, trainers, gyms, academies, and wellness providers using the existing marketplace across mobile and desktop.

## Existing application
- Repository/output path: `C:\Users\Admin\Desktop\FITLINK`
- Existing framework: React 19, React Router 7, Vite 8, Tailwind CSS v4.
- Preserve existing routes, behavior, content, component conventions, and user changes.
- Brand tokens live in `src/index.css`; shared CTA variants in `src/components/Ui.jsx`; shell components in `src/components/Navbar.jsx`, `Footer.jsx`, and `Logo.jsx`.

## Brand assets
The user added these three originals under `public/brand` (all JPEGs with substantial white canvas):
- `WhatsApp Image 2026-07-31 at 11.35.31.jpeg`: horizontal logo lockup with tagline; use where width allows, especially desktop navigation/footer.
- `WhatsApp Image 2026-07-31 at 11.35.31 (1).jpeg`: stacked lockup; use only if it materially fits an existing context.
- `WhatsApp Image 2026-07-31 at 11.35.31 (2).jpeg`: symbol-only; use for compact/mobile brand contexts and favicon source.

Prefer creating clearly named, web-ready copies/crops from these originals if practical, while preserving the originals. Because the JPEGs have white backgrounds and large whitespace, display them using controlled crop/object positioning or make lossless web-ready derived assets so the mark is legible and does not create awkward spacing. Do not invent or redraw the logo.

## Color direction
- Emerald Green: `#00A86B` — core brand signal, active states, links, positive highlights, select gradients.
- Navy Blue: `#12355B` — primary text, structural backgrounds, footer, premium/trust anchor.
- Accent Orange: `#FF8C42` — preferred color for primary/default CTA buttons. Use navy text where that gives stronger contrast; ensure accessible focus/hover states.
- Add restrained pale emerald/navy/orange tints as separate soft-surface tokens so the orange accent token does not accidentally make every subtle background saturated.
- Keep page backgrounds light and calm; avoid flooding the UI with all three colors equally.

## Aesthetic direction
Confident athletic marketplace: navy supplies institutional trust, emerald supplies motion and wellbeing, and orange supplies decisive action. Preserve the app's established layout but make the shell and component states feel like one intentional system. Avoid generic neon gym styling, excessive gradients, or decorative clutter.

## Typography
Keep the current typography unless a font is already locally established. Strengthen hierarchy through weight, navy foreground, and spacing rather than introducing external font dependencies.

## Required implementation
1. Update central Tailwind/theme variables in `src/index.css`, including foreground/surface tokens where helpful.
2. Update `src/components/Ui.jsx` so default primary CTAs use orange consistently with accessible hover/focus/disabled states. Preserve secondary/outline/ghost semantic distinction using soft tokens rather than saturated orange fills.
3. Update `Navbar.jsx`, `Footer.jsx`, and `Logo.jsx` to incorporate the actual new logo assets appropriately and responsively; prefer reusing `Logo.jsx` rather than duplicating image markup.
4. Update the browser favicon in `index.html` to the symbol asset or a derived web-ready favicon.
5. Update hard-coded legacy brand colors where visible, particularly the footer navy and shared focus/hover states. Search the codebase first and keep changes scoped.
6. If the home hero currently uses a monochrome legacy-green treatment, revise it to a restrained navy/emerald brand treatment without changing content.
7. Maintain responsive layout and accessibility; logo images require sensible alt text and non-distorted sizing. Ensure button text contrast meets WCAG AA.
8. Do not add external images or network dependencies.

## User feedback — iteration 2
- Remove the homepage statistics strip containing `500+ Verified Trainers`, `150+ Trusted Gyms`, and `10K+ Happy Clients` in its entirety.
- Use the standalone FITLINK symbol currently displayed as the hero artwork as the brand mark in the header/navbar, favicon, and footer.
- In the header and footer, pair that symbol with the exact text `Fitlink Kenya` rather than the full horizontal logo lockup.
- Keep the hero symbol artwork unless removing it is required for a clean layout; the instruction is to reuse that same mark consistently elsewhere.

## User feedback — iteration 3
- Replace the old public contact email everywhere with `support@fitlink.co.ke`, including footer, Contact page, and legal pages.
- Add a clearly labeled feedback form that sends feedback to `support@fitlink.co.ke`.
- No email service/backend is currently configured. Implement an honest mail-client handoff using a populated `mailto:` URI (name, reply email, category/subject, and feedback body) rather than showing a false “sent” confirmation. Explain near the submit action that the user's email app will open to finish sending.
- Keep the form accessible: visible labels, required indicators where appropriate, useful autocomplete attributes, and branded focus states.

## What makes it memorable
The curved FITLINK symbol should become the recurring visual signature: clearly present in the shell, echoed through restrained curved/gradient brand surfaces rather than through new illustrative assets.

## Image needs
No new AI-generated imagery. Use the three supplied brand assets. Derived crops/optimized versions are allowed and encouraged when needed for practical web display and favicon behavior.

## Verification
- Run `npm run build` and `npm run lint`.
- If feasible, run the app and inspect desktop and mobile views of the home page plus at least one listing/form page.
- Report exact files changed and any pre-existing lint/build issues separately.
