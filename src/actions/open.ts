import { logInfo } from "../logger.ts";
import { newClient } from "../client/newClient.ts";
import { authenticate } from "../client/auth.ts";
import { sync } from "../client/sync.ts";

export async function Open() {
  const client = await newClient();
  await authenticate(client);
  await sync(client);

  logInfo("Opening editor...");
  const editor = Deno.env.get("EDITOR") || "nvim";
  const cmd = new Deno.Command(editor, { cwd: client.projectDir });
  await cmd.spawn().output();

  logInfo("Done.");
  // TODO upload changes
  client.simp.disconnect();
}
