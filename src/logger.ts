export function logDebug(...args: unknown[]) {
  if (Deno.args[0] !== "production") {
    console.debug("%cDebug", "color: magenta", ...args);
  }
}

export function logInfo(...args: unknown[]) {
  console.log("%cInfo", "color: cyan", ...args);
}

export function logWarning(message: string) {
  console.log(`%cWarning ${message}`, "color: yellow");
}

export function logError(...args: unknown[]) {
  console.log("%cError", "color: red", ...args);
}

export function logFatal(error: Error) {
  console.error(`%cFatal ${error.stack}`, "color: red");
  Deno.exit(1);
}
