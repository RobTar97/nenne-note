# Project site

The public explainer for ねんねノート / Nenne Note lives in [`site/`](../site/)
and is published at [robtar97.github.io/nenne-note](https://robtar97.github.io/nenne-note/).
It is a dependency-free, bilingual static page for a Japanese-first,
local-first baby tracker: diapers, bottles, nursing, sleep, growth, and firsts.

## Content register

The page is for a parent who may be holding a baby with one hand, often at
night. Its job is to explain the app quickly and send an interested reader to
the source and setup instructions on GitHub.

- Japanese is the default for Japanese browser settings; English is the
  fallback for other browsers.
- The language choice is stored locally in the browser. `?lang=ja` and
  `?lang=en` can be used for direct links.
- The voice is plain, specific, and honest. The page does not invent reviews,
  store availability, health claims, or usage statistics.
- Useful search language is included naturally in headings and answers:
  “offline baby tracker”, “local baby log”, “diaper and feeding tracker”,
  “sleep log”, and “Japanese baby tracking app”. It is not repeated as hidden
  keyword text.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Semantic structure, metadata, JSON-LD, and initial Japanese copy |
| `styles.css` | Responsive layout, typography, focus states, and purposeful motion |
| `script.js` | The Japanese/English dictionary, browser-language detection, and preference storage |
| `assets/` | App screenshots, icon assets, and authored line-art SVGs |
| `robots.txt` | Allows indexing and points crawlers at the sitemap |
| `sitemap.xml` | Canonical Pages URL for search crawlers |

There are no external fonts, analytics, ads, build steps, or third-party
scripts. Links to GitHub are the only intentional outbound actions from the
page.

## Local preview

From the repository root:

```bash
python -m http.server 4173 --directory site
```

Then open <http://127.0.0.1:4173/>. Check both languages, a narrow phone
viewport, keyboard focus, and reduced motion before pushing copy or layout
changes.

## Publishing

`.github/workflows/pages.yml` validates the required files, uploads `site/` as
the Pages artifact, and deploys it on pushes to `main` or a manual workflow
dispatch. Repository Pages must use **GitHub Actions** as its source. The
workflow needs `contents: read`, `pages: write`, and `id-token: write` for the
deployment job.

## Release checklist

- Keep the canonical URL and `og:url` aligned with the repository Pages URL.
- Update the sitemap `<lastmod>` when the public page changes materially.
- Give every meaningful screenshot an accurate localized `alt` description.
- Keep headings and body copy flexible; never rely on a fixed English width.
- Test at 390px and desktop widths, with keyboard navigation and reduced motion.
- Keep store links out until signed store-ready builds actually exist.
