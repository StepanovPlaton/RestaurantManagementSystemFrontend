export type ListResponse<T> = {
  data: T[];
  total: number;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
};
