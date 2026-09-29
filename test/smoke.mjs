// dsh-ai-suplex — Phase 4 smoke test (T015). Real vault + stub vault + clean-room init.
import assert from "node:assert"
import os from "node:os"
import path from "node:path"
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import {
  resolveVaultPath,
  resolveArtifactDir,
  buildTasklist,
  buildSessionEndReport,
} from "../lib/core.js"

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, "..")

let failures = 0
async function check(name, fn) {
  try { await fn(); console.log("  ✅ " + name) }
  catch (e) { failures += 1; console.log("  ❌ " + name + " — " + (e && e.message)) }
}

const vault = resolveVaultPath({})
console.log("vault = " + vault)

await check("resolveVaultPath detects the vault", () => {
  assert.ok(vault && vault.endsWith("AI-Suplex-777"), "got: " + vault)
})

await check("resolveArtifactDir is period-correct", () => {
  const dir = resolveArtifactDir(vault, 2, 5)
  assert.ok(dir.endsWith(path.join("Artifacts", "2026-2027", "Cycle 2", "Week 5")), "got: " + dir)
})

const md = buildTasklist({ title: "Smoke Test Tasklist", mission: "Prove the loop tools.", date: "2026-09-29", cycle: 2, week: 5, focus: "ai-engineering", todos: [
  { content: "Send five applications", role: "Hustler", duration: "60 min", phase: "📤 Phase 1 — Outreach", nature: "Execution" },
  { content: "Draft the next post", role: "Builder", duration: "30 min", phase: "📤 Phase 1 — Outreach", nature: "Creative" },
] })

await check("tasklist opens with frontmatter + Phase 0 Context Core", () => {
  assert.ok(md.startsWith("---"), "frontmatter")
  assert.ok(md.includes("## ⚡ Phase 0 — Context Core"), "Phase 0")
  assert.ok(md.includes("| T000 | Hustler | 5 min |"), "T000")
})

await check("tasklist assigns sequential IDs + phases", () => {
  assert.ok(md.includes("| T001 | Hustler | 60 min |"), "T001")
  assert.ok(md.includes("| T002 | Builder | 30 min |"), "T002")
  assert.ok(md.includes("## 📤 Phase 1 — Outreach"), "phase header")
})

const report = buildSessionEndReport({ title: "Smoke Test Session End", narrative: "The tools worked.", rating: 5, cycle: 2, week: 5, focus: "ai-engineering", key_insights: "Context returns the real brief.", next_actions: "Run the memory loop." })
await check("session end report carries 3lm frontmatter", () => {
  assert.ok(report.includes("session_rating: 5"), "rating")
  assert.ok(report.includes("cycle: 2"), "cycle")
  assert.ok(report.includes("key_insights:"), "insights")
})

const shimDir = path.join(repo, "node_modules", "@deepseek-ai", "dsh-tools")
mkdirSync(shimDir, { recursive: true })
writeFileSync(path.join(shimDir, "package.json"), JSON.stringify({ name: "@deepseek-ai/dsh-tools", version: "0.0.0-shim", type: "module" }))
writeFileSync(path.join(shimDir, "index.js"), "export const defineTool = (d) => d")

const { apply } = await import(new URL("../lib/index.js", import.meta.url).href)

const registered = []
apply({ tools: { register(def) { registered.push(def) } } }, { vaultPath: vault })
const byName = (n) => registered.find((d) => d.name === n)

await check("apply registers all 9 tools", () => {
  const names = registered.map((d) => d.name).sort()
  assert.deepStrictEqual(names, ["ai_suplex_approvals", "ai_suplex_capture", "ai_suplex_context", "ai_suplex_init", "ai_suplex_learn", "ai_suplex_promote", "ai_suplex_session_end", "ai_suplex_status", "ai_suplex_tasklist"])
})

await check("every tool has execute + output schema", () => {
  for (const d of registered) {
    assert.equal(typeof d.execute, "function", d.name + " execute")
    assert.ok(d.output && d.output.schema, d.name + " schema")
  }
})

