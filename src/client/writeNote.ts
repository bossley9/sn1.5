import { STORED_KEYS } from "./constants.ts";
import type { Note } from "../simperium/types.ts";
import type { Client, StoredNote, StoredNotes } from "./types.ts";

type Props = {
  client: Client;
  note: Note;
  id: string;
  version: number;
};

export async function writeNote({ client, note, id, version }: Props) {
  const noteName = getNoteName(client, id, note);
  const filename = client.projectDir + "/" + noteName + ".md";
  const versionFilename = client.versionDir + "/" + noteName + ".md";

  await Deno.writeTextFile(filename, note.content);
  await Deno.writeTextFile(versionFilename, note.content);

  const updatedNote: StoredNote = {
    v: version,
    n: noteName,
  };
  const notes = client.storage.get<StoredNotes>(STORED_KEYS.notes) || {};
  await client.storage.set(STORED_KEYS.notes, { ...notes, [id]: updatedNote });
}

function getNoteName(client: Client, id: string, note: Note) {
  const notes = client.storage.get<StoredNotes>(STORED_KEYS.notes) || {};
  if (notes[id]) {
    return notes[id].n;
  }
  return generateID(note.content) + "-" + id;
}

/**
 * Given a string of text, return a url-safe string identifier.
 */
function generateID(text: string): string {
  const maxLen = 32;

  // 1. remove additional text lines
  const firstLine = text.split("\n")[0];
  // 2. remove symbols
  const sanitizedLine = firstLine.replace(/[^\w\s]/gi, "");
  // 3. trim prefix and suffix spaces
  const trimmedLine = sanitizedLine.trim();
  // 4. convert spaces to hyphens
  const dashedLine = trimmedLine.replaceAll(" ", "-");
  // 5. convert to lowercase
  let result = dashedLine.toLocaleLowerCase();

  // 6. trim length and remove suffix hyphen if necessary
  if (result.length > maxLen) {
    result = result.substring(0, maxLen);
  }
  return result.replace(/-$/, "");
}
