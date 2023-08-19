import { writeLocalStorage } from "../storage.ts";
import { logDebug, logError, logInfo } from "../logger.ts";
import { authorize } from "../simperium/auth.ts";
import { Client } from "./types.ts";

export async function authenticate(client: Client) {
  logInfo("Authenticating...");
  if (client.storage.at) {
    logDebug({ authToken: client.storage.at });
    logInfo("Authentication token found.");
    return;
  }

  const { username, password } = readCredentials();
  let accessToken: string | undefined;

  logInfo("Authorizing...");
  try {
    accessToken = await authorize(username, password);
  } catch (e) {
    logError(e);
    logInfo("Retrying...");
    authenticate(client);
  }

  client.storage.at = accessToken;
  logDebug({ authToken: client.storage.at });
  await writeLocalStorage(client.storage);
}

type Credentials = { username: string; password: string };
function readCredentials(): Credentials {
  const username = prompt("Username:") || "";
  const password = prompt("Password:") || "";
  return {
    username,
    password,
  };
}
