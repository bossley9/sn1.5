import { apiFetch } from "../apifetch.ts";
import { logDebug } from "../logger.ts";
import type { AuthorizeResponse, IndexResponse, NoteData } from "./types.ts";

// See https://simperium.com/docs/websocket/ for more information.
export class Simperium {
  // from the official Simplenote web application
  private API_KEY = "26864ab5d6fd4a37b80343439f107350";
  private APP_ID = "chalk-bump-f49";
  private connection: WebSocket | null;

  constructor() {
    this.connection = null;
  }

  async authorize(
    username: string,
    password: string,
  ): Promise<string> {
    // API trailing slash required
    const url = "https://auth.simperium.com/1/" + this.APP_ID + "/authorize/";

    const data = await apiFetch<AuthorizeResponse>({
      url,
      method: "POST",
      headers: {
        "X-Simperium-API-Key": this.API_KEY,
      },
      params: {
        username,
        password,
      },
    });
    return data.access_token;
  }

  /**
   * Ensure a connection with Simperium is established. If a connection already
   * exists, do nothing.
   */
  public async ensureConnection(authToken: string) {
    if (this.connection) {
      return;
    }

    this.connection = new WebSocket(
      `wss://api.simperium.com/sock/1/${this.APP_ID}/websocket`,
    );
    this.connection.addEventListener("message", this.handleMessage);

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Connection timed out."));
      }, 5000);

      this.connection?.addEventListener("open", () => {
        this.sendInitMessage(authToken);
      });
      this.connection?.addEventListener("message", (e: MessageEvent) => {
        const message = String(e.data);
        if (message.startsWith("0:auth:")) {
          const response = message.substring(7);
          if (!response.startsWith("{")) {
            clearTimeout(timer);
            resolve();
          } else {
            const data = JSON.parse(response);
            reject(new Error(data.msg));
          }
        }
      });
    });
  }

  /**
   * Closes the Simperium connection.
   */
  public disconnect() {
    this.connection?.close();
    this.connection = null;
  }

  /**
   * https://simperium.com/docs/websocket/#authorizing-init
   */
  private sendInitMessage(authToken: string) {
    this.sendMessage(
      "0:init:" + JSON.stringify({
        clientid: "node",
        api: 1.1,
        token: authToken,
        app_id: this.APP_ID,
        name: "note",
        library: "node-simperium",
        version: "0.0.1",
      }),
    );
  }

  /**
   * https://simperium.com/docs/websocket/#index-i
   */
  public sendIndexMessage(
    limit: number,
    shouldReturnData = false,
    offset = "",
    mark = "",
  ) {
    const data = shouldReturnData ? "1" : "";
    const rLimit = limit - 1; // limit is 0-indexed
    this.sendMessage(`0:i:${data}:${offset}:${mark}:${rLimit}`);
  }

  /**
   * https://simperium.com/docs/websocket/#heartbeat-h
   */
  public sendHeartbeatMessage(index: number) {
    this.sendMessage(`h:${index}`);
  }

  private sendMessage(message: string) {
    logDebug(`W ${message}`);
    this.connection?.send(message);
  }

  private handleMessage = (e: MessageEvent) => {
    const raw = String(e.data);
    logDebug(`R ${raw}`);

    if (raw.startsWith("0:")) {
      const dataNoChannel = raw.substring("0:".length);
      const messageType = dataNoChannel.substring(
        0,
        dataNoChannel.indexOf(":"),
      );

      switch (messageType) {
        case "auth":
        case "o": {
          // silently ignore informational messages
          break;
        }
        case "i": {
          const data: IndexResponse<NoteData> = JSON.parse(
            dataNoChannel.substring("i:".length),
          );
          const shouldReturnData = Boolean(
            data.index.length && data.index[0].d,
          );
          if (data.mark) {
            this.sendIndexMessage(
              data.index.length,
              shouldReturnData,
              data.mark,
              "",
            );
          }
          break;
        }
        default: {
          logDebug(`Unhandled message type ${messageType}`);
        }
      }
    } else {
      switch (raw[0]) {
        case "h": {
          const index = Number(raw.substring("h:".length));
          setTimeout(() => {
            this.sendHeartbeatMessage(index + 1);
          }, 10000);
          break;
        }
        default: {
          logDebug(`Unhandled message ${raw}`);
        }
      }
    }
  };
}
