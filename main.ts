import { Open } from './src/actions/open.ts'
import { Clear } from './src/actions/clear.ts'
import { Download } from './src/actions/download.ts'
import { Reset } from './src/actions/reset.ts'
import { Upload } from './src/actions/upload.ts'
import { PrintUsage } from './src/usage.ts'

function main(args: string[]) {
  const arg = args[0] ?? ''
  switch (arg) {
    case '': {
      Open()
      break
    }
    case 'c': {
      Clear()
      break
    }
    case 'd': {
      Download()
      break
    }
    case 'r': {
      Reset()
      break
    }
    case 'u': {
      Upload()
      break
    }
    case 'h':
    default: {
      PrintUsage()
    }
  }
}

if (import.meta.main) {
  main(Deno.args)
}
