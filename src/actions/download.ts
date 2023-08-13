import { logDebug, logInfo } from '../logger.ts'
import { Authenticate, newClient } from '../client.ts'

export async function Download() {
  logInfo('Downloading...')
  const client = await newClient()
  await Authenticate(client)

  logDebug(`Auth token is ${client.storage.at}.`)
}
