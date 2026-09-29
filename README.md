# dsh-ai-suplex

**The execution loop your agent is missing.**

A free, open-source DeepSeek Harness (dsh) plugin that makes the AI-Suplex 7-7-7 workflow pipeline a first-class citizen inside the harness — plan, run, capture, close, compound — over a local markdown vault.

> Everyone is building memory that writes itself. This builds memory that has to **earn its place** — on a rhythm you control.

Live proof: https://wqr.co.zw

## Status

Phase 2 — the loop tools ship. The bundle installs, the layer activates, and these four tools run against your vault:

| Pipeline stage | Tool | State |
|---|---|---|
| Context Core | ai_suplex_context | shipped |
| Plan | ai_suplex_tasklist | shipped |
| Capture | ai_suplex_capture | shipped |
| Session End | ai_suplex_session_end | shipped |
| Learn | ai_suplex_learn | next |
| Promote (gated) | ai_suplex_promote | next |
| Approvals | ai_suplex_approvals | next |
| Status | ai_suplex_status | next |

## Install

    dsh plugin --profile web add dsh-ai-suplex
    dsh --profile web --dump-config

Confirm the ai-suplex row appears.

## The loop

    ai_suplex_context     # staleness guard + mission brief
    ai_suplex_tasklist    # to-dos -> a tasklist that opens with Phase 0
    ai_suplex_capture     # write an artifact to the period-correct path
    ai_suplex_session_end # report + 3lm end

## Design rule

The plugin is a port, not the product. The vault stays the system of record and stays harness-agnostic; dsh is a surface.

## Licence

MIT

## Built by

Kudakwashe Magwenzi — AI agent developer in Harare.
- github.com/kmagwenzi
- linkedin.com/in/kudakwashe-magwenzi
- wqr.co.zw
