import { Simperium } from "../simperium/simperium.ts";
import { Storage } from "../storage.ts";
import { handleData } from "./handleData.ts";
import type { Client } from "./types.ts";

export async function newClient(): Promise<Client> {
  // initializing project directory
  const homeDir = Deno.env.get("HOME") || ".";
  const projectDir = homeDir + "/Documents/sn";
  await Deno.mkdir(projectDir, { recursive: true });

  // initializing version control
  // creating a directory within .git to automatically ignore version
  // metadata in most IDEs
  const versionDir = projectDir + "/.git/version";
  await Deno.mkdir(versionDir, { recursive: true });

  const storage = new Storage("sn");
  const simp = new Simperium();

  const client: Client = {
    projectDir,
    versionDir,
    storage,
    simp,
  };

  simp.setDataHandler(async (data) => await handleData({ data, client }));

  return client;
}
