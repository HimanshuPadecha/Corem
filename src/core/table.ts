import { Column, FinalColumn } from "@/types/column.js";

export const Table = <T extends Record<string, Column>>(
  name: string,
  columns: T,
): { name: string; columns: { [K in keyof T]: FinalColumn<T[K]> } } => {

  const buildColumn = Object.fromEntries(
    Object.entries(columns).map(([key, col]) => {
      const finalCol: FinalColumn<typeof col> = {
        ...col,
        table: name,
      };
      return [key, finalCol] as const;
    }),
  ) as { [K in keyof T]: FinalColumn<T[K]> };

  return {
    name,
    columns: buildColumn,
  };
};
