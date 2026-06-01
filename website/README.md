# Goldfish Society Website

Static website files for Goldfish Society.

## Pages

- `index.html` - Bubble Tea Cat / main landing page
- `goldfish-society.html` - Goldfish Society page
- `goldfish-games.html` - Goldfish Games page

## Assets

Images, fonts, and other binary assets live in `assets/`.

Do not embed images as base64/data URLs in the HTML. Reference files instead:

```html
<img src="assets/page-name/image.png" alt="">
```

This keeps the HTML readable, keeps Git diffs smaller, and prevents AI chats from getting bloated when the files are discussed.

Shared page CSS lives in `assets/styles/`. Small page scripts live in `assets/scripts/`.

If a fresh Claude Design export brings inline CSS or scripts back into the HTML, run:

```sh
node tools/extract-inline-website-assets.mjs
```

That moves inline styles/scripts into local files so GitHub does not classify the whole repo as one big block of HTML.

## Editing Notes

- Keep changes scoped to `website/` unless Hoppy asks for broader repo edits.
- Include screenshots when opening PRs for visual changes.
- Do not add copyrighted images, lyrics, or media unless rights/usage are clear.
- Keep disclaimers and affiliation language intact unless Hoppy explicitly approves wording changes.
