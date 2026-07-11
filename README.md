# Portfolio

A fast, static developer portfolio — pure HTML/CSS/JS, no backend or server required.
Content (profile, projects, skills) lives in the `data/` folder as JSON, fetched client-side.

## Structure

```
portfolio/
├── index.html
├── css/style.css
├── js/script.js
├── data/
│   ├── profile.json
│   ├── projects.json
│   └── skills.json
└── img/
```

## Run locally

Because the page uses `fetch()` for the JSON files, open it through a local server
(not by double-clicking `index.html`, which some browsers block for `file://` fetches):

```bash
# from the project root
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:8080` (or whatever port is shown).

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages** in your repo.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Choose branch `main` and folder `/ (root)`.
5. Save. Your site will be live at:
   `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`
   (takes 1–2 minutes on first deploy)

## Editing content

- **Profile / about / socials** → `data/profile.json`
- **Projects** → `data/projects.json`
- **Skills** → `data/skills.json`

Edit the JSON, commit, push — Pages auto-redeploys.

## Contact form

There's no backend to receive submissions, so the form opens the visitor's email
client with a pre-filled message (`mailto:`). If you'd rather collect real
submissions without running a server, drop in a free form service like
[Formspree](https://formspree.io) or [Getform](https://getform.io) — just point
the form's `action` at the endpoint they give you.

## License

See `LICENSE`.
