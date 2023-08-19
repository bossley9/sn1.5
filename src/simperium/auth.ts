import { API_KEY, APP_ID } from "./constants.ts";
import { apiFetch } from "../apifetch.ts";

// https://simperium.com/docs/reference/http/#auth
type AuthorizeResponse = {
  access_token: string;
  userid: string;
  username: string;
};
export async function authorize(
  username: string,
  password: string,
): Promise<string> {
  // API trailing slash required
  const url = "https://auth.simperium.com/1/" + APP_ID + "/authorize/";

  const data = await apiFetch<AuthorizeResponse>({
    url,
    method: "POST",
    headers: {
      "X-Simperium-API-Key": API_KEY,
    },
    params: {
      username,
      password,
    },
  });
  return data.access_token;
}
