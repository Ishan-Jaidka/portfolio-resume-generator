# Resume + portfolio

One YAML source drives a PDF resume and a TypeScript portfolio.

```text
content/          Shared YAML: profile, experience, projects, education, skills, interests
                  options.yaml controls the PDF; portfolio.yaml controls the website
resume/           Python → Jinja/LaTeX → PDF generator, schemas, tests, and docs
  output/         Generated cv.pdf, resume.json, and portable latex/
portfolio/        Next.js portfolio adapted from mldangelo/personal-site
```

Edit **`content/*.yaml`**. The website reads these files directly during its
production build, validates them with the resume's existing JSON schema, and
prerenders name/contact details, experience, projects, and education. There is no
duplicate resume data file. Linked text and nested experience bullets are preserved.
The PDF uses the profile `show` flags and `options.yaml`. The website has separate
contact visibility settings in `content/portfolio.yaml`, so a PDF-hidden GitHub
link can still appear on the website.

## Build the resume

Requires Python 3.10+ and XeLaTeX ([MacTeX](https://tug.org/mactex/) on macOS,
[MiKTeX](https://miktex.org/download) on Windows). From the repository root:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r resume/requirements.txt
.venv/bin/python resume/scripts/build_resume.py
```

Open **`resume/output/cv.pdf`**. Add `--watch` to rebuild on edits, or `--no-pdf`
to generate JSON and LaTeX without a compiler. VS Code's **Resume: build** and
**Resume: watch** tasks still work. On Windows use `py -3` and
`.\.venv\Scripts\python.exe` instead of `python3` and `.venv/bin/python`.

See the [resume guide](resume/docs/GUIDE.md) and
[AI-assisted setup prompt](resume/docs/SETUP_PROMPT.md).

## Run the portfolio

Requires Node.js 22.14+ (Node 22 LTS recommended).

```sh
cd portfolio
npm ci
npm run dev
```

Open **http://localhost:3000**. After editing shared YAML, refresh the page;
restart the dev server if a cached page persists. Production commands:

```sh
npm run type-check
npm run build
npm start
```

`predev` and `prebuild` copy `resume/output/cv.pdf` to the ignored
`portfolio/public/resume.pdf`, served at `/resume.pdf`. Build the resume again
when its content changes, then restart/rebuild the portfolio to refresh the PDF.
The generated PDF is tracked in Git so the website can build on Vercel without
Python or LaTeX. Commit the refreshed `resume/output/` with YAML changes.

## Deploy to Vercel later

Import this Git repository as a **Next.js** project with:

- **Root Directory:** `portfolio`
- **Include source files outside of the Root Directory in the Build Step:** enabled
  (required for `content/`, `resume/resume.schema.json`, and `resume/output/cv.pdf`)
- **Install Command:** `npm ci`
- **Build Command:** `npm run build`
- **Output Directory:** Next.js default (`.next`)
- **Node.js:** 22.x

Keep deployments enabled for shared content changes (do not configure an ignored
build step that watches only `portfolio/`). Add **`ishan.jaidka.dev`** to the
project's domains and apply the DNS records Vercel provides. The site already uses
`https://ishan.jaidka.dev` as its canonical metadata URL. See
[Vercel's monorepo documentation](https://vercel.com/docs/monorepos).
This change does not deploy the site or change DNS.

## Checks

From the repository root:

```sh
.venv/bin/python -m unittest discover -s resume/tests
npm --prefix portfolio run type-check
npm --prefix portfolio run build
npm --prefix portfolio test  # Checks the production HTML; run after build
```

## Customize the website

Edit **`content/portfolio.yaml`** for the introduction, portrait, accent colors,
section titles/order, navigation labels, contact visibility, and experience preview
length. Remove an entry from `sections` to hide it; set `navLabel: null` to keep it
out of navigation. The main hero action must target an enabled section.

The `projects` mapping uses exact names from `content/projects.yaml` and holds only
presentation settings (category, illustration, accent, optional image, and link
labels). Project facts and URLs stay in `projects.yaml`. New projects render
automatically even without presentation settings. To replace an illustration with
a real image, put it under `portfolio/public/images/` and add:

```yaml
projects:
  Quieter Cities:
    image:
      src: /images/quieter-cities.webp
      alt: Screenshot of the Quieter Cities reporting page
```

These are optional display fields on an existing entry; retain any other settings
you want. Available illustrations are `city`, `calculator`, and `greenhouse`, with
a generic fallback. The current illustrations are decorative, not screenshots.
The portrait is reused from the latest `portfolio-react` GitHub revision. The same
`hero.portrait` setting drives the hero, circular header avatar, and generated tab
icon. Set `header.showName: false` for an avatar-only header. The toolbar stays pinned and gains a blurred translucent background after scrolling.
On mobile it shows only the circular home portrait and hamburger button; your name
and navigation links appear on desktop. The hamburger opens the starter's right-side
slide-out panel, which closes on navigation, Escape, or an outside click and respects
reduced-motion preferences.

Configuration is validated at build time with `portfolio/portfolio.schema.json`;
unknown fields, missing images, invalid project references, and broken hero section
links fail the build. Resume facts continue to use `resume/resume.schema.json`.
The resume builder ignores `portfolio.yaml`, so website edits do not affect the PDF.

Components are separated into `Template/`, `Projects/`, and `sections/`. Adding a
new section involves creating its component, registering it in
`portfolio/src/components/sections/index.ts`, and adding its id to the config type
and schema. No page layout rewrite is required. Styling lives in the starter's
modular style folders, with this portfolio's adaptations in
`portfolio/app/styles/pages/portfolio.css`.

The portfolio retains the starter's typography, design tokens, page wrapper, and
resume timeline, with the old site's slate/yellow palette and portrait. See
[portfolio provenance](portfolio/UPSTREAM.md) for the source revision and retained
MIT license.
