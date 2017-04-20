export interface IMultipleResponse {
  count: number;
  items: [any];
}

export interface ISingleResponse {
  item: any;
}

export interface IResponse {
  data: null | IMultipleResponse | ISingleResponse;
  error: null | {
    name: string;
    message: string;
    stack?: string;
  };
}
