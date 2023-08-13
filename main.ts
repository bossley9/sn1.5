import { Open } from "./src/actions/open.ts";
import { Clear } from "./src/actions/clear.ts";
import { Download } from "./src/actions/download.ts";
import { Reset } from "./src/actions/reset.ts";
import { Upload } from "./src/actions/upload.ts";
import { PrintUsage } from "./src/actions/usage.ts";
import { logDebug, logFatal } from "./src/logger.ts";

function main(args: string[]) {
  if (args.length < 1) {
    logFatal(new Error("undefined environment in arglist"));
  }
  const arg = args[1] ?? "";
  logDebug({ arg });
  switch (arg) {
    case "": {
      Open();
      break;
    }
    case "c": {
      Clear();
      break;
    }
    case "d": {
      Download();
      break;
    }
    case "r": {
      Reset();
      break;
    }
    case "u": {
      Upload();
      break;
    }
    case "h":
    default: {
      PrintUsage();
    }
  }
}

if (import.meta.main) {
  main(Deno.args);
}
