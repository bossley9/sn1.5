import { newClient } from "../client/newClient.ts";
import { authenticate } from "../client/auth.ts";
import { sync } from "../client/sync.ts";

export async function Download() {
  const client = await newClient();
  await authenticate(client);
  await sync(client);
  client.simp.disconnect();
}
