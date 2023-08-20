import { Storage } from "../storage.ts";

export type Client = {
  projectDir: string;
  versionDir: string;
  storage: Storage;
  connection: WebSocket | null;
};
