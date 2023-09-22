import { apiFetch } from "../apifetch.ts";
import { logDebug, logError } from "../logger.ts";
import type {
  AuthorizeResponse,
  DChange,
  HandledData,
  IndexMessageProps,
  IndexResponse,
  Note,
} from "./types.ts";

// See https://simperium.com/docs/websocket/ for more information.
export class Simperium {
  // from the official Simplenote web application
  private API_KEY = "26864ab5d6fd4a37b80343439f107350";
  private APP_ID = "chalk-bump-f49";
  private connection: WebSocket | null;
  private heartbeatTimer: ReturnType<typeof setTimeout> | null;
  private messageQueue: boolean[];
  private dataHandler?: (data: HandledData) => Promise<void>;

  constructor() {
    this.connection = null;
    this.heartbeatTimer = null;
    this.messageQueue = [];
  }

  /**
   * https://simperium.com/docs/reference/http/#auth
   */
  public async authorize(
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
          const response = message.substring("0:auth:".length);
          if (!response.startsWith("{")) {
            clearTimeout(timer);
            this.sendHeartbeatMessage(0);
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
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
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
  public sendIndexMessage(props: IndexMessageProps) {
    const { limit, shouldReturnData, offset = "" } = props;
    const data = shouldReturnData ? "1" : "";
    const rLimit = limit - 1; // limit is 0-indexed
    this.sendMessage(`0:i:${data}:${offset}::${rLimit}`);
  }

  /**
   * https://simperium.com/docs/websocket/#index-change-version-cv
   */
  public sendChangeVersionMessage(changeVersion: string) {
    this.sendMessage(`0:cv:${changeVersion}`);
  }

  /**
   * https://simperium.com/docs/websocket/#heartbeat-h
   */
  private sendHeartbeatMessage(index: number) {
    this.sendMessage(`h:${index}`);
  }

  private sendMessage(message: string) {
    logDebug(`W ${message}`);
    this.connection?.send(message);
    this.messageQueue.push(true);
  }

  private handleMessage = async (e: MessageEvent) => {
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
        case "cv": {
          const message = dataNoChannel.substring("cv:".length);
          await this.dataHandler?.({ message, type: "cv" });
          break;
        }
        case "c": {
          const changes: DChange<Note>[] = JSON.parse(
            dataNoChannel.substring("c:".length),
          );
          await this.dataHandler?.({ changes, type: "c" });
          break;
        }
        case "i": {
          const data: IndexResponse<Note> = JSON.parse(
            dataNoChannel.substring("i:".length),
          );
          const shouldReturnData = Boolean(
            data.index.length && data.index[0].d,
          );
          if (data.mark) {
            this.sendIndexMessage(
              {
                limit: data.index.length,
                shouldReturnData,
                offset: data.mark,
              },
            );
          }
          await this.dataHandler?.({ ...data, type: "index" });
          break;
        }
        default: {
          logError(`Unhandled message type ${messageType}`);
        }
      }
    } else {
      switch (raw[0]) {
        case "h": {
          const index = Number(raw.substring("h:".length));
          this.heartbeatTimer = setTimeout(() => {
            this.sendHeartbeatMessage(index + 1);
            // Simperium expects heartbeats to be sent after
            // 20 seconds of idle time, but they can just be
            // sent at regular intervals
          }, 20000);
          break;
        }
        default: {
          logError(`Unhandled message ${raw}`);
        }
      }
    }
    this.messageQueue.pop();
  };

  /**
   * Set a custom data handler to receive incoming server data messages.
   */
  public setDataHandler(handler: (data: HandledData) => Promise<void>) {
    this.dataHandler = handler;
  }

  /**
   * Treats the websocket connection like a synchronous queue.
   * This will return when all pending sent messages have
   * received a response.
   */
  public settleAllMessages() {
    return new Promise<void>((resolve) => {
      const settledTimer = setInterval(() => {
        if (this.messageQueue.length === 0) {
          clearInterval(settledTimer);
          resolve();
        }
      }, 800);
    });
  }
}
