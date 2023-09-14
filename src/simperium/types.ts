// https://simperium.com/docs/reference/http/#auth
export type AuthorizeResponse = {
  access_token: string;
  userid: string;
  username: string;
};

export type IndexResponse = {
  current: string;
  index: {
    id: string;
    v: string;
  }[];
  mark?: string;
};
