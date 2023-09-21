import { Simperium } from "../simperium/simperium.ts";
import { Storage } from "../storage.ts";

export type Client = {
  projectDir: string;
  versionDir: string;
  storage: Storage;
  simp: Simperium;
};

export type StoredNote = {
  /**
   * Note version.
   */
  v: number;
  /**
   * Note name.
   */
  n: string;
};

export type StoredNotes = Record<string, StoredNote>;
