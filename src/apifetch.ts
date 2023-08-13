type Props = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
};
export async function apiFetch<T = void>({
  url,
  method = "GET",
  params,
  headers,
}: Props): Promise<T> {
  const body = params ? JSON.stringify(params) : undefined;

  const fetchHeaders = {
    "Content-Type": "application/json; charset=UTF-8",
    "Accept": "application/json",
    ...headers,
  };

  const res = await fetch(url, {
    method,
    body,
    headers: fetchHeaders,
  });

  if (!res.ok || res.status >= 400) {
    throw new Error(`${res.statusText} ${await res.text()}`);
  }

  return await res.json();
}
