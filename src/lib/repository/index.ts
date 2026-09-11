import { IRepository } from './IRepository';
import { ApiRepository } from './ApiRepository';

export const repository: IRepository = new ApiRepository();
