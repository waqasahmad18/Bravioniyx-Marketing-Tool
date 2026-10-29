import { runAssistantChat } from "../src/lib/assistant/run";

async function main() {
  const result = await runAssistantChat([{ role: "user", content: "Hi Lessa, briefly who are you?" }]);
  console.log(JSON.stringify({ reply: result.reply, actions: result.actions }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
