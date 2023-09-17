import { logFatal, logInfo } from "../logger.ts";
import { Client } from "./types.ts";

export async function sync(client: Client) {
  logInfo("Syncing client...");
  const changeVersion = client.storage.get<string>("cv") || "";
  if (changeVersion.length === 0) {
    logInfo("Change version not found. Making fresh sync...");
    await initialSync(client);
  } else {
    await updateSync(client);
  }
  logInfo("Done.");
}

export async function initialSync(client: Client) {
  const at = client.storage.get<string>("at");
  if (!at) {
    logFatal(new Error("Unable to find authentication token."));
    return;
  }
  try {
    await client.simp.ensureConnection(at);
  } catch (e) {
    logFatal(e);
  }

  client.simp.sendIndexMessage({
    limit: 30,
    shouldReturnData: true,
  });

  await client.simp.settleAllMessages();
}

async function updateSync(client: Client) {
  const at = client.storage.get<string>("at");
  if (!at) {
    logFatal(new Error("Unable to find authentication token."));
    return;
  }
  try {
    await client.simp.ensureConnection(at);
  } catch (e) {
    logFatal(e);
  }
  const changeVersion = client.storage.get<string>("cv") || "";

  logInfo(`Syncing from version ${changeVersion}...`);

  // TODO check for local diffs first
  client.simp.sendChangeVersionMessage(changeVersion);

  await client.simp.settleAllMessages();
}
