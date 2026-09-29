# dsh-ai-suplex

**The execution loop your agent is missing.**

A free, open-source DeepSeek Harness (dsh) plugin that makes the AI-Suplex 7-7-7 workflow pipeline a first-class citizen inside the harness — plan, run, capture, close, compound — over a local markdown vault.

> Everyone is building memory that writes itself. This builds memory that has to **earn its place** — on a rhythm you control.

Live proof: https://wqr.co.zw

## Status

Phase 4 — bootstrap ships. The bundle installs, the layer activates, nine tools run against your vault, and init scaffolds a fresh one cold:

| Pipeline stage | Tool | State |
|---|---|---|
| Bootstrap | ai_suplex_init | shipped |
| Context Core | ai_suplex_context | shipped |
| Plan | ai_suplex_tasklist | shipped |
| Capture | ai_suplex_capture | shipped |
| Session End | ai_suplex_session_end | shipped |
| Learn | ai_suplex_learn | shipped |
| Promote (gated) | ai_suplex_promote | shipped — approval-gated |
| Approvals | ai_suplex_approvals | shipped |
| Status | ai_suplex_status | shipped |

## Install

    dsh plugin --profile web add dsh-ai-suplex
    dsh --profile web --dump-config

Confirm the ai-suplex row appears.

## Start fresh (no vault yet)

    ai_suplex_init path=/where/you/want/the/vault

This scaffolds period.md, a seed Tools/3lm.js, Tasklists/, Memory/, and Sessions/ — then the same tools operate it.

## The loop

    ai_suplex_context      # staleness guard + mission brief
    ai_suplex_tasklist     # to-dos -> a tasklist that opens with Phase 0
    ai_suplex_capture      # artifact to the period-correct path
    ai_suplex_session_end  # report + 3lm end
    ai_suplex_learn        # extract lessons
    ai_suplex_promote      # scored promotion — needs approved: true
    ai_suplex_approvals    # the Hustler-decides inbox
    ai_suplex_status       # memory stats + boss HP

## The gate

ai_suplex_promote refuses to fire without an explicit approved: true. Everyone is building memory that writes itself; this builds memory that has to earn its place — on a rhythm you control.

## What it is NOT

- Not a memory layer — the vault is the memory; this is the loop around it.
- Not memory that writes itself — every promotion needs an explicit human gate.
- Not the full framework — Ultra Edition is the paid cockpit; this is the open loop.

## Demo

> GIF coming soon — a terminal capture of the loop (init → context → tasklist → capture → session_end).

## Design rule

The plugin is a port, not the product. The vault stays the system of record and stays harness-agnostic; dsh is a surface.

## Licence

MIT

## Built by

Kudakwashe Magwenzi — AI agent developer in Harare.
- github.com/kmagwenzi
- linkedin.com/in/kudakwashe-magwenzi
- wqr.co.zw
