export function logDebug(...args: unknown[]) {
  if (Deno.args[0] !== 'production') {
    console.debug('%cDEBUG', 'color: magenta', ...args)
  }
}

export function logFatal(error: Error) {
  console.error(`%cFatal ${error.stack}`, 'color: red')
  Deno.exit(1)
}
