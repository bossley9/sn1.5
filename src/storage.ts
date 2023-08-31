import { path } from "../deps.ts";
import { logDebug } from "./logger.ts";

export class Storage {
  private filename: string;
  private data: Record<string, unknown>;

  constructor(storageName: string) {
    const rootDir = getDataDirectory();
    this.filename = `${rootDir}/${storageName}/${storageName}.json`;

    Deno.mkdirSync(path.dirname(this.filename), { recursive: true });
    logDebug(`Reading data stored in ${this.filename}...`);
    if (isFileReadable(this.filename)) {
      const raw = Deno.readFileSync(this.filename);
      this.data = JSON.parse(new TextDecoder().decode(raw));
    } else {
      this.data = {};
    }
  }

  get<T = unknown>(key: string): T | null {
    if (key in this.data) {
      return this.data[key] as T;
    }
    return null;
  }

  async set(key: string, value: unknown) {
    this.data[key] = value;
    await Deno.writeTextFile(this.filename, JSON.stringify(this.data));
  }

  async reset() {
    if (isFileReadable(this.filename)) {
      await Deno.remove(this.filename);
    }
  }
}

function isFileReadable(filename: string) {
  try {
    const finfo = Deno.statSync(filename);
    return finfo.isFile || finfo.isSymlink;
  } catch {
    return false;
  }
}

function getDataDirectory() {
  let storageDir = Deno.env.get("XDG_DATA_HOME");
  if (!storageDir) {
    const homeDir = Deno.env.get("HOME");
    if (homeDir) {
      storageDir = homeDir + "/.local/share";
    } else {
      storageDir = "~/.local/share";
    }
  }
  return storageDir;
}
