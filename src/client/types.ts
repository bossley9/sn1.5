import { Simperium } from "../simperium/simperium.ts";
import { Storage } from "../storage.ts";

export type Client = {
  projectDir: string;
  versionDir: string;
  storage: Storage;
  simp: Simperium;
};
