import { logInfo } from "../logger.ts";
import { newClient } from "../client/newClient.ts";
import { authenticate } from "../client/auth.ts";
import { initialSync } from "../client/initialSync.ts";

export async function Open() {
  const client = await newClient();
  await authenticate(client);

  logInfo("Syncing client...");
  const changeVersion = client.storage.get<string>("cv") || "";
  if (changeVersion.length === 0) {
    logInfo("Change version not found. Making fresh sync...");
    await initialSync(client);
  }
  // TODO update when change version exists

  logInfo("Done.");

  logInfo("Opening editor...");
  const editor = Deno.env.get("EDITOR") || "nvim";
  const cmd = new Deno.Command(editor, { cwd: client.projectDir });
  await cmd.spawn().output();

  logInfo("Done.");
  // TODO upload changes
  client.simp.disconnect();
}
