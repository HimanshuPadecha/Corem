import { Column } from "@/types/column";

export type ConstraintMethods<T> = {
  primaryKey: () => T;
  notNull: () => T;
  unique: () => T;
  default: (value: any) => T;
  check: (condition: string) => T;
};

export const CommonConstraints = <T extends Column>(
  column: T,
): T & ConstraintMethods<T> => {
  const result = column as T & ConstraintMethods<T>;

  result.primaryKey = () => {
    result.constraints.push("PRIMARY KEY");
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
    result.constraints.push(`DEFAULT ${value}`);
    return result;
  };

  result.check = (conditon) => {
    result.constraints.push(`CHECK ${conditon}`);
    return result;
  };

  return result;
};
