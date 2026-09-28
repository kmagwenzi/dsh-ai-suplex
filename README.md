# dsh-ai-suplex

**The execution loop your agent is missing.**

A free, open-source [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (dsh) plugin that makes the **AI-Suplex 7-7-7 workflow pipeline** a first-class citizen inside the harness — plan, run, capture, close, compound — over a local markdown vault.

> Everyone is building memory that writes itself. This builds memory that has to **earn its place** — on a rhythm you control.

## Status

**Phase 1 — skeleton.** The bundle installs and the layer activates. The loop tools land next.

## Install (once published)

    dsh plugin --profile web add dsh-ai-suplex
    dsh --profile web --dump-config      # confirm the ai-suplex row

## What it will do

| Pipeline stage | Tool |
|---|---|
| Context Core | **ai_suplex_context** |
| Plan | **ai_suplex_tasklist** |
| Capture | **ai_suplex_capture** |
| Session End | **ai_suplex_session_end** |
| Learn | **ai_suplex_learn** |
| Promote (gated) | **ai_suplex_promote** |
| Approvals | **ai_suplex_approvals** |
| Status | **ai_suplex_status** |

## Design rule

The plugin is a **port**, not the product. The vault stays the system of record and stays harness-agnostic; dsh is a surface.

## Licence

MIT

---

## 👤 Built by

**Kudakwashe Magwenzi** — AI agent developer in Harare. I build production AI systems for African businesses and open-source the chassis.

- More work: [github.com/kmagwenzi](https://github.com/kmagwenzi)
- LinkedIn: [linkedin.com/in/kudakwashe-magwenzi](https://linkedin.com/in/kudakwashe-magwenzi)
- Live product: [wqr.co.zw](https://wqr.co.zw)
