# Life Dashboard — Project Spec

## Project overview

A personal productivity dashboard built as a static single-page web application.
No backend, no framework, no build step required.

## Participants

- **Batch date:** 19 Oktober 2026
- **Participant:** deayogaswara

## Target structure

```
CodingCamp-19Oktober2026-deayogaswara/
├── index.html          ← application entry point
├── css/
│   └── style.css       ← single stylesheet
├── js/
│   └── script.js       ← single JavaScript file
└── .kiro/
    └── specs/
        └── life-dashboard.md   ← this file
```

## Technical constraints

- HTML, CSS, and vanilla JavaScript only.
- No React, Vue, Angular, or other frontend frameworks.
- No backend server.
- Browser localStorage for data persistence.
- Exactly one CSS file in `css/`.
- Exactly one JavaScript file in `js/`.
- System font stack only (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`).
- No build system or external dependencies.
- Deployable to GitHub Pages as a static site.

## Features

### A — Greeting and clock
- Live digital clock (updates every second).
- Current date displayed in full format.
- Time-of-day greeting (Good morning / afternoon / evening / night).
- Customisable user name, persisted in localStorage (`dashboard_username`).

### B — Focus timer
- Fixed 25-minute countdown.
- Start, Stop (pause), and Reset controls.
- Wall-clock accurate countdown (uses `endTime - Date.now()`, not tick counting).
- CSS conic-gradient progress ring driven by `--progress` custom property.
- Clear completion state with screen reader announcement.

### C — To-Do list
- Add, edit, mark complete/incomplete, and delete tasks.
- Case-insensitive, whitespace-trimmed duplicate prevention.
- Active tasks sorted before completed tasks at render time.
- Persisted in localStorage (`dashboard_tasks`).

### D — Quick links
- Add a site name and URL, open in new tab, delete.
- URL validation: must be valid and use http: or https: only.
- Persisted in localStorage (`dashboard_links`).

## Optional challenges implemented

1. Light / Dark mode — preference persisted in localStorage (`dashboard_theme`).
2. Custom greeting name — persisted in localStorage (`dashboard_username`).
3. Duplicate task prevention — case-insensitive, whitespace-trimmed comparison.

## localStorage keys

| Key                  | Contents              |
|----------------------|-----------------------|
| `dashboard_theme`    | `"light"` or `"dark"` |
| `dashboard_username` | string (user name)    |
| `dashboard_tasks`    | JSON array of tasks   |
| `dashboard_links`    | JSON array of links   |

## Repository

- **GitHub repository:** https://github.com/deayogaswara/CodingCamp-19Oktober2026-deayogaswara
- **GitHub Pages URL:** https://deayogaswara.github.io/CodingCamp-19Oktober2026-deayogaswara/

## Deployment

Deployed via GitHub Pages from the `main` branch, serving `index.html` at the repository root.
All asset paths (`css/style.css`, `js/script.js`) are relative — no absolute paths used.
No build step is required; push the source files and enable GitHub Pages on the `main` branch.
