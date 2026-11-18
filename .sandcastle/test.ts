import { run } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";
import { claudeAgent } from "./agent-workflows/shared/common.js";

await run({
  agent: claudeAgent(),
  sandbox: docker(),
  prompt: "Hello, how are you?",
});
