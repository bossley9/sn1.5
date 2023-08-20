import { apiFetch } from "../apifetch.ts";

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

  connect() {
    this.connection = new WebSocket(
      "wss://api.simperium.com/sock/1/" + this.APP_ID + "/websocket",
    );
  }

  disconnect() {
    this.connection?.close();
  }
}
