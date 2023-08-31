import { newClient } from "../client/newClient.ts";
import { logInfo } from "../logger.ts";

export async function Clear() {
  logInfo("Clearing local data...");
  const client = await newClient();

  logInfo("Deleting local versions of notes...");
  await Deno.remove(client.projectDir, { recursive: true });

  logInfo("Deleting cached data...");
  await client.storage.reset();

  logInfo("Cleared.");
}
