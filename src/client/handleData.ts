import { Client } from "./types.ts";
import { initialSync } from "./sync.ts";
import { logInfo } from "../logger.ts";
import type { HandledData } from "../simperium/types.ts";
import { applyChange } from "./applyChange.ts";

type HandleDataProps = {
  data: HandledData;
  client: Client;
};
export const handleData = async ({ data, client }: HandleDataProps) => {
  switch (data.type) {
    case "index": {
      await client.storage.set("cv", data.current);
      // TODO write note data to storage
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
