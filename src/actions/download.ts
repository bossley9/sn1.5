import { logInfo } from "../logger.ts";
import { newClient } from "../client/newClient.ts";
import { authenticate } from "../client/auth.ts";
import { initialSync } from "../client/initialSync.ts";

export async function Download() {
  const client = await newClient();
  await authenticate(client);

  logInfo("Downloading...");
  const changeVersion = client.storage.get<string>("cv") || "";
  if (changeVersion.length === 0) {
    logInfo("Change version not found. Making fresh sync...");
    await initialSync(client);
  }
  // TODO update when change version exists

  client.simp.disconnect();
  logInfo("Done.");
}
