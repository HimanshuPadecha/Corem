import { Column, FinalColumn } from "@/types/column";
import { Table as table } from "@/types/table";

export const Table = <T extends Record<string, Column>>(
  name: string,
  columns: T,
): table<T> => {

  const buildColumn = Object.fromEntries(
    Object.entries(columns).map(([key, col]) => {
      const finalCol: FinalColumn = {
        ...col,
        table: name,
      };
      return [key, finalCol] as const;
    }),
  ) as { [K in keyof T]: FinalColumn };

  return {
    name,
    columns: buildColumn,
  };
};
