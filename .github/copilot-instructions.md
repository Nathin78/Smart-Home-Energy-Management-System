## Purpose

This file gives concise, repository-specific instructions for AI coding agents to be immediately productive.

## Quick overview

- This repository is a small static site composed of HTML pages at the repo root (for example: `day2.html`, `day3.html`, `day4.html`, `day6.html`, `signup.html`).
- There is no build system, package manifest, or server code in this repo — edits are generally applied directly to the HTML/CSS/JS files.

## Big-picture architecture

- Flat, file-per-page layout: each `dayN.html` is an independent page representing a lesson/task. Changes are local to each page unless shared assets are introduced.
- `signup.html` is a UI-only form page in this repository. There is no discoverable backend here — treat form submissions as either client-only behavior or integrations with external services.

## How to work here (developer workflows)

- Local testing: open the files in a browser or run a trivial static server for correct relative-path behavior:

  ```bash
  python -m http.server 8000
  # then visit http://localhost:8000/signup.html
  ```

- Debugging: use browser DevTools for DOM, network, and console debugging. Prefer minimal edits and quick reloads when iterating.

## Project-specific conventions and patterns

- Filenames use lowercase and short identifiers (e.g., `day2.html`, `signup.html`). Follow the same naming style for new pages.
- Prefer adding a single new JS file (e.g., `main.js`) for shared logic rather than scattering large script blocks across pages. If you must add inline scripts, keep them short and self-contained.
- Keep styles simple and local; if you add shared CSS, place it at the repository root and use relative links from pages.

## Integration points & external dependencies

- No internal package or service integration is present. Any external integration (analytics, form-backend) must be added explicitly and documented in the pull request.

## Safety and scope for AI agents

- Do not infer or add server-side code. If a requested change requires a backend, call this out and ask the maintainer for details (endpoint URL, API contract, auth).
- When modifying `signup.html`, validate that your changes do not assume hidden server logic (e.g., server-side validation, DB writes) unless the user provides explicit integration details.

## Examples (how to implement common changes)

- To add client-side validation to `signup.html`, add a small `signup.js` and attach it via a relative `<script src="signup.js"></script>` near the end of the page.
- To preview multiple pages together, run the static server above and open multiple tabs — do not create a build step.

## If `.github/copilot-instructions.md` already exists

- Preserve existing content. Merge only repository-specific sections and keep the original author intent. If the existing file contains higher-level policies, append repository specifics under a new heading.

## When to ask the maintainer

- If a change requires a backend endpoint, database, or CI changes.
- If adding external libraries or changing repository structure.

---
If anything in this guidance is unclear or you want a different tone/length, tell me which sections to update and I will iterate.
