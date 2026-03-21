import { Column } from "./column";

export type Table<T extends Record<string, Column>> = {
  name: string;
  columns: T;
};
