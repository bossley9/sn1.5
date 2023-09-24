import { getFileName, getVersionFileName } from "./note.ts";
import { GetStringDiff } from "../jsondiff/diff.ts";
import { GetCurrentDatetimeNumber } from "../utils.ts";
import { logInfo, logWarning } from "../logger.ts";
import { STORED_KEYS } from "./constants.ts";
import type { Client, StoredNote, StoredNotes } from "./types.ts";
import type { Note, UChange } from "../simperium/types.ts";

export async function GetLocalDiffs(client: Client): Promise<UChange<Note>[]> {
  const diffs: UChange<Note>[] = [];
  const notes = client.storage.get<StoredNotes>(STORED_KEYS.notes) || {};
  const filenames: Record<string, string> = {};

  for await (const entry of Deno.readDir(client.projectDir)) {
    if (entry.isDirectory) {
      continue;
    }
    const noteName = entry.name.replace(/\.md$/, "");
    filenames[getFileName(client, noteName)] = noteName;
  }

  for (const [noteID, storedNote] of Object.entries(notes)) {
    const filename = getFileName(client, storedNote.n);
    const versionFilename = getVersionFileName(client, storedNote.n);

    const s1 = await Deno.readTextFile(versionFilename);
    let s2 = "";
    try {
      s2 = await Deno.readTextFile(filename);
    } catch {
      // deleting notes requires two diffs: one for moving the
      // note to trash and a second for deleting the note
      diffs.push({
        id: noteID,
        o: "M",
        v: {
          deleted: {
            o: "r",
            v: true,
          },
          modificationDate: {
            o: "r",
            v: GetCurrentDatetimeNumber(),
          },
        },
      });
      diffs.push({
        id: noteID,
        o: "-",
        // dummy value that will be ignored
        v: {},
      });

      logInfo(`${storedNote.n} was deleted.`);
      continue;
    }

    delete filenames[filename];

    const contentDiff = GetStringDiff(s1, s2);
    if (contentDiff.v.length === 0) {
      continue;
    }

    logInfo(`Local diff found for ${storedNote.n}.`);

    diffs.push({
      id: noteID,
      o: "M",
      v: {
        content: contentDiff,
        modificationDate: {
          o: "r",
          v: GetCurrentDatetimeNumber(),
        },
      },
    });
  }

  for (const [filename, noteName] of Object.entries(filenames)) {
    let fileContent = "";
    try {
      fileContent = await Deno.readTextFile(filename);
    } catch {
      logWarning(`Unable to read file ${filename}. Skipping...`);
    }

    logInfo(`${noteName} was created.`);

    // ensure ID uniqueness
    let noteID = "";
    do {
      noteID = crypto.randomUUID();
    } while (notes[noteID]);

    const newNote: StoredNote = {
      n: noteName,
      v: 0,
    };
    await client.storage.set(STORED_KEYS.notes, {
      ...notes,
      [noteID]: newNote,
    });

    const creationDate = GetCurrentDatetimeNumber();
    diffs.push({
      id: noteID,
      o: "M",
      v: {
        creationDate: {
          o: "+",
          v: creationDate,
        },
        modificationDate: {
          o: "+",
          v: creationDate,
        },
        content: {
          o: "+",
          v: fileContent,
        },
        tags: {
          o: "+",
          v: [],
        },
        systemTags: {
          o: "+",
          v: ["markdown"],
        },
        deleted: {
          o: "+",
          v: false,
        },
        shareURL: {
          o: "+",
          v: "",
        },
        publishURL: {
          o: "+",
          v: "",
        },
      },
    });
  }

  return diffs;
}
