import * as fs from "node:fs";
import * as path from "node:path";
import * as sandcastle from "@ai-hero/sandcastle";

export const outputDir = (): string => process.env.OUTPUT_DIR ?? "/tmp";

export const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
};

export const writeJson = (filename: string, value: unknown): void => {
  fs.mkdirSync(outputDir(), { recursive: true });
  fs.writeFileSync(
    path.join(outputDir(), filename),
    JSON.stringify(value, null, 2)
  );
};

// The one agent every factory workflow runs. It authenticates with a Claude
// subscription. To bill the API instead, pass ANTHROPIC_API_KEY here and in
// the workflow's env in place of ANTHROPIC_API_KEY.
//
// Sandcastle runs every agent with its permission checks skipped, so it can
// use any tool. Claude Code also accepts `permissionMode: "auto"` here for
// AI-mediated approvals instead (Claude only; other agents don't offer it).
export const claudeAgent = () =>
  sandcastle.claudeCode("moonshotai/kimi-k3.1-pro[1m]", {
    env: {
      ANTHROPIC_BASE_URL: "https://openrouter.ai/api",
      ANTHROPIC_AUTH_TOKEN: required("ANTHROPIC_API_KEY"),
      ANTHROPIC_API_KEY: "",
      ANTHROPIC_DEFAULT_OPUS_MODEL: "moonshotai/kimi-k3.1-pro[1m]",
      ANTHROPIC_DEFAULT_SONNET_MODEL: "moonshotai/kimi-k3.1-pro[1m]",
      ANTHROPIC_DEFAULT_HAIKU_MODEL: "moonshotai/kimi-k3.1-pro[1m]",
      CLAUDE_CODE_SUBAGENT_MODEL: "moonshotai/kimi-k3.1-pro[1m]",
    },
  });
