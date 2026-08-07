Refer to @agents.md

## Design Context

This is the **JCA 1221 Holdings** marketing website (brand register — design IS the product), not the Design OS planning tool that `agents.md` and `README.md` describe (those are leftover template docs).

- **Strategy / who-what-why:** see [PRODUCT.md](PRODUCT.md) — register, audiences (government/LGU + investors), brand personality, anti-references, design principles.
- **Visual system / how-it-looks:** see [DESIGN.md](DESIGN.md) — tokens, palette, typography, components.
- Run `/impeccable` for design work (critique, polish, colorize, live, etc.). Live mode is pre-configured in `.impeccable/live/config.json`.

## The gate

**`npm run gate`** (`sh gates/run.sh`) is the one quality command. It runs
`tsc -b` over the whole project, then ESLint with `--max-warnings=0` over the
files that differ from the integration branch, then any `*-check.js` at the repo
root. Green in ~7s on a warm cache; non-zero exit and the failing tool's own
output on stderr when it isn't.

Everything that gates this repo calls that same script, so there is one verdict
rather than four opinions:

| Stage | Caller |
|---|---|
| per turn | `Stop` hook → `gates/claude-hook.js` (see install below) |
| per commit | `.githooks/pre-commit` |
| per push / PR | `.github/workflows/gate.yml` |
| review / merge | the sdlc-review agent's gate step, and `merge_queue --check` |

**Lint is scoped to the diff, on purpose.** `npx eslint .` reports 94 problems
at `main` (82 errors, 12 warnings, 39 files). A whole-repo lint gate would reject
every card on arrival for reasons unrelated to its diff, and a gate that is red
on arrival is one everybody learns to skip. The rule is: *touch a file and you
own its lint state; leave it alone and it stays somebody else's card.* Override
the base with `GATE_BASE=<ref>`; see the header of `gates/run.sh` for how to
drop the scoping once the baseline is clean.

**Adding a check:** write `<name>-check.js` at the repo root. It is discovered by
shape, so there is no list to remember to update.

**One-time install per clone:**

```sh
npm install                # runs `prepare` → git config core.hooksPath .githooks
npm run gate:install-hooks # copies gates/claude-settings.json → .claude/settings.json
```

`gate:install-hooks` overwrites `.claude/settings.json`; if you already keep
model or permission settings there, merge the `hooks` block by hand instead.
