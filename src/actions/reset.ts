import { logInfo } from "../logger.ts";
import { newClient } from "../client/newClient.ts";
import { authenticate } from "../client/auth.ts";
import { initialSync } from "../client/initialSync.ts";

export async function Reset() {
  const client = await newClient();
  await authenticate(client);
  logInfo("Resetting...");
  await initialSync(client);
  client.simp.disconnect();
  logInfo("Done.");
}
