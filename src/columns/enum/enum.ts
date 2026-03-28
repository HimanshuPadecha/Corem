import { CommonConstraints, ConstraintMethods } from "@/core/common-constrains";
import { Column } from "@/types/column";

export interface SqlEnum<T extends string>
  extends
    Column,
    Omit<ConstraintMethods<SqlEnum<T>>, "default" | "references"> {
  default: (constant: T) => SqlEnum<T>;
}

export const sqlEnum = <T extends readonly string[]>(
  name: string,
  constants: T,
): SqlEnum<T[number]> => {
  const base: Column = {
    name,
    type: `ENUM(${constants.map(c => `'${c}'`).join(",")})`,
    constraints: [],
  };

  const result = CommonConstraints(base) as unknown as SqlEnum<T[number]>;

  type Constants = T[number];

  result.default = (constant: Constants) => {
    result.constraints.push(`DEFAULT '${constant}'`);
    return result;
  };

  return result;
};
