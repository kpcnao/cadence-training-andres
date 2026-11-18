import { run } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";
import { claudeAgent } from "./agent-workflows/shared/common.js";

const [prd, plan] = process.argv.slice(2);

if (!prd || !plan) {
  console.error("Usage: main.ts <prd> <plan>");
  process.exit(1);
}

await run({
  agent: claudeAgent(),
  sandbox: docker(),
  promptFile: "./.sandcastle/prompt.md",
  maxIterations: 3,
  completionSignal: "<promise>NO MORE TASKS</promise>",
  promptArgs: {
    PRD_LOCATION: prd,
    PLAN_LOCATION: plan,
  },
});
