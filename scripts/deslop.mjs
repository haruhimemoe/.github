#!/usr/bin/env bun
/**
 * @file scripts/deslop.mjs
 * @desc A free local sweep over every haruhimemoe repo cloned side by side: missing governance
 *       and CI files, long files and blocks, missing @file headers, console.log, TODOs, .only,
 *       `any` casts, lint suppressions, em dashes, and apps behind our own packages. --deep adds
 *       bun outdated, knip, publint and gitleaks. Prints one Markdown report.
 *       Usage: bun scripts/deslop.mjs ~/path/to/haruhimemoe [--deep] > report.md
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 10, 2026
 * @modified Sat Oct 10, 2026
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2];
const deep = process.argv.includes("--deep");
const sh = (cmd, cwd) => {
  try {
    return execSync(cmd, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 300_000 });
  } catch (e) {
    return `${e.stdout ?? ""}${e.stderr ?? ""}`;
  }
};

const repos = readdirSync(root).filter((d) => existsSync(join(root, d, ".git")));
const pkgOf = (d) => {
  try {
    return JSON.parse(readFileSync(join(root, d, "package.json"), "utf8"));
  } catch {
    return null;
  }
};
const latest = Object.fromEntries(
  repos.map(pkgOf).filter((p) => p?.name?.startsWith("@haruhimemoe/")).map((p) => [p.name, p.version]),
);

const GOV = ["README.md", "LICENSE", "CHANGELOG.md", "SECURITY.md", "CONTRIBUTING.md", "CLAUDE.md",
  ".github/workflows/ci.yml", ".github/workflows/codeql.yml", ".github/workflows/secrets.yml", ".gitleaks.toml", ".github/dependabot.yml"];
const SRC = /\.(ts|tsx|mjs|js)$/;
const SKIP = /(^|\/)(dist|node_modules|\.next|coverage)\//;

const out = [`# deslop report\n\n${new Date().toISOString()} · ${repos.length} repos${deep ? " · deep" : ""}\n`];
for (const d of repos) {
  const dir = join(root, d);
  const pkg = pkgOf(d);
  const lib = pkg?.name?.startsWith("@haruhimemoe/");
  const files = sh("git ls-files", dir).split("\n").filter((f) => f && !SKIP.test(f));
  const f = [];
  const missing = GOV.filter((g) => !existsSync(join(dir, g)));
  if (missing.length) f.push(`- **gov missing:** ${missing.join(", ")}`);

  const hits = { long: [], longFn: [], header: [], escaped: [], log: [], todo: [], dash: [], any: [], only: [], ignore: [] };
  for (const file of files) {
    const path = join(dir, file);
    let text;
    try {
      text = readFileSync(path, "utf8");
    } catch {
      continue;
    }
    if (/\.(md|mdx|tsx?|mjs|json)$/.test(file) && !/CHANGELOG/.test(file)) {
      const n = (text.match(/—/g) ?? []).length;
      if (n) hits.dash.push(`${file} (${n})`);
    }
    if (!SRC.test(file) || file.endsWith(".d.ts")) continue;
    const lines = text.split("\n");
    if (lines.length > 600) hits.long.push(`${file} (${lines.length})`);
    if (!text.includes("@file") && !/\.config\.|^\.|\/\./.test(file)) hits.header.push(file);
    if (/\\n \*\s/.test(text.slice(0, text.indexOf("*/")))) hits.escaped.push(file);
    lines.forEach((l, i) => {
      const at = `${file}:${i + 1}`;
      if (/\bconsole\.(log|debug)\(|\bdebugger;/.test(l) && !/scripts\/|bin\//.test(file)) hits.log.push(at);
      if (/\b(TODO|FIXME|XXX|HACK)\b/.test(l)) hits.todo.push(at);
      if (/:\s*any\b|as any\b|as unknown as/.test(l)) hits.any.push(at);
      if (/\b(it|describe|test)\.(only|skip)\(/.test(l)) hits.only.push(at);
      if (/biome-ignore|eslint-disable|@ts-(ignore|expect-error)/.test(l)) hits.ignore.push(at);
    });
    // top-level function length: start at col 0, end at the next col-0 closer
    for (let i = 0; i < lines.length; i++) {
      if (!/^(export )?(default )?(async )?(function|const|let) \w+/.test(lines[i])) continue;
      let j = i + 1;
      while (j < lines.length && !/^[}\])]/.test(lines[j]) && !/^(export |const |function |type |import )/.test(lines[j])) j++;
      if (j - i > 150) hits.longFn.push(`${file}:${i + 1} (${j - i})`);
    }
  }
  const list = (k, label, cap = 12) => {
    const h = hits[k];
    if (h.length) f.push(`- **${label} (${h.length}):** ${h.slice(0, cap).join(", ")}${h.length > cap ? ", ..." : ""}`);
  };
  list("long", "files over 600 lines");
  list("longFn", "top-level blocks over 150 lines");
  list("header", "no @file header");
  list("escaped", "literal \\n in the file header");
  list("log", "console.log/debugger");
  list("todo", "TODO/FIXME");
  list("only", ".only/.skip in tests");
  list("any", "any / as unknown as");
  list("ignore", "lint/ts suppressions");
  list("dash", "em dashes");

  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies, ...pkg?.peerDependencies };
  const stale = Object.entries(deps)
    .filter(([n, v]) => latest[n] && v.replace(/^[\^~]/, "") !== latest[n] && !String(v).startsWith("workspace"))
    .map(([n, v]) => `${n} ${v} → ${latest[n]}`);
  if (stale.length) f.push(`- **behind own libs:** ${stale.join(", ")}`);

  if (deep && pkg) {
    const outdated = sh("bun outdated", dir).split("\n").filter((l) => /^\│|^\|/.test(l) && !/Package/.test(l));
    if (outdated.length) f.push(`- **bun outdated (${outdated.length}):**\n\n\`\`\`\n${outdated.join("\n")}\n\`\`\``);
    const knip = sh("bunx --bun knip --no-progress --reporter compact", dir).trim();
    if (knip && !/^$/.test(knip)) f.push(`- **knip:**\n\n\`\`\`\n${knip.split("\n").slice(0, 25).join("\n")}\n\`\`\``);
    if (lib) {
      const pub = sh("bunx --bun publint", dir).trim();
      if (!/All good/.test(pub)) f.push(`- **publint:**\n\n\`\`\`\n${pub}\n\`\`\``);
    }
    const leaks = sh("gitleaks git --no-banner --redact -v . 2>&1 | grep -E 'RuleID|File|Commit' | head -30", dir).trim();
    if (leaks) f.push(`- **gitleaks:**\n\n\`\`\`\n${leaks}\n\`\`\``);
  }

  out.push(`## ${d}${pkg?.version ? ` (${pkg.version})` : ""}\n\n${f.length ? f.join("\n") : "- clean"}\n`);
}
console.log(out.join("\n"));
