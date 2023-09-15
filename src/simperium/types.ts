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

export type NoteData = {
  tags: string[];
  deleted: boolean;
  shareURL: string;
  publishURL: string;
  content: string;
  systemTags: string[];
  modificationDate: number;
  creationDate: number;
};
