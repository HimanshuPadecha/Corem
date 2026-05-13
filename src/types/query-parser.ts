import { Column, FinalColumn } from "./column.js";
import { Table } from "./table.js";

export type sqlToTsTypes<T extends string> = T extends "INT"
  ? number
  : T extends `VARCHAR(${number})`
    ? string
    : T extends "TEXT"
      ? string
      : T extends "BOOLEAN"
        ? boolean
        : T extends "TIMESTAMP"
          ? Date
          : T extends "FLOAT"
            ? number
            : any;

export type InferSelection<S extends Record<string, FinalColumn>> = {
  [K in keyof S]: sqlToTsTypes<S[K]["type"]>;
};

export type InferRow<U extends Record<string, Column>> = {
  [K in keyof U]: sqlToTsTypes<U[K]["type"]>;
};

export type Order = {
  column: FinalColumn;
  orderType: "DESC" | "ASC";
};

export type whereClause =
  | Condition
  | { type: "AND"; conditions: whereClause[] }
  | { type: "OR"; conditions: whereClause[] };

export type Operator = "=" | "!=" | "<" | ">" | "<=" | ">=" | "LIKE" | "IN";

export type Condition = {
  column: FinalColumn;
  operator: Operator;
  columnTwo?: FinalColumn;
  arg?: number | string | (number | string)[];
};

export type Join<T extends Record<string, FinalColumn>> = {
  type: "INNER JOIN" | "RIGHT JOIN" | "LEFT JOIN";
  table: Table<T>;
  alias?: string;
  condition: Condition;
};
