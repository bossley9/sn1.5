import { logFatal } from "../logger.ts";
import { Client } from "./types.ts";

export function initialSync(client: Client) {
  const at = client.storage.get<string>("at");
  if (!at) {
    logFatal(new Error("Unable to find authentication token."));
    return;
  }
  client.simp.ensureConnection(at);

  setTimeout(() => {
    client.simp.disconnect();
  }, 3000);
}
