# Contributing

This is the default guide for haruhimemoe repositories that don't have their own `CONTRIBUTING.md`.

## Before you start

- Ask questions in the [Discord server](https://haruhime.moe/discord) instead of an issue.
- Report a vulnerability privately, as [`SECURITY.md`](SECURITY.md) says. Not in an issue.
- For a bug or an idea, open an issue with one of the forms first, so a change doesn't go to waste.
- Read the repository's `README.md` and, if it has one, `AGENTS.md`. They hold its setup and rules.

## Making a change

1. Branch from `main` (`feat/<topic>`, `fix/<topic>`).
2. Keep commits small and use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`).
3. Add or update a test when the repository has tests, and run its checks before opening a PR.
4. If the repository keeps a `CHANGELOG.md`, add a line under `## [Unreleased]`.
5. Open a pull request against `main` and fill in the template.

Releases are cut by the maintainers.
