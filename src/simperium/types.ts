export type AuthorizeResponse = {
  access_token: string;
  userid: string;
  username: string;
};

export type IndexMessageProps = {
  limit: number;
  shouldReturnData?: boolean;
  offset?: string;
};

export type IndexResponse<T> = {
  current: string;
  index: {
    id: string;
    v: string;
    d?: T;
  }[];
  mark?: string;
};

export type Note = {
  tags: string[];
  deleted: boolean;
  shareURL: string;
  publishURL: string;
  content: string;
  systemTags: string[];
  modificationDate: number;
  creationDate: number;
};

export type Change<T> = {
  clientid: string;
  cv: string;
  ev: number;
  sv?: number;
  id: string;
  o: string;
  v: unknown; // TODO type diffs
  ccids: string[];
  d?: T;
};

export type HandledData =
  | IndexResponse<Note> & { type: "index" }
  | { message: string; type: "cv" }
  | { changes: Change<Note>[]; type: "c" };
