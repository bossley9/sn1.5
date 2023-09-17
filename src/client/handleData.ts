import { logError } from "../logger.ts";
import { Storage } from "../storage.ts";
import type { HandledData } from "../simperium/types.ts";

type HandleDataProps = {
  data: HandledData;
  storage: Storage;
};
export const handleData = async ({ data, storage }: HandleDataProps) => {
  switch (data.type) {
    case "index": {
      await storage.set("cv", data.current);
      // TODO write note data to storage
      break;
    }
    default: {
      logError(`Unknown message type "${data.type}" from server. Ignoring.`);
    }
  }
};
