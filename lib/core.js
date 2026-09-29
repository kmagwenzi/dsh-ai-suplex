// dsh-ai-suplex — zero-dependency core (vault bridge + formatting).
// No dsh imports: testable standalone. lib/index.js wraps these in tools.
import { execFile } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { promisify } from "node:util"

const execFileP = promisify(execFile)

const INLINE = "`"
const FENCE = "```"
const NL = String.fromCharCode(10)

export function isVault(dir) {
  if (!dir) return false
  return existsSync(path.join(dir, "period.md")) && existsSync(path.join(dir, "Tools", "3lm.js"))
}

export function findVault(start) {
  let dir = path.resolve(start || process.cwd())
  for (;;) {
    if (isVault(dir)) return dir
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

export function resolveVaultPath(config) {
  const cfg = config || {}
  const explicit = cfg.vaultPath || process.env.AI_SUPLEX_VAULT
  if (explicit) {
    const found = findVault(explicit)
    if (found) return found
    if (existsSync(explicit)) return path.resolve(explicit)
  }
  return findVault(process.cwd()) || path.resolve(process.cwd())
}

export async function runCommand(cmd, args, opts) {
  const o = opts || {}
  try {
    const res = await execFileP(cmd, args, {
      cwd: o.cwd,
      timeout: o.timeoutMs || 120000,
      signal: o.signal,
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, ...(o.env || {}) },
    })
    return { stdout: res.stdout || "", stderr: res.stderr || "", exitCode: 0 }
  } catch (err) {
    const e = err || {}
    return {
      stdout: e.stdout || "",
      stderr: e.stderr || String(e.message || e),
      exitCode: typeof e.code === "number" ? e.code : (e.signal ? null : 1),
    }
  }
}

export function run3lm(vault, args, opts) {
  return runCommand("node", [path.join("Tools", "3lm.js"), ...args], { ...(opts || {}), cwd: vault })
}

export function loadVaultPaths(vault) {
  const require = createRequire(import.meta.url)
  return require(path.join(vault, "Tools", "paths.js"))
}

export function resolveArtifactDir(vault, cycle, week) {
  return path.join(vault, loadVaultPaths(vault).artifactDir(cycle, week))
}

export function periodLabel(vault) {
  const p = loadVaultPaths(vault)
  return typeof p.periodLabel === "function" ? p.periodLabel() : ""
}

export function slugify(s) {
  return String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "untitled"
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function nowStamp() {
  const iso = new Date().toISOString()
  return iso.slice(0, 10) + "-" + iso.slice(11, 13) + iso.slice(14, 16)
}

function clean(s) {
  return String(s || "").split(NL).join(" ").split('"').join("'")
}

export function buildTasklist(opts) {
  const o = opts || {}
  const title = o.title || "Tasklist"
  const date = o.date || today()
  const type = o.type || "daily"
  const cycle = o.cycle != null ? o.cycle : 2
  const week = o.week != null ? o.week : 5
  const focus = o.focus || "ai-engineering"
  const focuses = Array.isArray(o.focuses) && o.focuses.length ? o.focuses : [focus]
  const thread = type === "long-running" ? "long-running-tasks" : "daily-tasks"
  const mission = o.mission || ""
  const tags = Array.isArray(o.tags) ? o.tags : []

  const todos = Array.isArray(o.todos) ? o.todos : []
  const phases = new Map()
  const order = []
  for (const t of todos) {
    const phase = (t && t.phase) || "🚀 Phase 1 — Execute"
    if (!phases.has(phase)) { phases.set(phase, []); order.push(phase) }
    phases.get(phase).push(t)
  }

  const L = []
  L.push("---")
  L.push('title: "' + date + " — " + clean(title) + '"')
  L.push("date: " + date)
  L.push("status: active")
  L.push("type: " + type)
  L.push("cycle: " + cycle)
  L.push("week: " + week)
  L.push("thread: " + thread)
  L.push("focus: " + focus)
  L.push("focuses: [" + focuses.join(", ") + "]")
  if (mission) L.push('mission: "' + clean(mission) + '"')
  L.push("tags: [tasklist" + (tags.length ? ", " + tags.join(", ") : "") + "]")
  L.push("---")
  L.push("")
  L.push("# ⚔️ TWABAM ⚡! " + title)
  L.push("")
  if (mission) { L.push("> " + mission); L.push("") }

  L.push("## ⚡ Phase 0 — Context Core")
  L.push("")
  L.push("| ID | Role | Duration | Task | Nature |")
  L.push("|----|------|----------|------|--------|")
  L.push("| T000 | Hustler | 5 min | " + INLINE + "node Tools/3lm.js start --context" + INLINE + " — staleness guard + session context | Execution |")
  L.push("")
  L.push("**Success Check:**")
  L.push("- [ ] " + INLINE + "✅ Context fresh." + INLINE + " (staleness guard green)")
  L.push("")

  let id = 1
  for (const phase of order) {
    L.push("## " + phase)
    L.push("")
    L.push("| ID | Role | Duration | Task | Nature |")
    L.push("|----|------|----------|------|--------|")
    for (const t of phases.get(phase)) {
      const role = (t && t.role) || "Hustler"
      const dur = (t && t.duration) || "30 min"
      const nature = (t && t.nature) || "Execution"
      const content = clean(String((t && t.content) || ""))
      L.push("| T" + String(id).padStart(3, "0") + " | " + role + " | " + dur + " | " + content + " | " + nature + " |")
      id += 1
    }
    L.push("")
  }

  L.push("## ✅ Completion Command")
  L.push("")
  L.push(FENCE + "bash")
  L.push("node Tools/3lm.js end && node Tools/3lm.js learn && node Tools/3lm.js index")
  L.push('node Tools/3lm.js sync "' + date + " — " + title + '"')
  L.push(FENCE)
  L.push("")
  L.push("*Generated via AI-Suplex dsh-ai-suplex — " + date + ". TWABAM ⚡*")
  return L.join(NL)
}

export async function writeTasklist(vault, opts) {
  const o = opts || {}
  const dir = path.join(vault, "Tasklists", "Active")
  await mkdir(dir, { recursive: true })
  const file = (o.date || today()) + "-" + slugify(o.title || "tasklist") + "-tasklist.md"
  const p = path.join(dir, file)
  const md = buildTasklist(o)
  await writeFile(p, md, "utf8")
  return { path: p, tasklist: md }
}

export async function writeArtifact(vault, opts) {
  const o = opts || {}
  const title = o.title || "Artifact"
  const content = o.content || ""
  const focus = o.focus || "ai-engineering"
  const cycle = o.cycle != null ? o.cycle : 2
  const week = o.week != null ? o.week : 5
  const dir = resolveArtifactDir(vault, cycle, week)
  await mkdir(dir, { recursive: true })
  const p = path.join(dir, nowStamp() + "-" + slugify(title) + "-" + focus + ".md")
  const label = periodLabel(vault)
  const md = [
    "---",
    "type: artifact",
    'title: "' + clean(title) + '"',
    "date: " + today(),
    "cycle: " + cycle,
    "week: " + week,
    "focus: " + focus,
    "period: " + label,
    "status: captured",
    "---",
    "",
    "# " + title,
    "",
    content,
    "",
  ].join(NL)
  await writeFile(p, md, "utf8")
  return { path: p, dir: dir, period: label }
}

export function buildSessionEndReport(opts) {
  const o = opts || {}
  const title = o.title || "Session End Report"
  const stamp = nowStamp()
  const L = []
  L.push("---")
  L.push("type: session-end")
  L.push('title: "' + clean(title) + '"')
  L.push("session_id: session-" + stamp)
  L.push("tasklist_id: " + (o.tasklist_id || "unknown"))
  L.push("cycle: " + (o.cycle != null ? o.cycle : 2))
  L.push("week: " + (o.week != null ? o.week : 5))
  L.push("focus: " + (o.focus || "ai-engineering"))
  L.push("session_rating: " + (o.rating != null ? o.rating : 5))
  L.push("artifacts_produced: " + (o.artifacts_produced != null ? o.artifacts_produced : 0))
  L.push("completion_status: " + (o.completion_status || "completed"))
  L.push('key_insights: "' + clean(o.key_insights || "") + '"')
  L.push('next_actions: "' + clean(o.next_actions || "") + '"')
  L.push('session_narrative: "' + clean(o.narrative || "") + '"')
  L.push('objective: "' + clean(o.objective || "") + '"')
  L.push("---")
  L.push("")
  L.push("# " + title)
  L.push("")
  L.push(o.narrative || "(no narrative provided)")
  L.push("")
  return L.join(NL)
}

export async function writeSessionEndReport(vault, opts) {
  const o = opts || {}
  const dir = path.join(vault, "Sessions", "Active", "End")
  await mkdir(dir, { recursive: true })
  const p = path.join(dir, nowStamp() + "-" + slugify(o.title || "session-end") + ".md")
  const md = buildSessionEndReport(o)
  await writeFile(p, md, "utf8")
  return { path: p, report: md }
}
