import { logDebug, logError, logInfo } from "../logger.ts";
import { authorize } from "../simperium/auth.ts";
import { Client } from "./types.ts";

export async function authenticate(client: Client) {
  logInfo("Authenticating...");
  const at = client.storage.get<string>("at");
  if (at) {
    logDebug({ authToken: at });
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

  logDebug({ authToken: accessToken });
  await client.storage.set("at", accessToken);
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
