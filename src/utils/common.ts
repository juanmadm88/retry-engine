export type TypeCall = {
  request: string;
  response: string;
};

export type Error = {
  code?: any;
  message?: any;
  status?: any;
  response?: {
    status: any;
  };
};
