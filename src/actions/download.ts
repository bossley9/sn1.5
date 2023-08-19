import { logDebug, logInfo } from "../logger.ts";
import { newClient } from "../client/newClient.ts";
import { authenticate } from "../client/auth.ts";
import { initialSync } from "../client/initialSync.ts";

export async function Download() {
  logInfo("Downloading...");
  const client = await newClient();
  await authenticate(client);

  const changeVersion = client.storage.cv || "";
  if (changeVersion.length === 0) {
    logInfo("Change version not found. Making fresh sync...");
    await initialSync(client);
  }
}
