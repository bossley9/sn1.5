import type { Client } from "./types.ts";
import type { DChange, Note } from "../simperium/types.ts";

export async function applyChange(
  client: Client,
  change: DChange<Note>,
): Promise<void> {
  console.log({ change });

  if (change.v.creationDate.o === "+") { // note creation
    console.log("new note was created");
    // TODO handle note creation
  } else if (change.o === "-") { // note deletion
    console.log("note was deleted");
    // TODO handle note deletion
  } else if (change.v.content.v.length > 0) { // note update
    console.log("note was updated");
    // TODO handle note updates
  } else {
    // silently ignore other metadata changes
  }

  // TODO write cv, files, and write to storage
  return;
}
