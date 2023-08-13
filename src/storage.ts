import { path } from "../deps.ts";
import { logDebug } from "./logger.ts";

export type LocalStorage = {
  filename: string;
  // change version
  cv?: string;
  // auth token
  at?: string;
  // notes
  ns?: Record<string, string>;
};

export async function newLocalStorage(name: string): Promise<LocalStorage> {
  let storageDir = Deno.env.get("XDG_DATA_HOME");
  if (!storageDir) {
    const homeDir = Deno.env.get("HOME");
    if (homeDir) {
      storageDir = homeDir + "/.local/share";
    } else {
      storageDir = "~/.local/share";
    }
  }

  const filename = storageDir + "/" + name + ".json";

  Deno.mkdir(path.dirname(filename), { recursive: true });

  let data = "{}";
  try {
    const raw = await Deno.readFile(filename);
    data = new TextDecoder().decode(raw);
  } catch {
    logDebug(`No local storage data found in ${filename}.`);
  }

  const storage: LocalStorage = JSON.parse(data);
  storage.filename = filename;
  if (!storage.ns) {
    storage.ns = {};
  }

  return storage;
}
