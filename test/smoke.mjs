// dsh-ai-suplex — Phase 2 smoke test (T009). Runs against the REAL vault.
import assert from "node:assert"
import path from "node:path"
import { mkdirSync, writeFileSync, rmSync } from "node:fs"
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
  assert.ok(vault && vault.endsWith("AI-Suplex-777"), "expected vault root, got: " + vault)
})

await check("resolveArtifactDir is period-correct", () => {
  const dir = resolveArtifactDir(vault, 2, 5)
  assert.ok(dir.endsWith(path.join("Artifacts", "2026-2027", "Cycle 2", "Week 5")), "got: " + dir)
})

const md = buildTasklist({
  title: "Smoke Test Tasklist",
  mission: "Prove the loop tools.",
  date: "2026-09-29",
  cycle: 2,
  week: 5,
  focus: "ai-engineering",
  todos: [
    { content: "Send five applications", role: "Hustler", duration: "60 min", phase: "📤 Phase 1 — Outreach", nature: "Execution" },
    { content: "Draft the next post", role: "Builder", duration: "30 min", phase: "📤 Phase 1 — Outreach", nature: "Creative" },
  ],
})

await check("tasklist opens with frontmatter + Phase 0 Context Core", () => {
  assert.ok(md.startsWith("---"), "should start with frontmatter")
  assert.ok(md.includes("## ⚡ Phase 0 — Context Core"), "missing Phase 0")
  assert.ok(md.includes("| T000 | Hustler | 5 min |"), "missing T000")
})

await check("tasklist assigns sequential IDs + phases", () => {
  assert.ok(md.includes("| T001 | Hustler | 60 min |"), "missing T001")
  assert.ok(md.includes("| T002 | Builder | 30 min |"), "missing T002")
  assert.ok(md.includes("## 📤 Phase 1 — Outreach"), "missing phase header")
})

const report = buildSessionEndReport({
  title: "Smoke Test Session End",
  narrative: "The tools worked.",
  rating: 5,
  cycle: 2,
  week: 5,
  focus: "ai-engineering",
  key_insights: "Context returns the real brief.",
  next_actions: "Run the memory loop.",
})

await check("session end report carries 3lm frontmatter", () => {
  assert.ok(report.includes("session_rating: 5"), "missing rating")
  assert.ok(report.includes("cycle: 2"), "missing cycle")
  assert.ok(report.includes("key_insights:"), "missing key_insights")
})

// Registration: stub defineTool, import the real index.js, call apply.
const shimDir = path.join(repo, "node_modules", "@deepseek-ai", "dsh-tools")
mkdirSync(shimDir, { recursive: true })
writeFileSync(path.join(shimDir, "package.json"), JSON.stringify({ name: "@deepseek-ai/dsh-tools", version: "0.0.0-shim", type: "module" }))
writeFileSync(path.join(shimDir, "index.js"), "export const defineTool = (d) => d")

const { apply } = await import(new URL("../lib/index.js", import.meta.url).href)
const registered = []
apply({ tools: { register(def) { registered.push(def) } } }, { vaultPath: vault })

await check("apply registers the 4 loop tools", () => {
  const names = registered.map((d) => d.name).sort()
  assert.deepStrictEqual(names, ["ai_suplex_capture", "ai_suplex_context", "ai_suplex_session_end", "ai_suplex_tasklist"])
})

await check("each tool has execute + output schema", () => {
  for (const d of registered) {
    assert.equal(typeof d.execute, "function", d.name + " missing execute")
    assert.ok(d.output && d.output.schema, d.name + " missing output schema")
  }
})

const contextTool = registered.find((d) => d.name === "ai_suplex_context")
await check("ai_suplex_context returns the real 3lm brief", async () => {
  const res = await contextTool.execute({}, { signal: undefined })
  assert.equal(typeof res.text, "string", "no text")
  assert.ok(/Context fresh|Vault Context|3 Layer Memory/.test(res.text), "brief markers missing")
})

rmSync(shimDir, { recursive: true, force: true })

console.log(failures === 0 ? "\nSMOKE: PASS (9 checks)" : "\nSMOKE: " + failures + " FAILED")
process.exitCode = failures === 0 ? 0 : 1
