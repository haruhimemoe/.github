# AGENTS.md

The haruhimemoe organization's `.github` repository. GitHub shows `profile/README.md` on https://github.com/haruhimemoe and uses the root `SECURITY.md` for any org repository that doesn't have its own. There is no code, build or test suite.

## Files

- `profile/README.md`: the org profile. A banner, a one-line tagline, then Tools and Packages.
- `llms.txt`: the org in [llms.txt](https://llmstxt.org/) format: tools, sites, packages, their docs, npm install lines, the Claude Code plugin.
- `SECURITY.md`: the default security policy. Same wording as the per-repo policies.
- `README.md`: what this repository holds.
- `AGENTS.md`, `CLAUDE.md`: notes for AI agents working here.
- `LICENSE`: MIT.

## Rules

- **Keep the tagline verbatim.** The line `small set of tools to help with osu! tournament organization / production` in `profile/README.md` stays exactly as written.
- **The banner is hotlinked.** It loads from `https://www.haruhime.moe/brand/` with a light-mode `<source>`. Don't commit images here.
- **Keep `profile/README.md` and `llms.txt` in step.** Both cover the same tools, packages and plugin. When a tool ships or a package is added, update both.
- **Describe what is on `main` and on npm.** Take package descriptions from each repo's `package.json`, and install lines from its README. Don't describe a feature as installable before it is published.
- **Links in `profile/README.md` and `llms.txt` are absolute** (`https://`). The org page and llms.txt readers can't resolve relative links. `README.md` links to files in this repo with relative paths. Check every link before committing (see below).
- **Public repository.** No maintainer notes, release steps or local paths.
- Plain, short sentences. No em dashes, no marketing.

## Before calling a change done

Check that every absolute link returns 200:

```sh
grep -ohE 'https://[^] )>"`]+' profile/README.md llms.txt README.md | sort -u \
  | xargs -n1 curl -s -o /dev/null -L -w '%{http_code} %{url_effective}\n'
```

Check that every relative link in `README.md` names a file that exists:

```sh
grep -oE '\]\([^):]+\)' README.md | tr -d '()]' | xargs -n1 ls
```

npm's website answers 403 to scripts. Check an npm page through the registry instead, for example `https://registry.npmjs.org/@haruhimemoe%2Fosu` for a package or `https://registry.npmjs.org/-/org/haruhimemoe/package` for the org.
