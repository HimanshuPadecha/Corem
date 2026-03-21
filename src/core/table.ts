import { Column } from "../types/column";
import { Table as table } from "../types/table";

export const Table = <T extends Record<string, Column>>(
  name: string,
  columns: T,
): table<T> => {
  return {
    name,
    columns,
  };
};
