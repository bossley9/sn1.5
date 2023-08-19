import { path } from "../deps.ts";
import { logDebug } from "./logger.ts";

export type LocalStorage = {
  fn: string;
  // change version
  cv?: string;
  // auth token
  at?: string;
  // notes
  ns?: Record<string, string>;
};

export async function getLocalStorage(): Promise<LocalStorage> {
  let storageDir = Deno.env.get("XDG_DATA_HOME");
  if (!storageDir) {
    const homeDir = Deno.env.get("HOME");
    if (homeDir) {
      storageDir = homeDir + "/.local/share";
    } else {
      storageDir = "~/.local/share";
    }
  }

  const filename = storageDir + "/sn/sn.json";

  await Deno.mkdir(path.dirname(filename), { recursive: true });

  let data = "{}";
  try {
    const raw = await Deno.readFile(filename);
    data = new TextDecoder().decode(raw);
  } catch {
    logDebug(`No local storage data found in ${filename}.`);
  }

  const storage: LocalStorage = JSON.parse(data);
  storage.fn = filename;

  return storage;
}

export async function writeLocalStorage(storage: LocalStorage) {
  const filename = storage.fn;
  const data = JSON.stringify(storage);
  await Deno.mkdir(path.dirname(filename), { recursive: true });
  await Deno.writeTextFile(filename, data, { create: true });
}
