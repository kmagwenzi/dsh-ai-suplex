// dsh-ai-suplex — the 7-7-7 execution loop for DeepSeek Harness (host half).
import { defineTool } from "@deepseek-ai/dsh-tools"
import {
  resolveVaultPath,
  run3lm,
  buildTasklist,
  writeTasklist,
  writeArtifact,
  writeSessionEndReport,
} from "./core.js"

export const name = "ai-suplex"
export const inject = ["tools"]

const NL = String.fromCharCode(10)
const text = (t) => [{ type: "text", text: t }]

export function apply(ctx, config) {
  const vault = () => resolveVaultPath(config)

  ctx.tools.register(defineTool({
    name: "ai_suplex_context",
    description: "Load the AI-Suplex mission context: run 3lm start --context in the vault and return the staleness guard plus the generated brief.",
    parameters: {
      stale_days: { type: "number", description: "Staleness threshold in days (default 7)." },
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          text: { type: "string", required: true },
          vault: { type: "string" },
          exitCode: { type: "number" },
          stderr: { type: "string" },
        },
      },
      render: (_a, v) => text(v.text),
    },
    async execute(args, exec) {
      const v = vault()
      const argv = ["start", "--context"]
      if (args && args.stale_days != null) argv.push("--stale-days", String(args.stale_days))
      const r = await run3lm(v, argv, { signal: exec && exec.signal })
      return { text: r.stdout, vault: v, exitCode: r.exitCode, stderr: r.stderr }
    },
  }))

  ctx.tools.register(defineTool({
    name: "ai_suplex_tasklist",
    description: "Generate a structured AI-Suplex tasklist from raw to-dos (task IDs, roles, durations, phases) and write it to Tasklists/Active/. Always opens with Phase 0 Context Core.",
    parameters: {
      title: { type: "string", required: true },
      mission: { type: "string" },
      date: { type: "string", description: "YYYY-MM-DD; defaults to today." },
      type: { type: "string", description: "daily or long-running; default daily." },
      focus: { type: "string" },
      focuses: { type: "array", items: { type: "string" } },
      cycle: { type: "number" },
      week: { type: "number" },
      todos: {
        type: "array",
        required: true,
        items: {
          type: "object",
          additionalProperties: true,
          properties: {
            content: { type: "string", required: true },
            role: { type: "string" },
            duration: { type: "string" },
            phase: { type: "string" },
            nature: { type: "string" },
          },
        },
      },
      write: { type: "boolean", description: "Write to Tasklists/Active (default true). Set false to preview." },
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          path: { type: "string" },
          tasklist: { type: "string", required: true },
        },
      },
      render: (_a, v) => text(v.path ? "Wrote " + v.path + NL + NL + v.tasklist : v.tasklist),
    },
    async execute(args) {
      const v = vault()
      if (args && args.write === false) {
        return { tasklist: buildTasklist(args) }
      }
      return await writeTasklist(v, args)
    },
  }))

  ctx.tools.register(defineTool({
    name: "ai_suplex_capture",
    description: "Write an artifact to the period-correct AI-Suplex path (Artifacts/<Period>/Cycle X/Week Y/).",
    parameters: {
      title: { type: "string", required: true },
      content: { type: "string", required: true },
      focus: { type: "string" },
      cycle: { type: "number", required: true },
      week: { type: "number", required: true },
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          path: { type: "string", required: true },
          dir: { type: "string" },
          period: { type: "string" },
        },
      },
      render: (_a, v) => text("Captured artifact at " + v.path),
    },
    async execute(args) {
      return await writeArtifact(vault(), args)
    },
  }))

  ctx.tools.register(defineTool({
    name: "ai_suplex_session_end",
    description: "Assemble an AI-Suplex Session End Report, write it to Sessions/Active/End/, and run 3lm end to write the episode.",
    parameters: {
      title: { type: "string", required: true },
      narrative: { type: "string" },
      objective: { type: "string" },
      completion_status: { type: "string" },
      rating: { type: "number" },
      focus: { type: "string" },
      cycle: { type: "number" },
      week: { type: "number" },
      tasklist_id: { type: "string" },
      artifacts_produced: { type: "number" },
      key_insights: { type: "string" },
      next_actions: { type: "string" },
      run_3lm_end: { type: "boolean", description: "Run 3lm end after writing (default true)." },
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          path: { type: "string", required: true },
          report: { type: "string", required: true },
          endOutput: { type: "string" },
        },
      },
      render: (_a, v) => text("Wrote " + v.path + (v.endOutput ? NL + NL + v.endOutput : "")),
    },
    async execute(args, exec) {
      const v = vault()
      const written = await writeSessionEndReport(v, args)
      let endOutput = ""
      if (!args || args.run_3lm_end !== false) {
        const r = await run3lm(v, ["end"], { signal: exec && exec.signal })
        endOutput = r.stdout + (r.stderr ? NL + r.stderr : "")
      }
      return { path: written.path, report: written.report, endOutput }
    },
  }))
}
