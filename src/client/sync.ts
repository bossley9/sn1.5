import { logDebug, logFatal, logInfo, logWarning } from "../logger.ts";
import { STORED_KEYS } from "./constants.ts";
import { GetLocalDiffs } from "./localdiffs.ts";
import type { Client } from "./types.ts";

export async function sync(client: Client) {
  logInfo("Syncing client...");
  const changeVersion = client.storage.get<string>(STORED_KEYS.changeVersion) ||
    "";
  if (changeVersion.length === 0) {
    logInfo("Change version not found. Making fresh sync...");
    await initialSync(client);
  } else {
    await updateSync(client);
  }
  logInfo("Done.");
}

export async function initialSync(client: Client) {
  const at = client.storage.get<string>(STORED_KEYS.authToken);
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
  const at = client.storage.get<string>(STORED_KEYS.authToken);
  if (!at) {
    logFatal(new Error("Unable to find authentication token."));
    return;
  }
  try {
    await client.simp.ensureConnection(at);
  } catch (e) {
    logFatal(e);
  }
  const changeVersion = client.storage.get<string>(STORED_KEYS.changeVersion) ||
    "";

  logInfo(`Syncing from version ${changeVersion}...`);

  const diffs = await GetLocalDiffs(client);
  if (diffs) {
    logWarning("Local diffs found. Please upload changes before syncing.");
    logDebug({ diffs });
    // TODO pretty print local diffs
    Deno.exit(0);
  }
  client.simp.sendChangeVersionMessage(changeVersion);

  await client.simp.settleAllMessages();
}
