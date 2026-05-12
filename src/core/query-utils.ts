import { FinalColumn } from "@/types/column";
import { Order } from "@/types/query-parser";

export const desc = (column: FinalColumn): Order => {
  return { column, orderType: "DESC" };
};

export const asc = (column: FinalColumn): Order => {
  return { column, orderType: "ASC" };
};

export type Eq = {
  column: {
    name: string;
    tableName: string;
  };
  columnTwo?: {
    name: string;
    tableName: string;
  };
  arg?: number;
};

export const eq = (column: FinalColumn, arg: FinalColumn | number): Eq => {
  if (typeof arg === "number") {
    return {
      column: {
        name: column.name,
        tableName: column.table,
      },
      arg,
    };
  }
  return {
    column: {
      name: column.name,
      tableName: column.table,
    },
    columnTwo: {
      name: arg.name,
      tableName: arg.table,
    },
  };
};
