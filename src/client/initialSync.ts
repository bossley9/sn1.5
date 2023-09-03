import { logFatal } from "../logger.ts";
import { Client } from "./types.ts";

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

  setTimeout(() => {
    client.simp.disconnect();
  }, 3000);
}
