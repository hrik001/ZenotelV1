import { IRepository } from './IRepository';
import { LocalRepository } from './LocalRepository';

// In the future, this can switch to AppwriteRepository based on env vars
export const repository: IRepository = new LocalRepository();
