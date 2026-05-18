import { Column, FinalColumn, FkeyDelete } from "@/types/column.js";
import { Constraint } from "@/types/constraints.js";


export type FkeyOnDeleteObj = {
  onDelete: FkeyDelete;
};

export type ConstraintMethods<T> = {
  primaryKey: () => T;
  notNull: () => T;
  unique: () => T;
  default: (value: any) => T;
  check: (condition: string) => T;
  references: (fn: () => FinalColumn, options?: FkeyOnDeleteObj) => T;
};

export const CommonConstraints = <T extends Column>(
  column: T,
): T & ConstraintMethods<T> => {
  const result = column as T & ConstraintMethods<T>;

  result.primaryKey = () => {
    result.constraints.push("PRIMARY KEY");
    return result;
  };

  result.references = (cb, onDelete) => {
    result.fkey = {
      far: cb(),
      ...(onDelete ? { onDelete: onDelete.onDelete } : {}),
    };
    return result;
  };

  result.notNull = () => {
    result.constraints.push("NOT NULL");
    return result;
  };

  result.unique = () => {
    result.constraints.push("UNIQUE");
    return result;
  };

  result.default = (value) => {
    result.constraints.push(`DEFAULT '${value}'`);
    return result;
  };

  result.check = (conditon) => {
    result.constraints.push(`CHECK ${conditon}`);
    return result;
  };

  return result;
};
