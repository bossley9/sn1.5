import { logInfo } from "../logger.ts";
import { readNote, writeNote } from "./note.ts";
import { ApplyStringDiff } from "../jsondiff/apply.ts";
import { STORED_KEYS } from "./constants.ts";
import type { Client } from "./types.ts";
import type { DChange, Note } from "../simperium/types.ts";

export async function applyChange(
  client: Client,
  change: DChange<Note>,
): Promise<void> {
  console.log({ change });
  if (change.v.creationDate?.o === "+") {
    await applyCreationChange(client, change);
  } else if (change.o === "-") {
    await applyDeletionChange(client, change);
  } else if (change.v.content?.v && change.v.content.v.length > 0) {
    await applyUpdateChange(client, change);
  } else {
    // silently ignore other metadata changes
    // such as pinning or toggling markdown
  }

  logInfo(`Updating change version to ${change.cv}...`);
  // TODO uncomment
  client.storage.set(STORED_KEYS.changeVersion, change.cv);
}

async function applyUpdateChange(client: Client, change: DChange<Note>) {
  if (!change.v.content) return;
  const noteID = change.id;

  logInfo(`Updating note ${noteID}...`);
  const content = await readNote(client, noteID);

  logInfo(`Applying change ${change.cv} to note ${noteID}...`);
  const modifiedContent = ApplyStringDiff(change.v.content, content);
  await writeNote({
    client,
    content: modifiedContent,
    id: noteID,
    version: change.ev,
  });
}

async function applyCreationChange(client: Client, change: DChange<Note>) {
  const noteID = change.id;
  logInfo(`Creating note ${noteID}...`);
}

async function applyDeletionChange(client: Client, change: DChange<Note>) {
  const noteID = change.id;
  logInfo(`Deleting note ${noteID}...`);
}
