# Starter provenance

Adapted from [mldangelo/personal-site](https://github.com/mldangelo/personal-site),
revision `5e35b9beeecdd70aac3404b11a2cbf0e9d497105` (retrieved October 7, 2026).
The upstream MIT license is retained in [LICENSE](LICENSE).

Retained: design tokens, base styles, button/card styles, page layout, home,
resume and content styles, local Fontsource setup, and the PageWrapper component.
Hero and the experience timeline component were adapted to shared YAML. The
single-page navigation and footer use that same profile data. Upstream sample
content, images, routes, analytics, and unrelated features were not imported.

The only content source is `../content/`. `src/lib/content.ts` reads and validates
it with `../resume/resume.schema.json` at build time. The resume PDF is a generated
artifact copied from `../resume/output/cv.pdf` by the npm lifecycle scripts.

## Personal assets and presentation

`public/images/ishan-current.jpeg` was copied from
`Ishan-Jaidka/portfolio-react` on GitHub at revision `466cf69`
(`src/images/ishan-square.jpeg`), replacing the older local portrait. The introduction is a shorter
adaptation of that repo's About section; the slate and yellow palette comes from
its existing styles. Website-specific text and display settings live in
`../content/portfolio.yaml` and are validated with `portfolio.schema.json`.
Project illustrations are new decorative SVG components, not screenshots or
photographs from the old site. The project's factual content remains shared YAML.

The hamburger icon and right-hand mobile drawer styling are also adapted from
the starter's `app/styles/layout/header.css`. The mobile toolbar remains pinned with a portrait and hamburger;
reduced-motion preferences disable the menu transitions.
