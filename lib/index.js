// dsh-ai-suplex — host half of the 7-7-7 execution loop for DeepSeek Harness.
//
// Phase 1 skeleton. This module exists to prove that the bundle installs and
// the layer ACTIVATES. The loop tools land in Phase 2:
//   ai_suplex_context · ai_suplex_tasklist · ai_suplex_capture ·
//   ai_suplex_session_end · ai_suplex_learn · ai_suplex_promote (gated) ·
//   ai_suplex_approvals · ai_suplex_status
//
// The dsh pilot's standing rule: a package without a dsh.bundle activates NO
// layer. Always confirm with: dsh --profile <name> --dump-config

export const name = 'ai-suplex'

export function apply(ctx, config = {}) {
  const vault = (config && config.vaultPath) || ''
  const log = ctx && ctx.logger && ctx.logger.info
  if (typeof log === 'function') {
    log('[ai-suplex] 7-7-7 loop loaded (skeleton) — vault: ' + (vault || 'auto-detect'))
  }
}
