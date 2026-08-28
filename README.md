# Coral Stucco & Exteriors — "The Shell"

A redesign of [coralexteriors.com](https://coralexteriors.com/) for **Coral Stucco & Exterior Ltd**, Calgary, Alberta.

## The idea

A coral builds its shell one layer at a time, because the ocean never stops.
Calgary never stops either. The whole site is built on that one image: stucco and
parging are a **mineral shell**, applied in layers, defending a house from a climate
that freezes and thaws in the same afternoon.

Every section follows the story — the threat, the anatomy of the shell, the trades
that build it, the proof it holds.

## Built with

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.
Drop it on any static host.

## Structure

```
index.html            single-page narrative site
assets/css/style.css  design system + all animation
assets/js/main.js     motion engine (vanilla, ~450 lines)
assets/img/           project photography
```

## Motion

Scroll-reveal with word-level text splitting, an interactive 3-D exploded wall
diagram (traditional stucco vs. EIFS), a live freeze–thaw simulation driven by a
temperature slider, hover-follow project previews, dual-direction review marquees,
magnetic buttons, and a stucco-grain overlay. Everything collapses cleanly under
`prefers-reduced-motion`.

## Content

All business facts — services, service areas, hours, contact details, reviews —
come from the client's existing site and their public Google reviews. The
explanatory sections (wall anatomy, parging, efflorescence, woodpeckers,
freeze–thaw) are added educational content written for this redesign.

No licence numbers, warranty terms, financing offers or street address are claimed,
because none are published by the business.

## Contact form

The form composes a `mailto:` message so it works on a static host with no backend.
To use a real endpoint instead, point the form at a service such as Formspree and
remove the `submit` handler in section 14 of `assets/js/main.js`.

## Local preview

```bash
python -m http.server 8080
```

Then open <http://localhost:8080>.
