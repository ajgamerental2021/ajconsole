# Working on this repo

Two assistants work on this project: Codex reads this file, Claude Code reads
`CLAUDE.md`, which points here. Whichever one picks up the work reads this file
first and needs nothing else explained.

## What this repo is

Static pages for AJ, a game console rental shop in Bangkok. No build step: every
page is one self-contained HTML file with its CSS and JS inline. Open a file in a
browser and it runs.

| File | What it is |
|---|---|
| `index.html` | The live booking site. Treat every change here as production. |
| `index-demo.html` | Where new work lands first. Not a copy of `index.html` — see below. |
| `game_index.html` | Game catalogue, also embedded in the booking page as a picker. |
| `google-apps-script/social-proof-sync.gs` | Daily job that writes ratings and reviews into the Gist. |

The booking flow also has a server in a separate repo,
`~/Documents/AJ LINE OA Bot` (LINE bot, contract LIFF page, PDF, notifications).
Contract and payment work usually touches both repos.

## index.html and index-demo.html have diverged

`index-demo.html` was forked from `index.html` long ago and the two moved on
separately. `index.html` gained LINE LIFF entry, the rental contract flow, queue
closures, Wise and card payment options and the After Work promotion. The demo
never received any of it.

**Copying one over the other deletes features.** Moving work from the demo into
production is a three-way merge against the fork point, resolved in favour of
production everywhere except the change being ported. Check with the shop owner
before doing it.

## Data lives in a Gist, not in the code

Consoles, promotions, FAQ, bundles and the social proof block are edited in the
page's own admin panel and synced to a GitHub Gist
(`4e8fb8c04f38df0538dc9172da99887a`, file `aj_rental_data.json`). Defaults in the
code are only a fallback for a first visit.

Adding an admin-managed field means touching all of: the `DEFAULT_*` constant, a
`normalize*` function, `loadState`, `saveLocal`, the Gist payload builder,
`applyRemoteData`, an admin tab, and the renderer. Missing one leaves a field
that looks saved but disappears on the next load.

## House style

- Thai and English are both first-class. Every user-visible string goes in the
  `I18N` object under both languages. Never leave one side untranslated.
- No emoji in the interface. There is an inline SVG icon set (`ICON_PATHS`);
  add to it instead.
- Quote customer reviews in the language they were written in. Do not translate.
- Constants used during startup must be declared above the code that runs at
  startup. This file has bitten us three times with `ReferenceError: Cannot
  access X before initialization` — `applyLanguage()` and friends run immediately.
- Cache-busting: bump `gamePickerVersion` when `game_index.html` changes, and the
  `app.js?v=` query in the bot repo's LIFF page when its script changes.

## Before saying something works

The pages have no tests. Verify in a browser:

```bash
python3 -m http.server 8799        # from the repo root
```

Then check the change on mobile (375px) and desktop, in both languages, with the
browser console open. Extract the inline script and syntax-check it before
claiming a page loads:

```bash
python3 - <<'PY'
import re
s = open('index-demo.html', encoding='utf-8').read()
big = [x for x in re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', s, re.S) if 'window.AJ2' in x][0]
open('/tmp/check.js', 'w', encoding='utf-8').write(big)
PY
node --check /tmp/check.js
```

## Handing over

`docs/PROJECT-STATE.md` is the running log. Read it at the start of a session and
update it at the end: what landed, what is half-finished, what the shop owner is
waiting on. Commit messages carry the reasoning for a single change; that file
carries the state of the whole project.

Push to `main` when a change is finished and verified. The shop owner also edits
files directly on GitHub, so fetch before pushing and rebase rather than force.

## Credentials

Never put an API key, access token or password in a tracked file. They belong in
Apps Script Script Properties or the bot repo's `.env`. If asked to fill one in,
say it has to be done by the owner.
