# AGENTS.md

The haruhimemoe organization's `.github` repository. GitHub shows `profile/README.md` on https://github.com/haruhimemoe and uses this repository's `SECURITY.md`, `CONTRIBUTING.md`, issue forms and pull request template for any org repository that doesn't have its own. There is no code or build. The only check is the link check.

## Files

- `profile/README.md`: the org profile. A banner, a one-line tagline, then Tools, Packages and Community. Tools links packs and pools (pools is in beta) and lists sheets as coming soon. Community links the Discord server.
- `llms.txt`: the org in [llms.txt](https://llmstxt.org/) format: tools, sites, packages, their docs, npm install lines, the Claude Code plugin, the Discord server.
- `SECURITY.md`: the default security policy. GitHub private vulnerability reporting first, email second, as in the per-repo policies.
- `CONTRIBUTING.md`: the default contributing guide. It points to each repository's own README and `AGENTS.md` for setup and checks.
- `.github/ISSUE_TEMPLATE/`: the default bug and feature forms, and `config.yml` with links to the Discord server and to `SECURITY.md`.
- `.github/PULL_REQUEST_TEMPLATE.md`: the default pull request template.
- `.github/workflows/links.yml`: runs `scripts/check-links.sh` on push, on pull requests and weekly.
- `.github/dependabot.yml`: keeps the workflow's pinned action SHAs current.
- `scripts/check-links.sh`: the link check.
- `README.md`: a banner, then what this repository holds.
- `AGENTS.md`, `CLAUDE.md`: notes for AI agents working here.
- `LICENSE`: MIT.

## Rules

- **Keep the tagline verbatim.** The line `small set of tools to help with osu! tournament organization / production` in `profile/README.md` stays exactly as written.
- **The banners are hotlinked.** The profile's loads from `https://www.haruhime.moe/brand/`, `README.md`'s from `https://www.haruhime.moe/brand/repos/`, each with a light-mode `<source>`. Don't commit images here.
- **Keep `profile/README.md` and `llms.txt` in step.** Both cover the same tools, packages, plugin and Discord server. When a tool ships or a package is added, update both.
- **Describe what is on `main` and on npm.** Take package descriptions from each repo's `package.json`, and install lines from its README. Don't describe a feature as installable before it is published.
- **Links in `profile/README.md` and `llms.txt` are absolute** (`https://`). The org page and llms.txt readers can't resolve relative links. `README.md` and `CONTRIBUTING.md` link to files in this repo with relative paths.
- **Defaults are all or nothing per repo.** A repository with any file in its own `.github/ISSUE_TEMPLATE/` gets none of the default forms or `config.yml`. Default issue forms must live in `.github/ISSUE_TEMPLATE/` here, their labels must exist in every repo that uses them, and `config.yml` links can't name a single repo.
- **Keep the defaults in step with the per-repo files.** The per-repo `SECURITY.md`, issue forms and pull request templates (for example in `haruhimemoe/pool`) use the same wording and shape.
- **Public repository.** No maintainer notes, release steps or local paths.
- Plain, short sentences. No em dashes, no marketing.

## Before calling a change done

Run the link check:

```sh
sh scripts/check-links.sh
```

It checks that every absolute link in the Markdown files and `llms.txt` returns 200 and that every relative link names a file or folder that exists. npm's website answers 403 to scripts, so it checks npm pages through the registry (`https://registry.npmjs.org/@haruhimemoe%2Fosu` for a package, `https://registry.npmjs.org/-/org/haruhimemoe/package` for the org).
