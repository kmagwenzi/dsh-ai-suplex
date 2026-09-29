// dsh-ai-suplex — shipped seed templates for a minimal 7-7-7 vault (init).
// The full framework (Tools/3lm.js, paths.js, memory loop) is the author's canonical
// vault; these are deliberately minimal so a stranger can bootstrap cold.

export const PERIOD_MD = `---
type: config
period_index: 1
period_label: "2026-2027"
period_start: 2026-06-19
period_end: 2027-05-28
cycle_1_start: 2026-06-19
generated_by: "dsh-ai-suplex init — seeded vault"
---

# ⏳ Period 1 — 2026-2027

The single source of truth for the vault's Period. Every cycle-scoped path is
resolved from this file at runtime. Do not hand-edit period_label or period_end —
they are derived.
`

export const LESSONS_MD = `# Lessons

## Current Lessons

(no lessons yet — they land here as the loop runs)
`

export const INDEX_MD = `# AI-Suplex Memory Index

A freshly bootstrapped AI-Suplex vault. The memory index grows as the loop runs.
`

export const VAULT_README = `# AI-Suplex vault (seeded)

Scaffolded by dsh-ai-suplex init — a minimal 7-7-7 vault:

- period.md — the Period source of truth
- Tools/3lm.js — a seed loop CLI (replace with the full 3lm when ready)
- Tasklists/Active/ — where daily + long-running tasklists land
- Memory/ — the 3-layer memory stack (semantic · procedural · episodic · lessons)
- Sessions/Active/ — session start + end files

The full 7-7-7 framework: https://github.com/kmagwenzi/ai-suplex
`

export const SEED_3LM = `// AI-Suplex seed 3lm — minimal loop CLI for a freshly bootstrapped vault.
// This is a SEED. Replace with the full 3lm (Tools/3lm.js) for the complete
// memory stack: end · learn · promote · revise · index · sync · survey.
const fs = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "..")

function readPeriod() {
  try {
    const t = fs.readFileSync(path.join(ROOT, "period.md"), "utf8")
    for (const line of t.split(String.fromCharCode(10))) {
      if (line.startsWith("period_label:")) {
        return line.slice(line.indexOf(":") + 1).trim().replace(/"/g, "").replace(/'/g, "")
      }
    }
    return "P1"
  } catch (e) { return "P1" }
}

function activeTasklists() {
  try {
    const d = path.join(ROOT, "Tasklists", "Active")
    return fs.readdirSync(d).filter((f) => f.endsWith(".md"))
  } catch (e) { return [] }
}

function memoryCounts() {
  const out = { semantic: 0, procedural: 0, episodic: 0 }
  for (const key of Object.keys(out)) {
    const d = path.join(ROOT, "Memory", key)
    try {
      const walk = (dir) => {
        let n = 0
        for (const f of fs.readdirSync(dir)) {
          const fp = path.join(dir, f)
          if (fs.statSync(fp).isDirectory()) n += walk(fp)
          else if (f.endsWith(".md")) n += 1
        }
        return n
      }
      out[key] = walk(d)
    } catch (e) {}
  }
  return out
}

const cmd = process.argv[2] || ""
const genContext = process.argv.indexOf("--context") >= 0
const json = process.argv.indexOf("--json") >= 0

if (cmd === "start") {
  console.log("🦸 3lm — 3 Layer Memory (seed)")
  console.log("Context fresh.")
  if (genContext) {
    console.log("── GENERATED SESSION CONTEXT ──")
    console.log("# 🦸 Vault Context")
    console.log("")
    console.log("> Period " + readPeriod() + " · bootstrapped vault")
    const tls = activeTasklists()
    console.log("")
    console.log("## 🎯 Active Mission")
    if (tls.length) {
      for (const t of tls) console.log("- " + t)
    } else {
      console.log("- (no active tasklists yet — run ai_suplex_tasklist to create one)")
    }
    const c = memoryCounts()
    console.log("")
    console.log("## 🧠 Memory")
    console.log("- semantic: " + c.semantic + " · procedural: " + c.procedural + " · episodic: " + c.episodic)
  }
} else if (cmd === "status") {
  const c = memoryCounts()
  console.log("Memory: semantic " + c.semantic + " · procedural " + c.procedural + " · episodic " + c.episodic + " · active tasklists " + activeTasklists().length)
} else if (cmd === "approvals") {
  console.log(json ? "[]" : "Approvals inbox: (empty)")
} else if (cmd === "learn") {
  console.log("No episodes yet — nothing to extract.")
} else if (cmd === "promote") {
  console.log("No lessons to promote — the staged list is empty.")
} else if (cmd === "end") {
  console.log("No Session End report found in Sessions/Active/End/. Write one first.")
} else {
  console.log("AI-Suplex seed 3lm — commands: start, status, approvals, learn, promote, end")
}
`
