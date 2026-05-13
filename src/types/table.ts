import { Column, FinalColumn } from "./column.js";

export type Table<T extends Record<string, Column>> = {
  name: string;
  columns: { [K in keyof T]: FinalColumn<T[K]> };
};
