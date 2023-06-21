export interface IService {
  create(message: any): Promise<void>;
}
