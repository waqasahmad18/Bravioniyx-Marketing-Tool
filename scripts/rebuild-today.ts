import { rebuildTodayCampaign } from "../src/lib/rebuild";

async function main() {
  const result = await rebuildTodayCampaign();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
