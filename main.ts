import { PrintUsage } from './src/usage.ts'

function main(args: string[]) {
  const arg = args[0] ?? ''
  switch (arg) {
    case 'h':
    default: {
      PrintUsage()
    }
  }
}

if (import.meta.main) {
  main(Deno.args)
}