await check("ai_suplex_context returns the real brief", async () => {
  const res = await byName("ai_suplex_context").execute({}, {})
  assert.ok(/Context fresh|Vault Context|3 Layer Memory/.test(res.text), "brief markers")
})

await check("ai_suplex_status reads real tasklists + boss HP", async () => {
  const res = await byName("ai_suplex_status").execute({}, {})
  assert.equal(typeof res.tasks, "number", "tasks")
  assert.ok(res.tasks > 0, "expected tasks > 0, got " + res.tasks)
  assert.equal(typeof res.bossHp, "number", "bossHp")
})

// T015 clean-room: init into an empty dir, then context returns a brief
const fresh = path.join(os.tmpdir(), "dsh-ai-suplex-fresh-" + Date.now())
await check("ai_suplex_init scaffolds a minimal vault", async () => {
  const res = await byName("ai_suplex_init").execute({ path: fresh })
  assert.ok(existsSync(path.join(fresh, "period.md")), "period.md")
  assert.ok(existsSync(path.join(fresh, "Tools", "3lm.js")), "3lm.js")
  assert.ok(existsSync(path.join(fresh, "Memory", "lessons.md")), "lessons.md")
  assert.ok(existsSync(path.join(fresh, "Tasklists", "Active")), "Tasklists/Active")
  assert.ok(res.root === fresh, "root")
})

const reg3 = []
apply({ tools: { register(def) { reg3.push(def) } } }, { vaultPath: fresh })
await check("clean-room: context returns a brief after init", async () => {
  const ctx3 = reg3.find((d) => d.name === "ai_suplex_context")
  const res = await ctx3.execute({}, {})
  assert.ok(res.text.includes("Context fresh"), "seed brief")
  assert.ok(res.text.includes("Vault Context"), "brief header")
})
rmSync(fresh, { recursive: true, force: true })

const stub = path.join(os.tmpdir(), "dsh-ai-suplex-stub-" + Date.now())
mkdirSync(path.join(stub, "Tools"), { recursive: true })
writeFileSync(path.join(stub, "period.md"), "")
const stub3lm = "const cmd = process.argv[2] || '?'" + String.fromCharCode(10) + "console.log('STUB:' + cmd)"
writeFileSync(path.join(stub, "Tools", "3lm.js"), stub3lm)

const reg2 = []
apply({ tools: { register(def) { reg2.push(def) } } }, { vaultPath: stub })
const byName2 = (n) => reg2.find((d) => d.name === n)

await check("ai_suplex_learn invokes 3lm learn", async () => {
  const res = await byName2("ai_suplex_learn").execute({}, {})
  assert.ok(res.output.includes("STUB:learn"), "got: " + res.output)
})

await check("ai_suplex_approvals invokes 3lm approvals --json", async () => {
  const res = await byName2("ai_suplex_approvals").execute({}, {})
  assert.ok(res.text.includes("STUB:approvals"), "got: " + res.text)
})

await check("promote gate BLOCKS without approval", async () => {
  const res = await byName2("ai_suplex_promote").execute({ approved: false }, {})
  assert.equal(res.fired, false, "fired should be false")
  assert.equal(res.output, "", "no output when blocked")
})

await check("promote FIRES with explicit approval", async () => {
  const res = await byName2("ai_suplex_promote").execute({ approved: true, min: 70 }, {})
  assert.equal(res.fired, true, "fired should be true")
  assert.ok(res.output.includes("STUB:promote"), "got: " + res.output)
})

rmSync(shimDir, { recursive: true, force: true })
rmSync(stub, { recursive: true, force: true })

console.log(failures === 0 ? String.fromCharCode(10) + "SMOKE: PASS (15 checks)" : String.fromCharCode(10) + "SMOKE: " + failures + " FAILED")
process.exitCode = failures === 0 ? 0 : 1
