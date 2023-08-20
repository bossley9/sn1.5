import { Client } from "./types.ts";

export function initialSync(client: Client) {
  client.simp.connect();

  // TODO

  client.simp.disconnect();
}
