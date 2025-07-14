export interface DatabaseInterface<T> {
  insert(data: T): Promise<T>;
  findAll(): Promise<T[]>;
  findMany(params: { where: Partial<T> }): Promise<T[]>;
  findOne(params: { where: Partial<T> }): Promise<T | undefined>;
  updateOne(params: { where: Partial<T>; data: Partial<T> }): Promise<T | undefined>;
}
