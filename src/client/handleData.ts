import { initialSync } from "./sync.ts";
import { applyChange } from "./applyChange.ts";
import { writeNote } from "./note.ts";
import { logInfo } from "../logger.ts";
import type { Client } from "./types.ts";
import type { HandledData } from "../simperium/types.ts";
import { STORED_KEYS } from "./constants.ts";

type HandleDataProps = {
  data: HandledData;
  client: Client;
};

export const handleData = async ({ data, client }: HandleDataProps) => {
  switch (data.type) {
    case "index": {
      for (const indexItem of data.index) {
        const { id, v: version, d: note } = indexItem;
        if (note?.content) {
          await writeNote({ client, content: note.content, id, version });
        }
      }
      await client.storage.set(STORED_KEYS.changeVersion, data.current);
      break;
    }
    case "cv": {
      if (data.message === "?") {
        logInfo("Change version not found on server. Making fresh sync...");
        await initialSync(client);
      }
      break;
    }
    case "c": {
      if (data.changes.length === 0) {
        logInfo("Already up to date.");
      }
      const updates = data.changes.map((change) => applyChange(client, change));
      await Promise.all(updates);
      break;
    }
  }
};
