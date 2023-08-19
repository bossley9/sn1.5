import { Client } from "./types.ts";
import { APP_ID } from "../simperium/constants.ts";

export function initialSync(client: Client) {
  client.connection = new WebSocket(
    "wss://api.simperium.com/sock/1/" + APP_ID + "/websocket",
  );

  // TODO

  client.connection.close();
  client.connection = null;
}
