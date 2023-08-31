import { apiFetch } from "../apifetch.ts";
import { logDebug } from "../logger.ts";

// https://simperium.com/docs/reference/http/#auth
type AuthorizeResponse = {
  access_token: string;
  userid: string;
  username: string;
};

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

  public connect(authToken: string) {
    this.connection = new WebSocket(
      "wss://api.simperium.com/sock/1/" + this.APP_ID + "/websocket",
    );
    this.connection.addEventListener("message", this.handleMessage);
    this.connection.addEventListener("open", () => {
      const initMessage = this.createInitMessage(authToken);
      this.sendMessage(initMessage);
    });
  }

  public disconnect() {
    this.connection?.close();
  }

  private handleMessage(e: MessageEvent) {
    logDebug(`R ${e.data}`);
  }

  private sendMessage(message: string) {
    logDebug(`W ${message}`);
    this.connection?.send(message);
  }

  private createInitMessage(authToken: string) {
    return "0:init:" + JSON.stringify({
      clientid: "node",
      api: 1.1,
      token: authToken,
      app_id: this.APP_ID,
      name: "note",
      library: "node-simperium",
      version: "0.0.1",
    });
  }
}
