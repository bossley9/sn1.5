import { LocalStorage } from "../storage.ts";

export type Client = {
  projectDir: string;
  versionDir: string;
  storage: LocalStorage;
};
