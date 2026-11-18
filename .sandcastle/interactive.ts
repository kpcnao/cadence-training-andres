import { interactive } from "@ai-hero/sandcastle";
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox";
import { claudeAgent } from "./agent-workflows/shared/common.js";

const agent = claudeAgent();

await interactive({
  agent,
  // Sandcastle's interactive API does not forward agent.env itself.
  env: agent.env,
  sandbox: noSandbox(),
  promptFile: "./.sandcastle/prompt.md",
});
