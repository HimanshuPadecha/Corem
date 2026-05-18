import { users } from "@/db/schema.js";
import { Column, FinalColumn } from "./column.js";
import { Constraint } from "./constraints.js";
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

type HasConstraint<
  C extends Column,
  CT extends Constraint,
> = CT extends C["constraints"][number] ? true : false;

type IsServerProvided<C extends Column> =
  "AUTO_INCREMENT" extends C["constraints"][number]
    ? true
    : C["constraints"][number] extends `DEFAULT ${infer _}`
      ? true
      : false;

type IsRequired<C extends Column> =
  IsServerProvided<C> extends true
    ? false
    : "NOT NULL" extends C["constraints"][number]
      ? true
      : false;

export type InferInsertValues<U extends Record<string, Column>> = {
  [K in keyof U as IsRequired<U[K]> extends true ? K : never]: sqlToTsTypes<
    U[K]["type"]
  >;
} & {
  [K in keyof U as IsRequired<U[K]> extends false ? K : never]?: sqlToTsTypes<
    U[K]["type"]
  > | null;
};
