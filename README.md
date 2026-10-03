# dsh-ai-suplex

**The execution loop your agent is missing.**

A free, open-source **DeepSeek Harness (dsh)** plugin that makes the AI-Suplex 7-7-7 workflow pipeline a first-class citizen inside the harness — **plan → run → capture → close → compound** — over a local markdown vault.

> Everyone is building memory that writes itself. This builds memory that has to **earn its place** — on a rhythm you control.

`MIT` · Node **>= 20** · no network · no database · no daemon — files and a bundled CLI.

---

## Why

Most agent tooling treats context as a *session*. Real work is a *loop*:

    plan → execute → capture → close → compound

`dsh-ai-suplex` gives that loop a home inside dsh and backs it with a plain markdown vault **you own**. The vault stays the system of record; the harness is a surface. Swap the harness, keep the mind.

**Live proof:** [wqr.co.zw](https://wqr.co.zw) — a real business run on the AI-Suplex loop.

## Status

**v0.4.0 — the full v0 loop ships.** Nine tools run against a real vault, and a clean room bootstraps cold:

| Pipeline stage | Tool | State |
|---|---|---|
| Bootstrap | `ai_suplex_init` | shipped |
| Context Core | `ai_suplex_context` | shipped |
| Plan | `ai_suplex_tasklist` | shipped |
| Capture | `ai_suplex_capture` | shipped |
| Session End | `ai_suplex_session_end` | shipped |
| Learn | `ai_suplex_learn` | shipped |
| Promote (gated) | `ai_suplex_promote` | shipped — approval-gated |
| Approvals | `ai_suplex_approvals` | shipped |
| Status | `ai_suplex_status` | shipped |

## Requirements

- **dsh** (DeepSeek Harness)
- **Node >= 20** (ESM)
- A workspace. No vault yet? `ai_suplex_init` creates one.

## Install

    dsh plugin --profile web add dsh-ai-suplex
    dsh --profile web --dump-config | grep ai-suplex

Confirm the `ai-suplex` row appears — **a plugin that installs but does not activate is a dependency, not a layer.**

From a checkout (trial profile, before/without an npm release):

    dsh plugin --profile dshtrial add /path/to/dsh-ai-suplex

## Quick start

    # 1 · bootstrap a vault (skip if you already have one)
    ai_suplex_init path=/path/to/my-vault

    # 2 · load context — staleness guard + mission brief
    ai_suplex_context

    # 3 · plan
    ai_suplex_tasklist title="Ship the landing page" todos=[...]

    # 4 · capture as you go, then close
    ai_suplex_capture title="..." content="..." cycle=2 week=5
    ai_suplex_session_end title="..." rating=5

## The loop

    ai_suplex_context      # staleness guard + mission brief
    ai_suplex_tasklist     # to-dos -> a tasklist that opens with Phase 0
    ai_suplex_capture      # artifact to the period-correct path
    ai_suplex_session_end  # report + 3lm end
    ai_suplex_learn        # extract lessons
    ai_suplex_promote      # scored promotion — needs approved: true
    ai_suplex_approvals    # the Hustler-decides inbox
    ai_suplex_status       # memory stats + boss HP

## Tools

| Tool | What it does | Key parameters |
|---|---|---|
| `ai_suplex_init` | Scaffold a minimal vault (period.md · seed `Tools/3lm.js` · Tasklists · Memory · Sessions) | `path` |
| `ai_suplex_context` | Run `3lm start --context`; return the staleness guard + brief | `stale_days` |
| `ai_suplex_tasklist` | Raw to-dos → the pipeline tasklist format, written to `Tasklists/Active/` | `title`, `todos[]`, `type`, `focus`, `cycle`, `week`, `write` |
| `ai_suplex_capture` | Write an artifact to the period-correct path | `title`, `content`, `cycle`, `week`, `focus` |
| `ai_suplex_session_end` | Assemble the Session End Report and run `3lm end` | `title`, `rating`, `narrative`, `key_insights`, `next_actions`, `run_3lm_end` |
| `ai_suplex_learn` | Extract lessons from the latest episode into `Memory/lessons.md` | — |
| `ai_suplex_promote` | Score + promote lessons (`3lm promote --min N`) — **approval-gated** | `approved` (must be `true`), `min` |
| `ai_suplex_approvals` | The decisions inbox as machine-readable JSON | — |
| `ai_suplex_status` | Memory stats · active tasklists · boss HP | — |

## The gate

`ai_suplex_promote` refuses to fire without an explicit `approved: true`:

    ai_suplex_promote approved=false   # BLOCKED — promote is approval-gated
    ai_suplex_promote approved=true    # fires 3lm promote --min 70

Everyone is building memory that writes itself. This builds memory that has to earn its place — on a rhythm you control. **The gate is the product.**

## How it works

A dsh plugin is two things:

1. **A Cordis plugin** — `lib/index.js` exports `apply(ctx)` and registers its tools on `ctx.tools`.
2. **A bundle patch** — `package.json` declares `dsh.bundle.patch → cordis.patch.yml`, which inserts the plugin row into the profile's composed tree.

A package **without** `dsh.bundle` installs but activates no layer. Verify, never assume:

    dsh --profile web --dump-config | grep ai-suplex

Local-only by design: no network calls, no database, no ORM, no daemon.

## What it is NOT

- Not a memory layer — the vault is the memory; this is the loop around it.
- Not memory that writes itself — every promotion needs an explicit human gate.
- Not the full framework — Ultra Edition is the paid cockpit; this is the open loop.

## Demo

> GIF coming soon — a terminal capture of the loop (`init` → `context` → `tasklist` → `capture` → `session_end`), finishing on the promote gate refusing to fire.

## Development

    node test/smoke.mjs   # the full smoke suite: the real vault, a stub vault, and a clean-room init

## Design rule

The plugin is a **port, not the product**. The vault stays the system of record and stays harness-agnostic; dsh is a surface.

## Licence

MIT — see [LICENSE](./LICENSE).

## Built by

**Kudakwashe Magwenzi** — AI agent developer in Harare.
- GitHub: [github.com/kmagwenzi](https://github.com/kmagwenzi)
- LinkedIn: [linkedin.com/in/kudakwashe-magwenzi](https://linkedin.com/in/kudakwashe-magwenzi)
- [wqr.co.zw](https://wqr.co.zw)
