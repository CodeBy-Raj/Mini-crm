import { SeedService } from "../services/seed.service";

async function main() {
  console.log("[CLI Seed] Initializing data generator...");
  const result = await SeedService.seedDatabase();
  console.log(`[CLI Seed] Completed. Result: ${JSON.stringify(result, null, 2)}`);
}

main()
  .catch((e) => {
    console.error("[CLI Seed] Error occurred during generation:", e);
    process.exit(1);
  });
