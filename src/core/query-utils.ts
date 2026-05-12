import { FinalColumn } from "@/types/column";
import { Condition, Operator, Order, whereClause } from "@/types/query-parser";
import { Table } from "@/types/table";

export const desc = (column: FinalColumn): Order => {
  return { column, orderType: "DESC" };
};

export const asc = (column: FinalColumn): Order => {
  return { column, orderType: "ASC" };
};

const makeCondition = (
  operator: Operator,
  column: FinalColumn,
  arg: FinalColumn | number | string,
): Condition => {
  if (typeof arg == "object") {
    return { column, columnTwo: arg, operator };
  }

  return { column, operator, arg };
};

export const eq = (column: FinalColumn, arg: FinalColumn | number | string) => {
  return makeCondition("=", column, arg);
};

export const ne = (column: FinalColumn, arg: FinalColumn | number | string) => {
  return makeCondition("!=", column, arg);
};

export const gt = (column: FinalColumn, arg: FinalColumn | number | string) => {
  return makeCondition(">", column, arg);
};

export const gte = (
  column: FinalColumn,
  arg: FinalColumn | number | string,
) => {
  return makeCondition("<=", column, arg);
};

export const lt = (column: FinalColumn, arg: FinalColumn | string | number) => {
  return makeCondition("<", column, arg);
};

export const lte = (
  column: FinalColumn,
  arg: FinalColumn | string | number,
) => {
  return makeCondition("<=", column, arg);
};

export const like = (
  column: FinalColumn,
  arg: FinalColumn | string | number,
) => {
  return makeCondition("LIKE", column, arg);
};

export const In = (column: FinalColumn, arg: FinalColumn | string | number) => {
  return makeCondition("IN", column, arg);
};

export const and = (...conditions: whereClause[]): whereClause => {
  return { type: "AND", conditions };
};

export const or = (...conditions: whereClause[]): whereClause => {
  return { type: "OR", conditions };
};
