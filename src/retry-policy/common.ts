export type UpdateConfiguration = {
  country?: string;
  time?: object;
  enabled?: boolean;
  acquirer?: string;
  failCodes?: Array<number>;
};

export type Response = {
  statusCode: number;
  message: string;
};
